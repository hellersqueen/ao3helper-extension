/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Tracker › View History

Provides reading-history search, deletion, clearing, export, AO3 import, and
per-work progress-clearing actions for configuration panels.

Notes

- AO3 history is read from the current page or fetched for the logged-in user.
- Imports merge only previously unknown work IDs.
- Pending imports and delegated event listeners are cancelled during teardown.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { fetchAO3PageText } from '../../../../lib/ao3/requests.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

// History operations use dependencies supplied by the coordinator.

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — HISTORY MANAGEMENT
═══════════════════════════════════════════════════════════════════════════ */

export class ViewHistory {
  /** @param {{ NS, LOG, isHistoryPage, getHistory, saveHistory, clearProgress }} opts */
  constructor ({ NS, LOG, isHistoryPage, getHistory, saveHistory, clearProgress }) {
    this.NS             = NS;
    this.LOG            = LOG;
    this.isHistoryPage  = isHistoryPage;
    this.getHistory     = getHistory;
    this.saveHistory    = saveHistory;
    this.clearProgress  = clearProgress;
    this._onInput       = null;
    this._onClick       = null;
    this._abortController = null;
    this._active        = false;
  }

  clearHistory () { this.saveHistory([]); }

  deleteEntry (workId) {
    const history = this.getHistory();
    this.saveHistory(history.filter(e => e.id !== workId));
  }

  filterHistory (query) {
    const history = this.getHistory();
    if (!query) return history;
    const q = query.toLowerCase();
    return history.filter(e =>
      (e.title  || '').toLowerCase().includes(q) ||
      (e.author || '').toLowerCase().includes(q)
    );
  }

  exportHistory () {
    downloadJSON(this.getHistory(), 'ao3h-reading-history.json');
  }

  async importAO3History () {
    const { LOG, isHistoryPage, getHistory, saveHistory } = this;
    const username = /** @type {HTMLAnchorElement | null} */ (document.querySelector('a[href^="/users/"]'))?.href.match(/\/users\/([^/]+)/)?.[1];
    if (!username) { alert('Could not detect username. Make sure you are logged in.'); return; }
    let html;
    const importToken = Symbol('history-import');
    this._importToken = importToken;
    try {
      if (isHistoryPage()) {
        html = document.documentElement.outerHTML;
      } else {
        this._abortController = new AbortController();
        html = await fetchAO3PageText(`/users/${username}/readings`, { signal: this._abortController.signal });
      }
    } catch (err) {
      if (err?.name === 'AbortError' || !this._active) return;
      console.error(LOG, 'importAO3History fetch failed', err);
      alert('Could not fetch reading history. Check the console for details.');
      return;
    }
    if (!this._active || this._importToken !== importToken) return;
    const parser   = new DOMParser();
    const doc      = parser.parseFromString(html, 'text/html');
    const blurbs   = doc.querySelectorAll('li.work.blurb, div.work.blurb');
    const history  = getHistory();
    const existing = new Set(history.map(e => e.id));
    let imported   = 0;
    blurbs.forEach(blurb => {
      const idM = (blurb.id || '').match(/^work_(\d+)$/);
      if (!idM) return;
      const workId = idM[1];
      if (existing.has(workId)) return;
      history.push({
        id:         workId,
        title:      blurb.querySelector('h4.heading a')?.textContent.trim() || '',
        author:     blurb.querySelector('a[rel="author"]')?.textContent.trim() || '',
        href:       `/works/${workId}`,
        seenAt:     Date.now(), lastReadAt: Date.now(),
        chapter: null, chapterId: null, chapterHref: null, totalChapters: null,
      });
      imported++;
    });
    saveHistory(history);
    alert(`Imported ${imported} new work${imported !== 1 ? 's' : ''} from your AO3 history.`);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PANEL ACTIONS
  ═════════════════════════════════════════════════════════════════════════ */

  /** @param {{ parseWorkId, onClearProgressUI, onHistoryFilter }} opts */
  wirePanelActions ({ parseWorkId, onClearProgressUI, onHistoryFilter }) {
    this.teardown();
    this._active = true;
    this._onInput = (e) => {
      const input = e.target.closest('[data-action="search-history"]');
      if (!input) return;
      const results = this.filterHistory(input.value.trim());
      onHistoryFilter?.(results);
    };
    this._onClick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'clear-history' && confirm('Clear all reading history?')) {
        this.clearHistory();
      } else if (action === 'import-ao3-history') {
        this.importAO3History();
      } else if (action === 'export-history') {
        this.exportHistory();
      } else if (action === 'delete-entry') {
        const workId = btn.dataset.workId;
        if (workId) this.deleteEntry(workId);
      } else if (action === 'clear-progress') {
        const workId = parseWorkId();
        if (workId && confirm('Clear reading progress for this work?')) {
          this.clearProgress(workId);
          onClearProgressUI?.();
        }
      }
    };
    document.addEventListener('input', this._onInput);
    document.addEventListener('click', this._onClick);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  teardown () {
    if (this._onInput) document.removeEventListener('input', this._onInput);
    if (this._onClick) document.removeEventListener('click', this._onClick);
    this._onInput = null;
    this._onClick = null;
    this._active = false;
    this._importToken = null;
    this._abortController?.abort();
    this._abortController = null;
    this._gmRequest?.abort?.();
    this._gmRequest = null;
  }
}
