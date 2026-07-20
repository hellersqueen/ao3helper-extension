/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Later Shelf Coordinator

    Module ID: laterShelf
    Display Name: Later Shelf
    Tab: Library

    Purpose

    Coordinates quick marked-for-later actions, shelf presentation, and timed
    reminders through a shared store and runtime API.

    Submodules

    - quickMarkForLaterButton.js: listing-page pin control, note/priority on
      add, undo toast, bulk-add, whole-series add
    - markedForLaterStatus.js: badges, sorting, filtering, priority/note/group
      editing, drag reorder, grid view, CSV/links export, batch removal
    - workReminder.js: scheduled reminder notifications, snooze, recurrence,
      habit-based timing, abandoned/stale nudges, history
    - laterShelfCounterBadge.js: permanent header nav counter + preview

    Notes

    - Shared store helpers are available as ES exports and AO3H_LaterShelf.
    - Each reminder and shelf collection owns a separate storage key.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { SK_ITEMS, cfg, loadItems, markCurrent, saveItems, setLaterShelfHelpers } from './laterShelfStore.js';
import './markedForLaterStatus.js';
import './quickMarkForLaterButton.js';
import './workReminder.js';
import './laterShelfCounterBadge.js';
import styles from './laterShelf.css?inline';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-laterShelf');

const W    = getGlobalWindow();
const MOD  = 'laterShelf';

export { SK_ITEMS, cfg, loadItems, markCurrent, saveItems } from './laterShelfStore.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

export const PRIORITIES = ['high', 'normal', 'low'];
const GEM_THRESHOLDS = { minRatio: 0.05, maxKudos: 100, maxBookmarks: 10, minHits: 50, minKudos: 5 };
const DEFAULT_WPM = 250;
const DEFAULT_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];
const DAY_MS = 24 * 60 * 60 * 1000;
const RECURRENCE_MS = { daily: DAY_MS, weekly: 7 * DAY_MS };

export function priorityWeight (priority) {
  const idx = PRIORITIES.indexOf(priority);
  return idx === -1 ? 1 : PRIORITIES.length - 1 - idx;
}

export function isGem (stats) {
  if (!stats) return false;
  const { kudos, hits, bookmarks } = stats;
  if (!kudos || !hits || hits < GEM_THRESHOLDS.minHits || kudos < GEM_THRESHOLDS.minKudos) return false;
  const lowPopularity = kudos <= GEM_THRESHOLDS.maxKudos ||
    (bookmarks != null && bookmarks <= GEM_THRESHOLDS.maxBookmarks);
  return kudos / hits >= GEM_THRESHOLDS.minRatio && lowPopularity;
}

export function sortEntries (entries, mode) {
  const arr = [...(entries || [])];
  switch (mode) {
    case 'title': return arr.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    case 'words': return arr.sort((a, b) => (b.words || 0) - (a.words || 0));
    case 'updated': return arr.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    case 'priority': return arr.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || (b.addedAt || 0) - (a.addedAt || 0));
    case 'manual': return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    case 'gems': return arr.sort((a, b) => Number(isGem(b.stats)) - Number(isGem(a.stats)) || (b.addedAt || 0) - (a.addedAt || 0));
    case 'smart': return arr.sort((a, b) => {
      const byPriority = priorityWeight(b.priority) - priorityWeight(a.priority);
      if (byPriority) return byPriority;
      const byGem = Number(isGem(b.stats)) - Number(isGem(a.stats));
      return byGem || (a.addedAt || 0) - (b.addedAt || 0);
    });
    case 'date':
    default: return arr.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }
}

export function reorderArray (arr, fromIndex, toIndex) {
  const next = [...arr];
  if (fromIndex < 0 || fromIndex >= next.length || toIndex < 0 || toIndex >= next.length) return next;
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function pickRandom (items, rng = Math.random) {
  return items?.length ? items[Math.floor(rng() * items.length)] : null;
}

export function estimateReadingMinutes (words, wpm = DEFAULT_WPM) {
  return words > 0 && wpm > 0 ? words / wpm : 0;
}

export function estimateTotalReadingMinutes (items, wpm = DEFAULT_WPM) {
  return (items || []).reduce((sum, item) => sum + estimateReadingMinutes(item.words, wpm), 0);
}

export function suggestByTimeBudget (items, minutesAvailable, wpm = DEFAULT_WPM) {
  const withTime = (items || []).map(item => ({ item, minutes: estimateReadingMinutes(item.words, wpm) }));
  if (!withTime.length) return null;
  const fitting = withTime.filter(entry => entry.minutes > 0 && entry.minutes <= minutesAvailable);
  if (fitting.length) return fitting.sort((a, b) => b.minutes - a.minutes)[0].item;
  return withTime.sort((a, b) => a.minutes - b.minutes)[0].item;
}

export function milestonesCrossed (prevCount, newCount, thresholds = DEFAULT_MILESTONES) {
  return thresholds.filter(t => prevCount < t && newCount >= t);
}

export function isStale (item, thresholdDays, now = Date.now()) {
  return !!item?.addedAt && now - item.addedAt >= thresholdDays * DAY_MS;
}

export function detectUpdates (item, current) {
  return {
    hasNewChapter: item?.chaptersAtAdd != null && current?.chapters != null && current.chapters > item.chaptersAtAdd,
    hasCompleted: item?.completeAtAdd === false && current?.complete === true,
  };
}

export function snoozeDate (remindAt, days, now = Date.now()) {
  return Math.max(now, remindAt || 0) + days * DAY_MS;
}

export function nextRecurrence (remindAt, frequency) {
  const step = RECURRENCE_MS[frequency];
  return step ? remindAt + step : null;
}

export function peakHourFromSessions (sessions) {
  if (!sessions?.length) return null;
  const byHour = new Array(24).fill(0);
  sessions.forEach(s => { if (s.hourOfDay >= 0 && s.hourOfDay < 24) byHour[s.hourOfDay]++; });
  const max = Math.max(...byHour);
  return max > 0 ? byHour.indexOf(max) : null;
}

export function suggestReminderDate (peakHour, now = Date.now()) {
  const date = new Date(now + DAY_MS);
  date.setHours(peakHour != null ? peakHour : 19, 0, 0, 0);
  return date;
}

export function computeConversionStats (items, readWorkIds, droppedWorkIds) {
  const total = (items || []).length;
  const read = (items || []).filter(i => readWorkIds?.has(String(i.wid))).length;
  const dropped = (items || []).filter(i => droppedWorkIds?.has(String(i.wid))).length;
  return { total, read, dropped, readPercent: total ? Math.round((read / total) * 100) : 0 };
}

function csvEscape (value) {
  const text = String(value ?? '');
  return /[\",\n]/.test(text) ? `\"${text.replace(/\"/g, '\"\"')}\"` : text;
}

export function toCSV (items) {
  const header = ['title', 'url', 'addedAt', 'priority', 'note', 'group'];
  const rows = (items || []).map(i => [
    i.title || '', `https://archiveofourown.org/works/${i.wid}`,
    i.addedAt ? new Date(i.addedAt).toISOString() : '', i.priority || 'normal', i.note || '', i.group || '',
  ].map(csvEscape).join(','));
  return [header.join(','), ...rows].join('\n');
}

export function toLinksList (items) {
  return (items || []).map(i => `https://archiveofourown.org/works/${i.wid}`).join('\n');
}

const laterShelfHelpers = {
  PRIORITIES, priorityWeight, isGem, sortEntries, reorderArray, pickRandom,
  estimateReadingMinutes, estimateTotalReadingMinutes, suggestByTimeBudget,
  milestonesCrossed, isStale, detectUpdates, snoozeDate, nextRecurrence,
  peakHourFromSessions, suggestReminderDate, computeConversionStats, toCSV, toLinksList,
};

setLaterShelfHelpers(laterShelfHelpers);


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Later Shelf',
  enabledByDefault: false,
}, function init () {
  W.AO3H_LaterShelf = { loadItems, saveItems, markCurrent, SK_ITEMS, cfg, ...laterShelfHelpers };
  return function cleanup () {
    if (W.AO3H_LaterShelf?.markCurrent === markCurrent) delete W.AO3H_LaterShelf;
  };
});
