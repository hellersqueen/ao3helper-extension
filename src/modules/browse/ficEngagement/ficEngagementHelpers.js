/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Engagement › Helpers

Pure logic behind the comment-rate badge, the low-engagement filter, and the
Hidden Gems detector: fixed-threshold and page-relative gem detection, and
medal tiers. Kept separate from engagementMetrics.js/hiddenGems.js so this
can be tested without a DOM harness.

═══════════════════════════════════════════════════════════════════════════ */

/**
 * (comments / kudos) × 100, or null when there isn't enough data to compute it.
 * @param {{comments?: number|null, kudos?: number|null}} [stats]
 */
export function commentRate ({ comments, kudos } = {}) {
  return (comments != null && kudos) ? (comments / kudos) * 100 : null;
}

/** Generic three-tier classification ('high'/'mid'/'low'/null) for a ratio-like value. */
export function classifyLevel (value, { high, mid }) {
  if (value == null) return null;
  if (value >= high) return 'high';
  if (value >= mid) return 'mid';
  return 'low';
}

export const DEFAULT_GEM_THRESHOLDS = {
  minRatio: 0.05,   // 5%
  maxKudos: 100,
  maxBookmarks: 10,
  minHits: 50,
  minKudos: 5,
};

/**
 * Whether {kudos, hits, bookmarks} qualifies as a "hidden gem" under fixed
 * thresholds: enough data to be meaningful, a high kudos/hits ratio, but low
 * absolute popularity.
 * @param {{kudos:number|null, hits:number|null, bookmarks:number|null}} stats
 * @param {typeof DEFAULT_GEM_THRESHOLDS} [thresholds]
 */
export function isGem (stats, thresholds = DEFAULT_GEM_THRESHOLDS) {
  if (!stats) return false;
  const { kudos, hits, bookmarks } = stats;
  if (!kudos || !hits) return false;
  if (hits < thresholds.minHits || kudos < thresholds.minKudos) return false;
  const ratio = kudos / hits;
  const lowPop = kudos <= thresholds.maxKudos || (bookmarks != null && bookmarks <= thresholds.maxBookmarks);
  return ratio >= thresholds.minRatio && lowPop;
}

/**
 * Medal tier for a gem, based on how far its ratio exceeds the base
 * threshold: 'diamond' (3×), 'gold' (2×), or 'silver' (the base gem cutoff).
 * Returns null when the work isn't a gem at all.
 * @param {{kudos:number|null, hits:number|null, bookmarks:number|null}} stats
 * @param {typeof DEFAULT_GEM_THRESHOLDS} [thresholds]
 */
export function gemMedal (stats, thresholds = DEFAULT_GEM_THRESHOLDS) {
  if (!isGem(stats, thresholds)) return null;
  const ratio = stats.kudos / stats.hits;
  if (ratio >= thresholds.minRatio * 3) return 'diamond';
  if (ratio >= thresholds.minRatio * 2) return 'gold';
  return 'silver';
}

/** Average kudos/hits ratio across a list of stats (ignoring entries without enough data). */
export function averageRatio (statsList) {
  const ratios = (statsList || [])
    .filter(s => s && s.kudos && s.hits)
    .map(s => s.kudos / s.hits);
  if (!ratios.length) return null;
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

/**
 * Whether stats qualify as a gem *relative to the other works currently on
 * the page* rather than a fixed global threshold — an honest approximation
 * of "compare to the fandom average" (we only ever see the current page's
 * works, not a fandom's full corpus). Still requires low absolute
 * popularity and enough data, like the fixed-threshold detector.
 * @param {{kudos:number|null, hits:number|null, bookmarks:number|null}} stats
 * @param {number|null} pageAverageRatio
 * @param {number} multiplier - How far above the page average counts as a gem
 * @param {typeof DEFAULT_GEM_THRESHOLDS} [thresholds]
 */
export function isGemRelativeToPageAverage (stats, pageAverageRatio, multiplier, thresholds = DEFAULT_GEM_THRESHOLDS) {
  if (!stats || pageAverageRatio == null) return false;
  const { kudos, hits, bookmarks } = stats;
  if (!kudos || !hits) return false;
  if (hits < thresholds.minHits || kudos < thresholds.minKudos) return false;
  const ratio = kudos / hits;
  const lowPop = kudos <= thresholds.maxKudos || (bookmarks != null && bookmarks <= thresholds.maxBookmarks);
  return ratio >= pageAverageRatio * multiplier && lowPop;
}
