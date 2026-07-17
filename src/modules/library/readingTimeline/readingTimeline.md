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

Le module **Reading Timeline** ajoute une frise chronologique permettant d’explorer l’historique de lecture sous différentes formes.

Il affiche notamment un calendrier d’activité inspiré des contributions GitHub, un panneau flottant de consultation et plusieurs indicateurs directement dans les pages d’AO3.

Le module permet notamment de :

* afficher une frise annuelle ou mensuelle de l’activité de lecture ;
* rechercher une œuvre dans l’historique ;
* filtrer les lectures selon différents critères ;
* afficher les statistiques principales de lecture ;
* exporter l’historique ;
* surligner les œuvres déjà lues dans les listes ;
* distinguer les œuvres relues plusieurs fois ;
* ajouter des séparateurs chronologiques sur la page d’historique officielle d’AO3.

---

# Réglages utilisateur

| Réglage         | Défaut  | Description                                                                                                          |
| --------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `heatmapColor`  | `green` | Définit la couleur utilisée pour la grille d’activité. Les couleurs disponibles sont : vert, violet, orange et bleu. |
| `calendarRange` | `5`     | Définit le nombre d’années proposées dans le sélecteur du calendrier.                                                |
| `defaultView`   | `year`  | Définit la vue affichée à l’ouverture du panneau : année complète ou vue mensuelle.                                  |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de deux sous-modules fonctionnels et d’une feuille de style.

```text
_readingTimeline.js
historyAnalytics.js
timelineVisualization.js
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

## Détails techniques

Le sous-module :

* charge les données de **Reading Tracker** ;
* transforme l’historique en une structure indexée par date ;
* calcule les statistiques utilisées par `timelineVisualization.js`.

---

## Dépendances

* `_readingTimeline.js`
* `ao3h:readingHistory:data`
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

---

### Recherche

Ajoute une recherche textuelle permettant de retrouver une œuvre dans l’historique.

---

### Filtres avancés

Le panneau permet notamment de filtrer les résultats selon :

* le fandom ;
* l’auteur ;
* la note ;
* le statut (terminée ou en cours) ;
* le nombre de mots ;
* une plage de dates.

---

### Export

Le panneau permet d’exporter l’historique après application des filtres.

Les formats actuellement disponibles sont :

* JSON ;
* CSV.

---

## Détails techniques

Le sous-module reçoit directement les données préparées par `historyAnalytics.js`.

Il construit :

* le panneau flottant ;
* les contrôles de navigation ;
* la grille d’activité ;
* les résultats de recherche ;
* les exports.

---

## Dépendances

* `_readingTimeline.js`
* `historyAnalytics.js`

---

# readingTimeline.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Reading Timeline**.

Il définit notamment l’apparence :

* du panneau flottant ;
* du bouton du menu ;
* de la grille annuelle ;
* du calendrier mensuel ;
* des détails d’une journée ;
* des badges `📚 Read` ;
* du surlignage des œuvres ;
* des séparateurs chronologiques ;
* des champs de recherche ;
* des filtres ;
* des contrôles d’export.

---

# Fonctionnalités non implémentées

## Export visuel

Exporter la frise sous forme :

* d’image PNG ;
* de document PDF.

Les exports actuels sont limités aux formats JSON et CSV.

---

## Filtre des œuvres lues

Ajouter un véritable filtre permettant de masquer les œuvres déjà lues dans les listes.

Le système actuel se limite à un surlignage visuel.

---

## Intensité configurable

Permettre de régler l’intensité des couleurs de la grille selon le nombre de lectures.

---

## Annotations personnelles

Ajouter des annotations sur certaines dates, par exemple :

```text
Marathon de vacances
```

---

## Jalons de lecture

Afficher des événements particuliers directement sur la frise, par exemple des étapes importantes de lecture.

---

## Aperçu des notes

Afficher les notes personnelles provenant des bookmarks directement dans l’historique de lecture.

---

## Mise en évidence des recherches

Faire ressortir sur le calendrier les journées correspondant aux résultats d’une recherche.

---

## Sauvegarde des filtres

Permettre d’enregistrer des filtres favoris afin de les réutiliser ultérieurement.

---

## Séparation par moment de la journée

Lorsque plusieurs lectures ont lieu le même jour, distinguer visuellement :

* les lectures du matin ;
* les lectures de l’après-midi ;
* les lectures du soir.

Le système actuel distingue uniquement les journées grâce aux séparateurs chronologiques.

---

# Décisions de conception

## Objectifs de lecture

Le module ne permet pas de définir des objectifs de lecture.

La lecture est considérée comme un loisir plutôt qu’une activité à mesurer par des objectifs.

---

## Partage de la frise

La frise chronologique ne peut pas être partagée avec d’autres personnes.

Les données de lecture restent privées.

---

# Précision historique

Une ancienne documentation indiquait uniquement que :

* `historyAnalytics.js` chargeait l’historique et calculait les statistiques ;
* `timelineVisualization.js` affichait la frise et les outils de recherche.

Le code actuel confirme cette répartition des responsabilités.

`historyAnalytics.js` prépare les données de lecture et calcule les statistiques, tandis que `timelineVisualization.js` reçoit ces données pour construire le panneau, les vues du calendrier, les recherches, les filtres et les exports.
