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
| `showQuickDownloadButtons` | activé | Affiche les boutons de téléchargement rapide sur les listes |
| `calibreEnabled` | désactivé | Affiche l'action "Send to Calibre" |
| `calibreUrl` | `http://localhost:8080` | L'adresse du serveur de contenu Calibre |
| `calibreLibrary` | (vide) | Le nom de la bibliothèque Calibre (optionnel) |

## Fichiers

### 1. `_ficDownloader.js` — le chef d'orchestre

- Met en route les cinq autres fichiers de fonctionnalités
- Peut mettre en cache automatiquement une fic dès qu'elle est ajoutée à la liste "à lire plus tard"

### 2. `individualDownloads.js` — téléchargement rapide sur les listes

- Ajoute une petite icône ⬇️ à côté du titre de chaque fic sur une liste
- Un clic télécharge directement la fic en un seul fichier HTML, sans avoir à l'ouvrir

### 3. `batchDownload.js` — sélectionner plusieurs fics

- Ajoute une case à cocher sur chaque fic d'une liste pour la sélectionner
- Une barre flottante en bas à droite de l'écran affiche le nombre de fics choisies, propose de tout télécharger, et un bouton permet de tout désélectionner d'un coup
- Télécharge les fics sélectionnées une par une, avec une pause de 2 secondes entre chaque, pour ne pas surcharger AO3
- Une barre de progression montre où en est le téléchargement

### 4. `completePageDownload.js` — télécharger toute une page

- Ajoute un bouton "Download All" sur les listes, avec un choix de format (HTML, EPUB, MOBI, AZW3, PDF)
- Télécharge jusqu'à 100 fics d'une même page (avec un avertissement si la limite est atteinte), avec une pause entre chaque
- Regroupe tout dans une seule archive ZIP si possible (sinon, télécharge les fichiers un par un)
- Ajoute une page-index qui liste toutes les fics téléchargées, et un fichier récapitulatif de l'opération
- Peut être annulé en cours de route ; les fics déjà téléchargées restent disponibles et les résultats partiels sont tout de même exportés

### 5. `downloadEnhancements.js` — options avancées de téléchargement

- Ajoute un menu pour choisir le format de téléchargement (HTML, EPUB, MOBI, AZW3, PDF) sur la page d'une fic et sur les listes
- Un bouton "Send to Kindle" ouvre un e-mail pré-rempli avec le lien de téléchargement, à envoyer soi-même vers son adresse Kindle ; peut aussi envoyer plusieurs fics d'un coup (une version antérieure de la spec envisageait trois stratégies d'envoi — toujours automatique / demander confirmation / jamais — mais le réglage actuel `autoKindleSend` est une simple case à cocher)
- Peut générer une image de couverture personnalisée pour une fic (styles Minimalist/Modern/Classic/Fandom-themed, avec personnalisation des couleurs/polices/disposition et prévisualisation), à télécharger séparément
- Une file d'attente de téléchargement avec réordonnancement, pause, reprise et annulation
- Sur une page de série, un bouton permet d'ajouter toute la série à la file d'attente, numérotée dans l'ordre

### 6. `offlineLibrary.js` — bibliothèque hors-ligne

- Un bouton "📥 Save Offline" sur la page d'une fic pour la garder en mémoire et la lire plus tard, même sans connexion
- Un bouton "📖 Read Offline" ouvre la version enregistrée dans un nouvel onglet
- Permet de retirer une fic de la bibliothèque hors-ligne
- Prévient avec un bandeau quand la bibliothèque approche de la limite de stockage du navigateur (seuil : 4 Mo), ou quand une sauvegarde échoue faute de place
- La liste complète des fics en cache se consulte depuis le panneau de réglages (section "Offline Library"), avec recherche par titre/auteur
- Estime directement l'espace occupé dans le localStorage et met les tailles en forme (B / KB / MB)
- Stocke les fics sous la clé `ao3h:OfflineReading:library`
- La spec évoque aussi une synchronisation de la position de lecture pour reprendre une fic hors-ligne là où elle a été arrêtée, ainsi qu'un classement par catégories et des outils de tri/filtre pour la bibliothèque — non confirmé comme implémenté par cette fiche

### 7. `ficDownloader.css`

- Les styles visuels de tous les boutons, menus, barres de progression et panneaux ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Activer l'intégration Calibre depuis le panneau de réglages (le code existe déjà à l'intérieur du module, mais rien ne permet de l'activer)~~ ✅
  Fait : section "Calibre Integration" dans le panneau (case "Enable Send to
  Calibre" + URL du serveur + nom de bibliothèque), lue par le coordinateur
  au démarrage.

- ~~Choisir de cacher les boutons de téléchargement rapide sur les listes (le réglage existe déjà à l'intérieur du module, mais rien ne permet de le changer depuis le panneau)~~ ✅
  Fait : case "Show the quick-download icon on work listings" dans le
  panneau ; le réglage contrôle désormais les deux jeux de boutons de liste
  (l'icône ⬇️ d'`individualDownloads.js` **et** le bouton "⬇ DL" de
  `downloadEnhancements.js`, qui l'ignorait auparavant).

- ~~Voir en un seul endroit la liste de toutes les fics sauvegardées hors-ligne — pour l'instant, il faut retrouver chaque fic une par une sur sa propre page pour savoir si elle est enregistrée~~ ✅
  Fait : section "Offline Library" dans le panneau — liste des fics en cache
  (titre, auteur, date, taille), bouton "📖 Read" pour ouvrir la copie,
  "🗑️" pour la retirer, "Clear All" pour tout vider, et total affiché.

- ~~Prévenir quand la bibliothèque hors-ligne prend trop de place~~ ✅
  Fait : un bandeau d'avertissement s'affiche quand une sauvegarde fait
  franchir à la bibliothèque le seuil de 4 Mo (~80% du quota localStorage),
  ou quand l'écriture échoue faute de place ; le total du panneau passe
  aussi en alerte. La recherche par titre/auteur est incluse dans la section
  "Offline Library". ~~ou nettoyer automatiquement les fics les plus anciennes quand il n'y a plus assez d'espace~~
  (nettoyage automatique écarté, voir plus bas)

- ~~Réessayer automatiquement un téléchargement qui a échoué, au lieu de devoir le refaire à la main~~ ✅
  Fait : chaque téléchargement échoué dans `downloadEnhancements.js` est
  retenté automatiquement jusqu'à 2 fois après une pause de 1,5 s, et la
  file d'attente signale les échecs définitifs au-delà.

## Explicitement écarté

- Nettoyer automatiquement les fics hors-ligne les plus anciennes quand l'espace manque — supprimer silencieusement des fics que l'utilisateur a choisi de garder risquerait de perdre des données voulues ; on préfère avertir et laisser l'utilisateur choisir quoi retirer depuis le panneau
- Envoyer une fic vers Kindle automatiquement en un clic, sans avoir à envoyer soi-même l'e-mail pré-rempli — techniquement infaisable depuis un userscript : envoyer un e-mail sans action de l'utilisateur exigerait un serveur ou des identifiants SMTP, et Amazon n'offre pas d'API publique "Send to Kindle" utilisable depuis le navigateur. Le module fait le maximum possible : e-mail pré-rempli en un clic, et le réglage `autoKindleSend` saute déjà la confirmation.
- Synchroniser les téléchargements dans le cloud — pour rester privé, tout reste en local
- Des modèles de téléchargement personnalisés
- Télécharger automatiquement à intervalles réguliers — jugé trop agressif pour les serveurs d'AO3
- Suivre sa progression de lecture dans les fics téléchargées — c'est le rôle d'un autre module (le suivi de lecture), pas de celui-ci
