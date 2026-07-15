# readingDashboard

**Tab:** Library

## À quoi ça sert

Ce module ajoute un tableau de bord personnel en haut de la page d'accueil
AO3, avec plusieurs blocs basés sur les fics que tu as visitées : reprendre
ses lectures en cours, les dernières fics ouvertes, les fics pas encore
terminées, tes fandoms et tags les plus lus, et des liens rapides vers tes
listes.

## Réglages utilisateur

Aucun réglage n'est actuellement branché au code — le panneau propose ces
options, mais elles n'ont aucun effet pour l'instant :

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showRecentWorks` | activé *(pas encore actif)* | Afficher le bloc des fics récentes |
| `showWipTracker` | activé *(pas encore actif)* | Afficher le bloc des fics en cours |
| `showTopFandoms` | activé *(pas encore actif)* | Afficher le bloc des fandoms les plus lus |
| `showTopTags` | activé *(pas encore actif)* | Afficher le bloc des tags les plus lus |
| `showQuickLinks` | activé *(pas encore actif)* | Afficher les liens rapides |
| `recentWorksCount` | `10` *(pas encore actif)* | Le nombre de fics récentes affichées |
| `topFandomsCount` | `6` *(pas encore actif)* | Le nombre de fandoms affichés |

## Fichiers

### `readingDashboard.js` — tout le module en un seul fichier

- Note chaque fic visitée (titre, fandom, tags, statut) dans un historique local, avec un maximum de 200 fics gardées
- Affiche un bloc "Continue Reading" avec les 3 fics en cours de lecture
- Affiche un bloc avec les 10 dernières fics ouvertes
- Affiche un bloc avec les fics pas encore terminées parmi celles visitées récemment
- Affiche un classement des fandoms et des tags les plus visités
- Affiche des liens rapides vers Bookmarks, Historique, "Marked for Later" et Abonnements
- Le tableau de bord n'apparaît que sur la page d'accueil ou la page personnelle ; ailleurs, seul l'historique de visite continue d'être mis à jour en arrière-plan

### `readingDashboard.css`

- Les styles visuels du tableau de bord et de ses blocs

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Réorganiser les blocs à la main par glisser-déposer
- Suivre la progression de défis de lecture
- Un bilan annuel façon "rétrospective de l'année", comme font certaines applications de musique
- Deviner ton "profil de lecteur" (plutôt marathon, occasionnel, ou complétionniste)
- Des indicateurs sur la diversité de ce que tu lis
- Voir le pourcentage de fics que tu relis par rapport aux nouvelles
- Un vrai nuage de tags visuel pour tes préférences, pas juste une liste

## Explicitement écarté

- Calculer ta vitesse de lecture — jugé peu fiable sans vraie mesure du temps de lecture
- Des graphiques ou des statistiques avancées — pour rester simple
- Se fixer des objectifs de lecture à atteindre — la lecture reste un loisir, pas un objectif chiffré
- Comparer ses statistiques de lecture à celles des autres — pour rester privé
- Des badges ou des séries de jours consécutifs (streaks) sur ce tableau de bord — retiré pour ne pas trop transformer la lecture en jeu
- Exporter des rapports personnalisables — écarté pour garder le tableau de bord simple

## Précision

⚠️ La doc historique anglaise dit que le lien avec le module readingTracker
est déclaré mais jamais vraiment utilisé. Ce n'est plus tout à fait vrai :
le bloc "Continue Reading" lit bel et bien les données de progression de
readingTracker — les 4 autres blocs, eux, utilisent toujours leur propre
mémoire indépendante.
