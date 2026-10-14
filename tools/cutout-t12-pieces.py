"""Détoure la pièce d'armure rouge du rendu 3D (captures de la forge T12) : fond d'atelier retiré, PNG transparent.
Usage : python3 tools/cutout-t12-pieces.py <sortie> [dossier des captures]"""
import sys
import cv2
import numpy as np
from PIL import Image

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
SHOTS = {'infantry': ['IMG_1059', 'IMG_1061', 'IMG_1062', 'IMG_1063', 'IMG_1064'],
         'lancer': ['IMG_1065', 'IMG_1067', 'IMG_1068', 'IMG_1069', 'IMG_1071'],
         'marksman': ['IMG_1072', 'IMG_1074', 'IMG_1075', 'IMG_1055', 'IMG_1056']}
BOX = {'IMG_1055': (102, 522, 1095, 1192), 'IMG_1056': (102, 522, 1095, 1192)}
DEFAULT = (30, 470, 1140, 1220)
# zones du décor à écarter (coordonnées dans le recadrage) : robot rouge derrière la pièce
EXCLUDE = {'IMG_1064': [(420, 0, 640, 240)], 'IMG_1071': [(470, 0, 700, 330)]}


def cutout(img, exclude=()):
    h, w = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hue, sat, val = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    red = (((hue < 14) | (hue > 168)) & (sat > 90) & (val > 40)).astype(np.uint8)
    for x0, y0, x1, y1 in exclude:
        red[y0:y1, x0:x1] = 0
    # contour lumineux de la pièce → zone pleine (fermeture + remplissage des trous)
    blob = cv2.morphologyEx(red, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    n, lbl, stats, cent = cv2.connectedComponentsWithStats(blob)
    if n < 2:
        return None
    # composante principale : la plus grande, pondérée par la proximité du centre
    score = [stats[i, cv2.CC_STAT_AREA] / (1 + np.hypot(cent[i][0] - w / 2, cent[i][1] - h / 2) / (w / 4)) for i in range(1, n)]
    best = 1 + int(np.argmax(score))
    # on garde aussi les morceaux voisins de taille notable (pièces en plusieurs parties)
    keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > .12 * stats[best, cv2.CC_STAT_AREA]
            and abs(cent[i][0] - w / 2) < w * .3 and abs(cent[i][1] - h / 2) < h * .38]
    main = np.isin(lbl, keep or [best]).astype(np.uint8)
    cnts, _ = cv2.findContours(main, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled = np.zeros_like(main)
    cv2.drawContours(filled, cnts, -1, 1, -1)
    gc = np.full((h, w), cv2.GC_BGD, np.uint8)
    gc[cv2.dilate(filled, np.ones((25, 25), np.uint8)) > 0] = cv2.GC_PR_BGD
    gc[filled > 0] = cv2.GC_PR_FGD
    gc[cv2.erode(filled, np.ones((21, 21), np.uint8)) > 0] = cv2.GC_FGD
    for x0, y0, x1, y1 in exclude:
        gc[y0:y1, x0:x1] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, gc, None, bgd, fgd, 4, cv2.GC_INIT_WITH_MASK)
    mask = np.isin(gc, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8)
    n, lbl, stats, _ = cv2.connectedComponentsWithStats(mask)
    if n > 1:
        big = stats[1:, cv2.CC_STAT_AREA].max()
        mask = np.isin(lbl, [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > .08 * big]).astype(np.uint8)
    alpha = cv2.GaussianBlur(mask * 255, (5, 5), 0)
    ys, xs = np.where(alpha > 8)
    pad = 12
    y0, y1, x0, x1 = max(ys.min() - pad, 0), min(ys.max() + pad, h), max(xs.min() - pad, 0), min(xs.max() + pad, w)
    return np.dstack([img, alpha])[y0:y1, x0:x1]


for troop, shots in SHOTS.items():
    for i, shot in enumerate(shots):
        x0, y0, x1, y1 = BOX.get(shot, DEFAULT)
        img = cv2.imread(f'{SRC}{shot}.png')[y0:y1, x0:x1]
        out = cutout(img, EXCLUDE.get(shot, ()))
        scale = 440 / max(out.shape[:2])
        if scale < 1:
            out = cv2.resize(out, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
        # PNG 8 bits avec transparence : quelques dizaines de Ko par pièce
        rgba = Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGRA2RGBA))
        rgba.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(f'{OUT}/{troop}-p{i + 1}.png', optimize=True)
print('ok')
