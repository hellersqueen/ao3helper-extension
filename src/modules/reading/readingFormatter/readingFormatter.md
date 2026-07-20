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
| `removeBoldExcessive` | désactivé | Retire le gras si un paragraphe entier est en gras (plus de 60% du paragraphe) |
| `convertSlashItalic` | désactivé | Convertit le texte entre barres obliques (`/texte/`) en italique |
| `unifySceneBreaks` | activé | Uniformise les séparateurs de scène (`***`, `---`, `~~~`...) |
| `sceneBreakStyle` | `✦ ✦ ✦` | Le style de séparateur utilisé (texte libre) |
| `splitTextWalls` | désactivé | Découpe les très longs paragraphes ("murs de texte") aux frontières de phrases |
| `hideEmbeddedImages` | désactivé | Cache les images intégrées dans le texte (mode texte seul) |
| `sansSerifFont` | désactivé | Force une police sans empattements sur toute la fic (`#workskin`) |
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

Fichier coordinateur du module. Il initialise tous les sous-modules, prépare
les constantes et outils communs, centralise l'accès à la configuration et
les fonctions de lecture/écriture des préférences, et expose via
`W.AO3H_RF` (mis en place avant la cascade de démarrage des sous-modules) :

- Fonctions : `cfg(key)`, `isWorkPage()`, `prefGet(key, def)`,
  `prefSet(key, val)`, `walkTextNodes(el, fn)`
- Constantes : `NS`, `ROOT_CLS`, `SANSSERIF_CLS`, `CLEAN_CLS`, `NOINDENT_CLS`

Assure aussi la compatibilité avec `themeBuilder` (couleurs d'accent,
optionnel) via le pont `W.AO3H_ThemeBuilder` — cette dépendance est migrée
(Phase 24, étape 290) mais le pont est conservé jusqu'à la Phase 26.

### 2. `content.js` — nettoyage et confort du contenu

Regroupe deux sous-fonctionnalités (chacune garde son propre `register()`,
donc reste activable/désactivable séparément dans le panneau malgré leur
regroupement dans un même fichier) :

- **Content Cleanup** (`autoCleanFormatting`, `hideEmbeddedImages`) : corrige les doubles espaces (nœuds de texte) et les séquences de doubles `<br>`, masque les paragraphes vides et normalise les espaces insécables de copier-coller, peut cacher les images intégrées (mode texte seul, économie de bande passante) et découper les murs de texte (`splitTextWalls`)
- **Reading View Optimization** (`textAlignment`, `paragraphSpacing`) : choisit l'alignement du texte (gauche, justifié, centré), ajoute un espace supplémentaire entre les paragraphes, et porte les ajouts chantier 4 : mode Breathe, règle de lecture, rappel d'infos en fin d'œuvre

Agit uniquement sur les pages de lecture ; lit sa configuration via le
coordinateur et partage les utilitaires communs exposés par `W.AO3H_RF`.

### 3. `appearance.js` — apparence visuelle

Regroupe trois sous-fonctionnalités (même principe : chacune garde son
propre `register()` et reste activable/désactivable indépendamment) :

- **Typography** (`convertSlashItalic`, `removeBoldExcessive`, `sansSerifFont`) : convertit le texte entre barres obliques (`/texte/`) en italique, retire les balises `<strong>` si un paragraphe est composé à plus de 60% de texte en gras, peut forcer une police sans empattements sur `#workskin`, et peut teinter les dialogues (`highlightDialogue`)
- **Spacing and Structure** (`unifySceneBreaks`) : remplace les séparateurs de scène courants (`***`, `---`, `~~~`) par le symbole choisi (`sceneBreakStyle`, défaut ✦ ✦ ✦)
- **Layout and Display Modes** (`cleanReadingMode`) : réduit la largeur du texte et cache les éléments secondaires de la page (mode de lecture épuré)

Lit sa configuration via le coordinateur et partage les utilitaires communs
exposés par `W.AO3H_RF`.

### 4. `readingControls.js` — le panneau flottant "Aa"

- Ajoute un bouton "Aa" sur les pages de fic pour ouvrir un panneau de réglages rapides
- Largeur du texte : Default / Narrow / Book / Medium / Wide
- Espacement des lignes : Compact / Normal / Spacious
- Taille du texte : `A−` / `A+` (échelle 0.85–1.4)
- Bouton pour retirer l'indentation de première ligne des paragraphes
- Préférences enregistrées directement dans `localStorage` (hors du système général des réglages), sous les clés `readingFormatter:width`, `:spacing`, `:scale`, `:indent`
- Avec `perWorkPrefs`, ces choix sont mémorisés par œuvre (repli sur la valeur globale) plutôt que globalement
- Utilise les utilitaires fournis par `W.AO3H_RF`

### 5. `readingFormatterHelpers.js` — calculs purs (ajouté au passage chantier 4)

- Détection des paragraphes longs (mode Breathe), découpage des murs de texte aux frontières de phrases, nettoyage des artefacts de copier-coller (espaces insécables, paragraphes vides), détection des répliques entre guillemets

### 6. `readingFormatter.css`

- Les styles visuels de tous les fichiers ci-dessus : nettoyage du contenu, corrections typographiques, séparateurs de scène, mode de lecture épuré, panneau flottant "Aa", réglages de largeur/taille/espacement (dont les ajouts chantier 4 : Breathe, règle de lecture, dialogues, bloc de fin d'œuvre)

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
- Avoir les réglages de taille de texte à deux endroits différents (dans les options et dans le panneau Aa) — un seul endroit suffit, le panneau Aa (volontairement non dupliqué)
- Pouvoir cacher complètement le bouton Aa — il reste toujours visible, juste réduit par défaut

## Précision

⚠️ Les docs historiques décrivent une version plus ancienne du code, avec 5
sous-fichiers presque vides et un fichier en double avec un autre. Ce n'est
plus le cas. Les 6 sous-fonctionnalités qui existaient chacune dans leur
propre fichier ont depuis été regroupées par thème dans `content.js` (2
sous-fonctionnalités) et `appearance.js` (3 sous-fonctionnalités) — chacune
garde son propre interrupteur indépendant dans le panneau, seule
l'organisation des fichiers a changé.
