/* ═══════════════════════════════════════════════════════════════════════════
  MODULE REGISTRY - Static module definitions (39 modules)
   
   ⚠️  Keep in sync with lib/ui/tab-registry.js (the single source of truth).
   
   This file pre-registers all modules so they appear in the settings panel
   even if their actual implementation files aren't loaded yet.
═══════════════════════════════════════════════════════════════════════════ */

// src/core/module-registry.js — ES Module version
// Original: core/module-registry.js (legacy IIFE — old build system removed in Phase 27, file no longer on disk)
// Étape 312 : dépendances importées (globals, logger, lifecycle) au lieu des lectures
// window.AO3H_Globals / window.AO3H_Logger / window.AO3H ; différé supprimé.
// NB : ce fichier n'est importé par personne dans le graphe Vite (les 38 modules
// s'auto-enregistrent) — constaté à l'étape 312 ; sort du bundle avec la Phase 27.

import { getGlobalWindow } from '../../lib/utils/globals.js';
import { getLogger } from '../../lib/utils/logger.js';
import { Modules } from './lifecycle.js';

const W = getGlobalWindow();
const log = getLogger('module-registry');

// ═══════════════════════════════════════════════════════════════════
// MODULE DEFINITIONS - 38 Final Modules (6 tabs)
// Format: [id, title, group, enabledByDefault]
// Exported so other ES module files can import the list directly.
// ═══════════════════════════════════════════════════════════════════
export const MODULE_DEFINITIONS = [
    // ─── FALLBACK (keep in sync with lib/ui/tab-registry.js) ─────────
    // � Browse
    ['hideByTags',            'Hide By Tags',            'browse',      true],
    ['filterManager',         'Filter Manager',          'browse',      false],
    ['skipWorks',             'Skip Works',              'browse',      true],
    ['pageControls',          'Page Controls',           'browse',      false],
    ['ficEngagement',         'Fic Engagement',          'browse',      false],
    ['workLength',            'Work Length',             'browse',      false],
    ['tagsDisplay',           'Tags Display',            'browse',      false],
    // 🔎 Explore
    ['ficPeek',               'Fic Peek',                'explore',     false],
    ['similarFics',           'Similar Fics',            'explore',     false],
    ['surpriseMe',            'Surprise Me',             'explore',     false],
    ['tropeGames',            'Trope Games',             'explore',     false],
    ['searchEnhancer',        'Search Enhancer',         'explore',     false],
    ['povTracker',            'POV Tracker',             'explore',     false],
    // 📖 Reading
    ['chapterNavigation',     'Chapter Navigation',      'reading',     false],
    ['readingTracker',        'Reading Tracker',         'reading',     false],
    ['textToSpeech',          'Text To Speech',          'reading',     false],
    ['instantFootnotes',      'Instant Footnotes',       'reading',     false],
    ['readingFormatter',      'Reading Formatter',       'reading',     false],
    ['collapseAuthorNotes',   'Collapse Author Notes',   'reading',     false],
    ['wordSwap',              'Word Swap',               'reading',     false],
    // 📚 Library
    ['bookmarkVault',         'Bookmark Vault',          'library',     false],
    ['laterShelf',            'Later Shelf',             'library',     false],
    ['ficAppreciation',       'Fic Appreciation',        'library',     false],
    ['readingDashboard',      'Reading Dashboard',       'library',     false],
    ['activityPanel',         'Activity Panel',          'library',     false],
    ['readingTimeline',       'Reading Timeline',        'library',     false],
    ['notificationCenter',    'Notification Center',     'library',     false],
    ['fanficBingeMode',       'Fanfic Binge Mode',       'library',     false],
    // 🧭 Navigate & Interact
    ['mainNavigation',        'Main Navigation',         'navigate',    false],
    ['keyboardShortcuts',     'Keyboard Shortcuts',      'navigate',    false],
    ['userRelationships',     'User Relationships',      'navigate',    false],
    ['seriesHelper',          'Series Helper',           'navigate',    true],
    ['commentKit',            'Comment Kit',             'navigate',    false],
    ['ficActions',            'Fic Actions',             'navigate',    false],
    // 🎨 Appearance & Tools
    ['visualPreferences',     'Visual Preferences',      'appearance',  true],
    ['themeBuilder',          'Theme Builder',           'appearance',  false],
    ['backupAndSync',         'Backup & Sync',           'appearance',  false],
    ['ficDownloader',         'Fic Downloader',          'appearance',  false],
  ];
// Group labels for display (6 tabs). Not imported anywhere — used internally only.
const GROUP_LABELS = {
  'browse':     '🔍 Browse',
  'explore':    '🔎 Explore',
  'reading':    '📖 Reading',
  'library':    '📚 Library',
  'navigate':   '🧭 Navigate & Interact',
  'appearance': '🎨 Appearance & Tools',
};

// Registration — Modules importé de lifecycle.js, plus de différé (étape 312)
function initRegistry() {
  const modules = Modules;

  // Prefer tab-registry.js if already loaded (legacy bundle compatibility —
  // lecture window conservée jusqu'à l'étape 316)
  const _tabDefs = W.AO3H_Common?.TabRegistry?.ALL_MODULES;
  const moduleDefs = _tabDefs
    ? _tabDefs.map(m => [m.id, m.title, m.tab, false])
    : MODULE_DEFINITIONS;

  if (_tabDefs) {
    log.info(`Using tab-registry.js (${moduleDefs.length} modules)`);
  } else {
    log.warn('tab-registry.js not found, using inline fallback');
  }


  W.AO3H.__batchRegistering = true;
  try {
    moduleDefs.forEach(([id, title, group, enabledByDefault], index) => {
      const existing = modules.all?.().find(m => m.name === id);
      if (!existing) {
        modules.register(id, {
          title,
          group,
          enabledByDefault,
          order: index + 1,
          description: `${title} module`
        }, () => {
          log.debug(`Module stub: ${id} (#${index + 1})`);
          return () => {};
        });
      }
    });
  } finally {
    W.AO3H.__batchRegistering = false;
  }
  W.AO3H.menu?.rebuild?.();

  log.info(`Module registry initialized: ${moduleDefs.length} modules`);
}

initRegistry();
