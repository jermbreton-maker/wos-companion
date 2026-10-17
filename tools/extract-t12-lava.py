"""Texture de lave des chemins T12, découpée dans une capture du jeu (portion droite d'une barre allumée, IMG_1167),
doublée en miroir pour se répéter sans couture. Sorties : lava-h.png (horizontale) et lava-v.png (verticale).
Usage : python3 tools/extract-t12-lava.py <sortie> [dossier]"""
import os
import sys
from PIL import Image, ImageOps

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
strip = Image.open(os.path.join(SRC, 'IMG_1167.png')).convert('RGB').crop((650, 486, 980, 538))  # barre du haut, à droite de la jonction
tile = Image.new('RGB', (strip.width * 2, strip.height))
tile.paste(strip, (0, 0))
tile.paste(ImageOps.mirror(strip), (strip.width, 0))
tile = tile.resize((tile.width // 2, tile.height // 2), Image.LANCZOS)
tile.save(f'{OUT}/lava-h.png', optimize=True)
tile.rotate(-90, expand=True).save(f'{OUT}/lava-v.png', optimize=True)
print(tile.size)
