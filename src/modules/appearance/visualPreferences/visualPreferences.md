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

### 12. `wordOccurrenceCounter.js` — compteur d'occurrences

- Sur la page d'une fic, ajoute un champ pour taper un nom de personnage (ou n'importe quel mot ou expression) et voir combien de fois il apparaît dans le texte des chapitres déjà chargés
- Compte en mot entier, insensible à la casse ; se souvient du dernier mot cherché

### Calcul de l'ancienneté d'une date — intégré à `_visualPreferences.js`

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
  Fait : réglage `dateAgeColoring` (`_visualPreferences.js` +
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
  (`_visualPreferences.js` + `wordOccurrenceCounter.js`).

- Cacher les images intégrées dans les fics — cette fonctionnalité existe bien dans l'extension, mais dans un autre module (`readingFormatter`), pas ici
- Avoir des règles pour cacher ou montrer une statistique seulement dans certains cas précis (par exemple selon le fandom ou la page) — pour l'instant, un réglage est activé ou désactivé partout, sans condition ; voir "Réglages par œuvre" dans Explicitement écarté
- Cacher ou montrer les infos différemment selon que la fic est terminée ou en cours — même limite que ci-dessus
- Un mode "impression" qui simplifie la page pour l'imprimer proprement — idée non implémentée, aucune décision de suppression prise
- Un mode "capture d'écran" qui cache temporairement les infos personnelles avant de prendre une photo de la page — idée non implémentée, aucune décision de suppression prise

## Explicitement écarté

- Des améliorations des résultats de recherche — jugé redondant, AO3 affiche déjà ces informations
- Pouvoir cacher les informations différemment pour chaque fic une par une — jugé trop compliqué à gérer, un seul réglage s'applique partout, de façon uniforme sur tout le site (simplifie la configuration, la maintenance et la cohérence de l'expérience)

## Détails techniques

Stockage : `ao3h:mod:visualPreferences:settings` (repli legacy :
`ao3h:visualPreferences`). API publique `AO3H.visualPreferences` /
`W.ao3hVisualPrefs` : `getState()`, `setPreference(key, value)`,
`setPreferences(updates)`, `applyPreset(presetId)`, `getCurrentPreset()`,
`getPresets()`, `reset()`, `getKeys()`.

Chaque réglage de masquage applique une classe CSS sur `<html>`, lue par
les règles de `visualPreferences.css` (dont la section "Hover Reveal" pour
`hoverReveal.js`, toujours présente et activée automatiquement dès qu'une
classe `ao3h-hide-*` correspondante apparaît) :

| Réglage | Classe appliquée |
|---|---|
| `hideWordCount` | `ao3h-hide-wc` |
| `hideKudosCount` | `ao3h-hide-kudos` |
| `hideCommentsCount` | `ao3h-hide-comments` |
| `hideBookmarksCount` | `ao3h-hide-bookmarks` |
| `hideHits` | `ao3h-hide-hits` |
| `hidePublishedDate` | `ao3h-hide-pub-date` |
| `hideUpdatedDate` | `ao3h-hide-upd-date` |
| `hideCompletedDate` | `ao3h-hide-comp-date` |
| `hideChapterDates` | `ao3h-hide-chap-dates` |
| `minimalHeader` | `ao3h-minimal-header` |
| `hideStatsOnChaptersList` | `ao3h-hide-chap-stats` |

Identifiants des 5 préréglages (`visibilityPresets.js`) : `showAll`,
`hideAllStats`, `hideAllDates`, `biasFree`, `cleanReader`.
