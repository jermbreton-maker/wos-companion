"""Extrait les illustrations rondes des médaillons T12 (captures de l'arbre du jeu), efface le badge de niveau
incrusté et applique un masque circulaire. Usage : python3 tools/extract-t12-icons.py <sortie> [dossier des captures]"""
import sys
import cv2
import numpy as np

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
K = 1.27  # affichage 924 px -> original 1170 px
SIZE = 192

# Captures : (haut de l'arbre, bas de l'arbre) par troupe
SHOTS = {'marksman': ('IMG_1043.png', 'IMG_1044.png'), 'lancer': ('IMG_1045.png', 'IMG_1046.png'),
         'infantry': ('IMG_1047.png', 'IMG_1048.png')}
# Centres (coordonnées d'affichage) et rayon de l'illustration (pixels originaux)
TOP = {'unit': (462, 480, 68), 'm1a': (105, 757, 59), 'm1b': (343, 757, 59), 'm1c': (580, 757, 59), 'm1d': (817, 757, 59),
       'elite': (462, 1045, 68), 'heal': (343, 1330, 59), 'aid': (580, 1330, 59), 'train': (462, 1630, 59)}
BOTTOM = {'dom': (462, 1390, 59)}
DIM = {'dom'}  # verrouillée sur la capture : à éclaircir


def refine(img, x, y, r):
    """Recentre sur le cercle de l'illustration (HoughCircles autour de la position attendue)."""
    pad = int(r * 1.6)
    crop = cv2.cvtColor(img[y - pad:y + pad, x - pad:x + pad], cv2.COLOR_BGR2GRAY)
    circles = cv2.HoughCircles(cv2.medianBlur(crop, 5), cv2.HOUGH_GRADIENT, 1, 20, param1=80, param2=30,
                               minRadius=int(r * .9), maxRadius=int(r * 1.25))
    if circles is None:
        return x, y
    cx, cy, _ = min(circles[0], key=lambda c: (c[0] - pad) ** 2 + (c[1] - pad) ** 2)
    if (cx - pad) ** 2 + (cy - pad) ** 2 > (r * .25) ** 2:
        return x, y
    return int(x - pad + cx), int(y - pad + cy)


def erase_badge(tile):
    """Efface le texte du badge (contour gris refermé + intérieur + halo) puis inpainting TELEA."""
    h, w = tile.shape[:2]
    rgb = tile.astype(np.int16)
    bright, spread = rgb.mean(axis=2), rgb.max(axis=2) - rgb.min(axis=2)
    zone = np.zeros((h, w), bool)
    zone[int(h * .48):, int(w * .08):int(w * .95)] = True
    outline = (zone & (bright < 150) & (spread < 30)).astype(np.uint8) * 255
    if (outline > 0).sum() < 12:
        return tile
    closed = cv2.morphologyEx(outline, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    ff = closed.copy()
    cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 255)
    letters = cv2.bitwise_or(closed, cv2.bitwise_not(ff))
    near = cv2.dilate(letters, np.ones((3, 3), np.uint8), iterations=2) > 0
    white = near & (spread < 30) & (bright > 150)
    mask = cv2.bitwise_or(letters, white.astype(np.uint8) * 255)
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=3)
    return cv2.inpaint(tile, mask, 7, cv2.INPAINT_TELEA)


def extract(img, x, y, r, dim=False):
    X, Y = int(x * K), int(y * K)
    X, Y = refine(img, X, Y, r)
    tile = img[Y - r:Y + r, X - r:X + r].copy()
    tile = erase_badge(tile)
    if dim:
        hsv = cv2.cvtColor(tile, cv2.COLOR_BGR2HSV).astype(np.float32)
        hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.75, 0, 255)
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.1, 0, 255)
        tile = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    tile = cv2.resize(tile, (SIZE, SIZE), interpolation=cv2.INTER_LANCZOS4)
    alpha = np.zeros((SIZE, SIZE), np.uint8)
    cv2.circle(alpha, (SIZE // 2, SIZE // 2), SIZE // 2 - 2, 255, -1, cv2.LINE_AA)
    return np.dstack([tile, alpha])


sheet = []
for troop, (top, bottom) in SHOTS.items():
    row = []
    for shot, nodes in ((top, TOP), (bottom, BOTTOM)):
        img = cv2.imread(SRC + shot)
        for name, (x, y, r) in nodes.items():
            icon = extract(img, x, y, r, name in DIM)
            cv2.imwrite(f'{OUT}/{troop}-{name}.png', icon)
            row.append(icon)
    sheet.append(np.hstack(row))
# planche de contrôle sur fond sombre
board = np.vstack(sheet)
bg = np.full(board.shape[:2] + (3,), (40, 25, 30), np.uint8)
a = board[:, :, 3:4] / 255.
cv2.imwrite(f'{OUT}/_planche.png', (board[:, :, :3] * a + bg * (1 - a)).astype(np.uint8))
print('ok')
