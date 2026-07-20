/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Shared Store

Provides Later Shelf configuration, item persistence, and the work-page action
used to add the current work to the shelf. Also owns the non-destructive
removal archive (items removed from the shelf are kept here, not lost).

Notes

- Existing work IDs are not duplicated.
- New additions dispatch the shared marked-for-later event.
- Item shape: { wid, title, addedAt, priority?, note?, group?, order?,
  chaptersAtAdd?, completeAtAdd? }. Older items may lack the optional fields —
  always read them through a default.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { KEY_LATER_SHELF_ITEMS } from '../../../../lib/storage/keys.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';
import { extractWorkIdFromHref, parseChapterCount } from '../../../../lib/ao3/parsers.js';
import { showToast } from '../../../../lib/ui/toast.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'laterShelf';

/** @typedef {{ milestonesCrossed: (prevCount: number, newCount: number) => number[] }} LaterShelfHelpers */

/** @type {LaterShelfHelpers} */
let helpers = { milestonesCrossed: () => [] };

/** @param {LaterShelfHelpers} nextHelpers */
export function setLaterShelfHelpers (nextHelpers) {
  helpers = nextHelpers;
}

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
   FEATURE — SHELF PERSISTENCE
═══════════════════════════════════════════════════════════════════════════ */

export function loadItems () {
  try { return JSON.parse(localStorage.getItem(SK_ITEMS) || '[]'); } catch { return []; }
}

export function saveItems (items) {
  try { localStorage.setItem(SK_ITEMS, JSON.stringify(items)); } catch { /* unavailable */ }
}

/**
 * Adds a work to the shelf if it isn't already there.
 * @param {string} wid
 * @param {string} title
 * @param {{note?: string, priority?: string, group?: string,
 *          chaptersAtAdd?: number|null, completeAtAdd?: boolean|null}} [extra]
 * @returns {boolean} true if added or already present, false if wid is invalid
 */
export function addItem (wid, title, extra = {}) {
  if (!wid) return false;
  const items = loadItems();
  if (items.some(item => String(item.wid || item) === wid)) return true;
  const prevCount = items.length;
  const item = { wid, title, addedAt: Date.now(), order: Date.now(), ...extra };
  items.push(item);
  saveItems(items);
  document.dispatchEvent(new CustomEvent(EV_MARKED_FOR_LATER, { detail: { workId: wid, title } }));
  const crossed = helpers.milestonesCrossed(prevCount, items.length);
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

/**
 * Merges a patch into an existing item (priority, note, group, order, ...).
 * @param {string} wid
 * @param {Object} patch
 */
export function updateItem (wid, patch) {
  const items = loadItems();
  const idx = items.findIndex(item => String(item.wid || item) === String(wid));
  if (idx === -1) return false;
  items[idx] = { ...items[idx], ...patch };
  saveItems(items);
  return true;
}

/**
 * Removes a work from the shelf. Archived by default (non-destructive removal).
 * @param {string} wid
 * @param {{archive?: boolean}} [opts]
 * @returns {Object|null} the removed item, or null if it wasn't on the shelf
 */
export function removeItem (wid, { archive = true } = {}) {
  const items = loadItems();
  const idx = items.findIndex(item => String(item.wid || item) === String(wid));
  if (idx === -1) return null;
  const [removed] = items.splice(idx, 1);
  saveItems(items);
  if (archive) archiveItem(removed);
  return removed;
}

/**
 * Persists the drag-and-drop / manual sort order of the shelf.
 * @param {string[]} orderedWids - work IDs in their new display order
 */
export function reorderItems (orderedWids) {
  const items = loadItems();
  const byWid = new Map(items.map(item => [String(item.wid || item), item]));
  orderedWids.forEach((wid, index) => {
    const item = byWid.get(String(wid));
    if (item) item.order = index;
  });
  saveItems(items);
}

/** @returns {string[]} distinct, non-empty group names currently in use */
export function getGroups () {
  const items = loadItems();
  return [...new Set(items.map(item => item.group).filter(Boolean))].sort();
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — REMOVAL ARCHIVE
═══════════════════════════════════════════════════════════════════════════ */

export function loadArchive () {
  try { return JSON.parse(localStorage.getItem(SK_ARCHIVE) || '[]'); } catch { return []; }
}

function saveArchive (entries) {
  try { localStorage.setItem(SK_ARCHIVE, JSON.stringify(entries)); } catch { /* unavailable */ }
}

function archiveItem (item) {
  if (!item) return;
  const archive = loadArchive();
  archive.unshift({ ...item, removedAt: Date.now() });
  saveArchive(archive.slice(0, 200));
}

/**
 * Moves an archived item back onto the shelf.
 * @param {string} wid
 * @returns {boolean}
 */
export function restoreItem (wid) {
  const archive = loadArchive();
  const idx = archive.findIndex(item => String(item.wid || item) === String(wid));
  if (idx === -1) return false;
  const [restored] = archive.splice(idx, 1);
  saveArchive(archive);
  return addItem(restored.wid, restored.title, {
    note: restored.note, priority: restored.priority, group: restored.group,
    chaptersAtAdd: restored.chaptersAtAdd, completeAtAdd: restored.completeAtAdd,
  });
}

/** Permanently deletes one archive entry (does not touch the live shelf). */
export function deleteArchiveEntry (wid) {
  saveArchive(loadArchive().filter(item => String(item.wid || item) !== String(wid)));
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// Stateless exports require no explicit initialization or cleanup.
