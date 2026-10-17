#!/usr/bin/env python3
"""Convertit le lexique (i18n/lexique.xlsx) en dictionnaire pour le site (src/i18n-<langue>.js).

Usage : python3 tools/build-i18n.py            -> toutes les langues présentes (colonnes après FR)
Lit les onglets « Textes interface » et « Termes du jeu » : colonne FR = texte affiché par le site,
colonne de la langue = traduction. Case vide = le site garde le français.
Fonctionne avec le fichier tel que généré ou ré-enregistré par Excel / LibreOffice / Google Sheets."""
import json,re,sys,zipfile,os
from xml.etree import ElementTree as ET
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
def sheets(path):
    z=zipfile.ZipFile(path)
    shared=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',NS):
            shared.append(''.join(t.text or '' for t in si.iter('{%s}t'%NS['m'])))
    wb=ET.fromstring(z.read('xl/workbook.xml'))
    rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    target={r.get('Id'):r.get('Target') for r in rels}
    out={}
    for s in wb.find('m:sheets',NS):
        rid=s.get('{%s}id'%NS['r']);t=target[rid].lstrip('/');t=t if t.startswith('xl/') else 'xl/'+t
        rows=[]
        for row in ET.fromstring(z.read(t)).iter('{%s}row'%NS['m']):
            cells={}
            for c in row.findall('m:c',NS):
                col=re.match(r'[A-Z]+',c.get('r')).group(0);typ=c.get('t');v=''
                if typ=='inlineStr':v=''.join(x.text or '' for x in c.iter('{%s}t'%NS['m']))
                elif typ=='s':v=shared[int(c.find('m:v',NS).text)]
                elif c.find('m:v',NS) is not None:v=c.find('m:v',NS).text or ''
                cells[col]=v
            rows.append(cells)
        out[s.get('name')]=rows
    return out
def table(rows):
    # ligne d'en-tête = celle qui contient « FR »
    for i,r in enumerate(rows):
        if 'FR' in r.values():
            hdr={v:k for k,v in r.items()};return hdr,rows[i+1:]
    return {},[]
data=sheets(os.path.join(ROOT,'i18n','lexique.xlsx'))
langs={}
for name in ('Textes interface','Termes du jeu'):
    hdr,rows=table(data.get(name,[]))
    fr=hdr['FR'];cols=[(l,c) for l,c in hdr.items() if re.fullmatch(r'[A-Z]{2}',l) and l!='FR']
    for l,c in cols:
        d=langs.setdefault(l.lower(),{})
        for r in rows:
            src=(r.get(fr) or '').strip();dst=(r.get(c) or '').strip()
            if src and dst:d[src]=dst
for lang,d in langs.items():
    exact={k:v for k,v in d.items() if '{' not in k}
    templates=sorted([[k,v] for k,v in d.items() if '{' in k],key=lambda kv:-len(re.sub(r'\{[^}]+\}','',kv[0])))
    js=('/* Généré par tools/build-i18n.py depuis i18n/lexique.xlsx — ne pas modifier à la main. */\n'
        f'window.I18N_DICT=window.I18N_DICT||{{}};window.I18N_DICT[{json.dumps(lang)}]='
        +json.dumps({'exact':exact,'templates':templates},ensure_ascii=False,separators=(',',':'))+';\n')
    open(os.path.join(ROOT,'src',f'i18n-{lang}.js'),'w',encoding='utf-8').write(js)
    print(f'{lang}: {len(exact)} textes, {len(templates)} modèles -> src/i18n-{lang}.js')
