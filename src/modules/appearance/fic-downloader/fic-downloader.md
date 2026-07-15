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
- Réessayer automatiquement un téléchargement qui a échoué, au lieu de devoir le refaire à la main
- Prévenir quand la bibliothèque hors-ligne prend trop de place, ou nettoyer automatiquement les fics les plus anciennes quand il n'y a plus assez d'espace
- Voir en un seul endroit la liste de toutes les fics sauvegardées hors-ligne — pour l'instant, il faut retrouver chaque fic une par une sur sa propre page pour savoir si elle est enregistrée

## Explicitement écarté

- Synchroniser les téléchargements dans le cloud — pour rester privé, tout reste en local
- Des modèles de téléchargement personnalisés
- Télécharger automatiquement à intervalles réguliers — jugé trop agressif pour les serveurs d'AO3
- Suivre sa progression de lecture dans les fics téléchargées — c'est le rôle d'un autre module (le suivi de lecture), pas de celui-ci

## Précision

⚠️ La doc historique présentait ce module comme une simple idée pas encore
codée ("Ce qui est prévu"). Ce n'est plus le cas : le téléchargement
individuel, la sélection multiple, le téléchargement d'une page entière en
ZIP, le téléchargement d'une série entière, la bibliothèque hors-ligne, le
bouton Kindle et même un générateur de couverture (non mentionné dans la
doc historique) sont tous bel et bien codés aujourd'hui. Seules
l'intégration Calibre et le masquage des boutons sur les listes existent
dans le code sans être vraiment accessibles depuis le panneau (voir
"Specs non implémentés" ci-dessus).
