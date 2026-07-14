import { KEY_LATER_SHELF_ITEMS } from '../../../../lib/storage/keys.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';

const MOD = 'laterShelf';

export const SK_ITEMS = KEY_LATER_SHELF_ITEMS;

const DEFAULTS = {
  showQuickButton: true,
  remindersEnabled: false,
};

export function cfg (key) {
  try {
    const settings = JSON.parse(localStorage.getItem(`ao3h:mod:${MOD}:settings`) || '{}');
    return key in settings ? settings[key] : DEFAULTS[key];
  } catch { return DEFAULTS[key]; }
}

export function loadItems () {
  try { return JSON.parse(localStorage.getItem(SK_ITEMS) || '[]'); } catch { return []; }
}

export function saveItems (items) {
  try { localStorage.setItem(SK_ITEMS, JSON.stringify(items)); } catch { /* unavailable */ }
}

export function markCurrent () {
  const match = location.pathname.match(/\/works\/(\d+)/);
  if (!match) return false;
  const wid = match[1];
  const items = loadItems();
  if (items.some(item => String(item.wid || item) === wid)) return true;
  const title = document.querySelector('h2.title.heading, .title.heading')?.textContent?.trim() || `Work ${wid}`;
  items.push({ wid, title, addedAt: Date.now() });
  saveItems(items);
  document.dispatchEvent(new CustomEvent(EV_MARKED_FOR_LATER, { detail: { workId: wid, title } }));
  return true;
}
