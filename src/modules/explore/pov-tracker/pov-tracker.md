# povTracker

**Tab:** Explore

## À quoi ça sert

Ce module devine automatiquement le point de vue narratif (1ère, 2e, 3e
personne, mixte ou multi) d'une fic à partir de ses tags et de son résumé.
Il affiche ensuite un badge sur les listes et propose des filtres pour ne
voir que certains points de vue.

C'est une détection expérimentale, basée sur des motifs de texte simples
(pas une vraie lecture de la fic) : elle est juste assez fiable pour être
utile, mais pas parfaite (autour de 60% de bonnes réponses).

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showBadgesOnBlurbs` | activé | Affiche les badges de point de vue sur les listes (seulement pour les fics déjà analysées) |
| `badgeFirst` | activé | Affiche le badge 1ère personne |
| `badgeSecond` | désactivé | Affiche le badge 2e personne |
| `badgeThird` | activé | Affiche le badge 3e personne |
| `badgeMixed` | désactivé | Affiche le badge point de vue mixte |
| `badgeMulti` | désactivé | Affiche le badge multi-points de vue |
| `badgeUnknown` | désactivé | Affiche le badge point de vue inconnu |
| `enablePovFilters` | activé | Ajoute des cases à cocher pour filtrer les listes par point de vue |
| `autoAnalyze` | activé | Analyse automatiquement à l'ouverture de la page d'une fic |
| `showStats` | désactivé | Affiche un résumé personnel de la répartition des points de vue |

## Fichiers

### 1. `_povTracker.js` — le chef d'orchestre

- Met en route les deux autres fichiers et partage les réglages avec eux

### 2. `povAnalysis.js` — détection du point de vue

- Analyse les tags et le résumé d'une fic pour deviner son point de vue
- Garde le résultat en mémoire pendant 7 jours, pour ne pas refaire l'analyse à chaque fois

### 3. `povPresentation.js` — badges et filtres

- Affiche un badge coloré sur chaque fic d'une liste, selon son point de vue
- Ajoute une barre de filtres cliquables pour cacher ou montrer les fics selon leur point de vue
- Peut afficher un petit résumé de la répartition des points de vue rencontrés

### 4. `povTracker.css`

- Les styles visuels des badges, de la barre de filtres et de la barre de statistiques

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Deviner le point de vue en lisant vraiment le texte de l'histoire (en comptant des mots comme "je", "tu", "il/elle") — en ce moment, ça regarde seulement les tags et le résumé, pas le texte réel de la fic
- Suivre le point de vue chapitre par chapitre à l'intérieur d'une même fic
- Un panneau sur la page de la fic qui montre un résumé global et une liste chapitre par chapitre du point de vue
- Vérifier qu'il y a assez de texte avant de se lancer dans une analyse
- Prévenir quand le point de vue change en cours de route dans une fic
- Vérifier si le point de vue reste cohérent du début à la fin
- Enregistrer sa préférence de point de vue une bonne fois pour toutes, et filtrer automatiquement selon elle
- Deviner le style d'écriture habituel d'un auteur selon les points de vue qu'il utilise
- Recommander des fics selon le point de vue préféré
- Mieux repérer les fics qui mélangent plusieurs points de vue en même temps
