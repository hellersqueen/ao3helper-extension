/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Backup & Sync › Data Transfer

Purpose
    Extracts work metadata for JSON, CSV, or HTML export and transfers AO3
    Helper settings through validated JSON files. Also builds the centralized
    transfer controls used by the coordinator.

Notes
    Work lists are extracted from the current page DOM and tagged with their
    detected source. Settings import accepts only a JSON object whose values
    are strings before writing them to localStorage.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { showToast as libShowToast } from '../../../../lib/ui/toast.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const D = document;

export class ImportExportLists {
  constructor(config = {}) {
    this.onExport     = config.onExport     || null;
    this.onImport     = config.onImport     || null;
    this.htmlTemplate = config.htmlTemplate || null; // (work) => html string
    this._active      = true;
    this._activeReader = null;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK LIST EXTRACTION
  ═════════════════════════════════════════════════════════════════════════ */

  // Returns: 'bookmarks' | 'marked-later' | 'history' | 'listing' | 'unknown'
  _detectPageSource() {
    const path   = W.location.pathname;
    const search = W.location.search;

    if (path.includes('/bookmarks'))              return 'bookmarks';
    if (path.includes('/readings')) {
      if (search.includes('show=to-read'))         return 'marked-later';
      return 'history';
    }
    if (path.includes('/works') || path.includes('/tags/')) return 'listing';
    return 'unknown';
  }

  // source (optional): filter results to a specific category.
  // If omitted, all works on the page are returned with their detected source.
  extractWorksList(source = null) {
    const detectedSource = this._detectPageSource();
    const works = [];

    D.querySelectorAll('.blurb.work, li.blurb.group').forEach(blurb => {
      const link   = blurb.querySelector('.heading a[href*="/works/"]');
      const author = blurb.querySelector('.byline a[rel="author"]');
      const stats  = blurb.querySelector('.stats');

      if (!link) return;

      works.push({
        title:   link.textContent.trim(),
        url:     link.href,
        author:  author?.textContent.trim() || 'Unknown',
        words:   stats?.querySelector('.words')?.textContent.trim() || '',
        kudos:   stats?.querySelector('.kudos')?.textContent.trim() || '',
        summary: blurb.querySelector('.summary')?.textContent.trim() || '',
        source:  detectedSource
      });
    });

    return source ? works.filter(w => w.source === source) : works;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK LIST EXPORTS
  ═════════════════════════════════════════════════════════════════════════ */

  exportAsJSON(works) {
    if (!works || works.length === 0) {
      works = this.extractWorksList();
    }

    const json = JSON.stringify(works, null, 2);
    downloadFile(json, `ao3-works-${Date.now()}.json`, 'application/json');

    if (this.onExport) {
      this.onExport('json', works.length);
    }
  }

  exportAsCSV(works) {
    if (!works || works.length === 0) {
      works = this.extractWorksList();
    }

    const headers = ['Title', 'Author', 'URL', 'Words', 'Kudos', 'Source'];
    const rows = works.map(w => [
      `"${w.title.replace(/"/g, '""')}"`,
      `"${w.author.replace(/"/g, '""')}"`,
      w.url,
      w.words,
      w.kudos,
      w.source || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadFile(csv, `ao3-works-${Date.now()}.csv`, 'text/csv');

    if (this.onExport) {
      this.onExport('csv', works.length);
    }
  }

  exportAsHTML(works) {
    if (!works || works.length === 0) {
      works = this.extractWorksList();
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AO3 Works List</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #900; }
    .work {
      margin: 15px 0; padding: 15px;
      background: white; border-radius: 8px;
      border-left: 4px solid #900;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .work h3 { margin: 0 0 10px 0; }
    a { color: #900; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .meta { color: #666; font-size: 14px; margin: 5px 0; }
    .summary { margin-top: 10px; line-height: 1.5; }
  </style>
</head>
<body>
  <h1>📚 AO3 Works List</h1>
  <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Total works:</strong> ${works.length}</p>
  <hr>
  ${works.map(w => this.htmlTemplate ? this.htmlTemplate(w) : `
    <div class="work">
      <h3><a href="${w.url}" target="_blank">${w.title}</a></h3>
      <div class="meta">
        <strong>By:</strong> ${w.author} |
        <strong>Words:</strong> ${w.words} |
        <strong>Kudos:</strong> ${w.kudos}
      </div>
      ${w.summary ? `<div class="summary">${w.summary}</div>` : ''}
    </div>
  `).join('')}
</body>
</html>`;

    downloadFile(html, `ao3-works-${Date.now()}.html`, 'text/html');

    if (this.onExport) {
      this.onExport('html', works.length);
    }
  }

  hasWorksOnPage() {
    return D.querySelector('.blurb.work, li.blurb.group') !== null;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SETTINGS EXPORT
  ═════════════════════════════════════════════════════════════════════════ */

  exportSettings() {
    const NS = AO3H.env?.NS || 'ao3h';
    const data = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes(NS) || key.includes('AO3H')) && !key.includes(':backupAndSync:backups')) {
        data[key] = localStorage.getItem(key);
      }
    }

    const count = Object.keys(data).length;
    if (count === 0) {
      this.showToast('No AO3Helper data found to export.', 'info');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(JSON.stringify(data, null, 2), `ao3h-settings-${timestamp}.json`, 'application/json');

    if (this.onExport) this.onExport('settings', count);
    this.showToast(`Settings exported: ${count} keys.`, 'success');
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SETTINGS IMPORT AND VALIDATION
  ═════════════════════════════════════════════════════════════════════════ */

  importFromFile() {
    return new Promise((resolve, reject) => {
      const input = D.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return reject(new Error('No file selected.'));

        const reader = new FileReader();
        this._activeReader = reader;
        reader.onload = (e) => {
          this._activeReader = null;
          if (!this._active) return; // module deactivated while the file was being read
          try {
            if (typeof reader.result !== 'string') throw new Error('Invalid text file.');
            const raw = JSON.parse(reader.result);
            const data = this._validateImport(raw);
            let count = 0;

            Object.entries(data).forEach(([key, value]) => {
              localStorage.setItem(key, value);
              count++;
            });

            console.log(`[DataTransfer] Import complete — ${count} keys restored.`);
            this.showToast(`Import successful: ${count} keys restored.`, 'success');
            if (this.onImport) this.onImport(count);
            resolve(count);
          } catch (err) {
            this.showToast(`Import failed: ${err.message}`, 'error');
            reject(err);
          }
        };
        reader.onerror = () => { this._activeReader = null; reject(new Error('File read error.')); };
        reader.readAsText(file);
      });

      input.click();
    });
  }

  _validateImport(raw) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error('Invalid structure: expected a JSON object.');
    }

    const validated = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof key !== 'string') throw new Error(`Invalid key type: ${typeof key}`);
      if (typeof value !== 'string') throw new Error(`Value for key "${key}" must be a string.`);
      validated[key] = value;
    }

    if (Object.keys(validated).length === 0) {
      throw new Error('Empty backup file — nothing to import.');
    }

    return validated;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — MANAGEMENT INTERFACE
  ═════════════════════════════════════════════════════════════════════════ */

  buildUI(opts = {}) {
    const panel = D.createElement('div');
    panel.className = 'ao3h-datatransfer-panel';

    const makeBtn = (label, onClick) => {
      const btn = D.createElement('button');
      btn.textContent = label;
      btn.className = 'ao3h-datatransfer-btn';
      btn.addEventListener('click', onClick);
      return btn;
    };

    panel.appendChild(makeBtn('Export settings', () => this.exportSettings()));
    panel.appendChild(makeBtn('Import from file', () => this.importFromFile()));
    panel.appendChild(makeBtn('Export works as JSON', () => this.exportAsJSON()));
    panel.appendChild(makeBtn('Export works as CSV',  () => this.exportAsCSV()));
    panel.appendChild(makeBtn('Export works as HTML', () => this.exportAsHTML()));

    // Sync status display
    const statusRow = D.createElement('div');
    statusRow.className = 'ao3h-datatransfer-status';
    const dot = opts.syncEnabled ? '🟢' : '⚫';
    statusRow.textContent = `${dot} Cloud sync: ${opts.syncEnabled ? 'enabled' : 'disabled'}`;
    panel.appendChild(statusRow);

    if (opts.onSyncToggle) {
      const syncBtn = makeBtn(opts.syncEnabled ? 'Disable cloud sync' : 'Enable cloud sync', () => {
        opts.syncEnabled = !opts.syncEnabled;
        opts.onSyncToggle(opts.syncEnabled);
        syncBtn.textContent = opts.syncEnabled ? 'Disable cloud sync' : 'Enable cloud sync';
        statusRow.textContent = `${opts.syncEnabled ? '🟢' : '⚫'} Cloud sync: ${opts.syncEnabled ? 'enabled' : 'disabled'}`;
      });
      panel.appendChild(syncBtn);
    }

    return panel;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — VISUAL FEEDBACK
  ═════════════════════════════════════════════════════════════════════════ */

  showProgress(message = 'Loading…') {
    if (this._progressEl) return;
    const el = D.createElement('div');
    el.id = 'ao3h-progress';
    el.innerHTML = `<span class="ao3h-progress-spinner"></span>${message}`;
    D.body.appendChild(el);
    this._progressEl = el;
  }

  hideProgress() {
    if (this._progressEl) {
      this._progressEl.remove();
      this._progressEl = null;
    }
  }

  /** @param {string} message @param {'info'|'success'|'error'} [type='info'] */
  showToast(message, type = 'info') {
    if (!this._active) return;
    libShowToast(message, { type });
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup() {
    this._active = false;

    if (this._activeReader) {
      try { this._activeReader.abort(); } catch (_) {}
      this._activeReader = null;
    }

    this.hideProgress();
  }
}
