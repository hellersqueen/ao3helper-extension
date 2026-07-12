/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIGS - Index

   Central registry for all module panel configurations.
   Import this file to get access to all module configs.

   Usage:
     import { getConfig } from './configs/index.js';
     const html = getConfig('hideByTags');
═══════════════════════════════════════════════════════════════════════════ */

// ── Default ───────────────────────────────────────────────────────────────
import * as _default from './_default-config.js';

// ── Browse ────────────────────────────────────────────────────────────────
import * as ficEngagement  from './Browse-configs/ficEngagement-config.js';
import * as filterManager  from './Browse-configs/filterManager-config.js';
import * as hideByTags     from './Browse-configs/hideByTags-config.js';
import * as pageControls   from './Browse-configs/pageControls-config.js';
import * as skipWorks      from './Browse-configs/skipWorks-config.js';
import * as tagsDisplay    from './Browse-configs/tagsDisplay-config.js';
import * as workLength     from './Browse-configs/workLength-config.js';

// ── Reading ───────────────────────────────────────────────────────────────
import * as chapterNavigation  from './Reading-configs/chapterNavigation-config.js';
import * as collapseAuthorNotes from './Reading-configs/collapseAuthorNotes-config.js';
import * as instantFootnotes   from './Reading-configs/instantFootnotes-config.js';
import * as readingFormatter   from './Reading-configs/readingFormatter-config.js';
import * as readingTracker     from './Reading-configs/readingTracker-config.js';
import * as textToSpeech       from './Reading-configs/textToSpeech-config.js';
import * as wordSwap           from './Reading-configs/wordSwap-config.js';

// ── Navigate & Interact ───────────────────────────────────────────────────
import * as commentKit        from './Navigate & Interact-configs/commentKit-config.js';
import * as ficActions        from './Navigate & Interact-configs/ficActions-config.js';
import * as keyboardShortcuts from './Navigate & Interact-configs/keyboardShortcuts-config.js';
import * as mainNavigation    from './Navigate & Interact-configs/mainNavigation-config.js';
import * as seriesHelper      from './Navigate & Interact-configs/seriesHelper-config.js';
import * as userRelationships from './Navigate & Interact-configs/userRelationships-config.js';

// ── Explore ───────────────────────────────────────────────────────────────
import * as ficPeek        from './Explore-configs/ficPeek-config.js';
import * as povTracker     from './Explore-configs/povTracker-config.js';
import * as searchEnhancer from './Explore-configs/searchEnhancer-config.js';
import * as similarFics    from './Explore-configs/similarFics-config.js';
import * as surpriseMe     from './Explore-configs/surpriseMe-config.js';
import * as tropeGames     from './Explore-configs/tropeGames-config.js';

// ── Library ───────────────────────────────────────────────────────────────
import * as activityPanel     from './Library-configs/activityPanel-config.js';
import * as bookmarkVault     from './Library-configs/bookmarkVault-config.js';
import * as fanficBingeMode   from './Library-configs/fanficBingeMode-config.js';
import * as ficAppreciation   from './Library-configs/ficAppreciation-config.js';
import * as laterShelf        from './Library-configs/laterShelf-config.js';
import * as notificationCenter from './Library-configs/notificationCenter-config.js';
import * as readingDashboard  from './Library-configs/readingDashboard-config.js';
import * as readingTimeline   from './Library-configs/readingTimeline-config.js';

// ── Appearance & Tools ────────────────────────────────────────────────────
import * as backupAndSync    from './Appearance & Tools-configs/backupAndSync-config.js';
import * as ficDownloader    from './Appearance & Tools-configs/ficDownloader-config.js';
import * as themeBuilder     from './Appearance & Tools-configs/themeBuilder-config.js';
import * as visualPreferences from './Appearance & Tools-configs/visualPreferences-config.js';

// ── Central registry ──────────────────────────────────────────────────────
export const PanelConfigs = {
  // Default
  [_default.moduleId]:           _default.config,

  // Browse
  [ficEngagement.moduleId]:      ficEngagement.config,
  [filterManager.moduleId]:      filterManager.config,
  [hideByTags.moduleId]:         hideByTags.config,
  [pageControls.moduleId]:       pageControls.config,
  [skipWorks.moduleId]:          skipWorks.config,
  [tagsDisplay.moduleId]:        tagsDisplay.config,
  [workLength.moduleId]:         workLength.config,

  // Reading
  [chapterNavigation.moduleId]:  chapterNavigation.config,
  [collapseAuthorNotes.moduleId]: collapseAuthorNotes.config,
  [instantFootnotes.moduleId]:   instantFootnotes.config,
  [readingFormatter.moduleId]:   readingFormatter.config,
  [readingTracker.moduleId]:     readingTracker.config,
  [textToSpeech.moduleId]:       textToSpeech.config,
  [wordSwap.moduleId]:           wordSwap.config,

  // Navigate & Interact
  [commentKit.moduleId]:         commentKit.config,
  [ficActions.moduleId]:         ficActions.config,
  [keyboardShortcuts.moduleId]:  keyboardShortcuts.config,
  [mainNavigation.moduleId]:     mainNavigation.config,
  [seriesHelper.moduleId]:       seriesHelper.config,
  [userRelationships.moduleId]:  userRelationships.config,

  // Explore
  [ficPeek.moduleId]:            ficPeek.config,
  [povTracker.moduleId]:         povTracker.config,
  [searchEnhancer.moduleId]:     searchEnhancer.config,
  [similarFics.moduleId]:        similarFics.config,
  [surpriseMe.moduleId]:         surpriseMe.config,
  [tropeGames.moduleId]:         tropeGames.config,

  // Library
  [activityPanel.moduleId]:      activityPanel.config,
  [bookmarkVault.moduleId]:      bookmarkVault.config,
  [fanficBingeMode.moduleId]:    fanficBingeMode.config,
  [ficAppreciation.moduleId]:    ficAppreciation.config,
  [laterShelf.moduleId]:         laterShelf.config,
  [notificationCenter.moduleId]: notificationCenter.config,
  [readingDashboard.moduleId]:   readingDashboard.config,
  [readingTimeline.moduleId]:    readingTimeline.config,

  // Appearance & Tools
  [backupAndSync.moduleId]:      backupAndSync.config,
  [ficDownloader.moduleId]:      ficDownloader.config,
  [themeBuilder.moduleId]:       themeBuilder.config,
  [visualPreferences.moduleId]:  visualPreferences.config,
};

// ── Utility functions ──────────────────────────────────────────────────────

/**
 * Get the configuration HTML for a module.
 * Falls back to default if no custom config exists.
 * @param {string} moduleId - The module identifier
 * @returns {string} HTML string for the module config area
 */
export function getConfig(moduleId) {
  return PanelConfigs[moduleId] || PanelConfigs._default;
}

/**
 * Check if a module has a custom config.
 * @param {string} moduleId - The module identifier
 * @returns {boolean}
 */
export function hasCustomConfig(moduleId) {
  return moduleId in PanelConfigs &&
         moduleId !== '_default' &&
         typeof PanelConfigs[moduleId] === 'string';
}

/**
 * List all modules with custom configs.
 * @returns {string[]}
 */
export function listCustomConfigs() {
  return Object.keys(PanelConfigs).filter(key =>
    key !== '_default' &&
    typeof PanelConfigs[key] === 'string'
  );
}

// ── Initializer registry ──────────────────────────────────────────────────
// Étape 316 : les configs complexes n'appellent plus registerInitializer via
// window.AO3H_PanelConfigs — elles exportent wireConfigArea, référencé ici.
const _initializers = {};
if (typeof filterManager.wireConfigArea === 'function') _initializers[filterManager.moduleId] = filterManager.wireConfigArea;
if (typeof hideByTags.wireConfigArea === 'function') _initializers[hideByTags.moduleId] = hideByTags.wireConfigArea;

/**
 * Register a wiring function to be called when a module config area is opened.
 * @param {string} moduleId
 * @param {function} fn - wireConfigArea(container)
 */
export function registerInitializer(moduleId, fn) {
  _initializers[moduleId] = fn;
}

/**
 * Run the registered initializer for a module on a given config area container.
 * @param {string} moduleId
 * @param {Element} container
 */
export function runInitializer(moduleId, container) {
  const fn = _initializers[moduleId];
  if (typeof fn === 'function') fn(container);
}

// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — les consommateurs
// (panel-tab-system, page preview) importent PanelConfigs/getConfig/runInitializer
// directement. Le bundler legacy (supprimé en Phase 27) réinjectait la pose via son shim `invoke`.

console.log('[AO3H][panel-configs] Panel configs index loaded - ' + listCustomConfigs().length + ' modules registered');
