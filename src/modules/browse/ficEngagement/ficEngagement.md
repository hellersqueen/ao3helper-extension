# ficEngagement

**Tab:** Browse

## À quoi ça sert

Ce module ajoute des indicateurs sur les listes de fics (et sur la page
d'une fic) pour repérer rapidement les œuvres qui valent le coup, au-delà
du simple nombre de kudos ou de vues.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `colorCodeMetrics` | désactivé | Colore les badges selon leur niveau d'engagement |
| `hideLowEngagement` | désactivé | Cache les fics dont le taux de kudos est dans la tranche "faible" (< 8 %) |
| `gemMinRatio` | `5` (%) | Ratio minimum kudos/vues pour être une pépite cachée |
| `gemMaxKudos` | `100` | Nombre de kudos maximum pour rester "peu populaire" |
| `gemMaxBookmarks` | `10` | Nombre de favoris maximum pour rester "peu populaire" |
| `gemMinHits` | `50` | Nombre de vues minimum pour avoir assez de données |
| `gemCompareToPageAverage` | désactivé | Repère aussi les pépites par rapport à la moyenne de la page affichée, en plus des seuils fixes |

## Fichiers

### 1. `_ficEngagement.js` — le chef d'orchestre

- Met en route les deux autres fichiers de fonctionnalités de ce module

### 2. `ficEngagementHelpers.js` — logique extraite

- `commentRate`/`classifyLevel` : calcul et classement (haut/moyen/faible) des ratios
- `isGem`/`gemMedal` : détection de pépite cachée et son niveau de médaille (seuils personnalisables)
- `averageRatio`/`isGemRelativeToPageAverage` : détection relative à la moyenne des œuvres affichées sur la page

### 3. `engagementMetrics.js` — badges de métriques

- Calcule et affiche quatre badges sous les statistiques de chaque fic : le taux de kudos par rapport aux vues, le nombre de kudos par rapport au nombre de mots, le taux de mise en favori par rapport aux kudos, et le taux de commentaires par rapport aux kudos
- Un badge "ⓘ" explique en survol comment interpréter chaque ratio (seuils haut/moyen/faible)
- Chaque badge montre les chiffres bruts si on passe la souris dessus
- Peut colorer les badges (vert/jaune/rouge) selon le niveau d'engagement
- Peut cacher entièrement les fics à faible engagement (réglage `hideLowEngagement`)

### 4. `hiddenGems.js` — pépites cachées

- Repère les fics peu populaires mais avec un très bon taux d'engagement, et leur ajoute un badge médaille (💎 diamant / 🥇 or / 🥈 argent) selon la force du ratio
- Les seuils (ratio minimum, plafonds de popularité, vues minimum) sont réglables dans le panneau, au lieu d'être figés
- Peut aussi repérer une pépite par comparaison avec la moyenne des œuvres affichées sur la page courante (approximation de "comparer au fandom", puisque l'extension ne voit que les œuvres affichées, pas tout le catalogue d'un fandom)

### 5. `ficEngagement.css`

- Les styles visuels des badges, y compris les variantes par médaille

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Une note personnelle qu'on pourrait donner à une fic~~ ✅ Fait (déjà couvert ailleurs)
  Le module `ficAppreciation` propose déjà `starRatings.js` : une note
  personnelle de 1 à 5 étoiles (avec note libre optionnelle), sur la page
  d'une œuvre et dans les listes. Pas de duplication ici.
- ~~Compter combien de fois une fic est mise en favori ou commentée, par rapport à ses kudos~~ ✅ Fait
  Nouveau badge "taux de commentaires" (`comments / kudos × 100`) — le
  taux de favoris existait déjà (Save Rate).
- ~~Un filtre pour ne montrer que les fics avec un très bon ratio~~ ✅ Fait
  Réglage `hideLowEngagement` : cache les fics dont le taux de kudos est
  dans la tranche "faible".
- ~~Des catégories de "pépites cachées" (nouveaux auteurs, vieux classiques, couples rares)~~ ❌ Écarté
  Nécessiterait des données indisponibles sans requêtes supplémentaires par
  auteur (ancienneté du compte, nombre total d'œuvres) ou une base de
  fréquence des tags par fandom (couples rares) — hors de portée d'un badge
  calculé localement à partir des stats déjà affichées.
- ~~Des niveaux de pépites, comme des médailles (diamant/or/argent)~~ ✅ Fait
  `gemMedal()` : diamant (ratio ≥ 3× le seuil minimum), or (≥ 2×), argent
  (le seuil de base).
- ~~Une version plus poussée du détecteur de pépites cachées~~ ✅ Fait (déjà couvert)
  Cette demande générique est couverte par la combinaison des points
  ci-dessous : niveaux de médaille, seuils personnalisables, et comparaison
  à la moyenne de la page.
- ~~Mettre automatiquement les pépites cachées en haut de la liste "à lire plus tard"~~ ❌ Écarté
  Nécessiterait que ce module modifie l'ordre d'affichage d'un autre module
  (Later Shelf) — un couplage entre modules que le projet évite (voir E7
  dans l'audit `shared.md`). Le badge reste une information sur les
  listings, pas une action sur une autre liste.
- ~~Montrer le classement d'une fic parmi tout le fandom (en %)~~ ❌ Écarté
  Nécessiterait de connaître les statistiques de toutes les œuvres d'un
  fandom pour calculer un centile — des dizaines ou centaines de requêtes
  par fandom.
- ~~Un petit guide qui explique comment interpréter chaque ratio (bon, moyen, faible)~~ ✅ Fait
  Badge "ⓘ" à côté des métriques, avec les seuils exacts en info-bulle.
- ~~Pouvoir changer soi-même les seuils utilisés pour repérer une pépite cachée, au lieu de seuils fixes~~ ✅ Fait
  Réglages `gemMinRatio` / `gemMaxKudos` / `gemMaxBookmarks` / `gemMinHits`.
- ~~Repérer les pépites cachées en les comparant à la moyenne de leur propre fandom, plutôt qu'avec les mêmes seuils fixes pour tout le monde~~ ✅ Fait (approximation)
  Réglage `gemCompareToPageAverage` : compare à la moyenne des œuvres
  affichées sur la page courante, pas au fandom entier (voir "classement
  dans le fandom" ci-dessus pour pourquoi une vraie moyenne de fandom est
  hors de portée).
- ~~Un score qui essaie de deviner si une fic en cours risque d'être abandonnée et jamais terminée, en regardant les habitudes de publication passées de l'auteur~~ ❌ Écarté
  Concept déjà explicitement rejeté à l'échelle du projet (voir
  "updateLikelihood" dans `docs/never-built-modules.md`) : juger
  publiquement qu'une fic risque d'être abandonnée est injuste envers
  l'auteur·ice.

---

~~- Voir si une fic devient de plus en plus populaire au fil du temps, avec des graphiques et un historique~~
~~- Voir si le ratio d'une fic monte ou descend avec le temps~~
~~- Comparer une fic à la moyenne de son fandom~~
~~- Deviner à l'avance si une fic va devenir populaire~~
~~- Suivre si les commentaires qu'on écrit soi-même ont un effet~~
~~- Trier les résultats par engagement — *ça existe déjà, mais dans un autre module (`searchEnhancer`), pas ici*~~
~~- Afficher le ratio "collé" en haut de la page pendant qu'on lit~~
~~- Pouvoir cacher certains badges un par un, ou choisir combien de chiffres après la virgule~~
~~- Repérer quels fandoms entiers sont en train de devenir tendance, pas seulement fic par fic~~
~~- Calculer les kudos par chapitre au lieu du total~~


## Explicitement écarté

- Une note de qualité unique et globale pour chaque fic (calculée à partir des kudos, des vues, des favoris et des commentaires, avec des grades du type S/A/B/C/D) — jugée trop subjective et présomptueuse
- Des catégories de pépites cachées par type d'auteur/couple — données indisponibles sans requêtes supplémentaires
- Priorisation automatique dans une autre liste (Later Shelf) — couplage entre modules évité
- Classement précis dans le fandom (%) — nécessiterait de crawler tout le fandom
- Score de risque d'abandon — déjà rejeté à l'échelle du projet ("updateLikelihood")


/* ═══════════════════════════════════════════════════════════════════════════
   AO3 Helper — Fic Engagement
   Module ID : ficEngagement
   Tab: Browse

   Submodules (imported directly as ES modules):
     1. engagementMetrics → ./engagementMetrics.js
     2. hiddenGems        → ./hiddenGems.js

   What it does:
     On listing pages, adds engagement metric badges to each work blurb:
       • Kudos ratio   — (kudos / hits) × 100      →  "X.X% ❤️/👁️"
       • Kudos density — (kudos / words) × 1000    →  "X.X /1Kw"
       • Save rate     — (bookmarks / kudos) × 100 →  "X.X% 💾"
       • Comment rate  — (comments / kudos) × 100  →  "X.X% 💬"
     Plus an "ⓘ" help badge explaining all four thresholds on hover.

   Settings:
     colorCodeMetrics  — colour-code badges (green/yellow/red by threshold)
     hideLowEngagement — hide blurbs whose kudos ratio is in the "low" tier
     gemMinRatio / gemMaxKudos / gemMaxBookmarks / gemMinHits — Hidden Gems
       thresholds, now user-configurable (previously fixed)
     gemCompareToPageAverage — also flag gems relative to the current
       page's average ratio (approximates "vs. fandom" without crawling it)


     /* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Engagement Metrics Submodule
    Submodule ID: engagementMetrics
    Parent Module: ficEngagement

    Computes and injects engagement metric badges onto work blurbs and work
    pages:
        • Kudos ratio   — (kudos / hits) × 100      → "X.X% ❤️/👁️"
        • Kudos density — (kudos / words) × 1000    → "X.X /1Kw"
        • Save rate     — (bookmarks / kudos) × 100 → "X.X% 💾"
        • Comment rate  — (comments / kudos) × 100  → "X.X% 💬"

    Thresholds (fixed, summarized in an "ⓘ" help badge):
        Ratio   — high ≥ 20 %  · mid 8–20 %  · low < 8 %
        Density — high ≥ 50    · mid 20–50    · low < 20
        Save    — high ≥ 20 %  · mid 10–20 %  · low < 10 %
        Comment — high ≥ 15 %  · mid 5–15 %   · low < 5 %

    hideLowEngagement (setting) hides the whole blurb when the kudos ratio
    tier is "low", instead of just showing the badge.


AO3 Helper - Hidden Gems Submodule
    Submodule ID: hiddenGems
    Parent Module: ficEngagement

    Identifies "hidden gem" works — low popularity but high engagement ratio —
    and injects a medal badge (💎 diamond / 🥇 gold / 🥈 silver) onto their
    blurbs and work pages, based on how far the ratio clears the base threshold.

    Detection criteria (now user-configurable via gemMinRatio/gemMaxKudos/
    gemMaxBookmarks/gemMinHits — defaults unchanged from the original fixed values):
        • Kudos/hits ratio ≥ 5%
        • Kudos ≤ 100  (low popularity)
        • Bookmarks ≤ 10  (OR kudos ≤ 100)
        • Minimum hits ≥ 50  (enough data)
        • Minimum kudos ≥ 5  (enough data)

    Medal tiers: silver at the base ratio, gold at 2×, diamond at 3×.

    Optional (gemCompareToPageAverage): also flags a work as a gem when its
    ratio is ≥1.5× the average ratio of works currently shown on the page,
    even if it doesn't clear the fixed ratio threshold — an honest
    approximation of "compare to the fandom" (only the current page's works
    are visible to the extension, not a fandom's full catalogue).

    Tooltip: "Under the radar: low kudos but high ratio — X% ratio · N kudos · N hits [· page average: Y%]"



═══════════════════════════════════════════════════════════════════════════    
  # ficEngagement
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Fic Engagement** ajoute des indicateurs permettant d'évaluer rapidement le niveau d'engagement d'une œuvre, indépendamment de sa popularité brute. Plutôt que de se baser uniquement sur le nombre de kudos ou de vues, il calcule plusieurs ratios afin d'aider à repérer les œuvres suscitant un fort engagement de la part des lecteurs.

* Le module permet notamment de :
  - afficher plusieurs métriques d'engagement sous chaque œuvre ;
  - mettre en évidence les œuvres peu connues mais particulièrement appréciées ;
  - colorer les indicateurs selon leur niveau d'engagement.

---

# Réglages utilisateur

| Réglage                    | Description                                                                 |
|----------------------------|------------------------------------------------------------------------------|
| `colorCodeMetrics`         | Colore les badges selon leur niveau d'engagement.                           |
| `hideLowEngagement`        | Cache les fics dont le taux de kudos est dans la tranche "faible".         |
| `gemMinRatio`              | Ratio minimum kudos/vues pour être une pépite cachée.                       |
| `gemMaxKudos`              | Plafond de kudos pour rester "peu populaire".                               |
| `gemMaxBookmarks`          | Plafond de favoris pour rester "peu populaire".                             |
| `gemMinHits`               | Nombre de vues minimum pour avoir assez de données.                         |
| `gemCompareToPageAverage`  | Repère aussi les pépites par rapport à la moyenne de la page affichée.     |

---

# Structure du module

Le module est composé d'un fichier de logique partagée, de deux sous-modules fonctionnels et d'une feuille de style.

```
_ficEngagement.js
ficEngagementHelpers.js
engagementMetrics.js
hiddenGems.js
ficEngagement.css
```

---

# _ficEngagement.js

## Rôle

Fichier coordinateur du module.

Il initialise les sous-modules chargés de calculer les métriques d'engagement et d'identifier les œuvres considérées comme des "Hidden Gems".

---

## Responsabilités

- Initialise les sous-modules du module.
- Applique les métriques d'engagement sur les œuvres affichées.
- Coordonne l'ajout des badges d'information.

---

## Fonctions exposées

Le coordinateur fournit le point d'entrée utilisé pour activer les différents systèmes d'analyse d'engagement.

---

# engagementMetrics.js

## Rôle

Calcule plusieurs indicateurs d'engagement pour chaque œuvre et les affiche sous forme de badges sur les listes de résultats ainsi que sur les pages des œuvres.

Ces métriques permettent d'évaluer rapidement les performances d'une fic au-delà de son nombre total de kudos ou de vues.

---

## Fonctionnalités

### Calcul des métriques

Le module calcule automatiquement trois indicateurs principaux :

| Métrique | Calcul |
|----------|--------|
| **Kudos Ratio** | `(kudos / hits) × 100` |
| **Kudos Density** | `(kudos / mots) × 1000` |
| **Save Rate** | `(favoris / kudos) × 100` |

Ces métriques sont affichées sous forme de badges sous les statistiques de chaque œuvre.

---

### Affichage des badges

Les badges sont ajoutés :

- sur les listes d'œuvres ;
- sur les pages individuelles des fics.

Chaque badge présente directement la valeur calculée.

---

### Informations détaillées

En passant le curseur sur un badge, l'utilisateur peut consulter les valeurs ayant servi au calcul.

Le survol affiche notamment les chiffres bruts utilisés pour produire chaque ratio.

---

### Code couleur

Le module peut colorer automatiquement les badges afin de faciliter leur interprétation.

Lorsque cette option est activée, les niveaux sont représentés par différentes couleurs selon les seuils définis.

---

## Détails techniques

### Seuils d'évaluation

Les seuils sont actuellement fixes et ne peuvent pas être modifiés par l'utilisateur.

#### Kudos Ratio

| Niveau | Valeur |
|---------|---------|
| Élevé | ≥ 20 % |
| Moyen | 8 % à 20 % |
| Faible | < 8 % |

---

#### Kudos Density

| Niveau | Valeur |
|---------|---------|
| Élevé | ≥ 50 |
| Moyen | 20 à 50 |
| Faible | < 20 |

---

#### Save Rate

| Niveau | Valeur |
|---------|---------|
| Élevé | ≥ 20 % |
| Moyen | 10 % à 20 % |
| Faible | < 10 % |

---

### Présentation

Les badges utilisent les représentations suivantes :

- **Kudos Ratio** → `X.X% ❤️/👁️`
- **Kudos Density** → `X.X /1Kw`
- **Save Rate** → `X.X% 💾`

---

## Dépendances

Ce sous-module est initialisé par `_ficEngagement.js`.

Il fournit les métriques utilisées indépendamment du système de détection des œuvres **Hidden Gems**.


# hiddenGems.js

## Rôle

Identifie automatiquement les œuvres peu populaires mais présentant un excellent niveau d'engagement.

Le module ajoute un badge **💎 Hidden Gem** afin de mettre en valeur les œuvres qui risqueraient autrement de passer inaperçues.

---

## Fonctionnalités

### Détection des Hidden Gems

Le module analyse automatiquement les statistiques de chaque œuvre afin de déterminer si elle correspond aux critères d'une "Hidden Gem".

L'objectif est d'identifier des œuvres qui :

- possèdent relativement peu de lecteurs ;
- affichent un excellent taux d'engagement ;
- semblent avoir été fortement appréciées malgré leur faible visibilité.

---

### Badge Hidden Gem

Lorsqu'une œuvre satisfait tous les critères, le module ajoute un badge :

**💎 Hidden Gem**

Le badge apparaît :

- sur les listes d'œuvres ;
- sur la page individuelle de la fic.

---

### Informations détaillées

Le badge possède une infobulle expliquant pourquoi l'œuvre a été sélectionnée.

Elle indique notamment :

- le ratio kudos/vues obtenu ;
- le nombre total de kudos ;
- le nombre total de vues.

Le message suit le principe :

> *Under the radar: low kudos but high ratio.*

---

## Détails techniques

### Critères de détection

Le système repose actuellement sur plusieurs seuils fixes.

Une œuvre est considérée comme une **Hidden Gem** lorsqu'elle respecte simultanément les critères suivants :

| Critère | Valeur |
|----------|---------|
| Ratio Kudos / Hits | ≥ 5 % |
| Nombre de kudos | ≤ 100 |
| Nombre de favoris | ≤ 10 (ou kudos ≤ 100) |
| Nombre minimum de vues | ≥ 50 |
| Nombre minimum de kudos | ≥ 5 |

Ces seuils permettent d'éviter :

- les œuvres trop peu consultées pour être représentatives ;
- les œuvres déjà très populaires.

---

### Fonctionnement

Les critères sont actuellement intégrés directement dans le module.

Ils ne peuvent pas être modifiés par l'utilisateur.

---

## Dépendances

Ce sous-module est initialisé par `_ficEngagement.js`.

Il utilise les statistiques disponibles sur chaque œuvre afin d'effectuer son analyse.

---

# ficEngagement.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Fic Engagement**.

Il définit notamment l'apparence :

- des badges de métriques ;
- des badges **Hidden Gem** ;
- des codes couleur appliqués aux indicateurs ;
- des infobulles associées aux badges.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont documentées ailleurs dans le projet. Statut après revue :

---

## Évaluation des œuvres

### Note personnelle ✅ Fait (déjà couvert ailleurs)

Permettre à l'utilisateur d'attribuer sa propre note à une œuvre.

> Le module `ficAppreciation` propose déjà `starRatings.js` (1 à 5 étoiles,
> note libre optionnelle). Pas de duplication dans ce module.

---

### Nouvelles métriques ✅ Fait

Ajouter de nouveaux indicateurs d'engagement : rapport commentaires/kudos, rapport favoris/kudos plus détaillé, autres ratios complémentaires.

> Nouveau badge de taux de commentaires (`comments / kudos × 100`). Le taux
> de favoris détaillé existait déjà (Save Rate).

---

### Guide d'interprétation ✅ Fait

Ajouter une aide expliquant comment interpréter les différents ratios (excellent/bon/moyen/faible).

> Badge "ⓘ" à côté des métriques, avec les seuils exacts des quatre ratios
> en info-bulle.

---

### Classement dans le fandom ❌ Écarté

Afficher la position approximative d'une œuvre par rapport aux autres œuvres de son fandom, en pourcentage.

> Écarté : nécessiterait de connaître les statistiques de toutes les
> œuvres d'un fandom pour calculer un centile — des dizaines ou centaines
> de requêtes par fandom.

---

## Recherche et filtrage

### Filtre par engagement ✅ Fait

Permettre de filtrer les résultats afin de n'afficher que les œuvres possédant un excellent niveau d'engagement.

> Réglage `hideLowEngagement` : cache les fics dont le taux de kudos est
> dans la tranche "faible".

---

## Hidden Gems

### Catégories ❌ Écarté

Créer plusieurs catégories de Hidden Gems (nouveaux auteurs, classiques oubliés, couples rares).

> Écarté : nécessiterait des données indisponibles sans requêtes
> supplémentaires par auteur (ancienneté, nombre d'œuvres) ou une base de
> fréquence des tags par fandom (couples rares).

---

### Niveaux de rareté ✅ Fait

Attribuer différents niveaux aux Hidden Gems (Diamant/Or/Argent).

> `gemMedal()` : diamant (≥3× le seuil de base), or (≥2×), argent (seuil
> de base).

---

### Détection avancée ✅ Fait (déjà couvert)

Développer une version plus évoluée du système de détection : seuils personnalisables, comparaison avec la moyenne du fandom, analyse plus fine par communauté.

> Couvert par la combinaison des points ci-dessus (niveaux de médaille) et
> ci-dessous (seuils personnalisables, comparaison à la moyenne de la page).

---

### Priorisation ❌ Écarté

Permettre de placer automatiquement les Hidden Gems en tête de certaines listes, comme Marked for Later.

> Écarté : nécessiterait que ce module modifie l'ordre d'affichage d'un
> autre module (Later Shelf) — couplage entre modules évité par le projet
> (voir E7 dans l'audit `shared.md`).

---

## Seuils et comparaison

### Seuils personnalisables ✅ Fait

Permettre de changer soi-même les seuils utilisés pour repérer une pépite cachée.

> Réglages `gemMinRatio` / `gemMaxKudos` / `gemMaxBookmarks` / `gemMinHits`.

---

### Comparaison à la moyenne du fandom ✅ Fait (approximation)

Repérer les pépites cachées en les comparant à la moyenne de leur propre fandom plutôt qu'à des seuils fixes.

> Réglage `gemCompareToPageAverage` : compare à la moyenne des œuvres
> affichées sur la page courante — une vraie moyenne de fandom entier est
> hors de portée (voir "Classement dans le fandom" ci-dessus).

---

## Analyse prédictive

### Risque d'abandon ❌ Écarté

Estimer la probabilité qu'une œuvre en cours soit abandonnée, à partir des habitudes de publication de l'auteur.

> Écarté : concept déjà explicitement rejeté à l'échelle du projet (voir
> "updateLikelihood" dans `docs/never-built-modules.md`) — juger
> publiquement qu'une fic risque d'être abandonnée est injuste envers
> l'auteur·ice.


# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Score global de qualité

Le module ne calcule pas de note unique représentant la qualité d'une œuvre.

L'idée d'attribuer automatiquement des grades tels que :

- S
- A
- B
- C
- D

à partir des kudos, vues, favoris et commentaires a été volontairement abandonnée.

Une telle évaluation a été jugée :

- trop subjective ;
- trop présomptueuse ;
- insuffisamment représentative de la qualité réelle d'une œuvre.

Le module préfère fournir plusieurs indicateurs indépendants afin que chacun puisse tirer ses propres conclusions.

---

# Résumé des responsabilités du module

Le module **Fic Engagement** est responsable de toutes les fonctionnalités liées à l'analyse de l'engagement des œuvres sur AO3.

Ses responsabilités sont réparties entre les sous-modules suivants :

| Sous-module | Responsabilité principale |
|-------------|---------------------------|
| `_ficEngagement.js` | Initialise le module et coordonne les systèmes d'analyse d'engagement. |
| `engagementMetrics.js` | Calcule et affiche les différents ratios d'engagement sous forme de badges. |
| `hiddenGems.js` | Détecte les œuvres peu populaires présentant un excellent niveau d'engagement. |
| `ficEngagement.css` | Styles visuels utilisés par l'ensemble du module. |

---

# Interactions entre les sous-modules

Le coordinateur `_ficEngagement.js` initialise les deux sous-modules et applique les indicateurs d'engagement aux œuvres affichées.

Les responsabilités sont volontairement séparées :

- **`engagementMetrics.js`** calcule et affiche plusieurs ratios objectifs décrivant le comportement des lecteurs.
- **`hiddenGems.js`** exploite certaines de ces statistiques afin d'identifier les œuvres présentant un fort engagement malgré une faible popularité.

Les deux sous-modules fonctionnent indépendamment mais se complètent afin d'offrir une vision plus pertinente qu'un simple affichage des statistiques brutes.

---

# Dépendances externes

Le module ne dépend d'aucun service externe.

Il s'appuie uniquement sur les informations déjà affichées par AO3.

## Données utilisées

Les calculs reposent notamment sur :

- le nombre de kudos ;
- le nombre de vues (hits) ;
- le nombre de mots ;
- le nombre de favoris (bookmarks).

Toutes les métriques sont calculées localement à partir des données disponibles sur la page.

---

# Limites connues

Le module applique toujours plusieurs simplifications volontaires.

Notamment :

- les seuils des badges d'engagement (kudos ratio, densité, save rate, comment rate) restent fixes ; seuls les seuils des **Hidden Gems** sont désormais personnalisables ;
- la comparaison "au fandom" reste une approximation limitée à la page affichée, pas au fandom entier ;
- aucune analyse historique ou prédictive n'est réalisée ;
- les ratios décrivent uniquement les statistiques disponibles au moment de l'affichage.

Le module fournit des indicateurs d'aide à la décision mais ne cherche jamais à attribuer une note globale de qualité aux œuvres.

