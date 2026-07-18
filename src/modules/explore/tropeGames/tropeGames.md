# tropeGames

**Tab:** Explore

## À quoi ça sert

Ce module regroupe cinq petits jeux ludiques autour des tropes de
fanfiction (les grands classiques d'intrigue comme "Enemies to Lovers" ou
"Slow Burn"), basés sur une liste partagée d'une cinquantaine de tropes
courants.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showDailyTrope` | activé | Affiche la bannière du trope du jour sur la page d'accueil |
| `achievementsEnabled` | activé | Active les succès de lecture |
| `enableBingo` | activé | Active la carte de Trope Bingo |
| `enableRoulette` | activé | Active la Trope Roulette |
| `enableStats` | activé | Active les statistiques de tropes lus |
| `enableMoodQuiz` | activé | Active le mini-quiz d'humeur |
| `seasonalTheme` | désactivé | Reteinte saisonnière de l'horoscope (hiver/printemps/été/automne/Halloween) |
| `bingoSize` | `25` | Taille de la carte de bingo : `9` (3×3, facile) ou `25` (5×5, classique) |
| `bingoCategory` | (toutes) | Catégorie de tropes privilégiée pour les nouvelles cartes |
| `bingoExclude` | (vide) | Tropes à ne jamais mettre sur une nouvelle carte (séparés par des virgules) |
| `rouletteCount` | `3` | Nombre de tropes tirés par la roulette (2 à 5) |

⚠️ **Précision (chantier 4, 2026-07-18) :** avant ce passage, ces réglages
n'avaient *aucun effet* : le panneau de réglages enregistre sous la clé du
module parent (`ao3h:mod:tropeGames:settings`), mais chaque sous-module lisait
sa propre clé (`ao3h:mod:tropeHoroscope:settings`, etc.) — une clé que le
panneau n'écrivait jamais. Le coordinateur expose maintenant un `cfg()`
partagé (comme `textToSpeech`/`readingFormatter`) et tous les sous-modules
l'utilisent ; les réglages fonctionnent désormais réellement.

## Fichiers

### 1. `_tropeGames.js` — le chef d'orchestre

- Partage la liste des tropes, les réglages communs (`cfg`) et les outils de stockage avec les six autres fichiers
- Construit le menu flottant consolidé "🃏" (bouton unique regroupant tous les mini-jeux, ajouté au passage chantier 4)
- Applique le thème saisonnier (`seasonalTheme`) sur `<html>`

### 2. `tropeHoroscope.js` — horoscope du trope du jour

- Sur la page d'accueil, affiche une bannière annonçant un trope "du jour", choisi selon la date pour être le même pour tout le monde
- Affiché une fois par jour, avec la possibilité de le fermer
- Réaffichage manuel possible depuis le menu flottant ("🔮 Horoscope"), et indique si la prédiction d'hier s'est réalisée (ajouté au passage chantier 4)

### 3. `tropeBingoPatterns.js` — carte de bingo

- Génère une carte de bingo de taille configurable (3×3 ou 5×5) avec des tropes au hasard (filtrés par catégorie/exclusions si réglés) et une case "gratuite" au centre
- Sur les pages de fic, coche automatiquement les cases dont le trope correspond aux tags de la fic lue
- Repère les lignes, colonnes, diagonales et autres motifs complétés — calculés génériquement pour n'importe quelle taille de grille impaire
- Affiche le pourcentage de progression, et signale par un toast tout nouveau motif complété en arrière-plan (ajoutés au passage chantier 4)

### 4. `tropeRoulette.js` — roulette de tropes

- Un bouton "🎲 Roulette" ouvre une fenêtre avec un nombre configurable de tropes tirés au hasard (2 à 5), sans doublon
- Propose un lien de recherche AO3 qui combine ces tropes
- Un bouton "🎲 Surprise Pick" ouvre cette recherche et déclenche automatiquement un tirage aléatoire du module Surprise Me (ajouté au passage chantier 4)
- Permet de retirer d'autres tropes autant de fois qu'on veut

### 5. `tropeStatistics.js` — statistiques de lecture

- Enregistre les tropes rencontrés en lisant des fics (et, depuis le passage chantier 4, les mémorise par date pour les fonctionnalités ci-dessous)
- Calcule une série de jours consécutifs de lecture
- Affiche le top 10 des tropes les plus lus, avec un export possible en JSON ou CSV
- Affiche un défi hebdomadaire (tropes distincts lus dans les 7 derniers jours), une tendance mensuelle (mois en cours vs précédent), une répartition par catégorie, et la liste des tropes encore jamais rencontrés (ajoutés au passage chantier 4)

### 6. `tropeAchievements.js` — succès de lecture

- Vérifie régulièrement une liste de 9 succès à débloquer (par exemple "First Steps", "Bingo!"), chacun avec un palier de médaille (bronze/argent/or/platine)
- Affiche un petit message qui se ferme tout seul à chaque nouveau succès débloqué
- Un bouton "🏅 Achievements" montre la progression vers tous les succès, avec un historique chronologique des déblocages (ajouté au passage chantier 4)

### 7. `tropeMoodQuiz.js` — quiz d'humeur (ajouté au passage chantier 4)

- Une question, quatre humeurs possibles, recommande un trope adapté avec un lien de recherche AO3

### 8. `tropeGamesHelpers.js` — calculs purs (ajouté au passage chantier 4)

- Catégories de tropes, défi hebdomadaire, tendance mensuelle, tropes non explorés, motifs de bingo génériques (n'importe quelle taille impaire), pourcentage de progression, thème saisonnier, mapping humeur→trope, icônes de médaille, vérification rétrospective de l'horoscope

### 9. `tropeGames.css`

- Les styles visuels de la bannière, de la carte de bingo, de la roulette, du menu flottant consolidé, des modals horoscope/mood-quiz, du thème saisonnier, et des panneaux de statistiques/succès

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs. État après le passage
chantier 4 (2026-07-18) :

- ~~Des défis de tropes à réaliser (par exemple "lire un trope différent chaque jour du mois")~~ ✅ Fait — un "Weekly Challenge" dans le panneau Stats : nombre de tropes distincts lus dans les 7 derniers jours, objectif fixe de 5 (`computeWeeklyChallenge` dans `tropeGamesHelpers.js`)
- ~~Voir comment tes tropes préférés ont changé avec le temps~~ ✅ Fait — section "Trend" du panneau Stats : top 3 du mois en cours vs top 3 du mois précédent, avec un repère 📈 sur les tropes montants (`monthlyTrend`)
- ~~Un mode "chasseur de tropes rares" pour dénicher des tropes peu utilisés~~ ✅ Fait — section "tropes non explorés" du panneau Stats : liste des tropes suivis jamais rencontrés dans tes lectures (`unexploredTropes`). "Rare" est ici personnel (jamais lu par toi), AO3 n'exposant aucune statistique d'usage global par trope à comparer
- ~~Des cartes de bingo personnalisées avec différents niveaux de difficulté~~ ✅ Fait — réglages `bingoSize` (3×3 facile / 5×5 classique), `bingoCategory` et `bingoExclude` ; les motifs (lignes/colonnes/diagonales/X/cadre/coins/blackout) sont désormais calculés génériquement pour n'importe quelle taille impaire (`buildBingoPatterns`)
- ~~Des thèmes saisonniers (bingo ou horoscope spécial pour une saison ou une fête)~~ ✅ Fait — réglage `seasonalTheme` : reteinte de l'horoscope et de ses modals selon le mois (hiver/printemps/été/automne/Halloween en octobre)
- ~~Repérer automatiquement quand une carte de bingo est complétée, sans avoir à ouvrir la carte~~ ✅ Fait — un toast apparaît dès qu'un nouveau motif se complète pendant la détection automatique en arrière-plan, carte fermée ou non
- ~~Suivre si les prédictions de l'horoscope du jour se réalisent vraiment~~ ✅ Fait — la bannière (et le réaffichage manuel) indiquent si le trope prédit hier a effectivement été lu (`horoscopeCameTrue`, croisé avec l'historique de `tropeStatistics`)
- ~~Un mini-quiz pour trouver le trope qui correspond à ton humeur du moment~~ ✅ Fait — nouveau sous-module `tropeMoodQuiz.js` : une question, quatre humeurs, un trope recommandé avec lien de recherche AO3
- ~~Un "trope chanceux du mois" avec son propre suivi de série~~ ❌ Écarté — aurait fait doublon avec l'horoscope quotidien et la tendance mensuelle déjà livrés dans ce même passage : un troisième concept de "trope mis en avant" affaibli la lisibilité plutôt que d'ajouter de la valeur
- ~~Un menu flottant unique qui regroupe tous les mini-jeux au même endroit~~ ✅ Fait — un seul bouton "🃏" ouvre une colonne regroupant Bingo/Roulette/Stats/Achievements/Mood Quiz/Horoscope ; chaque sous-module s'y enregistre via `W.AO3H_TropeGames.registerMenuItem()` au lieu de flotter indépendamment
- ~~Relier la roulette de tropes au module de fic au hasard~~ ✅ Fait — bouton "🎲 Surprise Pick" dans la modal roulette : ouvre la recherche AO3 combinée et signale à `surpriseMe` (via `sessionStorage`, drapeau consommé une fois) de tirer automatiquement un résultat au chargement de la page
- ~~Relier les statistiques de tropes au module de fics similaires~~ ❌ Écarté — `similarFics` n'expose aucune API publique (contrairement à `surpriseMe`) ; une vraie intégration demanderait de récupérer et analyser une autre page côté client, hors de portée pour ce module (même constat déjà fait pour `fanficBingeMode` et `hiddenGems`)
- ~~Regrouper les tropes lus par catégories (romance, réconfort, univers alternatif, fantastique...)~~ ✅ Fait — table `TROPE_CATEGORIES` (huit catégories) dans `tropeGamesHelpers.js`, utilisée à la fois pour la section "By category" des Stats et pour filtrer les cartes de bingo personnalisées
- ~~Des graphiques ou une vue de l'évolution dans le temps de tes habitudes de lecture, pas juste une liste~~ ✅ Fait (fusionné avec la tendance mensuelle ci-dessus) — reprend les barres déjà utilisées pour le top 10, pas de bibliothèque de graphiques, cohérent avec le choix déjà fait par `readingDashboard` de rester simple
- ~~Pouvoir forcer l'affichage de l'horoscope du jour manuellement, même si on l'a déjà fermé aujourd'hui~~ ✅ Fait — bouton "🔮 Horoscope" dans le menu flottant, ouvre une modal avec le trope du jour et la rétrospective d'hier, indépendamment de l'état "fermé aujourd'hui" de la bannière automatique
- ~~Pouvoir partager sa carte de bingo avec d'autres personnes (un mode à plusieurs joueurs)~~ ❌ Écarté — contredit directement la décision de conception déjà prise "Jeux individuels" (pas de classement, pas de serveur, pour éviter toute pression compétitive)
- ~~Afficher un pourcentage de progression sur la carte de bingo, en plus des motifs déjà repérés~~ ✅ Fait — `bingoProgressPercent()`, affiché sous la grille
- ~~Choisir combien de tropes la roulette tire d'un coup, pas seulement 3~~ ✅ Fait — réglage `rouletteCount` (2 à 5)
- ~~Avoir des niveaux de médailles (bronze, argent, or, platine) pour les succès, selon leur difficulté~~ ✅ Fait — chaque succès a désormais un palier (`tier`), affiché dans le toast de déblocage et dans le panneau
- ~~Garder un historique des succès débloqués avec la date de chaque déblocage~~ ✅ Fait — bouton "Show unlock history" dans le panneau Achievements, liste triée du plus récent au plus ancien (la date était déjà enregistrée mais jamais affichée)

## Explicitement écarté

- Un vrai système de badges plus large que les tropes (par exemple pour ta toute première fic lue, tes 100 fics lues, l'exploration de nouveaux fandoms...) avec un profil de succès dédié — jugé trop ambitieux et hors du sujet principal de l'extension
- Un mode compétition avec classement entre plusieurs joueurs — les jeux restent solo, pour éviter toute pression
- Un horoscope de trope basé sur la date d'anniversaire — jugé sans intérêt après la toute première fois

## Précision

⚠️ Une doc historique mentionnait une fonctionnalité "TropeDare" présente
dans le code mais jamais vraiment activée. Vérifié : elle n'existe plus du
tout dans le code actuel.



AO3 Helper - Trope Games Module Coordinator
    Module ID: tropeGames
    Display Name: Trope Games
    Tab: Explore

    Submodules (parent/child registration pattern):
        tropeGames/tropeHoroscope     -- daily trope banner on homepage
        tropeGames/tropeBingoPatterns -- N×N card auto-checked from work tags
        tropeGames/tropeRoulette      -- random trope combo modal
        tropeGames/tropeStatistics    -- per-trope read counts, top-10
        tropeGames/tropeAchievements  -- badge unlocks for reading habits
        tropeGames/tropeMoodQuiz      -- mood -> trope quiz (chantier 4)

    Coordinator role:
        - Provides shared TROPE_LIST, cfg(), storage helpers on W.AO3H_TropeGames
        - Injects shared CSS once
        - Builds the consolidated floating menu (registerMenuItem — chantier 4)
        - Applies the seasonal theme attribute on <html> (chantier 4)
        - Defers all page-level work to submodules

    ⚠️ Chantier 4 fix: `cfg` used to not exist here — every submodule read its
    own `ao3h:mod:<childId>:settings` via `loadModuleSettings(MOD)`, a key the
    settings panel (moduleId: 'tropeGames') never wrote to, so none of this
    module's checkboxes had any effect. All settings now live in this
    coordinator's DEFAULTS and submodules read them via `cfg()`.

    Storage keys:
        ao3h:tg:horoscope:{YYYY-MM-DD}  -- today's trope key
        ao3h:tg:bingo                   -- { card, checked, completed, size }
        ao3h:tg:stats                   -- { [tropeKey]: count }
        ao3h:tg:stats:seen              -- [{ id, date, tropes }, ...] (dedup,
                                           max 1000; `tropes` added chantier 4,
                                           backs the weekly challenge, monthly
                                           trend, and horoscope retrospective)
        ao3h:tg:achievements            -- [{ id, unlockedAt }]
        ao3h:tg:autoSurprise (sessionStorage) -- one-shot flag read by
                                           surpriseMe.js (chantier 4)



        AO3 Helper - Trope Achievements Submodule
    Submodule ID: tropeAchievements
    Display Name: Trope Achievements
    Source Module: Trope Games

    - Feature: Achievement checking
      - Option: Validate stats against conditions
      - Option: Detect new unlocks

    - Feature: Unlock notifications (toast, auto-dismiss 5s, click to dismiss)

    - Feature: Achievement history
      - Option: Store all unlocked badge IDs
      - Option: Prevent duplicate unlocks
      - Option: LocalStorage persistence

    - Feature (chantier 4): Medal tiers — each achievement has a bronze/
      silver/gold/platinum tier, shown in the toast and the panel
    - Feature (chantier 4): Unlock history — "Show unlock history" toggle,
      newest-first list with dates (the date was already stored, just never
      surfaced)


      AO3 Helper - Trope Bingo Patterns Submodule
    Submodule ID: tropeBingoPatterns
    Display Name: Trope Bingo Patterns
    Source Module: Trope Games

    - Feature: Card generation
      - Option: Configurable size — 3×3 or 5×5 (chantier 4, was fixed at 5×5)
      - Option: Category-preferring, exclusion-aware selection (chantier 4)
      - Option: Shuffle algorithm
      - Option: One-time generation per card
      - Option: Store in localStorage

    - Feature: Auto-tracking on read
      - Option: Detect work page tags
      - Option: Match tags against card tropes
      - Option: Auto-mark checked
      - Option (chantier 4): toast when a new pattern completes, even with
        the card closed

    - Feature: Pattern detection (rows, columns, diagonals, X, frame,
      corners, blackout) — generic for any odd N×N size (chantier 4;
      `buildBingoPatterns()`)

    - Feature (chantier 4): Progress percentage (checked cells / total,
      excluding FREE), shown under the grid

    - Feature: Persistent state
      - Option: Save current card
      - Option: Save checked cells array
      - Option: Save completed patterns


      AO3 Helper - Trope Horoscope Submodule
    Submodule ID: tropeHoroscope
    Display Name: Trope Horoscope
    Source Module: Trope Games

    - Feature: Daily trope assignment
      - Option: Consistent trope per day
      - Option: Date-based seed algorithm
      - Option: Selects from full tropes database

    - Feature: Homepage banner display
      - Option: Auto-show on homepage (/)
      - Option: Purple gradient styling (#667eea to #764ba2)
      - Option (chantier 4): seasonal gradient when `seasonalTheme` is on

    - Feature: Once-per-day visibility
      - Option: Tracks last seen date
      - Option: Shows only if not seen today
      - Option: LocalStorage persistence

    - Feature: Dismissal
      - Option: Click banner to dismiss
      - Option: Marks as seen for today

    - Feature (chantier 4): Manual redisplay — "🔮 Horoscope" menu item opens
      today's trope in a modal regardless of dismissal state
    - Feature (chantier 4): Retrospective — checks whether yesterday's
      predicted trope was actually read (cross-referenced with
      tropeStatistics' seen history)



AO3 Helper - Trope Roulette Submodule
    Submodule ID: tropeRoulette
    Display Name: Trope Roulette
    Source Module: Trope Games

    - Feature: Random combo generation
      - Option: Configurable trope count, 2-5 (chantier 4, was fixed at 3)
      - Option: No duplicates in combo

    - Feature: AO3 search integration
      - Option: Build combined tag search URL
      - Option (chantier 4): "🎲 Surprise Pick" — opens the search and asks
        surpriseMe to auto-draw a result (sessionStorage handoff, no
        persisted cross-module API)

    - Feature: Modal dialog UI with spin again / search / close actions


AO3 Helper - Trope Mood Quiz Submodule (chantier 4)
    Submodule ID: tropeMoodQuiz
    Display Name: Trope Mood Quiz
    Source Module: Trope Games

    - Feature: One-question mood quiz (emotional / fun / romantic /
      adventurous), each mapped to a handful of matching tropes
    - Feature: AO3 search link for the recommended trope, "Try Again" to reroll



    AO3 Helper - Trope Statistics Submodule
    Submodule ID: tropeStatistics
    Display Name: Trope Statistics
    Source Module: Trope Games

    - Feature: Automatic tracking
      - Option: Track on work pages
      - Option: Store work ID + tropes

    - Feature: Reading history storage
      - Option: Last 1000 works
      - Option: LocalStorage persistence

    - Feature: Per-trope counts, reading streak calculation, top tropes
      ranking, CSV/JSON export.

    - Feature (chantier 4): Weekly Challenge — distinct tropes read in the
      trailing 7 days vs a fixed target of 5
    - Feature (chantier 4): Monthly trend — top 3 tropes this month vs last
      month, rising tropes marked 📈
    - Feature (chantier 4): Unexplored tropes — tracked tropes never
      encountered yet
    - Feature (chantier 4): Category breakdown — counts grouped by
      TROPE_CATEGORIES
    - Each seen-history entry now also stores which tropes matched that work
      (`tropes: string[]`), which is what the four features above read.


═══════════════════════════════════════════════════════════════════════════
  # tropeGames
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Trope Games** regroupe plusieurs mini-jeux autour des tropes de fanfiction.

* Un trope est un grand motif narratif récurrent, par exemple :
  - Enemies to Lovers ;
  - Slow Burn ;
  - Hurt/Comfort ;
  - Found Family ;
  - Alternate Universe.

Le module utilise une liste partagée d’environ cinquante tropes courants.

* Il comprend cinq fonctionnalités principales :
  - un trope du jour ;
  - une carte de bingo ;
  - une roulette de tropes ;
  - des statistiques de lecture ;
  - des succès à débloquer.

Ces fonctionnalités permettent de rendre l’exploration et le suivi des tropes plus ludiques.

---

# Réglages utilisateur

| Réglage               | Ce que ça fait                                                 |
| ----------------------|----------------------------------------------------------------|
| `showDailyTrope`      | Affiche la bannière du trope du jour sur la page d’accueil.    |
| `achievementsEnabled` | Active le système de succès de lecture.                        |
| `enableBingo`         | Active la carte de Trope Bingo.                                |
| `enableRoulette`      | Active la Trope Roulette.                                      |
| `enableStats`         | Active le suivi et l’affichage des statistiques de tropes lus. |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de six sous-modules fonctionnels, d'un fichier de calculs purs et d’une feuille de style (`tropeMoodQuiz.js` et `tropeGamesHelpers.js` ajoutés au passage chantier 4).

```text
_tropeGames.js
tropeHoroscope.js
tropeBingoPatterns.js
tropeRoulette.js
tropeStatistics.js
tropeAchievements.js
tropeMoodQuiz.js
tropeGamesHelpers.js
tropeGames.css
```

---

# _tropeGames.js

## Rôle

Fichier coordinateur du module.

Il fournit la liste commune des tropes, partage les fonctions de stockage et initialise les cinq sous-modules.

Le coordinateur ne gère pas directement les éléments visibles sur les pages. Il délègue chaque fonctionnalité au sous-module correspondant.

---

## Responsabilités

* Enregistre le module sous l’identifiant `tropeGames`.
* Fournit une liste commune de tropes.
* Expose des outils partagés de lecture et d’écriture dans le stockage local.
* Initialise les cinq sous-modules.
* Injecte une seule fois les styles communs.
* Sert de point d’entrée unique pour le reste d’AO3 Helper.
* Délègue toutes les opérations liées aux pages aux sous-modules.

---

## Fonctions exposées

Le coordinateur expose des outils partagés sous :

`window.AO3H_TropeGames`

Cette API contient notamment :

* la liste commune des tropes ;
* les fonctions de lecture du stockage ;
* les fonctions d’écriture du stockage ;
* les outils partagés nécessaires aux mini-jeux.

---

## Détails techniques

### Sous-modules enregistrés

Les sous-modules utilisent les identifiants suivants :

```text
tropeGames/tropeHoroscope
tropeGames/tropeBingoPatterns
tropeGames/tropeRoulette
tropeGames/tropeStatistics
tropeGames/tropeAchievements
```

---

### Clés de stockage

Le module utilise principalement les clés suivantes :

```text
ao3h:tg:horoscope:{YYYY-MM-DD}
ao3h:tg:bingo
ao3h:tg:stats
ao3h:tg:stats:seen
ao3h:tg:achievements
```

Leur contenu est réparti ainsi :

* `ao3h:tg:horoscope:{YYYY-MM-DD}` : trope associé à la date du jour ;
* `ao3h:tg:bingo` : carte actuelle, cases cochées et motifs complétés ;
* `ao3h:tg:stats` : compteur de lectures pour chaque trope ;
* `ao3h:tg:stats:seen` : identifiants des œuvres déjà comptabilisées ;
* `ao3h:tg:achievements` : liste des succès débloqués et de leur date.

---

# tropeHoroscope.js

## Rôle

Gère le trope du jour affiché sur la page d’accueil d’AO3.

Il choisit un trope à partir de la date actuelle afin que la sélection soit stable pendant toute la journée.

---

## Fonctionnalités

### Trope du jour

Le module choisit un trope quotidien dans la liste commune.

Le même trope est utilisé pendant toute la journée.

La sélection est basée sur la date, ce qui permet d’obtenir un résultat cohérent plutôt qu’un nouveau trope à chaque rechargement.

---

### Sélection fondée sur la date

Le module utilise un algorithme de sélection déterministe basé sur la date.

Cela signifie que :

* le trope reste le même pendant la journée ;
* le trope change lorsque la date change ;
* la sélection provient de l’ensemble de la base de tropes.

---

### Bannière sur la page d’accueil

Lorsque `showDailyTrope` est activé, le module affiche automatiquement une bannière sur la page d’accueil :

`/`

La bannière annonce le trope du jour.

---

### Affichage quotidien

La bannière est affichée une seule fois par jour.

Le module vérifie si l’utilisateur l’a déjà vue ou fermée pendant la journée en cours.

---

### Fermeture de la bannière

L’utilisateur peut fermer la bannière.

Cette action :

* masque la bannière ;
* marque le trope comme vu pour la journée ;
* empêche son nouvel affichage automatique avant le lendemain.

---

## Détails techniques

### Clé de stockage

La sélection quotidienne utilise une clé semblable à :

```text
ao3h:tg:horoscope:2026-07-16
```

La date est intégrée directement à la clé.

---

### Apparence

La bannière utilise notamment un dégradé violet allant de :

* `#667eea`
* à `#764ba2`

---

### Limite actuelle

Une fois la bannière fermée pour la journée, aucune commande ne permet actuellement de l’afficher de nouveau manuellement.

---

## Dépendances

Ce sous-module est initialisé par `_tropeGames.js`.

Il utilise la liste commune des tropes et les outils de stockage exposés par le coordinateur.

---

# tropeBingoPatterns.js

## Rôle

Gère une carte de bingo composée de tropes de fanfiction.

Le module génère la carte, coche automatiquement les tropes rencontrés dans les œuvres et repère les motifs complétés.

---

## Fonctionnalités

### Génération de la carte

Le module crée une carte de bingo de **5 × 5 cases**.

Elle comprend :

* 24 tropes choisis au hasard ;
* une case gratuite placée au centre.

---

### Sélection aléatoire

Les tropes sont mélangés avant d’être placés sur la carte.

Chaque nouvelle carte utilise une sélection aléatoire issue de la liste commune.

---

### Carte persistante

Une carte n’est générée qu’une seule fois jusqu’à ce qu’elle soit remplacée.

Son état est conservé dans `localStorage`.

Cela permet de retrouver la même carte après :

* un rechargement ;
* la fermeture de l’onglet ;
* la fermeture du navigateur.

---

### Détection des tropes lus

Sur la page d’une œuvre, le module examine les tags présents.

Il compare les tags de l’œuvre avec ceux inscrits sur la carte.

---

### Cochage automatique

Lorsqu’un trope de la carte est détecté dans les tags de l’œuvre :

* la case correspondante est cochée ;
* son état est enregistré ;
* la carte est mise à jour.

---

### Motifs détectés

Le module peut reconnaître plusieurs motifs complétés, notamment :

* les lignes ;
* les colonnes ;
* les diagonales ;
* un X ;
* le cadre extérieur ;
* les quatre coins ;
* la carte complète, ou blackout.

---

### État persistant

Le module conserve :

* la disposition de la carte ;
* la liste des cases cochées ;
* les motifs déjà complétés.

---

## Détails techniques

### Clé de stockage

La carte est enregistrée sous :

`ao3h:tg:bingo`

Sa structure générale contient :

```js
{
  card: [],
  checked: [],
  completed: []
}
```

---

### Génération

Le module utilise un algorithme de mélange afin de choisir et d’organiser les tropes.

---

### Analyse

Le cochage repose sur la comparaison entre :

* les tags visibles sur la page de l’œuvre ;
* les tropes présents sur la carte.

---

### Limite actuelle

La détection de nouveaux motifs est principalement effectuée lorsque la carte ou les données correspondantes sont actualisées.

Le module ne signale pas nécessairement immédiatement qu’une carte complète a été terminée sans ouvrir ou actualiser son interface.

---

## Dépendances

Ce sous-module est initialisé par `_tropeGames.js`.

Il utilise la liste commune des tropes et les outils de stockage partagés.

---

# tropeRoulette.js

## Rôle

Gère une roulette qui tire plusieurs tropes au hasard et construit une recherche AO3 à partir de leur combinaison.

---

## Fonctionnalités

### Bouton Roulette

Le module ajoute un bouton :

**🎲 Roulette**

Ce bouton ouvre une fenêtre modale consacrée au tirage.

---

### Tirage de trois tropes

Le module sélectionne **trois tropes** au hasard.

Un même trope ne peut pas apparaître deux fois dans le même tirage.

---

### Nouvelle combinaison

L’utilisateur peut relancer la roulette autant de fois qu’il le souhaite.

Chaque nouveau tirage remplace la combinaison précédente.

---

### Recherche AO3

Le module construit automatiquement une URL de recherche AO3 combinant les trois tropes obtenus.

L’utilisateur peut ensuite lancer directement cette recherche.

---

### Fenêtre modale

La fenêtre contient notamment :

* les trois tropes sélectionnés ;
* une action pour relancer le tirage ;
* une action pour rechercher la combinaison sur AO3 ;
* une action pour fermer la fenêtre.

---

## Détails techniques

### Tirage sans doublon

Le module vérifie qu’aucun trope n’est répété dans la même combinaison.

---

### Actions disponibles

La fenêtre propose des actions semblables à :

* Spin Again ;
* Search ;
* Close.

---

### Limite actuelle

Le nombre de tropes est fixé à trois.

L’utilisateur ne peut pas encore choisir une autre quantité.

---

## Dépendances

Ce sous-module est initialisé par `_tropeGames.js`.

Il utilise la liste commune de tropes fournie par le coordinateur.

---

# tropeStatistics.js

## Rôle

Enregistre les tropes rencontrés dans les œuvres lues et produit des statistiques personnelles.

Il suit également les œuvres déjà comptabilisées afin d’éviter d’ajouter plusieurs fois les mêmes données.

---

## Fonctionnalités

### Suivi automatique

Sur la page d’une œuvre, le module examine les tags et repère les tropes connus.

Les tropes détectés sont ajoutés aux statistiques personnelles.

---

### Comptage par trope

Chaque trope possède son propre compteur.

Lorsqu’une nouvelle œuvre contenant ce trope est prise en compte, le compteur correspondant augmente.

---

### Déduplication des œuvres

Le module enregistre l’identifiant de chaque œuvre déjà comptabilisée.

Une même œuvre n’est donc pas ajoutée plusieurs fois aux statistiques.

---

### Limite de l’historique

Le module conserve les identifiants des **1 000 dernières œuvres** comptabilisées.

Cette limite empêche la liste de déduplication de grossir indéfiniment.

---

### Série de lecture

Le module calcule une série de jours consécutifs pendant lesquels des œuvres contenant des tropes ont été lues.

---

### Top des tropes

Le module peut afficher les **10 tropes les plus lus**.

Le classement est établi selon leur nombre d’occurrences.

---

### Export des statistiques

Les statistiques peuvent être exportées dans les formats suivants :

* JSON ;
* CSV.

---

## Détails techniques

### Clés de stockage

Les compteurs sont enregistrés sous :

`ao3h:tg:stats`

La liste des œuvres déjà comptabilisées est enregistrée sous :

`ao3h:tg:stats:seen`

---

### Structure des compteurs

La structure générale est :

```js
{
  [tropeKey]: 0
}
```

---

### Données suivies

Le module peut conserver :

* le nombre de lectures par trope ;
* les identifiants des œuvres déjà vues ;
* les informations nécessaires au calcul de la série de lecture.

---

## Dépendances

Ce sous-module est initialisé par `_tropeGames.js`.

Il utilise la liste commune des tropes et les fonctions de stockage partagées.

Ses statistiques peuvent également être utilisées par `tropeAchievements.js`.

---

# tropeAchievements.js

## Rôle

Gère les succès liés aux habitudes de lecture et à l’utilisation des mini-jeux.

Le module vérifie régulièrement si les conditions d’un succès ont été atteintes.

---

## Fonctionnalités

### Liste des succès

Le module utilise une liste de **9 succès**.

Ils peuvent notamment inclure des succès comme :

* **First Steps** ;
* **Bingo!** ;
* d’autres objectifs liés aux tropes ou aux habitudes de lecture.

---

### Vérification des conditions

Le module compare les statistiques actuelles aux conditions de chaque succès.

Il peut notamment vérifier :

* le nombre de tropes rencontrés ;
* les motifs de bingo complétés ;
* les objectifs de lecture atteints.

---

### Détection des nouveaux succès

Lorsqu’une condition est remplie, le succès correspondant est débloqué.

Le module vérifie qu’il ne l’a pas déjà été afin d’éviter les duplications.

---

### Notification

Chaque nouveau succès déclenche une petite notification.

La notification :

* apparaît sous forme de toast ;
* se ferme automatiquement après **5 secondes** ;
* peut également être fermée manuellement par un clic.

---

### Bouton Achievements

Un bouton :

**🏅 Achievements**

permet d’ouvrir un panneau récapitulatif.

Ce panneau peut afficher :

* les succès déjà débloqués ;
* les succès encore verrouillés ;
* la progression vers les différents objectifs.

---

### Persistance

Les succès débloqués sont conservés dans `localStorage`.

Ils restent donc disponibles entre les sessions.

---

## Détails techniques

### Clé de stockage

Les succès sont enregistrés sous :

`ao3h:tg:achievements`

La structure générale est :

```js
[
  {
    id: "",
    unlockedAt: 0
  }
]
```

---

### Données conservées

Chaque entrée contient :

* l’identifiant du succès ;
* la date de déblocage.

---

### Prévention des doublons

Avant de débloquer un succès, le module vérifie si son identifiant existe déjà dans l’historique.

---

## Dépendances

Ce sous-module est initialisé par `_tropeGames.js`.

Il utilise principalement les données produites par :

* `tropeStatistics.js` ;
* `tropeBingoPatterns.js`.

---

# tropeGames.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Trope Games**.

Il définit notamment l’apparence :

* de la bannière du trope du jour ;
* de la carte de bingo ;
* des cases cochées ;
* des motifs complétés ;
* du bouton de roulette ;
* de la fenêtre modale ;
* des panneaux de statistiques ;
* du classement des tropes ;
* des notifications de succès ;
* du panneau **Achievements** ;
* des différents états interactifs.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents, mais ne disposent pas encore d’une implémentation complète.

---

## Défis de tropes

> ✅ Fait — «Weekly Challenge» dans le panneau Stats : tropes distincts
> lus dans les 7 derniers jours, objectif fixe de 5.

Créer des défis à réaliser sur une période donnée.

Exemple :

* lire un trope différent chaque jour pendant un mois.

---

## Évolution des préférences

> ✅ Fait — section «Trend» du panneau Stats : top 3 du mois en cours
> vs top 3 du mois précédent, tropes montants marqués 📈.

Afficher comment les tropes les plus lus ou préférés ont évolué avec le temps.

---

## Chasseur de tropes rares

> ✅ Fait — liste des tropes suivis jamais rencontrés dans le panneau Stats.
> «Rare» reste personnel : AO3 n'expose aucune statistique d'usage global
> par trope à comparer.

Ajouter un mode permettant de chercher et de suivre des tropes peu utilisés.

---

## Cartes de bingo personnalisées

> ✅ Fait (taille, catégorie, exclusions) — réglages `bingoSize` (3×3/5×5),
> `bingoCategory`, `bingoExclude`. Le «thème particulier» rejoint le thème
> saisonnier ci-dessous plutôt qu'un réglage séparé par carte.

Permettre de personnaliser les cartes avec :

* différents niveaux de difficulté ;
* des catégories choisies ;
* certains tropes exclus ;
* un thème particulier.

---

## Thèmes saisonniers

> ✅ Fait (partiel) — réglage `seasonalTheme` reteinte l'horoscope selon le
> mois (hiver/printemps/été/automne/Halloween). Bingo et roulette saisonniers
> spécifiques non ajoutés : la reteinte de couleur suffit à l'effet recherché
> sans multiplier les variantes par mini-jeu.

Créer des versions spéciales des mini-jeux pour :

* une saison ;
* une fête ;
* un événement particulier.

Cela pourrait inclure :

* un bingo saisonnier ;
* un horoscope thématique ;
* une roulette spéciale.

---

## Détection automatique d’une carte complétée

> ✅ Fait — un toast signale tout nouveau motif complété pendant la
> détection en arrière-plan, carte ouverte ou non.

Détecter et signaler immédiatement qu’une carte ou un motif est terminé sans obliger l’utilisateur à ouvrir la carte.

---

## Suivi de l’horoscope

> ✅ Fait — la bannière et le réaffichage manuel indiquent si le trope
> prédit hier a été lu, croisé avec l'historique de tropeStatistics.

Permettre à l’utilisateur d’indiquer si le trope du jour s’est réellement retrouvé dans sa lecture.

---

## Quiz d’humeur

> ✅ Fait — nouveau sous-module `tropeMoodQuiz.js`.

Ajouter un mini-quiz permettant de proposer un trope adapté à l’humeur actuelle.

---

## Trope du mois

> ❌ Écarté — aurait fait doublon avec l'horoscope quotidien et la tendance
> mensuelle déjà livrés dans ce même passage.

Ajouter un **trope chanceux du mois** avec :

* une sélection mensuelle ;
* un suivi séparé ;
* une série de lecture dédiée.

---

## Menu flottant commun

> ✅ Fait — bouton «🃏» unique, `registerMenuItem()`.

Créer un menu unique regroupant tous les mini-jeux au même endroit.

---

## Intégration avec Surprise Me

> ✅ Fait — bouton «🎲 Surprise Pick», drapeau sessionStorage consommé par
> `surpriseMe.js` au chargement de la page de recherche.

Relier la roulette de tropes au module **Surprise Me** afin de pouvoir tirer une œuvre correspondant à la combinaison obtenue.

---

## Intégration avec Similar Fics

> ❌ Écarté — `similarFics` n'expose aucune API publique ; une vraie
> intégration demanderait de récupérer et analyser une autre page côté
> client, hors de portée (même constat que pour fanficBingeMode/hiddenGems).

Utiliser les statistiques de tropes dans le module **Similar Fics** afin d’améliorer les recommandations.

---

## Catégories de tropes

> ✅ Fait — table `TROPE_CATEGORIES` (huit catégories), utilisée pour les
> Stats et pour filtrer les cartes de bingo personnalisées.

Regrouper les statistiques selon des catégories comme :

* romance ;
* réconfort ;
* univers alternatif ;
* fantastique ;
* angst ;
* aventure.

---

## Graphiques et évolution temporelle

> ✅ Fait (fusionné avec la tendance mensuelle) — barres déjà utilisées
> pour le top 10, pas de bibliothèque de graphiques.

Ajouter des graphiques ou une vue chronologique permettant de visualiser l’évolution des habitudes de lecture.

---

## Réaffichage manuel de l’horoscope

> ✅ Fait — bouton «🔮 Horoscope» dans le menu flottant.

Ajouter une commande permettant de réafficher la bannière du jour après l’avoir fermée.

---

## Partage du bingo

> ❌ Écarté — contredit la décision «Jeux individuels» déjà prise (pas de
> classement, pas de serveur, pour éviter toute pression compétitive).

Permettre de partager une carte de bingo avec d’autres personnes.

Cela pourrait inclure un mode multijoueur coopératif sans classement.

---

## Progression du bingo

> ✅ Fait — `bingoProgressPercent()`, affiché sous la grille.

Afficher un pourcentage de progression sur la carte.

Exemple :

```text
17 cases sur 24 — 71 %
```

---

## Taille de la roulette

> ✅ Fait — réglage `rouletteCount` (2 à 5).

Permettre de choisir le nombre de tropes tirés simultanément plutôt que d’imposer trois tropes.

---

## Niveaux de médailles

> ✅ Fait — chaque succès a un `tier`, affiché dans le toast et le panneau.

Ajouter plusieurs niveaux pour les succès :

* bronze ;
* argent ;
* or ;
* platine.

Les niveaux pourraient dépendre de la difficulté ou de la progression.

---

## Historique des succès

> ✅ Fait — bouton «Show unlock history», tri du plus récent au plus
> ancien.

Afficher un historique détaillé comprenant :

* les succès débloqués ;
* leur date de déblocage ;
* leur ordre d’obtention.

La date est déjà enregistrée dans les données, mais aucune interface complète d’historique n’est actuellement prévue.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Jeux individuels

Les mini-jeux restent principalement solo.

Aucun classement compétitif entre plusieurs utilisateurs n’est prévu.

Cette décision permet :

* d’éviter la pression ;
* de conserver une expérience personnelle ;
* de ne pas nécessiter de serveur ou de compte externe.

---

## Portée limitée aux tropes

Un système général de badges couvrant toute l’utilisation d’AO3 Helper a été écarté.

Cela aurait pu inclure :

* la première œuvre lue ;
* 100 œuvres terminées ;
* l’exploration de nouveaux fandoms ;
* un profil général de succès.

Cette idée a été jugée trop ambitieuse et trop éloignée du sujet principal du module, qui reste centré sur les tropes.

---

## Horoscope indépendant de l’anniversaire

Le trope du jour ne dépend pas de la date d’anniversaire de l’utilisateur.

Cette idée a été écartée parce qu’elle aurait peu d’intérêt après la première utilisation.

Le système utilise plutôt la date du jour.

---

## Liste commune

Les cinq sous-modules utilisent la même liste centrale de tropes.

Cela permet :

* d’éviter les listes contradictoires ;
* de garder des noms cohérents ;
* de faciliter les correspondances entre le bingo, les statistiques, la roulette et les succès.

---

## TropeDare

Une ancienne documentation mentionnait une fonctionnalité appelée **TropeDare**, présente dans le code mais inactive.

Cette fonctionnalité n’existe plus dans la version actuelle du module.

---

## Correction d'un réglage silencieusement inactif (chantier 4, 2026-07-18)

Avant ce passage, `_tropeGames.js` n'exposait aucune fonction `cfg()`
partagée : chaque sous-module lisait ses propres réglages via
`loadModuleSettings(<son propre id>)`, par exemple `loadModuleSettings('tropeHoroscope')`.

Le panneau de réglages, lui, enregistre toujours sous l'identifiant du
module **parent** (`ao3h:mod:tropeGames:settings`), puisque c'est
`tropeGames` qui apparaît comme entrée activable dans la liste des modules.

Résultat : les clés que les sous-modules lisaient (`ao3h:mod:tropeHoroscope:settings`,
`ao3h:mod:tropeBingoPatterns:settings`, etc.) n'étaient jamais celles que le
panneau écrivait. Chaque case à cocher du panneau (trope du jour, succès,
bingo, roulette, statistiques) était donc silencieusement sans effet.

Le coordinateur expose maintenant un `cfg()` partagé (même schéma que
`textToSpeech`/`readingFormatter`), et tous les sous-modules — y compris les
nouveaux réglages ajoutés dans ce même passage — le lisent via
`W.AO3H_TropeGames.cfg(clé)`. Les réglages du panneau ont maintenant un effet réel.

## Écarté cette fois-ci : intégrations sans API et redondances

Deux idées de la liste ci-dessus ont été écartées avec la même logique que
lors de passages précédents du chantier :

* L'intégration avec **Similar Fics** demanderait de récupérer et d'analyser
  une autre page côté client — ce module n'expose aucune API publique,
  contrairement à `surpriseMe` (voir la même conclusion déjà tirée pour
  `fanficBingeMode`).
* Le **trope du mois** aurait fait doublon avec l'horoscope quotidien et la
  tendance mensuelle livrés dans ce même passage.

Le **partage de carte de bingo / mode multijoueur** reste écarté pour la
raison déjà documentée dans "Jeux individuels" ci-dessus.



