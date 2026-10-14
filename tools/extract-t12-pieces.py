"""Extrait les icônes des 5 pièces de déblocage T12 (rangée de médaillons de l'écran de forge).
Les pièces 1 à 4 sont prises terminées (fond orange) ; la pièce 5, en cours sur sa capture (fond bleu nuit),
reçoit le même fond orange. Usage : python3 tools/extract-t12-pieces.py <sortie> [dossier des captures]"""
import sys
import cv2
import numpy as np

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
SIZE = 192
# capture de la 5e pièce : centres (x, y) et rayon intérieur des 4 petites pastilles, puis de la grande
ROWS = {'infantry': ('IMG_1064.png', [180, 383, 585, 787], 1550, 54, (990, 1548, 60)),
        'lancer': ('IMG_1071.png', [180, 383, 585, 787], 1550, 54, (990, 1548, 60)),
        'marksman': ('IMG_1056.png', [163, 375, 585, 795], 1420, 56, (1007, 1422, 62))}

TOL = {'infantry': 13, 'lancer': 17, 'marksman': 30}  # tolérance de couleur du fond (marksman : capture floue)


def refine(gray, x, y, r):
    pad = int(r * 1.5)
    crop = cv2.medianBlur(gray[y - pad:y + pad, x - pad:x + pad], 5)
    c = cv2.HoughCircles(crop, cv2.HOUGH_GRADIENT, 1, 20, param1=80, param2=25, minRadius=int(r * .85), maxRadius=int(r * 1.2))
    if c is None:
        return x, y, r
    cx, cy, cr = min(c[0], key=lambda k: (k[0] - pad) ** 2 + (k[1] - pad) ** 2)
    if (cx - pad) ** 2 + (cy - pad) ** 2 > (r * .3) ** 2:
        return x, y, r
    return int(x - pad + cx), int(y - pad + cy), r  # rayon fixe : seul le centre est recalé


def orange_bg(n):
    """Fond radial jaune-orange des pièces terminées."""
    yy, xx = np.mgrid[0:n, 0:n]
    d = np.clip(np.hypot(xx - n / 2, yy - n / 2) / (n / 2), 0, 1)[..., None]
    inner, outer = np.array([70, 200, 250.]), np.array([20, 90, 225.])  # BGR
    return (inner * (1 - d) + outer * d).astype(np.uint8)


def recolor(tile, tol):
    """Remplace le fond bleu nuit par le fond orange (composante connexe au bord)."""
    n = tile.shape[0]
    lab = cv2.cvtColor(tile, cv2.COLOR_BGR2LAB).astype(np.float32)
    yy, xx = np.mgrid[0:n, 0:n]
    d = np.hypot(xx - n / 2, yy - n / 2) / (n / 2)
    ring = lab[(d > .7) & (d < .95)]
    ref = np.median(ring[ring[:, 0] < np.percentile(ring[:, 0], 60)], axis=0)  # fond = la part sombre de l'anneau
    near = (np.linalg.norm(lab - ref, axis=2) < tol).astype(np.uint8)
    _, lbl = cv2.connectedComponents(near)
    edge = set(np.unique(lbl[(d > .85) & (d < .97)])) - {0}
    mask = np.isin(lbl, list(edge)).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    mask = cv2.GaussianBlur(mask, (5, 5), 0)[..., None] / 255.
    return (tile * (1 - mask) + orange_bg(n) * mask).astype(np.uint8)


def finish(tile):
    tile = cv2.resize(tile, (SIZE, SIZE), interpolation=cv2.INTER_CUBIC)
    alpha = np.zeros((SIZE, SIZE), np.uint8)
    cv2.circle(alpha, (SIZE // 2, SIZE // 2), SIZE // 2 - 2, 255, -1, cv2.LINE_AA)
    return np.dstack([tile, alpha])


sheet = []
for troop, (shot, xs, y, r, big) in ROWS.items():
    img = cv2.imread(SRC + shot)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    row = []
    for i, (x, yy, rr) in enumerate([(x, y, r) for x in xs] + [big]):
        x, yy, rr = refine(gray, x, yy, rr)
        rr = int(rr * .94)
        tile = img[yy - rr:yy + rr, x - rr:x + rr].copy()
        if i == 4:
            tile = recolor(tile, TOL[troop])
        icon = finish(tile)
        cv2.imwrite(f'{OUT}/{troop}-p{i + 1}.png', icon)
        row.append(icon)
    sheet.append(np.hstack(row))
board = np.vstack(sheet)
a = board[:, :, 3:4] / 255.
cv2.imwrite(f'{OUT}/_planche.png', (board[:, :, :3] * a + np.array([40, 25, 30]) * (1 - a)).astype(np.uint8))
print('ok')
