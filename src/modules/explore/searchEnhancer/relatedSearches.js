/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer › Related Searches

Suggests related tags and recent queries from the current search context,
built-in quick-search templates, locally-derived search insights, and a
short refinement tip based on the result count — with one-click controls for
applying a refinement or opening a new search.

Notes

- Related tags come from a curated local co-occurrence table.
- Suggestion results are cached for seven days.
- Active filters are excluded and displayed suggestions are capped at eight.
- Insights (top searches, trending, fandom bars) are derived entirely from
  the local search history — no network calls, no crawling.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';
import { createPersistedCache } from '../../../../lib/storage/cache.js';
import {
  topSearches, trendingSearches, fandomBarData, buildRefinementTip,
  QUICK_TEMPLATES, buildTemplateUrl,
} from './searchHistoryHelpers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const NS   = 'ao3h';
const MOD  = 'relatedSearches';
const LOG  = `[AO3H][${MOD}]`;

// Settings are shared across all searchEnhancer children and saved by the
// panel under the parent module id (explore/searchEnhancer-config.js).
const DEFAULTS = {
  tagSuggestions:          true,
  historyBasedSuggestions: true,
  suggestionWorkCount:     true,
  searchTemplates:         true,
  searchInsights:          true,
  refinementTips:          true,
};
function readCfg () {
  return loadModuleSettings('searchEnhancer', DEFAULTS);
}

const HIST_KEY = `${NS}:se:history`;

function historyLoad () { return lsGet(HIST_KEY) || []; }

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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RELATED-TAG SUGGESTIONS
═══════════════════════════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SUGGESTION PANEL
═══════════════════════════════════════════════════════════════════════════ */

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

function buildSectionHtml (title, bodyHtml, spaced) {
  return `
    <div class="${NS}-se-related-title${spaced ? ` ${NS}-se-related-title--spaced` : ''}">${title}</div>
    ${bodyHtml}
  `;
}

function buildTemplatesHtml () {
  const links = QUICK_TEMPLATES
    .map(t => `<a class="${NS}-se-tag-pill ${NS}-se-template-pill" href="${escapeHtml(buildTemplateUrl(location.href, t.params))}">${escapeHtml(t.label)}</a>`)
    .join('');
  return buildSectionHtml('⚡ Quick templates', `<div class="${NS}-se-related-tags">${links}</div>`);
}

function buildInsightsHtml (history) {
  const top = topSearches(history);
  const trending = trendingSearches(history);
  const fandoms = fandomBarData(history);
  if (!top.length && !trending.length && !fandoms.length) return '';

  const topHtml = top.length
    ? `<div class="${NS}-se-insights-row">Most searched: ${top.map(t => `${escapeHtml(t.query)} (${t.count}×)`).join(', ')}</div>`
    : '';
  const trendingHtml = trending.length
    ? `<div class="${NS}-se-insights-row">📈 Trending for you: ${trending.map(escapeHtml).join(', ')}</div>`
    : '';
  const fandomHtml = fandoms.length
    ? `<div class="${NS}-se-fandom-bars">${fandoms.map(f => `
        <div class="${NS}-se-fandom-bar-row">
          <span class="${NS}-se-fandom-bar-label">${escapeHtml(f.fandom)}</span>
          <span class="${NS}-se-fandom-bar-track"><span class="${NS}-se-fandom-bar-fill" style="width:${f.pct}%"></span></span>
          <span class="${NS}-se-fandom-bar-count">${f.count}</span>
        </div>`).join('')}</div>`
    : '';

  return buildSectionHtml('📊 Your search insights', `${topHtml}${trendingHtml}${fandomHtml}`, true);
}

function renderPanel (suggestions, cfg, historyQueries, { fullHistory = [], resultCount = null } = {}) {
  const hasSuggestions = suggestions.length > 0;
  const hasHistory     = cfg.historyBasedSuggestions && historyQueries.length > 0;
  const hasTemplates    = cfg.searchTemplates;
  const insightsHtml    = cfg.searchInsights && fullHistory.length >= 3 ? buildInsightsHtml(fullHistory) : '';
  const tip              = cfg.refinementTips && resultCount != null ? buildRefinementTip(resultCount) : null;

  if (!hasSuggestions && !hasHistory && !hasTemplates && !insightsHtml && !tip) return;

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
    ${tip ? `<div class="${NS}-se-tip">💡 ${escapeHtml(tip)}</div>` : ''}
    ${hasSuggestions ? buildSectionHtml('🏷 You might also like', `<div class="${NS}-se-related-tags">${pills}</div>`) : ''}
    ${hasHistory ? buildSectionHtml('🕐 From your history', `<div class="${NS}-se-related-tags">${historyPills}</div>`, hasSuggestions) : ''}
    ${hasTemplates ? buildTemplatesHtml() : ''}
    ${insightsHtml}
  `;

  panelEl.querySelectorAll(`.${NS}-se-tag-pill:not(.${NS}-se-template-pill)`).forEach(pill => {
    pill.addEventListener('click', () => addTagToSearch(pill.dataset.tag));
  });

  // Insert before results list or after search form
  const anchor = document.querySelector('#main ol.work.index, #main .work.index.group, form#work-search');
  if (anchor) anchor.parentNode.insertBefore(panelEl, anchor);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Related Searches', parent: 'searchEnhancer', enabledByDefault: true },
  async function init () {
    const cfg = readCfg();
    console.log(LOG, 'init', cfg);

    const anyFeatureOn = cfg.tagSuggestions || cfg.historyBasedSuggestions ||
      cfg.searchTemplates || cfg.searchInsights || cfg.refinementTips;
    if (!anyFeatureOn) return;
    if (!isSearchPage()) return;

    const activeTags = getActiveTags();
    const historyQueries = cfg.historyBasedSuggestions ? historyLoad() : [];
    const fullHistory = cfg.searchInsights ? historyLoad() : [];
    // A results count of 0 only means something once a search actually ran
    // (query params present, or a /tags/*/works page) — a blank search form
    // also has zero blurbs and shouldn't trigger a "no results" tip.
    const searchWasRun = location.search.includes('work_search') || /^\/tags\/.*\/works/.test(location.pathname);
    const resultCount  = searchWasRun ? document.querySelectorAll('li.work.blurb').length : null;

    renderPanel(activeTags.length ? getSuggestions(activeTags) : [], cfg, historyQueries, { fullHistory, resultCount });

    return function cleanup () {
      panelEl?.remove();
      panelEl = null;
      console.log(LOG, 'cleanup');
    };
  }
);
