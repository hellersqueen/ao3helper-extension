
/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager Module Coordinator
    Module ID: filterManager
    Display Name: Filter Manager
    Tab: Browse

    Submodules (imported directly as ES modules):
        1. presetManagement   → ./presetManagement.js
        2. languageBadges     → ./languageBadges.js
        3. filterWarnings     → ./filterWarnings.js
        4. userHistoryFilters → ./userHistoryFilters.js
        5. worksFilterManager → ./worksFilterManager.js

    Storage keys:
        filterManager:presets     — saved preset list
        filterManager:bundles     — custom tag bundles
        filterManager:lastPreset  — { [fandom]: presetId }

    Public API (AO3H.filterManager):
        getBundleFor(tag)   → string[]
        getAllBundles()      → bundle[]
        getPresets()        → preset[]

    Dependencies: hideByTags (⇄), ficAppreciation, bookmarkVault,
                  laterShelf, readingTracker

═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Storage } from '../../../../lib/storage/index.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './filterManager.css?inline';

import { PresetManagement } from './presetManagement.js';
import { LanguageBadges } from './languageBadges.js';
import { FilterWarnings } from './filterWarnings.js';
import { UserHistoryFilters } from './userHistoryFilters.js';
import { WorksFilterManager } from './worksFilterManager.js';

css(styles, 'ao3h-filterManager');

const W    = getGlobalWindow();
// AO3H (global) reste nécessaire : les échanges croisés avec hideByTags,
// ficAppreciation, bookmarkVault, laterShelf et readingTracker (tous migrés
// depuis, Phases 19-23) passent toujours par les bridges window — contrat
// conservé jusqu'à leur suppression en Phase 26 — ainsi que l'exposition de
// l'API publique window.AO3H.filterManager.
// Étape 318 : AO3H importé du core/lifecycle (avant : capture window.AO3H).
const NS   = 'ao3h';
const MOD  = 'filterManager';
const LOG  = `[AO3H][${MOD}]`;

// ── Storage keys ──────────────────────────────────────────────────────────
const KEY_PRESETS = 'filterManager:presets';
const KEY_BUNDLES = 'filterManager:bundles';
const KEY_LAST    = 'filterManager:lastPreset';

// ── Route helpers ─────────────────────────────────────────────────────────
const _path   = location.pathname;
const _params = new URLSearchParams(location.search);

function isListingPage () {
  return /^\/works$/.test(_path) ||
         /^\/tags\/[^/]+\/works/.test(_path) ||
         /^\/users\/[^/]+\/(bookmarks|works|pseuds\/[^/]+\/works)/.test(_path) ||
         /^\/collections\/[^/]+\/works/.test(_path);
}

function detectCurrentFandom () {
  const m = _path.match(/^\/tags\/([^/]+)\/works/);
  if (m) return decodeURIComponent(m[1]);
  const t = _params.get('tag_id');
  return t ? decodeURIComponent(t) : null;
}

// ── Config helpers ────────────────────────────────────────────────────────
const SK_SETTINGS = `ao3h:mod:${MOD}:settings`;

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
  // History filters
  hideKudosed                 : false,
  hideSubscribed              : false,
  hideBookmarked              : false,
  hideMFL                     : false,
  hideReadSeries              : false,
  showHiddenCount             : true,
  // Misc
  rememberFilters             : true,
  // Language / Work type quick-filters
  selectedLanguages           : [],
  oneshotDefault               : false,
  crossoverDefault            : false,
};

function cfg (key) {
  try {
    const raw = localStorage.getItem(SK_SETTINGS);
    if (raw) { const saved = JSON.parse(raw); if (saved && key in saved) return saved[key]; }
  } catch { /* */ }
  return key in DEFAULTS ? DEFAULTS[key] : null;
}

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

// ══════════════════════════════════════════════════════════════════════════
// TAG BUNDLES — shared across presetManagement and hideByTags
// ══════════════════════════════════════════════════════════════════════════

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


// ══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Filter Manager',
  enabledByDefault: false,
}, async function init () {
  console.log(LOG, 'init');

  // ── Instantiate submodules ───────────────────────────────────────────
  const presetMgmt    = new PresetManagement({ NS, storeGet, storeSet, cfg, detectCurrentFandom, getBundleFor, loadBundles, saveBundles, KEY_PRESETS, KEY_BUNDLES, KEY_LAST });
  const langBadges    = new LanguageBadges({ NS, cfg });
  const filterWarnings = new FilterWarnings({ NS, cfg });
  const historyFilters = new UserHistoryFilters({ NS, cfg, W, AO3H });
  const wfm           = new WorksFilterManager({ NS, cfg });

  // ── Always expose the public bundle/preset API ───────────────────────
  exposePublicApi(presetMgmt);

  if (!isListingPage()) {
    console.log(LOG, 'not a listing page — API exposed, UI skipped');
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
  const observer = new MutationObserver((mutations) => {
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
  observer.observe(root, { childList: true, subtree: true });

  console.log(LOG, 'ready');

  // ── Cleanup ──────────────────────────────────────────────────────────
  return () => {
    console.log(LOG, 'cleanup');
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

console.log(LOG, 'registered');
