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
| `heatmapIntensity` | `medium` | À quelle vitesse une case atteint la teinte la plus foncée (`low`/`medium`/`high`) ✅ |
| `hideReadWorks` | désactivé | Sur les listings, cache les fics déjà lues au lieu de les surligner ✅ |

## Fichiers

### 1. `_readingTimeline.js` — le chef d'orchestre

- Regarde sur quelle page on se trouve (détection de listing centralisée via `lib/ao3/parsers.js`'s `isListingPage()`) et active la bonne fonctionnalité (surlignage/masquage sur les listes, ou séparateurs sur la page d'historique)
- Importe directement `historyAnalytics.js` et `timelineVisualization.js` comme modules ES et leur transmet les données d'analyse ; dépend en priorité de l'API `W.AO3H_ReadingTracker.getHistory()` de **Reading Tracker** — `ao3h:readingHistory:data` n'est qu'un ancien nom de clé de repli, jamais écrit nulle part dans le code actuel

### 2. `historyAnalytics.js` — analyser l'historique de lecture

- Charge tout l'historique de lecture et le classe par date
- Calcule des statistiques : nombre total de lectures, jour le plus actif, tes 5 fandoms préférés, la plus longue série de jours consécutifs de lecture
- Sur les listes de fics, surligne les fics déjà lues avec une couleur qui dépend de la date de lecture (ou les cache, si `hideReadWorks` est activé), avec un badge "📚 Read" (ou "📚 Read N×" si lue plusieurs fois)
- Sur la page d'historique d'AO3, ajoute des séparateurs de jour ("Aujourd'hui", "Hier", "7 derniers jours", "Mois dernier", "Plus ancien") et des sous-séparateurs matin/après-midi/soir/nuit quand plusieurs lectures ont eu lieu le même jour

### 3. `timelineVisualization.js` — le panneau flottant

- Ajoute un bouton dans le menu du site pour ouvrir le panneau
- Propose une vue "année" façon calendrier de contributions, ou une vue "mois" façon calendrier classique ; l'intensité des teintes suit `heatmapIntensity`
- Un clic sur un jour montre la liste des fics lues ce jour-là, un jalon éventuel ("🏁 100th work read!"), la note personnelle de la journée (le détail reste accessible même un jour sans lecture, tant qu'une note y est attachée), et un aperçu de la note de bookmark de chaque fic (si elle en a une, lue en lecture seule depuis **Bookmark Vault** via `ao3h:bookmarkVault:data`)
- Marque les jours ayant un jalon ou une annotation, et met en avant (sans les cacher) les jours correspondant à une recherche texte — la recherche complète l'affichage, elle ne le filtre pas
- Une recherche texte pour retrouver une fic dans l'historique
- Des filtres avancés (fandom, auteur, note, terminé/en cours, nombre de mots, plage de dates), avec des filtres favoris nommés à sauvegarder/recharger/supprimer
- Un export de l'historique en JSON, en CSV (avec les filtres appliqués), ou en PNG (la grille annuelle)

### Calculs de chronologie — intégrés à `_readingTimeline.js`

- Jalons de lecture (seuils cumulés), niveaux de teinte selon l'intensité choisie, classement matin/après-midi/soir/nuit

### Notes personnelles par date — intégrées à `_readingTimeline.js`

### Filtres favoris nommés — intégrés à `_readingTimeline.js`

### 7. `readingTimeline.css`

- Les styles visuels du surlignage, des badges, des séparateurs (et sous-séparateurs), du panneau, des grilles, des jalons/annotations/mise en avant de recherche et des filtres favoris

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Exporter la frise sous forme d'image (PNG) ou de PDF~~ ✅ PNG implémenté (bouton "Export PNG", dessiné sur `<canvas>`) ; le PDF a été écarté, voir "Explicitement écarté"
- ~~Un filtre séparé pour cacher les fics déjà lues sur les listings, en plus du simple surlignage~~ ✅ Réglage `hideReadWorks`
- ~~Régler à quel point la couleur change selon le nombre de fics lues (intensité configurable)~~ ✅ Réglage `heatmapIntensity`, niveau calculé par `getHeatmapLevel()` (`_readingTimeline.js`)
- ~~Annoter des dates spéciales, par exemple "marathon de vacances"~~ ✅ Éditeur de note dans le détail d'une journée (`_readingTimeline.js`)
- ~~Marquer des jalons de lecture particuliers sur la frise~~ ✅ Jalons rétrospectifs par seuils cumulés (10e, 25e, 50e, 100e... fic lue), calculés par `computeMilestones()` (`_readingTimeline.js`)
- ~~Voir un aperçu des notes qu'on a écrites sur ses bookmarks, directement dans l'historique de lecture~~ ✅ Note de bookmark affichée sous chaque fic dans le détail d'une journée, lue via `getBookmarkVaultNote()` (`lib/storage/keys.js`)
- ~~Faire ressortir sur le calendrier les dates qui correspondent aux résultats d'une recherche~~ ✅ Contour rouge sur les jours correspondants, sans cacher le reste du calendrier
- ~~Sauvegarder ses filtres de recherche préférés pour les réutiliser plus tard~~ ✅ Filtres favoris nommés (`_readingTimeline.js`)
- ~~Séparer visuellement tes lectures du matin de celles du soir quand tu as lu plusieurs fois dans la même journée~~ ✅ Sous-séparateurs matin/après-midi/soir/nuit sur la page d'historique, calculés par `timeOfDayBucket()` (`_readingTimeline.js`)

## Explicitement écarté

- Se fixer des objectifs de lecture sur cette frise — écarté, la lecture reste un loisir, pas un objectif à atteindre. Les jalons affichés sur le calendrier restent volontairement rétrospectifs ("tu as atteint ta 100e lecture le [date]") plutôt que prescriptifs.
- Partager sa frise de lecture avec d'autres personnes — écarté pour rester privé
- **Export PDF de la frise** — générer un PDF proprement nécessiterait une dépendance dédiée (rendu de document), ce qui va à l'encontre de l'objectif de garder le bundle léger. L'export PNG (dessiné directement sur `<canvas>`, sans dépendance) couvre le même besoin d'export visuel.
