# ficDownloader

**Tab:** Appearance & Tools

## À quoi ça sert

Ce module regroupe tout ce qui touche au téléchargement de fics : un
bouton de téléchargement sur chaque fic dans les listes, la sélection de
plusieurs fics à télécharger d'un coup, le téléchargement de toute une page
de résultats dans une seule archive, le téléchargement automatique d'une
série entière, une bibliothèque hors-ligne, et l'envoi vers une liseuse
Kindle.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `defaultFormat` | `epub` | Le format de téléchargement préféré |
| `sendToKindleEnabled` | désactivé | Affiche le bouton "Envoyer vers Kindle" |
| `kindleEmail` | (vide) | L'adresse e-mail Kindle |
| `autoKindleSend` | désactivé | Envoie automatiquement vers Kindle sans demander de confirmation |
| `autoCacheMFL` | désactivé | Met en cache automatiquement les fics ajoutées à "à lire plus tard" |

## Fichiers

### 1. `_ficDownloader.js` — le chef d'orchestre

- Met en route les cinq autres fichiers de fonctionnalités
- Peut mettre en cache automatiquement une fic dès qu'elle est ajoutée à la liste "à lire plus tard"

### 2. `individualDownloads.js` — téléchargement rapide sur les listes

- Ajoute une petite icône ⬇️ à côté du titre de chaque fic sur une liste
- Un clic télécharge directement la fic en un seul fichier HTML, sans avoir à l'ouvrir

### 3. `batchDownload.js` — sélectionner plusieurs fics

- Ajoute une case à cocher sur chaque fic d'une liste pour la sélectionner
- Une barre flottante en bas de l'écran affiche le nombre de fics choisies et propose de tout télécharger
- Télécharge les fics sélectionnées une par une, avec une pause de 2 secondes entre chaque, pour ne pas surcharger AO3
- Une barre de progression montre où en est le téléchargement

### 4. `completePageDownload.js` — télécharger toute une page

- Ajoute un bouton "Download All" sur les listes, avec un choix de format (HTML, EPUB, MOBI, AZW3, PDF)
- Télécharge jusqu'à 100 fics d'une même page, avec une pause entre chaque
- Regroupe tout dans une seule archive ZIP si possible (sinon, télécharge les fichiers un par un)
- Ajoute une page-index qui liste toutes les fics téléchargées, et un fichier récapitulatif de l'opération
- Peut être annulé en cours de route

### 5. `downloadEnhancements.js` — options avancées de téléchargement

- Ajoute un menu pour choisir le format de téléchargement (HTML, EPUB, MOBI, AZW3, PDF) sur la page d'une fic et sur les listes
- Un bouton "Send to Kindle" ouvre un e-mail pré-rempli avec le lien de téléchargement, à envoyer soi-même vers son adresse Kindle
- Peut générer une image de couverture personnalisée pour une fic (plusieurs styles au choix), à télécharger séparément
- Une file d'attente de téléchargement avec pause, reprise et annulation
- Sur une page de série, un bouton permet d'ajouter toute la série à la file d'attente, numérotée dans l'ordre

### 6. `offlineLibrary.js` — bibliothèque hors-ligne

- Un bouton "📥 Save Offline" sur la page d'une fic pour la garder en mémoire et la lire plus tard, même sans connexion
- Un bouton "📖 Read Offline" ouvre la version enregistrée dans un nouvel onglet
- Permet de retirer une fic de la bibliothèque hors-ligne

### 7. `ficDownloader.css`

- Les styles visuels de tous les boutons, menus, barres de progression et panneaux ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Activer l'intégration Calibre depuis le panneau de réglages (le code existe déjà à l'intérieur du module, mais rien ne permet de l'activer)

- Choisir de cacher les boutons de téléchargement rapide sur les listes (le réglage existe déjà à l'intérieur du module, mais rien ne permet de le changer depuis le panneau)

- Envoyer une fic vers Kindle automatiquement en un clic, sans avoir à envoyer soi-même l'e-mail pré-rempli

- Voir en un seul endroit la liste de toutes les fics sauvegardées hors-ligne — pour l'instant, il faut retrouver chaque fic une par une sur sa propre page pour savoir si elle est enregistrée

- Prévenir quand la bibliothèque hors-ligne prend trop de place, ~~ou nettoyer automatiquement les fics les plus anciennes quand il n'y a plus assez d'espace~~
~~- Réessayer automatiquement un téléchargement qui a échoué, au lieu de devoir le refaire à la main~~

## Explicitement écarté

- Synchroniser les téléchargements dans le cloud — pour rester privé, tout reste en local
- Des modèles de téléchargement personnalisés
- Télécharger automatiquement à intervalles réguliers — jugé trop agressif pour les serveurs d'AO3
- Suivre sa progression de lecture dans les fics téléchargées — c'est le rôle d'un autre module (le suivi de lecture), pas de celui-ci



AO3 Helper - Batch Download Submodule
    Submodule ID: batchDownload
    Display Name: Batch Download
    Source Module: Download Manager

    - Feature: Select multiple works for download
      - Option: Checkboxes on work blurbs
      - Option: Multi-selection capability
      - Option: Selected works Set tracking
      - Option: Visual selection indication

    - Feature: Batch download operations
      - Option: Download all selected works
      - Option: Sequential downloading (2-second delays)
      - Option: Server-friendly rate limiting
      - Option: Automatic delay between requests

    - Feature: Download progress tracking
      - Option: Progress bar display
      - Option: Progress fill animation
      - Option: Percentage completion
      - Option: Current/total work counter

    - Feature: Floating toolbar
      - Option: Fixed bottom-right positioning
      - Option: Shows when works selected
      - Option: Hides when no selection
      - Option: White background with blue border

    - Feature: Selection counter
      - Option: "X works selected" display
      - Option: Real-time count update
      - Option: Visual feedback

    - Feature: Clear selection
      - Option: Clear all button
      - Option: Uncheck all checkboxes
      - Option: Reset selection Set

    - Feature: Work selection checkboxes
      - Option: Checkbox on each work blurb
      - Option: Checkbox styling and positioning
      - Option: Click handler for selection
      - Option: Map tracking checkbox elements

    - Feature: Selected works tracking
      - Option: Set data structure for selections
      - Option: Add/remove works from selection
      - Option: Work ID storage

    - Feature: Toolbar display logic
      - Option: Show toolbar when selection not empty
      - Option: Hide toolbar when selection empty
      - Option: Toolbar visibility toggle

    - Feature: Sequential download engine
      - Option: Download works one by one
      - Option: 2-second delay between downloads
      - Option: Server-friendly throttling
      - Option: isDownloading flag

    - Feature: Progress visualization
      - Option: Progress bar element
      - Option: Progress fill width calculation
      - Option: Progress text (X of Y downloaded)
      - Option: Smooth transitions
      
    - Feature: Dynamic content observation
      - Option: MutationObserver for new blurbs
      - Option: Add checkboxes to dynamically loaded works
      - Option: Handle infinite scroll
      - Option: Pagination support


      
AO3 Helper - Complete Page Download Submodule
    Submodule ID: completePageDownload
    Display Name: Complete Page Download
    Source Module: Download Manager

    - Feature: One-click complete page download
      - Option: Download button on listing pages
      - Option: Format dropdown (HTML, EPUB, MOBI, AZW3, PDF)
      - Option: ZIP archive when JSZip is available (graceful fallback to individual downloads)

    - Feature: Multiple format support
      - Option: HTML format (locally generated)
      - Option: EPUB, MOBI, AZW3, PDF formats (fetched from AO3 download links)
      - Option: Format dropdown selector in UI
      - Option: Config: format setting (default: 'html')

    - Feature: ZIP archive packaging
      - Option: JSZip integration (optional — must be available as window.JSZip)
      - Option: All works + index + metadata bundled in one ZIP file
      - Option: Graceful fallback to individual file downloads when JSZip unavailable

    - Feature: Progress tracking with visual progress bar
      - Option: Progress modal dialog
      - Option: Progress bar display
      - Option: Percentage completion
      - Option: Current work indicator
      - Option: Smooth progress animation

    - Feature: Automatic index.html generation with work links
      - Option: Create _index.html file
      - Option: List all downloaded works (success/failure)
      - Option: Links to individual files

    - Feature: Metadata JSON file
      - Option: _metadata.json included in download
      - Option: Tag name, format, download date timestamp
      - Option: Statistics (total, succeeded, failed)
      - Option: Per-work title, author, filename, success

    - Feature: Safety limit
      - Option: Maximum works cap (config.maxWorks, default: 100)
      - Option: Prevent excessive downloads
      - Option: Warning when limit reached

    - Feature: Configurable delay between requests
      - Option: Config: delayMs (default: 2000)
      - Option: Server-friendly rate limiting

    - Feature: Cancel download option
      - Option: Cancel button during download
      - Option: Stop after current work
      - Option: Partial results still exported on cancel

    - Feature: Styled progress modal
      - Option: Overlay modal dialog
      - Option: Live status messages
      - Option: Progress bar with smooth transitions

    - Feature: Work-by-work download tracking
      - Option: Track individual work status
      - Option: Success/failure per work
      - Option: Download queue management

    - Feature: Failed download reporting
      - Option: Failed works listed in _index.html
      - Option: Failed count in completion message
      - Option: Failed count in _metadata.json

═══════════════════════════════════════════════════════════════════════════ */



AO3 Helper - Download Enhancements Submodule
    Submodule ID: downloadEnhancements
    Display Name: Download Enhancements
    Source Module: Download Manager

    - Feature: Format options for downloads
      - Option: EPUB format
      - Option: MOBI format
      - Option: PDF format
      - Option: HTML format

    - Feature: EPUB download buttons in listings
      - Option: Download button on each work blurb
      - Option: Position next to bookmark/MFL buttons
      - Option: Format dropdown selection
      - Option: One-click download without opening work
      - Option: Download status indicators (spinner/checkmark)
      - Option: Works on search results, tag pages, bookmarks, series, author pages
      - Option: Default format setting
      - Option: Show/hide listing buttons toggle
      - Option: Integration with batch downloads for multi-select

    - Feature: Send to Kindle integration
      - Option: Auto-email EPUB to Kindle address
      - Option: One-time Kindle email configuration
      - Option: "Download & Send to Kindle" button
      - Option: Batch Kindle send for multiple works
      - Option: Settings: Kindle email, auto-send option (always/ask/never)

    - Feature: Enhanced cover generator for downloads
      - Option: Generate attractive cover images
      - Option: Auto-cover with work title, author, fandom, rating
      - Option: Cover templates: minimalist, modern, classic, fandom-themed
      - Option: Customization UI: templates, colors, fonts, layout
      - Option: Preview before download

    - Feature: Download queue management
      - Option: Queue display
      - Option: Reorder downloads
      - Option: Pause/resume queue
      - Option: Cancel specific downloads

    - Feature: Calibre integration
      - Option: Send to Calibre library
      - Option: Calibre content server connection
      - Option: Automatic metadata tagging
      - Option: Library organization

    - Feature: Series download automation
      - Option: Download entire series at once
      - Option: Series-to-collection conversion
      - Option: Sequential series numbering
      - Option: Automatic series metadata
      
    - Feature: Error handling
      - Option: Download failure detection
      - Option: Retry failed downloads
      - Option: Error notifications
      - Option: Graceful degradation



AO3 Helper - Individual Downloads Submodule
    Submodule ID: individualDownloads
    Display Name: Individual Downloads
    Source Module: Download Manager

    - Feature: Quick download icons
      - Option: ⬇️ icon on each work blurb
      - Option: Icon positioning beside title
      - Option: Color: #2c5f8a (AO3 blue)
      - Option: Hover effect (darker blue)

    - Feature: One-click download
      - Option: Click icon to download immediately
      - Option: No work page navigation needed
      - Option: Direct download trigger

    - Feature: Work content fetching
      - Option: Fetch work with ?view_full_work=true
      - Option: Parse HTML with DOMParser
      - Option: Extract chapters and metadata

    - Feature: HTML file generation
      - Option: Create standalone HTML file
      - Option: Include work metadata
      - Option: Include summary and notes
      - Option: Include all chapters

    - Feature: Download triggering
      - Option: Create download blob
      - Option: Generate filename with work ID and title
      - Option: Trigger browser download
      - Option: Cleanup blob URL

    - Feature: Icon management
      - Option: Track created icons in Set
      - Option: Prevent duplicate icons
      - Option: Dynamic icon addition for new blurbs

    - Feature: Complete work download
      - Option: Download all chapters in one file
      - Option: Fetch full work view
      - Option: Combine chapters
      
    - Feature: Chapter navigation
      - Option: Handle multi-chapter works
      - Option: Sequential chapter fetching
      - Option: Chapter ordering


      
AO3 Helper - Offline Library Submodule
    Submodule ID: offlineLibrary
    Display Name: Offline Library
    Source Module: Download Manager

    - Feature: Download works for offline access
      - Option: Cache work content in localStorage
      - Option: Save button on work pages
      - Option: "📥 Save Offline" button

    - Feature: Save to local storage
      - Option: Store work HTML content
      - Option: Storage key: `ao3h:OfflineReading:library`
      - Option: JSON library structure

    - Feature: Offline work library
      - Option: Cached works collection
      - Option: Work metadata storage
      - Option: Title, author, content, summary
      - Option: Cached timestamp

    - Feature: Read without internet connection
      - Option: Access cached works offline
      - Option: Browser cache retrieval
      - Option: No network required

    - Feature: Offline reading progress sync
      - Option: Sync reading position
      - Option: Progress tracking offline
      - Option: Resume from last position

    - Feature: Cached work management
      - Option: View cached works list
      - Option: Remove from cache
      - Option: "✓ Cached Offline" indicator

    - Feature: Offline library organization
      - Option: Categories for cached works
      - Option: Search cached library
      - Option: Sort and filter

    - Feature: Storage quota management
      - Option: Monitor storage usage
      - Option: Storage limit warnings
      - Option: Cleanup old caches
      
    - Feature: Auto-download for MFL works
      - Option: Automatically cache Mark for Later works
      - Option: Background download queue
      - Option: Configurable auto-cache


═══════════════════════════════════════════════════════════════════════════
  # ficDownloader
  **Tab :** Appearance & Tools
═══════════════════════════════════════════════════════════════════════════


# À quoi ça sert

Le module **Fic Downloader** regroupe toutes les fonctionnalités liées au téléchargement et à la consultation hors ligne des œuvres AO3.

Il permet notamment de :

- télécharger rapidement une fic sans ouvrir sa page ;
- télécharger plusieurs fics en une seule opération ;
- télécharger une page entière de résultats ;
- choisir le format de téléchargement ;
- envoyer une fic vers une liseuse Kindle ;
- télécharger automatiquement une série complète ;
- gérer une bibliothèque hors ligne ;
- mettre automatiquement certaines œuvres en cache.

---

# Réglages utilisateur

| Réglage | Défaut | Description |
|----------|--------|-------------|
| `defaultFormat` | `epub` | Format de téléchargement utilisé par défaut. |
| `sendToKindleEnabled` | Désactivé | Affiche les fonctionnalités d'envoi vers Kindle. |
| `kindleEmail` | Vide | Adresse e-mail Kindle utilisée pour l'envoi. |
| `autoKindleSend` | Désactivé | Envoie automatiquement les œuvres vers Kindle sans demander de confirmation. |
| `autoCacheMFL` | Désactivé | Met automatiquement en cache les œuvres ajoutées à **Marked for Later**. |

---

# Structure du module

Le module est composé de six sous-modules fonctionnels ainsi qu'une feuille de style.

```
_ficDownloader.js
individualDownloads.js
batchDownload.js
completePageDownload.js
downloadEnhancements.js
offlineLibrary.js
ficDownloader.css
```

---

# _ficDownloader.js

## Rôle

Fichier coordinateur du module.

Il initialise tous les sous-modules, centralise leurs interactions et expose les fonctionnalités de téléchargement au reste d'AO3 Helper.

## Responsabilités

- Initialise les cinq sous-modules fonctionnels.
- Coordonne les fonctionnalités de téléchargement.
- Gère la mise en cache automatique des œuvres ajoutées à **Marked for Later** lorsque cette option est activée.
- Sert de point d'entrée unique pour le reste de l'extension.

## Fonctions exposées

Le coordinateur permet notamment :

- d'initialiser le système de téléchargement ;
- d'activer les différents modes de téléchargement ;
- de lancer la mise en cache automatique ;
- de partager les fonctionnalités avec les autres modules.

---

# individualDownloads.js

## Rôle

Permet de télécharger rapidement une œuvre directement depuis une liste AO3, sans ouvrir sa page.

Chaque œuvre reçoit une petite icône de téléchargement qui génère immédiatement une version HTML complète de la fic.

---

## Fonctionnalités

### Téléchargement rapide

Le module ajoute une icône **⬇️** sur chaque œuvre affichée dans une liste.

Cette icône :

- est placée à côté du titre de la fic ;
- utilise la couleur bleue d'AO3 (`#2c5f8a`) ;
- possède un effet visuel au survol ;
- déclenche immédiatement le téléchargement.

---

### Téléchargement en un clic

L'utilisateur peut télécharger une œuvre sans visiter sa page.

Le module :

- récupère directement le contenu complet ;
- déclenche immédiatement le téléchargement ;
- évite toute navigation supplémentaire.

---

### Récupération du contenu

Pour produire le fichier, le module :

- récupère la version complète de l'œuvre avec `?view_full_work=true` ;
- analyse le HTML avec `DOMParser` ;
- extrait les métadonnées ;
- récupère tous les chapitres.

---

### Génération du fichier

Le téléchargement produit un fichier HTML autonome contenant :

- les métadonnées de la fic ;
- le résumé ;
- les notes ;
- tous les chapitres.

---

### Déclenchement du téléchargement

Le module :

- crée un Blob contenant le fichier ;
- génère automatiquement un nom basé sur l'identifiant et le titre de la fic ;
- lance le téléchargement du navigateur ;
- libère les ressources après la création du fichier.

---

### Gestion des icônes

Afin d'éviter les doublons, le module :

- conserve les icônes déjà créées dans un `Set` ;
- empêche leur création multiple ;
- ajoute automatiquement les nouvelles icônes lorsque des œuvres apparaissent dynamiquement.

---

### Gestion des œuvres à chapitres

Le module prend également en charge les œuvres composées de plusieurs chapitres.

Il :

- récupère la version complète de la fic ;
- rassemble tous les chapitres dans un seul document ;
- respecte leur ordre d'origine.

---

## Détails techniques

### APIs utilisées

- `fetch()`
- `DOMParser`
- `Blob`
- `URL.createObjectURL()`

### Gestion dynamique

Le module peut ajouter automatiquement les icônes aux nouvelles œuvres insérées dans la page sans recharger celle-ci.

---

## Dépendances

Ce sous-module est initialisé par `_ficDownloader.js` et sert de base aux fonctionnalités de téléchargement rapide proposées ailleurs dans le module.


# batchDownload.js

## Rôle

Permet de sélectionner plusieurs œuvres sur une même page afin de les télécharger automatiquement en une seule opération.

Le module ajoute un système complet de sélection multiple, une barre d'outils flottante, un suivi de progression et un moteur de téléchargement séquentiel conçu pour respecter les serveurs d'AO3.

---

## Fonctionnalités

### Sélection multiple

Le module ajoute une case à cocher sur chaque œuvre affichée dans une liste.

Chaque sélection :

- ajoute l'œuvre à la sélection courante ;
- met à jour le compteur en temps réel ;
- affiche visuellement les œuvres sélectionnées ;
- permet de préparer un téléchargement groupé.

Les œuvres sélectionnées sont conservées dans une structure de type `Set`, basée sur leur identifiant.

---

### Barre d'outils flottante

Lorsqu'au moins une œuvre est sélectionnée, une barre flottante apparaît.

Elle affiche notamment :

- le nombre d'œuvres sélectionnées ;
- un bouton permettant de lancer le téléchargement ;
- un bouton permettant de tout désélectionner.

La barre :

- est fixée dans le coin inférieur droit de la fenêtre ;
- possède un fond blanc avec une bordure bleue ;
- disparaît automatiquement lorsqu'aucune œuvre n'est sélectionnée.

---

### Téléchargement groupé

Le module télécharge toutes les œuvres sélectionnées automatiquement.

Les téléchargements :

- sont effectués un par un ;
- respectent un délai de **2 secondes** entre chaque requête ;
- évitent de surcharger les serveurs d'AO3 grâce à un système de limitation volontaire (rate limiting).

Un indicateur interne (`isDownloading`) empêche le lancement simultané de plusieurs téléchargements.

---

### Suivi de progression

Pendant le téléchargement, le module affiche une progression en temps réel.

Les informations affichées comprennent :

- une barre de progression animée ;
- le pourcentage d'avancement ;
- le nombre d'œuvres déjà téléchargées ;
- le nombre total d'œuvres sélectionnées ;
- un indicateur du type **X sur Y téléchargées**.

---

### Gestion de la sélection

Le module permet également :

- d'effacer entièrement la sélection ;
- de décocher automatiquement toutes les cases ;
- de réinitialiser l'ensemble des données de sélection.

---

### Observation du contenu dynamique

Certaines pages AO3 ajoutent des œuvres dynamiquement.

Le module détecte automatiquement ces nouvelles œuvres et leur ajoute les contrôles nécessaires.

Il prend notamment en charge :

- les nouvelles œuvres insérées dans le DOM ;
- les systèmes de chargement dynamique ;
- les changements de pagination.

---

## Détails techniques

### Gestion des sélections

Les œuvres sélectionnées sont stockées dans un `Set`.

Le module maintient également une correspondance entre :

- les identifiants des œuvres ;
- les cases à cocher créées dans le DOM.

---

### Téléchargement séquentiel

Le moteur de téléchargement :

- traite les œuvres une par une ;
- attend **2 secondes** entre chaque téléchargement ;
- empêche plusieurs téléchargements simultanés.

Cette approche limite le nombre de requêtes envoyées à AO3.

---

### Barre de progression

Le système de progression utilise :

- un élément représentant la barre ;
- un calcul dynamique de sa largeur ;
- des transitions visuelles fluides ;
- une mise à jour continue des informations affichées.

---

### Contenu dynamique

Le module utilise un `MutationObserver` afin de détecter automatiquement les nouvelles œuvres ajoutées à la page.

Les nouvelles cases à cocher sont créées sans nécessiter de rechargement.

---

## Dépendances

Ce sous-module est initialisé par `_ficDownloader.js`.

Il fonctionne indépendamment des autres systèmes de téléchargement mais partage leurs mécanismes de récupération des œuvres.

---

# completePageDownload.js

## Rôle

Permet de télécharger en une seule opération toutes les œuvres présentes sur une page de résultats AO3.

Le module peut regrouper tous les téléchargements dans une archive ZIP, générer un index de navigation, produire un fichier de métadonnées et suivre l'avancement de l'opération jusqu'à son terme.

---

## Fonctionnalités

### Téléchargement d'une page complète

Le module ajoute un bouton **Download All** sur les pages contenant une liste d'œuvres.

L'utilisateur peut choisir le format de téléchargement parmi :

- HTML
- EPUB
- MOBI
- AZW3
- PDF

Le format sélectionné devient le format utilisé pour toute l'opération.

---

### Téléchargement des œuvres

Le module télécharge successivement toutes les œuvres présentes sur la page.

Le système :

- limite le téléchargement à **100 œuvres maximum** par opération ;
- applique un délai configurable entre chaque téléchargement (2 secondes par défaut) ;
- respecte les serveurs d'AO3 grâce à une limitation volontaire des requêtes.

Lorsque la limite maximale est atteinte, un avertissement est affiché.

---

### Création d'une archive ZIP

Lorsque **JSZip** est disponible (`window.JSZip`), le module regroupe automatiquement tous les fichiers téléchargés dans une archive ZIP.

L'archive contient :

- toutes les œuvres téléchargées ;
- un fichier `_index.html` ;
- un fichier `_metadata.json`.

Si JSZip n'est pas disponible, le module revient automatiquement à des téléchargements individuels sans interrompre l'opération.

---

### Génération d'un index

Le module crée automatiquement un fichier `_index.html`.

Cet index contient :

- la liste complète des œuvres ;
- un lien vers chaque fichier téléchargé ;
- l'indication des téléchargements réussis ou échoués.

---

### Génération des métadonnées

Le module produit également un fichier `_metadata.json`.

Ce fichier contient notamment :

- la date du téléchargement ;
- le format utilisé ;
- le nom du tag ou de la recherche ;
- le nombre total d'œuvres ;
- le nombre de téléchargements réussis ;
- le nombre d'échecs ;
- les informations de chaque œuvre (titre, auteur, nom du fichier, succès ou échec).

---

### Progression

Pendant le téléchargement, le module affiche une fenêtre de progression.

Elle comprend :

- une barre de progression ;
- le pourcentage d'avancement ;
- l'œuvre actuellement téléchargée ;
- des messages d'état mis à jour en temps réel.

Les animations sont mises à jour de manière fluide tout au long du téléchargement.

---

### Annulation

L'utilisateur peut interrompre le téléchargement à tout moment.

Lorsque l'opération est annulée :

- le téléchargement en cours se termine ;
- aucun nouveau téléchargement n'est lancé ;
- les fichiers déjà récupérés restent disponibles ;
- les résultats partiels sont tout de même exportés.

---

### Suivi des téléchargements

Le module suit individuellement chaque œuvre téléchargée.

Pour chacune, il enregistre :

- son état ;
- son succès ou son échec ;
- sa position dans la file de téléchargement.

Les œuvres ayant échoué apparaissent également dans :

- `_index.html`
- `_metadata.json`
- le message final de fin d'opération.

---

## Détails techniques

### Formats pris en charge

- HTML (généré localement)
- EPUB
- MOBI
- AZW3
- PDF (récupérés depuis les liens de téléchargement AO3)

---

### Archive ZIP

Le support ZIP est optionnel.

Le module détecte automatiquement la présence de `window.JSZip` et adapte son fonctionnement en conséquence.

---

### Paramètres internes

Valeurs par défaut :

- `config.maxWorks = 100`
- `config.delayMs = 2000`

Ces paramètres permettent de limiter la charge envoyée aux serveurs AO3.

---

## Dépendances

Ce sous-module est initialisé par `_ficDownloader.js`.

Il partage les mécanismes de téléchargement avec les autres sous-modules mais ajoute une logique complète de traitement par lots, de génération d'archives et de suivi de progression.



# downloadEnhancements.js

## Rôle

Ajoute des fonctionnalités avancées autour du téléchargement des œuvres.

Le module étend les systèmes de téléchargement existants en proposant plusieurs formats, l'intégration Kindle, la génération de couvertures personnalisées, une file d'attente de téléchargements, l'intégration avec Calibre et le téléchargement automatisé de séries complètes.

---

## Fonctionnalités

### Formats de téléchargement

Le module permet de choisir le format utilisé lors du téléchargement d'une œuvre.

Formats pris en charge :

- EPUB
- MOBI
- PDF
- HTML

Le format sélectionné devient le format utilisé par défaut pour les téléchargements compatibles.

---

### Téléchargement depuis les listes

Le module ajoute un bouton de téléchargement directement sur chaque œuvre affichée dans une liste.

Le bouton :

- est placé à proximité des boutons Bookmark et Mark for Later ;
- permet un téléchargement en un clic ;
- évite d'ouvrir la page de l'œuvre ;
- respecte le format choisi par l'utilisateur.

Il fonctionne notamment sur :

- les résultats de recherche ;
- les pages de tags ;
- les bookmarks ;
- les séries ;
- les pages d'auteur.

Le module fournit également :

- un indicateur visuel pendant le téléchargement ;
- un indicateur de réussite une fois le téléchargement terminé ;
- un réglage permettant d'afficher ou masquer ces boutons.

---

### Envoi vers Kindle

Le module permet d'envoyer une œuvre vers une liseuse Kindle.

Les fonctionnalités prévues comprennent :

- la configuration unique d'une adresse Kindle ;
- un bouton **Download & Send to Kindle** ;
- l'envoi de plusieurs œuvres ;
- différentes stratégies d'envoi :

  - toujours envoyer automatiquement ;
  - demander une confirmation ;
  - ne jamais envoyer automatiquement.

Selon la configuration actuelle, le module peut :

- ouvrir un e-mail prérempli contenant le téléchargement ;
- envoyer automatiquement l'œuvre lorsque cette fonctionnalité est disponible.

---

### Génération de couvertures

Le module peut générer une couverture personnalisée pour une œuvre téléchargée.

Les informations pouvant apparaître sur la couverture comprennent :

- le titre ;
- l'auteur ;
- le fandom ;
- le rating.

Plusieurs modèles sont prévus :

- Minimalist
- Modern
- Classic
- Fandom-themed

Une interface permet également de personnaliser :

- les couleurs ;
- les polices ;
- la disposition ;
- le modèle utilisé.

Une prévisualisation est disponible avant le téléchargement.

---

### File d'attente de téléchargement

Le module gère une véritable file d'attente.

L'utilisateur peut notamment :

- consulter la liste des téléchargements ;
- modifier leur ordre ;
- mettre la file en pause ;
- reprendre les téléchargements ;
- annuler certains téléchargements.

---

### Intégration Calibre

Le module prévoit une intégration avec Calibre.

Les fonctionnalités comprennent :

- l'envoi vers une bibliothèque Calibre ;
- la connexion à un serveur Calibre Content Server ;
- l'ajout automatique des métadonnées ;
- l'organisation automatique de la bibliothèque.

Cette fonctionnalité existe dans le module mais n'est actuellement pas accessible depuis le panneau de configuration.

---

### Téléchargement des séries

Sur les pages de série, le module peut télécharger automatiquement l'ensemble des œuvres.

Le système :

- ajoute toutes les œuvres dans une file d'attente ;
- respecte leur ordre d'origine ;
- applique une numérotation séquentielle ;
- conserve les métadonnées de la série.

---

### Gestion des erreurs

Le module surveille les erreurs pouvant survenir pendant les téléchargements.

Il prévoit notamment :

- la détection des téléchargements échoués ;
- des notifications d'erreur ;
- une dégradation progressive des fonctionnalités lorsqu'une option n'est pas disponible ;
- la possibilité de réessayer automatiquement certains téléchargements.

---

## Détails techniques

### Formats pris en charge

- EPUB
- MOBI
- PDF
- HTML

---

### Paramètres utilisateur

Le module utilise principalement :

- `defaultFormat`
- `sendToKindleEnabled`
- `kindleEmail`
- `autoKindleSend`

---

### Intégrations externes

Le module peut communiquer avec :

- Kindle
- Calibre Content Server

---

## Dépendances

Ce sous-module est initialisé par `_ficDownloader.js`.

Il complète les autres systèmes de téléchargement en ajoutant des fonctionnalités avancées sans remplacer leurs mécanismes de base.

---

# offlineLibrary.js

## Rôle

Permet de sauvegarder des œuvres localement afin de pouvoir les consulter même sans connexion Internet.

Le module gère le téléchargement local, la lecture hors ligne, l'organisation de la bibliothèque et le suivi de l'espace de stockage utilisé.

---

## Fonctionnalités

### Sauvegarde hors ligne

Le module ajoute un bouton **📥 Save Offline** sur les pages des œuvres.

Lorsqu'une œuvre est enregistrée :

- son contenu est sauvegardé localement ;
- elle devient accessible sans connexion Internet ;
- elle est ajoutée à la bibliothèque hors ligne.

---

### Lecture hors ligne

Une œuvre enregistrée peut être ouverte à tout moment.

Le module fournit notamment :

- un bouton **📖 Read Offline** ;
- la récupération du contenu enregistré localement ;
- une lecture sans accès au réseau.

---

### Stockage local

Les œuvres sont enregistrées dans le stockage local sous la clé :

`ao3h:OfflineReading:library`

La bibliothèque contient notamment :

- le titre ;
- l'auteur ;
- le contenu ;
- le résumé ;
- la date de mise en cache.

---

### Gestion de la bibliothèque

Le module permet :

- d'ajouter une œuvre ;
- de supprimer une œuvre ;
- d'afficher si une œuvre est déjà enregistrée grâce à l'indicateur **✓ Cached Offline**.

Les spécifications prévoient également :

- une liste complète des œuvres enregistrées ;
- une organisation par catégories ;
- des fonctions de recherche ;
- des outils de tri et de filtrage.

---

### Synchronisation de la progression

Le module prévoit la conservation de la progression de lecture même en mode hors ligne.

Les fonctionnalités comprennent :

- l'enregistrement de la position de lecture ;
- la reprise à la dernière position connue ;
- la synchronisation de cette progression.

---

### Gestion du stockage

Le module surveille l'espace occupé par la bibliothèque.

Les fonctionnalités prévues comprennent :

- le suivi de l'espace utilisé ;
- des avertissements lorsque la capacité devient importante ;
- le nettoyage des anciennes œuvres enregistrées.

---

### Mise en cache automatique

Lorsque l'option correspondante est activée, le module peut automatiquement enregistrer les œuvres ajoutées à **Marked for Later**.

Le système utilise :

- une file de téléchargement en arrière-plan ;
- un traitement automatique ;
- un comportement configurable via le réglage `autoCacheMFL`.

---

## Détails techniques

### Stockage

Les œuvres sont conservées dans `localStorage` sous une structure JSON.

---

### Données enregistrées

Chaque œuvre peut contenir :

- le contenu HTML ;
- les métadonnées ;
- le résumé ;
- la date de mise en cache ;
- les informations de progression.

---

## Dépendances

Ce sous-module est initialisé par `_ficDownloader.js`.

Il fonctionne indépendamment des autres systèmes de téléchargement mais peut utiliser leurs mécanismes de récupération des œuvres afin de constituer la bibliothèque hors ligne.

---

# ficDownloader.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Fic Downloader**.

Il définit notamment l'apparence :

- des boutons de téléchargement ;
- des menus de sélection de format ;
- des barres de progression ;
- des fenêtres de téléchargement ;
- des files d'attente ;
- des contrôles de la bibliothèque hors ligne ;
- des indicateurs d'état.


# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Téléchargement

### ~~Intégration Calibre~~ ✅ Fait

~~Permettre d'activer et de configurer l'intégration avec Calibre directement
depuis le panneau de configuration.~~

> Ajouté : section « Calibre Integration » dans le panneau (case Activer +
> URL du serveur Calibre + nom de bibliothèque optionnel). L'organisation
> automatique des œuvres et l'ajout automatique de métadonnées restent des
> capacités du serveur Calibre lui-même, pas du module — hors périmètre ici.

---

### ~~Affichage des boutons de téléchargement~~ ✅ Fait

~~Ajouter un réglage permettant d'afficher ou masquer les boutons de
téléchargement rapide présents dans les listes d'œuvres.~~

> En vérifiant, ce réglage n'existait en fait pas encore dans le module
> (contrairement à ce que disait cette fiche) — ajouté de toutes pièces :
> case « Show the quick-download icon on work listings » dans la section
> Listings du panneau, activée par défaut.
>
> Au passage, un vrai bug a été trouvé et corrigé : les sous-réglages
> Kindle (email, envoi auto) étaient en fait invisibles en permanence dans
> le panneau, même la case "Enable Send to Kindle" cochée — le bloc HTML
> démarrait replié et rien ne le dépliait jamais.

---

### Réessai automatique

Réessayer automatiquement les téléchargements ayant échoué.

Le système pourrait notamment :

- détecter les erreurs temporaires ;
- relancer automatiquement le téléchargement ;
- limiter le nombre de tentatives.

---

## Kindle

### Envoi entièrement automatique

Permettre l'envoi direct d'une œuvre vers Kindle sans intervention de l'utilisateur.

Aujourd'hui, le module ouvre un e-mail prérempli que l'utilisateur doit encore envoyer lui-même.

---

## Bibliothèque hors ligne

### Gestion centralisée

Ajouter une interface permettant de consulter toute la bibliothèque hors ligne au même endroit.

Cette interface pourrait notamment permettre :

- d'afficher toutes les œuvres enregistrées ;
- de rechercher une œuvre ;
- de filtrer les résultats ;
- de supprimer plusieurs œuvres à la fois.

Actuellement, il faut visiter chaque œuvre individuellement pour savoir si elle est enregistrée.

---

### Gestion de l'espace disque

Améliorer la gestion du stockage local.

Les fonctionnalités prévues comprennent :

- le suivi précis de l'espace utilisé ;
- des avertissements lorsque la capacité devient importante ;
- le nettoyage automatique des anciennes œuvres enregistrées lorsque l'espace devient insuffisant.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Synchronisation des téléchargements

Le module ne synchronise pas les œuvres téléchargées dans le cloud.

Toutes les données restent stockées localement afin de :

- préserver la confidentialité des œuvres ;
- éviter les limitations de stockage des services de synchronisation.

---

## Modèles de téléchargement personnalisés

Le module ne prévoit pas la création de modèles personnalisés pour les téléchargements.

Les formats proposés sont considérés comme suffisants pour les usages prévus.

---

## Téléchargements automatiques

Le module ne lance jamais de téléchargements automatiques à intervalles réguliers.

Cette fonctionnalité a été volontairement écartée afin de :

- éviter une charge excessive sur les serveurs d'AO3 ;
- limiter les requêtes automatiques.

Les téléchargements sont toujours déclenchés par une action de l'utilisateur.

---

## Progression de lecture

Le suivi de la progression de lecture des œuvres téléchargées ne fait pas partie des responsabilités de ce module.

Cette fonctionnalité appartient au module dédié au suivi de lecture, afin de conserver une séparation claire des responsabilités.


# Résumé des responsabilités du module

Le module **Fic Downloader** est responsable de toutes les fonctionnalités liées au téléchargement et à la consultation locale des œuvres AO3.

Ses responsabilités sont réparties entre les sous-modules suivants :

| Sous-module | Responsabilité principale |
|-------------|---------------------------|
| `_ficDownloader.js` | Initialise et coordonne l'ensemble du module. |
| `individualDownloads.js` | Téléchargement rapide d'une œuvre individuelle directement depuis les listes. |
| `batchDownload.js` | Sélection et téléchargement de plusieurs œuvres en une seule opération. |
| `completePageDownload.js` | Téléchargement d'une page complète d'œuvres avec suivi de progression et génération d'archives. |
| `downloadEnhancements.js` | Fonctionnalités avancées : formats, Kindle, Calibre, couvertures, séries et file d'attente. |
| `offlineLibrary.js` | Sauvegarde locale, lecture hors ligne et gestion de la bibliothèque. |
| `ficDownloader.css` | Styles visuels de l'ensemble du module. |

---

# Interactions entre les sous-modules

Le coordinateur `_ficDownloader.js` initialise tous les sous-modules et leur fournit un point d'entrée commun.

Les responsabilités sont volontairement séparées :

- **`individualDownloads.js`** gère le téléchargement immédiat d'une seule œuvre.
- **`batchDownload.js`** gère la sélection multiple et le téléchargement séquentiel des œuvres choisies.
- **`completePageDownload.js`** prend en charge le téléchargement automatisé d'une page entière avec génération d'archives et de rapports.
- **`downloadEnhancements.js`** ajoute des fonctionnalités avancées autour du téléchargement sans modifier les mécanismes de base.
- **`offlineLibrary.js`** réutilise les mécanismes de récupération des œuvres afin de constituer une bibliothèque consultable sans connexion.

Chaque sous-module possède une responsabilité clairement définie afin de limiter les dépendances et de faciliter la maintenance du module.

---

# Dépendances externes

Selon les fonctionnalités utilisées, le module peut s'appuyer sur plusieurs APIs et bibliothèques externes.

## APIs du navigateur

- `fetch()`
- `DOMParser`
- `Blob`
- `URL.createObjectURL()`
- `localStorage`
- `MutationObserver`

---

## Bibliothèques optionnelles

- `JSZip` (`window.JSZip`) pour la création d'archives ZIP.

Le module fonctionne également sans cette bibliothèque en revenant automatiquement à des téléchargements individuels.

---

## Services externes

Certaines fonctionnalités peuvent communiquer avec des services externes :

- AO3 (téléchargement des œuvres) ;
- Kindle (envoi des téléchargements) ;
- Calibre Content Server (gestion de bibliothèque).

Ces intégrations restent optionnelles et ne sont utilisées que lorsque l'utilisateur les active.

---

# Limites connues

Le module applique plusieurs limites afin de préserver les performances et de respecter les serveurs d'AO3.

Notamment :

- un délai de **2 secondes** entre les téléchargements séquentiels ;
- une limite par défaut de **100 œuvres** pour le téléchargement complet d'une page ;
- un fonctionnement principalement local pour préserver la confidentialité des données téléchargées.

Ces limites peuvent évoluer avec les futures versions du module.


