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
| `autoCleanFormatting` | activé | Corrige les doubles espaces et les sauts de ligne mal placés |
| `removeBoldExcessive` | désactivé | Retire le gras si un paragraphe entier est en gras |
| `convertSlashItalic` | désactivé | Convertit le texte entre barres obliques (`/texte/`) en italique |
| `unifySceneBreaks` | activé | Uniformise les séparateurs de scène en `✦ ✦ ✦` |
| `hideEmbeddedImages` | désactivé | Cache les images intégrées dans le texte (mode texte seul) |
| `sansSerifFont` | désactivé | Force une police sans empattements sur toute la fic |
| `cleanReadingMode` | désactivé | Réduit la largeur du texte et cache les éléments secondaires de la page |
| `textAlignment` | `left` | L'alignement du texte : gauche, justifié, ou centré |
| `paragraphSpacing` | `0.5em` | L'espace supplémentaire entre les paragraphes |

## Fichiers

### 1. `_readingFormatter.js` — le chef d'orchestre

- Prépare les réglages et les outils communs utilisés par tous les autres fichiers de ce module

### 2. `contentCleanup.js` — nettoyage du texte

- Corrige les doubles espaces et les sauts de ligne mal placés
- Peut cacher les images intégrées dans le texte, pour un mode texte seul

### 3. `typography.js` — typographie

- Convertit le texte entre barres obliques (`/texte/`) en italique
- Retire le gras si un paragraphe entier est en gras (souvent une erreur de mise en forme)
- Peut forcer une police sans empattements sur toute la fic

### 4. `spacingAndStructure.js` — séparateurs de scène

- Remplace les séparateurs de scène (`***`, `---`, `~~~`...) par un symbole uniforme (✦ ✦ ✦)

### 5. `layoutAndDisplayModes.js` — mode de lecture épuré

- Réduit la largeur du texte et cache les éléments secondaires de la page, pour se concentrer sur la lecture

### 6. `readingViewOptimization.js` — alignement et espacement

- Choisit l'alignement du texte (gauche, justifié, centré)
- Ajoute un espace supplémentaire entre les paragraphes

### 7. `readingControls.js` — le panneau flottant "Aa"

- Ajoute un bouton "Aa" sur les pages de fic pour ouvrir un panneau de réglages rapides
- Permet de choisir la largeur du texte, l'espacement des lignes, la taille du texte, et de retirer l'indentation des paragraphes

### 8. `readingFormatter.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Le mode "Breathe" (espacement de ligne augmenté automatiquement sur les longs paragraphes)
- Des règles de formatage personnalisées avec des motifs de recherche
- Des profils de formatage différents selon l'auteur·ice
- Pouvoir annuler ses changements de formatage après coup
- Choisir son propre style de séparateur de scène, au lieu du symbole fixe
- Reconnaître plusieurs styles de dialogue (guillemets, tirets...) et les uniformiser
- Un mode "confort" avec des couleurs plus douces et apaisantes, et la possibilité de flouter les passages associés à un avertissement
- Se souvenir des préférences de formatage différemment pour chaque œuvre
- Une détection plus poussée des guillemets et apostrophes
- Voir un aperçu avant d'appliquer un changement, avec possibilité d'annuler/refaire
- Détecter les gros blocs de texte sans paragraphes ("murs de texte") et ajouter des sauts de paragraphe automatiquement
- Répéter le titre, l'auteur et les tags en bas de la fic, pour les avoir sous la main juste après avoir fini de lire
- Une règle de lecture qui suit les yeux : une ligne horizontale semi-transparente pour ne pas perdre sa ligne en lisant
- Ajouter automatiquement un saut de ligne avant chaque ligne de dialogue, pour les fics écrites sans retour à la ligne
- Mettre en valeur visuellement les dialogues (le texte parlé) pour mieux les distinguer du reste du texte
- Nettoyer les paragraphes complètement vides et les espaces bizarres laissés par un copier-coller (par exemple depuis Word)
- Un réglage de densité de l'interface (compacte / normale / spacieuse) qui s'applique à toutes les pages d'AO3, pas seulement à la lecture d'une fic
- Pouvoir surligner ou marquer certains passages du texte pendant la lecture, pour les retrouver facilement plus tard

## Explicitement écarté

- Convertir automatiquement les guillemets selon la langue (par exemple guillemets français) — jugé trop spécifique
- Un mode plein écran — le navigateur le fait déjà
- Un mode "interface compacte" — trop de modes différents à gérer
- Avoir les réglages de taille de texte à deux endroits différents (dans les options et dans le panneau Aa) — un seul endroit suffit, le panneau Aa
- Pouvoir cacher complètement le bouton Aa — il reste toujours visible, juste réduit par défaut

## Précision

⚠️ Les docs historiques décrivent une version plus ancienne du code, avec 5
sous-fichiers presque vides et un fichier en double avec un autre. Ce n'est
plus le cas : les 6 fichiers de fonctionnalités sont aujourd'hui pleinement
codés et distincts, sans doublon.
