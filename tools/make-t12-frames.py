"""Cadres des médaillons de l'arbre T12 (fournis détourés, bleus) : recentrage sur le trou central, recadrage carré,
puis variantes de couleur par troupe (Lancier bleu d'origine, Infanterie verte, Tireur doré).
Usage : python3 tools/make-t12-frames.py <sortie> [dossier]"""
import os
import sys
import cv2
import numpy as np
from PIL import Image

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
FILES = {'big': 'Cadre circulaire doré à huit rivets.png', 'small': 'Cadre circulaire bleu et laiton ajouré.png'}
SIZE = 256
# teinte (OpenCV 0-180) et facteur de saturation / luminosité pour remplacer le bleu
TROOPS = {'lancer': None, 'infantry': (62, .8, .82), 'marksman': (17, 1.15, 1.08)}

for kind, file in FILES.items():
    rgba = np.array(Image.open(os.path.join(SRC, file)).convert('RGBA'))
    alpha = rgba[..., 3]
    # trou central = zone transparente qui contient le centre de l'image
    hole = (alpha < 10).astype(np.uint8)
    _, lbl = cv2.connectedComponents(hole)
    h, w = alpha.shape
    ys, xs = np.where(lbl == lbl[h // 2, w // 2])
    cx, cy = xs.mean(), ys.mean()
    r_hole = np.sqrt(len(xs) / np.pi)
    oy, ox = np.where(alpha > 10)
    half = max(cx - ox.min(), ox.max() - cx, cy - oy.min(), oy.max() - cy) + 2
    box = (int(round(cx - half)), int(round(cy - half)), int(round(cx + half)), int(round(cy + half)))
    base = Image.fromarray(rgba).crop(box).resize((SIZE, SIZE), Image.LANCZOS)
    print(kind, f'trou {r_hole / half * 100:.1f} % du rayon')
    for troop, shift in TROOPS.items():
        img = np.array(base)
        if shift:
            bgr = cv2.cvtColor(img[..., :3], cv2.COLOR_RGB2BGR)
            hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
            blue = (hsv[..., 0] > 95) & (hsv[..., 0] < 125) & (hsv[..., 1] > 70)
            hsv[..., 0][blue] = shift[0]
            hsv[..., 1][blue] = np.clip(hsv[..., 1][blue] * shift[1], 0, 255)
            hsv[..., 2][blue] = np.clip(hsv[..., 2][blue] * shift[2], 0, 255)
            img[..., :3] = cv2.cvtColor(cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR), cv2.COLOR_BGR2RGB)
        Image.fromarray(img).save(f'{OUT}/{kind}-{troop}.png', optimize=True)
print('ok')
