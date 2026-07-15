/* ═══════════════════════════════════════════════════════════════════════════
   DRAG REORDER - Réordonnancement d'une liste par glisser-déposer
   Why: deux implémentations complètes (~60 lignes chacune) du même mécanisme
   (tagsReordering, ficActions) avec les mêmes subtilités : insertion au point
   médian, classes de dragging, cleanup. La persistance de l'ordre (clé +
   format) reste chez l'appelant via onOrderChanged.
═══════════════════════════════════════════════════════════════════════════ */

const NS = 'ao3h';

/**
 * Rend les <li> d'une liste réordonnables par drag & drop.
 * @param {HTMLElement} list - Le UL/OL conteneur
 * @param {Object} opts
 * @param {(li: HTMLElement) => string|null} [opts.getItemKey] - Clé stable
 *   d'un item ; requis si onOrderChanged est fourni
 * @param {(order: string[]) => void} [opts.onOrderChanged] - Appelé après
 *   chaque drop avec l'ordre courant des clés
 * @param {string} [opts.handleGlyph] - Glyphe de la poignée (défaut: '⋮⋮')
 * @param {string} [opts.itemSelector] - Sélecteur des items (défaut: ':scope > li')
 * @returns {() => void} Cleanup : retire poignées, listeners et classes
 */
export function makeListReorderable(list, {
  getItemKey = null,
  onOrderChanged = null,
  handleGlyph = '⋮⋮',
  itemSelector = ':scope > li',
} = {}) {
  const items = Array.from(list.querySelectorAll(itemSelector));
  if (items.length < 2) return () => {};

  let dragging = null;

  function currentOrder() {
    if (!getItemKey) return [];
    return Array.from(list.querySelectorAll(itemSelector))
      .map(getItemKey)
      .filter(Boolean);
  }

  function onDragStart(e) {
    dragging = e.currentTarget;
    dragging.classList.add(`${NS}-dragging`);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd() {
    if (dragging) dragging.classList.remove(`${NS}-dragging`);
    dragging = null;
    list.querySelectorAll(`.${NS}-drag-over`).forEach((el) =>
      el.classList.remove(`${NS}-drag-over`));
    onOrderChanged?.(currentOrder());
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget;
    if (!dragging || target === dragging) return;
    const rect = target.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    list.insertBefore(dragging, e.clientY < mid ? target : target.nextSibling);
  }

  items.forEach((li) => {
    li.setAttribute('draggable', 'true');
    if (!li.querySelector(`.${NS}-drag-handle`)) {
      const handle = document.createElement('span');
      handle.className = `${NS}-drag-handle`;
      handle.title = 'Drag to reorder';
      handle.textContent = handleGlyph;
      handle.setAttribute('aria-hidden', 'true');
      li.prepend(handle);
    }
    li.addEventListener('dragstart', onDragStart);
    li.addEventListener('dragend', onDragEnd);
    li.addEventListener('dragover', onDragOver);
  });

  return function cleanup() {
    items.forEach((li) => {
      li.removeEventListener('dragstart', onDragStart);
      li.removeEventListener('dragend', onDragEnd);
      li.removeEventListener('dragover', onDragOver);
      li.removeAttribute('draggable');
      li.classList.remove(`${NS}-dragging`, `${NS}-drag-over`);
    });
    list.querySelectorAll(`.${NS}-drag-handle`).forEach((h) => h.remove());
  };
}

/**
 * Ré-applique un ordre sauvegardé à une liste (les items dont la clé n'est
 * pas dans savedOrder sont poussés à la fin, dans leur ordre actuel).
 * @param {HTMLElement} list - Le UL/OL conteneur
 * @param {string[]} savedOrder - Clés dans l'ordre voulu
 * @param {(li: HTMLElement) => string|null} getItemKey - Clé stable d'un item
 * @param {string} [itemSelector] - Sélecteur des items (défaut: ':scope > li')
 */
export function applySavedOrder(list, savedOrder, getItemKey, itemSelector = ':scope > li') {
  if (!savedOrder?.length) return;
  const items = Array.from(list.querySelectorAll(itemSelector));
  const byKey = {};
  items.forEach((li) => {
    const k = getItemKey(li);
    if (k) byKey[k] = li;
  });
  savedOrder.forEach((key) => { if (byKey[key]) list.appendChild(byKey[key]); });
  items.forEach((li) => {
    const k = getItemKey(li);
    if (k && !savedOrder.includes(k)) list.appendChild(li);
  });
}
