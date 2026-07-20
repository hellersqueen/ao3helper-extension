# readingDashboard

**Tab:** Library

## À quoi ça sert

Ce module ajoute un tableau de bord personnel en haut de la page d'accueil
AO3, avec plusieurs blocs basés sur les fics que tu as visitées : reprendre
ses lectures en cours, les dernières fics ouvertes, les fics pas encore
terminées, tes fandoms et tags les plus lus, et des liens rapides vers tes
listes.

## Réglages utilisateur

Ces réglages sont désormais branchés au code (ils ne l'étaient pas
auparavant — le panneau les proposait sans aucun effet). Chacun des sept
réglages ci-dessous est désormais lu par `readingDashboard.js` (via
`makeCfg`) et modifie réellement l'affichage.

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showRecentWorks` | activé | Afficher le bloc des fics récentes |
| `showWipTracker` | activé | Afficher le bloc des fics en cours |
| `showTopFandoms` | activé | Afficher le bloc des fandoms les plus lus |
| `showTopTags` | activé | Afficher le bloc (nuage) des tags les plus lus |
| `showQuickLinks` | activé | Afficher les liens rapides |
| `recentWorksCount` | `10` | Le nombre de fics récentes affichées |
| `topFandomsCount` | `6` | Le nombre de fandoms affichés |

La configuration de ces 7 réglages est définie dans
`lib/ui/panel/configs/library/readingDashboard-config.js` ; le coordinateur
ne réenregistre plus d'ancienne configuration globale legacy (`AO3H_Config` /
`Common.Settings.define`).

## Fichiers

### `readingDashboard.js` — coordinateur : suivi des visites, rendu du tableau de bord

- Note chaque fic visitée (titre, fandom, tags, statut, infos nécessaires pour rouvrir la fic, nombre de visites) dans un historique local, avec un maximum de 200 fics gardées (les plus anciennes sont retirées au-delà)
- L'historique continue d'être mis à jour en arrière-plan sur toutes les pages d'œuvres, même quand le tableau de bord n'est pas affiché
- Affiche un bloc "Continue Reading" avec jusqu'à 3 fics en cours de lecture — c'est le seul bloc qui lit les données de progression de `readingTracker` (dépendance souple, en lecture seule) ; si ces données sont absentes, le reste du tableau de bord continue de fonctionner avec son propre historique
- Affiche un bloc avec les dernières fics ouvertes (limité par `recentWorksCount`, 10 par défaut), un bloc avec les fics pas encore terminées, un classement des fandoms les plus consultés (limité par `topFandomsCount`, 6 par défaut), un vrai nuage de tags visuel (taille de police proportionnelle à la fréquence, plutôt qu'une simple liste), et des liens rapides vers Bookmarks, l'historique, Marked for Later et les abonnements — chacun activable/désactivable via les réglages ci-dessus
- Affiche un bloc "Reading insights" toujours visible (pas de réglage dédié pour le masquer, il fait partie du cœur du tableau de bord comme "Continue Reading") : diversité (fandoms/tags distincts), % de relectures (basé sur le compteur de visites par fic), et un profil de lecteur descriptif ("Completionist", "Marathon reader" ou "Casual reader") avec une phrase d'explication — pas un badge
- Affiche un bloc "Your ... in fics" (bilan de l'année civile en cours) : nombre de fics visitées, terminées/en cours, fandoms et tags distincts explorés, fandom le plus consulté — limité aux données encore présentes dans l'historique (200 fics max ; d'anciennes visites de la même année peuvent avoir été évincées par cette limite)
- Les blocs (hors liens rapides, qui restent une simple rangée en dehors de la grille réorganisable) sont réorganisables par glisser-déposer via l'outil partagé `lib/ui/drag-reorder.js`, ordre mémorisé
- Le tableau de bord n'apparaît que sur la page d'accueil ou la page personnelle ; ailleurs, seul l'historique de visite continue d'être mis à jour en arrière-plan

### Calculs internes intégrés à `readingDashboard.js`

- Diversité (`computeDiversity`), pourcentage de relectures (`computeRereadPercent`), profil de lecteur (`computeReaderProfile`, heuristique descriptive, pas un badge), bilan annuel (`computeYearRecap`)

### `readingDashboard.css`

- Les styles visuels du tableau de bord et de ses blocs (Continue Reading, fics récentes, fics en cours, classement des fandoms, nuage de tags, insights), des poignées de glisser-déposer, des liens rapides, et des différents titres/cartes/éléments de navigation

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Réorganiser les blocs à la main par glisser-déposer~~ ✅ Implémenté (ordre mémorisé, via l'outil partagé `lib/ui/drag-reorder.js`)
- ~~Un bilan annuel façon "rétrospective de l'année", comme font certaines applications de musique~~ ✅ Bloc "Your ... in fics"
- ~~Deviner ton "profil de lecteur" (plutôt marathon, occasionnel, ou complétionniste)~~ ✅ Une ligne descriptive dans "Reading insights" (pas un badge — voir Décisions de conception)
- ~~Des indicateurs sur la diversité de ce que tu lis~~ ✅ Bloc "Reading insights"
- ~~Voir le pourcentage de fics que tu relis par rapport aux nouvelles~~ ✅ Bloc "Reading insights" (basé sur le compteur de visites par fic)
- ~~Un vrai nuage de tags visuel pour tes préférences, pas juste une liste~~ ✅ Remplace la liste des tags

## Explicitement écarté

- Calculer ta vitesse de lecture — jugé peu fiable sans vraie mesure du temps de lecture
- Des graphiques ou des statistiques avancées — pour rester simple (les indicateurs ajoutés restent de simples nombres/phrases, pas de graphiques)
- Se fixer des objectifs de lecture à atteindre — la lecture reste un loisir, pas un objectif chiffré
- Comparer ses statistiques de lecture à celles des autres — pour rester privé
- Des badges ou des séries de jours consécutifs (streaks) sur ce tableau de bord — retiré pour ne pas trop transformer la lecture en jeu ; le "profil de lecteur" du bloc "Reading insights" reste volontairement une simple phrase descriptive calculée à partir de données déjà affichées ailleurs (taux de complétion, rythme de visites), pas un badge visuel ni un système de déblocage
- Exporter des rapports personnalisables — écarté pour garder le tableau de bord simple
- **Suivre la progression de défis de lecture** — contredit directement la décision "Objectifs chiffrés" déjà prise pour ce module (pas d'objectifs numériques à atteindre). Un défi de lecture est une forme d'objectif chiffré ; l'idée reste incompatible avec la philosophie du module telle que déjà tranchée.

## Précision

⚠️ La doc historique anglaise dit que le lien avec le module readingTracker
est déclaré mais jamais vraiment utilisé. Ce n'est plus tout à fait vrai :
le bloc "Continue Reading" lit bel et bien les données de progression de
readingTracker. Tous les autres blocs (fics récentes, fics en cours,
fandoms les plus consultés, nuage de tags, insights, bilan annuel), eux,
utilisent toujours leur propre mémoire indépendante.

## Corrections apportées à des fonctionnalités déjà existantes

Le bloc "Continue Reading" lisait une clé `ao3h:readingTracker:progress`
qui n'a jamais existé — `readingTracker` stocke la progression sous une clé
par œuvre (`ao3h:rt:progress:{workId}`, via `W.AO3H_ReadingTracker.getProgress`),
pas sous un objet global unique. Les noms de champs supposés (`percent`,
`updatedAt`) ne correspondaient pas non plus aux vrais champs (`progress`,
`lastReadAt`). Ce bloc n'a donc jamais pu afficher la moindre fic en cours ;
il affichait toujours son état vide. Corrigé pour interroger la progression
œuvre par œuvre, comme le fait déjà `chapterNavigation`.

## Détails techniques

Stockage principal : `ao3h_dashboard_data_v1` — particularité historique,
sans le préfixe `ao3h:` habituel, conservée telle quelle pour la continuité
des données existantes.

Structure : `{ works: [], fandomCounts: {}, tagCounts: {}, blockOrder: [] }`

- `works` — l'historique des fics visitées (max 200) ; chaque entrée porte aussi un `visitCount` (incrémenté à chaque revisite), utilisé pour le % de relectures dans "Reading insights"
- `fandomCounts` / `tagCounts` — nombre d'occurrences par fandom / par tag
- `blockOrder` — l'ordre des blocs choisi par glisser-déposer (liste d'identifiants de blocs), réappliqué à chaque rendu
