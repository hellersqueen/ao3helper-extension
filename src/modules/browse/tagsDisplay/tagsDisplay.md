# tagsDisplay

**Tab:** Browse

## À quoi ça sert

Ce module regroupe plusieurs petites améliorations indépendantes pour
l'affichage des tags, sur les listes de fics et sur les pages d'œuvre : des
icônes plus lisibles pour les avertissements, la possibilité de cacher les
tags qui ne servent à rien, un mode compact, le surlignage des tags
favoris, le réordonnancement à la souris, et le masquage des tags en trop.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `archiveWarningsStyle` | `badge` | Comment les avertissements sont affichés : icône seule (avec nom complet au survol), texte abrégé, ou icône + texte |
| `compactWarnings` | activé | Active ou coupe complètement l'affichage des avertissements en icônes |
| `confirmSensitiveWarnings` | désactivé | Demande confirmation avant d'ouvrir une fic taguée Violence/MCD/Underage/Non-Con |
| `autoHideNoiseTags` | désactivé | Cache automatiquement les petits tags qui ne servent à rien (ex. "pls be nice") |
| `noiseTagStyle` | `hide` | `hide` (masquage complet) ou `blur` (flouté, cliquable pour révéler) |
| `tagExternalLinks` | désactivé | Ajoute des liens de recherche 📖 Fanlore / 🌀 TV Tropes après chaque tag |
| `compactMode` | désactivé | Replie chaque catégorie de tags (+ le résumé) séparément, dépliée au survol |
| `compactCatWarnings`, `compactCatRelationships`, `compactCatCharacters`, `compactCatFreeforms`, `compactCatSummary` | activés | Quelles catégories participent au repli du mode compact — décochée = toujours affichée en entier |
| `compactModeAutoExpandScroll` | désactivé | Déplie automatiquement une fic dès qu'elle entre dans l'écran, sans survol |
| `highlightFavoriteTags` | activé | Surligne les tags favoris avec une couleur |
| `highlightColor` | Jaune | La couleur utilisée par défaut pour surligner un tag rapidement |
| `highlightPalette` | `default` | Jeu de couleurs pour le surlignage : `default`, `pastel`, `neon`, `classic` |
| `highlightStyle` | `fill` | Style visuel du surlignage : `fill` (fond plein), `border`, `bold`, `italic`, `symbol` (★) |
| `promoteHighlightedTags` | désactivé | Sur les listes, remonte les tags surlignés en tête de leur catégorie |
| `maxTagsVisible` | `0` (tous affichés) | Le nombre maximum de tags affichés par fic avant de cacher le reste (`0`, `5`, `10`, `15`) |
| `hideTagsWarnings`, `hideTagsRelationships`, `hideTagsCharacters`, `hideTagsFreeforms` | désactivés | Masquent une catégorie de tags en entier sur les listes, indépendamment de `maxTagsVisible` |
| `tagSeparator` | `", "` | Texte utilisé entre les tags affichés, à la place de la virgule AO3 par défaut |

## Fichiers

### 1. `archiveWarningsDisplay.js` — icônes pour les avertissements

- Remplace le texte long des avertissements par des icônes compactes (⚠️ Violence, 💀 MCD, 🚫 Underage, ⛔ Non-Con, ✓ No Warnings)
- Propose 3 styles d'affichage : icône seule (nom complet au survol via `title`), texte abrégé, ou icône + texte
- "Creator Chose Not To Use Archive Warnings" reste toujours écrit en entier, jamais remplacé par une icône
- Peut être complètement désactivé pour revenir au texte d'origine
- Demande confirmation avant d'ouvrir une œuvre taguée Violence/MCD/Underage/Non-Con si `confirmSensitiveWarnings` est activé (indépendant du reste : fonctionne même si les icônes sont désactivées) — logique de détection dans `archiveWarningsDisplay.js`

### 2. `autoHideNoiseTags.js` — cacher les tags inutiles

- Repère et cache automatiquement les petits tags qui ne veulent rien dire (par exemple "idk", "first fic pls be nice", "unbetaed") — correspondance dans `noiseTagUtils.js`
- Compare chaque tag à une liste d'environ 25 expressions connues, plus les mots ajoutés par l'utilisateur (`noiseTagUtils.js`)
- Deux styles de masquage (`noiseTagStyle`) : caché complètement, ou flouté et cliquable pour révéler
- Chaque tag masqué peut être révélé individuellement via une puce "show hidden tag" (`autoHideNoiseTags.js`), avec un aperçu du texte caché au survol
- Les auteurs ajoutés à la liste d'exceptions gardent tous leurs tags visibles, même s'ils matchent une expression "bruit" (`autoHideNoiseTags.js`)

### 3. `compactModeTags.js` — mode compact

- Replie chaque catégorie de tags et le résumé séparément — `compactModeTags.js` décide lesquelles participent, selon les réglages `compactCat*`.
- Les fait réapparaître au survol/focus, à l'arrivée dans le viewport en scrollant (optionnel), ou toutes en même temps avec le raccourci **Alt+T** (`compactModeTags.js`) — ce dernier choix est mémorisé par page (URL)
- Ne change que l'apparence de la page (classes CSS + un peu de JS pour le raccourci et le scroll), pas la structure

### 4. `tagHighlighting.js` — surligner ses tags favoris

- Surligne en couleur les tags que l'utilisateur a choisis comme favoris, y compris les tags de fandom
- Un clic droit sur un tag ouvre un petit menu pour choisir une couleur parmi 6 et l'ajouter tout de suite
- Reprend aussi, une seule fois au démarrage, les fandoms mis en valeur par l'ancien module fandomHighlighting (appearance/visualPreferences), fusionné ici
- Les motifs supportent un joker `*` (ex. `"Alternate Universe -*"`) — la première règle qui correspond dans la liste gagne (`tagRules.js`)
- 4 palettes de couleurs prêtes à l'emploi et 5 styles visuels (fond plein/bordure/gras/italique/★) au lieu d'une seule couleur de fond (`tagHighlighting.js`)
- Export/import des règles en JSON, et un bouton pour lancer une recherche AO3 avec tous les tags surlignés (panneau de configuration)

### 5. `tagsReordering.js` — réordonner les tags à la souris

- Sur les pages d'œuvre, permet de glisser-déposer les tags pour changer leur ordre, catégorie par catégorie (fandom, personnages, relations, tags libres)
- Se souvient de l'ordre choisi pour chaque fic
- Un bouton "Reset order" apparaît pour remettre l'ordre d'origine si on a changé quelque chose
- 3 boutons de tri automatique par catégorie : alphabétique, par longueur, ou "★ Important first" (tags surlignés en premier) — logique dans `tagRules.js`
- Export/import de l'ordre complet d'une œuvre (toutes catégories) dans un fichier JSON

### 6. `tagsVisibility.js` — cacher les tags en trop

- Sur les listes de fics, cache les tags en trop quand il y en a trop pour tenir sur une ligne
- Cache en priorité les tags les moins importants (tags libres avant personnages, avant relations, avant avertissements)
- Un bouton "+N more tags" permet de tout revoir, et "– Show less" de tout recacher
- Des catégories entières peuvent être masquées en permanence (indépendamment de la limite ci-dessus) via les réglages `hideTags*` — logique dans `tagRules.js`

### 7. `externalTagLinks.js` — liens externes depuis un tag

- Ajoute deux petites icônes de recherche après chaque tag : 📖 Fanlore et 🌀 TV Tropes (`externalTagLinks.js`)
- Purement additif : n'altère jamais le tag original, discret (opacité réduite) sauf au survol

### 8. `tagSeparatorStyle.js` — séparateur de tags personnalisé

- Remplace la virgule `", "` générée par AO3 (`.commas li::after`) par le texte choisi dans `tagSeparator`
- Ne s'active pas du tout si le séparateur choisi est celui par défaut (`tagSeparatorStyle.js`)

### 9. `tagImportancePromotion.js` — remonter les tags importants

- Sur les listes de fics, remonte les tags surlignés en tête de leur catégorie (un tag relation surligné reste parmi les relations, mais en premier) — réutilise `tagRules.js` et les règles de `tagHighlighting.js`
- L'ordre d'origine AO3 est mémorisé par liste de tags pour être restauré si la fonctionnalité est désactivée

## Specs non implémentés

Toutes les idées de cette liste ont été traitées : soit codées (✅, détails dans
la section Fichiers ci-dessus), soit déplacées dans « Explicitement écarté »
avec la raison. Gardée ici pour l'historique — voir "Fichiers" pour le détail
technique de chaque ✅.

- ~~Replier chaque catégorie de tags séparément~~ ✅ — `compactModeTags.js` (réglages `compactCat*`)
- ~~Remonter automatiquement les tags les plus importants en premier~~ ✅ — `tagImportancePromotion.js`
- ~~Flouter les tags "spoiler" au lieu de simplement les cacher~~ ✅ — `noiseTagStyle: 'blur'` dans `autoHideNoiseTags.js`
- ~~Choisir soi-même ses propres mots à considérer comme du "bruit"~~ ✅ — `noiseTagUtils.js`.
  **Pas fait** : les niveaux de gravité (jugé disproportionné pour ~25 mots-clés — voir plus bas)
- ~~Avoir des règles de masquage différentes selon l'auteur~~ ✅ *(scope réduit)* — implémenté comme une
  liste d'exceptions (`autoHideNoiseTags.js`) : un auteur ajouté garde tous ses tags visibles.
  Pas de générateur de règles complet (« masquer tel tag seulement pour tel auteur ») — l'exception
  couvre le cas d'usage réel (« ne jamais filtrer les tags de mes auteurs de confiance »).
- ~~Pouvoir réafficher un tag caché par le filtre anti-bruit, un par un, sans tout désactiver~~ ✅ — `autoHideNoiseTags.js`
- ~~Choisir d'agrandir seulement certains types de tags~~ ✅ — réglages `compactCat*` (décoché = jamais replié)
- ~~Agrandir automatiquement au scroll~~ ✅ — réglage `compactModeAutoExpandScroll`
- ~~Se souvenir si on avait déplié les tags sur une page précise~~ ✅ *(scope réduit)* — le raccourci
  Alt+T ("tout ouvrir") est mémorisé par page (URL) ; l'expansion au survol individuelle reste
  volontairement transitoire (elle n'a pas vocation à être "mémorisée", c'est un survol)
- ~~Un raccourci clavier pour plier/déplier les tags d'un coup~~ ✅ — **Alt+T** (`compactModeTags.js`)
- ~~Voir un aperçu du tag caché en survolant, sans tout déplier~~ ✅ — `title` sur la puce de réaffichage
- ~~Des styles de surlignage plus riches (gras, italique, bordure, symbole)~~ ✅ — réglage `highlightStyle`
- ~~Faire le lien entre la recherche et les tags mis en avant~~ ✅ *(scope réduit)* — bouton "Search AO3
  with these tags" dans le panneau, construit une recherche AO3 avec tous les tags surlignés
- ~~Des façons toutes faites de trier les tags (alphabétique, importance, longueur)~~ ✅ — boutons de tri dans `tagsReordering.js`
- ~~Sauvegarder/récupérer l'ordre des tags dans un fichier~~ ✅ — export/import JSON par œuvre.
  **Pas fait** : réordonner plusieurs fics d'un coup (voir "Explicitement écarté")
- Donner une couleur différente selon la gravité d'un avertissement — *volontairement pas fait, pour rester neutre*
- ~~Une fenêtre de confirmation avant d'ouvrir une fic avec un tag sensible~~ ✅ — réglage `confirmSensitiveWarnings`
- ~~Des liens vers des sites externes (TV Tropes, Fanlore) depuis un tag~~ ✅ — `externalTagLinks.js`
- ~~Un mode où le nom complet d'un avertissement apparaît seulement au survol~~ ✅ — c'est déjà le
  comportement du style `icon` existant (icône seule + `title` = nom complet natif du navigateur)
- ~~Exporter/importer sa liste de mots "bruit" personnalisés~~ ✅ — boutons Import/Export JSON
- ~~Des jeux de couleurs prêts à l'emploi (pastel, néon, classique)~~ ✅ — réglage `highlightPalette`
- ~~Utiliser des motifs (jokers) pour surligner plusieurs tags similaires~~ ✅ — joker `*` dans `tagRules.js`
- ~~Exporter/importer ses règles de surlignage, choisir laquelle gagne~~ ✅ — export/import JSON ;
  priorité = ordre du tableau, la première règle qui correspond gagne
- ~~Filtrer quels types de tags sont affichés~~ ✅ — réglages `hideTags*` dans `tagsVisibility.js`
- ~~Choisir son propre séparateur entre les tags affichés~~ ✅ — réglage `tagSeparator`

## Explicitement écarté

- Regrouper les tags par catégorie AO3 directement sur les listes (fandom, personnages, relations...) — abandonné, car repérer fiablement la catégorie de chaque tag s'est révélé trop compliqué et donnait des résultats peu fiables
- Afficher l'identifiant technique (ID) des tags sur la page — jugé utile seulement pour les développeurs, pas pour les lecteurs
- Afficher des jauges d'intensité (niveau de sexe, de violence, de tristesse...) à côté de la note officielle AO3, ou remplacer l'affichage de la note par des icônes maison — écarté pour des raisons éthiques, ça ne respecterait pas le choix de classification fait par l'auteur, et deviner ces niveaux serait trop subjectif
- Faire écrire les définitions des tags par la communauté des utilisateurs — jugé trop ambitieux pour ce module
- Niveaux de gravité pour les mots "bruit" personnalisés — jugé disproportionné : c'est un filtre pour ~25 expressions anodines ("idk", "pls be nice"), pas un système de modération ; un simple oui/non par mot suffit
- Voir en couleur si un tag est "officiel" ou une variante/synonyme, avec une bulle montrant le tag officiel — **pas possible sans requête réseau supplémentaire par tag** : AO3 n'expose pas ce statut sur les pages de listing ou d'œuvre, seulement sur ses pages de recherche/wrangling internes (`/tags/search`), qu'il faudrait interroger une par une
- Voir des informations ou statistiques sur la personne qui gère (wrangle) un tag — même limite : cette information n'est pas exposée publiquement sur les pages où le module s'exécute
- Voir une carte des liens entre tags proches ou similaires — nécessiterait une base de données de relations entre tags qui n'existe nulle part côté client ; hors de portée d'une extension de navigateur
- Signaler un tag "bruit" à la communauté, ou utiliser une liste "bruit" faite par d'autres utilisateurs — nécessiterait un serveur/backend partagé ; AO3 Helper reste une extension 100% côté client, sans service en ligne à elle
- Nettoyer et regrouper automatiquement les noms de fandoms en double ou en variantes — risque réel de fusionner par erreur des fandoms réellement différents (ex. deux adaptations distinctes d'une même œuvre) ; la correspondance de texte n'est pas assez fiable pour une action automatique et irréversible sur l'affichage
- Mettre en valeur automatiquement le tag de la relation "principale" (le ship) d'une fic — AO3 ne marque nulle part quelle relation est "principale" dans le HTML d'un blurb ; l'ordre des tags n'est pas garanti signifiant, deviner serait souvent faux
- Créer ses propres badges d'avertissement personnalisés — les Archive Warnings sont une taxonomie officielle fixe d'AO3 ; laisser inventer de nouvelles catégories de badges brouillerait la frontière entre un avertissement officiel et une étiquette personnelle (même raisonnement éthique que les jauges d'intensité ci-dessus)
- Réordonner les tags de plusieurs fics d'un coup — pas de UI naturelle pour ça (l'ordre se choisit sur la page de l'œuvre elle-même, et chaque œuvre a des tags différents) ; l'export/import JSON par œuvre couvre déjà le besoin de sauvegarde/transfert

## Précision

⚠️ La doc historique anglaise décrivait `tagsReordering.js` et
`tagsVisibility.js` comme des stubs vides ("planned, not implemented"). Ce
n'est plus le cas : les deux sont aujourd'hui pleinement codés dans ce
module.

⚠️ Les blocs ASCII ci-dessous (à partir de "AO3 Helper - Tags Display Module
Coordinator") sont un ancien format de doc conservé tel quel pour
l'historique technique détaillé de chaque sous-module — mais **les sections
"Réglages utilisateur" et "Fichiers" en haut de ce document sont la source à
jour** après le passage Chantier 4 qui a ajouté `externalTagLinks.js`,
`tagSeparatorStyle.js` et `tagImportancePromotion.js`, et une bonne dizaine
de nouveaux réglages. Le tableau Submodules/Settings juste en dessous a été
mis à jour ; le reste des blocs ASCII plus bas ne l'a pas été systématiquement
et peut décrire un état plus ancien de `archiveWarningsDisplay`,
`autoHideNoiseTags`, `compactMode`, `tagHighlighting`, `tagsReordering` et
`tagsVisibility`.



AO3 Helper - Tags Display Module Coordinator
    Module ID: tagsDisplay
    Display Name: Tags Display
    Tab: Browse

    Submodules (Tier 2 — imported by this coordinator, self-register with
    parent: 'tagsDisplay', then boot automatically through the cascade logic
    built into core/lifecycle.js's bootOne()):
        1. archiveWarningsDisplay   — compact icons for archive warnings + confirm-before-open
        2. autoHideNoiseTags        — hides self-deprecating freeform tags (hide or blur)
        3. compactMode              — collapses tags/summaries per-category, expand on hover/scroll/Alt+T
        4. tagHighlighting          — highlight favourite tags by pattern (wildcards, palettes, styles)
        5. tagsReordering           — drag-and-drop + auto-sort + import/export tag order on work pages
        6. tagsVisibility           — truncate long tag lists + hide whole categories on listing pages
        7. externalTagLinks         — Fanlore/TV Tropes search links appended to tags
        8. tagSeparatorStyle        — custom separator between displayed tags
        9. tagImportancePromotion   — promotes highlighted tags within their category on listings

    Settings (synced from panel → Flags before cascade) — see "Réglages
    utilisateur" at the top of this document for the full, current list.

    Storage key: mod:tagsDisplay:settings (JSON, written by panel)




    AO3 Helper - Archive Warnings Display Submodule
    Submodule ID: archiveWarningsDisplay
    Parent: tagsDisplay
    Display Name: Archive Warnings Display

    Replaces verbose AO3 archive warning text with compact, recognizable icons.
    This is a UX polish feature for faster scanning, not a filtering system.

    Features:
      - compactWarnings  : replace warning text with icons (master toggle)
      - archiveWarningsStyle : 'icon' | 'text' | 'badge' (default: 'icon')

    Fixed icon set (not customizable):
        ⚠️  Graphic Depictions Of Violence
        💀  Major Character Death
        🚫  Underage
        ⛔  Rape/Non-Con
        ❓  Creator Chose Not To Use Archive Warnings (always full text)
        ✓   No Archive Warnings Apply

    Accessibility: aria-label + title + tabindex=0 on every icon.
    MutationObserver: scans new nodes added to #main.



    AO3 Helper - Auto Hide Noise Tags Submodule
    Submodule ID: autoHideNoiseTags
    Parent: tagsDisplay
    Display Name: Auto Hide Noise Tags

    Hides self-deprecating / low-signal freeform tags automatically.
    Uses substring matching against a fixed default pattern list.
    Tags are hidden (display:none on the parent <li>) and can be restored.

    Features:
      - autoHideNoiseTags : master toggle (default: false)

    DOM side-effects:
      - Class `ao3h-noise-tag-hidden` on the <li> wrapping a matched tag
      - Attribute `data-ao3h-noise-checked` on each scanned <a> tag
      - Class `ao3h-noise-filter-on` on <html> while active

    MutationObserver: watches #main for new blurbs.


    AO3 Helper - Compact Mode Tags Submodule
    Submodule ID: compactMode
    Parent: tagsDisplay
    Display Name: Compact Mode

    Collapses tags and summaries in work listings. On hover, they expand
    smoothly via CSS transition. Pure CSS solution — no DOM mutation needed.

    Features:
      - compactMode : master toggle (default: false)

    DOM side-effects:
      - Class `ao3h-compact-mode-on` on <html> while active
      - CSS rules live in tagsDisplay.css (scoped to .ao3h-compact-mode-on)

    CSS behaviour:
      - Collapsed: max-height 0, opacity 0.3, overflow hidden
      - Expanded (hover): max-height 500px, opacity 1, 0.3s ease



         AO3 Helper — Tag Highlighting Submodule
   Submodule ID : tagHighlighting
   Parent        : tagsDisplay

   What it does:
     On listing pages, highlights tags the user has marked as "favourites".
     Favourite tags are stored in localStorage as an array of
     { pattern, color } objects.  Colour is one of 6 presets defined
     in the panel config.

   Settings (from tagsDisplay config.js):
     highlightFavoriteTags — master toggle (default true)

   Storage:
     ao3h:tagHighlights — JSON array [{ pattern: "Enemies to Lovers", color: "#fef08a" }, …]

   Quick-add:
     Right-click a tag → small context menu "Highlight this tag" with colour swatches.

   Fusionné avec l'ex-fandomHighlighting (appearance/visualPreferences) —
   shared.md, décision produit K4 : les deux modules surlignaient des tags
   favoris par correspondance de texte, avec deux stockages et deux UX
   (fandomHighlighting était console-only, sans entrée dans le panneau).
   Le sélecteur couvre désormais aussi les tags de fandom, et les entrées de
   l'ancienne clé ao3h:fandomHighlights sont importées une seule fois vers
   ao3h:tagHighlights au premier démarrage après mise à jour.
   ⚠️ Non testé en conditions réelles sur AO3.



   AO3 Helper - Tags Reordering Submodule
    Submodule ID: tagsReordering
    Parent: tagsDisplay
    Display Name: Tags Reordering

    On work pages, lets the user drag-and-drop tags within each tag category
    (fandom, character, relationship, freeform). Order is persisted per-work
    in localStorage and restored on next visit. A "Reset order" button appears
    when a saved order exists.

    Features:
      - tagsReordering : master toggle (default: false)

    Storage keys (per work × tag type):
      ao3h:tagsDisplay:order:[workId]:[tagType]  — array of tag names, in order

    Utilise lib/ui/drag-reorder.js (makeListReorderable) — fusionné avec
    l'implémentation de ficActions (shared.md, T1). Le bouton "Reset order"
    a nécessité d'étendre la lib avec cleanup.resetToOriginal().
    ⚠️ Non testé en conditions réelles sur AO3. La clé de stockage garde le
    même nom mais change de format (index numériques → noms de tags) ; un
    ordre déjà sauvegardé par un utilisateur ne sera pas retrouvé une fois
    (retombe sur l'ordre par défaut, pas de casse).



    AO3 Helper - Tags Visibility Submodule
    Submodule ID: tagsVisibility
    Parent: tagsDisplay
    Display Name: Tags Visibility

    On listing pages, truncates long tag lists to a configurable maximum
    (default 5). Hidden tags are the lowest-priority ones first
    (freeforms before characters, characters before relationships, etc.).
    A "+N more tags" button reveals them; "– Show less" collapses again.

    Features:
      - tagsVisibility  : master toggle (default: false)
      - maxTagsVisible  : number of tags to show per blurb (default: 5)

    MutationObserver: watches #main for newly added blurbs.


    
═══════════════════════════════════════════════════════════════════════════
  # tagsDisplay
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Tags Display** regroupe plusieurs améliorations indépendantes destinées à rendre les tags d'AO3 plus lisibles, plus compacts et plus faciles à manipuler.

* Il permet notamment de :
  - remplacer les avertissements AO3 par des icônes plus lisibles ;
  - masquer automatiquement les tags peu utiles ;
  - afficher les tags en mode compact ;
  - mettre en évidence les tags favoris ;
  - réorganiser les tags d'une œuvre par glisser-déposer ;
  - masquer les tags excédentaires sur les listes de fics.

Toutes ces fonctionnalités sont indépendantes et peuvent être activées ou désactivées séparément.

---

# Réglages utilisateur

| Réglage                 | Description                                                                     |
|-------------------------|---------------------------------------------------------------------------------|
| `archiveWarningsStyle`  | Définit le style d'affichage des avertissements (icône, texte abrégé ou badge). |
| `compactWarnings`       | Active l'affichage des avertissements sous forme d'icônes.                      |
| `autoHideNoiseTags`     |  Masque automatiquement certains tags considérés comme du bruit.                |
| `compactMode`           | Réduit la hauteur des tags et des résumés jusqu'au survol.                      |
| `highlightFavoriteTags` | Met en évidence les tags favoris.                                               |
| `highlightColor`        |  Couleur utilisée par défaut lors d'un surlignage rapide.                       |
| `maxTagsVisible`        |  Nombre maximum de tags affichés avant de masquer les suivants (`0` = tous).    |

---

# Structure du module

Le module est composé de six sous-modules fonctionnels ainsi qu'une feuille de style.

```
_tagsDisplay.js
archiveWarningsDisplay.js
autoHideNoiseTags.js
noiseTagUtils.js       (détection, mots personnalisés, révélation et exceptions d’auteurs)
compactModeTags.js
tagHighlighting.js
tagRules.js            (catégories, tri et correspondance des surlignages)
tagsReordering.js
tagsVisibility.js
tagsDisplay.css
```

---

# _tagsDisplay.js

## Rôle

Fichier coordinateur du module.

Il initialise l'ensemble des sous-modules, synchronise leurs réglages et sert de point d'entrée unique pour toutes les fonctionnalités liées à l'affichage des tags.

## Responsabilités

- Initialise les six sous-modules.
- Synchronise les réglages provenant du panneau de configuration.
- Distribue les paramètres aux différents sous-modules.
- Coordonne leur démarrage via le système de lifecycle d'AO3 Helper.

## Fonctions exposées

Le coordinateur :

- initialise le module ;
- transmet les réglages utilisateur ;
- assure la communication avec le reste de l'extension.

---

# archiveWarningsDisplay.js

## Rôle

Remplace les longs avertissements AO3 par une représentation plus compacte afin de rendre les listes de fics plus faciles à parcourir.

Cette fonctionnalité améliore uniquement la lisibilité et ne modifie jamais les avertissements eux-mêmes.

---

## Fonctionnalités

### Affichage compact

Le module remplace les avertissements standards par des représentations plus courtes.

Trois modes d'affichage sont disponibles :

- Icône seule
- Texte abrégé
- Badge (icône + texte)

Le style est contrôlé par le réglage :

`archiveWarningsStyle`

---

### Jeu d'icônes

Les avertissements utilisent un ensemble fixe d'icônes :

| Avertissement | Icône |
|---------------|-------|
| Graphic Depictions of Violence | ⚠️ |
| Major Character Death | 💀 |
| Underage | 🚫 |
| Rape / Non-Con | ⛔ |
| No Archive Warnings Apply | ✓ |

Le texte **Creator Chose Not To Use Archive Warnings** reste toujours affiché en entier et n'est jamais remplacé par une icône.

---

### Activation

L'ensemble du système peut être activé ou désactivé grâce au réglage :

`compactWarnings`

Lorsque cette option est désactivée, AO3 retrouve immédiatement son affichage d'origine.

---

### Compatibilité avec le contenu dynamique

Le module détecte automatiquement les nouvelles œuvres ajoutées à la page et applique les icônes aux avertissements nouvellement insérés.

---

## Détails techniques

### Accessibilité

Chaque icône possède :

- un `aria-label` ;
- un attribut `title` ;
- un `tabindex="0"`.

---

### Observation du DOM

Le module utilise un `MutationObserver` afin de surveiller les nouveaux éléments ajoutés sous `#main`.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il fonctionne indépendamment des autres systèmes d'affichage des tags.

---

# autoHideNoiseTags.js

## Rôle

Masque automatiquement certains tags libres qui apportent peu d'information à la recherche ou à la lecture.

Le module repose sur une liste prédéfinie d'expressions considérées comme du bruit.

---

## Fonctionnalités

### Détection automatique

Le module compare chaque tag libre à une liste d'environ vingt-cinq expressions connues.

Exemples :

- idk
- first fic pls be nice
- unbetaed

La détection repose sur une recherche par sous-chaîne.

---

### Masquage

Lorsqu'un tag correspond à la liste :

- son élément `<li>` est masqué ;
- les autres tags restent inchangés ;
- le filtrage est entièrement réversible.

---

### Activation

Le comportement est contrôlé par le réglage :

`autoHideNoiseTags`

Lorsque cette option est désactivée, tous les tags redeviennent immédiatement visibles.

---

### Compatibilité avec le contenu dynamique

Le module détecte automatiquement les nouvelles œuvres ajoutées aux listes et applique le filtrage sans rechargement de la page.

---

## Détails techniques

### Effets sur le DOM

Le module ajoute notamment :

- la classe `ao3h-noise-tag-hidden` sur les tags masqués ;
- l'attribut `data-ao3h-noise-checked` sur les tags déjà analysés ;
- la classe `ao3h-noise-filter-on` sur `<html>` lorsque le filtre est actif.

---

### Observation du DOM

Le module utilise un `MutationObserver` afin de surveiller les nouveaux blurbs ajoutés dans `#main`.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il fonctionne indépendamment des autres fonctionnalités du module.


# compactModeTags.js

## Rôle

Réduit temporairement l'espace occupé par les tags et les résumés dans les listes d'œuvres.

Le contenu reste présent dans la page, mais il est replié jusqu'au passage de la souris.

---

## Fonctionnalités

### Mode compact

Lorsque le mode compact est activé :

- les listes de tags sont repliées ;
- les résumés sont repliés ;
- leur hauteur devient presque nulle ;
- leur opacité est réduite ;
- l'espace occupé par chaque œuvre diminue.

---

### Déploiement au survol

Lorsqu'un utilisateur passe la souris sur une œuvre :

- les tags réapparaissent ;
- le résumé se déploie ;
- la hauteur augmente progressivement ;
- l'opacité revient à la normale.

Le déploiement utilise une transition fluide.

---

### Activation

Le comportement est contrôlé par le réglage :

`compactMode`

Lorsque cette option est désactivée, les tags et les résumés retrouvent immédiatement leur affichage normal.

---

## Détails techniques

### Fonctionnement CSS

Le sous-module repose principalement sur des règles CSS et ne modifie pas directement la structure du DOM.

Lorsque le mode est actif, la classe suivante est ajoutée à l'élément `<html>` :

`ao3h-compact-mode-on`

Les règles CSS associées sont définies dans `tagsDisplay.css`.

---

### État replié

Les éléments repliés utilisent notamment :

- `max-height: 0`
- `opacity: 0.3`
- `overflow: hidden`

---

### État déployé

Au survol, les éléments utilisent notamment :

- `max-height: 500px`
- `opacity: 1`
- une transition de `0.3s ease`

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il dépend de `tagsDisplay.css` pour l'ensemble de son comportement visuel.

---

# tagHighlighting.js

## Rôle

Met en évidence les tags que l'utilisateur considère comme favoris ou importants.

Le système fonctionne par correspondance de texte et prend également en charge les tags de fandom.

---

## Fonctionnalités

### Surlignage automatique

Le module analyse les tags affichés dans les listes d'œuvres.

Lorsqu'un tag correspond à une règle enregistrée :

- il reçoit une couleur de fond ;
- il devient plus facile à repérer ;
- le surlignage est appliqué automatiquement sur toutes les pages compatibles.

---

### Tags favoris

Les règles de surlignage sont enregistrées sous la forme suivante :

```js
{
  pattern: "Enemies to Lovers",
  color: "#fef08a"
}
```

Chaque règle contient :

- un motif de texte ;
- une couleur associée.

---

### Activation

Le comportement est contrôlé par le réglage :

`highlightFavoriteTags`

Lorsque cette option est désactivée, aucun surlignage n'est appliqué.

---

### Couleur par défaut

Le réglage :

`highlightColor`

détermine la couleur utilisée par défaut lors de l'ajout rapide d'un nouveau tag favori.

---

### Ajout rapide

Un clic droit sur un tag ouvre un petit menu contextuel.

Ce menu permet :

- de choisir une couleur parmi six couleurs prédéfinies ;
- d'ajouter immédiatement le tag à la liste des favoris ;
- d'appliquer le surlignage sans ouvrir le panneau de configuration.

---

### Prise en charge des fandoms

Le module s'applique également aux tags de fandom.

Cette fonctionnalité remplace l'ancien module `fandomHighlighting` provenant de `appearance/visualPreferences`.

Les deux systèmes remplissaient la même fonction, mais utilisaient auparavant :

- deux stockages différents ;
- deux interfaces différentes ;
- deux logiques de surlignage séparées.

Ils ont été fusionnés dans `tagHighlighting.js`.

---

### Migration des anciennes données

Lors du premier démarrage après la mise à jour, le module importe les anciennes données enregistrées sous la clé :

`ao3h:fandomHighlights`

Les données sont transférées vers :

`ao3h:tagHighlights`

Cette migration ne s'exécute qu'une seule fois.

---

## Détails techniques

### Stockage

Les règles sont enregistrées dans `localStorage` sous la clé :

`ao3h:tagHighlights`

Le format utilisé est un tableau JSON :

```js
[
  {
    pattern: "Enemies to Lovers",
    color: "#fef08a"
  }
]
```

---

### Correspondance

Le module applique les règles en comparant le texte des tags aux motifs enregistrés.

---

### État des tests

Le sous-module n'a pas encore été testé en conditions réelles sur AO3.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il remplace également les responsabilités de l'ancien module `fandomHighlighting`.

# tagsReordering.js

## Rôle

Permet de réorganiser manuellement les tags d'une œuvre directement sur sa page grâce au glisser-déposer.

L'ordre choisi est enregistré individuellement pour chaque œuvre et est automatiquement restauré lors des prochaines visites.

---

## Fonctionnalités

### Réorganisation des tags

Le module permet de déplacer les tags à la souris.

Les tags peuvent être réorganisés indépendamment dans chacune des catégories AO3 :

- Fandoms
- Relationships
- Characters
- Freeform Tags

Chaque catégorie conserve son propre ordre.

---

### Glisser-déposer

Le système utilise un mécanisme de drag-and-drop permettant :

- de déplacer un tag ;
- de modifier sa position ;
- de mettre immédiatement l'affichage à jour.

Le comportement reste limité à la catégorie concernée : un tag ne peut pas être déplacé vers une autre catégorie.

---

### Sauvegarde automatique

Chaque modification est automatiquement enregistrée.

Le module mémorise :

- l'identifiant de l'œuvre ;
- la catégorie concernée ;
- le nouvel ordre des tags.

Cet ordre est automatiquement restauré lors des prochaines visites de la même œuvre.

---

### Réinitialisation

Lorsqu'un ordre personnalisé existe, un bouton :

**Reset order**

apparaît automatiquement.

Ce bouton :

- supprime l'ordre personnalisé ;
- restaure immédiatement l'ordre original d'AO3.

---

### Persistance

Chaque œuvre possède son propre ordre personnalisé.

Modifier les tags d'une œuvre n'a aucun effet sur les autres œuvres.

---

## Détails techniques

### Stockage

Les données sont enregistrées dans `localStorage` avec une clé construite selon le format :

```
ao3h:tagsDisplay:order:[workId]:[tagType]
```

Chaque entrée contient un tableau de noms de tags dans leur nouvel ordre.

---

### Bibliothèque partagée

Le module utilise :

`lib/ui/drag-reorder.js`

et plus précisément :

`makeListReorderable()`

La fonctionnalité **Reset order** a nécessité l'ajout de :

`cleanup.resetToOriginal()`

dans cette bibliothèque partagée.

---

### Migration

Les anciennes sauvegardes utilisaient des index numériques.

Le nouveau système enregistre directement les noms des tags.

Conséquence :

- les anciens ordres personnalisés ne sont pas récupérés après la mise à jour ;
- les utilisateurs retrouvent simplement l'ordre par défaut une seule fois.

Aucune donnée critique n'est perdue.

---

### État des tests

Le sous-module n'a pas encore été testé en conditions réelles sur AO3.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il repose sur la bibliothèque partagée `drag-reorder.js` pour l'ensemble des opérations de glisser-déposer.

---

# tagsVisibility.js

## Rôle

Réduit automatiquement la longueur des listes de tags sur les pages contenant de nombreuses œuvres.

Lorsque le nombre de tags dépasse une limite définie par l'utilisateur, les moins importants sont masqués afin de conserver des listes plus compactes.

---

## Fonctionnalités

### Limitation du nombre de tags

Le module peut limiter le nombre de tags affichés pour chaque œuvre.

Le nombre maximal est défini par le réglage :

`maxTagsVisible`

Les valeurs proposées sont notamment :

- 0 (tous les tags)
- 5
- 10
- 15

---

### Priorité des tags

Lorsque tous les tags ne peuvent pas être affichés, le module masque les catégories dans l'ordre suivant :

1. Freeform Tags
2. Characters
3. Relationships
4. Archive Warnings

Les informations jugées les plus importantes restent donc visibles le plus longtemps possible.

---

### Affichage du bouton

Lorsque des tags sont masqués, un bouton apparaît automatiquement.

Le bouton affiche :

```
+N more tags
```

où **N** représente le nombre de tags actuellement cachés.

---

### Déploiement

Un clic sur :

```
+N more tags
```

affiche immédiatement tous les tags.

Le bouton devient alors :

```
– Show less
```

qui permet de revenir à l'affichage compact.

---

### Compatibilité avec le contenu dynamique

Le module détecte automatiquement les nouvelles œuvres ajoutées dans les listes.

Les nouvelles œuvres reçoivent automatiquement le même traitement sans rechargement de la page.

---

## Détails techniques

### Activation

Le comportement est contrôlé par deux réglages :

- `tagsVisibility`
- `maxTagsVisible`

---

### Observation du DOM

Le module utilise un `MutationObserver` afin de surveiller les nouveaux blurbs ajoutés sous `#main`.

---

### État du projet

La documentation historique indiquait que ce sous-module était uniquement prévu mais non implémenté.

Ce n'est plus le cas.

Le module est désormais entièrement développé et fonctionnel.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il fonctionne indépendamment des autres systèmes d'affichage des tags.

# tagsDisplay.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Tags Display**.

Il définit notamment l'apparence :

- des icônes d'avertissements ;
- du mode compact ;
- des tags surlignés ;
- des éléments réorganisables ;
- des boutons permettant d'afficher ou masquer les tags.

---

# Fonctionnalités non implémentées

Chantier 4 (voir le plan) a traité l'intégralité de cette liste : chaque
sous-section ci-dessous a été soit codée (✅), soit déplacée vers "Décisions
de conception" avec sa raison. Conservé pour l'historique.

---

## Archive Warnings

### Gravité des avertissements

> Fonctionnalité volontairement abandonnée afin de conserver une présentation neutre des avertissements AO3.

---

### ~~Confirmation avant ouverture~~ ✅

Réglage `confirmSensitiveWarnings` : demande confirmation avant d'ouvrir une œuvre taguée
Violence, Major Character Death, Underage ou Rape/Non-Con. Fonctionne indépendamment de
l'affichage en icônes (marche même si `compactWarnings` est désactivé). Détection dans
`archiveWarningsDisplay.js`.

---

### ~~Affichage au survol~~ ✅

C'était déjà le comportement du style `icon` existant : icône seule, avec le nom complet de
l'avertissement disponible via l'attribut `title` (infobulle native du navigateur au survol).
Rien à coder — juste rendu explicite dans la description du réglage.

---

### Badges personnalisés

> Déplacé vers "Décisions de conception" — voir Archive Warnings officiels.

---

## Noise Tags

### ~~Liste personnalisée~~ ✅ *(scope final)*

- ~~l'ajout de nouvelles expressions~~ ✅ — panneau "Your own noise words", stockées dans
  `ao3h:tagsDisplay:customNoiseWords` et fusionnées avec la liste intégrée (`noiseTagUtils.js`).
- ~~des règles différentes selon l'auteur de la fic~~ ✅ *(scope réduit à une liste d'exceptions)* —
  `autoHideNoiseTags.js` : un auteur ajouté à la liste garde tous ses tags visibles.
- plusieurs niveaux de gravité — déplacé vers "Décisions de conception" (jugé disproportionné).

---

### ~~Réaffichage individuel~~ ✅

Ajouté : une puce "show hidden tag" apparaît sur chaque tag masqué par le filtre anti-bruit.
Cliquer dessus le révèle individuellement (pour la page en cours), sans désactiver le filtre
ni toucher aux autres tags cachés. Elle porte aussi un aperçu du texte caché via `title` (voir
"Aperçu rapide" plus bas).

---

### Liste communautaire

> Déplacé vers "Décisions de conception" — nécessite un backend qui n'existe pas.

---

### ~~Exportation~~ ✅

Boutons Import/Export (JSON) dans le panneau, à côté de la liste des mots "bruit" personnalisés.

---

## Compact Mode

### ~~Repli par catégorie~~ ✅

Chaque catégorie (warnings/relationships/characters/freeforms) et le résumé se replient
maintenant indépendamment, au lieu d'un seul bloc commun. Réglages `compactCat*` (un par
catégorie, tous activés par défaut).

---

### ~~Déploiement sélectif~~ ✅

Une catégorie décochée dans les réglages `compactCat*` n'est jamais repliée — toujours affichée
en entier. Couvre le besoin ("juste les relations, par exemple") en le retournant : on choisit
ce qui reste replié plutôt que ce qui se déplie.

---

### ~~Déploiement automatique~~ ✅

Réglage `compactModeAutoExpandScroll` : un `IntersectionObserver` déplie chaque œuvre dès
qu'elle entre dans la zone visible de l'écran, sans avoir à passer la souris dessus.

---

### ~~Raccourci clavier~~ ✅

**Alt+T** replie/déplie tout d'un coup (`compactModeTags.js`), en ignorant les frappes
faites dans un champ de texte.

---

### ~~Mémorisation~~ ✅ *(scope réduit)*

L'état du raccourci Alt+T ("tout ouvert" ou non) est mémorisé par page (URL, `localStorage`)
et restauré à la prochaine visite. L'expansion individuelle au survol reste volontairement
transitoire : ce n'est pas un choix à mémoriser, c'est un survol.

---

### ~~Aperçu rapide~~ ✅

La puce de réaffichage d'un tag caché par le filtre anti-bruit (voir Noise Tags plus haut)
porte le texte complet du tag dans son attribut `title`, visible au survol sans avoir à cliquer.

---

## Tag Highlighting

### ~~Styles avancés~~ ✅

Réglage `highlightStyle` : fond plein (défaut), bordure seule, gras, italique, ou symbole ★
devant le tag.

---

### ~~Palettes prédéfinies~~ ✅

Réglage `highlightPalette` : Default, Pastel, Néon, Classique (`tagHighlighting.js`).

---

### ~~Correspondances avancées~~ ✅

Un motif peut contenir `*` comme joker (ex. `"Alternate Universe -*"` surligne toutes les
variantes d'AU) — `tagRules.js`.

---

### ~~Import / Export~~ ✅

Boutons Import/Export (JSON) dans le panneau.

---

### ~~Priorité des règles~~ ✅

La priorité suit l'ordre du tableau de règles : la première règle qui correspond à un tag
gagne (documenté dans la description du réglage `highlightStyle` du panneau).

---

## Informations sur les tags

### Tag officiel

> Déplacé vers "Décisions de conception" — information non disponible sans requête réseau par tag.

---

### Informations supplémentaires

> Déplacé vers "Décisions de conception" — même limite (wrangler non exposé publiquement).

---

### Relations entre tags

> Déplacé vers "Décisions de conception" — pas de base de données de relations entre tags côté client.

---

### ~~Intégration avec la recherche~~ ✅ *(scope réduit)*

Bouton "🔍 Search AO3 with these tags" dans le panneau : lance une recherche AO3 combinant
tous les tags actuellement surlignés. Pas d'intégration plus poussée avec d'autres outils de
recherche du module (aucun autre outil de ce type n'existe dans `tagsDisplay`).

---

### ~~Liens externes~~ ✅

`externalTagLinks.js` ajoute deux petites icônes après chaque tag : 📖 Fanlore (recherche
MediaWiki) et 🌀 TV Tropes.

---

## Tags Reordering

### ~~Tri automatique~~ ✅

Trois boutons par catégorie : alphabétique (A→Z), par longueur, et "★ Important first" (tags
surlignés d'abord) — `tagRules.js`.

---

### ~~Import / Export~~ ✅

Export/import de l'ordre complet d'une œuvre (toutes catégories) en JSON.

---

### Réorganisation multiple

> Déplacé vers "Décisions de conception" — pas de UI naturelle pour un réordonnancement en masse.

---

## Tags Visibility

### ~~Filtrage des catégories~~ ✅

Réglages `hideTags*` (un par catégorie) : masque une catégorie de tags en entier sur les
listes, en plus (et indépendamment) de la limite `maxTagsVisible` — `tagRules.js`.

---

### ~~Séparateurs personnalisés~~ ✅

Réglage `tagSeparator` — remplace la virgule AO3 par défaut. `tagSeparatorStyle.js` /
`tagSeparatorStyle.js`.

---

## Gestion des fandoms

### Nettoyage automatique

> Déplacé vers "Décisions de conception" — risque de fusionner par erreur des fandoms différents.

---

### Relation principale

> Déplacé vers "Décisions de conception" — AO3 ne marque aucune relation comme "principale".

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Catégorisation des tags sur les listes

Le module ne tente pas de reconstruire les catégories AO3 (Fandom, Characters, Relationships, etc.) directement sur les pages de résultats.

Cette approche a été abandonnée car il était difficile d'identifier correctement chaque catégorie de manière fiable.

---

## Identifiants techniques

Les identifiants internes des tags AO3 ne sont pas affichés.

Cette information est principalement utile aux développeurs et n'apporte que peu d'intérêt aux lecteurs.

---

## Évaluation automatique du contenu

Le module ne tente pas d'évaluer automatiquement :

- le niveau de violence ;
- le niveau de sexualité ;
- l'intensité émotionnelle.

Cette approche a été écartée afin de respecter la classification choisie par les auteurs et d'éviter toute interprétation subjective.

---

## Définitions communautaires

Le module ne permet pas aux utilisateurs d'écrire des définitions collaboratives pour les tags.

Cette fonctionnalité a été jugée trop ambitieuse pour les objectifs du module.

---

## Niveaux de gravité pour les mots "bruit"

Le filtre anti-bruit ne propose pas plusieurs niveaux de gravité pour les mots personnalisés.

C'est un filtre pour une trentaine d'expressions anodines ("idk", "pls be nice", "unbetaed") —
pas un système de modération de contenu. Un simple oui/non par mot (ajouté ou non à la liste)
couvre le besoin réel sans complexité supplémentaire.

---

## Statut officiel / synonyme d'un tag

Le module n'affiche pas si un tag est "officiel" (canonique) sur AO3 ou juste une variante/synonyme.

Cette information n'est pas présente dans le HTML des pages de listing ou d'œuvre — seulement
sur les pages de recherche de tags d'AO3 (`/tags/search`), qu'il faudrait interroger une par
une pour chaque tag affiché. Coût réseau et complexité disproportionnés pour une info cosmétique.

---

## Informations sur le wrangler d'un tag

Le module n'affiche pas d'informations sur la personne qui gère (wrangle) un tag.

Même limite que le statut officiel/synonyme ci-dessus : cette information n'est pas exposée
publiquement sur les pages où le module s'exécute.

---

## Carte des relations entre tags

Le module ne propose pas de visualisation des tags proches ou similaires entre eux.

Nécessiterait une base de données de relations entre tags qui n'existe nulle part côté client —
hors de portée d'une extension de navigateur sans service en ligne dédié.

---

## Liste de mots "bruit" communautaire

Le module ne permet pas de partager ou récupérer des listes de mots "bruit" créées par d'autres
utilisateurs.

Nécessiterait un serveur/backend partagé. AO3 Helper reste une extension 100% côté client, sans
service en ligne à elle — même raisonnement que pour les définitions de tags communautaires
ci-dessus.

---

## Nettoyage automatique des variantes de fandom

Le module ne fusionne pas automatiquement les noms de fandoms qui existent sous plusieurs
variantes ou en double.

Risque réel de fusionner par erreur des fandoms réellement différents (par exemple deux
adaptations distinctes d'une même œuvre source). La correspondance de texte n'est pas assez
fiable pour une action automatique et irréversible sur l'affichage.

---

## Mise en évidence automatique de la relation principale

Le module ne met pas en évidence automatiquement le tag de la relation "principale" (le ship)
d'une œuvre.

AO3 ne marque nulle part quelle relation est "principale" dans le HTML d'un blurb ; l'ordre des
tags n'est pas garanti signifiant. Deviner produirait souvent un résultat faux ou trompeur.

---

## Badges d'avertissement personnalisés

Le module ne permet pas de créer de nouvelles catégories de badges d'avertissement.

Les Archive Warnings sont une taxonomie officielle fixe d'AO3. Laisser inventer de nouvelles
catégories de badges brouillerait la frontière entre un avertissement officiel et une étiquette
personnelle — même raisonnement éthique que pour l'évaluation automatique du contenu ci-dessus.

---

## Réordonnancement des tags sur plusieurs œuvres à la fois

Le module ne permet pas de modifier l'ordre des tags de plusieurs œuvres en une seule action.

Pas de UI naturelle pour ça : l'ordre se choisit sur la page de l'œuvre elle-même, et chaque
œuvre a un jeu de tags différent. L'export/import JSON par œuvre couvre déjà le besoin de
sauvegarde et de transfert d'un ordre personnalisé.

---

## État du module

La documentation historique indiquait que `tagsReordering.js` et `tagsVisibility.js` étaient uniquement prévus mais non implémentés.

Ce n'est plus le cas.

Ces deux sous-modules sont désormais pleinement développés et intégrés au module **Tags Display**.
