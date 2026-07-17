# pageControls

**Tab:** Browse

## À quoi ça sert

Ce module améliore la navigation entre les pages de résultats sur AO3
(fics, tags, favoris, historique, collections) : sauter directement à une
page, choisir combien de fics afficher par page, et des boutons de
navigation supplémentaires.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPlusMinus10Buttons` | activé | Affiche les boutons pour avancer/reculer de 10 pages |
| `worksPerPageEnabled` | activé | Active le menu pour choisir 20, 50 ou 100 fics par page |
| `worksPerPage` | `20` | Le nombre de fics affichées par page, par défaut |
| `infiniteScrollEnabled` | désactivé | Active le défilement infini (ce réglage existe, voir "Specs non implémentés") |

## Fichiers

### 1. `_pageControls.js` — le chef d'orchestre

- Ne s'active que sur les pages qui affichent une liste de fics
- Met en route les trois autres fichiers de fonctionnalités

### 2. `coreNavigation.js` — sauter directement à une page

- Ajoute un petit champ ("Page [_] / N") sous la pagination, pour taper un numéro de page et y aller directement

### 3. `worksPerPage.js` — nombre de fics par page

- Un menu pour choisir d'afficher 20, 50 ou 100 fics par page
- Se souvient du choix et l'applique automatiquement la prochaine fois

### 4. `enhancedNavigation.js` — navigation enrichie

- Ajoute une rangée de boutons "First / −10 / Prev / Next / +10 / Last" au-dessus de la pagination normale
- Les boutons se désactivent tout seuls quand on est déjà à la première ou dernière page

### 5. `pageControls.css`

- Les styles visuels des trois widgets ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Le défilement infini (charger automatiquement la suite pendant qu'on descend la page, sans changer de page) — un réglage porte ce nom, mais rien ne le fait vraiment
- Se souvenir de la dernière page où on était pour pouvoir y retourner plus tard
- Aller à une page complètement au hasard
- Sauter à un pourcentage de la liste, par exemple "aller au quart" ou "à la moitié"
- Des boutons pour sauter 50 pages d'un coup, en plus des boutons qui sautent 10 pages
- Choisir soi-même de combien de pages sautent les boutons rapides
- Deviner tout seul le nombre idéal de fics à afficher selon la situation
- Se souvenir des pages visitées récemment, ou proposer des pages à revisiter
- Avoir des réglages de pagination différents selon le type de page (recherche, tags, favoris...)
- Choisir où positionner le champ pour taper le numéro de page
- Une barre de progression visuelle qui montre où on en est dans la liste de pages
- Une barre de navigation qui reste collée en haut de l'écran même en scrollant
- Un bouton pour remonter tout en haut de la page en un clic

## Explicitement écarté

- Suggérer automatiquement des pages "intéressantes" à visiter — jugé trop compliqué pour le bénéfice apporté



AO3 Helper - Page Controls Module Coordinator
    Module ID: pageControls
    Display Name: Page Controls
    Tab: Browse

    Submodules (imported directly as ES modules):
        ./coreNavigation.js     -- page input + URL nav
        ./worksPerPage.js       -- density selector
        ./enhancedNavigation.js -- ±10 buttons + first/last

    Config keys:
        showPlusMinus10Buttons -- ±10 page buttons (default true)
        worksPerPageEnabled    -- show works-per-page selector (default true)


        // AO3 Helper — Core Navigation Submodule
// Submodule ID: pageControls/coreNavigation
// Role: page number input field + current/max detection + URL navigation


// AO3 Helper — Enhanced Navigation Submodule
// Submodule ID: pageControls/enhancedNavigation
// Role: ±10 page buttons + First/Last page links, injected top & bottom


// AO3 Helper — Works Per Page Submodule
// Submodule ID: pageControls/worksPerPage
// Role: density selector (20 / 50 / 100 works per page), memorized in localStorage




═══════════════════════════════════════════════════════════════════════════
  # pageControls
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Page Controls** améliore la navigation entre les pages de résultats d'AO3.

Il ajoute plusieurs outils permettant de se déplacer plus rapidement dans de longues listes de fics, notamment :

- un champ pour aller directement à une page précise ;
- un sélecteur permettant de choisir combien de fics afficher par page ;
- une barre de navigation enrichie avec des raccourcis vers la première, la dernière ou plusieurs pages plus loin.

Le module fonctionne sur toutes les pages AO3 affichant une liste d'œuvres, comme les recherches, les tags, les bookmarks, l'historique ou les collections.

---

# Réglages utilisateur

| Réglage | Défaut | Description |
|----------|--------|-------------|
| `showPlusMinus10Buttons` | Activé | Affiche les boutons permettant d'avancer ou de reculer de 10 pages. |
| `worksPerPageEnabled` | Activé | Active le sélecteur du nombre de fics par page. |
| `worksPerPage` | `20` | Nombre de fics affichées par page. |
| `infiniteScrollEnabled` | Désactivé | Active le défilement infini (fonctionnalité prévue mais non implémentée). |

---

# Structure du module

Le module est composé de trois sous-modules fonctionnels ainsi qu'une feuille de style.

```
_pageControls.js
coreNavigation.js
worksPerPage.js
enhancedNavigation.js
pageControls.css
```

---

# _pageControls.js

## Rôle

Fichier coordinateur du module.

Il initialise les différents systèmes de navigation et s'assure qu'ils ne sont exécutés que sur les pages compatibles.

## Responsabilités

- Vérifie que la page affiche une liste d'œuvres.
- Initialise les trois sous-modules.
- Coordonne les fonctionnalités de navigation.
- Sert de point d'entrée unique pour le reste d'AO3 Helper.

## Fonctions exposées

Le coordinateur permet notamment :

- d'initialiser les contrôles de navigation ;
- d'activer les différents outils selon la page courante ;
- de partager les fonctionnalités avec les autres modules.

---

# coreNavigation.js

## Rôle

Ajoute un champ permettant de rejoindre directement une page précise sans devoir utiliser les liens de pagination d'AO3.

---

## Fonctionnalités

### Navigation directe

Le module ajoute un champ de saisie sous la pagination.

L'utilisateur peut :

- saisir un numéro de page ;
- valider sa saisie ;
- être redirigé immédiatement vers la page demandée.

L'interface affiche le format :

`Page [___] / N`

où **N** représente le nombre total de pages disponibles.

---

### Détection de la pagination

Le module détecte automatiquement :

- la page actuellement affichée ;
- le nombre total de pages disponibles.

Ces informations sont utilisées pour :

- afficher le compteur ;
- valider les numéros saisis ;
- construire correctement les liens de navigation.

---

### Navigation par URL

Lorsque l'utilisateur valide un numéro de page, le module :

- construit l'URL correspondante ;
- met à jour le paramètre de pagination ;
- redirige le navigateur vers la nouvelle page.

---

## Détails techniques

### Détection des pages

Le module analyse automatiquement la pagination AO3 afin de récupérer :

- la page actuelle ;
- le nombre maximal de pages.

---

### Navigation

Le changement de page est réalisé directement par modification de l'URL.

---

## Dépendances

Ce sous-module est initialisé par `_pageControls.js`.

Il fonctionne indépendamment des autres systèmes de navigation et constitue la base des déplacements directs entre les pages.


# worksPerPage.js

## Rôle

Permet de modifier le nombre de fics affichées sur une page de résultats AO3.

Le sous-module ajoute un sélecteur de densité, mémorise le choix de l'utilisateur et applique automatiquement ce réglage lors des visites suivantes.

---

## Fonctionnalités

### Sélecteur du nombre de fics

Le module ajoute un menu permettant de choisir le nombre d'œuvres affichées par page.

Les valeurs proposées sont :

- 20 œuvres
- 50 œuvres
- 100 œuvres

Le sélecteur peut être activé ou désactivé avec le réglage :

`worksPerPageEnabled`

---

### Mémorisation du choix

Le module conserve automatiquement le dernier nombre de fics sélectionné.

À chaque visite d'une page compatible :

- le réglage est relu ;
- la valeur est réappliquée automatiquement ;
- l'utilisateur retrouve toujours sa préférence.

---

### Mise à jour de la pagination

Lorsque le nombre de fics par page change, le module :

- recalcule la pagination ;
- met à jour les liens de navigation ;
- conserve autant que possible la position logique de l'utilisateur dans les résultats.

---

### Compatibilité avec AO3

Le module adapte la pagination sans modifier le contenu des œuvres.

Il travaille directement avec les paramètres de pagination utilisés par AO3 afin de conserver un comportement cohérent avec le site.

---

## Détails techniques

### Paramètres utilisateur

Le sous-module utilise principalement :

- `worksPerPageEnabled`
- `worksPerPage`

---

### Persistance

Le nombre de fics choisi est enregistré localement afin d'être restauré automatiquement lors des prochaines visites.

---

### Navigation

Le module met à jour les paramètres de pagination présents dans l'URL afin d'obtenir le nombre d'œuvres demandé.

---

## Dépendances

Ce sous-module est initialisé par `_pageControls.js`.

Il fonctionne indépendamment des autres systèmes de navigation mais partage leurs mécanismes de mise à jour des URLs.

---

# enhancedNavigation.js

## Rôle

Ajoute des contrôles de navigation supplémentaires afin de parcourir rapidement de longues listes de résultats.

Le module complète la pagination native d'AO3 en proposant des raccourcis vers la première page, la dernière page ainsi que des sauts rapides de dix pages.

---

## Fonctionnalités

### Navigation enrichie

Le module ajoute une nouvelle rangée de boutons de navigation.

Les boutons disponibles sont :

- **First**
- **−10**
- **Prev**
- **Next**
- **+10**
- **Last**

Ces contrôles viennent compléter la pagination native d'AO3.

---

### Navigation rapide

Les boutons **−10** et **+10** permettent de parcourir rapidement de longues listes.

Leur affichage est contrôlé par le réglage :

`showPlusMinus10Buttons`

Lorsque cette option est désactivée, seuls les autres boutons de navigation restent visibles.

---

### Première et dernière page

Le module ajoute également des raccourcis permettant d'accéder directement :

- à la première page ;
- à la dernière page disponible.

---

### Désactivation automatique

Les boutons deviennent automatiquement inactifs lorsqu'ils ne peuvent pas être utilisés.

Par exemple :

- **First**
- **Prev**
- **−10**

sont désactivés sur la première page.

Inversement :

- **Next**
- **+10**
- **Last**

sont désactivés sur la dernière page.

---

### Double insertion

Les contrôles de navigation sont ajoutés :

- au-dessus de la pagination AO3 ;
- au-dessous de la pagination AO3.

Ils restent donc accessibles sans avoir à revenir en haut ou descendre en bas de la page.

---

## Détails techniques

### Calcul des pages

Le module détermine automatiquement :

- la page actuelle ;
- la première page ;
- la dernière page ;
- les pages accessibles avec les sauts de dix pages.

---

### Génération des liens

Chaque bouton génère automatiquement l'URL correspondant à sa destination.

---

### Positionnement

Les contrôles sont injectés au-dessus et au-dessous de la pagination existante afin de conserver une expérience cohérente sur toutes les pages compatibles.

---

## Dépendances

Ce sous-module est initialisé par `_pageControls.js`.

Il complète les fonctionnalités offertes par `coreNavigation.js` mais reste entièrement indépendant de celui-ci.

---

# pageControls.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Page Controls**.

Il définit notamment l'apparence :

- du champ de navigation directe ;
- du sélecteur du nombre de fics par page ;
- des boutons de navigation enrichie ;
- des états actifs et désactivés des contrôles.


# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Navigation

### Défilement infini

Permettre de charger automatiquement les œuvres suivantes lorsque l'utilisateur atteint le bas de la page.

Le système remplacerait la pagination classique par un chargement continu des résultats.

Le réglage `infiniteScrollEnabled` existe déjà mais aucune logique ne l'utilise actuellement.

---

### Mémorisation de la position

Conserver la dernière page visitée afin de permettre à l'utilisateur de reprendre sa navigation plus tard.

Cette fonctionnalité pourrait notamment être utilisée :

- après une fermeture du navigateur ;
- lors d'un retour sur une recherche ;
- entre plusieurs sessions.

---

### Page aléatoire

Ajouter un bouton permettant d'ouvrir directement une page choisie aléatoirement parmi toutes les pages disponibles.

---

### Navigation par pourcentage

Permettre d'accéder directement à une position relative dans une liste.

Exemples :

- 25 %
- 50 %
- 75 %

Le module calculerait automatiquement le numéro de page correspondant.

---

### Sauts personnalisés

Ajouter des boutons permettant de sauter :

- ±50 pages ;
- ou tout autre intervalle choisi par l'utilisateur.

Les valeurs de saut pourraient devenir entièrement configurables.

---

### Réglages par type de page

Permettre d'utiliser des paramètres différents selon le contexte.

Exemples :

- recherches ;
- tags ;
- bookmarks ;
- historique ;
- collections.

Chaque type de page pourrait mémoriser son propre nombre de fics par page et ses propres préférences de navigation.

---

### Historique de navigation

Conserver les pages récemment visitées afin de pouvoir y revenir rapidement.

Le système pourrait également proposer des raccourcis vers les pages les plus consultées.

---

## Interface

### Position du champ de navigation

Permettre de choisir où afficher le champ de saisie du numéro de page.

Exemples :

- au-dessus de la pagination ;
- en dessous ;
- dans la barre de navigation enrichie.

---

### Barre de progression

Afficher une barre indiquant la position actuelle dans l'ensemble des résultats.

Cette barre représenterait visuellement la progression entre la première et la dernière page.

---

### Barre de navigation fixe

Permettre à la barre de navigation enrichie de rester visible en permanence pendant le défilement de la page.

---

### ~~Bouton "Retour en haut"~~ ✅ Fait

~~Ajouter un bouton permettant de revenir instantanément au début de la page.~~

> Ajouté (`backToTop.js`) : bouton flottant en bas à droite, apparaît après
> ~400px de défilement, remonte en douceur au clic. Réglage
> `showBackToTopButton` (activé par défaut) dans la section "Back to Top"
> du panneau.

---

### Ajustement automatique

Déterminer automatiquement le nombre idéal de fics à afficher selon :

- la taille de l'écran ;
- le type de page ;
- les préférences de navigation de l'utilisateur.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Navigation prédictive

Le module ne suggère pas automatiquement des pages "intéressantes" à visiter.

Cette fonctionnalité a été écartée car elle nécessiterait une analyse complexe des habitudes de navigation pour un bénéfice limité.

---

## Responsabilités du module

Le module est exclusivement responsable de la navigation entre les pages.

Il ne modifie pas :

- les œuvres affichées ;
- les filtres de recherche ;
- les systèmes de tri ;
- le contenu des résultats.

Ces responsabilités appartiennent à d'autres modules spécialisés.


# Résumé des responsabilités du module

Le module **Page Controls** est responsable de toutes les fonctionnalités liées à la navigation entre les pages de résultats d'AO3.

Ses responsabilités sont réparties entre les sous-modules suivants :

| Sous-module | Responsabilité principale |
|-------------|---------------------------|
| `_pageControls.js` | Initialise et coordonne l'ensemble du module. |
| `coreNavigation.js` | Permet d'accéder directement à une page précise à l'aide d'un champ de saisie. |
| `worksPerPage.js` | Gère le nombre de fics affichées par page et mémorise les préférences de l'utilisateur. |
| `enhancedNavigation.js` | Ajoute des contrôles de navigation avancés (First, Last, ±10, Previous, Next). |
| `pageControls.css` | Définit l'apparence de tous les éléments de navigation du module. |

---

# Interactions entre les sous-modules

Le coordinateur `_pageControls.js` initialise les différents sous-modules et veille à leur exécution uniquement sur les pages compatibles.

Les responsabilités sont volontairement séparées :

- **`coreNavigation.js`** est responsable de la navigation directe vers un numéro de page.
- **`worksPerPage.js`** gère uniquement la densité d'affichage des résultats et la mémorisation des préférences utilisateur.
- **`enhancedNavigation.js`** enrichit la pagination native d'AO3 avec des raccourcis supplémentaires.
- **`pageControls.css`** fournit les styles communs utilisés par tous les contrôles du module.

Chaque sous-module possède une responsabilité unique afin de limiter les dépendances et de faciliter la maintenance.

---

# Dépendances externes

Le module s'appuie principalement sur les mécanismes de pagination natifs d'AO3.

## APIs utilisées

- `localStorage`
- `URL`
- `URLSearchParams`

---

## Paramètres utilisateur

Le module utilise principalement les réglages suivants :

- `showPlusMinus10Buttons`
- `worksPerPageEnabled`
- `worksPerPage`
- `infiniteScrollEnabled`

---

# Limites connues

Le module présente actuellement plusieurs limitations de conception.

Notamment :

- le défilement infini n'est pas encore implémenté malgré la présence d'un réglage dédié ;
- le nombre de fics par page est limité aux valeurs proposées par le module ;
- les préférences de navigation sont globales et ne peuvent pas varier selon le type de page ;
- aucun historique de navigation ni mémorisation de la dernière page visitée n'est conservé ;
- les raccourcis de navigation utilisent uniquement des sauts fixes de dix pages.

Ces limitations pourront évoluer avec les futures versions du module.

