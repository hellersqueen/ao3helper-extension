/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Timeline › Stats

Pure functions used by the timeline: reading milestones, configurable
heatmap-intensity thresholds, and time-of-day bucketing for same-day session
dividers. Extracted so this logic can be unit-tested without a DOM.

═══════════════════════════════════════════════════════════════════════════ */

const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000];

/**
 * Retrospective, purely descriptive round-number milestones ("your Nth work
 * read"), keyed by the date they were reached — not a forward-looking goal
 * (see "Objectifs de lecture" design decision).
 * @param {Object.<string, Array>} heatmapData - dateKey → works[]
 * @returns {Object.<string, string>} dateKey → milestone label
 */
export function computeMilestones (heatmapData) {
  const dates = Object.keys(heatmapData || {}).sort();
  const milestones = {};
  let cumulative = 0;
  let nextIdx = 0;

  dates.forEach(dateKey => {
    const count = (heatmapData[dateKey] || []).length;
    for (let i = 0; i < count; i++) {
      cumulative++;
      if (nextIdx < MILESTONE_THRESHOLDS.length && cumulative === MILESTONE_THRESHOLDS[nextIdx]) {
        const label = `🏁 ${cumulative}th work read!`;
        milestones[dateKey] = milestones[dateKey] ? `${milestones[dateKey]} · ${label}` : label;
        nextIdx++;
      }
    }
  });

  return milestones;
}

const INTENSITY_THRESHOLDS = {
  // [level1, level2, level3] — count boundaries for each deeper shade.
  low:    [2, 4, 8],
  medium: [1, 2, 4],
  high:   [1, 1, 2],
};

/**
 * Maps a day's work count to a heatmap color level (0-4), with the
 * boundaries scaled by `intensity` — 'low' needs more reads per shade,
 * 'high' reaches the deepest shade sooner. 'medium' matches the original
 * fixed thresholds.
 * @param {number} count
 * @param {string} [intensity] - 'low' | 'medium' | 'high' (falls back to 'medium')
 * @returns {number} 0 (no reads) through 4 (deepest shade)
 */
export function getHeatmapLevel (count, intensity = 'medium') {
  if (!count) return 0;
  const [a, b, c] = INTENSITY_THRESHOLDS[intensity] || INTENSITY_THRESHOLDS.medium;
  if (count <= a) return 1;
  if (count <= b) return 2;
  if (count <= c) return 3;
  return 4;
}

/**
 * Buckets a Date into a coarse time-of-day label, used to add a sub-divider
 * when multiple works were read on the same calendar day at clearly
 * different times.
 * @param {Date} date
 * @returns {'Morning'|'Afternoon'|'Evening'|'Night'}
 */
export function timeOfDayBucket (date) {
  const h = date.getHours();
  if (h >= 5 && h < 12)  return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  return 'Night';
}
