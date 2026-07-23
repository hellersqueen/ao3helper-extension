/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Filter Manager Coordinator

    Module ID: filterManager
    Display Name: Filter Manager
    Tab: Browse

    Purpose
        Coordinates filter presets, language badges, archive-warning alerts,
        history-based hiding, quick filters, and shared tag bundles.

    Submodules
        presetManagement.js   — Saves, applies, previews, and transfers presets.
        languageBadges.js     — Displays and activates language filters.
        filterWarnings.js     — Warns about excluded archive warnings.
        userHistoryFilters.js — Hides works using user interaction history.
        worksFilterManager.js — Applies language, one-shot, and crossover filters.

    Notes
        The public preset and bundle API remains available off listing pages.
        Dynamic work blurbs are reprocessed through a managed observer.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Storage } from '../../../../lib/storage/index.js';
import { css, observe } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './filterManager.css?inline';

import { PresetManagement } from './presetManagement.js';
import { LanguageBadges } from './languageBadges.js';
import { FilterWarnings } from './filterWarnings.js';
import { UserHistoryFilters } from './userHistoryFilters.js';
import { WorksFilterManager } from './worksFilterManager.js';
import { getLogger } from '../../../../lib/utils/logger.js';
const log = getLogger('filterManager');



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-filterManager');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'filterManager';

// ── Storage keys ──────────────────────────────────────────────────────────
const KEY_PRESETS = 'filterManager:presets';
const KEY_BUNDLES = 'filterManager:bundles';
const KEY_LAST    = 'filterManager:lastPreset';
const KEY_HISTORY = 'filterManager:searchHistory';
const KEY_USAGE   = 'filterManager:presetUsage';

// ── Route helpers ─────────────────────────────────────────────────────────
const _path   = location.pathname;
const _params = new URLSearchParams(location.search);

function isListingPage () {
  return /^\/works$/.test(_path) ||
         /^\/tags\/[^/]+\/works/.test(_path) ||
         /^\/users\/[^/]+\/(bookmarks|works|readings|pseuds\/[^/]+\/works)/.test(_path) ||
         /^\/collections\/[^/]+\/works/.test(_path);
}

function detectCurrentFandom () {
  const m = _path.match(/^\/tags\/([^/]+)\/works/);
  if (m) return decodeURIComponent(m[1]);
  const t = _params.get('tag_id');
  return t ? decodeURIComponent(t) : null;
}

// ── Config helpers ────────────────────────────────────────────────────────
const DEFAULTS = {
  // Presets
  starredPresetsFirst         : true,
  presetHoverPreview          : true,
  rememberLastPresetByFandom  : true,
  showExpandPreset            : true,
  // Language badges
  showLanguageBadge           : false,
  clickBadgeToFilter          : true,
  // Archive warnings
  warnExcludedWarning         : true,
  excludeWarningRemoveButton  : true,
  // Tag bundles
  tagBundlesEnabled           : false,
  useBuiltinTropeBundles      : true,
  // Quick filters
  quickFilterOneshot          : true,
  quickFilterCrossover        : true,
  quickFilterLowTags          : false,
  lowTagThreshold             : 3,
  quickFilterAnonymous        : false,
  quickFilterSummary          : false,
  minSummaryLength            : 0,
  quickFilterRatio            : false,
  minKudosRatio               : 2,
  quickFilterDate             : false,
  quickFilterAbandoned        : false,
  showOneshotBadge            : false,
  manualHideEnabled           : true,
  manualHideShortcut          : true,
  // History filters
  hideKudosed                 : false,
  hideSubscribed              : false,
  hideBookmarked              : false,
  hideMFL                     : false,
  hideRead                    : false,
  hideReadSeries              : false,
  historyFilterMode           : 'hide', // 'hide' | 'dim'
  showHiddenCount             : true,
  // Misc
  rememberFilters             : true,
  // Language / Work type quick-filters
  selectedLanguages           : [],
  oneshotDefault               : false,
  crossoverDefault            : false,
  // Language badges: preferred-language suppression
  preferredLanguages          : ['English'],
  hidePreferredLanguageBadge  : false,
  // Archive warning banner
  warningBannerMinCount       : 1,
  // Presets: auto search history + usage stats
  searchHistoryEnabled        : true,
};

const cfg = makeCfg(MOD, DEFAULTS);

// ── Storage helpers ───────────────────────────────────────────────────────
// AO3H.store.lsGet/lsSet resolve to Storage.lsGet/lsSet (lib/storage/index.js) —
// wrapStorageForUser() only overrides get/set/del/remove, not the ls* methods —
// so importing Storage directly is behaviorally identical.
function storeGet (key, def) {
  try {
    return Storage.lsGet(key, def);
  } catch { return def; }
}

function storeSet (key, value) {
  try {
    Storage.lsSet(key, value);
  } catch {}
}

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
const THREE_STATE_CYCLE = ['all', 'only', 'hide'];

export function parseAO3Date (text) {
  if (!text) return null;
  const match = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(text.trim());
  if (!match) return null;
  const month = MONTHS[match[2].toLowerCase().slice(0, 3)];
  return month === undefined ? null : new Date(+match[3], month, +match[1]);
}
export function isWithinDateRange (date, range) {
  if (!date) return false;
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days < 0) return true;
  if (range === 'today') return days === 0;
  if (range === 'week') return days <= 7;
  if (range === 'month') return days <= 31;
  return true;
}
export function looksAbandoned (lastUpdated, isComplete, months = 12) {
  return Boolean(!isComplete && lastUpdated &&
    (Date.now() - lastUpdated.getTime()) / 86400000 >= months * 30);
}
export function nextThreeState (current) {
  return THREE_STATE_CYCLE[(THREE_STATE_CYCLE.indexOf(current) + 1) % THREE_STATE_CYCLE.length];
}
export function kudosRatio (kudos, hits) {
  return !hits || kudos == null ? null : Math.round((kudos / hits) * 1000) / 10;
}
export function belowRatioThreshold (ratio, minPercent) {
  return ratio !== null && ratio < minPercent;
}
export function belowTagThreshold (count, threshold) { return threshold > 0 && count < threshold; }
export function summaryTooShort (summaryText, minLength) {
  const length = (summaryText || '').trim().length;
  return minLength <= 0 ? length === 0 : length < minLength;
}
export function isSeriesFullyRead (seriesWorkIds, readWorkIds) {
  if (!seriesWorkIds.length) return false;
  const read = readWorkIds instanceof Set ? readWorkIds : new Set(readWorkIds);
  return seriesWorkIds.every(id => read.has(id));
}
export function mergePresetFilters (a, b, multiTagFields) {
  const merged = { ...(a.filters || {}) };
  for (const [field, value] of Object.entries(b.filters || {})) {
    const existing = merged[field];
    if (multiTagFields.has(field) && typeof existing === 'string' && typeof value === 'string') {
      merged[field] = [...new Set([
        ...existing.split(',').map(tag => tag.trim()).filter(Boolean),
        ...value.split(',').map(tag => tag.trim()).filter(Boolean),
      ])].join(', ');
    } else if (Array.isArray(existing) && Array.isArray(value)) {
      merged[field] = [...new Set([...existing, ...value])];
    } else if (value !== '' && value != null) {
      merged[field] = value;
    }
  }
  return merged;
}
export function addSearchHistoryEntry (history, entry, cap = 20) {
  return [entry, ...history].slice(0, cap);
}
export function incrementUsage (stats, key) {
  return { ...stats, [key]: (stats[key] || 0) + 1 };
}
export function topUsage (stats, limit = 5) {
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

export const filterManagerHelpers = {
  parseAO3Date, isWithinDateRange, looksAbandoned, nextThreeState,
  kudosRatio, belowRatioThreshold, belowTagThreshold,
  summaryTooShort, isSeriesFullyRead, mergePresetFilters,
  addSearchHistoryEntry, incrementUsage, topUsage,
};



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Tag bundles are shared by presetManagement and hideByTags.

const BUILTIN_BUNDLES = [
  { id: 'slow-burn',         name: 'Slow Burn',
    tags: ['Slow Burn', 'Slowburn', 'Pining', 'Mutual Pining', 'Slow burn'] },
  { id: 'enemies-to-lovers', name: 'Enemies to Lovers',
    tags: ['Enemies to Lovers', 'Enemies-to-Lovers', 'From Enemies to Lovers',
           'Rivals to Lovers', 'Enemies to Friends to Lovers'] },
  { id: 'coffee-shop-au',    name: 'Coffee Shop AU',
    tags: ['Coffee Shop AU', 'Coffee Shop', 'Barista AU', 'Café AU'] },
  { id: 'hurt-comfort',      name: 'Hurt/Comfort',
    tags: ['Hurt/Comfort', 'Hurt/comfort', 'Hurt No Comfort',
           'Emotional Hurt/Comfort', 'Physical Hurt/Comfort', 'Whump'] },
  { id: 'fluff',             name: 'Fluff',
    tags: ['Fluff', 'Fluff and Angst', 'Tooth-Rotting Fluff', 'Pure Fluff', 'Domestic Fluff'] },
  { id: 'angst-hea',         name: 'Angst with Happy Ending',
    tags: ['Angst with a Happy Ending', 'Angst with Happy Ending', 'Happy Ending', 'It Gets Better'] },
  { id: 'fix-it',            name: 'Fix-It',
    tags: ['Fix-It', 'Fix-it', 'Canon Divergence', 'Canon Compliant Fix', 'Everybody Lives Nobody Dies'] },
  { id: 'found-family',      name: 'Found Family',
    tags: ['Found Family', 'Platonic Found Family', 'Chosen Family', 'Surrogate Family'] },
];

function loadBundles ()  { return storeGet(KEY_BUNDLES, []); }
function saveBundles (b) { storeSet(KEY_BUNDLES, b); }

function getAllBundles () {
  const custom    = loadBundles();
  const builtins  = cfg('useBuiltinTropeBundles') !== false ? BUILTIN_BUNDLES : [];
  const customIds = new Set(custom.map(b => b.id));
  return [...builtins.filter(b => !customIds.has(b.id)), ...custom];
}

function getBundleFor (tag) {
  if (!cfg('tagBundlesEnabled')) return [tag];
  const norm = tag.toLowerCase().trim();
  for (const bundle of getAllBundles()) {
    if (bundle.tags.some(t => t.toLowerCase().trim() === norm)) return bundle.tags;
  }
  return [tag];
}

function exposePublicApi (presetMgmt) {
  AO3H.filterManager = {
    getBundleFor,
    getAllBundles,
    getPresets: () => presetMgmt.loadPresets(),
  };
}



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Filter Manager',
  enabledByDefault: false,
}, async function init () {
  log.debug('init');

  // ── Instantiate submodules ───────────────────────────────────────────
  const presetMgmt    = new PresetManagement({ NS, storeGet, storeSet, cfg, detectCurrentFandom, getBundleFor, loadBundles, saveBundles, KEY_PRESETS, KEY_BUNDLES, KEY_LAST, KEY_HISTORY, KEY_USAGE, helpers: filterManagerHelpers });
  const langBadges    = new LanguageBadges({ NS, cfg });
  const filterWarnings = new FilterWarnings({ NS, cfg, storeGet, storeSet });
  const historyFilters = new UserHistoryFilters({ NS, cfg, W, AO3H, onAsyncUpdate: () => processBlurbs(), helpers: filterManagerHelpers });
  const wfm           = new WorksFilterManager({ NS, cfg, storeGet, storeSet, helpers: filterManagerHelpers });

  // ── Always expose the public bundle/preset API ───────────────────────
  exposePublicApi(presetMgmt);

  if (!isListingPage()) {
    log.debug('not a listing page — API exposed, UI skipped');
    return () => {
      delete AO3H.filterManager;
    };
  }

  const fandom  = detectCurrentFandom();
  const presets = presetMgmt.loadPresets();

  // ── Preset toolbar ───────────────────────────────────────────────────
  let toolbar = null;
  const filterForm = document.querySelector('form#work-filters, form.narrow-hidden.filters');
  const filterDl   = filterForm?.querySelector('fieldset dl');
  if (filterDl) {
    const { dt, dd } = presetMgmt.buildPresetToolbar(presets, fandom);
    toolbar = dd;
    const sortDt = filterDl.querySelector('dt.sort');
    if (sortDt) {
      filterDl.insertBefore(dt, sortDt);
      filterDl.insertBefore(dd, sortDt);
    } else {
      filterDl.prepend(dd);
      filterDl.prepend(dt);
    }
    presetMgmt.attachPresetToolbarEvents(toolbar);

    if (fandom && cfg('rememberLastPresetByFandom')) {
      const lastId = storeGet(KEY_LAST, {})[fandom];
      if (lastId) {
        const p = presets.find(x => x.id === lastId);
        if (p) {
          const nameEl = toolbar.querySelector(`.${NS}-preset-current-name`);
          if (nameEl) nameEl.textContent = p.name;
        }
      }
    }
  }

  // ── Archive Warning banner ───────────────────────────────────────────
  let warningBanner = null;
  if (cfg('warnExcludedWarning')) {
    const excluded = filterWarnings.detect(_params);
    if (excluded.length) warningBanner = filterWarnings.insert(excluded);
  }

  // ── Hidden-by-history counter ────────────────────────────────────────
  const hiddenCountEl     = document.createElement('p');
  hiddenCountEl.className = `${NS}-fm-hidden-count`;
  hiddenCountEl.hidden    = true;

  const worksList = document.querySelector(
    '#main ol.work, #main ul.index.group, #main .index.group'
  );
  // ── Quick-filter panel (worksFilterManager) ──────────────────────────
  const quickPanel = wfm.buildPanel();
  if (quickPanel && worksList) {
    worksList.parentNode?.insertBefore(quickPanel, worksList);
  }

  if (worksList) worksList.parentNode?.insertBefore(hiddenCountEl, worksList);

  function processBlurbs () {
    const blurbs = document.querySelectorAll('li.work.blurb, li.bookmark.blurb, li.blurb');
    wfm.apply(blurbs);
    langBadges.apply(blurbs);
    historyFilters.apply(blurbs, hiddenCountEl);
  }

  processBlurbs();

  // ── MutationObserver ─────────────────────────────────────────────────
  const root     = document.querySelector('#main') || document.body;
  const observer = observe(root, { childList: true, subtree: true }, (mutations) => {
    for (const mut of mutations) {
      for (const node of mut.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (
          node.matches('li.blurb, li.work.blurb, li.bookmark.blurb') ||
          node.querySelector?.('li.blurb')
        ) {
          processBlurbs();
          return;
        }
      }
    }
  });

  log.debug('ready');

  // ── Cleanup ──────────────────────────────────────────────────────────
  return () => {
    log.debug('cleanup');
    observer.disconnect();
    presetMgmt.cleanup();
    warningBanner?.remove();
    hiddenCountEl?.remove();
    historyFilters.cleanup();
    langBadges.cleanup();
    wfm.cleanup();
    delete AO3H.filterManager;
  };
});

log.debug('registered');
