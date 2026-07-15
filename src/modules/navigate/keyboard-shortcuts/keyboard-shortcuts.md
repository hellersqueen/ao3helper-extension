# keyboardShortcuts

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module ajoute des raccourcis clavier pour les actions courantes d'AO3
(chapitre précédent/suivant, page précédente/suivante, "Surprise Me",
s'abonner, mettre en favoris, marquer pour plus tard), plus une fenêtre
d'aide qui liste tous les raccourcis quand on appuie sur `?`. D'autres
modules peuvent aussi ajouter leurs propres raccourcis grâce à ce module,
sans avoir à recoder toute la gestion du clavier eux-mêmes.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `allShortcutsDisabled` | désactivé | Coupe-circuit d'urgence — désactive tous les raccourcis immédiatement |
| `customizationEnabled` | désactivé | Personnaliser les touches soi-même *(pas encore actif)* |
| `prevChapter` | `Ctrl+ArrowLeft` | Chapitre précédent (page d'une fic) |
| `nextChapter` | `Ctrl+ArrowRight` | Chapitre suivant (page d'une fic) |
| `prevPage` | `Shift+ArrowLeft` | Page précédente (listes de fics) |
| `nextPage` | `Shift+ArrowRight` | Page suivante (listes de fics) |
| `guide` | `?` | Afficher la fenêtre d'aide des raccourcis |
| `surpriseMe` | `Ctrl+Shift+R` | Déclenche "Surprise Me" (listes de fics) |
| `subscribe` | `Ctrl+Shift+S` | S'abonner à la fic |
| `bookmark` | `Ctrl+Shift+B` | Ajouter aux favoris |
| `markForLater` | `Ctrl+Shift+M` | Marquer pour plus tard |

## Fichiers

### `keyboardShortcuts.js` — tout le module en un seul fichier

- Écoute les touches pressées et déclenche l'action correspondante, sauf si on est en train d'écrire dans un champ de texte
- Affiche un petit flash visuel pour confirmer qu'un raccourci a bien fonctionné
- Ouvre une fenêtre d'aide (touche `?`, fermeture avec Échap) qui liste tous les raccourcis actifs, y compris ceux ajoutés par d'autres modules
- Prévient dans la console si deux raccourcis utilisent la même combinaison de touches par erreur
- Permet à d'autres modules d'ajouter leurs propres raccourcis (par exemple, un module de navigation par chapitre peut réutiliser Ctrl+Flèche gauche/droite)

### `keyboardShortcuts.css`

- Les styles visuels de la fenêtre d'aide et du flash de confirmation

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Vraiment personnaliser les touches soi-même (le réglage existe, mais rien n'est branché derrière pour l'instant)
- Exporter ou importer ses raccourcis personnalisés dans un fichier
- Un mode "Vim" avec les touches h/j/k/l pour se déplacer
- Un raccourci clavier pour laisser un kudos directement
- Chercher un raccourci précis dans la fenêtre d'aide, plutôt que de parcourir toute la liste
- Des raccourcis en plusieurs étapes (appuyer sur une touche, puis une autre, comme dans certains sites) plutôt qu'en une seule combinaison
- Proposer une solution quand deux raccourcis utilisent la même touche, pas juste prévenir dans la console pour les développeurs
- Une barre de recherche façon "palette de commandes" (comme Ctrl+K) pour trouver et lancer n'importe quelle action juste en tapant son nom
- Aller directement à la première ou dernière page de résultats avec les touches Origine/Fin, ou sauter plusieurs pages d'un coup avec Page précédente/Page suivante
- Avancer ou reculer avec un geste de balayage du doigt sur téléphone ou tablette
- Ranger les raccourcis affichés dans la fenêtre d'aide par catégories, plutôt que tous à la suite

## Explicitement écarté

- Des touches simples comme K, B, M, N ou P toutes seules — trop facile à appuyer dessus par accident en lisant
- Les flèches Haut/Bas pour changer de chapitre — ça entre en conflit avec le défilement normal de la page
- Les flèches Gauche/Droite toutes seules (sans Ctrl ni Shift) pour changer de page — trop facile à déclencher par erreur
- Un interrupteur pour activer ou désactiver chaque raccourci un par un — inutile, il suffit de remapper un raccourci vers "rien" pour le désactiver
- Plusieurs profils de raccourcis sauvegardés en même temps — jugé trop compliqué
- Utiliser Origine/Fin pour aller directement au premier ou dernier chapitre d'une fic — jugé pas assez intuitif

## Précision

⚠️ La doc historique anglaise liste les 4 raccourcis "Surprise Me",
"Subscribe", "Bookmark" et "Mark for Later" comme "pas encore branchés".
Les quatre fonctionnent bel et bien aujourd'hui dans
`keyboardShortcuts.js`.
