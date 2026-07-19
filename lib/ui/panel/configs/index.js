/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIGS - Index

   Central registry for all module panel configurations.
   Import this file to get access to all module configs.

   Usage:
     import { getConfig } from './configs/index.js';
     const html = getConfig('hideByTags');
═══════════════════════════════════════════════════════════════════════════ */

// ── Default ───────────────────────────────────────────────────────────────
const _default = {
  moduleId: '_default',
  config: `
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Status</label>
                    <div class="ao3h-setting-control">
                        <span style="color: #4caf50;">✓ Module configuration available</span>
                    </div>
                </div>
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`,
};

// ── Browse ────────────────────────────────────────────────────────────────
import * as ficEngagement  from './browse/ficEngagement-config.js';
import * as filterManager  from './browse/filterManager-config.js';
import * as hideByTags     from './browse/hideByTags-config.js';
import * as pageControls   from './browse/pageControls-config.js';
import * as skipWorks      from './browse/skipWorks-config.js';
import * as tagsDisplay    from './browse/tagsDisplay-config.js';
import * as workLength     from './browse/workLength-config.js';

// ── Reading ───────────────────────────────────────────────────────────────
import * as chapterNavigation  from './reading/chapterNavigation-config.js';
import * as collapseAuthorNotes from './reading/collapseAuthorNotes-config.js';
import * as instantFootnotes   from './reading/instantFootnotes-config.js';
import * as readingFormatter   from './reading/readingFormatter-config.js';
import * as readingTracker     from './reading/readingTracker-config.js';
import * as textToSpeech       from './reading/textToSpeech-config.js';
import * as wordSwap           from './reading/wordSwap-config.js';

// ── Navigate & Interact ───────────────────────────────────────────────────
import * as commentKit        from './navigate-interact/commentKit-config.js';
import * as ficActions        from './navigate-interact/ficActions-config.js';
import * as keyboardShortcuts from './navigate-interact/keyboardShortcuts-config.js';
import * as mainNavigation    from './navigate-interact/mainNavigation-config.js';
import * as seriesHelper      from './navigate-interact/seriesHelper-config.js';
import * as userRelationships from './navigate-interact/userRelationships-config.js';

// ── Explore ───────────────────────────────────────────────────────────────
import * as ficPeek        from './explore/ficPeek-config.js';
import * as povTracker     from './explore/povTracker-config.js';
import * as searchEnhancer from './explore/searchEnhancer-config.js';
import * as similarFics    from './explore/similarFics-config.js';
import * as surpriseMe     from './explore/surpriseMe-config.js';
import * as tropeGames     from './explore/tropeGames-config.js';

// ── Library ───────────────────────────────────────────────────────────────
import * as activityPanel     from './library/activityPanel-config.js';
import * as bookmarkVault     from './library/bookmarkVault-config.js';
import * as fanficBingeMode   from './library/fanficBingeMode-config.js';
import * as ficAppreciation   from './library/ficAppreciation-config.js';
import * as laterShelf        from './library/laterShelf-config.js';
import * as notificationCenter from './library/notificationCenter-config.js';
import * as readingDashboard  from './library/readingDashboard-config.js';
import * as readingTimeline   from './library/readingTimeline-config.js';

// ── Appearance & Tools ────────────────────────────────────────────────────
import * as backupAndSync    from './appearance-tools/backupAndSync-config.js';
import * as ficDownloader    from './appearance-tools/ficDownloader-config.js';
import * as themeBuilder     from './appearance-tools/themeBuilder-config.js';
import * as visualPreferences from './appearance-tools/visualPreferences-config.js';

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
if (typeof backupAndSync.wireConfigArea === 'function') _initializers[backupAndSync.moduleId] = backupAndSync.wireConfigArea;
if (typeof ficDownloader.wireConfigArea === 'function') _initializers[ficDownloader.moduleId] = ficDownloader.wireConfigArea;
if (typeof bookmarkVault.wireConfigArea === 'function') _initializers[bookmarkVault.moduleId] = bookmarkVault.wireConfigArea;
if (typeof surpriseMe.wireConfigArea === 'function') _initializers[surpriseMe.moduleId] = surpriseMe.wireConfigArea;
if (typeof keyboardShortcuts.wireConfigArea === 'function') _initializers[keyboardShortcuts.moduleId] = keyboardShortcuts.wireConfigArea;
if (typeof mainNavigation.wireConfigArea === 'function') _initializers[mainNavigation.moduleId] = mainNavigation.wireConfigArea;
if (typeof searchEnhancer.wireConfigArea === 'function') _initializers[searchEnhancer.moduleId] = searchEnhancer.wireConfigArea;
if (typeof readingTracker.wireConfigArea === 'function') _initializers[readingTracker.moduleId] = readingTracker.wireConfigArea;
if (typeof laterShelf.wireConfigArea === 'function') _initializers[laterShelf.moduleId] = laterShelf.wireConfigArea;

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
