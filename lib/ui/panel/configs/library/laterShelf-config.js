/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Later Shelf

   Configuration panel for the Later Shelf module.
   Previously: markedForLaterManager + workReminder

   Sections:
   - Quick Button
   - Shelf Behaviour
   - Work Reminders
   - Groups (rename/delete)
   - Archive (removed items — restore or delete forever)
   - Reminder History (fired/cancelled/snoozed log)
   - Resume Reminders (in-progress works not on the shelf, from readingTracker)
   - Stats (conversion: saved → actually read/dropped)
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'laterShelf';
export const config = `

                <!-- ─── QUICK BUTTON ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Button</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickButton" checked>
                            Show 📌 button on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown in all contexts, except works already bookmarked</div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Button position</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="buttonPosition" data-setting="buttonPosition" value="after-title" checked> After the title</label>
                        <label><input type="radio" name="buttonPosition" data-setting="buttonPosition" value="before-title"> Before the title</label>
                        <label><input type="radio" name="buttonPosition" data-setting="buttonPosition" value="end-of-blurb"> End of the blurb</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="noteOnAdd">
                            Prompt for a quick note when saving
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Optional — leave the prompt blank to skip it for a given fic</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="bulkAddEnabled">
                            Bulk "add selected to shelf" on listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a checkbox to every work, plus a button to add all checked ones at once</div>
                </div>

                <!-- ─── SHELF BEHAVIOUR ─── -->
                </div><!-- /.ao3h-config-section: Quick Button -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Shelf Behaviour</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoRemoveOnFinish">
                            Auto-remove a work once you've finished it
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Requires the Fic Appreciation module's "Finished" status</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Lingering threshold (days)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="staleDays" value="45" min="1">
                    </div>
                    <div class="ao3h-setting-description">How long a fic can sit unread before Work Reminders sends a one-time "still interested?" nudge</div>
                </div>

                <!-- ─── WORK REMINDERS ─── -->
                </div><!-- /.ao3h-config-section: Shelf Behaviour -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Work Reminders</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="remindersEnabled" id="ao3h-ls-reminders">
                            Enable work reminders
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Opt-in — in-browser notifications only. Set reminders per work from the MFL list. Also enables one-time nudges for dropped/lingering fics.</div>
                </div>

                </div><!-- /.ao3h-config-section: Work Reminders -->

                <!-- ─── GROUPS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Groups</div>
                <div class="ao3h-setting-description">Rename or clear the free-text groups assigned to shelf items from the MFL page (e.g. "weekend reading", "short fics").</div>
                <div id="ao3h-ls-cfg-groups-list" class="ao3h-ls-cfg-list"></div>
                </div><!-- /.ao3h-config-section: Groups -->

                <!-- ─── ARCHIVE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Archive</div>
                <div class="ao3h-setting-description">Fics removed from the shelf land here instead of disappearing outright.</div>
                <div id="ao3h-ls-cfg-archive-list" class="ao3h-ls-cfg-list"></div>
                </div><!-- /.ao3h-config-section: Archive -->

                <!-- ─── REMINDER HISTORY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Reminder History</div>
                <div id="ao3h-ls-cfg-reminder-history" class="ao3h-ls-cfg-list"></div>
                </div><!-- /.ao3h-config-section: Reminder History -->

                <!-- ─── RESUME REMINDERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Resume Reminders</div>
                <div class="ao3h-setting-description">In-progress works from your reading history that aren't on the Later Shelf. Set a reminder without adding them to the shelf.</div>
                <div id="ao3h-ls-cfg-resume-list" class="ao3h-ls-cfg-list"></div>
                </div><!-- /.ao3h-config-section: Resume Reminders -->

                <!-- ─── STATS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Stats</div>
                <div id="ao3h-ls-cfg-stats"></div>
                </div><!-- /.ao3h-config-section: Stats -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

// ── Storage (raw ao3h:-prefixed keys — panel configs stay self-contained, no
//    imports from src/modules/, same convention as readingTracker-config.js) ──
const SK_ITEMS       = 'ao3h:laterShelf:items';
const SK_ARCHIVE      = 'ao3h:laterShelf:archive';
const SK_REMINDERS    = 'ao3h:laterShelf:reminders';
const SK_REM_HISTORY  = 'ao3h:laterShelf:reminders:history';
const SK_RT_HISTORY   = 'ao3h:rt:history';
const SK_FA_STATUS    = 'ao3h:ficAppreciation:status';

function _lsGet (key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; } catch { return fallback; }
}
function _lsSet (key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota / storage indisponible */ }
}

function _lsEsc (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _lsItems ()      { const v = _lsGet(SK_ITEMS, []); return Array.isArray(v) ? v : []; }
function _lsSaveItems (v) { _lsSet(SK_ITEMS, v); }
function _lsArchive ()    { const v = _lsGet(SK_ARCHIVE, []); return Array.isArray(v) ? v : []; }
function _lsSaveArchive (v) { _lsSet(SK_ARCHIVE, v); }
function _lsReminders ()  { const v = _lsGet(SK_REMINDERS, {}); return v && typeof v === 'object' ? v : {}; }
function _lsReminderHistory () { const v = _lsGet(SK_REM_HISTORY, []); return Array.isArray(v) ? v : []; }
function _lsRtHistory ()  { const v = _lsGet(SK_RT_HISTORY, []); return Array.isArray(v) ? v : []; }
function _lsFaStatus ()   { const v = _lsGet(SK_FA_STATUS, {}); return v && typeof v === 'object' ? v : {}; }

/* ═══════════════════════════════════════════════════════════════════════════
   GROUPS
═══════════════════════════════════════════════════════════════════════════ */

function _lsRenderGroups (container) {
  const items = _lsItems();
  const counts = {};
  items.forEach(i => { if (i.group) counts[i.group] = (counts[i.group] || 0) + 1; });
  const groups = Object.keys(counts).sort();
  if (!groups.length) { container.innerHTML = '<p class="ao3h-ls-cfg-empty">No groups yet — assign one from the MFL page.</p>'; return; }
  container.innerHTML = groups.map(g => `
    <div class="ao3h-ls-cfg-row" data-group="${_lsEsc(g)}">
      <span>${_lsEsc(g)} (${counts[g]})</span>
      <button type="button" data-action="ls-rename-group" data-group="${_lsEsc(g)}">Rename</button>
      <button type="button" data-action="ls-clear-group" data-group="${_lsEsc(g)}">Clear</button>
    </div>`).join('');
}

function _lsWireGroups (container) {
  container.addEventListener('click', (e) => {
    const renameBtn = e.target.closest('[data-action="ls-rename-group"]');
    const clearBtn  = e.target.closest('[data-action="ls-clear-group"]');
    if (renameBtn) {
      const oldName = renameBtn.dataset.group;
      const next = window.prompt(`Rename group "${oldName}" to:`, oldName);
      if (next === null || !next.trim() || next.trim() === oldName) return;
      _lsSaveItems(_lsItems().map(i => i.group === oldName ? { ...i, group: next.trim() } : i));
      _lsRenderGroups(container);
    } else if (clearBtn) {
      const name = clearBtn.dataset.group;
      if (!window.confirm(`Remove the "${name}" group from all its fics? (the fics themselves stay on the shelf)`)) return;
      _lsSaveItems(_lsItems().map(i => i.group === name ? { ...i, group: '' } : i));
      _lsRenderGroups(container);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARCHIVE
═══════════════════════════════════════════════════════════════════════════ */

function _lsRenderArchive (container) {
  const archive = _lsArchive();
  if (!archive.length) { container.innerHTML = '<p class="ao3h-ls-cfg-empty">No removed fics yet.</p>'; return; }
  container.innerHTML = archive.slice(0, 50).map(i => `
    <div class="ao3h-ls-cfg-row" data-wid="${_lsEsc(i.wid)}">
      <a href="https://archiveofourown.org/works/${_lsEsc(i.wid)}" target="_blank" rel="noopener">${_lsEsc(i.title || `Work ${i.wid}`)}</a>
      <span class="ao3h-ls-cfg-meta">removed ${i.removedAt ? new Date(i.removedAt).toLocaleDateString() : ''}</span>
      <button type="button" data-action="ls-restore" data-wid="${_lsEsc(i.wid)}">↩ Restore</button>
      <button type="button" data-action="ls-forget" data-wid="${_lsEsc(i.wid)}">🗑 Delete forever</button>
    </div>`).join('');
}

function _lsWireArchive (container) {
  container.addEventListener('click', (e) => {
    const restoreBtn = e.target.closest('[data-action="ls-restore"]');
    const forgetBtn  = e.target.closest('[data-action="ls-forget"]');
    const wid = (restoreBtn || forgetBtn)?.dataset.wid;
    if (!wid) return;
    const archive = _lsArchive();
    const idx = archive.findIndex(i => String(i.wid) === String(wid));
    if (idx === -1) return;
    const [entry] = archive.splice(idx, 1);
    _lsSaveArchive(archive);
    if (restoreBtn) {
      const { removedAt, ...item } = entry;
      void removedAt;
      const items = _lsItems();
      if (!items.some(i => String(i.wid) === String(wid))) {
        items.push({ ...item, addedAt: Date.now(), order: Date.now() });
        _lsSaveItems(items);
      }
    }
    _lsRenderArchive(container);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   REMINDER HISTORY
═══════════════════════════════════════════════════════════════════════════ */

const _LS_ACTION_LABEL = { fired: '🔔 Fired', cancelled: '✕ Cancelled', snoozed: '💤 Snoozed' };

function _lsRenderReminderHistory (container) {
  const history = _lsReminderHistory();
  if (!history.length) { container.innerHTML = '<p class="ao3h-ls-cfg-empty">No reminder activity yet.</p>'; return; }
  container.innerHTML = history.slice(0, 50).map(h => `
    <div class="ao3h-ls-cfg-row">
      <span>${_LS_ACTION_LABEL[h.action] || h.action}</span>
      <a href="https://archiveofourown.org/works/${_lsEsc(h.wid)}" target="_blank" rel="noopener">${_lsEsc(h.title || `Work ${h.wid}`)}</a>
      ${h.special ? `<span class="ao3h-ls-cfg-meta">(${_lsEsc(h.special)})</span>` : ''}
      <span class="ao3h-ls-cfg-meta">${h.at ? new Date(h.at).toLocaleString() : ''}</span>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESUME REMINDERS
═══════════════════════════════════════════════════════════════════════════ */

function _lsRenderResumeList (container) {
  const shelfIds = new Set(_lsItems().map(i => String(i.wid)));
  const reminders = _lsReminders();
  const inProgress = _lsRtHistory().filter(e =>
    e.totalChapters && e.chapter && e.chapter < e.totalChapters && !shelfIds.has(String(e.id))
  );
  if (!inProgress.length) { container.innerHTML = '<p class="ao3h-ls-cfg-empty">Nothing in progress outside your shelf right now.</p>'; return; }
  container.innerHTML = inProgress.slice(0, 20).map(e => `
    <div class="ao3h-ls-cfg-row" data-wid="${_lsEsc(e.id)}" data-title="${_lsEsc(e.title || '')}">
      <a href="${_lsEsc(e.href || `/works/${e.id}`)}" target="_blank" rel="noopener">${_lsEsc(e.title || `Work ${e.id}`)}</a>
      <span class="ao3h-ls-cfg-meta">Ch. ${e.chapter}/${e.totalChapters}</span>
      ${reminders[e.id] ? '<span class="ao3h-ls-cfg-meta">⏰ reminder set</span>' : '<button type="button" data-action="ls-resume-remind">⏰ Remind me</button>'}
    </div>`).join('');
}

function _lsWireResumeList (container) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="ls-resume-remind"]');
    if (!btn) return;
    const row = btn.closest('.ao3h-ls-cfg-row');
    const wid = row?.dataset.wid;
    const title = row?.dataset.title || `Work ${wid}`;
    if (!wid) return;
    const dateStr = window.prompt(`Remind me to resume "${title}" on (YYYY-MM-DD):`);
    if (!dateStr || !dateStr.trim()) return;
    const ts = Date.parse(dateStr.trim());
    if (isNaN(ts)) { window.alert('Invalid date. Please use YYYY-MM-DD format.'); return; }
    const reminders = _lsReminders();
    reminders[wid] = { title, remindAt: ts, status: 'pending' };
    _lsSet(SK_REMINDERS, reminders);
    _lsRenderResumeList(container);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════════════════ */

function _lsRenderStats (container) {
  const items = _lsItems();
  const total = items.length;
  const readIds = new Set(_lsRtHistory().map(e => String(e.id)));
  const status = _lsFaStatus();
  const droppedIds = new Set(Object.keys(status).filter(id => status[id]?.status === 'dropped'));
  const read = items.filter(i => readIds.has(String(i.wid))).length;
  const dropped = items.filter(i => droppedIds.has(String(i.wid))).length;
  const readPercent = total ? Math.round((read / total) * 100) : 0;
  container.innerHTML = `
    <p>${total} fic${total !== 1 ? 's' : ''} currently on the shelf.</p>
    <p>${read} of them (${readPercent}%) show up in your reading history — you actually got to them.</p>
    <p>${dropped} were marked "dropped" in Fic Appreciation but are still saved here.</p>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   WIRING
═══════════════════════════════════════════════════════════════════════════ */

function wireConfigArea (container) {
  const groupsEl = container.querySelector('#ao3h-ls-cfg-groups-list');
  if (groupsEl && !groupsEl.dataset.wired) {
    groupsEl.dataset.wired = '1';
    _lsWireGroups(groupsEl);
    _lsRenderGroups(groupsEl);
  }

  const archiveEl = container.querySelector('#ao3h-ls-cfg-archive-list');
  if (archiveEl && !archiveEl.dataset.wired) {
    archiveEl.dataset.wired = '1';
    _lsWireArchive(archiveEl);
    _lsRenderArchive(archiveEl);
  }

  const historyEl = container.querySelector('#ao3h-ls-cfg-reminder-history');
  if (historyEl && !historyEl.dataset.wired) {
    historyEl.dataset.wired = '1';
    _lsRenderReminderHistory(historyEl);
  }

  const resumeEl = container.querySelector('#ao3h-ls-cfg-resume-list');
  if (resumeEl && !resumeEl.dataset.wired) {
    resumeEl.dataset.wired = '1';
    _lsWireResumeList(resumeEl);
    _lsRenderResumeList(resumeEl);
  }

  const statsEl = container.querySelector('#ao3h-ls-cfg-stats');
  if (statsEl && !statsEl.dataset.wired) {
    statsEl.dataset.wired = '1';
    _lsRenderStats(statsEl);
  }
}

// ── Listen for config open (real panel on AO3) ────────────────────────────
document.addEventListener('ao3h:configOpen', function (e) {
  if (e.detail?.moduleId !== 'laterShelf') return;
  wireConfigArea(e.target);
});

export { wireConfigArea };
