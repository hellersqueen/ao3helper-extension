/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager › Helpers

Pure logic shared across Filter Manager submodules: AO3 date parsing,
three-state quick-filter cycling, kudos/hits ratio math, preset merging,
search-history capping, and read-series set comparison. No DOM or storage
access — everything here takes plain data in and returns plain data out.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   AO3 DATE PARSING
═══════════════════════════════════════════════════════════════════════════ */

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * Parses AO3's blurb datetime format ("15 Jan 2024") into a Date.
 * @param {string} text
 * @returns {Date|null}
 */
export function parseAO3Date (text) {
  if (!text) return null;
  const m = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(text.trim());
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (month === undefined) return null;
  return new Date(+m[3], month, +m[1]);
}

/**
 * @param {Date|null} date
 * @param {'today'|'week'|'month'} range
 * @returns {boolean} true if date falls within range of "now"
 */
export function isWithinDateRange (date, range) {
  if (!date) return false;
  const now  = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days < 0) return true; // future/today edge case from timezone rounding
  if (range === 'today') return days === 0;
  if (range === 'week')  return days <= 7;
  if (range === 'month') return days <= 31;
  return true;
}

/**
 * A work "looks abandoned": incomplete (WIP) and not updated in `months`.
 * @param {Date|null} lastUpdated
 * @param {boolean} isComplete
 * @param {number} [months]
 * @returns {boolean}
 */
export function looksAbandoned (lastUpdated, isComplete, months = 12) {
  if (isComplete || !lastUpdated) return false;
  const days = (Date.now() - lastUpdated.getTime()) / 86400000;
  return days >= months * 30;
}


/* ═══════════════════════════════════════════════════════════════════════════
   THREE-STATE QUICK FILTERS (all / only / hide)
═══════════════════════════════════════════════════════════════════════════ */

/** @type {Array<'all'|'only'|'hide'>} */
const THREE_STATE_CYCLE = ['all', 'only', 'hide'];

/** @param {'all'|'only'|'hide'} current @returns {'all'|'only'|'hide'} */
export function nextThreeState (current) {
  const i = THREE_STATE_CYCLE.indexOf(current);
  return THREE_STATE_CYCLE[(i + 1) % THREE_STATE_CYCLE.length];
}

/**
 * Whether a blurb should be hidden given a three-state filter and its own flag.
 * @param {'all'|'only'|'hide'} state
 * @param {boolean} matches - e.g. isOneshot(blurb)
 * @returns {boolean}
 */
export function shouldHideForThreeState (state, matches) {
  if (state === 'only') return !matches;
  if (state === 'hide') return matches;
  return false;
}


/* ═══════════════════════════════════════════════════════════════════════════
   KUDOS / HITS RATIO
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {number|null} kudos
 * @param {number|null} hits
 * @returns {number|null} kudos/hits as a percentage, or null if hits is unknown/zero
 */
export function kudosRatio (kudos, hits) {
  if (!hits || kudos == null) return null;
  return Math.round((kudos / hits) * 1000) / 10; // one decimal place
}

/**
 * @param {number|null} ratio
 * @param {number} minPercent
 * @returns {boolean} true if the work should be hidden (ratio known and below threshold)
 */
export function belowRatioThreshold (ratio, minPercent) {
  if (ratio === null) return false;
  return ratio < minPercent;
}


/* ═══════════════════════════════════════════════════════════════════════════
   TAG COUNT / SUMMARY LENGTH
═══════════════════════════════════════════════════════════════════════════ */

/** @param {number} count @param {number} threshold @returns {boolean} */
export function belowTagThreshold (count, threshold) {
  return threshold > 0 && count < threshold;
}

/** @param {string} summaryText @param {number} minLength @returns {boolean} true if it should be hidden */
export function summaryTooShort (summaryText, minLength) {
  const len = (summaryText || '').trim().length;
  if (minLength <= 0) return len === 0;
  return len < minLength;
}


/* ═══════════════════════════════════════════════════════════════════════════
   READ-SERIES SET COMPARISON
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {string[]} seriesWorkIds - every workId belonging to the series
 * @param {Set<string>|string[]} readWorkIds - workIds the user has visited
 * @returns {boolean} true only if every work in the series has been read
 */
export function isSeriesFullyRead (seriesWorkIds, readWorkIds) {
  if (!seriesWorkIds.length) return false;
  const read = readWorkIds instanceof Set ? readWorkIds : new Set(readWorkIds);
  return seriesWorkIds.every(id => read.has(id));
}


/* ═══════════════════════════════════════════════════════════════════════════
   PRESET MERGING
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Merges two presets' filter fields into one. `b` wins field conflicts;
 * multi-tag text fields (comma-separated) are unioned instead of overwritten.
 * @param {{filters?: Record<string, any>}} a
 * @param {{filters?: Record<string, any>}} b
 * @param {Set<string>} multiTagFields - field names that hold comma-separated tags
 * @returns {Record<string, any>}
 */
export function mergePresetFilters (a, b, multiTagFields) {
  const merged = { ...(a.filters || {}) };
  for (const [field, value] of Object.entries(b.filters || {})) {
    const existing = merged[field];
    if (multiTagFields.has(field) && typeof existing === 'string' && typeof value === 'string') {
      const tags = new Set([
        ...existing.split(',').map(t => t.trim()).filter(Boolean),
        ...value.split(',').map(t => t.trim()).filter(Boolean),
      ]);
      merged[field] = [...tags].join(', ');
    } else if (Array.isArray(existing) && Array.isArray(value)) {
      merged[field] = [...new Set([...existing, ...value])];
    } else if (value !== '' && value != null) {
      merged[field] = value;
    }
  }
  return merged;
}


/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH HISTORY (auto-captured filter combos)
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @template {{ts: number}} T
 * @param {T[]} history
 * @param {T} entry
 * @param {number} [cap]
 * @returns {T[]} newest first, capped
 */
export function addSearchHistoryEntry (history, entry, cap = 20) {
  return [entry, ...history].slice(0, cap);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FILTER USAGE STATISTICS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {Record<string, number>} stats
 * @param {string} key
 * @returns {Record<string, number>}
 */
export function incrementUsage (stats, key) {
  return { ...stats, [key]: (stats[key] || 0) + 1 };
}

/**
 * @param {Record<string, number>} stats
 * @param {number} [limit]
 * @returns {{key: string, count: number}[]}
 */
export function topUsage (stats, limit = 5) {
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}
