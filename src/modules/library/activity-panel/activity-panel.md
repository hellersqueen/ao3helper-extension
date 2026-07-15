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
