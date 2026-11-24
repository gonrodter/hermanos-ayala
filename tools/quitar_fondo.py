"""Quita el fondo blanco de los packshots y deja transparencia real.
Uso: python3 tools/quitar_fondo.py <entrada> <salida.webp> [umbral=236] [--centro] [--filas]

  --centro  deja solo la pieza que toca el centro (quita adornos sueltos del folleto)
  --filas   rellena cada fila de punta a punta del producto y suaviza el contorno.
            Para botellas, botes y envases sin huecos: evita que los brillos blancos
            del borde se tomen por fondo. No usar con productos con huecos (flan, fregona).

Hace falta porque mix-blend-mode: multiply dejaba ver un destello blanco en las transiciones."""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

args = [a for a in sys.argv[1:] if not a.startswith('--')]
src, dst = args[0], args[1]
umbral = int(args[2]) if len(args) > 2 else 236
im = Image.open(src).convert('RGB')
W, H = im.size

r, g, b = im.split()
minc = ImageChops.darker(ImageChops.darker(r, g), b)
casi = minc.point(lambda v: 255 if v >= umbral else 0)  # 255 = casi blanco
px = casi.load()
borde = [(x, 0) for x in range(W)] + [(x, H - 1) for x in range(W)] + [(0, y) for y in range(H)] + [(W - 1, y) for y in range(H)]
for p in borde:
    if px[p] == 255:
        ImageDraw.floodfill(casi, p, 128)
alfa = casi.point(lambda v: 0 if v == 128 else 255)

if '--centro' in sys.argv:
    ImageDraw.floodfill(alfa, (W // 2, H // 2), 200)
    alfa = alfa.point(lambda v: 255 if v == 200 else 0)

if '--filas' in sys.argv:
    a = alfa.load()
    L, R = [None] * H, [None] * H
    for y in range(H):
        xs = [x for x in range(W) if a[x, y]]
        if len(xs) >= 2:
            L[y], R[y] = xs[0], xs[-1]

    def mediana(vals, y, k=4):
        v = sorted(x for x in vals[max(0, y - k):y + k + 1] if x is not None)
        return v[len(v) // 2] if v else None
    Ls = [mediana(L, y) if L[y] is not None else None for y in range(H)]
    Rs = [mediana(R, y) if R[y] is not None else None for y in range(H)]
    alfa = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(alfa)
    for y in range(H):
        if Ls[y] is not None and Rs[y] is not None and Rs[y] > Ls[y]:
            d.line([(Ls[y], y), (Rs[y], y)], fill=255)
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.6))
else:
    # suaviza el borde y quita el halo blanco (erosiona medio píxel)
    alfa = alfa.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))

out = im.convert('RGBA')
out.putalpha(alfa)
bb = alfa.point(lambda v: 255 if v > 8 else 0).getbbox()
if bb:
    out = out.crop((max(0, bb[0] - 2), max(0, bb[1] - 2), min(W, bb[2] + 2), min(H, bb[3] + 2)))
out.save(dst, quality=90, method=6)
print(dst, out.size)
