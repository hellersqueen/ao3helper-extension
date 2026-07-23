# Guide explicatif du projet AO3 Helper

Ce document explique **à quoi sert chaque fichier et chaque dossier** du
projet, et **pourquoi tout est construit de cette façon**. Il est écrit de
façon simple, avec des comparaisons du quotidien, mais il essaie de ne rien
cacher d'important : après l'avoir lu, tu dois pouvoir te promener seul(e)
dans le projet et savoir où regarder.

Ce guide est un point d'entrée. Pour les règles précises de rangement du
code, le document de référence reste [`architecture.md`](../architecture.md).
Pour l'historique détaillé de chaque fonctionnalité, chaque module a son
propre `.md` à côté de son code.

---

## 1. C'est quoi, AO3 Helper, en une image ?

Archive of Our Own (AO3) est un site web. AO3 Helper **n'est pas un site**,
ni une application qu'on installe normalement : c'est un **userscript**, un
petit programme qu'on installe dans une extension de navigateur appelée
**Tampermonkey**.

Imagine que Tampermonkey est un majordome qui se tient devant la porte du
site AO3. Chaque fois que tu entres sur AO3, ce majordome sort une feuille
de papier (le script AO3 Helper) et la lit à voix haute *avant même que la
page ne finisse de s'afficher*. Cette feuille contient les instructions pour
ajouter environ 38 petits outils à la page : cacher certains tags, suivre ta
lecture, lire les fics à voix haute, changer les couleurs du site, etc.

Le travail de ce projet, c'est d'écrire cette « feuille de papier ». Mais on
ne l'écrit pas d'un seul bloc : on l'écrit en des centaines de petits
fichiers rangés intelligemment, puis une machine les assemble en un seul
fichier final que Tampermonkey peut lire.

---

## 2. La carte du projet en trois mondes

Tout le projet peut se comprendre à travers trois grandes étapes, un peu
comme fabriquer un livre :

```
 MONDE 1 : LE BROUILLON            MONDE 2 : L'IMPRIMERIE         MONDE 3 : LE LIVRE FINI
 (le code qu'on écrit à la main)   (la fabrication automatique)   (ce qu'on installe vraiment)

   src/   ─┐                                                      dist/ao3-helper.user.js
   lib/   ─┼──►  vite.config.js  ──►  scripts/split-userscript.mjs ─┼─  dist/ao3-helper.modules.js
           │     (le moteur qui                                    ├─  dist/ao3-helper.panel.js
           │      compile tout)                                    └─  dist/ao3-helper-tampermonkey.user.js
```

- **`src/`** et **`lib/`** : le code source. C'est ce qu'on lit, qu'on
  modifie, qu'on comprend. Personne n'installe directement ces fichiers dans
  son navigateur.
- **`scripts/`**, **`vite.config.js`**, **`package.json`** : les outils de
  fabrication. Ils transforment des centaines de petits fichiers en un
  produit fini.
- **`dist/`** : le résultat final. Ce sont les seuls fichiers que
  Tampermonkey lit réellement. On ne les modifie jamais à la main — ils sont
  regénérés à chaque fois qu'on lance `npm run build`.

Retiens cette règle simple pour te repérer dans tout le reste du guide :
**si un fichier est dans `dist/`, on ne le modifie jamais directement.** Il
est toujours la copie « cuite » d'un fichier qui vit ailleurs.

---

## 3. Le dossier racine : les fichiers isolés

Ce sont les fichiers posés directement à la racine du projet (pas dans un
dossier). Ils forment la « carte d'identité » et les « réglages généraux »
du projet.

### `package.json`
C'est la carte d'identité du projet : son nom, sa version, la liste des
outils dont il a besoin pour fonctionner (`devDependencies`), et surtout la
liste des **commandes** qu'on peut lancer avec `npm run ...` (voir la
[section 11](#11-les-commandes-npm-en-un-coup-dœil)). Si tu veux savoir
« quelles actions puis-je faire sur ce projet ? », c'est le premier fichier
à ouvrir.

### `vite.config.js`
**Vite** est l'outil qui fabrique le produit fini (l'« imprimerie » du
schéma ci-dessus). `vite.config.js`, c'est le mode d'emploi qu'on lui donne :
- il lui dit que le point de départ du programme est `src/main.js` ;
- il lui dit comment retrouver des chemins raccourcis comme `@core`,
  `@modules`, `@lib`, `@ui`, `@styles` (des surnoms pour éviter d'écrire des
  chemins à rallonge du style `../../../lib/utils/index.js`) ;
- il configure un outil spécial, `vite-plugin-monkey`, qui sait fabriquer
  spécifiquement des userscripts (avec le bon en-tête `// ==UserScript==`,
  voir [section 9](#9-le-dossier-dist--le-produit-fini)) ;
- il configure aussi **Vitest**, l'outil qui fait tourner les tests
  automatiques (voir [section 10](#10-comment-on-vérifie-que-tout-marche)).

### `tsconfig.json`
C'est le réglage du **correcteur de types**. Le projet est écrit en
JavaScript normal (pas en TypeScript), mais chaque fonction peut porter un
petit commentaire spécial juste au-dessus (on appelle ça du **JSDoc**, par
exemple `/** @param {string} nom */`). `tsconfig.json` dit à l'outil
`tsc --noEmit` (lancé par `npm run typecheck`) de lire ces commentaires et de
vérifier qu'on n'envoie jamais un nombre là où un texte est attendu, par
exemple. C'est un peu comme un correcteur orthographique, mais pour la
logique du code plutôt que pour les mots.

### `environment.d.ts`
Un dictionnaire de mots que TypeScript ne connaît pas tout seul : les
fonctions spéciales que Tampermonkey fournit (`GM_getValue`, `GM_setValue`,
`GM_xmlhttpRequest`...) et quelques propriétés qu'AO3 Helper ajoute sur
`window` (l'objet global du navigateur) à l'exécution, comme `window.AO3H`.
Sans ce fichier, le correcteur de types crierait « je ne connais pas ce
mot ! » dès qu'un fichier utilise `GM_getValue`.

### `README.md`
La porte d'entrée du projet : comment l'installer, comment lancer les
commandes de développement, et des liens vers le reste de la documentation.

### `architecture.md`
Le **règlement de rangement** du code : comment décider si un bout de
fonctionnalité doit rester tout seul dans son fichier, être fusionné avec un
autre, ou déménager dans `lib/`. Ce guide-ci t'explique *ce qui existe*;
`architecture.md` explique *les règles pour décider où placer une nouvelle
pièce de code*. Les mots qu'il utilise (coordinateur, sous-module,
bibliothèque partagée) reviennent dans toute la section 6 de ce guide.

### `shared.md`
Un très long carnet de notes historique (le plus gros fichier texte du
projet). Il documente un chantier déjà terminé : le déplacement de toute la
logique commune vers `lib/`. On ne le modifie plus au quotidien ; il sert de
mémoire du « pourquoi c'est rangé comme ça ».

### `.gitignore`
La liste des dossiers que Git (l'outil qui garde l'historique du projet)
doit ignorer complètement : `node_modules` (les outils téléchargés,
beaucoup trop gros et jamais écrits par nous) et un dossier temporaire de
synchronisation OneDrive.

---

## 4. Le dossier `src/` : le code qu'on écrit à la main

`src/` contient le **cœur logique** du projet : le démarrage du programme et
les 38 fonctionnalités (« modules ») elles-mêmes.

### 4.1. `src/main.js` — le tout premier fichier exécuté

C'est la toute première ligne de code qui s'exécute quand la page AO3 se
charge. Il tourne au moment **`document-start`** : c'est-à-dire *avant* que
la page AO3 elle-même n'ait fini de s'afficher — un peu comme arriver dans
une salle de spectacle avant même que les lumières ne s'éteignent, pour
pouvoir installer discrètement du matériel avant que le public n'arrive.

Ce fichier fait très peu de choses, volontairement :
1. il injecte tout de suite les styles CSS de base (variables de couleurs,
   styles du menu...) pour éviter un « flash » visuel disgracieux ;
2. il démarre le noyau du système (`core/coordinator.js`) et le petit menu
   déroulant « AO3 Helper » dans la barre de navigation ;
3. il attend que la page ait fini de charger (`DOMContentLoaded`) avant de
   charger les 38 modules de fonctionnalités.

Ce découpage en deux temps (noyau tout de suite, modules un peu après) est
volontaire : le noyau doit être prêt instantanément, mais charger les 38
modules d'un coup ralentirait l'affichage de la page pour rien.

### 4.2. `src/core/` — la salle des machines

Ce dossier contient les pièces qui font tourner *tout le reste*, mais qui ne
sont elles-mêmes aucune fonctionnalité visible pour l'utilisatrice.

- **`lifecycle.js`** — le fichier le plus important du projet. Il tient un
  grand carnet (`Modules`, une sorte de registre) qui connaît tous les
  modules : est-il activé ? est-il démarré ? Il fournit la fonction
  `register(nom, infos, fonctionDeDémarrage)` que chacun des 38 modules
  appelle pour dire « bonjour, voici comment me démarrer et m'arrêter ». Il
  gère aussi la **cascade parent → enfant** : si un module a des
  sous-fonctionnalités activables séparément (déclarées avec
  `meta.parent`), elles démarrent automatiquement quand leur parent démarre,
  et s'arrêtent avec lui. C'est aussi ce fichier qui pose l'objet global
  `window.AO3H`, le point de rendez-vous que toutes les autres pièces du
  projet utilisent pour se parler.
- **`coordinator.js`** — de la « colle » : la fenêtre de gestion des
  œuvres cachées (import/export), et un mécanisme qui redémarre
  automatiquement un module quand on change un de ses réglages dans le
  panneau (pour voir l'effet immédiatement, sans recharger la page).
- **`module-loader.js`** — orchestre le démarrage : il attend que le noyau
  soit prêt, puis lance `Modules.bootAll()` (démarrer tous les modules
  activés), avec des journaux de bord (`console.log`) utiles pour déboguer.
- **`module-registry.js`** — une liste de secours des 38 modules. À noter
  honnêtement : son propre commentaire d'en-tête indique qu'il n'est
  **branché nulle part actuellement** (chaque module s'enregistre déjà
  lui-même en s'important). C'est un reliquat en attente de suppression, pas
  une pièce active du système.

### 4.3. `src/modules.js` — le grand tableau de contrôle

Ce fichier répond à une question précise : *« sur la page que je suis en
train de regarder, quels modules dois-je réellement télécharger et
démarrer ? »*

Charger les 38 modules sur chaque page serait un gaspillage : le module
« Chapter Navigation » ne sert à rien sur la page d'accueil, par exemple.
Ce fichier contient donc, pour chacun des 38 modules, une petite fiche :

```js
hideByTags: {
  load: () => import('./modules/browse/hideByTags/_hideByTags.js'),
  routes: ['listing'],   // seulement utile sur les pages de listes d'œuvres
}
```

Au chargement de la page, `src/modules.js` regarde l'adresse de la page
actuelle (est-ce une œuvre ? une liste ? la page d'accueil ? le tableau de
bord ?) et ne télécharge **que** les modules à la fois activés par
l'utilisatrice *et* pertinents pour cette page précise. C'est ce qui rend le
script rapide malgré ses 38 fonctionnalités : on ne paie que pour ce qu'on
utilise, page par page. Quatre modules (`hideByTags`, `skipWorks`,
`seriesHelper`, `visualPreferences`) sont activés par défaut pour une
nouvelle utilisatrice ; tous les autres doivent être allumés à la main dans
le panneau de réglages.

### 4.4. `src/modules/<catégorie>/<module>/` — les 38 outils

C'est ici que vit la vraie logique de chaque fonctionnalité. Les modules
sont rangés dans 6 catégories (qui correspondent aux 6 onglets du panneau de
réglages) :

| Dossier | Onglet du panneau |
|---|---|
| `browse/` | Browse — filtrer/afficher les listes d'œuvres |
| `explore/` | Explore — découverte, recherche, jeux |
| `reading/` | Reading — pendant la lecture d'un chapitre |
| `library/` | Library — bibliothèque personnelle, suivi, favoris |
| `navigate/` | Navigate & Interact — navigation, commentaires, relations |
| `appearance/` | Appearance & Tools — thèmes, sauvegarde, export |

Chaque module possède son propre dossier, avec toujours la même anatomie.
Prenons `src/modules/browse/hideByTags/` comme exemple concret :

```
hideByTags/
├── _hideByTags.js          ← le coordinateur (le chef d'équipe)
├── hiddenTags.js           ← un sous-module : cache les œuvres par tag
├── nopeWords.js            ← un sous-module : cache par mot dans le texte
├── whitelistExceptions.js  ← un sous-module : liste blanche d'exceptions
├── hideByTags.css          ← son apparence visuelle
├── hideByTags.md           ← son carnet d'explications et de décisions
├── hiddenTags.test.js      ← les vérifications automatiques de hiddenTags.js
├── nopeWords.test.js       ← les vérifications automatiques de nopeWords.js
└── ... (un .test.js par pièce importante)
```

- Le fichier qui commence par un **underscore** (`_hideByTags.js`) est le
  **coordinateur** : le chef d'équipe du module. C'est lui qui charge les
  réglages, assemble les sous-modules, les démarre et les arrête proprement.
  Quand un module tient dans un seul fichier (pas besoin d'équipe), on
  n'utilise pas le préfixe `_` : le fichier s'appelle juste `<module>.js`
  (par exemple `skipWorks.js`).
- Les autres fichiers `.js` (sans `_`) sont des **sous-modules** : de petits
  outils autonomes qui font une chose précise et qui pourraient presque
  fonctionner tout seuls.
- Le fichier `.css` porte les couleurs et les styles visuels du module.
- Le fichier `.md` est le carnet de bord du module : à quoi il sert, quels
  réglages il propose, quelles idées ont été essayées puis abandonnées (et
  pourquoi).
- Chaque `.test.js` est une série de petites vérifications automatiques (une
  sorte de liste de contrôle qu'un robot relit à chaque changement de code
  pour s'assurer que rien n'est cassé — détails en
  [section 10](#10-comment-on-vérifie-que-tout-marche)).

**Une règle importante, invisible mais partout dans le projet** : deux
modules voisins (par exemple `hideByTags` et `tagsDisplay`) **ne s'appellent
jamais directement entre eux**. S'ils ont besoin de se parler, ils passent
soit par `lib/` (la boîte à outils commune, section suivante), soit par
l'objet global que chaque coordinateur pose sur `window` (par exemple
`window.AO3H_LaterShelf`). C'est comme des voisins d'appartement qui ne
rentrent jamais chez l'autre par la fenêtre : ils passent par le hall
commun (`lib/`) ou ils toquent à la porte d'entrée (l'API publique du
module). Cela permet de désactiver n'importe quel module sans jamais faire
planter un autre module qui « regarderait » discrètement à l'intérieur.

---

## 5. Le dossier `lib/` : la boîte à outils commune

Si `src/modules/` contient les 38 fonctionnalités visibles, `lib/` contient
tout ce dont **plusieurs** fonctionnalités ont besoin en commun. C'est la
quincaillerie du projet : personne ne réinvente sa propre pince ou son
propre tournevis, tout le monde va piocher dans `lib/`.

- **`lib/ao3/`** — tout ce que le projet « sait » sur le site AO3
  lui-même : reconnaître le type de page actuelle (`routes.js`), lire les
  informations d'une œuvre dans le HTML de la page — titre, auteur, tags,
  nombre de mots, kudos... (`parsers.js`, `work-page.js`, `work-stats.js`),
  déclencher des actions réelles comme donner un kudos ou s'abonner
  (`actions.js`), et parler au serveur d'AO3 (`requests.js`). C'est la
  bibliothèque la plus « spécialiste AO3 » : si demain AO3 changeait son
  HTML, c'est surtout ici qu'il faudrait corriger des choses.
- **`lib/storage/`** — comment le projet mémorise les informations d'une
  visite à l'autre (détails complets en
  [section 6](#6-comment-le-projet-se-souvient-de-tes-réglages)).
- **`lib/ui/`** — les morceaux d'interface réutilisables : le petit menu
  déroulant (`menu/`), le grand panneau de réglages (`panel/`), les
  notifications (`toast.js`), les fenêtres popup (`dialog.js`), les badges,
  le glisser-déposer pour réordonner une liste (`drag-reorder.js`)...
- **`lib/styles/`** — les feuilles de style CSS communes à tout le projet
  (couleurs de base, structure du menu, structure du panneau). Chaque
  module a en plus son propre petit `.css` pour ses besoins spécifiques.
- **`lib/themes/`** — le moteur de thèmes visuels (utilisé par le module
  « Theme Builder ») : les thèmes déjà fournis (`builtin/`) et les modèles
  pour en créer de nouveaux (`templates/`).
- **`lib/utils/`** — les outils les plus génériques de tous : lire/écrire
  des réglages (`config.js`, détaillé en section 6), manipuler le DOM
  (`dom.js`), un système de messages internes façon haut-parleur
  (`event-bus.js`), écrire des journaux de bord (`logger.js`), formater des
  dates (`format-date.js`), importer/exporter des fichiers JSON
  (`json-file.js`)... et **`runtime-bundles.js`**, une pièce essentielle
  détaillée en [section 9](#9-le-dossier-dist--le-produit-fini).

**Comment savoir si quelque chose doit vivre dans `lib/` plutôt que dans un
module ?** La règle simple d'`architecture.md` : si une seule fonctionnalité
en a besoin, ça reste avec elle dans `src/modules/`. Si *plusieurs*
fonctionnalités en ont besoin, ça déménage dans `lib/`. Par exemple, la
détection des « tags de bruit » (des tags trop génériques pour être
utiles) est utilisée à la fois par `tagsDisplay` et par `hideByTags` : elle
vit donc dans `lib/utils/noise-tags.js`, pas dans l'un des deux modules.

---

## 6. Comment le projet se souvient de tes réglages

Un navigateur ne garde normalement rien en mémoire d'une visite à l'autre.
AO3 Helper doit donc activement **sauvegarder** tes préférences quelque
part. Il utilise deux « tiroirs » différents, avec des rôles différents :

1. **Le tiroir GM (`GM_getValue` / `GM_setValue`)** — un espace de stockage
   fourni par Tampermonkey lui-même. Avantage : si tu as activé la
   synchronisation Tampermonkey, ce tiroir peut se retrouver identique sur
   plusieurs ordinateurs. Inconvénient : y accéder est **asynchrone** (il
   faut « attendre la réponse », comme envoyer une lettre et attendre le
   retour du facteur).
2. **Le tiroir `localStorage`** — un espace de stockage classique du
   navigateur, propre à cet ordinateur. Avantage : la lecture est
   **instantanée** (pas d'attente).

Le fichier `lib/storage/index.js` définit un objet `Storage` qui donne accès
aux deux tiroirs, toujours avec le même préfixe `ao3h:` devant chaque nom de
clé (pour ne jamais mélanger les données d'AO3 Helper avec celles d'un autre
site ou d'un autre script) :
- `Storage.get(clé)` / `Storage.set(clé, valeur)` → tiroir GM (lent mais
  fiable, potentiellement synchronisé) ;
- `Storage.lsGet(clé)` / `Storage.lsSet(clé, valeur)` → tiroir
  `localStorage` (rapide, seulement sur cet ordinateur).

En pratique, la plupart des réglages sont **écrits dans les deux tiroirs en
même temps** : le tiroir GM comme copie de référence, et `localStorage`
comme copie rapide à consulter (par exemple pour dessiner immédiatement
l'interface sans attendre).

Par-dessus ce système de base, deux autres couches existent :

- **`Flags`** (dans `lib/utils/config.js`) — l'**interrupteur** de chaque
  module : activé ou désactivé. `Flags.get('mod:hideByTags:enabled')` répond
  vrai ou faux. On peut aussi « surveiller » un interrupteur avec
  `Flags.watch(clé, fonction)` : c'est exactement ce que fait
  `core/lifecycle.js` pour démarrer ou arrêter un module dès que tu changes
  la case à cocher dans le panneau, sans recharger la page.
- **`Settings`** (aussi dans `config.js`) — les **réglages détaillés**
  *à l'intérieur* d'un module une fois qu'il est activé (par exemple : quelle
  couleur, quel seuil, quel texte de bouton).
- **`UserStorage`** (dans `lib/storage/user.js`) — une couche
  supplémentaire qui ajoute ton **nom d'utilisatrice AO3** devant chaque
  clé (par exemple `ao3h.ehly.hiddenTags`). Pourquoi ? Pour que, si
  plusieurs personnes utilisent le même navigateur (ou si tu changes de
  compte AO3), chacune garde ses propres tags cachés, ses propres favoris,
  etc., sans que les données se mélangent. Si aucun nom d'utilisatrice n'est
  détecté (page publique, pas connectée), tout est rangé sous l'identifiant
  `"guest"`.

En résumé : `Storage` = *où* c'est physiquement gardé (GM ou
`localStorage`) ; `UserStorage` = *pour qui* c'est gardé (quel compte) ;
`Flags`/`Settings` = *quoi* est gardé (interrupteurs et réglages).

---

## 7. Le dossier `scripts/` : les robots qui fabriquent le produit fini

Ce dossier contient des petits programmes Node.js (pas du code du
userscript lui-même) qui automatisent la fabrication et le test local.

### `split-userscript.mjs` — le plus important des trois

Pour comprendre ce script, il faut d'abord comprendre un problème : un
userscript classique est un **seul fichier texte**. Mais notre code source
est réparti dans des centaines de petits fichiers qui s'importent les uns
les autres (`import ... from ...`). Le navigateur, à l'intérieur d'un
userscript, ne sait pas aller chercher tout seul des dizaines de fichiers
séparés sur le disque.

La solution technique choisie ici s'appelle **SystemJS** : un tout petit
programme (fourni par l'outil `vite-plugin-monkey`) qui sait faire semblant
d'avoir plusieurs fichiers séparés *à l'intérieur d'un seul fichier*. Chaque
morceau de code d'origine devient un bloc qui commence par
`System.register("nom-du-fichier", ...)`. C'est comme ranger 300 feuilles
différentes dans un seul classeur, mais en gardant un onglet pour chaque
feuille : le classeur est un seul objet physique, mais on peut toujours
retrouver et lire chaque feuille séparément.

Une fois que `vite build` a produit ce grand classeur (un premier
`dist/ao3-helper.user.js` qui contient tout, en vrac), `split-userscript.mjs`
prend le relais et **redécoupe physiquement ce classeur en plusieurs
fichiers séparés**, selon leur rôle :

1. les blocs de **démarrage** (le point d'entrée, quelques utilitaires DOM)
   restent dans un `ao3-helper.user.js` allégé ;
2. les blocs du **panneau de réglages** partent dans
   `ao3-helper.panel.js` ;
3. tous les autres blocs (les 38 modules) partent dans
   `ao3-helper.modules.js` ;
4. en plus de ce découpage, le script fabrique **une quatrième version**,
   `ao3-helper-tampermonkey.user.js`, qui est une copie du classeur complet
   *sans découpage*, avec juste une petite étiquette ajoutée
   (`globalThis.__AO3H_INLINE_BUNDLES__ = true`) qui dit « tout est déjà là,
   pas besoin d'aller chercher les autres morceaux ailleurs ».

Pourquoi se donner tout ce mal plutôt que de garder un seul gros fichier ?
**Pour la vitesse.** Le panneau de réglages ne s'ouvre pas à chaque visite :
inutile de faire télécharger son code à chaque page. Voir le détail complet
dans la [section 9](#9-le-dossier-dist--le-produit-fini).

### `build-local.mjs` et `serve-dist.mjs` — la paire pour tester en local

Ces deux scripts vont toujours ensemble et servent à une seule situation :
**tester une version du script qui n'a pas encore été mise en ligne
quelque part**, directement sur le vrai site AO3.

Rappel du problème : la version « légère » d'AO3 Helper
(`ao3-helper.user.js`) ne contient pas tout — elle va chercher
`ao3-helper.modules.js` et `ao3-helper.panel.js` **à l'adresse depuis
laquelle elle a été installée**. Si le script n'a jamais été mis en ligne
nulle part, il ne sait pas où aller chercher ces morceaux manquants.

- **`serve-dist.mjs`** démarre un tout petit serveur web sur ta propre
  machine (`http://127.0.0.1:5195`) qui sert simplement le contenu du
  dossier `dist/`, exactement comme le ferait un vrai site d'hébergement. Il
  faut le laisser tourner dans un terminal pendant toute une session de
  test.
- **`build-local.mjs`** relance la fabrication complète (`vite build` puis
  `split-userscript.mjs`), mais en indiquant en plus au build : « l'adresse
  où les modules/panel seront servis, c'est justement ce serveur local ».
  Cette adresse est gravée dans le fichier final grâce au réglage
  `__AO3H_BUILD_ASSET_BASE__` de `vite.config.js`.

Résultat : en installant `http://127.0.0.1:5195/ao3-helper.user.js` dans
Tampermonkey (en indiquant une **adresse**, pas en collant le contenu du
fichier — sinon Tampermonkey ne saurait pas où revérifier les mises à
jour), tu peux tester la vraie mécanique de chargement à la demande, en
local, avant même d'avoir publié quoi que ce soit. C'est exactement la
méthode décrite dans
[`docs/plan-tests-utilisatrice.md`](plan-tests-utilisatrice.md).

---

## 8. Le fichier `lib/utils/runtime-bundles.js` : le camion de livraison

Ce fichier est le pendant, côté navigateur, de `split-userscript.mjs`. Une
fois que le script léger a démarré, c'est lui qui sait aller chercher les
gros morceaux manquants (`ao3-helper.modules.js`, `ao3-helper.panel.js`)
quand ils sont nécessaires.

Il ne peut pas utiliser un simple `fetch(...)` classique, car les règles de
sécurité du navigateur (le CORS) l'en empêchent souvent pour des fichiers
hébergés ailleurs. Il utilise donc `GM_xmlhttpRequest`, une fonction
spéciale que Tampermonkey fournit et qui a le droit de contourner cette
limite. Une fois le texte du fichier récupéré, il le découpe en morceaux
`System.register(...)` (les mêmes onglets de classeur que dans la section
précédente) et les fait exécuter un par un.

Si tu regardes ce fichier ou `src/main.js`, tu croiseras des lignes
`console.log('[AO3H][diag] ...')`. Ce sont des **traces de débogage
temporaires**, posées le temps de comprendre un problème précis de
chargement de modules — pas une fonctionnalité du projet. Elles sont
commentées « à retirer une fois la cause trouvée » et ne doivent pas
t'inquiéter si tu les vois dans la console du navigateur pendant que le
sujet est encore ouvert.

---

## 9. Le dossier `dist/` : le produit fini

Après un `npm run build`, ce dossier contient exactement quatre fichiers.
Aucun n'est écrit à la main ; tous les quatre sont regénérés par la chaîne
Vite → `split-userscript.mjs` décrite plus haut.

| Fichier | Taille approx. | Rôle |
|---|---|---|
| `ao3-helper.user.js` | ~100 Ko | La version « légère » à installer par **adresse**. Contient seulement le démarrage ; télécharge le reste à la demande via `runtime-bundles.js`. |
| `ao3-helper.modules.js` | ~1 Mo | Les 38 modules de fonctionnalités, dans un fichier à part, téléchargé une fois par le script léger. |
| `ao3-helper.panel.js` | ~460 Ko | Le panneau de réglages complet, téléchargé uniquement la première fois qu'on clique pour l'ouvrir. |
| `ao3-helper-tampermonkey.user.js` | ~1,6 Mo | La version « tout-en-un », autonome. Tout est déjà dedans, rien à télécharger ensuite. À installer en **glissant le fichier** dans Tampermonkey. |

**Pourquoi deux façons d'installer le même script ?** C'est un compromis
entre simplicité et rapidité :
- la version tout-en-un (`ao3-helper-tampermonkey.user.js`) est la plus
  simple pour une utilisatrice normale : un seul fichier à glisser dans
  Tampermonkey, ça marche immédiatement, sans dépendre d'un serveur qui
  doit rester en ligne. C'est celle recommandée dans le `README.md`. Elle
  est juste plus lourde à télécharger la toute première fois.
- la version légère + ses deux compagnons est pensée pour être **hébergée
  en ligne** (par exemple sur GitHub) : Tampermonkey peut alors vérifier
  automatiquement les mises à jour, et surtout, le panneau de réglages
  (460 Ko) n'est téléchargé que par les personnes qui l'ouvrent
  réellement.

Chaque fichier commence par un bloc de texte spécial :

```
// ==UserScript==
// @name         AO3 Helper
// @match        https://archiveofourown.org/*
// @run-at       document-start
// ...
// ==/UserScript==
```

C'est la **carte d'identité** que Tampermonkey lit en premier : sur quels
sites lancer le script, à quel moment, avec quelles autorisations spéciales
(`@grant`, comme le droit d'utiliser `GM_xmlhttpRequest`). Juste après vient
le code JavaScript lui-même — illisible à l'œil nu, car **minifié**
(compressé au maximum, sans espaces ni noms de variables lisibles, pour
peser le moins d'octets possible).

---

## 10. Comment on vérifie que tout marche

Le projet se vérifie de **trois façons différentes**, qui ne servent pas au
même but.

### a) Les tests automatiques unitaires (Vitest)

Chaque fichier important a un fichier jumeau `.test.js` à côté de lui. Ce
sont des petits programmes qui appellent une fonction avec une entrée
connue et vérifient que la sortie est bien celle attendue — comme vérifier
qu'une calculette donne bien 4 quand on tape 2+2. La commande `npm test`
lance tous ces fichiers d'un coup (avec l'outil **Vitest**, dans un faux
navigateur appelé **happy-dom**, beaucoup plus rapide qu'un vrai
navigateur). C'est la vérification la plus fine et la plus rapide : elle
tourne en quelques secondes et détecte immédiatement si un changement a
cassé quelque chose ailleurs.

### b) Les tests de bout en bout (`tests/e2e/` + `ao3-mock/`)

Les tests unitaires vérifient des petits bouts isolés. Les scripts dans
`tests/e2e/` (lancés par `npm run test:e2e`) vérifient quelque chose de plus
large : est-ce que le menu apparaît vraiment, est-ce que les bons modules se
chargent vraiment sur la bonne page ? Comme on ne veut pas dépendre
d'Internet ni du vrai site AO3 (qui peut changer, être lent, ou nécessiter
une connexion) pour ces vérifications automatiques, le dossier
**`ao3-mock/`** contient des copies figées de vraies pages AO3
(`home.html`, `work-complete.html`, `listings.html`, `bookmarks.html`,
`dashboard.html`...). Ce sont des doublures d'entraînement, comme des
mannequins de crash-test : elles ont exactement la même forme HTML qu'une
vraie page AO3, mais elles ne changent jamais et ne nécessitent aucune
connexion.

### c) Le plan de test manuel (`docs/plan-tests-utilisatrice.md`)

Les deux méthodes précédentes sont lancées par un ordinateur. Mais certaines
choses ne peuvent être jugées que par un vrai regard humain, sur le vrai
site (une couleur est-elle agréable ? un texte reste-t-il lisible ? une
fonctionnalité surprend-elle désagréablement ?). Le fichier
[`docs/plan-tests-utilisatrice.md`](plan-tests-utilisatrice.md) est une
longue liste de vérifications **à faire à la main**, module par module, en
suivant un ordre précis, directement sur `archiveofourown.org`, sans jamais
toucher au code ni à la console. C'est le seul des trois qui utilise le
build local décrit en section 7 (`npm run build:local` + `npm run
serve:dist`).

### `npm run typecheck`

Une quatrième vérification, différente des tests : elle ne fait tourner
aucun code, elle relit tous les fichiers et vérifie la cohérence des types
de données (voir la description de `tsconfig.json` en section 3). Elle peut
détecter des erreurs qu'aucun test n'aurait pensé à couvrir.

**Les quatre commandes `build`, `test`, `typecheck` et `test:e2e` doivent
toutes rester vertes avant tout commit** — c'est la règle affichée dans le
`README.md`.

---

## 11. Les commandes npm en un coup d'œil

Toutes ces commandes se lancent depuis la racine du projet, avec
`npm run <nom>` (sauf `npm test`, qui n'a pas besoin de `run`).

| Commande | Ce qu'elle fait |
|---|---|
| `npm install` | Télécharge tous les outils nécessaires (à faire une seule fois, ou après un changement de `package.json`). |
| `npm run build` | Fabrique les 4 fichiers de `dist/` prêts à être publiés (voir section 9). |
| `npm run dev` | Comme `build`, mais reste actif et refabrique automatiquement à chaque sauvegarde de fichier. Pratique pendant qu'on code, mais ne fait *que* la partie Vite (pas le découpage `split-userscript.mjs`). |
| `npm run build:local` | Fabrique `dist/` en pointant les modules/panel vers ton propre ordinateur, pour tester en conditions réelles sans rien publier (voir section 7). |
| `npm run serve:dist` | Démarre le petit serveur local qui sert `dist/`, à utiliser avec la commande précédente. |
| `npm test` | Lance tous les tests unitaires une fois. |
| `npm run test:watch` | Comme `npm test`, mais reste actif et relance les tests concernés à chaque sauvegarde. |
| `npm run test:ui` | Ouvre une interface visuelle dans le navigateur pour explorer les résultats des tests. |
| `npm run test:coverage` | Lance les tests et calcule quel pourcentage du code est vérifié par au moins un test. |
| `npm run test:e2e` | Lance les scripts de test de bout en bout contre les pages `ao3-mock/`. |
| `npm run typecheck` | Vérifie la cohérence des types dans tout le code, sans rien exécuter. |
| `npm run preview` | Ouvre un aperçu local du résultat de build via Vite (outil générique, distinct de `serve:dist`). |

---

## 12. Le grand voyage : que se passe-t-il quand tu ouvres une page AO3 ?

Pour relier tout ce qui précède, voici, dans l'ordre, tout ce qui se passe
entre le moment où tu tapes l'adresse d'AO3 et le moment où le panneau de
réglages s'ouvre.

1. **Tampermonkey** voit que l'adresse correspond à
   `https://archiveofourown.org/*` (le `@match` de l'en-tête du script) et
   injecte le contenu de `ao3-helper.user.js` (ou la version tout-en-un)
   **avant** que la page ne s'affiche (`@run-at document-start`).
2. Le petit moteur **SystemJS** inclus démarre et exécute le tout premier
   bloc de code : celui produit par `src/main.js`.
3. `src/main.js` pose immédiatement les styles CSS de base, puis démarre le
   noyau (`core/coordinator.js`, qui s'appuie sur `core/lifecycle.js`) et le
   menu déroulant.
4. Une fois que la page a fini de charger (`DOMContentLoaded`), `main.js`
   déclenche `loadFeatureModules()` : si la version installée est la version
   « légère », c'est à ce moment que `lib/utils/runtime-bundles.js` va
   chercher `ao3-helper.modules.js` (voir section 8). Avec la version
   tout-en-un, cette étape ne fait rien de plus : tout est déjà présent.
5. `src/modules.js` regarde l'adresse de la page actuelle et la liste des
   modules activés, et ne déclenche l'import réel que des modules
   pertinents ici et maintenant (section 4.3).
6. Chaque module importé appelle `register(...)` sur `core/lifecycle.js`
   pour s'inscrire, puis `Modules.bootAll()` (déclenché par
   `core/module-loader.js`) appelle sa fonction de démarrage. Si ce module a
   des sous-fonctionnalités enfants activées, elles démarrent juste après,
   en cascade.
7. La fonctionnalité modifie alors réellement la page : elle ajoute des
   boutons, cache des œuvres, colore des statistiques, etc.
8. **Le panneau de réglages, lui, n'est chargé par personne pour l'instant**
   — `lib/ui/panel/lazy-panel.js` attend patiemment. Ce n'est que si tu
   cliques pour ouvrir les réglages qu'il déclenche à son tour
   `runtime-bundles.js` pour aller chercher `ao3-helper.panel.js`, puis
   affiche l'interface avec ses onglets et ses cases à cocher.
9. Si tu changes un réglage dans ce panneau, l'évènement remonte jusqu'à
   `core/coordinator.js`, qui redémarre juste le module concerné
   (`Modules.restartOne`) pour appliquer le changement tout de suite, sans
   recharger la page.

---

## 13. Petit lexique

- **Userscript** — un petit script qu'on installe dans une extension comme
  Tampermonkey, pas une application indépendante.
- **Tampermonkey** — l'extension de navigateur qui exécute les userscripts.
- **Bundler / build** — l'opération qui transforme des centaines de petits
  fichiers source en un (ou plusieurs) fichier(s) final/finaux prêt(s) à
  l'emploi. Ici, l'outil s'appelle **Vite**.
- **Bundle** — le fichier final produit par le bundler (ici : les fichiers
  de `dist/`).
- **SystemJS** — le petit moteur qui permet à un userscript (un seul gros
  fichier) de se comporter comme s'il contenait plusieurs fichiers séparés
  qui peuvent s'importer entre eux.
- **Minifié** — du code rendu illisible pour un humain (noms raccourcis,
  espaces retirés) afin de peser le moins d'octets possible.
- **JSDoc** — des commentaires spéciaux au-dessus d'une fonction JavaScript
  qui décrivent ses types de données, pour que `tsc --noEmit` puisse les
  vérifier sans avoir besoin de convertir le projet en vrai TypeScript.
- **DOM** — la représentation de la page web que le navigateur construit à
  partir du HTML, et que le script peut lire ou modifier.
- **Coordinateur** — le fichier « chef d'équipe » d'un module (préfixé `_`
  quand le module a plusieurs pièces).
- **Sous-module** — une pièce autonome à l'intérieur d'un module, qui
  pourrait presque fonctionner seule.
- **`lib/`** — la boîte à outils commune à plusieurs modules.
- **Flag** — un interrupteur activé/désactivé (typiquement : « ce module
  est-il allumé ? »).
- **`GM_*` (`GM_getValue`, `GM_setValue`, `GM_xmlhttpRequest`...)** — les
  fonctions spéciales fournies par Tampermonkey, avec des pouvoirs qu'un
  site web normal n'a pas (stockage propre au script, requêtes réseau qui
  contournent certaines limites de sécurité du navigateur).

---

## 14. Où trouver le reste de la documentation

- [`README.md`](../README.md) — installation et commandes de base.
- [`architecture.md`](../architecture.md) — le règlement précis de
  rangement du code (à lire si tu écris ou déplaces du code).
- [`docs/misc.md`](misc.md) — un inventaire fichier par fichier de
  `src/modules/` et `lib/` (une liste brute, complémentaire de ce guide qui,
  lui, explique le *pourquoi*).
- [`docs/never-built-modules.md`](never-built-modules.md) — les idées de
  fonctionnalités envisagées puis volontairement écartées, avec leurs
  raisons.
- [`docs/plan-tests-utilisatrice.md`](plan-tests-utilisatrice.md) — le plan
  de test manuel complet, module par module.
- Le fichier `.md` **à côté du code de chaque module** (par exemple
  `src/modules/browse/hideByTags/hideByTags.md`) — le détail complet d'un
  module précis : ses réglages, ses choix de conception, ce qui a été
  testé.

---

## 15. Résumé ultra-rapide (pense-bête)

- `src/main.js` → premier fichier exécuté.
- `src/core/` → le moteur qui démarre/arrête les modules.
- `src/modules.js` → décide quels modules charger, sur quelle page.
- `src/modules/<catégorie>/<module>/` → les 38 fonctionnalités.
- `lib/` → la boîte à outils commune (AO3, stockage, interface, styles,
  thèmes, utilitaires).
- `scripts/` → les robots qui fabriquent (`split-userscript.mjs`) et testent
  en local (`build-local.mjs` + `serve-dist.mjs`) le produit fini.
- `dist/` → les 4 fichiers finaux, jamais modifiés à la main.
- `tests/` + `ao3-mock/` → vérifications automatiques.
- `docs/plan-tests-utilisatrice.md` → vérifications humaines, sur le vrai
  site.
- `architecture.md` → les règles de rangement du code.
