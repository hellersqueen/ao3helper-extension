/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Backup And Sync

   Configuration panel for the Backup And Sync module.
   Automatic local backup with optional cross-device browser sync.

   wireConfigArea() wires the "Backup Now" / "Import" / "Export" buttons that
   already existed in the HTML but had no click handler, and adds a backup
   browser (search by date or content, restore, delete, per-backup integrity
   status) — the manual backup engine (backupOperations.js) already supported
   all of this, only the panel UI was missing. "Backup Now" supports the
   engine's modes (standard, compressed, encrypted, incremental) and an
   optional category filter (selective backups).
═══════════════════════════════════════════════════════════════════════════ */

import {
  validateBackup,
  deepValidateBackup,
  backupType,
  backupTypeLabel,
  backupKeyCount,
  backupMatchesQuery,
  parseCategories,
  filterByCategories,
  encryptBackupData,
  decryptBackupData,
  compressString,
  decompressBytes,
  buildDelta,
  applyDelta,
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
   BACKUP STORAGE — mêmes clé et forme que backupOperations.js / _backupAndSync.js
   (dupliqué volontairement ici, comme le fait chaque autre *-config.js pour
   son propre stockage : lib/ui/panel/configs/ ne dépend pas de src/modules/).
═══════════════════════════════════════════════════════════════════════════ */

const BAS_KEY = 'ao3h:backupAndSync:backups';

function _basLoad() {
  try {
    const arr = JSON.parse(localStorage.getItem(BAS_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function _basSave(backups) {
  try { localStorage.setItem(BAS_KEY, JSON.stringify(backups)); } catch {}
}

function _basCollectData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('ao3h') || key.includes('AO3H')) && key !== BAS_KEY) {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

// mode: standard | compressed | encrypted | incremental — categories (standard
// only) turn the snapshot into a selective backup. Returns null when the user
// cancels the password prompt.
async function _basCreateBackup(maxBackups, { mode = 'standard', categories = [] } = {}) {
  const backups   = _basLoad();
  const timestamp = new Date().toISOString();
  let backup;

  if (mode === 'encrypted') {
    const password = prompt('Password for this encrypted backup:');
    if (!password) return null;
    backup = { timestamp, type: 'encrypted', ...(await encryptBackupData(_basCollectData(), password)) };
  } else if (mode === 'compressed') {
    backup = { timestamp, type: 'compressed', compressed: await compressString(JSON.stringify(_basCollectData())) };
  } else if (mode === 'incremental') {
    const last = backups.find(b => b.data && typeof b.data === 'object') || null;
    backup = { timestamp, type: 'incremental', baseTimestamp: last?.timestamp || null, delta: buildDelta(last?.data || {}, _basCollectData()) };
  } else if (categories.length) {
    backup = { timestamp, type: 'selective', categories, data: filterByCategories(_basCollectData(), categories) };
  } else {
    backup = { timestamp, data: _basCollectData() };
  }

  backups.unshift(backup);
  if (backups.length > maxBackups) backups.length = maxBackups;
  _basSave(backups);
  return backups;
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

        const type = backupType(b);
        if (type === 'incremental') {
          if (!confirm(`Apply the incremental backup from ${dateLabel}?\n\nThis applies the stored changes (additions, edits, deletions) to current data. Reload the page afterwards.`)) return;
          applyDelta(b.delta);
          restoreBtn.textContent = '✓ Restored';
          setTimeout(() => { restoreBtn.textContent = 'Restore'; }, 1500);
          return;
        }

        let data = b.data;
        if (type === 'encrypted') {
          const password = prompt(`Password for the encrypted backup from ${dateLabel}:`);
          if (!password) return;
          data = await decryptBackupData(b, password);
          if (!data) { alert('Decryption failed — wrong password or corrupt backup.'); return; }
        } else if (type === 'compressed') {
          try { data = JSON.parse(await decompressBytes(b.compressed)); }
          catch { alert('This compressed backup could not be read.'); return; }
        }

        if (!confirm(`Restore backup from ${dateLabel}?\n\nThis will overwrite current data. Reload the page afterwards to see the changes.`)) return;
        Object.entries(data || {}).forEach(([k, v]) => { try { localStorage.setItem(k, v); } catch {} });
        restoreBtn.textContent = '✓ Restored';
        setTimeout(() => { restoreBtn.textContent = 'Restore'; }, 1500);
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
      const result = await _basCreateBackup(getMaxBackups(), { mode, categories });
      if (!result) return; // password prompt cancelled
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
            const merged = _basLoad().concat(valid)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, getMaxBackups());
            _basSave(merged);
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
      if (!_basLoad().length) return;
      if (!confirm('Delete all backups? This cannot be undone.')) return;
      _basSave([]);
      renderList();
    });
  }

  renderList();
}

export { wireConfigArea };
