# backupAndSync

**Tab:** Appearance & Tools

## À quoi ça sert

Ce module garde une copie de sauvegarde de tout ce que fait AO3 Helper (réglages, tags masqués, historique de lecture...) pour ne rien perdre en cas de problème. Il fait des sauvegardes automatiques toutes les 15 minutes, permet d'exporter ou d'importer ses données dans un fichier, et peut synchroniser ces données entre plusieurs appareils grâce au compte du navigateur.

Il permet de :
- sauvegarder automatiquement toutes les données de l'extension ;
- créer des sauvegardes manuelles ;
- restaurer une sauvegarde précédente ;
- exporter ou importer les données depuis un fichier ;
- synchroniser les données entre plusieurs appareils via le stockage synchronisé du navigateur.

Les données sauvegardées comprennent notamment :
- les réglages utilisateur ;
- les préférences des modules ;
- les tags masqués ;
- les listes de lecture ;
- l'historique enregistré par AO3 Helper ;
- toutes les autres données stockées par l'extension.

## Réglages utilisateur

| Réglage             | Description                                                                     |
|---------------------|-----------------------------------------------------------------------------------|
| `enableAutoBackup`  | Active les sauvegardes automatiques.                                            |
| `backupInterval`    | Intervalle (en minutes) entre deux sauvegardes automatiques.                    |
| `maxBackups`        | Nombre maximum de sauvegardes conservées avant suppression des plus anciennes.  |
| `syncEnabled`       | Active la synchronisation entre appareils via le compte du navigateur.          |

## Structure du module

Le module est composé d’un coordinateur, de trois sous-modules fonctionnels et d’une feuille de style.
- `_backupAndSync.js`
- `automateBackup.js`
- `cloudSync.js`
- `dataTransfer.js`
- `backupAndSync.css`

## Fichiers

### 1. `_backupAndSync.js` — le chef d'orchestre

#### Rôle
Fichier coordinateur du module. Il initialise les autres sous-modules, centralise les données communes et expose les principales fonctions utilisées par le reste d'AO3 Helper.

#### Responsabilités
- Met en route les autres sous-modules du module.
- Garde en mémoire la liste des sauvegardes et la partage entre les sous-modules.
- Possède et exécute les opérations de sauvegarde et de restauration.
- Sert de point d'entrée unique pour le reste de l'extension.

#### Fonctions exposées
Le coordinateur fournit notamment des fonctions permettant de :
- créer une sauvegarde ;
- restaurer une sauvegarde ;
- exporter des données ;
- importer des données ;
- lancer une synchronisation ;
- accéder à la liste des sauvegardes.

### 2. `automateBackup.js` — les sauvegardes automatiques

#### Rôle
Gère entièrement les sauvegardes automatiques de l'extension. Il surveille l'intervalle choisi par l'utilisateur, crée régulièrement de nouvelles sauvegardes et supprime automatiquement les plus anciennes lorsque la limite est atteinte.

#### Fonctionnalités

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
Le sous-module utilise la configuration stockée sous la clé `backupAndSync`. Les paramètres utilisés sont `enableAutoBackup`, `backupInterval` et `maxBackups`. Le module peut également notifier le reste de l'extension lorsqu'une sauvegarde est créée.

### Opérations de sauvegarde à la demande — intégrées à `_backupAndSync.js`

#### Rôle
Le coordinateur gère toutes les opérations de sauvegarde exécutées à la demande de l'utilisateur. Contrairement à `automateBackup.js`, qui planifie les sauvegardes automatiques, ce moteur interne s'occupe des sauvegardes manuelles, de leur restauration et des méthodes sélectives, chiffrées, compressées ou incrémentales.

#### Fonctionnalités

* Sauvegarde complète

Le module peut créer une sauvegarde complète de toutes les données utilisées par AO3 Helper. Lors de cette opération, il :
- parcourt toutes les données enregistrées dans `localStorage` ;
- récupère uniquement les clés appartenant aux espaces de noms `ao3h` et `AO3H` ;
- ignore les données internes utilisées par le système de sauvegarde automatique ;
- convertit les données en JSON afin de produire une sauvegarde facilement réutilisable.

* Historique des sauvegardes

Chaque sauvegarde est enregistrée sous la forme d'un instantané daté. Le système :
- ajoute automatiquement un horodatage à chaque sauvegarde ;
- permet de revenir à un état précédent de l'extension ;
- conserve plusieurs versions successives ;
- supprime automatiquement les plus anciennes lorsque la limite maximale est atteinte.

* Sauvegardes sélectives

Le module permet de sauvegarder uniquement certaines catégories de données plutôt que l'intégralité de l'extension : sélectionner certaines catégories de données, sauvegarder uniquement des modules spécifiques, exclure certains types de données, utiliser différents profils de sauvegarde personnalisés. Ce comportement existe dans le module et a désormais son interface dans le panneau (champ « Only these categories », voir la section Specs non implémentés).

* Restauration

Une sauvegarde existante peut être restaurée à tout moment. Le processus comprend :
- la sélection d'une sauvegarde par son index ;
- l'affichage de sa date et de son heure ;
- une demande de confirmation avant toute modification ;
- le remplacement des données actuellement enregistrées ;
- un avertissement indiquant que les données existantes seront écrasées.

* Sauvegardes chiffrées

Le module permet de protéger une sauvegarde par mot de passe : un mot de passe défini par l'utilisateur, un chiffrement AES des données, et la gestion de la clé de chiffrement lors de la sauvegarde et de la restauration. Cette fonctionnalité a désormais son interface dans le panneau (sélecteur « Manual backup mode »).

* Compression

Les sauvegardes peuvent être compressées afin de réduire leur taille : compression des fichiers de sauvegarde, utilisation de l'API `CompressionStream` (gzip), réduction de l'espace de stockage utilisé, exportations et importations plus rapides. Accessible depuis le panneau via le même sélecteur de mode.

* Sauvegardes incrémentales

Le module prévoit aussi un mode de sauvegarde incrémentale : au lieu de recopier l'ensemble des données à chaque sauvegarde, il peut n'enregistrer que les éléments ayant changé depuis la sauvegarde précédente (delta backups), pour des sauvegardes plus rapides, une taille de fichier réduite et un stockage plus efficace. Également accessible depuis le sélecteur de mode du panneau.

#### Détails techniques

##### Collecte des données
Les données sauvegardées sont récupérées directement depuis `localStorage`. Le module parcourt toutes les clés disponibles, conserve uniquement les données appartenant à AO3 Helper, exclut les données internes de sauvegarde, et sérialise le résultat au format JSON.

##### Gestion des versions
Chaque sauvegarde constitue un instantané complet de l'état de l'extension à un moment précis, avec sa propre date, son propre horodatage et son propre contenu. Cela permet une restauration « point dans le temps » (point-in-time recovery).

##### Dépendances
Ce moteur interne fournit les opérations utilisées par le coordinateur et `automateBackup.js`. Il ne planifie pas les sauvegardes automatiques et ne gère pas la synchronisation entre appareils, prises en charge respectivement par `automateBackup.js` et `cloudSync.js`.

### 3. `cloudSync.js` — la synchronisation entre appareils

#### Rôle
Gère la synchronisation des données d'AO3 Helper entre plusieurs appareils. Le module utilise le système de synchronisation natif du navigateur (`chrome.storage.sync` / `browser.storage.sync`, ~100 KB) afin que les réglages et les données de l'extension puissent être retrouvés automatiquement lorsqu'un utilisateur se connecte avec le même compte sur un autre ordinateur. La synchronisation est entièrement optionnelle et doit être activée par l'utilisateur via le réglage `syncEnabled` (aucune donnée n'est envoyée ni récupérée tant qu'elle est désactivée).

#### Fonctionnalités

* Synchronisation au démarrage

Au lancement de l'extension, le module lit les données présentes dans le stockage synchronisé et compare leur date avec les données locales.
- Sur un appareil qui n'a jamais synchronisé, la version distante est récupérée automatiquement sans question.
- Si l'appareil a déjà un historique de synchronisation et que la version distante est plus récente, une boîte de dialogue présente les deux dates et laisse l'utilisateur choisir : garder la version distante, ou garder la version locale (qui redevient alors prioritaire au prochain envoi). Le module construit lui-même ce message de choix. L'ancien comportement « Last Write Wins » aveugle (qui écrasait automatiquement les données locales sans demander) a été abandonné au profit de ce choix explicite.

* Synchronisation des modifications

Lorsque des données changent, elles sont envoyées vers le stockage synchronisé, avec un envoi volontairement retardé (debounce de 2 secondes) afin d'éviter de synchroniser à chaque petite modification — ce qui réduit le nombre d'écritures, évite les appels inutiles et améliore les performances.

* Gestion des limites

Le stockage synchronisé du navigateur possède une capacité limitée d'environ 100 KB. Le module surveille cette limite et désactive proprement la synchronisation lorsque le quota est dépassé, pour éviter les erreurs provoquées par un espace insuffisant.

#### Détails techniques

##### API utilisées
- `chrome.storage.sync`
- `browser.storage.sync`

##### Résolution des conflits
Comparaison des dates de modification, avec restauration silencieuse uniquement pour un appareil sans historique de sync ; sinon, choix explicite proposé à l'utilisateur (voir ci-dessus). Les données choisies sont ensuite fusionnées dans le `localStorage`.

### 4. `dataTransfer.js` — exporter et importer

#### Rôle
Gère tous les échanges de données entre AO3 Helper et des fichiers externes : exporter les données de l'extension, importer une sauvegarde existante, exporter des listes de fics dans différents formats, et construire les éléments d'interface liés à ces opérations (y compris les boutons d'activation/désactivation de la synchronisation).

#### Fonctionnalités

* Export des données

Le module peut exporter l'ensemble des données d'AO3 Helper (tout ce qui est stocké dans `localStorage` : réglages, préférences, données des modules) dans un fichier JSON. Chaque export déclenche le téléchargement du fichier, génère automatiquement un nom contenant un horodatage, et peut informer le reste de l'extension du nombre d'éléments exportés.

* Import des données

Le module permet de restaurer une sauvegarde précédemment exportée : ouverture d'un sélecteur de fichiers, lecture du fichier JSON, analyse, restauration des données dans `localStorage`, puis notification indiquant le nombre d'éléments importés.

* Validation des données

Avant toute restauration, le module vérifie que le fichier est valide, que sa structure JSON est correcte et que les types de données attendus sont présents. Il gère aussi les erreurs provoquées par un fichier corrompu, un format invalide ou des données incompatibles.

* Export des listes de fics

Le module peut également exporter les œuvres visibles sur une page AO3, dans les formats JSON, CSV ou HTML. Les données exportées sont récupérées directement depuis le DOM.

* Compilation des listes

Pour chaque œuvre, le module récupère les métadonnées de la fic, la page d'origine (détectée à partir de l'URL), la catégorie d'origine (Bookmarks, History, Marked for Later, Listing), et les informations permettant de filtrer les œuvres selon leur provenance.

* Mise en forme des exports
  - **JSON** : structure complète des données.
  - **CSV** : colonnes adaptées aux œuvres exportées.
  - **HTML** : génération de cartes (`div`), avec un modèle personnalisable.

* Interface utilisateur

Le sous-module construit les éléments visibles dans le panneau de configuration : boutons d'export, boutons d'import, contrôles de sauvegarde, contrôles de synchronisation, affichage de l'état de la synchronisation.

* Retour visuel

Le module informe l'utilisateur du déroulement des opérations via des notifications (« toast »), des indicateurs de progression, des messages de succès/erreur et des mises à jour d'état.

#### Dépendances
Le module travaille principalement avec le moteur interne de `_backupAndSync.js` et `cloudSync.js` pour effectuer les sauvegardes, restaurations et synchronisations.

### Migration des données entre versions — intégrée à `_backupAndSync.js`

- Détecte qu'AO3 Helper a changé de version depuis la dernière visite (version mémorisée sous `ao3h:version`)
- Déplace les réglages enregistrés sous les anciens noms de modules (avant la vague de renommage : `downloadManager` → `ficDownloader`, `bookmarkManager` → `bookmarkVault`, etc.) vers leur nom actuel, puis supprime les vieilles clés
- Les réglages déjà présents sous le nouveau nom gagnent toujours sur les anciens

### 5. `backupAndSync.css`

#### Rôle
Contient l'ensemble des styles utilisés par le module Backup and Sync : boutons d'export et d'import, contrôles de sauvegarde, messages d'état et notifications affichées par le module.





## Specs faites :

- Voir la liste des sauvegardes automatiques et choisir laquelle restaurer, directement depuis le panneau ✅
  Fait : section « Backups » du panneau — liste avec date, type, nombre de clés
  et taille de chaque sauvegarde, bouton Restore par sauvegarde, suppression
  individuelle.

- Un bouton « Sauvegarder maintenant » dans le panneau ✅
  Fait : le bouton « ☁️ Backup Now » existait déjà dans le HTML du panneau
  mais n'avait aucun gestionnaire de clic — corrigé. Il propose désormais un
  choix du mode (standard, compressé, chiffré, incrémental) et un filtre de
  catégories optionnel.

- Voir en un coup d'œil toutes les données sauvegardées, avec leur taille et leur état ✅
  Fait : chaque sauvegarde affiche son type, son nombre de clés, sa taille et
  une icône d'état (✓ valide / ⚠️ corrompue — vérification de structure, et
  décompression réelle pour les sauvegardes gzip). Voir aussi « Vérification
  d'intégrité » plus bas.

- Chercher directement dans ses données sauvegardées ✅
  Fait : le champ de recherche filtre par date affichée et par contenu (noms
  de clés à l'intérieur des sauvegardes, ou le delta des incrémentales,
  catégories des sauvegardes sélectives).

- Nettoyer ou mettre à jour automatiquement les données quand l'extension change de version ✅
  Fait dans `_backupAndSync.js`. Au changement de version (mémorisée sous
  `ao3h:version`), les réglages stockés sous les anciens ids de modules
  (`downloadManager`, `bookmarkManager`, `paginationManager`, etc. — la liste
  vient des notes « Previously: » des configs du panneau) sont déplacés vers
  l'id actuel, fusionnés sans écraser l'existant, puis les clés legacy sont
  supprimées.

- Pouvoir choisir soi-même quelle version garder quand deux appareils ont des données différentes, plutôt que ce soit toujours la plus récente qui gagne automatiquement ✅
  Fait, dans `cloudSync.js` : le restore silencieux ne se produit plus que
  sur un appareil sans historique de sync ; sinon, une boîte de dialogue
  présente les deux dates et laisse choisir (OK = version distante, Annuler
  = garder le local, qui redevient prioritaire au prochain envoi). L'ancien
  Last-Write-Wins aveugle est abandonné.

- Choisir de protéger une sauvegarde avec un mot de passe, de la compresser, ou de ne garder que ce qui a changé, directement depuis le panneau ✅
  Fait : sélecteur « Manual backup mode » dans le panneau (standard /
  compressé gzip / chiffré par mot de passe / incrémental). Chaque type se
  restaure correctement depuis la liste : mot de passe demandé pour le
  chiffré (AES-GCM/PBKDF2), décompression gzip pour le compressé,
  application du delta (ajouts/modifications/suppressions) pour
  l'incrémental.

- Choisir précisément quelles données sauvegarder, plutôt que tout d'un coup, directement depuis le panneau ✅
  Fait : champ « Only these categories » à côté du bouton Backup Now — des
  filtres de clés séparés par des virgules (ex. `readingList, filters`)
  transforment la sauvegarde en sauvegarde sélective.

- Un bouton pour tout effacer d'un coup ✅
  Fait : bouton « Clear All » ajouté dans la section Backups du panneau.

- Vérifier que les données sauvegardées ne sont pas abîmées ou corrompues ✅
  Fait : chaque sauvegarde de la liste est validée selon son type (structure
  des données, des octets chiffrés/compressés, du delta) avec une icône
  ✓/⚠️ ; les sauvegardes gzip subissent en plus une décompression réelle en
  arrière-plan. Une sauvegarde invalide ne peut pas être restaurée (message
  d'erreur) et les imports de fichiers ignorent les entrées corrompues.
  Seule limite : une sauvegarde chiffrée ne peut être vérifiée qu'en
  structure (la déchiffrer exigerait le mot de passe).

## Explicitement écarté

- Passer par un compte GitHub (GitHub Gist) pour la synchronisation entre appareils — approche envisagée puis abandonnée, jugée trop technique à configurer pour la plupart des gens
- Synchroniser tout l'historique de lecture entre appareils — les données sont trop volumineuses pour la petite place disponible (~100 KB) dans la synchronisation du navigateur ; cette limite serait rapidement dépassée. L'historique reste néanmoins sauvegardé localement et peut toujours être exporté manuellement avec le reste des données.

## Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

### Synchronisation GitHub
Une synchronisation via GitHub Gist avait été envisagée. Cette approche a finalement été abandonnée : le module utilise désormais exclusivement le stockage synchronisé natif du navigateur (`chrome.storage.sync` / `browser.storage.sync`), jugé beaucoup plus simple à configurer pour la majorité des utilisateurs.

### Historique de lecture
Le module ne synchronise pas automatiquement l'intégralité de l'historique de lecture entre plusieurs appareils, car :
- l'historique peut devenir très volumineux ;
- le stockage synchronisé du navigateur est limité à environ 100 KB ;
- cette limite serait rapidement dépassée.

L'historique reste néanmoins sauvegardé localement et peut toujours être exporté manuellement avec le reste des données.
