"""Points de départ des éclairs autour de chaque personnage glorifié T12 : bord de la silhouette (alpha) dans
plusieurs directions depuis le centre du corps, hors du bas (pieds cachés derrière les médaillons).
Affiche un objet JS à coller dans src/t12.js (coordonnées en fraction de l'image, angle en degrés)."""
import json
import math
import numpy as np
from PIL import Image

BODY_X = {'infantry': .5, 'lancer': .53, 'marksman': .37}  # centre horizontal du corps (fraction de largeur)
# Même règle pour les 3 : point le plus éloigné de la silhouette complète dans chaque direction (vrai contour).
# Infanterie : au-delà de -90° et +60°, on tombe sur la hache et le bouclier ; ses 9 directions restent donc
# sur le contour du corps (épaule gauche -> tête -> épaule droite).
ANGLES_BY_TROOP = {'infantry': [-90, -75, -58, -40, -18, 5, 25, 45, 60]}
ANGLES = [-125, -95, -62, -30, 0, 30, 62, 95, 125]  # 0 = haut, sens horaire
out = {}
for troop, bx in BODY_X.items():
    a = np.array(Image.open(f'assets/visuals/t12/units/{troop}.png').convert('RGBA'))[..., 3] > 60
    h, w = a.shape
    cx, cy = bx * w, .42 * h
    spots = []
    for ang in ANGLES_BY_TROOP.get(troop, ANGLES):
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
