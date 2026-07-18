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
- Surligner exactement la phrase lue plutôt que tout le paragraphe — jugé trop fragile techniquement
- Déplacer le panneau flottant où on veut — la position reste fixe pour rester simple
- Faire un vrai lecteur audio complet, comme pour un livre audio — le but est de rester simple, juste un outil pour faire lire le texte par le navigateur
- Des dictionnaires de prononciation tout prêts partagés par fandom avec contributions communautaires — demanderait un serveur d'hébergement/modération ; l'import/export JSON local suffit
- Une base de prononciation de noms de personnages pré-remplie — même raison, pas de source de données fiable à maintenir sans backend

## Précision

⚠️ Une doc historique dit que la minuterie de sommeil a été supprimée. C'est
faux aujourd'hui : elle est bel et bien codée dans `playbackControls.js`
(15, 30 ou 60 minutes, avec compte à rebours).



AO3 Helper - Text To Speech Module Coordinator
    Module ID: textToSpeech
    Display Name: Text To Speech
    Tab: Reading

    Submodules (Tier 2 — self-register with parent: 'textToSpeech', discovered
    independently by src/modules.js's import.meta.glob, booted automatically
    by the cascade logic already built into core/lifecycle.js's bootOne()):
        speechEngine         -- voice selection, Web Speech API wrapper
        playbackControls     -- play/pause/stop, speed, sleep timer
        visualFeedback       -- sentence highlighting, auto-scroll
        contentFiltering     -- skip author notes/summary, text cleanup
        pronunciationManager -- custom pronunciation dictionary

    Public API (W.AO3H_TextToSpeech):
        lsGet(key), lsSet(key, val), cfg, splitSentences, NS

    Created by init() before the child cascade and removed by cleanup().
    Cross-submodule wiring reads the shared globals fresh at call time.

    Storage keys:
        ao3h:tts:voice, :rate, :pronunciations, :sleepMinutes,
        :volume, :pitch, :langFilter (added in the chantier 4 pass)



AO3 Helper - Content Filtering Submodule
    Submodule ID: textToSpeech/contentFiltering
    Display Name: Content Filtering
    Source Module: Text To Speech

    Features:
        - Extracts readable text from #chapters (chapter content container)
        - Skips author notes (begin / end notes)
        - Skips summary / preface
        - Splits text into sentences for per-sentence TTS
        - Provides paragraph→sentence mapping for highlight mapping



        AO3 Helper - Playback Controls Submodule
    Submodule ID: textToSpeech/playbackControls
    Display Name: Playback Controls
    Source Module: Text To Speech

    Features:
        - Floating control panel with Play / Pause / Stop
        - Manual skip back / skip forward one sentence
        - Speed slider (0.5× – 2×) plus quick presets (Comfortable/Normal/Fast/Audiobook)
        - Volume and pitch sliders, and a mute toggle that leaves the volume slider untouched
        - Voice selector (populated from speechEngine), with a language filter
          and a Local/Network + Default quality tag per voice
        - Sleep timer (15 / 30 / 60 min with countdown), a "+5m" extend button,
          and an automatic volume fade over the last 8s before it stops playback
        - Auto-advance to next chapter on completion, optionally gated behind
          a confirm() prompt, with a short opacity-fade transition before navigating
        - Optional toast notification when a chapter finishes reading
        - Progress bar (sentence-based)
        - Keyboard shortcut: Space to toggle play/pause (when panel focused)


        AO3 Helper - Pronunciation Manager Submodule
    Submodule ID: textToSpeech/pronunciationManager
    Display Name: Pronunciation Manager
    Source Module: Text To Speech

    Features:
        - Custom pronunciation dictionary stored in localStorage
        - Text pre-processing: replaces hard-to-pronounce words before TTS
        - Import / export dictionary as JSON
        - Applies rules to sentence text before speechEngine creates utterances


AO3 Helper - Speech Engine Submodule
    Submodule ID: textToSpeech/speechEngine
    Display Name: Speech Engine
    Source Module: Text To Speech

    Features:
        - Web Speech API wrapper
        - Voice selection with persistence
        - Volume and pitch, persisted and applied to every utterance
          (playbackControls can still override both per-utterance, e.g.
          for the mute toggle and the sleep-timer fade)
        - Voice preview
        - Sentence-by-sentence utterance queue for highlight/progress tracking


        AO3 Helper - Visual Feedback Submodule
    Submodule ID: textToSpeech/visualFeedback
    Display Name: Visual Feedback
    Source Module: Text To Speech

    Features:
        - Highlights the paragraph containing the current sentence being read aloud,
          in a configurable color (highlightColor)
        - Auto-scrolls to keep the highlighted paragraph in view, at a
          configurable speed (scrollSpeed) — drives its own requestAnimationFrame
          animation since scrollIntoView({behavior:'smooth'}) has no speed knob
        - Provides highlight/unhighlight API for playbackControls to call


═══════════════════════════════════════════════════════════════════════════
  # textToSpeech
  **Tab :** Reading
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Text To Speech** lit les œuvres à voix haute directement dans le navigateur à l’aide de l’API de synthèse vocale du système.

* Il fournit un panneau de contrôle flottant permettant notamment de :
    - démarrer, mettre en pause ou arrêter la lecture ;
    - choisir la voix utilisée ;
    - modifier la vitesse de lecture ;
    - suivre la progression phrase par phrase ;
    - surligner le paragraphe en cours de lecture ;
    - faire défiler automatiquement la page ;
    - ignorer certaines parties de l’œuvre ;
    - corriger la prononciation de mots particuliers ;
    - utiliser une minuterie de sommeil ;
    - passer automatiquement au chapitre suivant.

Tout le traitement est effectué localement dans le navigateur. Aucun service de synthèse vocale externe n’est utilisé.

---

# Réglages utilisateur

| Réglage             | Description                                                                                                                      |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------- |
| `voice`             | Définit la voix utilisée pour la lecture.                                                                                        |
| `playbackSpeed`     | Définit la vitesse de lecture, de `0.5×` à `2×`.                                                                                 |
| `stopOnPageChange`  | Arrête automatiquement la lecture lorsque l’utilisateur change de page.                                                          |
| `autoNextChapter`   | Ouvre et lit automatiquement le chapitre suivant à la fin du chapitre actuel.                                                    |
| `highlightSentence` | Active le suivi visuel du passage en cours de lecture. L’implémentation actuelle surligne le paragraphe contenant la phrase lue. |
| `autoScroll`        | Fait défiler automatiquement la page afin de garder le passage en cours visible.                                                 |
| `skipAuthorNotes`   | Ignore les notes de l’auteur placées au début ou à la fin du chapitre.                                                           |
| `skipSummary`       | Ignore le résumé et les éléments de préface.                                                                                     |
| `floatingPanel`     | Affiche le panneau de lecture flottant.                                                                                          |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de cinq sous-modules fonctionnels, d’une feuille de style, et de trois fichiers de calculs purs (ajoutés au passage chantier 4) partagés par les sous-modules.

```text
_textToSpeech.js
speechEngine.js
contentFiltering.js
pronunciationManager.js
visualFeedback.js
playbackControls.js
textToSpeech.css
playbackHelpers.js
voiceHelpers.js
scrollHelpers.js
```

Les sous-modules sont enregistrés indépendamment avec le parent :

```text
textToSpeech
```

Ils sont découverts par le système `import.meta.glob` de `src/modules.js`, puis démarrés automatiquement par la logique en cascade de :

```text
core/lifecycle.js
```

---

# _textToSpeech.js

## Rôle

Fichier coordinateur du module.

Il initialise l’espace partagé utilisé par les sous-modules, centralise les réglages communs et fournit les fonctions nécessaires au découpage du texte et au stockage des préférences.

Le coordinateur crée l’API publique avant le démarrage en cascade des sous-modules et la supprime lors du nettoyage du module.

---

## Responsabilités

* Initialise le module **Text To Speech**.
* Prépare les données partagées avant le démarrage des sous-modules.
* Découpe le texte en phrases.
* Rend les phrases accessibles aux autres sous-modules.
* Centralise les réglages communs liés :

  * à la voix ;
  * à la vitesse ;
  * aux prononciations personnalisées ;
  * à la minuterie de sommeil.
* Fournit des fonctions communes de lecture et d’écriture dans `localStorage`.
* Expose une API publique.
* Supprime l’API publique lors du nettoyage.
* Permet aux sous-modules de relire les objets globaux partagés au moment où ils en ont besoin.

---

## Fonctions exposées

L’API publique est accessible via :

```text
W.AO3H_TextToSpeech
```

Elle expose les éléments suivants :

| Élément           | Rôle                                                              |
| ----------------- | ----------------------------------------------------------------- |
| `lsGet(key)`      | Lit une valeur enregistrée dans `localStorage`.                   |
| `lsSet(key, val)` | Enregistre une valeur dans `localStorage`.                        |
| `cfg`             | Contient la configuration commune du module.                      |
| `splitSentences`  | Découpe un texte en phrases utilisables par le moteur de lecture. |
| `NS`              | Fournit l’espace de noms partagé du module.                       |

---

## Détails techniques

### Identité du module

```text
Module ID: textToSpeech
Display Name: Text To Speech
Tab: Reading
```

### Sous-modules enregistrés

```text
speechEngine
playbackControls
visualFeedback
contentFiltering
pronunciationManager
```

### Stockage

Le module utilise les clés suivantes :

```text
ao3h:tts:voice
ao3h:tts:rate
ao3h:tts:pronunciations
ao3h:tts:sleepMinutes
```

Elles enregistrent respectivement :

* la voix choisie ;
* la vitesse de lecture ;
* le dictionnaire de prononciation ;
* la durée sélectionnée pour la minuterie de sommeil.

### Communication entre les sous-modules

Les sous-modules utilisent les données et API partagées créées par le coordinateur.

Les références globales sont relues au moment de chaque appel plutôt que conservées définitivement. Ce fonctionnement évite que les sous-modules utilisent une ancienne référence après une réinitialisation ou un redémarrage du module.

---

# speechEngine.js

## Rôle

Encapsule l’API Web Speech du navigateur et gère l’ensemble du moteur de synthèse vocale.

Il est responsable du chargement des voix, de la sélection de la voix, de la création des énoncés et de la lecture phrase par phrase.

---

## Fonctionnalités

### Chargement des voix

Le sous-module récupère la liste des voix de synthèse vocale disponibles dans le navigateur et dans le système d’exploitation.

Les voix proposées dépendent donc :

* du navigateur utilisé ;
* du système d’exploitation ;
* des voix installées localement.

---

### Sélection de la voix

L’utilisateur peut choisir la voix utilisée pour lire le texte.

Le choix est mémorisé afin d’être restauré lors des prochaines lectures.

La voix sélectionnée est enregistrée sous :

```text
ao3h:tts:voice
```

---

### Aperçu d’une voix

Le sous-module permet d’écouter un aperçu d’une voix avant de la sélectionner définitivement.

---

### File de lecture

Le texte est préparé sous forme d’une file d’énoncés.

Chaque phrase devient une unité de synthèse vocale distincte afin de permettre :

* le suivi précis de la progression ;
* la mise à jour de la barre de progression ;
* la synchronisation avec le retour visuel ;
* l’application des règles de prononciation avant chaque énoncé.

---

### Lecture phrase par phrase

Le moteur crée et lit les énoncés une phrase à la fois.

Ce fonctionnement permet aux autres sous-modules de connaître la phrase actuelle et de mettre à jour l’interface pendant la lecture.

---

## Détails techniques

Le sous-module agit comme une couche d’abstraction autour de l’API Web Speech.

Il crée les objets de synthèse vocale nécessaires à partir des phrases fournies par le module.

Avant de créer un énoncé, le texte peut être transformé par `pronunciationManager.js`.

---

## Dépendances

Le sous-module dépend :

* de l’API Web Speech du navigateur ;
* de `_textToSpeech.js` pour les fonctions et données partagées ;
* de `pronunciationManager.js` pour les corrections de prononciation ;
* de `playbackControls.js` pour les commandes de lecture ;
* de `visualFeedback.js` pour le suivi visuel de la progression.

---

# contentFiltering.js

## Rôle

Détermine le contenu de l’œuvre qui doit être lu.

Il récupère le texte du chapitre, retire les éléments ignorés selon les réglages utilisateur, nettoie le contenu et prépare les informations nécessaires au suivi visuel.

---

## Fonctionnalités

### Extraction du contenu

Le sous-module récupère le contenu lisible à partir du conteneur AO3 :

```text
#chapters
```

Il extrait le texte du ou des chapitres présents dans cette zone.

---

### Exclusion des notes de l’auteur

Lorsque `skipAuthorNotes` est activé, le sous-module ignore :

* les notes placées au début du chapitre ;
* les notes placées à la fin du chapitre.

---

### Exclusion du résumé et de la préface

Lorsque `skipSummary` est activé, le sous-module ignore :

* le résumé ;
* la préface ;
* les éléments introductifs qui ne font pas partie du texte principal à lire.

---

### Nettoyage du texte

Le contenu extrait est nettoyé avant d’être transmis au moteur de synthèse vocale.

Cette étape permet d’éviter que des éléments inutiles du DOM soient lus comme s’ils faisaient partie de l’œuvre.

---

### Découpage en phrases

Le texte nettoyé est découpé en phrases pour permettre une lecture progressive.

Le découpage utilise la fonction partagée :

```text
splitSentences
```

---

### Correspondance entre paragraphes et phrases

Le sous-module conserve une correspondance entre :

* les paragraphes du document ;
* les phrases extraites de chaque paragraphe.

Cette correspondance permet à `visualFeedback.js` de déterminer quel paragraphe doit être surligné pendant la lecture d’une phrase.

---

## Détails techniques

Le sous-module prépare deux types d’information :

1. une liste ordonnée de phrases à lire ;
2. une association entre chaque phrase et son paragraphe d’origine.

Le suivi visuel s’effectue donc au niveau du paragraphe, même si la progression de la lecture est calculée phrase par phrase.

---

## Dépendances

Le sous-module dépend :

* de `_textToSpeech.js` pour le découpage en phrases ;
* du DOM des pages de lecture AO3 ;
* de `visualFeedback.js` pour exploiter la correspondance entre phrases et paragraphes ;
* de `speechEngine.js` pour lire les phrases préparées.

---

# pronunciationManager.js

## Rôle

Gère un dictionnaire de prononciation personnalisé.

Il permet de remplacer certains mots ou noms par une forme plus facile à prononcer avant leur transmission au moteur de synthèse vocale.

---

## Fonctionnalités

### Dictionnaire personnalisé

L’utilisateur peut créer ses propres règles de prononciation.

Cette fonctionnalité peut notamment être utilisée pour :

* des noms de personnages ;
* des noms propres ;
* des mots inventés ;
* des termes de fandom ;
* des mots que la voix du système prononce incorrectement.

---

### Application des corrections

Avant qu’une phrase soit envoyée au moteur de synthèse vocale, le sous-module remplace les mots concernés selon les règles du dictionnaire.

Le texte affiché sur la page n’est pas modifié.

Les remplacements s’appliquent uniquement au texte transmis à `speechEngine.js`.

---

### Import du dictionnaire

L’utilisateur peut importer un dictionnaire de prononciation au format JSON.

---

### Export du dictionnaire

L’utilisateur peut exporter son dictionnaire actuel au format JSON afin de :

* en conserver une copie ;
* le transférer vers une autre installation ;
* le partager manuellement.

---

## Détails techniques

Le dictionnaire est enregistré dans `localStorage` sous la clé :

```text
ao3h:tts:pronunciations
```

Les règles sont appliquées au texte de chaque phrase avant que `speechEngine.js` crée l’énoncé correspondant.

---

## Dépendances

Le sous-module dépend :

* de `_textToSpeech.js` pour l’accès au stockage partagé ;
* de `speechEngine.js`, qui lui transmet les phrases à préparer ;
* de `localStorage` pour la persistance du dictionnaire.

---

# visualFeedback.js

## Rôle

Fournit le retour visuel associé à la lecture.

Il indique la zone actuellement lue et maintient cette zone visible pendant la progression.

---

## Fonctionnalités

### Surlignage du passage en cours

Le sous-module surligne le paragraphe contenant la phrase actuellement lue.

Même si le réglage utilisateur est nommé :

```text
highlightSentence
```

l’implémentation actuelle ne surligne pas exactement la phrase. Elle surligne l’ensemble du paragraphe correspondant.

---

### Suppression du surlignage

Lorsqu’une nouvelle phrase commence, le surlignage précédent est retiré avant d’être appliqué au nouveau paragraphe.

Le sous-module fournit une API permettant :

* de surligner un paragraphe ;
* de retirer le surlignage actuel.

---

### Défilement automatique

Lorsque `autoScroll` est activé, le sous-module fait défiler la page afin de garder le paragraphe surligné dans la zone visible.

---

## Détails techniques

Le sous-module utilise la correspondance entre phrases et paragraphes préparée par `contentFiltering.js`.

Il ne détermine pas lui-même la phrase actuelle. `playbackControls.js` ou le moteur de lecture lui transmet l’élément à surligner.

---

## Dépendances

Le sous-module dépend :

* de `contentFiltering.js` pour la correspondance entre phrases et paragraphes ;
* de `playbackControls.js`, qui appelle les fonctions de surlignage ;
* du DOM de la page ;
* de la configuration partagée pour `highlightSentence` et `autoScroll`.

---

# playbackControls.js

## Rôle

Crée et gère le panneau de contrôle de la lecture.

Il centralise les commandes accessibles à l’utilisateur et coordonne le moteur vocal, le suivi visuel, la progression, la minuterie et le changement de chapitre.

---

## Fonctionnalités

### Bouton flottant

Le sous-module ajoute un bouton flottant :

```text
🔊 Read Aloud
```

Ce bouton permet d’ouvrir le panneau de contrôle de la lecture.

Son affichage est contrôlé par :

```text
floatingPanel
```

---

### Commandes de lecture

Le panneau contient des boutons permettant de :

* démarrer la lecture ;
* mettre la lecture en pause ;
* reprendre la lecture ;
* arrêter complètement la lecture.

---

### Réglage de la vitesse

Un curseur permet de choisir une vitesse comprise entre :

```text
0.5×
```

et :

```text
2×
```

La vitesse choisie est enregistrée sous :

```text
ao3h:tts:rate
```

---

### Sélection de la voix

Le panneau affiche un sélecteur contenant les voix fournies par `speechEngine.js`.

La voix sélectionnée est utilisée pour les énoncés suivants.

---

### Barre de progression

Le panneau affiche une barre de progression basée sur le nombre de phrases.

Elle représente l’avancement entre :

* la première phrase préparée ;
* la phrase actuellement lue ;
* la dernière phrase du contenu.

---

### Minuterie de sommeil

Le panneau propose une minuterie de sommeil avec les durées suivantes :

* 15 minutes ;
* 30 minutes ;
* 60 minutes.

Une fois activée, la minuterie affiche un compte à rebours.

À la fin du délai, la lecture est arrêtée.

La durée sélectionnée est enregistrée sous :

```text
ao3h:tts:sleepMinutes
```

---

### Passage automatique au chapitre suivant

Lorsque `autoNextChapter` est activé, le sous-module passe automatiquement au chapitre suivant lorsque toutes les phrases du chapitre actuel ont été lues.

Il utilise la navigation disponible sur la page AO3 pour ouvrir le chapitre suivant.

---

### Raccourci clavier

Lorsque le panneau possède le focus, la barre d’espace permet de :

* démarrer la lecture ;
* mettre la lecture en pause ;
* reprendre la lecture.

Le raccourci agit comme une commande Lecture/Pause.

---

### Arrêt lors d’un changement de page

Lorsque `stopOnPageChange` est activé, la lecture est arrêtée automatiquement si l’utilisateur quitte la page actuelle.

---

## Détails techniques

### Progression

La progression est calculée à partir de la position de la phrase actuelle dans la liste préparée par `contentFiltering.js`.

### Coordination

Le sous-module appelle :

* `speechEngine.js` pour démarrer, suspendre ou arrêter la synthèse vocale ;
* `visualFeedback.js` pour mettre à jour le surlignage ;
* `contentFiltering.js` pour obtenir les phrases et leur correspondance avec le document ;
* `pronunciationManager.js` indirectement par l’intermédiaire du moteur vocal.

### Portée du raccourci

Le raccourci utilisant la barre d’espace est actif lorsque le panneau de contrôle est focalisé.

Il n’est pas conçu comme un raccourci global permanent sur toute la page.

---

## Dépendances

Le sous-module dépend :

* de `_textToSpeech.js` pour les réglages et le stockage ;
* de `speechEngine.js` pour la synthèse vocale ;
* de `contentFiltering.js` pour le contenu à lire ;
* de `visualFeedback.js` pour le suivi visuel ;
* de la navigation AO3 pour le passage au chapitre suivant.

---

# textToSpeech.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Text To Speech**.

Il définit notamment l’apparence :

* du bouton flottant `🔊 Read Aloud` ;
* du panneau de contrôle ;
* des boutons Lecture, Pause et Stop ;
* du curseur de vitesse ;
* du sélecteur de voix ;
* de la minuterie de sommeil ;
* du compte à rebours ;
* de la barre de progression ;
* du passage surligné pendant la lecture ;
* des états ouverts ou fermés du panneau.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous étaient mentionnées dans d’autres documents du
projet. État après le passage chantier 4 (2026-07-17) — chaque sous-section
garde sa description d’origine, complétée par une note de résolution.

---

## Vitesses prédéfinies

> ✅ Fait — quatre boutons de profil (Comfortable 0.85×, Normal 1×, Fast 1.25×,
> Audiobook 1.5×) dans le panneau flottant, à côté du curseur libre.

Ajouter des profils de vitesse prêts à utiliser plutôt qu’un simple curseur libre.

Les profils envisagés comprennent notamment :

* confortable ;
* rapide ;
* style livre audio.

---

## Dictionnaires partagés par fandom

> ❌ Écarté — nécessiterait un serveur communautaire pour héberger et modérer
> les contributions ; l’extension reste 100% locale. L’import/export JSON déjà
> présent dans `pronunciationManager.js` permet déjà un partage manuel.

Permettre d’utiliser des dictionnaires de prononciation préparés pour certains fandoms.

Ces dictionnaires pourraient être enrichis par les contributions de la communauté.

---

## Réglage du volume

> ✅ Fait — curseur Volume dans le panneau flottant et le panneau de réglages,
> appliqué via `utterance.volume` dans `speechEngine.js`.

Ajouter un contrôle permettant de modifier le volume de la synthèse vocale depuis le panneau.

---

## Réglage de la hauteur de la voix

> ✅ Fait — curseur Pitch, appliqué via `utterance.pitch` dans `speechEngine.js`.

Ajouter un contrôle permettant de modifier la hauteur, ou `pitch`, de la voix.

---

## Base de prononciation intégrée

> ❌ Écarté — même raison que les dictionnaires partagés par fandom : aucune
> base multi-fandom fiable à maintenir sans infrastructure serveur ; le
> dictionnaire personnel + import/export suffit.

Fournir une base de données de prononciation contenant déjà des noms de personnages et des termes connus.

L’utilisateur n’aurait alors pas à créer toutes les règles manuellement.

---

## Bouton de sourdine

> ✅ Fait — bouton 🔊/🔇 à côté du curseur Volume ; coupe le son effectif sans
> déplacer le curseur (`effectiveVolume()` dans `playbackControls.js`).

Ajouter un bouton permettant de couper rapidement le son sans modifier le réglage du volume.

---

## Fondu avant l’arrêt de la minuterie

> ✅ Fait — les 8 dernières secondes du compte à rebours réduisent linéairement
> le volume des phrases lues (`computeFadeFactor` dans `playbackHelpers.js`).

Réduire progressivement le volume juste avant la fin de la minuterie de sommeil.

---

## Prolongation de la minuterie

> ✅ Fait — bouton "+5m" affiché à côté du compte à rebours pendant que la
> minuterie tourne.

Ajouter un bouton :

```text
+5 minutes
```

permettant de prolonger rapidement la minuterie active.

---

## Confirmation avant le chapitre suivant

> ✅ Fait — réglage `confirmNextChapter` (case à cocher), utilise `confirm()`
> avant de cliquer sur le lien du chapitre suivant.

Demander une confirmation avant de passer automatiquement au chapitre suivant.

---

## Notification de fin de chapitre

> ✅ Fait — réglage `notifyChapterEnd`, affiche un toast partagé
> (`lib/ui/toast.js`).

Afficher une notification lorsqu’un chapitre vient de se terminer.

---

## Personnalisation du surlignage

> ✅ Fait (couleur) — réglage `highlightColor` (sélecteur de couleur), appliqué
> en style inline sur le `<mark>`. Le style au-delà de la couleur de fond reste
> volontairement simple, cohérent avec la décision de conception sur le
> surlignage par paragraphe (voir plus bas).

Permettre de modifier :

* la couleur du surlignage ;
* le style du surlignage ;
* l’apparence du passage actif.

---

## Vitesse du défilement automatique

> ✅ Fait — réglage `scrollSpeed` (slow/normal/fast). `visualFeedback.js` anime
> son propre défilement (`scrollHelpers.js`) puisque
> `scrollIntoView({behavior:'smooth'})` n’a pas de réglage de vitesse.

Ajouter un réglage permettant de contrôler la vitesse du défilement automatique de la page.

---

## Filtrage des voix

> ✅ Fait — menu de filtre par langue dans le panneau flottant
> (`voiceHelpers.js`).

Permettre de filtrer les voix disponibles selon leur langue.

---

## Indicateur de qualité des voix

> ✅ Fait — l’API Web Speech n’exposant aucune vraie métrique de qualité audio,
> chaque voix est étiquetée Local/Network (`voice.localService`) et Default :
> la meilleure indication disponible en pratique (latence, dépendance réseau).

Afficher une indication de qualité pour chaque voix proposée dans le sélecteur.

---

## Saut manuel d’un passage

> ✅ Fait — boutons ⏮/⏭ dans le panneau, sautent d’une phrase en avant/arrière
> en annulant la lecture en cours.

Ajouter une commande permettant de sauter manuellement une phrase ou un passage pendant la lecture.

Cette fonctionnalité compléterait le saut automatique des notes de l’auteur et du résumé.

---

## Transition entre les chapitres

> ✅ Fait — un court fondu d’opacité (`.ao3h-tts-chapter-fade`) et un délai de
> 300ms précèdent le clic automatique sur le lien du chapitre suivant.

Ajouter une transition plus douce lorsque le module passe automatiquement d’un chapitre au suivant.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Synthèse vocale locale

Le module n’utilise aucun service de synthèse vocale en ligne pour obtenir des voix plus naturelles.

Toute la lecture repose sur les voix et les API disponibles localement dans le navigateur et le système d’exploitation.

Ce choix permet notamment :

* de ne pas envoyer le texte de l’œuvre vers un service externe ;
* de ne pas dépendre d’une connexion à un service tiers ;
* de conserver un fonctionnement simple.

---

## Surlignage du paragraphe

Le module ne surligne pas précisément chaque phrase dans le texte affiché.

Il surligne le paragraphe contenant la phrase actuelle.

Le surlignage exact de la phrase a été jugé trop fragile techniquement, notamment en raison des différences possibles entre :

* le texte extrait ;
* le découpage en phrases ;
* la structure réelle du DOM ;
* les transformations appliquées avant la synthèse vocale.

---

## Position fixe du panneau

Le panneau flottant ne peut pas être déplacé librement par l’utilisateur.

Sa position reste fixe afin de conserver une interface simple et prévisible.

---

## Lecteur volontairement limité

Le module n’a pas pour objectif de devenir un lecteur audio complet comparable à une application de livre audio.

Il reste volontairement centré sur une fonction simple :

* faire lire le texte de la page par le navigateur ;
* fournir les commandes essentielles ;
* suivre visuellement la progression.

---

# Précision historique

Une ancienne documentation indique que la minuterie de sommeil aurait été supprimée.

Cette information n’est plus correcte.

La minuterie de sommeil est actuellement implémentée dans :

```text
playbackControls.js
```

Elle propose les durées suivantes :

* 15 minutes ;
* 30 minutes ;
* 60 minutes.

Elle inclut également un compte à rebours visible avant l’arrêt automatique de la lecture.
