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



AO3 Helper - Comment Kit Module Coordinator
    Module ID: commentKit
    Display Name: Comment Kit
    Tab: Navigate & Interact

    Coordinator role:
        Pure coordinator — registers the parent module and scopes shared
        settings. Each submodule self-registers with parent: 'commentKit'
        and is booted/stopped by the lifecycle cascade.

    Submodules:
        commentComposing      — formatting toolbar + templates
        commentNavigation     — jump-to-comments button
        commentHighlighting   — author reply & reply-to-me highlights
        draftManagement       — auto-save drafts + character counter
        threadManagement      — collapse/expand threads + unread tracking
        commentConfiguration  — chapter badge on inbox + guest default

    Settings (panel: navigate-interact/commentKit-config.js):
        showFormattingToolbar   [default: true]
        showQuickTemplates      [default: true]
        enableAutoSave          [default: true]
        realtimeCounter         [default: true]
        highlightAuthorReplies  [default: true]
        highlightRepliesToMe    [default: false]
        jumpToCommentsButton    [default: true]
        collapseExpandButtons   [default: true]
        unreadTracking          [default: false]




AO3 Helper - Comment Composing Submodule
    Submodule ID: commentComposing
    Parent Module: commentKit
    Display Name: Comment Composing

    - Feature: Formatting toolbar
      - Bold, Italic, Link, Quote buttons above comment textarea
      - Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link)
      - Wraps selected text or inserts placeholder at cursor

    - Feature: Comment templates panel
      - Quick-insert template buttons below the toolbar
      - Default templates (praise, appreciation, encouragement)
      - Templates persisted in localStorage

    - Feature: Comment templates management
      - "Manage templates" button opens CRUD panel
      - Add / edit / remove custom templates
      - Controlled independently from quick-insert row

    - Feature: Comment preview
      - "Preview" button below the textarea
      - Toggles a read-only rendered HTML preview of the comment
      - Sanitised: only renders allowed AO3 HTML tags (b, i, a, blockquote, p, br)

    Settings (read from parent commentKit panel):
        showFormattingToolbar  [default: true]
        showQuickTemplates     [default: true]
        commentTemplates       [default: true]
        enablePreview          [default: true]



        AO3 Helper - Comment Configuration Submodule
    Submodule ID: commentConfiguration
    Parent Module: commentKit
    Display Name: Comment Configuration

    - Feature: Chapter indicator on inbox comments
      - Adds a "Ch N" badge to inbox comment headings that link to a chapter
      - Lets users quickly see which chapter a comment refers to

    - Feature: Default "Allow guest comments" on work posting forms
      - Auto-ticks the "Allow guest comments" checkbox when creating/editing a work
      - Only active on new-work and edit-work pages

    Settings (own storage key ao3h:mod:commentConfiguration:settings):
        chapterIndicator      [default: true]
        guestCommentsDefault  [default: false]


        AO3 Helper - Comment Highlighting Submodule
    Submodule ID: commentHighlighting
    Parent Module: commentKit
    Display Name: Comment Highlighting

    - Feature: Highlight author replies
      - Detects work author username(s) from the work byline
      - Adds a coloured left-border + "Author" badge to each author comment
      - Works on all comment threads on the work page

    - Feature: Highlight replies to my comments
      - Detects the logged-in username from the AO3 header
      - Marks comments that are direct replies to the current user's comments
      - Adds a "↩ Reply to you" badge

    Settings (read from parent commentKit panel):
        highlightAuthorReplies  [default: true]
        highlightRepliesToMe    [default: false]



        AO3 Helper - Comment Navigation Submodule
    Submodule ID: commentNavigation
    Parent Module: commentKit
    Display Name: Comment Navigation

    - Feature: Jump to comments button
      - "💬 Jump to Comments (N)" button injected into work action toolbar
      - Shows AO3 comment count from the stats block
      - Smooth scroll to the comments section
      - "↑ Back to top" button appended after comments section
      - Keyboard shortcut: Ctrl+J

    Settings (read from parent commentKit panel):
        jumpToCommentsButton  [default: true]


        AO3 Helper - Draft Management Submodule
    Submodule ID: draftManagement
    Parent Module: commentKit
    Display Name: Draft Management

    - Feature: Auto-save comment drafts
      - Auto-save as you type (500 ms debounce)
      - Per-work localStorage persistence (key: ao3h:draft:{workId})
      - Draft restored on page reload with a dismissable notification (auto-dismiss 10s)
      - Draft cleared automatically after successful form submit
      - Old drafts (>30 days) cleaned up on init

    - Feature: Real-time character / word counter
      - Live "N chars · N words" display below each comment textarea
      - Updates on every keystroke

    - Feature: Floating comment box
      - Sticky panel fixed at bottom-right of the viewport
      - Appears when the native comment form scrolls out of view
      - Two-way sync with the real textarea
      - "Post Comment" button submits the real form
      - Minimize / expand toggle

    Settings (read from parent commentKit panel):
        enableAutoSave   [default: true]
        realtimeCounter  [default: true]
        showFloatingBox  [default: false]


        AO3 Helper - Thread Management Submodule
    Submodule ID: threadManagement
    Parent Module: commentKit
    Display Name: Thread Management

    - Feature: Collapse / expand comment threads
      - Toggle button injected into each top-level comment's action bar
      - Hides/shows the nested reply thread (ol.thread inside the comment)
      - Collapsed state persisted per work in localStorage
      - "Collapse all" / "Expand all" buttons above the comments section
      - State auto-cleaned after 30 days

    - Feature: Read / unread tracking
      - Records all visible comment IDs on each visit (per work)
      - On the next visit, comments not seen before get a "NEW" badge
      - "Mark all as read" button injected above the comments section
      - Read markers expire after 30 days of inactivity

    Settings (read from parent commentKit panel):
        collapseExpandButtons  [default: true]
        unreadTracking         [default: false]



═══════════════════════════════════════════════════════════════════════════
  # commentKit
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Comment Kit** regroupe les outils liés à la rédaction, à la navigation et à la gestion des commentaires sur AO3.

Il permet notamment de :

* ajouter des outils de mise en forme à la zone de commentaire ;
* insérer des modèles de commentaires ;
* afficher un aperçu avant publication ;
* sauvegarder automatiquement les brouillons ;
* restaurer un brouillon après le rechargement de la page ;
* afficher un compteur de mots et de caractères ;
* utiliser une boîte de commentaire flottante pendant la lecture ;
* accéder rapidement à la section des commentaires ;
* mettre en évidence les commentaires de l’auteur de l’œuvre ;
* repérer les réponses adressées à l’utilisateur ;
* replier ou déplier les fils de discussion ;
* identifier les commentaires jamais vus ;
* afficher le chapitre associé à un commentaire dans la boîte de réception ;
* activer par défaut les commentaires d’invités lors de la publication d’une œuvre.

---

# Réglages utilisateur

| Réglage                  | Défaut    | Description                                                                                                    |
| ------------------------ | --------- | -------------------------------------------------------------------------------------------------------------- |
| `realtimeCounter`        | Activé    | Affiche un compteur de caractères et de mots actualisé en direct.                                              |
| `showFloatingBox`        | Désactivé | Affiche une boîte de commentaire flottante lorsque le formulaire principal n’est plus visible.                 |
| `enableAutoSave`         | Activé    | Sauvegarde automatiquement les brouillons et les restaure après un rechargement.                               |
| `enablePreview`          | Activé    | Ajoute un bouton permettant d’afficher un aperçu du commentaire avant sa publication.                          |
| `showFormattingToolbar`  | Activé    | Affiche une barre d’outils contenant les actions Gras, Italique, Lien et Citation.                             |
| `showQuickTemplates`     | Désactivé | Affiche une rangée de modèles de commentaires rapides.                                                         |
| `commentTemplates`       | Désactivé | Active les modèles personnalisés réutilisables et leur panneau de gestion.                                     |
| `collapseExpandButtons`  | Activé    | Ajoute des boutons permettant de replier ou de déplier les commentaires.                                       |
| `unreadTracking`         | Désactivé | Active le suivi des commentaires jamais vus et les badges `NEW`.                                               |
| `highlightAuthorReplies` | Désactivé | Met en évidence les commentaires publiés par l’auteur de l’œuvre.                                              |
| `highlightRepliesToMe`   | Activé    | Met en évidence les réponses directes aux commentaires de l’utilisateur.                                       |
| `jumpToCommentsButton`   | Désactivé | Ajoute un bouton permettant d’accéder directement aux commentaires.                                            |
| `chapterIndicator`       | Activé    | Affiche un badge `Ch N` sur les commentaires de la boîte de réception.                                         |
| `guestCommentsDefault`   | Désactivé | Coche automatiquement l’option **Allow guest comments** lors de la création ou de la modification d’une œuvre. |

Les anciennes spécifications techniques indiquent des valeurs par défaut différentes pour certains réglages :

| Réglage                  | Défaut indiqué dans les spécifications techniques |
| ------------------------ | ------------------------------------------------- |
| `showQuickTemplates`     | Activé                                            |
| `commentTemplates`       | Activé                                            |
| `highlightAuthorReplies` | Activé                                            |
| `highlightRepliesToMe`   | Désactivé                                         |
| `jumpToCommentsButton`   | Activé                                            |

La documentation principale et les spécifications techniques ne concordent donc pas sur ces valeurs par défaut.

---

# Structure du module

Le module est composé d’un fichier coordinateur, de six sous-modules fonctionnels et d’une feuille de style.

```text
_commentKit.js
commentComposing.js
draftManagement.js
commentNavigation.js
commentHighlighting.js
threadManagement.js
commentConfiguration.js
commentKit.css
```

---

# _commentKit.js

## Rôle

Fichier coordinateur du module.

Il enregistre le module parent, définit la portée des réglages partagés et laisse chaque sous-module gérer sa propre initialisation.

---

## Responsabilités

* Enregistre le module parent `commentKit`.
* Centralise les réglages communs.
* Charge les six sous-modules fonctionnels.
* Associe chaque sous-module au parent `commentKit`.
* Laisse le système de cycle de vie démarrer et arrêter automatiquement les sous-modules.
* Maintient une configuration unique partagée par l’ensemble du module.

---

## Détails techniques

Le coordinateur ne contient pas directement la logique des fonctionnalités.

Chaque sous-module :

* s’enregistre lui-même avec `parent: 'commentKit'` ;
* est démarré automatiquement par la cascade du système de cycle de vie ;
* est arrêté automatiquement lorsque le module parent est désactivé.

La configuration principale est définie dans :

```text
navigate-interact/commentKit-config.js
```

Les réglages propres à `commentConfiguration.js` utilisent toutefois une clé de stockage séparée.

---

# commentComposing.js

## Rôle

Gère les outils de rédaction, les modèles de commentaires et l’aperçu avant publication.

---

## Fonctionnalités

### Barre d’outils de mise en forme

Lorsque `showFormattingToolbar` est activé, le sous-module ajoute une barre d’outils au-dessus de la zone de commentaire.

Elle contient les actions suivantes :

* Gras ;
* Italique ;
* Lien ;
* Citation.

Les boutons peuvent :

* entourer le texte sélectionné avec la syntaxe appropriée ;
* insérer un texte de remplacement à la position du curseur lorsqu’aucun texte n’est sélectionné.

---

### Raccourcis clavier

La barre d’outils prend en charge les raccourcis suivants :

| Raccourci | Action   |
| --------- | -------- |
| `Ctrl+B`  | Gras     |
| `Ctrl+I`  | Italique |
| `Ctrl+K`  | Lien     |

---

### Modèles rapides

Lorsque `showQuickTemplates` est activé, une rangée de boutons permet d’insérer rapidement des commentaires prédéfinis.

Les modèles par défaut peuvent notamment correspondre à :

* un compliment ;
* un message d’appréciation ;
* un encouragement.

---

### Modèles personnalisés

Lorsque `commentTemplates` est activé, un bouton **Manage templates** ouvre un panneau de gestion.

Ce panneau permet de :

* créer un modèle ;
* modifier un modèle ;
* supprimer un modèle ;
* réutiliser les modèles personnalisés.

Les modèles sont enregistrés dans `localStorage`.

La gestion complète des modèles est contrôlée indépendamment de la simple rangée de modèles rapides.

---

### Aperçu du commentaire

Lorsque `enablePreview` est activé, un bouton **Preview** est ajouté sous la zone de commentaire.

Il permet d’afficher ou de masquer un aperçu HTML en lecture seule du commentaire.

---

## Détails techniques

L’aperçu est assaini avant son affichage.

Seules certaines balises HTML acceptées par AO3 sont conservées, notamment :

```text
b
i
a
blockquote
p
br
```

Le sous-module est enregistré sous :

```text
commentComposing
```

Son nom d’affichage est :

```text
Comment Composing
```

---

## Dépendances

* `_commentKit.js`
* la configuration partagée de `commentKit`
* `localStorage`
* les formulaires de commentaires AO3

---

# draftManagement.js

## Rôle

Gère la sauvegarde des brouillons, le compteur de texte et la boîte de commentaire flottante.

---

## Fonctionnalités

### Sauvegarde automatique

Lorsque `enableAutoSave` est activé, le contenu de chaque zone de commentaire est sauvegardé automatiquement pendant la saisie.

La sauvegarde utilise un délai de 500 millisecondes après la dernière modification.

---

### Brouillons séparés par œuvre

Chaque brouillon est associé à l’identifiant de l’œuvre concernée.

La clé utilisée est :

```text
ao3h:draft:{workId}
```

---

### Restauration après rechargement

Lorsqu’un brouillon existe, il est restauré automatiquement au chargement de la page.

Une notification indique qu’un brouillon a été récupéré.

Cette notification :

* peut être fermée manuellement ;
* disparaît automatiquement après 10 secondes.

---

### Suppression après publication

Lorsqu’un commentaire est publié avec succès, le brouillon correspondant est automatiquement supprimé.

---

### Nettoyage des anciens brouillons

Les brouillons datant de plus de 30 jours sont automatiquement supprimés lors de l’initialisation du sous-module.

---

### Compteur en temps réel

Lorsque `realtimeCounter` est activé, un compteur est affiché sous chaque zone de commentaire.

Il utilise une présentation comparable à :

```text
N chars · N words
```

Le compteur est actualisé à chaque frappe.

---

### Boîte de commentaire flottante

Lorsque `showFloatingBox` est activé, une boîte flottante apparaît lorsque le formulaire natif sort de la zone visible de la page.

Elle reste fixée dans le coin inférieur droit de la fenêtre.

---

### Synchronisation des zones de texte

La boîte flottante et la zone de commentaire originale restent synchronisées dans les deux sens.

Une modification effectuée dans l’une est immédiatement reproduite dans l’autre.

---

### Publication depuis la boîte flottante

Le bouton **Post Comment** de la boîte flottante soumet le véritable formulaire AO3.

---

### Réduction de la boîte

La boîte flottante peut être :

* réduite ;
* déployée.

---

## Détails techniques

Le sous-module est enregistré sous :

```text
draftManagement
```

Son nom d’affichage est :

```text
Draft Management
```

---

## Dépendances

* `_commentKit.js`
* `localStorage`
* les formulaires de commentaires AO3
* le formulaire natif de publication

---

# commentNavigation.js

## Rôle

Facilite les déplacements entre le contenu de l’œuvre et la section des commentaires.

---

## Fonctionnalités

### Bouton d’accès aux commentaires

Lorsque `jumpToCommentsButton` est activé, le sous-module ajoute dans la barre d’actions de l’œuvre un bouton comparable à :

```text
💬 Jump to Comments (N)
```

Le nombre `N` correspond au nombre de commentaires affiché dans les statistiques AO3.

---

### Défilement vers les commentaires

Un clic sur le bouton fait défiler progressivement la page jusqu’à la section des commentaires.

---

### Retour en haut

Un bouton :

```text
↑ Back to top
```

est ajouté après la section des commentaires.

Il permet de revenir rapidement en haut de la page.

---

### Raccourci clavier

Le raccourci suivant permet également d’accéder aux commentaires :

```text
Ctrl+J
```

---

## Détails techniques

Le sous-module lit le nombre de commentaires dans le bloc de statistiques AO3.

Il est enregistré sous :

```text
commentNavigation
```

Son nom d’affichage est :

```text
Comment Navigation
```

---

## Dépendances

* `_commentKit.js`
* la barre d’actions des pages d’œuvres
* le bloc de statistiques AO3
* la section des commentaires

---

# commentHighlighting.js

## Rôle

Met en évidence les commentaires de l’auteur et les réponses directement adressées à l’utilisateur.

---

## Fonctionnalités

### Commentaires de l’auteur

Lorsque `highlightAuthorReplies` est activé, le sous-module détecte le ou les noms d’utilisateur de l’auteur à partir de la signature de l’œuvre.

Il applique ensuite aux commentaires correspondants :

* une bordure colorée sur le côté gauche ;
* un badge `Author`.

Cette fonctionnalité agit sur tous les fils de commentaires de la page de l’œuvre.

---

### Réponses à l’utilisateur

Lorsque `highlightRepliesToMe` est activé, le sous-module détecte le nom du compte connecté à partir de l’en-tête AO3.

Il identifie ensuite les commentaires qui répondent directement à un commentaire publié par cet utilisateur.

Ces réponses reçoivent un badge :

```text
↩ Reply to you
```

---

## Détails techniques

Le sous-module est enregistré sous :

```text
commentHighlighting
```

Son nom d’affichage est :

```text
Comment Highlighting
```

---

## Dépendances

* `_commentKit.js`
* la signature de l’œuvre ;
* le nom d’utilisateur affiché dans l’en-tête AO3 ;
* la structure des fils de commentaires.

---

# threadManagement.js

## Rôle

Gère le repli des fils de discussion et le suivi des commentaires déjà vus.

---

## Fonctionnalités

### Repli d’un fil individuel

Lorsque `collapseExpandButtons` est activé, un bouton est ajouté dans la barre d’actions de chaque commentaire principal.

Il permet de masquer ou d’afficher les réponses imbriquées contenues dans :

```text
ol.thread
```

---

### Persistance du repli

L’état replié ou déplié est enregistré séparément pour chaque œuvre.

Les états conservés depuis plus de 30 jours sont automatiquement supprimés.

---

### Repli global

Le sous-module ajoute au-dessus de la section des commentaires deux boutons :

```text
Collapse all
Expand all
```

Ils permettent de replier ou de déplier tous les fils de discussion en une seule action.

---

### Suivi des commentaires non lus

Lorsque `unreadTracking` est activé, le sous-module enregistre les identifiants de tous les commentaires visibles lors d’une visite.

À la visite suivante, les commentaires qui n’avaient encore jamais été vus reçoivent un badge :

```text
NEW
```

---

### Marquer tous les commentaires comme lus

Un bouton **Mark all as read** est ajouté au-dessus de la section des commentaires.

Il enregistre tous les commentaires actuellement affichés comme déjà vus.

---

### Expiration des marqueurs

Les données de lecture qui n’ont pas été utilisées depuis plus de 30 jours sont automatiquement supprimées.

---

## Détails techniques

Le suivi est enregistré séparément pour chaque œuvre.

Le sous-module est enregistré sous :

```text
threadManagement
```

Son nom d’affichage est :

```text
Thread Management
```

---

## Dépendances

* `_commentKit.js`
* `localStorage`
* les commentaires principaux ;
* les fils imbriqués `ol.thread`.

---

# commentConfiguration.js

## Rôle

Gère les réglages annexes liés à la boîte de réception et aux formulaires de publication des œuvres.

---

## Fonctionnalités

### Indicateur de chapitre

Lorsque `chapterIndicator` est activé, le sous-module ajoute un badge :

```text
Ch N
```

aux titres des commentaires affichés dans la boîte de réception.

Le nombre `N` correspond au chapitre lié par le commentaire.

Cette information permet de repérer rapidement le chapitre auquel une réponse se rapporte.

---

### Commentaires d’invités par défaut

Lorsque `guestCommentsDefault` est activé, le sous-module coche automatiquement :

```text
Allow guest comments
```

sur les formulaires de publication.

La fonctionnalité agit uniquement sur :

* les pages de création d’une œuvre ;
* les pages de modification d’une œuvre.

---

## Détails techniques

Contrairement aux autres sous-modules, ses réglages sont enregistrés sous une clé propre :

```text
ao3h:mod:commentConfiguration:settings
```

Le sous-module est enregistré sous :

```text
commentConfiguration
```

Son nom d’affichage est :

```text
Comment Configuration
```

---

## Dépendances

* `_commentKit.js`
* les commentaires de la boîte de réception AO3 ;
* les formulaires de création et de modification d’œuvres.

---

# commentKit.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Comment Kit**.

Il définit notamment l’apparence :

* de la barre d’outils de mise en forme ;
* des boutons de modèles ;
* du panneau de gestion des modèles ;
* de l’aperçu du commentaire ;
* des notifications de restauration de brouillon ;
* des compteurs de caractères et de mots ;
* de la boîte de commentaire flottante ;
* des boutons de navigation ;
* des badges `Author` ;
* des badges `↩ Reply to you` ;
* des boutons de repli ;
* des badges `NEW` ;
* des boutons globaux de gestion des fils ;
* des badges de chapitre.

---

# Fonctionnalités non implémentées

## Citer et répondre

Ajouter une action permettant de reprendre automatiquement le texte d’un commentaire dans une réponse.

---

## Recherche dans les commentaires

Permettre de rechercher un mot ou une expression dans tous les commentaires d’une œuvre.

---

## Aperçu selon le type d’utilisateur

Afficher un aperçu différent selon que le commentaire sera publié :

* par un compte connecté ;
* par un invité.

---

## Catégories de modèles

Classer les modèles de commentaires dans différentes catégories.

Ces modèles pourraient contenir des espaces à remplir, notamment :

* le titre de l’œuvre ;
* le nom de l’auteur ;
* d’autres informations personnalisées.

---

## Recherche dans les modèles

Ajouter une barre de recherche dans les modèles personnels.

---

## Fragments de texte

Proposer de petits extraits de texte réutilisables à insérer rapidement dans un commentaire.

---

## Réponses automatiques

Générer ou insérer automatiquement une réponse lorsque certaines règles précises sont remplies.

---

## Modèles remplis automatiquement

Remplacer automatiquement certaines variables d’un modèle par :

* le titre de l’œuvre ;
* le nom de l’auteur ;
* d’autres informations de la page.

---

## Brouillons multiples

Conserver plusieurs brouillons distincts pour un même commentaire.

---

## Densité des commentaires

Permettre de choisir une densité d’affichage :

* compacte ;
* normale ;
* spacieuse.

---

## Filtrage des commentaires de l’auteur

Permettre de :

* masquer les commentaires de l’auteur ;
* afficher uniquement les commentaires de l’auteur.

---

## Navigation flottante

Ajouter un panneau flottant permettant d’accéder rapidement :

* au premier fil ;
* au dernier fil ;
* au fil précédent ;
* au fil suivant.

---

## Carte des commentaires

Afficher une mini-carte indiquant les zones de la page qui contiennent le plus de commentaires.

---

## Accès direct à une page

Ajouter un contrôle permettant d’accéder directement à une page précise lorsque les commentaires sont répartis sur plusieurs pages.

---

## Surlignage personnalisé

Permettre de mettre en évidence les commentaires correspondant :

* à certains noms d’utilisateur ;
* à certains mots-clés.

Le système actuel se limite à l’auteur de l’œuvre et aux réponses adressées à l’utilisateur.

---

## Listes dans la barre d’outils

Ajouter des boutons permettant de créer :

* une liste à puces ;
* une liste numérotée.

---

## Soulignement

Ajouter un bouton permettant de souligner le texte dans la barre d’outils.

---

## Citation depuis le texte de l’œuvre

Permettre de sélectionner un passage de l’œuvre afin de l’insérer automatiquement comme citation dans le brouillon.

---

## Déplacement de la boîte flottante

Permettre de déplacer la boîte de commentaire flottante avec la souris.

---

## Repli automatique des longs fils

Replier automatiquement les fils contenant un grand nombre de réponses.

---

## Navigation au clavier

Ajouter des raccourcis clavier permettant de passer d’un commentaire à l’autre.

---

## Suggestions contextuelles avancées

Analyser le texte de l’œuvre afin de repérer un passage important et de proposer un commentaire adapté :

* au passage sélectionné ;
* au ton de l’œuvre ;
* aux commentaires antérieurs de l’utilisateur.

Cette fonctionnalité irait au-delà des modèles génériques actuellement disponibles.

---

## Impact des commentaires

Afficher des informations sur les réactions reçues par les commentaires de l’utilisateur, notamment le nombre de réponses, en relation avec son activité de lecture.

---

# Décisions de conception

## GIF dans les commentaires

Le module ne propose pas d’outil permettant d’insérer des GIF.

Cette fonctionnalité a été jugée contraire à l’esprit d’AO3.

---

## Générateur de commentaire aléatoire

Le module ne génère pas automatiquement un commentaire positif choisi au hasard.

Cette fonctionnalité a été jugée gadget.

---

## Sélecteur d’émojis

Le module ne contient pas de sélecteur d’émojis.

Cet outil a été jugé peu utilisé.

---

## Statistiques de commentaires

Le module ne produit pas de statistiques générales sur les commentaires publiés par l’utilisateur.

---

## Boîte de notes distincte

Le module n’ajoute pas une seconde boîte flottante uniquement destinée à des notes libres.

La boîte de commentaire flottante et son système de sauvegarde automatique sont considérés comme suffisants.

---

# Précision historique

Une ancienne documentation décrivait une organisation dans laquelle :

* certaines fonctionnalités se trouvaient dans les mauvais fichiers ;
* deux systèmes de réglages distincts coexistaient.

Cette description est désormais obsolète.

Le code actuel contient six sous-modules correctement séparés selon leurs responsabilités et un ensemble principal de réglages partagé.

`commentConfiguration.js` conserve toutefois sa propre clé de stockage pour ses deux réglages spécifiques.

Une autre ancienne documentation affirmait que les contrôles globaux :

```text
Collapse all
Expand all
```

n’avaient jamais été implémentés.

Cette affirmation est incorrecte.

Les deux boutons existent dans `threadManagement.js` et permettent de replier ou de déplier tous les fils de discussion en une seule action.
