/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Engagement Coordinator

    Module ID: ficEngagement
    Display Name: Fic Engagement
    Tab: Browse

    Purpose
        Adds engagement metrics and hidden-gem indicators to work blurbs and
        supported work pages.

    Submodules
        engagementMetrics.js — Calculates and displays engagement ratios.
        hiddenGems.js        — Identifies underexposed, well-received works.

    Notes
        Metrics can be colour-coded through module settings. Dynamic listing
        content is rescanned through a managed observer.

═══════════════════════════════════════════════════════════════════════════ */



/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css, observe, onReady } from '../../../../lib/utils/index.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import styles from './ficEngagement.css?inline';

import { EngagementMetrics } from './engagementMetrics.js';
import { HiddenGems } from './hiddenGems.js';



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-ficEngagement');

const MOD  = 'ficEngagement';

const DEFAULTS = {
  colorCodeMetrics: false,
  hideLowEngagement: false,
  gemMinRatio: 5,       // percent
  gemMaxKudos: 100,
  gemMaxBookmarks: 10,
  gemMinHits: 50,
  gemCompareToPageAverage: false,
};

function loadSettings() { return loadModuleSettings(MOD); }


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{ comments?: number, kudos?: number }} [stats]
 */
export function commentRate ({ comments, kudos } = {}) {
  return (comments != null && kudos) ? (comments / kudos) * 100 : null;
}

export function classifyLevel (value, { high, mid }) {
  if (value == null) return null;
  if (value >= high) return 'high';
  if (value >= mid) return 'mid';
  return 'low';
}

export const DEFAULT_GEM_THRESHOLDS = {
  minRatio: 0.05,
  maxKudos: 100,
  maxBookmarks: 10,
  minHits: 50,
  minKudos: 5,
};

export function isGem (stats, thresholds = DEFAULT_GEM_THRESHOLDS) {
  if (!stats) return false;
  const { kudos, hits, bookmarks } = stats;
  if (!kudos || !hits) return false;
  if (hits < thresholds.minHits || kudos < thresholds.minKudos) return false;
  const ratio = kudos / hits;
  const lowPopularity = kudos <= thresholds.maxKudos ||
    (bookmarks != null && bookmarks <= thresholds.maxBookmarks);
  return ratio >= thresholds.minRatio && lowPopularity;
}

export function gemMedal (stats, thresholds = DEFAULT_GEM_THRESHOLDS) {
  if (!isGem(stats, thresholds)) return null;
  const ratio = stats.kudos / stats.hits;
  if (ratio >= thresholds.minRatio * 3) return 'diamond';
  if (ratio >= thresholds.minRatio * 2) return 'gold';
  return 'silver';
}

export function averageRatio (statsList) {
  const ratios = (statsList || [])
    .filter(stats => stats && stats.kudos && stats.hits)
    .map(stats => stats.kudos / stats.hits);
  if (!ratios.length) return null;
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

export function isGemRelativeToPageAverage (
  stats,
  pageAverageRatio,
  multiplier,
  thresholds = DEFAULT_GEM_THRESHOLDS
) {
  if (!stats || pageAverageRatio == null) return false;
  const { kudos, hits, bookmarks } = stats;
  if (!kudos || !hits) return false;
  if (hits < thresholds.minHits || kudos < thresholds.minKudos) return false;
  const ratio = kudos / hits;
  const lowPopularity = kudos <= thresholds.maxKudos ||
    (bookmarks != null && bookmarks <= thresholds.maxBookmarks);
  return ratio >= pageAverageRatio * multiplier && lowPopularity;
}

export const ficEngagementHelpers = {
  commentRate,
  classifyLevel,
  DEFAULT_GEM_THRESHOLDS,
  isGem,
  gemMedal,
  averageRatio,
  isGemRelativeToPageAverage,
};



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Both coordinated features are initialized during the module lifecycle.



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Fic Engagement',
  enabledByDefault: false,
}, async function init() {

  const saved = loadSettings();
  function cfg(key) { return saved[key] ?? DEFAULTS[key]; }

  /* ── Submodules ───────────────────────────────────────────────────── */
  const metrics = new EngagementMetrics({
    colorCode: cfg('colorCodeMetrics'),
    hideLowEngagement: cfg('hideLowEngagement'),
    helpers: ficEngagementHelpers,
  });
  const hiddenGems = new HiddenGems({
    thresholds: {
      minRatio: (parseFloat(cfg('gemMinRatio')) || 5) / 100,
      maxKudos: parseInt(cfg('gemMaxKudos'), 10) || 100,
      maxBookmarks: parseInt(cfg('gemMaxBookmarks'), 10) || 10,
      minHits: parseInt(cfg('gemMinHits'), 10) || 50,
    },
    compareToPageAverage: cfg('gemCompareToPageAverage'),
    helpers: ficEngagementHelpers,
  });

  // document.querySelector('#main')/document.body peuvent ne pas encore
  // exister quand ce module boote — sans ce report, l'observer plantait
  // (Cannot read properties of null), constaté sur plusieurs modules
  // similaires en test.
  let active = true;
  let mo = null;
  onReady(() => {
    if (!active) return;
    hiddenGems.init();

    metrics.scan();
    metrics.processWorkPage();
    mo = observe(document.querySelector('#main') || document.body, {
      childList: true, subtree: true,
    }, () => metrics.scan());
  });

  /* ── Cleanup ──────────────────────────────────────────────────────── */
  return () => {
    active = false;
    mo?.disconnect();
    metrics.cleanup();
    hiddenGems.cleanup();
  };
});
