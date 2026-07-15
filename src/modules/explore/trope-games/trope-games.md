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

## Fichiers

### 1. `_tropeGames.js` — le chef d'orchestre

- Partage la liste des tropes et des outils de stockage avec les cinq autres fichiers

### 2. `tropeHoroscope.js` — horoscope du trope du jour

- Sur la page d'accueil, affiche une bannière annonçant un trope "du jour", choisi selon la date pour être le même pour tout le monde
- Affiché une fois par jour, avec la possibilité de le fermer

### 3. `tropeBingoPatterns.js` — carte de bingo

- Génère une carte de bingo 5×5 avec 24 tropes au hasard et une case "gratuite" au centre
- Sur les pages de fic, coche automatiquement les cases dont le trope correspond aux tags de la fic lue
- Repère les lignes, colonnes, diagonales et autres motifs complétés

### 4. `tropeRoulette.js` — roulette de tropes

- Un bouton "🎲 Roulette" ouvre une fenêtre avec 3 tropes tirés au hasard, sans doublon
- Propose un lien de recherche AO3 qui combine ces trois tropes
- Permet de retirer d'autres tropes autant de fois qu'on veut

### 5. `tropeStatistics.js` — statistiques de lecture

- Enregistre les tropes rencontrés en lisant des fics
- Calcule une série de jours consécutifs de lecture
- Affiche le top 10 des tropes les plus lus, avec un export possible en JSON ou CSV

### 6. `tropeAchievements.js` — succès de lecture

- Vérifie régulièrement une liste de 9 succès à débloquer (par exemple "First Steps", "Bingo!")
- Affiche un petit message qui se ferme tout seul à chaque nouveau succès débloqué
- Un bouton "🏅 Achievements" montre la progression vers tous les succès

### 7. `tropeGames.css`

- Les styles visuels de la bannière, de la carte de bingo, de la roulette et des panneaux de statistiques/succès

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Des défis de tropes à réaliser (par exemple "lire un trope différent chaque jour du mois")
- Voir comment tes tropes préférés ont changé avec le temps
- Un mode "chasseur de tropes rares" pour dénicher des tropes peu utilisés
- Des cartes de bingo personnalisées avec différents niveaux de difficulté
- Des thèmes saisonniers (bingo ou horoscope spécial pour une saison ou une fête)
- Repérer automatiquement quand une carte de bingo est complétée, sans avoir à ouvrir la carte
- Suivre si les prédictions de l'horoscope du jour se réalisent vraiment
- Un mini-quiz pour trouver le trope qui correspond à ton humeur du moment
- Un "trope chanceux du mois" avec son propre suivi de série
- Un menu flottant unique qui regroupe tous les mini-jeux au même endroit
- Relier la roulette de tropes au module de fic au hasard
- Relier les statistiques de tropes au module de fics similaires
- Regrouper les tropes lus par catégories (romance, réconfort, univers alternatif, fantastique...)
- Des graphiques ou une vue de l'évolution dans le temps de tes habitudes de lecture, pas juste une liste
- Pouvoir forcer l'affichage de l'horoscope du jour manuellement, même si on l'a déjà fermé aujourd'hui
- Pouvoir partager sa carte de bingo avec d'autres personnes (un mode à plusieurs joueurs)
- Afficher un pourcentage de progression sur la carte de bingo, en plus des motifs déjà repérés
- Choisir combien de tropes la roulette tire d'un coup, pas seulement 3
- Avoir des niveaux de médailles (bronze, argent, or, platine) pour les succès, selon leur difficulté
- Garder un historique des succès débloqués avec la date de chaque déblocage

## Explicitement écarté

- Un vrai système de badges plus large que les tropes (par exemple pour ta toute première fic lue, tes 100 fics lues, l'exploration de nouveaux fandoms...) avec un profil de succès dédié — jugé trop ambitieux et hors du sujet principal de l'extension
- Un mode compétition avec classement entre plusieurs joueurs — les jeux restent solo, pour éviter toute pression
- Un horoscope de trope basé sur la date d'anniversaire — jugé sans intérêt après la toute première fois

## Précision

⚠️ Une doc historique mentionnait une fonctionnalité "TropeDare" présente
dans le code mais jamais vraiment activée. Vérifié : elle n'existe plus du
tout dans le code actuel.
