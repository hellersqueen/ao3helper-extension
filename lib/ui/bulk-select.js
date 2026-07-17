/* ═══════════════════════════════════════════════════════════════════════════
   BULK SELECT - Sélection multiple + action groupée sur les blurbs
   Why: markedForLaterStatus et organizationTools implémentaient deux fois le
   même squelette (checkbox par blurb, barre Select All / compteur / 🗑).
   L'effet de l'action reste un callback : les deux modules font des choses
   différentes (suppression côté AO3 vs retrait de la vue), et la confirmation
   appartient à l'appelant.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Installe la sélection multiple sur les blurbs d'une page de listing
 * @param {Object} opts
 * @param {string} [opts.blurbSelector] - Sélecteur des blurbs cibles
 * @param {(selected: HTMLElement[]) => void} opts.onRemove - Action groupée ;
 *   reçoit les blurbs cochés (confirmation à la charge de l'appelant)
 * @param {string} [opts.id] - Préfixe des ids/classes DOM par défaut (défaut: 'ao3h-bulk')
 * @param {{selectAll?: string, deselectAll?: string, remove?: string,
 *          selected?: (n: number) => string}} [opts.labels]
 * @param {string} [opts.barId] - Id de la barre d'action (défaut: `${id}-bar`)
 * @param {string} [opts.checkboxClass] - Classe des checkboxes (défaut: `${id}-chk`)
 * @param {string} [opts.countId] - Id du compteur (optionnel — reskin CSS existant)
 * @param {string} [opts.selectAllId] - Id du bouton Select All (optionnel)
 * @param {string} [opts.selectAllClass] - Classe additionnelle du bouton Select All (optionnel)
 * @param {string} [opts.removeId] - Id du bouton Remove (optionnel)
 * @param {string} [opts.removeClass] - Classe additionnelle du bouton Remove (optionnel)
 * @returns {{ scan(root?: ParentNode): void, destroy(): void }}
 *   scan() injecte les checkboxes sur les nouveaux blurbs (à rappeler après
 *   mutation) ; destroy() retire barre et checkboxes.
 */
export function createBulkSelect({
  blurbSelector = 'li.work.blurb, li.bookmark.blurb',
  onRemove,
  id = 'ao3h-bulk',
  labels = {},
  barId = `${id}-bar`,
  checkboxClass = `${id}-chk`,
  countId = null,
  selectAllId = null,
  selectAllClass = null,
  removeId = null,
  removeClass = null,
} = /** @type {{ blurbSelector?: string, onRemove: (selected: HTMLElement[]) => void, id?: string, labels?: { selectAll?: string, deselectAll?: string, remove?: string, selected?: (n: number) => string }, barId?: string, checkboxClass?: string, countId?: string, selectAllId?: string, selectAllClass?: string, removeId?: string, removeClass?: string }} */ ({})) {
  const L = {
    selectAll:   labels.selectAll   ?? 'Select All',
    deselectAll: labels.deselectAll ?? 'Deselect All',
    remove:      labels.remove      ?? '🗑 Remove Selected',
    selected:    labels.selected    ?? ((n) => `${n} selected`),
  };
  const CHK_CLASS = checkboxClass;
  const BAR_ID = barId;

  /**
   * @param {boolean} [checkedOnly]
   * @returns {HTMLInputElement[]}
   */
  function checkboxes(checkedOnly = false) {
    return /** @type {HTMLInputElement[]} */ (Array.from(document.querySelectorAll(
      `.${CHK_CLASS}${checkedOnly ? ':checked' : ''}`
    )));
  }

  function updateBar() {
    const bar = document.getElementById(BAR_ID);
    if (!bar) return;
    const n = checkboxes(true).length;
    bar.style.display = n ? '' : 'none';
    const count = bar.querySelector(`[data-role="count"]`);
    if (count) count.textContent = L.selected(n);
  }

  function createBar() {
    if (document.getElementById(BAR_ID)) return;
    const bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.style.display = 'none';

    const selAll = document.createElement('button');
    selAll.type = 'button';
    if (selectAllId) selAll.id = selectAllId;
    if (selectAllClass) selAll.className = selectAllClass;
    selAll.textContent = L.selectAll;
    selAll.addEventListener('click', () => {
      const someUnchecked = checkboxes().some((c) => !c.checked);
      checkboxes().forEach((c) => { c.checked = someUnchecked; });
      selAll.textContent = someUnchecked ? L.deselectAll : L.selectAll;
      updateBar();
    });

    const count = document.createElement('span');
    count.dataset.role = 'count';
    if (countId) count.id = countId;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    if (removeId) removeBtn.id = removeId;
    if (removeClass) removeBtn.className = removeClass;
    removeBtn.textContent = L.remove;
    removeBtn.addEventListener('click', () => {
      const selected = checkboxes(true)
        .map((c) => c.closest(blurbSelector))
        .filter(Boolean);
      if (!selected.length) return;
      onRemove(/** @type {HTMLElement[]} */ (selected));
      updateBar();
    });

    bar.append(selAll, count, removeBtn);
    const main = document.getElementById('main');
    (main || document.body).insertBefore(bar, (main || document.body).firstChild);
  }

  function scan(root = document) {
    createBar();
    root.querySelectorAll(blurbSelector).forEach((el) => {
      const blurb = /** @type {HTMLElement} */ (el);
      if (blurb.querySelector(`.${CHK_CLASS}`)) return;
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = CHK_CLASS;
      blurb.style.position = 'relative';
      blurb.insertBefore(chk, blurb.firstChild);
      chk.addEventListener('change', updateBar);
    });
  }

  function destroy() {
    document.getElementById(BAR_ID)?.remove();
    checkboxes().forEach((c) => c.remove());
  }

  return { scan, destroy };
}
