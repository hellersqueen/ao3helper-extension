/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Downloader › Offline Library

Purpose
    Stores complete work pages in localStorage and adds controls for saving,
    removing, and opening cached works from an AO3 work page.

Notes
    Cached entries contain title, author, raw HTML, and a timestamp under
    ao3h:OfflineReading:library. The coordinator also uses this feature's
    storage methods to auto-cache works marked for later.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

const STORAGE_KEY = 'ao3h:OfflineReading:library';

export class OfflineLibrary {
  constructor (config = {}) {
    this.logger   = config.logger;
    this._injected = [];
    this._active   = true;
    this._controllers = new Set();
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — OFFLINE STORAGE
  ═════════════════════════════════════════════════════════════════════════ */

  _log (level, ...args) {
    if (this.logger) this.logger[level]?.(...args);
  }

  _load () {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
  }

  _save (lib) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
    } catch (e) {
      this._log('error', '[OfflineLibrary] Storage write failed:', e);
    }
  }

  isCached (workId) {
    return !!this._load()[workId];
  }

  getWork (workId) {
    return this._load()[workId] || null;
  }

  getAllWorks () {
    return this._load();
  }

  saveWork (workId, title, author, html) {
    const lib = this._load();
    lib[workId] = { title, author, html, date: Date.now() };
    this._save(lib);
    this._log('info', `[OfflineLibrary] Saved: ${title} (${workId})`);
  }

  removeWork (workId) {
    const lib = this._load();
    const had  = !!lib[workId];
    delete lib[workId];
    this._save(lib);
    if (had) this._log('info', `[OfflineLibrary] Removed: ${workId}`);
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK RETRIEVAL
  ═════════════════════════════════════════════════════════════════════════ */

  async fetchWorkHtml (workId) {
    const controller = new AbortController();
    this._controllers.add(controller);
    try {
      const res = await fetch(`/works/${workId}?view_full_work=true`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (e?.name !== 'AbortError') {
        this._log('error', `[OfflineLibrary] Fetch failed for ${workId}:`, e);
      }
      return null;
    } finally {
      this._controllers.delete(controller);
    }
  }

  isWorkPage () {
    return /^\/works\/\d+/.test(W.location.pathname);
  }

  getWorkId () {
    return extractWorkIdFromHref(W.location.pathname);
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — OFFLINE READING CONTROLS
  ═════════════════════════════════════════════════════════════════════════ */

  _buildSaveButton (workId, title, author) {
    const btn = document.createElement('a');
    btn.className = 'ao3h-offline-save-btn';
    btn.href      = 'javascript:void(0);';

    const refresh = () => {
      const cached = this.isCached(workId);
      btn.textContent   = cached ? '✓ Cached Offline' : '📥 Save Offline';
      btn.style.background = cached ? '#5a8a5a' : '#2c5f8a';
      btn.title = cached
        ? 'Click to remove from offline library'
        : 'Save this work for offline reading';
    };
    refresh();

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (btn.dataset.busy) return;

      if (this.isCached(workId)) {
        this.removeWork(workId);
        refresh();
        btn.parentElement?.querySelector('.ao3h-offline-read-btn')?.remove();
        return;
      }

      btn.dataset.busy  = '1';
      btn.textContent   = '⏳ Saving…';
      btn.style.background = '#999';

      const html = await this.fetchWorkHtml(workId);
      delete btn.dataset.busy;
      if (!this._active) return; // module deactivated while the fetch was in flight

      if (html) {
        this.saveWork(workId, title, author, html);
        refresh();
        // Inject the Read Offline button if not already present
        if (!btn.parentElement?.querySelector('.ao3h-offline-read-btn')) {
          const readBtn = this._buildReadButton(workId);
          btn.insertAdjacentElement('afterend', readBtn);
          this._injected.push(readBtn);
        }
      } else {
        btn.textContent   = '✗ Failed';
        btn.style.background = '#c0392b';
        setTimeout(() => refresh(), 3000);
      }
    });

    return btn;
  }

  _buildReadButton (workId) {
    const btn = document.createElement('a');
    btn.className = 'ao3h-offline-read-btn';
    btn.href      = 'javascript:void(0);';
    btn.textContent = '📖 Read Offline';
    btn.title     = 'Open cached offline version';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const work = this.getWork(workId);
      if (!work) {
        W.alert('This work is no longer cached.');
        btn.remove();
        return;
      }
      // Open the stored HTML in a new tab via blob URL
      const blob = new Blob([work.html], { type: 'text/html;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const win  = W.open(url, '_blank');
      if (win) {
        win.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
      } else {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    });

    return btn;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  init () {
    if (!this.isWorkPage()) {
      this._log('info', '[OfflineLibrary] Not a work page, skipping');
      return;
    }

    const workId = this.getWorkId();
    if (!workId) return;

    const titleEl  = document.querySelector('.title.heading');
    const authorEl = document.querySelector('a[rel="author"]');
    const title    = titleEl?.textContent.trim()  || 'Untitled';
    const author   = authorEl?.textContent.trim() || 'Anonymous';

    const dlArea = document.querySelector('.download');
    if (!dlArea) return;

    const saveBtn = this._buildSaveButton(workId, title, author);
    dlArea.appendChild(saveBtn);
    this._injected.push(saveBtn);

    if (this.isCached(workId)) {
      const readBtn = this._buildReadButton(workId);
      dlArea.appendChild(readBtn);
      this._injected.push(readBtn);
    }

    this._log('info', `[OfflineLibrary] Initialized for work ${workId}`);
  }

  cleanup () {
    this._active = false;
    this._controllers.forEach(controller => controller.abort());
    this._controllers.clear();

    this._injected.forEach(el => el?.remove?.());
    this._injected = [];
    this._log('info', '[OfflineLibrary] Cleanup complete');
  }
}

