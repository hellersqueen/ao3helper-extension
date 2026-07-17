/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Reading Timeline Coordinator

    Module ID: readingTimeline
    Display Name: Reading Timeline
    Tab: Library

    Purpose

    Coordinates reading-history analysis, listing-page annotations, session
    dividers, and the interactive timeline panel.

    Submodules

    - historyAnalytics.js: history loading, statistics, and page annotations
    - timelineVisualization.js: heatmaps, filters, details, and exports

    Notes

    - Reading history is consumed from Reading Tracker through its API or the
      `ao3h:readingHistory:data` fallback key.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './readingTimeline.css?inline';

import { HistoryAnalytics } from './historyAnalytics.js';
import { TimelineVisualization } from './timelineVisualization.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-readingTimeline');

const MOD = 'readingTimeline';

const DEFAULTS = {
  defaultView:      'year',   // 'year' | 'month'
  heatmapColor:     'green',  // 'green' | 'purple' | 'orange' | 'blue'
  calendarRange:    5,        // number of years shown in year selector
  heatmapIntensity: 'medium', // 'low' | 'medium' | 'high'
  hideReadWorks:    false,    // hide instead of highlight on listing pages
};

const cfg = makeCfg(MOD, DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Feature implementations are delegated to the analytics and visualization classes.

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
    const hide = !!cfg('hideReadWorks');
    analytics.highlightReadWorksOnPage({ highlight: !hide, hide });
  }

  if (/^\/users\/[^/]+\/readings/.test(path)) {
    analytics.insertSessionDividers();
  }

  const viz = new TimelineVisualization({
    heatmapColor:     cfg('heatmapColor'),
    defaultView:      cfg('defaultView'),
    calendarRange:    parseInt(cfg('calendarRange'), 10) || 5,
    heatmapIntensity: cfg('heatmapIntensity'),
    analytics,
  });
  viz.injectMenuButton();

  return () => viz.cleanup();
});
