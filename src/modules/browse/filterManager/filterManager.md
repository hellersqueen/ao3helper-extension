# filterManager

**Tab:** Browse

## À quoi ça sert

Ce module enrichit le formulaire de filtres d'AO3 (recherche, pages de
tags, favoris, collections, historique) avec des presets réutilisables,
des filtres rapides, des filtres basés sur ton historique personnel, et
des alertes.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `starredPresetsFirst` | activé | Épingle les presets favoris en haut de la liste |
| `presetHoverPreview` | activé | Aperçu des filtres au survol d'un preset |
| `rememberLastPresetByFandom` | activé | Pré-sélectionne le dernier preset utilisé pour ce fandom |
| `showExpandPreset` | activé | Affiche le bouton "Edit as chips" à côté d'Apply |
| `searchHistoryEnabled` | activé | Retient chaque recherche lancée (pas seulement les presets sauvegardés) dans une liste "🕐 Recent" |
| `selectedLanguages` | (toutes) | Les langues affichées |
| `showLanguageBadge` | désactivé | Affiche un badge de langue sur les fics |
| `clickBadgeToFilter` | activé | Un clic sur le badge de langue filtre par cette langue |
| `hidePreferredLanguageBadge` | désactivé | N'affiche le badge que pour les langues absentes de `preferredLanguages` |
| `preferredLanguages` | `["English"]` | Les langues considérées comme "normales", donc pas signalées |
| `warnExcludedWarning` | activé | Affiche une bannière si un avertissement officiel est exclu |
| `excludeWarningRemoveButton` | activé | Bouton "Remove exclusion" dans la bannière |
| `warningBannerMinCount` | `1` | Nombre minimum d'avertissements exclus avant d'afficher la bannière |
| `tagBundlesEnabled` | désactivé | Active les groupes de tags équivalents |
| `useBuiltinTropeBundles` | activé | Utilise les groupes de tags déjà prêts (Slow Burn, Enemies to Lovers...) |
| `quickFilterOneshot` | activé | Bouton à trois états (tout / seulement / cacher) pour les one-shots |
| `quickFilterCrossover` | activé | Bouton à trois états pour les crossovers |
| `showOneshotBadge` | désactivé | Petit badge "1️⃣" sur les one-shots dans les listes |
| `quickFilterLowTags` / `lowTagThreshold` | désactivé / `3` | Cache les fics avec moins de N tags |
| `quickFilterAnonymous` | désactivé | Cache les fics postées anonymement |
| `quickFilterSummary` / `minSummaryLength` | désactivé / `0` | Exige un résumé (et une longueur minimale optionnelle) |
| `quickFilterRatio` / `minKudosRatio` | désactivé / `2` | Cache les fics sous un ratio kudos/vues minimum (%) |
| `quickFilterDate` | désactivé | Ajoute un menu "Updated within" (aujourd'hui / semaine / mois) |
| `quickFilterAbandoned` | désactivé | Cache les fics incomplètes sans mise à jour depuis 1 an+ |
| `manualHideEnabled` | activé | Bouton "✕" pour cacher une fic individuellement |
| `manualHideShortcut` | activé | Raccourci clavier `X` pour cacher la fic survolée |
| `hideKudosed` | désactivé | Cache les fics déjà kudosées |
| `hideSubscribed` | désactivé | Cache les fics déjà suivies |
| `hideBookmarked` | désactivé | Cache les fics déjà en favoris |
| `hideMFL` | désactivé | Cache les fics déjà dans "à lire plus tard" |
| `hideRead` | désactivé | Cache toute fic déjà lue (pas seulement les séries entièrement lues) |
| `hideReadSeries` | désactivé | Cache les séries entièrement lues |
| `historyFilterMode` | `hide` | `hide` (cache complètement) ou `dim` (atténue) les fics filtrées par l'historique |
| `showHiddenCount` | activé | Affiche le compteur de fics cachées par l'historique, avec un aperçu par catégorie |
| `rememberFilters` | activé | Se souvient des filtres actifs d'une session à l'autre |
| `oneshotDefault` / `crossoverDefault` | `all` | Les filtres appliqués par défaut au chargement |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser, trier,
actualiser) *(pas encore active — rien n'est branché derrière ; hors
périmètre de ce chantier)*.

## Fichiers

### 1. `_filterManager.js` — le chef d'orchestre

- Met en route les cinq autres fichiers de fonctionnalités et partage une liste de "groupes" de tags
- Reconnaît désormais aussi la page Historique (`/users/*/readings`), en plus des favoris, tags et recherche
- Détermine si la page actuelle est une page de listing via `isListingPage()` (recherche, tags, favoris, œuvres d'un·e utilisateur·ice, historique, collections)

### 2. `presetManagement.js` — presets de filtres

- Permet de sauvegarder la combinaison actuelle de filtres sous un nom, la renommer (`renamePreset(id, name)`), ou fusionner deux presets en un seul (`mergePresets(idA, idB)` → crée un nouveau preset `"A + B"` ; les champs multi-tags — fandoms, personnages, relationships, autres tags — sont unis via `mergePresetFilters()`, les autres champs simples prennent la valeur du second preset en cas de conflit)
- Une barre d'outils avec un menu déroulant et une étoile pour les favoris
- Un mode "Éditer en chips" pour retoucher un preset avant de lancer la recherche
- Des raccourcis clavier pour appliquer ou sauvegarder rapidement un preset
- Se souvient du dernier preset utilisé pour chaque fandom
- Un historique automatique des recherches ("🕐 Recent", `recordSearch`/`watchFormSubmissions`) : capture automatique de chaque recherche soumise, cliquer une entrée remplit le formulaire sans le soumettre ; distinct des presets nommés
- Des statistiques d'usage (`recordPresetUsage`/`topUsedPresets`), affichées dans le popover d'aide ("Your most-used presets")
- Import/export des presets dans un fichier
- Des groupes de tags qui regroupent plusieurs variantes d'un même tag (par exemple "Slow Burn")

### 3. `languageBadges.js` — badges de langue

- Ajoute un badge (drapeau + nom de langue) après le titre de chaque fic, seulement s'il y a plusieurs langues différentes sur la page
- Cliquable pour filtrer directement sur cette langue
- Peut être limité aux langues "non préférées" pour réduire le bruit visuel : quand `hidePreferredLanguageBadge` est activé, le badge n'apparaît que pour les langues absentes de `preferredLanguages` (par défaut `["English"]`)

### 4. `filterWarnings.js` — bannière d'exclusion d'avertissement

- Détecte si l'adresse de la page exclut un des avertissements officiels
- Affiche une bannière avec un bouton pour retirer facilement cette exclusion, un réglage de sensibilité (`warningBannerMinCount`, nombre minimum d'exclusions avant affichage, défaut 1), et un bouton "Don't show again" qui persiste `filterManager:warningBannerDismissed` (contrairement au "✕" simple, qui ne ferme que l'instance actuelle)

### 5. `userHistoryFilters.js` — filtres par historique

- Cache (ou atténue, selon `historyFilterMode`) les fics déjà kudosées, suivies, en favoris, dans "à lire plus tard", déjà lues, ou faisant partie d'une série entièrement lue
- Affiche un compteur du nombre de fics cachées, avec un aperçu temporaire par catégorie (kudosed, subscribed, bookmarked, Later Shelf, déjà lu, série lue) — chaque catégorie a son propre lien "👁" qui ne révèle que cette catégorie sans désactiver les autres filtres
- Utilise désormais les vraies APIs des autres modules (voir "Corrections" plus bas)

### 6. `worksFilterManager.js` — filtres rapides

- Boutons à trois états (tout / seulement / cacher) pour les one-shots et les crossovers, cycle All → Only → Hide (`nextThreeState()`), classes `ao3h-fm-<filtre>-only` / `-hide` sur `<html>`
- Filtres rapides additionnels : peu de tags, anonyme, résumé (avec longueur minimale), ratio kudos/vues, mise à jour récente, WIP à l'abandon
- Bouton "✕" et raccourci clavier `X` pour cacher une fic individuellement (sur l'œuvre survolée), persistant dans `filterManager:manualHidden`, avec un lien "↺ Unhide all"
- Badge "1️⃣" optionnel sur les one-shots, indépendant du bouton de filtre

### 7. `filterManagerHelpers.js` — logique pure partagée

- Analyse de date AO3 (`parseAO3Date`/`isWithinDateRange`/`looksAbandoned`), cycle à trois états (`nextThreeState`/`shouldHideForThreeState`), ratio kudos/vues (`kudosRatio`/`belowRatioThreshold`), seuils de tags/résumé (`belowTagThreshold`/`summaryTooShort`), comparaison d'ensembles pour les séries lues (`isSeriesFullyRead`), fusion de presets (`mergePresetFilters`), historique de recherche plafonné (`addSearchHistoryEntry`), statistiques d'usage (`incrementUsage`/`topUsage`). Testé indépendamment dans `filterManagerHelpers.test.js`.

### 8. `filterManager.css`

- Les styles visuels de la barre de presets, des badges, de la bannière, des filtres rapides, du masquage individuel et de l'aperçu par catégorie, plus les classes de filtrage à trois états et le dropdown de recherches récentes

## Détails techniques

**Clés de stockage :**
- `filterManager:presets` — liste des presets sauvegardés
- `filterManager:bundles` — groupes de tags personnalisés
- `filterManager:lastPreset` — `{ [fandom]: presetId }`
- `filterManager:searchHistory` — `[{ ts, filters }]`, plafonné à 20, plus récent en premier
- `filterManager:presetUsage` — `{ [presetName]: timesApplied }`
- `filterManager:manualHidden` — tableau des `workId` cachés manuellement
- `filterManager:warningBannerDismissed` — booléen, "don't show again"
- `ao3h:filterManager:seriesReadCache` — `{ [seriesId]: { allRead, checkedAt } }`, TTL 24h

**API publique (`AO3H.filterManager`) :**
- `getBundleFor(tag)` → `string[]`
- `getAllBundles()` → `bundle[]`
- `getPresets()` → `preset[]`

**Dépendances :** `hideByTags` (⇄ dépendance croisée), `ficAppreciation`, `bookmarkVault`, `laterShelf`, `readingTracker`

## Specs — toutes traitées

- ~~Pouvoir renommer un preset déjà sauvegardé~~ ✅ Fait — bouton "✎" dans la liste des presets (`presetManagement.renamePreset`).
- ~~Cacher les fics qui ont très peu de tags~~ ✅ Fait — filtre rapide `quickFilterLowTags` avec seuil configurable (`lowTagThreshold`).
- ~~Cacher les fics postées anonymement~~ ✅ Fait — filtre rapide `quickFilterAnonymous`.
- ~~Un bouton pour cacher ou réduire une fic individuellement, une par une~~ ✅ Fait — bouton "✕" sur chaque fic (`manualHideEnabled`), persistant (`filterManager:manualHidden`), avec "↺ Unhide all".
- ~~Un bouton "Résumé présent" pour ne garder que les fics qui ont un résumé~~ ✅ Fait — filtre rapide `quickFilterSummary`.
- ~~Réduire (au lieu de cacher complètement) les fics filtrées par l'historique~~ ✅ Fait — réglage `historyFilterMode` (`hide` / `dim`).
- ~~Un raccourci clavier pour cacher rapidement une fic~~ ✅ Fait — touche `X` sur la fic survolée (`manualHideShortcut`).
- ~~Remplacer les boutons one-shot/crossover par un choix à trois options~~ ✅ Fait — les deux boutons cyclent désormais All → Only → Hide.
- ~~Cacher automatiquement toutes les fics déjà lues, pas seulement les séries entièrement lues~~ ✅ Fait — réglage `hideRead`, lit `W.AO3H_ReadingTracker.getHistory()`.
- ~~Une logique de filtre avancée avec des règles "et / ou / sauf si" combinées~~ ❌ Écarté — un vrai moteur de règles booléennes est une fonctionnalité d'une tout autre échelle qu'un module d'enrichissement de filtres ; comparable en ambition au "Recommendation Engine" déjà rejeté ailleurs dans le projet.
- ~~Un mode pour construire ses propres règles de filtre avec un système visuel, plus un mode de débogage~~ ❌ Écarté — même raisonnement que ci-dessus ; ce serait l'interface de la logique combinée déjà écartée.
- ~~Filtrer les fics selon leur ratio de kudos par rapport aux vues~~ ✅ Fait — filtre rapide `quickFilterRatio` avec seuil `minKudosRatio` (%).
- ~~Filtrer par date (par exemple : mise à jour cette semaine)~~ ✅ Fait — menu `quickFilterDate` (aujourd'hui / semaine / mois).
- ~~Cacher les fics abandonnées depuis plus d'un an~~ ✅ Fait — filtre rapide `quickFilterAbandoned` (incomplète + non mise à jour depuis 12 mois).
- ~~Des statistiques sur les filtres qu'on utilise le plus souvent~~ ✅ Fait — usage des presets suivi (`filterManager:presetUsage`), affiché dans le popover d'aide.
- ~~Un historique de recherche qui montre les filtres utilisés à chaque recherche, et permet de les récupérer~~ ✅ Fait — bouton "🕐 Recent" (`searchHistoryEnabled`), capture automatique à chaque soumission du formulaire, distinct des presets nommés.
- ~~Des badges visuels sur les fics one-shot dans la liste, en plus du bouton de filtre~~ ✅ Fait — réglage `showOneshotBadge`.
- ~~Exiger une longueur minimale pour le résumé, pas juste vérifier qu'il y en a un~~ ✅ Fait — réglage `minSummaryLength` (0 = juste non-vide).
- ~~Organiser ses presets dans des dossiers ou des catégories, et les afficher sous forme de cartes visuelles~~ ❌ Écarté — dossiers + vue en cartes est une refonte d'interface disproportionnée pour ce qui reste une barre d'outils compacte ; le renommage et la fusion (ci-dessus) couvrent l'essentiel du besoin d'organisation à cette échelle.
- ~~Synchroniser automatiquement ses presets de filtres entre plusieurs appareils~~ ✅ Fait (déjà couvert ailleurs) — `backupAndSync`'s `cloudSync.js` synchronise déjà, de façon générique et optionnelle, toutes les données `ao3h:`-préfixées (donc les presets et groupes de tags de ce module inclus) via le stockage de synchronisation du navigateur.
- ~~Avertir avant même d'ouvrir une fic si elle contient des mots ou tags à risque, avec différents niveaux de gravité~~ ✅ Fait (déjà couvert ailleurs) — c'est exactement le rôle de `hideByTags` (`hiddenTags.js` + `nopeWords.js`, tags et mots-clés avec modes cacher/atténuer) ; une fusion avec `filterManager` a déjà été explicitement écartée ci-dessous. Les "niveaux de gravité" seraient une évolution de `hideByTags`, pas de ce module.
- ~~Étendre tous les filtres du module aux pages "Historique" et "Favoris", pas seulement aux pages de recherche et de tags~~ ✅ Fait — Favoris était déjà couvert ; Historique (`/users/*/readings`) ajouté à `isListingPage()`. Seuls les presets et la bannière d'avertissement restent liés au formulaire de recherche natif, absent de ces pages par nature.
- ~~Pouvoir régler la sensibilité de la bannière d'exclusion d'avertissement, et la fermer définitivement pour ne plus la revoir~~ ✅ Fait — réglage `warningBannerMinCount` (sensibilité) et bouton "Don't show again" (fermeture définitive, persistée).
- ~~Un mode qui n'affiche le badge de langue que pour les langues qu'on ne préfère pas, au lieu de toutes les langues~~ ✅ Fait — réglage `hidePreferredLanguageBadge` + liste `preferredLanguages`.
- ~~Revoir rapidement, type par type (kudos, abonnements, favoris...), les fics cachées par les filtres d'historique sans tout désactiver~~ ✅ Fait — chaque catégorie du compteur a son propre lien "👁 aperçu" qui ne révèle que cette catégorie.
- ~~Pouvoir combiner deux presets de filtres pour en faire un seul d'un coup, plutôt que d'en appliquer un seul à la fois~~ ✅ Fait — bouton "🔗 Merge" (`presetManagement.mergePresets`), les tags multi-valeurs sont unis plutôt qu'écrasés.

## Corrections apportées à des réglages déjà existants (hors liste ci-dessus)

En résolvant les items ci-dessus, quatre réglages d'historique déjà présents
dans le panneau se sont révélés ne jamais avoir fonctionné : ils
interrogeaient des services qui n'ont jamais existé sous ce nom
(`window.AO3H_Modules.*`, `AO3H.modules.getService(...)` — déjà signalé comme
hérité et mort dans une précédente version de cette doc). Corrigés pour lire
les vraies APIs :

- `hideKudosed` → lit désormais `AO3H.ficAppreciation.hasGivenKudos(workId)` (la véritable API publique du module ficAppreciation).
- `hideBookmarked` → lit désormais directement `ao3h:bookmarkVault:data` (bookmarkVault n'expose aucune API runtime ; lecture seule de sa clé de stockage, même technique que pour `hideReadSeries` ci-dessous).
- `hideMFL` → lit désormais `W.AO3H_LaterShelf.loadItems()` (l'API publique réelle de laterShelf).
- `hideReadSeries` → aucune API, dans aucun module, ne calcule "série entièrement lue". Résolu par un fetch borné et mis en cache 24h de la page de la série (`/series/{id}`, lecture seule, même origine), comparé à `W.AO3H_ReadingTracker.getHistory()`. Le résultat n'est donc plus disponible instantanément à l'affichage mais quelques instants après (mise à jour asynchrone qui redéclenche un passage sur les fics affichées).

## Explicitement écarté

- Appliquer un preset tout seul en arrivant sur une page, sans cliquer dessus — pour éviter les surprises
- Fusionner ce module avec `hideByTags` et d'autres modules de masquage en un seul gros module — jugé trop différent pour être réuni
- Refaire des filtres qu'AO3 propose déjà nativement (plus de 30 réglages) — jugé inutile, ce module vient compléter les filtres d'AO3, pas les remplacer
- Une logique de filtre combinée ET/OU/SAUF SI et son constructeur visuel — échelle disproportionnée pour un module d'enrichissement de filtres
- Organiser les presets en dossiers/catégories avec une vue en cartes — refonte d'interface disproportionnée ; renommer + fusionner couvrent l'essentiel

---

~~- Garder des réglages de filtres différents selon le type de page (recherche, tags, favoris...) au lieu d'un seul réglage valable partout~~
~~- Chercher des mots-clés avec des règles compliquées (respecter les majuscules, chercher un morceau de mot, motifs spéciaux)~~
~~- Associer automatiquement des tags à un fandom précis pour tout le monde~~
~~- Filtrer par une plage de nombre de mots (un minimum ET un maximum), pas juste cacher les fics trop courtes~~
~~- Partager ses presets de filtres publiquement avec les autres, avec des votes~~
~~- Des suggestions automatiques de filtres à essayer~~
~~- Regrouper les filtres par thème (longueur, contenu, découverte...) avec des raccourcis~~
~~- Filtrer selon l'ordre dans lequel les tags apparaissent~~
~~- Créer, renommer ou gérer ses propres groupes de tags équivalents (en ce moment on peut juste les sauvegarder, pas les modifier avec des boutons)~~
~~- Un bouton pour surligner les mots qu'on ne veut pas voir dans les fics — *ça existe déjà, mais dans un autre module (`hideByTags`), pas ici*~~
~~- Cacher les fics dont l'histoire est terminée mais qu'on n'a pas encore lues (en plus de cacher juste les séries complètement lues)~~
~~- Deviner tout seul quels filtres te conviendraient, selon ton historique de lecture~~
~~- Programmer des filtres différents selon l'heure ou le jour~~
~~- Un réglage à part pour exclure aussi les one-shots qui font partie d'une série, pas juste les one-shots isolés~~
~~- Prévenir quand un même tag est à la fois inclus et exclu dans la recherche, ce qui crée un conflit~~
~~- Avertir aussi quand on exclut un couple, un tag ou un trope qu'on a l'habitude d'inclure ou qui est très populaire, pas seulement les avertissements officiels d'AO3~~
~~- Cacher les fics trop courtes~~

## Précision

⚠️ La doc historique anglaise disait que le statut de lecture à plusieurs
valeurs avait été rejeté ("trop compliqué") et que le bouton de kudos
rapide n'existait pas — cette remarque concerne en fait `ficAppreciation`,
pas ce module ; elle est conservée ici uniquement parce qu'elle figurait
dans une version antérieure de ce fichier.
