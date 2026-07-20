/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Downloader

   Configuration panel for the Fic Downloader module.
   Previously: downloadManager

   Sections:
   - Default Format
   - Kindle
   - Calibre
   - Batch Download
   - Auto-Cache
   - Listings

   wireConfigArea() shows/hides the Kindle and Calibre sub-option blocks
   based on their "Enable" checkbox (the HTML alone always started them
   hidden — no listener ever un-hid them, so the Kindle email field in
   particular was never actually reachable from the panel), and renders the
   Offline Library browser (list of cached works with open/remove/clear).
═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   OFFLINE LIBRARY HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export const OFFLINE_LIBRARY_KEY = 'ao3h:OfflineReading:library';
export const OFFLINE_WARN_BYTES = 4 * 1024 * 1024;

export function loadOfflineLibrary (storage = localStorage) {
  try {
    const lib = JSON.parse(storage.getItem(OFFLINE_LIBRARY_KEY) || '{}');
    return lib && typeof lib === 'object' && !Array.isArray(lib) ? lib : {};
  } catch { return {}; }
}

export function formatBytes (bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function _entryBytes (entry) {
  try { return JSON.stringify(entry || {}).length * 2; } catch { return 0; }
}

export function buildOfflineRows (lib) {
  return Object.entries(lib || {})
    .map(([workId, entry]) => {
      const bytes = _entryBytes(entry);
      return {
        workId,
        title:     entry?.title  || `Work ${workId}`,
        author:    entry?.author || 'Anonymous',
        date:      entry?.date   || 0,
        dateLabel: entry?.date ? new Date(entry.date).toLocaleString() : '—',
        sizeLabel: formatBytes(bytes),
        bytes,
      };
    })
    .sort((a, b) => b.date - a.date);
}

export function offlineTotals (lib, warnBytes = OFFLINE_WARN_BYTES) {
  let bytes = 0;
  const entries = Object.values(lib || {});
  for (const entry of entries) bytes += _entryBytes(entry);
  return {
    count: entries.length,
    bytes,
    label: `${entries.length} work${entries.length !== 1 ? 's' : ''} — ${formatBytes(bytes)}`,
    warn:  bytes >= warnBytes,
  };
}

export function removeOfflineWork (workId, storage = localStorage) {
  const lib = loadOfflineLibrary(storage);
  delete lib[workId];
  try { storage.setItem(OFFLINE_LIBRARY_KEY, JSON.stringify(lib)); } catch {}
  return lib;
}

export function clearOfflineLibrary (storage = localStorage) {
  try { storage.setItem(OFFLINE_LIBRARY_KEY, '{}'); } catch {}
  return {};
}

export const moduleId = 'ficDownloader';
export const config = `

                <!-- ─── FORMAT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Default Download Format</div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Format</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="epub" checked> EPUB</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="mobi"> MOBI</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="azw3"> AZW3</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="pdf"> PDF</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="html"> HTML</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="txt"> TXT</label>
                    </div>
                </div>

                <!-- ─── KINDLE ─── -->
                </div><!-- /.ao3h-config-section: Default Download Format -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Send to Kindle</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sendToKindleEnabled" id="ao3h-dl-kindle">
                            Enable "Send to Kindle"
                        </label>
                    </div>
                </div>

                <div id="ao3h-dl-kindle-opts" class="ao3h-indent" style="display: none;">
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Kindle email address</label>
                        <div class="ao3h-setting-control">
                            <input type="email" class="ao3h-config-input" data-setting="kindleEmail" placeholder="your-device@kindle.com">
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label>
                                <input type="checkbox" data-setting="autoKindleSend">
                                Auto-send on download
                            </label>
                        </div>
                    </div>
                </div>

                <!-- ─── CALIBRE ─── -->
                </div><!-- /.ao3h-config-section: Send to Kindle -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Calibre Integration</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="calibreEnabled" id="ao3h-dl-calibre">
                            Enable "Send to Calibre"
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a "Send to Calibre" action next to downloads, sending the file to your Calibre Content Server.</div>
                </div>

                <div id="ao3h-dl-calibre-opts" class="ao3h-indent" style="display: none;">
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Calibre server URL</label>
                        <div class="ao3h-setting-control">
                            <input type="text" class="ao3h-config-input" data-setting="calibreUrl" placeholder="http://localhost:8080">
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Library name (optional)</label>
                        <div class="ao3h-setting-control">
                            <input type="text" class="ao3h-config-input" data-setting="calibreLibrary" placeholder="Calibre Library">
                        </div>
                    </div>
                </div>

                <!-- ─── BATCH DOWNLOAD ─── -->
                </div><!-- /.ao3h-config-section: Calibre Integration -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Batch Download</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Max works per batch</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="maxWorks" value="10" min="1" max="100" style="width: 80px;">
                    </div>
                    <div class="ao3h-setting-description">Maximum number of works downloaded in a single batch operation</div>
                </div>

                </div><!-- /.ao3h-config-section: Batch Download -->

                <!-- ─── AUTO-CACHE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Auto-Cache</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCacheMFL">
                            Auto-cache "Later Shelf" works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Silently downloads MFL works in the background for offline access</div>
                </div>

                </div><!-- /.ao3h-config-section: Auto-Cache -->

                <!-- ─── LISTINGS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Listings</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickDownloadButtons" checked>
                            Show the quick-download icon on work listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a ⬇️ icon next to each work in listings for one-click download without opening the work page. Disable if you only use batch or per-work downloads.</div>
                </div>

                </div><!-- /.ao3h-config-section: Listings -->

                <!-- ─── OFFLINE LIBRARY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Offline Library</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <input type="search" class="ao3h-config-input" id="ao3h-dl-offline-search" placeholder="Search by title or author…">
                    </div>
                </div>
                <div class="ao3h-setting-description" id="ao3h-dl-offline-total"></div>
                <div class="ao3h-dl-offline-list" id="ao3h-dl-offline-list" aria-live="polite"></div>
                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-offline-library">Clear All</button>
                </div>

                </div><!-- /.ao3h-config-section: Offline Library -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Styling</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable custom styles</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="customStyles" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Styling -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

/* ═══════════════════════════════════════════════════════════════════════════
   WIRING — toggle visibility of sub-option blocks based on their checkbox.
   L'appel initial synchronise l'affichage sur l'état actuel de la case (les
   deux blocs démarrent en display:none dans le HTML, quel que soit le
   réglage sauvegardé) ; sans ça la case "Enable" pouvait être cochée tout en
   laissant les champs (email Kindle, URL Calibre) invisibles en permanence.
═══════════════════════════════════════════════════════════════════════════ */

function _wireToggle(container, checkboxSelector, optsSelector) {
  const checkbox = container.querySelector(checkboxSelector);
  const opts = container.querySelector(optsSelector);
  if (!checkbox || !opts || checkbox.dataset.wired) return;
  checkbox.dataset.wired = '1';
  opts.style.display = checkbox.checked ? '' : 'none';
  checkbox.addEventListener('change', () => {
    opts.style.display = checkbox.checked ? '' : 'none';
  });
}

function _openOfflineWork(entry) {
  if (!entry?.html || typeof URL.createObjectURL !== 'function') return;
  const blob = new Blob([entry.html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) URL.revokeObjectURL(url);
  else setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function _wireOfflineLibrary(container) {
  const listEl   = container.querySelector('#ao3h-dl-offline-list');
  const totalEl  = container.querySelector('#ao3h-dl-offline-total');
  const searchEl = container.querySelector('#ao3h-dl-offline-search');
  if (!listEl) return; // config area not fully rendered yet

  function renderList() {
    const lib    = loadOfflineLibrary();
    const q      = (searchEl?.value || '').trim().toLowerCase();
    const rows   = buildOfflineRows(lib).filter(row =>
      !q || row.title.toLowerCase().includes(q) || row.author.toLowerCase().includes(q)
    );
    const totals = offlineTotals(lib);

    if (totalEl) {
      totalEl.textContent = totals.count
        ? `${totals.label}${totals.warn ? ' — ⚠️ close to the browser storage limit' : ''}`
        : '';
      totalEl.classList.toggle('ao3h-dl-offline-total--warn', totals.warn);
    }

    listEl.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'ao3h-dl-offline-empty';
      empty.textContent = totals.count
        ? 'No offline works match your search.'
        : 'No works saved offline yet — use "📥 Save Offline" on a work page.';
      listEl.appendChild(empty);
      return;
    }

    rows.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'ao3h-dl-offline-row';

      const info = document.createElement('div');
      info.className = 'ao3h-dl-offline-row-info';
      info.textContent = `${row.title} — ${row.author} (${row.dateLabel}, ${row.sizeLabel})`;
      info.title = `Work ${row.workId}`;

      const actions = document.createElement('div');
      actions.className = 'ao3h-dl-offline-row-actions';

      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'ao3h-config-action-btn ao3h-inline-btn';
      openBtn.textContent = '📖 Read';
      openBtn.title = 'Open the cached copy in a new tab';
      openBtn.addEventListener('click', () => {
        _openOfflineWork(loadOfflineLibrary()[row.workId]);
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger';
      delBtn.textContent = '🗑️';
      delBtn.title = 'Remove from offline library';
      delBtn.addEventListener('click', () => {
        removeOfflineWork(row.workId);
        renderList();
      });

      actions.append(openBtn, delBtn);
      rowEl.append(info, actions);
      listEl.appendChild(rowEl);
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

  const clearBtn = container.querySelector('[data-action="clear-offline-library"]');
  if (clearBtn && !clearBtn.dataset.wired) {
    clearBtn.dataset.wired = '1';
    clearBtn.addEventListener('click', () => {
      if (!offlineTotals(loadOfflineLibrary()).count) return;
      if (!confirm('Remove all works saved offline? This cannot be undone.')) return;
      clearOfflineLibrary();
      renderList();
    });
  }

  renderList();
}

function wireConfigArea(container) {
  _wireToggle(container, '#ao3h-dl-kindle', '#ao3h-dl-kindle-opts');
  _wireToggle(container, '#ao3h-dl-calibre', '#ao3h-dl-calibre-opts');
  _wireOfflineLibrary(container);
}

export { wireConfigArea };
