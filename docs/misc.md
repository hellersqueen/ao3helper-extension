# Inventaire du code et des styles

Ce document décrit les fichiers chargés ou embarqués par AO3 Helper. Il reflète
l'arborescence actuelle de `src/` et `lib/` et sert de carte rapide du projet.

Sont inventoriés ici les **296 fichiers de production** : 6 fichiers de
démarrage et de cœur, 192 fichiers répartis dans 38 modules, et 98 fichiers
partagés dans `lib/`. Les fichiers `*.test.js` (124 au total) et les fichiers
Markdown propres aux modules (38 au total) ne sont pas comptés dans ces totaux :
ils testent ou documentent les fichiers ci-dessous sans faire partie du bundle.

## Démarrage et cœur — 6 fichiers

- `src/main.js` : point d'entrée du userscript; attend que la page soit prête et lance AO3 Helper.
- `src/modules.js` : expose les modules disponibles et leur chargement par catégorie.
- `src/core/coordinator.js` : coordonne l'initialisation globale, le panneau et les changements de page.
- `src/core/lifecycle.js` : démarre, arrête et redémarre proprement les modules.
- `src/core/module-loader.js` : résout puis charge les modules nécessaires à la route courante.
- `src/core/module-registry.js` : catalogue central des modules, catégories et conditions d'activation.

# Modules

Chaque dossier de module contient également un fichier `<module>.md` consacré à
son fonctionnement. Les fichiers CSS cités ci-dessous sont importés avec leur
module.

## Appearance & Tools — 27 fichiers

### Backup and Sync — 5 fichiers

- `_backupAndSync.js` : initialise le module, possède le moteur de sauvegarde et contient les migrations de formats.
- `automateBackup.js` : planifie et déclenche les sauvegardes automatiques.
- `cloudSync.js` : synchronise les données avec le stockage distant configuré.
- `dataTransfer.js` : importe et exporte les données AO3 Helper.
- `backupAndSync.css` : styles des écrans et commandes de sauvegarde.

### Fic Downloader — 7 fichiers

- `_ficDownloader.js` : initialise le téléchargeur et construit les documents hors ligne.
- `batchDownload.js` : orchestre le téléchargement de plusieurs œuvres.
- `completePageDownload.js` : récupère une œuvre complète depuis sa page dédiée.
- `downloadEnhancements.js` : ajoute les options et améliorations aux commandes de téléchargement.
- `individualDownloads.js` : gère le téléchargement d'une œuvre isolée.
- `offlineLibrary.js` : stocke, classe et restitue les œuvres disponibles hors connexion.
- `ficDownloader.css` : styles du téléchargeur et de la bibliothèque hors ligne.

### Theme Builder — 6 fichiers

- `_themeBuilder.js` : initialise le créateur de thèmes et applique ses garde-fous visuels.
- `customStyling.js` : valide et applique le CSS personnalisé.
- `themeManagement.js` : crée, enregistre, charge, duplique et supprime les thèmes.
- `typographySystem.js` : gère polices, tailles, interlignage et espacements.
- `visualBuilder.js` : construit l'éditeur visuel des couleurs et variables du thème.
- `themeBuilder.css` : styles de l'éditeur de thèmes.

### Visual Preferences — 9 fichiers

- `_visualPreferences.js` : initialise le module et centralise ses calculs de dates et d'occurrences.
- `blurbSectionOrder.js` : réordonne les sections des blurbs d'œuvres.
- `gridView.js` : transforme les listes d'œuvres en grille.
- `layoutDensity.js` : applique la densité et les espacements choisis.
- `statsDisplayFormat.js` : adapte le format d'affichage des statistiques.
- `visibilityPresets.js` : applique des ensembles prédéfinis d'éléments visibles.
- `visibilityToggles.js` : contrôle individuellement la visibilité des éléments AO3.
- `wordOccurrenceCounter.js` : compte les occurrences d'un mot ou d'un nom dans une œuvre.
- `visualPreferences.css` : styles partagés des préférences visuelles.

## Browse — 40 fichiers

### Fic Engagement — 4 fichiers

- `_ficEngagement.js` : initialise le module et centralise ses calculs.
- `engagementMetrics.js` : calcule et affiche les ratios de hits, kudos, commentaires et bookmarks.
- `hiddenGems.js` : repère les œuvres peu visibles ayant un bon taux d'appréciation.
- `ficEngagement.css` : styles des métriques et badges d'engagement.

### Filter Manager — 7 fichiers

- `_filterManager.js` : initialise et coordonne les outils de filtrage.
- `filterWarnings.js` : signale les combinaisons de filtres potentiellement trompeuses.
- `languageBadges.js` : rend la langue des œuvres immédiatement visible.
- `presetManagement.js` : enregistre, recharge et supprime les préréglages de filtres.
- `userHistoryFilters.js` : ajoute des filtres aux pages d'historique.
- `worksFilterManager.js` : applique et coordonne les filtres sur les listes d'œuvres.
- `filterManager.css` : styles du gestionnaire de filtres.

### Hide By Tags — 5 fichiers

- `_hideByTags.js` : initialise le module, compte les œuvres masquées et gère les masquages temporaires.
- `hiddenTags.js` : masque les œuvres correspondant aux tags bloqués.
- `nopeWords.js` : cherche les mots exclus dans les métadonnées des œuvres.
- `whitelistExceptions.js` : laisse passer les œuvres correspondant à une exception autorisée.
- `hideByTags.css` : styles des œuvres masquées et de leurs commandes.

### Page Controls — 7 fichiers

- `_pageControls.js` : initialise le module, calcule les destinations et mémorise la pagination.
- `backToTop.js` : ajoute un bouton de retour en haut de page.
- `coreNavigation.js` : fournit la navigation directe vers un numéro de page.
- `enhancedNavigation.js` : ajoute les destinations First, Last, −10 et +10.
- `infiniteScroll.js` : charge la page suivante à l'approche du bas de la liste.
- `worksPerPage.js` : règle le nombre d'œuvres affichées par page.
- `pageControls.css` : styles des contrôles de navigation.

### Skip Works — 2 fichiers

- `skipWorks.js` : masque manuellement des œuvres, conserve les raisons et synchronise la liste.
- `skipWorks.css` : styles des boutons et œuvres ignorées.

### Tags Display — 11 fichiers

- `_tagsDisplay.js` : initialise le module et centralise catégorisation, correspondance et tri.
- `archiveWarningsDisplay.js` : présente les avertissements d'archive sous forme de badges ou d'icônes.
- `autoHideNoiseTags.js` : masque ou atténue automatiquement les tags jugés peu informatifs.
- `compactModeTags.js` : compacte les catégories et révèle leurs tags à la demande.
- `externalTagLinks.js` : ajoute des liens vers des ressources externes aux tags.
- `tagHighlighting.js` : applique les styles de surbrillance configurés.
- `tagImportancePromotion.js` : remonte les tags importants en tête de catégorie.
- `tagSeparatorStyle.js` : remplace le séparateur visuel entre les tags.
- `tagsReordering.js` : réordonne les tags et mémorise l'ordre choisi.
- `tagsVisibility.js` : masque les catégories ou les tags excédentaires.
- `tagsDisplay.css` : styles généraux des tags.

### Work Length — 4 fichiers

- `_workLength.js` : initialise le module et centralise ses seuils et calculs.
- `lengthDisplay.js` : affiche les badges décrivant la longueur d'une œuvre.
- `readingTime.js` : estime la durée de lecture à partir du nombre de mots.
- `workLength.css` : styles des badges de longueur et de durée.

## Explore — 25 fichiers

### Fic Peek — 2 fichiers

- `ficPeek.js` : récupère, met en cache et affiche l'aperçu d'une œuvre sans quitter la liste.
- `ficPeek.css` : styles de la fenêtre d'aperçu.

### POV Tracker — 5 fichiers

- `_povTracker.js` : initialise le suivi et contient l'analyse textuelle et les préférences de point de vue.
- `povAnalysis.js` : déduit le point de vue depuis les tags, le résumé et le texte.
- `povDetailPanel.js` : présente l'analyse détaillée chapitre par chapitre.
- `povPresentation.js` : construit badges, filtres et statistiques de point de vue.
- `povTracker.css` : styles des résultats et du panneau détaillé.

### Search Enhancer — 6 fichiers

- `_searchEnhancer.js` : initialise le module et centralise scores et historique de recherche.
- `relatedSearches.js` : suggère des recherches proches ou complémentaires.
- `resultsSorting.js` : ajoute des méthodes de tri aux résultats.
- `searchAutocomplete.js` : propose des termes pendant la saisie.
- `seriesGrouping.js` : regroupe visuellement les œuvres d'une même série.
- `searchEnhancer.css` : styles des outils de recherche.

### Similar Fics — 2 fichiers

- `similarFics.js` : calcule et présente des recommandations d'œuvres similaires.
- `similarFics.css` : styles des recommandations.

### Surprise Me — 2 fichiers

- `surpriseMe.js` : filtre les candidates, tire une œuvre et évite les répétitions récentes.
- `surpriseMe.css` : styles du bouton et du résultat aléatoire.

### Trope Games — 8 fichiers

- `_tropeGames.js` : initialise les jeux et centralise défis, catégories, progrès et médailles.
- `tropeAchievements.js` : débloque des succès selon les tropes rencontrés.
- `tropeBingoPatterns.js` : construit les grilles et détecte les lignes complétées.
- `tropeHoroscope.js` : produit un horoscope ludique à partir des tropes observés.
- `tropeMoodQuiz.js` : recommande un trope et une recherche selon l'humeur choisie.
- `tropeRoulette.js` : choisit aléatoirement un trope ou un défi.
- `tropeStatistics.js` : agrège les tropes rencontrés et leurs statistiques.
- `tropeGames.css` : styles des jeux et résultats.

## Library — 44 fichiers

### Activity Panel — 7 fichiers

- `_activityPanel.js` : initialise le panneau, collecte les données et calcule ses statistiques.
- `fandomBreakdown.js` : répartit les lectures par fandom.
- `habitsAnalysis.js` : analyse horaires, longueurs et rythmes de lecture.
- `patternAnalysis.js` : recherche les tendances récurrentes.
- `readingInsights.js` : transforme les statistiques en observations lisibles.
- `sessionHistory.js` : enregistre et restitue les séances de lecture.
- `activityPanel.css` : styles du panneau d'activité.

### Bookmark Vault — 13 fichiers

- `_bookmarkVault.js` : initialise le coffre et fournit recherche, export et entretien avancés.
- `blockedBookmarks.js` : masque les bookmarks publics d'utilisateurs bloqués.
- `bookmarkMaintenance.js` : détecte et traite les bookmarks supprimés ou invalides.
- `bookmarkNavigation.js` : facilite le déplacement entre bookmarks et œuvres.
- `bookmarkStatus/readingStatusTracking.js` : enregistre statut et progression de lecture.
- `bookmarkStatus/statusIndicators.js` : affiche les statuts sous forme de badges.
- `noteDisplay.js` : présente les notes personnelles.
- `noteManagement.js` : crée, modifie et supprime les notes.
- `organizationTools.js` : fournit catégories, épingles et actions groupées.
- `personalRatings.js` : enregistre et affiche les évaluations personnelles.
- `richTextNotes.js` : ajoute le formatage enrichi aux notes.
- `sortingAndFiltering.js` : trie et filtre les bookmarks selon leurs métadonnées.
- `bookmarkVault.css` : styles du coffre, des notes et des indicateurs.

### Fanfic Binge Mode — 2 fichiers

- `fanficBingeMode.js` : gère la file de lecture continue et l'enchaînement automatique.
- `fanficBingeMode.css` : styles des commandes du mode binge.

### Fic Appreciation — 8 fichiers

- `_ficAppreciation.js` : initialise le module et centralise opérations et statistiques d'appréciation.
- `kudosBookmarkFinder.js` : trouve les œuvres kudosées absentes des bookmarks.
- `kudosExtendedFeatures.js` : ajoute des fonctions complémentaires autour des kudos.
- `kudosTracker.js` : détecte, enregistre, synchronise et affiche les kudos donnés.
- `markAsFinished.js` : permet de marquer une œuvre comme terminée.
- `multiStatusTracker.js` : conserve plusieurs états personnels pour une œuvre.
- `starRatings.js` : enregistre et affiche une note en étoiles.
- `ficAppreciation.css` : styles des boutons, étoiles et statuts.

### Later Shelf — 6 fichiers

- `_laterShelf.js` : initialise l'étagère et possède son stockage, ses priorités, tris, rappels et exports.
- `laterShelfCounterBadge.js` : affiche dans l'en-tête le nombre d'œuvres mises de côté.
- `markedForLaterStatus.js` : détermine et affiche le statut « à lire plus tard ».
- `quickMarkForLaterButton.js` : ajoute un bouton de mise de côté rapide.
- `workReminder.js` : affiche les rappels associés aux œuvres.
- `laterShelf.css` : styles de l'étagère et de ses commandes.

### Notification Center — 2 fichiers

- `notificationCenter.js` : collecte, classe, affiche et gère les notifications.
- `notificationCenter.css` : styles du centre de notifications.

### Reading Dashboard — 2 fichiers

- `readingDashboard.js` : calcule les statistiques et construit le tableau de bord de lecture.
- `readingDashboard.css` : styles du tableau de bord.

### Reading Timeline — 4 fichiers

- `_readingTimeline.js` : initialise la chronologie et gère annotations, filtres et statistiques.
- `historyAnalytics.js` : extrait les tendances de l'historique de lecture.
- `timelineVisualization.js` : construit la représentation chronologique interactive.
- `readingTimeline.css` : styles de la chronologie.

## Navigate & Interact — 33 fichiers

### Comment Kit — 8 fichiers

- `_commentKit.js` : initialise les outils et centralise leur logique commune.
- `commentComposing.js` : ajoute formatage, modèles et aides à la rédaction.
- `commentConfiguration.js` : applique les préférences générales des commentaires.
- `commentHighlighting.js` : met en évidence des commentaires ou auteurs.
- `commentNavigation.js` : facilite le déplacement entre commentaires.
- `draftManagement.js` : sauvegarde et restaure automatiquement les brouillons.
- `threadManagement.js` : replie, déplie et suit les réponses non lues.
- `commentKit.css` : styles des outils de commentaire.

### Fic Actions — 2 fichiers

- `ficActions.js` : ajoute et organise les boutons d'action autour des œuvres.
- `ficActions.css` : styles des boutons d'action.

### Keyboard Shortcuts — 2 fichiers

- `keyboardShortcuts.js` : normalise les raccourcis et déclenche les actions correspondantes.
- `keyboardShortcuts.css` : styles de l'aide et des indicateurs clavier.

### Main Navigation — 7 fichiers

- `_mainNavigation.js` : initialise et coordonne les améliorations du menu principal.
- `addNavLinks.js` : ajoute de nouveaux liens aux zones de navigation.
- `backToSearch.js` : mémorise la dernière liste et fournit un lien de retour.
- `breadcrumbs.js` : construit un fil d'Ariane depuis la route courante.
- `menuActivation.js` : contrôle l'ouverture et la fermeture des menus.
- `quickLinks.js` : ajoute les raccourcis vers les pages fréquentes.
- `mainNavigation.css` : styles de la navigation enrichie.

### Series Helper — 5 fichiers

- `_seriesHelper.js` : initialise le module et calcule progression, mots et durée de lecture.
- `seriesOrganization.js` : organise et présente les œuvres d'une série.
- `seriesPage.js` : enrichit les pages de série avec statistiques et prochaine œuvre non lue.
- `seriesProgress.js` : suit la progression de lecture dans la série.
- `seriesHelper.css` : styles des informations et commandes de série.

### User Relationships — 9 fichiers

- `_userRelationships.js` : initialise le module et centralise réglages et statistiques de blocage.
- `authorBlocking.js` : masque les œuvres des auteurs bloqués.
- `authorCard.js` : affiche au survol une fiche récapitulative de l'auteur.
- `authorPreference.js` : conserve favoris, notes et priorités d'auteurs.
- `authorTracking.js` : suit l'activité des auteurs choisis.
- `blockingInterface.js` : construit les boutons et dialogues de blocage.
- `blocklistManagement.js` : gère la liste des utilisateurs bloqués.
- `commentHiding.js` : masque les commentaires d'utilisateurs bloqués.
- `userRelationships.css` : styles des fiches, boutons et indicateurs.

## Reading — 28 fichiers

### Chapter Navigation — 7 fichiers

- `_chapterNavigation.js` : initialise les commandes et centralise leurs calculs.
- `autoScroll.js` : fait défiler automatiquement le texte.
- `blurbNavigation.js` : ajoute des commandes de navigation aux blurbs.
- `chaptersPanel.js` : affiche une liste de chapitres avec progression, notes et favoris.
- `chapterWordCount.js` : calcule et affiche le nombre de mots du chapitre.
- `navigationControls.js` : construit les boutons de navigation entre chapitres.
- `chapterNavigation.css` : styles des commandes et du panneau de chapitres.

### Collapse Author Notes — 2 fichiers

- `collapseAuthorNotes.js` : replie les notes d'auteur et les développe à la demande.
- `collapseAuthorNotes.css` : styles des notes repliées.

### Instant Footnotes — 2 fichiers

- `instantFootnotes.js` : affiche les notes de bas de page sans perdre la position de lecture.
- `instantFootnotes.css` : styles des aperçus de notes.

### Reading Formatter — 5 fichiers

- `_readingFormatter.js` : initialise les outils et centralise leurs calculs.
- `appearance.js` : applique couleurs, tailles, largeurs et espacements.
- `content.js` : prépare, nettoie et organise le contenu de l'œuvre.
- `readingControls.js` : construit les commandes de présentation du texte.
- `readingFormatter.css` : styles du mode lecture.

### Reading Tracker — 6 fichiers

- `_readingTracker.js` : initialise le suivi et centralise ses calculs.
- `readingProgress.js` : enregistre la position de lecture.
- `seenTracking.js` : reconnaît et marque les œuvres déjà rencontrées.
- `viewHistory.js` : conserve l'historique des œuvres et chapitres consultés.
- `visualMarkers.js` : affiche les indicateurs de lecture sur les œuvres.
- `readingTracker.css` : styles des marqueurs et états de progression.

### Text To Speech — 4 fichiers

- `_textToSpeech.js` : prépare le contenu, pilote le moteur vocal et construit les commandes principales.
- `pronunciationManager.js` : applique les règles de prononciation personnalisées.
- `visualFeedback.js` : surligne le passage courant et affiche l'état de lecture.
- `textToSpeech.css` : styles du lecteur vocal.

### Word Swap — 2 fichiers

- `wordSwap.js` : valide les règles et remplace les mots correspondants dans le texte.
- `wordSwap.css` : styles de l'éditeur de règles et des remplacements.

# Bibliothèque partagée — 98 fichiers

## `lib/ao3` — 10 fichiers

- `actions.js` : actions AO3 réutilisables par plusieurs modules.
- `constants.js` : constantes propres au site et à ses conventions.
- `integration.js` : pont entre AO3, le runtime du userscript et les modules.
- `parsers.js` : parse les identifiants et métadonnées depuis le DOM ou les URL.
- `requests.js` : enveloppe les requêtes HTTP vers AO3.
- `routes.js` : reconnaît et décrit les routes AO3.
- `search-filters.js` : lit et manipule les paramètres de recherche et de filtre.
- `selectors.js` : sélecteurs DOM AO3 partagés.
- `work-page.js` : helpers spécifiques aux pages d'œuvre et de chapitre.
- `work-stats.js` : extrait et normalise les statistiques d'une œuvre.

## `lib/storage` — 7 fichiers

- `cache.js` : cache persistant avec invalidation et expiration.
- `index.js` : façade publique des utilitaires de stockage.
- `keys.js` : clés canoniques et conventions de nommage.
- `mirrored-list.js` : maintient une liste synchronisée entre stockages.
- `module-settings.js` : lit, fusionne et enregistre les réglages des modules.
- `persistence.js` : primitives de persistance locale et userscript.
- `user.js` : stockage et identification des données propres à l'utilisateur AO3.

## `lib/styles` — 5 fichiers

- `ao3h-style-base.css` : base visuelle et règles communes AO3 Helper.
- `ao3h-variables.css` : variables CSS partagées et valeurs par défaut.
- `components.css` : styles des composants d'interface génériques.
- `menu.css` : styles du menu AO3 Helper.
- `panel.css` : styles du panneau de réglages.

## `lib/themes` — 3 fichiers

- `builtinThemes.js` : définitions des thèmes livrés avec l'extension.
- `engine/themeUtils.js` : validation, normalisation et application des thèmes.
- `themeTemplates.js` : modèles utilisés pour créer de nouveaux thèmes.

## `lib/ui` — 57 fichiers

### Composants génériques — 8 fichiers

- `badges.js` : fabrique les badges réutilisables.
- `bulk-select.js` : gère sélection multiple et actions groupées.
- `components.js` : composants et helpers DOM communs.
- `dialog.js` : ouvre les boîtes de dialogue accessibles.
- `drag-reorder.js` : fournit le réordonnancement par glisser-déposer.
- `list-manager.js` : construit les éditeurs de listes configurables.
- `toast.js` : affiche les notifications temporaires.
- `menu/menu-grouper.js` : regroupe les entrées du menu par catégorie.

### Menu — 1 fichier

- `menu/menu.js` : construit le menu principal et branche ses interactions.

### Infrastructure du panneau — 9 fichiers

- `panel/lazy-panel.js` : charge le panneau seulement lorsqu'il est demandé.
- `panel/panel-entry.js` : point d'entrée du panneau de réglages.
- `panel/panel-index.js` : assemble les exports et dépendances du panneau.
- `panel/panel-tab-content.js` : rend le contenu d'un onglet.
- `panel/panel-tab-system.js` : gère sélection, navigation et cycle de vie des onglets.
- `panel/panel-ui.js` : construit la structure visuelle du panneau.
- `panel/tab-registry.js` : registre les catégories et onglets disponibles.
- `panel/welcome-guide.js` : affiche le guide de première utilisation.
- `panel/configs/index.js` : agrège toutes les configurations de modules.

### Configurations Appearance & Tools — 5 fichiers

- `panel/configs/appearance-tools/backupAndSync-backups.js` : construit l'interface de gestion des sauvegardes.
- `panel/configs/appearance-tools/backupAndSync-config.js` : décrit les réglages de Backup and Sync.
- `panel/configs/appearance-tools/ficDownloader-config.js` : décrit les réglages de Fic Downloader.
- `panel/configs/appearance-tools/themeBuilder-config.js` : décrit les réglages de Theme Builder.
- `panel/configs/appearance-tools/visualPreferences-config.js` : décrit les réglages de Visual Preferences.

### Configurations Browse — 7 fichiers

- `panel/configs/browse/ficEngagement-config.js` : réglages de Fic Engagement.
- `panel/configs/browse/filterManager-config.js` : réglages de Filter Manager.
- `panel/configs/browse/hideByTags-config.js` : réglages de Hide By Tags.
- `panel/configs/browse/pageControls-config.js` : réglages de Page Controls.
- `panel/configs/browse/skipWorks-config.js` : réglages de Skip Works.
- `panel/configs/browse/tagsDisplay-config.js` : réglages de Tags Display.
- `panel/configs/browse/workLength-config.js` : réglages de Work Length.

### Configurations Explore — 6 fichiers

- `panel/configs/explore/ficPeek-config.js` : réglages de Fic Peek.
- `panel/configs/explore/povTracker-config.js` : réglages de POV Tracker.
- `panel/configs/explore/searchEnhancer-config.js` : réglages de Search Enhancer.
- `panel/configs/explore/similarFics-config.js` : réglages de Similar Fics.
- `panel/configs/explore/surpriseMe-config.js` : réglages de Surprise Me.
- `panel/configs/explore/tropeGames-config.js` : réglages de Trope Games.

### Configurations Library — 8 fichiers

- `panel/configs/library/activityPanel-config.js` : réglages d'Activity Panel.
- `panel/configs/library/bookmarkVault-config.js` : réglages de Bookmark Vault.
- `panel/configs/library/fanficBingeMode-config.js` : réglages de Fanfic Binge Mode.
- `panel/configs/library/ficAppreciation-config.js` : réglages de Fic Appreciation.
- `panel/configs/library/laterShelf-config.js` : réglages de Later Shelf.
- `panel/configs/library/notificationCenter-config.js` : réglages de Notification Center.
- `panel/configs/library/readingDashboard-config.js` : réglages de Reading Dashboard.
- `panel/configs/library/readingTimeline-config.js` : réglages de Reading Timeline.

### Configurations Navigate & Interact — 6 fichiers

- `panel/configs/navigate-interact/commentKit-config.js` : réglages de Comment Kit.
- `panel/configs/navigate-interact/ficActions-config.js` : réglages de Fic Actions.
- `panel/configs/navigate-interact/keyboardShortcuts-config.js` : réglages de Keyboard Shortcuts.
- `panel/configs/navigate-interact/mainNavigation-config.js` : réglages de Main Navigation.
- `panel/configs/navigate-interact/seriesHelper-config.js` : réglages de Series Helper.
- `panel/configs/navigate-interact/userRelationships-config.js` : réglages de User Relationships.

### Configurations Reading — 7 fichiers

- `panel/configs/reading/chapterNavigation-config.js` : réglages de Chapter Navigation.
- `panel/configs/reading/collapseAuthorNotes-config.js` : réglages de Collapse Author Notes.
- `panel/configs/reading/instantFootnotes-config.js` : réglages d'Instant Footnotes.
- `panel/configs/reading/readingFormatter-config.js` : réglages de Reading Formatter.
- `panel/configs/reading/readingTracker-config.js` : réglages de Reading Tracker.
- `panel/configs/reading/textToSpeech-config.js` : réglages de Text To Speech.
- `panel/configs/reading/wordSwap-config.js` : réglages de Word Swap.

## `lib/utils` — 16 fichiers

- `config.js` : fusionne, valide et expose la configuration générale.
- `dom.js` : helpers de sélection, création et observation du DOM.
- `error.js` : normalise les erreurs et leurs messages.
- `event-bus.js` : bus d'événements interne découplé.
- `event-names.js` : noms canoniques des événements AO3 Helper.
- `format-date.js` : formate dates, âges et horodatages.
- `globals.js` : accès contrôlé aux globales du userscript et du navigateur.
- `index.js` : façade publique des utilitaires partagés.
- `json-file.js` : sérialise, valide et télécharge les fichiers JSON.
- `logger.js` : journalisation uniforme par niveau et par module.
- `module-factory.js` : fabrique la structure standard des modules.
- `noise-tags.js` : règles communes de détection des tags peu informatifs.
- `notifications.js` : primitives partagées de notification.
- `runtime-bundles.js` : charge et met en cache les ressources embarquées au runtime.
- `status-tracker-base.js` : base réutilisable pour les suivis de statut d'œuvre.
- `user-detector.js` : détecte l'utilisateur AO3 connecté et les changements de session.

# Vérification de l'inventaire

Les totaux de ce document correspondent aux fichiers `src/**/*.js`,
`src/**/*.css`, `lib/**/*.js` et `lib/**/*.css`, après exclusion de
`*.test.js`. Toute création, suppression ou consolidation d'un fichier de
production doit entraîner la mise à jour de son entrée et du total concerné.

Les tests restent placés à côté du code qu'ils couvrent. Les documentations de
module restent placées dans `src/modules/<catégorie>/<module>/<module>.md`.




J'ai vérifié les règles officielles de GreasyFork (pas de mémoire — lues directement) et testé une taille réelle. Deux règles bloquent l'architecture actuelle, dans les deux sens :

1. Interdiction de charger le gros du code depuis ailleurs. Règle exacte : « A script posted on Greasy Fork that simply loads the bulk of the script from somewhere else is not allowed. » Ça exclut directement la version « légère » qu'on vient de publier sur GitHub (ao3-helper.user.js qui va chercher .modules.js/.panel.js via GM_xmlhttpRequest). Il faudrait la version autonome (tout inclus, comme ao3-helper-tampermonkey.user.js).

2. Interdiction de minifier, avec une limite de 2 Mo sur le code source. Règle exacte : « Code posted to Greasy Fork must not be obfuscated or minified... Scripts are limited to a size of 2 MB. Scripts may not be minified to fit under this limit. » J'ai testé une build non minifiée de la version autonome pour avoir un vrai chiffre plutôt que deviner : 2,29 Mo — au-dessus de la limite d'environ 290 Ko (~14 %).

Donc concrètement : aucun des deux fichiers déjà produits ne passe tel quel. Deux façons réalistes d'avancer :

Réduire la taille en dessous de 2 Mo — voir ce qui peut être allégé (CSS inline, code mort, etc.) pour repasser sous la limite en gardant tout dans un seul fichier autonome non minifié. Pas garanti que ça suffise à 14% d'écart.
Utiliser le mécanisme officiel de GreasyFork pour scinder le script — leurs règles autorisent @require d'une « Library » GreasyFork, et une Library peut elle-même se synchroniser depuis un dépôt GitHub (donc réutiliser hellersqueen/ao3helper). Ça permettrait de rester sous 2 Mo par fichier, mais c'est un changement plus lourd : @require charge tout d'un coup au démarrage (pas à la demande comme maintenant), donc ça change le comportement de chargement, pas juste la taille.
Aucune des deux n'est un simple interrupteur à basculer — c'est un vrai chantier, plus gros que ce qu'on vient de faire pour GitHub.

Indépendamment de ce choix, le processus de soumission lui-même est le même :

Créer un compte sur greasyfork.org.
« Post a script » → coller le code (ou importer depuis une URL) + description, tags, lien vers le dépôt source.
Une première soumission passe par une revue manuelle (les permissions sensibles comme unsafeWindow/GM_xmlhttpRequest attirent plus d'attention) — ça peut prendre quelques jours.
Pour les mises à jour futures : soit tu republies manuellement sur GreasyFork à chaque version, soit tu configures un « sync » depuis une URL externe (ton @downloadURL GitHub) que GreasyFork revérifie périodiquement — dans ce cas npm run publish:github resterait la seule commande à relancer.
Veux-tu que je regarde en premier si on peut passer sous 2 Mo sans changer le comportement (option 1), avant d'envisager le découpage via Library ?