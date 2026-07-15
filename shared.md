═══════════════════════════════════════════════════════════════════════════

# PLAN 

═══════════════════════════════════════════════════════════════════════════


Identifies les fonctions, classes, constantes, composants d’interface, systèmes de stockage, appels AO3, outils DOM ou autres morceaux de code qui pourraient être utiles à plusieurs modules et qui devraient donc être placés dans des fichiers partagés.

   * Pour chaque élément trouvé, indique :
       1. Dans quels fichiers ou modules il existe actuellement.
       2. Ce que cet élément fait.
       3. Pourquoi il devrait être partagé.
       4. Le nom proposé pour le fichier partagé.
       5. L’emplacement proposé dans le projet, par exemple :
           - `lib/utils/`
           - `lib/ao3/`
           - `lib/storage/`
           - `lib/ui/`
           - ou un nouveau dossier adapté.
       6. Quels modules pourraient importer ce fichier partagé.
       7. Les différences entre les versions actuelles qui devront être harmonisées.
       8. Les risques possibles si cet élément est déplacé.

   * Classe les résultats en trois catégories :
       - **À extraire maintenant** : duplication claire ou fonctionnalité manifestement commune.
       - **À surveiller** : pourrait devenir partagé, mais il manque encore des cas d’utilisation.
       - **À laisser dans le module** : trop spécifique au module pour être partagé.

   * Règles importantes :
       - Ne crée aucun nouveau fichier.
       - Ne propose pas de déplacer une fonction uniquement parce qu’elle est petite.
       - Une fonction doit être partagée seulement si elle possède une responsabilité générale et peut réellement servir à plusieurs modules.
       - Ne mélange pas les fonctionnalités métier propres à un module avec les utilitaires généraux.
       - Vérifie les imports et les dépendances avant de recommander un déplacement.
       - Évite de créer un énorme fichier `utils.js` contenant des fonctions sans rapport entre elles.
       - Propose des fichiers partagés spécialisés et clairement nommés.
       - Donne les chemins exacts et les noms des fonctions concernées.

   Commence par produire un rapport seulement. Attends mon autorisation avant d’effectuer une extraction ou une modification.


---


## La différence importante

   * Doit chercher des éléments comme :
       - `lib/ao3/work-id.js`
       - `lib/ao3/work-page.js`
       - `lib/storage/work-status.js`
       - `lib/ui/status-badge.js`
       - `lib/utils/dom-observer.js`

   * Ne devrait pas simplement créer ceci :
       - `lib/utils/helpers.js`
    avec toutes sortes de fonctions sans lien.


---


## Pour éviter une analyse trop énorme

   Commencer par une seule catégorie : **Commence uniquement par les modules de `src/modules/browse`.** 
   Ensuite, lorsqu’il a terminé : **Compare maintenant les résultats de `browse` avec les modules de `library` pour repérer les fonctionnalités réellement communes.**

   * Cette méthode permettra de distinguer :
       - ce qui est partagé entre les fichiers d’un même module ;
       - ce qui est partagé entre plusieurs modules ;
       - ce qui appartient réellement aux bibliothèques communes du projet.

   Analyse uniquement. Je veux un rapport avec tes recommandations. Ajoute ce rapport au document.


---


═══════════════════════════════════════════════════════════════════════════

# RAPPORT

═══════════════════════════════════════════════════════════════════════════


## ANALYSE DES MODULES `src/modules/browse` 
   Modules analysés : `ficEngagement`, `workLength`, `tagsDisplay`, `pageControls`, `hideByTags`, `filterManager`, `skipWorks` (25 fichiers JS).

   Constat préalable important : plusieurs fonctions dupliquées dans `browse` existent **déjà** dans les bibliothèques partagées (`lib/ao3/parsers.js`, `lib/utils/index.js`, `lib/storage/index.js`, `lib/ao3/integration.js`), mais les modules ne les importent pas — ils gardent des copies locales ou passent par le bridge `window.AO3H_Common`. Une partie du travail n'est donc pas « créer des fichiers partagés » mais « faire converger les modules vers les fichiers partagés existants ».


---


### A. À EXTRAIRE MAINTENANT

#### A1. Parsing des statistiques d'un blurb (kudos / hits / bookmarks / words)

   **Où ça existe actuellement :**
   - `src/modules/browse/ficEngagement/engagementMetrics.js` → `parseNum()` (l.30), `getStats()` (l.38), duplication inline dans `processWorkPage()` (l.132)
   - `src/modules/browse/ficEngagement/hiddenGems.js` → `_parseNum()` (l.34), `_getStatsFromBlurb()` (l.41), `_getStatsFromWorkPage()` (l.52)
   - `src/modules/browse/workLength/lengthDisplay.js` → `parseWordCount()` (l.52)
   - `src/modules/browse/workLength/readingTime.js` → `parseWordCount()` (l.42)

   **Ce que ça fait :** lit le texte d'un `dd` de `dl.stats`, retire les virgules, fait `parseInt` ; les versions `getStats` assemblent un objet `{ kudos, hits, bookmarks, words }` depuis un blurb ou depuis la page d'un work.

   **Pourquoi partager :** 4 copies quasi identiques du même parseur, et 4 copies de la même connaissance du DOM AO3 (`dl.stats dd.kudos`, etc.). C'est de l'extraction de données AO3 pure, sans logique métier.

   **Nom proposé :** `work-stats.js` — exports : `parseStatNumber(node)`, `getBlurbStats(blurb)`, `getWorkPageStats(doc)`.

   **Emplacement proposé :** `lib/ao3/work-stats.js`
   
   **Importeurs potentiels :** `engagementMetrics`, `hiddenGems`, `lengthDisplay`, `readingTime` ; plus tard les modules `library` (dashboard, timeline) qui lisent aussi des stats.
   
   **Différences à harmoniser :** `parseNum` retourne `null` en cas d'échec (ficEngagement) vs `parseWordCount` retourne `0` (workLength) ; `getStats` de hiddenGems retourne `null` si kudos ET hits sont absents, celle d'engagementMetrics retourne toujours l'objet. Prévoir `parseStatNumber` → `null` et laisser l'appelant décider (`?? 0`).
   
   **Risques :** faible. Attention au comportement `0` vs `null` dans `lengthDisplay.buildBadgeHTML(words)` (`words < 100` suppose un nombre, pas `null`).


---


#### A2. Extraction du work ID — converger vers `lib/ao3/parsers.js` (existe déjà)

   **Où ça existe actuellement (copies locales) :**
   - `src/modules/browse/tagsDisplay/tagsReordering.js` → `getWorkId()` (l.28)
   - `src/modules/browse/hideByTags/hiddenTags.js` → `getWorkIdFromBlurb()` (l.535, avec fallback bridge `window.AO3H_Common.Parsers`)
   - `src/modules/browse/filterManager/userHistoryFilters.js` → `_workIdFromBlurb()` (l.38)
   - `src/modules/browse/skipWorks/skipWorks.js` → `workIdFromBlurb($blurb)` (l.151, version jQuery)
   - **Version partagée existante :** `lib/ao3/parsers.js` → `extractWorkIdFromHref()`, `extractWorkIdFromBlurb()`, `parseWorkIds()`

   **Ce que ça fait :** trouve l'ID numérique d'un work depuis l'URL courante ou depuis les liens d'un blurb.

   **Pourquoi partager :** déjà centralisé dans `lib/ao3/parsers.js` ; les copies locales sont des reliquats de migration.

   **Fichier/emplacement :** aucun nouveau fichier — importer `lib/ao3/parsers.js`.

   **Importeurs potentiels :** `tagsReordering`, `hiddenTags`, `userHistoryFilters`, `skipWorks`.

   **Différences à harmoniser :** `userHistoryFilters` ne regarde que `h4.heading > a` (plus strict) ; `hiddenTags` nettoie `?query`/`#hash` avant match.

   **Risques :** ⚠️ **skipWorks est un cas à part** : sa fonction retourne le **href complet** (`/works/12345`) et non l'ID, et ce href sert de **clé primaire dans IndexedDB** (`keyPath: 'workId'`). Remplacer par l'ID numérique casserait la base existante des utilisateurs — nécessiterait une migration. À traiter séparément, ne pas harmoniser mécaniquement.


---


#### A3. Gardes de route (page de work, page de listing) — converger + compléter `lib/ao3/parsers.js`

   **Où ça existe actuellement :**
   - Test « page de work » `/^\/works\/\d+/` dupliqué 5× : `engagementMetrics.js` l.127, `hiddenGems.js` l.128, `lengthDisplay.js` l.102, `readingTime.js` l.91, `tagsReordering.js` (via `getWorkId`)
   - `isListingPage()` version regex : `_pageControls.js` l.51 (inclut `/history` et `/bookmarks$`) et `_filterManager.js` l.65 (inclut `pseuds/…/works`, mais pas `/history` ni `/bookmarks$`)
   - `isListingPage()` version DOM : `tagsVisibility.js` l.41 (présence de `li.work.blurb`)
   - **Versions partagées existantes :** `lib/ao3/parsers.js` → `isWorkRoute()`, `isListRoute()`, `isWorksLikePath()`, `isBookmarksRoute()`…

   **Ce que ça fait :** décide si le module doit s'activer selon la page AO3 courante.

   **Pourquoi partager :** la définition de « page de listing » est une connaissance AO3 globale ; aujourd'hui trois définitions divergentes coexistent, donc les modules ne s'activent pas sur les mêmes pages (source de bugs incohérents).

   **Fichier/emplacement :** compléter `lib/ao3/parsers.js` (ou `lib/ao3/routes.js`) avec un `isListingPage()` unique documenté (union des cas : works, tags/works, users bookmarks/works/pseuds/history, /bookmarks, collections/works).

   **Importeurs potentiels :** `pageControls`, `filterManager`, `tagsVisibility`, `engagementMetrics`, `hiddenGems`, `lengthDisplay`, `readingTime`.

   **Différences à harmoniser :** listées au point 1 — il faut décider explicitement si `/history` et `pseuds` en font partie pour tous.

   **Risques :** moyen. Élargir la garde d'un module l'active sur des pages où il n'a jamais été testé (ex. filterManager sur `/history`). Harmoniser module par module, en vérifiant.


---


#### A4. Sélection des blurbs — converger vers `findAllBlurbs()` (existe déjà)

   **Où ça existe actuellement :**
   - `engagementMetrics.js` l.120 et `hiddenGems.js` l.120 : `'li.work.blurb.group, li.bookmark.blurb.group'`
   - `tagsVisibility.js` l.42/122/128 : `'li.work.blurb, li.bookmark.blurb'`
   - `_filterManager.js` l.275 : `'li.work.blurb, li.bookmark.blurb, li.blurb'`
   - `hiddenTags.js` → `getWorkBlurbs()` l.521 (bridge window + fallback 5 sélecteurs)
   - `skipWorks.js` : `'ol.index li.blurb'` (jQuery)
   - **Version partagée existante :** `lib/ao3/parsers.js` → `findAllBlurbs(doc)`

   **Ce que ça fait :** énumère les blurbs (works/bookmarks) d'une page de listing.

   **Pourquoi partager :** 6 jeux de sélecteurs différents pour le même concept ; si AO3 change son markup, il y a 6 endroits à corriger.

   **Fichier/emplacement :** `lib/ao3/parsers.js` (existant). Éventuellement ajouter une variante `findWorkBlurbs(root)` qui exclut les blurbs de séries/users si certains modules en ont besoin.

   **Importeurs potentiels :** les 6 emplacements ci-dessus.

   **Différences à harmoniser :** `.group` ou non ; inclusion de `li.blurb` nu (attrape aussi les blurbs de séries et d'users — voulu pour hideByTags, pas forcément pour ficEngagement) ; scope `ol.index` (skipWorks).

   **Risques :** moyen. Changer le sélecteur change l'ensemble des éléments traités (ex. ficEngagement se mettrait à décorer des blurbs de séries sans `dl.stats` exploitables). Tester chaque module après bascule.


---


#### A5. Lecture des réglages de module (`ao3h:mod:<MOD>:settings`)

   **Où ça existe actuellement :** 7 copies du même bloc `loadSettings()` / `cfg()` :
   - `_ficEngagement.js` l.36 · `_workLength.js` l.48 · `_pageControls.js` l.42 · `_filterManager.js` l.115 · `_hideByTags.js` l.101 · `skipWorks.js` → `getSetting()` l.66 · `hiddenTags.js` l.160 (lecture inline de `ao3h:mod:hideByTags:settings`)
   - `_tagsDisplay.js` utilise déjà `Storage.lsGet` mais réimplémente la coercition bool/int/str.

   **Ce que ça fait :** lit le JSON de réglages écrit par le panneau de config, avec fallback sur un objet `DEFAULTS`.

   **Pourquoi partager :** c'est le contrat panneau ↔ module, identique partout ; la clé (`ao3h:mod:X:settings`) est de la connaissance d'infrastructure, pas du métier.

   **Nom proposé :** `module-settings.js` — exports : `loadModuleSettings(moduleId)`, `makeCfg(moduleId, DEFAULTS)` (retourne la fonction `cfg(key)`).

   **Emplacement proposé :** `lib/storage/module-settings.js`

   **Importeurs potentiels :** les 7 modules browse, et vraisemblablement tous les modules des autres onglets (à confirmer à l'étape `library`).

   **Différences à harmoniser :** `cfg` de pageControls relit le localStorage à chaque appel (valeurs « live ») alors que ficEngagement/workLength lisent une seule fois à l'init ; skipWorks passe le défaut en argument au lieu d'un objet DEFAULTS. Offrir les deux modes (snapshot / live) ou trancher.

   **Risques :** faible si l'API reproduit les deux comportements ; sinon risque subtil de réglages qui ne se rafraîchissent plus (ou trop).


---


#### A6. Fabrique `cfg()` basée sur `Flags` pour les sous-modules de tagsDisplay

   **Où ça existe actuellement :** 5 copies strictement identiques de `function cfg(key, fallback)` lisant `Flags.get('mod:tagsDisplay:'+key)` :
   `tagHighlighting.js` l.42 · `tagsVisibility.js` l.29 · `archiveWarningsDisplay.js` l.35 · `autoHideNoiseTags.js` l.33 · `compactModeTags.js` l.31

   **Ce que ça fait :** lit un flag préfixé par l'ID du module parent, avec fallback.

   **Pourquoi partager :** duplication mécanique ; tout module « coordinateur + enfants cascade » aura le même besoin.

   **Nom proposé :** ajouter `makeFlagsCfg(parentModuleId)` dans `lib/utils/config.js` (fichier existant, où vit déjà `Flags`).

   **Emplacement proposé :** `lib/utils/config.js` (existant).

   **Importeurs potentiels :** les 5 sous-modules de tagsDisplay ; futurs sous-modules cascade d'autres onglets.

   **Différences à harmoniser :** aucune — les 5 copies sont identiques.

   **Risques :** quasi nul.


---


#### A7. Store « liste persistée avec miroir localStorage » (hideByTags)

   **Où ça existe actuellement :** 3 copies quasi identiques dans le même module :
   - `hiddenTags.js` → `_lsGet/_lsSet` (l.36) + `getHidden/setHidden/addHiddenTag/removeHiddenTag` (l.74)
   - `nopeWords.js` → `_lsGet/_lsSet` (l.26) + `getNopeWords/setNopeWords/addNopeWord/removeNopeWord` (l.45)
   - `whitelistExceptions.js` → `_lsGet/_lsSet` (l.27) + `getWhitelistTags/…` (l.46)

   **Ce que ça fait :** liste de chaînes normalisées (trim + lowercase + dédoublonnage) persistée via `Storage` (async) avec miroir localStorage par utilisateur (`UserLS`) en fallback de lecture.

   **Pourquoi partager :** trois implémentations du même pattern « liste utilisateur durable » ; le pattern (get avec fallback miroir, set normalisant, add/remove) est générique et servira aux listes des modules library (tags favoris, mots-clés, etc.).

   **Nom proposé :** `mirrored-list.js` — export : `createMirroredListStore({ key, Storage, UserLS, NS })` retournant `{ get, set, add, remove }`.

   **Emplacement proposé :** `lib/storage/mirrored-list.js`

   **Importeurs potentiels :** `hiddenTags`, `nopeWords`, `whitelistExceptions` ; candidats library à confirmer à l'étape 2.

   **Différences à harmoniser :** `getHidden()` ne re-normalise pas à la lecture alors que `getNopeWords()`/`getWhitelistTags()` le font ; `hiddenTags` a en plus le group-map et le collapsed-set (à laisser dans le module, c'est spécifique).

   **Risques :** faible — les clés de stockage ne changent pas, seul le code est factorisé. Attention à conserver exactement la sémantique du fallback miroir (« miroir utilisé seulement si la liste principale est vide »).


---


#### A8. Modale « gestionnaire de liste » (backdrop, scroll-lock, recherche, suppression avec confirmation, export/import)

   **Où ça existe actuellement :** 3 copies (~150–200 lignes chacune) :
   - `hiddenTags.js` → `openManager()` (l.237)
   - `nopeWords.js` → `openManager()` (l.117)
   - `whitelistExceptions.js` → `openManager()` (l.97)

   **Ce que ça fait :** modale complète : backdrop + boîte, verrouillage du scroll (classe `-lock` + `body.top` + restauration `scrollY`), fermeture Échap/clic/croix, focus trap et nav clavier (bridge KeyboardNav), champ de recherche débouncé avec compteur `X / Y`, lignes avec bouton 🗑️ → confirmation ✓/✗, boutons Export/Import JSON.

   **Pourquoi partager :** duplication massive ; la seule vraie différence entre les trois est le rendu des lignes (groupes repliables pour hiddenTags, ligne simple pour les deux autres) et la présence d'un champ « Add ». `lib/ui/dialog.js` (`createGenericDialog`) existe déjà mais ne couvre pas ce pattern liste.

   **Nom proposé :** `list-manager.js` — export : `openListManagerDialog({ title, load, renderRow | groupBy, onAdd?, onRemove, export: {filename}, import: {merge}, toast })`.

   **Emplacement proposé :** `lib/ui/list-manager.js` (avec le scroll-lock extrait en `lib/ui/scroll-lock.js` s'il sert ailleurs).

   **Importeurs potentiels :** les 3 sous-modules hideByTags ; très probablement des managers équivalents dans `library` (bookmark-vault, later-shelf…) — à confirmer à l'étape 2.

   **Différences à harmoniser :** hiddenTags a le groupement + état plié/déplié persisté + double export (tags / groups) ; whitelist/nope ont la rangée « Add ». L'API doit accepter des sections optionnelles plutôt que de tout imposer.

   **Risques :** moyen — c'est la plus grosse extraction. Beaucoup de micro-comportements (restauration du scrollTop de la liste, préservation de l'état des groupes pendant un reload, `pointerdown` vs `click`) à reproduire fidèlement. À faire en dernier, avec tests manuels des trois managers.


---


#### A9. Export / import JSON par fichier

   **Où ça existe actuellement :**
   - `hiddenTags.js` : blocs export/import (l.452–514) + commande de menu GM dans `_hideByTags.js` (l.433–442)
   - `nopeWords.js` (l.277–308) · `whitelistExceptions.js` (l.256–286)
   - `skipWorks.js` → `exportHiddenWorks()` (l.351), `importHiddenWorksFromFile()` (l.371), `promptImportHiddenWorks()` (l.413)
   - `presetManagement.js` (export/import des presets — même pattern)

   **Ce que ça fait :** export : `Blob` JSON → `URL.createObjectURL` → `<a download>` cliqué → révocation ; import : `<input type=file>` → `file.text()` → `JSON.parse` → validation → merge.

   **Pourquoi partager :** ≥ 7 copies du même mécanisme navigateur, aucune logique métier dedans.

   **Nom proposé :** `json-file.js` — exports : `downloadJSON(data, filename)`, `pickJSONFile()` (Promise du JSON parsé ou `null`).

   **Emplacement proposé :** `lib/utils/json-file.js`

   **Importeurs potentiels :** hideByTags (×3), skipWorks, presetManagement ; sûrement backupAndSync et des modules library.

   **Différences à harmoniser :** la validation (array vs objet) et le merge restent chez l'appelant ; seuls download/pick sont partagés.

   **Risques :** quasi nul.


---


#### A10. Helpers de pagination — doublon avec `lib/utils/index.js` (existe déjà)

   **Où ça existe actuellement :**
   - `src/modules/browse/pageControls/coreNavigation.js` → `getCurrentPage()` (l.7), `getMaxPage()` (l.13), `buildPageURL()` (l.32), ré-exposés en statiques de classe (l.114) pour `enhancedNavigation.js`
   - **Versions partagées existantes :** `lib/utils/index.js` → `getCurrentPage()` (l.72), `getMaxPageFromDOM()` (l.78), `buildURLForPage()` (l.89)

   **Ce que ça fait :** lit `?page=N`, détecte la dernière page depuis `.pagination` (avec fallback « N-M of X »), construit l'URL d'une page donnée.

   **Pourquoi partager :** doublon pur avec la lib existante ; en plus, c'est de la connaissance AO3, mal placée dans `lib/utils` généraliste.

   **Nom proposé :** regrouper dans `lib/ao3/pagination.js` (déménager les 3 fonctions de `lib/utils/index.js`, qui les ré-exporterait pour compatibilité) — ou a minima faire importer `coreNavigation.js` depuis `lib/utils/index.js`.

   **Emplacement proposé :** `lib/ao3/pagination.js`

   **Importeurs potentiels :** `coreNavigation`, `enhancedNavigation`, `worksPerPage` (pour `items_per_page`), et les modules de navigation d'autres onglets.

   **Différences à harmoniser :** vérifier que le fallback « of X » de `getMaxPage()` (coreNavigation, avec `items_per_page`) existe aussi dans `getMaxPageFromDOM()` — sinon porter la version la plus complète.

   **Risques :** faible.


---


#### A11. Constante AO3 : liste des Archive Warnings

   **Où ça existe actuellement :**
   - `filterWarnings.js` → `ARCHIVE_WARNINGS` (l.28) : `'Graphic Depictions of Violence'`, `'Choose Not To Use Archive Warnings'`…
   - `archiveWarningsDisplay.js` → clés de `WARNING_ICONS` (l.44) : `'Graphic Depictions Of Violence'`, `'Creator Chose Not To Use Archive Warnings'`…

   **Ce que ça fait :** énumère les 6 archive warnings officiels d'AO3.

   **Pourquoi partager :** même donnée de référence dans 2 modules — et **les deux listes divergent** (casse de « Of », libellé « Creator Chose… » vs « Choose… »). L'une des deux est forcément fausse pour certains contextes ; centraliser force à documenter quelle forme correspond à quel usage (tag affiché vs valeur de paramètre d'URL).

   **Nom proposé :** `constants.js` — export `ARCHIVE_WARNINGS` (et à terme les ratings/catégories).

   **Emplacement proposé :** `lib/ao3/constants.js`

   **Importeurs potentiels :** `filterWarnings`, `archiveWarningsDisplay` ; modules explore/search.

   **Différences à harmoniser :** vérifier sur AO3 les formes exactes (tag canonique vs `excluded_tag_names`) avant de fusionner — il est possible que les deux formes soient nécessaires (deux constantes documentées).

   **Risques :** moyen si on fusionne aveuglément : `filterWarnings.detect()` compare aux valeurs d'URL, `archiveWarningsDisplay` au texte des tags. Ne fusionner qu'après vérification des chaînes réelles.


---------------------------------------------------------------------------


### B. À SURVEILLER

| Élément | Où | Pourquoi attendre |
|---|---|---|
| `formatTime(minutes)` (→ « 1h05min ») | `readingTime.js` l.34 | Un seul consommateur dans browse ; les modules library (dashboard, timeline) en auront sûrement besoin — vérifier à l'étape 2 avant de créer `lib/utils/format-time.js` (ou `duration.js`). |
| Wrappers IndexedDB promisifiés (`openDB/getWork/putWork/getAllWorks`) | `skipWorks.js` l.82–125 | Pattern générique « IndexedDB par utilisateur », mais un seul consommateur ici. `bookmarkVault`/`readingTracker` (library) ont probablement leurs propres wrappers → candidat `lib/storage/indexed-db.js` à confirmer à l'étape 2. |
| Toast (`HiddenTags.toast()`) | `hiddenTags.js` l.785 | Une seule implémentation dans browse ; comparer avec les notifications des modules library avant de créer `lib/ui/toast.js`. |
| `_escapeHtml()` | `filterWarnings.js` l.43 | Un seul usage. Si d'autres modules injectent du texte utilisateur en innerHTML, l'ajouter à `lib/utils/dom.js`. |
| `detectCurrentFandom()` | `_filterManager.js` l.72 | Extraction AO3 générale (tag de l'URL), mais un seul consommateur pour l'instant → candidat `lib/ao3/parsers.js` si un module explore en a besoin. |
| Cartes langues (`LANG_FLAGS`, `LANG_CODES`) | `languageBadges.js` l.25 | Donnée de référence AO3, mais un seul consommateur. Si `search-enhancer` (explore) manipule aussi les langues → `lib/ao3/constants.js`. |
| Pattern « observer les nouveaux blurbs » | 9 blocs `MutationObserver` quasi identiques : `_ficEngagement.js` l.59, `hiddenGems.js` l.133, `tagHighlighting.js` l.180, `archiveWarningsDisplay.js` l.118, `autoHideNoiseTags.js` l.117, `tagsVisibility.js` l.124, `lengthDisplay.js` l.111, `readingTime.js` l.102, `_filterManager.js` l.285 | `lib/utils/index.js` fournit déjà `observe()` + `debounce()` (utilisés par hideByTags et skipWorks seulement). Les 9 blocs divergent (re-scan complet vs traitement des nœuds ajoutés ; `#main` vs `body` ; subtree ou non ; débounce ou non). Plutôt que créer un fichier de plus, faire adopter `observe()+debounce()` au fil des retouches ; si un vrai besoin commun émerge, ajouter `watchNewBlurbs(cb)` dans `lib/utils/dom-observer.js`. |
| Mini-helpers `lsGet/lsSet` locaux | `worksPerPage.js` l.9, `_pageControls.js` l.42, `tagHighlighting.js` `loadRules/saveRules` l.48 | Doublons de `lib/utils/index.js` (`lsGet/lsSet`) et `Storage.lsGet/lsSet` — à remplacer opportunément lors des retouches, sans chantier dédié (attention aux préfixes de clés différents). |
| Bridge jQuery `$()` local | `skipWorks.js` l.149 | `lib/ao3/integration.js` fournit déjà `getJQuery()`/`jq()` — à faire converger quand skipWorks sera retouché. |


---------------------------------------------------------------------------


### C. À LAISSER DANS LE MODULE

   - `BOOK_COMPARISONS` et seuils de catégories (`lengthDisplay.js`) — donnée métier propre à workLength.
   - `WPM_MAP` et logique de vitesse de lecture (`readingTime.js`) — métier workLength.
   - Seuils et calculs de métriques (`kudosRatio`, `densityColour`, critères `_isGem`…) dans `engagementMetrics.js` / `hiddenGems.js` — cœur métier de ficEngagement.
   - `NOISE_PATTERNS` (`autoHideNoiseTags.js`) — liste éditoriale propre au sous-module.
   - `WARNING_ICONS` (mapping icône/abréviation, `archiveWarningsDisplay.js`) — présentation propre au sous-module (seule la liste des noms est partageable, cf. A11).
   - `PRESETS` de couleurs + menu contextuel (`tagHighlighting.js`) — UI propre au sous-module.
   - Tout le drag-and-drop et la persistance d'ordre (`tagsReordering.js`) — trop spécifique.
   - `SEARCH_FIELDS`, `FRIENDLY_FIELD_NAMES`, `MULTI_TAG_FIELDS`, `BUILTIN_BUNDLES` (`presetManagement.js` / `_filterManager.js`) — vocabulaire du formulaire de filtres, métier filterManager. (Nota : `lib/ao3/search-filters.js` couvre déjà une partie de ce domaine ; un rapprochement filterManager ↔ search-filters est un chantier à part, pas une extraction simple.)
   - Système fold/cut/wrap des blurbs cachés (`hiddenTags.js` l.546–731) — cœur de hideByTags.
   - Picker de note, `tempShow` session, quick-tags et migrations DB (`skipWorks.js`) — métier skipWorks.
   - Logique whitelist « rescue » et bannières 🟢/🔴 (`_hideByTags.js` `processList`) — métier hideByTags.
   - `applyDensity` / priorités de troncature (`tagsVisibility.js`) — métier du sous-module.


---


### Ordre d'extraction suggéré (du plus sûr au plus risqué)

1. A9 (json-file), A6 (makeFlagsCfg), A5 (module-settings) — mécaniques, sans changement de comportement.

2. A1 (work-stats), A11 (constantes warnings, après vérification des chaînes).

3. A2, A3, A4, A10 — convergence vers `lib/ao3/parsers.js` / pagination existants, module par module (exclure skipWorks de A2 tant que la clé IndexedDB n'est pas migrée).

4. A7 (mirrored-list) puis A8 (list-manager) — les plus gros gains mais les plus délicats.

**Étape suivante :** comparer ces résultats avec les modules de `src/modules/library` pour confirmer les candidats « à surveiller » (formatTime, IndexedDB, toast, list-manager) et repérer les fonctionnalités réellement communes inter-onglets.


===========================================================================


## ANALYSE DES MODULES `src/modules/library` + COMPARAISON AVEC `browse`
Modules analysés : `later-shelf`, `fic-appreciation`, `bookmark-vault`, `activity-panel`, `notification-center`, `reading-dashboard`, `reading-timeline`, `fanfic-binge-mode` (39 fichiers JS).

---

### D. CONFIRMATIONS DES CANDIDATS DE L'ÉTAPE 1
La comparaison confirme que plusieurs candidats « browse » sont en réalité **inter-onglets**, ce qui renforce leur priorité :

#### D1. Extraction du work ID (confirme et élargit A2) — le plus gros doublon du projet
En plus des 4 copies de browse, **library contient 16 copies supplémentaires** de la même extraction :

   - Depuis un blurb (`h4.heading a[href*="/works/"]` + regex) — 9 copies :
  `markedForLaterStatus.js` l.54 · `quickMarkForLaterButton.js` l.33 · `workReminder.js` l.110 et l.140 (inline, 2×) · `organizationTools.js` l.31 · `richTextNotes.js` l.44 · `statusIndicators.js` l.38 · `readingStatusTracking.js` l.30 · `_ficAppreciation.js` l.101 · `historyAnalytics.js` l.138
   - Depuis `location.pathname` — 7 copies :
  `laterShelfStore.js` l.26 · `sessionHistory.js` l.28 · `_fanficBingeMode.js` l.71 · `notificationCenter.js` l.162 · `readingDashboard.js` l.125 · `_ficAppreciation.js` l.97 · `readingStatusTracking.js` l.37

Soit **~20 copies au total** dans le projet alors que `lib/ao3/parsers.js` exporte déjà `extractWorkIdFromBlurb()` et `parseWorkIds()`. Nuance : les versions library sont plus strictes (`h4.heading` uniquement) que `extractWorkIdFromBlurb` (fallback sur n'importe quel lien). Harmoniser vers la version stricte en priorité de sélecteur est déjà le comportement du parseur partagé — risque faible. La réserve sur skipWorks (clé IndexedDB = href) reste inchangée.


---


#### D2. Gardes de route (confirme A3)
Library ajoute encore 4 définitions divergentes de « page de listing » / « page de work » :
   - `_ficAppreciation.js` l.90-96 (`isWorkPage`, `isListingPage` regex, sans `/history` ni `pseuds`)
   - `readingStatusTracking.js` l.26-28 et `statusIndicators.js` l.35-36 (`/\/(works|tags|bookmarks|users\/[^/]+\/)/` — très permissif, matche aussi `/works/123` !)
   - `readingDashboard.js` l.107-110 (`isWorkPage` avec fallback `#workskin`)
   - `markedForLaterStatus.js` l.38 et `workReminder.js` l.131 (page MFL : `/readings` + `show=to-read` — spécifique, à garder)

Le besoin d'un `isListingPage()` / `isWorkPage()` unique dans `lib/ao3/parsers.js` est donc confirmé à l'échelle du projet. Le bug latent de `statusIndicators._isListingPage` (vrai aussi sur une page de work) illustre le coût de la non-centralisation.


---


#### D3. Lecture des réglages de module (confirme A5)

Library reproduit le même bloc `cfg()`/`loadSettings()` 6 fois de plus :
`laterShelfStore.js` l.10 · `activityPanelShared.js` l.13 · `notificationCenter.js` l.70 · `_bookmarkVault.js` l.73 · `bookmarkNavigation.js` l.22 · `bookmarkMaintenance.js` l.25 — plus la variante `_ficAppreciation.js` l.71 (via `AO3H.flags`).

**Total projet : ~14 copies.** À noter : 3 versions library (`activityPanelShared`, `notificationCenter`, `_ficAppreciation`) ont une couche de fallback supplémentaire `W.AO3H_Config?.[MOD]?.defaults` — l'API partagée (`makeCfg`) doit accepter ce fallback optionnel. Confirme `lib/storage/module-settings.js` comme extraction n°1 en rentabilité.


---


#### D4. Export JSON/CSV par fichier (confirme A9, élargit au CSV)

5 copies supplémentaires dans library : `multiStatusTracker.js` l.277-303 (JSON+CSV) · `kudosExtendedFeatures.js` l.85-106 (JSON+CSV) · `bookmarkMaintenance.js` l.52 · `timelineVisualization.js` l.502 · `historyAnalytics.js` l.233-242.
→ `lib/utils/json-file.js` doit offrir `downloadJSON()` **et** un `downloadFile(content, filename, mime)` générique (les exports CSV de ficAppreciation l'utiliseront).


---


#### D5. lsGet/lsSet JSON avec try/catch (confirme la remarque « à surveiller » de l'étape 1 — devient À EXTRAIRE)

Le pattern `try { JSON.parse(localStorage.getItem(K) || fallback) } catch { fallback }` apparaît **~25 fois** dans library (`laterShelfStore`, `workReminder` l.47, `notificationCenter` l.89-92, `habitsAnalysis`/`fandomBreakdown`/`patternAnalysis`/`sessionHistory` (4 copies identiques de `loadSessions`), `organizationTools` l.25-28, `richTextNotes` l.26, `statusIndicators` l.26-32, `readingStatusTracking` l.23-24, `sortingAndFiltering` l.34, `readingDashboard.loadData/saveData`, `activityPanelShared.store`…).
`lib/utils/index.js` exporte déjà `lsGet`/`lsSet`. Reclassé : **à faire converger systématiquement** (plus seulement « au fil des retouches »), car c'est le doublon le plus fréquent du projet. Attention aux préfixes : certains modules préfixent `ao3h:` dans la clé, d'autres non (`readingDashboard` utilise `ao3h_dashboard_data_v1` sans préfixe — documenté comme volontaire).


---


#### D6. Candidats « à surveiller » de l'étape 1 — verdict après comparaison

| Candidat (étape 1) | Verdict | Justification |
|---|---|---|
| `formatTime(minutes)` (readingTime) | **Rester dans le module** (pour l'instant) | Aucun équivalent trouvé dans library (dataCollection calcule des heures entières, pas de formatage h/min). Un seul consommateur. |
| Wrappers IndexedDB (skipWorks) | **Rester dans le module** | Aucun module library n'utilise IndexedDB — tous sont sur localStorage. Pas de second consommateur. |
| Toast (hiddenTags) | **Rester dans le module** (pour l'instant) | Library utilise `alert`/`confirm`/`prompt` natifs, pas de toast. (Si on veut remplacer ces `alert` un jour, un `lib/ui/toast.js` deviendra pertinent — décision produit, pas refactoring.) |
| Modale « list manager » (A8) | **Confirmé à extraire, mais scope hideByTags** | Les managers library (catégories d'organizationTools, feed du notificationCenter) sont des panneaux inline, pas des modales de liste : pas de 4ᵉ consommateur immédiat. A8 reste rentable rien que pour ses 3 copies. |
| `_escapeHtml` | **À surveiller** (inchangé) | Pas de copie trouvée dans library. |
| Cartes langues | **Rester dans le module** | Aucun usage langue dans library. (Reste à vérifier `explore/search-enhancer` à une étape ultérieure.) |
| `detectCurrentFandom` | **À surveiller** (inchangé) | Pas d'équivalent library. |
| Pattern « observer les nouveaux blurbs » | **Confirmé, ampleur doublée** | Library ajoute ~10 blocs `MutationObserver` du même type (`markedForLaterStatus` l.269, `quickMarkForLaterButton` l.119 — qui réimplémente même son propre debounce à la main, `statusIndicators` l.225, `readingStatusTracking` l.131, `organizationTools` l.315, `noteManagement` l.78, `noteDisplay` l.176, `richTextNotes` l.265/271, `bookmarkMaintenance` l.171, `_ficAppreciation` l.212, `_fanficBingeMode` l.432). ~20 blocs au total dans le projet → la convergence vers `observe()`+`debounce()` de `lib/utils/index.js` passe en « à faire systématiquement », et un helper `watchNewBlurbs(cb)` dans `lib/utils/dom-observer.js` devient justifié. |


---------------------------------------------------------------------------


### E. NOUVEAUX CANDIDATS À EXTRAIRE (révélés par la comparaison browse ↔ library)
#### E1. Extraction de données de la page d'un work (titre, fandoms, tags)

   **Où ça existe actuellement :**
   - Titre du work : `laterShelfStore.js` → `markCurrent()` l.31 (`'h2.title.heading, .title.heading'`) · `readingDashboard.js` → `getWorkTitle()` l.131 (4 sélecteurs) · `notificationCenter.js` → `onWorkPage()` l.166 (`'h2.title.heading'`) · côté browse : `hiddenGems.js` → `_attachToWorkPage()` l.104 (`'div.preface.group h2.title'`)
   - Fandoms : `readingDashboard.js` → `getWorkFandoms()` l.146
   - Tags : `readingDashboard.js` → `getWorkTags()` l.156

   **Ce que ça fait :** lit les métadonnées du work affiché (titre, fandoms, tags, rating…) depuis le DOM de la page.

   **Pourquoi partager :** 4 modules lisent le titre avec 4 jeux de sélecteurs différents ; c'est de la connaissance du markup AO3, comme `parsers.js`.

   **Nom proposé :** `work-page.js` — exports : `getWorkTitle(doc)`, `getWorkFandoms(doc)`, `getWorkTags(doc)`, à terme `getWorkMeta(doc)`.

   **Emplacement proposé :** `lib/ao3/work-page.js` (c'est exactement le fichier suggéré en tête de ce document).

   **Importeurs potentiels :** `laterShelf`, `readingDashboard`, `notificationCenter`, `hiddenGems`, `sessionHistory`, et les modules reading (readingTracker) à vérifier.

   **Différences à harmoniser :** les jeux de sélecteurs (prendre l'union ordonnée de readingDashboard, la plus complète).

   **Risques :** faible — lecture seule du DOM.


---


#### E2. Parsing du compteur de chapitres (`dd.chapters` → « 3/10 », complet ou non)

   **Où ça existe actuellement :**
   - `statusIndicators.js` l.103-109 (split `/`, calcul isComplete + pourcentage)
   - `notificationCenter.js` → `parseWorkHTML()` l.148-157 **et** `onWorkPage()` l.165-171 (2 copies dans le même fichier)
   - côté browse : `worksFilterManager.js` → `_isOneshot()` l.45 (test `'1/1'`)
   - **Version partagée existante :** `lib/ao3/parsers.js` → `getChapterStats(doc)` (mais elle ne lit que la page d'un work, pas un blurb, et ne retourne pas `isComplete`)

   **Ce que ça fait :** décompose « publiés/total », gère le `?` (total inconnu), en déduit complet/WIP et éventuellement un pourcentage.

   **Pourquoi partager :** 4+ copies d'un parsing piégeux (le cas `?` est traité différemment selon les copies) ; `getChapterStats` existant est incomplet.

   **Nom proposé :** étendre `lib/ao3/parsers.js` avec `parseChapterCount(text)` → `{ published, total|null, isComplete, pct|null }` (utilisable sur un blurb comme sur une page).

   **Emplacement proposé :** `lib/ao3/parsers.js` (existant).

   **Importeurs potentiels :** `statusIndicators`, `notificationCenter`, `worksFilterManager`, `markedForLaterStatus` (filtre WIP/Complete, qui utilise aujourd'hui `.work.complete` — une 3ᵉ méthode).

   **Différences à harmoniser :** `getChapterStats` force `total ≥ 1` quand inconnu ; les copies library gardent `null`. Préférer `null` (plus honnête) et adapter l'existant.

   **Risques :** faible, mais tester le cas `?` sur chaque consommateur.


---


#### E3. Badge sur le titre d'un blurb (`h4.heading`)

   **Où ça existe actuellement :** au moins 9 copies du même bloc « créer un span, classe + emoji + title, l'appicher sur `h4.heading` » :
   - library : `markedForLaterStatus.js` l.62-75 (📌) · `quickMarkForLaterButton.js` l.88-97 (📌, dupliqué en 2 endroits du même fichier) · `workReminder.js` l.105-128 (⏰/⚠️) · `statusIndicators.js` l.77-99 (⭐/🔒/📝/date) · `organizationTools.js` l.45-58 (étiquettes catégorie) · `markAsFinished.js` l.76-88 (✅) · `kudosTracker.js` l.102-117 (🧡) · `multiStatusTracker.js` l.99-116 (statut) · `historyAnalytics.js` l.162-170 (📚 Read)
   - browse : `hiddenGems.js` (💎) · `languageBadges.js` (drapeau)

   **Ce que ça fait :** injection idempotente d'un badge de statut sur l'en-tête d'un blurb (avec garde anti-doublon, tooltip, parfois `aria-label`).

   **Pourquoi partager :** c'est le geste UI le plus répété du projet (~11 copies) ; les gardes anti-doublon et l'accessibilité sont incohérentes d'une copie à l'autre.

   **Nom proposé :** `status-badge.js` — export : `appendHeadingBadge(blurb, { className, text, title, id? })` (retourne le badge ou null si déjà présent / pas de heading). C'est le `lib/ui/status-badge.js` suggéré en tête de ce document.

   **Emplacement proposé :** `lib/ui/status-badge.js`

   **Importeurs potentiels :** les 11 emplacements ci-dessus.

   **Différences à harmoniser :** garde par classe CSS vs par `dataset` ; certains badges sont cliquables (rester hors scope : le helper crée le span, l'appelant ajoute ses listeners).

   **Risques :** faible — chaque migration est un remplacement local de 8-10 lignes.


---


#### E4. Notifications navigateur (permission + envoi)

   **Où ça existe actuellement :**
   - `workReminder.js` → `notify()` l.67-72 + `requestPermission()` l.74-79
   - `notificationCenter.js` → envoi l.446 + (gestion de permission propre + quiet-hours autour)

   **Ce que ça fait :** vérifie `'Notification' in window`, gère les trois états de permission, envoie la notification.

   **Pourquoi partager :** deux modules re-codent la même danse de permission ; les incohérences (workReminder n'appelle jamais `requestPermission` avant `notify` au check périodique) seraient éliminées.

   **Nom proposé :** `notifications.js` — exports : `canNotify()`, `requestNotifyPermission()` (Promise<bool>), `sendNotification(title, body, opts)`.

   **Emplacement proposé :** `lib/utils/notifications.js`

   **Importeurs potentiels :** `workReminder`, `notificationCenter`.

   **Différences à harmoniser :** titre/icône par défaut (workReminder force l'icône AO3, notificationCenter un `tag`). Les quiet-hours restent dans notificationCenter (métier).

   **Risques :** faible.


---


#### E5. Formatage de dates relatives (« today / yesterday / Xd ago »)

   **Où ça existe actuellement :**
   - `kudosDisplay.js` → `_formatDate()` + `_relativeDate()` l.116-133 (long/short/relative)
   - `statusIndicators.js` l.94-95 (`today / yesterday / Nd ago`)
   - `historyAnalytics.js` → `insertSessionDividers()` l.204-210 (Today / Yesterday / Last 7 Days / Last Month)
   - + affichages simples `toLocaleDateString` (markedForLaterStatus l.98, bookmarkMaintenance l.73, notificationCenter l.299)

   **Ce que ça fait :** convertit un timestamp/date en libellé lisible relatif ou localisé.

   **Pourquoi partager :** 3 vraies implémentations divergentes du « relatif » (jours seulement vs mois/années vs buckets) ; l'utilisateur voit des formats incohérents entre badges.

   **Nom proposé :** `format-date.js` — exports : `relativeDate(ts)`, `formatDate(ts, 'long'|'short'|'relative')`.

   **Emplacement proposé :** `lib/utils/format-date.js`

   **Importeurs potentiels :** `kudosDisplay`, `statusIndicators`, `markedForLaterStatus`, `notificationCenter`, `bookmarkMaintenance` ; `historyAnalytics` (buckets — offrir `dateBucketLabel(ts)` si on veut aussi couvrir ce cas, sinon le laisser).

   **Différences à harmoniser :** granularité (jours vs mois/années) ; locale (`en-CA` vs `en-US`).

   **Risques :** faible, mais choisir une granularité de référence change des libellés visibles — à valider visuellement.


---


#### E6. Sélection multiple + suppression groupée sur listings

   **Où ça existe actuellement :**
   - `markedForLaterStatus.js` → `injectMultiSelect()` l.222-266 (checkboxes + Select all/Deselect + 🗑 Remove + confirm ; supprime côté AO3 via form + met à jour le shelf)
   - `organizationTools.js` → `_injectBulkSelection()`/`_createBulkBar()`/`_updateBulkBar()` l.157-204 (checkboxes + Select All + compteur + 🗑 Remove + confirm ; retire de la vue seulement)

   **Ce que ça fait :** injecte des checkboxes par blurb, une barre d'action avec bascule select-all et un bouton de suppression avec confirmation.

   **Pourquoi partager :** deux implémentations du même squelette UI dans le même onglet ; toute évolution (compteur, accessibilité) devrait être faite deux fois.

   **Nom proposé :** `bulk-select.js` — export : `createBulkSelect({ blurbSelector, onRemove(selectedBlurbs), labels })` ; l'action de suppression reste un callback (les deux modules ont des effets différents).

   **Emplacement proposé :** `lib/ui/bulk-select.js`

   **Importeurs potentiels :** `markedForLaterStatus`, `organizationTools` ; potentiellement le futur manager de skipWorks.

   **Différences à harmoniser :** libellé du bouton select-all (bascule de texte vs statique) ; position de la barre ; compteur présent ou non.

   **Risques :** moyen-faible — UI visible, tester les deux pages (MFL et bookmarks).


---


#### E7. Contrat de données inter-modules (constat transversal, pas une simple extraction)

   **Où ça existe actuellement :** les clés localStorage d'un module sont lues **en dur** par d'autres modules :
   - `notificationCenter.js` l.121-137 lit `ao3h:bookmarkVault:data`, `ao3h:laterShelf:items`, `ao3h:rt:history`
   - `dataCollection.js` l.26-29 lit `rt:history`, `ficAppreciation:kudosed`, `bookmarkVault:data`, `activityPanel:sessions`
   - côté browse : `userHistoryFilters.js` lit les APIs `window.AO3H_Modules.*` (kudosTracker, bookmarkVault, laterShelf, readingTracker) — dont certaines n'existent nulle part (documenté comme no-op hérité)

   **Ce que ça fait :** couplage silencieux : si `bookmarkVault` renomme sa clé ou change son schéma, `notificationCenter` et `dataCollection` cassent sans erreur.

   **Pourquoi partager :** il faut une source de vérité unique pour ces clés/schémas.

   **Nom proposé :** a minima `lib/storage/keys.js` (constantes de clés + doc du schéma de chaque bucket) ; idéalement, chaque module expose une API de lecture (comme `AO3H.ficAppreciation` le fait déjà) et les consommateurs cessent de lire le storage d'autrui.

   **Emplacement proposé :** `lib/storage/keys.js`

   **Importeurs potentiels :** `notificationCenter`, `dataCollection`, `userHistoryFilters`, `laterShelfStore`, `bookmarkVault`, `readingTracker`.

   **Différences à harmoniser :** formats d'items divergents déjà visibles (`item.wid || item.id || item` dans notificationCenter = trois schémas historiques du même bucket).

   **Risques :** moyen — c'est un chantier de contrat, à faire progressivement ; commencer par les constantes de clés (zéro risque), puis les APIs.


---


#### E8. Événements custom inter-modules

   **Où ça existe actuellement :** noms d'événements en chaînes dispersées : `ao3h:kudosGiven` (kudosTracker l.36), `ao3h:statusChanged` (multiStatusTracker l.86/93), `ao3h:workFinished` (markAsFinished l.33), `ao3h:bookmarkAdded` (organizationTools l.312), `ao3h:notes-hidden`/`ao3h:notes-visible`/`ao3h:work-visible` (hideByTags), `ao3h:settingsChanged` (hideByTags, skipWorks), `ao3h:open-*-manager` (hideByTags), `ao3h:hidden-works-export/import` (skipWorks).

   **Ce que ça fait :** bus d'événements implicite entre modules via `document`/`window`.

   **Pourquoi partager :** une typo dans un nom = un couplage silencieusement rompu ; `lib/utils/event-bus.js` existe déjà mais n'est pas utilisé par ces modules.

   **Nom proposé :** `lib/utils/event-names.js` (constantes) ou adoption du `Bus` existant.

   **Emplacement / importeurs :** `lib/utils/` ; tous les modules cités.

   **Différences à harmoniser :** deux conventions de nommage coexistent (`camelCase` vs `kebab-case`).

   **Risques :** quasi nul pour les constantes.


---------------------------------------------------------------------------


### F. À SURVEILLER (library)

| Élément | Où | Pourquoi attendre |
|---|---|---|
| Tri de blurbs dans la liste (title/words/date/fandom) | `markedForLaterStatus.js` → `sortBlurbs()` l.158-185 · `organizationTools.js` → `_sortBlurbs()` l.267-285 | Même squelette (extraire les `li`, trier, ré-appender) mais modes différents ; extraction possible en `lib/ao3/blurb-sort.js` (comparateurs nommés) si un 3ᵉ consommateur apparaît (sortingAndFiltering ?). |
| Ancre d'injection des toolbars (`#main > h2, #main > h3` + `insertAdjacentElement('afterend')`) | `statusIndicators`, `readingStatusTracking`, `organizationTools` (×3), `markedForLaterStatus`, `noteManagement` | Micro-pattern répété ~7× dans bookmark-vault/later-shelf ; un helper `insertAfterMainHeading(el)` dans `lib/utils/dom.js` est envisageable mais gain limité. |
| Barre de recherche filtrante sur blurbs (input + compteur + hide) | `readingStatusTracking._injectNoteSearch()` l.94-124 · `noteManagement.injectNotesSearch()` l.29-68 | **Doublon fonctionnel réel dans le même module** (deux recherches de notes concurrentes dans bookmarkVault !) — à fusionner d'abord au niveau produit, puis voir si le widget devient partageable. |
| Agrégation stats de lecture (`calculateStreak`, tops par comptage) | `readingStats.js`, `dataCollection.js` (activity-panel) vs `readingDashboard.js` (fandomCounts/tagCounts) vs `historyAnalytics.js` | Trois modules calculent des « tops fandoms/tags » sur des sources différentes ; candidat `lib/ao3/reading-stats.js` seulement si les sources de données sont d'abord unifiées (voir E7). |
| Masquage/restauration de blurbs avec mémoire du `display` d'origine | `_ficAppreciation.js` l.124-145 (`hiddenBlurbs` Map) · `historyAnalytics.js` l.145-186 (`_originalDisplays`) · versions simples (`style.display='none'` + dataset) dans statusIndicators, noteManagement, readingStatusTracking, organizationTools | Pattern « hide/restore » répété avec 3 niveaux de sophistication ; un helper `lib/utils/dom.js` (`hideElement/restoreElement`) est possible, mais la sémantique (dataset marker par module pour le cleanup) diffère. |


---------------------------------------------------------------------------


### G. À LAISSER DANS LE MODULE (library)

   - `STATUSES` et logique 7 statuts (`multiStatusTracker.js`) — vocabulaire métier de ficAppreciation.
   - Seuils d'achievements et calcul de streak (`readingStats.js`) — métier activity-panel (le streak pourrait servir ailleurs, mais pas de 2ᵉ consommateur).
   - Heatmap, couleurs de récence, dividers de session (`historyAnalytics.js`, `timelineVisualization.js`) — métier reading-timeline.
   - Quiet-hours, purge du feed 90 j, confetti/sons (`notificationCenter.js`) — métier notification-center.
   - Anneau de progression SVG (`statusIndicators.js` l.120-153) — présentation propre à bookmark-vault.
   - Logique de file d'attente binge (`_fanficBingeMode.js`) — métier du module.
   - Migration/scan de la page bookmarks vers le cache (`statusIndicators._scanAndCache`) — proche de `parsers.parseBookmarksPageHTML` mais opère sur le DOM live ; à garder (mentionner la parenté en commentaire).
   - Widgets du dashboard (recent works, WIP tracker…) — métier reading-dashboard.


---------------------------------------------------------------------------


### H. SYNTHÈSE FINALE — plan d'extraction consolidé (browse + library)

Par ordre de rentabilité/risque croissant :

**Zéro risque, gains immédiats :** A9+D4 (`lib/utils/json-file.js`, ~12 consommateurs) · A6 (`makeFlagsCfg`) · E8 (constantes d'événements) · E7 phase 1 (constantes de clés).

**Mécanique, très rentable :** A5+D3 (`lib/storage/module-settings.js`, ~14 copies) · D5 (convergence `lsGet/lsSet`, ~25 copies) · E3 (`lib/ui/status-badge.js`, ~11 copies).

**Connaissance AO3 :** A1 (`lib/ao3/work-stats.js`) · E1 (`lib/ao3/work-page.js`) · E2 (`parseChapterCount`) · A2+D1 (converger work-ID vers parsers.js, ~20 copies, **sauf skipWorks**) · A3+D2 (gardes de route uniques) · A4 (`findAllBlurbs`) · A10 (pagination) · A11 (constantes warnings).

**UI partagée :** E4 (notifications) · E5 (format-date) · E6 (bulk-select) · A7 (mirrored-list) · A8 (list-manager — le plus gros, en dernier).

**Chantier continu :** convergence des MutationObservers vers `observe()`/`watchNewBlurbs` (D6, ~20 blocs) · E7 phase 2 (APIs publiques au lieu de lectures croisées du storage).

Aucune extraction n'a été effectuée — ce rapport attend ton autorisation avant toute modification de code.


===========================================================================


## ANALYSE DES MODULES `src/modules/appearance`
Modules analysés : `visual-preferences` (8 sous-modules), `backup-and-sync` (4), `theme-builder` (4), `fic-downloader` (5) — 25 fichiers JS.

---

### I. CONFIRMATIONS DES ÉTAPES 1 ET 2
#### I1. Extraction du work ID (A2/D1) — le total monte à ~25 copies

Appearance ajoute 5 copies : `individualDownloads.js` → `getWorkIdFromBlurb()` l.206 · `offlineLibrary.js` → `getWorkId()` l.141 · `batchDownload.js` et `completePageDownload.js` (équivalents) · `downloadEnhancements.js` (l.908, inline). Toujours zéro import de `lib/ao3/parsers.js`.


---


#### I2. Gardes de route (A3/D2) — encore deux définitions fausses ou divergentes

   - `individualDownloads.js` → `isListingPage()` l.73 : `/\/(works|bookmarks|series|tags)/` — **matche aussi les pages de work individuelles** (même bug latent que `statusIndicators` à l'étape 2 : les icônes ⬇️ sont ajoutées sur des pages non prévues si des blurbs y existent).
   - `offlineLibrary.js` → `isWorkPage()` l.137 — 8ᵉ copie du test `/^\/works\/\d+/`.


---


#### I3. Lecture des réglages de module (A5/D3) — le total monte à ~17 copies

3 nouvelles variantes : `_backupAndSync.js` → `cfg()` l.53 · `_themeBuilder.js` → `tbCfg()` l.68 · `_ficDownloader.js` → `cfg()` l.59. **Incohérence notable :** la version ficDownloader ne lit **que** `W.AO3H_Config` et ignore complètement `ao3h:mod:ficDownloader:settings` — les réglages du panneau ne sont donc probablement jamais lus par ce module (symptôme direct de la non-centralisation ; à vérifier au moment de l'harmonisation).


---


#### I4. `lsGet`/`lsSet` locaux (D5)

`_themeBuilder.js` l.55-60 exporte sa propre paire `lsGet/lsSet` (consommée par ses 4 sous-modules) — doublon de plus de `lib/utils/index.js`.


---


#### I5. Téléchargement de fichier (A9/D4) — le total monte à ~18 copies, et le helper cible existe déjà

`dataTransfer.js` → `downloadFile(content, filename, type)` l.217-225 est **exactement** le helper générique proposé en A9/D4 — il suffit de le déplacer dans `lib/utils/json-file.js` (ou `lib/utils/download.js` vu qu'il couvre CSV/HTML). Copies supplémentaires du pattern blob→a.click : `individualDownloads.js` l.184-193 · `batchDownload.js` l.343 · `completePageDownload.js` l.287 · `themeManagement.js` l.404 · `downloadEnhancements.js` l.268.


---


#### I6. Extraction titre/auteur (E1) — confirmé avec 7 copies de plus

`a[rel="author"]` est requêté dans : `individualDownloads.js` l.220 · `batchDownload.js` l.208 · `completePageDownload.js` l.117 · `downloadEnhancements.js` l.190 et l.908 · `offlineLibrary.js` l.241 · `dataTransfer.js` l.110. Le futur `lib/ao3/work-page.js` doit donc inclure `getWorkAuthor()`, et `lib/ao3/parsers.js` un `getBlurbTitleAuthor(blurb)`.


---


#### I7. Dates relatives (E5) — 4ᵉ implémentation

`statsDisplayFormat.js` → `_getRelativeTime()` l.75-85 (« X years/months/days ago ») s'ajoute à `kudosDisplay._relativeDate`, `statusIndicators` (inline) et `historyAnalytics` (buckets). Quatre granularités différentes pour le même concept.


---------------------------------------------------------------------------


### J. VERDICTS RENVERSÉS PAR L'ÉTAPE 3
Deux candidats classés « rester dans le module » aux étapes précédentes changent de catégorie :

---

#### J1. `escapeHtml` — devient À EXTRAIRE (6 copies)

   **Où :** `filterWarnings.js` l.43 (browse) · `individualDownloads.js` l.200 · `batchDownload.js` l.438 · `customStyling.js` l.445 · `themeManagement.js` l.410 · `typographySystem.js` l.184.

   **Ce que ça fait :** échappe une chaîne pour insertion dans du HTML.

   **Pourquoi partager :** 6 copies, **deux techniques différentes** (regex de remplacement vs `div.textContent → innerHTML`), et la version regex de theme-builder n'échappe pas les guillemets (`"`) alors qu'elle est injectée dans des attributs `value="…"` (`typographySystem.js` l.116) — bug de sécurité/robustesse latent qu'une version unique corrigerait.

   **Nom proposé :** ajouter `escapeHtml(str)` à `lib/utils/dom.js` (existant).

   **Emplacement / importeurs :** `lib/utils/dom.js` ; les 6 fichiers ci-dessus.

   **À harmoniser :** prendre la version regex complète (`& < > " '`).

   **Risques :** faible ; vérifier les sorties visibles (aucun changement attendu sauf guillemets désormais échappés).


---


#### J2. Toast — devient À EXTRAIRE (3 implémentations complètes)

   **Où :** `hiddenTags.js` → `toast()` l.785 (browse) · `dataTransfer.js` → `showToast()` l.375-395 + `showProgress/hideProgress` l.359-373 (avec suivi `_toastTimers`/`_toastEls` pour le cleanup) · `downloadEnhancements.js` l.99-100 et l.286-298 (copie du même mécanisme timers/els).

   **Ce que ça fait :** notification éphémère en bas de page (info/succès/erreur), avec fade-out et nettoyage au désenregistrement du module.

   **Pourquoi partager :** 3 implémentations, 2 jeux de classes CSS concurrents (`ao3h-hbt-toast` stylé dans hideByTags.css vs `ao3h-toast--*` stylé dans backupAndSync.css) — le style des toasts dépend aujourd'hui du module qui les affiche.

   **Nom proposé :** `toast.js` — export : `showToast(message, { type, duration })` retournant un handle ; gestion centralisée des timers pour le cleanup. CSS dans `lib/styles/toast.css`.

   **Emplacement / importeurs :** `lib/ui/toast.js` ; `hideByTags`, `dataTransfer`, `downloadEnhancements` (et à terme les `alert()` de skipWorks/organizationTools si décision produit).

   **À harmoniser :** durée (1 s vs 3 s), position, types.

   **Risques :** faible-moyen — bien reproduire le nettoyage des timers à la désactivation (le pattern `_toastTimers` existe pour ça).

---------------------------------------------------------------------------

### K. NOUVEAUX CANDIDATS (appearance)
#### K1. Récupération du HTML complet d'un work (`?view_full_work=true`)

   **Où ça existe actuellement :** 5 copies quasi identiques (fetch + AbortController + gestion d'erreur + garde `_active`) dans le même module :
   `individualDownloads.js` → `fetchWorkContent()` l.87-104 (retourne un Document parsé) · `offlineLibrary.js` → `fetchWorkHtml()` l.119-134 (retourne le texte) · `batchDownload.js` l.243 · `completePageDownload.js` l.137 · `downloadEnhancements.js` l.216.
   Cousin inter-onglets : `notificationCenter.js` (library) fetche aussi des pages de works et les parse (`parseWorkHTML()` l.142-158).

   **Ce que ça fait :** télécharge la page complète d'un work AO3, annulable, avec parsing optionnel.

   **Pourquoi partager :** 5 copies dans fic-downloader + 1 cousin dans library ; c'est de la connaissance requête AO3 — et `lib/ao3/requests.js` existe déjà (`createAO3Request`, headers, CSRF) sans être utilisé ici. Centraliser permettrait aussi d'ajouter un point unique de rate-limiting (important pour batchDownload qui enchaîne les fetches).

   **Nom proposé :** étendre `lib/ao3/requests.js` avec `fetchWorkFullHTML(workId, { signal })` et `fetchWorkDocument(workId, { signal })`.

   **Emplacement / importeurs :** `lib/ao3/requests.js` (existant) ; les 5 sous-modules de fic-downloader, `notificationCenter`.

   **À harmoniser :** valeur de retour (texte vs Document) — offrir les deux ; les gardes `_active`/AbortController restent chez l'appelant ou via `signal`.

   **Risques :** faible.


---


#### K2. Gabarit HTML du fichier téléchargé (interne à fic-downloader)

   **Où :** `individualDownloads.js` l.122-182 et `batchDownload.js` l.286-343 — deux gabarits HTML autonomes quasi identiques (~60 lignes chacun : styles inline, titre, auteur, summary, notes, chapitres) ; `completePageDownload.js` a une variante page d'index.

   **Ce que ça fait :** construit le fichier HTML standalone d'un work téléchargé.

   **Pourquoi partager :** duplication interne au module — toute retouche du gabarit doit être faite deux fois ; les fichiers produits divergeront.

   **Nom proposé :** fichier partagé **au niveau du module** : `src/modules/appearance/fic-downloader/workHtmlTemplate.js` — export `buildWorkHTML({ title, author, summary, notes, chaptersHTML })`. (Métier fic-downloader : ne pas mettre dans `lib/`.)

   **Importeurs :** individualDownloads, batchDownload, completePageDownload. Risque faible.


---


#### K3. Snapshot localStorage du namespace AO3H (interne à backup-and-sync, avec doublons)

   **Où :** `backupOperations.js` → `getAllAO3HelperData()` l.117-129 (+ variante `createSelectiveBackup` l.137-153) · `dataTransfer.js` → boucle identique dans `exportSettings()` l.233-241. Et **`automateBackup.js` duplique `createBackup()`/`restoreBackup()` de `backupOperations.js` quasi verbatim** (l.75-127 vs l.69-115) alors que le coordinateur lui injecte déjà `getAllData` — AutoBackup devrait déléguer entièrement à BackupOperations au lieu de recopier.

   **Ce que ça fait :** collecte toutes les clés localStorage du namespace (`ao3h`/`AO3H`) hors backups.

   **Pourquoi partager :** 3 copies du scan ; et la définition de « données AO3H » (filtre par `key.includes(NS)`) est une décision globale qui intéresse aussi un futur outil de debug/migration.

   **Nom proposé :** `lib/storage/snapshot.js` — export `collectNamespaceData({ exclude })` ; la déduplication AutoBackup↔BackupOperations est un refactoring interne au module, indépendant.

   **Importeurs :** backupOperations, dataTransfer, cloudSync (via `getAllData`). Risque faible.


---


#### K4. Chevauchement fonctionnel : `fandomHighlighting` (appearance) ≈ `tagHighlighting` (browse)

   **Où :** `visual-preferences/fandomHighlighting.js` (clé `ao3h:fandomHighlights`, entrées `{ name, color }`, cible `h5.fandoms a.tag`) vs `tagsDisplay/tagHighlighting.js` (clé `ao3h:tagHighlights`, entrées `{ pattern, colorIdx }`, cible `.tags a.tag`, menu contextuel).

   **Ce que ça fait :** les deux surlignent des tags favoris par correspondance de texte, avec observer et restauration.

   **Pourquoi le signaler :** ce n'est pas du code partageable tel quel, c'est **la même fonctionnalité implémentée deux fois** avec deux stockages et deux UX. Extraire un moteur commun (`lib/ao3/tag-highlighter.js` : correspondance + application + restore + observer) est possible, mais la vraie question est produit : faut-il deux features distinctes ?

   **Recommandation :** décision produit d'abord (fusion ou différenciation claire), extraction du moteur ensuite. Risque de l'ignorer : les deux features entrent en conflit visuel sur les tags de fandom (les deux posent un `background` inline).


---------------------------------------------------------------------------


### L. À SURVEILLER / À LAISSER (appearance)

| Élément | Où | Verdict |
|---|---|---|
| Bascule de classes CSS sur `<html>` pilotée par un `classMap` | `statsVisibility.js`, `datesTimestamps.js` (jumeaux à 95 %), + toggles simples dans `minimalHeader`, `hoverReveal`, `statsOnChaptersList`, `compactModeTags` (browse) | **Laisser** — le pattern est trivial (3 lignes) ; un helper n'apporterait presque rien. Les deux jumeaux pourraient fusionner en une classe interne à visual-preferences si retouchés. |
| `applyCSS`/`removeCSS` (injection d'un `<style>` identifié) | `_themeBuilder.js` l.80-94 | **Laisser** — proche de `css()` de `lib/utils/index.js` mais sémantique différente (CSS utilisateur dynamique remplaçable vs styles de module) ; ne pas mélanger. |
| Promisification `chrome.storage.sync` | `cloudSync.js` l.53-79 | **Laisser** — un seul consommateur, spécifique extension. |
| theme-builder indépendant de `lib/themes/*` | `_themeBuilder.js` (note d'en-tête : « indépendant de lib/themes », conservé en Phase 24) | **À surveiller** — il existe déjà une bibliothèque partagée de thèmes (`lib/themes/engine`, `builtin`, `templates`) que le module n'utilise pas ; convergence = décision produit documentée, pas simple extraction. |
| Migration legacy (flags → settings) | `_visualPreferences.js` → `migrateFromOldModules()` l.160-207 | **Laisser** — migration ponctuelle propre au module. |
| `DEFAULTS` const + `getDefaults()` dupliqués dans le même fichier | `_visualPreferences.js` l.65-80 vs l.116-133 | **Laisser** (mais noter : doublon intra-fichier à fusionner à la prochaine retouche). |
| Chiffrement/compression de backups (WebCrypto, CompressionStream) | `backupOperations.js` l.170-309 | **Laisser** — métier backup ; à ne sortir en `lib/utils/crypto.js` que si un 2ᵉ consommateur apparaît. |
| Presets de visibilité | `visibilityPresets.js` | **Laisser** — vocabulaire métier visual-preferences. |
| File d'attente/format/Kindle | `downloadEnhancements.js`, `batchDownload.js` | **Laisser** — métier fic-downloader. |


---------------------------------------------------------------------------


### M. MISE À JOUR DE LA SYNTHÈSE FINALE (remplace les compteurs de la section H)

État consolidé après browse + library + appearance (reste à analyser : `explore`, `navigate`, `reading`) :

| Extraction | Copies recensées | Fichier cible | Palier |
|---|---|---|---|
| Work ID (A2/D1/I1) | ~25 | `lib/ao3/parsers.js` (existant) | 3 |
| Réglages de module (A5/D3/I3) | ~17 | `lib/storage/module-settings.js` | 2 |
| lsGet/lsSet JSON (D5/I4) | ~27 | `lib/utils/index.js` (existant) | 2 |
| Téléchargement fichier (A9/D4/I5) | ~18 | `lib/utils/json-file.js` (le code existe : `dataTransfer.downloadFile`) | 1 |
| Badge sur heading (E3) | ~11 | `lib/ui/status-badge.js` | 2 |
| Gardes de route (A3/D2/I2) | ~12 (dont 3 boguées) | `lib/ao3/parsers.js` (existant) | 3 |
| escapeHtml (J1) | 6 | `lib/utils/dom.js` (existant) | 1 |
| Toast (J2) | 3 implémentations | `lib/ui/toast.js` | 4 |
| Dates relatives (E5/I7) | 4 | `lib/utils/format-date.js` | 4 |
| Titre/auteur de work (E1/I6) | ~11 | `lib/ao3/work-page.js` | 3 |
| Fetch work complet (K1) | 5 (+1 cousin) | `lib/ao3/requests.js` (existant) | 3 |
| MutationObserver blurbs (D6) | ~22 blocs | `observe()` existant + `lib/utils/dom-observer.js` | 5 |

Nouvelles entrées internes aux modules (pas dans `lib/`) : gabarit HTML fic-downloader (K2), déduplication AutoBackup↔BackupOperations (K3), fusion des deux recherches de notes de bookmarkVault (étape 2, section F).

Décisions produit à trancher avant extraction : fandomHighlighting vs tagHighlighting (K4) · theme-builder vs lib/themes (L) · formes exactes des Archive Warnings (A11).

Aucune extraction n'a été effectuée — analyse seule, en attente d'autorisation.


===========================================================================


## ANALYSE DES MODULES `src/modules/explore`
Modules analysés : `fic-peek`, `similar-fics`, `surprise-me`, `search-enhancer` (4 sous-modules), `pov-tracker` (2), `trope-games` (5) — 17 fichiers JS.

---

### N. CONFIRMATIONS — les compteurs continuent de monter
#### N1. `escapeHtml` (J1) — 6 → **14 copies**

Explore ajoute **8 copies** : `surpriseMe.js` l.162 · `searchAutocomplete.js` l.88 · `relatedSearches.js` l.85 · `tropeRoulette.js` l.43 · `tropeHoroscope.js` l.67 · `tropeBingoPatterns.js` l.141 · `tropeStatistics.js` l.47 · `tropeAchievements.js` l.47 (les 5 copies trope-games sont identiques entre elles, dans le même module). C'est désormais la fonction la plus dupliquée du projet après lsGet/lsSet — l'extraction J1 (`lib/utils/dom.js`) passe au palier 1.


---


#### N2. `lsGet`/`lsSet` locaux (D5) — ~27 → **~34 copies**

+7 : `_searchEnhancer.js` l.44 (exposé via bridge window à ses enfants) · `searchAutocomplete.js` l.63 · `relatedSearches.js` l.50 · `resultsSorting.js` l.57 (avec fallback sur le bridge) · `_tropeGames.js` l.63 (idem bridge) · `_povTracker.js` l.57 · `povAnalysis.js` l.51.


---


#### N3. Lecture des réglages (A5/D3/I3) — ~17 → **~23 copies**

+6 : `ficPeek.js` → `cfg()` l.114 · `similarFics.js` l.55 · `surpriseMe.js` l.32 · `_povTracker.js` l.61 · et le pattern « enfant qui lit la clé du parent » (`readCfg()` lisant `ao3h:mod:searchEnhancer:settings`) recopié 3× à l'identique dans `resultsSorting.js` l.47, `seriesGrouping.js` l.31, `searchAutocomplete.js` l.54 — même besoin que `makeFlagsCfg` (A6) mais version localStorage.


---


#### N4. Work ID (A2/D1/I1) — ~25 → **~29 copies**, avec une 3ᵉ technique

+4 : `surpriseMe.js` → `getWorkId()` l.64 · `ficPeek.js` → `getWorkUrlFromBlurb()` l.40 (variante URL complète) · `tropeStatistics.js` l.80 (depuis pathname) · `similarFics.js` l.251 (pathname) **et** l.341 : extraction depuis `blurb.id` (`work_12345`) — une **troisième technique** d'extraction qui n'existe nulle part ailleurs, à intégrer comme fallback dans `extractWorkIdFromBlurb` de parsers.js.


---


#### N5. Gardes de route (A3/D2/I2) — +5 définitions divergentes

`surpriseMe.js` l.41 (la plus complète du projet : inclut `/readings` et `/search`) · `resultsSorting.js` l.68 (teste aussi `location.search.includes('work_search')`) · `seriesGrouping.js` l.40 (minimale) · `relatedSearches.js` → `isSearchPage()` l.80 (recouvre `parsers.isSearchRoute` existant) · `similarFics.js` → `isWorkPage()` l.70 (avec fallback `#workskin`, comme readingDashboard). **Total projet : ~17 définitions** pour 3 concepts (listing / work / search).


---


#### N6. Parsing des stats (A1) — 5ᵉ technique

`resultsSorting.js` → `parseStats()` l.74-87 extrait kudos/hits/bookmarks **par regex sur `blurb.textContent`** (`/Kudos:\s*([\d,]+)/`) — technique fragile (dépend des libellés localisés AO3) là où les 4 copies browse utilisent `dd.kudos` etc. L'harmonisation A1 corrigerait au passage cette fragilité.


---


#### N7. Dates relatives (E5) — 5ᵉ implémentation

`searchAutocomplete.js` → `formatTs()` l.92-98 (« just now / Xm ago / Xh ago / Xd ago » — granularité minutes, inédite). `tropeStatistics.js` → `todayKey()` l.60 réimplémente aussi le format YYYY-MM-DD localement (2×, l.60 et l.71).


---


#### N8. Parse chapitres (E2), méta de blurb (E1), CSRF, cross-storage (E7)

   - `surpriseMe.js` l.94-99 : 5ᵉ copie du parsing `dd.chapters` (test complet `m[1] === m[2]`).
   - `surpriseMe.js` → `getWorkMeta()` l.115-122 (titre/auteur/summary/words/kudos depuis un blurb) et `similarFics.js` → `getRating`/`getWordCount`/`getFandomTag`/`getKeyTags`/auteur l.78-236 (depuis la page d'un work) : confirment E1 (`lib/ao3/work-page.js`) et le besoin d'un `getBlurbMeta(blurb)` dans parsers.js.
   - `similarFics.js` → `getAuthToken()` l.264 : **3ᵉ copie** du CSRF alors que `parsers.getCSRFToken` **et** `requests.getCSRF` existent tous les deux (doublon même à l'intérieur de `lib/` !).
   - E7 confirmé : `similarFics.js` l.39 et `surpriseMe.js` l.52 lisent en dur `ao3h_seen_works_v1` (clé de readingTracker) — 2 lecteurs croisés de plus.


---


#### N9. Cache TTL — la lib existe mais n'est pas utilisée

`relatedSearches.js` → `cacheGet`/`cacheSet` (TTL 7 j) l.62-78 · `povAnalysis.js` → cache 7 j l.18-19 · `ficPeek.js` → double cache Map + sessionStorage l.29-34. Or `lib/utils/index.js` exporte `createCache(ttlMs)` et `lib/storage/cache.js` existe. Même situation que les observers : converger vers l'existant.


---------------------------------------------------------------------------


### O. NOUVEAUX CANDIDATS (explore)
#### O1. Requêtes AO3 authentifiées (POST avec CSRF) et wrapper GM_xmlhttpRequest

   **Où :**
   - `similarFics.js` → `runRequest()` l.269-304 (promisification de `GM_xmlhttpRequest` avec abort tracking) + `markForLater()` l.307-324 (POST `/works/{id}/mark_for_later` avec token) + `fetchSimilarWorks()` l.327-333.
   - Cousin library : `kudosTracker.js` → POST `/works/{id}/kudos` avec token (l.133-166, via `fetch`).
   - **Existant sous-utilisé :** `lib/ao3/requests.js` (`getCSRF`, `createAO3Headers`, `createAO3Request` — 327 lignes déjà écrites pour exactement ça).

   **Ce que ça fait :** actions AO3 authentifiées (kudos, mark-for-later) et fetch de pages de recherche.

   **Pourquoi partager :** deux modules re-codent les headers/CSRF/gestion d'erreur ; trois techniques de transport coexistent (`fetch`, `GM_xmlhttpRequest`, et `createAO3Request` inutilisé).

   **Nom proposé :** compléter `lib/ao3/requests.js` avec `postAO3Action(path, { token })` + y rapatrier le wrapper GM promisifié ; ajouter `markForLater(workId)` / `giveKudos(workId)` dans un `lib/ao3/actions.js` si on veut une couche sémantique.

   **Emplacement / importeurs :** `lib/ao3/requests.js` ; `similarFics`, `kudosTracker`, futurs boutons d'action.

   **À harmoniser :** transport (fetch vs GM) — à trancher une fois pour toutes dans requests.js.

   **Risques :** moyen — les deux endpoints ont des corps différents (`_method=patch` pour MFL) ; tester les deux actions réelles.


---


#### O2. Parse des blurbs depuis un HTML fetché

   **Où :** `similarFics.js` → `parseWorkBlurbs(html)` l.336-361 (blurbs complets : id, titre, auteur, kudos, mots, fandoms/relationships/freeforms) · cousins existants : `parsers.parseReadingsPageHTML`, `parsers.parseBookmarksPageHTML` (lib), `notificationCenter.parseWorkHTML` (library), `ficPeek.extractPreviewText` l.126-173 (extraction du texte).

   **Ce que ça fait :** DOMParser sur une page AO3 fetchée + extraction structurée.

   **Pourquoi partager :** 4ᵉ parseur de page fetchée ; `parsers.js` héberge déjà les deux premiers.

   **Nom proposé :** ajouter `parseWorkBlurbsFromHTML(html)` à `lib/ao3/parsers.js` (réutilisant `getBlurbMeta` de E1).

   **Importeurs :** `similarFics`, `notificationCenter` ; risque faible.


---


#### O3. Chevauchement fonctionnel : badges de ratio de resultsSorting ≈ ficEngagement

`resultsSorting.addRatioBadges()` l.108-122 injecte « X% eng. » (kudos÷hits) sur les blurbs — c'est la métrique « kudos ratio » de `engagementMetrics.js` (browse), avec un autre libellé, un autre seuil d'affichage et un autre parseur de stats. Si l'utilisateur active ficEngagement + searchEnhancer, il obtient **deux badges de ratio différents côte à côte**. Comme K4 (highlighting) : décision produit (fusionner ou différencier), puis convergence technique via A1.


---


#### O4. Vocabulaires de tropes — 3 listes parallèles

`TROPE_LIST` (50 entrées, `_tropeGames.js` l.47) · `CO_TAGS` (10 entrées avec co-tags, `relatedSearches.js` l.106) · `BUILTIN_BUNDLES` (8 bundles, `_filterManager.js`, browse). Trois vocabulaires curatés de tropes qui se recouvrent (Slow Burn, Enemies to Lovers, Hurt/Comfort, Found Family…) sans se référencer. Candidat : `lib/ao3/constants.js` (avec A11) ou au minimum un commentaire croisé. Décision produit sur l'alignement ; l'extraction mécanique n'a de sens que si les listes doivent rester synchrones.


---


#### O5. Calcul de streak — 2ᵉ implémentation

`tropeStatistics.js` → `calcStreak()` l.65-77 vs `readingStats.calculateStreak()` (activity-panel, library). Même concept (jours consécutifs), formats de dates différents (YYYY-MM-DD vs toDateString). Le candidat « agrégation stats de lecture » de l'étape 2 (section F) gagne un 2ᵉ consommateur → si un 3ᵉ apparaît dans `reading`, extraire `lib/utils/streak.js` (ou l'inclure dans format-date).


---------------------------------------------------------------------------


### P. À SURVEILLER (explore)

| Élément | Où | Note |
|---|---|---|
| Restauration d'ordre par marqueurs-commentaires | `resultsSorting.js` l.205-213 + `markedForLaterStatus.rememberOriginalPositions()` (library l.41-51) | 2ᵉ copie confirmée du pattern « comment marker + restore » ; renforce le candidat `lib/ao3/blurb-sort.js` de l'étape 2 (tri + restauration ensemble). |
| Bridge window de coordination (`W.AO3H_SearchEnhancer`, `W.AO3H_TropeGames`, `W.AO3H_PovTracker`, `W.AO3H_SurpriseMe`…) | coordinateurs explore + `_laterShelf`, `_activityPanel` (library) | Pattern hérité documenté (Phase 26 prévue pour les supprimer) — ne pas étendre ; les nouvelles extractions (module-settings, keys) le rendront inutile. |
| Panneau repliable injecté après le meta du work (`createSimilarPanel`, panneau tropeStatistics) | `similarFics.js` l.393-425, `tropeStatistics.js` l.112+ | 2 panneaux similaires ; attendre un 3ᵉ avant un `lib/ui/work-panel.js`. |
| Double cache mémoire + sessionStorage | `ficPeek.js` l.29-34 | Convergerait naturellement vers `createCache`/`lib/storage/cache.js` (N9). |


---------------------------------------------------------------------------


### Q. À LAISSER DANS LE MODULE (explore)

   - Heuristiques POV (`SIGNALS` regex, classification) — cœur métier pov-tracker.
   - Contenu de `TROPE_LIST`, horoscope/taglines, grilles bingo, roulette — métier trope-games (seule la *liste* est concernée par O4).
   - Scoring de similarité (`scoreWork`, seuils, buckets de mots) — métier similar-fics.
   - Extraction d'extrait (`extractPreviewText`, modes 100/250 mots, spoiler blur) — métier fic-peek.
   - Logique de tirage aléatoire + préview inline — métier surprise-me.
   - Groupement de séries (`groupSeriesByWork`) — métier series-grouping.
   - `CO_TAGS` (contenu) et suggestions basées historique — métier related-searches.


---------------------------------------------------------------------------


### R. SYNTHÈSE MISE À JOUR (remplace le tableau de la section M)

Après browse + library + appearance + explore (reste : `navigate`, `reading`) :

| Extraction | Copies | Fichier cible | Palier |
|---|---|---|---|
| lsGet/lsSet JSON (D5/N2) | ~34 | `lib/utils/index.js` (existant) | 2 |
| Work ID (A2/D1/I1/N4) | ~29 | `lib/ao3/parsers.js` (existant, + fallback `blurb.id`) | 3 |
| Réglages de module (A5/D3/I3/N3) | ~23 | `lib/storage/module-settings.js` (+ variante « enfant lit le parent ») | 2 |
| Téléchargement fichier (A9/D4/I5) | ~18 | `lib/utils/json-file.js` (code existant dans dataTransfer) | 1 |
| Gardes de route (A3/D2/I2/N5) | ~17 | `lib/ao3/parsers.js` (existant) | 3 |
| escapeHtml (J1/N1) | 14 | `lib/utils/dom.js` (existant) | **1** (promu) |
| Badge sur heading (E3) | ~11 | `lib/ui/status-badge.js` | 2 |
| Titre/auteur/méta de work (E1/I6/N8) | ~13 | `lib/ao3/work-page.js` + `getBlurbMeta` dans parsers | 3 |
| Stats de blurb (A1/N6) | 5 techniques | `lib/ao3/work-stats.js` | 3 |
| Chapitres (E2/N8) | 5 | `parseChapterCount` dans parsers | 3 |
| Dates relatives (E5/I7/N7) | 5 | `lib/utils/format-date.js` | 4 |
| CSRF (N8) | 3 copies + 2 dans lib | déduplication **dans lib/** d'abord (parsers vs requests) | 1 |
| Requêtes AO3 authentifiées (O1/K1) | 8+ | `lib/ao3/requests.js` (existant) | 3 |
| Cache TTL (N9) | 3 | `createCache` existant / `lib/storage/cache.js` | 2 |
| MutationObserver blurbs (D6) | ~24 blocs | `observe()` existant + `watchNewBlurbs` | 5 |
| Toast (J2) | 3 | `lib/ui/toast.js` | 4 |

Chevauchements produit à trancher : fandomHighlighting≈tagHighlighting (K4) · ratio badges resultsSorting≈ficEngagement (O3) · 3 vocabulaires de tropes (O4) · theme-builder vs lib/themes · Archive Warnings (A11).

Constat inter-lib : `parsers.getCSRFToken` et `requests.getCSRF` se dupliquent **à l'intérieur même de `lib/ao3/`** — première déduplication à faire, elle ne touche aucun module.

Aucune extraction n'a été effectuée — analyse seule, en attente d'autorisation.


===========================================================================


## ANALYSE DES MODULES `src/modules/navigate`
Modules analysés : `fic-actions`, `series-helper` (2 sous-modules), `keyboard-shortcuts`, `main-navigation` (3), `comment-kit` (6), `user-relationships` (6) — 24 fichiers JS.

---

### S. CONFIRMATIONS
#### S1. Lecture des réglages (A5/D3/I3/N3) — ~23 → **~33 copies**, et un contre-exemple vertueux

+10 : `ficActions.js` l.65 · `keyboardShortcuts.js` l.32 · `seriesProgress.js` l.239 (via `wrappedStorage.lsGet`) · et le pattern « enfant lit la clé du parent » recopié **6× à l'identique** dans comment-kit (`commentComposing.js` l.54, `draftManagement.js` l.50, `threadManagement.js` l.43, `commentHighlighting.js` l.40, `commentConfiguration.js` l.35, `commentNavigation.js` l.33).
**Contre-exemple vertueux :** `user-relationships` a fait ce que les autres modules n'ont pas fait — un fichier partagé local (`userRelationshipsSettings.js`, 14 lignes) que ses 6 enfants importent. C'est exactement la forme que `lib/storage/module-settings.js` généraliserait ; comment-kit et search-enhancer devraient a minima copier ce pattern en attendant.


---


#### S2. `lsGet`/`lsSet` locaux (D5/N2) — ~34 → **~46 copies**

+12 : `_seriesHelper.js` l.40 (variante préfixée `ao3h:sh:`) · `threadManagement.js` l.55 · et les paires get/save inline de `authorPreference.js` l.55, `authorTracking.js` l.43/48/53 (3 clés), `blockingInterface.js` l.94, `commentHiding.js` l.32, `ficActions.js` l.77/266 (2 clés), `quickLinks.js` l.25, `blocklistManagement.js` l.41.


---


#### S3. Extraction d'auteur (E1/I6) — ~11 → **~19 copies**

+6 requêtes `a[rel="author"]` : `authorBlocking.js` → `getAuthorName()` l.43 · `authorPreference.js` l.76 · `authorTracking.js` l.110 · `blockingInterface.js` l.111 · `commentHighlighting.js` l.59 · (+ la variante `.authors a[href*="/users/"]`). Tout le module user-relationships repose sur cette extraction — le `getBlurbAuthor(blurb)` proposé en E1/I6 est sa fondation naturelle.


---


#### S4. Work ID via `blurb.id` — la 3ᵉ technique gagne un 2ᵉ consommateur

`ficActions.js` l.194-196 et l.244-246 : `li.work.blurb.group[id^="work_"]` + `.replace('work_', '')` — même technique que `similarFics.parseWorkBlurbs` (étape 4). Confirme l'ajout d'un fallback `blurb.id` dans `extractWorkIdFromBlurb` (parsers.js). Total work ID : **~31 copies**.


---


#### S5. Actions AO3 authentifiées (O1) — 3ᵉ action, 3ᵉ transport

`ficActions.js` l.203-230 : POST `/subscriptions` avec token CSRF via `fetch` + `URLSearchParams`. On a donc maintenant **kudos** (kudosTracker, fetch + body string), **mark-for-later** (similarFics, GM_xmlhttpRequest) et **subscribe** (ficActions, fetch + URLSearchParams) — trois actions authentifiées, trois écritures différentes des mêmes headers. `lib/ao3/actions.js` (par-dessus `requests.js`) gagne son 3ᵉ consommateur et se justifie pleinement.


---


#### S6. Gardes de route (A3/D2) — 3ᵉ garde boguée

`seriesProgress.js` → `isListingPage()` l.21 : `/^\/(works|tags|bookmarks|users|search)/` — matche aussi les pages de work et les profils (3ᵉ garde trop permissive après statusIndicators et individualDownloads). `blocklistManagement.js` → `isManagementPage()` l.148 introduit un nouveau type de page (profil/préférences) à ajouter au `parsers.js` centralisé. `ficActions.js` l.127 est le **seul module du projet** à utiliser `Routes.isWork()` de `lib/ao3/routes.js` (avec fallback inline) — preuve que la centralisation est consommable dès qu'elle existe.


---


#### S7. Export/import JSON (A9/D4/I5) — ~18 → **~20 copies**

`blocklistManagement.js` : export l.107-115 + import FileReader l.117-133.


---


#### S8. Managers de liste (A8) — 4ᵉ consommateur

`blocklistManagement.buildPanel()` l.49-145 : liste + compteur + input Add (avec Enter) + Remove par ligne + Export/Import JSON + Clear All avec confirm — c'est le squelette des 3 managers de hideByTags en version panneau inline (pas modale). L'API `list-manager` proposée en A8 doit donc prévoir un mode « inline » en plus du mode modal.


---


#### S9. Observers, badges, hide/restore

   - +10 blocs `MutationObserver` (authorBlocking l.112, authorPreference l.179, authorTracking l.155, commentHiding l.115, commentComposing l.362, draftManagement l.290, threadManagement l.300, commentHighlighting l.160, commentConfiguration l.89, seriesProgress l.229) → **~35 blocs** au total projet.
   - Badges sur heading (E3) : +2 (`ficActions` 🔔 Subscribed l.244-253, badges de `seriesProgress` — variante insérée après le lien série).
   - Hide/restore avec Map des `display` d'origine : +2 copies (`authorBlocking.js` l.32/51, pattern déjà vu dans ficAppreciation et historyAnalytics).


---------------------------------------------------------------------------


### T. NOUVEAUX CANDIDATS (navigate)
#### T1. Drag & drop de réordonnancement — 2ᵉ copie complète

   **Où :** `ficActions.js` → `applyButtonReordering()` l.273-353 (boutons d'action du work) vs `tagsReordering.js` (browse) l.91-153 (tags). Même squelette : `draggable=true`, poignée (⠿ / ⋮⋮), `dragover` avec insertion au point médian, sauvegarde de l'ordre en localStorage, restauration au chargement, cleanup.

   **Ce que ça fait :** réordonner des `<li>` par glisser-déposer avec persistance.

   **Pourquoi partager :** deux implémentations complètes (~60 lignes chacune) du même mécanisme, avec les mêmes subtilités (midpoint, classes de dragging) et deux styles de poignées incohérents.

   **Nom proposé :** `drag-reorder.js` — export : `makeListReorderable(ul, { itemKey(li), onOrderChanged(order), handleText })` retournant un cleanup.

   **Emplacement proposé :** `lib/ui/drag-reorder.js`

   **Importeurs potentiels :** `ficActions`, `tagsReordering` ; tout futur réordonnancement (widgets du dashboard, quick links).

   **À harmoniser :** persistance (clé + format) reste chez l'appelant ; unifier le glyphe de poignée.

   **Risques :** moyen-faible — bien tester la restauration d'ordre et le cleanup dans les deux modules.


---


#### T2. Store local du blocklist — duplication intra-module (4 copies)

   **Où :** la clé `userBlocker:list` est lue/écrite par 4 sous-modules avec 4 paires get/save locales : `authorBlocking.js` l.31-40 · `blocklistManagement.js` l.38-47 · `blockingInterface.js` l.38/94 · `commentHiding.js` l.28-33. Trois normalisent en lowercase, une non (`commentHiding` compare sans `.map(toLowerCase)` — **bug latent** : un username bloqué avec majuscules n'est pas masqué dans les commentaires).

   **Ce que ça fait :** liste des utilisateurs bloqués (le cœur du module).

   **Pourquoi partager :** même situation que hideByTags avant A7 — et le fichier `userRelationshipsSettings.js` montre déjà le bon pattern local.

   **Nom proposé :** fichier partagé **au niveau du module** : `user-relationships/blocklistStore.js` (get/add/remove/has, normalisation unique) — ou consommateur direct de `lib/storage/mirrored-list.js` (A7) si l'on veut la persistance user-scopée.

   **Importeurs :** les 4 sous-modules + `authorPreference` (événement `ao3h:blocking-changed`). Risque faible ; corrige le bug de casse au passage.


---


#### T3. `keyboardShortcuts` est déjà un service partagé — le documenter comme tel

`keyboardShortcuts.js` expose `W.AO3H_Keyboard.register()` / `W.AO3H_KeyboardShortcuts.register()` (l.13-16) consommés par chapter-navigation (reading) et surpriseMe (explore, via `W.AO3H_SurpriseMe.trigger`). C'est le seul « vrai » service inter-modules du projet avec filterManager. Pas d'extraction à faire, mais : (1) ses helpers `parseCombo`/`comboToString`/`matchesEvent` (l.68-91) sont candidats à `lib/utils/keyboard.js` si un module veut matcher des touches sans passer par le service ; (2) le bridge window devrait suivre le même chemin que les autres (Phase 26) vers un import ES.


---------------------------------------------------------------------------


### U. À SURVEILLER (navigate)

| Élément | Où | Note |
|---|---|---|
| Menu contextuel custom (clic droit) | `blockingInterface.js` (menu block/unblock sur les liens users) + `tagHighlighting.js` (browse, menu couleurs sur les tags) | 2ᵉ menu contextuel du projet — même squelette (createElement, position clientX/Y, fermeture clic extérieur). Candidat `lib/ui/context-menu.js` au 3ᵉ consommateur. |
| Panneau de gestion CRUD de templates | `commentComposing.js` l.149+ (add/edit/remove templates) | Parent de la famille « list manager » (A8/S8) — vérifier lors de l'extraction A8 si l'API couvre ce cas (édition en plus d'ajout/suppression). |
| Détection prev/next chapitre | `keyboardShortcuts.js` l.128-138 (`a[rel="prev"]`, `.chapter.previous a`…) + `seriesProgress.js` l.183-186 (mêmes sélecteurs pour la série) | Sélecteurs de navigation AO3 dupliqués 2× ; `reading/chapter-navigation` en aura forcément une 3ᵉ copie → à trancher à l'étape 6 (candidat `lib/ao3/parsers.js` → `findPrevNextLinks()`). |
| Parse « Part X of Y » | `seriesProgress.js` → `parsePartOf()` l.30-37 | Connaissance AO3 (format des liens de série) ; un seul consommateur pour l'instant — candidat parsers.js si un module library/reading lit aussi la progression de série (readingTracker `isSeriesRead` ?). À vérifier à l'étape 6. |
| Clé legacy avec fallback | `quickLinks.js` l.25-26 (STORAGE_KEY vs STORAGE_KEY_LEGACY) | Pattern de migration douce déjà vu dans `_visualPreferences` — si `module-settings.js` (A5) offre un paramètre `legacyKey`, ces deux cas sont couverts. |


---------------------------------------------------------------------------


### V. À LAISSER DANS LE MODULE (navigate)

   - Combos par défaut, overlay d'aide, flash visuel (`keyboardShortcuts.js`) — métier du module (le *service* reste chez lui).
   - Templates de commentaires par défaut, gestion des brouillons par work (`commentComposing`, `draftManagement`) — métier comment-kit.
   - Heuristique séquentiel/anthologie, bannière de série (`seriesProgress`) — métier series-helper.
   - Logique de préférence par auteur (favori/hide/compteur de lectures) (`authorPreference`) — métier user-relationships.
   - Injection de liens de nav dans le header (`addNavLinks`, `findPrimaryHeaderUL`) — spécifique main-navigation (les sélecteurs du header AO3 n'ont pas d'autre consommateur).
   - Mode hover/click des menus (`menuActivation`) — spécifique.


---------------------------------------------------------------------------


### W. SYNTHÈSE MISE À JOUR (remplace le tableau de la section R)

Après browse + library + appearance + explore + navigate (reste : `reading`) :

| Extraction | Copies | Fichier cible | Palier |
|---|---|---|---|
| lsGet/lsSet JSON (D5/N2/S2) | ~46 | `lib/utils/index.js` (existant) | 2 |
| Réglages de module (A5/D3/I3/N3/S1) | ~33 | `lib/storage/module-settings.js` (modes : direct, enfant→parent, legacyKey) | 2 |
| Work ID (A2/D1/I1/N4/S4) | ~31 | `lib/ao3/parsers.js` (+ fallback `blurb.id`) | 3 |
| MutationObserver blurbs (D6/S9) | ~35 blocs | `observe()` existant + `watchNewBlurbs` | 5 |
| Export/import fichier (A9/D4/I5/S7) | ~20 | `lib/utils/json-file.js` | 1 |
| Titre/auteur/méta (E1/I6/S3) | ~19 | `lib/ao3/work-page.js` + `getBlurbMeta`/`getBlurbAuthor` | 3 |
| Gardes de route (A3/D2/I2/N5/S6) | ~19 (dont 3 boguées) | `lib/ao3/parsers.js` (+ `isManagementPage`) | 3 |
| escapeHtml (J1/N1) | 14 | `lib/utils/dom.js` | 1 |
| Badge sur heading (E3/S9) | ~14 | `lib/ui/status-badge.js` | 2 |
| Actions AO3 authentifiées (O1/S5) | 3 actions × 3 transports | `lib/ao3/requests.js` + `lib/ao3/actions.js` | 3 |
| List manager (A8/S8) | 4 (3 modales + 1 inline) | `lib/ui/list-manager.js` | 4 |
| Stats de blurb (A1/N6) | 5 techniques | `lib/ao3/work-stats.js` | 3 |
| Chapitres (E2/N8) | 5 | `parseChapterCount` (parsers) | 3 |
| Dates relatives (E5/I7/N7) | 5 | `lib/utils/format-date.js` | 4 |
| Drag & drop réordonnancement (T1) | 2 complètes | `lib/ui/drag-reorder.js` | 4 |
| Toast (J2) | 3 | `lib/ui/toast.js` | 4 |
| CSRF (N8) | 3 + 2 dans lib | dédupliquer parsers↔requests d'abord | 1 |
| Cache TTL (N9) | 3 | `createCache` existant | 2 |

Corrections de bugs offertes par l'harmonisation : 3 gardes de route trop permissives (statusIndicators, individualDownloads, seriesProgress) · casse non normalisée dans `commentHiding` (T2) · guillemets non échappés dans l'escapeHtml de theme-builder (J1) · `cfg()` de ficDownloader qui ignore le panneau (I3).

Aucune extraction n'a été effectuée — analyse seule, en attente d'autorisation.


===========================================================================


## ANALYSE DES MODULES `src/modules/reading`
Modules analysés : `reading-tracker` (4 sous-modules), `chapter-navigation` (4), `reading-formatter` (7), `text-to-speech` (6), `collapse-author-notes`, `instant-footnotes`, `word-swap` — 26 fichiers JS. **L'analyse des 6 onglets est terminée.**

---

### X. LA DÉCOUVERTE MAJEURE : une clé de storage morte (E7 en action)

**`ao3h_seen_works_v1` n'est écrite par personne.** `similarFics.js` l.39 et `surpriseMe.js` l.52 lisent cette clé (commentée « readingTracker's storage ») pour exclure les works déjà lus — mais readingTracker écrit en réalité dans **`ao3h:rt:history`** (`_readingTracker.js` l.109). Vérification par grep sur tout `src/` : seuls ces deux *lecteurs* existent, aucun écrivain.

**Conséquence :** les fonctionnalités « exclure les fics déjà lues » de Similar Fics et Surprise Me ne fonctionnent **jamais** (le Set est toujours vide), silencieusement. C'est exactement la classe de bugs que E7 (contrats de données inter-modules) prévoyait : un renommage de clé chez le producteur, invisible chez les consommateurs. La correction est triviale une fois `lib/storage/keys.js` en place (ou mieux : lire via l'API `W.AO3H_ReadingTracker.getHistory()` qui existe déjà).

Second constat du même type : la docstring de `lib/ao3/parsers.js` (l.52) dit que `parseWorkIds` a été « centralisée ici » **depuis** `collapseAuthorNotes` — mais `collapseAuthorNotes.js` l.63 garde sa copie locale `parseWorkId()` et n'importe pas le parseur. La centralisation a été faite côté lib sans jamais convertir le module d'origine. Même chose pour `viewHistory.importAO3History()` (l.83-103) qui re-parse la page `/readings` à la main alors que `parsers.parseReadingsPageHTML()` a été écrite précisément pour ça.


---------------------------------------------------------------------------


### Y. CONFIRMATIONS (reading)
#### Y1. Compteurs finaux

   - **Réglages de module** (A5…) : +7 (`_readingTracker.js` l.86, `_chapterNavigation.js` l.64, `_textToSpeech.js` l.68, `_readingFormatter.js` l.78, `collapseAuthorNotes.js` l.49, `wordSwap.js`, `instantFootnotes.js` l.50) → **~40 copies**.
   - **lsGet/lsSet** (D5…) : +7 (dont `_readingTracker.js` l.113-121 avec `lsDel`, seule version complète du projet) → **~53 copies**.
   - **Work ID** (A2…) : +4 (`seenTracking.parseWorkId()` l.26, `_chapterNavigation.js` l.103, `collapseAuthorNotes.js` l.63, `viewHistory` l.90) → **~35 copies**. La technique `blurb.id="work_N"` gagne ses 3ᵉ et 4ᵉ consommateurs (`viewHistory` l.90, `seenTracking.applyUpdatedBadges` l.121).
   - **Gardes de route** (A3…) : +3. `_readingTracker.isListingPage()` l.94 et `_chapterNavigation.isListingPage()` l.75 ne diffèrent que par `\/works(\/|$|\?)` vs `\/works($|\?)` — divergence probablement involontaire → **~22 définitions**.
   - **Parse `dd.chapters`** (E2) : +6 (`seenTracking.parseWorkMeta` l.33-37, `blurbNavigation.js` l.52 et l.89, `visualMarkers.js` l.110, `navigationControls.js` l.43, `getChapterInfo` l.97) → **~11 copies**.
   - **Dates relatives** (E5) : `_readingTracker.relativeTime()` l.131 — **6ᵉ implémentation**, identique à celle de statusIndicators (library).
   - **Export JSON** (A9) : +1 (`viewHistory.exportHistory()` l.41) → ~21.
   - **Badges sur heading** (E3) : +1 (badge « 🆕 Updated » de seenTracking l.142-147) → ~15.
   - **Méta de page de work** (E1) : `seenTracking.parseWorkMeta()` l.30-47 est l'extracteur le plus riche du projet (titre + auteur + chapitre courant + chapterId via `select#selected_id` + total) — base idéale pour `lib/ao3/work-page.js`.
   - **Fetch AO3 double transport** (K1/O1) : `viewHistory.importAO3History()` l.63-74 gère GM.xmlhttpRequest **et** fetch — le seul endroit du projet qui fait les deux ; à rapatrier tel quel dans `lib/ao3/requests.js` comme implémentation de référence.
   - **`Routes` de lib/ao3/routes.js** : 2ᵉ consommateur trouvé (`chapterWordCount.js` l.18, après ficActions) — la centralisation des routes a bien preneurs quand elle existe.


---


#### Y2. Sélecteurs prev/next chapitre — le 3ᵉ consommateur attendu est là

`navigationControls.js` (nav sticky, navPrev/navNext) + `keyboardShortcuts.js` l.128-138 + `seriesProgress.js` l.183-186 : trois modules interrogent les liens précédent/suivant avec des jeux de sélecteurs voisins (`a[rel="prev"]`, `.chapter.previous a`…). Le candidat `findPrevNextLinks()` dans `lib/ao3/parsers.js` (étape 5, section U) est confirmé.


---------------------------------------------------------------------------


### Z. NOUVEAU CANDIDAT + chevauchement produit (reading)
#### Z1. Comptage de mots dans la prose — 3 copies, 2 algorithmes, résultats divergents

   **Où :**
   - `chapterWordCount.js` → `countWordsFromText()` l.74-84 (tokens Unicode `[\p{L}\p{N}'-]+`, exclusion des notes/préfaces via `EXCLUDE_SCOPES`, 3 stratégies de fallback pour trouver la prose)
   - `readingTime.js` (browse) → `injectPerChapter()` l.72 (`split(/\s+/)` sur `.userstuff`, sans exclusions)
   - `noteManagement.js` (library) → `addWordCounters()` l.17 (`split(/\s+/)` sur un textarea)

   **Ce que ça fait :** compter les mots d'un chapitre ou d'un texte.

   **Pourquoi partager :** les deux compteurs de chapitre donnent des **résultats différents** pour le même chapitre (tokenisation et périmètre différents) alors que leurs badges s'affichent au même endroit (voir Z2).

   **Nom proposé :** `countWords(text)` dans `lib/utils/index.js` (ou `work-stats.js`), + `getChapterProse(ch)` (la logique d'exclusion/fallback de chapterWordCount, qui est de la connaissance du markup AO3) dans `lib/ao3/work-page.js`.

   **Importeurs :** `chapterWordCount`, `readingTime`, `noteManagement`, `nopeWords` (browse, qui matche aussi du texte de prose).

   **À harmoniser :** l'algorithme (recommander la version Unicode de chapterWordCount, la plus correcte).

   **Risques :** faible — mais les nombres affichés changeront légèrement pour readingTime (c'est une correction, à signaler).


---


#### Z2. Chevauchement produit : badges par chapitre de chapterWordCount ≈ readingTime

`chapterWordCount` injecte « ~ X.XK words in this chapter » après chaque titre de chapitre ; `readingTime.injectPerChapter` (browse/workLength) injecte « (X min read) » au même endroit. Deux modules de deux onglets différents décorent les mêmes titres de chapitres avec des infos dérivées du même comptage — 4ᵉ chevauchement produit (après K4, O3, O4). Décision : fusionner en un seul badge configurable, ou a minima partager le comptage (Z1).


---


#### Z3. À laisser dans le module (reading)

   - Moteur TTS complet (speechEngine, playback, pronunciation, visualFeedback) — autonome, aucun chevauchement.
   - Typographie/espacement/modes d'affichage (reading-formatter) — CSS-class toggles métier.
   - AutoScroll, sticky nav, cache last-chapter (chapter-navigation) — métier.
   - Règles de substitution (word-swap), détection de footnotes (instant-footnotes), logique de collapse (collapse-author-notes) — métier.
   - Buckets de récence 7/30 j (`seenTracking._recencyClass`) et lecture des `abbr.datetime` des blurbs (`_getBlurbUpdatedAt` — candidat parsers.js si un 2ᵉ consommateur apparaît).

---


═══════════════════════════════════════════════════════════════════════════

# SYNTHÈSE FINALE DU PROJET (6 onglets analysés)

═══════════════════════════════════════════════════════════════════════════

* 165 fichiers JS analysés dans `src/modules/` (browse 25, library 39, appearance 25, explore 17, navigate 24, reading 26) + `lib/` existante.

## Tableau consolidé des extractions recommandées

| # | Extraction | Copies | Fichier cible | Palier |
|---|---|---|---|---|
| 1 | lsGet/lsSet/lsDel JSON | ~53 | `lib/utils/index.js` (existant — adopter) | 2 |
| 2 | Lecteur de réglages de module (3 modes : direct, enfant→parent, legacyKey, + fallback AO3H_Config) | ~40 | `lib/storage/module-settings.js` | 2 |
| 3 | Work ID (URL, blurb, `blurb.id`) | ~35 | `lib/ao3/parsers.js` (existant — compléter + adopter) | 3 |
| 4 | MutationObserver « nouveaux blurbs » | ~35 blocs | `observe()`/`debounce()` existants + `watchNewBlurbs` | 5 |
| 5 | Gardes de route (listing/work/search/management) | ~22 (dont 4 boguées) | `lib/ao3/parsers.js` ou `routes.js` (2 consommateurs déjà) | 3 |
| 6 | Export/import de fichier (JSON/CSV/HTML) | ~21 | `lib/utils/json-file.js` (code prêt dans dataTransfer) | 1 |
| 7 | Méta de work et de blurb (titre, auteur, tags, fandoms) | ~20 | `lib/ao3/work-page.js` + `getBlurbMeta` (parsers) | 3 |
| 8 | Badge sur heading de blurb | ~15 | `lib/ui/status-badge.js` | 2 |
| 9 | escapeHtml | 14 | `lib/utils/dom.js` (existant) | 1 |
| 10 | Parse `dd.chapters` (« 3/10 », `?`, complet) | ~11 | `parseChapterCount` (parsers) | 3 |
| 11 | Fetch AO3 (work complet, pages, double transport GM/fetch) | ~8 | `lib/ao3/requests.js` (existant — référence : viewHistory) | 3 |
| 12 | Dates relatives / formats de date | 6 | `lib/utils/format-date.js` | 4 |
| 13 | Actions AO3 authentifiées (kudos, MFL, subscribe) | 3 × 3 transports | `lib/ao3/actions.js` sur requests.js | 3 |
| 14 | List manager (recherche + add/remove + export/import + confirm) | 4 | `lib/ui/list-manager.js` (modal + inline) | 4 |
| 15 | Stats de blurb (kudos/hits/words) | 5 techniques | `lib/ao3/work-stats.js` | 3 |
| 16 | Comptage de mots de prose | 3 (2 algos) | `countWords` + `getChapterProse` | 3 |
| 17 | Toast | 3 | `lib/ui/toast.js` | 4 |
| 18 | CSRF | 3 + **2 dans lib** | dédupliquer `parsers.getCSRFToken` ↔ `requests.getCSRF` | 1 |
| 19 | Cache TTL | 3 | `createCache` existant | 2 |
| 20 | Drag & drop réordonnancement | 2 | `lib/ui/drag-reorder.js` | 4 |
| 21 | Liste persistée avec miroir user (hideByTags ×3) | 3 | `lib/storage/mirrored-list.js` | 4 |
| 22 | Constantes AO3 (Archive Warnings, prev/next, langues) | 2-3 chacune | `lib/ao3/constants.js` + `findPrevNextLinks` | 3 |
| 23 | Clés/contrats de données inter-modules | ~10 lecteurs croisés | `lib/storage/keys.js` puis APIs publiques | **1 (urgent)** |
| 24 | Notifications navigateur | 2 | `lib/utils/notifications.js` | 4 |
| 25 | Bulk-select sur listings | 2 | `lib/ui/bulk-select.js` | 4 |


---


## Bugs réels détectés (corrigés gratuitement par l'harmonisation)

1. **Clé morte `ao3h_seen_works_v1`** : l'exclusion des fics déjà lues de similarFics et surpriseMe ne fonctionne jamais (X). → priorité 1.

2. **4 gardes de route trop permissives** qui activent des modules sur des pages non prévues : `statusIndicators`, `readingStatusTracking` (library), `individualDownloads` (appearance), `seriesProgress` (navigate).

3. **`cfg()` de ficDownloader ignore les réglages du panneau** (ne lit que `AO3H_Config`).

4. **Casse non normalisée dans `commentHiding`** : un utilisateur bloqué avec majuscules reste visible dans les commentaires.

5. **escapeHtml de theme-builder n'échappe pas les guillemets** alors qu'il est injecté dans des attributs `value="…"`.

6. **Deux compteurs de mots divergents** sur les mêmes chapitres (chapterWordCount vs readingTime).

7. **Doublon dans lib/** : `parsers.getCSRFToken` ↔ `requests.getCSRF`.


---


## Décisions produit à trancher avant les extractions concernées

   - fandomHighlighting (appearance) ≈ tagHighlighting (browse) — K4
   - Badges « % eng. » de resultsSorting ≈ métriques de ficEngagement — O3
   - Badge mots/chapitre de chapterWordCount ≈ temps/chapitre de readingTime — Z2
   - 3 vocabulaires de tropes (TROPE_LIST / CO_TAGS / BUILTIN_BUNDLES) — O4
   - theme-builder indépendant de lib/themes — documenté Phase 24
   - Formes exactes des Archive Warnings (2 listes divergentes) — A11
   - Deux recherches de notes concurrentes dans bookmarkVault — étape 2, F


---


## Plan d'exécution recommandé

   **Palier 1 — sans risque, cette semaine si autorisé :** #18 (CSRF dans lib), #6 (json-file), #9 (escapeHtml), #23 phase 1 (keys.js + correction de la clé morte), constantes d'événements (E8).

   **Palier 2 — mécanique :** #1, #2, #8, #19 — grosses réductions de code, comportement identique.

   **Palier 3 — connaissance AO3 :** #3, #5, #7, #10, #11, #13, #15, #16, #22 — module par module avec test manuel (exclure skipWorks du #3 tant que la clé IndexedDB n'est pas migrée).

   **Palier 4 — UI partagée :** #12, #14, #17, #20, #21, #24, #25.

   **Palier 5 — continu :** #4 (observers) au fil des retouches ; #23 phase 2 (APIs publiques, suppression des bridges window — rejoint la Phase 26 déjà planifiée).

   **Analyse terminée — aucune extraction n'a été effectuée. L'ensemble du rapport attend ton autorisation avant toute modification de code.**

---


═══════════════════════════════════════════════════════════════════════════

# 🎁 BONUS — La synthèse expliquée simplement (version « 10 ans »)

═══════════════════════════════════════════════════════════════════════════

## C'est quoi ce projet ?

   Imagine une grande maison avec **6 étages** (Browse, Library, Appearance, Explore, Navigate, Reading). À chaque étage, il y a des ateliers (les modules) : un atelier qui cache les histoires qu'on n'aime pas, un atelier qui colle des étoiles sur les favoris, un atelier qui télécharge les histoires, etc.

   Et au sous-sol, il y a une **grande boîte à outils commune** (le dossier `lib/`) où tout le monde est censé ranger les outils qui servent à plusieurs ateliers.


---


## Qu'est-ce qu'on a découvert ?

   **Chaque atelier a fabriqué ses propres outils dans son coin, au lieu d'aller voir dans la boîte commune.**

   Par exemple, il existe un petit outil qui sert à lire le numéro d'une histoire (son « work ID »). Eh bien on a trouvé **35 copies** de ce même outil, une dans presque chaque atelier ! 
   
   * Pareil pour :
       - l'outil qui lit les réglages : **40 copies** ;
       - l'outil qui range des choses dans la mémoire du navigateur : **53 copies** ;
       - l'outil qui nettoie le texte pour l'afficher sans danger : **14 copies**.

   C'est comme si chaque personne de la maison avait fabriqué son propre marteau, alors qu'un seul marteau dans la boîte à outils aurait suffi.


---


## Pourquoi c'est un problème ?

   1. **Si le marteau a un défaut, il faut réparer 35 marteaux** au lieu d'un seul. Si le site AO3 change un jour sa façon d'afficher les histoires, il faudra corriger le code à 35 endroits.

   2. **Les copies ne sont pas exactement pareilles.** Certaines ont des petits défauts que les autres n'ont pas. On a trouvé de vrais bugs comme ça :
         - Deux ateliers essaient de lire dans un tiroir nommé `ao3h_seen_works_v1`… **mais ce tiroir est vide depuis toujours**, parce que l'atelier qui devait le remplir range en fait ses affaires dans un autre tiroir. Résultat : la fonction « ne pas me remontrer les histoires déjà lues » **n'a jamais marché** et personne ne s'en est aperçu.
         - Deux ateliers comptent les mots des chapitres, mais **pas de la même façon** — ils n'affichent pas le même nombre pour le même chapitre !
         - Un atelier bloque les auteurs qu'on n'aime pas, mais il oublie les majuscules : si tu bloques « MonAuteur », ses commentaires restent visibles.

   3. **Parfois le bon outil existe déjà dans la boîte commune, mais personne ne le sait.** On a même trouvé deux fois le même outil… à l'intérieur de la boîte à outils elle-même !


---


## Qu'est-ce qu'on propose ?

   * Un grand rangement, en 5 étapes, de la plus facile à la plus délicate :
       1. **Les trucs sans danger** : ranger les outils déjà prêts, réparer le tiroir vide.
       2. **Les remplacements simples** : jeter les 53 copies du même outil et utiliser celui de la boîte.
       3. **Les outils « spécial AO3 »** : tout ce qui sait lire le site AO3 (numéros, titres, auteurs, chapitres) va dans un seul endroit.
       4. **Les outils d'affichage** : les badges, les fenêtres, les notifications.
       5. **Le rangement continu** : le reste, petit à petit, au fil du temps.

   Et avant certains rangements, il y a **7 questions à poser au chef** (toi !), parce que deux ateliers font parfois exactement la même chose sans le savoir — il faut décider si on garde les deux ou si on les fusionne.


---


## La règle d'or pour la suite

   > **Avant de fabriquer un outil, regarde d'abord dans la boîte à outils. Et si tu fabriques un outil qui peut servir aux autres, range-le dans la boîte — pas dans ton atelier.**

   Rien n'a encore été rangé : ce document est la liste de rangement, et on attend ton feu vert. 🚦


═══════════════════════════════════════════════════════════════════════════

# 📋 CE QU'IL RESTE À FAIRE (état après la session de bascule)

═══════════════════════════════════════════════════════════════════════════

Les paliers 1 à 5 ont été exécutés (fichiers `lib/` créés puis modules basculés,
10 commits). Ce qui suit est la liste de ce qui n'a **pas** été fait, avec la
raison à chaque fois — soit un vrai risque identifié en cours de bascule, soit
un manque de temps/contexte pour trancher sans toi.

---

## 1. À tester en priorité sur AO3 (rien n'a été vérifié en conditions réelles)

Tout le travail de cette session s'est fait à la lecture de code, sans navigateur.
Avant de considérer la bascule comme acquise, il faut vérifier concrètement :

- **similarFics → Mark for Later** : le transport est passé de `GM_xmlhttpRequest`
  à `fetch` (lib/ao3/actions.js). C'est le changement le plus risqué de toute la
  session — à tester en priorité sur un work réel.
- **Les 4 gardes de route corrigées** (statusIndicators, readingStatusTracking,
  individualDownloads, seriesProgress) : ces modules s'activent maintenant sur un
  périmètre de pages différent (ils ignorent désormais les pages de work
  individuelles). Vérifier qu'aucune fonctionnalité ne s'est éteinte par erreur.
- **Le badge « Updated Xd ago » de readingTracker** : granularité de date étendue
  (affiche maintenant « N months/years ago » au-delà de 30 jours).
- **Les 3 managers hideByTags** (hiddenTags / nopeWords / whitelistExceptions)
  après bascule vers `mirrored-list.js` : ouvrir chaque manager, ajouter/retirer
  une entrée, vérifier l'export/import.
- **Le drag & drop des boutons d'action** sur une page de work (ficActions) :
  vérifier que seuls les boutons ciblés (bookmark/mark/share/subscribe/
  download/comments) sont déplaçables, pas les autres `<li>` de la liste.
- **Kudos rapide** (kudosTracker.injectQuickKudosButton) : le message d'échec a
  perdu le code HTTP dans son texte, à vérifier que ça reste compréhensible.
- **dataTransfer (backup-and-sync)** : les toasts utilisent maintenant
  `lib/ui/toast.js` — vérifier l'apparence après export/import.

---

## 2. Chantier continu : MutationObserver restants (14 fichiers)

28 des ~42 blocs ont été convertis vers `observe()`. Les 14 restants ont des
callbacks multi-lignes avec parcours de nœuds imbriqué — plus risqués à
recopier sans pouvoir tester, donc volontairement laissés :

`batchDownload.js`, `downloadEnhancements.js`, `individualDownloads.js`
(trio fic-downloader), `fandomHighlighting.js`, `_filterManager.js`,
`autoHideNoiseTags.js`, `tagsVisibility.js`, `lengthDisplay.js`,
`readingTime.js`, `povPresentation.js`, `searchAutocomplete.js`,
`organizationTools.js`, `collapse-author-notes/collapseAuthorNotes.js`,
`word-swap/wordSwap.js`.

À faire au fil des retouches de chacun de ces modules, pas en bloc.

---

## 3. Pas encore basculé — incompatibilités réelles découvertes

Ces fichiers `lib/` existent mais leurs consommateurs prévus n'ont **pas** été
convertis, parce que la conversion mécanique aurait cassé quelque chose de
vérifiable dans le code (pas une hypothèse — un vrai écart constaté à la lecture) :

- **`lib/ui/bulk-select.js`** — `markedForLaterStatus.js` et `organizationTools.js`
  ont chacun un CSS dédié sur des IDs/classes précis (`#ao3h-ls-ms-bar`,
  `#ao3h-ls-del`, `.ao3h-bv-bulk-selall`, `.ao3h-bv-bulk-del`) que le composant
  générique ne reproduit pas. Deux options : enrichir l'API du lib pour accepter
  des IDs/classes personnalisés par bouton, ou accepter un reskin visuel des deux
  barres d'action. **Décision produit à prendre avant de continuer.**
- **`lib/ui/list-manager.js` (A8)** — jamais créé. C'est la plus grosse extraction
  du rapport original (modale complète : recherche, groupes repliables,
  export/import, focus trap, clavier). Nécessite les 3 managers hideByTags
  ouverts et testés en parallèle pour ne rien perdre — pas fait par prudence.
- **`tagsReordering.js`** (drag & drop des tags) — logique de bouton
  « Reset order » (restauration à l'ordre original + attribut `dataset` dédié)
  incompatible avec l'API actuelle de `lib/ui/drag-reorder.js`. Il faudrait
  étendre `makeListReorderable` avec une option de restauration, comme ça a été
  fait pour le paramètre `filter` (découvert utile pendant la bascule de ficActions).
- **`downloadEnhancements.js` (toast)** — position et couleurs propres à sa
  toolbar flottante (`--ao3h-fdl-*`), pas un vrai duplicata du toast générique.
- **5 fetch de page complète** (`individualDownloads`, `offlineLibrary`,
  `batchDownload`, `completePageDownload`, `downloadEnhancements`) +
  `notificationCenter`/`viewHistory` — tous vérifient `response.ok` avant de
  traiter le HTML (sinon un 404/work supprimé produirait un téléchargement
  silencieusement corrompu). `fetchAO3PageText` ne peut pas exposer ce statut
  quand elle passe par le transport GM. Écart d'API réel, pas juste un risque
  théorique — à résoudre en donnant à `fetchAO3PageText` un moyen de signaler
  l'échec HTTP avant de basculer ces 6 sites.
- **`statusIndicators` / `bookmarkMaintenance`** (dates) — style abrégé
  « Xd ago » volontairement différent de « X days ago » de `format-date.js`.
  Pas une bascule ratée, un choix : les badges compacts ont besoin d'un format
  court. Si on veut vraiment converger, il faudrait ajouter un format `'short'`
  à `relativeDate()`.

---

## 4. E7 phase 2 — API publiques (jamais commencé)

Le rapport notait des lectures croisées de storage (`notificationCenter` et
`dataCollection` lisaient en dur les clés d'autres modules) et des bridges
`window.AO3H_*` hérités comme couplage silencieux. La phase 1 (constantes de
clés, `lib/storage/keys.js`) est faite. La phase 2 — remplacer les lectures
croisées par de vraies API publiques exposées par chaque module producteur, et
supprimer les bridges `window` — n'a pas été commencée. C'est un chantier
d'architecture, pas une extraction mécanique ; correspond à la « Phase 26 »
mentionnée dans plusieurs commentaires du code existant.

---

## 5. Décisions produit toujours en attente

Aucune de ces 7 questions n'a été tranchée — je n'ai pas la légitimité pour
choisir à ta place, et le code actuel fonctionne des deux côtés (juste en double) :

1. **fandomHighlighting** (appearance) ≈ **tagHighlighting** (browse) — même
   fonctionnalité, deux stockages et deux UX. Fusionner ou garder séparés ?
2. **Badges « % eng. »** de resultsSorting ≈ métriques de ficEngagement — un
   utilisateur avec les deux modules actifs voit deux badges de ratio différents
   côte à côte sur le même blurb.
3. **Badge mots/chapitre** de chapterWordCount ≈ **temps/chapitre** de readingTime
   — même chevauchement visuel, deux nombres différents pour le même chapitre
   (bug de fond, pas juste redondance — voir Z1 plus haut dans ce document).
4. **3 vocabulaires de tropes** (TROPE_LIST / CO_TAGS / BUILTIN_BUNDLES) —
   listes curatées qui se recouvrent sans se référencer.
5. **theme-builder indépendant de lib/themes** — deux systèmes de thèmes
   coexistent, documenté comme volontaire (Phase 24) mais jamais réexaminé.
6. **Formes exactes des Archive Warnings** — les deux formes (tag canonique vs
   libellé de formulaire) ont été documentées séparément dans
   `lib/ao3/constants.js` plutôt que fusionnées à l'aveugle ; reste à vérifier
   sur AO3 si une des deux listes existantes contient une erreur.
7. **Deux recherches de notes concurrentes** dans bookmarkVault
   (`readingStatusTracking._injectNoteSearch` et `noteManagement.injectNotesSearch`)
   — doublon fonctionnel réel à l'intérieur du même module, pas juste du code
   dupliqué entre modules.

---

## 6. Petits nettoyages notés en cours de route, jamais traités

- `_visualPreferences.js` : `DEFAULTS` const + `getDefaults()` dupliqués dans le
  même fichier (l.65-80 vs l.116-133) — doublon intra-fichier, indépendant de
  tout le chantier `lib/`.
- `AutoBackup` (`automateBackup.js`) duplique `createBackup()`/`restoreBackup()`
  de `BackupOperations` quasi verbatim alors que le coordinateur lui injecte déjà
  `getAllData` — devrait déléguer entièrement au lieu de recopier.
- Gabarit HTML de fic-downloader (K2) : `individualDownloads.js` et
  `batchDownload.js` ont deux gabarits HTML quasi identiques (~60 lignes
  chacun) — extraction interne au module (`workHtmlTemplate.js`), pas vers `lib/`.

---

### En résumé

Le plus gros du chantier mécanique (paliers 1-5) est fait et commité. Ce qui
reste est soit **à tester** (section 1 — le plus urgent), soit **bloqué par une
vraie décision produit** (sections 3, 4, 5 — je ne peux pas trancher seul), soit
**du travail long au fil de l'eau** (sections 2, 6 — pas de raison de le
bloquer, juste pas fait aujourd'hui).


