// src/test-module.js — entrée Vite temporaire pour tester UN SEUL module à la fois.
// Usage : dans vite.config.js, remplace entry: 'src/main.js' par entry: 'src/test-module.js',
// puis npm run build. Remets 'src/main.js' une fois le test terminé.

import '../lib/utils/config.js';
import { init } from './core/coordinator.js';

// Sans cet import, Modules.bootAll() n'est jamais appelé et le module ci-dessous
// reste enregistré mais jamais démarré (voir le commentaire de l'Étape 225 dans main.js).
import './core/module-loader.js';

// Menu + panneau de réglages (menu.js importe déjà panel-index.js, qui charge
// les configs de TOUS les modules — nécessaire pour que le panneau puisse
// afficher les réglages du module testé).
import { initMenu } from '../lib/ui/menu/menu.js';
import { initMenuGrouper } from '../lib/ui/menu/menu-grouper.js';
import { css } from '../lib/utils/index.js';

import cssVariables from '../lib/styles/ao3h-variables.css?inline';
import cssBase from '../lib/styles/ao3h-style-base.css?inline';
import cssDialog from '../lib/styles/dialog.css?inline';
import cssIconButton from '../lib/styles/icon-button.css?inline';
import cssCollapseChevron from '../lib/styles/collapse-chevron.css?inline';
import cssToggleSwitch from '../lib/styles/toggle-switch.css?inline';
import cssMenu from '../lib/styles/menu.css?inline';
import cssPanel from '../lib/styles/panel.css?inline';

css(cssVariables, 'ao3h-variables');
css(cssBase, 'ao3h-style-base');
css(cssDialog, 'ao3h-dialog');
css(cssIconButton, 'ao3h-icon-button');
css(cssCollapseChevron, 'ao3h-collapse-chevron');
css(cssToggleSwitch, 'ao3h-toggle-switch');
css(cssMenu, 'ao3h-menu');
css(cssPanel, 'ao3h-panel');

// Décommente UNE seule ligne ci-dessous — chaque fichier importe déjà ses propres
// sous-modules, pas besoin d'importer les enfants séparément.

// ── Browse ──────────────────────────────────────────────────────────────
// import './modules/browse/ficEngagement/_ficEngagement.js';
// import './modules/browse/filterManager/_filterManager.js';
// import './modules/browse/hideByTags/_hideByTags.js';
// import './modules/browse/pageControls/_pageControls.js';
import './modules/browse/skipWorks/skipWorks.js';
// import './modules/browse/tagsDisplay/_tagsDisplay.js';
// import './modules/browse/workLength/_workLength.js';

// ── Explore ──────────────────────────────────────────────────────────────
// import './modules/explore/ficPeek/ficPeek.js';
// import './modules/explore/povTracker/_povTracker.js';
// import './modules/explore/searchEnhancer/_searchEnhancer.js';
// import './modules/explore/similarFics/similarFics.js';
// import './modules/explore/surpriseMe/surpriseMe.js';
// import './modules/explore/tropeGames/_tropeGames.js';

// ── Library ──────────────────────────────────────────────────────────────
// import './modules/library/activityPanel/_activityPanel.js';
// import './modules/library/bookmarkVault/_bookmarkVault.js';
// import './modules/library/fanficBingeMode/_fanficBingeMode.js';
// import './modules/library/ficAppreciation/_ficAppreciation.js';
// import './modules/library/laterShelf/_laterShelf.js';
// import './modules/library/notificationCenter/notificationCenter.js';
// import './modules/library/readingDashboard/readingDashboard.js';
// import './modules/library/readingTimeline/_readingTimeline.js';

// ── Navigate ─────────────────────────────────────────────────────────────
// import './modules/navigate/commentKit/_commentKit.js';
// import './modules/navigate/ficActions/ficActions.js';
// import './modules/navigate/keyboardShortcuts/keyboardShortcuts.js';
// import './modules/navigate/mainNavigation/_mainNavigation.js';
// import './modules/navigate/seriesHelper/_seriesHelper.js';
// import './modules/navigate/userRelationships/_userRelationships.js';

// ── Reading ──────────────────────────────────────────────────────────────
// import './modules/reading/chapterNavigation/_chapterNavigation.js';
// import './modules/reading/collapseAuthorNotes/collapseAuthorNotes.js';
// import './modules/reading/instantFootnotes/instantFootnotes.js';
// import './modules/reading/readingFormatter/_readingFormatter.js';
// import './modules/reading/readingTracker/_readingTracker.js';
// import './modules/reading/textToSpeech/_textToSpeech.js';
// import './modules/reading/wordSwap/wordSwap.js';

init();
initMenu();
initMenuGrouper();
