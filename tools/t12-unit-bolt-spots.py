"""Points de départ des éclairs autour de chaque personnage glorifié T12 : bord de la silhouette (alpha) dans
plusieurs directions depuis le centre du corps, hors du bas (pieds cachés derrière les médaillons).
Affiche un objet JS à coller dans src/t12.js (coordonnées en fraction de l'image, angle en degrés)."""
import json
import math
import numpy as np
from PIL import Image

BODY_X = {'infantry': .5, 'lancer': .53, 'marksman': .37}  # centre horizontal du corps (fraction de largeur)
# Même règle pour les 3 (point le plus éloigné de la silhouette dans chaque direction). Infanterie : hache et bouclier
# sont détachés et très écartés, on limite donc la silhouette à la bande du corps (fraction de largeur).
BODY_BAND = {'infantry': (.14, .76)}
ANGLES = [-125, -95, -62, -30, 0, 30, 62, 95, 125]  # 0 = haut, sens horaire
out = {}
for troop, bx in BODY_X.items():
    a = np.array(Image.open(f'assets/visuals/t12/units/{troop}.png').convert('RGBA'))[..., 3] > 60
    h, w = a.shape
    if troop in BODY_BAND:
        lo, hi = BODY_BAND[troop]
        a[:, :int(lo * w)] = False
        a[:, int(hi * w):] = False
    cx, cy = bx * w, .42 * h
    spots = []
    for ang in ANGLES:
        rad = math.radians(ang - 90)
        dx, dy = math.cos(rad), math.sin(rad)
        last = None
        for t in range(0, int(max(w, h) * 1.2)):
            x, y = int(cx + dx * t), int(cy + dy * t)
            if not (0 <= x < w and 0 <= y < h):
                break
            if a[y, x]:
                last = (x, y)
        if last:
            spots.append([round(last[0] / w, 3), round(last[1] / h, 3), ang])
    out[troop] = {'ratio': round(w / h, 4), 'spots': spots}
print(json.dumps(out))
