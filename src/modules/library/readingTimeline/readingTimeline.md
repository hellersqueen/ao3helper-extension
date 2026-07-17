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

- Regarde sur quelle page on se trouve et active la bonne fonctionnalité (surlignage/masquage sur les listes, ou séparateurs sur la page d'historique)

### 2. `historyAnalytics.js` — analyser l'historique de lecture

- Charge tout l'historique de lecture et le classe par date
- Calcule des statistiques : nombre total de lectures, jour le plus actif, tes 5 fandoms préférés, la plus longue série de jours consécutifs de lecture
- Sur les listes de fics, surligne les fics déjà lues avec une couleur qui dépend de la date de lecture (ou les cache, si `hideReadWorks` est activé), avec un badge "📚 Read" (ou "📚 Read N×" si lue plusieurs fois)
- Sur la page d'historique d'AO3, ajoute des séparateurs de jour ("Aujourd'hui", "Hier", "7 derniers jours", "Mois dernier", "Plus ancien") et des sous-séparateurs matin/après-midi/soir/nuit quand plusieurs lectures ont eu lieu le même jour

### 3. `timelineVisualization.js` — le panneau flottant

- Ajoute un bouton dans le menu du site pour ouvrir le panneau
- Propose une vue "année" façon calendrier de contributions, ou une vue "mois" façon calendrier classique ; l'intensité des teintes suit `heatmapIntensity`
- Un clic sur un jour montre la liste des fics lues ce jour-là, un jalon éventuel ("🏁 100th work read!"), la note personnelle de la journée, et un aperçu de la note de bookmark de chaque fic (si elle en a une)
- Marque les jours ayant un jalon ou une annotation, et met en avant (sans les cacher) les jours correspondant à une recherche texte
- Une recherche texte pour retrouver une fic dans l'historique
- Des filtres avancés (fandom, auteur, note, terminé/en cours, nombre de mots, plage de dates), avec des filtres favoris nommés à sauvegarder/recharger/supprimer
- Un export de l'historique en JSON, en CSV (avec les filtres appliqués), ou en PNG (la grille annuelle)

### 4. `timelineStats.js` — calculs (pur, testable)

- Jalons de lecture (seuils cumulés), niveaux de teinte selon l'intensité choisie, classement matin/après-midi/soir/nuit

### 5. `dateAnnotations.js` — notes personnelles par date (localStorage)

### 6. `filterPresets.js` — filtres de recherche favoris nommés (localStorage)

### 7. `readingTimeline.css`

- Les styles visuels du surlignage, des badges, des séparateurs (et sous-séparateurs), du panneau, des grilles, des jalons/annotations/mise en avant de recherche et des filtres favoris

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Exporter la frise sous forme d'image (PNG) ou de PDF~~ ✅ PNG implémenté (bouton "Export PNG", dessiné sur `<canvas>`) ; le PDF a été écarté, voir "Explicitement écarté"
- ~~Un filtre séparé pour cacher les fics déjà lues sur les listings, en plus du simple surlignage~~ ✅ Réglage `hideReadWorks`
- ~~Régler à quel point la couleur change selon le nombre de fics lues (intensité configurable)~~ ✅ Réglage `heatmapIntensity`
- ~~Annoter des dates spéciales, par exemple "marathon de vacances"~~ ✅ Éditeur de note dans le détail d'une journée (`dateAnnotations.js`)
- ~~Marquer des jalons de lecture particuliers sur la frise~~ ✅ Jalons rétrospectifs par seuils cumulés (10e, 25e, 50e... fic lue)
- ~~Voir un aperçu des notes qu'on a écrites sur ses bookmarks, directement dans l'historique de lecture~~ ✅ Note de bookmark affichée sous chaque fic dans le détail d'une journée
- ~~Faire ressortir sur le calendrier les dates qui correspondent aux résultats d'une recherche~~ ✅ Contour rouge sur les jours correspondants, sans cacher le reste du calendrier
- ~~Sauvegarder ses filtres de recherche préférés pour les réutiliser plus tard~~ ✅ Filtres favoris nommés (`filterPresets.js`)
- ~~Séparer visuellement tes lectures du matin de celles du soir quand tu as lu plusieurs fois dans la même journée~~ ✅ Sous-séparateurs matin/après-midi/soir/nuit sur la page d'historique

## Explicitement écarté

- Se fixer des objectifs de lecture sur cette frise — écarté, la lecture reste un loisir, pas un objectif à atteindre
- Partager sa frise de lecture avec d'autres personnes — écarté pour rester privé
- **Export PDF de la frise** — générer un PDF proprement nécessiterait une dépendance dédiée (rendu de document), ce qui va à l'encontre de l'objectif de garder le bundle léger. L'export PNG (dessiné directement sur `<canvas>`, sans dépendance) couvre le même besoin d'export visuel.



AO3 Helper — Reading Timeline Coordinator
    Module ID:    readingTimeline
    Display Name: Reading Timeline
    Tab:          Library

    Submodules (imported directly as ES modules):
        ./historyAnalytics.js      -- load history, stats
        ./timelineVisualization.js -- heatmap grid, search

    Storage keys: depends on readingTracker (ao3h:readingHistory:data)


    AO3 Helper — Reading Timeline › HistoryAnalytics sub-module
    Loads reading history from readingTracker API / localStorage,
    transforms it into a date-keyed heatmap structure,
    and computes stats (total, busiest day, top fandoms, streak).


    AO3 Helper — Reading Timeline › TimelineVisualization sub-module
    Panel scaffold, menu button, view controls, heatmap grid, date details,
    search/filter, JSON export. Receives analytics from HistoryAnalytics.


═══════════════════════════════════════════════════════════════════════════
  # readingTimeline
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Reading Timeline** ajoute une frise chronologique permettant d’explorer l’historique de lecture sous différentes formes. Il affiche un calendrier d’activité inspiré des contributions GitHub, un panneau flottant de consultation et plusieurs indicateurs directement dans les pages d’AO3.

* Le module permet notamment de :
    - afficher une frise annuelle ou mensuelle de l’activité de lecture ;
    - rechercher une œuvre dans l’historique ;
    - filtrer les lectures selon différents critères ;
    - afficher les statistiques principales de lecture ;
    - exporter l’historique ;
    - surligner les œuvres déjà lues dans les listes ;
    - distinguer les œuvres relues plusieurs fois ;
    - ajouter des séparateurs chronologiques sur la page d’historique officielle d’AO3.

---

# Réglages utilisateur

| Réglage            | Description                                                                                                          |
| ------------------ |----------------------------------------------------------------------------------------------------------------------|
| `heatmapColor`     | Définit la couleur utilisée pour la grille d’activité. Les couleurs disponibles sont : vert, violet, orange et bleu. |
| `calendarRange`    | Définit le nombre d’années proposées dans le sélecteur du calendrier.                                                |
| `defaultView`      | Définit la vue affichée à l’ouverture du panneau : année complète ou vue mensuelle.                                  |
| `heatmapIntensity` | Définit la vitesse à laquelle une case atteint sa teinte la plus foncée (`low`/`medium`/`high`).                     |
| `hideReadWorks`    | Sur les listings, cache les œuvres déjà lues au lieu de les surligner.                                               |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de cinq sous-modules fonctionnels et d’une feuille de style.

```text
_readingTimeline.js
historyAnalytics.js
timelineVisualization.js
timelineStats.js       (jalons, niveaux de teinte, tranches horaires — pur, testable)
dateAnnotations.js     (notes personnelles par date)
filterPresets.js       (filtres de recherche favoris nommés)
readingTimeline.css
```

---

# _readingTimeline.js

## Rôle

Fichier coordinateur du module.

Il détermine la page actuellement affichée et active les fonctionnalités appropriées.

---

## Responsabilités

* Initialise `historyAnalytics.js`.
* Initialise `timelineVisualization.js`.
* Détecte le contexte de navigation.
* Active le surlignage sur les listes d’œuvres.
* Active les séparateurs chronologiques sur la page d’historique AO3.
* Transmet les données d’analyse au panneau de visualisation.

---

## Détails techniques

Les sous-modules sont importés directement comme modules ES.

Le module utilise les données enregistrées par **Reading Tracker** sous la clé :

```text
ao3h:readingHistory:data
```

---

## Dépendances

Le module dépend des données enregistrées par **Reading Tracker**.

---

# historyAnalytics.js

## Rôle

Charge l’historique de lecture, calcule les statistiques principales et prépare les données utilisées par le reste du module.

Il fournit également les indicateurs affichés directement dans les listes et sur la page d’historique AO3.

---

## Fonctionnalités

### Chargement de l’historique

Charge l’ensemble de l’historique de lecture puis classe les œuvres par date.

Les données sont ensuite transformées en une structure adaptée à la frise chronologique.

---

### Statistiques générales

Le sous-module calcule notamment :

* le nombre total de lectures ;
* le jour ayant connu le plus de lectures ;
* les cinq fandoms les plus lus ;
* la plus longue série de jours consécutifs de lecture.

---

### Surlignage des œuvres

Sur les listes d’œuvres, le module met visuellement en évidence les œuvres déjà lues.

La couleur du surlignage dépend de la date de lecture.

Lorsque le réglage `hideReadWorks` est activé, les œuvres déjà lues sont retirées de l’affichage au lieu d’être surlignées.

---

### Badge de lecture

Les œuvres déjà lues reçoivent un badge :

```text
📚 Read
```

Lorsqu’une œuvre a été lue plusieurs fois, le badge devient :

```text
📚 Read N×
```

où `N` correspond au nombre de lectures enregistrées.

---

### Séparateurs chronologiques

Sur la page officielle de l’historique AO3, le module ajoute des séparateurs afin de regrouper les lectures par période.

Les sections actuellement utilisées sont notamment :

* Aujourd’hui ;
* Hier ;
* 7 derniers jours ;
* Mois dernier ;
* Plus ancien.

---

### Sous-séparateurs matin/après-midi/soir/nuit

Lorsque plusieurs œuvres ont été lues le même jour à des moments clairement différents, un sous-séparateur plus discret (Morning / Afternoon / Evening / Night) s’insère entre elles, en plus du séparateur de jour principal.

---

## Détails techniques

Le sous-module :

* charge les données de **Reading Tracker** ;
* transforme l’historique en une structure indexée par date ;
* calcule les statistiques utilisées par `timelineVisualization.js` ;
* s’appuie sur `timelineStats.js` pour classer chaque lecture par tranche horaire.

---

## Dépendances

* `_readingTimeline.js`
* `ao3h:readingHistory:data`
* `timelineStats.js`
* `timelineVisualization.js`

---

# timelineVisualization.js

## Rôle

Affiche le panneau flottant permettant d’explorer l’historique de lecture.

Il reçoit les données préparées par `historyAnalytics.js` et les présente sous différentes formes.

---

## Fonctionnalités

### Bouton du menu

Ajoute un bouton dans le menu du site permettant d’ouvrir le panneau **Reading Timeline**.

---

### Vue annuelle

Affiche une grille annuelle inspirée du calendrier de contributions GitHub.

Chaque jour est représenté par une case dont la couleur dépend de l’activité de lecture.

La couleur utilisée est déterminée par :

```text
heatmapColor
```

La vitesse à laquelle une case atteint sa teinte la plus foncée dépend de :

```text
heatmapIntensity
```

Une case peut aussi porter un marqueur de jalon (contour orange), un point indiquant une annotation personnelle, ou un contour rouge si elle correspond à la recherche en cours.

---

### Vue mensuelle

Permet d’afficher un calendrier classique représentant un mois complet.

La vue ouverte par défaut dépend du réglage :

```text
defaultView
```

---

### Détail d’une journée

Un clic sur une journée affiche la liste des œuvres lues ce jour-là.

Si la journée a atteint un jalon de lecture, un bandeau l’indique en haut du détail.

Un champ permet d’ajouter, modifier ou effacer une note personnelle pour cette journée (indépendante des œuvres elles-mêmes) — le détail reste accessible même une journée sans lecture, tant qu’une note y est attachée.

Sous chaque œuvre listée, un aperçu de sa note de bookmark (si elle en a une, enregistrée par **Bookmark Vault**) s’affiche.

---

### Recherche

Ajoute une recherche textuelle permettant de retrouver une œuvre dans l’historique.

Les jours correspondants sont mis en avant sur le calendrier (contour rouge) sans que le reste du calendrier disparaisse — la recherche ne filtre plus l’affichage, elle le complète.

---

### Filtres avancés

Le panneau permet notamment de filtrer les résultats selon :

* le fandom ;
* l’auteur ;
* la note ;
* le statut (terminée ou en cours) ;
* le nombre de mots ;
* une plage de dates.

Une combinaison de filtres peut être sauvegardée sous un nom, puis rechargée ou supprimée depuis un menu déroulant dédié.

---

### Export

Le panneau permet d’exporter l’historique après application des filtres.

Les formats actuellement disponibles sont :

* JSON ;
* CSV ;
* PNG (grille annuelle uniquement, dessinée sur `<canvas>`).

---

## Détails techniques

Le sous-module reçoit directement les données préparées par `historyAnalytics.js`.

Il construit :

* le panneau flottant ;
* les contrôles de navigation ;
* la grille d’activité (jalons, annotations, mise en avant de recherche) ;
* le détail d’une journée (jalon, note personnelle, aperçu des notes de bookmarks) ;
* les filtres avancés et leurs presets sauvegardés ;
* les exports (JSON, CSV, PNG).

---

## Dépendances

* `_readingTimeline.js`
* `historyAnalytics.js`
* `timelineStats.js` (jalons, niveaux de teinte)
* `dateAnnotations.js` (notes par date)
* `filterPresets.js` (filtres favoris)
* `ao3h:bookmarkVault:data` (aperçu de note, lecture seule via `getBookmarkVaultNote`)

---

# readingTimeline.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Reading Timeline**.

Il définit notamment l’apparence :

* du panneau flottant ;
* du bouton du menu ;
* de la grille annuelle ;
* du calendrier mensuel ;
* des détails d’une journée (bandeau de jalon, éditeur de note, aperçu de note de bookmark) ;
* des badges `📚 Read` ;
* du surlignage des œuvres ;
* des séparateurs chronologiques et sous-séparateurs matin/après-midi/soir/nuit ;
* des marqueurs de jalon/annotation et de la mise en avant de recherche sur les cellules ;
* des champs de recherche ;
* des filtres et de leurs presets sauvegardés ;
* des contrôles d’export.

---

# Fonctionnalités non implémentées

## ~~Export visuel~~ ✅ PNG implémenté, PDF écarté

Export PNG de la grille annuelle, dessiné directement sur `<canvas>` (bouton "Export PNG"). Le PDF a été écarté — voir Décisions de conception.

---

## ~~Filtre des œuvres lues~~ ✅ Implémenté

Réglage `hideReadWorks` : cache les œuvres déjà lues au lieu de les surligner.

---

## ~~Intensité configurable~~ ✅ Implémentée

Réglage `heatmapIntensity` (`low`/`medium`/`high`), calculé par `getHeatmapLevel()` (`timelineStats.js`).

---

## ~~Annotations personnelles~~ ✅ Implémentées

Éditeur de note par date dans le détail d’une journée, persistée par `dateAnnotations.js`.

---

## ~~Jalons de lecture~~ ✅ Implémentés

Jalons rétrospectifs par seuils cumulés (10e, 25e, 50e, 100e... œuvre lue), calculés par `computeMilestones()` (`timelineStats.js`) — une observation après coup, pas un objectif à atteindre (voir Décisions de conception).

---

## ~~Aperçu des notes~~ ✅ Implémenté

Note de bookmark affichée sous chaque œuvre du détail d’une journée, lue via `getBookmarkVaultNote()` (`lib/storage/keys.js`).

---

## ~~Mise en évidence des recherches~~ ✅ Implémentée

Contour rouge sur les jours correspondant à la recherche en cours, sans filtrer le reste du calendrier.

---

## ~~Sauvegarde des filtres~~ ✅ Implémentée

Filtres favoris nommés (`filterPresets.js`), avec menu déroulant de chargement et suppression.

---

## ~~Séparation par moment de la journée~~ ✅ Implémentée

Sous-séparateurs Morning/Afternoon/Evening/Night insérés entre les lectures d’une même journée, calculés par `timeOfDayBucket()` (`timelineStats.js`).

---

# Décisions de conception

## Objectifs de lecture

Le module ne permet pas de définir des objectifs de lecture.

La lecture est considérée comme un loisir plutôt qu’une activité à mesurer par des objectifs. Les jalons ajoutés au calendrier restent volontairement rétrospectifs (« tu as atteint ta 100e lecture le [date] ») et non prescriptifs — ce ne sont pas des objectifs à atteindre.

---

## Partage de la frise

La frise chronologique ne peut pas être partagée avec d’autres personnes.

Les données de lecture restent privées.

---

## Export PDF

Le module n’exporte pas la frise en PDF.

Générer un PDF proprement nécessiterait une dépendance dédiée au rendu de document, ce qui contredirait l’objectif de garder le bundle de l’extension léger. L’export PNG (dessiné directement sur `<canvas>`, sans dépendance) couvre le même besoin d’export visuel sans ce coût.

---

# Précision historique

Une ancienne documentation indiquait uniquement que :

* `historyAnalytics.js` chargeait l’historique et calculait les statistiques ;
* `timelineVisualization.js` affichait la frise et les outils de recherche.

Le code actuel confirme cette répartition des responsabilités.

`historyAnalytics.js` prépare les données de lecture et calcule les statistiques, tandis que `timelineVisualization.js` reçoit ces données pour construire le panneau, les vues du calendrier, les recherches, les filtres et les exports.
