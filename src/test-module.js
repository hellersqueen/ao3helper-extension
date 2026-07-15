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
// import './modules/explore/fic-peek/ficPeek.js';
// import './modules/explore/pov-tracker/_povTracker.js';
// import './modules/explore/search-enhancer/_searchEnhancer.js';
// import './modules/explore/similar-fics/similarFics.js';
// import './modules/explore/surprise-me/surpriseMe.js';
// import './modules/explore/trope-games/_tropeGames.js';

// ── Library ──────────────────────────────────────────────────────────────
// import './modules/library/activity-panel/_activityPanel.js';
// import './modules/library/bookmark-vault/_bookmarkVault.js';
// import './modules/library/fanfic-binge-mode/_fanficBingeMode.js';
// import './modules/library/fic-appreciation/_ficAppreciation.js';
// import './modules/library/later-shelf/_laterShelf.js';
// import './modules/library/notification-center/notificationCenter.js';
// import './modules/library/reading-dashboard/readingDashboard.js';
// import './modules/library/reading-timeline/_readingTimeline.js';

// ── Navigate ─────────────────────────────────────────────────────────────
// import './modules/navigate/comment-kit/_commentKit.js';
// import './modules/navigate/fic-actions/ficActions.js';
// import './modules/navigate/keyboard-shortcuts/keyboardShortcuts.js';
// import './modules/navigate/main-navigation/_mainNavigation.js';
// import './modules/navigate/series-helper/_seriesHelper.js';
// import './modules/navigate/user-relationships/_userRelationships.js';

// ── Reading ──────────────────────────────────────────────────────────────
// import './modules/reading/chapter-navigation/_chapterNavigation.js';
// import './modules/reading/collapse-author-notes/collapseAuthorNotes.js';
// import './modules/reading/instant-footnotes/instantFootnotes.js';
// import './modules/reading/reading-formatter/_readingFormatter.js';
// import './modules/reading/reading-tracker/_readingTracker.js';
// import './modules/reading/text-to-speech/_textToSpeech.js';
// import './modules/reading/word-swap/wordSwap.js';

init();
initMenu();
initMenuGrouper();
