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
                <div class="ao3h-setting-label">Replace with</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="block" checked> Grey block (with note + options)</label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="banner"> Compact banner (same options, one line)</label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="dim"> Dimmed (work stays visible, faded)</label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="note"> Note only (fully visible, just annotated)</label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="skipWorks-displayMode" data-setting="displayMode" value="remove"> Remove completely</label>
                    </div>
                </div>
                <div class="ao3h-setting-description">Grey block / banner / dim all offer Show + Edit + Unhide — "Note only" skips Show since nothing is actually hidden, just annotated</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="checkbox" data-setting="confirmBeforeHide"> Ask for confirmation before hiding with the keyboard shortcut</label>
                    </div>
                </div>
                <div class="ao3h-setting-description">Only applies to the Shift/Alt/Ctrl-click shortcut — picking a reason from the popup already counts as confirming.</div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Hide button text</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input ao3h-field--md" data-setting="hideButtonText" value="Hide" maxlength="20">
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Hide button position</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideButtonPosition" data-setting="hideButtonPosition" value="title" checked> Near the title</label>
                        <label><input type="radio" name="hideButtonPosition" data-setting="hideButtonPosition" value="bottom"> Bottom of the blurb</label>
                    </div>
                </div>
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
                <div class="ao3h-config-row">
                    <input type="text" class="ao3h-config-input" id="ao3h-skipWorks-search" placeholder="Search by title, author, or note…">
                </div>
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

                <!-- ─── PRIVATE NOTES (not hidden) ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Private Notes</div>
                <div class="ao3h-setting-description">Works with a note but not hidden — added with the 📝 button next to Hide, on any listing page.</div>
                <div id="ao3h-skipWorks-notes-container" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-config-section: Private Notes -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;


// ─── RENDERING LOGIC ──────────────────────────────────────────────────────
// Self-contained: opens its own IndexedDB connection, reads localStorage.
// Fires on ao3h:configOpen so containers are populated when the panel opens.

// Étape 316 : UserLocalStorage et detectUser importés directement (avant : lectures
// window.AO3H_Common, cassées côté Vite depuis le retrait de la pose à l'étape 314).
// Le bundler legacy (supprimé en Phase 27) remplaçait ces imports par des shims window.
import { UserLocalStorage } from '../../../../storage/user.js';
import { detectUser as detectAO3User } from '../../../../utils/user-detector.js';
import { escapeHtml } from '../../../../utils/dom.js';
import { debounce } from '../../../../utils/index.js';

export function filterHiddenWorks (works, query) {
  const list = Array.isArray(works) ? works : [];
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return list;

  return list.filter((work) => {
    if (!work) return false;
    const workNumber = String(work.workId || '').replace(/^\/works\//, '').split('/')[0];
    const haystack = [work.title, work.author, work.reason, work.workId, workNumber]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

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
/** @type {IDBDatabase|null} */
let _db = null;

function openDB() {
  /** @type {Promise<IDBDatabase>} */
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const dbName = `ao3h-hiddenWorksDB-${detectUser()}`;
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        const store = db.createObjectStore(DB_STORE, { keyPath: 'workId' });
        store.createIndex('reason', 'reason', { unique: false });
        store.createIndex('isHidden', 'isHidden', { unique: false });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror   = () => reject(req.error);
  });
}

async function getAllWorks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(req.error);
  });
}

async function getWork(workId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(workId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror   = () => reject(req.error);
  });
}

async function putWork(rec) {
  const db = await openDB();
  /** @type {Promise<void>} */
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put(rec);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ── Quick Tags (localStorage) ──────────────────────────────────────────────
// Same key/shape as skipWorks.js's USER_QUICK_TAGS_DEFAULT — must stay in sync,
// can't import it directly since that file calls register() at load time.
const QUICK_TAGS_DEFAULT = [
  'crossover', 'sequel', 'bad summary', 'parent/dad', 'unfinished',
  'growing up together', 'not sterek focused', '1rst pov', 'established', 'always-a-girl', 'remember reading', 'implied'
];
function getQuickTags() {
  try {
    const v = UserLS
      ? UserLS.getJSON(TAGS_KEY, null)
      : JSON.parse(localStorage.getItem(`${NS}:${TAGS_KEY}`) || 'null');
    return Array.isArray(v) ? v : QUICK_TAGS_DEFAULT;
  } catch { return []; }
}

function saveQuickTags(tags) {
  try {
    if (UserLS) UserLS.setJSON(TAGS_KEY, tags);
    else localStorage.setItem(`${NS}:${TAGS_KEY}`, JSON.stringify(tags));
  } catch {}
}

// ── Render: Skipped Works List ─────────────────────────────────────────────
async function renderConfigList(configArea, query = '') {
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
    listContainer.innerHTML = `<p class="ao3h-error-state">⚠ Could not load skipped works list (${err?.message || err}).</p>`;
    return;
  }
  const hidden  = allWorks.filter(w => w.isHidden);
  const visible = filterHiddenWorks(hidden, query);

  if (countEl) {
    countEl.textContent = query.trim()
      ? `${visible.length} of ${hidden.length} work${hidden.length !== 1 ? 's' : ''} skipped`
      : `${hidden.length} work${hidden.length !== 1 ? 's' : ''} skipped`;
  }

  if (hidden.length === 0) {
    listContainer.innerHTML = `<p class="ao3h-empty-state">No works skipped yet.</p>`;
    return;
  }
  if (visible.length === 0) {
    listContainer.innerHTML = `<p class="ao3h-empty-state">No skipped works match “${escapeHtml(query.trim())}”.</p>`;
    return;
  }

  const listEl = document.createElement('div');
  listEl.className = 'ao3h-module-list ao3h-skipworks-list';

  for (const rec of visible) {
    const workNum = rec.workId.replace(/^\/works\//, '').split('/')[0];
    const entry   = document.createElement('div');
    entry.className = 'ao3h-module-list-entry ao3h-skipworks-entry';
    entry.dataset.workId = rec.workId;
    entry.innerHTML = `
      <div class="ao3h-module-list-entry-title">
        <a href="https://archiveofourown.org${rec.workId}" target="_blank">${rec.title ? escapeHtml(rec.title) : `Work #${workNum}`}</a>
        ${rec.author ? `<span class="ao3h-skipworks-author">by ${escapeHtml(rec.author)}</span>` : ''}
      </div>
      ${rec.reason ? `<span class="ao3h-module-list-entry-badge ao3h-skipworks-note" data-full="${escapeHtml(rec.reason)}">${escapeHtml(rec.reason)}</span>` : ''}
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

  // Note expand on click — event delegation to avoid listener accumulation
  if (!listContainer.dataset.noteExpandWired) {
    listContainer.dataset.noteExpandWired = '1';
    listContainer.addEventListener('click', e => {
      const note = e.target.closest('.ao3h-skipworks-note--truncated');
      listContainer.querySelectorAll('.ao3h-skipworks-entry--note-open')
        .forEach(el => el.classList.remove('ao3h-skipworks-entry--note-open'));
      if (note) { e.stopPropagation(); note.closest('.ao3h-skipworks-entry').classList.add('ao3h-skipworks-entry--note-open'); }
    });
  }

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
      await renderConfigList(configArea, getSearchValue(configArea));
    });
  }
}

function getSearchValue(configArea) {
  const root = configArea || document;
  const input = root.querySelector('#ao3h-skipWorks-search') || document.getElementById('ao3h-skipWorks-search');
  return input ? input.value : '';
}

// ── Render: Private Notes (works with a note but not hidden) ───────────────
async function renderNotesList(configArea) {
  const root = configArea || document;
  const container = root.querySelector('#ao3h-skipWorks-notes-container')
                 || document.getElementById('ao3h-skipWorks-notes-container');
  if (!container) return;

  let allWorks;
  try {
    allWorks = await getAllWorks();
  } catch (err) {
    console.error('[AO3H][skipWorks-config] Failed to load notes list:', err);
    container.innerHTML = `<p class="ao3h-error-state">⚠ Could not load private notes (${err?.message || err}).</p>`;
    return;
  }

  const notes = allWorks.filter(w => w.isHidden === false && w.isStandaloneNote === true && typeof w.reason === 'string' && w.reason.trim());

  if (notes.length === 0) {
    container.innerHTML = `<p class="ao3h-empty-state">No private notes yet.</p>`;
    return;
  }

  const listEl = document.createElement('div');
  listEl.className = 'ao3h-module-list ao3h-skipworks-list';

  for (const rec of notes) {
    const workNum = rec.workId.replace(/^\/works\//, '').split('/')[0];
    const entry = document.createElement('div');
    entry.className = 'ao3h-module-list-entry ao3h-skipworks-entry';
    entry.dataset.workId = rec.workId;
    entry.innerHTML = `
      <div class="ao3h-module-list-entry-title">
        <a href="https://archiveofourown.org${rec.workId}" target="_blank">${rec.title ? escapeHtml(rec.title) : `Work #${workNum}`}</a>
        ${rec.author ? `<span class="ao3h-skipworks-author">by ${escapeHtml(rec.author)}</span>` : ''}
      </div>
      <span class="ao3h-module-list-entry-badge ao3h-skipworks-note" data-full="${escapeHtml(rec.reason)}">${escapeHtml(rec.reason)}</span>
      <div class="ao3h-module-list-entry-actions">
        <button class="ao3h-inline-btn ao3h-inline-btn--danger" data-action="remove-note">Remove note</button>
      </div>`;
    listEl.appendChild(entry);
  }

  container.innerHTML = '';
  container.appendChild(listEl);

  if (!container.dataset.removeNoteWired) {
    container.dataset.removeNoteWired = '1';
    container.addEventListener('click', async e => {
      const btn = e.target.closest('[data-action="remove-note"]');
      if (!btn) return;
      const workId = btn.closest('.ao3h-skipworks-entry').dataset.workId;
      if (!confirm('Remove this private note?')) return;
      const rec = await getWork(workId);
      if (rec) { rec.reason = ''; rec.isStandaloneNote = false; await putWork(rec); }
      await renderNotesList(configArea);
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
      <div class="ao3h-config-row">
        <input type="text" class="ao3h-config-input ao3h-skipworks-preset-input" placeholder="Add a note preset…" maxlength="60">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-sw-preset-add">+ Add</button>
      </div>
      <div class="ao3h-tag-chips-card${current.length === 0 ? ' ao3h-tag-chips-card--empty' : ''}">
        <div class="ao3h-skipworks-presets ao3h-chip-container" data-empty-text="No note presets yet">
          ${current.map(p => `<span class="ao3h-chip ao3h-chip--neutral ao3h-chip--square ao3h-skipworks-preset-chip">${p}<button title="Remove" data-preset="${p.replace(/"/g, '&quot;')}">×</button></span>`).join('')}
        </div>
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

// ── Wire the search box ─────────────────────────────────────────────────────
function wireSearchInput(configArea) {
  const input = configArea.querySelector('#ao3h-skipWorks-search');
  if (!input || input.dataset.swWired) return;
  input.dataset.swWired = '1';
  input.addEventListener('input', debounce(() => {
    renderConfigList(configArea, input.value);
  }, 200));
}

// ── Listen for config panel open ───────────────────────────────────────────
document.addEventListener('ao3h:configOpen', e => {
  if (e.detail?.moduleId !== 'skipWorks') return;
  const configArea = e.detail?.configArea;
  if (!configArea) return;
  restoreSettings(configArea);
  renderConfigList(configArea, getSearchValue(configArea));
  renderConfigPresets(configArea);
  renderNotesList(configArea);
  wireFooterButtons(configArea);
  wireSearchInput(configArea);
});
