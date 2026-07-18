# readingFormatter

**Tab:** Reading

## À quoi ça sert

Ce module regroupe tous les outils qui améliorent la mise en forme et le
confort de lecture du texte des fics : nettoyage automatique du texte,
petites corrections de typographie, séparateurs de scène uniformisés, un
mode de lecture épuré, et un panneau flottant pour régler la largeur,
l'espacement et la taille du texte.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `autoCleanFormatting` | activé | Corrige les doubles espaces, les sauts de ligne mal placés, les paragraphes vides et les espaces insécables de copier-coller |
| `removeBoldExcessive` | désactivé | Retire le gras si un paragraphe entier est en gras |
| `convertSlashItalic` | désactivé | Convertit le texte entre barres obliques (`/texte/`) en italique |
| `unifySceneBreaks` | activé | Uniformise les séparateurs de scène |
| `sceneBreakStyle` | `✦ ✦ ✦` | Le style de séparateur utilisé (texte libre) |
| `splitTextWalls` | désactivé | Découpe les très longs paragraphes ("murs de texte") aux frontières de phrases |
| `hideEmbeddedImages` | désactivé | Cache les images intégrées dans le texte (mode texte seul) |
| `sansSerifFont` | désactivé | Force une police sans empattements sur toute la fic |
| `cleanReadingMode` | désactivé | Réduit la largeur du texte et cache les éléments secondaires de la page |
| `textAlignment` | `left` | L'alignement du texte : gauche, justifié, ou centré |
| `paragraphSpacing` | `0.5em` | L'espace supplémentaire entre les paragraphes |
| `breatheMode` | désactivé | Interligne élargi automatiquement sur les longs paragraphes |
| `readingRuler` | désactivé | Une bande horizontale semi-transparente suit le pointeur pour ne pas perdre sa ligne |
| `highlightDialogue` | désactivé | Teinte discrète sur les répliques entre guillemets |
| `endOfWorkInfo` | désactivé | Répète le titre, l'auteur et les tags principaux en bas de la fic |
| `perWorkPrefs` | désactivé | Mémorise les réglages du panneau Aa par œuvre plutôt que globalement |

## Fichiers

### 1. `_readingFormatter.js` — le chef d'orchestre

- Prépare les réglages et les outils communs utilisés par tous les autres fichiers de ce module

### 2. `content.js` — nettoyage et confort du contenu

Regroupe deux sous-fonctionnalités (chacune reste activable/désactivable séparément dans le panneau) :
- **Content Cleanup** : corrige les doubles espaces et les sauts de ligne mal placés, masque les paragraphes vides et normalise les espaces insécables de copier-coller, peut cacher les images intégrées (mode texte seul) et découper les murs de texte (`splitTextWalls`)
- **Reading View Optimization** : choisit l'alignement du texte (gauche, justifié, centré), ajoute un espace supplémentaire entre les paragraphes, et porte les ajouts chantier 4 : mode Breathe, règle de lecture, rappel d'infos en fin d'œuvre

### 3. `appearance.js` — apparence visuelle

Regroupe trois sous-fonctionnalités (chacune reste activable/désactivable séparément dans le panneau) :
- **Typography** : convertit le texte entre barres obliques (`/texte/`) en italique, retire le gras si un paragraphe entier est en gras, peut forcer une police sans empattements, et peut teinter les dialogues (`highlightDialogue`)
- **Spacing and Structure** : remplace les séparateurs de scène (`***`, `---`, `~~~`...) par le symbole choisi (`sceneBreakStyle`, défaut ✦ ✦ ✦)
- **Layout and Display Modes** : réduit la largeur du texte et cache les éléments secondaires de la page (mode de lecture épuré)

### 4. `readingControls.js` — le panneau flottant "Aa"

- Ajoute un bouton "Aa" sur les pages de fic pour ouvrir un panneau de réglages rapides
- Permet de choisir la largeur du texte, l'espacement des lignes, la taille du texte, et de retirer l'indentation des paragraphes
- Avec `perWorkPrefs`, ces choix sont mémorisés par œuvre (repli sur la valeur globale)

### 5. `readingFormatterHelpers.js` — calculs purs (ajouté au passage chantier 4)

- Détection des paragraphes longs (mode Breathe), découpage des murs de texte aux frontières de phrases, nettoyage des artefacts de copier-coller (espaces insécables, paragraphes vides), détection des répliques entre guillemets

### 6. `readingFormatter.css`

- Les styles visuels de tous les fichiers ci-dessus (dont les ajouts chantier 4 : Breathe, règle de lecture, dialogues, bloc de fin d'œuvre)

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs. État après le passage
chantier 4 (2026-07-18) :

- ~~Le mode "Breathe" (espacement de ligne augmenté automatiquement sur les longs paragraphes)~~ ✅ Fait — réglage `breatheMode` : les paragraphes de 600+ caractères reçoivent un interligne élargi (classe posée par `readingViewOptimization`, seuil dans `readingFormatterHelpers.js`)
- ~~Des règles de formatage personnalisées avec des motifs de recherche~~ ✅ Fait (déjà couvert ailleurs) — c'est exactement le module `wordSwap` : règles find/replace personnalisées avec support regex, sensibilité à la casse, mot entier, import/export
- ~~Des profils de formatage différents selon l'auteur·ice~~ ❌ Écarté — niche et lourd (une UI de gestion de profils + stockage par auteur) ; les préférences par œuvre (ci-dessous) couvrent le besoin concret de "cette fic se lit mal avec mes réglages habituels"
- ~~Pouvoir annuler ses changements de formatage après coup~~ ✅ Fait (déjà le cas) — toutes les transformations sont réversibles : chaque sous-module garde une carte de restauration (texte original, éléments remplacés) et désactiver le réglage restaure l'état d'origine sans recharger
- ~~Choisir son propre style de séparateur de scène, au lieu du symbole fixe~~ ✅ Fait — réglage `sceneBreakStyle` (texte libre, défaut `✦ ✦ ✦`)
- ~~Reconnaître plusieurs styles de dialogue (guillemets, tirets...) et les uniformiser~~ ❌ Écarté — réécrire la ponctuation de l'auteur·ice sur la base d'une détection incertaine (guillemets vs citations, tirets vs incises) altère l'œuvre ; même famille que la conversion de guillemets déjà écartée ("jugé trop spécifique")
- ~~Un mode "confort" avec des couleurs plus douces et apaisantes, et la possibilité de flouter les passages associés à un avertissement~~ ❌ Écarté — les couleurs de page sont le rôle de `themeBuilder` (thèmes complets) et `visualPreferences` ; et rien ne relie un passage précis du texte à un avertissement de l'œuvre (les warnings sont des métadonnées globales), le floutage ciblé est donc impossible sans données
- ~~Se souvenir des préférences de formatage différemment pour chaque œuvre~~ ✅ Fait — réglage `perWorkPrefs` : les préférences du panneau Aa (largeur/espacement/taille/indentation) sont stockées par œuvre, avec repli sur la valeur globale
- ~~Une détection plus poussée des guillemets et apostrophes~~ ❌ Écarté — même famille que la conversion de guillemets déjà écartée ("jugé trop spécifique")
- ~~Voir un aperçu avant d'appliquer un changement, avec possibilité d'annuler/refaire~~ ❌ Écarté — les transformations sont déjà réversibles en direct (cocher/décocher le réglage EST l'aperçu) ; une UI d'aperçu/undo-redo séparée dupliquerait ça en plus lourd
- ~~Détecter les gros blocs de texte sans paragraphes ("murs de texte") et ajouter des sauts de paragraphe automatiquement~~ ✅ Fait — réglage `splitTextWalls` : les paragraphes de 1500+ caractères sans balisage interne sont découpés aux frontières de phrases (~500 caractères par morceau), réversible (`splitWallText` dans les helpers)
- ~~Répéter le titre, l'auteur et les tags en bas de la fic, pour les avoir sous la main juste après avoir fini de lire~~ ✅ Fait — réglage `endOfWorkInfo` : bloc titre — auteur + tags principaux (12 max) inséré après le texte
- ~~Une règle de lecture qui suit les yeux : une ligne horizontale semi-transparente pour ne pas perdre sa ligne en lisant~~ ✅ Fait — réglage `readingRuler` : bande horizontale semi-transparente qui suit le pointeur
- ~~Ajouter automatiquement un saut de ligne avant chaque ligne de dialogue, pour les fics écrites sans retour à la ligne~~ ❌ Écarté — même raison que l'uniformisation des dialogues : deviner où commence une réplique est trop peu fiable pour modifier le découpage de l'auteur·ice ; le découpage des murs de texte (ci-dessus) couvre le cas des blocs illisibles sans deviner les dialogues
- ~~Mettre en valeur visuellement les dialogues (le texte parlé) pour mieux les distinguer du reste du texte~~ ✅ Fait — réglage `highlightDialogue` : les répliques entre guillemets (typographiques ou droits appariés) reçoivent une teinte discrète, sans toucher au texte (`findDialogueSpans` dans les helpers)
- ~~Nettoyer les paragraphes complètement vides et les espaces bizarres laissés par un copier-coller (par exemple depuis Word)~~ ✅ Fait — intégré à `autoCleanFormatting` : les paragraphes de pur remplissage sont masqués et les espaces insécables résiduels (U+00A0/U+2007/U+202F) normalisés, le tout réversible
- ~~Un réglage de densité de l'interface (compacte / normale / spacieuse) qui s'applique à toutes les pages d'AO3, pas seulement à la lecture d'une fic~~ ❌ Écarté — c'est la généralisation du "mode interface compacte" déjà explicitement écarté ("trop de modes différents à gérer") ; même décision
- ~~Pouvoir surligner ou marquer certains passages du texte pendant la lecture, pour les retrouver facilement plus tard~~ ❌ Écarté — la persistance de surlignages ancrés dans le texte est fragile (le texte change quand l'auteur·ice édite, les ancres DOM ne survivent pas d'une version à l'autre), et l'annotation relève d'un outil de notes (`bookmarkVault` a déjà des notes riches par œuvre), pas d'un formateur de texte

## Explicitement écarté

- Convertir automatiquement les guillemets selon la langue (par exemple guillemets français) — jugé trop spécifique
- Un mode plein écran — le navigateur le fait déjà
- Un mode "interface compacte" — trop de modes différents à gérer
- Avoir les réglages de taille de texte à deux endroits différents (dans les options et dans le panneau Aa) — un seul endroit suffit, le panneau Aa
- Pouvoir cacher complètement le bouton Aa — il reste toujours visible, juste réduit par défaut

## Précision

⚠️ Les docs historiques décrivent une version plus ancienne du code, avec 5
sous-fichiers presque vides et un fichier en double avec un autre. Ce n'est
plus le cas. Les 6 sous-fonctionnalités qui existaient chacune dans leur
propre fichier ont depuis été regroupées par thème dans `content.js` (2
sous-fonctionnalités) et `appearance.js` (3 sous-fonctionnalités) — chacune
garde son propre interrupteur indépendant dans le panneau, seule
l'organisation des fichiers a changé.


AO3 Helper - Reading Formatter Module Coordinator
    Module ID: readingFormatter
    Display Name: Reading Formatter
    Tab: Reading

    Settings (delegated to submodules):
        autoCleanFormatting  -- fix double spaces, <br><br> sequences, empty <p>,
                                nbsp paste artifacts (contentCleanup)
        hideEmbeddedImages   -- hide <img> tags in work content (contentCleanup)
        splitTextWalls       -- split 1500+ char plain paragraphs at sentence
                                boundaries, reversible (contentCleanup, chantier 4)
        removeBoldExcessive  -- strip <strong> from paragraphs (typography)
        convertSlashItalic   -- /text/ -> <em>text</em> (typography)
        sansSerifFont        -- CSS override to sans-serif on #workskin (typography)
        highlightDialogue    -- tint quoted speech spans (typography, chantier 4)
        unifySceneBreaks     -- *** / --- / ~~~ -> sceneBreakStyle (spacingAndStructure)
        sceneBreakStyle      -- separator text, default ✦ ✦ ✦ (chantier 4)
        cleanReadingMode     -- narrow max-width, hide secondary chrome (layoutAndDisplayModes)
        textAlignment        -- left / justify / center (readingViewOptimization)
        paragraphSpacing     -- margin-block between <p> elements (readingViewOptimization)
        breatheMode          -- wider line-height on 600+ char paragraphs (chantier 4)
        readingRuler         -- pointer-following horizontal band (chantier 4)
        endOfWorkInfo        -- title/author/tags repeated below the work (chantier 4)
        perWorkPrefs         -- Aa panel prefs scoped per work id (readingControls, chantier 4)

    Submodules (Tier 2 — self-register with parent: 'readingFormatter', discovered
    independently by src/modules.js's import.meta.glob, booted automatically
    by the cascade logic already built into core/lifecycle.js's bootOne()).
    Regroupées en 2 fichiers par thème (chaque sous-module garde son propre
    register(), donc reste activable/désactivable indépendamment) :
        content.js    -- contentCleanup (autoCleanFormatting, hideEmbeddedImages)
                      -- readingViewOptimization (textAlignment, paragraphSpacing)
        appearance.js -- typography (removeBoldExcessive, convertSlashItalic, sansSerifFont)
                      -- spacingAndStructure (unifySceneBreaks)
                      -- layoutAndDisplayModes (cleanReadingMode)
        readingControls.js -- floating Aa panel (width / spacing / scale / indent)

    Shared API (W.AO3H_RF, set before submodule cascade):
        NS, ROOT_CLS, SANSSERIF_CLS, CLEAN_CLS, NOINDENT_CLS
        cfg(key), isWorkPage(), prefGet(key, def), prefSet(key, val), walkTextNodes(el, fn)

    Dependencies: themeBuilder (optional, accent colours) — migré (Phase 24, étape 290) ;
    accès via le bridge W.AO3H_ThemeBuilder, conservé jusqu'à la Phase 26



    AO3 Helper - Appearance Submodule
    Parent: readingFormatter
    Regroupe trois sous-modules de réglages d'apparence visuelle (fusionnés —
    même parent, même utilitaire cfg(), tous des réglages d'apparence) :

    typography (Submodule ID: typography, Display Name: Typography)
      Handles font-level transforms on work pages:
        - convertSlashItalic  : /text/ → <em>text</em>
        - removeBoldExcessive : strip <strong> when >60% of paragraph is bold
        - sansSerifFont       : CSS override to sans-serif on #workskin

    spacingAndStructure (Submodule ID: spacingAndStructure,
    Display Name: Spacing and Structure)
      Handles visual scene separators on work pages:
        - unifySceneBreaks : replace *** / --- / ~~~ sequences with ✦ ✦ ✦

    layoutAndDisplayModes (Submodule ID: layoutAndDisplayModes,
    Display Name: Layout and Display Modes)
      Handles global CSS class overrides on all pages:
        - cleanReadingMode : narrow max-width, hide secondary chrome

    Chaque sous-module garde son propre register() — activable/désactivable
    indépendamment dans le panneau, comme avant la fusion.
    Reads config from parent module (readingFormatter).
    Shares utilities via W.AO3H_RF set up by coordinator.


    AO3 Helper - Content Submodule
    Parent: readingFormatter
    Regroupe deux sous-modules qui réduisent le bruit visuel du contenu d'une
    fic (fusionnés — même parent, même utilitaire cfg(), responsabilités
    proches) :

    contentCleanup (Submodule ID: contentCleanup, Display Name: Content Cleanup)
      Handles structural DOM fixes on work pages:
        - autoCleanFormatting : fix double spaces (text nodes) +
                                mark double-<br> sequences
        - hideEmbeddedImages  : hide <img> tags embedded in work content
                                (text-only mode, bandwidth saving)

    readingViewOptimization (Submodule ID: readingViewOptimization,
    Display Name: Reading View Optimization)
      Handles per-config CSS tweaks on work pages:
        - textAlignment    : text-align for .userstuff content
                             Setting: `textAlignment` ('left' | 'justify' | 'center',
                             default: 'left')
        - paragraphSpacing : extra margin-block between <p> elements
                             Setting: `paragraphSpacing` (string, default: '0.5em')

    Chaque sous-module garde son propre register() — activable/désactivable
    indépendamment dans le panneau, comme avant la fusion.
    Reads config from parent module (readingFormatter).
    Shares utilities via W.AO3H_RF set up by coordinator.


    AO3 Helper - Reading Controls Submodule
    Submodule ID: readingControls
    Parent: readingFormatter
    Display Name: Reading Controls

    Floating Aa panel on work pages:
        Reading width: Default / Narrow / Book / Medium / Wide
        Line spacing:  Compact / Normal / Spacious
        Font size:     A− / A+ (0.85–1.4 scale)
        Indent toggle: remove first-line indentation

    Persistent prefs (localStorage, bypassing Settings API):
        readingFormatter:width, :spacing, :scale, :indent

    Reads config and shared utilities from W.AO3H_RF (set by coordinator).


    
═══════════════════════════════════════════════════════════════════════════
  # readingFormatter
  **Tab :** Reading
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Reading Formatter** regroupe les outils qui améliorent la mise en forme et le confort de lecture des fics sur AO3.

* Il permet notamment de :
  - nettoyer automatiquement le contenu du texte ;
  - corriger certaines imperfections typographiques ;
  - uniformiser les séparateurs de scène ;
  - masquer les images intégrées au texte ;
  - personnaliser l'alignement et l'espacement des paragraphes ;
  - utiliser une police sans empattements ;
  - activer un mode de lecture épuré ;
  - ajuster rapidement la largeur, la taille et l'espacement du texte grâce à un panneau flottant « Aa ».

---

# Réglages utilisateur

| Réglage               | Description                                                               |
| --------------------- | --------------------------------------------------------------------------|
| `autoCleanFormatting` | Corrige les doubles espaces et les sauts de ligne mal placés.             |
| `removeBoldExcessive` | Retire le gras lorsqu'un paragraphe entier est en gras.                   |
| `convertSlashItalic`  | Convertit le texte entre barres obliques (`/texte/`) en italique.         |
| `unifySceneBreaks`    | Uniformise les séparateurs de scène en `✦ ✦ ✦`.                         |
| `hideEmbeddedImages`  | Masque les images intégrées au texte (mode texte seul).                   |
| `sansSerifFont`       | Force une police sans empattements sur toute la fic.                      |
| `cleanReadingMode`    | Réduit la largeur du texte et masque les éléments secondaires de la page. |
| `textAlignment`       | Définit l'alignement du texte : gauche, justifié ou centré.               |
| `paragraphSpacing`    | Définit l'espace supplémentaire entre les paragraphes.                    |

---

# Structure du module

Le module est composé d'un fichier coordinateur, de trois sous-modules fonctionnels et d'une feuille de style.

```text
_readingFormatter.js
content.js
appearance.js
readingControls.js
readingFormatter.css
```

---

# _readingFormatter.js

## Rôle

Fichier coordinateur du module.

Il prépare les outils communs utilisés par les autres sous-modules, initialise l'ensemble du module, centralise les préférences utilisateur et expose une API interne partagée.

---

## Responsabilités

* Initialise tous les sous-modules.
* Prépare les constantes et utilitaires communs.
* Centralise l'accès à la configuration.
* Fournit les fonctions de lecture et d'enregistrement des préférences.
* Expose les utilitaires nécessaires aux sous-modules.
* Assure la compatibilité avec les anciennes dépendances du module.

---

## Fonctions exposées

Le coordinateur met notamment à disposition, via `W.AO3H_RF` :

* `cfg(key)`
* `isWorkPage()`
* `prefGet(key, defaultValue)`
* `prefSet(key, value)`
* `walkTextNodes(element, callback)`

Il expose également plusieurs constantes communes :

* `NS`
* `ROOT_CLS`
* `SANSSERIF_CLS`
* `CLEAN_CLS`
* `NOINDENT_CLS`

---

## Dépendances

Le coordinateur partage ses utilitaires avec tous les sous-modules via `W.AO3H_RF`.

Une compatibilité est conservée avec **Theme Builder** grâce au pont :

```text
W.AO3H_ThemeBuilder
```

Cette dépendance est désormais migrée mais reste maintenue pour assurer la compatibilité avec les versions précédentes.

---

# content.js

## Rôle

Regroupe les fonctionnalités liées au nettoyage du contenu et à l'optimisation de la lecture.

Les deux sous-fonctionnalités conservent leur propre enregistrement (`register()`) et peuvent toujours être activées ou désactivées indépendamment depuis le panneau de configuration.

---

## Fonctionnalités

### Content Cleanup

Améliore automatiquement le contenu des œuvres.

Il permet notamment de :

* corriger les doubles espaces dans les nœuds de texte ;
* corriger les séquences de doubles retours à la ligne ;
* masquer les images intégrées au texte pour obtenir un mode texte seul.

Les réglages associés sont :

* `autoCleanFormatting`
* `hideEmbeddedImages`

---

### Reading View Optimization

Personnalise la présentation du texte sans modifier son contenu.

Il permet notamment de :

* choisir l'alignement du texte :

  * gauche ;
  * justifié ;
  * centré ;
* définir un espacement supplémentaire entre les paragraphes.

Les réglages associés sont :

* `textAlignment`
* `paragraphSpacing`

---

## Détails techniques

Le sous-module :

* agit uniquement sur les pages de lecture ;
* lit sa configuration via le coordinateur ;
* partage les utilitaires communs exposés par `W.AO3H_RF`.

---

## Dépendances

* `_readingFormatter.js`
* `W.AO3H_RF`

---

# appearance.js

## Rôle

Regroupe les fonctionnalités qui modifient l'apparence visuelle du texte.

Les trois sous-fonctionnalités conservent leur propre enregistrement (`register()`) et restent activables indépendamment malgré leur regroupement dans un même fichier.

---

## Fonctionnalités

### Typography

Applique différentes corrections typographiques.

Il permet notamment de :

* convertir le texte entre barres obliques (`/texte/`) en italique ;
* retirer automatiquement les balises `<strong>` lorsqu'un paragraphe est composé à plus de 60 % de texte en gras ;
* appliquer une police sans empattements sur `#workskin`.

Les réglages associés sont :

* `convertSlashItalic`
* `removeBoldExcessive`
* `sansSerifFont`

---

### Spacing and Structure

Uniformise les séparateurs de scène.

Il remplace les séparateurs courants tels que :

* `***`
* `---`
* `~~~`

par un séparateur unique :

```text
✦ ✦ ✦
```

Le réglage associé est :

* `unifySceneBreaks`

---

### Layout and Display Modes

Active un mode de lecture épuré.

Ce mode permet notamment de :

* réduire la largeur maximale du texte ;
* masquer les éléments secondaires de l'interface.

Le réglage associé est :

* `cleanReadingMode`

---

## Détails techniques

Le sous-module :

* lit sa configuration via le coordinateur ;
* partage les utilitaires communs exposés par `W.AO3H_RF`.

---

## Dépendances

* `_readingFormatter.js`
* `W.AO3H_RF`

---

# readingControls.js

## Rôle

Ajoute un panneau flottant « Aa » sur les pages de lecture afin de modifier rapidement les principaux paramètres de lecture.

---

## Fonctionnalités

Le panneau permet de régler :

### Largeur du texte

Plusieurs largeurs sont proposées :

* Default
* Narrow
* Book
* Medium
* Wide

---

### Espacement des lignes

Trois niveaux sont disponibles :

* Compact
* Normal
* Spacious

---

### Taille du texte

Le panneau permet d'augmenter ou de réduire la taille du texte (`A−` / `A+`) dans une plage comprise entre :

* `0.85`
* `1.4`

---

### Indentation

Permet de supprimer l'indentation de première ligne des paragraphes.

---

## Détails techniques

Les préférences sont enregistrées directement dans `localStorage`, sans passer par le système général des réglages.

Les clés utilisées sont :

```text
readingFormatter:width
readingFormatter:spacing
readingFormatter:scale
readingFormatter:indent
```

Le sous-module utilise également les utilitaires fournis par `W.AO3H_RF`.

---

## Dépendances

* `_readingFormatter.js`
* `W.AO3H_RF`

---

# readingFormatter.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Reading Formatter**.

Il définit notamment l'apparence :

* du nettoyage du contenu ;
* des corrections typographiques ;
* des séparateurs de scène ;
* du mode de lecture épuré ;
* du panneau flottant « Aa » ;
* des réglages de largeur, de taille et d'espacement du texte.

---

# Fonctionnalités non implémentées

## Mode Breathe

> ✅ Fait — réglage `breatheMode` : interligne élargi sur les paragraphes
> de 600+ caractères.

Augmenter automatiquement l'espacement des lignes dans les longs paragraphes afin d'améliorer le confort de lecture.

---

## Règles de formatage personnalisées

> ✅ Fait (déjà couvert ailleurs) — c'est le module `wordSwap` : règles
> find/replace avec regex, casse, mot entier, import/export.

Permettre à l'utilisateur de définir ses propres règles de transformation du texte à partir de motifs de recherche.

---

## Profils par auteur

> ❌ Écarté — niche et lourd (UI + stockage par auteur) ; les préférences
> par œuvre (`perWorkPrefs`) couvrent le besoin concret.

Utiliser des profils de formatage différents selon l'auteur d'une œuvre.

---

## Annulation des modifications

> ✅ Fait (déjà le cas) — toutes les transformations gardent une carte de
> restauration ; désactiver le réglage restaure l'origine en direct.

Permettre d'annuler les transformations appliquées au texte après leur exécution.

---

## Séparateurs personnalisés

> ✅ Fait — réglage `sceneBreakStyle` (texte libre, défaut ✦ ✦ ✦).

Permettre de choisir son propre style de séparateur de scène au lieu du symbole fixe `✦ ✦ ✦`.

---

## Uniformisation des dialogues

> ❌ Écarté — réécrire la ponctuation de l'auteur·ice sur détection
> incertaine altère l'œuvre ; même famille que la conversion de guillemets
> déjà écartée.

Reconnaître différents styles de dialogue (guillemets, tirets, etc.) et les uniformiser automatiquement.

---

## Mode confort

> ❌ Écarté — les couleurs sont le rôle de themeBuilder/visualPreferences ;
> et rien ne relie un passage précis à un avertissement (métadonnée globale),
> le floutage ciblé est impossible sans données.

Ajouter un mode de lecture utilisant des couleurs plus douces et permettant notamment de flouter les passages associés à un avertissement.

---

## Préférences par œuvre

> ✅ Fait — réglage `perWorkPrefs` : les réglages du panneau Aa sont
> stockés par œuvre, avec repli sur le global.

Mémoriser les préférences de formatage indépendamment pour chaque œuvre.

---

## Détection avancée de la ponctuation

> ❌ Écarté — même famille que la conversion de guillemets déjà écartée
> (« jugé trop spécifique »).

Améliorer la détection des guillemets et des apostrophes.

---

## Aperçu avant application

> ❌ Écarté — les transformations sont déjà réversibles en direct ;
> cocher/décocher le réglage est l'aperçu.

Afficher un aperçu des transformations avant leur application avec un système d'annulation et de rétablissement.

---

## Détection des murs de texte

> ✅ Fait — réglage `splitTextWalls` : découpage aux frontières de phrases
> (seuil 1500 caractères), réversible.

Identifier les très gros blocs de texte sans paragraphes et insérer automatiquement des sauts de ligne.

---

## Informations en fin de lecture

> ✅ Fait — réglage `endOfWorkInfo` : bloc titre — auteur + tags sous le
> texte de l'œuvre.

Répéter le titre, l'auteur et les tags à la fin de la fic afin de les garder visibles après la lecture.

---

## Guide de lecture

> ✅ Fait — réglage `readingRuler` : bande semi-transparente suivant le
> pointeur.

Ajouter une ligne horizontale semi-transparente suivant les yeux du lecteur afin de faciliter le suivi du texte.

---

## Dialogue automatique

> ❌ Écarté — deviner où commence une réplique est trop peu fiable pour
> modifier le découpage de l'auteur·ice ; `splitTextWalls` couvre les blocs
> illisibles sans deviner les dialogues.

Ajouter automatiquement un saut de ligne avant chaque réplique dans les œuvres qui ne séparent pas correctement les dialogues.

---

## Mise en valeur des dialogues

> ✅ Fait — réglage `highlightDialogue` : teinte discrète sur les répliques
> entre guillemets, texte inchangé.

Permettre de distinguer visuellement les passages dialogués du reste du texte.

---

## Nettoyage avancé

> ✅ Fait — intégré à `autoCleanFormatting` : paragraphes vides masqués,
> espaces insécables normalisés, réversible.

Supprimer les paragraphes entièrement vides et les espaces résiduels provenant de copier-coller (par exemple depuis Word).

---

## Densité globale de l'interface

> ❌ Écarté — généralisation du « mode interface compacte » déjà écarté
> (« trop de modes différents à gérer »).

Ajouter un réglage de densité (compacte, normale ou spacieuse) applicable à l'ensemble d'AO3.

---

## Surlignage du texte

> ❌ Écarté — ancres de surlignage fragiles (le texte édité par
> l'auteur·ice casse les positions), et l'annotation relève d'un outil de
> notes (bookmarkVault) plutôt que d'un formateur.

Permettre de surligner ou marquer certains passages afin de les retrouver facilement ultérieurement.

---

# Décisions de conception

## Conversion des guillemets

Le module ne convertit pas automatiquement les guillemets selon la langue utilisée (par exemple les guillemets français), cette fonctionnalité ayant été jugée trop spécifique.

---

## Mode plein écran

Le module ne propose pas de mode plein écran, cette fonctionnalité étant déjà assurée par le navigateur.

---

## Interface compacte

Le module n'ajoute pas un mode global d'interface compacte afin d'éviter de multiplier les modes d'affichage.

---

## Réglages de taille du texte

Les réglages de taille du texte ne sont disponibles qu'à un seul endroit : le panneau flottant « Aa ».

Ils ne sont volontairement pas dupliqués dans les options du module.

---

## Bouton « Aa »

Le bouton du panneau flottant reste toujours visible.

Il peut être réduit mais ne peut pas être complètement masqué.

---

# Précision historique

Les anciennes versions du module étaient organisées en plusieurs fichiers presque vides, avec notamment des sous-fonctionnalités réparties dans six fichiers distincts.

Cette organisation a été remplacée par un regroupement thématique :

* `content.js` regroupe **Content Cleanup** et **Reading View Optimization** ;
* `appearance.js` regroupe **Typography**, **Spacing and Structure** et **Layout and Display Modes**.

Chaque sous-fonctionnalité conserve néanmoins son propre `register()` et reste activable ou désactivable indépendamment, malgré cette réorganisation. 





