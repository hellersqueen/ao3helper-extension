# ficAppreciation

**Tab:** Library

## À quoi ça sert

Ce module regroupe tout ce qui permet de suivre son appréciation
personnelle d'une fic : la marquer comme terminée, lui donner des kudos
plus facilement, la noter par étoiles (avec des extras comme les
catégories, les demi-étoiles ou l'historique des notes), et lui donner un
statut de lecture parmi plusieurs choix (à lire, en cours, terminée,
abandonnée...). Il remplace trois anciens modules qui faisaient chacun une
seule de ces choses.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showManualCheckButton` | désactivé | Bouton pour vérifier soi-même si on a déjà donné des kudos, sur la page de la fic |
| `statusNotes` | activé | Permet d'écrire une petite note personnelle avec le statut de lecture |
| `hideStatusFilter` | (aucun) | Les statuts de lecture à cacher sur les listes de fics |
| `completionNotes` | désactivé | Permet d'écrire une note en marquant une fic comme terminée |
| `filterCompletedWorks` | activé | Cache les fics déjà terminées sur les listes |
| `quickKudosButton` | désactivé | Ajoute un bouton pour donner des kudos directement depuis la liste, sans ouvrir la fic |
| `commentAssistOnRevisit` | désactivé | Propose de laisser un commentaire quand on revient sur une fic déjà kudosée |
| `hideKudosedFilter` | désactivé | Cache les fics déjà kudosées sur les listes |
| `showRatingOnBlurbs` | activé | Affiche la note en étoiles directement sur les listes |
| `ratingNotes` | désactivé | Permet d'écrire une note avec chaque notation en étoiles |
| `kudosIcon` | 🧡 | L'icône utilisée pour le bouton et le badge de kudos |
| `tooltipDateFormat` | `long` | Comment la date du kudos est affichée (complète, courte, ou "il y a...") |
| `kudosReminder` | désactivé | Bannière sur la page d'une fic terminée mais jamais kudosée, avec un bouton kudos en un clic |
| `confirmBeforeKudos` | désactivé | Demande un second clic sur le bouton de kudos rapide d'une liste, pour éviter les clics accidentels |
| `kudosBookmarkFinder` | activé | Bouton "Find kudosed works not bookmarked" sur sa propre page Bookmarks |
| `halfStars` | désactivé | Autorise les notes en demi-étoile (.5) sur le widget de la page d'œuvre |
| `ratingCategories` | désactivé | Ajoute des mini-notations Intrigue / Personnages / Écriture, plus un score combiné affiché sur les listes |
| `moodTags` | désactivé | Tags d'humeur libres (drôle, réconfortant...) attachés à la note, sur la page d'œuvre |
| `showCommunityStats` | désactivé | Affiche les kudos/hits communautaires à côté de sa note personnelle |
| `promptRatingOnFinish` | désactivé | Fait défiler jusqu'au widget d'étoiles et le met en valeur juste après avoir marqué une fic terminée (jamais de notation automatique) |
| `completionMilestones` | activé | Petit toast de félicitations à 10, 25, 50, 100... fics terminées |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser, trier,
actualiser) *(pas encore active — rien n'est branché derrière ; hors
périmètre de ce chantier)*.

## Fichiers

### 1. `_ficAppreciation.js` — le chef d'orchestre

- Met en route tous les autres fichiers de ce module
- S'adapte selon qu'on est sur la page d'une fic ou sur une liste de fics
- Donne accès à des actions simples pour le reste de l'extension (par exemple, marquer une fic comme lue)
- Affiche le rappel de kudos et le nudge de notation post-complétion (`EV_WORK_FINISHED`)

### 2. `markAsFinished.js` — marquer une fic comme terminée

- Ajoute un bouton "✓ Mark as Finished" sur la page d'une fic
- Ajoute un badge et un bouton rapide sur les listes de fics
- Permet d'écrire une petite note en marquant une fic comme terminée
- Affiche un toast de félicitations en franchissant un cap (10/25/50/100/250/500/1000)

### 3. `kudosTracker.js` — repérer et donner des kudos

- Détecte si on a déjà donné des kudos à une fic
- Grise le bouton de kudos si c'est déjà fait
- Ajoute un badge sur les listes pour les fics déjà kudosées
- Propose un bouton pour donner des kudos rapidement, sans ouvrir la fic (avec confirmation optionnelle)
- Capture le titre, l'auteur·ice et les fandoms au moment du kudos (pour les statistiques et l'historique)
- Affiche une bannière de rappel sur une fic terminée mais jamais kudosée
- Met à jour l'état des kudos lorsqu'un kudos est enregistré depuis un autre onglet
- Ajoute un bouton pour vérifier soi-même si des kudos ont été donnés
- Affiche la date du kudos sur la page de la fic et dans une bulle d'information sur les listes
- Applique le format de date et l'icône de kudos configurés
- Affiche un message pendant la vérification de l'état des kudos

### 4. `kudosExtendedFeatures.js` — statistiques et historique de kudos

- Montre le nombre total de kudos donnés, réparti par mois, par fandom et par auteur·ice
- Montre la plus longue série de jours consécutifs avec au moins un kudos donné
- Montre les habitudes horaires (à quels moments de la journée on donne le plus de kudos)
- Donne un historique chronologique complet, filtrable par titre/auteur·ice/fandom
- Permet d'exporter ses statistiques de kudos en JSON ou en CSV (avec titre/auteur/fandoms quand disponibles)

### 5. `starRatings.js` — noter les fics par étoiles

- Ajoute une notation personnelle de 1 à 5 étoiles (ou demi-étoiles) sur la page d'une fic
- Affiche aussi la note sur les listes de fics
- Permet d'écrire une note avec chaque notation
- Catégories de notation optionnelles (Intrigue / Personnages / Écriture) avec score combiné
- Tags d'humeur optionnels
- Historique des notes précédentes (bulle d'info)
- Statistiques : moyenne, répartition, évolution mensuelle
- Comparaison optionnelle avec les kudos/hits communautaires affichés sur la fic

### 6. `multiStatusTracker.js` — statut de lecture

- Permet de choisir un statut parmi 7 : à lire, en cours, terminé, abandonné, pas aimé, en pause, relu
- Affiche le statut avec un badge et un menu déroulant, sur la page de la fic et sur les listes
- Affiche un pourcentage de progression de lecture (via readingTracker) à la place de l'icône plate quand le statut est "en cours"
- Compte le nombre de fois qu'une fic a été explicitement marquée "relu", pas juste la dernière fois
- Permet d'écrire une note quand on marque une fic "abandonnée" ou "pas aimée"
- Permet de cacher certains statuts sur les listes
- Montre des statistiques (par exemple le pourcentage de fics terminées) et permet de les exporter

### 7. `kudosBookmarkFinder.js` — fics kudosées mais non favorites

- Sur sa propre page Bookmarks, ajoute un bouton qui scanne les pages récentes de favoris (jusqu'à 5) et liste les fics kudosées localement qui n'y apparaissent pas
- Requêtes en lecture seule, sur son propre compte uniquement

### 8. Logique pure partagée intégrée à `_ficAppreciation.js`

- Regroupements et statistiques (kudos par fandom/auteur, notes moyennes/répartition/évolution mensuelle)
- Historique des notes, score combiné de catégories, valeur de demi-étoile selon la position du clic
- Habitudes horaires de kudos, paliers de complétion franchis, compteur de relecture
- Filtrage/tri de l'historique de kudos, diff kudosé-non-favori

### 9. `ficAppreciation.css`

- Les styles visuels de tous les boutons, badges et panneaux ci-dessus

## Specs — toutes traitées

Ce sont les idées dont on parlait dans d'autres docs mais qui n'avaient pas
encore de code. Chacune a été implémentée ou explicitement écartée :

- ~~Recevoir un rappel pour les fics qu'on a lues mais qu'on n'a jamais kudosées~~ ✅ Fait — bannière `kudosReminder` sur la page d'œuvre (`kudosTracker.injectKudosReminderBanner`), avec un bouton "Give kudos" en un clic.
- ~~Scanner tout un fandom pour repérer ses fics favorites qui n'ont pas encore reçu de kudos~~ ❌ Écarté — un scan actif et non borné de tout un fandom (potentiellement des centaines de pages) est un crawl trop lourd pour AO3 et redondant avec le rappel ci-dessus, qui couvre déjà le cas à l'échelle d'une fic à la fois, sans requêtes en arrière-plan.
- ~~Voir ses statistiques de kudos réparties par fandom ou par auteur~~ ✅ Fait — `kudosExtendedFeatures.getStats()` expose désormais `byFandom`/`byAuthor` (top 10), à partir des métadonnées capturées au moment du kudos.
- ~~Transférer ses kudos d'un ancien compte AO3 vers un autre~~ ❌ Écarté — les données sont locales au navigateur, pas au compte AO3 ; il n'y a donc rien de spécifique à "transférer" côté extension au-delà de l'export JSON/CSV déjà disponible (`exportKudos`). Redonner en masse des kudos sous un autre compte relève de l'automatisation de masse (voir l'item suivant).
- ~~Trouver les fics qu'on a kudosées mais jamais mises en favoris~~ ✅ Fait — `kudosBookmarkFinder.js`, bouton sur sa propre page Bookmarks (réglage `kudosBookmarkFinder`).
- ~~Des catégories pour les notes en étoiles (intrigue / personnages / écriture)~~ ✅ Fait — réglage `ratingCategories`, mini-widgets sur la page d'œuvre, score combiné affiché sur les listes.
- ~~Voir comment une note en étoiles a changé si on la remet à jour plus tard~~ ✅ Fait — `starRatings.getRatingHistory(workId)`, bulle d'info ℹ️ sur le widget de la page d'œuvre.
- ~~Redonner des kudos en masse à partir d'un ancien compte~~ ❌ Écarté — de l'automatisation de kudos en masse ressemble à un comportement de bot et risque l'abus/le rate-limit ; et changer de compte AO3 dans le navigateur n'est pas quelque chose que l'extension peut faire à la place de l'utilisateur·ice.
- ~~Découvrir d'autres lecteurs qui kudosent les mêmes fics que toi~~ ❌ Écarté — nécessiterait de profiler les kudos d'autres personnes (filtrage collaboratif), directement apparenté au concept "Recommendation Engine" déjà rejeté (voir `docs/never-built-modules.md`) ; pose aussi un problème de vie privée pour les autres utilisateur·ices.
- ~~Voir l'évolution de tes notes en étoiles au fil du temps~~ ✅ Fait — `starRatings.getRatingStats().byMonth` (moyenne mensuelle).
- ~~Comparer tes notes personnelles aux statistiques d'engagement de la communauté~~ ✅ Fait — réglage `showCommunityStats`, affiche les kudos/hits déjà visibles sur la page à côté de la note personnelle (simple juxtaposition, pas un algorithme).
- ~~Ajouter des tags d'humeur ou d'émotion à une fic~~ ✅ Fait — réglage `moodTags`, champ texte libre sur la page d'œuvre.
- ~~Un pourcentage de progression au lieu du simple statut "terminé"~~ ✅ Fait — le badge de statut "en cours" affiche le pourcentage lu (`multiStatusTracker`, via `W.AO3H_ReadingTracker.getProgress`).
- ~~Transformer automatiquement une tentative de re-kudos en petit commentaire~~ ❌ Écarté — poster un commentaire automatiquement, sans relecture par l'utilisateur·ice, va à l'encontre du principe (déjà appliqué ailleurs, ex. commentKit) de toujours laisser relire avant de poster ; répéter le même texte sur plusieurs fics ressemblerait aussi à du spam.
- ~~Limiter le nombre de kudos qu'on peut donner par minute~~ ❌ Écarté — il n'existe aucune action de kudos en masse dans ce module (le bouton rapide est un clic manuel unique) ; AO3 limite déjà côté serveur. Rien à limiter côté client.
- ~~Un historique chronologique de tous les kudos donnés, filtrable~~ ✅ Fait — `kudosExtendedFeatures.getHistory({query, order})`, recherche par titre/auteur·ice/fandom.
- ~~Un score personnel unique qui combine plusieurs notes par catégories~~ ✅ Fait — `combinedCategoryScore()`, affiché en badge "Ⓒ" sur les listes quand `ratingCategories` est actif.
- ~~Une fenêtre de confirmation avant d'envoyer un kudos~~ ✅ Fait — réglage `confirmBeforeKudos` (second clic requis sur le bouton rapide d'une liste).
- ~~Proposer de noter la fic en étoiles au moment où on la marque comme terminée~~ ✅ Fait — réglage `promptRatingOnFinish` (met en valeur le widget d'étoiles, ne note jamais automatiquement).
- ~~Compter combien de fois on a relu une fic~~ ✅ Fait — `rereadCount` dans l'entrée de statut, incrémenté à chaque sélection explicite de "Re-read".
- ~~De petites félicitations quand on atteint un cap de fics terminées~~ ✅ Fait — toast à 10/25/50/100/250/500/1000 (réglage `completionMilestones`).
- ~~Des demi-étoiles pour noter plus précisément~~ ✅ Fait — réglage `halfStars`.
- ~~Des statistiques sur les notes en étoiles (moyenne, répartition, total)~~ ✅ Fait — `starRatings.getRatingStats()`.
- ~~Garder la date exacte à laquelle tu as fini de lire une fic~~ ✅ Déjà fait — `markFinished` enregistre déjà une date (jour précis) depuis le début ; aucun changement de code nécessaire, seulement cette clarification dans la doc.
- ~~Analyser tes habitudes de kudos avec le tableau de bord d'activité~~ ✅ Fait, dans ce module — `kudosExtendedFeatures.getTimeHabits()` (histogramme par heure, à partir d'un horodatage `ts` capturé depuis ce chantier ; les kudos plus anciens sont ignorés faute de précision). Affiché dans `buildStatsHTML()`. Volontairement gardé dans `ficAppreciation` plutôt qu'ajouté à `activityPanel` (qui a son propre `habitsAnalysis` pour les habitudes de *lecture*, pas de kudos) — pas de raison de coupler les deux modules pour cette donnée.

## Explicitement écarté

- Partager ses statistiques de complétion avec d'autres — la lecture reste privée
- Un vrai système de critiques longues — les commentaires AO3 suffisent déjà
- Un moteur de recommandations basé sur tes appréciations — jugé trop subjectif
- Partager ses listes de recommandations avec d'autres — pour rester privé
- Deviner si une fic risque d'être abandonnée pour lui coller un badge
  "à risque" — écarté pour des raisons éthiques, ça porterait un jugement
  sur le travail de l'auteur
- Modifier directement le vrai système de notes ou de kudos d'AO3 — écarté, ça ne respecte pas la règle de l'extension qui ajoute des infos par-dessus le site sans jamais toucher au site original
- Scanner tout un fandom pour repérer les favoris non kudosés — crawl trop lourd, redondant avec le rappel par-fic
- Transférer ses kudos d'un ancien compte vers un autre — donnée locale au navigateur, pas au compte ; export déjà disponible
- Redonner des kudos en masse depuis un ancien compte — automatisation de masse, risque d'abus
- Découvrir d'autres lecteur·ices aux kudos similaires — profilage d'autrui, apparenté au "Recommendation Engine" déjà rejeté
- Transformer un second kudos en commentaire automatique — poste sans relecture, risque de spam répétitif
- Limiter le nombre de kudos par minute — aucune action de masse à limiter côté client

## Précision

⚠️ La doc historique anglaise disait que le statut de lecture à plusieurs
valeurs avait été rejeté ("trop compliqué") et que le bouton de kudos
rapide n'existait pas. En réalité, les 7 statuts de lecture
(`multiStatusTracker.js`) et le bouton de kudos rapide sont bel et bien
codés aujourd'hui. Elle disait aussi que le rappel de commentaire à la
revisite d'une fic était à peine commencé — en réalité c'est une bannière
complète, avec la date du kudos et un lien direct vers les commentaires.

## Détails techniques

Stockage (clés brutes, via `AO3H.store.lsGet`/`lsSet` — qui, malgré le nom
"per-user" de `AO3H.store`, passent en réalité directement par le
`localStorage` synchrone brut comme partout ailleurs ; seuls les
`get`/`set`/`del` asynchrones, adossés aux GM-values, sont namespacés par
nom d'utilisateur·ice AO3 détecté) :

- `ficAppreciation:finished` — `{ [workId]: { date, note? } }`
- `ficAppreciation:kudosed` — `{ [workId]: { date, ts?, title?, author?, fandoms? } }` (les entrées antérieures à ce chantier n'ont pas les champs `ts`/`title`/`author`/`fandoms` ; tout le code qui les lit dégrade proprement — fandom/auteur "inconnus" ignorés des regroupements, horodatage absent ignoré des habitudes horaires)
- `ficAppreciation:ratings` — `{ [workId]: { stars, date, note?, history?, categories?, moodTags? } }` (`history[]` plafonné à 10 entrées via `appendRatingHistory()`)
- `ficAppreciation:status` — `{ [workId]: { status, date, note?, rereadCount? } }`

API publique `AO3H.ficAppreciation` : `isFinished(workId)`, `hasGivenKudos(workId)`, `getRating(workId)`, `getStatus(workId)`, `markFinished(workId, note?)`, `recordKudos(workId)`, `getKudosStats()`, `getStatusStats()`, `exportKudos(format)`, `exportStatuses(format)`, `getKudosHistory({query?, order?})`, `getKudosTimeHabits()`, `getRatingStats()`, `getRatingHistory(workId)`, `getCategoryRatings(workId)`, `getMoodTags(workId)`, `findKudosedNotBookmarked()`.

Notes techniques par fichier, en complément de la section "Fichiers" ci-dessus :
- `_ficAppreciation.js` : le rappel de kudos appelle `kudosTracker.injectKudosReminderBanner(workId)` ; le nudge de notation post-complétion écoute `EV_WORK_FINISHED` (émis par `markAsFinished.js`) et met en valeur le widget d'étoiles via la classe `ao3h-fa-star-wrap-highlight`.
- `markAsFinished.js` : `markFinished()` compare le total de fics terminées avant/après via `milestonesCrossed()`.
- `kudosTracker.js` : `recordKudos(workId, meta?)` capture les métadonnées depuis `_extractWorkPageMeta()` (page d'œuvre) ou `getBlurbMeta()` (`lib/ao3/parsers.js`, depuis un blurb) ; `injectQuickKudosButton()` affiche "❓ Click again to confirm" pendant 4 secondes quand `confirmBeforeKudos` est actif ; la bannière de rappel réutilise `giveKudos()` de `lib/ao3/actions.js` ; le fichier gère aussi la synchronisation entre onglets, la vérification manuelle et toute la présentation des kudos.
- `starRatings.js` : la demi-étoile pose `stars = n - 0.5` (`halfStarValue()`, selon la moitié cliquée), rendue avec deux `<span>` superposés (`.ao3h-fa-star-back`/`.ao3h-fa-star-front`, `clip-path`) ; `showCommunityStats` lit `dl.stats dd.kudos`/`dd.hits` déjà présents sur la page (simple juxtaposition, aucun calcul ni requête).
- `multiStatusTracker.js` : `rereadCount` survit aux changements de statut suivants (pas remis à zéro en repassant par "Reading").
- `kudosBookmarkFinder.js` : utilise `fetchAO3PageText`/`parseBookmarksPageHTML` (même origine, lecture seule).
- `kudosTracker.js` / `_ficAppreciation.js` : cycle complet des kudos et orchestration générale du module.
- `_ficAppreciation.js` expose aussi la logique pure testée dans `ficAppreciation.logic.test.js` — `groupCounts`/`topEntries`, `computeRatingStats`/`ratingByMonth`/`appendRatingHistory`/`combinedCategoryScore`/`halfStarValue`, `hourOfDayHistogram`/`peakHours`, `milestonesCrossed`/`nextRereadCount`, `filterKudosHistory`/`sortKudosHistoryByDate`, `diffNotBookmarked`.
