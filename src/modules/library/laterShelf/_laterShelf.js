/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Later Shelf Coordinator

    Module ID: laterShelf
    Display Name: Later Shelf
    Tab: Library

    Purpose

    Coordinates quick marked-for-later actions, shelf presentation, and timed
    reminders through coordinator-owned persistence and a runtime API.

    Submodules

    - quickMarkForLaterButton.js: listing-page pin control, note/priority on
      add, undo toast, bulk-add, whole-series add
    - markedForLaterStatus.js: badges, sorting, filtering, priority/note/group
      editing, drag reorder, grid view, CSV/links export, batch removal
    - workReminder.js: scheduled reminder notifications, snooze, recurrence,
      habit-based timing, abandoned/stale nudges, history
    - laterShelfCounterBadge.js: permanent header nav counter + preview

    Notes

    - Persistence helpers live here and are exposed through AO3H_LaterShelf.
    - Each reminder and shelf collection owns a separate storage key.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { KEY_LATER_SHELF_ITEMS } from '../../../../lib/storage/keys.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';
import { extractWorkIdFromHref, parseChapterCount } from '../../../../lib/ao3/parsers.js';
import { showToast } from '../../../../lib/ui/toast.js';
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

export const SK_ITEMS = KEY_LATER_SHELF_ITEMS;
export const SK_ARCHIVE = 'ao3h:laterShelf:archive';

const DEFAULTS = {
  showQuickButton: true,
  remindersEnabled: false,
  buttonPosition: 'after-title',
  noteOnAdd: false,
  bulkAddEnabled: false,
  autoRemoveOnFinish: false,
  gridView: false,
  staleDays: 45,
};

export const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

export const PRIORITIES = ['high', 'normal', 'low'];
const GEM_THRESHOLDS = { minRatio: 0.05, maxKudos: 100, maxBookmarks: 10, minHits: 50, minKudos: 5 };
const DEFAULT_WPM = 250;
const DEFAULT_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];
const DAY_MS = 24 * 60 * 60 * 1000;
const RECURRENCE_MS = { daily: DAY_MS, weekly: 7 * DAY_MS };

export function loadItems () {
  return lsGet(SK_ITEMS, []);
}

export function saveItems (items) {
  lsSet(SK_ITEMS, items);
}

export function addItem (wid, title, extra = {}) {
  if (!wid) return false;
  const items = loadItems();
  if (items.some(item => String(item.wid || item) === wid)) return true;
  const prevCount = items.length;
  items.push({ wid, title, addedAt: Date.now(), order: Date.now(), ...extra });
  saveItems(items);
  document.dispatchEvent(new CustomEvent(EV_MARKED_FOR_LATER, { detail: { workId: wid, title } }));
  const crossed = milestonesCrossed(prevCount, items.length);
  if (crossed.length) {
    showToast(`🎉 ${crossed[crossed.length - 1]} works saved for later!`, { type: 'success', duration: 4000 });
  }
  return true;
}

export function markCurrent () {
  const wid = extractWorkIdFromHref(location.pathname);
  if (!wid) return false;
  const title = document.querySelector('h2.title.heading, .title.heading')?.textContent?.trim() || `Work ${wid}`;
  const parsed = parseChapterCount(document.querySelector('dd.chapters'));
  return addItem(wid, title, { chaptersAtAdd: parsed.published, completeAtAdd: parsed.isComplete });
}

export function updateItem (wid, patch) {
  const items = loadItems();
  const index = items.findIndex(item => String(item.wid || item) === String(wid));
  if (index === -1) return false;
  items[index] = { ...items[index], ...patch };
  saveItems(items);
  return true;
}

export function removeItem (wid, { archive = true } = {}) {
  const items = loadItems();
  const index = items.findIndex(item => String(item.wid || item) === String(wid));
  if (index === -1) return null;
  const [removed] = items.splice(index, 1);
  saveItems(items);
  if (archive) archiveItem(removed);
  return removed;
}

export function reorderItems (orderedWids) {
  const items = loadItems();
  const byWid = new Map(items.map(item => [String(item.wid || item), item]));
  orderedWids.forEach((wid, index) => {
    const item = byWid.get(String(wid));
    if (item) item.order = index;
  });
  saveItems(items);
}

export function getGroups () {
  return [...new Set(loadItems().map(item => item.group).filter(Boolean))].sort();
}

export function loadArchive () {
  return lsGet(SK_ARCHIVE, []);
}

function saveArchive (entries) {
  lsSet(SK_ARCHIVE, entries);
}

function archiveItem (item) {
  if (!item) return;
  const archive = loadArchive();
  archive.unshift({ ...item, removedAt: Date.now() });
  saveArchive(archive.slice(0, 200));
}

export function restoreItem (wid) {
  const archive = loadArchive();
  const index = archive.findIndex(item => String(item.wid || item) === String(wid));
  if (index === -1) return false;
  const [restored] = archive.splice(index, 1);
  saveArchive(archive);
  return addItem(restored.wid, restored.title, {
    note: restored.note,
    priority: restored.priority,
    group: restored.group,
    chaptersAtAdd: restored.chaptersAtAdd,
    completeAtAdd: restored.completeAtAdd,
  });
}

export function deleteArchiveEntry (wid) {
  saveArchive(loadArchive().filter(item => String(item.wid || item) !== String(wid)));
}

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

const laterShelfApi = {
  SK_ITEMS, SK_ARCHIVE, cfg,
  loadItems, saveItems, addItem, markCurrent, updateItem, removeItem,
  reorderItems, getGroups, loadArchive, restoreItem, deleteArchiveEntry,
  PRIORITIES, priorityWeight, isGem, sortEntries, reorderArray, pickRandom,
  estimateReadingMinutes, estimateTotalReadingMinutes, suggestByTimeBudget,
  milestonesCrossed, isStale, detectUpdates, snoozeDate, nextRecurrence,
  peakHourFromSessions, suggestReminderDate, computeConversionStats, toCSV, toLinksList,
};


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Later Shelf',
  enabledByDefault: false,
}, function init () {
  W.AO3H_LaterShelf = laterShelfApi;
  return function cleanup () {
    if (W.AO3H_LaterShelf?.markCurrent === markCurrent) delete W.AO3H_LaterShelf;
  };
});
