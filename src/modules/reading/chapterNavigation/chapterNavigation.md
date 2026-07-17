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



AO3 Helper - Chapter Navigation Module Coordinator
    Module ID: chapterNavigation
    Display Name: Chapter Navigation
    Tab: Reading

    Submodules (imported directly as ES modules):
        ./navigationControls.js -- sticky nav, chapter label, shortcuts, cache
        ./blurbNavigation.js    -- Start/Continue/Last buttons on listings
        ./autoScroll.js         -- auto-scroll widget (work pages)

    Registered child module (register(), parent: 'chapterNavigation'):
        chapterWordCount  -- "~ X.XK words" badge per chapter

    Storage:
        ao3h:cn:lastchap:{workId} -- { id, num } written on work-page load

    Integration (loose coupling):
        W.AO3H_ReadingTracker?.getProgress(workId)
        W.AO3H_KeyboardShortcuts (Ctrl+Left / Ctrl+Right) — migré (Phase 21,
        navigate/keyboardShortcuts) ; le bridge window reste le contrat jusqu'à la Phase 26

    Config keys:
        stickyNav, resumeButton, lastChapterBtn
        autoScrollSpeed, autoScrollAutoAdvance, autoScrollShowControls


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
//   - Keyboard shortcuts: Ctrl+← previous chapter, Ctrl+→ next chapter
//   - Cleanup: removes sticky class, label, and unregisters shortcuts
//
// Config keys (passed via parent diOpts.cfg):
//   stickyNav  (bool, default false)  — make navigation bar sticky


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
    - afficher le nombre de mots de chaque chapitre.

---

# Réglages utilisateur

| Réglage                   | Description                                                           |
|---------------------------|-----------------------------------------------------------------------|
| `stickyNav`               | Garde la barre Précédent / Suivant visible pendant la lecture.        |
| `resumeButton`            | Affiche un bouton **Start** ou **Continue** sur les listes de fics.   |
| `lastChapterBtn`          | Affiche un bouton **Last (Ch X)** sur les listes.                     |
| `autoScrollShowControls`  | Affiche les contrôles du défilement automatique.                      |
| `autoScrollSpeed`         | Vitesse du défilement automatique (pixels/seconde).                   |
| `autoScrollAutoAdvance`   | Passe automatiquement au chapitre suivant en fin de page.             |

---

# Structure du module

Le module est composé de quatre sous-modules fonctionnels, d'un sous-module enregistré et d'une feuille de style.

```
_chapterNavigation.js
navigationControls.js
blurbNavigation.js
autoScroll.js
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
- désenregistre les raccourcis clavier.

---

## Dépendances

Le sous-module est initialisé par `_chapterNavigation.js`.

Il partage le cache du dernier chapitre avec `blurbNavigation.js`.

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

---

# chapterNavigation.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Chapter Navigation**.

Il définit notamment l'apparence :

- de la barre de navigation collante ;
- de l'indicateur **Chapter X of Y** ;
- des boutons **Start**, **Continue** et **Last** ;
- du widget de défilement automatique ;
- des badges du nombre de mots.

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

---

### Recherche de chapitre

Permettre de rechercher un chapitre à partir :

- de son numéro ;
- de son titre.

---

### Fil d'Ariane

Afficher un chemin de navigation comme :

- Œuvre > Chapitre 5 > Titre du chapitre

---

### Liens directs

Ajouter un lien copiable permettant d'accéder directement à chaque chapitre.

---

### Bouton flottant Chapters

Ajouter un bouton flottant **📑 Chapters** sur les pages de lecture.

Ce bouton pourrait permettre :

- d'ouvrir rapidement la liste des chapitres ;
- d'aller au premier chapitre non lu ;
- d'aller directement au dernier chapitre grâce à un raccourci clavier.

---

### Raccourcis clavier supplémentaires

Ajouter davantage de raccourcis personnalisables pour naviguer entre les chapitres.

---

### Navigation vocale

Permettre de changer de chapitre à la voix afin de naviguer sans utiliser les mains.

---

## Suivi des chapitres

### Chapitres favoris

Permettre de marquer certains chapitres comme :

- favoris ;
- à relire.

---

### Notes personnelles

Permettre d'ajouter une note personnelle à un chapitre précis.

---

### Historique récent

Afficher la liste des chapitres consultés récemment.

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

---

### Mini-carte de progression

Afficher une carte compacte de tous les chapitres.

Elle permettrait :

- de visualiser la progression ;
- de cliquer sur un chapitre pour y accéder ;
- d'identifier le chapitre courant.

---

## Informations sur les chapitres

### Estimation du temps de lecture

Afficher une estimation du temps nécessaire pour lire chaque chapitre.

---

### Comparaison des longueurs

Comparer les chapitres entre eux et afficher :

- le chapitre le plus long ;
- le chapitre le plus court ;
- la longueur moyenne ;
- un petit graphique comparatif.

---

### Titre dans l'onglet

Afficher le titre du chapitre en cours dans le titre de l'onglet du navigateur.

---

### Mise en évidence du titre

Rendre le titre du chapitre courant plus visible ou plus grand sur la page.

---

## Expérience de lecture

### Objectifs de lecture

Permettre à l'utilisateur de définir des objectifs basés sur le nombre de chapitres lus.

---

### Transitions personnalisées

Ajouter des animations ou transitions lors du changement de chapitre.

---

### Préchargement

Charger le chapitre suivant en arrière-plan afin qu'il s'ouvre plus rapidement.

---

### Journal de lecture

Combiner le défilement automatique avec un journal de lecture afin d'obtenir un résumé détaillé de chaque session.

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

# Précision historique

Certaines anciennes documentations indiquent que `navigationControls.js` et `autoScroll.js` n'avaient jamais été créés.

Cette information n'est plus correcte.

Les deux fichiers existent maintenant et sont pleinement implémentés :

- `navigationControls.js`
- `autoScroll.js`