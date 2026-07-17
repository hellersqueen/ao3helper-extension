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
- Une fic cachée s'affiche selon l'un des 5 styles (`skipWorksHelpers.js`), avec des boutons "Show" (révéler temporairement), "Edit" (changer la note) et "Unhide" (démasquer pour de bon) — sauf le style "note", qui n'a pas de "Show" puisque rien n'est réellement caché
- Garde en mémoire la liste des fics cachées, séparément pour chaque compte utilisateur
- Permet d'exporter ou d'importer cette liste dans un fichier, et synchronise automatiquement entre appareils via un miroir `localStorage` que le module `backupAndSync` récupère tout seul (`hiddenWorksMirror.js`)

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
  maintenant depuis le blurb au moment du masquage (`skipWorksHelpers.js` → `extractWorkMeta`) et les
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
  (`hiddenWorksMirror.js`) ; `backupAndSync` la récupère automatiquement dans ses sauvegardes
  et sa synchro cloud, sans aucune modification de son côté. Au chargement de la page, le miroir
  est fusionné avec IndexedDB (le plus récent gagne, par `updatedAt`) — voir `reconcileWithMirror()`.
- ~~Pouvoir double-cliquer sur une fic cachée pour la remontrer tout de suite~~ ✅
  Un double-clic n'importe où sur la barre grise "Hidden: ..." (sauf sur les boutons Edit/Show/
  Unhide, qui gardent leur propre comportement au simple clic) révèle la fic temporairement,
  exactement comme le bouton Show. Le hit-test est dans `skipWorksHelpers.js`
  (`isHideBarRevealTarget`, avec ses tests) ; un `title="Double-click to reveal"` + curseur
  pointer sur la zone signalent la fonctionnalité.
- Cacher automatiquement des fics selon des mots-clés — *déplacé vers "Explicitement écarté" : voir plus bas.*
- ~~Avoir plusieurs styles différents pour afficher la raison d'un masquage~~ ✅
  5 styles au lieu de 2 : `block` (bloc gris, inchangé), `banner` (même chose en compact, une
  ligne), `dim` (la fic reste visible mais atténuée, la barre apparaît en dessous), `note` (la
  fic reste intacte, juste annotée — pas de bouton Show puisque rien n'est masqué), et `remove`
  (inchangé). Logique de résolution dans `skipWorksHelpers.js`, avec ses tests.
  `reapplyDisplayMode()` a aussi été généralisé pour gérer tous les changements de style à la
  volée (avant : seulement `block ↔ remove`).
- ~~Choisir où placer le bouton "Hide" ou changer son texte~~ ✅
  Réglages `hideButtonText` (texte libre) et `hideButtonPosition` (`title` près du titre, ou
  `bottom` après les statistiques, ancré sur `dl.stats` — le même point d'ancrage que
  `laterShelf` utilise déjà pour ses propres ajouts). Logique dans `skipWorksHelpers.js`.
  **Pas fait** : "près des actions Bookmark/Mark for Later" et "dans un menu d'actions" — voir
  "Explicitement écarté".
- ~~Demander une confirmation avant de cacher une fic~~ ✅
  Réglage `confirmBeforeHide` (décoché par défaut) dans le panneau. Ne s'applique qu'au
  raccourci clavier (Shift/Alt/Ctrl-clic) qui saute le popup de raison — choisir une raison
  dans le popup compte déjà comme une confirmation, donc ce cas-là n'en redemande pas une.
- Des règles automatiques qui cachent une fic toute seule — *déplacé vers "Explicitement écarté" : voir plus bas (fait double emploi avec `hideByTags`).*
- ~~Écrire une note privée sur une fic sans la cacher~~ ✅
  Petit bouton "📝" à côté de "Hide" sur chaque fic : ouvre le même picker, mais enregistre
  `isHidden:false` avec un marqueur `isStandaloneNote:true` dédié (`skipWorksHelpers.js`).
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



AO3 Helper - Skip Works
    Module ID: skipWorks

    - Feature: Hide button
      - Option: Injects a "Hide" button on each work blurb in listing pages

    - Feature: Note prompt
      - Option: Opens a centered picker on hide (quick-tag chips + freetext input)
      - Option: Quick-tag chips are user-configurable and stored per-user
      - Option: Modifier key (Shift/Alt/Ctrl) skips picker and re-uses stored note

    - Feature: Hidden work display (two modes)
      - Option: Grey block — replaces blurb with note + Show / Edit / Unhide buttons
      - Option: Remove completely — blurb is hidden entirely (display:none)
      - Option: Live re-apply when displayMode setting changes in the panel

    - Feature: Blurb actions
      - Option: Show — temporary in-page reveal (not persisted, clears on reload)
      - Option: Unhide — permanent (resets isHidden flag in DB)
      - Option: Edit — re-opens picker to change the note while staying hidden

    - Feature: Persistence (IndexedDB, per-user)
      - Option: Per-user database (ao3h-hiddenWorksDB-[username])
      - Option: Re-applies hidden state on every page load
      - Option: Observer re-applies Hide buttons when list updates (AJAX / pagination)

    - Feature: Migrations
      - Option: Legacy: localStorage (ao3HiddenWorks) → IndexedDB
      - Option: Shared DB (ao3h-hiddenWorksDB) → per-user DB

    - Feature: Export / Import
      - Option: Export hidden works list as JSON file
      - Option: Import hidden works from JSON file

    - Feature: Config panel (skipWorks-config.js)
      - Option: Display mode toggle (grey block / remove)
      - Option: Quick Note Presets manager (add / remove chips)
      - Option: Skipped Works List with Unhide per entry
      - Option: Clear All, Export (JSON), Import (JSON) buttons



═══════════════════════════════════════════════════════════════════════════      
  # skipWorks
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Skip Works** permet de masquer manuellement une œuvre précise depuis les listes AO3. Contrairement à `hideByTags`, qui masque automatiquement les œuvres selon leurs tags ou leur contenu, `skipWorks` fonctionne œuvre par œuvre. L’utilisateur choisit volontairement de masquer une fic et peut enregistrer une note privée pour expliquer cette décision.

* Exemples de raisons :
  - crossover ;
  - déjà lu ;
  - abandonné ;
  - ne m’intéresse pas ;
  - raison personnalisée.

Une œuvre masquée peut être atténuée avec sa note visible ou être complètement retirée de la page.

---

# Réglages utilisateur

| Réglage       | Description                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `displayMode` | Détermine si une œuvre masquée apparaît sous forme de bloc gris avec sa note ou disparaît complètement. |

Les raisons rapides proposées dans la fenêtre de masquage sont personnalisables depuis le panneau de configuration.

La liste des œuvres masquées est également accessible depuis ce panneau.

---

# Structure du module

⚠️ Cette section et les suivantes (jusqu'à "Décisions de conception") décrivent l'état du
module avant Chantier 4 — `skipWorks.js` reste le coordinateur central, mais plusieurs bouts de
logique testable en ont depuis été extraits dans des fichiers séparés (voir "Fichiers" et
"Réglages utilisateur" en haut de ce document, à jour).

```text
skipWorks.js
skipWorks.css
skipWorksHelpers.js
hiddenWorksMirror.js
```

---

# skipWorks.js

## Rôle

Contient l’ensemble des fonctionnalités du module.

Il gère :

* l’ajout du bouton de masquage ;
* la saisie des notes ;
* l’affichage des œuvres masquées ;
* les actions de révélation, de modification et de démasquage ;
* le stockage des données ;
* les migrations ;
* l’importation et l’exportation ;
* l’intégration avec le panneau de configuration.

---

## Fonctionnalités

### Bouton de masquage

Le module ajoute un bouton **Hide** sur chaque œuvre affichée dans une liste AO3.

Ce bouton permet de masquer manuellement l’œuvre concernée.

Le module réinjecte automatiquement les boutons lorsque la liste est mise à jour dynamiquement, notamment lors :

* des changements de pagination ;
* des mises à jour AJAX ;
* de l’ajout de nouveaux blurbs dans la page.

---

### Fenêtre de sélection de la raison

Un clic sur le bouton **Hide** ouvre une fenêtre centrée.

Cette fenêtre contient :

* des raisons rapides présentées sous forme de boutons ;
* un champ de texte libre ;
* les commandes permettant de confirmer ou d’annuler le masquage.

Les raisons rapides sont personnalisables et enregistrées séparément pour chaque utilisateur.

---

### Raisons rapides

L’utilisateur peut gérer ses propres raisons prédéfinies.

Il peut notamment :

* ajouter une raison ;
* supprimer une raison ;
* sélectionner rapidement une raison lors du masquage ;
* compléter la raison avec un texte personnalisé.

Le module ne dépend donc pas d’une liste fixe de raisons imposées.

---

### Raccourci avec touche modificatrice

L’utilisation d’une touche modificatrice lors du clic permet de masquer plus rapidement une œuvre.

Touches prises en charge :

* `Shift`
* `Alt`
* `Ctrl`

Lorsque l’une de ces touches est utilisée, le module :

* n’ouvre pas la fenêtre de sélection ;
* réutilise directement la note déjà enregistrée pour l’œuvre.

---

### Modes d’affichage

Le module propose deux modes d’affichage pour les œuvres masquées.

#### Bloc gris

L’œuvre originale est remplacée par un bloc atténué contenant :

* la note enregistrée ;
* un bouton **Show** ;
* un bouton **Edit** ;
* un bouton **Unhide**.

#### Suppression complète

L’œuvre est entièrement masquée avec :

```css
display: none;
```

Le mode utilisé dépend du réglage `displayMode`.

---

### Mise à jour immédiate du mode

Lorsque le réglage `displayMode` est modifié depuis le panneau, le module réapplique immédiatement le nouvel affichage aux œuvres présentes sur la page.

Il n’est pas nécessaire de recharger la page.

---

### Action Show

Le bouton **Show** révèle temporairement l’œuvre masquée.

Cette action :

* affiche de nouveau le blurb original ;
* ne modifie pas les données enregistrées ;
* ne retire pas l’œuvre de la liste des œuvres masquées ;
* est annulée au prochain rechargement de la page.

---

### Action Edit

Le bouton **Edit** permet de modifier la note associée à une œuvre masquée.

Cette action :

* rouvre la fenêtre de sélection ;
* affiche la note existante ;
* permet de choisir une autre raison rapide ;
* permet de modifier le texte libre ;
* conserve l’œuvre dans son état masqué.

---

### Action Unhide

Le bouton **Unhide** démasque définitivement l’œuvre.

Cette action :

* réinitialise son état `isHidden` dans la base de données ;
* restaure l’affichage normal du blurb ;
* retire l’œuvre de la liste active des œuvres masquées.

---

## Détails techniques

### Stockage par utilisateur

Les œuvres masquées sont enregistrées dans une base IndexedDB propre à chaque compte AO3.

Le nom de la base suit le format :

```text
ao3h-hiddenWorksDB-[username]
```

Cette séparation empêche les listes de plusieurs comptes AO3 de se mélanger sur le même navigateur.

---

### Données persistantes

Le module conserve notamment :

* l’identifiant de l’œuvre ;
* son état masqué ;
* la note enregistrée ;
* les informations nécessaires à son affichage dans le panneau.

Les œuvres masquées sont automatiquement reconnues et réappliquées à chaque chargement de page.

---

### Observation du contenu dynamique

Le module observe les changements apportés aux listes AO3.

Lorsqu’un nouveau blurb apparaît, il :

* ajoute le bouton **Hide** ;
* vérifie si l’œuvre est déjà masquée ;
* applique immédiatement son état enregistré.

---

### Migrations

Le module prend en charge la migration d’anciennes structures de stockage.

#### Migration depuis localStorage

Les données enregistrées sous l’ancienne clé :

```text
ao3HiddenWorks
```

peuvent être transférées vers IndexedDB.

#### Migration depuis la base partagée

Les données de l’ancienne base commune :

```text
ao3h-hiddenWorksDB
```

peuvent être transférées vers la nouvelle base propre à chaque utilisateur.

---

### Exportation

Le module permet d’exporter la liste des œuvres masquées dans un fichier JSON.

L’export contient les données nécessaires pour :

* conserver une copie de sauvegarde ;
* transférer la liste vers un autre navigateur ;
* restaurer les œuvres et leurs notes.

---

### Importation

Le module permet d’importer une liste précédemment exportée au format JSON.

Les données importées sont ajoutées à la base IndexedDB de l’utilisateur actuel.

---

### Panneau de configuration

Le fichier de configuration associé, `skipWorks-config.js`, fournit les contrôles suivants :

* choix du mode d’affichage ;
* gestion des raisons rapides ;
* ajout et suppression des raisons ;
* liste complète des œuvres masquées ;
* bouton **Unhide** pour chaque œuvre ;
* bouton **Clear All** ;
* bouton **Export JSON** ;
* bouton **Import JSON**.

---

## Dépendances

Le module fonctionne de manière autonome.

Il utilise toutefois le système général de configuration d’AO3 Helper pour afficher et modifier ses réglages depuis le panneau.

Il reste volontairement séparé de `hideByTags`, qui applique un masquage automatique selon des règles plutôt qu’un masquage manuel œuvre par œuvre.

---

# skipWorks.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Skip Works**.

Il définit notamment l’apparence :

* du bouton **Hide** ;
* de la fenêtre de sélection ;
* des raisons rapides ;
* du champ de note ;
* des œuvres atténuées ;
* des blocs affichant les notes ;
* des boutons **Show**, **Edit** et **Unhide** ;
* de la liste des œuvres masquées dans le panneau de configuration.



# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d’une implémentation complète.

---

## Gestion des œuvres masquées

### ~~Recherche dans la liste~~ ✅

Ajouté : une barre de recherche au-dessus de la liste des œuvres masquées, dans le panneau
de configuration. Elle filtre en direct (300 ms de debounce) sur :

* le titre de l’œuvre ;
* le nom de l’auteur ;
* le contenu de la note ;
* l’identifiant de l’œuvre (et son simple numéro).

Titre et auteur sont désormais capturés depuis le blurb au moment du clic sur **Hide** et
conservés dans IndexedDB à côté de la note, pour que la recherche et l'affichage de la liste
(qui montre maintenant le vrai titre + "by auteur" au lieu de juste "Work #12345") aient de
quoi travailler.

---

### ~~Synchronisation entre appareils~~ ✅

Ajouté via un miroir `localStorage` (`hiddenWorksMirror.js`) que le module `backupAndSync`
récupère automatiquement dans ses sauvegardes et sa synchronisation cloud, sans qu'aucune
modification n'ait été nécessaire côté `backupAndSync` (il scanne déjà toute clé `localStorage`
contenant "ao3h"). Au chargement de la page, `reconcileWithMirror()` fusionne le miroir avec
IndexedDB : pour chaque œuvre, la version la plus récente (`updatedAt`) l'emporte.

Préserve les œuvres masquées et leurs notes. **Ne préserve pas** les raisons rapides
(prédéfinies) — celles-ci restent `localStorage` simple, déjà couvertes par le scan générique
de `backupAndSync` sans besoin de miroir dédié.

---

### ~~Double-clic pour révéler~~ ✅

Ajouté : un double-clic sur la barre grise d'une œuvre masquée (en dehors des boutons
Edit/Show/Unhide) la révèle temporairement, exactement comme le bouton **Show** — sans
modifier son état enregistré.

---

### ~~Plusieurs styles d’affichage~~ ✅

Ajouté : `block` (bloc gris, inchangé), `banner` (bandeau compact, une ligne), `dim` (œuvre
atténuée sans remplacement complet du blurb — la barre apparaît en dessous), et `note` (petite
note, œuvre intacte, sans bouton Show puisque rien n'est masqué). "Icône avec infobulle" n'a pas
été retenu séparément : le style `banner` avec `title=` sur la raison tronquée en tient déjà lieu.
Logique de résolution dans `skipWorksHelpers.js`.

---

### ~~Confirmation avant le masquage~~ ✅

Ajouté : réglage `confirmBeforeHide` (case à cocher, décochée par défaut). Parmi les trois
usages envisagés, c'est le troisième qui a été retenu — **uniquement lors de l'utilisation
d'un raccourci clavier** (Shift/Alt/Ctrl-clic) — car c'est le seul chemin qui masque une œuvre
sans aucune autre étape intermédiaire ; choisir une raison dans le popup sert déjà de
confirmation implicite pour les autres masquages.

---

## Détection automatique

### Détection des notes d’auteur

> Déplacé vers "Décisions de conception" — les notes d'auteur n'apparaissent pas dans le HTML
> des pages de listing, seulement sur la page de l'œuvre elle-même.

---

### Masquage par mots-clés

> Déplacé vers "Décisions de conception" — cette fonctionnalité existe déjà dans `hideByTags`
> (NOPE Words) ; la dupliquer ici irait à l'encontre de la séparation des responsabilités entre
> les deux modules.

---

### Règles automatiques

> Déplacé vers "Décisions de conception" — même raison : `hideByTags` couvre déjà le masquage
> automatique par tag/auteur/fandom/relation/catégorie.

---

## Personnalisation

### ~~Position du bouton~~ ✅ *(scope réduit)*

Réglage `hideButtonPosition` : `title` (près du titre, inchangé) ou `bottom` (en bas du blurb,
ancré sur `dl.stats`). **Pas fait** : "près des actions Bookmark/Mark for Later" et "dans un
menu d'actions" — voir "Décisions de conception" (pas de sélecteur fiable disponible pour
tester/vérifier ces zones, qui ne s'affichent qu'aux utilisateurs connectés).

---

### ~~Texte du bouton~~ ✅

Réglage `hideButtonText`, champ libre (défaut "Hide").

---

## Notes indépendantes

### ~~Notes sans masquage~~ ✅

Petit bouton "📝" à côté de "Hide" : ouvre le même picker de raison, mais enregistre
`isHidden:false` avec un marqueur `isStandaloneNote:true` (`skipWorksHelpers.js`) qui distingue
explicitement une note volontaire d'un simple reliquat de note gardé après un Unhide. Une
section "Private Notes" du panneau liste ces œuvres avec un bouton pour retirer la note.

---

## Outils de lecture

### Surlignage de passages

Permettre de surligner certains passages dans le texte d’une œuvre pendant la lecture.

---

### Marque-pages internes

Permettre d’ajouter de petits marque-pages à des endroits précis dans une œuvre.

Ces outils dépassent toutefois la responsabilité principale du module et pourraient appartenir à un module de lecture séparé.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Raisons personnalisables

Le module n’utilise pas une liste fixe de raisons de masquage.

Cette approche a été écartée car une liste imposée serait trop restrictive pour convenir à tous les utilisateurs.

Les raisons rapides restent donc entièrement personnalisables.

---

## Absence de masquage groupé

Le module ne permet pas de masquer plusieurs œuvres en une seule action.

Cette fonctionnalité a été abandonnée afin de conserver un fonctionnement volontaire et précis, œuvre par œuvre.

---

## Séparation avec Hide By Tags

Le module ne sera pas fusionné avec `hideByTags`.

Les deux modules répondent à des besoins différents :

* **Skip Works** masque manuellement une œuvre précise avec une note personnelle.
* **Hide By Tags** masque automatiquement les œuvres selon des critères définis à l’avance.

Cette séparation permet de conserver des responsabilités claires.

---

## Masquage manuel comme responsabilité principale

Les systèmes de règles automatiques, de mots-clés et de détection par tags ne constituent pas la fonction centrale de ce module — et ne le deviendront pas.

Le masquage automatique par mots-clés existe déjà dans `hideByTags` (NOPE Words), et le masquage par tag existe déjà dans `hideByTags` (Hidden Tags). Dupliquer cette logique dans `skipWorks` créerait deux façons concurrentes de faire la même chose et irait à l'encontre de la séparation des responsabilités déjà actée dans "Séparation avec Hide By Tags" ci-dessus. Le comportement principal reste, et restera :

1. l’utilisateur choisit une œuvre ;
2. il clique sur **Hide** ;
3. il ajoute éventuellement une note ;
4. le module mémorise ce choix.

---

## Détection des notes d'auteur non implémentable ici

Reconnaître automatiquement les œuvres contenant une note d'auteur (au début ou à la fin) a été écarté.

Les notes d'auteur n'apparaissent dans le HTML que sur la page de l'œuvre elle-même — jamais sur les pages de listing où `skipWorks` s'exécute. Le seul moyen de savoir si une œuvre a une note serait de charger la page de chaque œuvre juste pour vérifier, ce qui multiplierait les requêtes réseau pour un simple badge et s'apparenterait à du scraping systématique de toutes les œuvres affichées.

---

## Bouton "Hide" limité à deux emplacements

Le bouton ne peut être placé qu'à deux endroits : près du titre (`title`, par défaut) ou en bas du blurb (`bottom`, ancré sur `dl.stats`).

"Près des actions Bookmark/Mark for Later" et "dans un menu d'actions" n'ont pas été implémentés : ces zones ne s'affichent qu'aux utilisateurs AO3 connectés, et l'environnement de test local (`ao3-mock/`) ne les reproduit pas. Sans sélecteur vérifiable, ajouter ces positions aurait risqué un bouton qui disparaît silencieusement sur certaines pages plutôt que d'échouer proprement.

---

## Outils de lecture séparés

Le surlignage de passages et les marque-pages internes ne font pas directement partie du masquage d’œuvres.

Ces fonctionnalités devraient idéalement appartenir à un module spécialisé dans la lecture et les annotations.


# Résumé des responsabilités du module

Le module **Skip Works** est responsable du masquage manuel des œuvres et de la gestion des notes personnelles qui leur sont associées.

Ses responsabilités sont réparties entre les fichiers suivants :

| Fichier         | Responsabilité principale                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `skipWorks.js`  | Coordinateur : masquage, notes, stockage, migrations, import/export et intégration avec le panneau de configuration. |
| `skipWorks.css` | Définit l'apparence de tous les éléments visuels du module.                                                                       |
| `skipWorksHelpers.js` | Fonctions pures : métadonnées du blurb, double-clic, style d'affichage, placement du bouton et notes autonomes. |
| `hiddenWorksMirror.js` | Fonctions pures : miroir `localStorage` pour la synchro entre appareils via `backupAndSync`, et fusion des listes en cas de conflit. |
| `lib/ui/panel/configs/browse/skipWorks-config.js` | Panneau de configuration (liste, notes privées, presets, recherche, import/export). |

---

# Interactions internes

Le module repose sur une logique unique regroupée dans `skipWorks.js`.

Ses différentes responsabilités restent clairement séparées :

* ajout des boutons **Hide** sur les œuvres ;
* affichage de la fenêtre de sélection des raisons ;
* gestion des raisons rapides ;
* gestion des notes personnalisées ;
* application des différents modes d'affichage ;
* gestion des actions **Show**, **Edit** et **Unhide** ;
* persistance des données dans IndexedDB ;
* migrations depuis les anciens systèmes de stockage ;
* importation et exportation des données ;
* intégration avec le panneau de configuration.

Toutes ces fonctionnalités sont centralisées dans un seul fichier afin de conserver un module autonome.

---

# Dépendances externes

Le module s'appuie principalement sur les APIs natives du navigateur.

## APIs utilisées

* `IndexedDB`
* `localStorage` (migration uniquement)
* `MutationObserver`

---

## Stockage

Les œuvres masquées sont enregistrées dans une base IndexedDB propre à chaque utilisateur AO3.

Nom de la base :

```text
ao3h-hiddenWorksDB-[username]
```

Anciennes structures prises en charge lors des migrations :

```text
ao3HiddenWorks
```

```text
ao3h-hiddenWorksDB
```

---

# Données enregistrées

Pour chaque œuvre, le module conserve notamment :

* l'identifiant de l'œuvre (`workId`) ;
* son état de masquage (`isHidden`) ;
* la note personnalisée (`reason`) ;
* le titre et l'auteur (`title`, `author`), capturés au moment de l'action pour la recherche et l'affichage dans le panneau ;
* un marqueur `isStandaloneNote` distinguant une note volontaire (bouton 📝) d'un reliquat de note gardé après un Unhide ;
* un horodatage `updatedAt`, utilisé pour résoudre les conflits lors de la fusion avec le miroir `localStorage` de synchronisation entre appareils.

Les raisons rapides sont également enregistrées séparément pour chaque utilisateur.

---

# Limites connues

Le module présente les limitations de conception suivantes — volontaires, voir "Décisions de conception" :

* les œuvres sont masquées uniquement après une action volontaire de l'utilisateur (pas de règles automatiques — voir "Masquage manuel comme responsabilité principale") ;
* le bouton "Hide" ne peut être placé qu'à deux emplacements (près du titre ou en bas du blurb) — pas près des actions Bookmark/Mark for Later, qui ne sont pas fiablement détectables ;
* la détection automatique des notes d'auteur n'est pas possible depuis les pages de listing (l'information n'y est pas présente).

Les limitations suivantes ont été résolues durant Chantier 4 : les notes peuvent désormais
exister indépendamment d'un masquage (bouton 📝), le texte du bouton "Hide" est personnalisable,
et la synchronisation entre appareils est disponible via `backupAndSync`.

