# commentKit

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module regroupe tout ce qui touche à l'écriture, la navigation et la
gestion des commentaires sur une page de fic : outils de rédaction,
brouillons sauvegardés automatiquement, navigation rapide vers les
commentaires, mise en valeur de certaines réponses, et gestion des fils de
discussion.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `realtimeCounter` | activé | Compteur de caractères et de mots en direct |
| `showFloatingBox` | désactivé | Boîte de commentaire flottante visible pendant la lecture |
| `enableAutoSave` | activé | Sauvegarde automatique des brouillons, restaurés au rechargement |
| `enablePreview` | activé | Bouton pour voir un aperçu du commentaire avant de le publier |
| `showFormattingToolbar` | activé | Barre d'outils (Gras / Italique / Lien / Citation) |
| `showQuickTemplates` | désactivé | Panneau de modèles de commentaires rapides |
| `commentTemplates` | désactivé | Modèles personnalisés réutilisables, avec un bouton pour les gérer |
| `collapseExpandButtons` | activé | Boutons pour replier/déplier chaque commentaire |
| `unreadTracking` | désactivé | Suivi des commentaires jamais vus (badge "NEW") |
| `highlightAuthorReplies` | désactivé | Met en valeur les commentaires de l'auteur·ice de la fic |
| `highlightRepliesToMe` | activé | Met en valeur les réponses à mes propres commentaires |
| `jumpToCommentsButton` | désactivé | Bouton pour sauter directement aux commentaires |
| `chapterIndicator` | activé | Badge "Ch N" sur les commentaires de la boîte de réception |
| `guestCommentsDefault` | désactivé | Coche par défaut "Allow guest comments" en créant une nouvelle fic |

## Fichiers

### 1. `_commentKit.js` — le chef d'orchestre

- Met en route les six autres fichiers de fonctionnalités de ce module

### 2. `commentComposing.js` — outils de rédaction

- Ajoute une barre d'outils (Gras, Italique, Lien, Citation) au-dessus de la zone de commentaire, avec des raccourcis clavier
- Propose des modèles de texte prêts à insérer en un clic, personnalisables
- Un bouton "Preview" montre à quoi ressemblera le commentaire une fois publié

### 3. `draftManagement.js` — brouillons et confort d'écriture

- Sauvegarde automatiquement ce qu'on est en train d'écrire, fic par fic, et le restaure si on recharge la page
- Efface tout seul les brouillons trop vieux (plus de 30 jours)
- Affiche un compteur de mots et de caractères en direct
- Peut afficher une boîte de commentaire flottante quand le vrai formulaire n'est plus visible à l'écran

### 4. `commentNavigation.js` — accès rapide aux commentaires

- Ajoute un bouton qui montre le nombre de commentaires et fait défiler directement jusqu'à eux
- Ajoute un bouton "↑ Back to top" après la section des commentaires

### 5. `commentHighlighting.js` — mettre en valeur certains commentaires

- Ajoute une bordure de couleur et un badge "Author" sur les commentaires de l'auteur de la fic
- Ajoute un badge sur les réponses directes à un de tes propres commentaires

### 6. `threadManagement.js` — gérer les fils de discussion

- Permet de replier ou déplier chaque commentaire principal, avec des boutons pour tout replier ou tout déplier d'un coup
- Marque les commentaires jamais vus avec un badge "NEW", avec un bouton pour tout marquer comme lu

### 7. `commentConfiguration.js` — petits réglages annexes

- Affiche un badge "Ch N" sur les commentaires de la boîte de réception, pour savoir à quel chapitre ils correspondent
- Coche automatiquement l'option "Allow guest comments" en créant une nouvelle fic

### 8. `commentKit.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Une fonction "citer et répondre" pour reprendre un commentaire dans sa réponse
- Chercher un mot dans tous les commentaires d'une œuvre
- Un aperçu différent selon si on est connecté ou si on commente en tant qu'invité
- Des catégories de modèles avec des espaces à remplir (comme le titre de la fic ou le nom de l'auteur)
- Chercher parmi ses propres modèles de commentaires
- De petits bouts de texte tout prêts à insérer rapidement
- Des réponses automatiques selon des règles précises
- Des modèles qui se remplissent tout seuls avec le titre de la fic ou le nom de l'auteur
- Plusieurs brouillons en même temps pour un même commentaire
- Changer la densité d'affichage des commentaires (compact/normal/spacieux)
- Cacher ou n'afficher que les commentaires de l'auteur·ice
- Un panneau de navigation flottant pour sauter au premier/dernier/prochain fil de discussion
- Une mini-carte visuelle qui montre où se trouvent le plus de commentaires sur la page
- Un raccourci pour aller directement à une page précise, quand les commentaires sont répartis sur plusieurs pages
- Pouvoir surligner les commentaires de pseudos ou de mots-clés choisis soi-même, pas juste l'auteur ou les réponses à soi
- Un bouton pour mettre en forme des listes (à puces ou numérotées) dans la barre d'outils
- Un bouton pour souligner le texte dans la barre d'outils
- Sélectionner du texte de la fic en la lisant pour l'ajouter automatiquement en citation dans le brouillon de commentaire
- Pouvoir déplacer la boîte de commentaire flottante avec la souris
- Replier automatiquement les fils de discussion qui ont beaucoup de réponses, sans avoir à cliquer soi-même
- Des raccourcis clavier pour naviguer d'un commentaire à l'autre
- Analyser le texte de la fic elle-même (par exemple repérer un moment fort de l'histoire) pour proposer un commentaire adapté à ce passage précis et au ton de la fic, en s'inspirant aussi de tes propres commentaires passés — pas juste un modèle générique à remplir
- Voir l'impact de ses propres commentaires, par exemple combien de réponses ils ont reçues, en lien avec le suivi de ta lecture

## Explicitement écarté

- Insérer des GIF dans un commentaire — jugé contraire à l'esprit d'AO3
- Un générateur de commentaire gentil au hasard — jugé gadget
- Un sélecteur d'émojis — jugé peu utilisé
- Des statistiques sur ses propres commentaires
- Une boîte flottante à part, juste pour prendre des notes libres — la boîte de commentaire flottante avec sauvegarde automatique suffit déjà

## Précision

⚠️ La doc historique anglaise décrit une organisation du code bien plus
désordonnée que la réalité actuelle (fonctionnalités rangées dans les
mauvais fichiers, deux systèmes de réglages séparés). Le code actuel est
propre : 6 fichiers correctement nommés, un seul jeu de réglages partagé.

⚠️ Une autre doc historique affirme que le repli global des fils de
discussion ("Collapse all" / "Expand all") n'a jamais été codé. C'est
faux : ces boutons existent bel et bien dans `threadManagement.js`.
