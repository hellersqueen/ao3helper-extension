/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Dashboard › Stats

Pure functions computing the dashboard's "Reading insights" (diversity,
re-read rate, reader profile) and the "Year in fics" recap from the stored
visited-works list. Extracted from readingDashboard.js so this logic can be
unit-tested without a DOM.

Every function reads only `works[]` entries shaped like:
  { id, title, url, fandoms: string[], tags: string[], completed: boolean,
    lastVisited: number (ms epoch), visitCount?: number }

═══════════════════════════════════════════════════════════════════════════ */

function dayKey (timestamp) {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Distinct fandom/tag counts across the stored (capped) visit history — a
 * simple, non-judgmental read on how varied someone's reading has been.
 * @param {Array} works
 * @returns {{ workCount: number, fandomCount: number, tagCount: number }}
 */
export function computeDiversity (works) {
  const fandoms = new Set();
  const tags = new Set();
  (works || []).forEach(w => {
    (w?.fandoms || []).forEach(f => f && fandoms.add(f.toLowerCase()));
    (w?.tags || []).forEach(t => t && tags.add(t.toLowerCase()));
  });
  return { workCount: (works || []).length, fandomCount: fandoms.size, tagCount: tags.size };
}

/**
 * Percentage of stored works that were revisited at least once
 * (`visitCount > 1`). Entries without a `visitCount` (pre-existing data)
 * count as a single visit.
 * @param {Array} works
 * @returns {number} 0-100
 */
export function computeRereadPercent (works) {
  const total = (works || []).length;
  if (!total) return 0;
  const reread = works.filter(w => (w?.visitCount || 1) > 1).length;
  return Math.round((reread / total) * 100);
}

/**
 * A lightweight, purely descriptive reading-pattern label — not a badge or
 * streak (see "Aucune section ... Badges et séries de lecture" design
 * decision), just a one-line observation derived from the same data already
 * shown elsewhere on the dashboard.
 * @param {Array} works
 * @returns {{ label: string, detail: string } | null} null when there isn't
 *   enough data yet to say anything meaningful
 */
export function computeReaderProfile (works) {
  const total = (works || []).length;
  if (total < 3) return null;

  const completedCount = works.filter(w => w?.completed).length;
  const completionRate = completedCount / total;

  const activeDays = new Set(works.map(w => dayKey(w?.lastVisited)).filter(Boolean));
  const worksPerActiveDay = total / (activeDays.size || 1);

  if (completionRate >= 0.7) {
    return {
      label: 'Completionist',
      detail: `You've finished ${Math.round(completionRate * 100)}% of the works you've opened recently.`,
    };
  }
  if (worksPerActiveDay >= 3) {
    return {
      label: 'Marathon reader',
      detail: `You tend to open several works (~${worksPerActiveDay.toFixed(1)}) in the same sitting.`,
    };
  }
  return {
    label: 'Casual reader',
    detail: 'You read at a relaxed, spread-out pace.',
  };
}

/**
 * "Your year in fics" recap for a given calendar year, computed from the
 * stored visit history. Limited to whatever is still within the 200-entry
 * cap — older visits from earlier in the year may already have been
 * evicted, so this is a recap of "recent visits that happened to fall in
 * that year", not a complete yearly log.
 * @param {Array} works
 * @param {number} [year] - defaults to the current calendar year
 * @returns {{ year: number, totalWorks: number, completedCount: number,
 *   wipCount: number, topFandom: string|null, distinctFandoms: number,
 *   distinctTags: number }}
 */
export function computeYearRecap (works, year) {
  const targetYear = year ?? new Date().getFullYear();
  const inYear = (works || []).filter(w => w?.lastVisited && new Date(w.lastVisited).getFullYear() === targetYear);

  const completedCount = inYear.filter(w => w.completed).length;
  const fandomCounts = {};
  const tagCounts = {};
  inYear.forEach(w => {
    (w.fandoms || []).forEach(f => { const k = f.toLowerCase(); if (k) fandomCounts[k] = (fandomCounts[k] || 0) + 1; });
    (w.tags || []).forEach(t => { const k = t.toLowerCase(); if (k) tagCounts[k] = (tagCounts[k] || 0) + 1; });
  });

  const topFandomEntry = Object.entries(fandomCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    year: targetYear,
    totalWorks: inYear.length,
    completedCount,
    wipCount: inYear.length - completedCount,
    topFandom: topFandomEntry ? topFandomEntry[0] : null,
    distinctFandoms: Object.keys(fandomCounts).length,
    distinctTags: Object.keys(tagCounts).length,
  };
}
