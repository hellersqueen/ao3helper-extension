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
| `customizationEnabled` | désactivé | Personnaliser les touches soi-même *(pas encore actif)* |
| `prevChapter` | `Ctrl+ArrowLeft` | Chapitre précédent (page d'une fic) |
| `nextChapter` | `Ctrl+ArrowRight` | Chapitre suivant (page d'une fic) |
| `prevPage` | `Shift+ArrowLeft` | Page précédente (listes de fics) |
| `nextPage` | `Shift+ArrowRight` | Page suivante (listes de fics) |
| `guide` | `?` | Afficher la fenêtre d'aide des raccourcis |
| `surpriseMe` | `Ctrl+Shift+R` | Déclenche "Surprise Me" (listes de fics) |
| `subscribe` | `Ctrl+Shift+S` | S'abonner à la fic |
| `bookmark` | `Ctrl+Shift+B` | Ajouter aux favoris |
| `markForLater` | `Ctrl+Shift+M` | Marquer pour plus tard |

## Fichiers

### `keyboardShortcuts.js` — tout le module en un seul fichier

- Écoute les touches pressées et déclenche l'action correspondante, sauf si on est en train d'écrire dans un champ de texte
- Affiche un petit flash visuel pour confirmer qu'un raccourci a bien fonctionné
- Ouvre une fenêtre d'aide (touche `?`, fermeture avec Échap) qui liste tous les raccourcis actifs, y compris ceux ajoutés par d'autres modules
- Prévient dans la console si deux raccourcis utilisent la même combinaison de touches par erreur
- Permet à d'autres modules d'ajouter leurs propres raccourcis (par exemple, un module de navigation par chapitre peut réutiliser Ctrl+Flèche gauche/droite)

### `keyboardShortcuts.css`

- Les styles visuels de la fenêtre d'aide et du flash de confirmation

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Vraiment personnaliser les touches soi-même (le réglage existe, mais rien n'est branché derrière pour l'instant)
- Exporter ou importer ses raccourcis personnalisés dans un fichier
- Un mode "Vim" avec les touches h/j/k/l pour se déplacer
- Un raccourci clavier pour laisser un kudos directement
- Chercher un raccourci précis dans la fenêtre d'aide, plutôt que de parcourir toute la liste
- Des raccourcis en plusieurs étapes (appuyer sur une touche, puis une autre, comme dans certains sites) plutôt qu'en une seule combinaison
- Proposer une solution quand deux raccourcis utilisent la même touche, pas juste prévenir dans la console pour les développeurs
- Une barre de recherche façon "palette de commandes" (comme Ctrl+K) pour trouver et lancer n'importe quelle action juste en tapant son nom
- Aller directement à la première ou dernière page de résultats avec les touches Origine/Fin, ou sauter plusieurs pages d'un coup avec Page précédente/Page suivante
- Avancer ou reculer avec un geste de balayage du doigt sur téléphone ou tablette
- Ranger les raccourcis affichés dans la fenêtre d'aide par catégories, plutôt que tous à la suite

## Explicitement écarté

- Des touches simples comme K, B, M, N ou P toutes seules — trop facile à appuyer dessus par accident en lisant
- Les flèches Haut/Bas pour changer de chapitre — ça entre en conflit avec le défilement normal de la page
- Les flèches Gauche/Droite toutes seules (sans Ctrl ni Shift) pour changer de page — trop facile à déclencher par erreur
- Un interrupteur pour activer ou désactiver chaque raccourci un par un — inutile, il suffit de remapper un raccourci vers "rien" pour le désactiver
- Plusieurs profils de raccourcis sauvegardés en même temps — jugé trop compliqué
- Utiliser Origine/Fin pour aller directement au premier ou dernier chapitre d'une fic — jugé pas assez intuitif

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
     customizationEnabled  – allow remapping (future)
     allShortcutsDisabled  – emergency kill switch
     shortcuts             – map of action → key combo

   External API (available only while the module is active):
     W.AO3H_Keyboard.register(action, keyStr, fn)
     W.AO3H_KeyboardShortcuts.register(moduleId, shortcutDefinitions)
       → both forms return an unregister function







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
| `customizationEnabled`  | Désactivé           | Active la personnalisation des raccourcis             |
| `prevChapter`           | `Ctrl+ArrowLeft`    | Aller au chapitre précédent.                          |
| `nextChapter`           | `Ctrl+ArrowRight`   | Aller au chapitre suivant.                            |
| `prevPage`              | `Shift+ArrowLeft`   | Aller à la page précédente dans les listes de fics.   |
| `nextPage`              | `Shift+ArrowRight`  | Aller à la page suivante dans les listes de fics.     |
| `guide`                 | `?`                 | Ouvrir la fenêtre d'aide des raccourcis.              |
| `surpriseMe`            | `Ctrl+Shift+R`      | Déclencher **Surprise Me**.                           |
| `subscribe`             | `Ctrl+Shift+S`      | S'abonner à une œuvre.                                |
| `bookmark`              | `Ctrl+Shift+B`      | Ajouter une œuvre aux favoris.                        |
| `markForLater`          | `Ctrl+Shift+M`      | Marquer une œuvre pour plus tard.                     |

---

# Structure du module

Le module est composé d'un fichier fonctionnel unique et d'une feuille de style.

```text
keyboardShortcuts.js
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

- passer au chapitre précédent ;
- passer au chapitre suivant ;
- passer à la page précédente ;
- passer à la page suivante ;
- lancer **Surprise Me** ;
- s'abonner à une œuvre ;
- ajouter une œuvre aux favoris ;
- marquer une œuvre pour plus tard ;
- ouvrir la fenêtre d'aide.

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

- liste les raccourcis intégrés au module ;
- affiche également ceux enregistrés par d'autres modules ;
- peut être fermée avec la touche `Échap`.

---

### Détection des conflits

Le module vérifie les combinaisons enregistrées.

Si plusieurs raccourcis utilisent la même combinaison de touches, un avertissement est affiché dans la console afin de faciliter le développement.

Aucune résolution automatique des conflits n'est actuellement effectuée.

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

Les fonctionnalités ci-dessous sont mentionnées dans d'autres documents du projet mais ne sont pas encore présentes dans le module.

---

## Personnalisation des raccourcis

Permettre à l'utilisateur de modifier librement les combinaisons de touches.

Le réglage `customizationEnabled` existe déjà mais n'est actuellement relié à aucune implémentation.

---

## Importation et exportation

Permettre d'exporter et d'importer les raccourcis personnalisés dans un fichier.

---

## Mode Vim

Ajouter un mode de navigation utilisant les touches :

- `h`
- `j`
- `k`
- `l`

---

## Raccourci pour laisser un kudos

Ajouter une combinaison de touches permettant de laisser directement un kudos.

---

## Recherche dans la fenêtre d'aide

Ajouter un champ permettant de rechercher rapidement un raccourci particulier.

---

## Raccourcis en plusieurs étapes

Permettre des séquences de touches successives plutôt qu'une seule combinaison de touches.

---

## Résolution automatique des conflits

Proposer automatiquement une solution lorsqu'une combinaison est utilisée par plusieurs raccourcis au lieu de simplement afficher un avertissement dans la console.

---

## Palette de commandes

Ajouter une palette de commandes similaire à **Ctrl+K** permettant de rechercher une action par son nom puis de l'exécuter.

---

## Navigation avancée dans les listes

Ajouter des raccourcis permettant :

- d'aller directement à la première ou à la dernière page ;
- de sauter plusieurs pages à la fois avec les touches Page précédente/Page suivante.

---

## Gestes tactiles

Permettre la navigation par balayage sur téléphone ou tablette.

---

## Catégories dans la fenêtre d'aide

Classer les raccourcis par catégories plutôt que de les afficher dans une seule liste.

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