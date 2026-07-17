# mainNavigation

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module améliore la barre de navigation principale d'AO3 (le menu en
haut de la page) : des liens rapides vers ton activité personnelle, un
choix entre menus qui s'ouvrent au survol ou au clic, et jusqu'à 5 liens
personnalisés.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `addNavLinks` | activé | Ajoute des liens Bookmarks / Marked for Later / Historique dans le menu |
| `menuActivation` | `hover` | Comment les menus s'ouvrent : au survol de la souris, ou seulement au clic |
| `quickLinksEnabled` | désactivé | Active les liens rapides personnalisés (jusqu'à 5, avec un nom et une adresse) |
| `quickLink1Label` … `quickLink5Label` | (vide) | Le nom du lien rapide N |
| `quickLink1Url` … `quickLink5Url` | (vide) | L'adresse du lien rapide N |

## Fichiers

### 1. `_mainNavigation.js` — le chef d'orchestre

- Met en route les trois autres fichiers de ce module
- Retrouve le nom d'utilisateur pour savoir vers quelles pages pointer les liens
- Ne s'active pas sur la page d'historique des kudos, pour éviter les conflits avec le menu propre à cette page

### 2. `addNavLinks.js` — liens rapides vers ton activité

- Ajoute trois liens dans le menu : 🔖 Bookmarks, 📌 Marked for Later, 📚 Historique
- N'affiche que les liens qui peuvent vraiment fonctionner (il faut être connecté)

### 3. `menuActivation.js` — mode d'ouverture des menus

- Bascule entre l'ouverture au survol de la souris (comportement normal d'AO3) et l'ouverture au clic uniquement
- En mode "clic", un seul menu peut être ouvert à la fois, et il se ferme si on clique ailleurs

### 4. `quickLinks.js` — liens personnalisés

- Permet d'ajouter jusqu'à 5 liens personnalisés (avec un nom et une adresse) dans le menu
- Vérifie que l'adresse est valide avant de l'ajouter

### 5. `mainNavigation.css`

- Les styles visuels des liens ajoutés et du mode "menu au clic"

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Un bouton "← Retour à la recherche" sur les pages de fics, qui ramène intelligemment à la page de résultats précédente en gardant les filtres actifs
- Voir plusieurs pages précédentes dans une liste déroulante
- Un bouton "Suivant" pour compléter le retour en arrière
- Garder en mémoire les pages fermées récemment pour pouvoir les rouvrir
- Un raccourci plus malin vers la page "parente" (série, collection, page auteur)
- Accès rapide à des tags ou fandoms personnalisés
- Une liste des liens récemment visités
- Des menus déroulants personnalisés dans la barre de navigation
- Personnaliser les icônes des liens
- Cacher les éléments du menu qu'on ne veut pas voir
- Un historique de navigation "intelligent" qui ignore les redirections
- Un fil d'Ariane (breadcrumb) pour se repérer
- Un lien rapide vers l'historique des kudos donnés
- Un petit chiffre sur les liens Historique et Mark for Later pour indiquer combien de nouveautés il y a
- Quand on ajoute un lien personnalisé, pouvoir chercher un fandom ou un pairing dans une liste plutôt que de devoir taper l'adresse à la main
- Faire pointer le lien Historique vers le tableau de bord de lecture (si ce module-là est activé) plutôt que toujours vers la page historique classique d'AO3
- Se déplacer dans les menus du haut avec les flèches du clavier, pour les personnes qui n'utilisent pas la souris

## Explicitement écarté

- Des raccourcis clavier globaux comme Alt+flèche gauche, Ctrl+H, Alt+B ou Alt+M pour naviguer — abandonné car ça entre en collision avec des raccourcis déjà utilisés par le navigateur
- Une barre de liens sur le côté de la page (sidebar) — le menu du haut suffit déjà
- Une option pour cacher complètement la recherche du menu — jugée risquée, elle pourrait casser la navigation
- Un interrupteur séparé pour chaque lien du menu (Bookmarks, Marked for Later, Historique) un par un — inutile, un seul interrupteur pour le groupe suffit

## Précision

⚠️ Les docs historiques présentent un bouton "← Back to Search" (retour
intelligent vers la recherche) comme un comportement automatique central
de ce module. Il n'y a pourtant aucune trace de ce bouton dans le code
actuel — ni dans les 3 fichiers de fonctionnalités, ni ailleurs dans le
dossier. Cette fonctionnalité n'existe pas.


AO3 Helper - Main Navigation Module Coordinator
    Module ID: mainNavigation
    Display Name: Main Navigation
    Tab: Navigate & Interact

    Submodules (imported directly as ES modules):
        ./addNavLinks.js      -- nav links injection (Bookmarks/MFL/History)
        ./quickLinks.js       -- custom quick links
        ./menuActivation.js   -- hover vs click menu mode

    Config keys:
        addNavLinks        -- inject Bookmarks/MFL/History links in header
        quickLinksEnabled  -- custom quick links (URL + label)
        menuActivation     -- 'hover' | 'click'

═══════════════════════════════════════════════════════════════════════════
  # mainNavigation
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Main Navigation** améliore la barre de navigation principale d’AO3 affichée en haut des pages.

Il permet notamment de :

* ajouter des liens rapides vers les favoris, les œuvres marquées pour plus tard et l’historique ;
* choisir si les menus s’ouvrent au survol ou uniquement au clic ;
* ajouter jusqu’à cinq liens personnalisés ;
* adapter automatiquement certains liens selon l’utilisateur connecté ;
* éviter les conflits avec la page d’historique des kudos.

---

# Réglages utilisateur

| Réglage                               | Défaut    | Description                                                                                         |
| ------------------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `addNavLinks`                         | Activé    | Ajoute les liens **Bookmarks**, **Marked for Later** et **Historique** dans la barre de navigation. |
| `menuActivation`                      | `hover`   | Définit si les menus s’ouvrent au survol (`hover`) ou uniquement au clic (`click`).                 |
| `quickLinksEnabled`                   | Désactivé | Active les liens rapides personnalisés. Jusqu’à cinq liens peuvent être configurés.                 |
| `quickLink1Label` à `quickLink5Label` | Vide      | Définit le nom affiché pour chacun des cinq liens rapides.                                          |
| `quickLink1Url` à `quickLink5Url`     | Vide      | Définit l’adresse associée à chacun des cinq liens rapides.                                         |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de trois sous-modules fonctionnels et d’une feuille de style.

```text
_mainNavigation.js
addNavLinks.js
menuActivation.js
quickLinks.js
mainNavigation.css
```

---

# _mainNavigation.js

## Rôle

Fichier coordinateur du module.

Il initialise les sous-modules responsables de l’ajout des liens de navigation, des liens personnalisés et du mode d’ouverture des menus.

---

## Responsabilités

* Importe directement les trois sous-modules fonctionnels sous forme de modules ES.
* Initialise :

  * `addNavLinks.js` ;
  * `quickLinks.js` ;
  * `menuActivation.js`.
* Récupère le nom de l’utilisateur connecté afin de construire les adresses des liens personnels.
* Transmet les préférences de configuration aux sous-modules concernés.
* Empêche l’activation du module sur la page d’historique des kudos.
* Évite ainsi les conflits avec le menu particulier utilisé sur cette page.

---

## Détails techniques

### Sous-modules importés

Le coordinateur importe directement :

```text
./addNavLinks.js
./quickLinks.js
./menuActivation.js
```

### Clés de configuration principales

Le coordinateur utilise notamment :

| Clé                 | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `addNavLinks`       | Contrôle l’ajout des liens Bookmarks, Marked for Later et Historique. |
| `quickLinksEnabled` | Contrôle l’activation des liens rapides personnalisés.                |
| `menuActivation`    | Contrôle le mode d’ouverture des menus : `hover` ou `click`.          |

---

## Dépendances

Le coordinateur dépend :

* du système de configuration d’AO3 Helper ;
* du DOM de la barre de navigation d’AO3 ;
* des trois sous-modules du dossier ;
* de l’état de connexion de l’utilisateur.

---

# addNavLinks.js

## Rôle

Ajoute des liens directs vers les principales pages d’activité personnelle de l’utilisateur dans la barre de navigation d’AO3.

---

## Fonctionnalités

### Liens ajoutés

Lorsque `addNavLinks` est activé, le sous-module ajoute les liens suivants :

* `🔖 Bookmarks`
* `📌 Marked for Later`
* `📚 Historique`

Ces liens permettent d’accéder rapidement aux pages personnelles correspondantes depuis la navigation principale.

---

### Adaptation à l’utilisateur connecté

Le sous-module utilise le nom de l’utilisateur connecté pour construire les adresses appropriées.

Il n’ajoute que les liens pouvant réellement fonctionner.

Les liens nécessitant un compte connecté ne sont donc pas affichés lorsque l’utilisateur n’est pas authentifié.

---

## Détails techniques

### Condition d’activation

La fonctionnalité dépend du réglage :

```text
addNavLinks
```

### Portée

Les liens sont ajoutés à la barre de navigation principale d’AO3.

Le sous-module ne s’active pas sur la page d’historique des kudos, conformément à la protection appliquée par le coordinateur.

---

## Dépendances

Ce sous-module est initialisé par `_mainNavigation.js`.

Il dépend :

* du nom de l’utilisateur connecté ;
* de la structure du menu principal d’AO3 ;
* de la disponibilité des pages personnelles correspondantes.

---

# menuActivation.js

## Rôle

Contrôle la façon dont les menus déroulants de la barre de navigation principale s’ouvrent et se ferment.

---

## Fonctionnalités

### Mode au survol

Lorsque `menuActivation` est réglé sur :

```text
hover
```

les menus utilisent le comportement habituel d’AO3 et s’ouvrent au passage de la souris.

---

### Mode au clic

Lorsque `menuActivation` est réglé sur :

```text
click
```

les menus ne s’ouvrent qu’après un clic.

Dans ce mode :

* un seul menu peut être ouvert à la fois ;
* l’ouverture d’un nouveau menu ferme celui qui était déjà ouvert ;
* un clic ailleurs dans la page ferme le menu actif.

---

## Détails techniques

### Réglage géré

```text
menuActivation
```

Les valeurs reconnues sont :

* `hover`
* `click`

### Gestion de l’état

En mode `click`, le sous-module conserve l’état du menu actuellement ouvert afin de garantir qu’un seul menu soit visible à la fois.

---

## Dépendances

Ce sous-module est initialisé par `_mainNavigation.js`.

Il dépend :

* du DOM de la barre de navigation ;
* des événements de clic ;
* des styles définis dans `mainNavigation.css`.

---

# quickLinks.js

## Rôle

Permet d’ajouter jusqu’à cinq liens personnalisés dans la barre de navigation principale d’AO3.

---

## Fonctionnalités

### Liens personnalisés

Lorsque `quickLinksEnabled` est activé, l’utilisateur peut configurer jusqu’à cinq liens.

Chaque lien comprend :

* un nom affiché dans le menu ;
* une adresse de destination.

Les réglages utilisés vont de :

```text
quickLink1Label
quickLink1Url
```

jusqu’à :

```text
quickLink5Label
quickLink5Url
```

---

### Validation des adresses

Avant d’ajouter un lien au menu, le sous-module vérifie que l’adresse fournie est valide.

Un lien dont l’adresse est absente ou invalide n’est pas ajouté.

---

## Détails techniques

### Condition d’activation

La fonctionnalité dépend du réglage :

```text
quickLinksEnabled
```

### Nombre maximal

Le nombre de liens personnalisés est limité à cinq.

### Données nécessaires

Chaque lien doit posséder :

* un libellé ;
* une URL valide.

---

## Dépendances

Ce sous-module est initialisé par `_mainNavigation.js`.

Il dépend :

* des réglages de configuration ;
* du DOM du menu principal ;
* du système de validation des adresses.

---

# mainNavigation.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Main Navigation**.

Il définit notamment l’apparence :

* des liens Bookmarks, Marked for Later et Historique ajoutés au menu ;
* des liens rapides personnalisés ;
* des menus ouverts en mode `click` ;
* des états ouverts et fermés des menus ;
* des éléments ajoutés à la barre de navigation principale.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## Retour intelligent vers la recherche

Ajouter un bouton :

```text
← Retour à la recherche
```

sur les pages d’œuvres.

Ce bouton ramènerait l’utilisateur à la page de résultats précédente tout en conservant les filtres actifs.

---

## Liste des pages précédentes

Permettre d’afficher plusieurs pages précédemment consultées dans une liste déroulante.

---

## Bouton Suivant

Ajouter un bouton **Suivant** pour compléter le système de retour vers les pages précédentes.

---

## Pages récemment fermées

Conserver temporairement les pages fermées récemment afin de pouvoir les rouvrir.

---

## Navigation vers la page parente

Ajouter un raccourci intelligent vers la page liée à l’œuvre actuellement consultée.

La page parente pourrait notamment être :

* une série ;
* une collection ;
* une page d’auteur.

---

## Accès rapide aux tags et fandoms

Permettre d’ajouter des accès rapides vers des tags ou des fandoms personnalisés.

---

## Liens récemment visités

Afficher une liste des liens visités récemment.

---

## Menus déroulants personnalisés

Permettre de créer des menus déroulants personnalisés dans la barre de navigation.

---

## Personnalisation des icônes

Permettre de modifier les icônes associées aux liens ajoutés.

---

## Masquage des éléments du menu

Permettre de cacher certains éléments de la barre de navigation principale.

---

## Historique de navigation intelligent

Ajouter un historique capable d’ignorer les redirections afin de ne conserver que les pages réellement utiles.

---

## Fil d’Ariane

Ajouter un fil d’Ariane permettant de mieux situer la page actuelle dans la structure d’AO3.

---

## Lien vers l’historique des kudos

Ajouter un lien rapide vers la page contenant l’historique des kudos donnés.

---

## Compteurs de nouveautés

Afficher un compteur sur les liens :

* **Historique** ;
* **Marked for Later**.

Ce compteur indiquerait le nombre de nouveautés disponibles.

---

## Recherche de fandom ou de pairing

Lors de l’ajout d’un lien personnalisé, permettre de rechercher un fandom ou un pairing dans une liste au lieu de devoir saisir manuellement son adresse.

---

## Intégration au tableau de bord de lecture

Lorsque le module de tableau de bord de lecture est actif, permettre au lien **Historique** de pointer vers ce tableau de bord plutôt que vers la page historique classique d’AO3.

---

## Navigation au clavier dans les menus

Permettre de se déplacer dans les menus de la barre supérieure avec les touches fléchées.

Cette fonctionnalité améliorerait notamment l’accessibilité pour les utilisateurs qui n’utilisent pas de souris.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Aucun raccourci clavier global de navigation

Le module n’utilise pas de raccourcis comme :

* `Alt+Flèche gauche`
* `Ctrl+H`
* `Alt+B`
* `Alt+M`

Ces combinaisons ont été abandonnées parce qu’elles entrent en conflit avec des raccourcis déjà utilisés par les navigateurs.

---

## Aucune barre latérale

Le module n’ajoute pas de barre de liens sur le côté de la page.

La barre de navigation supérieure est considérée comme suffisante.

---

## Recherche toujours visible

Le module ne permet pas de masquer complètement la recherche du menu.

Cette option a été jugée risquée, car elle pourrait nuire à la navigation ou casser certains comportements du site.

---

## Un seul réglage pour les liens personnels

Le module ne propose pas un interrupteur différent pour chacun des liens :

* **Bookmarks** ;
* **Marked for Later** ;
* **Historique**.

Ces trois liens sont contrôlés ensemble par le réglage `addNavLinks`.

Un interrupteur séparé pour chaque lien a été jugé inutile.

---

# Précision historique

Les documentations historiques présentent un bouton :

```text
← Back to Search
```

comme une fonctionnalité automatique centrale du module.

Cette information ne correspond pas au code actuel.

Aucune trace de ce bouton n’est présente :

* dans `addNavLinks.js` ;
* dans `menuActivation.js` ;
* dans `quickLinks.js` ;
* dans les autres fichiers du dossier du module.

La fonctionnalité de retour intelligent vers la recherche n’existe donc pas actuellement.

