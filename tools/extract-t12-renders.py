"""Découpe le rendu 3D de chaque pièce de déblocage T12 (haut de l'écran de forge du jeu).
Usage : python3 tools/extract-t12-renders.py <sortie> [dossier des captures]"""
import sys
from PIL import Image

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
SHOTS = {'infantry': ['IMG_1059', 'IMG_1061', 'IMG_1062', 'IMG_1063', 'IMG_1064'],
         'lancer': ['IMG_1065', 'IMG_1067', 'IMG_1068', 'IMG_1069', 'IMG_1071'],
         'marksman': ['IMG_1072', 'IMG_1074', 'IMG_1075', 'IMG_1055', 'IMG_1056']}
BOX = {'IMG_1055': (102, 522, 1095, 1192), 'IMG_1056': (102, 522, 1095, 1192)}  # captures cadrées autrement
DEFAULT = (30, 470, 1140, 1220)  # sous les boutons du jeu, au-dessus du bandeau de puissance

for troop, shots in SHOTS.items():
    for i, shot in enumerate(shots):
        im = Image.open(f'{SRC}{shot}.png').convert('RGB').crop(BOX.get(shot, DEFAULT)).resize((720, 486), Image.LANCZOS)
        im.save(f'{OUT}/{troop}-p{i + 1}.jpg', quality=82, optimize=True)
print('ok')
