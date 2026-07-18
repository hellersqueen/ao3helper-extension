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
| `addNavLinks` | activé | Ajoute des liens Bookmarks / Marked for Later / Historique dans le menu (Historique pointe vers le tableau de bord de lecture si `readingDashboard` est activé) |
| `menuActivation` | `hover` | Comment les menus s'ouvrent : au survol de la souris, ou seulement au clic — les flèches du clavier fonctionnent dans les deux modes |
| `backToSearch` | activé | Un lien "← Back to search" sur les pages de fics, vers la dernière page de résultats visitée (filtres conservés) |
| `breadcrumbs` | désactivé | Un fil d'Ariane sous l'en-tête, construit depuis l'URL |
| `quickLinksEnabled` | désactivé | Active les liens rapides personnalisés (jusqu'à 5, avec un nom et une adresse — un emoji en début de nom fait office d'icône) |
| `quickLinksDropdown` | désactivé | Regroupe les liens rapides sous un menu déroulant "☆ Quick Links" |
| `quickLink1Label` … `quickLink5Label` | (vide) | Le nom du lien rapide N |
| `quickLink1Url` … `quickLink5Url` | (vide) | L'adresse du lien rapide N |

Le panneau de réglages propose aussi une recherche Fandom/Pairing
(autocomplete AO3) qui remplit automatiquement le premier lien rapide vide.

## Fichiers

### 1. `_mainNavigation.js` — le chef d'orchestre

- Met en route les trois autres fichiers de ce module
- Retrouve le nom d'utilisateur pour savoir vers quelles pages pointer les liens
- Ne s'active pas sur la page d'historique des kudos, pour éviter les conflits avec le menu propre à cette page

### 2. `addNavLinks.js` — liens rapides vers ton activité

- Ajoute trois liens dans le menu : 🔖 Bookmarks, 📌 Marked for Later, 📚 Historique
- N'affiche que les liens qui peuvent vraiment fonctionner (il faut être connecté)
- Le lien Historique pointe vers la page personnelle (où s'affiche le tableau de bord de lecture) quand le module `readingDashboard` est activé

### 3. `menuActivation.js` — mode d'ouverture des menus

- Bascule entre l'ouverture au survol de la souris (comportement normal d'AO3) et l'ouverture au clic uniquement
- En mode "clic", un seul menu peut être ouvert à la fois, et il se ferme si on clique ailleurs
- Navigation au clavier dans les deux modes : ←/→ entre les menus, ↓/↑ dans un menu ouvert, Échap pour fermer

### 4. `quickLinks.js` — liens personnalisés

- Permet d'ajouter jusqu'à 5 liens personnalisés (avec un nom et une adresse) dans le menu
- Vérifie que l'adresse est valide avant de l'ajouter
- Peut regrouper les liens sous un menu déroulant "☆ Quick Links" (réglage `quickLinksDropdown`)

### 5. `backToSearch.js` — retour vers la recherche (ajouté au passage chantier 4)

- Mémorise la dernière page de listing/recherche visitée dans l'onglet (URL complète, filtres inclus)
- Sur les pages de fics, affiche un lien "← Back to search" vers cette page

### 6. `breadcrumbs.js` — fil d'Ariane (ajouté au passage chantier 4)

- Affiche un petit fil d'Ariane sous l'en-tête, construit depuis l'URL (aucune requête)

### 7. `navHelpers.js` — calculs purs (ajouté au passage chantier 4)

- Reconnaissance des pages "origine de recherche" (`isSearchOrigin`, s'appuie sur `lib/ao3/parsers.js`)
- Décomposition d'un chemin AO3 en segments de fil d'Ariane (`buildBreadcrumbs`, avec décodage des tags `*s*`/`*a*`/`*d*`)

### 8. `mainNavigation.css`

- Les styles visuels des liens ajoutés, du mode "menu au clic", du lien de retour à la recherche et du fil d'Ariane

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs. État après le passage
chantier 4 (2026-07-18) :

- ~~Un bouton "← Retour à la recherche" sur les pages de fics, qui ramène intelligemment à la page de résultats précédente en gardant les filtres actifs~~ ✅ Fait — `backToSearch.js` : la dernière page de listing/recherche visitée dans l'onglet est mémorisée (sessionStorage, URL complète donc filtres inclus) et un lien "← Back to search" apparaît au-dessus du texte sur les pages de work. Réglage `backToSearch` (activé par défaut)
- ~~Voir plusieurs pages précédentes dans une liste déroulante~~ ❌ Écarté — le navigateur offre déjà exactement ça (appui long sur le bouton Retour) ; le réimplémenter en userscript ne couvrirait que les pages du même onglet, en moins bien
- ~~Un bouton "Suivant" pour compléter le retour en arrière~~ ❌ Écarté — même raison : c'est le bouton Suivant du navigateur
- ~~Garder en mémoire les pages fermées récemment pour pouvoir les rouvrir~~ ❌ Écarté — un userscript n'a aucun accès aux onglets du navigateur (pas d'API tabs), il ne peut pas savoir qu'un onglet a été fermé ; les navigateurs le font déjà (Ctrl+Shift+T, menu historique)
- ~~Un raccourci plus malin vers la page "parente" (série, collection, page auteur)~~ ❌ Écarté — AO3 affiche déjà tous ces liens sur chaque page de work (byline de l'auteur, bloc "Part X of Y" de la série, collections) ; un doublon dans la barre de navigation n'apporte rien
- ~~Accès rapide à des tags ou fandoms personnalisés~~ ✅ Fait (déjà couvert) — c'est exactement ce que permettent les quick links (URL libre : n'importe quelle page de tag/fandom/pairing), désormais aidés par la recherche autocomplete ci-dessous
- ~~Une liste des liens récemment visités~~ ❌ Écarté — doublon de l'historique du navigateur ; pour les fics spécifiquement, `readingTracker` (historique), `readingDashboard` et `fanficBingeMode` (blocs "Continue Reading") couvrent déjà ce besoin
- ~~Des menus déroulants personnalisés dans la barre de navigation~~ ✅ Fait — réglage `quickLinksDropdown` : les quick links se regroupent sous un menu déroulant "☆ Quick Links" qui reprend la structure native des menus AO3 (survol et mode clic fonctionnent dessus sans code particulier)
- ~~Personnaliser les icônes des liens~~ ✅ Fait (déjà possible) — le libellé d'un quick link est du texte libre : commencer le libellé par un emoji donne une "icône" au lien ; le placeholder du panneau le suggère désormais. Les icônes des 3 liens intégrés restent fixes (cohérent avec la décision "un seul réglage pour le groupe")
- ~~Cacher les éléments du menu qu'on ne veut pas voir~~ ❌ Écarté — extension directe de la décision déjà prise pour la recherche ("jugée risquée, elle pourrait casser la navigation") : masquer des entrées natives du menu porte le même risque
- ~~Un historique de navigation "intelligent" qui ignore les redirections~~ ❌ Écarté — doublon de l'historique du navigateur ; un userscript ne voit pas les redirections de façon fiable
- ~~Un fil d'Ariane (breadcrumb) pour se repérer~~ ✅ Fait — `breadcrumbs.js` : petit fil d'Ariane sous l'en-tête (Works › Work 123 › Chapter…), construit uniquement depuis l'URL (`navHelpers.js` → `buildBreadcrumbs`), aucune requête. Réglage `breadcrumbs` (désactivé par défaut)
- ~~Un lien rapide vers l'historique des kudos donnés~~ ❌ Écarté — AO3 n'a pas de page native listant les kudos donnés, et la route virtuelle `/kudos-history` de l'extension est un vestige que plus rien ne rend (seul un garde-fou la détecte encore) : le lien pointerait vers une page vide. Le suivi local des kudos existe dans `ficAppreciation` (badges 🧡 sur les listings) mais sans page dédiée
- ~~Un petit chiffre sur les liens Historique et Mark for Later pour indiquer combien de nouveautés il y a~~ ❌ Écarté — demanderait de récupérer et parser ces pages à chaque chargement (coût réseau permanent) ; `notificationCenter` fournit déjà des notifications de mise à jour des œuvres suivies
- ~~Quand on ajoute un lien personnalisé, pouvoir chercher un fandom ou un pairing dans une liste plutôt que de devoir taper l'adresse à la main~~ ✅ Fait — le panneau de réglages a maintenant une recherche Fandom/Pairing branchée sur l'autocomplete natif d'AO3 (`/autocomplete/fandom`, `/autocomplete/relationship`) ; choisir un résultat remplit le premier emplacement de lien vide (libellé + URL de la page de works du tag)
- ~~Faire pointer le lien Historique vers le tableau de bord de lecture (si ce module-là est activé) plutôt que toujours vers la page historique classique d'AO3~~ ✅ Fait — automatique : quand le module `readingDashboard` est activé (vérifié via ses flags), le lien 📚 History pointe vers la page personnelle `/users/{user}` où ce tableau de bord s'affiche
- ~~Se déplacer dans les menus du haut avec les flèches du clavier, pour les personnes qui n'utilisent pas la souris~~ ✅ Fait — dans `menuActivation.js` : ←/→ passe d'un menu à l'autre, ↓ ouvre le menu et descend dans ses entrées, ↑ remonte, Échap ferme et rend le focus au titre du menu. Actif dans les deux modes (survol et clic)

## Explicitement écarté

- Des raccourcis clavier globaux comme Alt+flèche gauche, Ctrl+H, Alt+B ou Alt+M pour naviguer — abandonné car ça entre en collision avec des raccourcis déjà utilisés par le navigateur
- Une barre de liens sur le côté de la page (sidebar) — le menu du haut suffit déjà
- Une option pour cacher complètement la recherche du menu — jugée risquée, elle pourrait casser la navigation
- Un interrupteur séparé pour chaque lien du menu (Bookmarks, Marked for Later, Historique) un par un — inutile, un seul interrupteur pour le groupe suffit

## Précision

⚠️ Les docs historiques présentaient un bouton "← Back to Search" comme un
comportement automatique central de ce module, alors qu'il n'existait pas
dans le code. Depuis le passage chantier 4 (2026-07-18), la fonctionnalité
existe réellement (`backToSearch.js`) — la doc et le code sont désormais
d'accord.


AO3 Helper - Main Navigation Module Coordinator
    Module ID: mainNavigation
    Display Name: Main Navigation
    Tab: Navigate & Interact

    Submodules (imported directly as ES modules):
        ./addNavLinks.js      -- nav links injection (Bookmarks/MFL/History)
        ./quickLinks.js       -- custom quick links (flat or dropdown)
        ./menuActivation.js   -- hover vs click menu mode + arrow-key navigation
        ./backToSearch.js     -- "← Back to search" link on work pages (chantier 4)
        ./breadcrumbs.js      -- URL-derived breadcrumb bar (chantier 4)
        ./navHelpers.js       -- pure helpers for the two above (chantier 4)

    Config keys:
        addNavLinks        -- inject Bookmarks/MFL/History links in header
                              (History retargets to /users/{user} when the
                              readingDashboard module's enabled flag is set)
        quickLinksEnabled  -- custom quick links (URL + label)
        quickLinksDropdown -- group quick links under a "☆ Quick Links" menu
        menuActivation     -- 'hover' | 'click'
        backToSearch       -- work-page link back to the last listing URL
                              (sessionStorage: ao3h:nav:lastSearchUrl)
        breadcrumbs        -- breadcrumb bar under the header

═══════════════════════════════════════════════════════════════════════════
  # mainNavigation
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Main Navigation** améliore la barre de navigation principale d’AO3 affichée en haut des pages.

* Il permet notamment de :
  - ajouter des liens rapides vers les favoris, les œuvres marquées pour plus tard et l’historique ;
  - choisir si les menus s’ouvrent au survol ou uniquement au clic ;
  - ajouter jusqu’à cinq liens personnalisés ;
  - adapter automatiquement certains liens selon l’utilisateur connecté ;
  - éviter les conflits avec la page d’historique des kudos.

---

# Réglages utilisateur

| Réglage                               | Description                                                                                         |
| ------------------------------------- |-----------------------------------------------------------------------------------------------------|
| `addNavLinks`                         | Ajoute les liens **Bookmarks**, **Marked for Later** et **Historique** dans la barre de navigation. |
| `menuActivation`                      | Définit si les menus s’ouvrent au survol (`hover`) ou uniquement au clic (`click`).                 |
| `quickLinksEnabled`                   | Active les liens rapides personnalisés. Jusqu’à cinq liens peuvent être configurés.                 |
| `quickLink1Label` à `quickLink5Label` | Définit le nom affiché pour chacun des cinq liens rapides.                                          |
| `quickLink1Url` à `quickLink5Url`     | Définit l’adresse associée à chacun des cinq liens rapides.                                         |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de cinq sous-modules fonctionnels, d'un fichier de calculs purs et d’une feuille de style (les trois derniers ajoutés au passage chantier 4).

```text
_mainNavigation.js
addNavLinks.js
menuActivation.js
quickLinks.js
backToSearch.js
breadcrumbs.js
navHelpers.js
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

État après le passage chantier 4 (2026-07-18) — chaque sous-section garde sa
description d'origine, complétée par une note de résolution.

---

## Retour intelligent vers la recherche

> ✅ Fait — `backToSearch.js` : dernière page de listing mémorisée en
> sessionStorage (URL complète, filtres inclus), lien "← Back to search"
> au-dessus du texte sur les pages de work. Réglage `backToSearch`.

Ajouter un bouton :

```text
← Retour à la recherche
```

sur les pages d’œuvres.

Ce bouton ramènerait l’utilisateur à la page de résultats précédente tout en conservant les filtres actifs.

---

## Liste des pages précédentes

> ❌ Écarté — le navigateur offre déjà exactement ça (appui long sur le
> bouton Retour).

Permettre d’afficher plusieurs pages précédemment consultées dans une liste déroulante.

---

## Bouton Suivant

> ❌ Écarté — c'est le bouton Suivant du navigateur.

Ajouter un bouton **Suivant** pour compléter le système de retour vers les pages précédentes.

---

## Pages récemment fermées

> ❌ Écarté — un userscript n'a pas d'accès aux onglets du navigateur ; les
> navigateurs le font déjà (Ctrl+Shift+T).

Conserver temporairement les pages fermées récemment afin de pouvoir les rouvrir.

---

## Navigation vers la page parente

> ❌ Écarté — AO3 affiche déjà ces liens sur chaque page de work (byline,
> bloc série, collections) ; un doublon en barre de navigation n'apporte rien.

Ajouter un raccourci intelligent vers la page liée à l’œuvre actuellement consultée.

La page parente pourrait notamment être :

* une série ;
* une collection ;
* une page d’auteur.

---

## Accès rapide aux tags et fandoms

> ✅ Fait (déjà couvert) — c'est exactement l'usage des quick links, aidés
> désormais par la recherche autocomplete du panneau.

Permettre d’ajouter des accès rapides vers des tags ou des fandoms personnalisés.

---

## Liens récemment visités

> ❌ Écarté — doublon de l'historique du navigateur ; pour les fics,
> readingTracker/readingDashboard/fanficBingeMode couvrent déjà ce besoin.

Afficher une liste des liens visités récemment.

---

## Menus déroulants personnalisés

> ✅ Fait — réglage `quickLinksDropdown` : les quick links se regroupent sous
> un menu "☆ Quick Links" reprenant la structure native des menus AO3.

Permettre de créer des menus déroulants personnalisés dans la barre de navigation.

---

## Personnalisation des icônes

> ✅ Fait (déjà possible) — un emoji en début de libellé de quick link fait
> office d'icône ; suggéré par le placeholder du panneau.

Permettre de modifier les icônes associées aux liens ajoutés.

---

## Masquage des éléments du menu

> ❌ Écarté — extension de la décision déjà prise pour la recherche ("jugée
> risquée") : masquer des entrées natives porte le même risque.

Permettre de cacher certains éléments de la barre de navigation principale.

---

## Historique de navigation intelligent

> ❌ Écarté — doublon de l'historique du navigateur ; les redirections ne
> sont pas observables de façon fiable depuis un userscript.

Ajouter un historique capable d’ignorer les redirections afin de ne conserver que les pages réellement utiles.

---

## Fil d’Ariane

> ✅ Fait — `breadcrumbs.js` + `navHelpers.js` → `buildBreadcrumbs()`,
> construit depuis l'URL, aucune requête. Réglage `breadcrumbs`.

Ajouter un fil d’Ariane permettant de mieux situer la page actuelle dans la structure d’AO3.

---

## Lien vers l’historique des kudos

> ❌ Écarté — aucune page à cibler : AO3 n'a pas de page native des kudos
> donnés et la route virtuelle `/kudos-history` de l'extension est un vestige
> non rendu.

Ajouter un lien rapide vers la page contenant l’historique des kudos donnés.

---

## Compteurs de nouveautés

> ❌ Écarté — demanderait de récupérer et parser ces pages à chaque
> chargement (coût réseau) ; notificationCenter notifie déjà les mises à jour.

Afficher un compteur sur les liens :

* **Historique** ;
* **Marked for Later**.

Ce compteur indiquerait le nombre de nouveautés disponibles.

---

## Recherche de fandom ou de pairing

> ✅ Fait — recherche Fandom/Pairing dans le panneau, branchée sur
> l'autocomplete natif d'AO3 ; un résultat choisi remplit le premier
> emplacement de lien vide.

Lors de l’ajout d’un lien personnalisé, permettre de rechercher un fandom ou un pairing dans une liste au lieu de devoir saisir manuellement son adresse.

---

## Intégration au tableau de bord de lecture

> ✅ Fait — automatique quand le flag du module readingDashboard est activé :
> le lien Historique pointe vers `/users/{user}`.

Lorsque le module de tableau de bord de lecture est actif, permettre au lien **Historique** de pointer vers ce tableau de bord plutôt que vers la page historique classique d’AO3.

---

## Navigation au clavier dans les menus

> ✅ Fait — ←/→ entre menus, ↓/↑ dans un menu ouvert, Échap ferme ; actif en
> mode survol comme en mode clic (`menuActivation.js`).

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

Cette information a longtemps été fausse : aucune trace de ce bouton
n'existait dans le code.

**Mise à jour (chantier 4, 2026-07-18) :** la fonctionnalité existe
désormais réellement, implémentée dans `backToSearch.js` (voir plus haut).
La doc historique et le code sont donc redevenus cohérents.

