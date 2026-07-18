/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — POV Tracker Coordinator

    Module ID: povTracker
    Display Name: POV Tracker
    Tab: Explore

    Purpose

    Coordinates cached point-of-view analysis with badges, filters, and listing
    presentation controls.

    Submodules

    - povAnalysis.js: pronoun heuristics and analysis cache
    - povPresentation.js: badge injection, filtering, and statistics

    Notes

    - The initialized analysis instance is exposed through AO3H_PovTracker.
    - User settings and analysis results use separate storage keys.
    - Cleanup destroys presentation before analysis and removes the shared API.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './povTracker.css?inline';

import { PovAnalysis } from './povAnalysis.js';
import { PovPresentation } from './povPresentation.js';
import { PovDetailPanel } from './povDetailPanel.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-povTracker');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'povTracker';
const LOG  = `[AO3H][${MOD}]`;

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
  analyzeFullText    : true,
  showDetailPanel    : true,
  autoApplyPreferredFilter : false,
  preferredPovs      : '',
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Analysis and presentation communicate through the shared API created below.


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'POV Tracker',
  enabledByDefault : false,
}, async function init () {
  console.log(`${LOG} init`);

  const analysis     = new PovAnalysis();
  const presentation = new PovPresentation({ cfg, NS });
  const detailPanel  = new PovDetailPanel({ cfg });

  analysis.init();

  // Expose shared API after analysis is initialised (cache loaded + pruned)
  W.AO3H_PovTracker = { cfg, NS, LOG, _analysis: analysis };

  presentation.init();
  detailPanel.init();

  return function cleanup () {
    detailPanel.destroy();
    presentation.destroy();
    analysis.destroy();
    delete W.AO3H_PovTracker;
  };
});
