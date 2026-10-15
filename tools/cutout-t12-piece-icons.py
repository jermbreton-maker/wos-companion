"""Détoure l'objet des icônes de pièces T12 (médaillons du jeu, fond orange incrusté) pour pouvoir changer
le fond selon l'état de la pièce. Usage : python3 tools/cutout-t12-piece-icons.py <icônes source> <sortie>"""
import glob
import os
import sys
import cv2
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
HUE_MIN = {'lancer-p4.png': 6}  # fond plus rouge sur cette capture
for path in sorted(glob.glob(f'{SRC}/*-p[1-5].png')):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    bgr = np.ascontiguousarray(img[..., :3])
    n = bgr.shape[0]
    yy, xx = np.mgrid[0:n, 0:n]
    d = np.hypot(xx - n / 2, yy - n / 2) / (n / 2)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(int)
    bg_like = (hsv[..., 0] >= HUE_MIN.get(os.path.basename(path), 11)) & (hsv[..., 0] <= 30) & (hsv[..., 1] > 110) & (hsv[..., 2] > 170)
    gc = np.full((n, n), cv2.GC_PR_FGD, np.uint8)
    gc[bg_like] = cv2.GC_PR_BGD
    gc[d > .9] = cv2.GC_BGD
    gc[(d < .25) & ~bg_like] = cv2.GC_FGD
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(bgr, gc, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    mask = np.isin(gc, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    k, lbl, stats, _ = cv2.connectedComponentsWithStats(mask)
    if k > 1:
        big = stats[1:, cv2.CC_STAT_AREA].max()
        mask = np.isin(lbl, [i for i in range(1, k) if stats[i, cv2.CC_STAT_AREA] > .05 * big]).astype(np.uint8)
    alpha = cv2.GaussianBlur(mask * 255, (3, 3), 0)
    alpha[d > .97] = 0
    cv2.imwrite(os.path.join(OUT, os.path.basename(path)), np.dstack([bgr, alpha]))
print('ok')
