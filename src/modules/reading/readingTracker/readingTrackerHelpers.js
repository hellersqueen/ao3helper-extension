/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Tracker › Helpers

Pure logic shared across Reading Tracker submodules: revisit counting,
history grouping/sorting/cleanup, reading-speed estimation, progress
milestones, donut-chart math, "Updated" date formatting, and the
Continue Reading picklist. No DOM or storage access — everything here
takes plain data in and returns plain data out.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   REVISIT COUNTING
═══════════════════════════════════════════════════════════════════════════ */

/** @param {{visitCount?: number}|undefined} prevEntry @returns {number} */
export function nextVisitCount (prevEntry) {
  if (!prevEntry) return 1;
  return (prevEntry.visitCount || 1) + 1;
}


/* ═══════════════════════════════════════════════════════════════════════════
   HISTORY GROUPING, SORTING, PINNING
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Buckets history entries into a timeline: today / yesterday / this week / older.
 * @param {{seenAt?: number, lastReadAt?: number}[]} history
 * @param {number} [now]
 * @returns {{today: any[], yesterday: any[], thisWeek: any[], older: any[]}}
 */
export function groupHistoryByPeriod (history, now = Date.now()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayStart      = startOfToday.getTime();
  const yesterdayStart  = todayStart - 86400000;
  const weekStart       = todayStart - 7 * 86400000;

  const groups = { today: [], yesterday: [], thisWeek: [], older: [] };
  for (const entry of history) {
    const ts = entry.lastReadAt || entry.seenAt || 0;
    if (ts >= todayStart) groups.today.push(entry);
    else if (ts >= yesterdayStart) groups.yesterday.push(entry);
    else if (ts >= weekStart) groups.thisWeek.push(entry);
    else groups.older.push(entry);
  }
  return groups;
}

/**
 * @template {{title?: string, seenAt?: number, lastReadAt?: number, pinned?: boolean}} T
 * @param {T[]} history
 * @param {'date'|'title'} sortKey
 * @returns {T[]}
 */
export function sortHistory (history, sortKey = 'date') {
  const sorted = [...history].sort((a, b) => {
    if (sortKey === 'title') return (a.title || '').localeCompare(b.title || '');
    return (b.lastReadAt || b.seenAt || 0) - (a.lastReadAt || a.seenAt || 0);
  });
  return sorted;
}

/**
 * @template {{pinned?: boolean}} T
 * @param {T[]} history
 * @returns {T[]} pinned entries first, each group keeping its relative order
 */
export function pinnedFirst (history) {
  const pinned    = history.filter(e => e.pinned);
  const unpinned  = history.filter(e => !e.pinned);
  return [...pinned, ...unpinned];
}

/**
 * Entries eligible for automatic cleanup: not pinned, and older than the cutoff.
 * @param {{id?: string, lastReadAt?: number, seenAt?: number, pinned?: boolean}[]} history
 * @param {number} olderThanDays
 * @param {number} [now]
 * @returns {string[]} ids to remove (assumes entries carry an `id`)
 */
export function entriesToCleanUp (history, olderThanDays, now = Date.now()) {
  const cutoff = now - olderThanDays * 86400000;
  return history
    .filter(e => !e.pinned && (e.lastReadAt || e.seenAt || 0) < cutoff)
    .map(e => e.id)
    .filter(Boolean);
}


/* ═══════════════════════════════════════════════════════════════════════════
   READING SPEED
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Average words-per-minute from a set of {words, ms} samples (each sample:
 * words scrolled through in ms milliseconds). Discards non-positive samples.
 * @param {{words: number, ms: number}[]} samples
 * @returns {number|null}
 */
export function computeReadingSpeed (samples) {
  const valid = samples.filter(s => s.words > 0 && s.ms > 0);
  if (!valid.length) return null;
  const totalWords = valid.reduce((a, s) => a + s.words, 0);
  const totalMs     = valid.reduce((a, s) => a + s.ms, 0);
  return Math.round((totalWords / totalMs) * 60000);
}


/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS MILESTONES AND DONUT MATH
═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_MILESTONES = [25, 50, 75];

/**
 * @param {number} prevPct
 * @param {number} newPct
 * @param {number[]} [thresholds]
 * @returns {number[]}
 */
export function progressMilestonesCrossed (prevPct, newPct, thresholds = DEFAULT_MILESTONES) {
  return thresholds.filter(t => prevPct < t && newPct >= t);
}

/**
 * SVG stroke-dasharray values for a donut ring of the given circumference.
 * @param {number} pct - 0-100
 * @param {number} circumference
 * @returns {{dash: number, gap: number}}
 */
export function donutDashArray (pct, circumference) {
  const dash = Math.max(0, Math.min(100, pct)) / 100 * circumference;
  return { dash: Math.round(dash * 10) / 10, gap: Math.round((circumference - dash) * 10) / 10 };
}


/* ═══════════════════════════════════════════════════════════════════════════
   "UPDATED" DATE LABEL
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {number} updatedAt
 * @param {'relative'|'exact'} format
 * @param {(ts: number) => string} relativeFn
 * @returns {string}
 */
export function formatUpdatedLabel (updatedAt, format, relativeFn) {
  if (format === 'exact') return new Date(updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return relativeFn(updatedAt);
}


/* ═══════════════════════════════════════════════════════════════════════════
   CONTINUE READING PICKLIST
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Most-recent in-progress works: visited, has a saved chapter, and not yet
 * on the last known chapter (a rough "not finished" proxy).
 * @param {{id: string, title?: string, href?: string, chapterHref?: string|null, lastReadAt?: number, chapter?: number|null, totalChapters?: number|null}[]} history
 * @param {number} [limit]
 * @returns {typeof history}
 */
export function buildContinueReadingList (history, limit = 5) {
  return [...history]
    .filter(e => e.chapter && (!e.totalChapters || e.chapter < e.totalChapters))
    .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
    .slice(0, limit);
}
