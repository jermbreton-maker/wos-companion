"""Extrait les icônes de recherche T11 des captures du jeu et efface le badge de niveau incrusté.
Usage : python3 tools/extract-t11-icons.py <dossier de sortie> [dossier des captures]"""
import sys, statistics
from PIL import Image, ImageDraw

SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'  # dossier des captures du jeu
OUT = sys.argv[1]
METHOD = 'telea'  # 'telea' (retenu) ou 'fsr' (xphoto, plus bruité sur ces icônes)
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
    """Efface le badge de niveau (coin bas-droit) par inpainting OpenCV, limité aux lettres :
    on repère leur contour gris foncé, on le referme et on remplit l'intérieur des lettres.
    Les zones blanches de l'illustration (sans contour gris) sont conservées."""
    import numpy as np, cv2
    rgb = np.asarray(tile).astype(np.int16)
    h, w = rgb.shape[:2]
    bright = rgb.mean(axis=2)
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    zone = np.zeros((h, w), bool)
    zone[int(h * .5):, int(w * .18):] = True
    outline = (zone & (bright < 160) & (spread < 22)).astype(np.uint8) * 255
    if (outline > 0).sum() < 15:
        return tile
    closed = cv2.morphologyEx(outline, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    # intérieur des lettres : tout ce qui n'est pas atteignable depuis le bord sans traverser le contour
    flood = closed.copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(flood, ff, (0, 0), 255)
    holes = cv2.bitwise_not(flood)
    letters = cv2.bitwise_or(closed, holes)
    # le blanc neutre collé aux lettres (anticrénelage) les rejoint aussi
    near = cv2.dilate(letters, np.ones((3, 3), np.uint8), iterations=2) > 0
    white = near & (spread < 26) & (bright > 150)
    mask = cv2.bitwise_or(letters, white.astype(np.uint8) * 255)
    # halo d'ombre portée autour des lettres
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=4)
    src = np.asarray(tile)[:, :, ::-1].copy()
    if METHOD == 'fsr':
        known = (mask == 0).astype(np.uint8)
        out = np.zeros_like(src)
        cv2.xphoto.inpaint(src, known, out, cv2.xphoto.INPAINT_FSR_FAST)
    else:
        out = cv2.inpaint(src, mask, 7, cv2.INPAINT_TELEA)
    return Image.fromarray(out[:, :, ::-1])


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
    tile = erase_badge(tile).resize((192, 192), Image.LANCZOS)
    tile.save(f'{OUT}/{troop}-{node}.png')
    report.append(f'{troop}/{node}: {box[2]-box[0]}x{box[3]-box[1]} (l{l} r{r} t{t} b{b})')
print('\n'.join(report))

# planche de contrôle
names = ['squad', 'atk', 'def', 'legion', 'atk2', 'def2', 'helios', 'heal', 'train', 'aid']
sheet = Image.new('RGB', (10 * 200, 3 * 200), (40, 20, 25))
for row, troop in enumerate(['lancer', 'infantry', 'marksman']):
    for col, node in enumerate(names):
        try:
            sheet.paste(Image.open(f'{OUT}/{troop}-{node}.png'), (col * 200 + 4, row * 200 + 4))
        except FileNotFoundError:
            pass
sheet.save(f'{OUT}/_planche.png')
