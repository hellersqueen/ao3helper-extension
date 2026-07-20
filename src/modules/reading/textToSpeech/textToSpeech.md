# textToSpeech

**Tab:** Reading

## À quoi ça sert

Ce module lit les fics à voix haute, avec un panneau de contrôle flottant :
lecture, pause, vitesse, choix de la voix, surlignage de la phrase en
cours, et une minuterie de sommeil. Tout le traitement se fait localement
dans le navigateur — aucun service de synthèse vocale externe n'est utilisé.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `voice` | (voix du système) | La voix utilisée pour la lecture |
| `playbackSpeed` | `1` | La vitesse de lecture (de 0.5× à 2×) — le panneau flottant offre aussi 4 profils rapides |
| `volume` | `1` | Le volume de la voix (0 à 1) |
| `pitch` | `1` | La hauteur de la voix (0 à 2) |
| `stopOnPageChange` | activé | Arrête la lecture si on change de page |
| `autoNextChapter` | activé | Lit automatiquement le chapitre suivant à la fin |
| `confirmNextChapter` | désactivé | Demande une confirmation avant de passer au chapitre suivant |
| `notifyChapterEnd` | désactivé | Affiche une notification quand un chapitre vient de se terminer |
| `highlightSentence` | activé | Surligne la phrase en cours de lecture |
| `highlightColor` | `#fff3b0` | La couleur du surlignage de la phrase en cours |
| `autoScroll` | activé | Fait défiler la page pour suivre la lecture |
| `scrollSpeed` | `normal` | La vitesse du défilement automatique (slow / normal / fast) |
| `skipAuthorNotes` | activé | Ignore les notes d'auteur |
| `skipSummary` | activé | Ignore le résumé et la préface |
| `floatingPanel` | activé | Affiche le panneau de lecture flottant |

Réglages disponibles uniquement dans le panneau flottant (persistés directement,
pas via le panneau de réglages) : le filtre de langue des voix, et le
bouton muet — voir les sections des fichiers ci-dessous.

## Fichiers

### 1. `_textToSpeech.js` — le chef d'orchestre

- Découpe le texte en phrases et partage cette info avec les autres fichiers
- Garde en mémoire les réglages communs (voix, vitesse, prononciations, minuterie)
- Crée l'API publique partagée avant le démarrage en cascade des sous-modules (auto-enregistrés avec `parent: 'textToSpeech'`, découverts par `import.meta.glob` dans `src/modules.js`), la supprime au nettoyage ; les sous-modules relisent les globals partagés à chaque appel plutôt que de garder une référence figée

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

### 8. `playbackHelpers.js` — calculs purs pour la lecture

- Les profils de vitesse prédéfinis (`SPEED_PRESETS`)
- Bornage du volume et de la hauteur de voix
- Calcul du facteur de fondu avant la fin de la minuterie de sommeil
- Calcul de la nouvelle échéance de la minuterie après un "+5 minutes"
- Bornage de l'index de phrase pour le saut manuel

### 9. `voiceHelpers.js` — filtrage et étiquetage des voix

- Liste des langues disponibles parmi les voix du navigateur
- Filtrage des voix par langue
- Étiquette de qualité approximative (Local/Network, Default) — l'API Web
  Speech n'exposant aucune vraie métrique de qualité audio

### 10. `scrollHelpers.js` — calculs purs pour le défilement automatique

- Durée de défilement associée à chaque vitesse (slow/normal/fast)
- Fonction d'accélération/décélération (easing) et position intermédiaire,
  utilisées par `visualFeedback.js` pour animer son propre défilement
  (`scrollIntoView({behavior:'smooth'})` n'ayant pas de réglage de vitesse)

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs. État après le passage
chantier 4 (2026-07-17) :

- ~~Des vitesses de lecture prédéfinies ("confortable", "rapide", "façon livre audio") plutôt qu'un simple curseur libre~~ ✅ Fait — quatre boutons de profil (🐢 Comfortable 0.85×, Normal 1×, 🐇 Fast 1.25×, 🎧 Audiobook 1.5×) dans le panneau flottant, à côté du curseur (`playbackHelpers.js` → `SPEED_PRESETS`)
- ~~Des dictionnaires de prononciation tout prêts partagés par fandom, avec contributions de la communauté~~ ❌ Écarté — nécessiterait un serveur communautaire (hébergement + modération des contributions) ; l'extension reste 100% locale sans backend. L'import/export JSON déjà présent dans `pronunciationManager.js` permet déjà un partage manuel des dictionnaires
- ~~Régler le volume ou la hauteur de la voix~~ ✅ Fait — curseurs Volume et Pitch dans le panneau flottant et le panneau de réglages (`speechEngine.js` applique `utterance.volume`/`utterance.pitch`)
- ~~Une base de prononciation de noms de personnages déjà prête, sans avoir à tout ajouter soi-même~~ ❌ Écarté — même raison que les dictionnaires partagés : aucune base multi-fandom fiable à maintenir sans infrastructure serveur ; le dictionnaire personnel + import/export couvre déjà ce besoin
- ~~Un bouton pour couper rapidement le son (mute) sans toucher au réglage du volume~~ ✅ Fait — bouton 🔊/🔇 à côté du curseur Volume ; coupe uniquement le son effectif (`effectiveVolume()`), le curseur ne bouge pas
- ~~Un fondu audio progressif juste avant que la minuterie de sommeil s'arrête~~ ✅ Fait — les 8 dernières secondes du compte à rebours réduisent linéairement le volume des phrases lues (`computeFadeFactor`)
- ~~Un bouton "+5 minutes" pour prolonger facilement la minuterie de sommeil~~ ✅ Fait — bouton "+5m" affiché à côté du compte à rebours pendant que la minuterie tourne
- ~~Une confirmation demandée avant de passer automatiquement au chapitre suivant~~ ✅ Fait — réglage `confirmNextChapter` (case à cocher), utilise `confirm()`
- ~~Une notification quand un chapitre vient de se terminer~~ ✅ Fait — réglage `notifyChapterEnd`, affiche un toast partagé (`lib/ui/toast.js`)
- ~~Personnaliser la couleur ou le style du surlignage pendant la lecture~~ ✅ Fait (couleur) — réglage `highlightColor` (sélecteur de couleur), appliqué en style inline sur le `<mark>` ; le style (au-delà de la couleur de fond) reste volontairement simple, cohérent avec la décision de conception ci-dessous sur le surlignage
- ~~Régler la vitesse du défilement automatique de la page~~ ✅ Fait — réglage `scrollSpeed` (slow/normal/fast), anime le défilement soi-même (`scrollHelpers.js`) puisque `scrollIntoView({behavior:'smooth'})` n'a pas de réglage de vitesse
- ~~Filtrer les voix disponibles par langue et voir un indicateur de qualité pour chaque voix~~ ✅ Fait — menu de filtre par langue dans le panneau flottant ; pour la "qualité", l'API Web Speech n'expose aucune métrique réelle donc chaque voix est étiquetée Local/Network (`voice.localService`) et Default, la meilleure indication disponible en pratique (latence/dépendance réseau)
- ~~Un bouton pour sauter manuellement un passage pendant la lecture, en plus du saut automatique des notes~~ ✅ Fait — boutons ⏮/⏭ dans le panneau, sautent d'une phrase en avant/arrière
- ~~Une transition plus douce quand la lecture passe automatiquement au chapitre suivant~~ ✅ Fait — un court fondu d'opacité (classe `.ao3h-tts-chapter-fade`) et un délai de 300ms précèdent le clic automatique sur le lien du chapitre suivant

## Explicitement écarté

- Utiliser un service de synthèse vocale en ligne pour des voix plus naturelles — tout se passe dans le navigateur
- Surligner exactement la phrase lue plutôt que tout le paragraphe — jugé trop fragile techniquement (différences possibles entre le texte extrait, le découpage en phrases, la structure réelle du DOM et les transformations appliquées avant la synthèse)
- Déplacer le panneau flottant où on veut — la position reste fixe pour rester simple
- Faire un vrai lecteur audio complet, comme pour un livre audio — le but est de rester simple, juste un outil pour faire lire le texte par le navigateur
- Des dictionnaires de prononciation tout prêts partagés par fandom avec contributions communautaires — demanderait un serveur d'hébergement/modération ; l'import/export JSON local suffit
- Une base de prononciation de noms de personnages pré-remplie — même raison, pas de source de données fiable à maintenir sans backend

## Précision

⚠️ Une doc historique dit que la minuterie de sommeil a été supprimée. C'est
faux aujourd'hui : elle est bel et bien codée dans `playbackControls.js`
(15, 30 ou 60 minutes, avec compte à rebours).

## Détails techniques

Stockage : `ao3h:tts:voice`, `:rate`, `:pronunciations`, `:sleepMinutes`,
`:volume`, `:pitch`, `:langFilter` (ces trois derniers ajoutés au passage
chantier 4).

API publique `W.AO3H_TextToSpeech` : `lsGet(key)`, `lsSet(key, val)`,
`cfg`, `splitSentences`, `NS`.
