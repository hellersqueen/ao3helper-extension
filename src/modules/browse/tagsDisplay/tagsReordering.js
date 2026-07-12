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
      ao3h:tagsDisplay:order:[workId]:[tagType]

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';

const MOD  = 'tagsReordering';
const NS   = 'ao3h';

const TAG_TYPES = ['fandom', 'character', 'relationship', 'freeform'];

function getWorkId () {
  return location.pathname.match(/\/works\/(\d+)/)?.[1] || null;
}

function storageKey (workId, tagType) {
  return `ao3h:tagsDisplay:order:${workId}:${tagType}`;
}

function saveOrder (list, workId, tagType) {
  const order = Array.from(list.querySelectorAll(':scope > li')).map(li =>
    parseInt(li.dataset.ao3hOrigIdx || '0', 10)
  );
  try { localStorage.setItem(storageKey(workId, tagType), JSON.stringify(order)); }
  catch (_) {}
}

function restoreOrder (list, workId, tagType) {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey(workId, tagType))); }
  catch (_) { return; }
  if (!Array.isArray(saved)) return;

  const items = Array.from(list.querySelectorAll(':scope > li'));
  const indexMap = {};
  items.forEach(li => { indexMap[parseInt(li.dataset.ao3hOrigIdx || '0', 10)] = li; });

  saved.forEach(idx => {
    const li = indexMap[idx];
    if (li) list.appendChild(li);
  });
}

function resetOrder (list) {
  const items = Array.from(list.querySelectorAll(':scope > li'));
  items.sort((a, b) =>
    parseInt(a.dataset.ao3hOrigIdx || '0', 10) - parseInt(b.dataset.ao3hOrigIdx || '0', 10)
  );
  items.forEach(li => list.appendChild(li));
}

function syncResetButton (list, workId, tagType) {
  const key     = storageKey(workId, tagType);
  const hasSaved = localStorage.getItem(key) !== null;
  const btnId   = `${NS}-reset-${tagType}`;
  const existing = document.getElementById(btnId);

  if (hasSaved && !existing) {
    const btn = document.createElement('button');
    btn.id          = btnId;
    btn.className   = `${NS}-tags-reset-order`;
    btn.dataset.tagtype = tagType;
    btn.textContent = 'Reset order';
    btn.addEventListener('click', () => {
      resetOrder(list);
      try { localStorage.removeItem(key); } catch (_) {}
      btn.remove();
    });
    list.insertAdjacentElement('afterend', btn);
  } else if (!hasSaved && existing) {
    existing.remove();
  }
}

function initList (list, workId, tagType) {
  const items = Array.from(list.querySelectorAll(':scope > li'));
  if (!items.length) return;

  let dragging = null;

  items.forEach((li, i) => {
    li.dataset.ao3hOrigIdx = String(i);
    li.setAttribute('draggable', 'true');

    const handle = document.createElement('span');
    handle.className  = `${NS}-drag-handle`;
    handle.title      = 'Drag to reorder';
    handle.textContent = '⋮⋮';
    handle.setAttribute('aria-hidden', 'true');
    li.prepend(handle);

    li.addEventListener('dragstart', e => {
      dragging = li;
      li.classList.add(`${NS}-dragging`);
      e.dataTransfer.effectAllowed = 'move';
    });

    li.addEventListener('dragend', () => {
      dragging = null;
      list.querySelectorAll(':scope > li').forEach(el => {
        el.classList.remove(`${NS}-dragging`, `${NS}-drag-over`);
      });
    });

    li.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!dragging || dragging === li) return;
      list.querySelectorAll(':scope > li').forEach(el => el.classList.remove(`${NS}-drag-over`));
      li.classList.add(`${NS}-drag-over`);
    });

    li.addEventListener('dragleave', () => {
      li.classList.remove(`${NS}-drag-over`);
    });

    li.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragging || dragging === li) return;
      li.classList.remove(`${NS}-drag-over`);

      const rect = li.getBoundingClientRect();
      const mid  = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        list.insertBefore(dragging, li);
      } else {
        list.insertBefore(dragging, li.nextSibling);
      }

      saveOrder(list, workId, tagType);
      syncResetButton(list, workId, tagType);
    });
  });

  restoreOrder(list, workId, tagType);
  syncResetButton(list, workId, tagType);
}

register(MOD, {
  title:            'Tags Reordering',
  parent:           'tagsDisplay',
  enabledByDefault: false,
}, async function init () {
  const workId = getWorkId();
  if (!workId) return () => {};

  TAG_TYPES.forEach(tagType => {
    const list = document.querySelector(`dd.${tagType}.tags ul`);
    if (list) initList(list, workId, tagType);
  });

  return () => {
    // Remove handles
    document.querySelectorAll(`.${NS}-drag-handle`).forEach(el => el.remove());
    // Remove reset buttons
    document.querySelectorAll(`.${NS}-tags-reset-order`).forEach(el => el.remove());
    // Remove draggable + drag classes + data attr; restore original order
    TAG_TYPES.forEach(tagType => {
      const list = document.querySelector(`dd.${tagType}.tags ul`);
      if (!list) return;
      list.querySelectorAll(':scope > li').forEach(li => {
        li.removeAttribute('draggable');
        li.classList.remove(`${NS}-dragging`, `${NS}-drag-over`);
      });
      resetOrder(list);
      list.querySelectorAll(':scope > li').forEach(li => {
        delete li.dataset.ao3hOrigIdx;
      });
    });
  };
});
