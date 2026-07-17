/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Backup & Sync › Cloud Sync

Purpose
    Synchronizes AO3 Helper data through the browser's native sync storage,
    restoring newer remote data and pushing local changes after a delay.

Notes
    Supports chrome.storage.sync and browser.storage.sync. Sync is opt-in and
    uses a last-write-wins strategy. The payload is stored as one item, so the
    8 KB per-item limit is enforced even though total storage is about 100 KB.
    GitHub Gist synchronization is not used.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

/**
 * Chooses whether initial synchronization should restore the remote payload,
 * ask the user which side wins, or leave the local data untouched.
 * @returns {'restore'|'ask'|'skip'}
 */
export function decideSyncAction ({ remoteTs, localTs }) {
  if (!Number.isFinite(remoteTs) || remoteTs <= 0) return 'skip';
  if (!Number.isFinite(localTs) || localTs < 0) localTs = 0;
  if (remoteTs <= localTs) return 'skip';
  if (localTs === 0) return 'restore';
  return 'ask';
}

/** Message shown when the user must choose between local and remote data. */
export function buildConflictMessage (remoteTs, localTs) {
  const remoteDate = new Date(remoteTs).toLocaleString();
  const localDate  = new Date(localTs).toLocaleString();
  return (
    `AO3 Helper sync conflict:\n\n` +
    `Another device saved data on ${remoteDate}.\n` +
    `This device last synced on ${localDate}.\n\n` +
    `OK — use the other device's version (overwrites this device's data)\n` +
    `Cancel — keep this device's data (it will overwrite the other version on the next change)`
  );
}

export class CloudSync {
  constructor (config = {}) {
    this.syncEnabled = config.syncEnabled ?? false;
    this.getAllData  = config.getAllData ?? (() => ({}));
    this._debounceTimer = null;
    this._storageListener = null;
    this._destroyed = false;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BROWSER SYNC STORAGE
  ═════════════════════════════════════════════════════════════════════════ */

  _getSyncStorage () {
    // Chrome / Chromium-based
    if (typeof chrome !== 'undefined' && chrome?.storage?.sync) return chrome.storage.sync;
    // Firefox WebExtensions
    if (typeof browser !== 'undefined' && browser?.storage?.sync) return browser.storage.sync;
    return null;
  }

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
        resolve(undefined);
      });
    });
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — INITIAL SYNCHRONIZATION
  ═════════════════════════════════════════════════════════════════════════ */

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

        // Conflict resolution: silent restore only on a device with no sync
        // history; otherwise the user chooses which version to keep (instead
        // of the old blind Last-Write-Wins restore).
        const action = decideSyncAction({ remoteTs, localTs });

        if (action === 'restore' ||
            (action === 'ask' && W.confirm(buildConflictMessage(remoteTs, localTs)))) {
          Object.entries(payload.data).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          localStorage.setItem('ao3h:sync:lastWrite', String(remoteTs));
          console.log('[CloudSync] Restored from sync storage (remote was newer).');
        } else if (action === 'ask') {
          // User kept local — mark it authoritative so we stop asking and the
          // next local change overwrites the remote payload.
          localStorage.setItem('ao3h:sync:lastWrite', String(Date.now()));
          console.log('[CloudSync] Kept local data (user choice) — local wins on next push.');
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


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — CHANGE DETECTION AND SYNC PUSH
  ═════════════════════════════════════════════════════════════════════════ */

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


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

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
