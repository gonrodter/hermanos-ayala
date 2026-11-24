"""Reconstruye en SVG el logo oficial de Ayala a partir del JPG que pasó el cliente.
El logo: óvalo negro + círculo amarillo centrado + "Ayala" que es amarillo sobre el negro
y negro dentro del círculo (inversión de color).
Uso: python3 tools/logo_oficial.py <logo.jpg> <dir_trabajo> <salida.svg>
Necesita potrace (/opt/homebrew/bin/potrace)."""
import sys, math, subprocess, re
from PIL import Image, ImageFilter

src, tmp, dst = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB')
W, H = im.size
px = im.load()

es_blanco = lambda p: p[0] > 205 and p[1] > 205 and p[2] > 205
es_amarillo = lambda p: p[0] > 150 and p[1] > 140 and p[2] < 120
es_negro = lambda p: p[0] < 90 and p[1] < 90 and p[2] < 90

# 1. Óvalo: extensión de lo que no es blanco
xs, ys = [], []
for y in range(0, H, 1):
    for x in range(0, W, 1):
        if not es_blanco(px[x, y]):
            xs.append(x); ys.append(y)
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
ecx, ecy = (x0 + x1 + 1) / 2, (y0 + y1 + 1) / 2
erx, ery = (x1 - x0 + 1) / 2, (y1 - y0 + 1) / 2
print('ovalo', ecx, ecy, erx, ery)

# 2. Círculo: bordes amarillo/negro arriba y abajo, fuera de la franja de letras
puntos = []
for x in range(int(ecx - erx * .45), int(ecx + erx * .45)):
    top = next((y for y in range(int(ecy - ery), int(ecy)) if es_amarillo(px[x, y])), None)
    bot = next((y for y in range(int(ecy + ery), int(ecy), -1) if es_amarillo(px[x, y])), None)
    if top is not None and top < ecy - ery * .45: puntos.append((x, top))
    if bot is not None and bot > ecy + ery * .45: puntos.append((x, bot))
# ajuste por mínimos cuadrados de x²+y²+Dx+Ey+F=0
S = [[0.0] * 3 for _ in range(3)]; b = [0.0] * 3
for x, y in puntos:
    v = (x, y, 1.0); r = -(x * x + y * y)
    for i in range(3):
        b[i] += v[i] * r
        for j in range(3): S[i][j] += v[i] * v[j]
# Gauss
M = [S[i] + [b[i]] for i in range(3)]
for i in range(3):
    piv = max(range(i, 3), key=lambda k: abs(M[k][i])); M[i], M[piv] = M[piv], M[i]
    for k in range(3):
        if k != i:
            f = M[k][i] / M[i][i]
            M[k] = [M[k][j] - f * M[i][j] for j in range(4)]
D, E, F = (M[i][3] / M[i][i] for i in range(3))
ccx, ccy = -D / 2, -E / 2
cr = math.sqrt(ccx ** 2 + ccy ** 2 - F)
print('circulo', round(ccx, 1), round(ccy, 1), round(cr, 1), len(puntos), 'puntos')

# colores medios
def media(pred, zona):
    acc = [0, 0, 0]; n = 0
    for (x, y) in zona:
        p = px[x, y]
        if pred(p): acc = [acc[i] + p[i] for i in range(3)]; n += 1
    return tuple(round(c / n) for c in acc)
amarillo = media(es_amarillo, [(int(ccx) + dx, int(ccy - cr * .8) + dy) for dx in range(-15, 15) for dy in range(-6, 6)])
negro = media(es_negro, [(int(ecx - erx * .8) + dx, int(ecy) + dy) for dx in range(-8, 8) for dy in range(-8, 8)])
print('colores', amarillo, negro)

# 3. Máscara de letras a 4x: amarillo fuera del círculo / no amarillo dentro, solo dentro del óvalo
K = 4
big = im.resize((W * K, H * K), Image.LANCZOS)
bp = big.load()
mask = Image.new('L', big.size, 255)  # potrace: negro = forma
mp = mask.load()
margen = 3.0  # px originales, para no confundir el borde del óvalo con letra
for Y in range(int((y0 - 2) * K), int((y1 + 2) * K)):
    yy = Y / K
    for X in range(int((x0 - 2) * K), int((x1 + 2) * K)):
        xx = X / K
        dentro_ovalo = ((xx - ecx) / (erx - margen)) ** 2 + ((yy - ecy) / (ery - margen)) ** 2 < 1
        if not dentro_ovalo: continue
        p = bp[X, Y]
        lum = (p[0] + p[1]) / 2 - p[2]  # alto en amarillo, bajo en negro
        amar = lum > 95
        d = math.hypot(xx - ccx, yy - ccy)
        if d < cr - 2:
            letra = not amar
        elif d > cr + 2:
            letra = amar
        else:
            # franja del borde del círculo: se mira el color a cada lado en la misma dirección radial
            ang = math.atan2(yy - ccy, xx - ccx)
            pin = bp[int((ccx + (cr - 3) * math.cos(ang)) * K), int((ccy + (cr - 3) * math.sin(ang)) * K)]
            pout = bp[int((ccx + (cr + 3) * math.cos(ang)) * K), int((ccy + (cr + 3) * math.sin(ang)) * K)]
            amar_in = (pin[0] + pin[1]) / 2 - pin[2] > 95
            amar_out = (pout[0] + pout[1]) / 2 - pout[2] > 95
            letra = (not amar_in) or amar_out
        if letra: mp[X, Y] = 0
# cierra la franja del borde del círculo (une los trazos que lo cruzan) y quita motas
mask = mask.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))
mask = mask.filter(ImageFilter.GaussianBlur(2)).point(lambda v: 0 if v < 128 else 255)
mask.convert('1').save(tmp + '/letras.pbm')
subprocess.run(['/opt/homebrew/bin/potrace', tmp + '/letras.pbm', '-s', '-o', tmp + '/letras.svg',
                '--turdsize', '200', '--alphamax', '1.0', '--opttolerance', '0.3'], check=True)
s = open(tmp + '/letras.svg').read()
g = re.search(r'<g transform="([^"]+)"', s).group(1)
d = ' '.join(re.sub(r'\s+', ' ', p) for p in re.findall(r'<path d="([^"]+)"', s, re.S))

# 4. SVG final en coordenadas del JPG (las letras vienen a escala 4x: se reducen con scale)
pad = 2
vx, vy, vw, vh = x0 - pad, y0 - pad, (x1 - x0 + 1) + 2 * pad, (y1 - y0 + 1) + 2 * pad
hexc = lambda c: '#%02X%02X%02X' % c
Y_, N_ = hexc(amarillo), hexc(negro)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx} {vy} {vw} {vh}" role="img" aria-label="Ayala">
<defs>
  <path id="ayala-letras" transform="scale({1 / K}) {g}" d="{d}"/>
  <clipPath id="ayala-circulo"><circle cx="{ccx:.2f}" cy="{ccy:.2f}" r="{cr:.2f}"/></clipPath>
</defs>
<ellipse cx="{ecx:.2f}" cy="{ecy:.2f}" rx="{erx:.2f}" ry="{ery:.2f}" fill="{N_}"/>
<use href="#ayala-letras" fill="{Y_}"/>
<circle cx="{ccx:.2f}" cy="{ccy:.2f}" r="{cr:.2f}" fill="{Y_}"/>
<use href="#ayala-letras" fill="{N_}" clip-path="url(#ayala-circulo)"/>
</svg>
'''
open(dst, 'w').write(svg)
print(dst, len(svg), 'bytes')
