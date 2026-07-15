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

### 6. `hoverReveal.js` — révéler au survol

- Permet de voir une statistique ou une date cachée en passant la souris dessus — ça fonctionne automatiquement dès qu'un élément est caché, il n'y a pas de réglage séparé à activer

### 7. `visibilityPresets.js` — préréglages rapides

- Propose 5 préréglages tout prêts : Tout afficher, Cacher toutes les stats, Cacher toutes les dates, Mode sans influence, Lecture épurée

### 8. `statsOnChaptersList.js` — statistiques dans la liste des chapitres

- Peut cacher les statistiques affichées dans le menu déroulant des chapitres d'une fic

### 9. `visualPreferences.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :


- Un mode compact pour les listings (favoris, historique, "à lire plus tard"...)

- Réorganiser l'ordre des informations affichées sur les listes de fics (titre, résumé, tags, statistiques...)

- Colorer les dates selon leur ancienneté (aujourd'hui, cette semaine, plus vieux) plutôt que juste changer le texte

- Un réglage de densité pour tout le site (compact / confortable / spacieux), pas seulement pour les listings

- Un affichage en grille de cartes (façon Pinterest) pour les résultats de recherche, en plus de la liste classique

- Compter combien de fois le nom d'un personnage (ou un autre mot choisi) apparaît dans le texte d'une fic

---

~~- Cacher les images intégrées dans les fics — cette fonctionnalité existe bien dans l'extension, mais dans un autre module (readingFormatter), pas ici~~
~~- Avoir des règles pour cacher ou montrer une statistique seulement dans certains cas précis (par exemple selon le fandom ou la page) — pour l'instant, un réglage est activé ou désactivé partout, sans condition~~
~~- Cacher ou montrer les infos différemment selon que la fic est terminée ou en cours~~
~~- Un mode "impression" qui simplifie la page pour l'imprimer proprement~~
~~- Un mode "capture d'écran" qui cache temporairement les infos personnelles avant de prendre une photo de la page~~

## Explicitement écarté

- Des améliorations des résultats de recherche — jugé redondant, AO3 affiche déjà ces informations
- Pouvoir cacher les informations différemment pour chaque fic une par une — jugé trop compliqué à gérer, un seul réglage s'applique partout

