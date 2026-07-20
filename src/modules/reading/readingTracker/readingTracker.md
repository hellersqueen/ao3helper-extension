# readingTracker

**Tab:** Reading

## À quoi ça sert

Ce module suit ton historique de lecture sur AO3 : il retient les fics que
tu as déjà visitées, ta progression de lecture (défilement et chapitre), et
te permet de marquer les fics déjà vues.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `seenMode` | `mark` | Comment afficher les fics déjà vues : `mark` (estompe), `hide` (cache), `blur` (floute), ou `strikethrough` (titre barré) |
| `exceptBookmarks` | activé | Ne jamais marquer comme vues les fics dans mes favoris |
| `exceptSubscribed` | activé | Ne jamais marquer comme vues les fics auxquelles je suis abonné |
| `exceptMFL` | activé | Ne jamais marquer comme vues les fics de ma liste "à lire plus tard" |
| `searchHistory` | activé | Active la recherche dans l'historique |
| `deleteEntry` | activé | Permet de supprimer une entrée de l'historique |
| `exportHistory` | activé | Permet d'exporter l'historique en JSON |
| `resumeToast` | activé | Affiche un petit message quand on reprend une lecture |
| `chapterBadge` | activé | Affiche un badge cliquable "Ch X/Y" sur les fics en cours |
| `resumeBanner` | activé | Affiche une bannière "📍 Reprendre au chapitre X" quand on revient sur une fic |
| `lastReadTime` | activé | Affiche depuis combien de temps on n'a pas lu, dans la bannière |
| `positionMarker` | activé | Affiche un repère à l'endroit exact où on s'était arrêté de lire |
| `floatingBadge` | activé | Affiche un indicateur flottant de progression pendant la lecture |
| `progressStyle` | `badge` | Style de l'indicateur : `badge` (%), `bar` (barre cliquable), ou `donut` (anneau) |
| `clickToSeek` | activé | Clique sur la barre pour sauter directement à une position |
| `progressMilestones` | activé | Petite notification à 25 % / 50 % / 75 % lus |
| `manualBookmarks` | activé | Marque-pages manuels multiples (🔖), en plus du repère automatique |
| `readingSpeedTracking` | activé | Calcule ta vitesse de lecture moyenne (mots/minute), affichée dans la bannière de reprise |
| `seenWorksOpacity` | `0.4` | La transparence des fics marquées comme vues (mode `mark`) |
| `bulkMarkSeen` | activé | Case à cocher sur chaque fic + bouton pour en marquer plusieurs comme vues d'un coup |
| `keyboardToggleSeen` | activé | Raccourci clavier (V) pour révéler temporairement les fics cachées |
| `historyClearAll` | activé | Affiche le bouton "Tout effacer l'historique" |
| `showClearProgressButton` | activé | Affiche le bouton "Effacer la progression" pour une fic |
| `updatedBadge` | activé | Affiche un badge "Updated" sur les fics récemment mises à jour |
| `updatedOnlyMode` | désactivé | N'affiche que les fics mises à jour, sur la page des abonnements |
| `updatedDateFormat` | `relative` | Date affichée sur le badge "Updated" : relative ("il y a 3 jours") ou exacte |
| `continueReadingWidget` | activé | Bloc "Continue Reading" sur la page d'accueil AO3 |

Le panneau de réglages contient aussi une vraie liste d'historique navigable
(recherche, tri, groupement par jour, épinglage, note personnelle,
nettoyage automatique) et un gestionnaire d'exclusions de confidentialité —
voir "Corrections" plus bas pour pourquoi ce n'était pas le cas avant.

## Fichiers

### 1. `_readingTracker.js` — le chef d'orchestre

- Garde en mémoire l'historique et la progression de lecture, partagés avec les autres fichiers de ce module
- Donne accès à ces informations pour le reste de l'extension
- Détecte la page d'accueil pour y injecter le bloc "Continue Reading"

### 2. `seenTracking.js` — enregistrer les visites

- Note chaque fic visitée dans l'historique, avec un compteur de visites/relectures
- Respecte la liste d'exclusions de confidentialité (ne enregistre jamais un work ou fandom exclu)
- Affiche sur les listes un badge "🆕 Updated" coloré selon la date (relative ou exacte, au choix), si une fic déjà vue a été mise à jour depuis
- Un mode permet de n'afficher que les fics mises à jour (utile sur la page des abonnements)

### 3. `visualMarkers.js` — marquer les fics déjà vues

- Sur les listes, estompe, cache, floute ou barre le titre des fics déjà vues (au choix)
- Ne touche jamais aux favoris, aux abonnements, ni à la liste "à lire plus tard"
- Ajoute un badge cliquable "Ch X/Y" qui amène directement au dernier chapitre lu
- Compteur de fics cachées avec bouton "Reveal temporarily" (déjà en place, non documenté jusqu'ici)
- Case à cocher par fic + bouton pour marquer plusieurs fics comme vues d'un coup
- Raccourci clavier pour révéler temporairement les fics cachées

### 4. `readingProgress.js` — suivre la progression de lecture

- Suit où on en est dans une fic pendant qu'on lit
- Indicateur de progression flottant : badge %, barre cliquable (pour sauter à une position), ou anneau donut
- Notifie discrètement à 25 %/50 %/75 % lus
- Affiche une bannière "📍 Reprendre au chapitre X" avec l'ancienneté de la dernière lecture et la vitesse de lecture moyenne
- Affiche un petit message de bienvenue quand on rouvre une fic déjà commencée
- Ajoute un repère automatique à l'endroit exact où on s'était arrêté, plus des marque-pages manuels multiples

### 5. `viewHistory.js` — gérer l'historique

- Fournit les opérations de recherche, suppression, effacement et export utilisées par le panneau de réglages
- Peut importer l'historique officiel d'AO3 depuis sa propre page d'historique
- Injecte le bloc "Continue Reading" sur la page d'accueil

### 6. `readingTrackerHelpers.js` — logique pure partagée

- Compteur de visites, groupement/tri/épinglage/nettoyage de l'historique, vitesse de lecture, paliers de progression, math du donut, format de date "Updated", liste "Continue Reading"

### 7. `readingTracker.css`

- Les styles visuels des badges, bannières, messages, repères, marque-pages, et de la nouvelle liste d'historique navigable

## Specs — toutes traitées

- ~~Détecter et suivre les relectures d'une même fic~~ ✅ Fait — chaque entrée d'historique porte désormais un `visitCount`, incrémenté à chaque nouvelle visite (`nextVisitCount`), affiché dans le navigateur d'historique ("read 3×").
- ~~Marquer une fic comme "abandonnée" avec une raison~~ ✅ Fait (déjà couvert ailleurs) — c'est exactement le statut "Dropped" de `ficAppreciation`'s `multiStatusTracker`, qui invite déjà à une note optionnelle (`notePrompt: true`).
- ~~Écrire une note personnelle sur une session de lecture~~ ✅ Fait, avec une nuance — l'historique de ce module est structuré par *œuvre*, pas par session individuelle (une seule entrée par work, mise à jour à chaque visite) ; la note personnelle s'attache donc à l'entrée de l'œuvre plutôt qu'à une session précise. Éditable depuis le navigateur d'historique (✎).
- ~~Suivre la durée réelle de chaque session de lecture (pause/reprise)~~ ✅ Fait (déjà couvert ailleurs) — `activityPanel`'s `sessionHistory.js` enregistre déjà `startedAt`/`lastActiveAt`/`pageViews` par session, avec détection d'inactivité.
- ~~Marquer plusieurs fics comme "vues" d'un coup~~ ✅ Fait — case à cocher par œuvre sur les listes (`bulkMarkSeen`) + bouton "Mark selected as seen".
- ~~Des statistiques sur les moments où tu lis le plus~~ ✅ Fait (déjà couvert ailleurs) — `activityPanel`'s `habitsAnalysis.js` (histogramme horaire, heure de pic, carte de chaleur hebdomadaire).
- ~~Une alerte quand tu es en train de faire un marathon de lecture~~ ✅ Fait (déjà couvert ailleurs) — `activityPanel`'s `patternAnalysis.js` détecte déjà les sessions intensives.
- ~~Savoir sur quel appareil tu as lu une fic~~ ❌ Écarté — valeur d'usage très faible pour un outil mono-utilisateur·ice sans les autres fonctionnalités multi-appareils (synchronisation, voir plus bas) qui en dépendraient ; enregistrer du fingerprinting d'appareil sans usage concret ne se justifie pas.
- ~~Noter son humeur pendant une session de lecture~~ ✅ Fait (déjà couvert ailleurs) — `ficAppreciation`'s `moodTags` (tags d'humeur libres attachés à une œuvre).
- ~~Cliquer directement sur la barre de progression pour sauter à un pourcentage précis~~ ✅ Fait — nouveau style `progressStyle: 'bar'`, cliquable (`clickToSeek`).
- ~~De petites notifications aux étapes importantes (25%, 50%, 75% lus)~~ ✅ Fait — réglage `progressMilestones`.
- ~~Poser plusieurs marque-pages à l'intérieur d'un même chapitre~~ ✅ Fait — réglage `manualBookmarks`, bouton 🔖 + liste de marque-pages nommés, cliquables.
- ~~Deviner automatiquement comment tu as lu une fic (essayé, survolée...) d'après ta façon de faire défiler~~ ❌ Écarté — inférer un état subjectif à partir d'un signal indirect (le défilement) est le même genre d'ambition algorithmique déjà écartée ailleurs dans le projet (deviner si une fic "risque d'être abandonnée" dans `ficAppreciation`, prédire les lectures futures dans `activityPanel`) — la donnée ne permet pas de trancher fiablement.
- ~~Afficher combien de fics sont cachées et un bouton pour les faire réapparaître temporairement~~ ✅ Fait — déjà présent dans le code (`visualMarkers.js`'s `_injectHideCounter`/"Reveal temporarily") mais jamais documenté ; clarifié ici.
- ~~D'autres façons d'afficher les fics déjà vues (flou, titre barré, intensité réglable)~~ ✅ Fait — nouveaux modes `blur`/`strikethrough` ; l'intensité réglable existait déjà (`seenWorksOpacity`).
- ~~Afficher l'historique sous forme de ligne du temps, groupée par période~~ ✅ Fait — le navigateur d'historique du panneau groupe par Aujourd'hui / Hier / Cette semaine / Plus ancien (`groupHistoryByPeriod`).
- ~~Épingler certaines entrées de l'historique tout en haut de la liste~~ ✅ Fait — bouton ★ par entrée, les épinglées remontent toujours en premier.
- ~~Nettoyer l'historique automatiquement selon des critères choisis~~ ✅ Fait — bouton "Remove entries older than N days" (garde toujours les entrées épinglées).
- ~~Empêcher certaines fics d'apparaître dans l'historique, pour plus de confidentialité~~ ✅ Fait — liste d'exclusion par ID d'œuvre ou par fandom entier, gérée depuis le panneau ; `recordVisit`/`markSeen` la respectent.
- ~~Afficher les dates de mise à jour sous forme relative avec une couleur selon l'ancienneté, et pouvoir choisir entre relatif ou exact~~ ✅ Fait — le code colorait déjà par ancienneté ; réglage `updatedDateFormat` ajouté pour choisir le texte.
- ~~Un anneau de progression circulaire coloré~~ ✅ Fait — style `progressStyle: 'donut'`.
- ~~Un panneau fixe sur le côté avec chapitre, progression, temps et vitesse~~ ❌ Écarté — `chapterNavigation`'s panneau flottant "📑 Chapters" couvre déjà chapitre + progression ; dupliquer un second panneau fixe pour le même type d'information aurait créé une redondance d'interface entre deux modules. La vitesse de lecture (voir plus bas) est affichée dans la bannière de reprise plutôt que dans un panneau dédié.
- ~~Basculer l'affichage des fics déjà vues avec un raccourci clavier~~ ✅ Fait — touche `V` (via `W.AO3H_Keyboard`, si le module Keyboard Shortcuts est actif).
- ~~Trier l'historique (par exemple par date ou par titre)~~ ✅ Fait — menu déroulant dans le navigateur d'historique.
- ~~Suivre sa vitesse de lecture en temps réel (mots par minute)~~ ✅ Fait — accumulateur glissant (mots/ms) mis à jour à chaque sauvegarde de progression, affiché dans la bannière de reprise.
- ~~Un panneau "Continuer la lecture" sur la page d'accueil~~ ✅ Fait — liste des œuvres en cours les plus récemment ouvertes, avec lien direct de reprise.
- ~~Passer automatiquement à l'œuvre suivante d'une série~~ ✅ Fait (déjà couvert ailleurs) — `seriesHelper`'s bannière de navigation de série (Prev/Next) le fait déjà.
- ~~Synchroniser automatiquement la position de lecture entre appareils~~ ✅ Fait (déjà couvert ailleurs) — `backupAndSync`'s `cloudSync.js` synchronise déjà, de façon générique, toutes les données `ao3h:`-préfixées via le stockage de synchronisation du navigateur, y compris `ao3h:rt:progress:*` et `ao3h:rt:history`.
- ~~Avoir plusieurs statuts possibles (à lire, en cours, pause, terminée, abandonnée, à relire) avec badges et tableau de bord~~ ✅ Fait (déjà couvert ailleurs) — c'est très exactement `ficAppreciation`'s `multiStatusTracker` (7 statuts, badges, filtres, statistiques).
- ~~Voir la date exacte à laquelle chaque fic a été lue, dans l'historique~~ ✅ Fait — la donnée existait déjà (`seenAt`/`lastReadAt`, horodatage complet) mais n'était affichée nulle part ; maintenant visible (relative) dans le navigateur d'historique.

## Corrections apportées à des fonctionnalités déjà existantes (hors liste ci-dessus)

En résolvant les items ci-dessus, un vrai bug d'interface a été trouvé : les
réglages "Search in history" et "Delete individual entries" existaient
depuis longtemps, et `viewHistory.js` savait bel et bien filtrer et
supprimer des entrées — mais **rien dans le panneau de réglages ne rendait
jamais de champ de recherche ni de liste d'entrées à supprimer**. Le
callback `onHistoryFilter` était même explicitement branché sur `null`
dans le coordinateur. Autrement dit, la recherche et la suppression
individuelle n'avaient tout simplement aucune interface pour les
déclencher. Corrigé en construisant un vrai navigateur d'historique dans
`readingTracker-config.js` (recherche, tri, groupement, épinglage, note,
suppression, nettoyage), qui lit/écrit directement `ao3h:rt:history` — le
même mécanisme déjà utilisé par `filterManager-config.js` pour ses
presets.

De plus, `seenTracking.recordVisit()` reconstruisait entièrement l'entrée
d'historique à chaque visite, ce qui aurait silencieusement effacé les
futurs champs `pinned`/`note` posés depuis le panneau dès la visite
suivante. Corrigé pour les reporter d'une visite à l'autre.

## Explicitement écarté

- Pouvoir choisir à partir de quel pourcentage de défilement un chapitre est considéré comme lu — c'est fixé à 90%, ça ne se change pas
- Pouvoir régler le temps d'attente avant que la position de lecture soit sauvegardée automatiquement — c'est fixé à 2 secondes, ça ne se change pas
- Enregistrer l'appareil utilisé pour chaque lecture — aucun usage concret sans la synchronisation multi-appareils, déjà couverte par `backupAndSync`
- Deviner automatiquement le type de lecture (essayé/survolé/lu/relu) à partir du défilement — inférence subjective non fiable, même famille que d'autres suppositions déjà écartées dans le projet
- Un panneau latéral fixe dédié (chapitre/progression/temps/vitesse) — redondant avec le panneau flottant déjà construit par `chapterNavigation`

## Précision

⚠️ La doc historique anglaise décrit `readingProgress.js`, `viewHistory.js`
et `visualMarkers.js` comme des fichiers presque vides, sans vrai code
fonctionnel. Ce n'est plus le cas : les trois sont aujourd'hui pleinement
codés et fonctionnels, au même titre que `seenTracking.js`.

## Détails techniques

Stockage (`lib/storage`, préfixe `ao3h:` implicite) :

- `rt:history` — tableau `{ id, title, author, href, seenAt, chapter, chapterId, chapterHref, totalChapters, lastReadAt, visitCount, pinned?, note? }`, plafonné à 2000 entrées (LRU — les plus anciennes sont évincées)
- `rt:excludedWorks` — liste de `workId` et de `"fandom:<nom>"` jamais enregistrés (confidentialité)
- `rt:progress:{workId}` — `{ chapter, chapterId, chapterHref, totalChapters, scrollY, progress, lastReadAt, title, author, bookmarks? }`, sauvegardé avec un debounce de 2 s
- `rt:readingSpeed` — accumulateur glissant `{ wordsTotal, msTotal }`

API publique `W.AO3H_ReadingTracker` : `getProgress(workId)`, `markSeen(workId)`, `getHistory()`, `getReadingSpeed()` (ce dernier ajouté pour l'estimation de temps de lecture total de `laterShelf`).

Modules qui lisent ces mêmes clés/l'API en dépendance souple (lecture seule) :
`chapterNavigation` (`getProgress`), `readingDashboard`, `readingTimeline`,
`notificationCenter`, `backupAndSync`, `ficAppreciation`, `activityPanel`.

Fonctions pures notables par fichier :
- `seenTracking.js` : `recordVisit()` (calcule `visitCount` via `nextVisitCount()`, reporte `pinned`/`note` d'une visite à l'autre), `isExcluded`/`excludeWork`/`includeWork`, `formatUpdatedLabel()`
- `visualMarkers.js` : `setupBulkMarking()`, `registerKeyboardShortcut()` (touche `V` via `W.AO3H_Keyboard`)
- `readingProgress.js` : `injectFloatingBadge`/`updateFloatingBadge` (branchent sur `progressStyle`), `_seekToPercent()`, `_maybeShowMilestoneToast()`/`progressMilestonesCrossed()`, `_recordSpeedSample()`/`getReadingSpeed()` (ignore les trous d'inactivité >10 min et le défilement arrière), `addBookmark`/`removeBookmark`/`injectBookmarkControls`
- `viewHistory.js` : `injectContinueReadingWidget()`/`buildContinueReadingList()`
- `readingTrackerHelpers.js` : `nextVisitCount`, `groupHistoryByPeriod`, `sortHistory`/`pinnedFirst`, `entriesToCleanUp`, `computeReadingSpeed`, `progressMilestonesCrossed`, `donutDashArray`, `formatUpdatedLabel`, `buildContinueReadingList` — testées indépendamment dans `readingTrackerHelpers.test.js`
- `readingTracker-config.js` (panneau) : `wireConfigArea` lit/écrit `ao3h:rt:history` et `ao3h:rt:excludedWorks` directement (même pattern que `filterManager-config.js`), enregistré dans `lib/ui/panel/configs/index.js`'s `_initializers`
