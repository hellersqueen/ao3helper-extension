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
| `searchTemplates` | activé | Modèles de recherche rapide (kudos, mis à jour, terminé, plus long) |
| `searchInsights` | activé | Statistiques personnelles de recherche (termes, tendance, fandoms) |
| `refinementTips` | activé | Astuce d'affinage quand une recherche renvoie 0 ou beaucoup de résultats |
| `searchHistory` | activé | Historique de recherche (25 recherches max) |
| `historyTypoTolerance` | activé | Tolère une faute de frappe dans la recherche de l'historique |
| `tagAutocomplete` | activé | Fusionne les suggestions officielles `/autocomplete/tag` d'AO3 dans le menu déroulant |
| `sortByKudosRatio` | activé | Active le tri par ratio kudos/vues |
| `sortBySaveRate` | activé | Active le tri par taux de sauvegarde |
| `sortByKudosPerChapter` | activé | Active le tri par kudos par chapitre |
| `sortByRecentActivity` | activé | Active le tri par activité récente (date de mise à jour) |
| `sortByBalanced` | activé | Active le tri équilibré (ratio kudos + récence) |
| `showRatioInline` | activé | Affiche le ratio à côté des statistiques ("12% eng.") |
| `groupSeriesInResults` | désactivé | Regroupe les séries dans les résultats de recherche |
| `fandomSortMode` | `alpha` | Le tri par défaut des groupes : alphabétique, popularité, ou historique (désormais un vrai tri par lectures passées) |

## Fichiers

### 1. `_searchEnhancer.js` — le chef d'orchestre

- Met en route les quatre autres fichiers de fonctionnalités et partage des outils communs entre eux

### 2. `relatedSearches.js` — suggestions de tags liés

- Sur une page de recherche ou de tag, propose jusqu'à 8 tags souvent utilisés avec ceux déjà choisis
- Propose aussi des suggestions basées sur l'historique de recherche
- Un clic sur une suggestion l'ajoute directement à la recherche
- Modèles de recherche rapide en un clic (kudos, mis à jour, terminé, plus long)
- Panneau "Vos statistiques de recherche" (termes les plus recherchés, tendance personnelle, fandoms les plus recherchés) — dérivé uniquement de l'historique local, sans réseau
- Astuce d'affinage selon le nombre de résultats trouvés

### 3. `searchAutocomplete.js` — historique et recherche rapide

- Garde en mémoire les 25 dernières recherches, et les propose dans un menu déroulant pendant qu'on tape
- Tolère une faute de frappe dans la recherche de l'historique (repli seulement si aucune correspondance exacte)
- Fusionne les suggestions officielles `/autocomplete/tag` d'AO3 dans ce même menu, avec une icône selon le type de tag
- Ajoute une icône 🔍 au survol d'un tag ou d'un nom d'auteur, pour lancer une recherche rapide en un clic

### 4. `resultsSorting.js` — tri par engagement

- Ajoute une barre pour trier les résultats : ordre normal, ratio kudos/vues, taux de sauvegarde, kudos, vues, kudos par chapitre, activité récente, ou équilibré
- Affiche un petit badge "X% eng." à côté des statistiques de chaque fic
- Se souvient du dernier tri choisi pour chaque page

### 5. `seriesGrouping.js` — regroupement des séries

- Regroupe visuellement les fics d'une même série (si au moins 2 apparaissent sur la page) sous un en-tête commun
- Les groupes peuvent être triés par ordre alphabétique, par popularité, ou par un vrai historique de lecture (via `readingTracker`)

### 6. `resultsSortingHelpers.js` / `seriesGroupingHelpers.js` / `searchHistoryHelpers.js` — logique pure

- Calcul des scores de tri, tri des groupes de séries par historique de lecture, et toute la logique dérivée de l'historique de recherche (recherche tolérante aux fautes, statistiques, modèles, astuces) — testés indépendamment du DOM

### 7. `searchEnhancer.css`

- Les styles visuels des panneaux, suggestions, menu déroulant, barre de tri, modèles, statistiques et barres de fandoms

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Trier les résultats par kudos par chapitre~~ ✅ Fait — mode de tri `kudos_per_chapter` dans `resultsSorting.js`, réglage `sortByKudosPerChapter`
- ~~Trier selon l'activité récente d'une fic~~ ✅ Fait — mode de tri `recent` (basé sur la date de mise à jour déjà affichée sur le blurb), réglage `sortByRecentActivity`
- ~~Trier selon un score de ressemblance avec tes favoris~~ ❌ Écarté — ça reviendrait à un vrai moteur de recommandation par similarité, déjà explicitement écarté ailleurs dans le projet (`docs/never-built-modules.md` › "Recommendation Engine")
- ~~Combiner plusieurs critères de tri en même temps (par exemple kudos + mises à jour récentes)~~ ✅ Fait — mode de tri `balanced` (ratio kudos pondéré + récence), réglage `sortByBalanced`
- ~~Exporter son historique de recherche dans un fichier~~ ✅ Fait — bouton "Export history (JSON)" dans le panneau de réglages
- ~~Sauvegarder des recherches sous un nom pour les relancer plus tard en un clic~~ ✅ Fait (déjà couvert ailleurs) — c'est exactement ce que fait `filterManager`/`presetManagement.js` (les presets capturent tous les champs du formulaire, y compris les mots-clés, et se relancent en un clic) ; l'historique de *ce* module reste un journal automatique des recherches passées, pas des presets nommés
- ~~Des modèles de recherche tout prêts à réutiliser~~ ✅ Fait — section "⚡ Quick templates" du panneau de suggestions (les vrais presets personnalisés restent le rôle de `filterManager`, voir ci-dessus)
- ~~Des statistiques sur ses propres habitudes de recherche~~ ✅ Fait — section "📊 Your search insights" (termes les plus recherchés)
- ~~Des suggestions de tags propres à un fandom précis~~ ❌ Écarté — nécessiterait de connaître les tags populaires *au sein* d'un fandom donné, ce qui suppose de crawler de nombreuses œuvres de ce fandom ; coût réseau jugé excessif
- ~~Des suggestions de combinaisons de tags qui vont bien ensemble~~ ✅ Fait (déjà le cas) — c'est exactement ce que fait la bibliothèque `CO_TAGS` de `relatedSearches.js` (ex: Slow Burn → Mutual Pining, Enemies to Lovers…), déjà affichée sous "🏷 You might also like"
- ~~Des conseils pour affiner sa recherche~~ ✅ Fait — astuce d'affinage basée sur le nombre de résultats, réglage `refinementTips`
- ~~Tolérer les fautes de frappe dans l'historique de recherche~~ ✅ Fait — réglage `historyTypoTolerance`, repli sur une distance d'édition de 1 quand aucune correspondance exacte n'est trouvée
- ~~Se connecter au vrai système d'autocomplétion des tags d'AO3 pendant qu'on tape — un réglage existe déjà pour ça, mais rien n'est branché derrière~~ ✅ Fait — le champ de recherche libre interroge désormais `/autocomplete/tag?term=` (même origine) et fusionne les résultats avec l'historique local
- ~~Des icônes selon le type de tag~~ ✅ Fait — icône selon la catégorie renvoyée par AO3 (🌐 fandom, 👤 personnage, 💞 relation, # tag additionnel, 🏷 par défaut)
- ~~Un système de tags "tendance"~~ ✅ Fait (recentré) — "tendance" au sens site-entier nécessiterait de crawler AO3 (coût réseau excessif) ; recentré sur une tendance *personnelle* dérivée de l'historique local (termes recherchés plus souvent récemment que par le passé), dans le panneau "📊 Your search insights"
- ~~Des graphiques en barres pour visualiser les fandoms~~ ✅ Fait — barres proportionnelles aux fandoms les plus recherchés localement, même panneau
- ~~Deviner la qualité d'une fic avec de l'intelligence artificielle~~ ❌ Écarté — même principe de neutralité que la décision déjà prise dans ce module de ne pas colorer les ratios d'engagement ("pour rester neutre") : un score de qualité automatique serait présenté comme une mesure objective qu'il n'est pas
- ~~Un bouton pour effacer complètement l'historique de recherche d'un coup~~ ✅ Fait (déjà le cas) — l'action "Clear history" existe déjà en bas du menu déroulant d'autocomplétion (`searchAutocomplete.js`), simplement absente de cette liste
- ~~Pouvoir chercher dans plusieurs fandoms en même temps~~ ❌ Écarté — AO3 le permet déjà nativement : le champ Fandoms du formulaire de recherche avancée (`work_search[fandom_names]`) accepte plusieurs noms séparés par des virgules
- ~~Afficher les résultats de la recherche rapide dans une fenêtre superposée par-dessus la page, plutôt que de changer de page à chaque fois~~ ❌ Écarté — reproduire une page de résultats AO3 complète (avec pagination, tri, filtres) dans une fenêtre superposée dupliquerait une grande partie de l'interface native d'AO3 côté client ; complexité et fragilité jugées excessives par rapport à l'ouverture dans un nouvel onglet déjà possible (Ctrl+clic)
- ~~Trier vraiment les groupes de séries selon tes lectures passées — le tri "historique" actuel garde juste l'ordre où les séries apparaissent sur la page, il ne regarde pas ce que tu as vraiment lu~~ ✅ Fait — le mode `history` compare désormais les œuvres de chaque groupe à `ao3h:rt:history` (readingTracker) et trie par nombre réel d'œuvres déjà visitées

## Explicitement écarté

- Donner une couleur aux ratios de qualité — pour rester neutre
- Trier selon un score de ressemblance avec les favoris — reviendrait à un moteur de recommandation par similarité, déjà écarté ailleurs dans le projet
- Suggestions de tags propres à un fandom précis — nécessiterait de crawler de nombreuses œuvres du fandom, coût réseau excessif
- Deviner la qualité d'une fic avec de l'IA — même principe de neutralité que pour les ratios de qualité
- Chercher dans plusieurs fandoms en même temps — AO3 le permet déjà nativement (champ Fandoms multi-valeurs)
- Recherche rapide en fenêtre superposée — dupliquerait une grande partie de l'interface de résultats native d'AO3, trop complexe et fragile pour le bénéfice

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
        ao3h:se:history   -- owned by searchAutocomplete  [{ query, ts, fandom }], max 25, LIFO dedup
        ao3h:se:sort      -- owned by resultsSorting      last chosen sort mode per page path
        ao3h:se:sugcache  -- owned by relatedSearches     { [tagKey]: { tags, ts } } 7-day cache

    Pure-logic helpers (no DOM, no storage):
        resultsSortingHelpers.js -- scoreForMode() for all sort modes incl.
                                     kudos_per_chapter, recent, balanced
        seriesGroupingHelpers.js -- sortGroupsByReadHistory() cross-references
                                     each series group's work IDs against
                                     ao3h:rt:history (readingTracker)
        searchHistoryHelpers.js  -- fuzzyFilterHistory(), topSearches(),
                                     trendingSearches(), fandomBarData(),
                                     buildRefinementTip(), QUICK_TEMPLATES —
                                     everything derived from local history,
                                     no network calls

    Pages: /works/search, /tags/{tag}/works and any listing with a search form

    Note (Chantier 4): seriesGrouping's own isListingPage() only matches bare
    /works or /tags/*/works, NOT /works/search — a pre-existing gap (not one
    of this pass's 21 items) meaning series grouping silently never runs on
    the most common search-results URL. Left as-is; flag if revisited.



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
      - Note: this CO_TAGS library already *is* "tag combinations that go
        well together" — no separate feature needed (Chantier 4)

    - Feature: Quick search templates (Chantier 4)
      - Option: "⚡ Quick templates" section, cfg: searchTemplates
      - Option: Built-in chips (Most kudos, Recently updated, Complete only,
        Longest first) that tweak the current URL's sort/filter params
      - Option: Plain navigation links — no full filter-form capture (that
        remains filterManager/presetManagement's job)

    - Feature: Search insights (Chantier 4)
      - Option: "📊 Your search insights" section, cfg: searchInsights
      - Option: Top searched terms, personal trending terms, fandom bar
        chart — all derived from the local ao3h:se:history log only
      - Option: Shown only once history has 3+ entries

    - Feature: Refinement tip (Chantier 4)
      - Option: cfg: refinementTips
      - Option: Rule-based one-liner when a real search returns 0 or a full
        page (20+) of results


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
      - Option (Chantier 4): Sort by kudos per chapter — cfg: sortByKudosPerChapter
      - Option (Chantier 4): Sort by recent activity (blurb's update date) —
        cfg: sortByRecentActivity
      - Option (Chantier 4): Sort by balanced score (kudos ratio × 60% +
        recency × 40%, ~14-day half-life) — cfg: sortByBalanced
      - Note: scoring logic lives in resultsSortingHelpers.js (pure,
        scoreForMode())

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
      - Option: Clear history — "Clear history" action at the bottom of the
        dropdown (already existed; was just missing from the spec list)
      - Option: Persistent storage across sessions
      - Option: Perfect for complex multi-tag searches
      - Option: Search history management interface
      - Option (Chantier 4): Export history to JSON — button in the panel,
        wired via searchEnhancer-config.js's wireConfigArea()
      - Option (Chantier 4): Typo-tolerant search — cfg: historyTypoTolerance,
        falls back to Levenshtein distance ≤1 only when no exact substring
        match exists (searchHistoryHelpers.fuzzyFilterHistory)

    - Feature: Real AO3 tag autocomplete (Chantier 4)
      - Option: cfg: tagAutocomplete (setting already existed, now wired)
      - Option: The free-text query field's dropdown merges local history
        with AO3's own /autocomplete/tag?term= suggestions (same-origin
        fetch, silently no-ops offline) — this field has no native AO3
        autocomplete of its own, unlike the dedicated fandom/character/
        relationship/freeform fields
      - Option: Icon per tag category returned by AO3 (🌐 fandom, 👤
        character, 💞 relationship, # freeform, 🏷 fallback)
      - Option: Captures the searched fandom (from the fandom field or a
        /tags/{fandom}/works URL) alongside each history entry, feeding the
        fandom bar chart in relatedSearches' insights panel

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

    - Feature: Real reading-history sort mode (Chantier 4)
      - Option: fandomSortMode: 'history' now cross-references each group's
        work IDs against ao3h:rt:history (readingTracker) instead of just
        keeping page order — series with more actually-visited works sort
        first (seriesGroupingHelpers.sortGroupsByReadHistory)
      - Option: Soft dependency — with readingTracker disabled or no
        history, falls back to the previous insertion-order behavior


═══════════════════════════════════════════════════════════════════════════
  # searchEnhancer
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Search Enhancer** regroupe plusieurs améliorations liées aux recherches et aux listes d’œuvres sur AO3.

* Il permet notamment de :
  - suggérer des tags liés à la recherche actuelle ;
  - proposer des suggestions provenant de l’historique de recherche ;
  - conserver les recherches récentes ;
  - afficher un menu d’autocomplétion fondé sur cet historique ;
  - lancer rapidement une recherche depuis un tag ou un nom d’auteur ;
  - trier les résultats selon différents indicateurs d’engagement ;
  - afficher les ratios directement dans les statistiques des œuvres ;
  - regrouper visuellement les œuvres appartenant à une même série.

* Le module fonctionne principalement sur :
  - `/works/search` ;
  - `/tags/{tag}/works` ;
  - les pages de résultats contenant un formulaire de recherche ;
  - les autres listings d’œuvres compatibles.

---

# Réglages utilisateur

| Réglage                   | Ce que ça fait                                                                         |
|---------------------------|----------------------------------------------------------------------------------------|
| `tagSuggestions`          | Affiche les suggestions de tags liés.                                                  |
| `historyBasedSuggestions` | Inclut des suggestions provenant de l’historique de recherche.                         |
| `suggestionWorkCount`     | Affiche le nombre d’œuvres associé à chaque suggestion.                                |
| `searchTemplates`         | Modèles de recherche rapide en un clic (kudos, mise à jour, terminé, longueur).        |
| `searchInsights`          | Statistiques personnelles de recherche dérivées de l’historique local.                 |
| `refinementTips`          | Astuce d’affinage selon le nombre de résultats trouvés.                                |
| `searchHistory`           | Active l’historique de recherche, limité actuellement à 25 recherches.                 |
| `historyTypoTolerance`    | Tolère une faute de frappe dans la recherche de l’historique.                          |
| `tagAutocomplete`         | Fusionne les suggestions officielles `/autocomplete/tag` d’AO3 dans le menu déroulant. |
| `sortByKudosRatio`        | Active le tri selon le ratio kudos/vues.                                               |
| `sortBySaveRate`          | Active le tri selon le ratio bookmarks/kudos.                                          |
| `sortByKudosPerChapter`   | Active le tri selon le nombre de kudos par chapitre.                                   |
| `sortByRecentActivity`    | Active le tri selon la date de mise à jour la plus récente.                            |
| `sortByBalanced`          | Active le tri équilibré (ratio kudos pondéré + récence).                               |
| `showRatioInline`         | Affiche le ratio directement à côté des statistiques, par exemple `12% eng.`.          |
| `groupSeriesInResults`    | Regroupe les œuvres appartenant à une même série dans les résultats.                   |
| `fandomSortMode`          | Définit l’ordre des groupes : alphabétique, popularité ou véritable historique de lecture. |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de quatre sous-modules fonctionnels, de trois fichiers de logique pure et d’une feuille de style.

```text
_searchEnhancer.js
relatedSearches.js
searchAutocomplete.js
resultsSorting.js
seriesGrouping.js
resultsSortingHelpers.js
seriesGroupingHelpers.js
searchHistoryHelpers.js
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

### Modèles de recherche rapide

Lorsque `searchTemplates` est activé, une section "⚡ Quick templates" propose des liens prêts à l'emploi qui modifient uniquement le tri ou un filtre simple de la recherche actuelle, sans toucher aux autres paramètres :

* 🔥 Most kudos ;
* 🆕 Recently updated ;
* ✅ Complete only ;
* 📏 Longest first.

Ce sont de vrais liens de navigation (pas des presets personnalisés) — la gestion complète de presets de filtres reste le rôle du module `filterManager`.

---

### Vos statistiques de recherche

Lorsque `searchInsights` est activé et que l'historique contient au moins 3 entrées, une section "📊 Your search insights" affiche :

* les termes les plus recherchés (répétés au moins deux fois) ;
* une tendance personnelle : les termes recherchés plus souvent récemment que par le passé ;
* les fandoms les plus recherchés, sous forme de petites barres proportionnelles.

Tout est calculé localement à partir de `ao3h:se:history` — aucune requête réseau n'est effectuée pour cette fonctionnalité.

---

### Astuce d'affinage

Lorsque `refinementTips` est activé et qu'une recherche a réellement été lancée (paramètres de recherche présents, ou page `/tags/{fandom}/works`), le module affiche une courte astuce selon le nombre de résultats :

* aucun résultat → suggestion de retirer un tag ou un filtre ;
* une page pleine de résultats (20 ou plus) → suggestion d'ajouter un tag ou un filtre.

Un formulaire de recherche vide n'affiche jamais cette astuce.

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

### Tolérance aux fautes de frappe

Lorsque `historyTypoTolerance` est activé, une recherche dans l'historique qui ne trouve aucune correspondance exacte par sous-chaîne retombe sur une comparaison approximative (distance de Levenshtein ≤ 1), au niveau de la requête entière ou de chacun de ses mots.

---

### Suggestions officielles AO3

Le champ de recherche libre n'a pas d'autocomplétion native contrairement aux champs dédiés (Fandoms, Personnages, Relations, Tags additionnels). Le module comble cet écart : lorsque `tagAutocomplete` est activé et que le texte saisi contient au moins 2 caractères, une requête `/autocomplete/tag?term=...` (même origine) est envoyée et ses résultats sont fusionnés avec les suggestions de l'historique dans le même menu.

Chaque suggestion AO3 affiche une icône selon la catégorie renvoyée : 🌐 fandom, 👤 personnage, 💞 relation, `#` tag additionnel, 🏷 par défaut. Une erreur réseau ou une réponse inattendue est ignorée silencieusement (aucune suggestion AO3 affichée, l'historique local continue de fonctionner).

---

### Fandom capturé pour les statistiques

À chaque recherche validée, le module tente aussi d'enregistrer le fandom associé (depuis le champ Fandoms du formulaire, ou depuis l'URL `/tags/{fandom}/works`) dans l'entrée d'historique correspondante. Cette information alimente le graphique en barres des fandoms du panneau "📊 Your search insights" de `relatedSearches.js`.

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
* une interface interne de gestion ;
* un bouton "Clear history" dans le menu déroulant (existait déjà, simplement absent de la liste des specs) ;
* un bouton "Export history (JSON)" dans le panneau de réglages.

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
    ts: 0,
    fandom: null // optionnel, ajouté au Chantier 4
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
* le nombre brut de vues ;
* le nombre de kudos par chapitre (Chantier 4) ;
* l’activité récente, càd la date de mise à jour du blurb (Chantier 4) ;
* un score équilibré combinant ratio kudos et récence (Chantier 4).

La logique de calcul de chaque score vit dans `resultsSortingHelpers.js` (`scoreForMode()`), pure et testée indépendamment du DOM.

---

### Kudos par chapitre

Divise le nombre de kudos par le nombre de chapitres publiés (`dd.chapters`), pour comparer équitablement une fic complète très longue et un one-shot.

Le tri est activé par :

`sortByKudosPerChapter`

---

### Activité récente

Lit la date de mise à jour déjà affichée sur chaque blurb (`abbr.datetime[title]`, le même élément que `readingTracker`/`seenTracking.js` utilise pour son badge "Updated") et trie du plus récent au plus ancien.

Le tri est activé par :

`sortByRecentActivity`

---

### Tri équilibré

Combine le ratio kudos/vues (60 % du score) et un score de récence à décroissance exponentielle sur ~14 jours (40 % du score), pour éviter qu'une fic très appréciée mais ancienne, ou une fic toute fraîche mais encore peu lue, ne domine seule le classement.

Le tri est activé par :

`sortByBalanced`

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

**Depuis le Chantier 4, ce mode utilise un véritable historique de lecture.** Pour chaque groupe, le module compte combien de ses œuvres apparaissent dans `ao3h:rt:history` (l'historique de visites de `readingTracker`), puis trie les groupes du plus lu au moins lu (`seriesGroupingHelpers.sortGroupsByReadHistory`, tri stable en cas d'égalité).

C'est une dépendance souple : si `readingTracker` est désactivé ou qu'aucune œuvre n'a encore été visitée, le tri retombe simplement sur l'ordre d'apparition des séries sur la page (comportement précédent).

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

Il utilise les informations de série déjà présentes dans les fiches d’œuvres AO3, ainsi que `seriesGroupingHelpers.js` et — pour le mode `history` — l'historique de visites de `readingTracker` (`ao3h:rt:history`).

---

# searchEnhancer.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Search Enhancer**.

Il définit notamment l’apparence :

* des panneaux de suggestions ;
* des tags suggérés ;
* du menu d’autocomplétion (y compris les suggestions AO3 fusionnées) ;
* des icônes de recherche rapide ;
* de la barre de tri ;
* des ratios affichés dans les statistiques ;
* des groupes de séries ;
* des en-têtes de séries ;
* des modèles de recherche rapide, de l'astuce d'affinage et du panneau de statistiques personnelles (barres de fandoms incluses) ;
* des différents états interactifs.

---

# resultsSortingHelpers.js / seriesGroupingHelpers.js / searchHistoryHelpers.js

## Rôle

Trois fichiers de logique pure, sans DOM ni accès direct au stockage, ajoutés au Chantier 4 pour rendre testable tout ce qui n'a pas besoin du navigateur :

* `resultsSortingHelpers.js` : `scoreForMode()` calcule le score de tri pour chaque mode (y compris les trois nouveaux) ; `recencyScore()` calcule la décroissance de récence.
* `seriesGroupingHelpers.js` : `withReadCounts()` et `sortGroupsByReadHistory()` croisent les groupes de séries avec l'historique de lecture réel.
* `searchHistoryHelpers.js` : `fuzzyFilterHistory()`, `topSearches()`, `trendingSearches()`, `fandomBarData()`, `extractFandomFromContext()`, `buildRefinementTip()`, `QUICK_TEMPLATES`/`buildTemplateUrl()` — toute la logique dérivée de l'historique de recherche local.

## Dépendances

Utilisés par `resultsSorting.js`, `seriesGrouping.js`, `relatedSearches.js` et `searchAutocomplete.js` respectivement. Aucun de ces fichiers n'a de dépendance vers un autre sous-module.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents, mais ne disposent pas encore d’une implémentation complète.

---

## Nouveaux modes de tri

### Kudos par chapitre

Trier les œuvres selon le nombre moyen de kudos par chapitre.

**✅ Fait** — mode `kudos_per_chapter`, réglage `sortByKudosPerChapter`.

---

### Activité récente

Classer les œuvres selon leur activité récente, par exemple :

* leur dernière mise à jour ;
* leur fréquence de publication ;
* leur reprise récente.

**✅ Fait (partiel)** — mode `recent` trié sur la date de mise à jour déjà affichée sur le blurb. Fréquence de publication et "reprise récente" nécessiteraient un historique de publications par œuvre non disponible sur une page de listing ; non couverts.

---

### Ressemblance avec les favoris

Calculer un score de similitude entre une œuvre et les favoris de l’utilisateur.

**❌ Écarté** — équivaut à un moteur de recommandation par similarité, déjà explicitement écarté dans `docs/never-built-modules.md` ("Recommendation Engine").

---

### Tri multicritère

Combiner plusieurs critères dans un même classement.

Exemple :

* nombre de kudos ;
* date de mise à jour ;
* taux de sauvegarde.

**✅ Fait** — mode `balanced` (ratio kudos × 60 % + récence × 40 %), réglage `sortByBalanced`.

---

## Gestion avancée des recherches

### Export de l’historique

Exporter l’historique de recherche dans un fichier.

**✅ Fait** — bouton "Export history (JSON)" dans le panneau de réglages.

---

### Recherches sauvegardées

Enregistrer une recherche sous un nom afin de pouvoir la relancer plus tard en un clic.

**✅ Fait (déjà couvert ailleurs)** — c'est le rôle de `filterManager`/`presetManagement.js`, qui capture déjà tous les champs du formulaire (y compris les mots-clés) sous un nom réutilisable en un clic.

---

### Modèles de recherche

Créer des modèles de recherche réutilisables contenant des filtres prédéfinis.

**✅ Fait** — section "⚡ Quick templates" (modèles intégrés, pas personnalisables — la gestion de presets personnalisés reste le rôle de `filterManager`).

---

### Statistiques personnelles

Afficher des statistiques sur les habitudes de recherche de l’utilisateur.

**✅ Fait** — section "📊 Your search insights" (termes les plus recherchés).

---

### Effacement complet

Ajouter un bouton permettant d’effacer tout l’historique de recherche en une seule opération.

**✅ Fait (déjà le cas)** — action "Clear history" déjà présente en bas du menu déroulant d'autocomplétion.

---

### Tolérance aux fautes

Reconnaître les recherches proches même lorsqu’elles contiennent des fautes de frappe.

**✅ Fait** — réglage `historyTypoTolerance`, distance de Levenshtein ≤ 1 en repli.

---

### Recherche multifandom

Permettre de rechercher simultanément dans plusieurs fandoms à partir d’une interface simplifiée.

**❌ Écarté** — AO3 le permet déjà nativement : le champ Fandoms (`work_search[fandom_names]`) de la recherche avancée accepte plusieurs noms séparés par des virgules.

---

## Suggestions avancées

### Suggestions par fandom

Adapter les tags proposés au fandom actuellement recherché.

**❌ Écarté** — nécessiterait de connaître les tags populaires au sein d'un fandom précis, ce qui suppose de crawler de nombreuses œuvres ; coût réseau jugé excessif.

---

### Combinaisons de tags

Suggérer des groupes de tags souvent utilisés ensemble.

**✅ Fait (déjà le cas)** — c'est exactement le rôle de la bibliothèque `CO_TAGS` déjà affichée sous "🏷 You might also like".

---

### Conseils de recherche

Afficher des conseils permettant d’affiner ou d’élargir une recherche.

**✅ Fait** — astuce d'affinage basée sur le nombre de résultats, réglage `refinementTips`.

---

### Tags tendance

Repérer et afficher les tags récemment populaires.

**✅ Fait (recentré)** — une tendance site-entier nécessiterait de crawler AO3 (coût réseau excessif) ; recentré sur une tendance *personnelle* dérivée de l'historique local, dans le panneau de statistiques.

---

### Icônes de types de tags

Afficher une icône différente selon la catégorie du tag :

* fandom ;
* relation ;
* personnage ;
* tag additionnel.

**✅ Fait** — icône par catégorie sur les suggestions AO3 fusionnées dans le menu déroulant (🌐 fandom, 💞 relation, 👤 personnage, `#` tag additionnel).

---

## Autocomplétion AO3

Connecter le champ de recherche au véritable système d’autocomplétion des tags officiels d’AO3.

Le réglage `tagAutocomplete` existe déjà, mais aucun comportement n’est actuellement branché derrière lui.

**✅ Fait** — requêtes `/autocomplete/tag?term=` (même origine) fusionnées dans le menu déroulant du champ de recherche libre.

---

## Visualisation des fandoms

Afficher des graphiques en barres représentant les fandoms ou les résultats de recherche.

**✅ Fait** — barres proportionnelles aux fandoms les plus recherchés localement, dans le panneau de statistiques.

---

## Analyse par intelligence artificielle

Tenter d’estimer la qualité d’une œuvre à l’aide d’un système d’intelligence artificielle.

**❌ Écarté** — même principe de neutralité que la décision déjà prise de ne pas colorer les ratios d'engagement : un score de qualité automatique serait présenté comme une mesure objective qu'il n'est pas.

---

## Recherche rapide superposée

Afficher les résultats d’une recherche rapide dans une fenêtre superposée au-dessus de la page actuelle, plutôt que de naviguer vers une nouvelle page.

**❌ Écarté** — reproduire une page de résultats AO3 complète (pagination, tri, filtres) dans une fenêtre superposée dupliquerait une grande partie de l'interface native d'AO3 côté client ; complexité et fragilité jugées excessives face à l'ouverture dans un nouvel onglet déjà possible (Ctrl+clic).

---

## Véritable tri historique des séries

Trier les groupes de séries selon l’historique réel de lecture de l’utilisateur.

Le mode historique actuel conserve seulement l’ordre d’apparition des séries sur la page.

**✅ Fait** — le mode `history` compare désormais chaque groupe à `ao3h:rt:history` (readingTracker) et trie par nombre réel d'œuvres déjà visitées.

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

---

## Pas de tri par ressemblance ni d'estimation de qualité par IA

Le module ne calcule ni score de similarité avec les favoris de l'utilisateur, ni estimation automatique de la qualité d'une œuvre.

Un score de similarité complet équivaut à un moteur de recommandation, déjà explicitement écarté ailleurs dans le projet. Une estimation de qualité par IA présenterait un indicateur approximatif comme une mesure objective — même raisonnement que la décision de ne pas colorer les ratios d'engagement.

---

## Pas de crawling pour les suggestions ou statistiques "globales"

Le module ne suggère pas de tags propres à un fandom précis, et ne repère pas de tags "tendance" à l'échelle du site.

Les deux nécessiteraient de télécharger et analyser un grand nombre de pages AO3 (tags populaires *dans* un fandom, popularité *sur tout le site*), un coût réseau jugé excessif. La "tendance" a été recentrée sur une tendance personnelle, dérivée uniquement de l'historique de recherche déjà stocké localement.

---

## Pas de recherche multifandom ni de recherche rapide superposée

Le module ne propose pas d'interface dédiée pour chercher dans plusieurs fandoms à la fois, et n'affiche pas les résultats d'une recherche rapide dans une fenêtre superposée.

Le premier point est déjà couvert nativement par AO3 (le champ Fandoms accepte plusieurs valeurs séparées par des virgules). Le second dupliquerait une grande partie de l'interface de résultats native d'AO3 (pagination, tri, filtres) côté client, pour un bénéfice limité face à l'ouverture dans un nouvel onglet déjà possible.

---

## Modèles de recherche intégrés, pas de presets personnalisés

Le module propose une poignée de modèles de recherche rapide tout prêts (kudos, mise à jour, terminé, longueur), mais ne permet pas de créer, nommer ou gérer ses propres presets de filtres.

La gestion complète de presets personnalisés (n'importe quel champ du formulaire, sauvegarde sous un nom, import/export) est déjà le rôle du module `filterManager`/`presetManagement.js` — la dupliquer ici créerait deux systèmes concurrents pour la même idée.
