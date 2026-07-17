# filterManager

**Tab:** Browse

## À quoi ça sert

Ce module enrichit le formulaire de filtres d'AO3 (recherche, pages de
tags, favoris, collections) avec des presets réutilisables, des filtres
rapides et des alertes.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `starredPresetsFirst` | activé | Épingle les presets favoris en haut de la liste |
| `presetHoverPreview` | activé | Aperçu des filtres au survol d'un preset |
| `rememberLastPresetByFandom` | activé | Pré-sélectionne le dernier preset utilisé pour ce fandom |
| `showExpandPreset` | activé | Affiche le bouton "Edit as chips" à côté d'Apply |
| `selectedLanguages` | (toutes) | Les langues affichées |
| `showLanguageBadge` | désactivé | Affiche un badge de langue sur les fics |
| `clickBadgeToFilter` | activé | Un clic sur le badge de langue filtre par cette langue |
| `warnExcludedWarning` | activé | Affiche une bannière si un avertissement officiel est exclu |
| `excludeWarningRemoveButton` | activé | Bouton "Remove exclusion" dans la bannière |
| `tagBundlesEnabled` | désactivé | Active les groupes de tags équivalents |
| `useBuiltinTropeBundles` | activé | Utilise les groupes de tags déjà prêts (Slow Burn, Enemies to Lovers...) |
| `quickFilterOneshot` | activé | Bouton bascule "One-shots only" |
| `quickFilterCrossover` | activé | Bouton bascule "Hide crossovers" |
| `hideKudosed` | désactivé | Cache les fics déjà kudosées |
| `hideSubscribed` | désactivé | Cache les fics déjà suivies |
| `hideBookmarked` | désactivé | Cache les fics déjà en favoris |
| `hideMFL` | désactivé | Cache les fics déjà dans "à lire plus tard" |
| `hideReadSeries` | désactivé | Cache les séries entièrement lues |
| `showHiddenCount` | activé | Affiche le compteur de fics cachées par l'historique |
| `rememberFilters` | activé | Se souvient des filtres actifs d'une session à l'autre |
| `oneshotDefault` / `crossoverDefault` | `all` | Les filtres appliqués par défaut au chargement |

## Fichiers

### 1. `_filterManager.js` — le chef d'orchestre

- Met en route les cinq autres fichiers de fonctionnalités et partage une liste de "groupes" de tags

### 2. `presetManagement.js` — presets de filtres

- Permet de sauvegarder la combinaison actuelle de filtres (tags, note, avertissements, mots-clés, tri...) sous un nom, pour la réappliquer en un clic
- Une barre d'outils avec un menu déroulant et une étoile pour les favoris
- Un mode "Éditer en chips" pour retoucher un preset avant de lancer la recherche
- Des raccourcis clavier pour appliquer ou sauvegarder rapidement un preset
- Se souvient du dernier preset utilisé pour chaque fandom
- Import/export des presets dans un fichier
- Des groupes de tags qui regroupent plusieurs variantes d'un même tag (par exemple "Slow Burn" regroupe plusieurs tags proches)

### 3. `languageBadges.js` — badges de langue

- Ajoute un badge (drapeau + nom de langue) après le titre de chaque fic, seulement s'il y a plusieurs langues différentes sur la page
- Cliquable pour filtrer directement sur cette langue

### 4. `filterWarnings.js` — bannière d'exclusion d'avertissement

- Détecte si l'adresse de la page exclut un des avertissements officiels
- Affiche une bannière avec un bouton pour retirer facilement cette exclusion

### 5. `userHistoryFilters.js` — filtres par historique

- Cache les fics déjà kudosées, déjà suivies, déjà en favoris, déjà dans "à lire plus tard", ou faisant partie d'une série entièrement lue
- Affiche un compteur du nombre de fics cachées par ces filtres

### 6. `worksFilterManager.js` — filtres rapides

- Ajoute des boutons "1️⃣ One-shots only" et "🚫 Hide crossovers" pour filtrer rapidement les résultats sans recharger la page

### 7. `filterManager.css`

- Les styles visuels de la barre de presets, des badges, de la bannière et des filtres rapides

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Pouvoir renommer un preset déjà sauvegardé

- Cacher les fics qui ont très peu de tags

- Cacher les fics postées anonymement

- Un bouton pour cacher ou réduire une fic individuellement, une par une

- Un bouton "Résumé présent" pour ne garder que les fics qui ont un résumé

- Réduire (au lieu de cacher complètement) les fics filtrées par l'historique

- Un raccourci clavier pour cacher rapidement une fic

- Remplacer les boutons one-shot/crossover par un choix à trois options (tout / seulement ça / jamais ça) au lieu d'un simple bouton on-off

- Cacher automatiquement toutes les fics déjà lues, pas seulement les séries entièrement lues

- Une logique de filtre avancée avec des règles "et / ou / sauf si" combinées

- Un mode pour construire ses propres règles de filtre avec un système visuel, plus un mode de débogage

- Filtrer les fics selon leur ratio de kudos par rapport aux vues

- Filtrer par date (par exemple : mise à jour cette semaine)

- Cacher les fics abandonnées depuis plus d'un an

- Des statistiques sur les filtres qu'on utilise le plus souvent

- Un historique de recherche qui montre les filtres utilisés à chaque recherche, et permet de les récupérer

- Des badges visuels sur les fics one-shot dans la liste, en plus du bouton de filtre

- Exiger une longueur minimale pour le résumé, pas juste vérifier qu'il y en a un

- Organiser ses presets dans des dossiers ou des catégories, et les afficher sous forme de cartes visuelles (icône, nombre de tags, date de dernière utilisation)

- Synchroniser automatiquement ses presets de filtres entre plusieurs appareils

- Avertir avant même d'ouvrir une fic si elle contient des mots ou tags à risque, avec différents niveaux de gravité

- Étendre tous les filtres du module aux pages "Historique" et "Favoris", pas seulement aux pages de recherche et de tags

- Pouvoir régler la sensibilité de la bannière d'exclusion d'avertissement, et la fermer définitivement pour ne plus la revoir

- Un mode qui n'affiche le badge de langue que pour les langues qu'on ne préfère pas, au lieu de toutes les langues

- Revoir rapidement, type par type (kudos, abonnements, favoris...), les fics cachées par les filtres d'historique sans tout désactiver

- Pouvoir combiner deux presets de filtres pour en faire un seul d'un coup, plutôt que d'en appliquer un seul à la fois

---

~~- Garder des réglages de filtres différents selon le type de page (recherche, tags, favoris...) au lieu d'un seul réglage valable partout~~
~~- Chercher des mots-clés avec des règles compliquées (respecter les majuscules, chercher un morceau de mot, motifs spéciaux)~~
~~- Associer automatiquement des tags à un fandom précis pour tout le monde~~
~~- Filtrer par une plage de nombre de mots (un minimum ET un maximum), pas juste cacher les fics trop courtes~~
~~- Partager ses presets de filtres publiquement avec les autres, avec des votes~~
~~- Des suggestions automatiques de filtres à essayer~~
~~- Regrouper les filtres par thème (longueur, contenu, découverte...) avec des raccourcis~~
~~- Filtrer selon l'ordre dans lequel les tags apparaissent~~
~~- Créer, renommer ou gérer ses propres groupes de tags équivalents (en ce moment on peut juste les sauvegarder, pas les modifier avec des boutons)~~
~~- Un bouton pour surligner les mots qu'on ne veut pas voir dans les fics — *ça existe déjà, mais dans un autre module (`hideByTags`), pas ici*~~
~~- Cacher les fics dont l'histoire est terminée mais qu'on n'a pas encore lues (en plus de cacher juste les séries complètement lues)~~
~~- Deviner tout seul quels filtres te conviendraient, selon ton historique de lecture~~
~~- Programmer des filtres différents selon l'heure ou le jour~~
~~- Un réglage à part pour exclure aussi les one-shots qui font partie d'une série, pas juste les one-shots isolés~~
~~- Prévenir quand un même tag est à la fois inclus et exclu dans la recherche, ce qui crée un conflit~~
~~- Avertir aussi quand on exclut un couple, un tag ou un trope qu'on a l'habitude d'inclure ou qui est très populaire, pas seulement les avertissements officiels d'AO3~~
~~- Cacher les fics trop courtes~~

## Explicitement écarté

- Appliquer un preset tout seul en arrivant sur une page, sans cliquer dessus — pour éviter les surprises
- Fusionner ce module avec `hideByTags` et d'autres modules de masquage en un seul gros module — jugé trop différent pour être réuni
- Refaire des filtres qu'AO3 propose déjà nativement (plus de 30 réglages) — jugé inutile, ce module vient compléter les filtres d'AO3, pas les remplacer


AO3 Helper - Filter Manager Module Coordinator
    Module ID: filterManager
    Display Name: Filter Manager
    Tab: Browse

    Submodules (imported directly as ES modules):
        1. presetManagement   → ./presetManagement.js
        2. languageBadges     → ./languageBadges.js
        3. filterWarnings     → ./filterWarnings.js
        4. userHistoryFilters → ./userHistoryFilters.js
        5. worksFilterManager → ./worksFilterManager.js

    Storage keys:
        filterManager:presets     — saved preset list
        filterManager:bundles     — custom tag bundles
        filterManager:lastPreset  — { [fandom]: presetId }

    Public API (AO3H.filterManager):
        getBundleFor(tag)   → string[]
        getAllBundles()      → bundle[]
        getPresets()        → preset[]

    Dependencies: hideByTags (⇄), ficAppreciation, bookmarkVault,
                  laterShelf, readingTracker


                  
AO3 Helper - Filter Warnings Submodule
    Submodule ID: filterWarnings
    Parent Module: filterManager

    - Feature: Archive Warning exclusion detection
      - Option: Scans current URL search params for excluded Archive Warnings
      - Option: Tracks all 6 official AO3 Archive Warnings
      - Option: Supports both array and bare param name forms

    - Feature: Dismissible warning banner
      - Option: Injected at the top of #main on listing pages
      - Option: Lists the names of all excluded warnings inline
      - Option: ⚠️ icon with role="alert" for accessibility
      - Option: ✕ dismiss button removes banner from DOM
      - Option: Guards against duplicate banner injection

    - Feature: Remove exclusion button
      - Option: "Remove exclusion" button shown when cfg excludeWarningRemoveButton is true
      - Option: Rebuilds current URL removing excluded Archive Warning params (both bracket and bare forms)
      - Option: Navigates to the updated URL on click

    Dependencies injected via constructor: NS, cfg



    AO3 Helper - Language Badges Submodule
    Submodule ID: languageBadges
    Parent Module: filterManager

    - Feature: Language badge injection
      - Option: Appends a flag + language name badge after each work blurb heading
      - Option: Supports 20 languages with emoji flag mapping
      - Option: Only injects when multiple distinct languages appear on the page
      - Option: Only injects once per blurb (guarded by data-fm-lang attribute)

    - Feature: Click-to-filter
      - Option: Badge acts as a button when clickBadgeToFilter is enabled
      - Option: Click navigates to current URL filtered by work_search[language_id] (ISO 639-1 code)
      - Option: Keyboard accessible (Enter key triggers filter)

    - Feature: Cleanup
      - Option: Removes all injected badges and resets data-fm-lang markers

    Dependencies injected via constructor: NS, cfg


    AO3 Helper - Preset Management Submodule
    Submodule ID: presetManagement
    Parent Module: filterManager

    - Feature: Save filter presets
      - Option: Captures all active filter form fields into a named preset
      - Option: Prompt-based name entry via Ctrl+Shift+S or Save button
      - Option: Presets stored in configurable storage key

    - Feature: Preset toolbar (sidebar injection)
      - Option: Dropdown selector with all saved presets
      - Option: Star button to pin presets to top of list (starredPresetsFirst)
      - Option: Delete button per preset
      - Option: Help popover explaining how presets work

    - Feature: Preset application
      - Option: "↩ Apply" fills the filter form with all preset values
      - Option: "🏷 Edit as chips" applies preset and shows per-filter removable chips
      - Option: Remembers last used preset per fandom (rememberLastPresetByFandom)

    - Feature: Filter chips
      - Option: Each active filter displayed as a removable chip
      - Option: Multi-tag fields split into individual chips
      - Option: Tag bundle indicator (🔗) when a tag belongs to a bundle
      - Option: Removing a chip clears that filter from the form

    - Feature: Keyboard shortcuts
      - Option: Ctrl+1–9 applies the Nth preset (sorted order)
      - Option: Ctrl+Shift+S saves current filters as a new preset

    - Feature: Import / Export
      - Option: Export all presets + bundles as JSON file
      - Option: Import JSON and merge with existing presets (by ID, no duplicates)

    - Feature: Hover preview
      - Option: Tooltip on each preset dropdown item showing active filter summary (presetHoverPreview)
      - Option: Uses friendly field names instead of raw AO3 param keys

    Dependencies injected via constructor:
        NS, storeGet, storeSet, cfg, detectCurrentFandom, getBundleFor,
        loadBundles, saveBundles, KEY_PRESETS, KEY_BUNDLES, KEY_LAST


AO3 Helper - User History Filters Submodule
    Submodule ID: userHistoryFilters
    Parent Module: filterManager

    - Feature: History-based work hiding
      - Option: Hide works I have kudosed (hideKudosed) — reads ficAppreciation kudosTracker API
      - Option: Hide works I am subscribed to (hideSubscribed) — detects AO3 native subscription delete button
      - Option: Hide bookmarked works (hideBookmarked) — reads bookmarkVault API
      - Option: Hide works in Marked for Later (hideMFL) — reads laterShelf API
      - Option: Hide works belonging to a fully-read series (hideReadSeries) — reads readingTracker API
      - Option: Guard against re-processing blurbs (data-fm-history marker)

    - Feature: Hidden count display
      - Option: Shows "N works hidden by history filters" above the listing (showHiddenCount)
      - Option: Hides the counter when count is zero

    - Feature: Cleanup
      - Option: Removes hidden class and all data markers from all processed blurbs

    Dependencies injected via constructor: NS, cfg, W, AO3H
    Note: W/AO3H sont injectes par _filterManager (qui importe AO3H du core depuis
    l'etape 318). Les lectures window.AO3H_Modules.* et modules.getService restent
    des no-op herites du legacy (E3, jamais poses nulle part) — fallbacks DOM/service
    utilises, comportement identique. Documente etapes 307/318 ; hors scope migration.



AO3 Helper - Works Filter Manager Submodule
    Submodule ID: worksFilterManager
    Parent Module: filterManager

    - Feature: Blurb classification
      - Option: Marks one-shot blurbs (dd.chapters === "1/1") with data-fm-oneshot
      - Option: Marks crossover blurbs (multiple fandoms in h6.fandoms a.tag) with data-fm-crossover
      - Option: Guards against re-processing blurbs (data-fm-wfm marker)

    - Feature: Quick-filter panel
      - Option: "1️⃣ One-shots only" toggle button (shown when quickFilterOneshot is true)
      - Option: "🚫 Hide crossovers" toggle button (shown when quickFilterCrossover is true)
      - Option: Panel hidden entirely if both options are disabled

    - Feature: CSS-based filtering
      - Option: Toggling one-shots button adds ao3h-fm-filter-oneshot class to <html>
      - Option: Toggling crossover button adds ao3h-fm-hide-crossover class to <html>
      - Option: CSS rules hide non-matching blurbs without re-processing the DOM
      - Option: Buttons reflect active state via aria-pressed and active class

    - Feature: CSS-class-based filtering
      - Option: CSS rules live in filterManager.css (scoped to html.ao3h-fm-*)
      - Option: Class toggles on <html> trigger CSS visibility without DOM mutation

    - Feature: Cleanup
      - Option: Removes filter classes from <html>
      - Option: Removes data-fm-wfm, data-fm-oneshot, data-fm-crossover from all blurbs
      - Option: Removes the quick-filter panel and injected styles

    Dependencies injected via constructor: NS, cfg



    
═══════════════════════════════════════════════════════════════════════════
  # filterManager
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════


# À quoi ça sert

Le module **Filter Manager** enrichit le système de filtres natif d'AO3 afin de rendre les recherches plus rapides, plus flexibles et plus personnalisables.

Il permet notamment de :

- enregistrer et réutiliser des presets de filtres ;
- appliquer rapidement des filtres fréquents ;
- afficher des badges de langue ;
- avertir lorsqu'un avertissement officiel est exclu ;
- masquer automatiquement certaines œuvres selon l'historique de l'utilisateur ;
- gérer des groupes de tags équivalents.

Le module complète les filtres déjà proposés par AO3 sans chercher à les remplacer.

---

# Réglages utilisateur

| Réglage | Défaut | Description |
|----------|--------|-------------|
| `starredPresetsFirst` | Activé | Affiche les presets favoris en tête de liste. |
| `presetHoverPreview` | Activé | Affiche un aperçu du contenu d'un preset au survol. |
| `rememberLastPresetByFandom` | Activé | Sélectionne automatiquement le dernier preset utilisé pour le fandom actuel. |
| `showExpandPreset` | Activé | Affiche le bouton **Edit as chips** à côté du bouton Apply. |
| `selectedLanguages` | Toutes | Définit les langues affichées. |
| `showLanguageBadge` | Désactivé | Affiche un badge indiquant la langue des œuvres. |
| `clickBadgeToFilter` | Activé | Permet de filtrer par langue en cliquant sur le badge. |
| `warnExcludedWarning` | Activé | Affiche une bannière lorsqu'un avertissement officiel est exclu. |
| `excludeWarningRemoveButton` | Activé | Affiche un bouton permettant de retirer facilement cette exclusion. |
| `tagBundlesEnabled` | Désactivé | Active les groupes de tags équivalents. |
| `useBuiltinTropeBundles` | Activé | Utilise les groupes de tags intégrés (Slow Burn, Enemies to Lovers, etc.). |
| `quickFilterOneshot` | Activé | Active le filtre rapide **One-shots only**. |
| `quickFilterCrossover` | Activé | Active le filtre rapide **Hide crossovers**. |
| `hideKudosed` | Désactivé | Masque les œuvres déjà kudosées. |
| `hideSubscribed` | Désactivé | Masque les œuvres déjà suivies. |
| `hideBookmarked` | Désactivé | Masque les œuvres déjà enregistrées en favoris. |
| `hideMFL` | Désactivé | Masque les œuvres présentes dans **Marked for Later**. |
| `hideReadSeries` | Désactivé | Masque les séries entièrement lues. |
| `showHiddenCount` | Activé | Affiche le nombre d'œuvres masquées par les filtres d'historique. |
| `rememberFilters` | Activé | Conserve les filtres actifs entre les sessions. |
| `oneshotDefault` | `all` | Comportement par défaut du filtre One-shots. |
| `crossoverDefault` | `all` | Comportement par défaut du filtre Crossovers. |

---

# Structure du module

Le module est composé de cinq sous-modules fonctionnels ainsi qu'une feuille de style.

```
_filterManager.js
presetManagement.js
languageBadges.js
filterWarnings.js
userHistoryFilters.js
worksFilterManager.js
filterManager.css
```

---

# _filterManager.js

## Rôle

Fichier coordinateur du module.

Il initialise l'ensemble des sous-modules, centralise les groupes de tags équivalents, expose une API publique et coordonne les échanges avec les autres modules d'AO3 Helper.

---

## Responsabilités

- Initialise tous les sous-modules.
- Charge et partage les groupes de tags.
- Centralise les presets enregistrés.
- Expose les services du module au reste d'AO3 Helper.
- Coordonne les échanges avec les autres modules liés aux filtres.

---

## Fonctions exposées

L'API publique fournit notamment :

- `getBundleFor(tag)`
- `getAllBundles()`
- `getPresets()`

L'API est accessible via :

`AO3H.filterManager`

---

## Stockage

Le module utilise principalement les clés suivantes :

| Clé | Contenu |
|------|----------|
| `filterManager:presets` | Liste des presets enregistrés. |
| `filterManager:bundles` | Groupes de tags personnalisés. |
| `filterManager:lastPreset` | Dernier preset utilisé pour chaque fandom. |

---

## Dépendances

Le coordinateur interagit notamment avec :

- `hideByTags`
- `ficAppreciation`
- `bookmarkVault`
- `laterShelf`
- `readingTracker`

---

# presetManagement.js

## Rôle

Permet d'enregistrer, gérer et réutiliser des combinaisons complètes de filtres AO3.

Le module fournit également une barre d'outils facilitant l'application rapide des presets, leur modification et leur importation ou exportation.

---

## Fonctionnalités

### Création de presets

Le module peut enregistrer la configuration actuelle du formulaire de recherche.

Un preset peut notamment contenir :

- les tags inclus ou exclus ;
- les avertissements ;
- la classification ;
- les mots-clés ;
- le tri ;
- tous les autres champs du formulaire AO3.

Chaque preset reçoit un nom choisi par l'utilisateur.

---

### Barre d'outils

Le module ajoute une barre de gestion comprenant notamment :

- une liste déroulante des presets ;
- un bouton **Apply** ;
- un bouton **Edit as chips** ;
- un bouton de favoris ;
- un bouton de suppression ;
- une aide expliquant le fonctionnement des presets.

---

### Favoris

Les presets peuvent être marqués comme favoris.

Lorsque l'option correspondante est activée :

- les presets favoris apparaissent en premier dans la liste.

---

### Application des presets

Un preset peut être appliqué en un clic.

Le module permet notamment :

- de remplir automatiquement tout le formulaire AO3 ;
- d'éditer les filtres avant la recherche grâce au mode **Edit as chips** ;
- de mémoriser automatiquement le dernier preset utilisé pour chaque fandom.

---

### Édition par chips

Le mode **Edit as chips** transforme chaque filtre actif en élément individuel pouvant être supprimé.

Le système :

- sépare automatiquement les champs contenant plusieurs tags ;
- affiche chaque filtre sous forme de chip ;
- permet de supprimer un filtre individuellement ;
- indique lorsqu'un tag appartient à un groupe de tags grâce à l'icône **🔗**.

---

### Raccourcis clavier

Le module fournit plusieurs raccourcis :

| Raccourci | Action |
|------------|--------|
| `Ctrl + 1` à `Ctrl + 9` | Applique le preset correspondant. |
| `Ctrl + Shift + S` | Enregistre les filtres actuels comme nouveau preset. |

Le bouton **Save** utilise également cette fonctionnalité.

---

### Importation et exportation

Le module permet :

- d'exporter tous les presets ;
- d'exporter les groupes de tags ;
- d'importer un fichier JSON ;
- de fusionner les données importées avec les presets existants sans créer de doublons.

---

### Aperçu au survol

Lorsque cette option est activée, un survol d'un preset affiche un résumé de son contenu.

L'aperçu :

- utilise des noms compréhensibles plutôt que les paramètres techniques d'AO3 ;
- présente les principaux filtres actifs.

---

## Détails techniques

### Détection du fandom

Le module peut identifier automatiquement le fandom actuel afin d'associer un preset à celui-ci.

---

### Données enregistrées

Chaque preset est enregistré avec :

- son identifiant ;
- son nom ;
- l'ensemble des champs du formulaire AO3.

Les groupes de tags sont enregistrés séparément.

---

## Dépendances

Ce sous-module est initialisé par `_filterManager.js`.

Il utilise les groupes de tags partagés par le coordinateur ainsi que les fonctions de stockage communes.


# languageBadges.js

## Rôle

Ajoute un badge indiquant la langue de chaque œuvre afin de faciliter l'identification des différentes langues présentes sur une même page.

Le module permet également de filtrer directement les résultats en cliquant sur ce badge.

---

## Fonctionnalités

### Badges de langue

Le module ajoute un badge après le titre de chaque œuvre.

Chaque badge affiche :

- un drapeau ;
- le nom de la langue.

Les badges ne sont affichés que lorsqu'au moins deux langues différentes sont présentes sur la page.

---

### Détection des langues

Le module reconnaît automatiquement les langues indiquées par AO3.

Il prend en charge :

- une vingtaine de langues ;
- leur association avec un drapeau correspondant.

---

### Filtrage par langue

Lorsque cette option est activée, le badge devient interactif.

Un clic :

- applique automatiquement un filtre sur cette langue ;
- recharge la page avec le paramètre de recherche approprié.

Le filtre utilise le code ISO 639-1 correspondant à la langue sélectionnée.

---

### Accessibilité

Le badge est utilisable :

- à la souris ;
- au clavier.

La touche **Entrée** applique également le filtre.

---

### Nettoyage

Le module peut supprimer tous les badges précédemment injectés.

Cette opération retire également les marqueurs internes utilisés pour éviter les doublons.

---

## Détails techniques

### Conditions d'affichage

Les badges sont affichés uniquement lorsque :

- plusieurs langues différentes sont présentes sur la page ;
- aucun badge n'a déjà été ajouté à l'œuvre concernée.

Chaque œuvre est marquée avec l'attribut :

`data-fm-lang`

afin d'éviter les insertions multiples.

---

### Navigation

Le filtrage met à jour le paramètre :

`work_search[language_id]`

dans l'URL actuelle avant de recharger la page.

---

## Dépendances

Ce sous-module est initialisé par `_filterManager.js`.

Il utilise les préférences utilisateur afin de déterminer si les badges doivent être affichés et s'ils doivent être interactifs.

---

# filterWarnings.js

## Rôle

Détecte lorsqu'un ou plusieurs avertissements officiels d'AO3 sont exclus dans la recherche et affiche une bannière afin de rendre cette exclusion plus visible.

Le module permet également de supprimer rapidement ces exclusions.

---

## Fonctionnalités

### Détection des exclusions

Le module analyse automatiquement les paramètres de recherche présents dans l'URL.

Il détecte les exclusions concernant les six avertissements officiels d'AO3.

Les deux formes de paramètres utilisées par AO3 sont prises en charge.

---

### Bannière d'avertissement

Lorsqu'une exclusion est détectée, le module affiche une bannière en haut de la page.

La bannière :

- apparaît au-dessus du contenu principal ;
- liste tous les avertissements exclus ;
- utilise une icône **⚠️** ;
- possède le rôle `alert` afin d'améliorer l'accessibilité.

Le module empêche automatiquement la création de plusieurs bannières identiques.

---

### Suppression de l'exclusion

Lorsque l'option correspondante est activée, la bannière affiche un bouton :

**Remove exclusion**

Ce bouton :

- reconstruit automatiquement l'URL ;
- supprime les paramètres correspondant aux avertissements exclus ;
- recharge ensuite la page avec la nouvelle recherche.

Les deux formats de paramètres utilisés par AO3 sont pris en charge.

---

### Fermeture

La bannière peut être fermée à tout moment.

Le bouton **✕** retire simplement la bannière du DOM sans modifier les filtres actuellement appliqués.

---

## Détails techniques

### Analyse de l'URL

Le module examine les paramètres de recherche afin d'identifier les exclusions des Archive Warnings.

---

### Position

La bannière est injectée en haut de :

`#main`

sur les pages comportant une liste d'œuvres.

---

## Dépendances

Ce sous-module est initialisé par `_filterManager.js`.

Il utilise les préférences utilisateur afin de déterminer si la bannière et le bouton **Remove exclusion** doivent être affichés.

---

# userHistoryFilters.js

## Rôle

Permet de masquer automatiquement certaines œuvres selon les interactions précédentes de l'utilisateur avec AO3.

Le module s'appuie sur les informations enregistrées par plusieurs autres modules afin de personnaliser les résultats affichés.

---

## Fonctionnalités

### Masquage selon l'historique

Le module peut masquer automatiquement :

- les œuvres déjà kudosées ;
- les œuvres déjà suivies ;
- les œuvres déjà enregistrées en favoris ;
- les œuvres présentes dans **Marked for Later** ;
- les œuvres appartenant à une série entièrement lue.

Chaque filtre peut être activé ou désactivé indépendamment.

---

### Compteur d'œuvres masquées

Lorsque cette option est activée, le module affiche un compteur au-dessus de la liste des œuvres.

Le compteur indique :

> **N works hidden by history filters**

Il disparaît automatiquement lorsqu'aucune œuvre n'est masquée.

---

### Nettoyage

Le module peut restaurer complètement l'affichage initial.

Cette opération :

- retire la classe de masquage ;
- supprime les marqueurs internes utilisés pendant le traitement.

---

## Détails techniques

### Traitement des œuvres

Chaque œuvre déjà analysée reçoit un marqueur :

`data-fm-history`

afin d'éviter plusieurs traitements successifs.

---

### Sources des données

Le module récupère les informations auprès des autres modules d'AO3 Helper.

Il peut notamment consulter :

- le suivi des kudos ;
- les favoris ;
- Marked for Later ;
- les séries déjà lues ;
- les abonnements AO3.

Les anciens mécanismes hérités du projet restent présents uniquement comme solutions de secours afin de préserver la compatibilité.

---

## Dépendances

Ce sous-module est initialisé par `_filterManager.js`.

Il interagit notamment avec :

- `ficAppreciation`
- `bookmarkVault`
- `laterShelf`
- `readingTracker`

afin de déterminer quelles œuvres doivent être masquées.

# worksFilterManager.js

## Rôle

Ajoute des filtres rapides permettant de modifier immédiatement l'affichage des listes d'œuvres sans reconstruire le formulaire de recherche AO3.

Le module peut notamment :

- n'afficher que les one-shots ;
- masquer les crossovers.

---

## Fonctionnalités

### Classification des œuvres

Le module analyse chaque œuvre affichée dans la liste afin de déterminer si elle correspond à certaines catégories.

Il identifie notamment :

- les one-shots ;
- les crossovers.

Une œuvre est considérée comme un one-shot lorsque son nombre de chapitres est :

`1/1`

Une œuvre est considérée comme un crossover lorsque plusieurs fandoms sont présents dans sa liste de tags de fandom.

---

### Filtre One-shots

Lorsque cette option est activée, le module ajoute un bouton :

**1️⃣ One-shots only**

Ce bouton permet de masquer toutes les œuvres qui ne sont pas des one-shots.

---

### Filtre Crossovers

Lorsque cette option est activée, le module ajoute un bouton :

**🚫 Hide crossovers**

Ce bouton permet de masquer toutes les œuvres classées comme crossovers.

---

### Panneau de filtres rapides

Les boutons sont regroupés dans un panneau dédié.

Le panneau :

- n'affiche que les filtres activés dans les réglages ;
- est entièrement masqué lorsque les deux options sont désactivées ;
- indique visuellement l'état actif ou inactif de chaque filtre.

---

### Filtrage sans rechargement

Les filtres agissent directement sur les œuvres déjà présentes dans la page.

Ils ne nécessitent pas :

- de recharger la page ;
- de renvoyer le formulaire de recherche ;
- de reconstruire les œuvres dans le DOM.

---

### Accessibilité

Chaque bouton utilise :

- l'attribut `aria-pressed` ;
- une classe visuelle indiquant son état actif.

---

### Nettoyage

Le module peut retirer complètement ses modifications.

Cette opération :

- supprime les classes de filtrage appliquées à `<html>` ;
- retire les marqueurs ajoutés aux œuvres ;
- supprime le panneau de filtres rapides ;
- retire les styles injectés.

---

## Détails techniques

### Marqueurs appliqués aux œuvres

Le module utilise les attributs suivants :

| Attribut | Utilisation |
|----------|-------------|
| `data-fm-wfm` | Indique que l'œuvre a déjà été analysée. |
| `data-fm-oneshot` | Indique qu'il s'agit d'un one-shot. |
| `data-fm-crossover` | Indique qu'il s'agit d'un crossover. |

---

### Classes de filtrage

Les filtres sont contrôlés par des classes appliquées sur l'élément `<html>`.

| Filtre | Classe |
|--------|--------|
| One-shots uniquement | `ao3h-fm-filter-oneshot` |
| Masquer les crossovers | `ao3h-fm-hide-crossover` |

---

### Fonctionnement CSS

Les règles de visibilité sont définies dans :

`filterManager.css`

Le module se contente d'ajouter ou retirer les classes correspondantes.

Cela permet de modifier l'affichage sans retraiter les œuvres.

---

## Dépendances

Ce sous-module est initialisé par `_filterManager.js`.

Il fonctionne indépendamment des autres filtres du module.

---

# filterManager.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Filter Manager**.

Il définit notamment l'apparence :

- de la barre de presets ;
- des menus déroulants ;
- des boutons de favoris ;
- des chips de filtres ;
- des badges de langue ;
- des bannières d'avertissement ;
- du compteur d'œuvres masquées ;
- du panneau de filtres rapides ;
- des états actifs ou inactifs des boutons.

Il contient également les règles CSS utilisées pour masquer les œuvres selon les classes appliquées sur l'élément `<html>`.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Gestion des presets

### Renommer un preset

Permettre de modifier le nom d'un preset déjà enregistré sans devoir le supprimer et le recréer.

---

### Organisation avancée

Permettre d'organiser les presets dans :

- des dossiers ;
- des catégories.

Les presets pourraient également être présentés sous forme de cartes contenant notamment :

- une icône ;
- le nombre de tags ;
- la date de dernière utilisation.

---

### Fusion de presets

Permettre de combiner deux presets existants afin de créer automatiquement un nouveau preset réunissant leurs filtres.

---

### Synchronisation

Synchroniser automatiquement les presets entre plusieurs appareils.

---

### Statistiques d'utilisation

Afficher des statistiques sur les filtres et presets les plus souvent utilisés.

---

### Historique des recherches

Conserver l'historique des recherches avec :

- les filtres utilisés ;
- la date de la recherche ;
- la possibilité de restaurer rapidement une ancienne combinaison.

---

## Filtres d'œuvres

### Faible nombre de tags

Permettre de masquer les œuvres contenant très peu de tags.

---

### Œuvres anonymes

Permettre de masquer les œuvres publiées anonymement.

---

### Masquage individuel

Ajouter un bouton sur chaque œuvre permettant :

- de la masquer ;
- ou de la réduire individuellement.

---

### Raccourci de masquage

Ajouter un raccourci clavier permettant de masquer rapidement une œuvre.

---

### Présence d'un résumé

Ajouter un filtre permettant de ne conserver que les œuvres possédant un résumé.

---

### Longueur minimale du résumé

Permettre d'exiger une longueur minimale pour le résumé, au lieu de vérifier uniquement sa présence.

---

### Œuvres déjà lues

Masquer automatiquement toutes les œuvres déjà lues, et non uniquement les séries entièrement terminées.

---

### Réduction plutôt que masquage

Permettre de réduire visuellement les œuvres filtrées par l'historique plutôt que de les retirer complètement de l'affichage.

---

### Affichage temporaire par catégorie

Permettre de revoir rapidement les œuvres masquées selon leur catégorie :

- kudos ;
- abonnements ;
- favoris ;
- Marked for Later ;
- séries lues.

Cette consultation ne nécessiterait pas de désactiver tous les filtres.

---

## Filtres rapides

### Filtres à trois états

Remplacer les boutons One-shots et Crossovers par des contrôles à trois options :

- tout afficher ;
- afficher uniquement cette catégorie ;
- exclure cette catégorie.

---

### Badges One-shot

Ajouter un badge visible sur chaque one-shot dans les listes, indépendamment du filtre rapide.

---

## Filtres avancés

### Logique combinée

Permettre de construire des règles utilisant des opérateurs comme :

- ET ;
- OU ;
- SAUF SI.

---

### Constructeur visuel

Ajouter une interface permettant de créer ses propres règles de filtrage sans écrire de code.

Un mode de débogage permettrait également de comprendre pourquoi une œuvre est affichée ou masquée.

---

### Ratio d'engagement

Permettre de filtrer les œuvres selon leur ratio de kudos par rapport aux vues.

---

### Date de mise à jour

Ajouter des filtres temporels, par exemple :

- mise à jour aujourd'hui ;
- cette semaine ;
- ce mois-ci.

---

### Œuvres abandonnées

Permettre de masquer les œuvres qui n'ont pas été mises à jour depuis plus d'une durée choisie, par exemple un an.


# Fonctionnalités non implémentées — suite

---

## Avertissements et sécurité

### Avertissement avant ouverture

Afficher un avertissement directement dans les listes lorsqu'une œuvre contient certains mots ou tags considérés comme sensibles.

Le système pourrait notamment proposer :

- plusieurs niveaux de gravité ;
- des règles différentes selon le type de contenu ;
- une indication visuelle avant l'ouverture de la fic.

---

### Sensibilité de la bannière

Permettre de régler la sensibilité de la bannière affichée lorsqu'un avertissement officiel est exclu.

Les options pourraient inclure :

- toujours afficher la bannière ;
- l'afficher seulement dans certains cas ;
- ne plus l'afficher après sa fermeture définitive.

---

## Badges de langue

### Langues non préférées uniquement

Ajouter un mode permettant d'afficher les badges uniquement pour les langues que l'utilisateur ne préfère pas.

Actuellement, les badges apparaissent pour toutes les langues présentes sur la page lorsque plusieurs langues sont détectées.

---

## Compatibilité avec les pages AO3

### Historique et favoris

Étendre l'ensemble des filtres du module aux pages :

- History ;
- Bookmarks.

Actuellement, plusieurs fonctionnalités ciblent principalement les pages de recherche et de tags.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Application automatique des presets

Le module n'applique jamais automatiquement un preset dès l'arrivée sur une page.

L'utilisateur doit toujours choisir explicitement le preset à appliquer afin d'éviter :

- les changements inattendus ;
- les filtres invisibles ;
- les résultats incomplets sans explication claire.

---

## Séparation avec les autres modules de masquage

Le module n'est pas fusionné avec `hideByTags` ni avec les autres modules spécialisés dans le masquage.

Ces modules restent séparés parce qu'ils remplissent des fonctions différentes :

- **Filter Manager** enrichit principalement le formulaire et les outils de filtrage ;
- **hideByTags** applique des règles de masquage basées sur les tags ;
- les autres modules peuvent cibler l'historique, la lecture ou d'autres catégories précises.

Cette séparation évite de créer un module trop large et difficile à maintenir.

---

## Filtres natifs d'AO3

Le module ne reproduit pas les nombreux filtres déjà proposés nativement par AO3.

Il sert uniquement à compléter le système existant avec :

- des presets ;
- des raccourcis ;
- des alertes ;
- des badges ;
- des filtres liés à l'historique utilisateur.

---

# Résumé des responsabilités du module

Le module **Filter Manager** est responsable de toutes les fonctionnalités permettant d'enrichir, mémoriser et accélérer l'utilisation des filtres AO3.

Ses responsabilités sont réparties entre les sous-modules suivants :

| Sous-module | Responsabilité principale |
|-------------|---------------------------|
| `_filterManager.js` | Initialise le module, centralise les groupes de tags et expose l'API publique. |
| `presetManagement.js` | Création, application, édition, importation et exportation des presets. |
| `languageBadges.js` | Affichage des langues et filtrage direct depuis les badges. |
| `filterWarnings.js` | Détection des avertissements exclus et affichage d'une bannière. |
| `userHistoryFilters.js` | Masquage des œuvres selon l'historique et les interactions de l'utilisateur. |
| `worksFilterManager.js` | Filtres rapides pour les one-shots et les crossovers. |
| `filterManager.css` | Styles visuels et règles de filtrage CSS de l'ensemble du module. |

---

# Interactions entre les sous-modules

Le coordinateur `_filterManager.js` initialise les sous-modules et partage les données communes nécessaires à leur fonctionnement.

Les responsabilités sont volontairement séparées :

- **`presetManagement.js`** gère les combinaisons de filtres enregistrées.
- **`languageBadges.js`** agit uniquement sur l'identification et le filtrage des langues.
- **`filterWarnings.js`** surveille les exclusions d'avertissements officiels.
- **`userHistoryFilters.js`** masque les œuvres selon les interactions passées de l'utilisateur.
- **`worksFilterManager.js`** applique des filtres rapides sans recharger la page.

Les sous-modules peuvent fonctionner indépendamment, mais partagent la configuration et certains services fournis par le coordinateur.

---

# Dépendances externes

Le module dépend principalement des données déjà présentes dans AO3 et de plusieurs services internes d'AO3 Helper.

## Données AO3 utilisées

Le module peut analyser notamment :

- les paramètres de l'URL ;
- les champs du formulaire de filtres ;
- la langue des œuvres ;
- le nombre de chapitres ;
- les fandoms associés ;
- les boutons d'abonnement natifs.

---

## Services internes

Selon les options activées, le module peut interagir avec :

- `hideByTags`
- `ficAppreciation`
- `bookmarkVault`
- `laterShelf`
- `readingTracker`

Ces dépendances servent principalement à déterminer quelles œuvres ont déjà été lues, kudosées, suivies ou enregistrées.


# Limites connues

Le module applique plusieurs limites liées à son fonctionnement actuel.

---

## Presets

Les presets doivent être appliqués manuellement.

Le module ne permet pas actuellement :

- de renommer directement un preset ;
- de fusionner plusieurs presets ;
- de les organiser dans des dossiers ;
- de les synchroniser automatiquement entre plusieurs appareils ;
- d'appliquer automatiquement un preset dès l'ouverture d'une page.

---

## Groupes de tags

Le module peut utiliser des groupes de tags équivalents et les enregistrer, mais leur gestion reste limitée.

Il ne fournit pas encore d'interface complète permettant de :

- créer facilement de nouveaux groupes ;
- modifier les groupes existants ;
- renommer un groupe ;
- gérer visuellement les tags qui en font partie.

---

## Filtres rapides

Les filtres One-shots et Crossovers utilisent actuellement un fonctionnement simple de type activé ou désactivé.

Ils ne permettent pas encore de choisir entre :

- tout afficher ;
- afficher uniquement cette catégorie ;
- exclure cette catégorie.

---

## Filtres d'historique

Les filtres liés à l'historique masquent complètement les œuvres concernées.

Ils ne permettent pas actuellement :

- de simplement réduire les œuvres ;
- de revoir temporairement une seule catégorie d'œuvres masquées ;
- de masquer automatiquement toutes les œuvres déjà lues individuellement.

Le masquage des séries entièrement lues dépend également des informations disponibles dans `readingTracker`.

---

## Dépendances internes héritées

Certaines lectures d'anciennes APIs restent présentes dans `userHistoryFilters.js` pour préserver la compatibilité avec le code historique.

Les références héritées à :

- `window.AO3H_Modules`
- `modules.getService`

ne correspondent plus à des services réellement enregistrés.

Le fonctionnement actuel repose donc sur :

- les APIs modernes injectées par `_filterManager.js` ;
- les services internes disponibles ;
- les solutions de secours basées sur le DOM.

Ces références historiques sont conservées sans modifier le comportement du module.

---

## Pages prises en charge

Toutes les fonctionnalités ne sont pas encore disponibles de manière uniforme sur chaque type de page AO3.

Le support est principalement conçu pour :

- les pages de recherche ;
- les pages de tags ;
- les pages contenant le formulaire de filtres ;
- les listes d'œuvres compatibles.

Certaines fonctions doivent encore être étendues complètement aux pages :

- History ;
- Bookmarks.

---

## Badges de langue

Les badges de langue sont affichés uniquement lorsque plusieurs langues distinctes sont détectées sur la page.

Ils ne permettent pas encore :

- d'afficher uniquement les langues non préférées ;
- de définir des comportements différents pour chaque langue.

Le clic sur un badge utilise directement le code ISO 639-1 associé à la langue.

---

## Bannière d'avertissement

La bannière détecte uniquement l'exclusion des six avertissements officiels d'AO3.

Elle ne détecte pas encore :

- les conflits entre tags inclus et exclus ;
- l'exclusion de couples ou de tropes habituellement inclus ;
- les contenus sensibles définis personnellement par l'utilisateur.

La fermeture de la bannière retire uniquement l'élément de la page actuelle et ne constitue pas une désactivation permanente.

---

## Portée des filtres

Les filtres du module sont globaux.

Ils ne peuvent pas actuellement varier automatiquement selon :

- le type de page ;
- l'heure ou le jour ;
- le fandom ;
- les habitudes de lecture de l'utilisateur.

Le module ne tente pas non plus de deviner automatiquement les filtres les plus adaptés à partir de l'historique.

---

## Séparation des responsabilités

Certaines fonctionnalités proches restent volontairement prises en charge par d'autres modules.

Notamment :

- le surlignage des mots ou tags indésirables appartient à `hideByTags` ;
- le tri par niveau d'engagement appartient à `searchEnhancer` ;
- les autres règles spécialisées de masquage restent dans leurs modules respectifs.

Cette séparation évite que **Filter Manager** devienne un module unique responsable de toutes les formes de filtrage et de masquage.