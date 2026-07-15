/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Related Searches Submodule
    Submodule ID: relatedSearches
    Display Name: Related Searches
    Source Module: Search Enhancer

    - Feature: Suggest related search refinements
      - Option: Analyze current search filters
      - Option: Show popular tag combinations
      - Option: Display as suggestion box

    - Feature: One-click query variations
      - Option: Add suggested tag to current search
      - Option: Filter out already-used tags
      - Option: Show up to 8 suggestions

    - Feature: Popular tag suggestions library
      - Option: Alternate Universe
      - Option: Slow Burn
      - Option: Happy Ending
      - Option: Angst, Fluff, Hurt/Comfort, etc.
      - Option: Helps discover search strategies you might not have thought of

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';
import { createPersistedCache } from '../../../../lib/storage/cache.js';

const NS   = 'ao3h';
const MOD  = 'relatedSearches';
const LOG  = `[AO3H][${MOD}]`;

// ── Config & defaults ─────────────────────────────────────────────────────
// Settings are shared across all searchEnhancer children and saved by the
// panel under the parent module id (Explore-configs/searchEnhancer-config.js).
const DEFAULTS = {
  tagSuggestions:          true,
  historyBasedSuggestions: true,
  suggestionWorkCount:     true,
};
function readCfg () {
  return loadModuleSettings('searchEnhancer', DEFAULTS);
}

// ── Search history (read-only) ────────────────────────────────────────────
const HIST_KEY = `${NS}:se:history`;

function historyLoad () { return lsGet(HIST_KEY) || []; }

// ── Suggestion cache (7-day TTL) ──────────────────────────────────────────
const sugCache = createPersistedCache({
  key: `${NS}:se:sugcache`,
  ttlMs: 7 * 24 * 60 * 60 * 1000,
});
const cacheGet = (tagKey) => sugCache.get(tagKey);
const cacheSet = (tagKey, tags) => sugCache.set(tagKey, tags);

function isSearchPage () {
  return /^\/works\/search|^\/tags\/.*\/works/.test(location.pathname) ||
         location.search.includes('work_search');
}

// ── Extract active tag filters from page ──────────────────────────────────
function getActiveTags () {
  // Works for /tags/*/works URL pattern
  const pathMatch = location.pathname.match(/^\/tags\/(.+)\/works$/);
  if (pathMatch) return [decodeURIComponent(pathMatch[1])];

  // Works for search form freeform tags
  const tagInputs = document.querySelectorAll(
    'input[name="work_search[freeform_ids][]"], input[name*="freeform"]'
  );
  const tags = [];
  tagInputs.forEach(inp => { if (inp.value.trim()) tags.push(inp.value.trim()); });
  return tags;
}

// ── Suggestions data ──────────────────────────────────────────────────────
// Static curated co-tag list (fallback — avoids live fetch for privacy).
// Table de co-occurrence, forme différente de lib/ao3/constants.js
// TROPE_NAMES (liste plate) — voir ce fichier pour la liste de référence des
// noms de tropes du projet ; garder les clés ci-dessous alignées avec elle.
const CO_TAGS = {
  'Slow Burn':            [['Mutual Pining', '82K'], ['Enemies to Lovers', '65K'], ['Pining', '73K'], ['UST', '41K'], ['Friends to Lovers', '55K']],
  'Enemies to Lovers':    [['Slow Burn', '65K'], ['Hate to Love', '38K'], ['Sexual Tension', '29K'], ['Rivals', '22K'], ['Forced Proximity', '31K']],
  'Hurt/Comfort':         [['Whump', '47K'], ['Angst with a Happy Ending', '59K'], ['Emotional Hurt/Comfort', '68K'], ['Comfort', '34K'], ['Fluff', '91K']],
  'Fake Dating':          [['Fake Marriage', '18K'], ['Slow Burn', '24K'], ['Getting Together', '52K'], ['Mutual Pining', '39K'], ['Tropes', '12K']],
  'Found Family':         [['Chosen Family', '44K'], ['Fluff', '91K'], ['Hurt/Comfort', '73K'], ['Angst', '55K'], ['Team as Family', '19K']],
  'Angst':                [['Angst with a Happy Ending', '59K'], ['Hurt/Comfort', '73K'], ['Fluff', '91K'], ['Emotional', '28K'], ['Whump', '47K']],
  'Fluff':                [['Hurt/Comfort', '73K'], ['Angst', '55K'], ['Found Family', '44K'], ['Domestic', '37K'], ['Getting Together', '52K']],
  'AU':                   [['Alternate Universe', '120K'], ['Modern AU', '88K'], ['Coffee Shop AU', '22K'], ['High School AU', '31K'], ['Canon Divergence', '67K']],
  'Time Travel':          [['Fix-It', '39K'], ['Canon Divergence', '67K'], ['Second Chances', '24K'], ['Alternate Timeline', '18K'], ['Post-Canon', '42K']],
  'Soulmates':            [['Slow Burn', '65K'], ['Fate', '19K'], ['Soulmate AU', '32K'], ['Mutual Pining', '39K'], ['Romance', '88K']],
};

function getSuggestions (tags) {
  const results = {};
  tags.forEach(tag => {
    const cacheKey = `related:${tag.toLowerCase()}`;
    const cached = cacheGet(cacheKey);
    if (cached) { cached.forEach(([t, c]) => { results[t] = results[t] || c; }); return; }
    // Look up in local table (case-insensitive)
    const entry = Object.entries(CO_TAGS).find(([k]) => k.toLowerCase() === tag.toLowerCase());
    if (entry) {
      cacheSet(cacheKey, entry[1]);
      entry[1].forEach(([t, c]) => { results[t] = results[t] || c; });
    }
  });
  // Remove tags already in active filters
  const activeLower = tags.map(t => t.toLowerCase());
  return Object.entries(results).filter(([t]) => !activeLower.includes(t.toLowerCase()));
}

// ── DOM injection ─────────────────────────────────────────────────────────
let panelEl = null;

function addTagToSearch (tag) {
  // Try to append to the freeform tag input if present
  const inp = document.querySelector('input[name="work_search[freeform_ids][]"]') ||
              document.querySelector('input[name*="freeform"]');
  if (inp) {
    inp.value = tag;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // Fallback: open search URL with tag
    const url = `https://archiveofourown.org/works/search?work_search[freeform_ids][]=${encodeURIComponent(tag)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function renderPanel (suggestions, cfg, historyQueries) {
  const hasSuggestions = suggestions.length > 0;
  const hasHistory     = cfg.historyBasedSuggestions && historyQueries.length > 0;
  if (!hasSuggestions && !hasHistory) return;

  const pills = suggestions
    .slice(0, 8)
    .map(([tag, count]) => {
      const countHtml = cfg.suggestionWorkCount
        ? `<span class="${NS}-se-tag-count">${escapeHtml(count)}</span>`
        : '';
      return `<span class="${NS}-se-tag-pill" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}${countHtml}</span>`;
    })
    .join('');

  const historyPills = hasHistory
    ? historyQueries
        .slice(0, 4)
        .map(({ query }) =>
          `<span class="${NS}-se-tag-pill" data-tag="${escapeHtml(query)}">🕐 ${escapeHtml(query)}</span>`
        )
        .join('')
    : '';

  panelEl = document.createElement('div');
  panelEl.className = `${NS}-se-related-panel`;
  panelEl.innerHTML = `
    ${hasSuggestions ? `
      <div class="${NS}-se-related-title">🏷 You might also like</div>
      <div class="${NS}-se-related-tags">${pills}</div>
    ` : ''}
    ${hasHistory ? `
      <div class="${NS}-se-related-title${hasSuggestions ? ` ${NS}-se-related-title--spaced` : ''}">🕐 From your history</div>
      <div class="${NS}-se-related-tags">${historyPills}</div>
    ` : ''}
  `;

  panelEl.querySelectorAll(`.${NS}-se-tag-pill`).forEach(pill => {
    pill.addEventListener('click', () => addTagToSearch(pill.dataset.tag));
  });

  // Insert before results list or after search form
  const anchor = document.querySelector('#main ol.work.index, #main .work.index.group, form#work-search');
  if (anchor) anchor.parentNode.insertBefore(panelEl, anchor);
}

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Related Searches', parent: 'searchEnhancer', enabledByDefault: true },
  async function init () {
    const cfg = readCfg();
    console.log(LOG, 'init', cfg);

    if (!cfg.tagSuggestions && !cfg.historyBasedSuggestions) return;
    if (!isSearchPage()) return;

    const activeTags = getActiveTags();
    const historyQueries = cfg.historyBasedSuggestions ? historyLoad() : [];

    if (!activeTags.length && !historyQueries.length) return;

    const suggestions = activeTags.length ? getSuggestions(activeTags) : [];
    renderPanel(suggestions, cfg, historyQueries);

    return function cleanup () {
      panelEl?.remove();
      panelEl = null;
      console.log(LOG, 'cleanup');
    };
  }
);
