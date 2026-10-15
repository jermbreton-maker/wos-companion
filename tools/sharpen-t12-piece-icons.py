"""Rend plus nettes les icônes de pièces T12 (découpées dans des captures basse résolution) : accentuation
légère + un peu de contraste, transparence conservée. À lancer une seule fois après l'extraction.
Usage : python3 tools/sharpen-t12-piece-icons.py <dossier icônes>"""
import glob
import sys
from PIL import Image, ImageEnhance, ImageFilter

for path in sorted(glob.glob(f'{sys.argv[1]}/*-p[1-5].png') + glob.glob(f'{sys.argv[1]}/*-p[1-5]-cut.png')):
    im = Image.open(path).convert('RGBA')
    alpha = im.getchannel('A')
    rgb = im.convert('RGB').filter(ImageFilter.UnsharpMask(radius=2.2, percent=140, threshold=2))
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    out = rgb.convert('RGBA')
    out.putalpha(alpha)
    out.save(path, optimize=True)
print('ok')
