/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Results Sorting Submodule
    Submodule ID: resultsSorting
    Display Name: Results Sorting
    Source Module: Search Enhancer

    - Feature: Quality ratio sorting
      - Option: Sort by kudos/hits ratio (engagement depth)
      - Option: Sort by bookmarks/kudos ratio (save rate / rereadability score)
      - Option: Display ratio value inline next to stats (e.g. "12% eng.")
      - Option: Toggle: "Show quality ratios" checkbox
      - Option: Works on: search results, tag pages, listing pages

    - Feature: Advanced sorting algorithms
      - Option: Sort by kudos/hits ratio
      - Option: Sort by bookmarks/kudos ratio
      - Option: Sort by raw kudos (high to low)
      - Option: Sort by raw hits (high to low)
      - Option: Restore default page order

    - Feature: Sort toolbar
      - Option: Sort dropdown selector
      - Option: Apply sort button
      - Option: Dynamic reordering of results
      - Option: Persists last chosen sort mode per page path

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';
import { getBlurbStats } from '../../../../lib/ao3/work-stats.js';
import { buildKudosRatioBadge, RATIO_BADGE_CLASS } from '../../../../lib/ui/engagement-badge.js';

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'resultsSorting';
const LOG  = `[AO3H][${MOD}]`;
const SORT_SK = `${NS}:se:sort`;

// ── Config & defaults ─────────────────────────────────────────────────────
// Settings are shared across all searchEnhancer children and saved by the
// panel under the parent module id (Explore-configs/searchEnhancer-config.js).
const DEFAULTS = {
  sortByKudosRatio: true,
  sortBySaveRate:   true,
  showRatioInline:  true,
};
function readCfg () {
  return loadModuleSettings('searchEnhancer', DEFAULTS);
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getShared () { return W.AO3H_SearchEnhancer || null; }

function isListingPage () {
  return /^\/works(\/search)?$|^\/tags\/.*\/works|^\/users\/.*\/bookmarks|^\/collections\/.*\/works/.test(location.pathname) ||
         location.search.includes('work_search');
}

// ── Sort mode definitions ─────────────────────────────────────────────────
const SORT_MODES = [
  { value: 'default',     label: 'Default order' },
  { value: 'kudos_ratio', label: 'Kudos ratio (kudos÷hits)' },
  { value: 'save_rate',   label: 'Save rate (bookmarks÷kudos)' },
  { value: 'kudos',       label: 'Kudos (high to low)' },
  { value: 'hits',        label: 'Hits (high to low)' },
];

function scoreBlurb (blurb, mode) {
  const { kudos, hits, bookmarks } = getBlurbStats(blurb);
  if (mode === 'kudos_ratio') return hits > 0 ? kudos / hits : 0;
  if (mode === 'save_rate')   return kudos > 0 ? bookmarks / kudos : 0;
  if (mode === 'kudos')       return kudos;
  if (mode === 'hits')        return hits;
  return 0; // default = no reorder
}

// ── Inline ratio display ────────────────────────────────────────────────────
// Badge partagé avec ficEngagement (browse) — voir lib/ui/engagement-badge.js
// et shared.md décision O3. Si ficEngagement a déjà posé son badge de ratio
// sur ce blurb, on ne le double pas.
// Badges que ce module a lui-même créés (par opposition à ceux déjà posés par
// ficEngagement) — pour ne retirer que les nôtres au cleanup.
const ownRatioBadges = new Set();

function addRatioBadges (blurbs) {
  blurbs.forEach(blurb => {
    if (blurb.querySelector(`.${RATIO_BADGE_CLASS}`)) return;
    const stats = getBlurbStats(blurb);
    const badge = buildKudosRatioBadge(stats);
    if (!badge) return;
    // Append after stats list
    const statsEl = blurb.querySelector('dl.stats, .stats');
    if (statsEl) { statsEl.appendChild(badge); ownRatioBadges.add(badge); }
  });
}

// ── Sort toolbar ──────────────────────────────────────────────────────────
let toolbarEl = null;

function injectSortBar (container, blurbs, originalPositions, cfg) {
  if (toolbarEl) return;

  const savedMode = lsGet(SORT_SK)?.[location.pathname] || 'default';

  const options = SORT_MODES
    .filter(m => {
      if (m.value === 'kudos_ratio' && !cfg.sortByKudosRatio) return false;
      if (m.value === 'save_rate'   && !cfg.sortBySaveRate)   return false;
      return true;
    })
    .map(m => `<option value="${m.value}"${m.value === savedMode ? ' selected' : ''}>${m.label}</option>`)
    .join('');

  toolbarEl = document.createElement('div');
  toolbarEl.className = `${NS}-se-sort-bar`;
  toolbarEl.innerHTML = `
    <label for="${NS}-se-sort-select">Sort by:</label>
    <select id="${NS}-se-sort-select" class="${NS}-se-sort-select">${options}</select>
    <button class="${NS}-se-sort-apply">Apply</button>
  `;

  const heading = container.querySelector('h3.heading, h2.heading, .heading');
  if (heading) heading.after(toolbarEl);
  else container.prepend(toolbarEl);

  toolbarEl.querySelector(`.${NS}-se-sort-apply`).addEventListener('click', () => {
    const mode = toolbarEl.querySelector(`#${NS}-se-sort-select`).value;
    applySort(container, blurbs, originalPositions, mode);
    // Persist
    const saved = lsGet(SORT_SK) || {};
    saved[location.pathname] = mode;
    lsSet(SORT_SK, saved);
  });

  // Auto-apply saved mode on load
  if (savedMode !== 'default') {
    applySort(container, blurbs, originalPositions, savedMode);
  }
}

function restoreOriginalOrder (container, blurbs, originalPositions) {
  const sorted = [...blurbs].sort((a, b) =>
    parseInt(a.dataset.seIdx ?? Infinity) - parseInt(b.dataset.seIdx ?? Infinity)
  );
  sorted.forEach(blurb => {
    const marker = originalPositions.get(blurb);
    if (marker?.isConnected) marker.parentNode.insertBefore(blurb, marker);
    else container.appendChild(blurb);
  });
}

function applySort (container, blurbs, originalPositions, mode) {
  if (mode === 'default') {
    restoreOriginalOrder(container, blurbs, originalPositions);
    return;
  }
  const scored = [...blurbs].map(b => ({ el: b, score: scoreBlurb(b, mode) }));
  scored.sort((a, b) => b.score - a.score);
  scored.forEach(({ el }) => container.appendChild(el));
  console.log(LOG, 'Sorted by', mode);
}

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Results Sorting', parent: 'searchEnhancer', enabledByDefault: true },
  async function init () {
    const cfg = readCfg();
    console.log(LOG, 'init', cfg);

    if (!isListingPage()) return;

    const container = document.querySelector('ol.work.index, ul.work.index');
    if (!container) { console.warn(LOG, 'No work listing container found'); return; }

    const blurbs = Array.from(container.querySelectorAll('li.work.blurb'));
    if (!blurbs.length) return;
    const originalPositions = new Map();

    // Tag each blurb with its original index for default-order restoration
    blurbs.forEach((b, i) => {
      b.dataset.seIdx = i;
      const marker = document.createComment(`ao3h-search-position:${i}`);
      b.parentNode.insertBefore(marker, b);
      originalPositions.set(b, marker);
    });

    // Inline ratio badges
    if (cfg.showRatioInline) addRatioBadges(blurbs);

    // Sort toolbar
    if (cfg.sortByKudosRatio || cfg.sortBySaveRate) {
      injectSortBar(container, blurbs, originalPositions, cfg);
    }

    return function cleanup () {
      toolbarEl?.remove();
      toolbarEl = null;
      ownRatioBadges.forEach(el => el.remove());
      ownRatioBadges.clear();
      restoreOriginalOrder(container, blurbs, originalPositions);
      originalPositions.forEach((marker, blurb) => {
        marker.remove();
        delete blurb.dataset.seIdx;
      });
      originalPositions.clear();
      console.log(LOG, 'cleanup');
    };
  }
);
