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

## Détails techniques

Stockage :
- `ao3h:tg:horoscope:{YYYY-MM-DD}` — trope du jour
- `ao3h:tg:bingo` — `{ card, checked, completed, size }`
- `ao3h:tg:stats` — `{ [tropeKey]: count }`
- `ao3h:tg:stats:seen` — `[{ id, date, tropes }]`, dédupliqué, max 1000 entrées ; le champ `tropes` (ajouté au chantier 4) alimente le défi hebdomadaire, la tendance mensuelle et la rétrospective de l'horoscope
- `ao3h:tg:achievements` — `[{ id, unlockedAt }]`
- `ao3h:tg:autoSurprise` (`sessionStorage`) — drapeau à usage unique lu par `surpriseMe.js` (chantier 4)
