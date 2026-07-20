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
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { isListingPage } from '../../../../lib/ao3/parsers.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './readingTimeline.css?inline';

import { HistoryAnalytics } from './historyAnalytics.js';
import { TimelineVisualization } from './timelineVisualization.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000];
const INTENSITY_THRESHOLDS = {
  low: [2, 4, 8],
  medium: [1, 2, 4],
  high: [1, 1, 2],
};

export function computeMilestones (heatmapData) {
  const dates = Object.keys(heatmapData || {}).sort();
  const milestones = {};
  let cumulative = 0;
  let nextIndex = 0;
  dates.forEach(dateKey => {
    const count = (heatmapData[dateKey] || []).length;
    for (let index = 0; index < count; index++) {
      cumulative++;
      if (nextIndex < MILESTONE_THRESHOLDS.length &&
          cumulative === MILESTONE_THRESHOLDS[nextIndex]) {
        const label = `🏁 ${cumulative}th work read!`;
        milestones[dateKey] = milestones[dateKey]
          ? `${milestones[dateKey]} · ${label}`
          : label;
        nextIndex++;
      }
    }
  });
  return milestones;
}

export function getHeatmapLevel (count, intensity = 'medium') {
  if (!count) return 0;
  const [first, second, third] = INTENSITY_THRESHOLDS[intensity] || INTENSITY_THRESHOLDS.medium;
  if (count <= first) return 1;
  if (count <= second) return 2;
  if (count <= third) return 3;
  return 4;
}

export function timeOfDayBucket (date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

const FILTER_PRESETS_KEY = 'ao3h:readingTimeline:filterPresets';
const MAX_PRESETS = 20;

export function loadPresets () {
  const presets = lsGet(FILTER_PRESETS_KEY, []);
  return Array.isArray(presets) ? presets : [];
}

function savePresets (presets) {
  lsSet(FILTER_PRESETS_KEY, presets);
}

export function savePreset (name, criteria) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return;
  const presets = loadPresets().filter(preset => preset.name !== trimmed);
  presets.push({ name: trimmed, criteria });
  if (presets.length > MAX_PRESETS) presets.shift();
  savePresets(presets);
}

export function getPreset (name) {
  return loadPresets().find(preset => preset.name === name) || null;
}

export function deletePreset (name) {
  savePresets(loadPresets().filter(preset => preset.name !== name));
}

const DATE_ANNOTATIONS_KEY = 'ao3h:readingTimeline:annotations';
const MAX_ANNOTATION_LENGTH = 140;

export function loadAnnotations () {
  const annotations = lsGet(DATE_ANNOTATIONS_KEY, {});
  return annotations && typeof annotations === 'object' && !Array.isArray(annotations)
    ? annotations
    : {};
}

function saveAnnotations (annotations) {
  lsSet(DATE_ANNOTATIONS_KEY, annotations);
}

export function getAnnotation (dateKey) {
  return loadAnnotations()[dateKey] || '';
}

export function setAnnotation (dateKey, text) {
  if (!dateKey) return;
  const annotations = loadAnnotations();
  const trimmed = String(text || '').trim().slice(0, MAX_ANNOTATION_LENGTH);
  if (trimmed) annotations[dateKey] = trimmed;
  else delete annotations[dateKey];
  saveAnnotations(annotations);
}

export function clearAnnotation (dateKey) {
  setAnnotation(dateKey, '');
}

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
  const analytics = new HistoryAnalytics({ timeOfDayBucket });
  analytics.loadReadingHistory();

  const path = location.pathname;

  if (isListingPage(path)) {
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
    helpers: {
      computeMilestones,
      getHeatmapLevel,
      getAnnotation,
      setAnnotation,
      loadPresets,
      savePreset,
      getPreset,
      deletePreset,
    },
  });
  viz.injectMenuButton();

  return () => viz.cleanup();
});
