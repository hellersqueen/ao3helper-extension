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
- Affiche un petit flash visuel pour confirmer qu'un raccourci a bien fonctionné
- Ouvre une fenêtre d'aide (touche `?`, fermeture avec Échap) qui liste tous les raccourcis actifs par catégorie, avec un champ de recherche et un badge ⚠️ sur les raccourcis en conflit
- La même fenêtre sert de palette de commandes (`Ctrl+/`) : recherche + Entrée exécute directement l'action trouvée
- Prévient dans la console si deux raccourcis utilisent la même combinaison de touches, et affiche désormais aussi ce conflit dans la fenêtre d'aide (pas seulement pour les développeurs)
- Permet à d'autres modules d'ajouter leurs propres raccourcis (par exemple, un module de navigation par chapitre peut réutiliser Ctrl+Flèche gauche/droite)

### `keyboardShortcutsHelpers.js` — logique extraite

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


   AO3 Helper — Keyboard Shortcuts
   Module ID : keyboardShortcuts

   Provides configurable keyboard shortcuts for common AO3 actions.
   Press "?" to show a help overlay listing active shortcuts.

   Settings:
     allShortcutsDisabled  – emergency kill switch
     shortcuts             – map of action → key combo (remapping already
                             works per-key via the panel's text inputs —
                             there is no separate "enable remapping" toggle)

   External API (available only while the module is active):
     W.AO3H_Keyboard.register(action, keyStr, fn)
     W.AO3H_KeyboardShortcuts.register(moduleId, shortcutDefinitions)
       → both forms return an unregister function

   ⚠️ Update: the guide (`?`) is now also a command palette
   (`commandPalette`, default Ctrl+/) — same overlay, search-then-Enter
   executes the top match. Conflicting shortcuts show a ⚠️ badge in the
   overlay instead of only warning in the console. Rows are grouped by
   category (Navigation/Actions/Interface/Other).







═══════════════════════════════════════════════════════════════════════════
  # keyboardShortcuts
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Keyboard Shortcuts** ajoute des raccourcis clavier pour les actions courantes d'AO3 afin d'accélérer la navigation et les interactions sans utiliser la souris.

* Il permet notamment de :
  - passer au chapitre précédent ou suivant ;
  - passer à la page précédente ou suivante dans les listes de résultats ;
  - déclencher l'action **Surprise Me** ;
  - s'abonner à une œuvre ;
  - ajouter une œuvre aux favoris ;
  - marquer une œuvre pour plus tard ;
  - afficher une fenêtre d'aide listant tous les raccourcis disponibles ;
  - fournir une API permettant aux autres modules d'ajouter leurs propres raccourcis sans gérer eux-mêmes les événements clavier.

---

# Réglages utilisateur

| Réglage                 | Défaut              | Description |
|-------------------------|---------------------|-------------------------------------------------------|
| `allShortcutsDisabled`  | Désactivé           | Désactive immédiatement tous les raccourcis clavier.  |
| `prevChapter`           | `Ctrl+ArrowLeft`    | Aller au chapitre précédent.                          |
| `nextChapter`           | `Ctrl+ArrowRight`   | Aller au chapitre suivant.                            |
| `prevPage`              | `Shift+ArrowLeft`   | Aller à la page précédente dans les listes de fics.   |
| `nextPage`              | `Shift+ArrowRight`  | Aller à la page suivante dans les listes de fics.     |
| `firstPage`             | `Ctrl+Home`         | Aller à la première page de résultats.                |
| `lastPage`              | `Ctrl+End`          | Aller à la dernière page de résultats.                |
| `jumpBackPages`         | `Shift+PageUp`      | Reculer de 5 pages.                                   |
| `jumpForwardPages`      | `Shift+PageDown`    | Avancer de 5 pages.                                   |
| `guide`                 | `?`                 | Ouvrir la fenêtre d'aide des raccourcis.              |
| `commandPalette`        | `Ctrl+/`            | Ouvrir la palette de commandes.                       |
| `surpriseMe`            | `Ctrl+Shift+R`      | Déclencher **Surprise Me**.                           |
| `subscribe`             | `Ctrl+Shift+S`      | S'abonner à une œuvre.                                |
| `bookmark`              | `Ctrl+Shift+B`      | Ajouter une œuvre aux favoris.                        |
| `markForLater`          | `Ctrl+Shift+M`      | Marquer une œuvre pour plus tard.                     |
| `kudos`                 | `Ctrl+Shift+K`      | Laisser un kudos.                                     |

La personnalisation se fait directement dans ce tableau (chaque ligne est un
réglage ordinaire) — il n'y a pas de réglage séparé « activer la
personnalisation ».

---

# Structure du module

Le module est composé d'un fichier fonctionnel principal, d'un fichier de logique extraite et d'une feuille de style.

```text
keyboardShortcuts.js
keyboardShortcutsHelpers.js
keyboardShortcuts.css
```

---

# keyboardShortcuts.js

## Rôle

Gère l'ensemble du système de raccourcis clavier d'AO3 Helper.

Il écoute les événements clavier, déclenche les actions correspondantes, empêche les conflits avec les champs de saisie, affiche une confirmation visuelle lorsqu'un raccourci est exécuté et fournit une API permettant aux autres modules d'enregistrer leurs propres raccourcis.

---

## Fonctionnalités

### Gestion des raccourcis clavier

Le module intercepte les combinaisons de touches définies dans les préférences utilisateur et déclenche automatiquement l'action correspondante.

Les raccourcis fournis par défaut permettent notamment de :

- passer au chapitre précédent ou suivant ;
- passer à la page précédente ou suivante, à la première ou dernière page, ou sauter de 5 pages d'un coup ;
- lancer **Surprise Me** ;
- s'abonner à une œuvre ;
- ajouter une œuvre aux favoris ;
- marquer une œuvre pour plus tard ;
- laisser un kudos ;
- ouvrir la fenêtre d'aide ou la palette de commandes.

---

### Désactivation automatique dans les champs de saisie

Les raccourcis sont automatiquement ignorés lorsque l'utilisateur est en train d'écrire dans un champ de texte afin d'éviter tout déclenchement accidentel.

---

### Flash de confirmation

Lorsqu'un raccourci est exécuté avec succès, le module affiche un court indicateur visuel confirmant que l'action a bien été prise en compte.

---

### Fenêtre d'aide

L'appui sur la touche :

```text
?
```

ouvre une fenêtre récapitulant tous les raccourcis actuellement disponibles.

Cette fenêtre :

- liste les raccourcis intégrés au module, groupés par catégorie (Navigation / Actions / Interface) ;
- affiche également ceux enregistrés par d'autres modules (catégorie "Other") ;
- propose un champ de recherche qui filtre la liste en direct par libellé ou combinaison de touches ;
- peut être fermée avec la touche `Échap`.

La même touche `Ctrl+/` (réglage `commandPalette`) ouvre la même fenêtre en
mode palette de commandes : le champ de recherche est immédiatement
focalisé, et appuyer sur `Entrée` exécute directement l'action trouvée puis
referme la fenêtre.

---

### Détection des conflits

Le module vérifie les combinaisons enregistrées.

Si plusieurs raccourcis utilisent la même combinaison de touches, un avertissement est affiché dans la console afin de faciliter le développement, **et** un badge ⚠️ apparaît désormais sur les lignes concernées dans la fenêtre d'aide (avec une info-bulle indiquant qu'il y a conflit).

Aucune résolution automatique des conflits n'est effectuée : deviner la combinaison de remplacement voulue par l'utilisateur serait arbitraire. Le champ de remapping du panneau permet de corriger immédiatement.

---

### API publique

Le module fournit une API permettant aux autres modules d'ajouter ou de retirer leurs propres raccourcis sans avoir à gérer directement les événements clavier.

Deux interfaces sont disponibles :

```text
W.AO3H_Keyboard.register(action, keyStr, fn)
```

et

```text
W.AO3H_KeyboardShortcuts.register(moduleId, shortcutDefinitions)
```

Les deux méthodes retournent une fonction permettant de désenregistrer les raccourcis précédemment ajoutés.

Cette API n'est disponible que lorsque le module est actif.

---

## Détails techniques

### Comportement général

Le module centralise toute la gestion du clavier afin d'éviter que plusieurs modules implémentent leur propre système de raccourcis.

Il agit comme un gestionnaire unique auquel les autres modules peuvent se connecter.

---

### Priorité des raccourcis

Avant d'exécuter une action, le module :

1. vérifie que tous les raccourcis ne sont pas désactivés via `allShortcutsDisabled` ;
2. ignore les événements provenant d'un champ de saisie ;
3. recherche le raccourci correspondant ;
4. exécute l'action associée ;
5. affiche un flash de confirmation lorsque l'action réussit.

---

## Dépendances

Le module fonctionne de manière autonome.

Les autres modules peuvent toutefois s'appuyer sur son API afin d'ajouter leurs propres raccourcis clavier.

---

# keyboardShortcuts.css

## Rôle

Contient les styles utilisés par le module **Keyboard Shortcuts**.

Il définit notamment l'apparence :

- de la fenêtre d'aide ;
- du flash de confirmation affiché après l'exécution d'un raccourci.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d'autres documents du projet. Statut après revue :

---

## Personnalisation des raccourcis ✅ Fait (déjà couvert)

Permettre à l'utilisateur de modifier librement les combinaisons de touches.

> Chaque ligne du tableau de raccourcis du panneau est déjà un réglage
> ordinaire — taper une nouvelle combinaison et sauvegarder fonctionnait
> déjà mécaniquement. Le réglage `customizationEnabled` ne gatait en
> réalité rien (lu puis jamais utilisé) — retiré comme chrome mort.

---

## Importation et exportation ✅ Fait

Permettre d'exporter et d'importer les raccourcis personnalisés dans un fichier.

> Les boutons "Import"/"Export (JSON)" existaient déjà dans le panneau mais
> sans gestionnaire de clic — branchés (`keyboardShortcuts-config.js`).

---

## Mode Vim ❌ Écarté

Ajouter un mode de navigation utilisant les touches h/j/k/l.

> Écarté : même raisonnement que le rejet des touches seules (K/B/M/N/P) —
> des lettres brutes se déclencheraient trop facilement par accident en
> lisant ou en sélectionnant du texte.

---

## Raccourci pour laisser un kudos ✅ Fait

Ajouter une combinaison de touches permettant de laisser directement un kudos.

> Réglage `kudos` (`Ctrl+Shift+K` par défaut).

---

## Recherche dans la fenêtre d'aide ✅ Fait

Ajouter un champ permettant de rechercher rapidement un raccourci particulier.

> Champ de recherche en haut de la fenêtre, filtre en direct.

---

## Raccourcis en plusieurs étapes ❌ Écarté

Permettre des séquences de touches successives plutôt qu'une seule combinaison de touches.

> Écarté : ajoute une complexité d'état (fenêtre de temps, réinitialisation,
> risque de double-déclenchement) disproportionnée pour un module qui
> privilégie déjà des combinaisons à modificateur simples et fiables.

---

## Résolution automatique des conflits ✅ Fait (partiellement)

Proposer automatiquement une solution lorsqu'une combinaison est utilisée par plusieurs raccourcis au lieu de simplement afficher un avertissement dans la console.

> Les conflits sont désormais visibles dans la fenêtre d'aide (badge ⚠️ +
> info-bulle), pas seulement dans la console. Pas de résolution
> automatique : deviner la combinaison de remplacement voulue par
> l'utilisateur serait arbitraire — le remapping existant permet de
> corriger immédiatement une fois le conflit vu.

---

## Palette de commandes ✅ Fait

Ajouter une palette de commandes similaire à **Ctrl+K** permettant de rechercher une action par son nom puis de l'exécuter.

> Réglage `commandPalette` (`Ctrl+/` par défaut) : réutilise la fenêtre
> d'aide en mode recherche-puis-exécution.

---

## Navigation avancée dans les listes ✅ Fait

Ajouter des raccourcis permettant d'aller directement à la première ou à la dernière page, ou de sauter plusieurs pages à la fois.

> Réglages `firstPage`/`lastPage` (`Ctrl+Home`/`Ctrl+End`) et
> `jumpBackPages`/`jumpForwardPages` (`Shift+PageUp`/`Shift+PageDown`, ±5 pages).

---

## Gestes tactiles ❌ Écarté

Permettre la navigation par balayage sur téléphone ou tablette.

> Écarté : hors du périmètre d'un module de raccourcis **clavier** — la
> détection de gestes tactiles est une préoccupation différente qui
> mériterait son propre module si elle est un jour construite.

---

## Catégories dans la fenêtre d'aide ✅ Fait

Classer les raccourcis par catégories plutôt que de les afficher dans une seule liste.

> La fenêtre d'aide groupe désormais les raccourcis par catégorie
> (Navigation / Actions / Interface / Other pour les raccourcis externes).

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Aucune touche seule

Le module n'utilise pas de touches simples comme :

- `K`
- `B`
- `M`
- `N`
- `P`

afin d'éviter les déclenchements accidentels pendant la lecture.

---

## Navigation verticale

Les touches `Flèche haut` et `Flèche bas` ne sont pas utilisées pour changer de chapitre afin de préserver le défilement naturel de la page.

---

## Navigation horizontale

Les touches `Flèche gauche` et `Flèche droite` sans modificateur ne sont pas utilisées pour changer de page afin d'éviter les erreurs de manipulation.

---

## Désactivation individuelle

Le module ne propose pas d'interrupteur permettant d'activer ou désactiver chaque raccourci individuellement.

Lorsqu'un système de personnalisation sera disponible, il suffira d'associer une action à « aucune touche » pour la désactiver.

---

## Profils multiples

Le module ne prend pas en charge plusieurs profils de raccourcis enregistrés simultanément.

Cette possibilité a été jugée trop complexe au regard du bénéfice attendu.

---

## Navigation premier/dernier chapitre

Les touches `Origine` et `Fin` ne sont pas utilisées pour accéder directement au premier ou au dernier chapitre d'une œuvre, cette approche ayant été jugée peu intuitive.

---

# Précision historique

La documentation historique en anglais indiquait que les raccourcis suivants n'étaient pas encore connectés :

- **Surprise Me**
- **Subscribe**
- **Bookmark**
- **Mark for Later**

Cette information est désormais obsolète.

Les quatre raccourcis sont aujourd'hui entièrement fonctionnels dans `keyboardShortcuts.js`.