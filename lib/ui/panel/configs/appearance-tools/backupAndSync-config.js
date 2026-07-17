/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Backup And Sync

   Configuration panel for the Backup And Sync module.
   Automatic local backup with optional cross-device browser sync.

   wireConfigArea() wires the "Backup Now" / "Import" / "Export" buttons that
   already existed in the HTML but had no click handler, and adds a backup
   browser (search, restore, delete) — the manual backup engine
   (backupOperations.js) already supported all of this, only the panel UI
   was missing.
═══════════════════════════════════════════════════════════════════════════ */

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
                        <input type="search" class="ao3h-config-input" id="ao3h-bas-search" placeholder="Search backups by date…">
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

function _basCreateBackup(maxBackups) {
  const backups = _basLoad();
  backups.unshift({ timestamp: new Date().toISOString(), data: _basCollectData() });
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
    const q = (searchEl?.value || '').trim().toLowerCase();
    const filtered = q
      ? backups
          .map((b, idx) => ({ b, idx }))
          .filter(({ b }) => new Date(b.timestamp).toLocaleString().toLowerCase().includes(q))
      : backups.map((b, idx) => ({ b, idx }));

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

      const info = document.createElement('div');
      info.className = 'ao3h-bas-row-info';
      const size = new Blob([JSON.stringify(b.data || {})]).size;
      const keyCount = Object.keys(b.data || {}).length;
      info.textContent = `${new Date(b.timestamp).toLocaleString()} — ${keyCount} keys, ${_basFormatSize(size)}`;

      const actions = document.createElement('div');
      actions.className = 'ao3h-bas-row-actions';

      const restoreBtn = document.createElement('button');
      restoreBtn.type = 'button';
      restoreBtn.className = 'ao3h-config-action-btn ao3h-inline-btn';
      restoreBtn.textContent = 'Restore';
      restoreBtn.addEventListener('click', () => {
        if (!confirm(`Restore backup from ${new Date(b.timestamp).toLocaleString()}?\n\nThis will overwrite current data. Reload the page afterwards to see the changes.`)) return;
        Object.entries(b.data || {}).forEach(([k, v]) => { try { localStorage.setItem(k, v); } catch {} });
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
      row.append(info, actions);
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
    backupNowBtn.addEventListener('click', () => {
      _basCreateBackup(getMaxBackups());
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
            const valid = incoming.filter(b => b && typeof b === 'object' && b.timestamp && b.data && typeof b.data === 'object');
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
