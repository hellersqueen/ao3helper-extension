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

- Après avoir choisi un élément avec l'inspecteur, pouvoir directement le styliser depuis ce clic — pour l'instant, ça remplit juste un champ texte avec son nom technique, il faut ensuite écrire le style soi-même

- Empêcher que le CSS personnalisé n'abîme certaines zones importantes de la page, comme le texte de la fic — pour l'instant, la vérification ne repère que les erreurs d'écriture (accolades ou deux-points manquants), pas les styles qui pourraient casser ces zones

- Voir un aperçu en direct des changements de police, taille de texte ou espacement pendant qu'on bouge les curseurs — pour l'instant, il faut cliquer sur "Apply" pour voir le résultat

- Vérifier automatiquement que les couleurs choisies restent assez lisibles, et proposer des palettes pensées pour les daltoniens

---

~~- Changer ou comparer les thèmes plus facilement : automatiquement selon le fandom qu'on lit ou l'heure de la journée (clair le jour, sombre la nuit), ou en basculant rapidement entre deux thèmes pour les comparer~~
~~- Importer un thème depuis une adresse internet (URL) — pour l'instant, on ne peut importer un thème qu'à partir d'un fichier~~
## Explicitement écarté

- Une bibliothèque communautaire de thèmes partagés en ligne — nécessiterait un serveur
- Un bouton "sauvegarde automatique" séparé — la sauvegarde se fait déjà en cliquant sur Apply/Save



/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Builder Module Coordinator
    Module ID: themeBuilder
    Display Name: Theme Builder
    Description: Provides advanced theme creation and customization tools with CSS editing, theme management, typography controls, and visual builders.

    Submodules (each independently registered, parent: 'themeBuilder'):
        themeBuilder/customStyling    — CSS editor panel + custom injection
        themeBuilder/themeManagement  — save/apply/import/export themes
        themeBuilder/typographySystem — font presets + size/line-height controls
        themeBuilder/visualBuilder    — color pickers + live preview

    Coordinator role:
        - Re-applies active theme CSS on every page load (before submodules init)
        - Exposes W.AO3H_ThemeBuilder shared helpers (kept as window bridge —
          submodules read it lazily via getShared() at init time; also exported
          as ES bindings below)
        - Injects shared panel CSS

    Storage:
        ao3h:tb:customcss   — user's raw custom CSS string
        ao3h:tb:themes      — [{ id, name, css, createdAt }]
        ao3h:tb:active      — { source: 'custom'|'theme'|'typography'|'visual', css }
        ao3h:tb:typography  — { preset, fontFamily, fontSize, lineHeight, letterSpacing }
        ao3h:tb:visual      — { accentColor, bgColor, textColor, linkColor, fontSize, lineHeight }

    Note: themeBuilder définit ses propres thèmes inline (BUILTIN dans
    themeManagement.js) plutôt que d'utiliser lib/themes/builtin — décision
    Phase 24 réexaminée (shared.md, décision produit theme-builder↔lib/themes) :
    fusionner les deux catalogues de thèmes changerait des thèmes déjà
    sauvegardés par des utilisateurs, jugé trop risqué sans test en direct.
    En revanche, lib/themes/engine/themeValidator.js (contrôle de sécurité
    CSS, jusque-là inutilisé) est maintenant branché dans customStyling.js et
    themeManagement.js sur les points d'entrée de CSS non fiable (import de
    thème JSON notamment).



    /* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Custom Styling Submodule
    Submodule ID: customStyling
    Display Name: Custom Styling
    Source Module: Theme Builder

    - Feature: Advanced CSS editor
      - Option: Full CSS editor with syntax highlighting
      - Option: Inject custom CSS into AO3 pages
      - Option: CSS validation

    - Feature: Custom code injection
      - Option: Inject custom HTML/CSS/JS
      - Option: Per-page targeting
      - Option: Priority system for style application

    - Feature: Style presets
      - Option: Pre-built style templates
      - Option: Quick-apply themes
      - Option: Customizable presets


      /* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Management Submodule
    Submodule ID: themeManagement
    Display Name: Theme Management
    Source Module: Theme Builder

    - Feature: Theme creation
      - Option: Create and save custom themes
      - Option: Setting: `customThemes` (array of theme objects)
      - Option: Theme metadata (name, author, description)

    - Feature: Import/export themes
      - Option: Export themes as JSON (individual or all)
      - Option: Import themes from JSON files
      - Option: Copy theme as JSON to clipboard

    - Feature: Theme library
      - Option: Browse saved themes
      - Option: Quick-switch between themes
      - Option: Theme preview



/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Typography System Submodule
    Submodule ID: typographySystem
    Display Name: Typography System
    Source Module: Theme Builder

    - Feature: Typography presets
      - Option: Pre-configured font combinations
      - Option: Professional typography sets
      - Option: Serif and Sans-serif reading presets

    - Feature: Font pairing
      - Option: Harmonious font combinations
      - Option: Separate heading + body font family controls
      - Option: Preset pairs with distinct heading/body fonts

    - Feature: Controls UI
      - Option: Typography control panel
      - Option: Live typography adjustments
      - Option: Font size, line height, letter spacing controls



/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Builder Submodule
    Submodule ID: visualBuilder
    Display Name: Visual Builder
    Source Module: Theme Builder

    - Feature: Visual CSS builder
      - Option: Point-and-click CSS creation
      - Option: No coding required
      - Option: Visual style controls

    - Feature: Live preview
      - Option: Real-time style preview
      - Option: See changes immediately
      - Option: Toggle preview on/off

    - Feature: Element inspector
      - Option: Inspect page elements
      - Option: Identify CSS selectors
      - Option: Target specific elements
      - Option: DevTools-like inspector












═══════════════════════════════════════════════════════════════════════════
  # themeBuilder
  **Tab :** Appearance & Tools
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Theme Builder** permet de personnaliser entièrement l'apparence d'AO3 en créant ses propres thèmes.

Il propose deux approches complémentaires :

- un éditeur visuel permettant de modifier les couleurs, les polices et différents paramètres sans écrire de code ;
- un éditeur avancé permettant d'écrire directement du CSS, du HTML ou du JavaScript personnalisé.

Le module permet également de :

- gérer une bibliothèque de thèmes personnalisés ;
- importer et exporter des thèmes ;
- appliquer différents réglages typographiques ;
- créer des thèmes réutilisables ;
- prévisualiser les modifications avant leur application.

---

# Réglages utilisateur

| Réglage | Défaut | Description |
|----------|--------|-------------|
| `mode` | `visual` | Mode actif : éditeur visuel ou éditeur avancé. |
| `importEnabled` | Activé | Affiche les fonctionnalités d'importation de thèmes. |

---

# Structure du module

Le module est composé de cinq sous-modules fonctionnels ainsi qu'une feuille de style.

```
_themeBuilder.js
customStyling.js
themeManagement.js
typographySystem.js
visualBuilder.js
themeBuilder.css
```

---

# _themeBuilder.js

## Rôle

Fichier coordinateur du module.

Il initialise l'ensemble des sous-modules, applique automatiquement le thème actif à chaque chargement de page et fournit les outils communs utilisés par les autres composants.

---

## Responsabilités

- Initialise tous les sous-modules du Theme Builder.
- Réapplique automatiquement le thème actif à chaque chargement de page.
- Expose les fonctions partagées utilisées par les sous-modules.
- Injecte les styles communs du panneau.
- Sert de point d'entrée unique pour le reste d'AO3 Helper.

---

## Fonctions exposées

Le coordinateur fournit notamment les outils permettant de :

- lire les thèmes enregistrés ;
- enregistrer les modifications ;
- appliquer un thème actif ;
- partager les fonctions communes avec les autres sous-modules.

---

## Données enregistrées

Le module utilise notamment les clés de stockage suivantes :

| Clé | Contenu |
|------|---------|
| `ao3h:tb:customcss` | CSS personnalisé de l'utilisateur |
| `ao3h:tb:themes` | Liste des thèmes enregistrés |
| `ao3h:tb:active` | Thème actuellement appliqué |
| `ao3h:tb:typography` | Réglages typographiques |
| `ao3h:tb:visual` | Réglages créés par l'éditeur visuel |

---

## Décision d'architecture

Le module conserve sa propre bibliothèque de thèmes intégrée dans `themeManagement.js`.

Les thèmes intégrés ne sont volontairement pas fusionnés avec ceux présents dans `lib/themes`, afin d'éviter de modifier les thèmes déjà enregistrés par les utilisateurs.

En revanche, le validateur CSS partagé (`themeValidator.js`) est utilisé pour vérifier les thèmes importés ainsi que le CSS personnalisé.

---

# customStyling.js

## Rôle

Fournit un éditeur avancé permettant d'écrire directement du CSS, du HTML ou du JavaScript personnalisé afin de modifier l'apparence d'AO3.

Ce sous-module s'adresse principalement aux utilisateurs souhaitant créer des personnalisations avancées.

---

## Fonctionnalités

### Éditeur avancé

Le module propose un éditeur de code comprenant notamment :

- la coloration syntaxique ;
- l'édition de CSS ;
- l'édition de HTML ;
- l'édition de JavaScript.

---

### Validation du CSS

Avant toute application, le module vérifie que le code est valide.

Les vérifications comprennent notamment :

- les erreurs de syntaxe CSS ;
- les accolades manquantes ;
- les deux-points oubliés.

---

### Validation de sécurité

Le module empêche également l'application de CSS contenant des motifs considérés comme dangereux.

Les vérifications concernent notamment :

- `<script`
- `javascript:`
- `@import url()`

Le module refuse également les feuilles de style dépassant **50 Ko**.

Le validateur partagé `themeValidator.js` est utilisé lors de l'importation ou de l'application de CSS provenant d'une source non fiable.

---

### Injection de code personnalisé

Le module permet d'injecter :

- du CSS ;
- du HTML ;
- du JavaScript.

L'utilisateur peut également choisir les pages concernées.

Les cibles disponibles comprennent notamment :

- toutes les pages ;
- les pages de lecture ;
- les listes d'œuvres ;
- le tableau de bord.

---

### Priorité des styles

Chaque feuille de style peut recevoir une priorité comprise entre **1 et 10**.

Cette priorité permet de déterminer quel style est appliqué lorsqu'il existe plusieurs règles concurrentes.

---

### Préréglages

Le module fournit plusieurs extraits de code prêts à être insérés.

Il permet également :

- d'enregistrer ses propres extraits ;
- de les réutiliser ultérieurement ;
- de créer rapidement de nouvelles personnalisations.

---

### Création de thèmes

Le bouton **Save as Theme** permet de transformer une feuille de style personnalisée en thème réutilisable.

---

## Détails techniques

### Validation

Le module effectue deux niveaux de contrôle :

- validation de la syntaxe CSS ;
- validation de sécurité.

---

### Personnalisation

Le code peut être appliqué :

- globalement ;
- uniquement sur certaines pages ;
- selon un niveau de priorité configurable.

---

## Dépendances

Ce sous-module est initialisé par `_themeBuilder.js`.

Il utilise les fonctions partagées du coordinateur ainsi que le validateur CSS utilisé lors de l'importation de contenu personnalisé.

# themeManagement.js

## Rôle

Gère la création, l'organisation et l'utilisation des thèmes personnalisés.

Le module permet de créer de nouveaux thèmes, d'appliquer ceux déjà enregistrés, d'importer ou d'exporter des thèmes et de gérer la bibliothèque personnelle de l'utilisateur.

---

## Fonctionnalités

### Bibliothèque de thèmes

Le module fournit une bibliothèque de thèmes comprenant :

- les thèmes intégrés ;
- les thèmes créés par l'utilisateur.

Les thèmes intégrés sont :

- Dark Mode
- Soft Cream
- High Contrast

Le module permet de parcourir rapidement cette bibliothèque et de changer de thème.

---

### Création de thèmes

L'utilisateur peut créer autant de thèmes personnalisés qu'il le souhaite.

Chaque thème peut contenir notamment :

- un nom ;
- une feuille de style CSS ;
- des métadonnées ;
- une date de création.

Les thèmes sont enregistrés dans le réglage :

`customThemes`

---

### Gestion des thèmes

Le module permet de :

- créer un thème ;
- sauvegarder un thème ;
- modifier un thème existant ;
- supprimer un thème ;
- appliquer un thème enregistré.

Les thèmes peuvent être réutilisés à tout moment.

---

### Prévisualisation

Avant d'appliquer définitivement un thème, le module peut afficher un aperçu temporaire.

Cela permet de tester les modifications avant de les enregistrer définitivement.

---

### Importation

Le module peut importer des thèmes depuis un fichier JSON.

Lors de l'importation :

- le fichier est analysé ;
- les thèmes valides sont ajoutés à la bibliothèque ;
- les thèmes contenant du CSS dangereux sont automatiquement rejetés ;
- un message indique combien de thèmes ont été ignorés.

Le contrôle de sécurité utilise le validateur CSS partagé avec `customStyling.js`.

---

### Exportation

Le module permet d'exporter :

- un thème individuel ;
- l'ensemble de la bibliothèque.

Les thèmes sont exportés au format JSON.

Le module permet également de copier directement un thème au format JSON dans le presse-papiers.

---

## Détails techniques

### Métadonnées

Chaque thème peut enregistrer notamment :

- son nom ;
- son auteur ;
- sa description ;
- son contenu CSS.

---

### Validation

Tous les thèmes importés sont vérifiés avant d'être ajoutés à la bibliothèque.

Le module refuse automatiquement les thèmes contenant du CSS considéré comme dangereux.

---

## Dépendances

Ce sous-module est initialisé par `_themeBuilder.js`.

Il partage les fonctions communes du coordinateur ainsi que le système de validation utilisé pour le CSS personnalisé.

---

# typographySystem.js

## Rôle

Permet de personnaliser entièrement la typographie utilisée sur AO3.

Le module fournit plusieurs préréglages ainsi que des réglages avancés pour contrôler les polices, la taille du texte et les espacements.

---

## Fonctionnalités

### Préréglages typographiques

Le module propose plusieurs configurations prêtes à l'emploi.

Les préréglages comprennent notamment :

- une typographie classique avec empattements ;
- une typographie moderne ;
- un mode inspiré des liseuses électroniques ;
- un mode à contraste élevé.

Au total, six préréglages sont disponibles.

---

### Associations de polices

Le module permet de choisir séparément :

- la police utilisée pour le texte ;
- la police utilisée pour les titres.

Des associations harmonieuses de polices sont également proposées afin d'obtenir une présentation cohérente.

---

### Réglages typographiques

Le module fournit différents contrôles permettant d'ajuster :

- la taille du texte ;
- l'espacement entre les lignes ;
- l'espacement entre les lettres.

Ces réglages peuvent être utilisés indépendamment des préréglages.

---

### Interface de contrôle

Les réglages sont regroupés dans un panneau dédié.

L'utilisateur peut modifier les paramètres typographiques sans avoir à écrire de CSS.

Les spécifications prévoient également un aperçu en direct des modifications.

---

## Détails techniques

### Paramètres enregistrés

Le module conserve notamment :

- le préréglage actif ;
- la police du texte ;
- la police des titres ;
- la taille de la police ;
- la hauteur de ligne ;
- l'espacement des lettres.

---

### Organisation

Les préréglages servent de point de départ mais peuvent être personnalisés individuellement grâce aux différents contrôles disponibles.

---

## Dépendances

Ce sous-module est initialisé par `_themeBuilder.js`.

Les réglages produits peuvent être combinés avec ceux issus du Visual Builder ou du CSS personnalisé.

# visualBuilder.js

## Rôle

Permet de créer un thème personnalisé à l'aide d'une interface entièrement visuelle, sans écrire de code.

Le module fournit des sélecteurs de couleurs, un aperçu en direct des modifications et un inspecteur permettant d'identifier facilement les éléments d'une page.

---

## Fonctionnalités

### Éditeur visuel

Le module permet de personnaliser l'apparence d'AO3 sans écrire de CSS.

Toutes les modifications sont réalisées à l'aide de contrôles graphiques.

---

### Couleurs

Le module fournit des sélecteurs permettant de modifier notamment :

- la couleur d'accent ;
- la couleur de fond ;
- la couleur du texte ;
- la couleur des liens ;
- la couleur de l'en-tête.

Les couleurs choisies servent à générer automatiquement le thème visuel.

---

### Aperçu des modifications

Le module affiche un aperçu des changements avant leur application définitive.

L'utilisateur peut ainsi tester un thème sans modifier immédiatement l'apparence d'AO3.

Les spécifications prévoient également la possibilité d'activer ou de désactiver cet aperçu.

---

### Inspecteur d'éléments

Le module comprend un mode inspecteur inspiré des outils de développement.

L'utilisateur peut :

- cliquer sur un élément de la page ;
- identifier son sélecteur CSS ;
- récupérer son nom technique afin de faciliter la création de styles personnalisés.

L'inspecteur est principalement destiné à assister l'utilisation du module `customStyling.js`.

---

### Création visuelle

Le module permet de créer progressivement un thème en combinant différents réglages visuels.

Aucune connaissance en CSS n'est nécessaire.

---

## Détails techniques

### Paramètres enregistrés

Le module conserve notamment :

- la couleur d'accent ;
- la couleur de fond ;
- la couleur du texte ;
- la couleur des liens ;
- la taille du texte ;
- la hauteur de ligne.

Ces informations sont enregistrées dans :

`ao3h:tb:visual`

---

### Fonctionnement

Les réglages visuels sont convertis automatiquement en styles applicables au thème actif.

---

## Dépendances

Ce sous-module est initialisé par `_themeBuilder.js`.

Il peut être utilisé conjointement avec :

- `typographySystem.js` pour les réglages de police ;
- `customStyling.js` pour les personnalisations avancées.

---

# themeBuilder.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Theme Builder**.

Il définit notamment l'apparence :

- des panneaux de configuration ;
- des boutons ;
- des éditeurs ;
- des curseurs ;
- des sélecteurs de couleurs ;
- des aperçus ;
- des contrôles typographiques.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Éditeur visuel

### Stylisation directe depuis l'inspecteur

Après avoir sélectionné un élément avec l'inspecteur, permettre de modifier immédiatement son apparence sans passer par l'éditeur CSS.

Actuellement, l'inspecteur se contente de récupérer le sélecteur CSS correspondant.

---

### Protection des zones critiques

Empêcher qu'un CSS personnalisé puisse détériorer certaines parties importantes d'AO3.

Les protections envisagées concernent notamment :

- le texte des œuvres ;
- les zones essentielles de l'interface.

À l'heure actuelle, seules les erreurs de syntaxe et les motifs dangereux sont détectés.

---

## Typographie

### Aperçu en temps réel

Afficher immédiatement les modifications lorsque l'utilisateur déplace :

- les curseurs de taille du texte ;
- l'espacement des lignes ;
- l'espacement des lettres.

Actuellement, les changements ne deviennent visibles qu'après avoir utilisé **Apply**.

---

## Accessibilité

### Validation des couleurs

Vérifier automatiquement que les couleurs choisies restent suffisamment lisibles.

Les améliorations prévues comprennent notamment :

- un contrôle du contraste ;
- des avertissements lorsque les couleurs sont difficiles à lire ;
- des palettes adaptées aux personnes daltoniennes.

---

## Fonctionnalités avancées

### Changement automatique de thème

Pouvoir changer automatiquement de thème selon différents critères.

Les idées envisagées comprennent notamment :

- le fandom consulté ;
- l'heure de la journée (mode clair / mode sombre).

---

### Comparaison de thèmes

Permettre de basculer rapidement entre deux thèmes afin de les comparer.

---

### Importation depuis Internet

Permettre d'importer directement un thème à partir d'une URL plutôt qu'à partir d'un fichier JSON uniquement.

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Bibliothèque de thèmes

Le module ne propose pas de bibliothèque communautaire permettant de partager des thèmes en ligne.

Cette fonctionnalité nécessiterait une infrastructure serveur afin d'héberger, distribuer et modérer les thèmes créés par les utilisateurs.

Les thèmes restent donc entièrement locaux et sont partagés uniquement par exportation ou importation de fichiers JSON.

---

## Sauvegarde

Le module ne possède pas de système de sauvegarde automatique indépendant.

Les modifications sont enregistrées lors des actions normales de l'utilisateur, notamment :

- l'application d'un thème ;
- l'enregistrement d'un thème.

Un bouton de sauvegarde automatique séparé a été jugé inutile.

---

# Résumé des responsabilités du module

Le module **Theme Builder** est responsable de toutes les fonctionnalités liées à la personnalisation visuelle d'AO3.

Ses responsabilités sont réparties entre les sous-modules suivants :

| Sous-module | Responsabilité principale |
|-------------|---------------------------|
| `_themeBuilder.js` | Initialise le module, applique le thème actif et fournit les fonctions partagées. |
| `customStyling.js` | Éditeur avancé permettant d'écrire et d'injecter du CSS, HTML et JavaScript personnalisés. |
| `themeManagement.js` | Création, gestion, importation, exportation et application des thèmes. |
| `typographySystem.js` | Gestion des polices, des préréglages typographiques et des paramètres de lecture. |
| `visualBuilder.js` | Création de thèmes à l'aide d'une interface graphique et d'un inspecteur d'éléments. |
| `themeBuilder.css` | Styles visuels de l'ensemble du module. |

---

# Interactions entre les sous-modules

Le coordinateur `_themeBuilder.js` initialise tous les sous-modules et leur fournit les outils communs utilisés pour appliquer les thèmes.

Les responsabilités sont volontairement séparées :

- **`customStyling.js`** permet les personnalisations avancées par code.
- **`themeManagement.js`** gère la bibliothèque de thèmes et leur cycle de vie.
- **`typographySystem.js`** contrôle exclusivement les paramètres liés à la lecture et aux polices.
- **`visualBuilder.js`** permet de créer un thème sans écrire de code grâce à une interface graphique.
- **`themeBuilder.css`** fournit l'apparence commune de toute l'interface du module.

Les différents sous-modules peuvent être utilisés indépendamment ou combinés afin de créer un thème complet.

---

# Dépendances externes

Selon les fonctionnalités utilisées, le module peut s'appuyer sur plusieurs APIs du navigateur.

## APIs du navigateur

- `localStorage`
- Presse-papiers (copie des thèmes exportés)

---

## Composants partagés

Le module utilise également :

- `themeValidator.js` pour la validation du CSS provenant de sources non fiables ;
- les helpers exposés par `_themeBuilder.js` pour la lecture, l'enregistrement et l'application des thèmes.

---

# Limites connues

Le module applique plusieurs limitations afin de préserver la stabilité et la sécurité d'AO3.

Notamment :

- le CSS personnalisé est limité à **50 Ko** ;
- les feuilles de style contenant des motifs considérés comme dangereux sont automatiquement rejetées ;
- les thèmes intégrés restent séparés de ceux présents dans `lib/themes` afin d'éviter toute incompatibilité avec les thèmes déjà enregistrés par les utilisateurs ;
- les thèmes ne peuvent actuellement être importés que depuis un fichier JSON local.


