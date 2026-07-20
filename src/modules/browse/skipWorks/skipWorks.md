# skipWorks

**Tab:** Browse

## À quoi ça sert

Ce module permet de cacher manuellement une fic précise depuis les listes,
avec une note optionnelle pour expliquer pourquoi ("crossover", "déjà
lu"...). Contrairement à `hideByTags`, qui cache selon les tags, ici on
cible une fic à la fois, avec un bouton "Hide".

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `displayMode` | `dim` | Comment afficher une fic cachée : `block` (bloc gris), `banner` (compact, une ligne), `dim` (fic visible mais atténuée), `note` (fic intacte, juste annotée), ou `remove` (suppression complète) |
| `confirmBeforeHide` | désactivé | Demande confirmation avant de cacher via le raccourci clavier (Shift/Alt/Ctrl-clic) uniquement |
| `hideButtonText` | `Hide` | Le texte affiché sur le bouton de masquage |
| `hideButtonPosition` | `title` | Où placer le bouton : `title` (près du titre) ou `bottom` (en bas du blurb, après les statistiques) |

Les raisons rapides proposées dans la petite fenêtre, ainsi que la liste
des fics cachées, se gèrent depuis le panneau de configuration.

## Fichiers

### `skipWorks.js` — le coordinateur du module

- Ajoute un bouton "Hide" (texte et position personnalisables) sur chaque fic d'une liste, ainsi qu'un petit bouton "📝" pour ajouter une note privée sans cacher la fic
- Un clic ouvre une petite fenêtre avec des raisons rapides déjà prêtes (personnalisables), plus un champ de texte libre
- Une fic cachée s'affiche selon l'un des 5 styles (`skipWorks.js`), avec des boutons "Show" (révéler temporairement), "Edit" (changer la note) et "Unhide" (démasquer pour de bon) — sauf le style "note", qui n'a pas de "Show" puisque rien n'est réellement caché
- Garde en mémoire la liste des fics cachées, séparément pour chaque compte utilisateur
- Permet d'exporter ou d'importer cette liste dans un fichier, et synchronise automatiquement entre appareils via un miroir `localStorage` que le module `backupAndSync` récupère tout seul (`skipWorks.js`)

### `skipWorks.css`

- Les styles visuels des boutons, des différents styles de barre de masquage, du badge de note privée, de la fenêtre de choix et du panneau de réglages

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Chercher une fic cachée par son titre ou son auteur dans la liste — il n'y a pas de barre de recherche~~ ✅
  Ajout d'une barre de recherche dans le panneau, au-dessus de la liste des fics cachées.
  Elle filtre par titre, auteur, note ou identifiant/numéro d'œuvre (`filterHiddenWorks` dans
  `lib/ui/panel/configs/browse/skipWorks-config.js`, avec ses tests dans le fichier voisin).
  Comme le titre et l'auteur n'étaient pas enregistrés avant, `skipWorks.js` les capture
  maintenant depuis le blurb au moment du masquage (`skipWorks.js` → `extractWorkMeta`) et les
  stocke dans IndexedDB à côté de la note ; les entrées masquées avant cette mise à jour restent
  cherchables par note/id (repli sur "Work #12345" à l'affichage). L'import JSON préserve aussi
  ces champs s'ils sont présents dans le fichier importé.
- Reconnaître toute seule les fics qui ont des notes d'auteur — *déplacé vers "Explicitement écarté" : voir plus bas.*
- ~~Garder la liste des fics cachées synchronisée automatiquement entre plusieurs appareils~~ ✅
  `skipWorks` stocke ses données dans IndexedDB, mais `backupAndSync` ne sait lire que des clés
  `localStorage` contenant "ao3h" (aucun mécanisme d'enregistrement générique, aucun support
  IndexedDB — vérifié dans son code). Plutôt que de faire dépendre `skipWorks` de
  `backupAndSync` (les modules de ce projet restent indépendants les uns des autres),
  `skipWorks` recopie sa liste dans une clé `localStorage` miroir à chaque changement
  (`skipWorks.js`) ; `backupAndSync` la récupère automatiquement dans ses sauvegardes
  et sa synchro cloud, sans aucune modification de son côté. Au chargement de la page, le miroir
  est fusionné avec IndexedDB (le plus récent gagne, par `updatedAt`) — voir `reconcileWithMirror()`.
- ~~Pouvoir double-cliquer sur une fic cachée pour la remontrer tout de suite~~ ✅
  Un double-clic n'importe où sur la barre grise "Hidden: ..." (sauf sur les boutons Edit/Show/
  Unhide, qui gardent leur propre comportement au simple clic) révèle la fic temporairement,
  exactement comme le bouton Show. Le hit-test est dans `skipWorks.js`
  (`isHideBarRevealTarget`, avec ses tests) ; un `title="Double-click to reveal"` + curseur
  pointer sur la zone signalent la fonctionnalité.
- Cacher automatiquement des fics selon des mots-clés — *déplacé vers "Explicitement écarté" : voir plus bas.*
- ~~Avoir plusieurs styles différents pour afficher la raison d'un masquage~~ ✅
  5 styles au lieu de 2 : `block` (bloc gris, inchangé), `banner` (même chose en compact, une
  ligne), `dim` (la fic reste visible mais atténuée, la barre apparaît en dessous), `note` (la
  fic reste intacte, juste annotée — pas de bouton Show puisque rien n'est masqué), et `remove`
  (inchangé). Logique de résolution dans `skipWorks.js`, avec ses tests.
  `reapplyDisplayMode()` a aussi été généralisé pour gérer tous les changements de style à la
  volée (avant : seulement `block ↔ remove`).
- ~~Choisir où placer le bouton "Hide" ou changer son texte~~ ✅
  Réglages `hideButtonText` (texte libre) et `hideButtonPosition` (`title` près du titre, ou
  `bottom` après les statistiques, ancré sur `dl.stats` — le même point d'ancrage que
  `laterShelf` utilise déjà pour ses propres ajouts). Logique dans `skipWorks.js`.
  **Pas fait** : "près des actions Bookmark/Mark for Later" et "dans un menu d'actions" — voir
  "Explicitement écarté".
- ~~Demander une confirmation avant de cacher une fic~~ ✅
  Réglage `confirmBeforeHide` (décoché par défaut) dans le panneau. Ne s'applique qu'au
  raccourci clavier (Shift/Alt/Ctrl-clic) qui saute le popup de raison — choisir une raison
  dans le popup compte déjà comme une confirmation, donc ce cas-là n'en redemande pas une.
- Des règles automatiques qui cachent une fic toute seule — *déplacé vers "Explicitement écarté" : voir plus bas (fait double emploi avec `hideByTags`).*
- ~~Écrire une note privée sur une fic sans la cacher~~ ✅
  Petit bouton "📝" à côté de "Hide" sur chaque fic : ouvre le même picker, mais enregistre
  `isHidden:false` avec un marqueur `isStandaloneNote:true` dédié (`skipWorks.js`).
  Ce marqueur explicite était nécessaire : Unhide garde volontairement la note d'un ancien
  masquage (pour un re-masquage rapide via le raccourci clavier), donc "isHidden:false + une
  note" seul aurait fait apparaître le badge 📝 sur toutes les fics démasquées par le passé, pas
  seulement celles où l'utilisateur a explicitement demandé une note. Une section "Private
  Notes" dédiée dans le panneau liste ces notes avec un bouton pour les retirer.
- Surligner des passages ou poser des petits marque-pages — *déjà tranché plus bas dans "Décisions de conception" (Outils de lecture séparés) : hors de portée de ce module.*

## Explicitement écarté

- Avoir une liste figée de raisons de masquage toutes prêtes, plutôt que des raisons personnalisables — jugé trop restrictif pour convenir à tout le monde
- Pouvoir cacher plusieurs fics d'un coup avec une seule action groupée — abandonné
- Fusionner ce module avec `hideByTags` — refusé explicitement : les buts sont trop différents, ici le masquage est manuel et volontaire, alors que `hideByTags` cache automatiquement selon des critères
- Reconnaître automatiquement les fics avec une note d'auteur — les notes d'auteur (début/fin de fic) n'apparaissent pas dans le HTML des pages de listing, seulement sur la page de l'œuvre elle-même ; il faudrait charger chaque page d'œuvre juste pour vérifier, ce qui est coûteux en requêtes et s'apparente à du scraping systématique — hors de portée pour ce module
- Masquage automatique par mots-clés, et règles automatiques par tag/auteur/fandom/relation — ce module existe précisément pour le masquage **manuel et volontaire**, œuvre par œuvre (voir "Masquage manuel comme responsabilité principale" plus bas) ; le masquage automatique par mots-clés existe déjà dans `hideByTags` (NOPE Words) et par tag dans `hideByTags` (Hidden Tags) — dupliquer cette logique ici irait à l'encontre de la séparation des responsabilités déjà actée avec `hideByTags`
- Bouton "Hide" placé près des actions Bookmark/Mark for Later, ou dans un menu d'actions — AO3 n'affiche ces boutons qu'aux utilisateurs connectés et notre environnement de test (mock) ne les reproduit pas, donc aucun sélecteur fiable n'a pu être identifié ni vérifié ; `title` (près du titre) et `bottom` (après `dl.stats`, un point d'ancrage déjà éprouvé ailleurs dans le code) couvrent déjà le besoin sans risquer un bouton qui disparaît silencieusement sur certaines pages

## Détails techniques

Stockage : IndexedDB, une base par compte AO3 (`ao3h-hiddenWorksDB-[username]`),
observée par `MutationObserver` pour réappliquer boutons/état quand la liste
se met à jour (pagination, AJAX). Migrations prises en charge automatiquement :
l'ancienne clé `localStorage` `ao3HiddenWorks` (pré-IndexedDB) et l'ancienne
base partagée `ao3h-hiddenWorksDB` (pré-séparation par compte) sont
transférées vers la base actuelle.

Champs enregistrés par œuvre : `workId`, `isHidden`, `reason` (la note),
`title`/`author` (capturés au moment de l'action, pour la recherche et
l'affichage dans le panneau), `isStandaloneNote` (distingue une note
volontaire via le bouton 📝 d'un reliquat de note gardé après un Unhide),
et `updatedAt` (utilisé pour résoudre les conflits lors de la fusion avec
le miroir `localStorage` de `skipWorks.js`). Les raisons rapides
prédéfinies sont enregistrées séparément, en `localStorage` simple.

APIs utilisées : `IndexedDB`, `localStorage` (migration + miroir de sync),
`MutationObserver`.
