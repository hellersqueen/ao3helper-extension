/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Cloud Sync Submodule
    Submodule ID: cloudSync
    Display Name: Cloud Sync
    Source Module: Backup and Sync

    Uses browser native sync storage (chrome.storage.sync / browser.storage.sync)
    ~100 KB limit. GitHub Gist approach: ABANDONED.

    - Feature: Cloud sync via browser native storage
      - Option: Opt-in via syncEnabled setting
      - Option: chrome.storage.sync / browser.storage.sync support
      - Option: ~100 KB quota limit
      - Option: Graceful disable on quota exceeded

    - Feature: Sync on init
      - Option: Read from sync storage on init
      - Option: Restore keys newer than local (last-write-wins)
      - Option: Merge remote data into localStorage

    - Feature: Sync on data change
      - Option: Write to sync storage on data change
      - Option: Debounced writes (2s delay)
      - Option: Avoid unnecessary sync calls

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();

export class CloudSync {
  constructor (config = {}) {
    this.syncEnabled = config.syncEnabled ?? false;
    this.getAllData  = config.getAllData ?? (() => ({}));
    this._debounceTimer = null;
    this._storageListener = null;
    this._destroyed = false;
  }

  // ── Detect sync storage API ─────────────────────────────────────────────
  _getSyncStorage () {
    // Chrome / Chromium-based
    if (typeof chrome !== 'undefined' && chrome?.storage?.sync) return chrome.storage.sync;
    // Firefox WebExtensions
    if (typeof browser !== 'undefined' && browser?.storage?.sync) return browser.storage.sync;
    return null;
  }

  // ── Promisify chrome.storage.sync (callback-based) ──────────────────────
  // Firefox browser.storage.sync already returns real Promises — handled separately.
  _syncGet (store, keys) {
    // Firefox: real Promise API
    if (typeof browser !== 'undefined' && store === browser?.storage?.sync) {
      return store.get(keys);
    }
    // Chrome: callback-based API
    return new Promise((resolve, reject) => {
      store.get(keys, (result) => {
        if (chrome?.runtime?.lastError) return reject(chrome.runtime.lastError);
        resolve(result);
      });
    });
  }

  _syncSet (store, items) {
    // Firefox: real Promise API
    if (typeof browser !== 'undefined' && store === browser?.storage?.sync) {
      return store.set(items);
    }
    // Chrome: callback-based API
    return new Promise((resolve, reject) => {
      store.set(items, () => {
        if (chrome?.runtime?.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }

  // ── Init: read from sync, apply last-write-wins ─────────────────────────
  async init () {
    if (!this.syncEnabled) return;

    const store = this._getSyncStorage();
    if (!store) {
      console.warn('[CloudSync] Browser sync storage not available — sync disabled.');
      return;
    }

    try {
      const PAYLOAD_KEY = 'ao3h_sync_payload';
      const remote = await this._syncGet(store, [PAYLOAD_KEY]);
      if (this._destroyed) return; // cleanup() ran while this await was pending
      const payload = remote[PAYLOAD_KEY];

      if (payload?.data && payload?.timestamp) {
        const remoteTs = new Date(payload.timestamp).getTime();
        const localTs  = parseInt(localStorage.getItem('ao3h:sync:lastWrite') || '0', 10);

        if (remoteTs > localTs) {
          // Remote is newer — restore remote data to localStorage
          Object.entries(payload.data).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          localStorage.setItem('ao3h:sync:lastWrite', String(remoteTs));
          console.log('[CloudSync] Restored from sync storage (remote was newer).');
        } else {
          console.log('[CloudSync] Local is up to date — no restore needed.');
        }
      }

      // Start watching for local changes to push to sync
      this._startWatching(store);

    } catch (err) {
      console.warn('[CloudSync] Init error:', err);
    }
  }

  // ── Watch localStorage changes and debounce-push to sync ─────────────────
  // The native 'storage' event only fires for OTHER tabs — we also patch
  // localStorage.setItem to catch same-tab writes.
  _startWatching (store) {
    const trigger = (key) => {
      if (!key?.includes('ao3h') && !key?.includes('AO3H')) return;
      if (key === 'ao3h:sync:lastWrite') return; // avoid feedback loop
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._pushToSync(store), 2000);
    };

    // Cross-tab writes
    this._storageListener = (e) => trigger(e.key);
    W.addEventListener('storage', this._storageListener);

    // Same-tab writes: patch localStorage.setItem
    const _originalSetItem = localStorage.setItem.bind(localStorage);
    this._originalSetItem = _originalSetItem;
    localStorage.setItem = (key, value) => {
      _originalSetItem(key, value);
      trigger(key);
    };
  }

  // ── Push current data to sync storage ──────────────────────────────────
  async _pushToSync (store) {
    if (this._destroyed) return;
    try {
      const data      = this.getAllData();
      const timestamp = new Date().toISOString();
      const payload   = { data, timestamp };
      const json      = JSON.stringify(payload);

      // chrome.storage.sync has a per-item limit of 8KB and total ~100KB.
      // Since all data is stored as a single item, the binding constraint is 8KB.
      if (json.length > 8192) {
        console.warn('[CloudSync] Data exceeds 8KB per-item limit — sync skipped. Consider reducing stored data.');
        return;
      }

      await this._syncSet(store, { ao3h_sync_payload: payload });
      if (this._destroyed) return; // cleanup() ran while this await was pending
      localStorage.setItem('ao3h:sync:lastWrite', String(Date.now()));
      console.log('[CloudSync] Data pushed to sync storage.');

    } catch (err) {
      if (err?.message?.includes('QUOTA_BYTES')) {
        console.warn('[CloudSync] Quota exceeded — sync skipped.');
      } else {
        console.warn('[CloudSync] Push error:', err);
      }
    }
  }

  cleanup () {
    this._destroyed = true;
    clearTimeout(this._debounceTimer);
    if (this._storageListener) {
      W.removeEventListener('storage', this._storageListener);
      this._storageListener = null;
    }
    // Restore original localStorage.setItem if patched
    if (this._originalSetItem) {
      localStorage.setItem = this._originalSetItem;
      this._originalSetItem = null;
    }
  }
}
