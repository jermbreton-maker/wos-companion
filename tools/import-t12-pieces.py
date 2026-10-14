"""Importe les illustrations détourées des pièces de déblocage T12 (fournies dans le dossier des captures) :
recadrage sur la pièce, 440 px max, PNG 8 bits avec transparence. Usage : python3 tools/import-t12-pieces.py <sortie> [dossier]"""
import os
import sys
from PIL import Image

OUT = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '/home/koema-jr/Bureau/Screen Iphone/'
FILES = {
    'infantry-p1': 'Casque exalté rouge, vue frontale.png',
    'infantry-p2': 'Épaulière exaltée cramoisie-1.png',
    'infantry-p3': 'Plastron rouge du Bastion exalté-2.png',
    'infantry-p4': 'Bottes blindées rouges Exalted Trek-3.png',
    'infantry-p5': 'Hache et bouclier cramoisis-1.png',
    'lancer-p1': 'Couronne de guerre écarlate-2.png',
    'lancer-p2': 'Épaulière exaltée cramoisie en vue trois-quarts-3.png',
    'lancer-p3': 'Plastron rouge exalté flottant-1.png',
    'lancer-p4': 'Paire de bottes de guerre exaltées-2.png',
    'lancer-p5': 'Pique exaltée rouge mécanique-3.png',
    'marksman-p1': 'Voile exalté rouge lumineux-1.png',
    'marksman-p2': 'Manteau exalté cramoisi, pièce d’armure-2.png',
    'marksman-p3': 'Plastron de guerre rouge exalté-3.png',
    'marksman-p4': 'Armure rouge sombre à sangles croisées.png',
    'marksman-p5': 'Fusil steampunk cramoisi orné.png',
}
for name, file in FILES.items():
    path = os.path.join(SRC, file)
    if not os.path.exists(path):
        print('absent :', file)
        continue
    im = Image.open(path).convert('RGBA')
    box = im.getchannel('A').point(lambda a: 255 if a > 10 else 0).getbbox()
    im = im.crop(box)
    im.thumbnail((440, 440), Image.LANCZOS)
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(f'{OUT}/{name}.png', optimize=True)
print('ok')
