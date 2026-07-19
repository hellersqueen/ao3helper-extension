/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer › Search History Helpers

Pure logic derived from the local search-history log ({query, ts, fandom}[]):
typo-tolerant history filtering, "your search insights" (top searches,
trending searches, top fandoms), refinement tips, and built-in quick-search
templates. Everything here works only from data the extension already
stores locally — no network calls, no crawling.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   TYPO-TOLERANT HISTORY FILTER
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Classic Levenshtein edit distance.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
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

/**
 * Filters search history by query, tolerating a single typo when no exact
 * substring match exists. Mirrors searchAutocomplete's plain substring
 * filter for the common case, only falling back to fuzzy matching.
 * @template {{query:string}} T
 * @param {T[]} list
 * @param {string} query
 * @param {number} maxDistance
 * @returns {T[]}
 */
export function fuzzyFilterHistory (list, query, maxDistance = 1) {
  const q = String(query ?? '').trim().toLowerCase();
  if (q.length < 2) return list.slice(0, 10);

  const exact = list.filter(e => e.query.toLowerCase().includes(q));
  if (exact.length || q.length < 3) return exact;

  return list.filter(e => {
    const words = e.query.toLowerCase().split(/\s+/);
    return words.some(w => levenshtein(w, q) <= maxDistance) ||
           levenshtein(e.query.toLowerCase(), q) <= maxDistance;
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH INSIGHTS — TOP SEARCHES, TRENDING, FANDOMS
═══════════════════════════════════════════════════════════════════════════ */

function normalize (q) { return String(q ?? '').trim().toLowerCase(); }

/**
 * Most frequently repeated queries in the local history.
 * @param {{query:string}[]} history
 * @param {number} n
 * @returns {{query:string, count:number}[]}
 */
export function topSearches (history, n = 5) {
  const counts = new Map();
  history.forEach(e => {
    const key = normalize(e.query);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([query, count]) => ({ query, count }))
    .filter(e => e.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Queries searched more often in the newer half of the history than in the
 * older half — a lightweight, purely-local stand-in for "trending".
 * `history` is expected newest-first (as stored by historyPush).
 * @param {{query:string}[]} history
 * @param {number} n
 * @returns {string[]}
 */
export function trendingSearches (history, n = 3) {
  if (history.length < 4) return [];
  const mid = Math.floor(history.length / 2);
  const newer = history.slice(0, mid);
  const older = history.slice(mid);

  const countIn = (list) => {
    const m = new Map();
    list.forEach(e => {
      const key = normalize(e.query);
      if (key) m.set(key, (m.get(key) || 0) + 1);
    });
    return m;
  };
  const newerCounts = countIn(newer);
  const olderCounts = countIn(older);

  return Array.from(newerCounts.entries())
    .filter(([q, c]) => c > (olderCounts.get(q) || 0))
    .sort((a, b) => (b[1] - (olderCounts.get(b[0]) || 0)) - (a[1] - (olderCounts.get(a[0]) || 0)))
    .slice(0, n)
    .map(([q]) => q);
}

/**
 * Top fandoms searched, as bar-chart-ready rows (pct relative to the top one).
 * Only history entries that captured a `fandom` are counted.
 * @param {{fandom?:string|null}[]} history
 * @param {number} n
 * @returns {{fandom:string, count:number, pct:number}[]}
 */
export function fandomBarData (history, n = 5) {
  const counts = new Map();
  history.forEach(e => {
    const key = (e.fandom || '').trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const rows = Array.from(counts.entries())
    .map(([fandom, count]) => ({ fandom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
  const max = rows[0]?.count || 1;
  return rows.map(r => ({ ...r, pct: Math.round((r.count / max) * 100) }));
}

/**
 * Determine the fandom to record for a search-history entry: the tag page's
 * fandom when browsing `/tags/{fandom}/works`, otherwise whatever the
 * search form's fandom field currently holds.
 * @param {{pathname:string, fandomFieldValue?:string}} ctx
 * @returns {string|null}
 */
export function extractFandomFromContext ({ pathname, fandomFieldValue }) {
  const tagMatch = String(pathname || '').match(/^\/tags\/([^/]+)\/works\/?$/);
  if (tagMatch) {
    try { return decodeURIComponent(tagMatch[1]); } catch { return tagMatch[1]; }
  }
  const v = (fandomFieldValue || '').trim();
  return v ? v.split(',')[0].trim() : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   REFINEMENT TIPS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * A short, rule-based tip based on how many results are on the page.
 * @param {number} resultCount
 * @returns {string|null}
 */
export function buildRefinementTip (resultCount) {
  if (resultCount === 0) return 'No results? Try removing a tag or filter to broaden your search.';
  if (resultCount >= 20) return 'Lots of results? Try adding another tag or filter to narrow things down.';
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK SEARCH TEMPLATES
═══════════════════════════════════════════════════════════════════════════ */

/** Built-in starter templates that tweak the current search's sort/filters. */
export const QUICK_TEMPLATES = [
  { label: '🔥 Most kudos',        params: { 'work_search[sort_column]': 'kudos_count', 'work_search[sort_direction]': 'desc' } },
  { label: '🆕 Recently updated',  params: { 'work_search[sort_column]': 'revised_at',   'work_search[sort_direction]': 'desc' } },
  { label: '✅ Complete only',     params: { 'work_search[complete]': 'T' } },
  { label: '📏 Longest first',     params: { 'work_search[sort_column]': 'word_count',   'work_search[sort_direction]': 'desc' } },
];

/**
 * Applies a template's params onto a URL, replacing any existing values for
 * those same keys and leaving every other current filter untouched.
 * @param {string} url - current page URL
 * @param {Record<string,string>} params
 * @returns {string}
 */
export function buildTemplateUrl (url, params) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
}
