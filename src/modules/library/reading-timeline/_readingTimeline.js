/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Reading Timeline Coordinator
    Module ID:    readingTimeline
    Display Name: Reading Timeline
    Tab:          Library

    Submodules (imported directly as ES modules):
        ./historyAnalytics.js      -- load history, stats
        ./timelineVisualization.js -- heatmap grid, search

    Storage keys: depends on readingTracker (ao3h:readingHistory:data)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './readingTimeline.css?inline';

import { HistoryAnalytics } from './historyAnalytics.js';
import { TimelineVisualization } from './timelineVisualization.js';

css(styles, 'ao3h-readingTimeline');

const MOD = 'readingTimeline';

const DEFAULTS = {
  defaultView:   'year',   // 'year' | 'month'
  heatmapColor:  'green',  // 'green' | 'purple' | 'orange' | 'blue'
  calendarRange: 5,        // number of years shown in year selector
};

function cfg (key) {
  try {
    const raw = localStorage.getItem(`ao3h:mod:${MOD}:settings`);
    if (raw) { const saved = JSON.parse(raw); if (saved && key in saved) return saved[key]; }
  } catch { /* */ }
  return DEFAULTS[key];
}

register(MOD, {
  title: 'Reading Timeline',
  enabledByDefault: false,
}, async function init () {
  const analytics = new HistoryAnalytics();
  analytics.loadReadingHistory();

  const path = location.pathname;

  const isListing = /^\/works(?:$|\?)/.test(path) ||
                    /^\/tags\/[^/]+\/works/.test(path) ||
                    /^\/users\/[^/]+\/bookmarks/.test(path) ||
                    /^\/pseuds\/[^/]+\/works$/.test(path);
  if (isListing) {
    analytics.highlightReadWorksOnPage({ highlight: true });
  }

  if (/^\/users\/[^/]+\/readings/.test(path)) {
    analytics.insertSessionDividers();
  }

  const viz = new TimelineVisualization({
    heatmapColor:  cfg('heatmapColor'),
    defaultView:   cfg('defaultView'),
    calendarRange: parseInt(cfg('calendarRange'), 10) || 5,
    analytics,
  });
  viz.injectMenuButton();

  return () => viz.cleanup();
});
