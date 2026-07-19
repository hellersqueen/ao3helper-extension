/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Helpers

Pure logic behind the shelf's sorting/filtering, priority levels, the manual
reorder math, random pick, CSV/links export, reading-time estimates,
milestone toasts, staleness/new-chapter detection, and reminder scheduling
(snooze, recurrence, habit-based suggestion). Kept separate from the
DOM-facing submodules so it can be tested without a DOM harness.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   PRIORITY
═══════════════════════════════════════════════════════════════════════════ */

export const PRIORITIES = ['high', 'normal', 'low'];

/** @param {string|undefined} priority @returns {number} higher = more urgent */
export function priorityWeight (priority) {
  const idx = PRIORITIES.indexOf(priority);
  return idx === -1 ? 1 : (PRIORITIES.length - 1 - idx);
}


/* ═══════════════════════════════════════════════════════════════════════════
   HIDDEN GEMS — mirrors ficEngagement/hiddenGems.js's thresholds so a work
   flagged as a gem elsewhere on the site reads the same way here. Kept as a
   local, self-contained copy rather than a cross-module import (this
   extension's modules only share data through lib/storage/keys.js and
   window globals, never by importing each other's files directly).
═══════════════════════════════════════════════════════════════════════════ */

const GEM_THRESHOLDS = { minRatio: 0.05, maxKudos: 100, maxBookmarks: 10, minHits: 50, minKudos: 5 };

/** @param {{kudos?:number|null, hits?:number|null, bookmarks?:number|null}} stats */
export function isGem (stats) {
  if (!stats) return false;
  const { kudos, hits, bookmarks } = stats;
  if (!kudos || !hits) return false;
  if (hits < GEM_THRESHOLDS.minHits || kudos < GEM_THRESHOLDS.minKudos) return false;
  const ratio = kudos / hits;
  const lowPop = kudos <= GEM_THRESHOLDS.maxKudos || (bookmarks != null && bookmarks <= GEM_THRESHOLDS.maxBookmarks);
  return ratio >= GEM_THRESHOLDS.minRatio && lowPop;
}


/* ═══════════════════════════════════════════════════════════════════════════
   SORTING
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @typedef {Object} SortEntry
 * @property {string} wid
 * @property {*} [blurbEl]
 * @property {string} [title]
 * @property {number} [words]
 * @property {number} [updated]
 * @property {number} [addedAt]
 * @property {number} [order]
 * @property {string} [priority]
 * @property {{kudos?:number|null, hits?:number|null, bookmarks?:number|null}} [stats]
 */

/**
 * Sorts shelf entries by the given mode. Pure — returns a new array.
 * 'smart' is a transparent, documented multi-key sort (not an opaque
 * heuristic): priority first, then hidden gems, then oldest-saved first.
 * @param {SortEntry[]} entries
 * @param {'date'|'title'|'words'|'updated'|'priority'|'manual'|'gems'|'smart'} mode
 * @returns {SortEntry[]}
 */
export function sortEntries (entries, mode) {
  const arr = [...(entries || [])];
  switch (mode) {
    case 'title':
      return arr.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    case 'words':
      return arr.sort((a, b) => (b.words || 0) - (a.words || 0));
    case 'updated':
      return arr.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    case 'priority':
      return arr.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || (b.addedAt || 0) - (a.addedAt || 0));
    case 'manual':
      return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    case 'gems':
      return arr.sort((a, b) => Number(isGem(b.stats)) - Number(isGem(a.stats)) || (b.addedAt || 0) - (a.addedAt || 0));
    case 'smart':
      return arr.sort((a, b) => {
        const byPriority = priorityWeight(b.priority) - priorityWeight(a.priority);
        if (byPriority) return byPriority;
        const byGem = Number(isGem(b.stats)) - Number(isGem(a.stats));
        if (byGem) return byGem;
        return (a.addedAt || 0) - (b.addedAt || 0); // oldest-saved surfaces first
      });
    case 'date':
    default:
      return arr.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }
}

/**
 * Moves one element of an array from one index to another. Pure.
 * @template T
 * @param {T[]} arr
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {T[]}
 */
export function reorderArray (arr, fromIndex, toIndex) {
  const next = [...arr];
  if (fromIndex < 0 || fromIndex >= next.length || toIndex < 0 || toIndex >= next.length) return next;
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * @template T
 * @param {T[]} items
 * @param {() => number} [rng]
 * @returns {T|null}
 */
export function pickRandom (items, rng = Math.random) {
  if (!items || !items.length) return null;
  return items[Math.floor(rng() * items.length)];
}


/* ═══════════════════════════════════════════════════════════════════════════
   READING TIME
═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_WPM = 250;

/** @returns {number} estimated minutes to read `words` at `wpm` */
export function estimateReadingMinutes (words, wpm = DEFAULT_WPM) {
  if (!words || words <= 0 || !wpm || wpm <= 0) return 0;
  return words / wpm;
}

/** @param {{words?: number}[]} items @returns {number} total minutes for the whole shelf */
export function estimateTotalReadingMinutes (items, wpm = DEFAULT_WPM) {
  return (items || []).reduce((sum, item) => sum + estimateReadingMinutes(item.words, wpm), 0);
}

/**
 * Picks the item(s) that best fit a given time budget: the entry using the
 * most of the available time without going over, or — if nothing fits — the
 * single shortest entry.
 * @param {{words?: number}[]} items
 * @param {number} minutesAvailable
 * @param {number} [wpm]
 * @returns {Object|null}
 */
export function suggestByTimeBudget (items, minutesAvailable, wpm = DEFAULT_WPM) {
  const withTime = (items || []).map(item => ({ item, minutes: estimateReadingMinutes(item.words, wpm) }));
  if (!withTime.length) return null;
  const fitting = withTime.filter(e => e.minutes > 0 && e.minutes <= minutesAvailable);
  if (fitting.length) return fitting.sort((a, b) => b.minutes - a.minutes)[0].item;
  return withTime.sort((a, b) => a.minutes - b.minutes)[0].item;
}


/* ═══════════════════════════════════════════════════════════════════════════
   MILESTONES
═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];

/**
 * @param {number} prevCount @param {number} newCount @param {number[]} [thresholds]
 * @returns {number[]}
 */
export function milestonesCrossed (prevCount, newCount, thresholds = DEFAULT_MILESTONES) {
  return thresholds.filter(t => prevCount < t && newCount >= t);
}


/* ═══════════════════════════════════════════════════════════════════════════
   STALENESS AND UPDATE DETECTION
═══════════════════════════════════════════════════════════════════════════ */

const DAY_MS = 24 * 60 * 60 * 1000;

/** @returns {boolean} true when an item has sat unread past thresholdDays */
export function isStale (item, thresholdDays, now = Date.now()) {
  if (!item?.addedAt) return false;
  return (now - item.addedAt) >= thresholdDays * DAY_MS;
}

/**
 * Compares an item's snapshot at add-time to its current state.
 * @param {{chaptersAtAdd?: number|null, completeAtAdd?: boolean|null}} item
 * @param {{chapters?: number|null, complete?: boolean|null}} current
 * @returns {{hasNewChapter: boolean, hasCompleted: boolean}}
 */
export function detectUpdates (item, current) {
  const hasNewChapter = item?.chaptersAtAdd != null && current?.chapters != null && current.chapters > item.chaptersAtAdd;
  const hasCompleted = item?.completeAtAdd === false && current?.complete === true;
  return { hasNewChapter, hasCompleted };
}


/* ═══════════════════════════════════════════════════════════════════════════
   REMINDERS — SNOOZE, RECURRENCE, HABIT-BASED SUGGESTION
═══════════════════════════════════════════════════════════════════════════ */

/** @returns {number} new remindAt, pushed `days` forward from whichever is later: now or the current remindAt */
export function snoozeDate (remindAt, days, now = Date.now()) {
  return Math.max(now, remindAt || 0) + days * DAY_MS;
}

const RECURRENCE_MS = { daily: DAY_MS, weekly: 7 * DAY_MS };

/** @param {number} remindAt @param {'daily'|'weekly'} frequency @returns {number|null} next occurrence, or null for a one-off */
export function nextRecurrence (remindAt, frequency) {
  const step = RECURRENCE_MS[frequency];
  return step ? remindAt + step : null;
}

/**
 * Peak reading hour (0-23) from activityPanel session history, or null when
 * there isn't enough data. A soft cross-module read: activityPanel may not
 * be installed/enabled, in which case sessions is simply empty.
 * @param {{hourOfDay?: number}[]} sessions
 * @returns {number|null}
 */
export function peakHourFromSessions (sessions) {
  if (!sessions || !sessions.length) return null;
  const byHour = new Array(24).fill(0);
  sessions.forEach(s => { if (s.hourOfDay >= 0 && s.hourOfDay < 24) byHour[s.hourOfDay]++; });
  const max = Math.max(...byHour);
  return max > 0 ? byHour.indexOf(max) : null;
}

/**
 * Suggests a default reminder date/time: tomorrow at the user's peak reading
 * hour, or 7pm tomorrow when no habit data is available.
 * @param {number|null} peakHour
 * @param {number} [now]
 * @returns {Date}
 */
export function suggestReminderDate (peakHour, now = Date.now()) {
  const d = new Date(now + DAY_MS);
  d.setHours(peakHour != null ? peakHour : 19, 0, 0, 0);
  return d;
}


/* ═══════════════════════════════════════════════════════════════════════════
   STATISTICS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * How many shelved works were actually read afterwards (per readingTracker's
 * history), and how many were dropped (per ficAppreciation's status).
 * @param {{wid:string, addedAt?:number}[]} items
 * @param {Set<string>} readWorkIds
 * @param {Set<string>} droppedWorkIds
 */
export function computeConversionStats (items, readWorkIds, droppedWorkIds) {
  const total = (items || []).length;
  const read = (items || []).filter(i => readWorkIds?.has(String(i.wid))).length;
  const dropped = (items || []).filter(i => droppedWorkIds?.has(String(i.wid))).length;
  return {
    total,
    read,
    dropped,
    readPercent: total ? Math.round((read / total) * 100) : 0,
  };
}


/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════════════════ */

function csvEscape (value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** @param {{wid:string, title?:string, addedAt?:number, priority?:string, note?:string, group?:string}[]} items */
export function toCSV (items) {
  const header = ['title', 'url', 'addedAt', 'priority', 'note', 'group'];
  const rows = (items || []).map(i => [
    i.title || '',
    `https://archiveofourown.org/works/${i.wid}`,
    i.addedAt ? new Date(i.addedAt).toISOString() : '',
    i.priority || 'normal',
    i.note || '',
    i.group || '',
  ].map(csvEscape).join(','));
  return [header.join(','), ...rows].join('\n');
}

/** @param {{wid:string}[]} items @returns {string} one AO3 work URL per line */
export function toLinksList (items) {
  return (items || []).map(i => `https://archiveofourown.org/works/${i.wid}`).join('\n');
}
