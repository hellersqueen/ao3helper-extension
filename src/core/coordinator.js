// src/core/coordinator.js — ES Module version
// Original: core/coordinator.js (legacy IIFE — old build system removed in Phase 27, file no longer on disk)
// Étape 312 : dépendances importées (lifecycle, globals, logger) au lieu des lectures
// window.AO3H_Globals / window.AO3H_Logger / window.AO3H ; le différé isAO3HReady
// devient inutile (l'import de lifecycle.js garantit un core initialisé).
// ao3h.manage et window.ao3hOpenHiddenWorksDialog restent posés (compat — étape 318).

import { getGlobalWindow } from '../../lib/utils/globals.js';
import { getLogger } from '../../lib/utils/logger.js';
import { EV_SETTINGS_CHANGED, EV_OPEN_HIDE_MANAGER } from '../../lib/utils/event-names.js';
import { openAO3HPanel } from '../../lib/ui/panel/lazy-panel.js';
import { AO3H, Modules } from './lifecycle.js';

// W at module level (used inside initCoordinator and its nested functions)
const W = getGlobalWindow();

// ─── ES Module Export ──────────────────────────────────────────────────────────────
// Called from src/main.js: import { init } from './core/coordinator.js'; init();
export function init() {
  initCoordinator();
}

function initCoordinator() {
  const ao3h = AO3H;
  const NS = ao3h.env?.NS || 'ao3h';

  // Logger for this module
  const log = getLogger('coordinator');

  /* ===================== DIALOG SYSTEM FOR MANAGE FEATURES ===================== */
  
  /**
   * Creates and manages the dialog for hidden works import/export
   */
  function ensureHiddenWorksDialog() {
    /** @type {HTMLDialogElement|null} */
    let dlg = /** @type {HTMLDialogElement|null} */ (document.getElementById(`${NS}-ie-dialog`));
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

      const get = (id) => document.getElementById(id);
      const ex = get(`${NS}-ie-export`);
      const im = get(`${NS}-ie-import`);
      const tr = get(`${NS}-ie-try`);
      const cancel = get(`${NS}-ie-cancel`);

      // Export button handler
      ex?.addEventListener('click', () => {
        if (typeof W.ao3hExportHiddenWorks === 'function') {
          try { 
            W.ao3hExportHiddenWorks(); 
          } finally { 
            dlg.close(); 
          }
        }
      });

      // Import button handler
      im?.addEventListener('click', () => {
        if (typeof W.ao3hImportHiddenWorks === 'function') {
          try { 
            W.ao3hImportHiddenWorks(); 
          } finally { 
            dlg.close(); 
          }
        }
      });

      // Try enable module button handler
      tr?.addEventListener('click', async () => {
        try {
          const mods = (Modules && Modules.all ? Modules.all() : []);
          const hit = mods.find(m => /hidden/i.test(m?.meta?.title || m?.name || ''));
          if (!hit) {
            alert('No module matching "hidden" was found in AO3H.modules.');
            return;
          }
          await Modules.setEnabled(hit.name, true);
          ensureHiddenWorksDialog();
          alert(`Enabled: ${hit.meta?.title || hit.name}`);
        } catch (e) {
          console.error('[AO3H] enable hidden module failed', e);
          alert('Failed to enable module. See console for details.');
        }
      });

      // Close button handler
      cancel?.addEventListener('click', () => dlg.close());
      
      // Click outside to close
      dlg.addEventListener('click', (e) => {
        const r = dlg.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right &&
                       e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) dlg.close();
      });
    }

    // Update dialog state based on available functions
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

  /**
   * Opens the hidden works dialog
   */
  function openHiddenWorksDialog() {
    ensureHiddenWorksDialog();
    const dlg = /** @type {HTMLDialogElement|null} */ (document.getElementById(`${NS}-ie-dialog`));
    if (!dlg) return;
    try { 
      dlg.showModal(); 
    } catch { 
      dlg.setAttribute('open', ''); 
    }
  }

  /* ===================== MANAGE MENU ACTIONS ===================== */

  /**
   * Creates action items for the manage submenu
   */
  function createManageActions() {
    return [
      {
        label: 'Hidden tags…',
        hint: '',
        handler: () => {
          document.dispatchEvent(new CustomEvent(EV_OPEN_HIDE_MANAGER));
        }
      },
      {
        label: 'Hidden works…',
        hint: 'Import / Export',
        handler: () => {
          openHiddenWorksDialog();
        }
      },
      {
        label: 'Text Replacer…',
        hint: '',
        handler: () => {
          openAO3HPanel('wordSwap');
        }
      }
    ];
  }

  /**
   * Gets the manage actions for use in the menu
   */
  function getManageActions() {
    return createManageActions();
  }

  /* ===================== PUBLIC API ===================== */

  // Export manage functionality
  ao3h.manage = {
    openHiddenWorksDialog,
    getManageActions,
    ensureHiddenWorksDialog
  };

  // Export individual functions for backward compatibility
  W.ao3hOpenHiddenWorksDialog = openHiddenWorksDialog;

  // ── Live-update: restart a module whenever its settings are saved ──────────
  function wireSettingsChanged() {
    const _timers = new Map();

    document.addEventListener(EV_SETTINGS_CHANGED, function(e) {
      const moduleId = e.detail?.moduleId;
      if (!moduleId) return;

      // Debounce: wait 300 ms in case multiple changes arrive at once
      clearTimeout(_timers.get(moduleId));
      _timers.set(moduleId, setTimeout(async () => {
        _timers.delete(moduleId);
        const modules = ao3h.modules;
        if (typeof modules?.restartOne === 'function') {
          log.info('Live-update restart:', moduleId);
          await modules.restartOne(moduleId);
        }
      }, 300));
    });

    log.info('✅ Live settings-change listener active');
  }
  wireSettingsChanged();
}
