# textToSpeech

**Tab:** Reading

## À quoi ça sert

Ce module lit les fics à voix haute, avec un panneau de contrôle flottant :
lecture, pause, vitesse, choix de la voix, surlignage de la phrase en
cours, et une minuterie de sommeil.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `voice` | (voix du système) | La voix utilisée pour la lecture |
| `playbackSpeed` | `1` | La vitesse de lecture (de 0.5× à 2×) |
| `stopOnPageChange` | activé | Arrête la lecture si on change de page |
| `autoNextChapter` | activé | Lit automatiquement le chapitre suivant à la fin |
| `highlightSentence` | activé | Surligne la phrase en cours de lecture |
| `autoScroll` | activé | Fait défiler la page pour suivre la lecture |
| `skipAuthorNotes` | activé | Ignore les notes d'auteur |
| `skipSummary` | activé | Ignore le résumé et la préface |
| `floatingPanel` | activé | Affiche le panneau de lecture flottant |

## Fichiers

### 1. `_textToSpeech.js` — le chef d'orchestre

- Découpe le texte en phrases et partage cette info avec les autres fichiers
- Garde en mémoire les réglages communs (voix, vitesse, prononciations, minuterie)

### 2. `speechEngine.js` — le moteur de lecture

- Trouve les voix disponibles dans le navigateur
- Se souvient de la voix choisie et permet de l'écouter à l'avance
- Prépare le texte phrase par phrase pour pouvoir suivre la progression

### 3. `contentFiltering.js` — choisir quoi lire

- Récupère le texte de la fic à lire
- Peut sauter les notes d'auteur et le résumé, selon les réglages

### 4. `pronunciationManager.js` — corriger la prononciation

- Permet de créer son propre dictionnaire de prononciation (par exemple pour des noms compliqués)
- Applique ces corrections avant de lire le texte
- Permet d'exporter ou d'importer son dictionnaire

### 5. `visualFeedback.js` — suivre la lecture des yeux

- Surligne le paragraphe en train d'être lu
- Fait défiler la page automatiquement pour garder ce passage visible

### 6. `playbackControls.js` — le panneau de contrôle

- Ajoute un bouton flottant "🔊 Read Aloud" pour ouvrir le panneau
- Boutons Lecture / Pause / Stop, curseur de vitesse (0.5× à 2×), choix de la voix
- Une minuterie de sommeil (15, 30 ou 60 minutes) avec compte à rebours
- Une barre de progression et un passage automatique au chapitre suivant à la fin
- Un raccourci clavier (barre d'espace) pour lancer ou mettre en pause
- S'arrête automatiquement si on change de page

### 7. `textToSpeech.css`

- Les styles visuels du panneau, des boutons, du surlignage et de la barre de progression

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Des vitesses de lecture prédéfinies ("confortable", "rapide", "façon livre audio") plutôt qu'un simple curseur libre
- Des dictionnaires de prononciation tout prêts partagés par fandom, avec contributions de la communauté
- Régler le volume ou la hauteur de la voix
- Une base de prononciation de noms de personnages déjà prête, sans avoir à tout ajouter soi-même
- Un bouton pour couper rapidement le son (mute) sans toucher au réglage du volume
- Un fondu audio progressif juste avant que la minuterie de sommeil s'arrête
- Un bouton "+5 minutes" pour prolonger facilement la minuterie de sommeil
- Une confirmation demandée avant de passer automatiquement au chapitre suivant
- Une notification quand un chapitre vient de se terminer
- Personnaliser la couleur ou le style du surlignage pendant la lecture
- Régler la vitesse du défilement automatique de la page
- Filtrer les voix disponibles par langue et voir un indicateur de qualité pour chaque voix
- Un bouton pour sauter manuellement un passage pendant la lecture, en plus du saut automatique des notes
- Une transition plus douce quand la lecture passe automatiquement au chapitre suivant

## Explicitement écarté

- Utiliser un service de synthèse vocale en ligne pour des voix plus naturelles — tout se passe dans le navigateur
- Surligner exactement la phrase lue plutôt que tout le paragraphe — jugé trop fragile techniquement
- Déplacer le panneau flottant où on veut — la position reste fixe pour rester simple
- Faire un vrai lecteur audio complet, comme pour un livre audio — le but est de rester simple, juste un outil pour faire lire le texte par le navigateur

## Précision

⚠️ Une doc historique dit que la minuterie de sommeil a été supprimée. C'est
faux aujourd'hui : elle est bel et bien codée dans `playbackControls.js`
(15, 30 ou 60 minutes, avec compte à rebours).
