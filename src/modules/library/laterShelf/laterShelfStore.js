/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Shared Store

Provides Later Shelf configuration, item persistence, and the work-page action
used to add the current work to the shelf.

Notes

- Existing work IDs are not duplicated.
- New additions dispatch the shared marked-for-later event.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { KEY_LATER_SHELF_ITEMS } from '../../../../lib/storage/keys.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'laterShelf';

export const SK_ITEMS = KEY_LATER_SHELF_ITEMS;

const DEFAULTS = {
  showQuickButton: true,
  remindersEnabled: false,
};

export const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SHELF PERSISTENCE AND CURRENT-WORK MARKING
═══════════════════════════════════════════════════════════════════════════ */

export function loadItems () {
  try { return JSON.parse(localStorage.getItem(SK_ITEMS) || '[]'); } catch { return []; }
}

export function saveItems (items) {
  try { localStorage.setItem(SK_ITEMS, JSON.stringify(items)); } catch { /* unavailable */ }
}

export function markCurrent () {
  const wid = extractWorkIdFromHref(location.pathname);
  if (!wid) return false;
  const items = loadItems();
  if (items.some(item => String(item.wid || item) === wid)) return true;
  const title = document.querySelector('h2.title.heading, .title.heading')?.textContent?.trim() || `Work ${wid}`;
  items.push({ wid, title, addedAt: Date.now() });
  saveItems(items);
  document.dispatchEvent(new CustomEvent(EV_MARKED_FOR_LATER, { detail: { workId: wid, title } }));
  return true;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// Stateless exports require no explicit initialization or cleanup.
