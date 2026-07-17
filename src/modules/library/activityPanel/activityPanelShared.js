/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Shared Helpers

Provides the Activity Panel namespace, configuration accessor, and JSON local-
storage adapter used by the coordinator and analytical submodules.

Notes

- Configuration participates in the global Activity Panel settings.
- Storage failures are intentionally treated as unavailable data.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { makeCfg } from '../../../../lib/storage/module-settings.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'activityPanel';

export const NS = 'ao3h';

const DEFAULTS = {
  showTagCloud: true,
  readingAchievements: true,
};

export const cfg = makeCfg(MOD, DEFAULTS, { globalConfig: true });


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SHARED JSON STORAGE
═══════════════════════════════════════════════════════════════════════════ */

export const store = {
  get (key) {
    try { const value = localStorage.getItem('ao3h:' + key); return value ? JSON.parse(value) : null; } catch { return null; }
  },
  set (key, value) {
    try { localStorage.setItem('ao3h:' + key, JSON.stringify(value)); } catch { /* unavailable */ }
  },
};


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// Stateless exports require no explicit initialization or cleanup.
