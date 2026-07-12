/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel Module Coordinator
    Module ID: activityPanel
    Display Name: Activity Panel
    Tab: Library

    Submodules:
        dataCollection   — aggregates stats from all storage buckets (ES export, imported by readingInsights)
        readingStats     — pure helpers: calculateStreak, calculateAchievements (ES export, imported by readingInsights)
        fandomBreakdown  — ranked fandom table on dashboard
        habitsAnalysis   — hour-of-day histogram on dashboard
        patternAnalysis  — seasonal/length/shift pattern widget on dashboard
        readingInsights  — stat cards + streak + achievements on profile/dashboard
        sessionHistory   — records work-page sessions to activityPanel:sessions

    Storage keys (owned by submodules):
        ao3h:activityPanel:sessions     -- owned by sessionHistory    [{ workId, startedAt, ... }], max 500
        ao3h:activityPanel:preferences  -- owned by readingInsights   { widgetOrder, hiddenWidgets, timePeriod }

    Public API: exported (store, cfg, NS) for direct import by readingInsights ; also
    exposed as W.AO3H_ActivityPanel while enabled, for parity with the legacy bridge.

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

css(styles, 'ao3h-activityPanel');

const W   = getGlobalWindow();
const MOD = 'activityPanel';

export { NS, cfg, store } from './activityPanelShared.js';

// ── Coordinator registration ──────────────────────────────────────────────
register(MOD, {
  title: 'Activity Panel',
  enabledByDefault: false,
}, async function init () {
  W.AO3H_ActivityPanel = { store, cfg, NS };
  return function cleanup () {
    delete W.AO3H_ActivityPanel;
  };
});
