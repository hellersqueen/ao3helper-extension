# activityPanel

**Tab:** Library

## À quoi ça sert

Ce module rassemble les données de lecture récoltées par les autres
modules (historique, kudos, favoris, sessions) pour donner une vue
d'ensemble de ton activité de lecture, sous forme de petits blocs affichés
sur le profil, les statistiques ou le tableau de bord d'AO3.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showTagCloud` | désactivé | Nuage de tags cliquable, taille proportionnelle à la fréquence |
| `readingAchievements` | activé | Active les badges de paliers (10K / 100K / 1M mots lus) |

Le panneau affiche aussi une section "Behaviour Settings" (synchroniser,
trier, actualiser) *(pas encore active — rien n'est branché derrière ;
hors périmètre de ce chantier)*.

Toujours visible (aucun réglage individuel — toutes les statistiques
restent affichées ensemble, par choix de conception) :

- Cartes de statistiques (œuvres/mots/kudos), sélecteur de période
  (Aujourd'hui / 7j / 30j / Cette année / Tout), boutons Actualiser (🔄) et
  Exporter (⬇)
- Tableau des fandoms : camembert, colonnes Heures + Kudos, comparaison de
  jusqu'à 3 fandoms côte à côte
- Habitudes de lecture : carte de chaleur hebdomadaire, créneau prédit,
  profil lecteur de nuit/régulier
- Tendances : tags en hausse, comparaison mois par mois, relectures,
  sessions intensives, point d'abandon typique, répartition par trimestre
  et par saison/catégorie
- Liens rapides vers Bookmarks / History / Subscriptions

## Fichiers

### 1. `_activityPanel.js` — le chef d'orchestre

- Met en route tous les autres fichiers de ce module

### 2. Outils partagés intégrés à `_activityPanel.js`

- Garde en un seul endroit les réglages et le stockage utilisés par tous les autres fichiers

### 3. Collecte des données intégrée à `_activityPanel.js`

- Rassemble les données venant de l'historique, des kudos, des favoris et des sessions de lecture
- Calcule des totaux (fics, mots, heures, kudos, favoris), les fandoms/tags/auteurs les plus lus, et la note préférée
- Complète désormais les fandoms/tags/note à partir des sessions quand l'historique de lecture ne les fournit pas (voir "Corrections" plus bas)

### 4. Statistiques et séries intégrées à `_activityPanel.js`

- Calcule combien de jours consécutifs tu as lu (streak)
- Calcule les paliers/accomplissements débloqués (par exemple un certain nombre de mots ou de fics lues)

### 5. `fandomBreakdown.js` — tableau des fandoms

- Affiche un tableau classé des 20 fandoms les plus lus (fics, mots, heures estimées, kudos donnés), qu'on peut trier par colonne
- Un camembert des 8 fandoms principaux, et un mode comparaison (jusqu'à 3 fandoms côte à côte)

### 6. `habitsAnalysis.js` — habitudes de lecture

- Affiche un histogramme des heures de la journée où tu lis le plus
- Indique ton heure de pic et ta période préférée (matin/après-midi/soir/nuit)
- Carte de chaleur hebdomadaire (jour × heure), créneau de lecture prédit, et profil lecteur de nuit/régulier

### 7. `patternAnalysis.js` — tendances de lecture

- Repère des tendances : saison de lecture préférée, longueur de fic préférée, tags en hausse récemment
- Signale si tu n'as pas lu depuis longtemps (14 jours ou plus), avec un message encourageant
- Détecte un changement de fandom préféré sur les 30 derniers jours
- Compare ce mois-ci au mois précédent, détecte les relectures et les sessions de lecture intensives
- Estime le point où tu abandonnes généralement une fic non terminée, et donne une répartition par trimestre et par catégorie/saison

### 8. `readingInsights.js` — bloc "Your Reading Insights"

- Affiche des cartes de statistiques, une bannière de série de lecture, et des badges d'accomplissement (par exemple "Centennial Reader", "Prolific Reader", "Week Warrior", "Kudos Giver")
- Sélecteur de période, boutons Actualiser et Exporter, nuage de tags cliquable, récapitulatif mensuel/annuel, liens rapides
- Visible sur le profil, la page de statistiques ou le tableau de bord
- Ne s'affiche pas s'il n'y a pas encore assez de données de lecture

### 9. `sessionHistory.js` — enregistrement des sessions

- Enregistre chaque visite d'une page de fic comme une "session" (fandom, tags, note, catégorie, mots, heure, nombre de pages vues), avec un maximum de 500 sessions gardées
- C'est cette source de données qui alimente tous les autres blocs d'analyse

### 10. Logique pure partagée intégrée à `_activityPanel.js`

- Filtrage par période, nuage de tags, carte de chaleur jour×heure, détection de relecture/sessions intensives, estimation du point d'abandon, comparaison de périodes, détection de tendances de tags, regroupement par catégorie/trimestre, profil lecteur, pourcentages de fandoms, texte de récapitulatif

### 11. `activityPanel.css`

- Les styles visuels de tous les blocs ci-dessus

## Specs — toutes traitées

- ~~Un nuage de tags (tag cloud) visuel des tags les plus lus — un réglage existe pour l'activer, mais rien n'est vraiment affiché~~ ✅ Fait — nuage de tags dans `readingInsights.js`, taille proportionnelle à la fréquence (`buildTagCloud`), corrige au passage le réglage `showTagCloud` qui n'affichait jamais rien.
- ~~Un bouton pour exporter toutes les statistiques dans un fichier~~ ✅ Fait — bouton ⬇ dans l'en-tête du bloc, télécharge un JSON avec les stats agrégées et les sessions brutes.
- ~~Un bouton pour recalculer les statistiques à la demande~~ ✅ Fait — bouton 🔄, ré-agrège et redessine le bloc sans recharger la page.
- ~~Un bouton "My Stats" dans le menu de navigation d'AO3~~ ✅ Fait (déjà couvert ailleurs) — `mainNavigation`'s **Quick Links** (jusqu'à 5 liens configurables injectés dans le menu natif d'AO3) permet déjà d'ajouter un tel lien ; pas besoin de le recoder ici.
- ~~Choisir une période (aujourd'hui / 7 jours / 30 jours / cette année / tout) pour filtrer les statistiques~~ ✅ Fait — sélecteur dans `readingInsights.js`, persisté dans `activityPanel:preferences.timePeriod` (clé déjà réservée, jamais branchée jusqu'ici). Filtre les cartes de statistiques ; le streak et les accomplissements restent volontairement calculés sur tout l'historique (une "série" ou un "palier" filtré par période n'aurait pas de sens).
- ~~Réorganiser les blocs du tableau de bord en les faisant glisser, ou les cacher un par un~~ ❌ Écarté — la partie "cacher un par un" contredit directement une décision déjà actée dans ce même document ("Affichage individuel des statistiques" : toutes les statistiques restent affichées ensemble) ; le glisser-déposer est par ailleurs un chantier d'interface disproportionné pour ce module.
- ~~Une carte de chaleur des heures où tu lis le plus, et des prédictions sur tes meilleurs moments pour lire~~ ✅ Fait — carte de chaleur jour×heure et créneau prédit (`bestReadingSlot`) dans `habitsAnalysis.js`.
- ~~Voir à quel moment précis tu abandonnes généralement une fic~~ ✅ Fait — estimation du nombre de pages vues avant abandon (`estimateAbandonPoint`), croisé avec `AO3H.ficAppreciation.isFinished`.
- ~~Repérer les fics que tu relis plusieurs fois, ou détecter les sessions de lecture intensive~~ ✅ Fait — `detectRereads`/`detectIntensiveSessions`, affichés dans `patternAnalysis.js`.
- ~~Te comparer à toi-même dans le passé (par exemple mois par mois ou année par année)~~ ✅ Fait — `compareByPeriod`, comparaison du mois/de l'année en cours au précédent.
- ~~Comparer plusieurs fandoms entre eux directement~~ ✅ Fait — cases à cocher dans le tableau des fandoms, jusqu'à 3 en comparaison côte à côte.
- ~~Des objectifs de lecture avec une barre de progression~~ ❌ Écarté — même raisonnement que le rejet déjà acté par `readingDashboard` (objectifs/scores jugés anti-gamification et peu fiables à mesurer), cohérent avec la position déjà prise par ce module sur les accomplissements ("volontairement limités").
- ~~Des rappels mensuels façon "Ton mois d'octobre sur AO3"~~ ✅ Fait — quand la période "Cette année" ou équivalente mensuelle est sélectionnée, une ligne de récapitulatif formatée apparaît (`buildRecapText`).
- ~~Un rapport annuel à partager, façon "Ton année en fanfictions"~~ ✅ Fait, avec une nuance — même mécanisme que ci-dessus pour la période "Cette année" ; **texte uniquement**, jamais une image à partager (cohérent avec la décision déjà actée "Partage sous forme d'image" — écartée pour rester privé). Le bouton Export (JSON) permet de le sauvegarder si besoin.
- ~~Suivre l'évolution des kudos/favoris/vues d'une fic précise au fil du temps~~ ❌ Écarté — nécessiterait un mécanisme fondamentalement différent (relevés périodiques planifiés des statistiques publiques d'une œuvre), plus lourd que le modèle actuel du module (déclenché par la visite) ; le document du module signalait déjà cette idée comme "trop compliquée à construire pour l'instant".
- ~~Détecter les tendances de lecture, comme "tu lis de plus en plus de tel tag ces derniers temps"~~ ✅ Fait — `detectTagTrend`, réutilise la même logique que la détection de changement de fandom déjà existante (30 derniers jours vs les 30 précédents).
- ~~Un tableau qui classe tes lectures par catégorie (rating, genre), pas seulement par fandom~~ ✅ Fait — `sessionHistory.js` capture désormais la note (rating) et la catégorie AO3 (Gen/F-M/M-M/…, l'équivalent AO3 le plus proche de "genre") ; regroupement disponible via `groupByField`.
- ~~Un graphique camembert qui montre en pourcentage la répartition de tes lectures entre tes différents fandoms~~ ✅ Fait — camembert CSS (`conic-gradient`) dans `fandomBreakdown.js`.
- ~~Ajouter le temps de lecture et les kudos donnés dans le tableau des fandoms, en plus du nombre de fics et de mots~~ ✅ Fait — colonnes Heures (estimées à 250 mots/minute) et Kudos (via `AO3H.ficAppreciation.getKudosStats().byFandom`).
- ~~Dire si tu es plutôt un lecteur de nuit, ou si tu lis de façon très régulière~~ ✅ Fait — `isNightOwl`/`regularityScore`, phrase de profil dans `habitsAnalysis.js`.
- ~~Regarder des tendances par saison plus poussées : combien tu lis par trimestre, si tu lis plus pendant les vacances, et si tes genres préférés changent selon la saison~~ ✅ Fait, avec une nuance — répartition par trimestre (`quarterlyBreakdown`) et catégorie dominante par saison implémentées ; **l'effet des vacances est écarté** — aucun calendrier de vacances universel n'existe (ça varie par pays, culture, année), signal trop peu fiable pour la valeur ajoutée.
- ~~Essayer de prédire combien de fics tu liras dans le futur, ou deviner quel sera ton prochain fandom préféré~~ ❌ Écarté — même famille de raisonnement que le "Recommendation Engine" déjà rejeté ailleurs dans le projet : prédire un comportement futur ou un goût subjectif à partir de données locales limitées est le genre d'ambition algorithmique déjà jugée hors de portée pour ce type de module.
- ~~Après une période sans lecture, afficher un petit message motivant pour t'encourager à t'y remettre~~ ✅ Fait — la détection de "reading slump" déjà existante affiche désormais un message encourageant plutôt qu'un simple avertissement.
- ~~Suivre ta progression chapitre par chapitre pendant que tu lis une fic, en fonction de combien tu as fait défiler la page~~ ✅ Fait (déjà couvert ailleurs) — c'est exactement le rôle de `readingTracker`'s `readingProgress.js` (suivi du défilement, badge flottant de pourcentage, par œuvre).
- ~~Un tableau de bord avec des onglets pour naviguer entre les différentes vues~~ ❌ Écarté — déjà explicitement rejeté plus bas dans ce même document ("Des onglets séparés dans le tableau de bord — jugé trop lourd").
- ~~Aller chercher les statistiques déjà affichées sur ta page de statistiques AO3~~ ❌ Écarté — la page de profil AO3 n'expose publiquement que des compteurs liés aux œuvres *publiées* par l'utilisateur·ice (works/series/bookmarks/collections), pas de statistiques de *lecture* ; il n'y a donc rien de pertinent à importer pour un module centré sur l'activité de lecture.
- ~~Une idée pour plus tard : un petit graphique qui montre comment la popularité d'une fic évolue avec le temps~~ ❌ Écarté — doublon du point ci-dessus sur l'évolution des kudos/favoris/vues ; même raisonnement (mécanisme de relevés périodiques, hors de portée du modèle actuel).
- ~~Un bloc de liens rapides vers les favoris, l'historique, la liste "à lire plus tard" et les abonnements~~ ✅ Fait, avec une nuance — liens vers Bookmarks/History/Subscriptions (des vraies pages AO3) ajoutés au bloc. **Later Shelf n'a pas de lien propre** : c'est une liste gérée localement par l'extension, sans page AO3 correspondante à cibler.
- ~~Rendre le nuage de tags cliquable, pour lancer une recherche directement en cliquant sur un tag~~ ✅ Fait — fusionné avec le premier point ; chaque tag du nuage est un lien vers `/tags/{tag}/works`.

## Corrections apportées à des réglages/fonctions déjà existants (hors liste ci-dessus)

En résolvant les items ci-dessus, un vrai bug a été trouvé dans
`_activityPanel.js` : les statistiques "fandoms les plus lus", "tags les
plus lus" et "note préférée" du bloc **Your Reading Insights** lisaient ces
champs sur les entrées de `readingTracker`'s historique — mais ces entrées
(voir `seenTracking.js`) ne contiennent jamais de `fandoms`, `tags` ni
`rating`, seulement `id`/`title`/`author`/dates. Résultat : ces trois
statistiques étaient systématiquement vides ("Unknown" / "Not Rated"),
alors que le tableau séparé **Fandom Breakdown** affichait les bons noms de
fandoms, car il lit une source différente (`activityPanel:sessions`, qui
elle capture bien les fandoms). Corrigé en faisant lire à `_activityPanel.js`
les mêmes métadonnées de session en complément (`sessionMetaByWork`), avec
repli sur les champs de l'historique s'ils existent — et `sessionHistory.js`
capture maintenant aussi les tags libres, la note et la catégorie, pas
seulement les fandoms.

## Explicitement écarté

- Voir les statistiques publiques d'un auteur (vues, kudos, abonnés) — AO3 ne propose pas d'accès public pour ça
- Un profil d'accomplissements plus large avec plus de badges — volontairement limité pour ne pas trop gamifier la lecture
- Un petit résumé du genre "5 fics lues cette session" affiché pendant qu'on navigue — essayé puis retiré, ce n'était intéressant qu'une seule fois avant d'être ignoré
- Un classement ou une comparaison de tes statistiques avec celles d'autres personnes — la lecture n'est pas une compétition
- Partager ses statistiques sous forme d'image — écarté pour rester privé
- Suivre en détail le temps passé sur chaque fic — jugé trop indiscret
- Des onglets séparés dans le tableau de bord — jugé trop lourd
- Pouvoir activer ou désactiver chaque statistique une par une — toutes les statistiques restent toujours affichées ensemble
- Une statistique du nombre de commentaires postés — jugée hors sujet
- Réorganiser les blocs par glisser-déposer / les cacher individuellement — contredit la décision ci-dessus, et coût d'interface disproportionné
- Des objectifs de lecture avec barre de progression — même raisonnement anti-gamification que `readingDashboard`
- Suivre l'évolution dans le temps des kudos/favoris/vues d'une œuvre précise — nécessiterait des relevés périodiques planifiés, hors de portée du modèle actuel (déclenché par la visite)
- Prédire le nombre de fics futures ou le prochain fandom préféré — même famille que le "Recommendation Engine" déjà rejeté ailleurs
- L'effet des vacances sur les tendances saisonnières — pas de calendrier de vacances universel fiable
- Importer les statistiques de la page de profil AO3 — cette page n'expose que des compteurs de publication, pas de données de lecture

---

## Détails techniques

- Clés de stockage : `ao3h:activityPanel:sessions` (propriété de
  `sessionHistory.js`, liste de sessions `{ workId, startedAt, tags,
  rating, category, ... }`, max 500 gardées) et
  `ao3h:activityPanel:preferences` (propriété de `readingInsights.js`,
  `{ timePeriod }`).
- API publique : `_activityPanel.js` exporte `(store, cfg, NS)` et expose
  aussi le module entier comme `W.AO3H_ActivityPanel` tant qu'il est activé
  (store, cfg, logique pure, `isDashboardPage()`) ; c'est cette dernière
  voie que `fandomBreakdown.js`/`habitsAnalysis.js`/`patternAnalysis.js`/
  `readingInsights.js` utilisent — aucun sous-module n'importe directement
  `_activityPanel.js` (seuls les fichiers de test le font).
- Le filtrage par période de `readingInsights.js` re-dérive les cartes de
  statistiques directement depuis `activityPanel:sessions`
  (`computePeriodStats`) plutôt que depuis l'agrégation de `_activityPanel.js`
  qui reste, elle, sur tout l'historique.
- `sessionHistory.js`'s `getWorkMeta()` lit `dd.rating.tags a`,
  `dd.category.tags a` et `dd.freeform.tags a` sur la page de l'œuvre pour
  capturer note, catégorie et tags libres.
- La logique pure de `_activityPanel.js` est testée dans
  `activityPanel.logic.test.js`.
