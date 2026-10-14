"""Extrait les icônes de recherche T11 des captures du jeu et efface le badge de niveau incrusté.
Usage : python3 tools/extract-t11-icons.py <dossier de sortie> [dossier des captures]"""
import sys, statistics
from PIL import Image, ImageDraw

SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'  # dossier des captures du jeu
OUT = sys.argv[1]
K = 1.27  # affichage 924 px -> original 1170 px

RIM = {
    'lancer': lambda r, g, b: b > 170 and b > r + 50,
    'infantry': lambda r, g, b: g > 170 and g > r + 50 and g > b + 40,
    'marksman': lambda r, g, b: r > 235 and g > 170 and b < 125,
}
# Centres des cases (coordonnées d'affichage des captures).
NODES = {
    'lancer': ('IMG_1027.png', {'squad': (375, 905), 'atk': (212, 1045), 'def': (535, 1045), 'legion': (375, 1185),
               'atk2': (108, 1285), 'def2': (645, 1285), 'helios': (375, 1475), 'heal': (130, 1635),
               'train': (375, 1745), 'aid': (622, 1635)}),
    'marksman': ('IMG_1025.png', {'squad': (433, 1245), 'atk': (270, 1100), 'def': (595, 1100), 'legion': (433, 960),
                 'atk2': (165, 862), 'def2': (700, 862), 'helios': (433, 680), 'heal': (192, 512),
                 'train': (433, 402), 'aid': (676, 512)}),
    'infantry': ('IMG_1026.png', {'atk': (165, 995), 'def': (165, 1320), 'legion': (310, 1155),
                 'atk2': (408, 885), 'def2': (408, 1425), 'helios': (595, 1155), 'heal': (755, 910),
                 'train': (865, 1160), 'aid': (755, 1400)}),
}
EXTRA = {('infantry', 'squad'): ('IMG_1025.png', (652, 1560))}  # Escouade Infanterie, entière sur la capture Tireur


def inner_box(im, cx, cy, rim):
    """Bord intérieur du liseré : on part du centre vers chaque côté sur plusieurs lignes, médiane des distances."""
    w, h = im.size
    px = im.load()
    def scan(dx, dy, offsets):
        found = []
        for off in offsets:
            x, y = cx + (off if dy else 0), cy + (off if dx else 0)
            for step in range(20, 120):
                X, Y = x + dx * step, y + dy * step
                if not (0 <= X < w and 0 <= Y < h):
                    break
                if rim(*px[X, Y]):
                    found.append(step)
                    break
        return statistics.median(found) if found else None
    offs = [-30, -20, -10, 0, 10, 20, 30]
    l, r, t, b = scan(-1, 0, offs), scan(1, 0, offs), scan(0, -1, offs), scan(0, 1, offs)
    # côté hors capture : symétrique du côté opposé
    l, r = l or r, r or l
    t, b = t or b, b or t
    return l, r, t, b


def erase_badge(tile):
    """Repère le texte blanc du badge (coin bas-droit), puis remplit tout son rectangle par un dégradé
    tiré des pixels juste au-dessus et à gauche ; notre propre badge se pose ensuite au même endroit."""
    w, h = tile.size
    px = tile.load()
    xs, ys = [], []
    for y in range(int(h * .55), h):
        for x in range(int(w * .35), w):
            r, g, b = px[x, y]
            # contour du texte : gris neutre sombre (absent des illustrations, toutes dans les rouges)
            if (r + g + b) / 3 < 110 and max(r, g, b) - min(r, g, b) < 28:
                xs.append(x); ys.append(y)
    if len(xs) < 15:
        return tile
    xs.sort(); ys.sort()
    # on ignore les quelques pixels isolés en prenant les 3 % extrêmes
    cut = max(1, len(xs) // 100)
    x0, y0 = max(1, xs[cut] - 11), max(1, ys[cut] - 4)
    # bord du haut lissé sur ±6 px (évite d'étirer un détail isolé)
    row = [px[x, y0 - 1] for x in range(w)]
    smooth = [tuple(sum(c[i] for c in row[max(0, x - 6):x + 7]) // len(row[max(0, x - 6):x + 7]) for i in range(3)) for x in range(w)]
    for y in range(y0, h):
        for x in range(x0, w):
            top, left = smooth[x], px[x0 - 1, y]
            wt, wl = 1 / (y - y0 + 1), 1 / (x - x0 + 1) ** 2
            px[x, y] = tuple(int((top[i] * wt + left[i] * wl) / (wt + wl)) for i in range(3))
    # adoucissement du rectangle rempli
    for _ in range(3):
        src = tile.copy().load()
        for y in range(y0, h):
            for x in range(x0, w):
                near = [src[X, Y] for X in (x - 1, x, x + 1) for Y in (y - 1, y, y + 1) if 0 <= X < w and 0 <= Y < h]
                px[x, y] = tuple(sum(c[i] for c in near) // len(near) for i in range(3))
    return tile


report = []
jobs = [(troop, node, f, c) for troop, (f, nodes) in NODES.items() for node, c in nodes.items()]
jobs += [(t, n, f, c) for (t, n), (f, c) in EXTRA.items()]
for troop, node, fname, (x, y) in jobs:
    im = Image.open(SRC + fname).convert('RGB')
    cx, cy = int(x * K), int(y * K)
    l, r, t, b = inner_box(im, cx, cy, RIM[troop])
    if None in (l, r, t, b):
        report.append(f'{troop}/{node}: liseré introuvable ({l},{r},{t},{b})')
        continue
    inset = 9
    box = (cx - l + inset, cy - t + inset, cx + r - inset + 1, cy + b - inset + 1)
    tile = im.crop(box)
    tile = erase_badge(tile).resize((160, 160), Image.LANCZOS)
    tile.save(f'{OUT}/{troop}-{node}.png')
    report.append(f'{troop}/{node}: {box[2]-box[0]}x{box[3]-box[1]} (l{l} r{r} t{t} b{b})')
print('\n'.join(report))

# planche de contrôle
names = ['squad', 'atk', 'def', 'legion', 'atk2', 'def2', 'helios', 'heal', 'train', 'aid']
sheet = Image.new('RGB', (10 * 170, 3 * 170), (40, 20, 25))
for row, troop in enumerate(['lancer', 'infantry', 'marksman']):
    for col, node in enumerate(names):
        try:
            sheet.paste(Image.open(f'{OUT}/{troop}-{node}.png'), (col * 170 + 5, row * 170 + 5))
        except FileNotFoundError:
            pass
sheet.save(f'{OUT}/_planche.png')
