/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Skip Works

   Configuration panel for the Skip Works module.
   Self-contained: includes config HTML + all rendering logic (list, presets).
   No dependency on modules/Browse/skipWorks/skipWorks.js being loaded.

   Sections:
   - Hidden Work Display
   - Quick Note Presets
   - Skipped Works List
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'skipWorks';
// ─── HTML TEMPLATE ────────────────────────────────────────────────────────
export const config = `

                <!-- ─── DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Hidden Work Display</div>
                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Replace with</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="block" checked> Grey block (with note + options)</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="remove"> Remove completely</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Replace with -->
                <div class="ao3h-setting-description">Grey block shows the note + Show / Edit / Unhide buttons</div>
                </div><!-- /.ao3h-config-section: Hidden Work Display -->

                <!-- ─── QUICK NOTE PRESETS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Note Presets</div>
                <div class="ao3h-setting-description">Short labels offered as quick options when hiding a work. Click × to remove.</div>
                <div id="ao3h-skipWorks-presets-container" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-config-section: Quick Note Presets -->

                <!-- ─── LIST ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Skipped Works List</div>
                <div id="ao3h-skipWorks-list-container" class="ao3h-config-block"></div>
                <div class="ao3h-module-list-footer ao3h-config-block">
                    <span class="ao3h-module-list-count" id="ao3h-skipWorks-count"></span>
                </div>
                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-list">Import (JSON)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-list">Export (JSON)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-all">🗑️ Clear All</button>
                </div>
                </div><!-- /.ao3h-config-section: Skipped Works List -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.


// ─── RENDERING LOGIC ──────────────────────────────────────────────────────
// Self-contained: opens its own IndexedDB connection, reads localStorage.
// Fires on ao3h:configOpen so containers are populated when the panel opens.

// Étape 316 : UserLocalStorage et detectUser importés directement (avant : lectures
// window.AO3H_Common, cassées côté Vite depuis le retrait de la pose à l'étape 314).
// Le bundler legacy (supprimé en Phase 27) remplaçait ces imports par des shims window.
import { UserLocalStorage } from '../../../../storage/user.js';
import { detectUser as detectAO3User } from '../../../../utils/user-detector.js';

const W        = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
const NS       = W.AO3H?.env?.NS || 'ao3h';
const UserLS   = UserLocalStorage || null;
const TAGS_KEY = 'm5QuickTagsUser';
const DB_STORE = 'works';

// Detect logged-in AO3 username (same logic as skipWorks.js)
function detectUser() {
  return detectAO3User() || 'guest';
}

// ── IndexedDB helpers ──────────────────────────────────────────────────────
let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const dbName = `ao3h-hiddenWorksDB-${detectUser()}`;
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, { keyPath: 'workId' });
        store.createIndex('reason', 'reason', { unique: false });
        store.createIndex('isHidden', 'isHidden', { unique: false });
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

async function getAllWorks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = e => reject(e.target.error);
  });
}

async function getWork(workId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(workId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror   = e => reject(e.target.error);
  });
}

async function putWork(rec) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put(rec);
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

// ── Quick Tags (localStorage) ──────────────────────────────────────────────
function getQuickTags() {
  try {
    const v = UserLS
      ? UserLS.getJSON(TAGS_KEY, null)
      : JSON.parse(localStorage.getItem(`${NS}:${TAGS_KEY}`) || 'null');
    return Array.isArray(v) ? v : ['Crossover', 'AU', 'Not my ship', 'Too long', 'Already read'];
  } catch { return []; }
}

function saveQuickTags(tags) {
  try {
    if (UserLS) UserLS.setJSON(TAGS_KEY, tags);
    else localStorage.setItem(`${NS}:${TAGS_KEY}`, JSON.stringify(tags));
  } catch {}
}

// ── Render: Skipped Works List ─────────────────────────────────────────────
async function renderConfigList(configArea) {
  const root = configArea || document;
  const listContainer = root.querySelector('#ao3h-skipWorks-list-container')
                     || document.getElementById('ao3h-skipWorks-list-container');
  const countEl       = root.querySelector('#ao3h-skipWorks-count')
                     || document.getElementById('ao3h-skipWorks-count');
  if (!listContainer) return;

  let allWorks;
  try {
    allWorks = await getAllWorks();
  } catch (err) {
    console.error('[AO3H][skipWorks-config] Failed to load works list:', err);
    listContainer.innerHTML = `<p style="color:#c00;font-size:11px;padding:6px 0;margin:0;">⚠ Could not load skipped works list (${err?.message || err}).</p>`;
    return;
  }
  const hidden   = allWorks.filter(w => w.isHidden);

  if (countEl) countEl.textContent = `${hidden.length} work${hidden.length !== 1 ? 's' : ''} skipped`;

  if (hidden.length === 0) {
    listContainer.innerHTML = `<p style="color:#bbb;font-size:11px;font-style:italic;padding:6px 0;margin:0;">No works skipped yet.</p>`;
    return;
  }

  const listEl = document.createElement('div');
  listEl.className = 'ao3h-module-list ao3h-skipworks-list';

  for (const rec of hidden) {
    const workNum = rec.workId.replace(/^\/works\//, '').split('/')[0];
    const entry   = document.createElement('div');
    entry.className = 'ao3h-module-list-entry ao3h-skipworks-entry';
    entry.dataset.workId = rec.workId;
    entry.innerHTML = `
      <div class="ao3h-module-list-entry-title">
        <a href="https://archiveofourown.org${rec.workId}" target="_blank">Work #${workNum}</a>
      </div>
      ${rec.reason ? `<span class="ao3h-module-list-entry-badge ao3h-skipworks-note" data-full="${rec.reason.replace(/"/g, '&quot;')}">${rec.reason}</span>` : ''}
      <div class="ao3h-module-list-entry-actions">
        <button class="ao3h-inline-btn ao3h-inline-btn--danger" data-action="unhide">Unhide</button>
      </div>`;
    listEl.appendChild(entry);
  }

  listContainer.innerHTML = '';
  listContainer.appendChild(listEl);

  // Truncation detection after paint
  requestAnimationFrame(() => {
    listContainer.querySelectorAll('.ao3h-skipworks-note').forEach(note => {
      if (note.scrollWidth > note.offsetWidth) note.classList.add('ao3h-skipworks-note--truncated');
    });
  });

  // Note expand on click
  listContainer.addEventListener('click', e => {
    const note = e.target.closest('.ao3h-skipworks-note--truncated');
    listContainer.querySelectorAll('.ao3h-skipworks-entry--note-open')
      .forEach(el => el.classList.remove('ao3h-skipworks-entry--note-open'));
    if (note) { e.stopPropagation(); note.closest('.ao3h-skipworks-entry').classList.add('ao3h-skipworks-entry--note-open'); }
  });

  // Unhide buttons — event delegation to avoid listener accumulation
  if (!listContainer.dataset.unhideWired) {
    listContainer.dataset.unhideWired = '1';
    listContainer.addEventListener('click', async e => {
      const btn = e.target.closest('[data-action="unhide"]');
      if (!btn) return;
      const workId = btn.closest('.ao3h-skipworks-entry').dataset.workId;
      if (!confirm('Unhide this work permanently?')) return;
      const rec = await getWork(workId);
      if (rec) { rec.isHidden = false; await putWork(rec); }
      btn.closest('.ao3h-skipworks-entry').remove();
      const remaining = listContainer.querySelectorAll('.ao3h-skipworks-entry').length;
      if (countEl) countEl.textContent = `${remaining} work${remaining !== 1 ? 's' : ''} skipped`;
      if (remaining === 0) listContainer.innerHTML = `<p style="color:#bbb;font-size:11px;font-style:italic;padding:6px 0;margin:0;">No works skipped yet.</p>`;
    });
  }
}

// ── Render: Quick Note Presets ─────────────────────────────────────────────
function renderConfigPresets(root) {
  const container = root
    ? root.querySelector('#ao3h-skipWorks-presets-container')
    : document.getElementById('ao3h-skipWorks-presets-container');
  if (!container) return;

  function rebuild() {
    const current = getQuickTags();
    container.innerHTML = `
      <div class="ao3h-skipworks-preset-add-row">
        <input type="text" class="ao3h-config-input ao3h-skipworks-preset-input" placeholder="Add a note preset…" maxlength="60">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-sw-preset-add">+ Add</button>
      </div>
      <div class="ao3h-skipworks-presets">
        ${current.map(p => `<span class="ao3h-chip ao3h-chip--neutral ao3h-skipworks-preset-chip">${p}<button title="Remove" data-preset="${p.replace(/"/g, '&quot;')}">×</button></span>`).join('')}
      </div>`;

    const inputEl   = container.querySelector('.ao3h-skipworks-preset-input');
    const addBtn    = container.querySelector('.ao3h-sw-preset-add');
    const chipsZone = container.querySelector('.ao3h-skipworks-presets');

    function addPreset() {
      const val = inputEl.value.trim();
      if (!val) return;
      const tags = getQuickTags();
      if (!tags.includes(val)) { tags.push(val); saveQuickTags(tags); }
      inputEl.value = '';
      rebuild();
    }

    addBtn.addEventListener('click', addPreset);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addPreset(); } });

    chipsZone.querySelectorAll('button[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tags = getQuickTags().filter(t => t !== btn.dataset.preset);
        saveQuickTags(tags);
        rebuild();
      });
    });
  }

  rebuild();
}

// ── Wire footer buttons (Clear All + Export) ───────────────────────────────
function wireFooterButtons(configArea) {
  const clearBtn  = configArea.querySelector('[data-action="clear-all"]');
  const exportBtn = configArea.querySelector('[data-action="export-list"]');

  if (clearBtn && !clearBtn.dataset.swWired) {
    clearBtn.dataset.swWired = '1';
    clearBtn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Clear all skipped works? This cannot be undone.')) return;
      const allWorks = await getAllWorks();
      for (const rec of allWorks) { rec.isHidden = false; await putWork(rec); }
      await renderConfigList(configArea);
      wireFooterButtons(configArea);
    });
  }

  if (exportBtn && !exportBtn.dataset.swWired) {
    exportBtn.dataset.swWired = '1';
    exportBtn.addEventListener('click', async e => {
      e.stopPropagation();
      const allWorks = await getAllWorks();
      const hidden   = allWorks.filter(w => w.isHidden);
      const blob     = new Blob([JSON.stringify(hidden, null, 2)], { type: 'application/json' });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href = url; a.download = 'ao3h-skipped-works.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  const importBtn = configArea.querySelector('[data-action="import-list"]');
  if (importBtn && !importBtn.dataset.swWired) {
    importBtn.dataset.swWired = '1';
    importBtn.addEventListener('click', e => {
      e.stopPropagation();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const incoming = JSON.parse(text);
          if (!Array.isArray(incoming)) throw new Error('Not an array');
          for (const rec of incoming) {
            if (rec.workId) await putWork(rec);
          }
          await renderConfigList(configArea);
          wireFooterButtons(configArea);
        } catch {
          alert('Import failed: please select a valid JSON export file.');
        }
      }, { once: true });
      input.click();
    });
  }
}

// Étape 316 : bloc « skipWorks_previewSetup » supprimé — posé sur window.AO3H_PanelConfigs
// mais appelé par aucun code du repo (l'ancienne page preview qui l'utilisait a changé de mécanisme).

// ── Restore saved settings into inputs ────────────────────────────────────
function restoreSettings(configArea) {
  try {
    const raw = localStorage.getItem('ao3h:mod:skipWorks:settings');
    if (!raw) return;
    const saved = JSON.parse(raw);
    configArea.querySelectorAll('[data-setting]').forEach(el => {
      const key = el.dataset.setting;
      if (!(key in saved)) return;
      if (el.type === 'checkbox') {
        el.checked = !!saved[key];
      } else if (el.type === 'radio') {
        el.checked = (el.value === saved[key]);
      } else {
        el.value = saved[key];
      }
    });
  } catch {}
}

// ── Listen for config panel open ───────────────────────────────────────────
document.addEventListener('ao3h:configOpen', e => {
  if (e.detail?.moduleId !== 'skipWorks') return;
  const configArea = e.detail?.configArea;
  if (!configArea) return;
  restoreSettings(configArea);
  renderConfigList(configArea);
  renderConfigPresets(configArea);
  wireFooterButtons(configArea);
});
