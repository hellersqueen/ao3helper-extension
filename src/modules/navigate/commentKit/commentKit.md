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
| `showFloatingBox` | désactivé | Boîte de commentaire flottante visible pendant la lecture (déplaçable) |
| `enableAutoSave` | activé | Sauvegarde automatique des brouillons, restaurés au rechargement (un brouillon distinct par formulaire) |
| `enablePreview` | activé | Bouton pour voir un aperçu du commentaire avant de le publier |
| `showFormattingToolbar` | activé | Barre d'outils (Gras / Italique / Souligné / Barré / Lien / Citation) |
| `showQuickTemplates` | désactivé | Panneau de modèles de commentaires rapides |
| `commentTemplates` | désactivé | Modèles personnalisés réutilisables, avec un bouton pour les gérer |
| `quoteFicSelection` | activé | Sélectionner du texte de la fic propose de le citer dans le commentaire |
| `collapseExpandButtons` | activé | Boutons pour replier/déplier chaque commentaire |
| `autoCollapseThreshold` | `0` (désactivé) | Replie automatiquement les fils avec beaucoup de réponses (5/10/20+) |
| `showQuoteReplyButton` | activé | Bouton "❝ Reply" pour citer un commentaire dans sa réponse |
| `unreadTracking` | désactivé | Suivi des commentaires jamais vus (badge "NEW") |
| `highlightAuthorReplies` | désactivé | Met en valeur les commentaires de l'auteur·ice de la fic |
| `highlightRepliesToMe` | activé | Met en valeur les réponses à mes propres commentaires |
| `authorFilterMode` | `off` | Cacher ou n'afficher que les commentaires de l'auteur·ice |
| `customHighlights` | (vide) | Pseudos ou mots-clés personnalisés à surligner (séparés par des virgules) |
| `jumpToCommentsButton` | désactivé | Bouton pour sauter directement aux commentaires |
| `commentSearchBox` | activé | Barre de recherche dans les commentaires, avec navigation entre résultats |
| `floatingNavPanel` | désactivé | Panneau flottant premier/précédent/suivant/dernier fil + saut de page + raccourcis clavier |
| `chapterIndicator` | activé | Badge "Ch N" sur les commentaires de la boîte de réception |
| `guestCommentsDefault` | désactivé | Coche par défaut "Allow guest comments" en créant une nouvelle fic |
| `commentDensity` | `normal` | Densité d'affichage des commentaires (compact/normal/spacieux) |

## Fichiers

### 1. `_commentKit.js` — le chef d'orchestre

- Met en route les six autres fichiers de fonctionnalités de ce module
- Chaque sous-module s'enregistre avec `parent: 'commentKit'` et est démarré/arrêté automatiquement par la cascade du cycle de vie
- Centralise la logique des modèles, brouillons, surlignages, recherches, sauts de page, et la détection du pseudo connecté (`getCurrentUsername()`, réutilisée par `commentComposing.js` et `commentHighlighting.js`)
- Les réglages partagés vivent dans `navigate-interact/commentKit-config.js` ; tous les sous-modules, y compris `commentConfiguration.js`, lisent la même clé de stockage partagée `ao3h:mod:commentKit:settings` (voir Détails techniques)

### 2. `commentComposing.js` — outils de rédaction

- Ajoute une barre d'outils (Gras, Italique, Souligné, Barré, Lien, Citation) au-dessus de la zone de commentaire, avec des raccourcis clavier
- Propose des modèles de texte prêts à insérer en un clic, personnalisables, avec recherche et variables `{title}`/`{author}` remplies automatiquement
- Un bouton "Preview" montre à quoi ressemblera le commentaire une fois publié, avec une mention "Posting as Guest"/"Posting as toi" selon le mode
- Sélectionner du texte de la fic en la lisant propose un bouton pour le citer directement dans le commentaire principal

### 3. `draftManagement.js` — brouillons et confort d'écriture

- Sauvegarde automatiquement ce qu'on est en train d'écrire, un brouillon distinct par formulaire (commentaire principal et chaque réponse en cours), et le restaure si on recharge la page
- Efface tout seul les brouillons trop vieux (plus de 30 jours)
- Affiche un compteur de mots et de caractères en direct
- Peut afficher une boîte de commentaire flottante et déplaçable quand le vrai formulaire n'est plus visible à l'écran

### 4. `commentNavigation.js` — accès rapide aux commentaires

- Ajoute un bouton qui montre le nombre de commentaires et fait défiler directement jusqu'à eux
- Ajoute un bouton "↑ Back to top" après la section des commentaires
- Barre de recherche dans les commentaires, avec surlignage et navigation entre résultats
- Panneau flottant de navigation entre fils de discussion (premier/précédent/suivant/dernier), saut direct à une page de commentaires, et raccourcis clavier

### 5. `commentHighlighting.js` — mettre en valeur certains commentaires

- Ajoute une bordure de couleur et un badge "Author" sur les commentaires de l'auteur de la fic
- Ajoute un badge sur les réponses directes à un de tes propres commentaires
- Peut cacher ou n'afficher que les commentaires de l'auteur·ice
- Surligne les commentaires d'un pseudo ou contenant un mot-clé choisi soi-même

### 6. `threadManagement.js` — gérer les fils de discussion

- Permet de replier ou déplier chaque commentaire principal, avec des boutons pour tout replier ou tout déplier d'un coup
- Peut replier automatiquement les fils ayant beaucoup de réponses (seuil réglable), tout en respectant un repli/dépli manuel déjà choisi pour un fil précis
- Bouton "❝ Reply" par commentaire pour citer son contenu dans sa propre réponse — clique le lien natif "Reply" d'AO3 pour révéler son formulaire (AO3 l'injecte via sa propre requête AJAX, donc le sous-module attend brièvement l'apparition de la zone de texte), puis pré-remplit une citation de l'auteur et d'un extrait du commentaire
- Marque les commentaires jamais vus avec un badge "NEW", avec un bouton pour tout marquer comme lu

### 7. `commentConfiguration.js` — petits réglages annexes

- Affiche un badge "Ch N" sur les commentaires de la boîte de réception, pour savoir à quel chapitre ils correspondent
- Coche automatiquement l'option "Allow guest comments" en créant une nouvelle fic
- Applique la densité d'affichage choisie (compact/normal/spacieux) aux commentaires

### 8. `commentKit.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Une fonction "citer et répondre" pour reprendre un commentaire dans sa réponse~~ ✅ Fait — bouton "❝ Reply" sur chaque commentaire (`threadManagement.js`), réglage `showQuoteReplyButton`
- ~~Chercher un mot dans tous les commentaires d'une œuvre~~ ✅ Fait — barre de recherche avec surlignage et navigation entre résultats, réglage `commentSearchBox`
- ~~Un aperçu différent selon si on est connecté ou si on commente en tant qu'invité~~ ✅ Fait — l'aperçu affiche désormais "Posting as Guest: ..." ou "Posting as [pseudo]"
- ~~Des catégories de modèles avec des espaces à remplir (comme le titre de la fic ou le nom de l'auteur)~~ ✅ Fait (partiel) — les variables `{title}`/`{author}` sont remplies automatiquement à l'insertion ; les catégories formelles ont été remplacées par la recherche de modèles (item suivant) pour éviter un changement de format de stockage qui aurait cassé les modèles déjà sauvegardés par les utilisateurs
- ~~Chercher parmi ses propres modèles de commentaires~~ ✅ Fait — champ de recherche dans le panneau de modèles (visible à partir de 6 modèles)
- ~~De petits bouts de texte tout prêts à insérer rapidement~~ ✅ Fait (déjà le cas) — c'est exactement ce que fait le panneau de modèles rapides (`showQuickTemplates`) depuis toujours
- ~~Des réponses automatiques selon des règles précises~~ ❌ Écarté — publier ou pré-remplir un commentaire sans relecture humaine va à l'encontre de l'esprit d'AO3, même raisonnement que le générateur de commentaire aléatoire déjà écarté
- ~~Des modèles qui se remplissent tout seuls avec le titre de la fic ou le nom de l'auteur~~ ✅ Fait — variables `{title}`/`{author}`, voir plus haut
- ~~Plusieurs brouillons en même temps pour un même commentaire~~ ✅ Fait — chaque formulaire (commentaire principal, chaque réponse) a désormais sa propre clé de brouillon ; c'était en fait un bug réel : deux formulaires ouverts en même temps se partageaient auparavant le même brouillon et s'écrasaient l'un l'autre
- ~~Changer la densité d'affichage des commentaires (compact/normal/spacieux)~~ ✅ Fait — réglage `commentDensity`
- ~~Cacher ou n'afficher que les commentaires de l'auteur·ice~~ ✅ Fait — réglage `authorFilterMode`
- ~~Un panneau de navigation flottant pour sauter au premier/dernier/prochain fil de discussion~~ ✅ Fait — réglage `floatingNavPanel`
- ~~Une mini-carte visuelle qui montre où se trouvent le plus de commentaires sur la page~~ ❌ Écarté — complexité disproportionnée pour une simple liste de commentaires ; le panneau de navigation flottant (item précédent) couvre déjà le besoin pratique de se déplacer entre fils sans nécessiter une carte visuelle
- ~~Un raccourci pour aller directement à une page précise, quand les commentaires sont répartis sur plusieurs pages~~ ✅ Fait — champ de saut de page dans le panneau de navigation flottant
- ~~Pouvoir surligner les commentaires de pseudos ou de mots-clés choisis soi-même, pas juste l'auteur ou les réponses à soi~~ ✅ Fait — réglage `customHighlights`
- ~~Un bouton pour mettre en forme des listes (à puces ou numérotées) dans la barre d'outils~~ ❌ Écarté — AO3 ne permet pas les balises de liste HTML dans les commentaires (voir la liste blanche déjà utilisée par l'aperçu du module, qui ne les inclut pas) ; les insérer serait soit supprimé, soit affiché comme texte brut trompeur
- ~~Un bouton pour souligner le texte dans la barre d'outils~~ ✅ Fait — l'aperçu autorisait déjà `<u>`, il ne manquait que le bouton ; un bouton Barré (`<s>`, déjà autorisé aussi) a été ajouté au passage
- ~~Sélectionner du texte de la fic en la lisant pour l'ajouter automatiquement en citation dans le brouillon de commentaire~~ ✅ Fait — réglage `quoteFicSelection`
- ~~Pouvoir déplacer la boîte de commentaire flottante avec la souris~~ ✅ Fait — glisser-déposer par l'en-tête, position mémorisée
- ~~Replier automatiquement les fils de discussion qui ont beaucoup de réponses, sans avoir à cliquer soi-même~~ ✅ Fait — réglage `autoCollapseThreshold`, une préférence manuelle déjà choisie sur un fil précis reste toujours prioritaire
- ~~Des raccourcis clavier pour naviguer d'un commentaire à l'autre~~ ✅ Fait — Alt+↑/↓ (avec `floatingNavPanel`)
- ~~Analyser le texte de la fic elle-même (par exemple repérer un moment fort de l'histoire) pour proposer un commentaire adapté à ce passage précis et au ton de la fic, en s'inspirant aussi de tes propres commentaires passés — pas juste un modèle générique à remplir~~ ❌ Écarté — nécessiterait un service d'analyse par IA, déjà écarté ailleurs dans le projet pour rester local et simple
- ~~Voir l'impact de ses propres commentaires, par exemple combien de réponses ils ont reçues, en lien avec le suivi de ta lecture~~ ❌ Écarté — même idée que "Des statistiques sur ses propres commentaires", déjà explicitement écartée ci-dessous

## Explicitement écarté

- Insérer des GIF dans un commentaire — jugé contraire à l'esprit d'AO3
- Un générateur de commentaire gentil au hasard — jugé gadget
- Un sélecteur d'émojis — jugé peu utilisé
- Des statistiques sur ses propres commentaires
- Une boîte flottante à part, juste pour prendre des notes libres — la boîte de commentaire flottante avec sauvegarde automatique suffit déjà
- Des réponses automatiques générées selon des règles — publier sans relecture humaine va à l'encontre de l'esprit d'AO3
- Une analyse du texte de la fic par IA pour suggérer un commentaire adapté — reste local et simple, pas de service d'IA externe
- Des boutons de mise en forme de listes dans la barre d'outils — AO3 n'autorise pas les balises de liste dans les commentaires
- Une mini-carte visuelle des commentaires — complexité disproportionnée, déjà couvert par le panneau de navigation flottant

## Précision

⚠️ La doc historique anglaise décrit une organisation du code bien plus
désordonnée que la réalité actuelle (fonctionnalités rangées dans les
mauvais fichiers, deux systèmes de réglages séparés). Le code actuel est
propre : 6 fichiers correctement nommés, un seul jeu de réglages partagé
par tous, y compris `commentConfiguration.js`.

⚠️ Une autre doc historique affirme que le repli global des fils de
discussion ("Collapse all" / "Expand all") n'a jamais été codé. C'est
faux : ces boutons existent bel et bien dans `threadManagement.js`.

## Corrections apportées à des fonctionnalités déjà existantes

La recherche dans les commentaires (`commentNavigation.js`) avait une
vraie faille XSS : `highlightMatches()` réinjectait le texte déjà décodé
d'un commentaire (potentiellement écrit par n'importe qui) directement en
HTML pour y dessiner le surlignage, sans échappement. N'importe quel
commentaire contenant des caractères `<`/`>` littéraux (même un simple
"<3") faisait planter le rendu une fois recherché ; un commentaire conçu
avec du contenu type balise HTML aurait pu être réellement exécuté comme
script chez qui que ce soit utilisant la recherche. Corrigé en échappant
le texte avant d'y insérer le surlignage (`escapeHtml`, déjà utilisé
ailleurs dans le projet pour ce même type de bug).

## Détails techniques

- Brouillons (`draftManagement.js`) : `ao3h:draft:{workId}` pour le formulaire principal, `ao3h:draft:{workId}:{commentId}` pour une réponse imbriquée sous ce commentaire — chaque formulaire a sa propre clé depuis la correction du bug de partage mentionnée dans les Specs
- Position de la boîte flottante : `ao3h:commentKit:floatingBoxPos`
- Repli des fils (`threadManagement.js`) : `{ manual: { [id]: true|false } }` par œuvre, migré automatiquement depuis l'ancien format `{ collapsed: [ids] }`
- Liste blanche HTML de l'aperçu (`commentComposing.js`) : `b, i, em, strong, a, blockquote, p, br, u, s` — c'est cette liste qui justifie plusieurs décisions "Écarté" ci-dessus (pas de listes à puces/numérotées, par exemple) ; tous les attributs sont retirés des balises autorisées (seul un `href` validé — `http(s):`, `mailto:`, relatif, ou ancre — survit sur un `<a>`), pour empêcher un gestionnaire d'événement ou un lien `javascript:` de passer inaperçu dans l'aperçu
- Raccourcis clavier : `Ctrl+B`/`Ctrl+I`/`Ctrl+K` (gras/italique/lien) dans la barre d'outils, `Ctrl+J` pour sauter aux commentaires, `Alt+↓`/`Alt+↑` pour le fil suivant/précédent (choisis pour ne pas entrer en conflit avec `Ctrl+J`)
