"""Icônes d'accueil T11 / T12 (fioles fournies) : recadrage sur le contenu, marge pour remplir ~93 % du carré
comme les autres icônes de l'accueil, 256 px. Usage : python3 tools/make-home-vials.py [dossier]"""
import os
import sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/koema-jr/Bureau/Screen Iphone/'
FILES = {'t11': 'Potions rouges T11 en bois.png',  # tubes à essai dans un support en bois, badge T11
         't12': 'Flacon de potion magique T12.png'}           # fiole dorée en fusion, badge T12
SIZE, FILL = 256, .93
for key, file in FILES.items():
    im = Image.open(os.path.join(SRC, file)).convert('RGBA')
    im = im.crop(im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox())
    side = round(max(im.size) / FILL)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2), im)
    canvas.resize((SIZE, SIZE), Image.LANCZOS).save(f'assets/visuals/home/{key}-vial.png', optimize=True)
    print(key, im.size, '->', SIZE)
