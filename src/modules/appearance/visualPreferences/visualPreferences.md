# visualPreferences

**Tab:** Appearance & Tools

## À quoi ça sert

Ce module permet de cacher les statistiques qui peuvent mettre la pression
ou pousser à comparer (kudos, hits, commentaires...) pour une lecture plus
calme, et de personnaliser l'affichage général d'AO3 : dates, en-tête.

⚠️ La mise en valeur de fandoms choisis, autrefois ici (`fandomHighlighting.js`),
a été fusionnée dans `browse/tagsDisplay/tagHighlighting.js` — même fonction
que le surlignage de tags favoris de ce module, avec en plus une interface
(clic droit sur un tag) là où l'ancienne version ne se pilotait que depuis la
console du navigateur.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `hideWordCount` | désactivé | Cache le nombre de mots |
| `hideKudosCount` | désactivé | Cache le nombre de kudos |
| `hideCommentsCount` | désactivé | Cache le nombre de commentaires |
| `hideBookmarksCount` | désactivé | Cache le nombre de favoris |
| `hideHits` | désactivé | Cache le nombre de vues |
| `hidePublishedDate` | désactivé | Cache la date de publication |
| `hideUpdatedDate` | désactivé | Cache la date de mise à jour |
| `hideCompletedDate` | désactivé | Cache la date de fin |
| `hideChapterDates` | désactivé | Cache les dates par chapitre |
| `minimalHeader` | désactivé | Réduit la bannière du site en haut de la page |
| `hideStatsOnChaptersList` | désactivé | Cache les statistiques dans le menu déroulant des chapitres |
| `statsAsIcons` | désactivé | Affiche les statistiques sous forme d'icônes plutôt que de texte |
| `statsIconsMode` | `icons` | Icônes seules, ou icônes avec légende |
| `relativeDates` | désactivé | Affiche les dates de façon relative ("il y a 4 ans") plutôt qu'une date précise |
| `dateAgeColoring` | désactivé | Colore les dates selon leur ancienneté (aujourd'hui / semaine / mois / plus vieux) |
| `layoutDensity` | `comfortable` | Densité d'espacement des listes : compact / confortable / spacieux |
| `gridView` | désactivé | Affiche les listes de fics en grille de cartes plutôt qu'en liste |
| `blurbSectionOrder` | `header,tags,summary,stats` | L'ordre d'affichage des sections d'une fic dans les listes |
| `wordOccurrenceCounter` | désactivé | Sur une page de fic, ajoute un champ pour compter les occurrences d'un mot dans le texte |

## Fichiers

### 1. `_visualPreferences.js` — le chef d'orchestre

- Met en route les sept autres fichiers de ce module et garde les réglages en mémoire
- Propose des commandes dans la console du navigateur (`ao3hVisualPrefs`) pour changer un réglage ou appliquer un préréglage
- Récupère automatiquement les anciens réglages des modules qui ont été fusionnés dans celui-ci

### 2. `statsVisibility.js` — cacher les statistiques

- Peut cacher séparément le nombre de mots, de kudos, de commentaires, de favoris et de vues

### 3. `datesTimestamps.js` — cacher les dates

- Peut cacher séparément la date de publication, de mise à jour, de fin, et les dates par chapitre

### 4. `minimalHeader.js` — en-tête minimaliste

- Réduit la bannière du site en haut de la page

### 5. `statsDisplayFormat.js` — format d'affichage

- Peut afficher les statistiques sous forme d'icônes plutôt que de texte, avec ou sans légende
- Peut afficher les dates de façon relative ("il y a 4 ans") plutôt qu'une date précise
- Peut colorer les dates selon leur ancienneté (aujourd'hui / semaine / mois / plus vieux), y compris en même temps que l'affichage relatif

### 6. `hoverReveal.js` — révéler au survol

- Permet de voir une statistique ou une date cachée en passant la souris dessus — ça fonctionne automatiquement dès qu'un élément est caché, il n'y a pas de réglage séparé à activer

### 7. `visibilityPresets.js` — préréglages rapides

- Propose 5 préréglages tout prêts : Tout afficher, Cacher toutes les stats, Cacher toutes les dates, Mode sans influence, Lecture épurée

### 8. `statsOnChaptersList.js` — statistiques dans la liste des chapitres

- Peut cacher les statistiques affichées dans le menu déroulant des chapitres d'une fic

### 9. `layoutDensity.js` — densité de l'espacement

- Une seule case à trois positions (compact / confortable / spacieux) qui s'applique aux listes de fics et couvre à la fois "un mode compact pour les listings" et "un réglage de densité pour tout le site" — les deux idées se recoupaient, une seule implémentation suffit

### 10. `blurbSectionOrder.js` — ordre des sections d'une fic dans les listes

- Réorganise visuellement (via `order` CSS) le titre/en-tête, les tags, le résumé et les statistiques d'une fic dans les listes, selon l'ordre choisi
- Garde toujours ensemble chaque titre de section (invisible, pour les lecteurs d'écran) et son contenu, pour ne pas casser la navigation par landmarks

### 11. `gridView.js` — affichage en grille de cartes

- Transforme les listes de fics en grille de cartes qui s'adapte à la largeur de l'écran, sans toucher au contenu ni à l'ordre à l'intérieur de chaque fic

### 12. `wordOccurrenceCounter.js` et `wordOccurrenceMath.js` — compteur d'occurrences

- Sur la page d'une fic, ajoute un champ pour taper un nom de personnage (ou n'importe quel mot ou expression) et voir combien de fois il apparaît dans le texte des chapitres déjà chargés
- Compte en mot entier, insensible à la casse ; se souvient du dernier mot cherché

### 13. `dateAgeMath.js` — calcul de l'ancienneté d'une date

- Calcule si une date correspond à "aujourd'hui", "cette semaine", "ce mois-ci" ou "plus vieux", utilisé par `statsDisplayFormat.js` pour la coloration des dates

### 14. `visualPreferences.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :


- ~~Un mode compact pour les listings (favoris, historique, "à lire plus tard"...)~~ ✅
  Fait, fusionné avec le réglage de densité globale ci-dessous (`layoutDensity.js`) :
  les deux idées revenaient au même besoin, une seule case à trois positions
  (compact / confortable / spacieux) couvre les deux à la fois.

- ~~Réorganiser l'ordre des informations affichées sur les listes de fics (titre, résumé, tags, statistiques...)~~ ✅
  Fait : réglage `blurbSectionOrder` (texte séparé par des virgules,
  ex. `stats,tags,summary,header`), appliqué via `order` CSS
  (`blurbSectionOrder.js`). Chaque titre de section (invisible, pour les
  lecteurs d'écran) reste toujours collé à son contenu.

- ~~Colorer les dates selon leur ancienneté (aujourd'hui, cette semaine, plus vieux) plutôt que juste changer le texte~~ ✅
  Fait : réglage `dateAgeColoring` (`dateAgeMath.js` +
  `statsDisplayFormat.js`) — fonctionne sur les listes et les pages de fic,
  y compris en même temps que l'affichage en dates relatives.

- ~~Un réglage de densité pour tout le site (compact / confortable / spacieux), pas seulement pour les listings~~ ✅
  Fait : voir "mode compact pour les listings" ci-dessus — `layoutDensity.js`
  couvre les deux idées d'un seul coup.

- ~~Un affichage en grille de cartes (façon Pinterest) pour les résultats de recherche, en plus de la liste classique~~ ✅
  Fait : réglage `gridView` (`gridView.js`) — purement visuel (CSS), le
  contenu et l'ordre à l'intérieur de chaque fic ne changent pas.

- ~~Compter combien de fois le nom d'un personnage (ou un autre mot choisi) apparaît dans le texte d'une fic~~ ✅
  Fait : réglage `wordOccurrenceCounter` — champ de recherche sur la page
  d'une fic, comptage en mot entier insensible à la casse
  (`wordOccurrenceMath.js` + `wordOccurrenceCounter.js`).

---

~~- Cacher les images intégrées dans les fics — cette fonctionnalité existe bien dans l'extension, mais dans un autre module (readingFormatter), pas ici~~
~~- Avoir des règles pour cacher ou montrer une statistique seulement dans certains cas précis (par exemple selon le fandom ou la page) — pour l'instant, un réglage est activé ou désactivé partout, sans condition~~
~~- Cacher ou montrer les infos différemment selon que la fic est terminée ou en cours~~
~~- Un mode "impression" qui simplifie la page pour l'imprimer proprement~~
~~- Un mode "capture d'écran" qui cache temporairement les infos personnelles avant de prendre une photo de la page~~

## Explicitement écarté

- Des améliorations des résultats de recherche — jugé redondant, AO3 affiche déjà ces informations
- Pouvoir cacher les informations différemment pour chaque fic une par une — jugé trop compliqué à gérer, un seul réglage s'applique partout

/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences Module Coordinator
    Module ID: visualPreferences
    Display Name: Visual Preferences
    Tab: Appearance & Tools

    Submodules (imported directly as ES modules):
        1. statsVisibility      ./statsVisibility.js
        2. datesTimestamps      ./datesTimestamps.js
        3. minimalHeader        ./minimalHeader.js
        4. statsDisplayFormat   ./statsDisplayFormat.js
        5. hoverReveal          ./hoverReveal.js
        6. visibilityPresets    ./visibilityPresets.js
        7. statsOnChaptersList  ./statsOnChaptersList.js

    fandomHighlighting a été fusionné dans browse/tagsDisplay/tagHighlighting.js
    (shared.md, décision K4) — voir ce fichier pour la migration des données.

    Storage key: ao3h:mod:visualPreferences:settings
                 (legacy fallback: ao3h:visualPreferences)

    Public API (AO3H.visualPreferences / W.ao3hVisualPrefs):
        getState()
        setPreference(key, value)
        setPreferences(updates)
        applyPreset(presetId)
        getCurrentPreset()
        getPresets()
        reset()
        getKeys()



AO3 Helper - Dates & Timestamps Submodule
    Submodule ID: datesTimestamps
    Display Name: Dates & Timestamps
    Parent Module: visualPreferences

    Manages visibility of date information on AO3 (publication, update,
    completion, and chapter dates), each independently toggleable.

    Keys managed:
        - hidePublishedDate  → ao3h-hide-pub-date
        - hideUpdatedDate    → ao3h-hide-upd-date
        - hideCompletedDate  → ao3h-hide-comp-date
        - hideChapterDates   → ao3h-hide-chap-dates




AO3 Helper - Hover Reveal Submodule
    Submodule ID: hoverReveal
    Display Name: Hover Reveal
    Parent Module: visualPreferences

    Reveals hidden stats and dates on hover when they have been hidden by
    other visualPreferences submodules (statsVisibility, datesTimestamps).

    CSS rules live in visualPreferences.css (Section 06 — Hover Reveal).
    They are always present and activate automatically when the corresponding
    ao3h-hide-* class is on <html>.




/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Minimal Header Submodule
    Submodule ID: minimalHeader
    Display Name: Minimal Header
    Parent Module: visualPreferences

    Toggles a streamlined header style on AO3 by adding/removing the
    `ao3h-minimal-header` class on <html>. Visual rules live in
    visualPreferences.css (section « Header cleanup »).

    Keys managed:
        - minimalHeader → ao3h-minimal-header



AO3 Helper - Stats Display Format Submodule
    Submodule ID: statsDisplayFormat
    Display Name: Stats Display Format
    Parent Module: visualPreferences

    Controls how stats are displayed: numeric values, icons-only, or
    icons with text labels. Manages relative date formatting.

    Keys managed:
        - statsAsIcons    → display stats as emoji icons instead of text labels
        - statsIconsMode  → 'icons' (icons only) | 'icons-text' (icons + text)
        - relativeDates   → show relative date format ("4 years ago")



        AO3 Helper - Stats On Chapters List Submodule
    Submodule ID: statsOnChaptersList
    Display Name: Stats On Chapters List
    Parent Module: visualPreferences

    Hides statistics (word counts, dates, comment counts) in the chapter
    listing of a work page.

    Key managed:
        - hideStatsOnChaptersList → ao3h-hide-chap-stats


        AO3 Helper - Stats Visibility Submodule
    Submodule ID: statsVisibility
    Display Name: Stats Visibility
    Parent Module: visualPreferences

    Manages visibility of engagement stats on AO3 work listings and pages.
    Each stat toggle applies a CSS class to document.documentElement.

    Keys managed:
        - hideWordCount     → ao3h-hide-wc
        - hideKudosCount    → ao3h-hide-kudos
        - hideCommentsCount → ao3h-hide-comments
        - hideBookmarksCount → ao3h-hide-bookmarks
        - hideHits          → ao3h-hide-hits



AO3 Helper - Visibility Presets Submodule
    Submodule ID: visibilityPresets
    Display Name: Visibility Presets
    Parent Module: visualPreferences

    Manages the 5 quick-apply presets:
        - showAll         : Show all metadata (default)
        - hideAllStats    : Hide all statistics and metrics
        - hideAllDates    : Hide all dates and timestamps
        - biasFree        : Hide all influence factors
        - cleanReader     : Minimal header + hidden chapter stats







═══════════════════════════════════════════════════════════════════════════
  # visualPreferences
  **Tab :** Appearance & Tools
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Visual Preferences** permet de personnaliser l'affichage d'AO3 afin d'offrir une expérience de lecture plus confortable et moins influencée par les statistiques.

* Il permet notamment de :
    - masquer individuellement les différentes statistiques des œuvres ;
    - masquer les différentes dates affichées par AO3 ;
    - réduire l'en-tête du site ;
    - modifier la présentation des statistiques ;
    - afficher les dates sous une forme relative ;
    - révéler temporairement les informations masquées au survol ;
    - appliquer rapidement des préréglages d'affichage.

---

# Réglages utilisateur

| Réglage                   | Description                                                       |
|---------------------------|-------------------------------------------------------------------|
| `hideWordCount`           | Masque le nombre de mots.                                         |
| `hideKudosCount`          | Masque le nombre de kudos.                                        |
| `hideCommentsCount`       | Masque le nombre de commentaires.                                 |
| `hideBookmarksCount`      | Masque le nombre de favoris.                                      |
| `hideHits`                | Masque le nombre de vues.                                         |
| `hidePublishedDate`       | Masque la date de publication.                                    |
| `hideUpdatedDate`         | Masque la date de mise à jour.                                    |
| `hideCompletedDate`       | Masque la date de fin.                                            |
| `hideChapterDates`        | Masque les dates des chapitres.                                   |
| `minimalHeader`           | Active un en-tête minimaliste.                                    |
| `hideStatsOnChaptersList` | Masque les statistiques affichées dans la liste des chapitres.    |
| `statsAsIcons`            | Remplace les statistiques textuelles par des icônes.              |
| `statsIconsMode`          | Définit le mode d'affichage des icônes (`icons` ou `icons-text`). |
| `relativeDates`           | Affiche les dates sous une forme relative ("il y a 4 ans").       |

---

# Structure du module

Le module est composé de sept sous-modules fonctionnels ainsi qu'une feuille de style.

```
_visualPreferences.js
statsVisibility.js
datesTimestamps.js
minimalHeader.js
statsDisplayFormat.js
hoverReveal.js
visibilityPresets.js
statsOnChaptersList.js
visualPreferences.css
```

---

# _visualPreferences.js

## Rôle

Fichier coordinateur du module.

Il initialise tous les sous-modules, conserve les préférences utilisateur, applique les réglages visuels et expose une API publique permettant de piloter le module depuis le reste d'AO3 Helper ou depuis la console du navigateur.

---

## Responsabilités

- Initialise l'ensemble des sous-modules.
- Charge et enregistre les préférences utilisateur.
- Réapplique automatiquement tous les réglages visuels.
- Assure la compatibilité avec les anciennes versions du module.
- Expose une API publique accessible depuis AO3 Helper et la console.

---

## Fonctions exposées

L'API publique permet notamment de :

- récupérer l'état actuel (`getState()`) ;
- modifier une préférence (`setPreference()`) ;
- modifier plusieurs préférences (`setPreferences()`) ;
- appliquer un préréglage (`applyPreset()`) ;
- récupérer le préréglage actif (`getCurrentPreset()`) ;
- obtenir la liste des préréglages (`getPresets()`) ;
- réinitialiser les préférences (`reset()`) ;
- obtenir la liste des réglages disponibles (`getKeys()`).

L'API est accessible via :

- `AO3H.visualPreferences`
- `ao3hVisualPrefs`

---

## Stockage

Le module utilise principalement la clé :

`ao3h:mod:visualPreferences:settings`

Une compatibilité est conservée avec l'ancienne clé :

`ao3h:visualPreferences`

---

## Migration des données

Le coordinateur récupère automatiquement les anciens réglages provenant des modules ayant été fusionnés dans **Visual Preferences**.

La migration du système de surlignage des fandoms est désormais assurée par :

`browse/tagsDisplay/tagHighlighting.js`

---

# statsVisibility.js

## Rôle

Permet de masquer indépendamment les différentes statistiques affichées sur AO3 afin de limiter les biais liés à la popularité des œuvres.

---

## Fonctionnalités

### Visibilité des statistiques

Le module permet de masquer indépendamment :

- le nombre de mots ;
- le nombre de kudos ;
- le nombre de commentaires ;
- le nombre de favoris ;
- le nombre de vues.

Chaque statistique peut être activée ou désactivée séparément.

---

### Application des préférences

Chaque réglage applique automatiquement une classe CSS sur l'élément `<html>`.

Cela permet au reste du module de masquer les informations sans modifier directement le contenu de la page.

---

## Détails techniques

### Clés gérées

Le module gère les préférences suivantes :

| Réglage | Classe appliquée |
|----------|------------------|
| `hideWordCount` | `ao3h-hide-wc` |
| `hideKudosCount` | `ao3h-hide-kudos` |
| `hideCommentsCount` | `ao3h-hide-comments` |
| `hideBookmarksCount` | `ao3h-hide-bookmarks` |
| `hideHits` | `ao3h-hide-hits` |

---

### Fonctionnement

Les classes CSS sont appliquées directement sur `document.documentElement`.

L'affichage est ensuite contrôlé par les règles définies dans `visualPreferences.css`.

---

## Dépendances

Ce sous-module est initialisé par `_visualPreferences.js`.

Il travaille conjointement avec `hoverReveal.js`, qui permet d'afficher temporairement les statistiques masquées au survol.


# datesTimestamps.js

## Rôle

Permet de contrôler indépendamment l'affichage de toutes les dates présentes sur AO3.

Chaque type de date peut être affiché ou masqué séparément afin de personnaliser le niveau d'information visible pendant la lecture.

---

## Fonctionnalités

### Visibilité des dates

Le module permet de masquer indépendamment :

- la date de publication ;
- la date de mise à jour ;
- la date de fin d'une œuvre ;
- les dates affichées pour chaque chapitre.

Chaque réglage fonctionne indépendamment des autres.

---

### Application des préférences

Chaque préférence ajoute automatiquement une classe CSS sur l'élément `<html>`.

Les règles CSS correspondantes masquent ensuite les éléments concernés sans modifier le contenu de la page.

---

## Détails techniques

### Clés gérées

Le module gère les préférences suivantes :

| Réglage | Classe appliquée |
|----------|------------------|
| `hidePublishedDate` | `ao3h-hide-pub-date` |
| `hideUpdatedDate` | `ao3h-hide-upd-date` |
| `hideCompletedDate` | `ao3h-hide-comp-date` |
| `hideChapterDates` | `ao3h-hide-chap-dates` |

---

### Fonctionnement

Les classes sont appliquées directement sur `document.documentElement`.

L'affichage est ensuite contrôlé par les règles définies dans `visualPreferences.css`.

---

## Dépendances

Ce sous-module est initialisé par `_visualPreferences.js`.

Il fonctionne conjointement avec `hoverReveal.js`, qui permet de révéler temporairement les dates masquées.

---

# minimalHeader.js

## Rôle

Permet de réduire l'en-tête d'AO3 afin d'obtenir une interface plus compacte et de laisser davantage de place au contenu.

---

## Fonctionnalités

### En-tête minimaliste

Le module applique une version simplifiée de l'en-tête du site.

Cette présentation permet notamment :

- de réduire la hauteur de la bannière ;
- de diminuer l'espace occupé par l'en-tête ;
- d'offrir davantage d'espace pour la lecture.

---

### Activation

L'affichage est contrôlé par le réglage :

`minimalHeader`

---

## Détails techniques

### Clé gérée

| Réglage | Classe appliquée |
|----------|------------------|
| `minimalHeader` | `ao3h-minimal-header` |

---

### Fonctionnement

Le module ajoute ou retire automatiquement la classe :

`ao3h-minimal-header`

sur l'élément `<html>`.

Les règles visuelles correspondantes sont définies dans :

`visualPreferences.css` (section « Header cleanup »)

---

## Dépendances

Ce sous-module est initialisé par `_visualPreferences.js`.

---

# statsDisplayFormat.js

## Rôle

Permet de modifier la façon dont les statistiques et les dates sont affichées sur AO3.

Le module contrôle aussi bien la représentation des statistiques que le format des dates.

---

## Fonctionnalités

### Affichage des statistiques

Le module permet de remplacer les statistiques textuelles par différents modes d'affichage.

Les possibilités comprennent :

- affichage classique ;
- affichage avec icônes uniquement ;
- affichage avec icônes et texte.

Ces modes sont contrôlés par les réglages :

- `statsAsIcons`
- `statsIconsMode`

---

### Dates relatives

Le module peut remplacer les dates absolues par une représentation relative.

Par exemple :

- "il y a 4 ans"
- "il y a 2 mois"

au lieu d'une date précise.

Cette fonctionnalité est contrôlée par :

`relativeDates`

---

## Détails techniques

### Clés gérées

Le module gère les préférences suivantes :

| Réglage | Description |
|----------|-------------|
| `statsAsIcons` | Active l'affichage des statistiques sous forme d'icônes. |
| `statsIconsMode` | Définit le mode `icons` ou `icons-text`. |
| `relativeDates` | Active les dates relatives. |

---

### Modes d'affichage

Lorsque les statistiques sont affichées sous forme d'icônes, deux présentations sont disponibles :

- icônes seules (`icons`) ;
- icônes accompagnées d'un libellé (`icons-text`).

---

## Dépendances

Ce sous-module est initialisé par `_visualPreferences.js`.

Il agit uniquement sur la présentation des informations et ne modifie jamais leur contenu.


# hoverReveal.js

## Rôle

Permet de révéler temporairement les statistiques et les dates masquées simplement en passant le curseur de la souris dessus.

Cette fonctionnalité améliore le confort de lecture en gardant les informations cachées par défaut tout en les rendant accessibles à tout moment.

---

## Fonctionnalités

### Révélation au survol

Le module permet d'afficher temporairement les informations masquées lorsque l'utilisateur les survole avec la souris.

Les éléments concernés comprennent notamment :

- les statistiques masquées ;
- les dates masquées.

Aucun réglage supplémentaire n'est nécessaire.

Dès qu'un élément est masqué par un autre sous-module de **Visual Preferences**, cette fonctionnalité devient automatiquement disponible.

---

### Fonctionnement automatique

Le module détecte automatiquement les éléments cachés par :

- `statsVisibility.js`
- `datesTimestamps.js`

Il applique ensuite le comportement de révélation au survol sans intervention de l'utilisateur.

---

## Détails techniques

### Fonctionnement

Les règles CSS de révélation sont toujours présentes.

Elles deviennent actives uniquement lorsque les classes `ao3h-hide-*` correspondantes sont appliquées sur l'élément `<html>`.

Les styles sont définis dans :

`visualPreferences.css` (Section 06 — Hover Reveal)

---

## Dépendances

Ce sous-module est initialisé par `_visualPreferences.js`.

Il dépend directement des classes appliquées par :

- `statsVisibility.js`
- `datesTimestamps.js`

---

# visibilityPresets.js

## Rôle

Fournit plusieurs préréglages permettant d'appliquer rapidement un ensemble cohérent de préférences visuelles.

Chaque préréglage modifie simultanément plusieurs réglages afin d'obtenir un comportement adapté à différents usages.

---

## Fonctionnalités

### Préréglages rapides

Le module propose cinq préréglages prédéfinis :

| Préréglage | Description |
|------------|-------------|
| **Show All** | Affiche toutes les informations disponibles. |
| **Hide All Stats** | Masque toutes les statistiques des œuvres. |
| **Hide All Dates** | Masque toutes les dates affichées par AO3. |
| **Bias Free** | Masque les éléments pouvant influencer le choix d'une œuvre (statistiques, métriques, etc.). |
| **Clean Reader** | Active une interface épurée avec en-tête minimal et statistiques masquées dans la liste des chapitres. |

---

### Application des préréglages

Chaque préréglage applique automatiquement l'ensemble des préférences correspondantes.

L'utilisateur peut ensuite modifier individuellement chaque réglage si nécessaire.

---

## Détails techniques

### Préréglages disponibles

Le module gère les identifiants suivants :

| Identifiant | Description |
|--------------|-------------|
| `showAll` | Afficher toutes les métadonnées. |
| `hideAllStats` | Masquer toutes les statistiques. |
| `hideAllDates` | Masquer toutes les dates. |
| `biasFree` | Masquer tous les facteurs d'influence. |
| `cleanReader` | Lecture épurée avec en-tête minimal. |

---

## Dépendances

Ce sous-module est initialisé par `_visualPreferences.js`.

Les préréglages modifient les préférences utilisées par l'ensemble des autres sous-modules.

---

# statsOnChaptersList.js

## Rôle

Permet de masquer les statistiques affichées dans la liste des chapitres d'une œuvre.

Cette fonctionnalité complète le système général de masquage des statistiques en ciblant spécifiquement le menu de navigation entre les chapitres.

---

## Fonctionnalités

### Masquage des statistiques

Le module peut masquer les informations affichées dans la liste des chapitres.

Les éléments concernés comprennent notamment :

- le nombre de mots ;
- les dates ;
- le nombre de commentaires.

Le comportement est contrôlé par un unique réglage.

---

## Détails techniques

### Clé gérée

| Réglage | Classe appliquée |
|----------|------------------|
| `hideStatsOnChaptersList` | `ao3h-hide-chap-stats` |

---

### Fonctionnement

Le module applique une classe CSS sur l'élément `<html>`.

Les règles définies dans `visualPreferences.css` se chargent ensuite de masquer les informations concernées.

---

## Dépendances

Ce sous-module est initialisé par `_visualPreferences.js`.

Il complète les fonctionnalités de `statsVisibility.js` en ciblant exclusivement la liste des chapitres.

---

# visualPreferences.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Visual Preferences**.

Il définit notamment l'apparence et le comportement :

- du masquage des statistiques ;
- du masquage des dates ;
- de l'en-tête minimaliste ;
- des différents formats d'affichage des statistiques ;
- des dates relatives ;
- du système de révélation au survol ;
- des préréglages visuels.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Présentation des listes

### ~~Mode compact~~ ✅ Fait (fusionné avec la densité de l'interface)

~~Ajouter un mode compact pour les différentes listes d'œuvres (favoris, historique, Marked for Later...).~~

> Ce besoin et celui de "Densité de l'interface" plus bas se recoupaient
> entièrement — implémentés ensemble comme un seul réglage à trois
> positions (`layoutDensity.js`), voir plus bas.

---

### ~~Réorganisation des informations~~ ✅ Fait

~~Permettre de modifier librement l'ordre des informations affichées sur les listes (titre, résumé, tags, statistiques...).~~

> Réglage `blurbSectionOrder` : ordre choisi parmi header/tags/summary/stats,
> appliqué en CSS (`order` flexbox) par `blurbSectionOrder.js`. Chaque titre
> de section invisible (repère pour lecteur d'écran) reste toujours associé
> à son contenu, pour ne pas casser la navigation par landmarks.

---

### ~~Affichage en grille~~ ✅ Fait

~~Ajouter une présentation alternative sous forme de cartes, inspirée d'un affichage de type Pinterest.~~

> Réglage `gridView` (`gridView.js`) : grille de cartes qui s'adapte à la
> largeur de l'écran, purement visuelle — le contenu et son ordre à
> l'intérieur de chaque fic ne changent pas.

---

## Dates

### ~~Coloration selon l'ancienneté~~ ✅ Fait

~~Permettre de modifier automatiquement la couleur des dates selon leur ancienneté (aujourd'hui, cette semaine, plus ancien).~~

> Réglage `dateAgeColoring` (`dateAgeMath.js`, appliqué par
> `statsDisplayFormat.js`) — fonctionne sur les listes et les pages de fic,
> compatible avec l'affichage en dates relatives déjà existant.

---

## ~~Densité de l'interface~~ ✅ Fait

~~Ajouter un réglage global permettant de choisir la densité de l'ensemble du site (Compact / Confortable / Spacieux).~~

> Réglage `layoutDensity` (`layoutDensity.js`) — une seule case à trois
> positions, qui couvre à la fois ce besoin et le "mode compact des listes"
> ci-dessus (les deux demandaient le même résultat visuel).

---

## Analyse du texte

### ~~Comptage personnalisé~~ ✅ Fait

~~Permettre de compter automatiquement le nombre d'occurrences d'un mot ou du nom d'un personnage à l'intérieur d'une œuvre.~~

> Réglage `wordOccurrenceCounter` : champ de recherche sur la page d'une
> fic, comptage en mot entier insensible à la casse sur le texte des
> chapitres déjà chargés (`wordOccurrenceMath.js` + `wordOccurrenceCounter.js`).


# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Amélioration des résultats de recherche

Le module ne modifie pas la structure ni le contenu des résultats de recherche d'AO3.

Les fonctionnalités de recherche avancée sont volontairement laissées à d'autres modules spécialisés afin d'éviter les redondances.

---

## Réglages par œuvre

Le module n'autorise pas de préférences différentes pour chaque œuvre individuellement.

Les réglages sont globaux et s'appliquent de manière uniforme à tout le site.

Cette approche simplifie :

- la configuration ;
- la maintenance ;
- la cohérence de l'expérience utilisateur.

---

# Résumé des responsabilités du module

Le module **Visual Preferences** est responsable de toutes les fonctionnalités permettant de personnaliser l'affichage des informations visibles sur AO3.

Ses responsabilités sont réparties entre les sous-modules suivants :

| Sous-module | Responsabilité principale |
|-------------|---------------------------|
| `_visualPreferences.js` | Initialise le module, gère les préférences utilisateur et expose l'API publique. |
| `statsVisibility.js` | Masquage individuel des statistiques des œuvres. |
| `datesTimestamps.js` | Masquage individuel des différentes dates affichées par AO3. |
| `minimalHeader.js` | Réduction de l'en-tête du site. |
| `statsDisplayFormat.js` | Modification du format d'affichage des statistiques et des dates. |
| `hoverReveal.js` | Révélation temporaire des informations masquées au survol. |
| `visibilityPresets.js` | Application rapide de groupes de préférences prédéfinis. |
| `statsOnChaptersList.js` | Masquage des statistiques dans la liste des chapitres. |
| `visualPreferences.css` | Styles visuels utilisés par l'ensemble du module. |

---

# Interactions entre les sous-modules

Le coordinateur `_visualPreferences.js` initialise tous les sous-modules et centralise les préférences utilisateur.

Les responsabilités sont volontairement séparées :

- **`statsVisibility.js`** contrôle uniquement les statistiques.
- **`datesTimestamps.js`** contrôle uniquement les dates.
- **`minimalHeader.js`** agit exclusivement sur l'en-tête du site.
- **`statsDisplayFormat.js`** modifie uniquement la manière dont les informations sont affichées.
- **`hoverReveal.js`** complète automatiquement les modules de masquage sans posséder de réglage propre.
- **`visibilityPresets.js`** applique simultanément plusieurs préférences afin de produire différents modes d'affichage.
- **`statsOnChaptersList.js`** cible uniquement la liste des chapitres d'une œuvre.

Chaque sous-module possède une responsabilité clairement définie afin de limiter les dépendances et de faciliter la maintenance.

---

# Dépendances externes

Le module repose principalement sur les APIs natives du navigateur.

## APIs du navigateur

- `localStorage`
- `document.documentElement`
- Manipulation des classes CSS de l'élément `<html>`

---

## Feuilles de style

Le module s'appuie sur plusieurs feuilles de style pour appliquer les préférences visuelles.

Notamment :

- `visualPreferences.css`
- la section « Header cleanup » de `visualPreferences.css` (pour le mode d'en-tête minimaliste)

---

# Limites connues

Le module applique uniquement des modifications d'affichage.

Il ne modifie jamais :

- les données d'origine fournies par AO3 ;
- les statistiques elles-mêmes ;
- les dates enregistrées par le site.

Toutes les préférences sont purement visuelles et peuvent être activées ou désactivées à tout moment.

Certaines fonctionnalités, comme la révélation au survol, dépendent automatiquement des autres sous-modules et ne disposent volontairement d'aucun réglage indépendant.


