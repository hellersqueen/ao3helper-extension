/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Helpers

Pure logic shared across Fic Appreciation submodules: grouped kudos stats,
rating statistics/history, kudos-time habits, completion milestones, and
kudos-history filtering. No DOM or storage access — everything here takes
plain data in and returns plain data out.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   GROUPED COUNTS (kudos by fandom / by author)
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Counts occurrences of each key returned by keyFn across a list of records.
 * @template T
 * @param {T[]} records
 * @param {(record: T) => string[]} keyFn
 * @returns {Record<string, number>}
 */
export function groupCounts (records, keyFn) {
  const out = {};
  for (const record of records) {
    for (const key of keyFn(record) || []) {
      if (!key) continue;
      out[key] = (out[key] || 0) + 1;
    }
  }
  return out;
}

/**
 * Sorts a counts map descending and returns the top N as an array.
 * @param {Record<string, number>} counts
 * @param {number} [limit]
 * @returns {{key: string, count: number}[]}
 */
export function topEntries (counts, limit = 10) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}


/* ═══════════════════════════════════════════════════════════════════════════
   RATING STATISTICS AND HISTORY
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {Record<string, {stars: number, date?: string}>} map
 * @returns {{total: number, average: number, distribution: Record<number, number>}}
 */
export function computeRatingStats (map) {
  const entries = Object.values(map);
  const total   = entries.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const { stars } of entries) {
    const bucket = Math.round(stars);
    if (distribution[bucket] !== undefined) distribution[bucket]++;
    sum += stars;
  }
  const average = total ? Math.round((sum / total) * 100) / 100 : 0;
  return { total, average, distribution };
}

/**
 * Average rating per month, ascending. @param {Record<string, {stars: number, date?: string}>} map
 * @returns {Record<string, number>}
 */
export function ratingByMonth (map) {
  const buckets = {};
  for (const { stars, date } of Object.values(map)) {
    if (!date) continue;
    const month = date.slice(0, 7);
    if (!buckets[month]) buckets[month] = { sum: 0, count: 0 };
    buckets[month].sum += stars;
    buckets[month].count++;
  }
  const out = {};
  for (const month of Object.keys(buckets).sort()) {
    out[month] = Math.round((buckets[month].sum / buckets[month].count) * 100) / 100;
  }
  return out;
}

/**
 * Returns the updated history array for a rating change (previous value pushed on change only).
 * @param {{stars: number, date?: string, history?: {stars: number, date?: string}[]}|undefined} prevEntry
 * @param {number} newStars
 * @param {number} [cap]
 * @returns {{stars: number, date?: string}[]}
 */
export function appendRatingHistory (prevEntry, newStars, cap = 10) {
  if (!prevEntry || prevEntry.stars === newStars) return prevEntry?.history || [];
  const history = [...(prevEntry.history || []), { stars: prevEntry.stars, date: prevEntry.date }];
  return history.slice(-cap);
}

/**
 * Average of category ratings (e.g. {plot, characters, writing}), or null if none set.
 * @param {Record<string, number>|undefined} categories
 * @returns {number|null}
 */
export function combinedCategoryScore (categories) {
  if (!categories) return null;
  const values = Object.values(categories).filter(v => typeof v === 'number');
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

/**
 * Resolves a click position on a star button to a whole or half-star value.
 * @param {number} clickX - Click X position relative to the button
 * @param {number} buttonWidth
 * @param {number} starIndex - 1-based index of the clicked star
 * @param {boolean} allowHalf
 * @returns {number}
 */
export function halfStarValue (clickX, buttonWidth, starIndex, allowHalf) {
  if (!allowHalf || !buttonWidth) return starIndex;
  return clickX < buttonWidth / 2 ? starIndex - 0.5 : starIndex;
}


/* ═══════════════════════════════════════════════════════════════════════════
   KUDOS-TIME HABITS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Hour-of-day distribution of kudos-giving, from entries carrying a `ts` (ms epoch).
 * Entries recorded before this feature existed lack `ts` and are excluded.
 * @param {{ts?: number}[]} entries
 * @returns {{hist: number[], counted: number}}
 */
export function hourOfDayHistogram (entries) {
  const hist = Array(24).fill(0);
  let counted = 0;
  for (const { ts } of entries) {
    if (!ts) continue;
    hist[new Date(ts).getHours()]++;
    counted++;
  }
  return { hist, counted };
}

/**
 * @param {number[]} hist - 24-slot hour-of-day histogram
 * @param {number} [topN]
 * @returns {{hour: number, count: number}[]}
 */
export function peakHours (hist, topN = 3) {
  return hist
    .map((count, hour) => ({ hour, count }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}


/* ═══════════════════════════════════════════════════════════════════════════
   COMPLETION MILESTONES AND RE-READ COUNT
═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];

/**
 * Which milestone thresholds were just crossed by going from prevCount to newCount.
 * @param {number} prevCount
 * @param {number} newCount
 * @param {number[]} [thresholds]
 * @returns {number[]}
 */
export function milestonesCrossed (prevCount, newCount, thresholds = DEFAULT_MILESTONES) {
  return thresholds.filter(t => prevCount < t && newCount >= t);
}

/** @param {{rereadCount?: number}|undefined} entry @returns {number} */
export function nextRereadCount (entry) {
  return (entry?.rereadCount || 0) + 1;
}


/* ═══════════════════════════════════════════════════════════════════════════
   KUDOS HISTORY — FILTER, SORT
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @template {{title?: string, author?: string, fandoms?: string[]}} T
 * @param {T[]} entries
 * @param {string} query
 * @returns {T[]}
 */
export function filterKudosHistory (entries, query) {
  if (!query) return entries;
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(e =>
    (e.title || '').toLowerCase().includes(q) ||
    (e.author || '').toLowerCase().includes(q) ||
    (e.fandoms || []).some(f => f.toLowerCase().includes(q))
  );
}

/**
 * @template {{date?: string}} T
 * @param {T[]} entries
 * @param {'asc'|'desc'} [order]
 * @returns {T[]}
 */
export function sortKudosHistoryByDate (entries, order = 'desc') {
  const sorted = [...entries].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  return order === 'desc' ? sorted.reverse() : sorted;
}


/* ═══════════════════════════════════════════════════════════════════════════
   KUDOSED-BUT-NOT-BOOKMARKED DIFF
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {string[]} kudosedIds
 * @param {string[]} bookmarkedIds
 * @returns {string[]} kudosedIds not present in bookmarkedIds
 */
export function diffNotBookmarked (kudosedIds, bookmarkedIds) {
  const bookmarked = new Set(bookmarkedIds);
  return kudosedIds.filter(id => !bookmarked.has(id));
}
