# keyboardShortcuts

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module ajoute des raccourcis clavier pour les actions courantes d'AO3
(chapitre précédent/suivant, page précédente/suivante, "Surprise Me",
s'abonner, mettre en favoris, marquer pour plus tard), plus une fenêtre
d'aide qui liste tous les raccourcis quand on appuie sur `?`. D'autres
modules peuvent aussi ajouter leurs propres raccourcis grâce à ce module,
sans avoir à recoder toute la gestion du clavier eux-mêmes.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `allShortcutsDisabled` | désactivé | Coupe-circuit d'urgence — désactive tous les raccourcis immédiatement |
| `prevChapter` | `Ctrl+ArrowLeft` | Chapitre précédent (page d'une fic) |
| `nextChapter` | `Ctrl+ArrowRight` | Chapitre suivant (page d'une fic) |
| `prevPage` | `Shift+ArrowLeft` | Page précédente (listes de fics) |
| `nextPage` | `Shift+ArrowRight` | Page suivante (listes de fics) |
| `firstPage` | `Ctrl+Home` | Première page de résultats (listes de fics) |
| `lastPage` | `Ctrl+End` | Dernière page de résultats (listes de fics) |
| `jumpBackPages` | `Shift+PageUp` | Recule de 5 pages (listes de fics) |
| `jumpForwardPages` | `Shift+PageDown` | Avance de 5 pages (listes de fics) |
| `guide` | `?` | Afficher la fenêtre d'aide des raccourcis |
| `commandPalette` | `Ctrl+/` | Ouvre la palette de commandes (recherche + exécution par nom) |
| `surpriseMe` | `Ctrl+Shift+R` | Déclenche "Surprise Me" (listes de fics) |
| `subscribe` | `Ctrl+Shift+S` | S'abonner à la fic |
| `bookmark` | `Ctrl+Shift+B` | Ajouter aux favoris |
| `markForLater` | `Ctrl+Shift+M` | Marquer pour plus tard |
| `kudos` | `Ctrl+Shift+K` | Laisser un kudos |

Chaque raccourci ci-dessus se personnalise directement en tapant une autre
combinaison dans son champ, dans le panneau de réglages — pas besoin d'un
interrupteur séparé pour "activer" la personnalisation.

## Fichiers

### `keyboardShortcuts.js` — le module

- Écoute les touches pressées et déclenche l'action correspondante, sauf si on est en train d'écrire dans un champ de texte
- Avant d'exécuter une action, le module vérifie dans l'ordre : 1) que
  `allShortcutsDisabled` n'est pas activé, 2) que l'événement ne vient pas
  d'un champ de saisie, 3) qu'une combinaison connue correspond à
  l'événement — puis exécute l'action et affiche le flash de confirmation
- Affiche un petit flash visuel pour confirmer qu'un raccourci a bien fonctionné
- Ouvre une fenêtre d'aide (touche `?`, fermeture avec Échap) qui liste tous les raccourcis actifs par catégorie, avec un champ de recherche et un badge ⚠️ sur les raccourcis en conflit
- La même fenêtre sert de palette de commandes (`Ctrl+/`) : recherche + Entrée exécute directement l'action trouvée
- Prévient dans la console si deux raccourcis utilisent la même combinaison de touches, et affiche désormais aussi ce conflit dans la fenêtre d'aide (pas seulement pour les développeurs)
- Permet à d'autres modules d'ajouter leurs propres raccourcis (par exemple, un module de navigation par chapitre peut réutiliser Ctrl+Flèche gauche/droite), via une API publique disponible uniquement pendant que le module est actif :
  - `W.AO3H_Keyboard.register(action, keyStr, fn)`
  - `W.AO3H_KeyboardShortcuts.register(moduleId, shortcutDefinitions)`
  - les deux formes retournent une fonction de désenregistrement

### Logique interne intégrée à `keyboardShortcuts.js`

- `parseCombo`/`comboToString`/`matchesEvent` : analyse et reconnaissance des combinaisons de touches
- `detectConflicts(map)` : détecte les combinaisons partagées par plusieurs actions
- `categoryFor`/`groupByCategory` : classement des raccourcis par catégorie (Navigation / Actions / Interface / Other) pour la fenêtre d'aide
- `actionLabel` : libellé lisible d'une action (configuré, ou humanisé par défaut)
- `clampPageJump` : calcule la page cible d'un saut de plusieurs pages, plafonnée entre 1 et la dernière page

### `keyboardShortcuts.css`

- Les styles visuels de la fenêtre d'aide/palette (recherche, catégories, conflits) et du flash de confirmation

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Vraiment personnaliser les touches soi-même (le réglage existe, mais rien n'est branché derrière pour l'instant)~~ ✅ Fait (déjà couvert)
  Chaque champ de la table de raccourcis dans le panneau est un réglage
  ordinaire (`data-setting`) : taper une nouvelle combinaison et sauvegarder
  suffit, ça fonctionnait déjà mécaniquement. Le réglage `customizationEnabled`
  ne gatait en réalité rien (`cfg()` était lu puis jamais utilisé) — retiré
  comme chrome mort plutôt que faussement branché.
- ~~Exporter ou importer ses raccourcis personnalisés dans un fichier~~ ✅ Fait
  Les boutons "Import"/"Export (JSON)" existaient déjà dans le panneau mais
  n'avaient aucun gestionnaire de clic — branchés désormais
  (`keyboardShortcuts-config.js`, `wireConfigArea`).
- ~~Un mode "Vim" avec les touches h/j/k/l pour se déplacer~~ ❌ Écarté
  Même raisonnement que le rejet des touches seules (K/B/M/N/P, voir
  "Explicitement écarté") : h/j/k/l bruts se déclencheraient trop facilement
  par accident en lisant ou en sélectionnant du texte.
- ~~Un raccourci clavier pour laisser un kudos directement~~ ✅ Fait
  Réglage `kudos` (`Ctrl+Shift+K` par défaut).
- ~~Chercher un raccourci précis dans la fenêtre d'aide, plutôt que de parcourir toute la liste~~ ✅ Fait
  Champ de recherche en haut de la fenêtre, filtre en direct par libellé ou
  combinaison de touches.
- ~~Des raccourcis en plusieurs étapes (appuyer sur une touche, puis une autre, comme dans certains sites) plutôt qu'en une seule combinaison~~ ❌ Écarté
  Ajoute une complexité d'état (fenêtre de temps, réinitialisation, risque de
  double-déclenchement) disproportionnée pour un module qui privilégie déjà
  des combinaisons à modificateur simples et fiables.
- ~~Proposer une solution quand deux raccourcis utilisent la même touche, pas juste prévenir dans la console pour les développeurs~~ ✅ Fait (partiellement)
  Les conflits sont désormais visibles dans la fenêtre d'aide (badge ⚠️ +
  info-bulle) en plus du message console. Pas de résolution automatique
  ajoutée : deviner à la place de l'utilisateur quelle combinaison de
  remplacement choisir serait arbitraire — le champ de remapping déjà
  existant permet de corriger immédiatement.
- ~~Une barre de recherche façon "palette de commandes" (comme Ctrl+K) pour trouver et lancer n'importe quelle action juste en tapant son nom~~ ✅ Fait
  Réglage `commandPalette` (`Ctrl+/` par défaut) : réutilise la fenêtre
  d'aide en mode recherche-puis-exécution (Entrée lance l'action trouvée).
- ~~Aller directement à la première ou dernière page de résultats avec les touches Origine/Fin, ou sauter plusieurs pages d'un coup avec Page précédente/Page suivante~~ ✅ Fait
  Réglages `firstPage`/`lastPage` (`Ctrl+Home`/`Ctrl+End`) et
  `jumpBackPages`/`jumpForwardPages` (`Shift+PageUp`/`Shift+PageDown`, ±5
  pages). Modificateurs choisis pour ne pas entrer en conflit avec le
  défilement naturel de la page ni les raccourcis de navigateur/OS.
- ~~Avancer ou reculer avec un geste de balayage du doigt sur téléphone ou tablette~~ ❌ Écarté
  Hors du périmètre d'un module de raccourcis **clavier** : la détection de
  gestes tactiles (vélocité, direction, seuils anti-faux-positifs) est une
  préoccupation différente qui mériterait son propre module si elle est un
  jour construite.
- ~~Ranger les raccourcis affichés dans la fenêtre d'aide par catégories, plutôt que tous à la suite~~ ✅ Fait
  La fenêtre d'aide groupe désormais les raccourcis par catégorie
  (Navigation / Actions / Interface / Other pour les raccourcis externes).

## Explicitement écarté

- Des touches simples comme K, B, M, N ou P toutes seules — trop facile à appuyer dessus par accident en lisant
- Les flèches Haut/Bas pour changer de chapitre — ça entre en conflit avec le défilement normal de la page
- Les flèches Gauche/Droite toutes seules (sans Ctrl ni Shift) pour changer de page — trop facile à déclencher par erreur
- Un interrupteur pour activer ou désactiver chaque raccourci un par un — inutile, il suffit de remapper un raccourci vers "rien" pour le désactiver
- Plusieurs profils de raccourcis sauvegardés en même temps — jugé trop compliqué
- Utiliser Origine/Fin pour aller directement au premier ou dernier chapitre d'une fic — jugé pas assez intuitif (Origine/Fin sont en revanche utilisées pour la première/dernière page de résultats, un contexte différent — voir plus haut)
- Un mode "Vim" (h/j/k/l) — mêmes raisons que les touches seules ci-dessus
- Des gestes tactiles — hors périmètre d'un module de raccourcis clavier
- Une résolution automatique des conflits — deviner la combinaison de remplacement voulue par l'utilisateur serait arbitraire ; les conflits sont maintenant visibles (fenêtre d'aide) et corrigeables immédiatement via le remapping existant

## Précision

⚠️ La doc historique anglaise liste les 4 raccourcis "Surprise Me",
"Subscribe", "Bookmark" et "Mark for Later" comme "pas encore branchés".
Les quatre fonctionnent bel et bien aujourd'hui dans
`keyboardShortcuts.js`.
