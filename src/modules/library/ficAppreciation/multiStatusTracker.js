/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Multi-Status Tracker

Persists seven reading states and provides work-page selectors, listing badges,
status filtering, summary statistics, and JSON or CSV exports.

Notes

- Dropped and disliked states may include an optional prompted note.
- Status changes dispatch the shared status-changed event.
- The coordinator owns removal of injected selectors and badges.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { EV_STATUS_CHANGED } from '../../../../lib/utils/event-names.js';
import { appendHeadingBadge } from '../../../../lib/ui/badges.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

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
  /** @param {{ NS, storeGet, storeSet, cfg, helpers: typeof import('./_ficAppreciation.js').ficAppreciationHelpers }} opts */
  constructor ({ NS, storeGet, storeSet, cfg, helpers }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.storeSet = storeSet;
    this.cfg      = cfg;
    this.helpers  = helpers;
    this.SK       = 'ficAppreciation:status';
  }

  _load ()    { return this.storeGet(this.SK, {}); }
  _save (map) { this.storeSet(this.SK, map); }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — STATUS STORAGE
  ═══════════════════════════════════════════════════════════════════════ */

  getStatus (workId) { return this._load()[workId] ?? null; }

  setStatus (workId, status, note) {
    if (!STATUSES[status]) return;
    const map  = this._load();
    const prev = map[workId];
    // Re-read count survives status changes: it's how many times this work
    // was explicitly marked "re-read", not tied to the currently-set status.
    const rereadCount = status === 're-read' ? this.helpers.nextRereadCount(prev) : prev?.rereadCount;
    map[workId] = {
      status,
      date: new Date().toISOString().slice(0, 10),
      ...(note ? { note } : {}),
      ...(rereadCount ? { rereadCount } : {}),
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

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — LISTING BADGES AND STATUS SELECTORS
  ═══════════════════════════════════════════════════════════════════════ */

  /** Inject icon badge on h4.heading if a status is set. */
  applyStatusBadge (blurb, workId) {
    const { NS } = this;
    if (blurb.dataset.mstBadge) return;
    blurb.dataset.mstBadge = '1';

    const entry = this.getStatus(workId);
    if (!entry) return;

    const def = STATUSES[entry.status];
    if (!def) return;

    // Show a live reading-progress percentage instead of a flat icon while a work
    // is still in progress, using data readingTracker already tracks (if enabled).
    const progressPct = entry.status === 'reading'
      ? W.AO3H_ReadingTracker?.getProgress?.(workId)?.progress
      : null;
    const text = (typeof progressPct === 'number') ? `${def.icon} ${progressPct}%` : def.icon;

    appendHeadingBadge(blurb, {
      className: `${NS}-fa-badge ${NS}-fa-badge-status ${NS}-fa-badge-status-${entry.status}`,
      guardSelector: `.${NS}-fa-badge-status`,
      text,
      title: `${def.label}` +
        (typeof progressPct === 'number' ? ` — ${progressPct}% read` : '') +
        (entry.date ? ' — ' + entry.date : '') +
        (entry.rereadCount ? ` — re-read ${entry.rereadCount}×` : '') +
        (entry.note ? '\n' + entry.note : ''),
    });
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

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WORK-PAGE STATUS SELECTOR
  ═══════════════════════════════════════════════════════════════════════ */

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

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — FILTERING, STATISTICS, AND EXPORT
  ═══════════════════════════════════════════════════════════════════════ */

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


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // Injected UI is cleaned up centrally by the Fic Appreciation coordinator.
}

// Expose the status definitions so the coordinator can reference them if needed
MultiStatusTracker.STATUSES = STATUSES;
