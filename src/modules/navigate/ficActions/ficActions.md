# ficActions

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module améliore les boutons d'action d'une fic (bookmark, abonnement,
partage...), à la fois sur la page d'une fic et sur les listes. On peut
réorganiser ces boutons à la souris, en cacher certains, dupliquer le
bouton d'abonnement en bas de page, et s'abonner directement depuis une
liste sans ouvrir la fic.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `buttonReordering` | désactivé | Active le glisser-déposer pour réorganiser les boutons d'action |
| `iconOnlyButtons` | désactivé | Remplace le texte des boutons par une icône (le libellé complet reste disponible pour les lecteurs d'écran) |
| `subscribeButtonBottom` | désactivé | Duplique le bouton "Subscribe" en bas de la page |
| `bottomSubscribePosition` | `nearKudos` | Où placer ce bouton dupliqué : à côté du bouton kudos, ou tout en bas de la page |
| `subscribeFromListings` | désactivé | Ajoute un bouton d'abonnement rapide sur les fics d'une liste |
| `showSubscriptionStatus` | désactivé | Affiche un badge 🔔 sur les fics déjà suivies |
| `hideShare` | désactivé | Cache le bouton "Share" |
| `hideBookmark` | désactivé | Cache le bouton "Bookmark" |
| `hideSubscribe` | désactivé | Cache le bouton "Subscribe" |

## Fichiers

### `ficActions.js` — tout le module en un seul fichier

- Ajoute une poignée (⠿) pour réorganiser les boutons d'action à la souris ; l'ordre choisi est gardé en mémoire pour les prochaines visites
- Permet de cacher les boutons Share, Bookmark ou Subscribe un par un
- Peut remplacer le texte des boutons d'action par une icône (le libellé complet reste lisible par les lecteurs d'écran)
- Ajoute une copie du bouton "Subscribe" en bas de la page (à côté du bouton kudos, ou tout en bas de la page au choix), pour s'abonner facilement après avoir fini de lire
- Ajoute un bouton 🔕/🔔 sur les listes de fics pour s'abonner sans ouvrir la fic
- Affiche un badge "🔔 Subscribed" sur les fics déjà suivies

### Logique interne intégrée à `ficActions.js`

- `getActionIcon(key)` : l'icône associée à un bouton d'action (mode icônes seules)
- `resolveBottomSubscribeContainer(doc, position)` : trouve le conteneur où insérer le bouton Subscribe dupliqué quand la position choisie est "tout en bas de la page"

### `ficActions.css`

- Les styles visuels des boutons cachés/réorganisés, des poignées de glisser-déposer, des icônes seules (avec libellé accessible masqué visuellement), du bouton rapide et du badge d'abonnement

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Créer ses propres boutons d'action personnalisés, en plus de ceux déjà là~~ ❌ Écarté
  Autoriser des boutons définis par l'utilisateur (URL/action arbitraire)
  ouvrirait une surface d'injection sans bénéfice clair ; ce module se
  limite à améliorer les boutons déjà fournis par AO3.
- ~~Avoir un raccourci clavier différent pour chaque bouton individuellement~~ ❌ Écarté
  Rôle du module `keyboardShortcuts`, pas de `ficActions` — éviter deux
  systèmes de raccourcis clavier concurrents dans l'extension.
- ~~Regrouper certains boutons ensemble visuellement~~ ❌ Écarté
  Le glisser-déposer déjà en place permet déjà de rapprocher les boutons
  qu'on veut voir ensemble ; un système de groupes explicite ajouterait de
  la complexité pour un gain marginal.
- ~~Une disposition spécialement pensée pour mobile~~ ✅ Fait
  Le layout flexible (`ao3h-better-buttons`, `flex-wrap: wrap`) s'adapte
  déjà aux petits écrans : les boutons passent à la ligne suivante au lieu
  de déborder. Pas de disposition dédiée séparée nécessaire.
- ~~Un mode "icônes seules", sans le texte à côté~~ ✅ Fait
  Réglage `iconOnlyButtons` : chaque bouton d'action affiche une icône, le
  texte original reste présent mais visuellement masqué (`.ao3h-sr-only`)
  pour les lecteurs d'écran.
- ~~Un menu d'actions rapides~~ ❌ Écarté
  Redondant avec la réorganisation, le masquage et le mode icônes seules
  déjà proposés — un second point d'entrée pour les mêmes actions
  n'apporterait pas de valeur claire.
- ~~Personnaliser les icônes des boutons~~ ❌ Écarté
  Même raisonnement que les boutons personnalisés : la personnalisation
  icône par icône ajoute de la configuration pour un gain marginal ; le jeu
  d'icônes fixe du mode icônes seules couvre le besoin pratique.
- ~~Choisir où placer exactement le bouton Subscribe dupliqué en bas de page (aujourd'hui il est toujours au même endroit)~~ ✅ Fait
  Réglage `bottomSubscribePosition` : à côté du bouton kudos (comportement
  historique, par défaut) ou tout en bas de la page (`#main`).
- ~~Une page ou un panneau pour voir et gérer d'un coup tous les auteurs et toutes les séries auxquels tu es abonné·e sur AO3, plutôt que de s'abonner un par un~~ ❌ Écarté
  AO3 fournit déjà une page native pour ça (`/users/<user>/subscriptions`) ;
  la dupliquer dans l'extension (appels réseau, pagination) coûterait plus
  qu'elle n'apporterait — même raisonnement que le concept `collectionBrowser`
  jamais construit (voir `docs/never-built-modules.md`).

## Explicitement écarté

- Des actions qui enchaînent plusieurs étapes automatiquement — ce module gère juste l'affichage des boutons
- Une longue liste de dizaines d'emplacements prédéfinis pour placer chaque bouton — jugé trop compliqué, le glisser-déposer suffit
- Des boutons d'action personnalisés définis par l'utilisateur — risque d'injection pour un gain marginal (cf. Specs non implémentés)
- Des raccourcis clavier par bouton — rôle du module `keyboardShortcuts`
- Un menu d'actions rapides séparé — redondant avec réorganisation + masquage + icônes seules
- Personnalisation des icônes bouton par bouton — configuration disproportionnée par rapport au besoin
- Une page de gestion globale des abonnements — AO3 en fournit déjà une (`/users/<user>/subscriptions`)

## Précision

⚠️ La doc historique anglaise dit que le glisser-déposer, l'abonnement
rapide depuis les listes et le badge de statut d'abonnement n'étaient "pas
encore codés". Les trois sont bel et bien codés aujourd'hui dans
`ficActions.js`.



AO3 Helper - Fic Actions Module
    Module ID: ficActions
    Display Name: Fic Actions

    Key Features:
        - Button reordering (drag & drop)
        - Button visibility toggles
        - Bottom Subscribe button option
        - Quick Subscribe buttons in listings
        - Subscription status indicator

  - Feature: Reorder buttons in work navigation
    - Option: Drag & drop button reordering (action buttons only: bookmark, mark, share, subscribe, download, comments)
    - Option: Visual drag handles (⠿ icon, cursor: grab)
    - Option: Custom button order persisted to localStorage
    - Setting: `buttonReordering` (boolean, default: false)

  - Feature: Button visibility toggles
    - Option: Hide Share button — Setting: `hideShare` (boolean, default: false)
    - Option: Hide Bookmark button — Setting: `hideBookmark` (boolean, default: false)
    - Option: Hide Subscribe button — Setting: `hideSubscribe` (boolean, default: false)
    - Option: CSS classes: `ao3h-hide-share`, `ao3h-hide-bookmark`, `ao3h-hide-subscribe` on <html>

  - Feature: Bottom Subscribe button option
    - Option: Duplicate Subscribe button at bottom of work
    - Option: Setting: `subscribeButtonBottom` (boolean, default: false)
    - Option: Convenient access after reading

  - Feature: Quick Subscribe buttons in listings
    - Option: Add Subscribe buttons to search results
    - Option: Quick subscription from listings

  - Feature: Subscription status indicator
    - Option: Visual indicator for subscribed works
    - Option: Shows subscription status at a glance

  - Feature: Per-user configuration
    - Option: Personalized button layout
    - Option: Settings persistence


═══════════════════════════════════════════════════════════════════════════
  # ficActions
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Fic Actions** améliore les boutons d’action associés aux œuvres sur AO3, aussi bien sur la page d’une fic que dans les listes de résultats.

* Il permet notamment de :
  - réorganiser les boutons d’action par glisser-déposer ;
  - mémoriser un ordre personnalisé pour les prochaines visites ;
  - masquer individuellement les boutons **Share**, **Bookmark** et **Subscribe** ;
  - dupliquer le bouton **Subscribe** en bas de la page d’une œuvre ;
  - s’abonner directement depuis une liste sans ouvrir la fic ;
  - afficher un indicateur sur les œuvres auxquelles l’utilisateur est déjà abonné.

---

# Réglages utilisateur

| Réglage                    | Description                                                                   |
| -------------------------- |-------------------------------------------------------------------------------|
| `buttonReordering`         | Active le glisser-déposer pour réorganiser les boutons d’action.              |
| `iconOnlyButtons`          | Remplace le texte des boutons d’action par une icône.                        |
| `subscribeButtonBottom`    | Duplique le bouton **Subscribe** en bas de la page d’une œuvre.               |
| `bottomSubscribePosition`  | Emplacement de ce bouton dupliqué : `nearKudos` (défaut) ou `pageEnd`.       |
| `subscribeFromListings`    | Ajoute un bouton d’abonnement rapide sur les œuvres affichées dans une liste. |
| `showSubscriptionStatus`   | Affiche un badge `🔔 Subscribed` sur les œuvres déjà suivies.                 |
| `hideShare`                | Masque le bouton **Share**.                                                   |
| `hideBookmark`             | Masque le bouton **Bookmark**.                                                |
| `hideSubscribe`            | Masque le bouton **Subscribe**.                                               |

---

# Structure du module

Le module est composé d’un fichier fonctionnel et d’une feuille de style.

```text
ficActions.js
ficActions.css
```

---

# ficActions.js

## Rôle

Gère l’ensemble des améliorations apportées aux boutons d’action des œuvres.

Le module contrôle leur ordre, leur visibilité, la duplication du bouton d’abonnement en bas de page, les actions d’abonnement rapide depuis les listes et l’affichage du statut d’abonnement.

---

## Fonctionnalités

### Réorganisation des boutons d’action

Lorsque `buttonReordering` est activé, le module permet de modifier l’ordre des boutons d’action présents dans la navigation d’une œuvre.

Les boutons concernés comprennent notamment :

* **Bookmark** ;
* **Mark** ;
* **Share** ;
* **Subscribe** ;
* **Download** ;
* **Comments**.

Une poignée visuelle utilisant l’icône :

```text
⠿
```

est ajoutée aux boutons concernés.

La poignée utilise un curseur de type `grab` afin d’indiquer que l’élément peut être déplacé.

L’utilisateur peut ensuite réorganiser les boutons par glisser-déposer.

---

### Mémorisation de l’ordre

L’ordre personnalisé choisi par l’utilisateur est enregistré dans `localStorage`.

Il est automatiquement restauré lors des visites suivantes.

Cette persistance permet de conserver une disposition personnalisée propre à l’utilisateur.

---

### Visibilité des boutons

Le module permet de masquer individuellement plusieurs boutons d’action.

Les boutons contrôlés sont :

* **Share** ;
* **Bookmark** ;
* **Subscribe**.

Chaque bouton possède son propre réglage et peut être masqué indépendamment des autres.

---

### Classes de visibilité

La visibilité des boutons est contrôlée à l’aide de classes appliquées sur l’élément `<html>`.

| Réglage         | Classe CSS            |
| --------------- | --------------------- |
| `hideShare`     | `ao3h-hide-share`     |
| `hideBookmark`  | `ao3h-hide-bookmark`  |
| `hideSubscribe` | `ao3h-hide-subscribe` |

Les règles correspondantes sont définies dans `ficActions.css`.

---

### Bouton Subscribe en bas de page

Lorsque `subscribeButtonBottom` est activé, le module duplique le bouton **Subscribe** au bas de la page d’une œuvre.

Cette copie permet de s’abonner facilement après avoir terminé la lecture sans devoir remonter jusqu’aux boutons d’action situés en haut de la page.

Son emplacement est contrôlé par `bottomSubscribePosition` :

* `nearKudos` (défaut) — juste à côté du bouton kudos ;
* `pageEnd` — tout en bas de la page (après le contenu de `#main`, donc après les commentaires).

---

### Mode icônes seules

Lorsque `iconOnlyButtons` est activé, chaque bouton d’action affiche une icône (🔖 Bookmark, ✅ Mark, 📤 Share, 🔔 Subscribe, ⬇️ Download, 💬 Comments) à la place de son texte.

Le texte original n’est pas supprimé : il est déplacé dans un élément visuellement masqué mais toujours lu par les lecteurs d’écran, afin de conserver l’accessibilité du bouton.

---

### Abonnement rapide depuis les listes

Lorsque `subscribeFromListings` est activé, le module ajoute un bouton d’abonnement directement sur les œuvres affichées dans les listes.

Ce bouton permet de s’abonner à une fic sans devoir ouvrir sa page.

Selon l’état de l’abonnement, il peut utiliser les icônes :

* `🔕` ;
* `🔔`.

Cette fonctionnalité s’applique notamment aux résultats de recherche et aux autres listes d’œuvres compatibles.

---

### Indicateur de statut d’abonnement

Lorsque `showSubscriptionStatus` est activé, le module affiche un indicateur visuel sur les œuvres auxquelles l’utilisateur est déjà abonné.

Le badge affiché est :

```text
🔔 Subscribed
```

Il permet d’identifier rapidement les œuvres suivies depuis une liste sans devoir ouvrir leur page.

---

### Configuration propre à l’utilisateur

Le module conserve les préférences propres à chaque utilisateur.

Cela comprend notamment :

* l’ordre personnalisé des boutons ;
* la visibilité des différents boutons ;
* l’activation du bouton **Subscribe** en bas de page ;
* l’activation de l’abonnement rapide depuis les listes ;
* l’affichage du statut d’abonnement.

---

## Détails techniques

### Portée

Le module agit à deux endroits principaux :

* sur les pages individuelles des œuvres ;
* sur les listes et les résultats de recherche contenant des œuvres.

---

### Glisser-déposer

Le système de réorganisation s’applique uniquement aux boutons d’action de la navigation de l’œuvre.

Il ne réorganise pas les autres éléments de la page.

---

### Persistance

L’ordre des boutons et les réglages utilisateur sont conservés afin de pouvoir être restaurés lors des prochaines visites.

Le système utilise notamment `localStorage` pour enregistrer l’ordre personnalisé.

---

### Modification de l’affichage

Le module améliore principalement l’affichage et l’accès aux actions existantes.

Il ne crée pas de chaînes d’actions automatisées composées de plusieurs étapes.

---

## Dépendances

Le module fonctionne principalement à partir :

* du DOM des pages AO3 ;
* des réglages du module ;
* de `localStorage` ;
* des boutons d’action existants fournis par AO3.

---

# ficActions.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Fic Actions**.

Il définit notamment l’apparence :

* des boutons masqués ;
* des boutons réorganisés ;
* des poignées de glisser-déposer ;
* du curseur utilisé pendant la réorganisation ;
* du bouton d’abonnement rapide dans les listes ;
* du badge indiquant le statut d’abonnement ;
* du bouton **Subscribe** dupliqué en bas de page.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet. Statut après revue :

---

## Boutons personnalisés ❌ Écarté

Permettre à l’utilisateur de créer ses propres boutons d’action en plus de ceux déjà fournis par AO3.

> Écarté : des boutons définis par l’utilisateur (URL ou action arbitraire)
> ouvriraient une surface d’injection sans bénéfice clair pour un module qui
> ne fait qu’améliorer des boutons déjà fournis par AO3.

---

## Raccourcis individuels ❌ Écarté

Permettre d’attribuer un raccourci clavier différent à chaque bouton d’action.

> Écarté : c’est le rôle du module `keyboardShortcuts`, pas de `ficActions`
> — éviter deux systèmes de raccourcis clavier concurrents.

---

## Regroupement visuel ❌ Écarté

Permettre de regrouper certains boutons afin de créer des ensembles visuels distincts.

> Écarté : le glisser-déposer déjà en place permet déjà de rapprocher les
> boutons qu’on veut voir ensemble ; un système de groupes explicite
> ajouterait de la complexité pour un gain marginal.

---

## Disposition mobile ✅ Fait

Ajouter une disposition spécialement conçue pour les téléphones et les tablettes.

> Le layout flexible (`ao3h-better-buttons`, `flex-wrap: wrap`) s’adapte
> déjà aux petits écrans : les boutons passent à la ligne suivante plutôt
> que de déborder. Pas de disposition dédiée séparée nécessaire.

---

## Mode icônes seules ✅ Fait

Permettre d’afficher uniquement les icônes des boutons sans leur texte.

> Réglage `iconOnlyButtons` : chaque bouton affiche une icône, le texte
> original reste présent mais visuellement masqué pour les lecteurs d’écran.

---

## Menu d’actions rapides ❌ Écarté

Ajouter un menu regroupant plusieurs actions fréquemment utilisées.

> Écarté : redondant avec la réorganisation, le masquage et le mode icônes
> seules déjà proposés.

---

## Personnalisation des icônes ❌ Écarté

Permettre à l’utilisateur de choisir les icônes associées aux différents boutons.

> Écarté : même raisonnement que les boutons personnalisés — configuration
> disproportionnée par rapport au besoin ; le jeu d’icônes fixe du mode
> icônes seules suffit.

---

## Position du bouton Subscribe inférieur ✅ Fait

Permettre de choisir précisément où placer le bouton **Subscribe** dupliqué en bas de la page.

> Réglage `bottomSubscribePosition` : à côté du bouton kudos (défaut, comportement
> historique) ou tout en bas de la page (`#main`).

---

## Gestion globale des abonnements ❌ Écarté

Ajouter une page ou un panneau permettant de consulter et de gérer en un seul endroit tous les auteurs et toutes les séries auxquels l’utilisateur est abonné sur AO3.

> Écarté : AO3 fournit déjà une page native pour ça
> (`/users/<user>/subscriptions`) ; la dupliquer dans l’extension coûterait
> plus (appels réseau, pagination) qu’elle n’apporterait — même
> raisonnement que le concept `collectionBrowser` jamais construit.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Aucune chaîne d’actions automatisées

Le module ne propose pas d’actions enchaînant automatiquement plusieurs étapes.

Il se limite à améliorer l’affichage, l’organisation et l’accessibilité des boutons d’action existants.

---

## Nombre limité d’emplacements prédéfinis

Le module ne fournit pas une longue liste d’emplacements prédéfinis pour chaque bouton.

Cette approche a été jugée trop complexe.

Le glisser-déposer est considéré comme suffisant pour permettre à l’utilisateur d’organiser les boutons selon ses préférences.

---

# Précision historique

La documentation historique en anglais indiquait que les fonctionnalités suivantes n’étaient pas encore codées :

* la réorganisation des boutons par glisser-déposer ;
* l’abonnement rapide depuis les listes ;
* l’indicateur du statut d’abonnement.

Cette information est désormais obsolète.

Les trois fonctionnalités sont aujourd’hui implémentées dans `ficActions.js`.
