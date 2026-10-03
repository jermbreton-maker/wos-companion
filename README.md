# Whiteout Companion

V1 mobile-first des calculateurs Chaudière, Chef et Académie T11/T12.

Sous Windows, double-cliquer sur `LANCER-WHITEOUT-COMPANION.cmd`. Ne pas ouvrir directement `index.html`, car certains navigateurs intégrés bloquent les applications locales.

## Structure

- `index.html` : application et navigation accessibles
- `src/styles.css` : direction artistique glacée responsive
- `src/data.js` : données versionnées et indépendantes de l'interface
- `src/app.js` : moteur de calcul et interactions
- `assets/references/` : captures utilisateur conservées comme références de conception

Les valeurs de démonstration sont isolées dans `src/data.js` afin de faciliter leur audit et leur remplacement par les tables finales validées.
