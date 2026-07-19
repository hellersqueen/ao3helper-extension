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
- Bouton "❝ Reply" par commentaire pour citer son contenu dans sa propre réponse
- Marque les commentaires jamais vus avec un badge "NEW", avec un bouton pour tout marquer comme lu

### 7. `commentConfiguration.js` — petits réglages annexes

- Affiche un badge "Ch N" sur les commentaires de la boîte de réception, pour savoir à quel chapitre ils correspondent
- Coche automatiquement l'option "Allow guest comments" en créant une nouvelle fic
- Applique la densité d'affichage choisie (compact/normal/spacieux) aux commentaires

### 8. `commentKitHelpers.js` — logique pure

- Substitution de variables dans les modèles, recherche de modèles, calcul de la clé de brouillon par formulaire, règle de repli automatique avec préférence manuelle, correspondance de surlignage personnalisé, recherche dans les commentaires, construction de l'URL de saut de page — testé indépendamment du DOM

### 9. `commentKit.css`

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
        quoteFicSelection       [default: true]   -- Chantier 4
        autoCollapseThreshold   [default: '0']    -- Chantier 4
        showQuoteReplyButton    [default: true]   -- Chantier 4
        authorFilterMode        [default: 'off']  -- Chantier 4
        customHighlights        [default: '']     -- Chantier 4
        commentSearchBox        [default: true]   -- Chantier 4
        floatingNavPanel        [default: false]  -- Chantier 4
        commentDensity          [default: 'normal'] -- Chantier 4

    Pure-logic helper (no DOM, no storage), added Chantier 4:
        commentKitHelpers.js -- fillTemplateVariables(), filterTemplates(),
                                 draftKeyFor()/draftScopeForForm(),
                                 shouldAutoCollapse(), parseHighlightRules()/
                                 matchesCustomHighlight(), matchesSearch(),
                                 buildPageJumpUrl()




AO3 Helper - Comment Composing Submodule
    Submodule ID: commentComposing
    Parent Module: commentKit
    Display Name: Comment Composing

    - Feature: Formatting toolbar
      - Bold, Italic, Underline, Strikethrough, Link, Quote buttons above comment textarea
      - Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link)
      - Wraps selected text or inserts placeholder at cursor
      - Underline/Strikethrough (Chantier 4): the preview's tag whitelist
        already allowed <u>/<s>, only the toolbar buttons were missing

    - Feature: Comment templates panel
      - Quick-insert template buttons below the toolbar
      - Default templates (praise, appreciation, encouragement)
      - Templates persisted in localStorage
      - Chantier 4: {title}/{author} placeholders filled in at insertion time
        (fillTemplateVariables) — works for custom templates too
      - Chantier 4: search input filters the row once there are 6+ templates

    - Feature: Comment templates management
      - "Manage templates" button opens CRUD panel
      - Add / edit / remove custom templates
      - Controlled independently from quick-insert row

    - Feature: Comment preview
      - "Preview" button below the textarea
      - Toggles a read-only rendered HTML preview of the comment
      - Sanitised: only renders allowed AO3 HTML tags (b, i, em, strong, a,
        blockquote, p, br, u, s)
      - Chantier 4: shows "Posting as Guest: Name" or "Posting as username"
        above the preview, detected from the form's guest fields / AO3 header

    - Feature: Quote fic-text selection (Chantier 4)
      - cfg: quoteFicSelection
      - Selecting text inside the fic's prose (not inside a comment) shows a
        "❝ Quote in comment" popup near the selection
      - Inserts a <blockquote> of the selection into the main new-comment
        textarea and scrolls to it

    Settings (read from parent commentKit panel):
        showFormattingToolbar  [default: true]
        showQuickTemplates     [default: true]
        commentTemplates       [default: true]
        enablePreview          [default: true]
        quoteFicSelection      [default: true]  -- Chantier 4



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

    - Feature: Comment display density (Chantier 4)
      - cfg: commentDensity ('normal' | 'compact' | 'spacious')
      - Toggles a class on <html>, scoped CSS adjusts li.comment padding/line-height
      - Reset to 'normal' on module stop

    Settings (own storage key ao3h:mod:commentConfiguration:settings):
        chapterIndicator      [default: true]
        guestCommentsDefault  [default: false]
        commentDensity        [default: 'normal']  -- Chantier 4


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

    - Feature: Author comments filter (Chantier 4)
      - cfg: authorFilterMode ('off' | 'hide' | 'only')
      - Toggles ao3h-filter-hidden on non-matching li.comment elements

    - Feature: Custom highlights (Chantier 4)
      - cfg: customHighlights (comma-separated usernames/keywords)
      - Matches a comment's author username or any word in its own text
      - Adds a coloured left-border + "★" badge (parseHighlightRules,
        matchesCustomHighlight)

    Settings (read from parent commentKit panel):
        highlightAuthorReplies  [default: true]
        highlightRepliesToMe    [default: false]
        authorFilterMode        [default: 'off']  -- Chantier 4
        customHighlights        [default: '']     -- Chantier 4



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

    - Feature: Comment search (Chantier 4)
      - cfg: commentSearchBox
      - Search input above the comments section; wraps matches in <mark>,
        prev/next buttons and a "N / M" counter (matchesSearch)

    - Feature: Floating thread-navigation panel (Chantier 4)
      - cfg: floatingNavPanel
      - First/Previous/Next/Last buttons over top-level comment threads
      - Page-jump number input when comments span multiple pages
        (buildPageJumpUrl)
      - Keyboard shortcuts: Alt+↓ next thread, Alt+↑ previous thread

    Settings (read from parent commentKit panel):
        jumpToCommentsButton  [default: true]
        commentSearchBox      [default: true]   -- Chantier 4
        floatingNavPanel      [default: false]  -- Chantier 4


        AO3 Helper - Draft Management Submodule
    Submodule ID: draftManagement
    Parent Module: commentKit
    Display Name: Draft Management

    - Feature: Auto-save comment drafts
      - Auto-save as you type (500 ms debounce)
      - Per-work, per-form localStorage persistence (key:
        ao3h:draft:{workId} for the main new-comment form, ao3h:draft:
        {workId}:{commentId} for a reply form nested under that comment) —
        Chantier 4: previously a single shared key per work meant two open
        forms (e.g. a reply plus the main box) silently overwrote each
        other's draft; each form now gets its own (draftKeyFor/
        draftScopeForForm)
      - Draft restored on page reload with a dismissable notification (auto-dismiss 10s)
      - Draft cleared automatically after successful form submit
      - Old drafts (>30 days) cleaned up on init

    - Feature: Real-time character / word counter
      - Live "N chars · N words" display below each comment textarea
      - Updates on every keystroke

    - Feature: Floating comment box
      - Sticky panel fixed at bottom-right of the viewport (or its last
        dragged position, remembered in ao3h:commentKit:floatingBoxPos)
      - Draggable by its header (Chantier 4)
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
      - Collapsed state persisted per work in localStorage as manual
        per-thread overrides (Chantier 4: { manual: { [id]: true|false } },
        migrated 1:1 from the legacy { collapsed: [ids] } array)
      - "Collapse all" / "Expand all" buttons above the comments section
      - State auto-cleaned after 30 days

    - Feature: Auto-collapse above a reply threshold (Chantier 4)
      - cfg: autoCollapseThreshold ('0' off, else a reply count)
      - shouldAutoCollapse(): a manual override always wins over the
        threshold, so expanding one specific busy thread sticks

    - Feature: Quote & reply (Chantier 4)
      - cfg: showQuoteReplyButton
      - "❝ Reply" button per comment: clicks AO3's own "Reply" link to
        reveal its native reply form (polls briefly for the textarea, since
        AO3 injects it via its own AJAX), then prefills a <blockquote>
        quoting the comment's author + a ~150-char excerpt

    - Feature: Read / unread tracking
      - Records all visible comment IDs on each visit (per work)
      - On the next visit, comments not seen before get a "NEW" badge
      - "Mark all as read" button injected above the comments section
      - Read markers expire after 30 days of inactivity

    Settings (read from parent commentKit panel):
        collapseExpandButtons  [default: true]
        unreadTracking         [default: false]
        autoCollapseThreshold  [default: '0']    -- Chantier 4
        showQuoteReplyButton   [default: true]   -- Chantier 4



═══════════════════════════════════════════════════════════════════════════
  # commentKit
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Comment Kit** regroupe les outils liés à la rédaction, à la navigation et à la gestion des commentaires sur AO3.

* Il permet notamment de :
  - ajouter des outils de mise en forme à la zone de commentaire ;
  - insérer des modèles de commentaires ;
  - afficher un aperçu avant publication ;
  - sauvegarder automatiquement les brouillons ;
  - restaurer un brouillon après le rechargement de la page ;
  - afficher un compteur de mots et de caractères ;
  - utiliser une boîte de commentaire flottante pendant la lecture ;
  - accéder rapidement à la section des commentaires ;
  - mettre en évidence les commentaires de l’auteur de l’œuvre ;
  - repérer les réponses adressées à l’utilisateur ;
  - replier ou déplier les fils de discussion ;
  - identifier les commentaires jamais vus ;
  - afficher le chapitre associé à un commentaire dans la boîte de réception ;
  - activer par défaut les commentaires d’invités lors de la publication d’une œuvre.

---

# Réglages utilisateur

| Réglage                  | Description                                                                                                    |
| ------------------------ |----------------------------------------------------------------------------------------------------------------|
| `realtimeCounter`        | Affiche un compteur de caractères et de mots actualisé en direct.                                              |
| `showFloatingBox`        | Affiche une boîte de commentaire flottante lorsque le formulaire principal n’est plus visible (déplaçable).    |
| `enableAutoSave`         | Sauvegarde automatiquement les brouillons et les restaure après un rechargement (un par formulaire).           |
| `enablePreview`          | Ajoute un bouton permettant d’afficher un aperçu du commentaire avant sa publication.                          |
| `showFormattingToolbar`  | Affiche une barre d’outils contenant les actions Gras, Italique, Souligné, Barré, Lien et Citation.            |
| `showQuickTemplates`     | Affiche une rangée de modèles de commentaires rapides.                                                         |
| `commentTemplates`       | Active les modèles personnalisés réutilisables et leur panneau de gestion.                                     |
| `quoteFicSelection`      | Propose de citer un passage de la fic sélectionné en lecture.                                                  |
| `collapseExpandButtons`  | Ajoute des boutons permettant de replier ou de déplier les commentaires.                                       |
| `autoCollapseThreshold`  | Replie automatiquement les fils comptant au moins ce nombre de réponses (`0` = désactivé).                     |
| `showQuoteReplyButton`   | Ajoute un bouton pour citer un commentaire dans sa réponse.                                                    |
| `unreadTracking`         | Active le suivi des commentaires jamais vus et les badges `NEW`.                                               |
| `highlightAuthorReplies` | Met en évidence les commentaires publiés par l’auteur de l’œuvre.                                              |
| `highlightRepliesToMe`   | Met en évidence les réponses directes aux commentaires de l’utilisateur.                                       |
| `authorFilterMode`       | Cache ou n’affiche que les commentaires de l’auteur·ice.                                                       |
| `customHighlights`       | Pseudos ou mots-clés personnalisés à surligner, séparés par des virgules.                                      |
| `jumpToCommentsButton`   | Ajoute un bouton permettant d’accéder directement aux commentaires.                                            |
| `commentSearchBox`       | Ajoute une barre de recherche dans les commentaires.                                                           |
| `floatingNavPanel`       | Ajoute un panneau flottant de navigation entre fils de discussion et pages de commentaires.                    |
| `chapterIndicator`       | Affiche un badge `Ch N` sur les commentaires de la boîte de réception.                                         |
| `guestCommentsDefault`   | Coche automatiquement l’option **Allow guest comments** lors de la création ou de la modification d’une œuvre. |
| `commentDensity`         | Définit la densité d’affichage des commentaires : compacte, normale ou spacieuse.                              |


La documentation principale et les spécifications techniques ne concordent donc pas sur ces valeurs par défaut.

---

# Structure du module

Le module est composé d’un fichier coordinateur, de six sous-modules fonctionnels, d’un fichier de logique pure et d’une feuille de style.

```text
_commentKit.js
commentComposing.js
draftManagement.js
commentNavigation.js
commentHighlighting.js
threadManagement.js
commentConfiguration.js
commentKitHelpers.js
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
* Souligné ;
* Barré ;
* Lien ;
* Citation.

Les boutons peuvent :

* entourer le texte sélectionné avec la syntaxe appropriée ;
* insérer un texte de remplacement à la position du curseur lorsqu’aucun texte n’est sélectionné.

Souligné et Barré ont été ajoutés au Chantier 4 : la liste blanche de l'aperçu autorisait déjà `<u>`/`<s>`, seuls les boutons manquaient.

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
* un encouragement ;
* un message personnalisé utilisant `{title}`/`{author}` (Chantier 4).

---

### Variables de modèle

Les modèles (par défaut ou personnalisés) peuvent contenir les variables `{title}` et `{author}`. Elles sont remplacées par le titre et l'auteur de l'œuvre actuelle au moment de l'insertion (`fillTemplateVariables`), pas au moment de la sauvegarde — le texte brut avec ses variables reste visible et modifiable dans le panneau de gestion.

---

### Recherche de modèles

À partir de 6 modèles enregistrés, un champ de recherche apparaît au-dessus de la rangée de boutons et filtre la liste par sous-chaîne insensible à la casse (`filterTemplates`).

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

Il permet d’afficher ou de masquer un aperçu HTML en lecture seule du commentaire, précédé d'une ligne indiquant le mode de publication : **Posting as Guest: Nom** (formulaire invité détecté) ou **Posting as pseudo** (utilisateur connecté, détecté depuis l'en-tête AO3).

---

### Citer un passage de la fic

Lorsque `quoteFicSelection` est activé, sélectionner du texte dans la prose de la fic (pas dans un commentaire) fait apparaître un petit bouton **❝ Quote in comment** près de la sélection. Un clic insère le passage sous forme de citation dans la zone de commentaire principale et y fait défiler la page.

---

## Détails techniques

L’aperçu est assaini avant son affichage.

Seules certaines balises HTML acceptées par AO3 sont conservées, notamment :

```text
b
i
em
strong
a
blockquote
p
br
u
s
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
* `commentKitHelpers.js` (variables de modèle, recherche de modèles)
* `lib/ao3/work-page.js` (titre et auteur de l'œuvre pour les variables)
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

### Brouillons séparés par œuvre... et par formulaire

Chaque brouillon est associé à l’identifiant de l’œuvre concernée, et — depuis le Chantier 4 — au formulaire précis dans lequel il est rédigé.

Les clés utilisées sont :

```text
ao3h:draft:{workId}                -- formulaire principal (nouveau commentaire)
ao3h:draft:{workId}:{commentId}    -- réponse imbriquée dans ce commentaire
```

**Correction de bug (Chantier 4) :** avant cette distinction, tous les formulaires d'une même œuvre partageaient la même clé. Ouvrir une réponse à un commentaire tout en ayant du texte dans le formulaire principal (ou dans une autre réponse) faisait que les deux brouillons s'écrasaient l'un l'autre silencieusement. `draftKeyFor()`/`draftScopeForForm()` (dans `commentKitHelpers.js`) déterminent le scope depuis le commentaire ancêtre le plus proche du formulaire.

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

Elle apparaît par défaut dans le coin inférieur droit de la fenêtre, ou à sa dernière position déplacée (voir ci-dessous).

---

### Déplacement de la boîte flottante

Depuis le Chantier 4, la boîte peut être déplacée en la faisant glisser par son en-tête. Sa position est mémorisée (`ao3h:commentKit:floatingBoxPos`) et réappliquée aux prochaines ouvertures.

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

### Recherche dans les commentaires (Chantier 4)

Lorsque `commentSearchBox` est activé, une barre de recherche apparaît au-dessus des commentaires. Elle surligne les correspondances (`<mark>`), affiche un compteur `N / M` et propose des boutons ◀/▶ pour naviguer d'une correspondance à l'autre. La recherche porte sur le texte propre de chaque commentaire (pas ses réponses imbriquées).

---

### Panneau flottant de navigation entre fils (Chantier 4)

Lorsque `floatingNavPanel` est activé, un panneau flottant en bas à gauche de l'écran propose :

* ⏮ Premier fil / ◀ Précédent / ▶ Suivant / ⏭ Dernier fil (uniquement les commentaires de premier niveau) ;
* un champ numérique pour sauter directement à une page de commentaires, quand les commentaires sont paginés ;
* les raccourcis clavier **Alt+↓** (fil suivant) et **Alt+↑** (fil précédent), choisis pour ne pas entrer en conflit avec `Ctrl+J`.

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
* `commentKitHelpers.js` (`matchesSearch`, `buildPageJumpUrl`)
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

### Filtre sur les commentaires de l’auteur·ice (Chantier 4)

Le réglage `authorFilterMode` permet de :

* `off` (par défaut) : ne rien filtrer ;
* `hide` : cacher les commentaires de l’auteur·ice ;
* `only` : n’afficher que les commentaires de l’auteur·ice.

Le masquage utilise `display: none`, indépendamment de la mise en évidence (`highlightAuthorReplies`).

---

### Surlignage personnalisé (Chantier 4)

Le réglage `customHighlights` accepte une liste de pseudos ou de mots-clés séparés par des virgules. Un commentaire est mis en évidence (bordure dorée + badge `★`) si son auteur correspond à un pseudo de la liste, ou si son propre texte contient un des mots-clés (`parseHighlightRules`, `matchesCustomHighlight`).

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
* `commentKitHelpers.js` (`parseHighlightRules`, `matchesCustomHighlight`)
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

L’état replié ou déplié est enregistré séparément pour chaque œuvre, comme une préférence manuelle par fil (`{ manual: { [id]: true|false } }`, migrée automatiquement depuis l'ancien format `{ collapsed: [ids] }`).

Les états conservés depuis plus de 30 jours sont automatiquement supprimés.

---

### Repli automatique au-delà d'un seuil (Chantier 4)

Le réglage `autoCollapseThreshold` (désactivé, ou 5/10/20 réponses) replie automatiquement à l'affichage les fils comptant au moins ce nombre de réponses imbriquées.

Une préférence manuelle déjà choisie pour un fil précis (bouton individuel ou "Collapse all"/"Expand all") reste toujours prioritaire sur ce seuil (`shouldAutoCollapse`) — changer le seuil ne "dé-fait" jamais un choix explicite de l'utilisateur.

---

### Citer un commentaire dans sa réponse (Chantier 4)

Lorsque `showQuoteReplyButton` est activé, un bouton **❝ Reply** apparaît sur chaque commentaire. Il clique le lien natif "Reply" d'AO3 pour révéler son formulaire de réponse (AO3 l'injecte lui-même via sa propre requête AJAX, donc le sous-module attend brièvement l'apparition de la zone de texte plutôt que de deviner son contenu), puis pré-remplit une citation de l'auteur et d'un extrait du commentaire visé.

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
* `commentKitHelpers.js` (`shouldAutoCollapse`)
* `localStorage`
* les commentaires principaux ;
* les fils imbriqués `ol.thread` ;
* le lien natif "Reply" d'AO3, pour le bouton de citation.

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

### Densité d'affichage des commentaires (Chantier 4)

Le réglage `commentDensity` (compact/normal/spacieux) ajoute une classe sur `<html>` (`ao3h-comment-density-compact`/`-spacious`), sans classe pour "normal"). Les styles associés dans `commentKit.css` ajustent le padding et l'interligne des commentaires. Réinitialisé à "normal" à l'arrêt du module.

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

# commentKitHelpers.js

## Rôle

Fichier de logique pure, sans DOM ni accès direct au stockage, ajouté au Chantier 4 pour rendre testable la logique partagée entre les sous-modules.

## Fonctions exposées

* `fillTemplateVariables(text, vars)` / `filterTemplates(templates, query)` — variables et recherche de modèles.
* `draftKeyFor(workId, scope)` / `draftScopeForForm(parentCommentId)` — clé de brouillon par formulaire.
* `shouldAutoCollapse(replyCount, threshold, manualOverride)` — règle de repli automatique avec priorité à la préférence manuelle.
* `parseHighlightRules(raw)` / `matchesCustomHighlight(comment, rules)` — surlignage personnalisé.
* `matchesSearch(text, query)` — recherche dans les commentaires.
* `buildPageJumpUrl(currentUrl, pageNum)` — saut vers une page de commentaires.

## Dépendances

Aucune — utilisé par `commentComposing.js`, `draftManagement.js`, `commentNavigation.js`, `commentHighlighting.js` et `threadManagement.js`.

---

# commentKit.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Comment Kit**.

Il définit notamment l’apparence :

* de la barre d’outils de mise en forme ;
* des boutons de modèles et du champ de recherche de modèles ;
* du panneau de gestion des modèles ;
* de l’aperçu du commentaire et de la mention "Posting as..." ;
* du bouton de citation d'un passage de la fic ;
* des notifications de restauration de brouillon ;
* des compteurs de caractères et de mots ;
* de la boîte de commentaire flottante (déplaçable) ;
* des boutons de navigation, de la barre de recherche et du panneau flottant de navigation entre fils ;
* des badges `Author`, `↩ Reply to you` et du surlignage personnalisé (`★`) ;
* du filtre auteur (`display: none`) ;
* des boutons de repli et du bouton de citation-réponse ;
* des badges `NEW` ;
* des boutons globaux de gestion des fils ;
* des badges de chapitre ;
* de la densité d'affichage des commentaires.

---

# Fonctionnalités non implémentées

## Citer et répondre

Ajouter une action permettant de reprendre automatiquement le texte d’un commentaire dans une réponse.

**✅ Fait** — bouton "❝ Reply" (`threadManagement.js`), réglage `showQuoteReplyButton`.

---

## Recherche dans les commentaires

Permettre de rechercher un mot ou une expression dans tous les commentaires d’une œuvre.

**✅ Fait** — barre de recherche avec surlignage et navigation, réglage `commentSearchBox`.

---

## Aperçu selon le type d’utilisateur

Afficher un aperçu différent selon que le commentaire sera publié :

* par un compte connecté ;
* par un invité.

**✅ Fait** — mention "Posting as Guest: ..." ou "Posting as [pseudo]" au-dessus de l'aperçu.

---

## Catégories de modèles

Classer les modèles de commentaires dans différentes catégories.

Ces modèles pourraient contenir des espaces à remplir, notamment :

* le titre de l’œuvre ;
* le nom de l’auteur ;
* d’autres informations personnalisées.

**✅ Fait (partiel)** — les espaces à remplir (variables `{title}`/`{author}`) sont faits ; les catégories formelles ont été remplacées par la recherche de modèles (item suivant) pour éviter de casser le format de stockage des modèles déjà sauvegardés.

---

## Recherche dans les modèles

Ajouter une barre de recherche dans les modèles personnels.

**✅ Fait** — à partir de 6 modèles enregistrés.

---

## Fragments de texte

Proposer de petits extraits de texte réutilisables à insérer rapidement dans un commentaire.

**✅ Fait (déjà le cas)** — c'est exactement le rôle du panneau de modèles rapides, qui existait déjà.

---

## Réponses automatiques

Générer ou insérer automatiquement une réponse lorsque certaines règles précises sont remplies.

**❌ Écarté** — publier sans relecture humaine va à l'encontre de l'esprit d'AO3, même raisonnement que le générateur de commentaire aléatoire déjà écarté.

---

## Modèles remplis automatiquement

Remplacer automatiquement certaines variables d’un modèle par :

* le titre de l’œuvre ;
* le nom de l’auteur ;
* d’autres informations de la page.

**✅ Fait** — `fillTemplateVariables`, appliqué à l'insertion.

---

## Brouillons multiples

Conserver plusieurs brouillons distincts pour un même commentaire.

**✅ Fait** — un brouillon par formulaire (principal + chaque réponse en cours) au lieu d'un seul par œuvre ; corrige au passage un vrai bug où deux formulaires ouverts en même temps s'écrasaient mutuellement.

---

## Densité des commentaires

Permettre de choisir une densité d’affichage :

* compacte ;
* normale ;
* spacieuse.

**✅ Fait** — réglage `commentDensity`.

---

## Filtrage des commentaires de l’auteur

Permettre de :

* masquer les commentaires de l’auteur ;
* afficher uniquement les commentaires de l’auteur.

**✅ Fait** — réglage `authorFilterMode`.

---

## Navigation flottante

Ajouter un panneau flottant permettant d’accéder rapidement :

* au premier fil ;
* au dernier fil ;
* au fil précédent ;
* au fil suivant.

**✅ Fait** — réglage `floatingNavPanel`.

---

## Carte des commentaires

Afficher une mini-carte indiquant les zones de la page qui contiennent le plus de commentaires.

**❌ Écarté** — complexité disproportionnée pour une simple liste de commentaires ; le panneau de navigation flottant (item précédent) couvre déjà le besoin pratique sans nécessiter de représentation visuelle.

---

## Accès direct à une page

Ajouter un contrôle permettant d’accéder directement à une page précise lorsque les commentaires sont répartis sur plusieurs pages.

**✅ Fait** — champ de saut de page dans le panneau de navigation flottant (`buildPageJumpUrl`).

---

## Surlignage personnalisé

Permettre de mettre en évidence les commentaires correspondant :

* à certains noms d’utilisateur ;
* à certains mots-clés.

Le système actuel se limite à l’auteur de l’œuvre et aux réponses adressées à l’utilisateur.

**✅ Fait** — réglage `customHighlights`.

---

## Listes dans la barre d’outils

Ajouter des boutons permettant de créer :

* une liste à puces ;
* une liste numérotée.

**❌ Écarté** — AO3 n'autorise pas les balises de liste HTML dans les commentaires (la liste blanche de l'aperçu du module ne les inclut pas) ; les insérer produirait du texte affiché tel quel ou supprimé par AO3, trompeur pour l'utilisateur.

---

## Soulignement

Ajouter un bouton permettant de souligner le texte dans la barre d’outils.

**✅ Fait** — la liste blanche de l'aperçu autorisait déjà `<u>`, seul le bouton manquait ; un bouton Barré (`<s>`, déjà autorisé aussi) a été ajouté au passage.

---

## Citation depuis le texte de l’œuvre

Permettre de sélectionner un passage de l’œuvre afin de l’insérer automatiquement comme citation dans le brouillon.

**✅ Fait** — réglage `quoteFicSelection`.

---

## Déplacement de la boîte flottante

Permettre de déplacer la boîte de commentaire flottante avec la souris.

**✅ Fait** — glisser-déposer par l'en-tête, position mémorisée.

---

## Repli automatique des longs fils

Replier automatiquement les fils contenant un grand nombre de réponses.

**✅ Fait** — réglage `autoCollapseThreshold`, une préférence manuelle déjà choisie reste toujours prioritaire.

---

## Navigation au clavier

Ajouter des raccourcis clavier permettant de passer d’un commentaire à l’autre.

**✅ Fait** — Alt+↓/Alt+↑ (avec `floatingNavPanel`).

---

## Suggestions contextuelles avancées

Analyser le texte de l’œuvre afin de repérer un passage important et de proposer un commentaire adapté :

* au passage sélectionné ;
* au ton de l’œuvre ;
* aux commentaires antérieurs de l’utilisateur.

Cette fonctionnalité irait au-delà des modèles génériques actuellement disponibles.

**❌ Écarté** — nécessiterait un service d'analyse par IA, déjà écarté ailleurs dans le projet pour rester local et simple.

---

## Impact des commentaires

Afficher des informations sur les réactions reçues par les commentaires de l’utilisateur, notamment le nombre de réponses, en relation avec son activité de lecture.

**❌ Écarté** — même idée que "Des statistiques sur ses propres commentaires", déjà explicitement écartée.

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

## Pas de réponses ni de suggestions générées automatiquement

Le module ne génère ni ne pré-remplit de réponse automatique selon des règles, et n'analyse pas le texte de la fic par IA pour suggérer un commentaire adapté.

Publier un commentaire sans relecture humaine va à l'encontre de l'esprit d'AO3 (même raisonnement que le générateur de commentaire aléatoire déjà écarté), et une analyse par IA dépendrait d'un service externe — le module reste local et simple, comme pour `similarFics`.

---

## Pas de balises de liste dans la barre d'outils

Le module ne propose pas de boutons pour insérer des listes à puces ou numérotées.

AO3 n'autorise pas ces balises dans les commentaires (la liste blanche déjà utilisée par l'aperçu du module ne les inclut pas) ; les proposer produirait un résultat trompeur, soit supprimé par AO3 soit affiché comme texte brut.

---

## Pas de mini-carte visuelle des commentaires

Le module n'affiche pas de représentation visuelle indiquant où se concentrent les commentaires sur la page.

Jugée disproportionnée en complexité pour une simple liste de commentaires ; le panneau de navigation flottant (premier/précédent/suivant/dernier fil, saut de page) couvre déjà le besoin pratique de se déplacer sans nécessiter de carte.

---

## Pas de statistiques d'impact liées à la lecture

Le module ne mesure pas l'impact des commentaires de l'utilisateur (réponses reçues, etc.) en lien avec son historique de lecture.

Même décision que "Statistiques de commentaires" ci-dessus, formulée différemment dans les specs d'un autre document.

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
