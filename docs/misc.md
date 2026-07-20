


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
- `backupAndSync/_backupAndSync.js` : adapte aussi les anciennes sauvegardes aux nouvelles versions.
- `backupAndSync/backupAndSync.css` : choisit l’apparence des écrans de sauvegarde.

## Fic Downloader — 8 fichiers

- `ficDownloader/_ficDownloader.js` : assemble et démarre le téléchargeur.
- `ficDownloader/batchDownload.js` : télécharge plusieurs histoires à la fois.
- `ficDownloader/completePageDownload.js` : télécharge une histoire complète.
- `ficDownloader/downloadEnhancements.js` : ajoute des options pratiques aux téléchargements.
- `ficDownloader/individualDownloads.js` : télécharge une seule histoire.
- `ficDownloader/offlineLibrary.js` : range les histoires conservées hors connexion.
- `ficDownloader/_ficDownloader.js` : fabrique aussi la page HTML des histoires téléchargées.
- `ficDownloader/ficDownloader.css` : choisit l’apparence du téléchargeur.

## Theme Builder — 7 fichiers

- `themeBuilder/_themeBuilder.js` : assemble et démarre le créateur de thèmes.
- `themeBuilder/customStyling.js` : accepte des règles visuelles personnalisées.
- `themeBuilder/themeManagement.js` : crée, sauvegarde, charge et supprime des thèmes.
- `themeBuilder/_themeBuilder.js` : protège aussi les zones importantes et vérifie la lisibilité des thèmes.
- `themeBuilder/typographySystem.js` : règle les polices, tailles et espaces du texte.
- `themeBuilder/visualBuilder.js` : construit l’écran permettant de choisir les couleurs.
- `themeBuilder/themeBuilder.css` : choisit l’apparence du créateur de thèmes.

## Visual Preferences — 15 fichiers

- `visualPreferences/_visualPreferences.js` : assemble toutes les préférences visuelles.
- `visualPreferences/blurbSectionOrder.js` : change l’ordre des sections dans les résumés d’histoires.
- `visualPreferences/_visualPreferences.js` : classe aussi les dates selon leur ancienneté.
- `visualPreferences/datesTimestamps.js` : change l’affichage des dates et des heures.
- `visualPreferences/gridView.js` : affiche les listes d’histoires sous forme de grille.
- `visualPreferences/visualPreferences.css` : révèle certains éléments lorsque la souris passe dessus.
- `visualPreferences/layoutDensity.js` : règle l’espacement général de l’interface.
- `visualPreferences/minimalHeader.js` : simplifie l’en-tête d’AO3.
- `visualPreferences/statsDisplayFormat.js` : choisit la forme des statistiques.
- `visualPreferences/statsOnChaptersList.js` : ajoute des statistiques dans la liste des chapitres.
- `visualPreferences/statsVisibility.js` : décide quelles statistiques sont visibles.
- `visualPreferences/visibilityPresets.js` : propose des choix rapides de visibilité.
- `visualPreferences/wordOccurrenceCounter.js` : compte les occurrences d’un mot ou d’un nom dans une histoire.
- `visualPreferences/_visualPreferences.js` : effectue aussi les calculs utilisés par le compteur d’occurrences.
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
- `hideByTags/hiddenTags.js` : cache les histoires possédant certains tags.
- `hideByTags/nopeWords.js` : cherche des mots que l’utilisateur ne veut pas voir.
- `hideByTags/_hideByTags.js` : compte aussi les histoires cachées et gère les masquages temporaires.
- `hideByTags/whitelistExceptions.js` : laisse passer certaines histoires malgré un tag caché.
- `hideByTags/hideByTags.css` : apparence des histoires cachées et des commandes.

## Page Controls — 9 fichiers

- `pageControls/_pageControls.js` : assemble et démarre les commandes de navigation.
- `pageControls/backToTop.js` : ajoute un bouton pour remonter en haut.
- `pageControls/coreNavigation.js` : fournit les fonctions principales de navigation.
- `pageControls/enhancedNavigation.js` : améliore les boutons page suivante et précédente.
- `pageControls/infiniteScroll.js` : charge automatiquement la suite de la liste.
- `pageControls/_pageControls.js` : calcule aussi les destinations rapides et mémorise les pages visitées.
- `pageControls/worksPerPage.js` : choisit le nombre d’histoires affichées par page.
- `pageControls/pageControls.css` : apparence des commandes.

## Skip Works — 4 fichiers

- `skipWorks/_skipWorks.js` : fichier principal qui cache ou révèle des histoires.
- `skipWorks/_skipWorks.js` : contient aussi la synchronisation et les outils servant à identifier et présenter les histoires cachées.
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

## Work Length — 4 fichiers

- `workLength/_workLength.js` : assemble et démarre le module, et contient ses calculs partagés.
- `workLength/lengthDisplay.js` : affiche la longueur d’une histoire.
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

- `searchEnhancer/_searchEnhancer.js` : assemble les outils et centralise leurs calculs internes.
- `searchEnhancer/relatedSearches.js` : suggère des recherches proches.
- `searchEnhancer/resultsSorting.js` : trie les résultats de différentes manières.
- `searchEnhancer/searchAutocomplete.js` : propose des mots pendant que l’utilisateur écrit.
- `searchEnhancer/seriesGrouping.js` : regroupe les histoires appartenant à la même série.
- `searchEnhancer/searchEnhancer.css` : apparence des outils de recherche.

## Similar Fics — 2 fichiers

- `similarFics/similarFics.js` : cherche des histoires qui ressemblent à celle consultée.
- `similarFics/similarFics.css` : apparence des suggestions.

## Surprise Me — 4 fichiers

- `surpriseMe/surpriseMe.js` : sélectionne aussi les histoires admissibles et conserve l’historique récent des tirages.
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
- `activityPanel/_activityPanel.js` : contient aussi les outils partagés du panneau.
- `activityPanel/_activityPanel.js` : rassemble aussi les informations de lecture.
- `activityPanel/fandomBreakdown.js` : classe les lectures par fandom.
- `activityPanel/habitsAnalysis.js` : analyse les habitudes de lecture.
- `activityPanel/patternAnalysis.js` : cherche des habitudes qui se répètent.
- `activityPanel/readingInsights.js` : crée de petites observations sur les lectures.
- `activityPanel/_activityPanel.js` : calcule aussi les nombres et statistiques.
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
- `bookmarkVault/_bookmarkVault.js` : fournit aussi la recherche avancée, les exports et les outils d’entretien du coffre.
- `bookmarkVault/bookmarkVault.css` : apparence du coffre.

## Fanfic Binge Mode — 2 fichiers

- `fanficBingeMode/_fanficBingeMode.js` : enchaîne les histoires ou chapitres.
- `fanficBingeMode/fanficBingeMode.css` : apparence des commandes.

## Fic Appreciation — 8 fichiers fonctionnels

- `ficAppreciation/_ficAppreciation.js` : assemble et démarre les outils d’appréciation.
- `ficAppreciation/kudosExtendedFeatures.js` : ajoute des possibilités supplémentaires aux kudos.
- `ficAppreciation/_ficAppreciation.js` coordonne aussi les opérations liées aux kudos.
- `ficAppreciation/kudosTracker.js` : détecte, enregistre, synchronise et affiche les kudos donnés.
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

- `readingDashboard/readingDashboard.js` : contient aussi les statistiques et bilans du tableau de bord.
- `readingDashboard/readingDashboard.js` : affiche un résumé des lectures.
- `readingDashboard/readingDashboard.css` : apparence du tableau de bord.

## Reading Timeline — 7 fichiers

- `readingTimeline/_readingTimeline.js` : assemble et démarre la ligne du temps.
- `readingTimeline/historyAnalytics.js` : analyse l’historique de lecture.
- `readingTimeline/_readingTimeline.js` : gère aussi les annotations, les filtres favoris et les statistiques de la ligne du temps.
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
- `userRelationships/_userRelationships.js` : lit aussi les réglages partagés.
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
















## Root 

Imagine que ton projet est une boîte de LEGO. Ces cinq fichiers expliquent quelles pièces utiliser, comment vérifier qu’elles vont ensemble et comment construire le résultat final.


### `environment.d.ts` — le dictionnaire des mots spéciaux
Ce fichier aide l’éditeur et TypeScript à comprendre des choses qui existent dans ton programme, mais qu’ils ne peuvent pas découvrir seuls.

* Dans ton projet, il explique notamment que :
    - les fichiers CSS peuvent être importés
    - Tampermonkey fournit des outils 
    - le navigateur possède des objets 
    - AO3 Helper ajoute ses propres propriétés

Le fichier ne crée pas réellement ces objets. Il dit simplement à TypeScript :
> « Ne t’inquiète pas, ces choses existeront lorsque le programme fonctionnera. »
C’est donc une sorte de dictionnaire pour éviter de fausses erreurs rouges dans l’éditeur.


--- 

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



Voici la comparaison complète des **38 modules**. « Prévu » correspond à la première fiche `.md` commitée; « Réel » correspond aux fichiers `.js` présents actuellement. Les tests, CSS et configurations du panneau sont exclus.

## Appearance & Tools

### backupAndSync — 5 → 6

- Prévu : `_backupAndSync.js`, `automateBackup.js`, `backupOperations.js`, `cloudSync.js`, `dataTransfer.js`
- Réel : `_backupAndSync.js`, `automateBackup.js`, `backupOperations.js`, `cloudSync.js`, `dataTransfer.js`

### ficDownloader — 6 → 7

- Prévu : `_ficDownloader.js`, `individualDownloads.js`, `batchDownload.js`, `completePageDownload.js`, `downloadEnhancements.js`, `offlineLibrary.js`
- Réel : `_ficDownloader.js`, `individualDownloads.js`, `batchDownload.js`, `completePageDownload.js`, `downloadEnhancements.js`, `offlineLibrary.js`

### themeBuilder — 5 → 6

- Prévu : `_themeBuilder.js`, `customStyling.js`, `themeManagement.js`, `typographySystem.js`, `visualBuilder.js`
- Réel : `_themeBuilder.js`, `customStyling.js`, `themeManagement.js`, `typographySystem.js`, `visualBuilder.js`

`lib/themes/engine/themeValidator.js`, cité dans l’ancienne documentation, était une dépendance externe au module et non un sous-module de `themeBuilder`.

### visualPreferences — architecture actuelle

- La révélation au survol, initialement envisagée comme un fichier séparé, est intégrée à `visualPreferences.css`.
- Réel : `_visualPreferences.js`, `blurbSectionOrder.js`, `datesTimestamps.js`, `gridView.js`, `layoutDensity.js`, `minimalHeader.js`, `statsDisplayFormat.js`, `statsOnChaptersList.js`, `statsVisibility.js`, `visibilityPresets.js`, `wordOccurrenceCounter.js`

L’ancien `fandomHighlighting.js` était déjà indiqué comme transféré vers `tagsDisplay/tagHighlighting.js`; il ne faisait donc plus partie du plan initial retenu ici.

## Browse

### ficEngagement — 3 → 3

- Prévu : `_ficEngagement.js`, `engagementMetrics.js`, `hiddenGems.js`
- Réel : `_ficEngagement.js`, `engagementMetrics.js`, `hiddenGems.js`

### filterManager — 6 → 6

- Prévu : `_filterManager.js`, `filterWarnings.js`, `languageBadges.js`, `presetManagement.js`, `userHistoryFilters.js`, `worksFilterManager.js`
- Réel : `_filterManager.js`, `filterWarnings.js`, `languageBadges.js`, `presetManagement.js`, `userHistoryFilters.js`, `worksFilterManager.js`

### hideByTags — 4 → 6

- Prévu : `_hideByTags.js`, `hiddenTags.js`, `whitelistExceptions.js`, `nopeWords.js`
- Réel : `_hideByTags.js`, `hiddenTags.js`, `nopeWords.js`, `whitelistExceptions.js`

### pageControls — 4 → 8

- Prévu : `_pageControls.js`, `coreNavigation.js`, `worksPerPage.js`, `enhancedNavigation.js`
- Réel : `_pageControls.js`, `backToTop.js`, `coreNavigation.js`, `enhancedNavigation.js`, `infiniteScroll.js`, `worksPerPage.js`

### skipWorks — 1 → 3

- Prévu : `skipWorks.js`
- Réel : `_skipWorks.js`

`skipWorks.js` est devenu `_skipWorks.js`, puis une partie de sa logique a été extraite dans deux fichiers.

### tagsDisplay — 6 → 12

- Prévu : `archiveWarningsDisplay.js`, `autoHideNoiseTags.js`, `compactModeTags.js`, `tagHighlighting.js`, `tagsReordering.js`, `tagsVisibility.js`
- Réel : `_tagsDisplay.js`, `archiveWarningsDisplay.js`, `autoHideNoiseTags.js`, `compactModeTags.js`, `externalTagLinks.js`, `tagHighlighting.js`, `tagImportancePromotion.js`, `tagSeparatorStyle.js`, `tagsReordering.js`, `tagsVisibility.js`

Le coordinateur `_tagsDisplay.js` existait déjà, mais n’avait pas été mentionné dans la première fiche.

### workLength — 3 → 3

- Prévu : `_workLength.js`, `lengthDisplay.js`, `readingTime.js`
- Réel : `_workLength.js`, `lengthDisplay.js`, `readingTime.js`

## Explore

### ficPeek — 1 → 2

- Prévu : `ficPeek.js`
- Réel : `ficPeek.js`

### povTracker — 3 → 6

- Prévu : `_povTracker.js`, `povAnalysis.js`, `povPresentation.js`
- Réel : `_povTracker.js`, `povAnalysis.js`, `povDetailPanel.js`, `povPresentation.js`

### searchEnhancer — 5 → 5

- Prévu : `_searchEnhancer.js`, `relatedSearches.js`, `resultsSorting.js`, `searchAutocomplete.js`, `seriesGrouping.js`
- Réel : `_searchEnhancer.js`, `relatedSearches.js`, `resultsSorting.js`, `searchAutocomplete.js`, `seriesGrouping.js`

### similarFics — 1 → 1

- Prévu : `similarFics.js`
- Réel : `similarFics.js`

### surpriseMe — 1 → 3

- Prévu : `surpriseMe.js`
- Réel : `surpriseMe.js`

### tropeGames — 6 → 6

- Prévu : `_tropeGames.js`, `tropeAchievements.js`, `tropeBingoPatterns.js`, `tropeHoroscope.js`, `tropeRoulette.js`, `tropeStatistics.js`
- Réel : `_tropeGames.js`, `tropeAchievements.js`, `tropeBingoPatterns.js`, `tropeHoroscope.js`, `tropeRoulette.js`, `tropeStatistics.js`

## Library

### activityPanel — 9 → 9

- Prévu : `_activityPanel.js`, `fandomBreakdown.js`, `habitsAnalysis.js`, `patternAnalysis.js`, `readingInsights.js`, `sessionHistory.js`
- Réel : `_activityPanel.js`, `fandomBreakdown.js`, `habitsAnalysis.js`, `patternAnalysis.js`, `readingInsights.js`, `sessionHistory.js`

### bookmarkVault — 10 → 13

- Prévu : `_bookmarkVault.js`, `bookmarkMaintenance.js`, `bookmarkNavigation.js`, `bookmarkStatus/readingStatusTracking.js`, `bookmarkStatus/statusIndicators.js`, `noteDisplay.js`, `noteManagement.js`, `organizationTools.js`, `richTextNotes.js`, `sortingAndFiltering.js`
- Réel : `_bookmarkVault.js`, `blockedBookmarks.js`, `bookmarkMaintenance.js`, `bookmarkNavigation.js`, `bookmarkStatus/readingStatusTracking.js`, `bookmarkStatus/statusIndicators.js`, `noteDisplay.js`, `noteManagement.js`, `organizationTools.js`, `personalRatings.js`, `richTextNotes.js`, `sortingAndFiltering.js`

### fanficBingeMode — 1 → 2

- Prévu : `_fanficBingeMode.js`
- Réel : `_fanficBingeMode.js`

### ficAppreciation — architecture actuelle

- Le suivi, la synchronisation et l’affichage des kudos sont regroupés dans `kudosTracker.js`.
- Réel : `_ficAppreciation.js`, `kudosBookmarkFinder.js`, `kudosExtendedFeatures.js`, `kudosTracker.js`, `markAsFinished.js`, `multiStatusTracker.js`, `starRatings.js`

### laterShelf — 5 → 5

- Prévu : `_laterShelf.js`, `laterShelfStore.js`, `markedForLaterStatus.js`, `quickMarkForLaterButton.js`, `workReminder.js`
- Réel : `_laterShelf.js`, `laterShelfStore.js`, `markedForLaterStatus.js`, `quickMarkForLaterButton.js`, `workReminder.js`

### notificationCenter — 1 → 2

- Prévu : `notificationCenter.js`
- Réel : `notificationCenter.js`

### readingDashboard — 1 → 2

- Prévu : `readingDashboard.js`
- Réel : `readingDashboard.js`

### readingTimeline — 3 → 6

- Prévu : `_readingTimeline.js`, `historyAnalytics.js`, `timelineVisualization.js`
- Réel : `_readingTimeline.js`, `historyAnalytics.js`, `timelineVisualization.js`

## Navigate & Interact

### commentKit — 7 → 7

- Prévu : `_commentKit.js`, `commentComposing.js`, `commentConfiguration.js`, `commentHighlighting.js`, `commentNavigation.js`, `draftManagement.js`, `threadManagement.js`
- Réel : `_commentKit.js`, `commentComposing.js`, `commentConfiguration.js`, `commentHighlighting.js`, `commentNavigation.js`, `draftManagement.js`, `threadManagement.js`

### ficActions — 1 → 2

- Prévu : `ficActions.js`
- Réel : `ficActions.js`

### keyboardShortcuts — 1 → 2

- Prévu : `keyboardShortcuts.js`
- Réel : `keyboardShortcuts.js`

### mainNavigation — 4 → 4

- Prévu : `_mainNavigation.js`, `addNavLinks.js`, `menuActivation.js`, `quickLinks.js`
- Réel : `_mainNavigation.js`, `addNavLinks.js`, `menuActivation.js`, `quickLinks.js`

### seriesHelper — 3 → 3

- Prévu : `_seriesHelper.js`, `seriesOrganization.js`, `seriesProgress.js`
- Réel : `_seriesHelper.js`, `seriesOrganization.js`, `seriesProgress.js`

### userRelationships — 8 → 10

- Prévu : `_userRelationships.js`, `authorBlocking.js`, `authorPreference.js`, `authorTracking.js`, `blockingInterface.js`, `blocklistManagement.js`, `commentHiding.js`
- Réel : `_userRelationships.js`, `authorBlocking.js`, `authorCard.js`, `authorPreference.js`, `authorTracking.js`, `blockingInterface.js`, `blocklistManagement.js`, `commentHiding.js`

## Reading

### chapterNavigation — 5 → 6

- Prévu : `_chapterNavigation.js`, `autoScroll.js`, `blurbNavigation.js`, `chapterWordCount.js`, `navigationControls.js`
- Réel : `_chapterNavigation.js`, `autoScroll.js`, `blurbNavigation.js`, `chaptersPanel.js`, `chapterWordCount.js`, `navigationControls.js`

### collapseAuthorNotes — 1 → 1

- Prévu : `collapseAuthorNotes.js`
- Réel : `collapseAuthorNotes.js`

### instantFootnotes — 1 → 1

- Prévu : `instantFootnotes.js`
- Réel : `instantFootnotes.js`

### readingFormatter — 4 → 4

- Prévu : `_readingFormatter.js`, `appearance.js`, `content.js`, `readingControls.js`
- Réel : `_readingFormatter.js`, `appearance.js`, `content.js`, `readingControls.js`

### readingTracker — 5 → 5

- Prévu : `_readingTracker.js`, `readingProgress.js`, `seenTracking.js`, `viewHistory.js`, `visualMarkers.js`
- Réel : `_readingTracker.js`, `readingProgress.js`, `seenTracking.js`, `viewHistory.js`, `visualMarkers.js`

### textToSpeech — 6 → 6

- Prévu : `_textToSpeech.js`, `contentFiltering.js`, `playbackControls.js`, `pronunciationManager.js`, `speechEngine.js`, `visualFeedback.js`
- Réel : `_textToSpeech.js`, `contentFiltering.js`, `playbackControls.js`, `pronunciationManager.js`, `speechEngine.js`, `visualFeedback.js`

### wordSwap — 1 → 2

- Prévu : `wordSwap.js`
- Réel : `wordSwap.js`




Voici les **203 fichiers JavaScript réels** présents dans `src/modules`, avec une phrase expliquant le rôle de chacun. Les tests, feuilles CSS et configurations du panneau sont exclus.

# Appearance & Tools

## Backup and Sync

- `_backupAndSync.js` : initialise le système de sauvegarde et coordonne ses différents composants.
- `automateBackup.js` : planifie les sauvegardes automatiques et supprime les plus anciennes lorsque la limite est atteinte.
- `backupOperations.js` : crée, restaure et gère les sauvegardes manuelles, sélectives, compressées ou chiffrées.
- `cloudSync.js` : synchronise les données d’AO3 Helper entre plusieurs appareils à travers le stockage du navigateur.
- `dataTransfer.js` : importe et exporte les données de l’extension ainsi que les listes d’œuvres.
- `_backupAndSync.js` : déplace aussi les réglages enregistrés sous les anciens identifiants de modules vers leurs nouveaux emplacements.

## Fic Downloader

- `_ficDownloader.js` : initialise et coordonne les différents modes de téléchargement d’œuvres.
- `batchDownload.js` : permet de sélectionner et télécharger plusieurs œuvres dans une même opération.
- `completePageDownload.js` : télécharge toutes les œuvres d’une page et peut les réunir dans une archive.
- `downloadEnhancements.js` : ajoute les formats avancés, la file d’attente et les intégrations Kindle ou Calibre.
- `individualDownloads.js` : ajoute des commandes permettant de télécharger rapidement une seule œuvre.
- `offlineLibrary.js` : stocke des œuvres localement et fournit les outils de consultation hors connexion.
- `_ficDownloader.js` construit aussi le document HTML autonome utilisé pour enregistrer une œuvre téléchargée.

## Theme Builder

- `_themeBuilder.js` : initialise le créateur de thèmes et réapplique le thème actif au chargement.
- `customStyling.js` : fournit l’éditeur de CSS personnalisé et applique les styles définis par l’utilisateur.
- `themeManagement.js` : crée, importe, exporte, applique et supprime les thèmes personnalisés.
- `_themeBuilder.js` vérifie aussi la lisibilité des thèmes et protège les zones sensibles contre certains styles dangereux.
- `typographySystem.js` : gère les polices, tailles, interlignes et préréglages typographiques.
- `visualBuilder.js` : construit l’éditeur visuel permettant de choisir les couleurs et de prévisualiser un thème.

## Visual Preferences

- `_visualPreferences.js` : initialise les préférences visuelles et partage leurs réglages.
- `blurbSectionOrder.js` : réorganise les différentes sections des résumés d’œuvres.
- `_visualPreferences.js` : calcule aussi l’ancienneté des dates et les classe dans des périodes lisibles.
- `datesTimestamps.js` : masque, transforme ou reformate les dates affichées par AO3.
- `gridView.js` : transforme les listes d’œuvres en une grille de cartes.
- `visualPreferences.css` : révèle temporairement au survol les informations visuellement cachées.
- `layoutDensity.js` : applique une densité d’interface compacte, confortable ou espacée.
- `minimalHeader.js` : réduit la taille et la complexité visuelle de l’en-tête d’AO3.
- `statsDisplayFormat.js` : affiche les statistiques sous forme de texte, d’icônes ou d’icônes accompagnées d’une légende.
- `statsOnChaptersList.js` : contrôle l’affichage des statistiques dans la liste des chapitres.
- `statsVisibility.js` : masque séparément les mots, kudos, commentaires, bookmarks et hits.
- `visibilityPresets.js` : applique rapidement des ensembles prédéfinis de préférences de visibilité.
- `wordOccurrenceCounter.js` : compte les occurrences d’un mot ou d’un nom dans le texte d’une œuvre.
- `_visualPreferences.js` : contient aussi les calculs et la logique textuelle utilisés par le compteur d’occurrences.

# Browse

## Fic Engagement

- `_ficEngagement.js` : initialise les indicateurs et centralise les calculs propres au module.
- `engagementMetrics.js` : calcule et affiche les ratios entre hits, kudos, commentaires et bookmarks.
- `hiddenGems.js` : repère les œuvres peu populaires qui obtiennent néanmoins un bon taux d’appréciation.

## Filter Manager

- `_filterManager.js` : initialise et coordonne les différents outils de filtrage.
- `filterWarnings.js` : affiche des avertissements lorsque des filtres risquent de produire des résultats inattendus.
- `languageBadges.js` : affiche la langue de chaque œuvre sous la forme d’un badge plus visible.
- `presetManagement.js` : sauvegarde, recharge et supprime des ensembles de filtres.
- `userHistoryFilters.js` : ajoute des options de filtrage aux pages de l’historique de lecture.
- `worksFilterManager.js` : applique et coordonne les filtres utilisés sur les listes d’œuvres.

## Hide By Tags

- `_hideByTags.js` : initialise le masquage automatique des œuvres selon leurs tags ou leur texte.
- `hiddenTags.js` : cache les œuvres contenant des tags placés dans la liste noire.
- `nopeWords.js` : cherche des mots interdits dans les titres, résumés ou notes d’auteur.
- `_hideByTags.js` : compte aussi les œuvres masquées et gère les masquages temporaires qui doivent expirer automatiquement.
- `whitelistExceptions.js` : empêche le masquage d’une œuvre lorsqu’elle correspond à une exception autorisée.

## Page Controls

- `_pageControls.js` : initialise les améliorations de pagination sur les listes d’œuvres.
- `backToTop.js` : ajoute un bouton permettant de remonter rapidement en haut de la page.
- `coreNavigation.js` : fournit le champ permettant d’atteindre directement un numéro de page.
- `enhancedNavigation.js` : ajoute des boutons de navigation comme First, Last, −10 et +10.
- `infiniteScroll.js` : charge automatiquement la page suivante lorsque l’utilisateur atteint le bas de la liste.
- `_pageControls.js` : calcule aussi les destinations rapides et mémorise la dernière page visitée pour chaque liste.
- `worksPerPage.js` : permet de choisir combien d’œuvres sont affichées par page.

## Skip Works

- `_skipWorks.js` : coordonne le masquage manuel des œuvres et l’enregistrement des raisons personnelles.
- `_skipWorks.js` : maintient aussi une copie synchronisée des œuvres masquées et extrait les métadonnées nécessaires pour les présenter.

## Tags Display

- `_tagsDisplay.js` : initialise et coordonne toutes les améliorations liées à l’affichage des tags.
- `archiveWarningsDisplay.js` : transforme les avertissements d’archive en badges ou icônes plus compacts.
- `autoHideNoiseTags.js` : masque ou floute automatiquement les tags considérés comme peu informatifs.
- `compactModeTags.js` : replie les catégories de tags et les révèle au survol ou au défilement.
- `externalTagLinks.js` : ajoute aux tags des liens de recherche vers des sites comme Fanlore ou TV Tropes.
- `_tagsDisplay.js` gère l’interface et les exceptions du filtre anti-bruit; la détection partagée avec `hideByTags` vit dans `lib/utils/noise-tags.js`.
- `tagHighlighting.js` : applique des couleurs ou styles distinctifs aux tags choisis par l’utilisateur.
- `tagImportancePromotion.js` : déplace les tags importants ou surlignés en tête de leur catégorie.
- `_tagsDisplay.js` contient aussi les règles de catégorisation, de correspondance et de tri des tags.
- `tagSeparatorStyle.js` : remplace le séparateur visuel utilisé entre les tags.
- `tagsReordering.js` : permet de réordonner les tags et de mémoriser l’ordre choisi.
- `tagsVisibility.js` : masque les catégories ou tags excédentaires et fournit les commandes pour les révéler.

## Work Length

- `_workLength.js` : initialise les indicateurs et centralise les calculs propres au module.
- `lengthDisplay.js` : affiche les badges décrivant la longueur d’une œuvre.
- `readingTime.js` : estime le temps nécessaire pour lire une œuvre selon le nombre de mots.

# Explore

## Fic Peek

- `ficPeek.js` : récupère et affiche un aperçu d’une œuvre sans quitter la liste de résultats.
- `ficPeek.js` : choisit aussi le chapitre, extrait le texte demandé et gère les clés et durées du cache.

## POV Tracker

- `_povTracker.js` : initialise l’analyse du point de vue narratif et coordonne son affichage.
- `povAnalysis.js` : déduit le point de vue d’une œuvre à partir de ses tags, de son résumé et des analyses disponibles.
- `povDetailPanel.js` : affiche sur la page de l’œuvre un panneau détaillant les résultats chapitre par chapitre.
- `_povTracker.js` : analyse et valide aussi les préférences de point de vue choisies par l’utilisateur.
- `povPresentation.js` : construit les badges, filtres et statistiques présentant les résultats de l’analyse.
- `_povTracker.js` : compte aussi les pronoms du texte et classe le chapitre en première, deuxième, troisième personne ou point de vue mixte.

## Search Enhancer

- `_searchEnhancer.js` : initialise les améliorations et centralise leurs calculs internes.
- `relatedSearches.js` : propose des recherches proches ou complémentaires à la recherche actuelle.
- `resultsSorting.js` : ajoute des méthodes supplémentaires pour trier les résultats.
- `searchAutocomplete.js` : suggère des termes pendant la saisie d’une recherche.
- `seriesGrouping.js` : regroupe visuellement les œuvres appartenant à une même série.

## Similar Fics

- `similarFics.js` : cherche et affiche des œuvres ressemblant à celle actuellement consultée.

## Surprise Me

- `surpriseMe.js` : filtre et sélectionne aussi les œuvres admissibles, puis mémorise les derniers résultats pour éviter les répétitions.
- `surpriseMe.js` : construit l’interface et choisit une œuvre au hasard parmi les candidates.

## Trope Games

- `_tropeGames.js` : initialise et coordonne les différents jeux basés sur les tropes.
- `tropeAchievements.js` : débloque des succès selon les tropes rencontrés pendant la lecture.
- `tropeBingoPatterns.js` : construit les grilles de bingo et détecte les lignes complétées.
- `tropeHoroscope.js` : produit un horoscope ludique à partir des tropes observés.
- `tropeRoulette.js` : choisit aléatoirement un trope ou un défi de lecture.
- `tropeStatistics.js` : compte les tropes rencontrés et produit des statistiques personnelles.

# Library

## Activity Panel

- `_activityPanel.js` : initialise et coordonne le panneau d’analyse de l’activité de lecture.
- `_activityPanel.js` fournit aussi les fonctions et structures de données partagées par les différentes analyses.
- `_activityPanel.js` collecte et normalise aussi les informations nécessaires aux statistiques de lecture.
- `fandomBreakdown.js` : répartit les lectures par fandom et calcule leur importance relative.
- `habitsAnalysis.js` : analyse les habitudes de lecture, comme les horaires, longueurs et rythmes préférés.
- `patternAnalysis.js` : recherche des tendances récurrentes dans les données de lecture.
- `readingInsights.js` : transforme les statistiques en petites observations compréhensibles.
- `_activityPanel.js` calcule aussi les totaux, moyennes et autres statistiques générales.
- `sessionHistory.js` : enregistre et restitue l’historique des séances de lecture.

## Bookmark Vault

- `_bookmarkVault.js` : initialise et coordonne les améliorations apportées aux bookmarks.
- `blockedBookmarks.js` : masque les bookmarks publics créés par des utilisateurs bloqués.
- `bookmarkMaintenance.js` : détecte et entretient les bookmarks supprimés, restreints ou devenus invalides.
- `bookmarkNavigation.js` : facilite le retour vers une œuvre et le déplacement entre les bookmarks.
- `bookmarkStatus/readingStatusTracking.js` : enregistre le statut et la progression de lecture associés aux bookmarks.
- `bookmarkStatus/statusIndicators.js` : affiche les statuts de lecture sous forme de badges.
- `noteDisplay.js` : affiche les notes personnelles associées aux bookmarks.
- `noteManagement.js` : crée, modifie et supprime les notes personnelles.
- `organizationTools.js` : fournit les catégories, épingles et actions groupées servant à organiser les bookmarks.
- `personalRatings.js` : permet d’attribuer et de conserver une évaluation personnelle aux œuvres.
- `richTextNotes.js` : ajoute le formatage enrichi et l’édition avancée aux notes.
- `sortingAndFiltering.js` : trie et filtre les bookmarks selon leur statut, catégorie ou autre métadonnée.
- `_bookmarkVault.js` fournit aussi les outils avancés de recherche, d’exportation, d’analyse et d’entretien du coffre.

## Fanfic Binge Mode

- `_fanficBingeMode.js` : gère une file de lecture continue et permet d’enchaîner automatiquement les œuvres ou chapitres.
- `_fanficBingeMode.js` : calcule aussi les priorités de la file et sélectionne les lectures interrompues qui peuvent être reprises.

## Fic Appreciation

- `_ficAppreciation.js` : initialise et coordonne les outils de suivi et d’appréciation des œuvres.
- `kudosExtendedFeatures.js` : ajoute des fonctions supplémentaires autour de l’affichage et du suivi des kudos.
- `_ficAppreciation.js` coordonne aussi les différentes opérations liées aux kudos.
- `kudosTracker.js` : détecte, enregistre, synchronise et affiche les kudos donnés aux œuvres.
- `markAsFinished.js` : permet de marquer une œuvre comme terminée.
- `multiStatusTracker.js` : conserve plusieurs états personnels pour une même œuvre.
- `starRatings.js` : permet d’attribuer et d’afficher une note en étoiles.

## Later Shelf

- `_laterShelf.js` : initialise et coordonne l’étagère personnelle des œuvres à lire plus tard.
- `laterShelfStore.js` : enregistre et récupère les œuvres placées sur l’étagère.
- `markedForLaterStatus.js` : détermine et affiche si une œuvre est déjà marquée pour plus tard.
- `quickMarkForLaterButton.js` : ajoute aux listes un bouton permettant de placer rapidement une œuvre sur l’étagère.
- `workReminder.js` : affiche des rappels concernant les œuvres mises de côté.

## Notification Center

- `notificationCenter.js` : collecte, affiche et gère les notifications produites par l’extension.
- `notificationCenter.js` : classe aussi les notifications dans des périodes comme aujourd’hui, hier, cette semaine ou plus ancien.

## Reading Dashboard

- `readingDashboard.js` : calcule aussi les statistiques et bilans utilisés par le tableau de bord.
- `readingDashboard.js` : construit le tableau de bord présentant un résumé de l’activité de lecture.

## Reading Timeline

- `_readingTimeline.js` : initialise et coordonne la ligne du temps de l’historique de lecture.
- `historyAnalytics.js` : analyse l’historique afin d’en extraire des tendances et événements.
- `_readingTimeline.js` : gère aussi les annotations, les filtres favoris et les statistiques affichées sur la ligne du temps.
- `timelineVisualization.js` : transforme les données de lecture en une représentation chronologique interactive.

# Navigate & Interact

## Comment Kit

- `_commentKit.js` : initialise et coordonne les outils destinés aux commentaires.
- `commentComposing.js` : ajoute des outils de formatage, modèles et aides à la rédaction.
- `commentConfiguration.js` : applique les réglages généraux liés aux commentaires.
- `commentHighlighting.js` : met visuellement en évidence certains commentaires ou auteurs.
- `commentNavigation.js` : facilite le déplacement entre les commentaires et les fils de discussion.
- `draftManagement.js` : sauvegarde et restaure automatiquement les brouillons de commentaires.
- `threadManagement.js` : replie, déplie et suit les réponses non lues dans les fils de discussion.

## Fic Actions

- `ficActions.js` : ajoute et organise des boutons d’action rapide autour des œuvres.
- `ficActions.js` : fournit aussi les icônes et choisit les emplacements appropriés pour les boutons d’action.

## Keyboard Shortcuts

- `keyboardShortcuts.js` : écoute les événements clavier et déclenche les actions associées aux raccourcis configurés.
- `keyboardShortcuts.js` : contient aussi l’analyse, la normalisation et la comparaison des combinaisons de touches.

## Main Navigation

- `_mainNavigation.js` : initialise et coordonne les améliorations apportées au menu principal.
- `addNavLinks.js` : ajoute de nouveaux liens aux zones de navigation d’AO3.
- `menuActivation.js` : contrôle l’ouverture, la fermeture et l’activation des menus.
- `quickLinks.js` : ajoute des raccourcis vers les pages fréquemment utilisées.

## Series Helper

- `_seriesHelper.js` : initialise et coordonne les outils destinés aux séries.
- `seriesOrganization.js` : organise et présente les œuvres appartenant à une série.
- `seriesProgress.js` : suit la progression de lecture à travers les différentes parties d’une série.

## User Relationships

- `_userRelationships.js` : initialise et coordonne les fonctions de suivi, préférence et blocage des utilisateurs.
- `authorBlocking.js` : masque les œuvres publiées par les auteurs bloqués.
- `authorCard.js` : affiche au survol une fiche résumant les informations et préférences associées à un auteur.
- `authorPreference.js` : conserve les auteurs favoris, notes personnelles et priorités de lecture.
- `authorTracking.js` : suit l’activité des auteurs choisis.
- `blockingInterface.js` : construit les boutons, dialogues et autres commandes de blocage.
- `_userRelationships.js` comptabilise aussi les œuvres, commentaires et notes masqués par le système de blocage.
- `blocklistManagement.js` : ajoute, retire, importe et exporte les utilisateurs de la liste de blocage.
- `commentHiding.js` : masque les commentaires écrits par des utilisateurs bloqués.
- `_userRelationships.js` centralise aussi les réglages et valeurs par défaut du module.

# Reading

## Chapter Navigation

- `_chapterNavigation.js` : initialise et coordonne les commandes de navigation à l’intérieur d’une œuvre.
- `autoScroll.js` : fait défiler automatiquement le texte pendant la lecture.
- `blurbNavigation.js` : ajoute des commandes de navigation directement aux résumés d’œuvres.
- `chapterWordCount.js` : calcule et affiche le nombre de mots du chapitre courant.
- `navigationControls.js` : construit les boutons permettant de passer au chapitre précédent, suivant ou à une autre destination.

## Collapse Author Notes

- `collapseAuthorNotes.js` : replie les notes d’auteur et permet de les développer à la demande.

## Instant Footnotes

- `instantFootnotes.js` : affiche le contenu des notes de bas de page sans quitter la position de lecture.

## Reading Formatter

- `_readingFormatter.js` : initialise et coordonne les outils de mise en forme du mode lecture.
- `appearance.js` : applique les couleurs, tailles, largeurs et espacements choisis pour la lecture.
- `content.js` : prépare, nettoie et organise le contenu de l’œuvre avant son affichage.
- `readingControls.js` : construit les commandes permettant de modifier la présentation du texte.

## Reading Tracker

- `_readingTracker.js` : initialise et coordonne le suivi des œuvres vues et de la progression.
- `readingProgress.js` : enregistre la position de lecture à l’intérieur d’une œuvre.
- `seenTracking.js` : reconnaît et marque les œuvres déjà rencontrées.
- `viewHistory.js` : conserve l’historique des œuvres et chapitres consultés.
- `visualMarkers.js` : affiche des indicateurs visuels pour les œuvres vues ou partiellement lues.

## Text To Speech

- `_textToSpeech.js` : initialise le lecteur vocal et centralise ses calculs internes.
- `contentFiltering.js` : prépare le texte à lire et retire les éléments qui doivent être ignorés.
- `playbackControls.js` : construit les commandes de lecture, pause, vitesse, volume, voix et minuterie.
- `pronunciationManager.js` : applique les règles de prononciation personnalisées avant la lecture.
- `speechEngine.js` : découpe le texte et contrôle l’API de synthèse vocale du navigateur.
- `visualFeedback.js` : surligne la phrase courante et affiche l’état de la lecture.

## Word Swap

- `wordSwap.js` : contient aussi les modèles et fonctions de validation des règles de remplacement.
- `wordSwap.js` : remplace automatiquement dans le texte les mots correspondant aux règles de l’utilisateur.








Voici la liste complète mise à jour des **225 fichiers JavaScript fonctionnels** présents dans `src/modules`. Elle reprend l’ancienne liste de 203 fichiers et y ajoute les 22 nouveaux. Les tests, CSS et configurations du panneau sont exclus.

# Appearance & Tools

## Backup and Sync — 6 fichiers

- `_backupAndSync.js` : initialise le système de sauvegarde et coordonne ses différents composants.
- `automateBackup.js` : planifie les sauvegardes automatiques et supprime les plus anciennes lorsque la limite est atteinte.
- `backupOperations.js` : crée, restaure et gère les sauvegardes manuelles, sélectives, compressées ou chiffrées.
- `cloudSync.js` : synchronise les données d’AO3 Helper entre plusieurs appareils à travers le stockage du navigateur.
- `dataTransfer.js` : importe et exporte les données de l’extension ainsi que les listes d’œuvres.
- `_backupAndSync.js` : déplace aussi les réglages enregistrés sous les anciens identifiants vers leurs nouveaux emplacements.

## Fic Downloader — 7 fichiers

- `_ficDownloader.js` : initialise et coordonne les différents modes de téléchargement.
- `batchDownload.js` : permet de sélectionner et télécharger plusieurs œuvres dans une même opération.
- `completePageDownload.js` : télécharge toutes les œuvres d’une page et peut les réunir dans une archive.
- `downloadEnhancements.js` : ajoute les formats avancés, la file d’attente et les intégrations Kindle ou Calibre.
- `individualDownloads.js` : ajoute des commandes permettant de télécharger rapidement une seule œuvre.
- `offlineLibrary.js` : stocke des œuvres localement et permet leur consultation hors connexion.
- `_ficDownloader.js` construit aussi le document HTML autonome utilisé pour enregistrer une œuvre.

## Theme Builder — 6 fichiers

- `_themeBuilder.js` : initialise le créateur de thèmes et réapplique le thème actif au chargement.
- `customStyling.js` : fournit l’éditeur de CSS personnalisé et applique les styles de l’utilisateur.
- `themeManagement.js` : crée, importe, exporte, applique et supprime les thèmes.
- `_themeBuilder.js` vérifie aussi la lisibilité et protège les zones sensibles contre certains styles dangereux.
- `typographySystem.js` : gère les polices, tailles, interlignes et préréglages typographiques.
- `visualBuilder.js` : construit l’éditeur visuel de couleurs et de prévisualisation des thèmes.

## Visual Preferences — 14 fichiers

- `_visualPreferences.js` : initialise les préférences visuelles et partage leurs réglages.
- `blurbSectionOrder.js` : réorganise les sections des résumés d’œuvres.
- `_visualPreferences.js` : calcule aussi l’ancienneté des dates et les classe dans des périodes lisibles.
- `datesTimestamps.js` : masque, transforme ou reformate les dates affichées par AO3.
- `gridView.js` : transforme les listes d’œuvres en une grille de cartes.
- `visualPreferences.css` : révèle temporairement au survol les informations cachées.
- `layoutDensity.js` : applique une densité d’interface compacte, confortable ou espacée.
- `minimalHeader.js` : réduit la taille et la complexité visuelle de l’en-tête.
- `statsDisplayFormat.js` : affiche les statistiques sous forme de texte, d’icônes ou d’icônes avec légende.
- `statsOnChaptersList.js` : contrôle l’affichage des statistiques dans la liste des chapitres.
- `statsVisibility.js` : masque séparément les mots, kudos, commentaires, bookmarks et hits.
- `visibilityPresets.js` : applique rapidement des ensembles prédéfinis de préférences visuelles.
- `wordOccurrenceCounter.js` : compte les occurrences d’un mot ou d’un nom dans une œuvre.
- `_visualPreferences.js` : contient aussi les calculs textuels utilisés par le compteur d’occurrences.

# Browse

## Fic Engagement — 3 fichiers

- `_ficEngagement.js` : initialise les indicateurs et centralise les calculs propres au module.
- `engagementMetrics.js` : calcule et affiche les ratios entre hits, kudos, commentaires et bookmarks.
- `hiddenGems.js` : repère les œuvres peu populaires ayant un bon taux d’appréciation.

## Filter Manager — 6 fichiers

- `_filterManager.js` : initialise les outils et centralise leurs calculs internes.
- `filterWarnings.js` : affiche des avertissements lorsque certains filtres risquent de produire des résultats inattendus.
- `languageBadges.js` : affiche la langue des œuvres sous la forme d’un badge visible.
- `presetManagement.js` : sauvegarde, recharge et supprime des ensembles de filtres.
- `userHistoryFilters.js` : ajoute des options de filtrage aux pages de l’historique.
- `worksFilterManager.js` : applique et coordonne les filtres utilisés sur les listes d’œuvres.

## Hide By Tags — 6 fichiers

- `_hideByTags.js` : initialise le masquage automatique selon les tags ou le texte.
- `hiddenTags.js` : cache les œuvres contenant des tags placés dans la liste noire.
- `nopeWords.js` : cherche des mots interdits dans les titres, résumés ou notes d’auteur.
- `_hideByTags.js` : compte aussi les œuvres masquées et gère les masquages temporaires qui doivent expirer.
- `whitelistExceptions.js` : empêche le masquage lorsqu’une œuvre correspond à une exception autorisée.

## Page Controls — 8 fichiers

- `_pageControls.js` : initialise les améliorations de pagination.
- `backToTop.js` : ajoute un bouton permettant de remonter rapidement en haut de la page.
- `coreNavigation.js` : fournit le champ permettant d’atteindre directement un numéro de page.
- `enhancedNavigation.js` : ajoute des boutons comme First, Last, −10 et +10.
- `infiniteScroll.js` : charge automatiquement la page suivante au bas de la liste.
- `_pageControls.js` : calcule aussi les différentes destinations rapides et mémorise la dernière page visitée pour chaque liste.
- `worksPerPage.js` : permet de choisir combien d’œuvres sont affichées par page.

## Skip Works — 3 fichiers

- `_skipWorks.js` : coordonne le masquage manuel des œuvres et l’enregistrement des raisons personnelles.
- `_skipWorks.js` : synchronise aussi la liste des œuvres masquées et extrait les métadonnées nécessaires pour les reconnaître.

## Tags Display — 12 fichiers

- `_tagsDisplay.js` : initialise et coordonne les améliorations liées aux tags.
- `archiveWarningsDisplay.js` : transforme les avertissements d’archive en badges ou icônes.
- `autoHideNoiseTags.js` : masque ou floute automatiquement les tags peu informatifs.
- `compactModeTags.js` : replie les catégories de tags et les révèle au survol ou au défilement.
- `externalTagLinks.js` : ajoute aux tags des liens vers Fanlore ou TV Tropes.
- `_tagsDisplay.js` contient l’interface et les exceptions du filtre anti-bruit; ses règles communes avec `hideByTags` vivent dans `lib/utils/noise-tags.js`.
- `tagHighlighting.js` : applique des couleurs ou styles aux tags choisis par l’utilisateur.
- `tagImportancePromotion.js` : déplace les tags importants ou surlignés en tête de leur catégorie.
- `_tagsDisplay.js` contient aussi les règles de catégorisation, de correspondance et de tri.
- `tagSeparatorStyle.js` : remplace le séparateur visuel utilisé entre les tags.
- `tagsReordering.js` : permet de réordonner les tags et mémorise l’ordre choisi.
- `tagsVisibility.js` : masque les catégories ou tags excédentaires et permet de les révéler.

## Work Length — 3 fichiers

- `_workLength.js` : initialise les indicateurs et centralise les calculs propres au module.
- `lengthDisplay.js` : affiche les badges décrivant la longueur d’une œuvre.
- `readingTime.js` : estime le temps de lecture selon le nombre de mots.

# Explore

## Fic Peek — 2 fichiers

- `ficPeek.js` : récupère et affiche un aperçu d’une œuvre sans quitter la liste.
- `ficPeek.js` : choisit aussi le chapitre, extrait le texte et gère le cache des aperçus.

## POV Tracker — 6 fichiers

- `_povTracker.js` : initialise l’analyse du point de vue narratif et coordonne son affichage.
- `povAnalysis.js` : déduit le point de vue à partir des tags, du résumé et des analyses disponibles.
- `povDetailPanel.js` : affiche les résultats détaillés chapitre par chapitre.
- `_povTracker.js` : analyse et valide aussi les préférences de point de vue de l’utilisateur.
- `povPresentation.js` : construit les badges, filtres et statistiques de point de vue.
- `_povTracker.js` : compte aussi les pronoms et classe le texte selon son point de vue narratif.

## Search Enhancer — 5 fichiers

- `_searchEnhancer.js` : initialise les améliorations et calcule leurs scores de tri.
- `relatedSearches.js` : propose des recherches proches ou complémentaires.
- `resultsSorting.js` : ajoute des méthodes supplémentaires pour trier les résultats.
- `searchAutocomplete.js` : suggère des termes pendant la saisie.
- `seriesGrouping.js` : regroupe visuellement les œuvres appartenant à une même série.

## Similar Fics — 2 fichiers

- `similarFics.js` : cherche et affiche des œuvres ressemblant à celle consultée.
- `similarFics.js` : calcule aussi les scores, plages de longueur et raisons des recommandations.

## Surprise Me — 3 fichiers

- `surpriseMe.js` : filtre et sélectionne aussi les œuvres admissibles, puis mémorise les derniers résultats pour éviter les répétitions.
- `surpriseMe.js` : construit l’interface et choisit une œuvre au hasard.

## Trope Games — 8 fichiers

- `_tropeGames.js` : initialise et coordonne les jeux basés sur les tropes.
- `tropeAchievements.js` : débloque des succès selon les tropes rencontrés.
- `tropeBingoPatterns.js` : construit les grilles de bingo et détecte les lignes complétées.
- `_tropeGames.js` contient aussi les calculs de catégories, défis, tendances, tropes rares, progrès et niveaux de médailles.
- `tropeHoroscope.js` : produit un horoscope ludique à partir des tropes observés.
- `tropeMoodQuiz.js` : recommande un trope et une recherche AO3 selon l’humeur choisie.
- `tropeRoulette.js` : choisit aléatoirement un trope ou un défi.
- `tropeStatistics.js` : compte les tropes rencontrés et produit des statistiques.

# Library

## Activity Panel — 10 fichiers

- `_activityPanel.js` : initialise et coordonne le panneau d’analyse de l’activité.
- `_activityPanel.js` contient aussi les calculs de périodes, tendances, cartes horaires, profils et résumés d’activité.
- `_activityPanel.js` fournit aussi les fonctions et structures partagées par les analyses.
- `_activityPanel.js` collecte et normalise aussi les informations nécessaires aux statistiques.
- `fandomBreakdown.js` : répartit les lectures par fandom.
- `habitsAnalysis.js` : analyse les horaires, longueurs et rythmes de lecture préférés.
- `patternAnalysis.js` : recherche des tendances récurrentes dans les données.
- `readingInsights.js` : transforme les statistiques en observations compréhensibles.
- `_activityPanel.js` calcule aussi les totaux, moyennes et statistiques générales.
- `sessionHistory.js` : enregistre et restitue les séances de lecture.

## Bookmark Vault — 13 fichiers

- `_bookmarkVault.js` : initialise et coordonne les améliorations apportées aux bookmarks.
- `blockedBookmarks.js` : masque les bookmarks publics créés par des utilisateurs bloqués.
- `bookmarkMaintenance.js` : détecte et entretient les bookmarks supprimés, restreints ou invalides.
- `bookmarkNavigation.js` : facilite le retour vers une œuvre et le déplacement entre les bookmarks.
- `bookmarkStatus/readingStatusTracking.js` : enregistre le statut et la progression associés aux bookmarks.
- `bookmarkStatus/statusIndicators.js` : affiche les statuts de lecture sous forme de badges.
- `noteDisplay.js` : affiche les notes personnelles.
- `noteManagement.js` : crée, modifie et supprime les notes personnelles.
- `organizationTools.js` : fournit les catégories, épingles et actions groupées.
- `personalRatings.js` : permet d’attribuer une évaluation personnelle aux œuvres.
- `richTextNotes.js` : ajoute le formatage enrichi aux notes.
- `sortingAndFiltering.js` : trie et filtre les bookmarks selon leurs métadonnées.
- `_bookmarkVault.js` fournit aussi les outils avancés de recherche, exportation, analyse et entretien.

## Fanfic Binge Mode — 2 fichiers

- `_fanficBingeMode.js` : gère une file de lecture continue et l’enchaînement automatique des œuvres ou chapitres.
- `_fanficBingeMode.js` : calcule aussi les priorités et sélectionne les lectures pouvant être reprises.

## Fic Appreciation — 11 fichiers

- `_ficAppreciation.js` : initialise et coordonne les outils d’appréciation des œuvres.
- `_ficAppreciation.js` contient aussi les calculs de statistiques de kudos, notes, habitudes et jalons de lecture.
- `kudosBookmarkFinder.js` : repère les œuvres kudosées qui ne figurent pas dans les bookmarks de l’utilisateur.
- `kudosExtendedFeatures.js` : ajoute des fonctions supplémentaires autour des kudos.
- `_ficAppreciation.js` coordonne aussi les différentes opérations liées aux kudos.
- `kudosTracker.js` : détecte, enregistre, synchronise et affiche les kudos donnés aux œuvres.
- `markAsFinished.js` : permet de marquer une œuvre comme terminée.
- `multiStatusTracker.js` : conserve plusieurs états personnels pour une même œuvre.
- `starRatings.js` : permet d’attribuer et d’afficher une note en étoiles.

## Later Shelf — 7 fichiers

- `_laterShelf.js` : initialise et coordonne l’étagère des œuvres à lire plus tard.
- `laterShelfCounterBadge.js` : affiche dans l’en-tête le nombre d’œuvres placées sur l’étagère.
- `_laterShelf.js` gère aussi les priorités, tris, rappels, exports et estimations de lecture.
- `laterShelfStore.js` : enregistre et récupère les œuvres placées sur l’étagère.
- `markedForLaterStatus.js` : détermine et affiche si une œuvre est déjà marquée.
- `quickMarkForLaterButton.js` : ajoute un bouton pour placer rapidement une œuvre sur l’étagère.
- `workReminder.js` : affiche des rappels concernant les œuvres mises de côté.

## Notification Center — 2 fichiers

- `notificationCenter.js` : collecte, affiche et gère les notifications.
- `notificationCenter.js` : classe aussi les notifications par période.

## Reading Dashboard — 2 fichiers

- `readingDashboard.js` : calcule aussi les statistiques utilisées par le tableau de bord.
- `readingDashboard.js` : construit le tableau de bord récapitulatif de lecture.

## Reading Timeline — 6 fichiers

- `_readingTimeline.js` : initialise et coordonne la ligne du temps.
- `historyAnalytics.js` : analyse l’historique pour en extraire des tendances.
- `_readingTimeline.js` : gère aussi les annotations, les filtres favoris et les statistiques chronologiques.
- `timelineVisualization.js` : transforme les données en représentation chronologique interactive.

# Navigate & Interact

## Comment Kit — 7 fichiers

- `_commentKit.js` : initialise les outils et centralise leur logique commune.
- `commentComposing.js` : ajoute des outils de formatage, modèles et aides à la rédaction.
- `commentConfiguration.js` : applique les réglages généraux des commentaires.
- `commentHighlighting.js` : met en évidence certains commentaires ou auteurs.
- `commentNavigation.js` : facilite le déplacement entre les commentaires.
- `draftManagement.js` : sauvegarde et restaure automatiquement les brouillons.
- `threadManagement.js` : replie, déplie et suit les réponses non lues.

## Fic Actions — 2 fichiers

- `ficActions.js` : ajoute et organise des boutons d’action autour des œuvres.
- `ficActions.js` : fournit aussi les icônes et choisit les emplacements des boutons.

## Keyboard Shortcuts — 2 fichiers

- `keyboardShortcuts.js` : écoute le clavier et déclenche les actions associées.
- `keyboardShortcuts.js` : contient aussi l’analyse, la normalisation et la comparaison des combinaisons de touches.

## Main Navigation — 7 fichiers

- `_mainNavigation.js` : initialise et coordonne les améliorations du menu principal.
- `addNavLinks.js` : ajoute de nouveaux liens aux zones de navigation.
- `backToSearch.js` : mémorise la dernière liste visitée et ajoute un lien pour y retourner.
- `breadcrumbs.js` : affiche un fil d’Ariane construit à partir de l’adresse de la page.
- `menuActivation.js` : contrôle l’ouverture et la fermeture des menus.
- `_mainNavigation.js` : calcule aussi les destinations du retour à la recherche et les segments du fil d’Ariane.
- `quickLinks.js` : ajoute des raccourcis vers les pages fréquemment utilisées.

## Series Helper — 5 fichiers

- `_seriesHelper.js` : initialise et coordonne les outils destinés aux séries.
- `_seriesHelper.js` calcule aussi les mots, temps de lecture, parties indisponibles et prochaine œuvre non lue.
- `seriesOrganization.js` : organise et présente les œuvres d’une série.
- `seriesPage.js` : enrichit les pages de séries avec statistiques, progression et bouton « Next unread ».
- `seriesProgress.js` : suit la progression de lecture dans une série.

## User Relationships — 10 fichiers

- `_userRelationships.js` : initialise les fonctionnalités et centralise leur logique commune.
- `authorBlocking.js` : masque les œuvres publiées par les auteurs bloqués.
- `authorCard.js` : affiche au survol une fiche résumant les informations d’un auteur.
- `authorPreference.js` : conserve les auteurs favoris, notes et priorités.
- `authorTracking.js` : suit l’activité des auteurs choisis.
- `blockingInterface.js` : construit les boutons et dialogues de blocage.
- `_userRelationships.js` comptabilise aussi les contenus masqués par le blocage.
- `blocklistManagement.js` : gère la liste des utilisateurs bloqués.
- `commentHiding.js` : masque les commentaires écrits par des utilisateurs bloqués.
- `_userRelationships.js` centralise aussi les réglages et valeurs par défaut.

# Reading

## Chapter Navigation — 6 fichiers

- `_chapterNavigation.js` : initialise les commandes et centralise leurs calculs internes.
- `autoScroll.js` : fait défiler automatiquement le texte.
- `blurbNavigation.js` : ajoute des commandes de navigation aux résumés.
- `chaptersPanel.js` : affiche une liste consultable des chapitres avec progression, notes et favoris.
- `chapterWordCount.js` : calcule et affiche le nombre de mots du chapitre.
- `navigationControls.js` : construit les boutons de navigation entre les chapitres.

## Collapse Author Notes — 1 fichier

- `collapseAuthorNotes.js` : replie les notes d’auteur et permet de les développer à la demande.

## Instant Footnotes — 1 fichier

- `instantFootnotes.js` : affiche les notes de bas de page sans quitter la position de lecture.

## Reading Formatter — 4 fichiers

- `_readingFormatter.js` : initialise les outils et centralise leurs calculs internes.
- `appearance.js` : applique les couleurs, tailles, largeurs et espacements choisis.
- `content.js` : prépare, nettoie et organise le contenu de l’œuvre.
- `readingControls.js` : construit les commandes de présentation du texte.

## Reading Tracker — 5 fichiers

- `_readingTracker.js` : initialise le suivi et centralise ses calculs internes.
- `readingProgress.js` : enregistre la position de lecture.
- `seenTracking.js` : reconnaît et marque les œuvres déjà rencontrées.
- `viewHistory.js` : conserve l’historique des œuvres et chapitres consultés.
- `visualMarkers.js` : affiche des indicateurs pour les œuvres vues ou partiellement lues.

## Text To Speech — 6 fichiers

- `_textToSpeech.js` : initialise le lecteur vocal et centralise ses calculs internes.
- `contentFiltering.js` : prépare le texte et retire les éléments à ignorer.
- `playbackControls.js` : construit les commandes de lecture, vitesse, volume, voix et minuterie.
- `pronunciationManager.js` : applique les règles de prononciation personnalisées.
- `speechEngine.js` : découpe le texte et contrôle la synthèse vocale du navigateur.
- `visualFeedback.js` : surligne la phrase courante et affiche l’état de lecture.

## Word Swap — 2 fichiers

- `wordSwap.js` : contient aussi les modèles et fonctions de validation des règles de remplacement.
- `wordSwap.js` : remplace dans le texte les mots correspondant aux règles de l’utilisateur.
