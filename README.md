# Whiteout Companion

V1 mobile-first des calculateurs Chaudière, Équipement et Talismans du Chef, Recherche T11 et Déblocage T12.

## Lancer l'application

- **Windows** : double-cliquer sur `LANCER-WHITEOUT-COMPANION.cmd`.
- **Linux / macOS** : `node tools/server.js`, puis ouvrir http://127.0.0.1:4173/.

Ne pas ouvrir directement `index.html`, car certains navigateurs bloquent les applications locales.

## Structure

- `index.html` : application et navigation accessibles (les icônes de l'accueil y sont intégrées en base64)
- `src/styles.css`, `src/home.css`, `src/furnace.css`, `src/chief-comparison.css` : direction artistique glacée responsive
- `src/data.js` : données versionnées et indépendantes de l'interface
- `src/chief-gear-sublevels.js` : coûts des sous-niveaux d'équipement du Chef
- `src/app.js` : moteur de calcul et interactions
- `assets/visuals/` : visuels affichés par l'application (chaudières, équipement HD, matériaux, accueil). Les fichiers `*-prompt.txt` documentent la génération de chaque visuel.
- `assets/generated/` : talismans, matériaux de talismans et équipement P6
- `assets/fonts/` : police Lilita One
- `assets/references/` : captures du jeu conservées comme références de conception
- `tools/` : serveur local et script de découpe des sprites de talismans

Les valeurs de démonstration sont isolées dans `src/data.js` afin de faciliter leur audit et leur remplacement par les tables finales validées, une fois l'UX et la structure de la V1 finalisées.
