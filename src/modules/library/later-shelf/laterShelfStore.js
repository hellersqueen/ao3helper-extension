const MOD = 'laterShelf';

export const SK_ITEMS = 'ao3h:laterShelf:items';

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
  return true;
}
