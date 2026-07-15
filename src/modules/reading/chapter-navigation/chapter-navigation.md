# chapterNavigation

**Tab:** Reading

## À quoi ça sert

Ce module regroupe tous les outils pour naviguer entre les chapitres d'une
fic, sur la page de lecture comme sur les listes : une barre de navigation
qui reste visible, des boutons pour reprendre là où on s'était arrêté, un
défilement automatique, et un compteur de mots par chapitre.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `stickyNav` | désactivé | La barre de navigation Précédent/Suivant reste toujours visible pendant la lecture |
| `resumeButton` | activé | Bouton "Start"/"Continue" adapté sur les listes de fics |
| `lastChapterBtn` | activé | Bouton "Last (Ch Y)" sur les listes de fics |
| `autoScrollShowControls` | activé | Affiche les boutons de vitesse et de pause du défilement automatique |
| `autoScrollSpeed` | `50` | La vitesse de défilement par défaut (en pixels par seconde) |
| `autoScrollAutoAdvance` | désactivé | Passe automatiquement au chapitre suivant en arrivant en bas de la page |

## Fichiers

### 1. `_chapterNavigation.js` — le chef d'orchestre

- Vérifie sur quel type de page on se trouve et met en route les bons fichiers de fonctionnalités

### 2. `navigationControls.js` — barre de navigation et raccourcis

- Une barre Précédent/Suivant qui peut rester collée en haut de l'écran pendant la lecture
- Un petit texte "Chapter X of Y" au-dessus du menu déroulant des chapitres
- Garde en mémoire le dernier chapitre visité
- Des raccourcis clavier (Ctrl+Flèche gauche/droite) pour changer de chapitre

### 3. `blurbNavigation.js` — boutons de reprise sur les listes

- Ajoute un bouton "Start" sur les fics jamais commencées, ou "Continue (Ch X)" sur celles déjà en cours
- Signale s'il y a de nouveaux chapitres parus depuis la dernière lecture
- Ajoute un bouton "Last (Ch Y)" pour sauter directement au dernier chapitre

### 4. `autoScroll.js` — défilement automatique

- Ajoute un petit widget flottant avec plusieurs vitesses de défilement (0.5×, 1×, 2×, 4×) et un bouton stop
- Le défilement se met en pause dès qu'on touche la souris, le clavier ou l'écran, et reprend après une courte pause
- Peut passer automatiquement au chapitre suivant en arrivant en bas de la page

### 5. `chapterWordCount.js` — compteur de mots par chapitre

- Affiche un badge "~ X.XK words" indiquant le nombre de mots de chaque chapitre, sans compter le résumé ni les notes

### 6. `chapterNavigation.css`

- Les styles visuels de la barre, du texte, des boutons et du widget de défilement

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Un menu déroulant de chapitres avec les titres et des mini-aperçus, pas juste les numéros
- Chercher un chapitre par son titre ou son numéro
- Marquer certains chapitres comme favoris ou "à relire"
- Ajouter une note personnelle à un chapitre précis
- Voir la liste des chapitres consultés récemment
- Naviguer entre les chapitres à la voix, mains libres
- Se fixer des objectifs de lecture basés sur le nombre de chapitres
- Un fil d'Ariane qui montre où on est (Œuvre > Chapitre 5 > Titre)
- Un lien direct copiable vers chaque chapitre
- Des petits points visuels (lu/non lu) et une mini-carte de la progression sur laquelle on peut cliquer pour sauter
- Un repère "tu es ici" dans cette mini-carte
- Des marques de complétion (✓) sur chaque chapitre déjà lu
- Comparer la longueur des chapitres entre eux (le plus long, le plus court, la moyenne) avec un petit graphique
- Afficher le titre du chapitre en cours dans le titre de l'onglet du navigateur
- Un bouton flottant "📑 Chapters" sur les pages de fic, avec un raccourci pour sauter directement au premier chapitre non lu, et un raccourci clavier pour aller directement au dernier chapitre
- Une estimation du temps de lecture pour chaque chapitre
- Rendre le titre du chapitre en cours plus visible ou plus grand sur la page
- Plus d'options de raccourcis clavier pour se déplacer entre les chapitres
- Des effets d'animation ou de transition personnalisés en changeant de chapitre
- Charger le chapitre suivant en arrière-plan pour qu'il s'ouvre instantanément
- Combiner le défilement automatique avec un journal de lecture pour avoir un résumé détaillé de chaque session de lecture

## Explicitement écarté

- Charger automatiquement l'œuvre entière d'un coup selon sa longueur
- Un tableau de bord avec des statistiques de lecture — ce n'est pas le rôle de ce module, qui sert à naviguer, pas à faire des statistiques
- Pouvoir déplacer les boutons de navigation où on veut sur l'écran — jugé trop compliqué à régler pour peu d'intérêt

## Précision

⚠️ Les docs historiques présentent `navigationControls` (barre collante,
raccourcis) et `autoScroll` (défilement automatique) comme des fichiers
jamais créés. C'est faux aujourd'hui : les deux sont pleinement codés dans
`navigationControls.js` et `autoScroll.js`.
