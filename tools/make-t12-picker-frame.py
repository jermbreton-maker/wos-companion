"""Découpe le cadre à engrenages des fenêtres T12 en 3 parties (haut / milieu étirable / bas) pour qu'il suive
la hauteur de la fenêtre sans déformer engrenages ni coins. Usage : python3 tools/make-t12-picker-frame.py <sortie> [dossier]"""
import os
import sys
from PIL import Image

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
im = Image.open(os.path.join(SRC, 'Cadre métallique ornemental à engrenages.png')).convert('RGBA')
W = 540  # moitié de la largeur d'origine (1077 px) : assez net pour une fenêtre de 460 px
TOP, BOTTOM = 365, 1350  # sous les ornements des coins hauts / au-dessus des engrenages du bas
for name, box in (('top', (0, 0, im.width, TOP)), ('middle', (0, TOP, im.width, BOTTOM)), ('bottom', (0, BOTTOM, im.width, im.height))):
    part = im.crop(box)
    part = part.resize((W, round(part.height * W / im.width)), Image.LANCZOS)
    part.save(f'{OUT}/{name}.png', optimize=True)
    print(name, part.size)
