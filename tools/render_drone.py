"""Vídeo tipo dron (cenital) a partir de la ortofoto PNOA (© IGN, CC BY 4.0) con líneas y rótulos incrustados.
Uso: python3 tools/render_drone.py <mosaico.jpg> <salida_dir> <ancho> <alto> <seg> <cx> <cy> <w0> <w1> <rot0> <rot1>
cx, cy: centro de la ventana en px del mosaico z19. w0/w1: ancho de ventana inicial/final. rot: giro en grados."""
import sys, math, os
from PIL import Image, ImageDraw, ImageFont
a = sys.argv
src, out, W, H, secs = a[1], a[2], int(a[3]), int(a[4]), float(a[5])
CX, CY, w0, w1, r0, r1 = map(float, a[6:12])
FPS, SS = 25, 2
K = 4  # coordenadas medidas sobre el mosaico reducido 1600 px (x4 = z19)
P = lambda pts: [(x * K, y * K) for x, y in pts]
nave = P([(736, 339), (999, 582), (866, 693), (601, 468)])
recinto = P([(745, 290), (1075, 600), (830, 742), (565, 470)])
carretera = P([(205, 0), (262, 170), (310, 262), (365, 345), (441, 444), (524, 528), (616, 621), (679, 685), (760, 770), (880, 905), (1020, 1088)])
muelles = P([(741, 343), (996, 581)])
rotulos = [  # (texto, punto en mosaico, desplazamiento del rótulo en px de salida)
    ('Muelles de descarga', P([(905, 480)])[0], (16, -12)),
    ('Parking de clientes', P([(760, 655)])[0], (16, 4)),
    ('Entrada · A-376, km 20', P([(565, 470)])[0], (-16, 14)),
]
U = max(W, H) / 1280
YEL, WHT = (255, 214, 0, 235), (255, 255, 255, 200)
font = ImageFont.truetype(os.path.join(os.path.dirname(src), '..', 'Aspekta-500.ttf'), int(13 * U) * SS)
im = Image.open(src).convert('RGB')
os.makedirs(out, exist_ok=True)
N = int(secs * FPS)
ease = lambda t: 0.5 - 0.5 * math.cos(math.pi * t)
for i in range(N):
    t = ease(i / (N - 1))
    s = (w0 + (w1 - w0) * t) / W
    ang = math.radians(r0 + (r1 - r0) * t)
    ca, sa = math.cos(ang) * s, math.sin(ang) * s
    coeffs = (ca, -sa, CX - ca * W / 2 + sa * H / 2, sa, ca, CY - sa * W / 2 - ca * H / 2)
    fr = im.transform((W, H), Image.AFFINE, coeffs, resample=Image.BICUBIC).convert('RGBA')
    det = ca * ca + sa * sa
    def to_out(p):  # inversa de la afín
        dx, dy = p[0] - coeffs[2], p[1] - coeffs[5]
        return ((ca * dx + sa * dy) / det * SS, (-sa * dx + ca * dy) / det * SS)
    ov = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    lw = max(1, round(U * 1.4 * SS))
    d.line([to_out(p) for p in carretera], fill=YEL, width=lw, joint='curve')
    d.line([to_out(p) for p in recinto + recinto[:1]], fill=WHT, width=max(1, lw // 2))
    d.line([to_out(p) for p in muelles], fill=YEL, width=lw * 3)
    for txt, p, (ox, oy) in rotulos:
        x, y = to_out(p)
        r = 4 * SS * U
        d.ellipse((x - r, y - r, x + r, y + r), fill=YEL)
        tx, ty = x + ox * SS * U, y + oy * SS * U
        bb = d.textbbox((tx, ty), txt, font=font)
        if ox < 0:  # rótulo a la izquierda del punto
            tx = x - (bb[2] - bb[0]) + ox * SS * U
            bb = d.textbbox((tx, ty), txt, font=font)
        pad = 6 * SS * U
        if bb[2] + pad > W * SS * (0.88 if H > W else 0.98):  # no cabe a la derecha (en vertical el móvil recorta los lados): al otro lado
            tx = x - (bb[2] - bb[0]) - abs(ox) * SS * U
            bb = d.textbbox((tx, ty), txt, font=font)
        d.rectangle((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad), fill=(21, 20, 18, 190))
        d.text((tx, ty), txt, font=font, fill=(255, 255, 255, 255))
    ov = ov.resize((W, H), Image.LANCZOS)
    Image.alpha_composite(fr, ov).convert('RGB').save(f'{out}/f{i:04d}.png', compress_level=1)
print(N)
