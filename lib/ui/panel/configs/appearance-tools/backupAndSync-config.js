/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Backup And Sync

   Configuration panel for the Backup And Sync module.
   Automatic local backup with optional cross-device browser sync.

   wireConfigArea() wires the "Backup Now" / "Import" / "Export" buttons that
   already existed in the HTML but had no click handler, and adds a backup
   browser (search by date or content, restore, delete, per-backup integrity
   status). Creating and restoring backups — including the encrypted,
   compressed, and incremental modes — delegates to the live module via
   W.AO3H.backupAndSync (owned by the coordinator), so those two actions only work
   while the Backup & Sync module is enabled. Browsing, searching, deleting,
   importing, and exporting the backup list read/write localStorage directly
   and work regardless of the module's enabled state.
═══════════════════════════════════════════════════════════════════════════ */

import {
  validateBackup,
  deepValidateBackup,
  backupType,
  backupTypeLabel,
  backupKeyCount,
  backupMatchesQuery,
  parseCategories,
} from './backupAndSync-backups.js';

export const moduleId = 'backupAndSync';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Browser Sync</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="syncEnabled">
                            Sync via browser account
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Sync your AO3Helper data across devices using your browser's built-in sync (Chrome / Firefox). ~100 KB limit. Opt-in.</div>
                </div>
                </div><!-- /.ao3h-config-section -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableAutoBackup" checked>
                            Enable automatic backups
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Backup interval (minutes)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="backupInterval" value="15" min="1" max="60">
                    </div>
                    <div class="ao3h-setting-description">Default: every 15 minutes</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max backups kept</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="maxBackups" value="10" min="1" max="50">
                    </div>
                    <div class="ao3h-setting-description">Oldest backups deleted automatically when limit is reached</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Manual backup mode</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-config-input" id="ao3h-bas-mode">
                            <option value="standard" selected>Standard</option>
                            <option value="compressed">Compressed (gzip)</option>
                            <option value="encrypted">Encrypted (password)</option>
                            <option value="incremental">Incremental (changes only)</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Used by the "Backup Now" button below</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Only these categories (optional)</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" id="ao3h-bas-categories" placeholder="e.g. readingList, filters — empty = everything">
                    </div>
                    <div class="ao3h-setting-description">Comma-separated key filters — makes "Backup Now" a selective backup (standard mode only)</div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="backup-now">☁️ Backup Now</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-backup">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-backup">Export (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Backups</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <input type="search" class="ao3h-config-input" id="ao3h-bas-search" placeholder="Search backups by date or content (key names)…">
                    </div>
                </div>
                <div class="ao3h-bas-list" id="ao3h-bas-list" aria-live="polite"></div>
                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-all-backups">Clear All</button>
                </div>
                </div><!-- /.ao3h-config-section: Backups -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

/* ═══════════════════════════════════════════════════════════════════════════
   BACKUP STORAGE — same key as the engine in _backupAndSync.js.
   Browsing/searching/deleting/importing/exporting read and write this key
   directly (no business logic involved, works even module-disabled).
   Creating and restoring backups delegates to W.AO3H.backupAndSync instead —
   see _basCreateBackup() and the restore button handler below.
═══════════════════════════════════════════════════════════════════════════ */

const BAS_KEY = 'ao3h:backupAndSync:backups';

// When the module is active, returns backupOpsInst's own live array (by
// reference, via getBackups()) rather than a fresh localStorage read — this
// keeps indices used by delete/restore aligned with what the module itself
// holds in memory. Falls back to reading localStorage directly when the
// module isn't enabled. Callers that remove/replace entries must mutate the
// returned array in place (splice, length = 0, ...) rather than building a
// new array, so the module's own reference stays in sync too.
function _basLoad() {
  const api = window.AO3H?.backupAndSync;
  if (api) return api.getBackups();
  try {
    const arr = JSON.parse(localStorage.getItem(BAS_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function _basSave(backups) {
  try { localStorage.setItem(BAS_KEY, JSON.stringify(backups)); } catch {}
}

// mode: standard | compressed | encrypted | incremental — categories (standard
// only) turn the snapshot into a selective backup. Returns null when the user
// cancels the password prompt or the Backup & Sync module isn't enabled.
async function _basCreateBackup({ mode = 'standard', categories = [] } = {}) {
  const api = window.AO3H?.backupAndSync;
  if (!api) { alert('Enable the Backup & Sync module to create backups.'); return null; }

  if (mode === 'encrypted') {
    const password = prompt('Password for this encrypted backup:');
    if (!password) return null;
    return api.createEncryptedBackup(password);
  }
  if (mode === 'compressed') return api.createCompressedBackup();
  if (mode === 'incremental') return api.createIncrementalBackup();
  if (categories.length) return api.createSelectiveBackup(categories);
  return api.createBackup();
}

function _basDownloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function _basFormatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   WIRING
═══════════════════════════════════════════════════════════════════════════ */

function wireConfigArea(container) {
  const listEl   = container.querySelector('#ao3h-bas-list');
  const searchEl = container.querySelector('#ao3h-bas-search');
  if (!listEl) return; // config area not fully rendered yet

  function getMaxBackups() {
    const n = parseInt(container.querySelector('[data-setting="maxBackups"]')?.value, 10);
    return Number.isFinite(n) && n > 0 ? n : 10;
  }

  function renderList() {
    const backups = _basLoad();
    const q = (searchEl?.value || '').trim();
    const filtered = backups
      .map((b, idx) => ({ b, idx }))
      .filter(({ b }) => backupMatchesQuery(b, q));

    listEl.innerHTML = '';

    if (!backups.length) {
      const empty = document.createElement('div');
      empty.className = 'ao3h-bas-empty';
      empty.textContent = 'No backups yet — click "Backup Now" to create one.';
      listEl.appendChild(empty);
      return;
    }
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'ao3h-bas-empty';
      empty.textContent = 'No backups match your search.';
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach(({ b, idx }) => {
      const row = document.createElement('div');
      row.className = 'ao3h-bas-row';

      const check = validateBackup(b);

      const status = document.createElement('span');
      status.className = 'ao3h-bas-row-status';
      const setStatus = (result) => {
        status.textContent = result.valid ? '✓' : '⚠️';
        status.classList.toggle('ao3h-bas-row-status--bad', !result.valid);
        status.title = result.valid ? 'Backup is valid and restorable' : `Corrupt backup: ${result.reason}`;
      };
      setStatus(check);
      // Compressed payloads get a real gunzip check in the background
      if (check.valid && check.type === 'compressed') {
        deepValidateBackup(b).then(deep => { if (status.isConnected) setStatus(deep); });
      }

      const info = document.createElement('div');
      info.className = 'ao3h-bas-row-info';
      const size     = new Blob([JSON.stringify(b)]).size;
      const keyCount = backupKeyCount(b);
      const parts    = [backupTypeLabel(check.type)];
      if (keyCount !== null) parts.push(`${keyCount} keys`);
      parts.push(_basFormatSize(size));
      info.textContent = `${new Date(b.timestamp).toLocaleString()} — ${parts.join(', ')}`;

      const actions = document.createElement('div');
      actions.className = 'ao3h-bas-row-actions';

      const restoreBtn = document.createElement('button');
      restoreBtn.type = 'button';
      restoreBtn.className = 'ao3h-config-action-btn ao3h-inline-btn';
      restoreBtn.textContent = 'Restore';
      restoreBtn.addEventListener('click', async () => {
        const dateLabel = new Date(b.timestamp).toLocaleString();
        if (!validateBackup(b).valid) {
          alert(`This backup is corrupt (${validateBackup(b).reason}) and cannot be restored.`);
          return;
        }

        const api = window.AO3H?.backupAndSync;
        if (!api) { alert('Enable the Backup & Sync module to restore backups.'); return; }

        // Each restoreXBackup() shows its own confirm() before overwriting data.
        const type = backupType(b);
        let ok;
        if (type === 'incremental') {
          ok = await api.restoreIncrementalBackup(idx);
        } else if (type === 'encrypted') {
          const password = prompt(`Password for the encrypted backup from ${dateLabel}:`);
          if (!password) return;
          ok = await api.restoreEncryptedBackup(idx, password);
          if (!ok) { alert('Decryption failed — wrong password or corrupt backup.'); return; }
        } else if (type === 'compressed') {
          ok = await api.restoreCompressedBackup(idx);
          if (!ok) { alert('This compressed backup could not be read.'); return; }
        } else {
          ok = api.restoreBackup(idx);
        }

        if (ok) {
          restoreBtn.textContent = '✓ Restored';
          setTimeout(() => { restoreBtn.textContent = 'Restore'; }, 1500);
        }
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger';
      delBtn.textContent = '🗑️';
      delBtn.title = 'Delete this backup';
      delBtn.addEventListener('click', () => {
        const current = _basLoad();
        current.splice(idx, 1);
        _basSave(current);
        renderList();
      });

      actions.append(restoreBtn, delBtn);
      row.append(status, info, actions);
      listEl.appendChild(row);
    });
  }

  if (searchEl && !searchEl.dataset.wired) {
    searchEl.dataset.wired = '1';
    let searchTimer = 0;
    searchEl.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderList, 150);
    });
  }

  const backupNowBtn = container.querySelector('[data-action="backup-now"]');
  if (backupNowBtn && !backupNowBtn.dataset.wired) {
    backupNowBtn.dataset.wired = '1';
    backupNowBtn.addEventListener('click', async () => {
      const mode       = container.querySelector('#ao3h-bas-mode')?.value || 'standard';
      const categories = parseCategories(container.querySelector('#ao3h-bas-categories')?.value);
      const result = await _basCreateBackup({ mode, categories });
      if (!result) return; // password prompt cancelled, or module disabled
      renderList();
      backupNowBtn.textContent = '✓ Backed Up';
      setTimeout(() => { backupNowBtn.textContent = '☁️ Backup Now'; }, 1500);
    });
  }

  const exportBtn = container.querySelector('[data-action="export-backup"]');
  if (exportBtn && !exportBtn.dataset.wired) {
    exportBtn.dataset.wired = '1';
    exportBtn.addEventListener('click', () => {
      const backups = _basLoad();
      if (!backups.length) { alert('No backups to export yet.'); return; }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      _basDownloadJSON(backups, `ao3h-backups-${timestamp}.json`);
    });
  }

  const importBtn = container.querySelector('[data-action="import-backup"]');
  if (importBtn && !importBtn.dataset.wired) {
    importBtn.dataset.wired = '1';
    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const incoming = JSON.parse(String(reader.result));
            if (!Array.isArray(incoming)) throw new Error('Expected an array of backups.');
            const valid = incoming.filter(b => validateBackup(b).valid);
            if (!valid.length) throw new Error('No valid backups found in file.');
            const current = _basLoad();
            const merged = current.concat(valid)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, getMaxBackups());
            // Mutate in place rather than reassigning — when the module is
            // active, `current` is its own live backups array (see _basLoad).
            current.length = 0;
            current.push(...merged);
            _basSave(current);
            renderList();
            importBtn.textContent = `✓ Imported ${valid.length}`;
            setTimeout(() => { importBtn.textContent = 'Import'; }, 1500);
          } catch (err) {
            alert('Import failed: ' + (err?.message || 'invalid file'));
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });
  }

  const clearAllBtn = container.querySelector('[data-action="clear-all-backups"]');
  if (clearAllBtn && !clearAllBtn.dataset.wired) {
    clearAllBtn.dataset.wired = '1';
    clearAllBtn.addEventListener('click', () => {
      const current = _basLoad();
      if (!current.length) return;
      if (!confirm('Delete all backups? This cannot be undone.')) return;
      current.length = 0; // mutate in place — see _basLoad
      _basSave(current);
      renderList();
    });
  }

  renderList();
}

export { wireConfigArea };
