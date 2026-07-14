/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Appreciation › MultiStatusTracker sub-module
    Storage key: ficAppreciation:status  — { [workId]: { status, date, note? } }
    Methods: getStatus, setStatus, clearStatus,
             applyStatusBadge, injectStatusToggle,
             injectWorkPageStatusToggle,
             shouldHide, getStats, exportStatuses

    - Feature: Multiple reading status options
      - To-Read 📚, Reading 📖, Finished ✅, Dropped ❌,
        Disliked 💔, On-Hold ⏸️, Re-read 🔁
      - Each status stored with date and optional note

    - Feature: Status badges on work blurbs
      - Icon badge appended to h4.heading
      - Tooltip shows status label + date + note

    - Feature: Quick status toggle on blurbs
      - Dropdown injected into .stats area
      - Updates badge immediately on change

    - Feature: Status toggle on work pages
      - Dropdown injected into ul.actions
      - Shows current status; updates on selection

    - Feature: Status notes
      - Optional prompt for note on Dropped/Disliked
      - Note stored alongside status

    - Feature: Status filtering (hide by status)
      - shouldHide(workId, statusesToHide) helper
      - Called by coordinator for active filter cfg

    - Feature: Statistics
      - getStats() — count per status, completionRate, dropRate

    - Feature: Export
      - exportStatuses('json'|'csv') — downloads all statuses

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { EV_STATUS_CHANGED } from '../../../../lib/utils/event-names.js';

const W = getGlobalWindow();

// ── Status definitions ────────────────────────────────────────────────────

const STATUSES = {
  'to-read':  { label: 'To-Read',  icon: '📚', notePrompt: false },
  'reading':  { label: 'Reading',  icon: '📖', notePrompt: false },
  'finished': { label: 'Finished', icon: '✅',  notePrompt: false },
  'dropped':  { label: 'Dropped',  icon: '❌',  notePrompt: true  },
  'disliked': { label: 'Disliked', icon: '💔', notePrompt: true  },
  'on-hold':  { label: 'On Hold',  icon: '⏸️', notePrompt: false },
  're-read':  { label: 'Re-read',  icon: '🔁', notePrompt: false },
};
const STATUS_KEYS = Object.keys(STATUSES);

export class MultiStatusTracker {
  /** @param {{ NS, storeGet, storeSet, cfg }} opts */
  constructor ({ NS, storeGet, storeSet, cfg }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.storeSet = storeSet;
    this.cfg      = cfg;
    this.SK       = 'ficAppreciation:status';
  }

  _load ()    { return this.storeGet(this.SK, {}); }
  _save (map) { this.storeSet(this.SK, map); }

  // ── Core API ──────────────────────────────────────────────────────────────

  getStatus (workId) { return this._load()[workId] ?? null; }

  setStatus (workId, status, note) {
    if (!STATUSES[status]) return;
    const map   = this._load();
    map[workId] = {
      status,
      date: new Date().toISOString().slice(0, 10),
      ...(note ? { note } : {}),
    };
    this._save(map);
    W.dispatchEvent?.(new CustomEvent(EV_STATUS_CHANGED, { detail: { workId, status } }));
  }

  clearStatus (workId) {
    const map = this._load();
    delete map[workId];
    this._save(map);
    W.dispatchEvent?.(new CustomEvent(EV_STATUS_CHANGED, { detail: { workId, status: null } }));
  }

  // ── Blurb badge ───────────────────────────────────────────────────────────

  /** Inject icon badge on h4.heading if a status is set. */
  applyStatusBadge (blurb, workId) {
    const { NS } = this;
    if (blurb.dataset.mstBadge) return;
    blurb.dataset.mstBadge = '1';

    const entry   = this.getStatus(workId);
    const heading = blurb.querySelector('h4.heading');
    if (!heading || !entry) return;

    const def = STATUSES[entry.status];
    if (!def) return;

    const badge       = document.createElement('span');
    badge.className   = `${NS}-fa-badge ${NS}-fa-badge-status ${NS}-fa-badge-status-${entry.status}`;
    badge.textContent = def.icon;
    badge.title       = `${def.label}${entry.date ? ' — ' + entry.date : ''}${entry.note ? '\n' + entry.note : ''}`;
    heading.appendChild(badge);
  }

  /** Inject a quick-status dropdown into a blurb's .stats area. */
  injectStatusToggle (blurb, workId) {
    const { NS } = this;
    if (blurb.dataset.mstToggle) return;
    blurb.dataset.mstToggle = '1';

    const stats = blurb.querySelector('.stats');
    if (!stats) return;

    const entry   = this.getStatus(workId);
    const current = entry?.status || '';

    const sel = document.createElement('select');
    sel.className = `${NS}-fa-status-select`;
    sel.title     = 'Set reading status';
    sel.setAttribute('aria-label', 'Reading status');

    const blank       = document.createElement('option');
    blank.value       = '';
    blank.textContent = '— Status —';
    sel.appendChild(blank);

    for (const [key, def] of Object.entries(STATUSES)) {
      const opt       = document.createElement('option');
      opt.value       = key;
      opt.textContent = `${def.icon} ${def.label}`;
      opt.selected    = key === current;
      sel.appendChild(opt);
    }

    const clearOpt       = document.createElement('option');
    clearOpt.value       = '__clear__';
    clearOpt.textContent = '✕ Clear status';
    sel.appendChild(clearOpt);

    sel.addEventListener('change', () => {
      const val = sel.value;
      if (!val) return;
      if (val === '__clear__') {
        this.clearStatus(workId);
        sel.value = '';
        this._refreshBadge(blurb, workId);
        return;
      }
      const def = STATUSES[val];
      let note  = null;
      if (def?.notePrompt && this.cfg('statusNotes') !== false) {
        note = W.prompt(`Add a note for "${def.label}" (optional):`) || null;
      }
      this.setStatus(workId, val, note);
      this._refreshBadge(blurb, workId);
    });

    stats.appendChild(sel);
  }

  /** Re-render the badge after a status change on a blurb. */
  _refreshBadge (blurb, workId) {
    const { NS } = this;
    blurb.querySelector(`.${NS}-fa-badge-status`)?.remove();
    delete blurb.dataset.mstBadge;
    this.applyStatusBadge(blurb, workId);
  }

  // ── Work page ─────────────────────────────────────────────────────────────

  /** Inject a status dropdown in ul.actions on a work page. */
  injectWorkPageStatusToggle (workId) {
    const { NS } = this;
    const id = `${NS}-fa-work-status`;
    if (document.getElementById(id)) return;

    const actionsList = document.querySelector('#feedback ul.actions');
    if (!actionsList) return;

    const entry   = this.getStatus(workId);
    const current = entry?.status || '';

    const li  = document.createElement('li');
    li.id     = id;

    const sel = document.createElement('select');
    sel.className = `${NS}-fa-status-select`;
    sel.setAttribute('aria-label', 'Reading status');

    const blank       = document.createElement('option');
    blank.value       = '';
    blank.textContent = '— Reading status —';
    sel.appendChild(blank);

    for (const [key, def] of Object.entries(STATUSES)) {
      const opt       = document.createElement('option');
      opt.value       = key;
      opt.textContent = `${def.icon} ${def.label}`;
      opt.selected    = key === current;
      sel.appendChild(opt);
    }

    const clearOpt       = document.createElement('option');
    clearOpt.value       = '__clear__';
    clearOpt.textContent = '✕ Clear status';
    sel.appendChild(clearOpt);

    sel.addEventListener('change', () => {
      const val = sel.value;
      if (!val) return;
      if (val === '__clear__') { this.clearStatus(workId); sel.value = ''; return; }
      const def = STATUSES[val];
      let note  = null;
      if (def?.notePrompt && this.cfg('statusNotes') !== false) {
        note = W.prompt(`Add a note for "${def.label}" (optional):`) || null;
      }
      this.setStatus(workId, val, note);
    });

    li.appendChild(sel);
    actionsList.insertBefore(li, actionsList.firstChild);
  }

  // ── Filter helper ─────────────────────────────────────────────────────────

  /**
   * Returns true if the work should be hidden based on active status filters.
   * @param {string}   workId
   * @param {string[]} statusesToHide  e.g. ['finished', 'dropped']
   */
  shouldHide (workId, statusesToHide) {
    if (!statusesToHide?.length) return false;
    const entry = this.getStatus(workId);
    return entry ? statusesToHide.includes(entry.status) : false;
  }

  // ── Statistics ────────────────────────────────────────────────────────────

  /** Returns { total, byStatus, completionRate, dropRate } */
  getStats () {
    const map     = this._load();
    const entries = Object.values(map);
    const total   = entries.length;

    const byStatus = {};
    for (const key of STATUS_KEYS) byStatus[key] = 0;
    for (const { status } of entries) {
      if (byStatus[status] !== undefined) byStatus[status]++;
    }

    const completionRate = total
      ? Math.round((byStatus['finished'] / total) * 100)
      : 0;
    const dropRate = total
      ? Math.round(((byStatus['dropped'] + byStatus['disliked']) / total) * 100)
      : 0;

    return { total, byStatus, completionRate, dropRate };
  }

  // ── Export ────────────────────────────────────────────────────────────────

  /** @param {'json'|'csv'} format */
  exportStatuses (format = 'json') {
    const map   = this._load();
    const today = new Date().toLocaleDateString('en-CA');
    let blob, filename;

    if (format === 'csv') {
      const rows = [
        'workId,status,date,note',
        ...Object.entries(map).map(([id, v]) =>
          `${id},${v.status},${v.date || ''},${(v.note || '').replace(/,/g, ';')}`
        ),
      ];
      blob     = new Blob([rows.join('\n')], { type: 'text/csv' });
      filename = `ao3h_statuses_${today}.csv`;
    } else {
      const arr = Object.entries(map).map(([workId, v]) => ({ workId, ...v }));
      blob      = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
      filename  = `ao3h_statuses_${today}.json`;
    }

    downloadFile(blob, filename);
  }
}

// Expose the status definitions so the coordinator can reference them if needed
MultiStatusTracker.STATUSES = STATUSES;
