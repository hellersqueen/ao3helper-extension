/* ──────────────────────────────────────────────────────────────────────────
   DIALOG - Import/Export dialog system for Hidden Works
   Why: modal dialog system extracted for reusability
─────────────────────────────────────────────────────────────────────────── */

export function ensureIEDialog(NS) {
  let dlg = /** @type {HTMLDialogElement} */ (document.getElementById(`${NS}-ie-dialog`));
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = `${NS}-ie-dialog`;
    dlg.innerHTML = `
      <form method="dialog" style="margin:0">
        <h3 id="${NS}-ie-title">Hidden works</h3>
        <p id="${NS}-ie-desc"></p>
        <div id="${NS}-ie-row">
          <button type="button" id="${NS}-ie-export">Export JSON</button>
          <button type="button" id="${NS}-ie-import">Import JSON</button>
          <button type="button" id="${NS}-ie-try" style="display:none">Try enable module</button>
        </div>
        <div id="${NS}-ie-foot"><button id="${NS}-ie-cancel">Close</button></div>
      </form>`;
    (document.body || document.documentElement).appendChild(dlg);

    const get = (id)=> document.getElementById(id);
    const ex = get(`${NS}-ie-export`);
    const im = get(`${NS}-ie-import`);
    const tr = get(`${NS}-ie-try`);
    const cancel = get(`${NS}-ie-cancel`);

    const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

    ex?.addEventListener('click', () => {
      if (typeof W.ao3hExportHiddenWorks === 'function') {
        try { W.ao3hExportHiddenWorks(); } finally { dlg.close(); }
      }
    });
    im?.addEventListener('click', () => {
      if (typeof W.ao3hImportHiddenWorks === 'function') {
        try { W.ao3hImportHiddenWorks(); } finally { dlg.close(); }
      }
    });
    tr?.addEventListener('click', async () => {
      try {
        const modules = W.AO3H?.modules;
        const mods = (modules && modules.all ? modules.all() : []);
        const hit = mods.find(m => /hidden/i.test(m?.meta?.title || m?.name || ''));
        if (!hit) {
          alert('No module matching "hidden" was found in AO3H.modules.');
          return;
        }
        await modules.setEnabled(hit.name, true);
        ensureIEDialog(NS);
        alert(`Enabled: ${hit.meta?.title || hit.name}`);
      } catch (e) {
        console.error('[AO3H] enable hidden module failed', e);
        alert('Failed to enable module. See console for details.');
      }
    });

    cancel?.addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => {
      const r = dlg.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right &&
                     e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dlg.close();
    });
  }

  const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
  const hasExport = (typeof W.ao3hExportHiddenWorks === 'function');
  const hasImport = (typeof W.ao3hImportHiddenWorks === 'function');

  const desc = document.getElementById(`${NS}-ie-desc`);
  desc.textContent = (hasExport || hasImport)
    ? 'Choose what you want to do with your hidden-works list.'
    : 'The Hidden works module is not loaded on this page. Actions enable once the module loads.';

  const exBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById(`${NS}-ie-export`));
  const imBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById(`${NS}-ie-import`));
  const tryBtn = document.getElementById(`${NS}-ie-try`);

  if (exBtn) exBtn.disabled = !hasExport;
  if (imBtn) imBtn.disabled = !hasImport;
  if (tryBtn) tryBtn.style.display = (hasExport || hasImport) ? 'none' : 'inline-block';

  return true;
}

export function openIEDialog(NS) {
  ensureIEDialog(NS);
  const dlg = /** @type {HTMLDialogElement} */ (document.getElementById(`${NS}-ie-dialog`));
  try { dlg.showModal(); } catch { dlg.setAttribute('open',''); }
}

/* ──────────────────────────────────────────────────────────────────────────
   GENERIC DIALOG HELPERS - Reusable dialog creation utilities
   Why: Create consistent dialogs across all modules
─────────────────────────────────────────────────────────────────────────── */

/**
 * Create a generic dialog element with common setup
 * @param {Object} [options] - Dialog configuration
 * @param {string} [options.id] - Dialog element ID
 * @param {string} [options.className] - Additional CSS classes
 * @param {string} [options.title] - Dialog title
 * @param {string} [options.content] - Dialog content HTML
 * @param {Array} [options.buttons] - Array of button configs {label, className, onClick, type}
 * @param {Function} [options.onOpen] - Callback when dialog opens
 * @param {Function} [options.onClose] - Callback when dialog closes
 * @param {boolean} [options.closeOnBackdropClick] - Close on backdrop click (default: true)
 * @returns {HTMLDialogElement} The created dialog element
 */
export function createGenericDialog(options = {}) {
  const {
    id,
    className = '',
    title = '',
    content = '',
    buttons = [],
    onOpen = null,
    onClose = null,
    closeOnBackdropClick = true
  } = options;

  if (!id) {
    throw new Error('Dialog ID is required');
  }

  // Remove existing dialog with same ID
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create dialog element
  const dialog = document.createElement('dialog');
  dialog.id = id;
  if (className) {
    dialog.className = className;
  }

  // Create form wrapper
  const form = document.createElement('form');
  form.method = 'dialog';
  form.style.margin = '0';

  // Add title if provided
  if (title) {
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.id = `${id}-title`;
    form.appendChild(titleEl);
  }

  // Add content
  if (content) {
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = content;
    contentDiv.id = `${id}-content`;
    form.appendChild(contentDiv);
  }

  // Add buttons if provided
  if (buttons.length > 0) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'dialog-buttons';
    buttonContainer.id = `${id}-buttons`;

    buttons.forEach((btnConfig) => {
      const btn = document.createElement('button');
      btn.type = btnConfig.type || 'button';
      btn.textContent = btnConfig.label || 'Button';
      if (btnConfig.className) {
        btn.className = btnConfig.className;
      }
      if (btnConfig.onClick) {
        btn.addEventListener('click', (e) => {
          btnConfig.onClick(e, dialog);
        });
      }
      buttonContainer.appendChild(btn);
    });

    form.appendChild(buttonContainer);
  }

  dialog.appendChild(form);

  // Add backdrop click handler
  if (closeOnBackdropClick) {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) {
        dialog.close();
      }
    });
  }

  // Add ESC key handler
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dialog.close();
    }
  });

  // Add open/close callbacks
  if (onOpen) {
    dialog.addEventListener('open', /** @type {EventListener} */ (onOpen));
  }
  if (onClose) {
    dialog.addEventListener('close', /** @type {EventListener} */ (onClose));
  }

  // Append to body
  (document.body || document.documentElement).appendChild(dialog);

  return dialog;
}

/**
 * Show a dialog (handles both showModal and fallback)
 * @param {HTMLDialogElement|string} dialogOrId - Dialog element or ID
 */
export function showDialog(dialogOrId) {
  const dialog = typeof dialogOrId === 'string' 
    ? document.getElementById(dialogOrId)
    : dialogOrId;
  
  if (!dialog) return;
  
  try {
    dialog.showModal();
  } catch {
    dialog.setAttribute('open', '');
  }
}

/**
 * Close a dialog
 * @param {HTMLDialogElement|string} dialogOrId - Dialog element or ID
 */
export function closeDialog(dialogOrId) {
  const dialog = typeof dialogOrId === 'string'
    ? document.getElementById(dialogOrId)
    : dialogOrId;
  
  if (!dialog) return;
  
  try {
    dialog.close();
  } catch {
    dialog.removeAttribute('open');
  }
}