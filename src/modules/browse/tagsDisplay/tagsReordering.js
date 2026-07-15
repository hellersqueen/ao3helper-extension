/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Reordering Submodule
    Submodule ID: tagsReordering
    Parent: tagsDisplay
    Display Name: Tags Reordering

    On work pages, lets the user drag-and-drop tags within each tag category
    (fandom, character, relationship, freeform). Order is persisted per-work
    in localStorage and restored on next visit. A "Reset order" button appears
    when a saved order exists.

    Features:
      - tagsReordering : master toggle (default: false)

    Storage keys (per work × tag type):
      ao3h:tagsDisplay:order:[workId]:[tagType]  — array of tag names, in order

    Utilise lib/ui/drag-reorder.js (makeListReorderable) — fusionné avec
    l'implémentation de ficActions (shared.md, T1). Le bouton "Reset order"
    a nécessité d'étendre la lib avec cleanup.resetToOriginal().
    ⚠️ Non testé en conditions réelles sur AO3. La clé de stockage garde le
    même nom mais change de format (index numériques → noms de tags) ; un
    ordre déjà sauvegardé par un utilisateur ne sera pas retrouvé une fois
    (retombe sur l'ordre par défaut, pas de casse).

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';
import { makeListReorderable, applySavedOrder } from '../../../../lib/ui/drag-reorder.js';

const MOD  = 'tagsReordering';
const NS   = 'ao3h';

const TAG_TYPES = ['fandom', 'character', 'relationship', 'freeform'];

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

function initList (list, workId, tagType) {
  const items = Array.from(list.querySelectorAll(':scope > li'));
  if (items.length < 2) return null;

  applySavedOrder(list, loadOrder(workId, tagType), getItemKey, ':scope > li');

  const dragCleanup = makeListReorderable(list, {
    getItemKey,
    onOrderChanged: (order) => {
      saveOrder(workId, tagType, order);
      syncResetButton(list, workId, tagType, () => dragCleanup.resetToOriginal());
    },
    handleGlyph: '⋮⋮',
    itemSelector: ':scope > li',
  });

  syncResetButton(list, workId, tagType, () => dragCleanup.resetToOriginal());

  return dragCleanup;
}

register(MOD, {
  title:            'Tags Reordering',
  parent:           'tagsDisplay',
  enabledByDefault: false,
}, async function init () {
  const workId = getWorkId();
  if (!workId) return () => {};

  const cleanups = [];
  TAG_TYPES.forEach(tagType => {
    const list = document.querySelector(`dd.${tagType}.tags ul`);
    if (!list) return;
    const cleanup = initList(list, workId, tagType);
    if (cleanup) cleanups.push(cleanup);
  });

  return () => {
    // Restaure l'ordre natif AO3 avant de retirer le drag & drop, pour ne
    // pas laisser un ordre personnalisé visible après désactivation.
    cleanups.forEach(fn => { fn.resetToOriginal(); fn(); });
    document.querySelectorAll(`.${NS}-tags-reset-order`).forEach(el => el.remove());
  };
});
