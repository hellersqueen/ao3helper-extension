/* ═══════════════════════════════════════════════════════════════════════════
   LIST MANAGER - Modale « gérer une liste » (recherche, ajout, suppression,
   export/import, groupes repliables)
   Why: hiddenTags, nopeWords et whitelistExceptions avaient chacun ~150-200
   lignes quasi identiques pour cette modale (backdrop, scroll-lock, focus
   trap, recherche débouncée, ligne avec suppression à confirmation,
   export/import JSON). Ce module ne porte que la mécanique UI ; toutes les
   opérations de données (charger, ajouter, retirer, importer) restent des
   callbacks fournis par l'appelant — pour ne rien changer aux différences de
   comportement déjà existantes entre les 3 gestionnaires (ex: whitelist
   n'appelle pas processList() après un ajout, contrairement à nopeWords).
═══════════════════════════════════════════════════════════════════════════ */

import { downloadJSON, pickJSONFile } from '../utils/json-file.js';

/**
 * Ouvre une modale de gestion de liste.
 * @param {Object} opts
 * @param {string} opts.NS - Namespace (préfixe des classes CSS)
 * @param {Object} [opts.KeyboardNav] - { setupMenuKeyboardNav, createFocusTrap }
 * @param {string} opts.title - Titre affiché (h3)
 * @param {string} [opts.searchPlaceholder]
 * @param {() => Promise<string[]>} opts.load - Charge la liste complète
 * @param {(item: string) => Promise<void>} opts.onRemove - Retire un item ;
 *   possède déjà toute la logique de nettoyage/notification de l'appelant
 * @param {string} [opts.removeButtonTitle]
 * @param {{ placeholder: string, onAdd: (raw: string) => Promise<void> }} [opts.add]
 *   Si fourni, affiche une ligne d'ajout (input + bouton)
 * @param {{ keyOf: (item: string) => string, ungroupedLabel?: string,
 *           getCollapsed: () => Set<string>, setCollapsed: (s: Set<string>) => void }} [opts.groupBy]
 *   Si fourni, la liste est groupée avec en-têtes repliables
 * @param {{ filename: string }} opts.exportItems - Export JSON de load()
 * @param {(incoming: any) => Promise<void>} opts.importItems - Valide et
 *   fusionne le JSON importé ; doit lever une Error(message) si invalide —
 *   le message est affiché tel quel (ex: "not a valid tags array")
 * @param {Array<{ label: string, title?: string, onClick: () => (Promise<void>|void) }>} [opts.extraActions]
 *   Boutons additionnels dans la barre d'actions (ex: export/import des groupes)
 * @param {(msg: string) => void} [opts.toast]
 * @returns {{ close: () => void, reload: () => Promise<void> }}
 */
export function openListManagerDialog({
  NS,
  KeyboardNav = {},
  title,
  searchPlaceholder = 'Search…',
  load,
  onRemove,
  removeButtonTitle = 'Remove this item',
  add = null,
  groupBy = null,
  exportItems,
  importItems,
  extraActions = [],
  toast = () => {},
}) {
  const backdrop = document.createElement('div');
  backdrop.className = `${NS}-mgr-backdrop`;

  const box = document.createElement('div');
  box.className = `${NS}-mgr`;

  const addRowHTML = add ? `
      <div class="${NS}-nope-add-row">
        <input class="${NS}-nope-add-input" type="text" placeholder="${add.placeholder}" />
        <button class="${NS}-ul-btn ${NS}-nope-add-btn" type="button">Add</button>
      </div>` : '';

  const extraActionsHTML = extraActions.map((a, i) =>
    `<button class="${NS}-ul-btn ${NS}-ul-extra-${i}" type="button"${a.title ? ` title="${a.title}"` : ''}>${a.label}</button>`
  ).join('');

  box.innerHTML = `
    <button class="${NS}-close-x" type="button" aria-label="Close" title="Close">×</button>
    <h3>${title}</h3>
    <div class="${NS}-ul-head">
      <input class="${NS}-ul-search" type="search" placeholder="${searchPlaceholder}" />
      <span class="${NS}-ul-count">0 / 0</span>
    </div>${addRowHTML}
    <div class="${NS}-ul-actions">
      <button class="${NS}-ul-btn ${NS}-ul-export" type="button">Export JSON</button>
      <button class="${NS}-ul-btn ${NS}-ul-import" type="button">Import JSON</button>${extraActionsHTML}
    </div>
    <div class="${NS}-ul-list" aria-live="polite"></div>
  `;

  let cleanupKeyboard = null;
  let focusTrap       = null;

  const close = () => {
    try { cleanupKeyboard?.(); } catch {}
    try { focusTrap?.deactivate(); } catch {}
    document.documentElement.classList.remove(`${NS}-lock`);
    document.body.classList.remove(`${NS}-lock`);
    const y = parseInt(document.body.dataset[`${NS}ScrollY`] || '0', 10);
    document.body.style.top = '';
    delete document.body.dataset[`${NS}ScrollY`];
    window.scrollTo(0, y);
    backdrop.remove();
    box.remove();
  };

  backdrop.addEventListener('click', close);
  backdrop.addEventListener('wheel',     e => e.preventDefault(), { passive: false });
  backdrop.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  box.querySelector(`.${NS}-close-x`).addEventListener('click', close);

  if (KeyboardNav.setupMenuKeyboardNav) {
    cleanupKeyboard = KeyboardNav.setupMenuKeyboardNav(box, { onClose: close, vertical: true });
  }
  if (KeyboardNav.createFocusTrap) {
    focusTrap = KeyboardNav.createFocusTrap(box);
    focusTrap.activate();
  }
  function esc (e) {
    if (e.key !== 'Escape') return;
    close();
    document.removeEventListener('keydown', esc);
  }
  document.addEventListener('keydown', esc);

  document.body.append(backdrop, box);

  // Lock scroll
  document.documentElement.classList.add(`${NS}-lock`);
  document.body.classList.add(`${NS}-lock`);
  const startY = window.scrollY || window.pageYOffset || 0;
  document.body.dataset[`${NS}ScrollY`] = String(startY);
  document.body.style.top = `-${startY}px`;

  const $search = box.querySelector(`.${NS}-ul-search`);
  const $count  = box.querySelector(`.${NS}-ul-count`);
  const $list   = box.querySelector(`.${NS}-ul-list`);

  function makeRow (item) {
    const row = document.createElement('div');
    row.className = `${NS}-ul-row`;

    const label = document.createElement('span');
    label.className   = `${NS}-ul-tag`;
    label.textContent = item;

    const del = document.createElement('button');
    del.className   = `${NS}-ul-btn ${NS}-ul-del`;
    del.textContent = '🗑️';
    del.title       = removeButtonTitle;
    del.addEventListener('click', () => {
      if (del.dataset.confirming === 'true') return;
      del.dataset.confirming = 'true';
      del.title = '';

      const confirm  = document.createElement('button');
      confirm.className   = `${NS}-ul-btn ${NS}-ul-del-confirm`;
      confirm.textContent = '✓';
      confirm.title       = 'Confirm removal';

      const cancel  = document.createElement('button');
      cancel.className   = `${NS}-ul-btn ${NS}-ul-del-cancel`;
      cancel.textContent = '✗';
      cancel.title       = 'Cancel';

      del.replaceWith(confirm, cancel);

      cancel.addEventListener('click', () => {
        confirm.replaceWith(del);
        cancel.remove();
        delete del.dataset.confirming;
        del.title = removeButtonTitle;
      });

      confirm.addEventListener('click', async () => {
        await onRemove(item);
        reload();
      });
    });

    row.append(label, del);
    return row;
  }

  const toNorm = (s) => (s || '').toString().trim().toLowerCase();

  async function reload () {
    const items = await load();
    const qn    = toNorm($search.value);
    // En mode groupé, une recherche matche aussi le nom du groupe (pas
    // seulement le texte de l'item) — comportement d'origine de hiddenTags.
    const filtered = !qn ? items.slice() : items.filter(it =>
      toNorm(it).includes(qn) || (groupBy && toNorm(groupBy.keyOf(it) || '').includes(qn))
    );

    const prevScrollTop = $list.scrollTop;
    $list.innerHTML = '';

    if (!groupBy) {
      filtered
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        .forEach(item => $list.append(makeRow(item)));
      $count.textContent = `${filtered.length} / ${items.length}`;
      try { $list.scrollTop = prevScrollTop; } catch {}
      return;
    }

    // ── Mode groupé (ex: hiddenTags) ─────────────────────────────────────
    const domHasGroups = $list.querySelectorAll(`.${NS}-ul-group`).length > 0;
    const expandedNow = domHasGroups
      ? new Set(
          Array.from($list.querySelectorAll(`.${NS}-ul-group[aria-expanded="true"]`))
            .map(el => el?.dataset?.gname || '')
            .filter(Boolean)
        )
      : null;
    const collapsedFromStorage = expandedNow === null ? groupBy.getCollapsed() : null;

    const grouped = new Map();
    for (const item of filtered) {
      const key = groupBy.keyOf(item) || (groupBy.ungroupedLabel ?? '(ungrouped)');
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    }
    for (const [, arr] of grouped) {
      arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }
    const entries = [...grouped.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }));

    let shown = 0;
    for (const [gname, groupItems] of entries) {
      const block = document.createElement('div');
      block.className     = `${NS}-ul-group`;
      block.dataset.gname = gname;
      const shouldExpand = expandedNow !== null ? expandedNow.has(gname) : !collapsedFromStorage.has(gname);
      block.setAttribute('aria-expanded', String(!!shouldExpand));

      const head = document.createElement('div');
      head.className = `${NS}-ul-ghead`;
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');

      const chev = document.createElement('span');
      chev.className  = `${NS}-ul-chevron`;
      chev.textContent = '';

      const glabel = document.createElement('span');
      glabel.className   = `${NS}-ul-glabel`;
      glabel.textContent = `${gname} — ${groupItems.length}`;

      head.append(chev, glabel);
      block.append(head);

      const wrap = document.createElement('div');
      wrap.className = `${NS}-ul-gwrap`;
      groupItems.forEach(item => { wrap.append(makeRow(item)); shown++; });
      block.append(wrap);
      $list.append(block);

      const toggleGroup = () => {
        const expanded = block.getAttribute('aria-expanded') !== 'true';
        block.setAttribute('aria-expanded', String(expanded));
        const newCollapsed = new Set(
          Array.from($list.querySelectorAll(`.${NS}-ul-group[aria-expanded="false"]`))
            .map(el => el?.dataset?.gname || '')
            .filter(Boolean)
        );
        groupBy.setCollapsed(newCollapsed);
      };
      head.addEventListener('click', toggleGroup);
      head.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(); }
      });
    }

    $count.textContent = `${shown} / ${items.length}`;
    try { $list.scrollTop = prevScrollTop; } catch {}
  }

  let searchTimer = 0;
  $search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(reload, 150);
  });

  if (add) {
    const $addInput = box.querySelector(`.${NS}-nope-add-input`);
    const $addBtn   = box.querySelector(`.${NS}-nope-add-btn`);
    const doAdd = async () => {
      const val = $addInput.value.trim();
      if (!val) return;
      await add.onAdd(val);
      $addInput.value = '';
      reload();
    };
    $addBtn.addEventListener('click', doAdd);
    $addInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });
  }

  box.querySelector(`.${NS}-ul-export`).addEventListener('click', async () => {
    downloadJSON(await load(), exportItems.filename);
  });

  box.querySelector(`.${NS}-ul-import`).addEventListener('click', async () => {
    let incoming;
    try {
      incoming = await pickJSONFile();
      if (incoming === null) return; // annulé
    } catch (err) {
      toast('Invalid JSON: ' + (err?.message || 'could not parse file'));
      return;
    }
    try {
      await importItems(incoming);
      reload();
    } catch (err) {
      toast('Invalid JSON: ' + (err?.message || 'invalid data'));
    }
  });

  extraActions.forEach((a, i) => {
    box.querySelector(`.${NS}-ul-extra-${i}`).addEventListener('click', () => a.onClick());
  });

  reload();

  return { close, reload };
}
