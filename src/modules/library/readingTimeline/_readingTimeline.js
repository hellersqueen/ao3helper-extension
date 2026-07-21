/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Reading Timeline Coordinator

    Module ID: readingTimeline
    Display Name: Reading Timeline
    Tab: Library

    Purpose

    Coordinates reading-history analysis, listing-page annotations, session
    dividers, and the interactive timeline panel.

    Submodules

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
import { extractWorkIdFromHref, isListingPage } from '../../../../lib/ao3/parsers.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import styles from './readingTimeline.css?inline';

import { TimelineVisualization } from './timelineVisualization.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000];
const W = getGlobalWindow();
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

class HistoryAnalytics {
  constructor () {
    this.heatmapData = {};
    this._originalBackgrounds = new Map();
    this._originalDisplays = new Map();
  }

  getDateKey (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadReadingHistory () {
    let history = W.AO3H_ReadingTracker?.getHistory?.() || [];
    if (!history.length) history = lsGet('ao3h:readingHistory:data', []) || [];

    this.heatmapData = {};
    history.forEach(entry => {
      const date = new Date(entry.timestamp || entry.readDate);
      if (isNaN(date.getTime())) return;
      const dateKey = this.getDateKey(date);
      if (!this.heatmapData[dateKey]) this.heatmapData[dateKey] = [];
      this.heatmapData[dateKey].push({
        workId: entry.workId,
        title: entry.title || 'Untitled',
        author: entry.author || 'Anonymous',
        fandom: entry.fandom || 'Unknown',
        rating: entry.rating || 'Not Rated',
        wordCount: entry.wordCount || 0,
        chaptersRead: entry.chaptersRead || 1,
        completed: entry.completed || false,
        tags: entry.tags || [],
      });
    });
    return this.heatmapData;
  }

  getStats () {
    let totalReads = 0;
    let busiestDay = null;
    let busiestCount = 0;
    const fandomCounts = {};
    const dateCounts = {};

    Object.entries(this.heatmapData).forEach(([date, works]) => {
      totalReads += works.length;
      dateCounts[date] = works.length;
      if (works.length > busiestCount) {
        busiestCount = works.length;
        busiestDay = date;
      }
      works.forEach(work => {
        fandomCounts[work.fandom] = (fandomCounts[work.fandom] || 0) + 1;
      });
    });

    const topFandoms = Object.entries(fandomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    let streak = 0;
    const current = new Date();
    while (true) {
      const key = this.getDateKey(current);
      if (!dateCounts[key]) break;
      streak++;
      current.setDate(current.getDate() - 1);
    }

    return { totalReads, busiestDay, busiestCount, topFandoms, streak };
  }

  buildWorkLookup () {
    const lookup = {};
    Object.entries(this.heatmapData).forEach(([dateKey, works]) => {
      works.forEach(work => {
        const id = String(work.workId);
        if (!lookup[id]) lookup[id] = { dates: [], count: 0 };
        lookup[id].dates.push(dateKey);
        lookup[id].count++;
      });
    });
    return lookup;
  }

  _recencyColor (lastDateKey) {
    const days = (Date.now() - new Date(lastDateKey).getTime()) / 86_400_000;
    if (days <= 1) return 'rgba(64,196,99,0.18)';
    if (days <= 7) return 'rgba(64,196,99,0.12)';
    if (days <= 30) return 'rgba(44,95,138,0.10)';
    if (days <= 365) return 'rgba(44,95,138,0.07)';
    return 'rgba(0,0,0,0.04)';
  }

  highlightReadWorksOnPage ({ highlight = true, hide = false } = {}) {
    if (!highlight && !hide) return;
    const lookup = this.buildWorkLookup();

    document.querySelectorAll('li.work.blurb').forEach(blurb => {
      const link = blurb.querySelector('h4.heading a[href^="/works/"]');
      if (!link) return;
      const workId = extractWorkIdFromHref(link.getAttribute('href')) || '';
      if (!workId || !lookup[workId]) return;

      const info = lookup[workId];
      const lastDate = info.dates.slice().sort().at(-1);
      if (hide) {
        if (!this._originalDisplays.has(blurb)) this._originalDisplays.set(blurb, blurb.style.display);
        blurb.style.display = 'none';
        blurb.dataset.ao3hReadingTimelineHidden = '1';
        return;
      }

      if (!this._originalBackgrounds.has(blurb)) {
        this._originalBackgrounds.set(blurb, blurb.style.backgroundColor);
      }
      blurb.classList.add('ao3h-rt-read-blurb');
      blurb.style.backgroundColor = this._recencyColor(lastDate);

      if (!blurb.querySelector('.ao3h-read-badge')) {
        const badge = document.createElement('span');
        badge.className = 'ao3h-read-badge';
        badge.title = info.count > 1 ? `Read ${info.count}× — last read ${lastDate}` : `Read on ${lastDate}`;
        badge.textContent = info.count > 1 ? `📚 Read ${info.count}×` : '📚 Read';
        link.insertAdjacentElement('afterend', badge);
      }
    });
  }

  cleanupDom () {
    document.querySelectorAll('.ao3h-read-badge').forEach(element => element.remove());
    this._originalBackgrounds.forEach((background, blurb) => {
      blurb.classList.remove('ao3h-rt-read-blurb');
      blurb.style.backgroundColor = background;
    });
    this._originalBackgrounds.clear();

    this._originalDisplays.forEach((display, blurb) => {
      blurb.style.display = display;
      delete blurb.dataset.ao3hReadingTimelineHidden;
    });
    this._originalDisplays.clear();
    document.querySelectorAll('.ao3h-session-divider, .ao3h-session-subdivider')
      .forEach(element => element.remove());
  }

  insertSessionDividers () {
    const items = Array.from(
      document.querySelectorAll('#main ol.reading.work li.reading.work, ol.index.group li.work.blurb')
    );
    if (!items.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const getLabel = date => {
      if (date >= today) return 'Today';
      if (date >= yesterday) return 'Yesterday';
      if (date >= lastWeek) return 'Last 7 Days';
      if (date >= lastMonth) return 'Last Month';
      return 'Earlier';
    };

    let lastLabel = null;
    let lastCalendarDay = null;
    let lastTimeBucket = null;
    items.forEach(item => {
      const dateElement = item.querySelector('[datetime]') || item.querySelector('p.datetime');
      const rawDate = dateElement?.getAttribute('datetime') || dateElement?.textContent?.trim();
      const fullDate = rawDate ? new Date(rawDate) : null;
      if (!fullDate || isNaN(fullDate.getTime())) return;

      const dayOnly = new Date(fullDate);
      dayOnly.setHours(0, 0, 0, 0);
      const label = getLabel(dayOnly);
      const calendarDay = this.getDateKey(dayOnly);
      if (label !== lastLabel) {
        lastLabel = label;
        const divider = document.createElement('li');
        divider.className = 'ao3h-session-divider';
        divider.setAttribute('aria-hidden', 'true');
        divider.textContent = label;
        item.parentElement.insertBefore(divider, item);
      }

      const bucket = timeOfDayBucket(fullDate);
      if (calendarDay === lastCalendarDay && bucket !== lastTimeBucket) {
        const subDivider = document.createElement('li');
        subDivider.className = 'ao3h-session-subdivider';
        subDivider.setAttribute('aria-hidden', 'true');
        subDivider.textContent = bucket;
        item.parentElement.insertBefore(subDivider, item);
      }
      lastCalendarDay = calendarDay;
      lastTimeBucket = bucket;
    });
  }

  exportJSON () {
    downloadJSON(this.heatmapData, `ao3-timeline-${new Date().toISOString().split('T')[0]}.json`);
  }
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
  const analytics = new HistoryAnalytics();
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
