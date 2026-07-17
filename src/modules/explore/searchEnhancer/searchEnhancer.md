# searchEnhancer

**Tab:** Explore

## À quoi ça sert

Ce module regroupe plusieurs améliorations de la recherche et des listes
sur AO3 : des suggestions de tags liés, un historique de recherche avec
autocomplétion, un tri par taux d'engagement, et le regroupement des
séries dans les résultats.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `tagSuggestions` | activé | Affiche les suggestions de tags liés |
| `historyBasedSuggestions` | activé | Inclut des suggestions issues de l'historique de recherche |
| `suggestionWorkCount` | activé | Affiche le nombre de fics pour chaque suggestion |
| `searchHistory` | activé | Historique de recherche (25 recherches max) |
| `tagAutocomplete` | activé *(pas encore actif)* | Autocomplétion des tags officiels d'AO3 |
| `sortByKudosRatio` | activé | Active le tri par ratio kudos/vues |
| `sortBySaveRate` | activé | Active le tri par taux de sauvegarde |
| `showRatioInline` | activé | Affiche le ratio à côté des statistiques ("12% eng.") |
| `groupSeriesInResults` | désactivé | Regroupe les séries dans les résultats de recherche |
| `fandomSortMode` | `alpha` | Le tri par défaut des groupes : alphabétique, popularité, ou historique |

## Fichiers

### 1. `_searchEnhancer.js` — le chef d'orchestre

- Met en route les quatre autres fichiers de fonctionnalités et partage des outils communs entre eux

### 2. `relatedSearches.js` — suggestions de tags liés

- Sur une page de recherche ou de tag, propose jusqu'à 8 tags souvent utilisés avec ceux déjà choisis
- Propose aussi des suggestions basées sur l'historique de recherche
- Un clic sur une suggestion l'ajoute directement à la recherche

### 3. `searchAutocomplete.js` — historique et recherche rapide

- Garde en mémoire les 25 dernières recherches, et les propose dans un menu déroulant pendant qu'on tape
- Ajoute une icône 🔍 au survol d'un tag ou d'un nom d'auteur, pour lancer une recherche rapide en un clic

### 4. `resultsSorting.js` — tri par engagement

- Ajoute une barre pour trier les résultats : ordre normal, ratio kudos/vues, taux de sauvegarde, kudos, ou vues
- Affiche un petit badge "X% eng." à côté des statistiques de chaque fic
- Se souvient du dernier tri choisi pour chaque page

### 5. `seriesGrouping.js` — regroupement des séries

- Regroupe visuellement les fics d'une même série (si au moins 2 apparaissent sur la page) sous un en-tête commun
- Les groupes peuvent être triés par ordre alphabétique, par popularité, ou par ordre d'apparition

### 6. `searchEnhancer.css`

- Les styles visuels des panneaux, suggestions, menu déroulant et barre de tri

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Trier les résultats par kudos par chapitre
- Trier selon l'activité récente d'une fic
- Trier selon un score de ressemblance avec tes favoris
- Combiner plusieurs critères de tri en même temps (par exemple kudos + mises à jour récentes)
- Exporter son historique de recherche dans un fichier
- Sauvegarder des recherches sous un nom pour les relancer plus tard en un clic
- Des modèles de recherche tout prêts à réutiliser
- Des statistiques sur ses propres habitudes de recherche
- Des suggestions de tags propres à un fandom précis
- Des suggestions de combinaisons de tags qui vont bien ensemble
- Des conseils pour affiner sa recherche
- Tolérer les fautes de frappe dans l'historique de recherche
- Se connecter au vrai système d'autocomplétion des tags d'AO3 pendant qu'on tape — un réglage existe déjà pour ça, mais rien n'est branché derrière
- Des icônes selon le type de tag
- Un système de tags "tendance"
- Des graphiques en barres pour visualiser les fandoms
- Deviner la qualité d'une fic avec de l'intelligence artificielle
- Un bouton pour effacer complètement l'historique de recherche d'un coup
- Pouvoir chercher dans plusieurs fandoms en même temps
- Afficher les résultats de la recherche rapide dans une fenêtre superposée par-dessus la page, plutôt que de changer de page à chaque fois
- Trier vraiment les groupes de séries selon tes lectures passées — le tri "historique" actuel garde juste l'ordre où les séries apparaissent sur la page, il ne regarde pas ce que tu as vraiment lu

## Explicitement écarté

- Donner une couleur aux ratios de qualité — pour rester neutre

## Précision

⚠️ Une doc historique dit que les icônes de recherche rapide 🔍 (au survol
des tags/auteurs) ont été retirées à cause d'un conflit avec un autre
module. En réalité, elles sont bel et bien codées dans
`searchAutocomplete.js`.



AO3 Helper - Search Enhancer Module Coordinator
    Module ID: searchEnhancer
    Display Name: Search Enhancer
    Tab: Explore

    Submodules (parent/child registration pattern):
        searchEnhancer/relatedSearches    -- related tag suggestions panel
        searchEnhancer/searchAutocomplete -- history + autocomplete dropdown + quick search icons
        searchEnhancer/resultsSorting     -- kudos/hits ratio sorting + inline display
        searchEnhancer/seriesGrouping     -- groups series works together in listings

    Coordinator role:
        - Exposes W.AO3H_SearchEnhancer shared helpers (lsGet, lsSet, NS)
        - Injects shared CSS once

    Storage keys (owned by submodules):
        ao3h:se:history   -- owned by searchAutocomplete  [{ query, ts }], max 25, LIFO dedup
        ao3h:se:sort      -- owned by resultsSorting      last chosen sort mode per page path
        ao3h:se:sugcache  -- owned by relatedSearches     { [tagKey]: { tags, ts } } 7-day cache

    Pages: /works/search, /tags/{tag}/works and any listing with a search form



AO3 Helper - Related Searches Submodule
    Submodule ID: relatedSearches
    Display Name: Related Searches
    Source Module: Search Enhancer

    - Feature: Suggest related search refinements
      - Option: Analyze current search filters
      - Option: Show popular tag combinations
      - Option: Display as suggestion box

    - Feature: One-click query variations
      - Option: Add suggested tag to current search
      - Option: Filter out already-used tags
      - Option: Show up to 8 suggestions

    - Feature: Popular tag suggestions library
      - Option: Alternate Universe
      - Option: Slow Burn
      - Option: Happy Ending
      - Option: Angst, Fluff, Hurt/Comfort, etc.
      - Option: Helps discover search strategies you might not have thought of


AO3 Helper - Results Sorting Submodule
    Submodule ID: resultsSorting
    Display Name: Results Sorting
    Source Module: Search Enhancer

    - Feature: Quality ratio sorting
      - Option: Sort by kudos/hits ratio (engagement depth)
      - Option: Sort by bookmarks/kudos ratio (save rate / rereadability score)
      - Option: Display ratio value inline next to stats (e.g. "12% eng.")
      - Option: Toggle: "Show quality ratios" checkbox
      - Option: Works on: search results, tag pages, listing pages

    - Feature: Advanced sorting algorithms
      - Option: Sort by kudos/hits ratio
      - Option: Sort by bookmarks/kudos ratio
      - Option: Sort by raw kudos (high to low)
      - Option: Sort by raw hits (high to low)
      - Option: Restore default page order

    - Feature: Sort toolbar
      - Option: Sort dropdown selector
      - Option: Apply sort button
      - Option: Dynamic reordering of results
      - Option: Persists last chosen sort mode per page path


      AO3 Helper - Search Autocomplete Submodule
    Submodule ID: searchAutocomplete
    Display Name: Search Autocomplete
    Source Module: Search Enhancer

    - Feature: Search history tracking
      - Option: Record every search query
      - Option: Track timestamps
      - Option: Store up to 20 recent searches
      - Option: Save and recall previous searches
      - Option: Store search queries and filters
      - Option: Quick access to past search patterns

    - Feature: Autocomplete dropdown
      - Option: Show on search box focus
      - Option: Display 10 most recent searches
      - Option: One-click to re-run query

    - Feature: Search history management
      - Option: Remove duplicates automatically
      - Option: Clear history
      - Option: Persistent storage across sessions
      - Option: Perfect for complex multi-tag searches
      - Option: Search history management interface

    - Feature: Quick search icons on hover
      - Option: Quick search icon appears on hover over tags and author names
      - Option: Show icon on tags
      - Option: Show icon on author names
      - Option: Opacity transition on hover for smooth UX
      - Option: Open search in new tab (Ctrl+click behavior)

    - Feature: One-click tag exploration
      - Option: Click icon to instantly search for that tag or author
      - Option: One-click tag exploration without navigating away first
      - Option: Works on: tag pages, work blurbs, author bylines



AO3 Helper - Series Grouping Submodule
    Submodule ID: seriesGrouping
    Display Name: Series Grouping
    Source Module: Search Enhancer

    - Feature: Group series works in listings
      - Option: Visually group works belonging to the same series
      - Option: Shows a labeled wrapper around each series group
      - Option: Only groups when 2+ works from the same series are visible
      - Option: Ungrouped works are displayed after all groups

    - Feature: Persist grouping preference
      - Option: Remembers last group-series setting across sessions


═══════════════════════════════════════════════════════════════════════════
  # searchEnhancer
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Search Enhancer** regroupe plusieurs améliorations liées aux recherches et aux listes d’œuvres sur AO3.

Il permet notamment de :

* suggérer des tags liés à la recherche actuelle ;
* proposer des suggestions provenant de l’historique de recherche ;
* conserver les recherches récentes ;
* afficher un menu d’autocomplétion fondé sur cet historique ;
* lancer rapidement une recherche depuis un tag ou un nom d’auteur ;
* trier les résultats selon différents indicateurs d’engagement ;
* afficher les ratios directement dans les statistiques des œuvres ;
* regrouper visuellement les œuvres appartenant à une même série.

Le module fonctionne principalement sur :

* `/works/search` ;
* `/tags/{tag}/works` ;
* les pages de résultats contenant un formulaire de recherche ;
* les autres listings d’œuvres compatibles.

---

# Réglages utilisateur

| Réglage                   | Par défaut                  | Ce que ça fait                                                                         |
| ------------------------- | --------------------------- | -------------------------------------------------------------------------------------- |
| `tagSuggestions`          | Activé                      | Affiche les suggestions de tags liés.                                                  |
| `historyBasedSuggestions` | Activé                      | Inclut des suggestions provenant de l’historique de recherche.                         |
| `suggestionWorkCount`     | Activé                      | Affiche le nombre d’œuvres associé à chaque suggestion.                                |
| `searchHistory`           | Activé                      | Active l’historique de recherche, limité actuellement à 25 recherches.                 |
| `tagAutocomplete`         | Activé *(pas encore actif)* | Réservé à une future connexion avec le système officiel d’autocomplétion des tags AO3. |
| `sortByKudosRatio`        | Activé                      | Active le tri selon le ratio kudos/vues.                                               |
| `sortBySaveRate`          | Activé                      | Active le tri selon le ratio bookmarks/kudos.                                          |
| `showRatioInline`         | Activé                      | Affiche le ratio directement à côté des statistiques, par exemple `12% eng.`.          |
| `groupSeriesInResults`    | Désactivé                   | Regroupe les œuvres appartenant à une même série dans les résultats.                   |
| `fandomSortMode`          | `alpha`                     | Définit l’ordre des groupes : alphabétique, popularité ou ordre historique.            |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de quatre sous-modules fonctionnels et d’une feuille de style.

```text
_searchEnhancer.js
relatedSearches.js
searchAutocomplete.js
resultsSorting.js
seriesGrouping.js
searchEnhancer.css
```

---

# _searchEnhancer.js

## Rôle

Fichier coordinateur du module.

Il initialise les quatre sous-modules, partage des outils communs entre eux et injecte les styles nécessaires au fonctionnement du module.

---

## Responsabilités

* Enregistre le module sous l’identifiant `searchEnhancer`.
* Initialise les sous-modules selon un modèle d’enregistrement parent-enfant.
* Expose des fonctions communes de lecture et d’écriture dans `localStorage`.
* Partage l’espace de noms utilisé par le module.
* Injecte une seule fois les styles communs.
* Sert de point d’entrée unique pour le reste d’AO3 Helper.

---

## Fonctions exposées

Le coordinateur expose des outils communs sous :

`window.AO3H_SearchEnhancer`

Ces outils comprennent notamment :

* `lsGet` : lecture sécurisée depuis `localStorage` ;
* `lsSet` : écriture sécurisée dans `localStorage` ;
* `NS` : espace de noms partagé du module.

---

## Détails techniques

### Sous-modules enregistrés

Les sous-modules utilisent les identifiants suivants :

```text
searchEnhancer/relatedSearches
searchEnhancer/searchAutocomplete
searchEnhancer/resultsSorting
searchEnhancer/seriesGrouping
```

---

### Clés de stockage

Les sous-modules utilisent principalement les clés suivantes :

```text
ao3h:se:history
ao3h:se:sort
ao3h:se:sugcache
```

Leur contenu est réparti ainsi :

* `ao3h:se:history` : historique des recherches ;
* `ao3h:se:sort` : dernier mode de tri choisi pour chaque chemin de page ;
* `ao3h:se:sugcache` : cache des suggestions de tags liés.

---

# relatedSearches.js

## Rôle

Analyse la recherche actuelle afin de proposer des tags ou des variantes de recherche susceptibles d’être pertinents.

Il combine une bibliothèque de suggestions générales, les filtres actuellement utilisés et, lorsque l’option est activée, l’historique personnel de recherche.

---

## Fonctionnalités

### Suggestions de tags liés

Sur une page de recherche ou une page de tag, le module analyse les filtres actuels et affiche une boîte de suggestions.

Il peut proposer jusqu’à **8 suggestions**.

---

### Suggestions populaires

Le module possède une bibliothèque de tags fréquemment utilisés ensemble.

Elle peut notamment inclure :

* Alternate Universe ;
* Slow Burn ;
* Happy Ending ;
* Angst ;
* Fluff ;
* Hurt/Comfort ;
* d’autres tags populaires.

Ces suggestions peuvent aider l’utilisateur à découvrir des stratégies de recherche auxquelles il n’aurait pas pensé.

---

### Suggestions basées sur l’historique

Lorsque `historyBasedSuggestions` est activé, le module peut aussi utiliser les recherches précédentes pour proposer des tags déjà employés dans des contextes similaires.

---

### Nombre d’œuvres

Lorsque `suggestionWorkCount` est activé, chaque suggestion peut afficher le nombre d’œuvres correspondant.

---

### Ajout en un clic

Un clic sur une suggestion l’ajoute directement à la recherche actuelle.

Le module :

* conserve les filtres déjà présents ;
* ajoute le nouveau tag ;
* évite de proposer les tags déjà utilisés ;
* permet de relancer rapidement la recherche enrichie.

---

### Variantes de recherche

Le module peut suggérer différentes variations à partir des filtres déjà sélectionnés.

Cela permet d’explorer rapidement des recherches voisines sans devoir reconstruire manuellement toute la requête.

---

### Mise en cache

Les suggestions récupérées sont conservées pendant **7 jours**.

Le cache est enregistré sous :

`ao3h:se:sugcache`

Sa structure générale est :

```js
{
  [tagKey]: {
    tags: [],
    ts: 0
  }
}
```

---

## Détails techniques

### Analyse de la recherche

Le module examine les tags et les filtres présents dans la recherche courante.

---

### Filtrage des suggestions

Avant l’affichage, il retire :

* les tags déjà utilisés ;
* les doublons ;
* les suggestions non pertinentes pour la requête actuelle.

---

### Limite d’affichage

Un maximum de **8 suggestions** est affiché à la fois.

---

## Dépendances

Ce sous-module est initialisé par `_searchEnhancer.js`.

Il utilise les outils de stockage communs exposés par le coordinateur.

---

# searchAutocomplete.js

## Rôle

Gère l’historique des recherches, le menu de suggestions affiché pendant la saisie et les icônes permettant de lancer rapidement une recherche depuis un tag ou un nom d’auteur.

---

## Fonctionnalités

### Historique de recherche

Le module enregistre les recherches effectuées par l’utilisateur.

Chaque entrée contient notamment :

* la requête ;
* les filtres utilisés ;
* un horodatage.

L’historique est conservé entre les sessions.

---

### Taille de l’historique

La configuration actuelle prévoit un maximum de **25 recherches récentes**.

Une ancienne spécification technique mentionne une limite de **20 recherches**. La documentation utilisateur actuelle indique toutefois 25, qui constitue la valeur retenue ici.

---

### Gestion des doublons

Lorsqu’une recherche déjà présente est effectuée de nouveau :

* l’ancienne entrée est retirée ;
* la nouvelle entrée est replacée au début de l’historique ;
* aucun doublon n’est conservé.

Le système suit donc une logique LIFO avec déduplication.

---

### Menu d’autocomplétion

Lorsque l’utilisateur place le curseur dans le champ de recherche, le module affiche un menu déroulant.

Il peut présenter jusqu’à **10 recherches récentes**.

Un clic sur une entrée permet de relancer immédiatement la recherche correspondante.

---

### Recherche rapide

Le module ajoute une icône **🔍** au survol de certains éléments AO3.

L’icône peut apparaître sur :

* les tags ;
* les noms d’auteur ;
* les fiches d’œuvres ;
* les bylines d’auteur ;
* les pages de tags.

---

### Recherche en un clic

Un clic sur l’icône lance immédiatement une recherche pour le tag ou l’auteur correspondant.

Cela permet d’explorer un élément sans devoir d’abord le copier dans le formulaire de recherche.

---

### Ouverture dans un nouvel onglet

Le module peut respecter le comportement habituel du navigateur, notamment l’ouverture dans un nouvel onglet avec `Ctrl + clic`.

---

### Effet visuel

L’icône utilise une transition d’opacité afin d’apparaître progressivement au survol.

---

### Gestion de l’historique

Le module prend en charge :

* l’ajout des recherches ;
* la suppression automatique des doublons ;
* la conservation entre les sessions ;
* la consultation des recherches récentes ;
* une interface interne de gestion.

---

## Détails techniques

### Clé de stockage

L’historique est enregistré sous :

`ao3h:se:history`

Sa structure générale est :

```js
[
  {
    query: "",
    ts: 0
  }
]
```

---

### Limites d’affichage

* Historique total actuel : **25 recherches**.
* Suggestions affichées dans le menu : **10 recherches**.

---

### Icônes de recherche rapide

Certaines documentations historiques indiquaient que les icônes **🔍** avaient été retirées à cause d’un conflit avec un autre module.

Elles sont toutefois bien implémentées dans `searchAutocomplete.js`.

---

## Dépendances

Ce sous-module est initialisé par `_searchEnhancer.js`.

Il utilise les fonctions de stockage communes exposées par le coordinateur.

---

# resultsSorting.js

## Rôle

Ajoute de nouveaux modes de tri aux listes d’œuvres et affiche des indicateurs d’engagement calculés à partir des statistiques AO3.

---

## Fonctionnalités

### Barre de tri

Le module ajoute une barre de contrôle au-dessus des résultats.

Elle comprend notamment :

* un menu de sélection ;
* un bouton d’application du tri ;
* les différents modes disponibles.

---

### Modes de tri

L’utilisateur peut trier les œuvres selon :

* l’ordre normal de la page ;
* le ratio kudos/vues ;
* le ratio bookmarks/kudos ;
* le nombre brut de kudos ;
* le nombre brut de vues.

---

### Ratio kudos/vues

Le ratio kudos/vues estime la proportion de lecteurs ayant laissé un kudos.

Il peut être utilisé comme indicateur de profondeur d’engagement.

Le tri est activé par :

`sortByKudosRatio`

---

### Taux de sauvegarde

Le ratio bookmarks/kudos estime la proportion de lecteurs ayant sauvegardé l’œuvre après avoir laissé un kudos.

Il peut servir d’indicateur approximatif de sauvegarde ou de relecture.

Le tri est activé par :

`sortBySaveRate`

---

### Affichage dans les statistiques

Lorsque `showRatioInline` est activé, le module ajoute le ratio directement à côté des statistiques de l’œuvre.

Exemple :

```text
12% eng.
```

---

### Réorganisation dynamique

Le module réorganise directement les fiches présentes dans le DOM sans recharger la page.

---

### Restauration de l’ordre normal

L’utilisateur peut revenir à l’ordre initial fourni par AO3.

---

### Mémorisation du tri

Le dernier mode choisi est enregistré séparément pour chaque chemin de page.

Par exemple, une page de tag et une page de recherche peuvent conserver des tris différents.

---

## Détails techniques

### Clé de stockage

Le dernier mode de tri est enregistré sous :

`ao3h:se:sort`

---

### Portée

Le tri fonctionne notamment sur :

* les résultats de recherche ;
* les pages de tags ;
* les listings d’œuvres compatibles.

---

### Neutralité visuelle

Les ratios sont affichés sans code de couleur qualitatif.

Le module ne classe donc pas visuellement une valeur comme étant bonne ou mauvaise.

---

## Dépendances

Ce sous-module est initialisé par `_searchEnhancer.js`.

Il utilise les statistiques déjà présentes dans chaque fiche d’œuvre.

---

# seriesGrouping.js

## Rôle

Regroupe visuellement les œuvres appartenant à une même série lorsqu’au moins deux œuvres de cette série sont présentes sur la page.

---

## Fonctionnalités

### Détection des séries

Le module examine les fiches d’œuvres afin de déterminer celles qui appartiennent à la même série.

Un groupe est créé seulement lorsqu’au moins **deux œuvres** de la même série sont visibles.

---

### Regroupement visuel

Les œuvres appartenant à la même série sont déplacées dans un conteneur commun.

Chaque groupe comprend :

* un en-tête portant le nom de la série ;
* les œuvres associées ;
* une structure visuelle distincte des œuvres individuelles.

---

### Œuvres non groupées

Les œuvres qui :

* n’appartiennent à aucune série ;
* appartiennent à une série représentée par une seule œuvre ;

restent non groupées.

Elles sont affichées après les groupes de séries.

---

### Modes de tri

Les groupes peuvent être organisés selon :

* l’ordre alphabétique ;
* la popularité ;
* l’ordre historique.

Le mode est contrôlé par :

`fandomSortMode`

---

### Tri alphabétique

Le mode `alpha` classe les groupes selon leur nom.

---

### Tri par popularité

Le mode de popularité classe les groupes selon les données disponibles, par exemple le nombre d’œuvres ou leurs statistiques.

---

### Tri historique

Le mode historique actuel conserve l’ordre dans lequel les séries apparaissent sur la page.

Il ne tient pas réellement compte de l’historique personnel de lecture.

---

### Préférence persistante

Le module mémorise le dernier état du regroupement entre les sessions.

---

## Détails techniques

### Condition minimale

Un groupe est créé uniquement lorsque deux œuvres ou plus de la même série sont visibles.

---

### Réorganisation du DOM

Le module crée des conteneurs de séries, y déplace les œuvres correspondantes, puis place les œuvres non groupées à la suite.

---

## Dépendances

Ce sous-module est initialisé par `_searchEnhancer.js`.

Il utilise les informations de série déjà présentes dans les fiches d’œuvres AO3.

---

# searchEnhancer.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Search Enhancer**.

Il définit notamment l’apparence :

* des panneaux de suggestions ;
* des tags suggérés ;
* du menu d’autocomplétion ;
* des icônes de recherche rapide ;
* de la barre de tri ;
* des ratios affichés dans les statistiques ;
* des groupes de séries ;
* des en-têtes de séries ;
* des différents états interactifs.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents, mais ne disposent pas encore d’une implémentation complète.

---

## Nouveaux modes de tri

### Kudos par chapitre

Trier les œuvres selon le nombre moyen de kudos par chapitre.

---

### Activité récente

Classer les œuvres selon leur activité récente, par exemple :

* leur dernière mise à jour ;
* leur fréquence de publication ;
* leur reprise récente.

---

### Ressemblance avec les favoris

Calculer un score de similitude entre une œuvre et les favoris de l’utilisateur.

---

### Tri multicritère

Combiner plusieurs critères dans un même classement.

Exemple :

* nombre de kudos ;
* date de mise à jour ;
* taux de sauvegarde.

---

## Gestion avancée des recherches

### Export de l’historique

Exporter l’historique de recherche dans un fichier.

---

### Recherches sauvegardées

Enregistrer une recherche sous un nom afin de pouvoir la relancer plus tard en un clic.

---

### Modèles de recherche

Créer des modèles de recherche réutilisables contenant des filtres prédéfinis.

---

### Statistiques personnelles

Afficher des statistiques sur les habitudes de recherche de l’utilisateur.

---

### Effacement complet

Ajouter un bouton permettant d’effacer tout l’historique de recherche en une seule opération.

---

### Tolérance aux fautes

Reconnaître les recherches proches même lorsqu’elles contiennent des fautes de frappe.

---

### Recherche multifandom

Permettre de rechercher simultanément dans plusieurs fandoms à partir d’une interface simplifiée.

---

## Suggestions avancées

### Suggestions par fandom

Adapter les tags proposés au fandom actuellement recherché.

---

### Combinaisons de tags

Suggérer des groupes de tags souvent utilisés ensemble.

---

### Conseils de recherche

Afficher des conseils permettant d’affiner ou d’élargir une recherche.

---

### Tags tendance

Repérer et afficher les tags récemment populaires.

---

### Icônes de types de tags

Afficher une icône différente selon la catégorie du tag :

* fandom ;
* relation ;
* personnage ;
* tag additionnel.

---

## Autocomplétion AO3

Connecter le champ de recherche au véritable système d’autocomplétion des tags officiels d’AO3.

Le réglage `tagAutocomplete` existe déjà, mais aucun comportement n’est actuellement branché derrière lui.

---

## Visualisation des fandoms

Afficher des graphiques en barres représentant les fandoms ou les résultats de recherche.

---

## Analyse par intelligence artificielle

Tenter d’estimer la qualité d’une œuvre à l’aide d’un système d’intelligence artificielle.

---

## Recherche rapide superposée

Afficher les résultats d’une recherche rapide dans une fenêtre superposée au-dessus de la page actuelle, plutôt que de naviguer vers une nouvelle page.

---

## Véritable tri historique des séries

Trier les groupes de séries selon l’historique réel de lecture de l’utilisateur.

Le mode historique actuel conserve seulement l’ordre d’apparition des séries sur la page.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Couleurs des ratios

Les ratios d’engagement ne reçoivent pas de couleur indiquant qu’une valeur est bonne, moyenne ou mauvaise.

Cette décision permet :

* de rester neutre ;
* de ne pas présenter un indicateur approximatif comme une mesure objective de qualité ;
* de laisser l’utilisateur interpréter lui-même les statistiques.

---

## Suggestions limitées

Le panneau affiche au maximum **8 suggestions** afin de rester compact et de ne pas surcharger la page.

---

## Tri local des résultats

Le module réorganise uniquement les œuvres déjà chargées sur la page.

Il ne modifie pas la recherche sur les serveurs d’AO3 et ne peut donc pas trier les œuvres absentes de la page courante.

---

## Regroupement conditionnel des séries

Une série n’est regroupée que lorsqu’au moins deux de ses œuvres sont présentes.

Une œuvre seule reste dans la liste normale afin d’éviter la création de groupes inutiles.

---

## Icônes de recherche rapide

Même si une ancienne documentation indiquait leur suppression, les icônes **🔍** font actuellement partie de `searchAutocomplete.js`.
