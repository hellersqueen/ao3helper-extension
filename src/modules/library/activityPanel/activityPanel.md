# activityPanel

**Tab:** Library

## À quoi ça sert

Ce module rassemble les données de lecture récoltées par les autres
modules (historique, kudos, favoris, sessions) pour donner une vue
d'ensemble de ton activité de lecture, sous forme de petits blocs affichés
sur le profil, les statistiques ou le tableau de bord d'AO3.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showTagCloud` | activé *(pas encore actif)* | Une vue visuelle des tags les plus lus |
| `readingAchievements` | activé | Active les badges de paliers (10K / 100K / 1M mots lus) |

Le panneau affiche aussi une section "Behaviour Settings" (synchroniser,
trier, actualiser) *(pas encore actif — rien n'est branché derrière)*.

## Fichiers

### 1. `_activityPanel.js` — le chef d'orchestre

- Met en route tous les autres fichiers de ce module

### 2. `activityPanelShared.js` — outils partagés

- Garde en un seul endroit les réglages et le stockage utilisés par tous les autres fichiers

### 3. `dataCollection.js` — collecte des données

- Rassemble les données venant de l'historique, des kudos, des favoris et des sessions de lecture
- Calcule des totaux (fics, mots, heures, kudos, favoris), les fandoms/tags/auteurs les plus lus, et la note préférée

### 4. `readingStats.js` — statistiques et séries

- Calcule combien de jours consécutifs tu as lu (streak)
- Calcule les paliers/accomplissements débloqués (par exemple un certain nombre de mots ou de fics lues)

### 5. `fandomBreakdown.js` — tableau des fandoms

- Affiche un tableau classé des 20 fandoms les plus lus (nombre de fics, nombre de mots), qu'on peut trier par colonne

### 6. `habitsAnalysis.js` — habitudes de lecture

- Affiche un histogramme des heures de la journée où tu lis le plus
- Indique ton heure de pic et ta période préférée (matin/après-midi/soir/nuit)

### 7. `patternAnalysis.js` — tendances de lecture

- Repère des tendances : saison de lecture préférée, longueur de fic préférée
- Signale si tu n'as pas lu depuis longtemps (14 jours ou plus)
- Détecte un changement de fandom préféré sur les 30 derniers jours

### 8. `readingInsights.js` — bloc "Your Reading Insights"

- Affiche des cartes de statistiques, une bannière de série de lecture, et des badges d'accomplissement (par exemple "Centennial Reader", "Prolific Reader", "Week Warrior", "Kudos Giver")
- Visible sur le profil, la page de statistiques ou le tableau de bord
- Ne s'affiche pas s'il n'y a pas encore assez de données de lecture

### 9. `sessionHistory.js` — enregistrement des sessions

- Enregistre chaque visite d'une page de fic comme une "session" (fandom, mots, heure, nombre de pages vues), avec un maximum de 500 sessions gardées
- C'est cette source de données qui alimente tous les autres blocs d'analyse

### 10. `activityPanel.css`

- Les styles visuels de tous les blocs ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Un nuage de tags (tag cloud) visuel des tags les plus lus — un réglage existe pour l'activer, mais rien n'est vraiment affiché
- Un bouton pour exporter toutes les statistiques dans un fichier
- Un bouton pour recalculer les statistiques à la demande
- Un bouton "My Stats" dans le menu de navigation d'AO3
- Choisir une période (aujourd'hui / 7 jours / 30 jours / cette année / tout) pour filtrer les statistiques — en ce moment tout est calculé sur toute la durée
- Réorganiser les blocs du tableau de bord en les faisant glisser, ou les cacher un par un
- Une carte de chaleur des heures où tu lis le plus, et des prédictions sur tes meilleurs moments pour lire
- Voir à quel moment précis tu abandonnes généralement une fic
- Repérer les fics que tu relis plusieurs fois, ou détecter les sessions de lecture intensive
- Te comparer à toi-même dans le passé (par exemple mois par mois ou année par année)
- Comparer plusieurs fandoms entre eux directement
- Des objectifs de lecture avec une barre de progression (par exemple "50 fics cette année")
- Des rappels mensuels façon "Ton mois d'octobre sur AO3"
- Un rapport annuel à partager, façon "Ton année en fanfictions"
- Suivre l'évolution des kudos/favoris/vues d'une fic précise au fil du temps
- Détecter les tendances de lecture, comme "tu lis de plus en plus de tel tag ces derniers temps"
- Un tableau qui classe tes lectures par catégorie (rating, genre), pas seulement par fandom
- Un graphique camembert qui montre en pourcentage la répartition de tes lectures entre tes différents fandoms
- Ajouter le temps de lecture et les kudos donnés dans le tableau des fandoms, en plus du nombre de fics et de mots
- Dire si tu es plutôt un lecteur de nuit, ou si tu lis de façon très régulière
- Regarder des tendances par saison plus poussées : combien tu lis par trimestre, si tu lis plus pendant les vacances, et si tes genres préférés changent selon la saison
- Essayer de prédire combien de fics tu liras dans le futur, ou deviner quel sera ton prochain fandom préféré
- Après une période sans lecture, afficher un petit message motivant pour t'encourager à t'y remettre
- Suivre ta progression chapitre par chapitre pendant que tu lis une fic, en fonction de combien tu as fait défiler la page
- Un tableau de bord avec des onglets pour naviguer entre les différentes vues (Fandoms/Tags/Auteurs/Habitudes/Accomplissements), plutôt qu'une simple liste de blocs
- Aller chercher les statistiques déjà affichées sur ta page de statistiques AO3 (celle du site lui-même) pour les réutiliser ici, au lieu de tout recalculer à partir de zéro
- Une idée pour plus tard, pas encore promise (jugée trop compliquée à construire pour l'instant) : un petit graphique qui montre comment la popularité d'une fic (kudos, favoris, commentaires, vues) évolue avec le temps, avec un signal quand une fic monte très vite en popularité
- Un bloc de liens rapides vers les favoris, l'historique, la liste "à lire plus tard" et les abonnements, directement sur le tableau de bord
- Rendre le nuage de tags cliquable, pour lancer une recherche directement en cliquant sur un tag

## Explicitement écarté

- Voir les statistiques publiques d'un auteur (vues, kudos, abonnés) — AO3 ne propose pas d'accès public pour ça
- Un profil d'accomplissements plus large avec plus de badges — volontairement limité pour ne pas trop gamifier la lecture
- Un petit résumé du genre "5 fics lues cette session" affiché pendant qu'on navigue — essayé puis retiré, ce n'était intéressant qu'une seule fois avant d'être ignoré
- Un classement ou une comparaison de tes statistiques avec celles d'autres personnes — la lecture n'est pas une compétition
- Partager ses statistiques sous forme d'image — écarté pour rester privé
- Suivre en détail le temps passé sur chaque fic — jugé trop indiscret
- Des onglets séparés dans le tableau de bord — jugé trop lourd
- Pouvoir activer ou désactiver chaque statistique une par une — toutes les statistiques restent toujours affichées ensemble
- Une statistique du nombre de commentaires postés — jugée hors sujet


AO3 Helper - Activity Panel Module Coordinator
    Module ID: activityPanel
    Display Name: Activity Panel
    Tab: Library

    Submodules:
        dataCollection   — aggregates stats from all storage buckets (ES export, imported by readingInsights)
        readingStats     — pure helpers: calculateStreak, calculateAchievements (ES export, imported by readingInsights)
        fandomBreakdown  — ranked fandom table on dashboard
        habitsAnalysis   — hour-of-day histogram on dashboard
        patternAnalysis  — seasonal/length/shift pattern widget on dashboard
        readingInsights  — stat cards + streak + achievements on profile/dashboard
        sessionHistory   — records work-page sessions to activityPanel:sessions

    Storage keys (owned by submodules):
        ao3h:activityPanel:sessions     -- owned by sessionHistory    [{ workId, startedAt, ... }], max 500
        ao3h:activityPanel:preferences  -- owned by readingInsights   { widgetOrder, hiddenWidgets, timePeriod }

    Public API: exported (store, cfg, NS) for direct import by readingInsights ; also
    exposed as W.AO3H_ActivityPanel while enabled, for parity with the legacy bridge.


    AO3 Helper — Activity Panel › DataCollection sub-module
    Reads from localStorage and computes aggregated stats:
    totalWorks, totalWords, totalHours, totalKudos, totalBookmarks,
    topFandoms, topTags, topAuthors, averageWordsPerDay, favoriteRating.
    Also passes _readingHistory through for streak/achievement computation.


    AO3 Helper — Activity Panel › FandomBreakdown sub-module
    Computes a ranked fandom table from session history and injects it into
    the user's dashboard page. Reads: ao3h:activityPanel:sessions
    Registered as: fandomBreakdown (parent: activityPanel)



AO3 Helper — Activity Panel › HabitsAnalysis sub-module
    Analyses reading session times (hour-of-day histogram, preferred period)
    and injects a bar-chart widget into the user's dashboard page.
    Reads: ao3h:activityPanel:sessions
    Registered as: habitsAnalysis (parent: activityPanel)


    AO3 Helper — Activity Panel › PatternAnalysis sub-module
    Detects reading patterns (seasonal peaks, length preference, fandom shifts,
    reading slumps) from session history and injects a summary widget into
    the user's dashboard page. Reads: ao3h:activityPanel:sessions
    Registered as: patternAnalysis (parent: activityPanel)


    AO3 Helper — Activity Panel › ReadingInsights sub-module
    Injects a "Your Reading Insights" widget (stat cards, streak banner,
    achievement badges) on the user's profile, stats, and dashboard pages.
    Delegates aggregation to DataCollection and ReadingStats.
    Registered as: readingInsights (parent: activityPanel)


    AO3 Helper — Activity Panel › ReadingStats sub-module
    Pure computation helpers (no storage access):
      - calculateStreak(history)      → number
      - calculateAchievements(stats)  → achievement[]


AO3 Helper — Activity Panel › SessionHistory sub-module
    Records work-page sessions to localStorage (ao3h:activityPanel:sessions).
    Captures startedAt, lastActiveAt, pageViews, hourOfDay, fandoms[], words.
    Registered as: sessionHistory (parent: activityPanel)


    
═══════════════════════════════════════════════════════════════════════════
  # activityPanel
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════
# À quoi ça sert

Le module **Activity Panel** rassemble les données de lecture récoltées par les autres modules d’AO3 Helper afin de fournir une vue d’ensemble de l’activité de lecture.

Il exploite notamment les données provenant :

* de l’historique de lecture ;
* des kudos ;
* des favoris ;
* des sessions de lecture enregistrées.

Les résultats sont présentés sous forme de blocs affichés sur :

* le profil utilisateur ;
* la page de statistiques ;
* le tableau de bord d’AO3.

Le module permet notamment de :

* calculer les principaux totaux de lecture ;
* suivre les séries de jours consécutifs de lecture ;
* débloquer des accomplissements ;
* analyser les fandoms les plus lus ;
* analyser les heures et périodes habituelles de lecture ;
* détecter certaines tendances de lecture ;
* afficher un bloc récapitulatif intitulé **Your Reading Insights** ;
* enregistrer les sessions de lecture utilisées par les autres analyses.

---

# Réglages utilisateur

| Réglage               | Défaut                       | Description                                                                                                                               |
| --------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `showTagCloud`        | Activé, mais non fonctionnel | Prévoit l’affichage d’un nuage visuel des tags les plus lus. Le réglage existe, mais aucun nuage de tags n’est actuellement affiché.      |
| `readingAchievements` | Activé                       | Active les badges associés aux paliers et accomplissements de lecture, notamment les paliers de 10 000, 100 000 et 1 000 000 de mots lus. |

Le panneau de configuration contient également une section **Behaviour Settings** proposant des options liées à :

* la synchronisation ;
* au tri ;
* à l’actualisation.

Ces options ne sont toutefois pas encore reliées à une fonctionnalité active.

---

# Structure du module

Le module est composé d’un fichier coordinateur, d’un fichier d’outils partagés, de sept sous-modules fonctionnels et d’une feuille de style.

```text
_activityPanel.js
activityPanelShared.js
dataCollection.js
readingStats.js
fandomBreakdown.js
habitsAnalysis.js
patternAnalysis.js
readingInsights.js
sessionHistory.js
activityPanel.css
```

---

# _activityPanel.js

## Rôle

Fichier coordinateur du module.

Il initialise les sous-modules d’**Activity Panel**, centralise les éléments partagés et expose les outils nécessaires au reste du module.

---

## Responsabilités

* Met en route tous les sous-modules.
* Centralise l’accès au stockage et à la configuration.
* Expose les éléments partagés nécessaires à `readingInsights.js`.
* Maintient un pont global pour assurer la compatibilité avec l’ancienne architecture du module.

---

## Fonctions exposées

Le coordinateur exporte directement :

* `store`
* `cfg`
* `NS`

Ces éléments peuvent être importés directement par `readingInsights.js`.

Une API globale est également exposée pendant que le module est actif :

```text
W.AO3H_ActivityPanel
```

Cette exposition globale est conservée pour rester compatible avec l’ancien système de ponts entre modules.

---

# activityPanelShared.js

## Rôle

Centralise les outils partagés, les réglages et les accès au stockage utilisés par les autres fichiers du module.

---

## Fonctionnalités

Le fichier fournit un point d’accès commun pour :

* la configuration du module ;
* les fonctions de stockage ;
* l’espace de noms utilisé par **Activity Panel** ;
* les données partagées entre les sous-modules.

---

## Détails techniques

Les principales clés de stockage utilisées par le module sont :

```text
ao3h:activityPanel:sessions
ao3h:activityPanel:preferences
```

La clé :

```text
ao3h:activityPanel:sessions
```

est gérée par `sessionHistory.js`.

Elle contient une liste de sessions de lecture, avec un maximum de 500 entrées.

La clé :

```text
ao3h:activityPanel:preferences
```

est gérée par `readingInsights.js`.

Elle peut contenir notamment :

* `widgetOrder`
* `hiddenWidgets`
* `timePeriod`

Certaines de ces préférences correspondent toutefois à des fonctionnalités qui ne sont pas encore entièrement implémentées dans l’interface actuelle.

---

## Dépendances

Ce fichier est utilisé par le coordinateur et par les sous-modules qui ont besoin d’accéder aux données ou à la configuration d’**Activity Panel**.

---

# dataCollection.js

## Rôle

Collecte et agrège les données provenant des différentes sources de stockage d’AO3 Helper.

Il prépare les statistiques utilisées par les autres sous-modules, principalement par `readingInsights.js`.

---

## Fonctionnalités

### Agrégation des données

Le sous-module rassemble les données provenant notamment :

* de l’historique de lecture ;
* des kudos ;
* des favoris ;
* des sessions de lecture.

---

### Totaux généraux

Il calcule notamment :

* le nombre total d’œuvres lues ;
* le nombre total de mots lus ;
* le nombre total d’heures de lecture ;
* le nombre total de kudos donnés ;
* le nombre total de favoris enregistrés ;
* le nombre moyen de mots lus par jour.

---

### Préférences de lecture

Il détermine également :

* les fandoms les plus lus ;
* les tags les plus lus ;
* les auteurs les plus lus ;
* le rating préféré.

---

### Historique transmis

Le sous-module transmet également l’historique de lecture brut sous la propriété :

```text
_readingHistory
```

Cette donnée est utilisée pour le calcul :

* des séries de lecture ;
* des accomplissements.

---

## Détails techniques

Les résultats agrégés comprennent notamment :

```text
totalWorks
totalWords
totalHours
totalKudos
totalBookmarks
topFandoms
topTags
topAuthors
averageWordsPerDay
favoriteRating
_readingHistory
```

---

## Dépendances

Les résultats de ce sous-module sont utilisés par :

* `readingInsights.js`
* `readingStats.js`

---

# readingStats.js

## Rôle

Fournit les fonctions de calcul liées aux séries de lecture et aux accomplissements.

Ce sous-module effectue uniquement des calculs et n’accède pas directement au stockage.

---

## Fonctionnalités

### Série de lecture

Calcule le nombre de jours consécutifs pendant lesquels l’utilisateur a lu.

---

### Accomplissements

Détermine les accomplissements débloqués à partir des statistiques disponibles.

Ces accomplissements peuvent notamment correspondre :

* à un nombre de mots lus ;
* à un nombre d’œuvres lues ;
* à une série de jours consécutifs ;
* à certaines interactions comme les kudos.

---

## Détails techniques

Le sous-module expose les fonctions suivantes :

```text
calculateStreak(history)
calculateAchievements(stats)
```

La fonction :

```text
calculateStreak(history)
```

retourne un nombre représentant la série actuelle de jours de lecture consécutifs.

La fonction :

```text
calculateAchievements(stats)
```

retourne une liste d’accomplissements débloqués.

---

## Dépendances

Ce sous-module est utilisé par `readingInsights.js`.

Il reçoit les données préparées par `dataCollection.js`.

---

# fandomBreakdown.js

## Rôle

Affiche un tableau classé des fandoms les plus lus sur le tableau de bord de l’utilisateur.

---

## Fonctionnalités

### Classement des fandoms

Le sous-module calcule et affiche les 20 fandoms les plus lus.

Pour chaque fandom, il présente notamment :

* le nombre de fics lues ;
* le nombre total de mots lus.

---

### Tri du tableau

Le tableau peut être trié selon ses différentes colonnes.

---

## Détails techniques

Le classement est calculé à partir des sessions enregistrées sous :

```text
ao3h:activityPanel:sessions
```

Le sous-module injecte le tableau directement dans le tableau de bord de l’utilisateur.

Il est enregistré sous l’identifiant :

```text
fandomBreakdown
```

avec le parent :

```text
activityPanel
```

---

## Dépendances

* `sessionHistory.js`
* `activityPanelShared.js`

---

# habitsAnalysis.js

## Rôle

Analyse les heures auxquelles l’utilisateur lit le plus souvent et affiche un résumé de ses habitudes de lecture sur le tableau de bord.

---

## Fonctionnalités

### Histogramme horaire

Le sous-module affiche un histogramme représentant les heures de la journée pendant lesquelles les sessions de lecture ont lieu.

---

### Heure de pic

Il identifie l’heure à laquelle l’activité de lecture est la plus élevée.

---

### Période préférée

Il détermine également la période de lecture préférée parmi :

* le matin ;
* l’après-midi ;
* le soir ;
* la nuit.

---

## Détails techniques

L’analyse repose sur les sessions enregistrées sous :

```text
ao3h:activityPanel:sessions
```

Le sous-module injecte un bloc contenant un graphique en barres dans le tableau de bord.

Il est enregistré sous l’identifiant :

```text
habitsAnalysis
```

avec le parent :

```text
activityPanel
```

---

## Dépendances

* `sessionHistory.js`
* `activityPanelShared.js`

---

# patternAnalysis.js

## Rôle

Analyse les sessions de lecture afin de détecter certaines tendances et certains changements dans les habitudes de lecture.

---

## Fonctionnalités

### Tendances saisonnières

Le sous-module tente d’identifier la saison pendant laquelle l’utilisateur lit le plus.

---

### Longueur préférée

Il détecte la longueur de fic habituellement privilégiée.

---

### Période d’inactivité

Il signale une période sans lecture lorsque la dernière activité remonte à 14 jours ou plus.

---

### Changement de fandom

Il détecte un changement de fandom préféré à partir des données des 30 derniers jours.

---

## Détails techniques

Les tendances sont calculées à partir des sessions enregistrées sous :

```text
ao3h:activityPanel:sessions
```

Le sous-module injecte un bloc récapitulatif dans le tableau de bord de l’utilisateur.

Il est enregistré sous l’identifiant :

```text
patternAnalysis
```

avec le parent :

```text
activityPanel
```

---

## Dépendances

* `sessionHistory.js`
* `activityPanelShared.js`

---

# readingInsights.js

## Rôle

Affiche un bloc intitulé **Your Reading Insights** regroupant les principales statistiques de lecture.

---

## Fonctionnalités

### Cartes de statistiques

Le bloc affiche plusieurs cartes récapitulatives à partir des données agrégées par `dataCollection.js`.

---

### Bannière de série

Il affiche une bannière représentant la série actuelle de jours consécutifs de lecture.

---

### Badges d’accomplissement

Il présente les accomplissements débloqués.

Les badges peuvent notamment inclure :

* **Centennial Reader**
* **Prolific Reader**
* **Week Warrior**
* **Kudos Giver**

Les accomplissements liés aux mots lus peuvent également inclure des paliers tels que :

* 10 000 mots ;
* 100 000 mots ;
* 1 000 000 de mots.

---

### Pages d’affichage

Le bloc peut apparaître sur :

* le profil utilisateur ;
* la page de statistiques ;
* le tableau de bord.

---

### Données insuffisantes

Le bloc ne s’affiche pas lorsqu’il n’existe pas encore assez de données de lecture pour produire des statistiques utiles.

---

## Détails techniques

Le sous-module délègue :

* l’agrégation des données à `dataCollection.js` ;
* le calcul des séries et accomplissements à `readingStats.js`.

Il utilise la clé de préférences :

```text
ao3h:activityPanel:preferences
```

Cette clé peut contenir :

```text
widgetOrder
hiddenWidgets
timePeriod
```

Le sous-module est enregistré sous l’identifiant :

```text
readingInsights
```

avec le parent :

```text
activityPanel
```

---

## Dépendances

* `dataCollection.js`
* `readingStats.js`
* `activityPanelShared.js`

---

# sessionHistory.js

## Rôle

Enregistre les sessions de lecture effectuées sur les pages d’œuvres.

Ces sessions constituent la principale source de données utilisée par les autres sous-modules d’analyse.

---

## Fonctionnalités

### Enregistrement des sessions

Chaque visite d’une page de fic est enregistrée comme une session de lecture.

---

### Informations enregistrées

Une session peut contenir notamment :

* l’identifiant de l’œuvre ;
* l’heure de début ;
* la dernière activité détectée ;
* le nombre de pages vues ;
* l’heure de la journée ;
* les fandoms associés ;
* le nombre de mots.

Les propriétés correspondantes comprennent notamment :

```text
workId
startedAt
lastActiveAt
pageViews
hourOfDay
fandoms
words
```

---

### Limite de stockage

Le sous-module conserve un maximum de 500 sessions.

---

## Détails techniques

Les données sont enregistrées dans `localStorage` sous la clé :

```text
ao3h:activityPanel:sessions
```

Le sous-module est enregistré sous l’identifiant :

```text
sessionHistory
```

avec le parent :

```text
activityPanel
```

---

## Dépendances

Les données enregistrées sont utilisées par :

* `dataCollection.js`
* `fandomBreakdown.js`
* `habitsAnalysis.js`
* `patternAnalysis.js`
* `readingInsights.js`

---

# activityPanel.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Activity Panel**.

Il définit notamment l’apparence :

* des cartes de statistiques ;
* de la bannière de série ;
* des badges d’accomplissement ;
* du tableau des fandoms ;
* de l’histogramme des habitudes de lecture ;
* des blocs de tendances ;
* des différents éléments affichés sur le profil, les statistiques et le tableau de bord.

---

# Fonctionnalités non implémentées

## Nuage de tags

Afficher un nuage visuel des tags les plus lus.

Le réglage `showTagCloud` existe déjà, mais aucun nuage de tags n’est actuellement généré.

Le nuage pourrait également devenir cliquable afin de lancer une recherche en sélectionnant directement un tag.

---

## Export des statistiques

Ajouter un bouton permettant d’exporter toutes les statistiques dans un fichier.

---

## Recalcul manuel

Ajouter un bouton permettant de recalculer les statistiques à la demande.

---

## Bouton My Stats

Ajouter un bouton **My Stats** dans le menu de navigation d’AO3.

---

## Filtrage par période

Permettre de filtrer les statistiques selon une période choisie :

* aujourd’hui ;
* 7 jours ;
* 30 jours ;
* cette année ;
* toute la durée.

Actuellement, les statistiques sont calculées sur l’ensemble des données disponibles.

---

## Organisation des blocs

Permettre de :

* réorganiser les blocs par glisser-déposer ;
* masquer les blocs individuellement.

Les propriétés `widgetOrder` et `hiddenWidgets` existent dans le stockage des préférences, mais cette interface n’est pas encore entièrement fonctionnelle.

---

## Carte de chaleur

Afficher une carte de chaleur représentant les heures auxquelles l’utilisateur lit le plus.

Cette analyse pourrait également servir à prédire les meilleurs moments pour lire.

---

## Abandon des œuvres

Détecter le moment précis où l’utilisateur abandonne généralement une fic.

---

## Relectures et sessions intensives

Détecter :

* les œuvres relues plusieurs fois ;
* les sessions de lecture particulièrement intensives.

---

## Comparaison historique personnelle

Comparer les statistiques actuelles avec celles de périodes précédentes, notamment :

* mois par mois ;
* année par année.

---

## Comparaison des fandoms

Permettre de comparer directement plusieurs fandoms entre eux.

---

## Objectifs de lecture

Ajouter des objectifs avec une barre de progression, par exemple :

```text
50 fics cette année
```

---

## Résumés mensuels

Afficher des rappels ou rapports mensuels du type :

```text
Ton mois d’octobre sur AO3
```

---

## Rapport annuel

Produire un rapport annuel partageable du type :

```text
Ton année en fanfictions
```

---

## Évolution d’une œuvre

Suivre dans le temps l’évolution :

* des kudos ;
* des favoris ;
* des commentaires ;
* des vues.

Un graphique pourrait montrer l’évolution de la popularité d’une fic et signaler une augmentation rapide.

Cette fonctionnalité reste une idée à long terme et n’est pas encore promise, car elle a été jugée trop complexe à construire pour le moment.

---

## Tendances récentes

Détecter les changements progressifs dans les habitudes de lecture, par exemple :

```text
Tu lis de plus en plus de ce tag récemment.
```

---

## Classement par catégorie

Ajouter un tableau classant les lectures selon différentes catégories, notamment :

* le rating ;
* le genre ;
* d’autres métadonnées.

Le classement actuel se concentre principalement sur les fandoms.

---

## Répartition des fandoms

Ajouter un graphique circulaire présentant en pourcentage la répartition des lectures entre les fandoms.

---

## Statistiques supplémentaires par fandom

Ajouter au tableau des fandoms :

* le temps de lecture ;
* les kudos donnés.

Ces données viendraient compléter :

* le nombre de fics ;
* le nombre de mots.

---

## Profil des habitudes

Déterminer si l’utilisateur :

* lit principalement la nuit ;
* lit de façon particulièrement régulière.

---

## Tendances saisonnières avancées

Analyser plus précisément :

* le nombre de lectures par trimestre ;
* l’effet des vacances sur l’activité de lecture ;
* les changements de genres préférés selon la saison.

---

## Prédictions de lecture

Tenter de prédire :

* le nombre de fics qui seront lues dans le futur ;
* le prochain fandom susceptible de devenir le fandom préféré.

---

## Message de reprise

Après une longue période sans lecture, afficher un message motivant pour encourager la reprise.

---

## Progression dans une œuvre

Suivre la progression chapitre par chapitre à partir du défilement effectué sur la page.

---

## Tableau de bord avec navigation

Créer un tableau de bord organisé en différentes vues :

* Fandoms ;
* Tags ;
* Auteurs ;
* Habitudes ;
* Accomplissements.

Cette organisation est mentionnée comme possibilité future, mais des onglets séparés ont également été écartés dans les décisions de conception en raison de leur lourdeur. Toute évolution devrait donc éviter de reproduire une navigation trop complexe.

---

## Importation des statistiques AO3

Récupérer les statistiques déjà affichées sur la page de statistiques officielle d’AO3 afin de les réutiliser dans le module, plutôt que de tout recalculer à partir des données locales.

---

## Liens rapides

Ajouter sur le tableau de bord un bloc de liens directs vers :

* les favoris ;
* l’historique ;
* la liste Marked for Later ;
* les abonnements.

---

# Décisions de conception

## Statistiques publiques des auteurs

Le module ne tente pas d’afficher les statistiques publiques détaillées d’un auteur, comme :

* les vues ;
* les kudos ;
* les abonnés.

AO3 ne fournit pas d’accès public adapté à ces données.

---

## Nombre d’accomplissements

Le système d’accomplissements reste volontairement limité afin de ne pas transformer excessivement la lecture en système de jeu.

---

## Résumé de session

Un petit résumé du type :

```text
5 fics lues cette session
```

a été essayé puis retiré.

Cette information n’était intéressante qu’une seule fois avant d’être généralement ignorée.

---

## Comparaison avec les autres utilisateurs

Le module ne propose aucun classement ni comparaison avec les statistiques d’autres personnes.

La lecture n’est pas considérée comme une compétition.

---

## Partage sous forme d’image

Les statistiques ne peuvent pas être partagées sous forme d’image.

Cette fonctionnalité a été écartée afin de préserver le caractère privé des données.

---

## Suivi détaillé du temps

Le module ne suit pas précisément le temps passé sur chaque fic.

Ce niveau de suivi a été jugé trop indiscret.

---

## Onglets séparés

Le tableau de bord ne contient pas d’onglets séparés.

Cette organisation a été jugée trop lourde.

---

## Affichage individuel des statistiques

Il n’est pas possible d’activer ou de désactiver chaque statistique séparément.

Toutes les statistiques restent affichées ensemble.

---

## Nombre de commentaires postés

Le module ne calcule pas le nombre de commentaires publiés par l’utilisateur.

Cette statistique a été jugée hors sujet.






