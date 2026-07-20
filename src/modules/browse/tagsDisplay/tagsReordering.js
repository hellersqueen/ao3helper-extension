/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Tags Reordering

Makes work-page tag categories drag-reorderable, persists each category order
per work, and provides a reset control when a custom order exists.

Notes

- Fandom, character, relationship, and freeform categories are independent.
- Saved orders use tag names rather than the retired numeric-index format.
- Disabling the feature restores AO3’s original order.
- This integration has not yet been tested against the live AO3 site.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';
import { makeListReorderable, applySavedOrder } from '../../../../lib/ui/drag-reorder.js';
import { downloadJSON, pickJSONFile } from '../../../../lib/utils/json-file.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'tagsReordering';
const NS   = 'ao3h';
const W    = getGlobalWindow();
const findMatchingRule = (...args) => W.AO3H_TagsDisplay.findMatchingRule(...args);
const sortAlphabetical = (...args) => W.AO3H_TagsDisplay.sortAlphabetical(...args);
const sortByImportance = (...args) => W.AO3H_TagsDisplay.sortByImportance(...args);
const sortByLength = (...args) => W.AO3H_TagsDisplay.sortByLength(...args);

const TAG_TYPES = ['fandom', 'character', 'relationship', 'freeform'];


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PERSISTED TAG ORDER
═══════════════════════════════════════════════════════════════════════════ */

function getWorkId () {
  return extractWorkIdFromHref(location.pathname);
}

function storageKey (workId, tagType) {
  return `ao3h:tagsDisplay:order:${workId}:${tagType}`;
}

function getItemKey (li) {
  const text = (li.querySelector('a.tag')?.textContent || li.textContent || '').trim();
  return text || null;
}

function loadOrder (workId, tagType) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(workId, tagType)));
    return Array.isArray(saved) ? saved : null;
  } catch (_) { return null; }
}

function saveOrder (workId, tagType, order) {
  try { localStorage.setItem(storageKey(workId, tagType), JSON.stringify(order)); }
  catch (_) {}
}

function clearOrder (workId, tagType) {
  try { localStorage.removeItem(storageKey(workId, tagType)); } catch (_) {}
}

// "Importance" sort reads tagHighlighting's own rules directly (same
// module, so importing its pure matcher is fine) — a highlighted tag
// counts as important.
function loadHighlightRules () {
  try {
    const arr = JSON.parse(localStorage.getItem(`${NS}:tagHighlights`));
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — WORK-WIDE ORDER EXPORT / IMPORT
═══════════════════════════════════════════════════════════════════════════ */

function exportWorkOrder (workId) {
  const data = {};
  TAG_TYPES.forEach(t => { const o = loadOrder(workId, t); if (o) data[t] = o; });
  downloadJSON(data, `ao3h-tag-order-${workId}.json`);
}

async function importWorkOrder (workId, onImported) {
  let data;
  try { data = await pickJSONFile(); } catch { alert('Import failed: invalid JSON file.'); return; }
  if (data == null) return; // cancelled
  if (!data || typeof data !== 'object') { alert('Import failed: expected a JSON object of { tagType: [tag names] }.'); return; }
  TAG_TYPES.forEach(t => { if (Array.isArray(data[t])) saveOrder(workId, t, data[t]); });
  onImported();
}

function buildOrderToolbar (workId, onImported) {
  const bar = document.createElement('div');
  bar.className = `${NS}-tags-order-toolbar`;

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.textContent = 'Export tag order';
  exportBtn.addEventListener('click', () => exportWorkOrder(workId));

  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.textContent = 'Import tag order';
  importBtn.addEventListener('click', () => importWorkOrder(workId, onImported));

  bar.append(exportBtn, importBtn);
  return bar;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — DRAG REORDERING AND RESET CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

function syncResetButton (list, workId, tagType, onReset) {
  const hasSaved = loadOrder(workId, tagType) !== null;
  const btnId    = `${NS}-reset-${tagType}`;
  const existing = document.getElementById(btnId);

  if (hasSaved && !existing) {
    const btn = document.createElement('button');
    btn.id          = btnId;
    btn.className   = `${NS}-tags-reset-order`;
    btn.dataset.tagtype = tagType;
    btn.textContent = 'Reset order';
    btn.addEventListener('click', () => {
      onReset();
      clearOrder(workId, tagType);
      btn.remove();
    });
    list.insertAdjacentElement('afterend', btn);
  } else if (!hasSaved && existing) {
    existing.remove();
  }
}

// Sort buttons apply the given sort, persist the result, and refresh the
// Reset-order button exactly like a manual drag would.
function addSortButtons (list, workId, tagType, getDragCleanup) {
  const bar = document.createElement('div');
  bar.className = `${NS}-tags-sort-buttons`;

  function applyAndPersist (sortedLis) {
    const order = sortedLis.map(getItemKey).filter(Boolean);
    applySavedOrder(list, order, getItemKey, ':scope > li');
    saveOrder(workId, tagType, order);
    syncResetButton(list, workId, tagType, () => getDragCleanup().resetToOriginal());
  }

  const alphaBtn = document.createElement('button');
  alphaBtn.type = 'button';
  alphaBtn.textContent = 'A→Z';
  alphaBtn.title = 'Sort alphabetically';
  alphaBtn.addEventListener('click', () => {
    const items = Array.from(list.querySelectorAll(':scope > li'));
    applyAndPersist(sortAlphabetical(items, getItemKey));
  });

  const lengthBtn = document.createElement('button');
  lengthBtn.type = 'button';
  lengthBtn.textContent = 'Length';
  lengthBtn.title = 'Sort shortest to longest';
  lengthBtn.addEventListener('click', () => {
    const items = Array.from(list.querySelectorAll(':scope > li'));
    applyAndPersist(sortByLength(items, getItemKey));
  });

  const importanceBtn = document.createElement('button');
  importanceBtn.type = 'button';
  importanceBtn.textContent = '★ Important first';
  importanceBtn.title = 'Highlighted tags first';
  importanceBtn.addEventListener('click', () => {
    const items = Array.from(list.querySelectorAll(':scope > li'));
    const rules = loadHighlightRules();
    const isImportant = (key) => !!findMatchingRule(key, rules);
    applyAndPersist(sortByImportance(items, getItemKey, isImportant));
  });

  bar.append(alphaBtn, lengthBtn, importanceBtn);
  list.insertAdjacentElement('afterend', bar);
  return bar;
}

function initList (list, workId, tagType) {
  const items = Array.from(list.querySelectorAll(':scope > li'));
  if (items.length < 2) return null;

  applySavedOrder(list, loadOrder(workId, tagType), getItemKey, ':scope > li');

  const dragCleanup = /** @type {(() => void) & { resetToOriginal: () => void, sortBar?: HTMLElement }} */ (makeListReorderable(list, {
    getItemKey,
    onOrderChanged: (order) => {
      saveOrder(workId, tagType, order);
      syncResetButton(list, workId, tagType, () => dragCleanup.resetToOriginal());
    },
    handleGlyph: '⋮⋮',
    itemSelector: ':scope > li',
  }));

  syncResetButton(list, workId, tagType, () => dragCleanup.resetToOriginal());
  const sortBar = addSortButtons(list, workId, tagType, () => dragCleanup);

  dragCleanup.sortBar = sortBar;
  return dragCleanup;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Tags Reordering',
  parent:           'tagsDisplay',
  enabledByDefault: false,
}, async function init () {
  const workId = getWorkId();
  if (!workId) return () => {};

  const cleanups = [];
  let lastList = null;
  TAG_TYPES.forEach(tagType => {
    const list = document.querySelector(`dd.${tagType}.tags ul`);
    if (!list) return;
    const cleanup = initList(list, workId, tagType);
    if (cleanup) { cleanups.push(cleanup); lastList = list; }
  });

  let orderToolbar = null;
  if (lastList) {
    orderToolbar = buildOrderToolbar(workId, () => location.reload());
    lastList.insertAdjacentElement('afterend', orderToolbar);
  }

  return () => {
    // Restaure l'ordre natif AO3 avant de retirer le drag & drop, pour ne
    // pas laisser un ordre personnalisé visible après désactivation.
    cleanups.forEach(fn => { fn.resetToOriginal(); fn.sortBar?.remove(); fn(); });
    orderToolbar?.remove();
    document.querySelectorAll(`.${NS}-tags-reset-order`).forEach(el => el.remove());
  };
});
