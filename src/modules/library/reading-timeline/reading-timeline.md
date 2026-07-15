# readingTimeline

**Tab:** Library

## À quoi ça sert

Ce module affiche une frise façon "calendrier d'activité" de ton historique
de lecture (un peu comme les contributions GitHub), dans un panneau
flottant accessible depuis le menu du site. Il ajoute aussi des marqueurs
sur les listes de fics et sur la page d'historique d'AO3 pour repérer ce
que tu as déjà lu.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `heatmapColor` | `green` | La couleur de la grille façon calendrier (vert / violet / orange / bleu) |
| `calendarRange` | `5` | Le nombre d'années passées proposées dans le sélecteur |
| `defaultView` | `year` | La vue ouverte par défaut : grille de l'année entière, ou détail d'un mois |

## Fichiers

### 1. `_readingTimeline.js` — le chef d'orchestre

- Regarde sur quelle page on se trouve et active la bonne fonctionnalité (surlignage sur les listes, ou séparateurs sur la page d'historique)

### 2. `historyAnalytics.js` — analyser l'historique de lecture

- Charge tout l'historique de lecture et le classe par date
- Calcule des statistiques : nombre total de lectures, jour le plus actif, tes 5 fandoms préférés, la plus longue série de jours consécutifs de lecture
- Sur les listes de fics, surligne les fics déjà lues avec une couleur qui dépend de la date de lecture, et un badge "📚 Read" (ou "📚 Read N×" si lue plusieurs fois)
- Sur la page d'historique d'AO3, ajoute des séparateurs ("Aujourd'hui", "Hier", "7 derniers jours", "Mois dernier", "Plus ancien")

### 3. `timelineVisualization.js` — le panneau flottant

- Ajoute un bouton dans le menu du site pour ouvrir le panneau
- Propose une vue "année" façon calendrier de contributions, ou une vue "mois" façon calendrier classique
- Un clic sur un jour montre la liste des fics lues ce jour-là
- Une recherche texte pour retrouver une fic dans l'historique
- Des filtres avancés (fandom, auteur, note, terminé/en cours, nombre de mots, plage de dates)
- Un export de l'historique en JSON ou en CSV, avec les filtres appliqués

### 4. `readingTimeline.css`

- Les styles visuels du surlignage, des badges, des séparateurs, du panneau et des grilles

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Exporter la frise sous forme d'image (PNG) ou de PDF — seuls le JSON et le CSV existent
- Un filtre séparé pour cacher les fics déjà lues sur les listings, en plus du simple surlignage
- Régler à quel point la couleur change selon le nombre de fics lues (intensité configurable)
- Annoter des dates spéciales, par exemple "marathon de vacances"
- Marquer des jalons de lecture particuliers sur la frise
- Voir un aperçu des notes qu'on a écrites sur ses bookmarks, directement dans l'historique de lecture
- Faire ressortir sur le calendrier les dates qui correspondent aux résultats d'une recherche
- Sauvegarder ses filtres de recherche préférés pour les réutiliser plus tard
- Séparer visuellement tes lectures du matin de celles du soir quand tu as lu plusieurs fois dans la même journée — les séparateurs actuels ne distinguent que les jours (aujourd'hui, hier, cette semaine...), pas les moments dans une même journée

## Explicitement écarté

- Se fixer des objectifs de lecture sur cette frise — écarté, la lecture reste un loisir, pas un objectif à atteindre
- Partager sa frise de lecture avec d'autres personnes — écarté pour rester privé
