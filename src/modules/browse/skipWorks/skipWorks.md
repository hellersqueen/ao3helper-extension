# skipWorks

**Tab:** Browse

## À quoi ça sert

Ce module permet de cacher manuellement une fic précise depuis les listes,
avec une note optionnelle pour expliquer pourquoi ("crossover", "déjà
lu"...). Contrairement à `hideByTags`, qui cache selon les tags, ici on
cible une fic à la fois, avec un bouton "Hide".

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `displayMode` | `dim` | Comment afficher une fic cachée : bloc gris avec la note, ou suppression complète |

Les raisons rapides proposées dans la petite fenêtre, ainsi que la liste
des fics cachées, se gèrent depuis le panneau de configuration.

## Fichiers

### `skipWorks.js` — tout le module en un seul fichier

- Ajoute un bouton "Hide" sur chaque fic d'une liste
- Un clic ouvre une petite fenêtre avec des raisons rapides déjà prêtes (personnalisables), plus un champ de texte libre
- Une fic cachée s'affiche en gris avec la note, ou disparaît complètement (au choix), avec des boutons "Show" (révéler temporairement), "Edit" (changer la note) et "Unhide" (démasquer pour de bon)
- Garde en mémoire la liste des fics cachées, séparément pour chaque compte utilisateur
- Permet d'exporter ou d'importer cette liste dans un fichier

### `skipWorks.css`

- Les styles visuels du bouton, de la fenêtre de choix et du panneau de réglages

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Chercher une fic cachée par son titre ou son auteur dans la liste — il n'y a pas de barre de recherche
- Reconnaître toute seule les fics qui ont des notes d'auteur (au début ou à la fin) et les cacher ou mettre un badge d'avertissement dessus
- Garder la liste des fics cachées synchronisée automatiquement entre plusieurs appareils grâce à un autre module de sauvegarde
- Pouvoir double-cliquer sur une fic cachée pour la remontrer tout de suite
- Cacher automatiquement des fics selon des mots-clés, sans avoir à cliquer sur "Hide" soi-même
- Avoir plusieurs styles différents pour afficher la raison d'un masquage
- Choisir où placer le bouton "Hide" ou changer son texte
- Demander une confirmation avant de cacher une fic
- Des règles automatiques qui cachent une fic toute seule (par exemple par tag ou par auteur), sans avoir à cliquer sur "Hide" à chaque fois
- Écrire une note privée sur une fic sans la cacher — en ce moment, une note n'existe que collée à un masquage
- Surligner des passages ou poser des petits marque-pages dans le texte d'une fic pendant qu'on la lit

## Explicitement écarté

- Avoir une liste figée de raisons de masquage toutes prêtes, plutôt que des raisons personnalisables — jugé trop restrictif pour convenir à tout le monde
- Pouvoir cacher plusieurs fics d'un coup avec une seule action groupée — abandonné
- Fusionner ce module avec `hideByTags` — refusé explicitement : les buts sont trop différents, ici le masquage est manuel et volontaire, alors que `hideByTags` cache automatiquement selon des critères
