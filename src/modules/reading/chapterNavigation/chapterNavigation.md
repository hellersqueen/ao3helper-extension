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
| `chapterPanel` | activé | Bouton flottant "📑 Chapters" : recherche, mini-carte lu/actuel/non lu, favoris, notes, chapitres récents |
| `showBreadcrumb` | activé | Fil d'Ariane "Œuvre > Chapitre X > Titre" au-dessus du texte |
| `tabTitleChapter` | désactivé | Affiche la position du chapitre dans le titre de l'onglet du navigateur |
| `emphasizeChapterTitle` | désactivé | Rend le titre du chapitre en cours plus grand et plus visible |
| `prefetchNextChapter` | activé | Précharge la page du chapitre suivant en arrière-plan |

## Fichiers

### 1. `_chapterNavigation.js` — le chef d'orchestre

- Vérifie sur quel type de page on se trouve et met en route les bons fichiers de fonctionnalités

### 2. `navigationControls.js` — barre de navigation et raccourcis

- Une barre Précédent/Suivant qui peut rester collée en haut de l'écran pendant la lecture
- Un petit texte "Chapter X of Y" au-dessus du menu déroulant des chapitres
- Garde en mémoire le dernier chapitre visité
- Des raccourcis clavier (Ctrl+Flèche gauche/droite pour changer de chapitre ; Ctrl+Maj+Origine/Fin pour sauter au premier chapitre non lu / au dernier chapitre)
- Un fil d'Ariane, le titre du chapitre dans l'onglet du navigateur (optionnel), une mise en avant du titre du chapitre (optionnel), et un préchargement du chapitre suivant

### 3. `chaptersPanel.js` — panneau flottant des chapitres

- Un bouton "📑 Chapters" ouvre un panneau avec une recherche par numéro ou titre
- Une mini-carte de progression (✓ lu, 📍 en cours, non lu) et des raccourcis "premier non lu" / "dernier chapitre"
- Étoile "favori/à relire" et note personnelle par chapitre, stockées par fic
- Liste des chapitres récemment consultés (le temps de la session) et bouton pour copier le lien direct d'un chapitre

### 4. `blurbNavigation.js` — boutons de reprise sur les listes

- Ajoute un bouton "Start" sur les fics jamais commencées, ou "Continue (Ch X)" sur celles déjà en cours
- Signale s'il y a de nouveaux chapitres parus depuis la dernière lecture
- Ajoute un bouton "Last (Ch Y)" pour sauter directement au dernier chapitre

### 5. `autoScroll.js` — défilement automatique

- Ajoute un petit widget flottant avec plusieurs vitesses de défilement (0.5×, 1×, 2×, 4×) et un bouton stop
- Le défilement se met en pause dès qu'on touche la souris, le clavier ou l'écran, et reprend après une courte pause
- Peut passer automatiquement au chapitre suivant en arrivant en bas de la page

### 6. `chapterWordCount.js` — compteur de mots par chapitre

- Affiche un badge "~ X.XK words" indiquant le nombre de mots de chaque chapitre, sans compter le résumé ni les notes
- Le temps de lecture estimé partage ce même badge, mais est calculé par `workLength`/`readingTime.js` (module séparé)

### 7. `chaptersPanelHelpers.js` — logique pure du panneau

- Analyse du menu déroulant natif des chapitres, filtrage par recherche, calcul de l'état lu/actuel/non lu, premier chapitre non lu, liste des chapitres récents, textes du fil d'Ariane et du titre d'onglet

### 8. `chapterNavigation.css`

- Les styles visuels de la barre, du texte, des boutons, du widget de défilement, du fil d'Ariane et du panneau de chapitres

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Un menu déroulant de chapitres avec les titres et des mini-aperçus, pas juste les numéros~~ ✅ Fait (partiel) : le panneau "📑 Chapters" liste chaque chapitre avec son numéro et son titre (déjà présents dans le `<select>` natif d'AO3, donc sans coût réseau) ; les "mini-aperçus" de contenu ont été écartés, voir Explicitement écarté
- ~~Chercher un chapitre par son titre ou son numéro~~ ✅ Fait — champ de recherche dans le panneau "📑 Chapters" (`chaptersPanel.js`, `filterChapters`)
- ~~Marquer certains chapitres comme favoris ou "à relire"~~ ✅ Fait — bouton étoile ☆/★ par chapitre dans le panneau, stocké sous `ao3h:cn:marks:{workId}`
- ~~Ajouter une note personnelle à un chapitre précis~~ ✅ Fait — icône 📝 par chapitre dans le panneau, ouvre un champ de texte ; stocké dans la même clé que les favoris
- ~~Voir la liste des chapitres consultés récemment~~ ✅ Fait — section "Recent" du panneau, limitée à la session en cours (`sessionStorage`, `ao3h:cn:recent:{workId}`) : ça n'a de sens que pour les allers-retours de la session de lecture actuelle
- ~~Naviguer entre les chapitres à la voix, mains libres~~ ❌ Écarté — nécessiterait un accès micro toujours actif et peu fiable, pour un bénéfice limité en lecture ; même famille de raisons que les autres fonctionnalités à base de reconnaissance vocale/IA écartées ailleurs
- ~~Se fixer des objectifs de lecture basés sur le nombre de chapitres~~ ❌ Écarté — même raisonnement que `readingDashboard`, qui a déjà écarté objectifs/stats de session comme peu fiables à mesurer et anti-gamification
- ~~Un fil d'Ariane qui montre où on est (Œuvre > Chapitre 5 > Titre)~~ ✅ Fait — ligne "Œuvre > Chapitre X > Titre" au-dessus du texte (réglage `showBreadcrumb`)
- ~~Un lien direct copiable vers chaque chapitre~~ ✅ Fait — icône 🔗 par chapitre dans le panneau, copie l'URL du chapitre dans le presse-papiers
- ~~Des petits points visuels (lu/non lu) et une mini-carte de la progression sur laquelle on peut cliquer pour sauter~~ ✅ Fait — mini-carte intégrée à la liste du panneau (✓ lu / 📍 en cours / vide = non lu), chaque ligne est cliquable ; le statut "lu" est approximé à partir du dernier chapitre connu de `readingTracker`
- ~~Un repère "tu es ici" dans cette mini-carte~~ ✅ Fait — icône 📍 sur la ligne du chapitre courant, avec surlignage
- ~~Des marques de complétion (✓) sur chaque chapitre déjà lu~~ ✅ Fait — icône ✓ sur chaque ligne dont le numéro est ≤ au dernier chapitre lu
- ~~Comparer la longueur des chapitres entre eux (le plus long, le plus court, la moyenne) avec un petit graphique~~ ❌ Écarté — nécessiterait de télécharger chaque chapitre séparément pour compter ses mots (AO3 n'affiche que le chapitre courant par défaut), coût réseau jugé excessif pour un simple comparatif
- ~~Afficher le titre du chapitre en cours dans le titre de l'onglet du navigateur~~ ✅ Fait — réglage `tabTitleChapter` (désactivé par défaut, car ça remplace le titre affiché par le navigateur)
- ~~Un bouton flottant "📑 Chapters" sur les pages de fic, avec un raccourci pour sauter directement au premier chapitre non lu, et un raccourci clavier pour aller directement au dernier chapitre~~ ✅ Fait — c'est le panneau lui-même (`chaptersPanel.js`), avec ses boutons "▶ First unread" / "⏭ Last chapter" et les raccourcis clavier ci-dessous
- ~~Une estimation du temps de lecture pour chaque chapitre~~ ✅ Fait (déjà couvert ailleurs) — `workLength`/`readingTime.js` calcule et affiche déjà "~X min" par chapitre, sur le même badge partagé (`lib/ui/badges.js`) que le compteur de mots de `chapterWordCount.js`
- ~~Rendre le titre du chapitre en cours plus visible ou plus grand sur la page~~ ✅ Fait — réglage `emphasizeChapterTitle`
- ~~Plus d'options de raccourcis clavier pour se déplacer entre les chapitres~~ ✅ Fait — Ctrl+Maj+Origine (premier chapitre non lu) et Ctrl+Maj+Fin (dernier chapitre), en plus de Ctrl+Flèches existants
- ~~Des effets d'animation ou de transition personnalisés en changeant de chapitre~~ ❌ Écarté — changer de chapitre est un vrai rechargement de page AO3 (pas une SPA) ; animer une transition entre deux pages différentes nécessiterait d'intercepter la navigation du site, trop fragile et invasif pour le bénéfice
- ~~Charger le chapitre suivant en arrière-plan pour qu'il s'ouvre instantanément~~ ✅ Fait — indice `<link rel="prefetch">` vers le chapitre suivant (réglage `prefetchNextChapter`), coût minime car c'est juste un indice laissé au navigateur
- ~~Combiner le défilement automatique avec un journal de lecture pour avoir un résumé détaillé de chaque session de lecture~~ ❌ Écarté — dépend d'un "journal de lecture" qui n'existe pas encore : `readingTracker` n'a pas de suivi de durée/notes de session, cette spec n'y est pas résolue non plus

## Explicitement écarté

- Charger automatiquement l'œuvre entière d'un coup selon sa longueur
- Un tableau de bord avec des statistiques de lecture — ce n'est pas le rôle de ce module, qui sert à naviguer, pas à faire des statistiques
- Pouvoir déplacer les boutons de navigation où on veut sur l'écran — jugé trop compliqué à régler pour peu d'intérêt
- Naviguer entre les chapitres à la voix — accès micro permanent peu fiable pour un bénéfice limité
- Se fixer des objectifs de lecture basés sur le nombre de chapitres — même raisonnement que `readingDashboard` (anti-gamification, peu fiable à mesurer)
- Comparer la longueur des chapitres avec un graphique — nécessiterait de télécharger chaque chapitre, coût réseau excessif
- Des animations de transition entre chapitres — changement de chapitre = vraie navigation de page, pas une SPA
- Un journal de lecture combiné au défilement automatique — dépend d'une fonctionnalité de suivi de session qui n'existe pas encore dans `readingTracker`

## Précision

⚠️ Les docs historiques présentent `navigationControls` (barre collante,
raccourcis) et `autoScroll` (défilement automatique) comme des fichiers
jamais créés. C'est faux aujourd'hui : les deux sont pleinement codés dans
`navigationControls.js` et `autoScroll.js`.



AO3 Helper - Chapter Navigation Module Coordinator
    Module ID: chapterNavigation
    Display Name: Chapter Navigation
    Tab: Reading

    Submodules (imported directly as ES modules):
        ./navigationControls.js -- sticky nav, chapter label, breadcrumb, tab
                                    title, emphasis, prefetch, shortcuts, cache
        ./blurbNavigation.js    -- Start/Continue/Last buttons on listings
        ./autoScroll.js         -- auto-scroll widget (work pages)
        ./chaptersPanel.js      -- floating "📑 Chapters" search/mini-map/marks panel

    Registered child module (register(), parent: 'chapterNavigation'):
        chapterWordCount  -- "~ X.XK words" badge per chapter

    Storage:
        ao3h:cn:lastchap:{workId} -- { id, num } written on work-page load
        ao3h:cn:marks:{workId}    -- { [chapterId]: { starred, note } }, owned by chaptersPanel
        ao3h:cn:recent:{workId}   -- sessionStorage, recently visited chapters, owned by chaptersPanel

    Integration (loose coupling):
        W.AO3H_ReadingTracker?.getProgress(workId) -- also used by chaptersPanel
        to approximate the read/unread mini-map (chapters ≤ progress.chapter)
        W.AO3H_KeyboardShortcuts (Ctrl+Left / Ctrl+Right, Ctrl+Shift+Home /
        Ctrl+Shift+End) — migré (Phase 21, navigate/keyboardShortcuts) ; le
        bridge window reste le contrat jusqu'à la Phase 26

    Config keys:
        stickyNav, resumeButton, lastChapterBtn
        autoScrollSpeed, autoScrollAutoAdvance, autoScrollShowControls
        chapterPanel, showBreadcrumb, tabTitleChapter, emphasizeChapterTitle,
        prefetchNextChapter


        // ── AutoScroll ────────────────────────────────────────────────────────────
// Submodule of: chapterNavigation
// Scope: work pages only
//
// Responsibilities:
//   - Automatic scrolling at configurable speed (px/s)
//   - Pause on user interaction (mousemove, click, keydown, wheel, touch)
//   - Auto-advance to next chapter on reaching the bottom
//   - Speed preset controls (floating pill widget)
//   - Cleanup: cancel scroll, remove UI
//
// Config keys (passed via parent diOpts.cfg):
//   autoScrollSpeed        (number, px/s, default 50)
//   autoScrollAutoAdvance  (bool, default false)
//   autoScrollShowControls (bool, default true)


// ── BlurbNavigation ───────────────────────────────────────────────────────
// Submodule of: chapterNavigation — listing pages only
//
// Responsibilities:
//   - "Start" button on unread works (links to /works/{id})
//   - "Continue (Ch X)" button on in-progress works (links to last read chapter)
//   - "Continue (Ch X) · N new" label when new chapters exist since last read
//   - "Last (Ch Y)" button to jump directly to the final chapter
//   - Reads progress from W.AO3H_ReadingTracker.getProgress() or localStorage fallback
//   - Reads last-chapter cache written by NavigationControls (SK_LASTCHAP)
//   - Buttons injected into h4.heading on each work blurb
//   - Cleanup: removes all injected button wrappers
//
// Config keys (passed via parent diOpts.cfg):
//   resumeButton    (bool, default true)  — show Start / Continue button
//   lastChapterBtn  (bool, default true)  — show Last (Ch Y) button
//
// readingTracker isn't migrated to ES Modules yet (Étape 239) — kept as a
// global bridge read (Phase 18: don't migrate a dependency whose target isn't ready).


// ── ChapterWordCount ──────────────────────────────────────────────────────────
// Submodule of: chapterNavigation — work pages only
// Submodule ID: chapterWordCount
// Registered via register(), parent: 'chapterNavigation'
//
// Responsibilities:
//   - Show a "~ X.XK words in this chapter" badge on each chapter
//   - Works on multi-chapter works (badge per chapter) and single-chapter works
//   - Counts only story prose — excludes preface, summary, author notes, endnotes
//   - Retries a few times to handle late DOM inserts / custom skins
//   - Cleanup: removes all injected badges
//
// Format: abbreviated (e.g. "~ 5.2K words") per spec — NOT comma-formatted
// No config keys — behaviour is fixed (display only, no user options)


// ── NavigationControls ────────────────────────────────────────────────────
// Submodule of: chapterNavigation — work pages only
//
// Responsibilities:
//   - Sticky navigation bar (Previous/Next always visible while reading)
//   - "Chapter X of Y" label injected above the chapter dropdown
//   - Last-chapter cache: writes { id, num } to localStorage on work-page load
//   - Breadcrumb "Work > Chapter X > Title" above the chapter text
//   - Tab title: prefixes document.title with "Ch. X/Y" (opt-in)
//   - Emphasized chapter title (opt-in CSS class)
//   - Next-chapter prefetch: <link rel="prefetch"> resource hint
//   - Keyboard shortcuts: Ctrl+← previous / Ctrl+→ next chapter,
//     Ctrl+Shift+Home first unread chapter, Ctrl+Shift+End last chapter
//   - Cleanup: removes sticky class, label, breadcrumb, prefetch link,
//     restores the original tab title, and unregisters shortcuts
//
// Config keys (passed via parent diOpts.cfg):
//   stickyNav              (bool, default false)  — make navigation bar sticky
//   showBreadcrumb         (bool, default true)
//   tabTitleChapter        (bool, default false)
//   emphasizeChapterTitle  (bool, default false)
//   prefetchNextChapter    (bool, default true)


// ── ChaptersPanel ─────────────────────────────────────────────────────────
// Submodule of: chapterNavigation — multi-chapter work pages only
//
// Responsibilities:
//   - Floating "📑 Chapters" button toggling a searchable chapter list
//   - Search by chapter number or title (chaptersPanelHelpers.filterChapters)
//   - Mini progress map: ✓ read / 📍 current / unread, approximated from
//     W.AO3H_ReadingTracker?.getProgress(workId) (soft dependency)
//   - Quick jumps: first unread chapter, last chapter
//   - Per-chapter star (favorite/reread) and personal note, stored under
//     ao3h:cn:marks:{workId}
//   - Recently visited chapters this session, stored under
//     ao3h:cn:recent:{workId} (sessionStorage — only meaningful within one
//     reading session)
//   - Copy-link button per chapter
//   - Cleanup: removes the button and panel, detaches document listeners
//
// Config keys (passed via parent diOpts.cfg):
//   chapterPanel  (bool, default true)


═══════════════════════════════════════════════════════════════════════════
  # chapterNavigation
  **Tab :** Reading
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Chapter Navigation** regroupe tous les outils permettant de naviguer dans une œuvre pendant la lecture ainsi que depuis les listes de fics.

* Il permet notamment de :
    - conserver une barre de navigation toujours visible pendant la lecture ;
    - naviguer rapidement entre les chapitres ;
    - reprendre une œuvre au dernier chapitre lu ;
    - accéder directement au dernier chapitre disponible ;
    - faire défiler automatiquement la page ;
    - afficher le nombre de mots de chaque chapitre ;
    - rechercher, marquer, annoter et sauter directement à un chapitre depuis un panneau flottant ;
    - afficher un fil d'Ariane, mettre en avant le titre du chapitre, et précharger le chapitre suivant.

---

# Réglages utilisateur

| Réglage                   | Description                                                           |
|---------------------------|-----------------------------------------------------------------------|
| `stickyNav`               | Garde la barre Précédent / Suivant visible pendant la lecture.        |
| `showBreadcrumb`          | Affiche "Œuvre > Chapitre X > Titre" au-dessus du texte.               |
| `tabTitleChapter`         | Affiche la position du chapitre dans le titre de l'onglet.            |
| `emphasizeChapterTitle`   | Rend le titre du chapitre en cours plus grand et plus visible.        |
| `prefetchNextChapter`     | Précharge la page du chapitre suivant en arrière-plan.                |
| `resumeButton`            | Affiche un bouton **Start** ou **Continue** sur les listes de fics.   |
| `lastChapterBtn`          | Affiche un bouton **Last (Ch X)** sur les listes.                     |
| `chapterPanel`            | Affiche le bouton flottant "📑 Chapters" (recherche, favoris, notes). |
| `autoScrollShowControls`  | Affiche les contrôles du défilement automatique.                      |
| `autoScrollSpeed`         | Vitesse du défilement automatique (pixels/seconde).                   |
| `autoScrollAutoAdvance`   | Passe automatiquement au chapitre suivant en fin de page.             |

---

# Structure du module

Le module est composé de cinq sous-modules fonctionnels, d'un fichier de logique pure, d'un sous-module enregistré et d'une feuille de style.

```
_chapterNavigation.js
navigationControls.js
blurbNavigation.js
autoScroll.js
chaptersPanel.js
chaptersPanelHelpers.js
chapterWordCount.js
chapterNavigation.css
```

---

# _chapterNavigation.js

## Rôle

Fichier coordinateur du module.

Il détecte le type de page AO3, initialise les sous-modules nécessaires et expose les fonctionnalités de navigation au reste d'AO3 Helper.

## Responsabilités

- Initialise les sous-modules adaptés à la page courante.
- Coordonne les fonctionnalités de navigation.
- Partage la configuration entre les sous-modules.
- Sert de point d'entrée unique pour le reste de l'extension.

## Fonctions exposées

Le coordinateur permet notamment :

- d'initialiser la navigation ;
- d'activer les outils adaptés aux pages de lecture ou aux listes ;
- de partager les réglages du module.

---

# navigationControls.js

## Rôle

Gère tous les outils de navigation utilisés directement pendant la lecture d'une œuvre.

---

## Fonctionnalités

### Barre de navigation

Le module améliore la barre de navigation des chapitres.

Il peut :

- rendre la barre **Précédent / Suivant** collante pendant la lecture ;
- conserver cette barre visible pendant le défilement ;
- retirer automatiquement ce comportement lorsque l'option est désactivée.

---

### Indicateur de chapitre

Le module ajoute un indicateur au-dessus du sélecteur de chapitres.

Il affiche :

- **Chapter X of Y**.

---

### Navigation clavier

Le module ajoute des raccourcis clavier permettant de changer rapidement de chapitre.

Raccourcis disponibles :

- **Ctrl + ←** : chapitre précédent.
- **Ctrl + →** : chapitre suivant.
- **Ctrl + Maj + Origine** : premier chapitre non lu.
- **Ctrl + Maj + Fin** : dernier chapitre.

Le système s'intègre au module **Keyboard Shortcuts** via le bridge `W.AO3H_KeyboardShortcuts`.

---

### Mémorisation du dernier chapitre

À chaque ouverture d'un chapitre, le module mémorise automatiquement :

- l'identifiant de l'œuvre ;
- le dernier chapitre consulté.

Ces informations sont enregistrées dans :

`ao3h:cn:lastchap:{workId}`

Elles sont ensuite utilisées par `blurbNavigation.js`.

---

### Fil d'Ariane

Lorsque `showBreadcrumb` est activé, le module affiche une ligne au-dessus du texte du chapitre :

`Œuvre > Chapitre X > Titre du chapitre`

Le titre de l'œuvre provient de `getWorkTitle()` (`lib/ao3/work-page.js`), le titre du chapitre est extrait de l'option sélectionnée du menu déroulant natif.

---

### Titre de l'onglet

Lorsque `tabTitleChapter` est activé, le module préfixe le titre de l'onglet du navigateur avec la position du chapitre, par exemple `Ch. 5/12 · Titre original`. Le titre d'origine est restauré à la désactivation. Ce réglage est désactivé par défaut car il remplace un titre visible par l'utilisateur.

---

### Mise en avant du titre du chapitre

Lorsque `emphasizeChapterTitle` est activé, le module ajoute une classe CSS qui agrandit et met en gras le titre du chapitre en cours.

---

### Préchargement du chapitre suivant

Lorsque `prefetchNextChapter` est activé, le module ajoute un indice `<link rel="prefetch">` pointant vers l'URL du chapitre suivant, pour que le navigateur puisse le précharger en arrière-plan. C'est un simple indice laissé au navigateur, pas un téléchargement forcé du contenu.

---

## Détails techniques

### Stockage

Le module enregistre :

```text
{
    id,
    num
}
```

dans `localStorage`.

---

### Nettoyage

Lors de sa désactivation, le module :

- retire la barre collante ;
- supprime l'indicateur de chapitre ;
- supprime le fil d'Ariane et le lien de préchargement ;
- restaure le titre d'onglet d'origine ;
- retire la mise en avant du titre de chapitre ;
- désenregistre les raccourcis clavier.

---

## Dépendances

Le sous-module est initialisé par `_chapterNavigation.js`.

Il partage le cache du dernier chapitre avec `blurbNavigation.js`, et utilise les fonctions pures de `chaptersPanelHelpers.js` (analyse du menu déroulant, calcul du premier chapitre non lu, textes du fil d'Ariane et du titre d'onglet) ainsi que `W.AO3H_ReadingTracker` pour connaître le dernier chapitre lu.

---

# blurbNavigation.js

## Rôle

Ajoute des boutons de reprise directement sur les listes de fics afin de permettre de commencer ou reprendre une lecture sans ouvrir la page principale de l'œuvre.

---

## Fonctionnalités

### Bouton Start / Continue

Le module ajoute automatiquement un bouton adapté à chaque œuvre.

Selon la progression :

- **Start** pour une œuvre jamais commencée.
- **Continue (Ch X)** pour reprendre au dernier chapitre lu.

Les boutons sont insérés dans le titre (`h4.heading`) de chaque blurb.

---

### Détection des nouveaux chapitres

Lorsque de nouveaux chapitres sont publiés après la dernière lecture, le bouton devient :

- **Continue (Ch X) · N new**

afin d'indiquer le nombre de nouveaux chapitres disponibles.

---

### Bouton Last

Le module peut également afficher :

- **Last (Ch Y)**

permettant d'accéder directement au dernier chapitre disponible.

---

### Suivi de progression

Le module récupère la progression de lecture à partir de :

- `W.AO3H_ReadingTracker.getProgress(workId)` ;
- ou d'un repli sur `localStorage` lorsque le Reading Tracker n'est pas encore migré.

Il utilise également le cache du dernier chapitre créé par `navigationControls.js`.

---

## Détails techniques

### Configuration

Le module utilise :

- `resumeButton`
- `lastChapterBtn`

---

### Compatibilité

Le Reading Tracker n'étant pas encore migré en ES Modules, le module utilise temporairement un bridge global (`window`) jusqu'à la migration prévue.

---

### Nettoyage

Lors de sa désactivation, le module retire tous les boutons injectés dans les blurbs.

---

## Dépendances

Le sous-module est initialisé par `_chapterNavigation.js`.

Il dépend :

- du cache du dernier chapitre créé par `navigationControls.js` ;
- du Reading Tracker pour déterminer la progression de lecture.


# autoScroll.js

## Rôle

Gère le défilement automatique des pages de lecture.

Le module fait défiler le contenu à une vitesse configurable, met automatiquement le défilement en pause lors d'une interaction de l'utilisateur et peut passer au chapitre suivant lorsqu'il atteint le bas de la page.

---

## Fonctionnalités

### Défilement automatique

Le module fait défiler la page automatiquement à une vitesse exprimée en pixels par seconde.

La vitesse par défaut est définie par :

`autoScrollSpeed = 50`

---

### Contrôles flottants

Lorsque l'option `autoScrollShowControls` est activée, le module affiche un widget flottant.

Il comprend :

- une vitesse **0.5×** ;
- une vitesse **1×** ;
- une vitesse **2×** ;
- une vitesse **4×** ;
- un bouton d'arrêt.

---

### Pause lors des interactions

Le défilement est automatiquement mis en pause lorsque l'utilisateur interagit avec la page.

Interactions détectées :

- mouvement de la souris ;
- clic ;
- touche du clavier ;
- molette ;
- interaction tactile.

Le défilement reprend après une courte pause.

---

### Passage automatique au chapitre suivant

Lorsque l'option `autoScrollAutoAdvance` est activée, le module peut ouvrir automatiquement le chapitre suivant lorsqu'il atteint le bas de la page.

---

## Détails techniques

### Configuration

Le module utilise :

- `autoScrollSpeed`
- `autoScrollAutoAdvance`
- `autoScrollShowControls`

---

### Portée

Le module fonctionne uniquement sur les pages de lecture d'une œuvre.

---

### Nettoyage

Lors de sa désactivation, le module :

- annule le défilement en cours ;
- retire le widget flottant ;
- supprime les écouteurs d'interaction.

---

## Dépendances

Le sous-module est initialisé par `_chapterNavigation.js`.

Il fonctionne indépendamment des autres sous-modules de navigation.

---

# chapterWordCount.js

## Rôle

Affiche une estimation du nombre de mots de chaque chapitre directement sur la page de lecture.

---

## Fonctionnalités

### Badge du nombre de mots

Le module ajoute un badge à chaque chapitre.

Le badge utilise un format abrégé, par exemple :

- `~ 5.2K words`

Pour une œuvre composée d'un seul chapitre, un seul badge est affiché.

Pour une œuvre composée de plusieurs chapitres, un badge est ajouté à chaque chapitre.

---

### Comptage du contenu

Le module compte uniquement le texte principal de l'histoire.

Il exclut :

- la préface ;
- le résumé ;
- les notes de l'auteur ;
- les notes de fin.

---

### Compatibilité avec le contenu dynamique

Le module effectue plusieurs tentatives afin de prendre en charge :

- les insertions tardives dans le DOM ;
- certains skins personnalisés ;
- les pages dont le contenu apparaît après l'initialisation.

---

## Détails techniques

### Format

Le résultat utilise un format abrégé.

Exemples :

- `~ 950 words`
- `~ 5.2K words`

Le résultat n'utilise pas de séparateurs de milliers.

---

### Configuration

Le sous-module ne possède aucun réglage utilisateur.

Son comportement est fixe et sert uniquement à l'affichage.

---

### Enregistrement

Le sous-module est enregistré avec :

- l'identifiant `chapterWordCount` ;
- le parent `chapterNavigation`.

---

### Nettoyage

Lors de sa désactivation, le module supprime tous les badges ajoutés.

---

## Dépendances

Le sous-module est enregistré séparément via `register()` mais appartient au module parent `chapterNavigation`.

Le badge qu'il affiche est partagé (`lib/ui/badges.js`) avec le module `workLength` : `readingTime.js` y ajoute la partie "temps de lecture" (`~X min`) à côté du nombre de mots — voir la spec "Estimation du temps de lecture" plus bas, déjà couverte par cette intégration.

---

# chaptersPanel.js

## Rôle

Fournit le bouton flottant "📑 Chapters" et le panneau qui s'ouvre depuis celui-ci : recherche de chapitre, mini-carte de progression, favoris, notes personnelles, chapitres récents et copie de lien.

---

## Fonctionnalités

### Bouton flottant

Un bouton "📑 Chapters" est ajouté sur les pages d'œuvres multi-chapitres. Un clic ouvre ou ferme le panneau ; un clic en dehors du panneau, ou la touche **Échap**, le referme aussi.

---

### Recherche de chapitre

Un champ de recherche filtre la liste par numéro ou par titre de chapitre (insensible à la casse), en réutilisant `filterChapters()` de `chaptersPanelHelpers.js`.

---

### Mini-carte de progression

Chaque ligne de la liste affiche un indicateur :

- **✓** pour un chapitre déjà lu ;
- **📍** pour le chapitre en cours ;
- rien pour un chapitre non lu.

Le statut "lu" est approximé à partir du dernier chapitre connu de `W.AO3H_ReadingTracker?.getProgress(workId)` (ou de son repli `localStorage`) : tout chapitre dont le numéro est inférieur ou égal à ce dernier chapitre est considéré comme lu. Chaque ligne est cliquable pour sauter directement au chapitre correspondant.

---

### Raccourcis rapides

Le panneau propose deux boutons en haut de la liste :

- **▶ First unread** : le premier chapitre non lu ;
- **⏭ Last chapter** : le dernier chapitre de l'œuvre.

---

### Favoris et notes personnelles

Chaque ligne dispose de deux boutons :

- une étoile ☆/★ pour marquer un chapitre comme favori ou "à relire" ;
- une icône 📝 qui ouvre un champ de texte pour une note personnelle sur ce chapitre.

Ces informations sont stockées ensemble, par œuvre, sous `ao3h:cn:marks:{workId}`.

---

### Chapitres récents

Une section "Recent" liste les derniers chapitres visités pendant la session de lecture en cours (dès qu'il y en a plus d'un). Elle est stockée dans `sessionStorage` sous `ao3h:cn:recent:{workId}` : ça n'a de sens que pour les allers-retours de la session actuelle, pas comme historique permanent (ce rôle appartient à `readingTracker`).

---

### Copie de lien

Une icône 🔗 copie dans le presse-papiers l'URL absolue du chapitre correspondant.

---

## Détails techniques

### Stockage

```text
ao3h:cn:marks:{workId}   -- { [chapterId]: { starred, note } }        (localStorage)
ao3h:cn:recent:{workId}  -- [{ id, num, title }, ...], plafonné à 8    (sessionStorage)
```

---

### Nettoyage

Lors de sa désactivation, le module retire le bouton flottant, ferme le panneau s'il est ouvert, et détache les écouteurs `click`/`keydown` posés sur `document`.

---

## Dépendances

Le sous-module est instancié par `_chapterNavigation.js` sur les pages d'œuvres multi-chapitres. Il s'appuie sur les fonctions pures de `chaptersPanelHelpers.js`, et lit optionnellement `W.AO3H_ReadingTracker` (dépendance souple : le panneau fonctionne sans, avec tous les chapitres marqués non lus).

---

# chaptersPanelHelpers.js

## Rôle

Regroupe la logique pure du panneau de chapitres, testée indépendamment du DOM.

---

## Fonctions exposées

- `parseChapterOptions(options)` — extrait `{id, num, title}` depuis les options du menu déroulant natif d'AO3 (format `"N. Titre"`).
- `filterChapters(chapters, query)` — filtre par numéro ou titre.
- `buildChapterStates(chapters, { currentId, lastReadNum })` — ajoute un `state` (`current`/`read`/`unread`) à chaque chapitre.
- `firstUnreadChapter(chapters, lastReadNum)` — le chapitre suivant le dernier lu (ou le premier chapitre si rien n'a été lu).
- `addRecentEntry(list, entry, cap)` — ajoute une entrée à une liste "récents", dédupliquée et plafonnée.
- `buildBreadcrumbText(workTitle, num, title)` — construit le texte du fil d'Ariane.
- `prependChapterToTitle(originalTitle, num, total)` — construit le titre d'onglet préfixé par la position du chapitre.

---

## Dépendances

Aucune — fonctions pures sans accès au DOM ni au stockage, utilisées par `chaptersPanel.js` et `navigationControls.js`.

---

# chapterNavigation.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Chapter Navigation**.

Il définit notamment l'apparence :

- de la barre de navigation collante ;
- de l'indicateur **Chapter X of Y** ;
- des boutons **Start**, **Continue** et **Last** ;
- du widget de défilement automatique ;
- des badges du nombre de mots ;
- du fil d'Ariane et du titre de chapitre mis en avant ;
- du bouton flottant et du panneau "📑 Chapters" (recherche, mini-carte, favoris, notes).

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans d'autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## Navigation entre les chapitres

### Menu enrichi des chapitres

Remplacer le simple sélecteur numérique par un menu affichant :

- le numéro du chapitre ;
- son titre ;
- un aperçu de son contenu.

**✅ Fait (partiel)** — le panneau "📑 Chapters" (`chaptersPanel.js`) liste numéro et titre de chaque chapitre, sans coût réseau puisqu'ils sont déjà dans le `<select>` natif d'AO3. L'aperçu de contenu a été écarté (voir Décisions de conception) : il nécessiterait de télécharger chaque chapitre séparément.

---

### Recherche de chapitre

Permettre de rechercher un chapitre à partir :

- de son numéro ;
- de son titre.

**✅ Fait** — champ de recherche du panneau "📑 Chapters" (`filterChapters()`).

---

### Fil d'Ariane

Afficher un chemin de navigation comme :

- Œuvre > Chapitre 5 > Titre du chapitre

**✅ Fait** — `navigationControls.js`, réglage `showBreadcrumb`.

---

### Liens directs

Ajouter un lien copiable permettant d'accéder directement à chaque chapitre.

**✅ Fait** — icône 🔗 par ligne dans le panneau "📑 Chapters".

---

### Bouton flottant Chapters

Ajouter un bouton flottant **📑 Chapters** sur les pages de lecture.

Ce bouton pourrait permettre :

- d'ouvrir rapidement la liste des chapitres ;
- d'aller au premier chapitre non lu ;
- d'aller directement au dernier chapitre grâce à un raccourci clavier.

**✅ Fait** — c'est `chaptersPanel.js` : boutons "▶ First unread" / "⏭ Last chapter" dans le panneau, et raccourcis clavier Ctrl+Maj+Origine/Fin.

---

### Raccourcis clavier supplémentaires

Ajouter davantage de raccourcis personnalisables pour naviguer entre les chapitres.

**✅ Fait** — Ctrl+Maj+Origine (premier non lu) et Ctrl+Maj+Fin (dernier chapitre) ajoutés à côté de Ctrl+Flèches.

---

### Navigation vocale

Permettre de changer de chapitre à la voix afin de naviguer sans utiliser les mains.

**❌ Écarté** — accès micro permanent peu fiable pour un bénéfice limité en lecture.

---

## Suivi des chapitres

### Chapitres favoris

Permettre de marquer certains chapitres comme :

- favoris ;
- à relire.

**✅ Fait** — étoile ☆/★ par chapitre dans le panneau "📑 Chapters", stockée sous `ao3h:cn:marks:{workId}`.

---

### Notes personnelles

Permettre d'ajouter une note personnelle à un chapitre précis.

**✅ Fait** — icône 📝 par chapitre dans le même panneau et le même stockage.

---

### Historique récent

Afficher la liste des chapitres consultés récemment.

**✅ Fait** — section "Recent" du panneau, limitée à la session en cours (`ao3h:cn:recent:{workId}`, `sessionStorage`) ; l'historique permanent inter-sessions reste le rôle de `readingTracker`.

---

### Indicateurs de lecture

Afficher des marqueurs visuels permettant de distinguer :

- les chapitres lus ;
- les chapitres non lus ;
- le chapitre actuellement consulté.

Ces indicateurs pourraient inclure :

- des points visuels ;
- des marques de complétion `✓` ;
- un repère **Tu es ici**.

**✅ Fait** — mini-carte du panneau : ✓ (lu), 📍 (en cours), vide (non lu), lecture approximée depuis `W.AO3H_ReadingTracker`.

---

### Mini-carte de progression

Afficher une carte compacte de tous les chapitres.

Elle permettrait :

- de visualiser la progression ;
- de cliquer sur un chapitre pour y accéder ;
- d'identifier le chapitre courant.

**✅ Fait** — même mini-carte que ci-dessus ; chaque ligne est cliquable.

---

## Informations sur les chapitres

### Estimation du temps de lecture

Afficher une estimation du temps nécessaire pour lire chaque chapitre.

**✅ Fait (déjà couvert ailleurs)** — `workLength`/`readingTime.js` calcule et affiche déjà "~X min" par chapitre, sur le même badge partagé que `chapterWordCount.js`.

---

### Comparaison des longueurs

Comparer les chapitres entre eux et afficher :

- le chapitre le plus long ;
- le chapitre le plus court ;
- la longueur moyenne ;
- un petit graphique comparatif.

**❌ Écarté** — nécessiterait de télécharger chaque chapitre séparément (AO3 n'affiche que le chapitre courant par défaut), coût réseau jugé excessif pour un simple comparatif.

---

### Titre dans l'onglet

Afficher le titre du chapitre en cours dans le titre de l'onglet du navigateur.

**✅ Fait** — réglage `tabTitleChapter`, désactivé par défaut.

---

### Mise en évidence du titre

Rendre le titre du chapitre courant plus visible ou plus grand sur la page.

**✅ Fait** — réglage `emphasizeChapterTitle`.

---

## Expérience de lecture

### Objectifs de lecture

Permettre à l'utilisateur de définir des objectifs basés sur le nombre de chapitres lus.

**❌ Écarté** — même raisonnement que `readingDashboard`, qui a déjà écarté objectifs/statistiques de session comme peu fiables à mesurer et anti-gamification.

---

### Transitions personnalisées

Ajouter des animations ou transitions lors du changement de chapitre.

**❌ Écarté** — changer de chapitre est une vraie navigation de page AO3 (pas une SPA) ; animer la transition nécessiterait d'intercepter la navigation du site, trop fragile et invasif.

---

### Préchargement

Charger le chapitre suivant en arrière-plan afin qu'il s'ouvre plus rapidement.

**✅ Fait** — indice `<link rel="prefetch">` vers le chapitre suivant, réglage `prefetchNextChapter`.

---

### Journal de lecture

Combiner le défilement automatique avec un journal de lecture afin d'obtenir un résumé détaillé de chaque session.

**❌ Écarté** — dépend d'un "journal de lecture" qui n'existe pas encore ; `readingTracker` n'a pas de suivi de durée/notes de session, cette spec n'y est pas résolue non plus.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Chargement de l'œuvre entière

Le module ne charge pas automatiquement l'œuvre complète selon sa longueur.

Cette fonctionnalité a été volontairement écartée.

---

## Statistiques de lecture

Le module ne contient pas de tableau de bord de statistiques.

Les statistiques de lecture appartiennent à un autre module, car **Chapter Navigation** doit rester centré sur la navigation.

---

## Position libre des boutons

Les boutons de navigation ne peuvent pas être déplacés librement sur l'écran.

Cette fonctionnalité a été jugée trop complexe à configurer pour un bénéfice limité.

---

## Aperçus de contenu dans le menu des chapitres

Le menu des chapitres affiche uniquement numéro et titre, pas d'extrait du texte de chaque chapitre.

Un aperçu de contenu nécessiterait de télécharger chaque chapitre séparément (AO3 n'affiche que le chapitre courant par défaut), ce qui a été jugé trop coûteux en requêtes réseau pour ce que ça apporte.

---

## Navigation vocale

Le module ne propose pas de navigation à la voix entre les chapitres.

Cette fonctionnalité nécessiterait un accès micro permanent, peu fiable, pour un bénéfice limité en contexte de lecture.

---

## Objectifs de lecture

Le module ne propose pas de se fixer des objectifs basés sur le nombre de chapitres lus.

Même raisonnement que `readingDashboard`, qui a déjà écarté les objectifs et statistiques de session comme peu fiables à mesurer et allant à l'encontre de l'esprit anti-gamification du projet.

---

## Comparaison des longueurs de chapitres

Le module ne compare pas la longueur des chapitres entre eux.

Cette fonctionnalité nécessiterait elle aussi de télécharger chaque chapitre séparément, pour un coût réseau jugé excessif.

---

## Transitions animées entre chapitres

Le module n'anime pas le changement de chapitre.

Changer de chapitre correspond à une vraie navigation de page AO3, pas à une application monopage (SPA). Animer une transition entre deux pages différentes nécessiterait d'intercepter la navigation du site, ce qui a été jugé trop fragile et invasif.

---

## Journal de lecture combiné au défilement automatique

Le module ne combine pas le défilement automatique avec un résumé détaillé de session.

Cette fonctionnalité dépend d'un "journal de lecture" qui n'existe pas encore : `readingTracker` n'a pas de suivi de durée ou de notes de session, cette spec n'y est pas non plus résolue.

---

# Précision historique

Certaines anciennes documentations indiquent que `navigationControls.js` et `autoScroll.js` n'avaient jamais été créés.

Cette information n'est plus correcte.

Les deux fichiers existent maintenant et sont pleinement implémentés :

- `navigationControls.js`
- `autoScroll.js`