/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer › Results Sorting Helpers

Pure scoring functions for the extra sort modes: kudos per chapter, recent
activity, and a balanced composite of engagement + recency.

═══════════════════════════════════════════════════════════════════════════ */

const RECENCY_HALF_LIFE_DAYS = 14;

/**
 * Score in [0,1], 1 = updated today, decaying with a ~14-day half-life.
 * @param {number|null} updatedAt - epoch ms, or null if unknown
 * @param {number} now - epoch ms
 * @returns {number}
 */
export function recencyScore (updatedAt, now = Date.now()) {
  if (updatedAt == null) return 0;
  const days = Math.max(0, (now - updatedAt) / 86400000);
  return 1 / (1 + days / RECENCY_HALF_LIFE_DAYS);
}

/**
 * Score a blurb's stats for a given sort mode. Higher is better; the caller
 * sorts descending. Unknown/zero denominators fall back to 0 rather than
 * throwing or returning NaN/Infinity.
 * @param {string} mode
 * @param {{kudos?:number|null, hits?:number|null, bookmarks?:number|null,
 *          chapters?:number|null, updatedAt?:number|null}} stats
 * @param {number} now - epoch ms (injectable for tests)
 * @returns {number}
 */
export function scoreForMode (mode, stats, now = Date.now()) {
  const kudos     = stats.kudos ?? 0;
  const hits      = stats.hits ?? 0;
  const bookmarks = stats.bookmarks ?? 0;
  const chapters  = stats.chapters ?? 0;

  switch (mode) {
    case 'kudos_ratio':       return hits > 0 ? kudos / hits : 0;
    case 'save_rate':         return kudos > 0 ? bookmarks / kudos : 0;
    case 'kudos':             return kudos;
    case 'hits':               return hits;
    case 'kudos_per_chapter': return chapters > 0 ? kudos / chapters : kudos;
    case 'recent':            return recencyScore(stats.updatedAt, now);
    case 'balanced': {
      const ratio = hits > 0 ? kudos / hits : 0;
      // Weighted so neither a stale-but-loved fic nor a brand-new,
      // barely-read one dominates the top of the list on its own.
      return ratio * 60 + recencyScore(stats.updatedAt, now) * 40;
    }
    default: return 0; // 'default' = no reorder
  }
}
