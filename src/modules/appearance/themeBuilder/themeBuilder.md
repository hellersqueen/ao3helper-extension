# themeBuilder

**Tab:** Appearance & Tools

## À quoi ça sert

Ce module permet de créer ses propres thèmes visuels pour AO3 (couleurs,
polices, styles), avec un éditeur visuel simple (curseurs, sélecteurs de
couleur, sans code) ou un mode expert pour écrire du CSS directement. Il
propose aussi une bibliothèque de thèmes, avec 3 thèmes déjà prêts.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `mode` | `visual` | Le mode actif : éditeur visuel (sans code) ou éditeur de CSS |
| `importEnabled` | activé | Affiche le bouton pour importer un thème depuis un fichier |

## Fichiers

### 1. `_themeBuilder.js` — le chef d'orchestre

- Réapplique le thème actif à chaque chargement de page
- Partage des outils communs (lecture/écriture, application du style) avec les autres fichiers de ce module

### 2. `customStyling.js` — l'éditeur pour experts

- Un éditeur de code avec coloration syntaxique pour écrire du CSS, du HTML ou du JavaScript directement
- Vérifie que le CSS écrit est valide et signale les erreurs (accolades manquantes, etc.)
- Bloque en plus l'application d'un CSS contenant des motifs dangereux (`<script`, `javascript:`, `@import url()`...) ou dépassant 50 Ko
- Propose des petits bouts de style tout prêts à insérer (par exemple "zone de lecture plus large"), et permet de sauvegarder ses propres bouts de code réutilisables
- Permet de choisir sur quelles pages le code s'applique (partout, pages de fic, listes, tableau de bord)
- Un réglage de priorité (1 à 10) pour décider quel style l'emporte en cas de conflit
- Un bouton "Save as Theme" pour transformer son CSS en thème réutilisable

### 3. `themeManagement.js` — la bibliothèque de thèmes

- Propose 3 thèmes déjà prêts : Dark Mode, Soft Cream, High Contrast
- Permet de créer, sauvegarder, modifier et supprimer ses propres thèmes
- Un aperçu temporaire avant d'appliquer un thème pour de vrai
- Exporter un thème (ou tous ses thèmes) en fichier JSON, ou le copier directement
- Importer un thème depuis un fichier JSON — les thèmes dont le CSS contient des motifs dangereux sont filtrés silencieusement (avec un message indiquant combien ont été écartés)

### 4. `typographySystem.js` — les réglages de police

- Propose 6 préréglages de typographie (classique avec empattements, moderne, liseuse électronique, contraste élevé...)
- Permet de choisir séparément la police du texte et celle des titres
- Curseurs pour la taille du texte, l'espacement des lignes et l'espacement des lettres

### 5. `visualBuilder.js` — l'éditeur visuel

- Des sélecteurs de couleur pour l'accent, le fond, le texte, les liens et l'en-tête
- Un aperçu en direct des changements avant de les appliquer pour de vrai
- Un mode "inspecteur" pour cliquer sur un élément de la page et récupérer son nom technique (utile pour l'éditeur CSS avancé)

### 6. `themeBuilder.css`

- Les styles visuels de tous les panneaux, boutons et curseurs ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Après avoir choisi un élément avec l'inspecteur, pouvoir directement le styliser depuis ce clic — pour l'instant, ça remplit juste un champ texte avec son nom technique, il faut ensuite écrire le style soi-même~~ ✅
  Fait : après avoir choisi un élément, une petite zone propose couleur du
  texte, couleur de fond ou "Hide element" — "Apply to element" applique et
  mémorise la règle (restaurée à chaque page, bouton "Clear element styles"
  pour tout retirer). Les règles passent le contrôle de zones protégées.

- ~~Empêcher que le CSS personnalisé n'abîme certaines zones importantes de la page, comme le texte de la fic — pour l'instant, la vérification ne repère que les erreurs d'écriture~~ ✅
  Fait : `findProtectedViolations()` (`themeSafety.js`) — les règles qui
  cacheraient une zone protégée (#workskin, .userstuff, #chapters, body,
  #main : display:none, visibility:hidden, opacity:0, tailles nulles…) sont
  bloquées à l'Apply avec un message ⛔, y compris à travers @media.

- ~~Voir un aperçu en direct des changements de police, taille de texte ou espacement pendant qu'on bouge les curseurs — pour l'instant, il faut cliquer sur "Apply" pour voir le résultat~~ ✅
  Fait : les curseurs (taille, interligne, espacement des lettres) et les
  champs de police du panneau Typographie, ainsi que les couleurs et
  curseurs du Visual Builder, s'appliquent en direct pendant la
  manipulation ; Apply enregistre, fermer sans Apply revient à l'état
  sauvegardé.

- ~~Vérifier automatiquement que les couleurs choisies restent assez lisibles, et proposer des palettes pensées pour les daltoniens~~ ✅
  Fait : le Visual Builder affiche en continu le contraste WCAG texte/fond
  et liens/fond (✓ AAA / ✓ AA / ⚠ avec conseil "≥ 4.5:1"), et deux boutons
  remplissent les couleurs avec des palettes sûres pour les daltoniens
  (claire et sombre, dérivées de la palette Okabe-Ito, contrastes vérifiés
  par test).

- Changer ou comparer les thèmes plus facilement : automatiquement selon le fandom qu'on lit ou l'heure de la journée (clair le jour, sombre la nuit), ou en basculant rapidement entre deux thèmes pour les comparer — idée non implémentée, aucune décision de suppression prise
- Importer un thème depuis une adresse internet (URL) plutôt que depuis un fichier — idée non implémentée, aucune décision de suppression prise

## Explicitement écarté

- Une bibliothèque communautaire de thèmes partagés en ligne — nécessiterait un serveur
- Un bouton "sauvegarde automatique" séparé — la sauvegarde se fait déjà en cliquant sur Apply/Save

## Détails techniques

Stockage : `ao3h:tb:customcss` (CSS personnalisé brut) · `ao3h:tb:themes`
(`[{ id, name, css, createdAt }]`) · `ao3h:tb:active`
(`{ source: 'custom'|'theme'|'typography'|'visual', css }`) ·
`ao3h:tb:typography` (`{ preset, fontFamily, fontSize, lineHeight,
letterSpacing }`) · `ao3h:tb:visual` (`{ accentColor, bgColor, textColor,
linkColor, fontSize, lineHeight }`).

APIs navigateur utilisées : `localStorage`, presse-papiers (copie des
thèmes exportés).

**Décision d'architecture :** `themeBuilder` définit ses propres thèmes
intégrés (`BUILTIN` dans `themeManagement.js`) plutôt que d'utiliser
`lib/themes/builtin` — fusionner les deux catalogues changerait des thèmes
déjà sauvegardés par des utilisateurs, jugé trop risqué sans test en
direct. En revanche, `lib/themes/engine/themeUtils.js` (contrôle de
sécurité CSS, jusque-là inutilisé ailleurs) est branché dans
`customStyling.js` et `themeManagement.js` sur les points d'entrée de CSS
non fiable (import de thème JSON notamment).
