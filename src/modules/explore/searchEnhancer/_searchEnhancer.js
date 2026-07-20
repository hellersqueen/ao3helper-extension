/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Search Enhancer Coordinator

    Module ID: searchEnhancer
    Display Name: Search Enhancer
    Tab: Explore

    Purpose

    Coordinates search suggestions, autocomplete, result sorting, and series
    grouping on AO3 search and listing pages.

    Submodules

    - relatedSearches.js: related-tag suggestions
    - searchAutocomplete.js: history, autocomplete, and quick-search controls
    - resultsSorting.js: derived-stat sorting and inline metrics
    - seriesGrouping.js: grouping of related series works

    Notes

    - Shared storage helpers and the namespace are exposed through
      AO3H_SearchEnhancer while the coordinator is active.
    - Each child owns its own persisted storage keys.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import styles from './searchEnhancer.css?inline';

import './relatedSearches.js';
import './searchAutocomplete.js';
import './resultsSorting.js';
import './seriesGrouping.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-searchEnhancer');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'searchEnhancer';
const RECENCY_HALF_LIFE_DAYS = 14;


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

/** Attach the number of works already visited to each series group. */
export function withReadCounts (groups, readWorkIds) {
  return groups.map(group => ({
    ...group,
    readCount: group.workIds.filter(id => readWorkIds.has(id)).length,
  }));
}

/** Sort series groups by real reading history, preserving tie order. */
export function sortGroupsByReadHistory (groups, readWorkIds) {
  return withReadCounts(groups, readWorkIds)
    .map((group, index) => ({ group, index }))
    .sort((a, b) => b.group.readCount - a.group.readCount || a.index - b.index)
    .map(({ group }) => group);
}

/** Score in [0,1], with recent updates receiving the highest value. */
export function recencyScore (updatedAt, now = Date.now()) {
  if (updatedAt == null) return 0;
  const days = Math.max(0, (now - updatedAt) / 86400000);
  return 1 / (1 + days / RECENCY_HALF_LIFE_DAYS);
}

/** Compute the value used by one of the client-side result sort modes. */
export function scoreForMode (mode, stats, now = Date.now()) {
  const kudos     = stats.kudos ?? 0;
  const hits      = stats.hits ?? 0;
  const bookmarks = stats.bookmarks ?? 0;
  const chapters  = stats.chapters ?? 0;

  switch (mode) {
    case 'kudos_ratio':       return hits > 0 ? kudos / hits : 0;
    case 'save_rate':         return kudos > 0 ? bookmarks / kudos : 0;
    case 'kudos':             return kudos;
    case 'hits':              return hits;
    case 'kudos_per_chapter': return chapters > 0 ? kudos / chapters : kudos;
    case 'recent':            return recencyScore(stats.updatedAt, now);
    case 'balanced': {
      const ratio = hits > 0 ? kudos / hits : 0;
      return ratio * 60 + recencyScore(stats.updatedAt, now) * 40;
    }
    default: return 0;
  }
}

/** Classic Levenshtein edit distance. */
export function levenshtein (a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      row[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = tmp;
    }
  }
  return row[n];
}

/** Filter search history, falling back to typo-tolerant matching. */
export function fuzzyFilterHistory (list, query, maxDistance = 1) {
  const q = String(query ?? '').trim().toLowerCase();
  if (q.length < 2) return list.slice(0, 10);

  const exact = list.filter(entry => entry.query.toLowerCase().includes(q));
  if (exact.length || q.length < 3) return exact;

  return list.filter(entry => {
    const words = entry.query.toLowerCase().split(/\s+/);
    return words.some(word => levenshtein(word, q) <= maxDistance) ||
           levenshtein(entry.query.toLowerCase(), q) <= maxDistance;
  });
}

function normalizeSearch (query) {
  return String(query ?? '').trim().toLowerCase();
}

/** Return the most frequently repeated local searches. */
export function topSearches (history, n = 5) {
  const counts = new Map();
  history.forEach(entry => {
    const key = normalizeSearch(entry.query);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([query, count]) => ({ query, count }))
    .filter(entry => entry.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/** Return searches occurring more often in the newer half of the history. */
export function trendingSearches (history, n = 3) {
  if (history.length < 4) return [];
  const mid = Math.floor(history.length / 2);
  const countIn = (list) => {
    const counts = new Map();
    list.forEach(entry => {
      const key = normalizeSearch(entry.query);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  };
  const newerCounts = countIn(history.slice(0, mid));
  const olderCounts = countIn(history.slice(mid));

  return Array.from(newerCounts.entries())
    .filter(([query, count]) => count > (olderCounts.get(query) || 0))
    .sort((a, b) => (b[1] - (olderCounts.get(b[0]) || 0)) - (a[1] - (olderCounts.get(a[0]) || 0)))
    .slice(0, n)
    .map(([query]) => query);
}

/** Build top-fandom rows, scaled relative to the most searched fandom. */
export function fandomBarData (history, n = 5) {
  const counts = new Map();
  history.forEach(entry => {
    const key = (entry.fandom || '').trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const rows = Array.from(counts.entries())
    .map(([fandom, count]) => ({ fandom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
  const max = rows[0]?.count || 1;
  return rows.map(row => ({ ...row, pct: Math.round((row.count / max) * 100) }));
}

/**
 * Determine which fandom should be attached to a search-history entry.
 * @param {{ pathname: string, fandomFieldValue?: string }} context
 */
export function extractFandomFromContext ({ pathname, fandomFieldValue }) {
  const tagMatch = String(pathname || '').match(/^\/tags\/([^/]+)\/works\/?$/);
  if (tagMatch) {
    try { return decodeURIComponent(tagMatch[1]); } catch { return tagMatch[1]; }
  }
  const value = (fandomFieldValue || '').trim();
  return value ? value.split(',')[0].trim() : null;
}

/** Return a short refinement tip for very small or large result sets. */
export function buildRefinementTip (resultCount) {
  if (resultCount === 0) return 'No results? Try removing a tag or filter to broaden your search.';
  if (resultCount >= 20) return 'Lots of results? Try adding another tag or filter to narrow things down.';
  return null;
}

export const QUICK_TEMPLATES = [
  { label: '🔥 Most kudos',       params: { 'work_search[sort_column]': 'kudos_count', 'work_search[sort_direction]': 'desc' } },
  { label: '🆕 Recently updated', params: { 'work_search[sort_column]': 'revised_at',   'work_search[sort_direction]': 'desc' } },
  { label: '✅ Complete only',    params: { 'work_search[complete]': 'T' } },
  { label: '📏 Longest first',    params: { 'work_search[sort_column]': 'word_count',   'work_search[sort_direction]': 'desc' } },
];

/** Apply a quick-search template while preserving all other URL filters. */
export function buildTemplateUrl (url, params) {
  const nextUrl = new URL(url);
  Object.entries(params).forEach(([key, value]) => nextUrl.searchParams.set(key, value));
  return nextUrl.toString();
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Search Enhancer', enabledByDefault: false },
  async function init () {
    W.AO3H_SearchEnhancer = {
      lsGet,
      lsSet,
      NS,
      sortGroupsByReadHistory,
      scoreForMode,
      fuzzyFilterHistory,
      topSearches,
      trendingSearches,
      fandomBarData,
      extractFandomFromContext,
      buildRefinementTip,
      QUICK_TEMPLATES,
      buildTemplateUrl,
    };
    return function cleanup () {
      delete W.AO3H_SearchEnhancer;
    };
  }
);
