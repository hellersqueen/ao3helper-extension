/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker Module Coordinator
    Module ID: povTracker
    Display Name: POV Tracker
    Tab: Explore

    Submodules (imported directly as ES modules):
        PovAnalysis (povAnalysis.js)         -- pronoun heuristics + cache
        PovPresentation (povPresentation.js) -- badge injection + filter controls

    Coordinator role:
        - Registers as 'povTracker'
        - Defines shared DEFAULTS + cfg()
        - Exposes W.AO3H_PovTracker API for helper files
        - Instantiates Analysis and Presentation helpers
        - Returns cleanup that cascades to both instances

    Storage keys:
        ao3h:mod:povTracker:settings  -- user settings (JSON)
        ao3h_pov_tracker_data_v1      -- analysis cache { [workId]: { pov, confidence, lastUpdated } }

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './povTracker.css?inline';

import { PovAnalysis } from './povAnalysis.js';
import { PovPresentation } from './povPresentation.js';

css(styles, 'ao3h-povTracker');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'povTracker';
const LOG  = `[AO3H][${MOD}]`;

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  showBadgesOnBlurbs : true,
  badgeFirst         : true,
  badgeSecond        : false,
  badgeThird         : true,
  badgeMixed         : false,
  badgeMulti         : false,
  badgeUnknown       : false,
  enablePovFilters   : true,
  autoAnalyze        : true,
  showStats          : false,
};

// ── Storage helpers ───────────────────────────────────────────────────────
const SK_SETTINGS = `ao3h:mod:${MOD}:settings`;

function lsGet (key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}

function cfg (key) {
  const saved = lsGet(SK_SETTINGS) || {};
  return key in saved ? saved[key] : DEFAULTS[key];
}

// ── Module registration ───────────────────────────────────────────────────
register(MOD, {
  title            : 'POV Tracker',
  enabledByDefault : false,
}, async function init () {
  console.log(`${LOG} init`);

  const analysis     = new PovAnalysis();
  const presentation = new PovPresentation({ cfg, NS });

  analysis.init();

  // Expose shared API after analysis is initialised (cache loaded + pruned)
  W.AO3H_PovTracker = { cfg, NS, LOG, _analysis: analysis };

  presentation.init();

  return function cleanup () {
    presentation.destroy();
    analysis.destroy();
    delete W.AO3H_PovTracker;
  };
});
