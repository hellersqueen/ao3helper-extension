/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Activity Panel Coordinator

    Module ID: activityPanel
    Display Name: Activity Panel
    Tab: Library

    Purpose

    Coordinates reading-session collection and the analytical widgets shown on
    AO3 dashboard and profile pages.

    Submodules

    - dataCollection.js and readingStats.js: shared aggregation helpers
    - fandomBreakdown.js: ranked fandom totals
    - habitsAnalysis.js: reading-time distribution
    - patternAnalysis.js: seasonal and behavioral patterns
    - readingInsights.js: overview cards, streaks, and achievements
    - sessionHistory.js: work-page session recording

    Notes

    - Shared storage, configuration, and namespace helpers are ES exports.
    - The same helpers are exposed through AO3H_ActivityPanel while active.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { NS, cfg, store } from './activityPanelShared.js';
import './fandomBreakdown.js';
import './habitsAnalysis.js';
import './patternAnalysis.js';
import './readingInsights.js';
import './sessionHistory.js';
import styles from './activityPanel.css?inline';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-activityPanel');

const W   = getGlobalWindow();
const MOD = 'activityPanel';

export { NS, cfg, store } from './activityPanelShared.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Shared helpers are available through both ES imports and the runtime bridge.


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Activity Panel',
  enabledByDefault: false,
}, async function init () {
  W.AO3H_ActivityPanel = { store, cfg, NS };
  return function cleanup () {
    delete W.AO3H_ActivityPanel;
  };
});
