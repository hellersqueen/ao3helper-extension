/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Reading Tracker

   Unified reading lifecycle: seen, progress, completion.
   Fusion: seenWorksMarker + readingProgress

   Sections:
   - Seen Works Marker
   - Exceptions
   - History
   - Reading Progress
═══════════════════════════════════════════════════════════════════════════ */

import { relativeDate } from '../../../../utils/format-date.js';

export const moduleId = 'readingTracker';
export const config = `

                <!-- ─── SEEN WORKS MARKER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Seen Works Marker</div>

                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Display mode for seen works</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="mark" checked> Mark as seen (60% fade)</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="hide"> Hide from listings</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="blur"> Blur</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="strikethrough"> Strikethrough title</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Display mode for seen works -->

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="bulkMarkSeen" checked>
                            Bulk "mark selected as seen" on listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a checkbox to every work, plus a button to mark all checked ones at once</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="keyboardToggleSeen" checked>
                            Keyboard shortcut to reveal seen works (V)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Only active if the Keyboard Shortcuts module is enabled</div>
                </div>

                <!-- ─── EXCEPTIONS ─── -->
                </div><!-- /.ao3h-config-section: Seen Works Marker -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Exceptions — never mark as seen</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptBookmarks" checked>
                            Works in my bookmarks
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptSubscribed" checked>
                            Works I'm subscribed to
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptMFL" checked>
                            Works in my Later Shelf
                        </label>
                    </div>
                </div>

                <!-- ─── HISTORY ─── -->
                </div><!-- /.ao3h-config-section: Exceptions — never mark as seen -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">History</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchHistory" checked>
                            Search in history
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="deleteEntry" checked>
                            Delete individual entries
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exportHistory" checked>
                            Export history (JSON)
                        </label>
                    </div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-ao3-history">⬇️ Import from AO3 History</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-history">🗑️ Clear History</button>
                </div>

                <div class="ao3h-config-row" style="margin-top: 10px;">
                    <input type="text" class="ao3h-config-input" id="ao3h-rt-search" placeholder="Search title or author…" style="flex: 1;">
                    <select class="ao3h-setting-select" id="ao3h-rt-sort">
                        <option value="date">Sort: recent first</option>
                        <option value="title">Sort: title A-Z</option>
                    </select>
                </div>

                <div class="ao3h-config-row">
                    <label style="font-size: 12px; display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" id="ao3h-rt-group-period" checked> Group by day
                    </label>
                    <input type="number" class="ao3h-config-input" id="ao3h-rt-cleanup-days" placeholder="Days" style="width: 60px;" min="1">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="rt-cleanup">🧹 Remove entries older than…</button>
                </div>

                <div id="ao3h-rt-history-list" class="ao3h-rt-history-list"></div>

                <!-- ─── READING PROGRESS ─── -->
                </div><!-- /.ao3h-config-section: History -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Reading Progress</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeToast" checked>
                            Resume toast on re-open
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterBadge" checked>
                            Clickable "Ch X/Y" badge on in-progress works
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeBanner" checked>
                            "📍 Resume at chapter X" banner on re-open
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="lastReadTime" checked>
                            Show last-read time in banner ("X days ago")
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="positionMarker" checked>
                            Last-read position marker line
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="floatingBadge" checked>
                            Floating progress indicator while reading
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Progress indicator style</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="progressStyle" data-setting="progressStyle" value="badge" checked> Percentage badge</label>
                        <label><input type="radio" name="progressStyle" data-setting="progressStyle" value="bar"> Clickable bar</label>
                        <label><input type="radio" name="progressStyle" data-setting="progressStyle" value="donut"> Donut ring</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="clickToSeek" checked>
                            Click the bar to jump to a position
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Only applies to the "Clickable bar" style above</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="progressMilestones" checked>
                            Notify at 25% / 50% / 75% read
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="manualBookmarks" checked>
                            Manual bookmarks (🔖 multiple per work)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">In addition to the single automatic last-read-position marker</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="readingSpeedTracking" checked>
                            Track my reading speed
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Computed from your own scrolling, shown in the resume banner as an average words-per-minute</div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-progress">✕ Clear reading progress for this work</button>
                </div>

                </div><!-- /.ao3h-config-section: Reading Progress -->

                <!-- ─── ADVANCED ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Advanced</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Seen works opacity</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="seenWorksOpacity"
                               min="0.2" max="1" step="0.1" value="0.6">
                        <span class="ao3h-range-value" data-for="seenWorksOpacity">60%</span>
                    </div>
                    <div class="ao3h-setting-description">Opacity when a work is marked as seen (lower = more faded)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="historyClearAll" checked>
                            Show "Clear all history" button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showClearProgressButton" checked>
                            Show "Clear progress" button per work
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Advanced -->

                <!-- ─── UPDATES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Updates</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="updatedBadge" checked>
                            &ldquo;Updated&rdquo; badge on recently-updated works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Highlights works with new chapters since your last visit</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="updatedOnlyMode">
                            Show only updated works in subscriptions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Filters your subscription inbox to show only works with new chapters</div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">"Updated" badge date format</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="updatedDateFormat" data-setting="updatedDateFormat" value="relative" checked> Relative ("3 days ago")</label>
                        <label><input type="radio" name="updatedDateFormat" data-setting="updatedDateFormat" value="exact"> Exact date</label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Updates -->

                <!-- ─── PRIVACY & HOME PAGE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Privacy &amp; Home Page</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="continueReadingWidget" checked>
                            "Continue Reading" widget on the AO3 home page
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Lists your most recently opened in-progress works, with direct resume links</div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Never track in history</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" id="ao3h-rt-exclude-input" placeholder="Work ID or fandom name…" style="width: 200px;">
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="rt-add-exclusion">+ Add</button>
                    </div>
                    <div class="ao3h-setting-description">Works (by ID) or whole fandoms never get recorded, marked as seen, or shown in badges</div>
                    <ul id="ao3h-rt-exclusion-list" class="ao3h-rt-exclusion-list"></ul>
                </div>

                </div><!-- /.ao3h-config-section: Privacy & Home Page -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-apply filters</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoApply" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-save progress</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoSave" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Update interval (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="interval" value="30" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

// ── Storage (raw ao3h:-prefixed keys — same ones _readingTracker.js writes via lib/utils/index.js's lsGet/lsSet) ──
const SK_HISTORY  = 'ao3h:rt:history';
const SK_EXCLUDED = 'ao3h:rt:excludedWorks';

function _rtLoadHistory ()  { try { return JSON.parse(localStorage.getItem(SK_HISTORY) || '[]'); } catch { return []; } }
function _rtSaveHistory (h) { try { localStorage.setItem(SK_HISTORY, JSON.stringify(h)); } catch {} }
function _rtLoadExcluded () { try { return JSON.parse(localStorage.getItem(SK_EXCLUDED) || '[]'); } catch { return []; } }
function _rtSaveExcluded (e) { try { localStorage.setItem(SK_EXCLUDED, JSON.stringify(e)); } catch {} }

function _rtEsc (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _rtRelative (ts) {
  return relativeDate(ts) || '';
}

// Mirrors _readingTracker.js's exported groupHistoryByPeriod/sortHistory/
// pinnedFirst/entriesToCleanUp — must stay in sync, can't import them
// directly since that file calls register() at load time.
function _rtGroupByPeriod (history) {
  const now = Date.now();
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const todayStart = startOfToday.getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 7 * 86400000;
  const groups = { Today: [], Yesterday: [], 'This week': [], Older: [] };
  for (const e of history) {
    const ts = e.lastReadAt || e.seenAt || 0;
    if (ts >= todayStart) groups.Today.push(e);
    else if (ts >= yesterdayStart) groups.Yesterday.push(e);
    else if (ts >= weekStart) groups['This week'].push(e);
    else groups.Older.push(e);
  }
  return groups;
}

function _rtFilterHistory (history, query) {
  const q = query.trim().toLowerCase();
  if (!q) return history;
  return history.filter(e => (e.title || '').toLowerCase().includes(q) || (e.author || '').toLowerCase().includes(q));
}

function _rtSortHistory (history, sortKey) {
  return [...history].sort((a, b) => sortKey === 'title'
    ? (a.title || '').localeCompare(b.title || '')
    : (b.lastReadAt || b.seenAt || 0) - (a.lastReadAt || a.seenAt || 0));
}

function _rtPinnedFirst (history) {
  return [...history.filter(e => e.pinned), ...history.filter(e => !e.pinned)];
}

function _rtEntriesToCleanUp (history, olderThanDays) {
  const cutoff = Date.now() - olderThanDays * 86400000;
  return history.filter(e => !e.pinned && (e.lastReadAt || e.seenAt || 0) < cutoff).map(e => e.id).filter(Boolean);
}

function _rtRenderEntry (e) {
  const ts = e.lastReadAt || e.seenAt;
  return `
    <li class="ao3h-rt-history-entry" data-id="${_rtEsc(e.id)}">
      <button type="button" class="ao3h-rt-pin-btn${e.pinned ? ' ao3h-rt-pinned' : ''}" data-action="rt-pin" title="${e.pinned ? 'Unpin' : 'Pin to top'}">★</button>
      <a href="${_rtEsc(e.href || `/works/${e.id}`)}" target="_blank" rel="noopener">${_rtEsc(e.title || `Work #${e.id}`)}</a>
      <span class="ao3h-rt-entry-meta">${_rtEsc(e.author || '')}${e.visitCount > 1 ? ` · read ${e.visitCount}×` : ''} · ${_rtRelative(ts)}</span>
      ${e.note ? `<span class="ao3h-rt-entry-note" title="${_rtEsc(e.note)}">📝</span>` : ''}
      <button type="button" class="ao3h-rt-note-btn" data-action="rt-note" title="Add/edit note">✎</button>
      <button type="button" class="ao3h-rt-delete-btn" data-action="delete-entry" data-work-id="${_rtEsc(e.id)}" aria-label="Delete entry">✕</button>
    </li>`;
}

function _rtRenderHistoryList (container) {
  const searchInput  = /** @type {HTMLInputElement|null} */ (document.getElementById('ao3h-rt-search'));
  const sortSelect   = /** @type {HTMLSelectElement|null} */ (document.getElementById('ao3h-rt-sort'));
  const groupCheckbox = /** @type {HTMLInputElement|null} */ (document.getElementById('ao3h-rt-group-period'));
  if (!searchInput || !sortSelect || !groupCheckbox) return;

  const sortKey = sortSelect.value;
  let history = _rtFilterHistory(_rtLoadHistory(), searchInput.value);
  history = _rtPinnedFirst(_rtSortHistory(history, sortKey));

  if (!history.length) {
    container.innerHTML = '<p class="ao3h-rt-history-empty">No matching history entries.</p>';
    return;
  }

  if (groupCheckbox.checked && sortKey === 'date') {
    const groups = _rtGroupByPeriod(history);
    container.innerHTML = Object.entries(groups)
      .filter(([, items]) => items.length)
      .map(([label, items]) => `
        <div class="ao3h-rt-history-group">
          <div class="ao3h-rt-history-group-label">${label}</div>
          <ul>${items.map(_rtRenderEntry).join('')}</ul>
        </div>`).join('');
  } else {
    container.innerHTML = `<ul>${history.map(_rtRenderEntry).join('')}</ul>`;
  }
}

function _rtRenderExclusionList (container) {
  const list = document.getElementById('ao3h-rt-exclusion-list');
  if (!list) return;
  const excluded = _rtLoadExcluded();
  if (!excluded.length) { list.innerHTML = '<li class="ao3h-rt-exclusion-empty">None</li>'; return; }
  list.innerHTML = excluded.map(entry => `
    <li>${_rtEsc(entry.replace(/^fandom:/, ''))}${entry.startsWith('fandom:') ? ' (fandom)' : ' (work ID)'}
      <button type="button" class="ao3h-rt-exclusion-remove" data-value="${_rtEsc(entry)}" aria-label="Remove">✕</button>
    </li>`).join('');
  list.querySelectorAll('.ao3h-rt-exclusion-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      _rtSaveExcluded(_rtLoadExcluded().filter(v => v !== btn.dataset.value));
      _rtRenderExclusionList(container);
    });
  });
}

function wireConfigArea (container) {
  const listEl = container.querySelector('#ao3h-rt-history-list');
  if (listEl && !listEl.dataset.wired) {
    listEl.dataset.wired = '1';
    const rerender = () => _rtRenderHistoryList(listEl);

    container.querySelector('#ao3h-rt-search')?.addEventListener('input', rerender);
    container.querySelector('#ao3h-rt-sort')?.addEventListener('change', rerender);
    container.querySelector('#ao3h-rt-group-period')?.addEventListener('change', rerender);

    listEl.addEventListener('click', (e) => {
      const pinBtn = e.target.closest('[data-action="rt-pin"]');
      const noteBtn = e.target.closest('[data-action="rt-note"]');
      const delBtn = e.target.closest('[data-action="delete-entry"]');
      const entryId = e.target.closest('.ao3h-rt-history-entry')?.dataset.id;
      if (!entryId) return;

      if (pinBtn) {
        const history = _rtLoadHistory().map(entry => entry.id === entryId ? { ...entry, pinned: !entry.pinned } : entry);
        _rtSaveHistory(history);
        rerender();
      } else if (noteBtn) {
        const history = _rtLoadHistory();
        const entry = history.find(x => x.id === entryId);
        const note = window.prompt('Personal note for this entry:', entry?.note || '');
        if (note === null) return;
        _rtSaveHistory(history.map(x => x.id === entryId ? { ...x, note: note.trim() || undefined } : x));
        rerender();
      } else if (delBtn) {
        _rtSaveHistory(_rtLoadHistory().filter(x => x.id !== entryId));
        rerender();
      }
    });

    rerender();
  }

  const cleanupBtn = container.querySelector('[data-action="rt-cleanup"]');
  if (cleanupBtn && !cleanupBtn.dataset.wired) {
    cleanupBtn.dataset.wired = '1';
    cleanupBtn.addEventListener('click', () => {
      const days = parseInt(container.querySelector('#ao3h-rt-cleanup-days')?.value, 10);
      if (!days || days <= 0) { window.alert('Enter a number of days first.'); return; }
      const history = _rtLoadHistory();
      const toRemove = new Set(_rtEntriesToCleanUp(history, days));
      const kept = history.filter(e => !toRemove.has(e.id));
      const removed = history.length - kept.length;
      _rtSaveHistory(kept);
      if (listEl) _rtRenderHistoryList(listEl);
      window.alert(`Removed ${removed} entr${removed !== 1 ? 'ies' : 'y'} older than ${days} days (pinned entries kept).`);
    });
  }

  const addExclusionBtn = container.querySelector('[data-action="rt-add-exclusion"]');
  if (addExclusionBtn && !addExclusionBtn.dataset.wired) {
    addExclusionBtn.dataset.wired = '1';
    _rtRenderExclusionList(container);
    addExclusionBtn.addEventListener('click', () => {
      const input = container.querySelector('#ao3h-rt-exclude-input');
      const raw = input?.value.trim();
      if (!raw) return;
      const value = /^\d+$/.test(raw) ? raw : `fandom:${raw}`;
      const excluded = _rtLoadExcluded();
      if (!excluded.includes(value)) _rtSaveExcluded([...excluded, value]);
      input.value = '';
      _rtRenderExclusionList(container);
    });
  }
}

// ── Listen for config open (real panel on AO3) ────────────────────────────
document.addEventListener('ao3h:configOpen', function (e) {
  if (e.detail?.moduleId !== 'readingTracker') return;
  wireConfigArea(e.target);
});

export { wireConfigArea };
