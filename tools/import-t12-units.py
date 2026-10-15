"""Importe les personnages glorifiés détourés (dossier des captures) : recadrage, 560 px de haut max, PNG 8 bits.
Usage : python3 tools/import-t12-units.py <sortie> [dossier]"""
import os
import sys
from PIL import Image

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
FILES = {'infantry': 'Infanterie glorifiée, hache et bouclier.png', 'lancer': 'Lancier glorifié à lance lumineuse.png',
         'marksman': 'Tireur glorifié au fusil tricanon.png'}
for troop, file in FILES.items():
    im = Image.open(os.path.join(SRC, file)).convert('RGBA')
    im = im.crop(im.getchannel('A').point(lambda a: 255 if a > 10 else 0).getbbox())
    im.thumbnail((560, 560), Image.LANCZOS)
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(f'{OUT}/{troop}.png', optimize=True)
print('ok')
