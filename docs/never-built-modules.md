# Modules jamais construits

Ce fichier regroupe les specs de concepts de modules qui ont été imaginés,
documentés en détail, puis **jamais codés** — ou codés puis supprimés — et
dont on a vérifié qu'ils n'ont pas de trace ailleurs dans le code actuel
(recherché par mots-clés dans tout `src/modules`, pas seulement dans les
docs). Aucun de ces concepts n'existe sous un autre nom.

---

## collectionBrowser

**Autres noms :** collectionExplorer, collectionManager, collectionViewer

Un module prévu pour naviguer, chercher et découvrir les collections AO3
directement depuis l'extension, sans passer par les pages natives d'AO3.

**Ce qu'il aurait fait :**
- Une liste des collections avec recherche (par nom, fandom, type : ouverte / modérée / fermée)
- Un aperçu des œuvres d'une collection sans avoir à l'ouvrir
- Un bouton pour ajouter rapidement une œuvre à une collection depuis sa page
- S'abonner à une collection pour être prévenu des nouvelles œuvres
- Des statistiques sur les collections (nombre d'œuvres, activité)

**Pourquoi jamais construit :** les pages AO3 `/collections` font déjà tout ça.
L'extension n'aurait rien apporté de plus, pour un coût de maintenance élevé
(il aurait fallu suivre les changements des pages AO3 en continu). Usage estimé
à moins de 5%.

---

## fandomCleaner

Un concept pour nettoyer et normaliser l'affichage des noms de fandoms dans
les listings — regrouper les variantes d'un même fandom, enlever les doublons.

**Ce qu'il aurait fait :**
- Reconnaître que "Harry Potter" et "Harry Potter - J. K. Rowling" désignent le même fandom
- Regrouper les noms alternatifs d'un fandom
- Un affichage standardisé et nettoyé des noms de fandoms

**Pourquoi jamais construit :** l'idée n'a jamais dépassé le stade du simple
concept — pas de spec détaillée, pas de décision de suppression, juste une
ligne dans une liste d'idées jamais reprises nulle part ailleurs.

---

## ficComparison

Un module de comparaison côte-à-côte de plusieurs fics à la fois (stats,
tags, chevauchements).

**Ce qu'il aurait fait :**
- Un bouton "⚖️ Compare" sur chaque fic dans les listings (jusqu'à 3 fics à la fois)
- Un panneau flottant listant les fics sélectionnées
- Un tableau comparatif : nombre de mots, chapitres, kudos, hits, favoris, statut, dates, rating
- Comparer les tags en commun et les tags uniques entre les fics
- Sauvegarder des groupes de comparaison nommés, et les réutiliser plus tard
- Exporter la comparaison en CSV ou JSON
- Idées jamais poussées plus loin : petits graphiques, diagramme de Venn des tags partagés, mode "comparer une série entière"

**Pourquoi jamais construit :** ça faisait doublon avec le module qui deviendra
`workLength` (comparaison de longueur). Une interface de comparaison complète
pour une action qu'on fait rarement (moins d'une fois par mois) ne justifiait
pas la complexité. Supprimé avant même la grande vague de nettoyage des modules.

---

## qualityScore / workStats

**Autres noms :** ficQuality, kudosHitRatio, qualityMetrics, engagementScore, workQualityAlgorithm

Un système de notation automatique de la "qualité" d'une fic, calculé à partir
de ses statistiques (kudos, hits, favoris, commentaires).

**Ce qu'il aurait fait :**
- Un score composite : kudos/hits (40%) + favoris/kudos (30%) + commentaires/kudos (20%) + statut terminé (10%)
- Une note en lettre façon bulletin scolaire : S (90-100), A (80-89), B (70-79), C (60-69), D (moins de 60)
- Un seuil minimum de données requises (10 hits, 3 kudos) avant de calculer un score, sinon affichage "?"
- Un badge de note sur chaque fic, dans les listings et sur sa page
- Trier les résultats de recherche par score de qualité
- Filtrer pour ne garder que les fics au-dessus d'un certain score

**Pourquoi supprimé :** ces statistiques ne mesurent pas vraiment la qualité
d'écriture — elles avantagent mécaniquement les tropes populaires, pénalisent
les couples rares, et favorisent les vieilles fics qui ont eu le temps
d'accumuler des kudos. Rendre un tel score visible risquait aussi de pousser
les auteur·ices à écrire pour la métrique plutôt que pour l'histoire.

**Différence avec `ficEngagement` (module actif) :** `ficEngagement` calcule
aussi un ratio kudos/hits, mais pour repérer des "pépites cachées" sous-cotées
— pas pour juger la qualité d'une œuvre. La philosophie est opposée : aider à
découvrir, pas à noter.

---

## ratingSystem

**Autres noms :** qualityRatingOverride, intensityMeter

Un module en deux parties : remplacer l'affichage des ratings natifs AO3, et
ajouter des jauges de "niveau d'intensité" du contenu.

**Ce qu'il aurait fait :**
- Remplacer G/T/M/E par ses propres icônes ou textes, ou fusionner des ratings ensemble
- Une jauge 🌶️ de niveau "épicé" pour le contenu NSFW (Mild/Moderate/Spicy/Extra Spicy)
- Une jauge 🩸 de niveau de violence (Mild/Moderate/Severe/Graphic)
- Une jauge 💔 de niveau d'angoisse/tristesse (Light/Moderate/Heavy/Devastating)
- Ces niveaux auraient été devinés automatiquement à partir des tags de la fic

**Pourquoi supprimé :** deviner "à quel point c'est intense" à partir des tags
n'est pas fiable — par exemple "Angst with a Happy Ending" aurait pu être
mal classé comme "angoisse sévère". Remplacer les ratings choisis par les
auteur·ices posait aussi un problème de respect de leur choix. Usage estimé à
moins de 10%.

**Différence avec `starRatings` (module actif, dans `ficAppreciation`) :**
`starRatings` est une note personnelle et privée que le lecteur se donne à
lui-même (1 à 5 étoiles, comme sur Netflix) — pas un remplacement des ratings
publics d'AO3.

---

## storyMarks

Un concept de surlignage et d'annotation de passages pendant la lecture,
directement dans le texte d'une fic.

**Ce qu'il aurait fait :**
- Surligner un passage dans le texte d'une œuvre
- Laisser une note personnelle attachée à ce passage
- Marquer certains chapitres comme favoris

**Pourquoi jamais construit :** resté au stade d'idée dans une liste, jamais
transformé en spec détaillée ni en code, et jamais absorbé par un autre
module (les notes de `bookmarkVault` s'attachent à une œuvre entière, pas à
un passage précis).

---

## tagIdDisplay

**Anciens noms de sous-modules :** tagIdFormatting, dataOperations

Un petit outil pour afficher les identifiants numériques internes d'AO3 pour
chaque tag (utiles pour appeler l'API AO3 ou écrire des scripts).

**Ce qu'il aurait fait :**
- Afficher l'ID numérique d'un tag dans l'interface
- Copier cet ID pour un usage API/scripting

**Pourquoi jamais construit :** ça ne concerne que les développeurs qui
construisent leurs propres outils autour de l'API AO3 — complètement hors
sujet pour les lecteurs normaux, le public de cette extension.

---

## updateLikelihood

**Autres noms :** deadFicRisk, completionPredictor, abandonmentRisk, updateViability, deadFicIndicator

Un module qui aurait tenté de prédire si une fic en cours (WIP) a des chances
d'être terminée un jour ou non.

**Ce qu'il aurait fait :**
- Calculer le taux de fics terminées par un·e auteur·ice dans le passé
- Regarder depuis combien de temps une fic n'a pas été mise à jour
- Un score de probabilité que la fic soit terminée un jour
- Un badge d'avertissement "probablement abandonnée"
- Deviner si un·e auteur·ice publie à un rythme régulier ou non, et prédire quand viendrait le prochain chapitre

**Pourquoi jamais construit :** juger publiquement qu'une fic est "probablement
morte" est injuste envers l'auteur·ice — la vie fait que des gens reviennent
écrire après des années d'arrêt. Le risque de décourager les lecteurs d'essayer
des fics en cours, et de faire du mal aux auteur·ices, l'a emporté sur
l'intérêt de la fonctionnalité.

---

## visibilityController

*(Ce n'est pas vraiment un module — plutôt un projet de fusion qui a été
explicitement rejeté avant même d'être commencé.)*

L'idée : regrouper `hideByTags`, `hideDates`, `hideWordCount` et `skipWorks`
sous un seul panneau de contrôle centralisé pour tout ce qui masque du
contenu.

**Pourquoi rejeté :** ces modules sont trop différents dans leur
fonctionnement pour être unifiés sans créer un "super-module" difficile à
maintenir :
- `hideByTags` travaille sur des listes de tags
- `skipWorks` travaille sur des critères combinés (rating, mots, statut)
- `hideDates` / `hideWordCount` (aujourd'hui dans `visualPreferences`) travaillent sur l'affichage, pas sur le masquage d'œuvres

Chaque module a été gardé séparé, et c'est toujours le cas aujourd'hui.

---

## debugMode

Des outils de débogage et de diagnostic pour développeur·ses.

**Ce qu'il aurait fait :** afficher des informations techniques internes
(état des modules, erreurs, logs) pour aider à diagnostiquer des problèmes.

**Pourquoi jamais construit :** destiné aux développeur·ses de l'extension
elle-même, pas aux lecteur·ices — hors du public cible, jamais formalisé.

---

## globalToolsHub

Un panneau centralisé qui rassemblerait tous les outils/utilitaires de
l'extension au même endroit.

**Ce qu'il aurait fait :** un point d'accès unique à toutes les
fonctionnalités transversales de l'extension.

**Pourquoi jamais construit :** concept resté à l'état d'idée vague, jamais
formalisé en spec ni en code — et en partie redondant avec le panneau de
réglages qui existe déjà.

---

## accessibility / accessibilityOptions

Un module transversal dédié à l'accessibilité : haut contraste, navigation
au clavier, compatibilité avec les lecteurs d'écran.

**Ce qu'il aurait fait :**
- Un mode haut contraste
- Une navigation au clavier complète sur les listes et les blurbs
- Des labels pour les lecteurs d'écran sur les éléments ajoutés dynamiquement par l'extension

**Pourquoi jamais construit :** l'idée d'un module séparé a été abandonnée
au profit d'une accessibilité traitée directement dans chaque module
concerné, plutôt qu'en un seul endroit à part.

---

## Performance Manager

Un concept d'outils de surveillance de la performance de l'extension
elle-même.

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite, seulement un nom d'idée.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.

---

## Developer Tools

Un ensemble d'outils de développement/débogage pour l'extension elle-même,
distinct de `debugMode` et de l'outil interne `updateLog`.

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite, seulement un nom d'idée.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.

---

## Version Manager

L'équivalent, côté utilisateur·ice, de l'outil interne `updateLog` (qui,
lui, existe mais est réservé aux développeur·ses de l'extension).

**Ce qu'il aurait fait :** montrer aux utilisateur·ices l'historique des
versions de l'extension et ce qui a changé.

**Pourquoi jamais construit :** jamais dépassé le stade de l'idée, aucune
spec détaillée, aucun code.

---

## Subscription Manager

Un module de gestion centralisée des abonnements/suivis d'œuvres et de
séries.

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite.

**Pourquoi jamais construit :** jamais dépassé le stade de l'idée. Ses
besoins sont aujourd'hui partiellement couverts par [[later-shelf]]
(rappels) et par `notificationCenter` (notifications), sans qu'aucun des
deux ne soit un vrai "gestionnaire d'abonnements" centralisé.

---

## Duplicate Finder

Un outil de détection des œuvres en double (republiées, crossposts, etc.).

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite, seulement un nom d'idée.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.

---

## Recommendation Engine

Un vrai moteur de recommandation complet pour suggérer des œuvres
similaires, avec de nombreuses options de configuration (environ 25
prévues à l'origine).

**Ce qu'il aurait fait :** analyser en profondeur les goûts de
l'utilisateur·ice pour proposer des suggestions personnalisées, bien
au-delà d'une simple similarité de tags.

**Pourquoi jamais construit :** rejeté explicitement comme "projet à part"
— beaucoup trop ambitieux et complexe pour rester un simple module
d'extension. Une version très simplifiée (similarité de tags seulement)
existe dans [[similar-fics]], sans le moteur de recommandation complet
initialement envisagé.

---

## Chapter Title Enhancement

Une idée pour rendre les titres de chapitres plus visibles/mis en valeur
sur les pages d'œuvre.

**Ce qu'il aurait fait :** rester flou — jamais accompagné d'une spec
détaillée, seulement listé comme idée pour la lecture.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.




Liste mise à jour d’après les fichiers d’implémentation `.js` et `.css` réellement présents. Comme dans la liste d’origine, les fichiers `.md`, les tests `.test.js`, l’entrée temporaire `test-module.js` et la copie `modules (1).js` ne sont pas inclus.

# Démarrage et cœur — 6 fichiers

- `main.js` : démarre AO3 Helper lorsque la page s’ouvre.
- `modules.js` : choisit les modules à charger selon la page visitée.
- `core/coordinator.js` : coordonne les modules, le menu et les réglages.
- `core/lifecycle.js` : démarre, arrête ou redémarre les modules.
- `core/module-loader.js` : charge les modules nécessaires.
- `core/module-registry.js` : contient le catalogue de tous les modules.

# Appearence And Tools

## Backup and Sync — 7 fichiers

- `backupAndSync/_backupAndSync.js` : assemble et démarre tout le système de sauvegarde.
- `backupAndSync/automateBackup.js` : crée automatiquement des sauvegardes.
- `backupAndSync/backupOperations.js` : crée, restaure, renomme ou supprime une sauvegarde.
- `backupAndSync/cloudSync.js` : synchronise les données avec un espace en ligne.
- `backupAndSync/dataTransfer.js` : importe ou exporte les données.
- `backupAndSync/versionMigration.js` : adapte les anciennes sauvegardes aux nouvelles versions.
- `backupAndSync/backupAndSync.css` : choisit l’apparence des écrans de sauvegarde.

## Fic Downloader — 8 fichiers

- `ficDownloader/_ficDownloader.js` : assemble et démarre le téléchargeur.
- `ficDownloader/batchDownload.js` : télécharge plusieurs histoires à la fois.
- `ficDownloader/completePageDownload.js` : télécharge une histoire complète.
- `ficDownloader/downloadEnhancements.js` : ajoute des options pratiques aux téléchargements.
- `ficDownloader/individualDownloads.js` : télécharge une seule histoire.
- `ficDownloader/offlineLibrary.js` : range les histoires conservées hors connexion.
- `ficDownloader/workHtmlTemplate.js` : fabrique la page HTML de l’histoire téléchargée.
- `ficDownloader/ficDownloader.css` : choisit l’apparence du téléchargeur.

## Theme Builder — 7 fichiers

- `themeBuilder/_themeBuilder.js` : assemble et démarre le créateur de thèmes.
- `themeBuilder/customStyling.js` : accepte des règles visuelles personnalisées.
- `themeBuilder/themeManagement.js` : crée, sauvegarde, charge et supprime des thèmes.
- `themeBuilder/themeSafety.js` : protège les zones importantes de la page et vérifie la lisibilité des thèmes.
- `themeBuilder/typographySystem.js` : règle les polices, tailles et espaces du texte.
- `themeBuilder/visualBuilder.js` : construit l’écran permettant de choisir les couleurs.
- `themeBuilder/themeBuilder.css` : choisit l’apparence du créateur de thèmes.

## Visual Preferences — 15 fichiers

- `visualPreferences/_visualPreferences.js` : assemble toutes les préférences visuelles.
- `visualPreferences/blurbSectionOrder.js` : change l’ordre des sections dans les résumés d’histoires.
- `visualPreferences/dateAgeMath.js` : classe les dates selon leur ancienneté.
- `visualPreferences/datesTimestamps.js` : change l’affichage des dates et des heures.
- `visualPreferences/gridView.js` : affiche les listes d’histoires sous forme de grille.
- `visualPreferences/hoverReveal.js` : révèle certains éléments lorsque la souris passe dessus.
- `visualPreferences/layoutDensity.js` : règle l’espacement général de l’interface.
- `visualPreferences/minimalHeader.js` : simplifie l’en-tête d’AO3.
- `visualPreferences/statsDisplayFormat.js` : choisit la forme des statistiques.
- `visualPreferences/statsOnChaptersList.js` : ajoute des statistiques dans la liste des chapitres.
- `visualPreferences/statsVisibility.js` : décide quelles statistiques sont visibles.
- `visualPreferences/visibilityPresets.js` : propose des choix rapides de visibilité.
- `visualPreferences/wordOccurrenceCounter.js` : compte les occurrences d’un mot ou d’un nom dans une histoire.
- `visualPreferences/wordOccurrenceMath.js` : effectue les calculs utilisés par le compteur d’occurrences.
- `visualPreferences/visualPreferences.css` : apparence générale du module.

# Browse

## Fic Engagement — 4 fichiers

- `ficEngagement/_ficEngagement.js` : assemble et démarre le module.
- `ficEngagement/engagementMetrics.js` : calcule des indicateurs avec les hits, kudos et marque-pages.
- `ficEngagement/hiddenGems.js` : cherche des histoires peu connues mais appréciées.
- `ficEngagement/ficEngagement.css` : apparence des badges de popularité.

## Filter Manager — 7 fichiers

- `filterManager/_filterManager.js` : assemble les outils de filtrage.
- `filterManager/filterWarnings.js` : affiche des avertissements lorsque certains filtres posent problème.
- `filterManager/languageBadges.js` : montre clairement la langue des histoires.
- `filterManager/presetManagement.js` : sauvegarde et recharge des ensembles de filtres.
- `filterManager/userHistoryFilters.js` : applique des filtres à l’historique de l’utilisateur.
- `filterManager/worksFilterManager.js` : contrôle les filtres des listes d’histoires.
- `filterManager/filterManager.css` : apparence du gestionnaire de filtres.

## Hide By Tags — 7 fichiers

- `hideByTags/_hideByTags.js` : assemble et démarre le masquage par tags.
- `hideByTags/hiddenCounter.js` : compte les histoires cachées.
- `hideByTags/hiddenTags.js` : cache les histoires possédant certains tags.
- `hideByTags/nopeWords.js` : cherche des mots que l’utilisateur ne veut pas voir.
- `hideByTags/tempHides.js` : cache temporairement des histoires.
- `hideByTags/whitelistExceptions.js` : laisse passer certaines histoires malgré un tag caché.
- `hideByTags/hideByTags.css` : apparence des histoires cachées et des commandes.

## Page Controls — 9 fichiers

- `pageControls/_pageControls.js` : assemble et démarre les commandes de navigation.
- `pageControls/backToTop.js` : ajoute un bouton pour remonter en haut.
- `pageControls/coreNavigation.js` : fournit les fonctions principales de navigation.
- `pageControls/enhancedNavigation.js` : améliore les boutons page suivante et précédente.
- `pageControls/infiniteScroll.js` : charge automatiquement la suite de la liste.
- `pageControls/pageJumpTargets.js` : trouve les endroits où l’utilisateur peut aller rapidement.
- `pageControls/paginationMemory.js` : mémorise la dernière page visitée.
- `pageControls/worksPerPage.js` : choisit le nombre d’histoires affichées par page.
- `pageControls/pageControls.css` : apparence des commandes.

## Skip Works — 4 fichiers

- `skipWorks/_skipWorks.js` : fichier principal qui cache ou révèle des histoires.
- `skipWorks/hiddenWorksMirror.js` : garde la liste des histoires cachées dans plusieurs stockages.
- `skipWorks/skipWorksHelpers.js` : rassemble les outils servant à identifier et présenter les histoires cachées.
- `skipWorks/skipWorks.css` : apparence des boutons et histoires cachées.

## Tags Display — 16 fichiers

- `tagsDisplay/_tagsDisplay.js` : assemble toutes les fonctions liées aux tags.
- `tagsDisplay/archiveWarningsDisplay.js` : améliore l’affichage des avertissements officiels.
- `tagsDisplay/autoHideNoiseTags.js` : cache automatiquement les tags considérés comme peu utiles.
- `tagsDisplay/compactModeTags.js` : affiche les tags de manière plus petite.
- `tagsDisplay/externalTagLinks.js` : ajoute des liens externes aux tags.
- `tagsDisplay/noiseTagCustomWords.js` : accepte une liste personnelle de mots peu utiles.
- `tagsDisplay/noiseTagMatch.js` : vérifie si un tag correspond à cette liste.
- `tagsDisplay/tagCategoryFilter.js` : montre ou cache certaines catégories de tags.
- `tagsDisplay/tagHighlighting.js` : colore les tags choisis.
- `tagsDisplay/tagHighlightMatch.js` : vérifie quels tags doivent être colorés.
- `tagsDisplay/tagImportancePromotion.js` : fait remonter les tags importants.
- `tagsDisplay/tagSeparatorStyle.js` : choisit la forme des séparateurs.
- `tagsDisplay/tagSortOrder.js` : décide dans quel ordre placer les tags.
- `tagsDisplay/tagsReordering.js` : déplace réellement les tags dans cet ordre.
- `tagsDisplay/tagsVisibility.js` : contrôle quels tags sont visibles.
- `tagsDisplay/tagsDisplay.css` : apparence générale des tags.

## Work Length — 5 fichiers

- `workLength/_workLength.js` : assemble et démarre le module.
- `workLength/lengthDisplay.js` : affiche la longueur d’une histoire.
- `workLength/lengthMath.js` : effectue les calculs de longueur et de durée.
- `workLength/readingTime.js` : estime le temps nécessaire pour lire.
- `workLength/workLength.css` : apparence des badges de longueur.

# Explore

## Fic Peek — 2 fichiers

- `ficPeek/ficPeek.js` : montre un aperçu sans ouvrir complètement l’histoire.
- `ficPeek/ficPeek.css` : apparence de la fenêtre d’aperçu.

## POV Tracker — 4 fichiers

- `povTracker/_povTracker.js` : assemble et démarre l’analyse.
- `povTracker/povAnalysis.js` : cherche les personnages et points de vue dans le texte.
- `povTracker/povPresentation.js` : affiche le résultat de l’analyse.
- `povTracker/povTracker.css` : apparence des résultats.

## Search Enhancer — 6 fichiers

- `searchEnhancer/_searchEnhancer.js` : assemble les outils de recherche.
- `searchEnhancer/relatedSearches.js` : suggère des recherches proches.
- `searchEnhancer/resultsSorting.js` : trie les résultats de différentes manières.
- `searchEnhancer/searchAutocomplete.js` : propose des mots pendant que l’utilisateur écrit.
- `searchEnhancer/seriesGrouping.js` : regroupe les histoires appartenant à la même série.
- `searchEnhancer/searchEnhancer.css` : apparence des outils de recherche.

## Similar Fics — 2 fichiers

- `similarFics/similarFics.js` : cherche des histoires qui ressemblent à celle consultée.
- `similarFics/similarFics.css` : apparence des suggestions.

## Surprise Me — 4 fichiers

- `surpriseMe/candidateSelection.js` : sélectionne les histoires pouvant participer au tirage.
- `surpriseMe/drawHistory.js` : conserve l’historique récent des histoires tirées.
- `surpriseMe/surpriseMe.js` : choisit une histoire au hasard.
- `surpriseMe/surpriseMe.css` : apparence du bouton et du résultat.

## Trope Games — 7 fichiers

- `tropeGames/_tropeGames.js` : assemble et démarre les jeux.
- `tropeGames/tropeAchievements.js` : donne de petits succès selon les tropes rencontrés.
- `tropeGames/tropeBingoPatterns.js` : fabrique les grilles et lignes de bingo.
- `tropeGames/tropeHoroscope.js` : crée un horoscope amusant à partir des tropes.
- `tropeGames/tropeRoulette.js` : choisit un trope au hasard.
- `tropeGames/tropeStatistics.js` : compte les tropes rencontrés.
- `tropeGames/tropeGames.css` : apparence des jeux.

# Library

## Activity Panel — 10 fichiers

- `activityPanel/_activityPanel.js` : assemble et démarre le panneau.
- `activityPanel/activityPanelShared.js` : contient les outils partagés du panneau.
- `activityPanel/dataCollection.js` : rassemble les informations de lecture.
- `activityPanel/fandomBreakdown.js` : classe les lectures par fandom.
- `activityPanel/habitsAnalysis.js` : analyse les habitudes de lecture.
- `activityPanel/patternAnalysis.js` : cherche des habitudes qui se répètent.
- `activityPanel/readingInsights.js` : crée de petites observations sur les lectures.
- `activityPanel/readingStats.js` : calcule les nombres et statistiques.
- `activityPanel/sessionHistory.js` : mémorise les séances de lecture.
- `activityPanel/activityPanel.css` : apparence du panneau.

## Bookmark Vault — 15 fichiers

- `bookmarkVault/_bookmarkVault.js` : assemble et démarre le coffre.
- `bookmarkVault/blockedBookmarks.js` : cache les marque-pages publics créés par des utilisateurs bloqués.
- `bookmarkVault/bookmarkMaintenance.js` : nettoie et entretient les marque-pages.
- `bookmarkVault/bookmarkNavigation.js` : facilite le déplacement entre les marque-pages.
- `bookmarkVault/bookmarkStatus/readingStatusTracking.js` : mémorise l’état de lecture.
- `bookmarkVault/bookmarkStatus/statusIndicators.js` : affiche cet état avec des badges.
- `bookmarkVault/noteDisplay.js` : affiche les notes personnelles.
- `bookmarkVault/noteHistory.js` : conserve les anciennes versions des notes personnelles.
- `bookmarkVault/noteManagement.js` : crée, modifie et supprime les notes.
- `bookmarkVault/organizationTools.js` : range les marque-pages.
- `bookmarkVault/personalRatings.js` : conserve des évaluations personnelles avec cinq étoiles.
- `bookmarkVault/richTextNotes.js` : permet d’utiliser du texte enrichi dans les notes.
- `bookmarkVault/sortingAndFiltering.js` : trie et filtre les marque-pages.
- `bookmarkVault/vaultTools.js` : fournit la recherche avancée, les exports et les outils d’entretien du coffre.
- `bookmarkVault/bookmarkVault.css` : apparence du coffre.

## Fanfic Binge Mode — 2 fichiers

- `fanficBingeMode/_fanficBingeMode.js` : enchaîne les histoires ou chapitres.
- `fanficBingeMode/fanficBingeMode.css` : apparence des commandes.

## Fic Appreciation — 10 fichiers

- `ficAppreciation/_ficAppreciation.js` : assemble et démarre les outils d’appréciation.
- `ficAppreciation/kudosDisplay.js` : affiche les informations sur les kudos.
- `ficAppreciation/kudosExtendedFeatures.js` : ajoute des possibilités supplémentaires aux kudos.
- `ficAppreciation/kudosManager.js` : coordonne les opérations liées aux kudos.
- `ficAppreciation/kudosTracker.js` : suit les kudos donnés.
- `ficAppreciation/kudosTracking.js` : enregistre les informations de suivi.
- `ficAppreciation/markAsFinished.js` : permet de marquer une histoire comme terminée.
- `ficAppreciation/multiStatusTracker.js` : suit plusieurs états pour une même histoire.
- `ficAppreciation/starRatings.js` : permet de donner une note avec des étoiles.
- `ficAppreciation/ficAppreciation.css` : apparence des boutons, étoiles et badges.

## Later Shelf — 6 fichiers

- `laterShelf/_laterShelf.js` : assemble et démarre l’étagère.
- `laterShelf/laterShelfStore.js` : sauvegarde les histoires placées sur l’étagère.
- `laterShelf/markedForLaterStatus.js` : montre si une histoire est déjà marquée.
- `laterShelf/quickMarkForLaterButton.js` : ajoute un bouton rapide.
- `laterShelf/workReminder.js` : rappelle à l’utilisateur certaines histoires.
- `laterShelf/laterShelf.css` : apparence de l’étagère et des boutons.

## Notification Center — 2 fichiers

- `notificationCenter/notificationCenter.js` : rassemble et affiche les notifications.
- `notificationCenter/notificationCenter.css` : apparence du centre.

## Reading Dashboard — 3 fichiers

- `readingDashboard/dashboardStats.js` : calcule les statistiques et bilans du tableau de bord.
- `readingDashboard/readingDashboard.js` : affiche un résumé des lectures.
- `readingDashboard/readingDashboard.css` : apparence du tableau de bord.

## Reading Timeline — 7 fichiers

- `readingTimeline/_readingTimeline.js` : assemble et démarre la ligne du temps.
- `readingTimeline/dateAnnotations.js` : attache des notes personnelles à certaines dates.
- `readingTimeline/filterPresets.js` : sauvegarde des ensembles de filtres pour la ligne du temps.
- `readingTimeline/historyAnalytics.js` : analyse l’historique de lecture.
- `readingTimeline/timelineStats.js` : calcule les jalons et statistiques de la ligne du temps.
- `readingTimeline/timelineVisualization.js` : dessine les événements dans le temps.
- `readingTimeline/readingTimeline.css` : apparence de la ligne du temps.

# Navigate and Interact

## Comment Kit — 8 fichiers

- `commentKit/_commentKit.js` : assemble et démarre les outils.
- `commentKit/commentComposing.js` : aide à écrire un commentaire.
- `commentKit/commentConfiguration.js` : applique les préférences de commentaires.
- `commentKit/commentHighlighting.js` : colore ou met en évidence certains commentaires.
- `commentKit/commentNavigation.js` : facilite le déplacement entre les commentaires.
- `commentKit/draftManagement.js` : sauvegarde les brouillons.
- `commentKit/threadManagement.js` : organise les discussions et réponses.
- `commentKit/commentKit.css` : apparence des outils.

## Fic Actions — 2 fichiers

- `ficActions/ficActions.js` : ajoute des boutons d’action aux histoires.
- `ficActions/ficActions.css` : apparence de ces boutons.

## Keyboard Shortcuts — 2 fichiers

- `keyboardShortcuts/keyboardShortcuts.js` : écoute le clavier et lance les actions correspondantes.
- `keyboardShortcuts/keyboardShortcuts.css` : apparence de l’aide des raccourcis.

## Main Navigation — 5 fichiers

- `mainNavigation/_mainNavigation.js` : assemble les améliorations du menu.
- `mainNavigation/addNavLinks.js` : ajoute de nouveaux liens de navigation.
- `mainNavigation/menuActivation.js` : ouvre et ferme les menus.
- `mainNavigation/quickLinks.js` : ajoute des raccourcis vers les pages importantes.
- `mainNavigation/mainNavigation.css` : apparence de la navigation.

## Series Helper — 4 fichiers

- `seriesHelper/_seriesHelper.js` : assemble et démarre le module.
- `seriesHelper/seriesOrganization.js` : range les histoires d’une série.
- `seriesHelper/seriesProgress.js` : suit la progression dans la série.
- `seriesHelper/seriesHelper.css` : apparence des informations de série.

## User Relationships — 9 fichiers

- `userRelationships/_userRelationships.js` : assemble les outils liés aux auteurs.
- `userRelationships/authorBlocking.js` : cache les œuvres de certains auteurs.
- `userRelationships/authorPreference.js` : enregistre les auteurs préférés.
- `userRelationships/authorTracking.js` : suit l’activité des auteurs choisis.
- `userRelationships/blockingInterface.js` : construit les boutons et fenêtres de blocage.
- `userRelationships/blocklistManagement.js` : ajoute ou retire des utilisateurs de la liste de blocage.
- `userRelationships/commentHiding.js` : cache les commentaires de certains utilisateurs.
- `userRelationships/userRelationshipsSettings.js` : lit et sauvegarde les réglages.
- `userRelationships/userRelationships.css` : apparence des boutons et indicateurs.

# Reading

## Chapter Navigation — 6 fichiers

- `chapterNavigation/_chapterNavigation.js` : assemble et démarre la navigation.
- `chapterNavigation/autoScroll.js` : fait défiler automatiquement le texte.
- `chapterNavigation/blurbNavigation.js` : ajoute des commandes sur les résumés d’histoires.
- `chapterNavigation/chapterWordCount.js` : compte les mots du chapitre.
- `chapterNavigation/navigationControls.js` : construit les boutons précédent, suivant et autres.
- `chapterNavigation/chapterNavigation.css` : apparence des commandes.

## Collapse Author Notes — 2 fichiers

- `collapseAuthorNotes/collapseAuthorNotes.js` : replie et déplie les notes de l’auteur.
- `collapseAuthorNotes/collapseAuthorNotes.css` : apparence de la zone repliée.

## Instant Footnotes — 2 fichiers

- `instantFootnotes/instantFootnotes.js` : affiche immédiatement une note sans quitter le texte.
- `instantFootnotes/instantFootnotes.css` : apparence de la note.

## Reading Formatter — 5 fichiers

- `readingFormatter/_readingFormatter.js` : assemble les outils de mise en forme.
- `readingFormatter/appearance.js` : change les couleurs, tailles et espacements.
- `readingFormatter/content.js` : prépare et organise le texte de l’histoire.
- `readingFormatter/readingControls.js` : construit les boutons de réglage.
- `readingFormatter/readingFormatter.css` : apparence du mode lecture.

## Reading Tracker — 6 fichiers

- `readingTracker/_readingTracker.js` : assemble et démarre le suivi.
- `readingTracker/readingProgress.js` : mémorise la position dans l’histoire.
- `readingTracker/seenTracking.js` : reconnaît les histoires déjà vues.
- `readingTracker/viewHistory.js` : conserve l’historique des pages consultées.
- `readingTracker/visualMarkers.js` : affiche des marques sur les histoires déjà vues ou lues.
- `readingTracker/readingTracker.css` : apparence des marques de suivi.

## Text To Speech — 7 fichiers

- `textToSpeech/_textToSpeech.js` : assemble et démarre la lecture à voix haute.
- `textToSpeech/contentFiltering.js` : choisit les parties du texte qui doivent être lues.
- `textToSpeech/playbackControls.js` : construit les boutons lecture, pause et arrêt.
- `textToSpeech/pronunciationManager.js` : applique les règles personnelles de prononciation.
- `textToSpeech/speechEngine.js` : utilise la voix du navigateur pour lire le texte.
- `textToSpeech/visualFeedback.js` : montre quelle partie du texte est en cours de lecture.
- `textToSpeech/textToSpeech.css` : apparence des commandes de lecture.

## Word Swap — 3 fichiers

- `wordSwap/ruleTemplates.js` : fabrique des modèles prêts à l’emploi pour les règles de remplacement.
- `wordSwap/wordSwap.js` : remplace automatiquement certains mots dans le texte.
- `wordSwap/wordSwap.css` : apparence de l’outil et de ses réglages.

## `lib/ao3` — 10 fichiers

Ces fichiers savent comment parler avec AO3.

- `actions.js` : effectue des actions comme donner un kudos, s’abonner ou marquer une histoire pour plus tard.
- `constants.js` : conserve des listes fixes, comme les avertissements officiels d’AO3.
- `integration.js` : aide AO3 Helper à travailler avec les outils déjà présents sur AO3.
- `parsers.js` : lit du texte ou une adresse AO3 pour en extraire des informations.
- `requests.js` : demande des pages ou envoie des informations à AO3.
- `routes.js` : reconnaît le type de page ouverte : histoire, recherche, marque-pages, etc.
- `search-filters.js` : lit et construit les filtres de recherche AO3.
- `selectors.js` : contient les « adresses » des éléments dans une page, comme le titre ou les statistiques.
- `work-page.js` : trouve les informations importantes sur la page d’une histoire.
- `work-stats.js` : lit les nombres de mots, kudos, hits et marque-pages.

## `lib/storage` — 7 fichiers

Ces fichiers forment la mémoire du programme.

- `cache.js` : garde temporairement des informations pour éviter de les rechercher plusieurs fois.
- `index.js` : porte d’entrée vers les différents outils de stockage.
- `keys.js` : fabrique les noms utilisés pour ranger les informations.
- `mirrored-list.js` : garde la même liste dans deux endroits de stockage.
- `module-settings.js` : sauvegarde les réglages propres à chaque module.
- `persistence.js` : permet aux informations de rester enregistrées après la fermeture du navigateur.
- `user.js` : sépare les informations selon l’utilisateur AO3 connecté.

## `lib/styles` — 5 fichiers

Ces fichiers choisissent l’apparence des éléments communs.

- `ao3h-style-base.css` : règles visuelles de base d’AO3 Helper.
- `ao3h-variables.css` : couleurs et tailles réutilisées partout.
- `components.css` : apparence commune des dialogues, boutons, flèches et interrupteurs.
- `menu.css` : apparence du menu principal.
- `panel.css` : apparence du panneau de réglages.

## `lib/themes` — 11 fichiers

### Thèmes fournis

- `builtin/accessibility.js` : thèmes plus faciles à lire.
- `builtin/aesthetic.js` : thèmes surtout créés pour être jolis.
- `builtin/basic.js` : thèmes simples.
- `builtin/comfort.js` : thèmes confortables pour une longue lecture.
- `builtin/developer.js` : thèmes ou outils visuels destinés au développement.

### Moteur de thèmes

- `engine/themeGenerator.js` : transforme les choix de l’utilisateur en règles de couleurs.
- `engine/themeParser.js` : lit un thème enregistré.
- `engine/themeValidator.js` : vérifie qu’un thème ne contient pas d’informations incorrectes.

### Modèles

- `templates/colorfulTemplate.js` : modèle de thème coloré.
- `templates/darkModeTemplate.js` : modèle de thème sombre.
- `templates/lightModeTemplate.js` : modèle de thème clair.

## `lib/ui` — 7 fichiers

`UI` veut dire « interface utilisateur » : les choses que l’on voit et sur lesquelles on clique.

- `badges.js` : fabrique les badges de chapitres, de popularité et d’état.
- `bulk-select.js` : permet de sélectionner plusieurs histoires en même temps.
- `components.js` : fabrique des éléments simples réutilisables.
- `dialog.js` : ouvre et contrôle les petites fenêtres.
- `drag-reorder.js` : permet de déplacer des éléments avec la souris.
- `list-manager.js` : construit des listes que l’on peut ajouter, modifier ou vider.
- `toast.js` : affiche un petit message temporaire dans un coin de l’écran.

## `lib/ui/menu` — 3 fichiers

- `menu.js` : crée le menu principal d’AO3 Helper.
- `menu-grouper.js` : range les commandes du menu en groupes.
- `menu-groups-config.js` : indique les noms et l’ordre de ces groupes.

## Le panneau de réglages — 9 fichiers

- `panel/lazy-panel.js` : attend que l’utilisateur ouvre le panneau avant de le charger.
- `panel/panel-config.js` : contient les règles générales du panneau.
- `panel/panel-entry.js` : démarre le panneau et charge son apparence.
- `panel/panel-index.js` : rassemble les outils publics du panneau.
- `panel/panel-tab-content.js` : place les réglages à l’intérieur d’un onglet.
- `panel/panel-tab-system.js` : permet de changer d’onglet et d’enregistrer les choix.
- `panel/panel-ui.js` : construit la forme principale du panneau.
- `panel/tab-registry.js` : contient la liste et l’ordre des onglets.
- `panel/welcome-guide.js` : affiche le guide de bienvenue.

## Configurations « Appearance » — 5 fichiers

Chaque fichier construit la page de réglages du module correspondant.

- `configs/appearance-tools/backupAndSync-config.js` : réglages des sauvegardes et de la synchronisation.
- `configs/appearance-tools/backupAndSync-backups.js` : liste et gestion des sauvegardes existantes.
- `configs/appearance-tools/ficDownloader-config.js` : réglages du téléchargement d’histoires.
- `configs/appearance-tools/themeBuilder-config.js` : réglages du créateur de thèmes.
- `configs/appearance-tools/visualPreferences-config.js` : préférences visuelles.

## Configurations « Browse » — 7 fichiers

- `configs/browse/ficEngagement-config.js` : réglages des indicateurs de popularité.
- `configs/browse/filterManager-config.js` : réglages des filtres enregistrés.
- `configs/browse/hideByTags-config.js` : choix des tags à cacher.
- `configs/browse/pageControls-config.js` : réglages des commandes de pages.
- `configs/browse/skipWorks-config.js` : gestion des histoires cachées manuellement.
- `configs/browse/tagsDisplay-config.js` : réglages de l’affichage des tags.
- `configs/browse/workLength-config.js` : réglages de la longueur et du temps de lecture.

## Configurations « Explore » — 6 fichiers

- `configs/explore/ficPeek-config.js` : réglages des aperçus d’histoires.
- `configs/explore/povTracker-config.js` : réglages de la recherche des points de vue.
- `configs/explore/searchEnhancer-config.js` : réglages de la recherche améliorée.
- `configs/explore/similarFics-config.js` : réglages des histoires similaires.
- `configs/explore/surpriseMe-config.js` : réglages du choix aléatoire.
- `configs/explore/tropeGames-config.js` : réglages des jeux de tropes.

## Configurations « Library » — 8 fichiers

- `configs/library/activityPanel-config.js` : réglages des statistiques d’activité.
- `configs/library/bookmarkVault-config.js` : réglages des marque-pages améliorés.
- `configs/library/fanficBingeMode-config.js` : réglages de la lecture en série.
- `configs/library/ficAppreciation-config.js` : réglages des notes, kudos et états.
- `configs/library/laterShelf-config.js` : réglages de l’étagère « à lire plus tard ».
- `configs/library/notificationCenter-config.js` : réglages des notifications.
- `configs/library/readingDashboard-config.js` : réglages du tableau de bord.
- `configs/library/readingTimeline-config.js` : réglages de la ligne du temps.

## Configurations « Navigation » — 6 fichiers

- `configs/navigate-interact/commentKit-config.js` : réglages des commentaires.
- `configs/navigate-interact/ficActions-config.js` : réglages des boutons d’action.
- `configs/navigate-interact/keyboardShortcuts-config.js` : choix des raccourcis clavier.
- `configs/navigate-interact/mainNavigation-config.js` : réglages du menu de navigation.
- `configs/navigate-interact/seriesHelper-config.js` : réglages du suivi des séries.
- `configs/navigate-interact/userRelationships-config.js` : réglages liés aux auteurs suivis ou bloqués.

## Configurations « Reading » — 7 fichiers

- `configs/reading/chapterNavigation-config.js` : réglages de navigation entre les chapitres.
- `configs/reading/collapseAuthorNotes-config.js` : réglages des notes d’auteur repliées.
- `configs/reading/instantFootnotes-config.js` : réglages des notes de bas de page.
- `configs/reading/readingFormatter-config.js` : réglages de l’apparence du texte.
- `configs/reading/readingTracker-config.js` : réglages du suivi de lecture.
- `configs/reading/textToSpeech-config.js` : réglages de la lecture à voix haute.
- `configs/reading/wordSwap-config.js` : choix des mots à remplacer.

## Configuration générale — 2 fichiers

- `panel/configs/_default-config.js` : réglages utilisés quand un module n’a rien demandé de spécial.
- `panel/configs/index.js` : rassemble les configurations de modules afin que le panneau puisse les trouver.

## `lib/utils` — 15 fichiers

Ce sont les petits outils généraux.

- `config.js` : lit les réglages et indique quelles fonctions sont activées.
- `dom.js` : crée et modifie des boutons ou d’autres éléments de page.
- `error.js` : rassemble et explique les erreurs.
- `event-bus.js` : permet à différentes parties du programme de s’envoyer des messages.
- `event-names.js` : contient les noms officiels de ces messages.
- `format-date.js` : transforme une date en texte comme « hier » ou « il y a 3 jours ».
- `globals.js` : donne un accès sûr aux objets généraux du navigateur et d’AO3 Helper.
- `index.js` : rassemble plusieurs outils courants dans un seul endroit.
- `json-file.js` : importe ou exporte des données dans un fichier JSON.
- `logger.js` : écrit des informations utiles dans la console.
- `module-factory.js` : aide à fabriquer un nouveau module avec une structure correcte.
- `notifications.js` : envoie des notifications communes.
- `runtime-bundles.js` : télécharge et démarre les deux paquets secondaires de `dist`.
- `status-tracker-base.js` : base commune pour les modules qui suivent l’état d’une histoire.
- `user-detector.js` : détecte quel utilisateur AO3 est connecté.















# Une seule liste pour les groupes du menu
* Fusionner :
    - `lib/ui/menu/menu-groups-config.js`
    - la partie `GROUPS` de `lib/ui/panel/tab-registry.js`
* Résultat :
    - conserver uniquement `tab-registry.js` comme liste officielle ;
    - faire importer `GROUPS` directement depuis ce fichier.
Pourquoi : `tab-registry.js` fabrique déjà `GROUPS`. `menu-groups-config.js` contient une deuxième copie qu’il faut garder manuellement à jour.

---
# Initialisation des tests E2E — priorité moyenne
Ces scénarios répètent la résolution des chemins, le chargement du userscript, le shim GM, le serveur de bundles et l’ouverture de Chromium :
- [menu-boot.mjs]
- [route-loading.mjs]
- [boot-performance.mjs]
Je ne fusionnerais pas les scénarios eux-mêmes. J’extraierais plutôt leur code commun dans `tests/e2e/harness.mjs`. C’est une consolidation de logique dupliquée, tout en conservant trois commandes lisibles.
---
# Petites configurations statiques du panneau — priorité basse
Toutes les configurations sont déjà importées statiquement par [configs/index.js]. Leur séparation n’apporte donc pas de lazy loading individuel.
* Les petits fichiers pourraient être regroupés par catégorie :
    - `explore-configs.js`
    - `navigate-configs.js`
    - `reading-configs.js`
    - `library-configs.js`
Le gain ici est surtout une réduction du nombre de fichiers ; la séparation actuelle reste toutefois raisonnable pour retrouver rapidement les réglages d’un module.
---
# Consolidation importante, mais moins simple
* Les CSS de `ao3-mock` contiennent une duplication massive :
    - `dashboard.css` et `history.css` : environ 98,8 % de lignes communes ;
    - `ao3.css` et `subscriptions.css` : environ 90,7 % ;
    - `dashboard.css` et `home.css` : environ 86,6 %.
* Le modèle logique serait :
    - ao3-base.css
    - page-dashboard.css
    - page-history.css
    - page-home.css
    - page-subscriptions.css
    ...

---



## Modules déjà traités (18/38)

Chaque module listé ci-dessous a son .md à jour (specs cochées ✅ ou
déplacées vers "Explicitement écarté" avec raison), code + tests + build +
typecheck + e2e vérifiés :

- tagsDisplay
- skipWorks
- ficDownloader
- backupAndSync
- pageControls
- hideByTags
- workLength
- bookmarkVault
- collapseAuthorNotes
- themeBuilder
- wordSwap
- visualPreferences
- surpriseMe
- readingDashboard
- readingTimeline
- ficActions
- povTracker
- ficPeek

## Modules restants (20/38)

Dans l'ordre de taille croissante (nombre d'items non résolus dans leur
.md au moment du dernier passage) :

- notificationCenter (11)
- keyboardShortcuts (11)
- userRelationships (11)
- ficEngagement (12)
- instantFootnotes (12)
- textToSpeech (14)
- fanficBingeMode (17)
- mainNavigation (17)
- seriesHelper (17)
- readingFormatter (18)
- tropeGames (20)
- searchEnhancer (21)
- chapterNavigation (21)
- similarFics (23)
- commentKit (23)
- ficAppreciation (25)
- filterManager (26)
- activityPanel (29)
- readingTracker (30)
- laterShelf (37)



Imagine que ton projet est une boîte de LEGO. Ces cinq fichiers expliquent quelles pièces utiliser, comment vérifier qu’elles vont ensemble et comment construire le résultat final.

### `environment.d.ts` — le dictionnaire des mots spéciaux

Ce fichier aide l’éditeur et TypeScript à comprendre des choses qui existent dans ton programme, mais qu’ils ne peuvent pas découvrir seuls.

Dans ton projet, il explique notamment que :

- les fichiers CSS peuvent être importés comme du texte avec `?inline` ;
- Tampermonkey fournit des outils comme `GM_getValue`, `GM_setValue` et `GM_addStyle` ;
- le navigateur possède des objets comme `window`, `chrome` et `browser` ;
- AO3 Helper ajoute ses propres propriétés à `window`.

Le fichier ne crée pas réellement ces objets. Il dit simplement à TypeScript :

> « Ne t’inquiète pas, ces choses existeront lorsque le programme fonctionnera. »

C’est donc une sorte de dictionnaire pour éviter de fausses erreurs rouges dans l’éditeur.

Fichier : [environment.d.ts](<C:/Users/ehly2/OneDrive/Bureau/ao3helper-extension/environment.d.ts>)

### `package.json` — la carte d’identité du projet

C’est le fichier principal d’un projet utilisant Node.js et npm.

Il contient :

- le nom du projet : `ao3-helper` ;
- sa version : `1.1.0` ;
- sa description ;
- sa licence : `MIT` ;
- les outils dont il a besoin ;
- les commandes que tu peux lancer.

Par exemple :

- `npm run build` construit le userscript final ;
- `npm run dev` reconstruit le projet automatiquement pendant que tu travailles ;
- `npm test` lance les tests ;
- `npm run typecheck` cherche les erreurs de types ;
- `npm run preview` permet de prévisualiser le résultat de Vite.

La partie `devDependencies` est la liste des outils de construction :

- `vite` fabrique le projet final ;
- `vite-plugin-monkey` transforme le projet en userscript Tampermonkey ;
- `vitest` exécute les tests ;
- `typescript` vérifie le code ;
- `prettier` aide à bien présenter le code ;
- `playwright` aide à tester le projet comme dans un vrai navigateur.

Fichier : [package.json](<C:/Users/ehly2/OneDrive/Bureau/ao3helper-extension/package.json>)

### `package-lock.json` — la liste exacte des pièces

Dans `package.json`, certaines versions utilisent le symbole `^`, par exemple :

```json
"vite": "^8.1.3"
```

Cela signifie que npm peut parfois choisir une version plus récente compatible.

Le fichier `package-lock.json`, lui, enregistre la version exacte de chaque outil et de toutes ses petites dépendances. Il indique également où les télécharger et comment vérifier que les fichiers téléchargés sont corrects.

Grâce à lui, deux personnes qui lancent :

```bash
npm install
```

obtiennent normalement les mêmes versions.

C’est pour cela qu’il est beaucoup plus gros que `package.json`.

En général, tu ne le modifies pas toi-même. npm s’en occupe quand tu installes ou mets à jour un paquet.

Fichier : [package-lock.json](<C:/Users/ehly2/OneDrive/Bureau/ao3helper-extension/package-lock.json>)

### `tsconfig.json` — les règles du professeur TypeScript

Ce fichier explique à TypeScript comment vérifier ton code.

Même si ton projet contient principalement des fichiers JavaScript, ces options disent :

```json
"allowJs": true,
"checkJs": true
```

Autrement dit :

> « Accepte les fichiers JavaScript et cherche aussi les erreurs dedans. »

Quelques autres réglages importants :

- `noEmit: true` : TypeScript vérifie le code, mais ne fabrique aucun fichier ;
- `target: "ES2020"` : il comprend les fonctions JavaScript modernes jusqu’à ES2020 ;
- `DOM` : il connaît les objets du navigateur comme `window` et `document` ;
- `strict: false` : la vérification n’est pas au niveau le plus sévère ;
- `include` : il vérifie les fichiers de `src`, les tests et `environment.d.ts`.

Il définit aussi des raccourcis :

```js
@core/...
@modules/...
@lib/...
@ui/...
@styles/...
```

Ainsi, au lieu d’écrire un chemin compliqué comme :

```js
import quelqueChose from '../../../lib/ui/quelque-chose.js';
```

le projet peut utiliser un chemin plus lisible :

```js
import quelqueChose from '@ui/quelque-chose.js';
```

Fichier : [tsconfig.json](<C:/Users/ehly2/OneDrive/Bureau/ao3helper-extension/tsconfig.json>)

### `vite.config.js` — la recette de construction

Ce fichier explique à Vite comment transformer tous les fichiers du projet en un userscript utilisable.

Il lui indique notamment :

- que le point de départ est `src/main.js` ;
- qu’il faut utiliser `vite-plugin-monkey` ;
- que le résultat est un userscript nommé **AO3 Helper** ;
- qu’il doit fonctionner sur `https://archiveofourown.org/*` ;
- qu’il doit démarrer dès le début du chargement de la page ;
- quelles fonctions Tampermonkey sont autorisées ;
- quels raccourcis comme `@core` et `@ui` représentent quels dossiers ;
- que les tests doivent utiliser un faux navigateur appelé `happy-dom` ;
- que le code final doit être réduit pour prendre moins de place.

La partie `userscript` produit aussi l’en-tête Tampermonkey, avec des informations équivalentes à :

```js
// @name AO3 Helper
// @match https://archiveofourown.org/*
// @grant GM_getValue
// @grant GM_setValue
// @run-at document-start
```

Fichier : [vite.config.js](<C:/Users/ehly2/OneDrive/Bureau/ao3helper-extension/vite.config.js>)

### Comment tout travaille ensemble

Quand tu exécutes `npm run build` :

1. `package.json` indique quelle commande lancer.
2. `package-lock.json` garantit que les bons outils sont installés.
3. `tsconfig.json` et `environment.d.ts` aident à détecter les erreurs.
4. `vite.config.js` explique comment assembler le projet.
5. Vite fabrique le userscript final.

En très court :

- `environment.d.ts` = le dictionnaire ;
- `package.json` = la carte d’identité et les commandes ;
- `package-lock.json` = la liste exacte des outils ;
- `tsconfig.json` = les règles de vérification ;
- `vite.config.js` = la recette de construction.