# backupAndSync

**Tab:** Appearance & Tools

## À quoi ça sert

Ce module garde une copie de sauvegarde de tout ce que fait AO3 Helper
(réglages, tags masqués, historique de lecture...) pour ne rien perdre en
cas de problème. Il fait des sauvegardes automatiques toutes les 15 minutes,
permet d'exporter ou d'importer ses données dans un fichier, et peut
synchroniser ces données entre plusieurs appareils grâce au compte du
navigateur.

## Fichiers

### 1. `_backupAndSync.js` — le chef d'orchestre

- Met en route les quatre autres fichiers du module et fait le lien entre eux
- Garde en mémoire la liste des sauvegardes et la partage avec les autres fichiers
- Donne accès à des actions simples pour le reste de l'extension : créer une sauvegarde, la restaurer, exporter une liste de fics...

### 2. `automateBackup.js` — les sauvegardes automatiques

- Fait une première sauvegarde dès que le module démarre
- Refait une sauvegarde toutes les 15 minutes (ou selon l'intervalle choisi)
- Supprime automatiquement les plus vieilles sauvegardes si la limite est dépassée
- Peut restaurer une sauvegarde, après une question de confirmation

### 3. `backupOperations.js` — les sauvegardes à la demande

- Crée une sauvegarde manuelle et la restaure sur demande
- Peut ne sauvegarder que certaines données choisies, plutôt que tout
- Peut protéger une sauvegarde avec un mot de passe (les données sont alors chiffrées)
- Peut compresser une sauvegarde pour qu'elle prenne moins de place
- Peut ne sauvegarder que ce qui a changé depuis la dernière fois, au lieu de tout refaire

### 4. `cloudSync.js` — la synchronisation entre appareils

- Envoie une copie des données vers le compte du navigateur (Chrome/Firefox), pour les retrouver sur un autre appareil
- Récupère les données du compte du navigateur au démarrage, si elles sont plus récentes que celles déjà présentes sur l'appareil
- En cas de différence entre deux appareils, garde toujours la version la plus récente
- Attend un petit moment avant d'envoyer les données, pour éviter de le faire à chaque tout petit changement

### 5. `dataTransfer.js` — exporter et importer

- Exporte tous les réglages de l'extension dans un fichier
- Permet de récupérer un fichier exporté pour tout restaurer
- Exporte la liste des fics affichées sur la page (favoris, historique...) dans un fichier JSON, CSV ou HTML
- Affiche de petits messages pour dire si une action a réussi ou échoué
- Construit les boutons visibles dans le panneau de réglages (exporter, importer, activer/désactiver la synchronisation)

### 6. `backupAndSync.css`

- Les styles visuels des boutons et des petits messages de ce module

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Voir la liste des sauvegardes automatiques et choisir laquelle restaurer, directement depuis le panneau (les sauvegardes existent, mais rien ne permet de les parcourir dans l'interface)

- Un bouton "Sauvegarder maintenant" dans le panneau (la fonction existe déjà à l'intérieur du module, mais aucun bouton ne la déclenche)

- Voir en un coup d'œil toutes les données sauvegardées, avec leur taille et leur état

- Chercher directement dans ses données sauvegardées

- Nettoyer ou mettre à jour automatiquement les données quand l'extension change de version

- Pouvoir choisir soi-même quelle version garder quand deux appareils ont des données différentes, plutôt que ce soit toujours la plus récente qui gagne automatiquement

---

~~- Choisir de protéger une sauvegarde avec un mot de passe, de la compresser, ou de ne garder que ce qui a changé, directement depuis le panneau (ces façons de sauvegarder existent déjà à l'intérieur du module, mais rien ne permet de les choisir dans l'interface)~~
~~- Choisir précisément quelles données sauvegarder, plutôt que tout d'un coup, directement depuis le panneau (ça existe déjà à l'intérieur du module, mais pas dans l'interface)~~
~~- Un bouton pour tout effacer d'un coup~~
~~- Vérifier que les données sauvegardées ne sont pas abîmées ou corrompues~~

## Explicitement écarté

- Passer par un compte GitHub pour la synchronisation entre appareils — jugé trop technique pour la plupart des gens
- Synchroniser tout l'historique de lecture entre appareils — les données sont trop volumineuses pour la petite place disponible dans la synchronisation du navigateur


AO3 Helper - Automate Backup Submodule
    Submodule ID: automateBackup
    Display Name: Automate Backup
    Source Module: Backup and Sync

    - Feature: Automatic backup scheduling
      - Option: Periodic automatic backups
      - Option: Configurable backup interval (default: 15 minutes)
      - Option: Background backup creation
      - Option: Enable/disable auto-backup
      - Option: Initial backup on module init
      - Option: setInterval for periodic execution

    - Feature: Backup creation
      - Option: Collect all AO3Helper data
      - Option: Create timestamped snapshot
      - Option: ISO date format timestamps
      - Option: Store in backups array

    - Feature: Backup retention
      - Option: Maximum backup count (default: 10)
      - Option: FIFO queue (oldest removed first)
      - Option: Automatic pruning when limit exceeded
      - Option: Array length management

    - Feature: Backup restoration
      - Option: Restore by backup index
      - Option: Confirmation dialog
      - Option: Overwrite localStorage entries
      - Option: Success/failure notification

    - Feature: Data collection
      - Option: Scan all localStorage keys
      - Option: Filter by namespace (ao3h, AO3H)
      - Option: Exclude auto-backup data
      - Option: Key-value object compilation

    - Feature: Configuration management
      - Option: Storage key: `backupAndSync`
      - Option: Config: enableAutoBackup, backupInterval, maxBackups
      - Option: Callback for backup events
      - Option: Parent notification system


      AO3 Helper - Backup Operations Submodule
    Submodule ID: backupOperations
    Display Name: Backup Operations
    Source Module: Backup and Sync

    - Feature: Backup user data and preferences
      - Option: Collect all AO3Helper data from localStorage
      - Option: Namespace filtering (ao3h, AO3H prefixes)
      - Option: Exclude auto-backup data from backups
      - Option: JSON data serialization

    - Feature: Backup history and versioning
      - Option: Timestamped backup snapshots
      - Option: Maximum backup count limit
      - Option: Automatic old backup pruning
      - Option: Point-in-time recovery

    - Feature: Selective backup (choose data to backup)
      - Option: Select specific data categories
      - Option: Module-specific backups
      - Option: Exclude certain data types
      - Option: Custom backup profiles

    - Feature: Restore from backup
      - Option: Restore specific backup by index
      - Option: Confirmation dialog before restore
      - Option: Restore with date/time display
      - Option: Overwrite current data warning

    - Feature: Encrypted backups
      - Option: Password-protected backups
      - Option: AES encryption
      - Option: Encryption key management

    - Feature: Backup compression
      - Option: Compress backup files
      - Option: gzip compression (CompressionStream API)
      - Option: Reduce storage size
      - Option: Faster upload/download

    - Feature: Incremental backups
      - Option: Only backup changed data
      - Option: Delta backups
      - Option: Reduce backup size
      - Option: Faster backup creation

AO3 Helper - Cloud Sync Submodule
    Submodule ID: cloudSync
    Display Name: Cloud Sync
    Source Module: Backup and Sync

    Uses browser native sync storage (chrome.storage.sync / browser.storage.sync)
    ~100 KB limit. GitHub Gist approach: ABANDONED.

    - Feature: Cloud sync via browser native storage
      - Option: Opt-in via syncEnabled setting
      - Option: chrome.storage.sync / browser.storage.sync support
      - Option: ~100 KB quota limit
      - Option: Graceful disable on quota exceeded

    - Feature: Sync on init
      - Option: Read from sync storage on init
      - Option: Restore keys newer than local (last-write-wins)
      - Option: Merge remote data into localStorage

    - Feature: Sync on data change
      - Option: Write to sync storage on data change
      - Option: Debounced writes (2s delay)
      - Option: Avoid unnecessary sync calls






AO3 Helper - Data Transfer Submodule
    Submodule ID: dataTransfer
    Display Name: Data Transfer
    Source Module: Backup and Sync

    - Feature: Export/import settings
      - Option: Export all data as JSON file
      - Option: Import from JSON backup file
      - Option: Manual backup download
      - Option: Manual backup restore

    - Feature: Manual export
      - Option: Export all data to JSON file (localStorage)
      - Option: Export work lists as JSON/CSV/HTML (DOM scrape)
      - Option: Browser download trigger
      - Option: Filename with timestamp
      - Option: Callback with export count

    - Feature: Manual import
      - Option: File picker for JSON upload
      - Option: Parse imported JSON
      - Option: Restore to localStorage
      - Option: Callback with import count

    - Feature: Data validation
      - Option: Validate JSON structure
      - Option: Error handling for corrupt files
      - Option: Type checking
      - Option: Safe restoration

    - Feature: Work list export
      - Option: Export work lists as JSON
      - Option: Export work lists as CSV
      - Option: Export work lists as HTML
      - Option: Format selection

    - Feature: List compilation
      - Option: Collect work metadata
      - Option: Page source detection (URL-based)
      - Option: Source tagging per work (bookmarks / history / marked-later / listing)
      - Option: Filter extraction by source category

    - Feature: Export formatting
      - Option: JSON structure
      - Option: CSV columns
      - Option: HTML div card template
      - Option: Custom templates

    - Feature: Centralized UI
      - Option: Management interface
      - Option: Backup controls panel
      - Option: Sync status display
      - Option: Export/import buttons

    - Feature: Visual feedback
      - Option: Toast notifications
      - Option: Progress indicators
      - Option: Success/error messages
      - Option: Status updates







═══════════════════════════════════════════════════════════════════════════
  # backupAndSync
  **Tab :** Appearance & Tools
═══════════════════════════════════════════════════════════════════════════

## À quoi ça sert
Le module **Backup and Sync** protège les données d'AO3 Helper afin d'éviter toute perte en cas de problème.  

* Il permet de :
  - sauvegarder automatiquement toutes les données de l'extension ;
  - créer des sauvegardes manuelles ;
  - restaurer une sauvegarde précédente ;
  - exporter ou importer les données depuis un fichier ;
  - synchroniser les données entre plusieurs appareils via le stockage synchronisé du navigateur.

* Les données sauvegardées comprennent notamment :
  - les réglages utilisateur ;
  - les préférences des modules ;
  - les tags masqués ;
  - les listes de lecture ;
  - l'historique enregistré par AO3 Helper ;
  - toutes les autres données stockées par l'extension.

---

## Réglages utilisateur

| Réglage             | Description                                                                     |
|---------------------|---------------------------------------------------------------------------------|
| `enableAutoBackup`  | Active les sauvegardes automatiques.                                            |
| `backupInterval`    | Intervalle (en minutes) entre deux sauvegardes automatiques.                    |
| `maxBackups`        | Nombre maximum de sauvegardes conservées avant suppression des plus anciennes.  |
| `syncEnabled`       | Active la synchronisation entre appareils via le compte du navigateur.          |

---

## Structure du module

* Le module est composé de cinq sous-modules fonctionnels ainsi qu'une feuille de style.
  -  `_backupAndSync.js`
  -  `automateBackup.js`
  -  `backupOperations.js`
  -  `cloudSync.js`
  -  `dataTransfer.js`
  -  `backupAndSync.css`


---


  ## Fichiers

  ### 1. `_backupAndSync.js` — le chef d'orchestre
  
  #### Rôle
  Fichier coordinateur du module. Il initialise tous les sous-modules, centralise les données communes et expose les principales fonctions utilisées par le reste d'AO3 Helper.

  #### Responsabilités
  - Initialise les quatre sous-modules.
  - Partage la liste des sauvegardes entre les sous-modules.
  - Coordonne les opérations de sauvegarde et de restauration.
  - Sert de point d'entrée unique pour le reste de l'extension.

  #### Fonctions exposées
  Le coordinateur fournit notamment des fonctions permettant de :
  - créer une sauvegarde ;
  - restaurer une sauvegarde ;
  - exporter des données ;
  - importer des données ;
  - lancer une synchronisation ;
  - accéder à la liste des sauvegardes.


---


### 2. `automateBackup.js` — les sauvegardes automatiques

  #### Rôle
  Gère entièrement les sauvegardes automatiques de l'extension. Il surveille l'intervalle choisi par l'utilisateur, crée régulièrement de nouvelles sauvegardes et supprime automatiquement les plus anciennes lorsque la limite est atteinte.

  #### Fonctionnalités : 
  * Sauvegardes automatiques
    - Effectue une première sauvegarde dès l'initialisation du module.
    - Lance ensuite des sauvegardes périodiques en arrière-plan.
    - Permet d'activer ou désactiver complètement le système.
    - Utilise un intervalle configurable (15 minutes par défaut).
    - Exécute les sauvegardes avec `setInterval()`.

  * Création des sauvegardes
    - récupère toutes les données d'AO3 Helper ;
    - parcourt les clés présentes dans `localStorage` ;
    - conserve uniquement les données appartenant aux espaces de noms `ao3h` et `AO3H` ;
    - ignore les données internes utilisées par le système de sauvegarde automatique ;
    - crée un instantané complet des données ;
    - ajoute un horodatage au format ISO ;
    - enregistre la sauvegarde dans la liste des sauvegardes.

  * Gestion de l'historique
    - respecte le nombre maximal de sauvegardes défini par l'utilisateur ;
    - supprime automatiquement les plus anciennes lorsque cette limite est dépassée ;
    - utilise un fonctionnement FIFO (First In, First Out).

  * Restauration
    - la sauvegarde est sélectionnée par son index ;
    - une confirmation est demandée à l'utilisateur ;
    - les données remplacent les entrées actuelles du `localStorage` ;
    - une notification indique si l'opération a réussi ou échoué.

  #### Configuration
  Le sous-module utilise la configuration stockée sous la clé : `backupAndSync`
  Les paramètres utilisés sont :
    - `enableAutoBackup`
    - `backupInterval`
    - `maxBackups`
  Le module peut également notifier le reste de l'extension lorsqu'une sauvegarde est créée.



---

### 3. `backupOperations.js` — les sauvegardes à la demande

#### Rôle

Gère toutes les opérations de sauvegarde exécutées à la demande de l'utilisateur.

Contrairement à `automateBackup.js`, qui crée des sauvegardes automatiques à intervalles réguliers, ce sous-module s'occupe des sauvegardes manuelles, de leur restauration et des différentes méthodes de sauvegarde disponibles.

Il constitue également la base des fonctionnalités avancées comme les sauvegardes sélectives, chiffrées, compressées ou incrémentales.


#### Fonctionnalités

##### Sauvegarde complète

Le module peut créer une sauvegarde complète de toutes les données utilisées par AO3 Helper.

Lors de cette opération, il :

- parcourt toutes les données enregistrées dans `localStorage` ;
- récupère uniquement les clés appartenant aux espaces de noms `ao3h` et `AO3H` ;
- ignore les données internes utilisées par le système de sauvegarde automatique ;
- convertit les données en JSON afin de produire une sauvegarde facilement réutilisable.


##### Historique des sauvegardes

Chaque sauvegarde est enregistrée sous la forme d'un instantané daté.

Le système :

- ajoute automatiquement un horodatage à chaque sauvegarde ;
- permet de revenir à un état précédent de l'extension ;
- conserve plusieurs versions successives ;
- supprime automatiquement les plus anciennes lorsque la limite maximale est atteinte.


##### Sauvegardes sélectives

Le module est conçu pour permettre de sauvegarder uniquement certaines catégories de données plutôt que l'intégralité de l'extension.

Les possibilités prévues sont notamment :

- sélectionner certaines catégories de données ;
- sauvegarder uniquement des modules spécifiques ;
- exclure certains types de données ;
- utiliser différents profils de sauvegarde personnalisés.

Ces fonctionnalités existent dans la conception du module mais ne disposent actuellement pas d'une interface utilisateur.

##### Restauration

Une sauvegarde existante peut être restaurée à tout moment.

Le processus comprend :

- la sélection d'une sauvegarde par son index ;
- l'affichage de sa date et de son heure ;
- une demande de confirmation avant toute modification ;
- le remplacement des données actuellement enregistrées ;
- un avertissement indiquant que les données existantes seront écrasées.


##### Sauvegardes chiffrées

Le module prévoit la possibilité de protéger une sauvegarde par mot de passe.

Le fonctionnement comprend :

- un mot de passe défini par l'utilisateur ;
- un chiffrement AES des données ;
- la gestion de la clé de chiffrement lors de la sauvegarde et de la restauration.

Cette fonctionnalité est présente dans les spécifications du module mais n'est pas encore exposée dans l'interface.


##### Compression

Les sauvegardes peuvent être compressées afin de réduire leur taille.

Le système prévoit :

- la compression des fichiers de sauvegarde ;
- l'utilisation de l'API `CompressionStream` (gzip) ;
- une réduction de l'espace de stockage utilisé ;
- des exportations et importations plus rapides.

Cette fonctionnalité n'est actuellement pas accessible depuis l'interface utilisateur.

##### Sauvegardes incrémentales

Le module prévoit également un mode de sauvegarde incrémentale.

Au lieu de recopier l'ensemble des données à chaque sauvegarde, il peut enregistrer uniquement les éléments ayant changé depuis la sauvegarde précédente.

Les avantages sont :

- des sauvegardes plus rapides ;
- une taille de fichier réduite ;
- un stockage plus efficace grâce aux sauvegardes différentielles (delta backups).

Cette fonctionnalité fait partie des capacités prévues du module mais n'est pas encore disponible dans l'interface.


##### Détails techniques

###### Collecte des données

Les données sauvegardées sont récupérées directement depuis `localStorage`.

Le module :

- parcourt toutes les clés disponibles ;
- conserve uniquement les données appartenant à AO3 Helper ;
- exclut les données internes de sauvegarde ;
- sérialise le résultat au format JSON.

####### Gestion des versions

Chaque sauvegarde constitue un instantané complet de l'état de l'extension à un moment précis.

Chaque instantané possède :

- sa propre date ;
- son propre horodatage ;
- son propre contenu.

Cela permet une restauration "point dans le temps" (point-in-time recovery).


### Dépendances

Ce sous-module fournit les opérations de sauvegarde utilisées par :

- `_backupAndSync.js`
- `automateBackup.js`
- `dataTransfer.js`

Il ne gère ni les sauvegardes automatiques ni la synchronisation entre appareils, qui sont respectivement prises en charge par `automateBackup.js` et `cloudSync.js`.


---

### 4. `cloudSync.js` — la synchronisation entre appareils

## Rôle

Gère la synchronisation des données d'AO3 Helper entre plusieurs appareils.

Le module utilise le système de synchronisation natif du navigateur afin que les réglages et les données de l'extension puissent être retrouvés automatiquement lorsqu'un utilisateur se connecte avec le même compte sur un autre ordinateur.

La synchronisation est entièrement optionnelle et doit être activée par l'utilisateur.

## Fonctionnalités

### Synchronisation via le navigateur

Le module utilise le stockage synchronisé fourni par le navigateur.

Navigateurs pris en charge :

- `chrome.storage.sync`
- `browser.storage.sync`

La synchronisation fonctionne uniquement lorsque l'utilisateur est connecté à son compte navigateur.

Le système :

- envoie les données vers le stockage synchronisé ;
- récupère automatiquement les données disponibles sur les autres appareils ;
- garde les appareils synchronisés.


### Activation utilisateur

La synchronisation est contrôlée par le réglage :

`syncEnabled`

Lorsque cette option est désactivée :

- aucune donnée n'est envoyée ;
- aucune donnée distante n'est récupérée.


### Synchronisation au démarrage

Au lancement de l'extension, le module :

- lit les données présentes dans le stockage synchronisé ;
- compare leur date avec les données locales ;
- restaure automatiquement les données distantes lorsqu'elles sont plus récentes ;
- fusionne les données récupérées avec le `localStorage`.

Le système utilise une stratégie **Last Write Wins**, c'est-à-dire que la version la plus récente est conservée automatiquement.


### Synchronisation des modifications

Lorsque des données changent :

- elles sont envoyées vers le stockage synchronisé ;
- l'envoi est retardé volontairement afin d'éviter une synchronisation après chaque petite modification.

Le système utilise un **debounce de 2 secondes**.

Cela permet :

- de réduire le nombre d'écritures ;
- d'éviter les appels inutiles ;
- d'améliorer les performances.

### Gestion des limites

Le stockage synchronisé du navigateur possède une capacité limitée d'environ :

**100 KB**

Le module :

- surveille cette limite ;
- désactive proprement la synchronisation lorsque le quota est dépassé ;
- évite les erreurs provoquées par un espace insuffisant.



  ## Décisions de conception

### Synchronisation GitHub

Une synchronisation via **GitHub Gist** avait été envisagée.

Cette approche a finalement été abandonnée au profit du stockage synchronisé natif du navigateur, beaucoup plus simple à utiliser pour la majorité des utilisateurs.


## Détails techniques

### API utilisées

- `chrome.storage.sync`
- `browser.storage.sync`

### Stratégie de résolution des conflits

- Last Write Wins
- comparaison des dates de modification
- fusion des données distantes dans le `localStorage`

---


### 5. `dataTransfer.js` — exporter et importer

## Rôle

Gère tous les échanges de données entre AO3 Helper et des fichiers externes.

Ce sous-module permet :

- d'exporter les données de l'extension ;
- d'importer une sauvegarde existante ;
- d'exporter des listes de fics dans différents formats ;
- de construire les éléments d'interface liés à ces opérations.


## Fonctionnalités

### Export des données

Le module peut exporter l'ensemble des données d'AO3 Helper.

L'export comprend :

- toutes les données stockées dans `localStorage` ;
- les réglages ;
- les préférences ;
- les données des modules.

Les données sont enregistrées dans un fichier JSON.

Chaque export :

- déclenche le téléchargement du fichier ;
- génère automatiquement un nom contenant un horodatage ;
- peut informer le reste de l'extension du nombre d'éléments exportés.


### Import des données

Le module permet de restaurer une sauvegarde précédemment exportée.

Le processus comprend :

- l'ouverture d'un sélecteur de fichiers ;
- la lecture du fichier JSON ;
- son analyse ;
- la restauration des données dans `localStorage` ;
- une notification indiquant le nombre d'éléments importés.


### Validation des données

Avant toute restauration, le module vérifie :

- que le fichier est valide ;
- que sa structure JSON est correcte ;
- que les types de données attendus sont présents.

Le système gère également les erreurs provoquées par :

- un fichier corrompu ;
- un format invalide ;
- des données incompatibles.


### Export des listes de fics

Le module peut également exporter les œuvres visibles sur une page AO3.

Formats disponibles :

- JSON
- CSV
- HTML

Les données exportées sont récupérées directement depuis le DOM.


### Compilation des listes

Pour chaque œuvre, le module peut récupérer :

- les métadonnées de la fic ;
- la page d'origine (détectée à partir de l'URL) ;
- la catégorie d'origine :

  - Bookmarks
  - History
  - Marked for Later
  - Listing

- les informations permettant de filtrer les œuvres selon leur provenance.


### Mise en forme des exports

Le module prépare automatiquement le contenu selon le format choisi.

Formats pris en charge :

#### JSON

- structure complète des données

#### CSV

- colonnes adaptées aux œuvres exportées

#### HTML

- génération de cartes (`div`)
- modèle HTML personnalisable


### Interface utilisateur

Le sous-module construit les éléments visibles dans le panneau de configuration.

Il fournit notamment :

- les boutons d'export ;
- les boutons d'import ;
- les contrôles de sauvegarde ;
- les contrôles de synchronisation ;
- l'affichage de l'état de la synchronisation.


### Retour visuel

Le module informe l'utilisateur du déroulement des opérations.

Les retours peuvent prendre la forme de :

- notifications ("toast") ;
- indicateurs de progression ;
- messages de succès ;
- messages d'erreur ;
- mises à jour d'état.


## Dépendances

Le module travaille principalement avec :

- `_backupAndSync.js`
- `backupOperations.js`
- `cloudSync.js`

Il s'appuie sur ces sous-modules pour effectuer les sauvegardes, restaurations et synchronisations.



### 6. `backupAndSync.css`

#### Rôle
Contient l'ensemble des styles utilisés par le module **Backup and Sync**.
* Il définit notamment l'apparence :
  - des boutons d'export et d'import ;
  - des contrôles de sauvegarde ;
  - des messages d'état ;
  - des notifications affichées par le module.

--- 


## Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Gestion des sauvegardes

### ~~Explorateur de sauvegardes~~ ✅ Fait

~~Pouvoir consulter directement depuis le panneau :~~

~~- la liste des sauvegardes automatiques ;~~
~~- leur date et leur heure de création ;~~
~~- leurs informations principales ;~~
~~- choisir précisément laquelle restaurer.~~

> Ajouté dans le panneau (section « Backups ») : liste avec date, nombre de clés
> et taille de chaque sauvegarde, bouton Restaurer par sauvegarde.

---

### ~~Sauvegarde immédiate~~ ✅ Fait

~~Ajouter un bouton **Sauvegarder maintenant** afin de créer une sauvegarde
instantanée sans attendre le prochain déclenchement automatique.~~

> Le bouton « ☁️ Backup Now » existait déjà dans le HTML du panneau mais
> n'avait aucun gestionnaire de clic — corrigé.

---

### ~~Vue détaillée des données~~ ✅ Fait

~~Afficher toutes les données sauvegardées avec leur taille et leur date de
mise à jour.~~ (le statut « corrompue/valide » individuel n'est pas affiché —
voir Vérification d'intégrité plus bas, toujours non implémentée.)

---

### ~~Recherche dans les sauvegardes~~ ✅ Fait

~~Permettre de rechercher directement une information à l'intérieur des
sauvegardes existantes.~~ (recherche par date affichée uniquement, pas par
contenu des données sauvegardées.)

---

### Migration des données

Détecter automatiquement les changements de version d'AO3 Helper afin de :

- nettoyer les anciennes données devenues inutiles ;
- convertir automatiquement les anciennes structures de données ;
- maintenir la compatibilité entre les versions.

---

### Résolution des conflits

Lorsqu'une différence est détectée entre deux appareils synchronisés, permettre à l'utilisateur de choisir lui-même quelle version conserver.

Aujourd'hui, le système applique automatiquement la stratégie **Last Write Wins**, qui conserve toujours la version la plus récente.

---

## Fonctionnalités avancées déjà prévues

Les fonctionnalités suivantes existent déjà dans la logique interne du module, mais ne disposent pas encore d'une interface utilisateur.

### Sauvegardes sélectives

Pouvoir choisir précisément quelles catégories de données doivent être sauvegardées.

Exemples :

- réglages ;
- préférences ;
- historique ;
- données de certains modules uniquement.

---

### Modes de sauvegarde

Choisir lors de la création d'une sauvegarde :

- une sauvegarde standard ;
- une sauvegarde compressée ;
- une sauvegarde protégée par mot de passe ;
- une sauvegarde incrémentale.

Ces fonctionnalités existent déjà dans les spécifications de `backupOperations.js`.

---

### ~~Nettoyage complet~~ ✅ Fait

~~Ajouter un bouton permettant d'effacer l'ensemble des données sauvegardées.~~

> Bouton « Clear All » ajouté dans la section Backups du panneau.

---

### Vérification d'intégrité

Contrôler automatiquement qu'une sauvegarde :

- n'est pas corrompue ;
- possède une structure valide ;
- peut être restaurée sans erreur.

---

## Décisions de conception
Les choix suivants ont été pris volontairement au cours du développement.

  ### Synchronisation GitHub
  Une synchronisation via **GitHub Gist** avait été envisagée. Cette approche a finalement été abandonnée.
  Le module utilise désormais exclusivement le stockage synchronisé natif du navigateur (`chrome.storage.sync` / `browser.storage.sync`), jugé beaucoup plus simple à configurer pour la majorité des utilisateurs.

  ### Historique de lecture
  Le module ne synchronise pas automatiquement l'intégralité de l'historique de lecture entre plusieurs appareils.
  
  * Cette décision a été prise car :
    - l'historique peut devenir très volumineux ;
    - le stockage synchronisé du navigateur est limité à environ **100 KB** ;
    - cette limite serait rapidement dépassée.
  
  L'historique reste néanmoins sauvegardé localement et peut toujours être exporté manuellement avec le reste des données.




