# AO3 Helper

Userscript (Tampermonkey) qui ajoute des fonctionnalités à
[Archive of Our Own](https://archiveofourown.org/) : filtrage et affichage
des tags, suivi de lecture, thèmes personnalisés, lecture à voix haute,
et une quarantaine d'autres modules organisés par catégorie (Browse,
Explore, Library, Navigate & Interact, Reading, Appearance & Tools).

## Installation

1. Installer l'extension [Tampermonkey](https://www.tampermonkey.net/)
   (ou un gestionnaire de userscripts compatible) dans le navigateur.
2. Builder le userscript (voir ci-dessous) puis ouvrir/glisser
   `dist/ao3-helper.user.js` dans Tampermonkey, ou l'installer depuis
   l'éditeur de scripts.
3. Le script s'active automatiquement sur `https://archiveofourown.org/*`.

## Développement

```bash
npm install       # installe les dépendances
npm run build     # build le userscript final (dist/)
npm run dev       # build en mode watch, pour développer en continu
npm test          # lance la suite de tests (vitest)
npm run typecheck # vérifie les types (tsc --noEmit, JSDoc)
npm run test:e2e  # tests de bout en bout sur des pages AO3 simulées (ao3-mock/)
```

Ces quatre commandes (`build`, `test`, `typecheck`, `test:e2e`) doivent
rester vertes avant tout commit.

## Documentation

Les règles de découpage, de placement et de cycle de vie des modules sont
décrites dans [`architecture.md`](architecture.md).

Chaque module a son propre fichier `.md` à côté de son code, dans
`src/modules/<catégorie>/<module>/`. Le dossier [`docs/`](docs/) contient
la documentation transversale du projet :

- [`docs/never-built-modules.md`](docs/never-built-modules.md) — concepts de
  modules envisagés puis explicitement écartés, et pourquoi.
- [`docs/misc.md`](docs/misc.md) — inventaire fichier par fichier de
  `src/modules` et `lib/`.

## Licence

MIT
