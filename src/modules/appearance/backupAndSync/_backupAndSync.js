/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Backup & Sync Coordinator

    Module ID: backupAndSync
    Display Name: Backup & Sync
    Tab: Appearance & Tools

    Purpose
        Coordinates automatic and manual backups, browser-native sync, and
        import/export operations. Exposes the combined feature API through
        AO3H.backupAndSync.

    Submodules
        automateBackup.js    — Schedules automatic backups.
        cloudSync.js         — Synchronizes data through browser storage.
        dataTransfer.js      — Imports and exports settings and work lists.

    Notes
        Backups are stored under ao3h:backupAndSync:backups.
        Cloud sync uses chrome.storage.sync or browser.storage.sync and is
        limited to approximately 100 KB. GitHub Gist is not used.

═══════════════════════════════════════════════════════════════════════════ */



/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg, saveModuleSettings } from '../../../../lib/storage/module-settings.js';
import styles from './backupAndSync.css?inline';

import { AutoBackup } from './automateBackup.js';
import { CloudSync } from './cloudSync.js';
import { ImportExportLists } from './dataTransfer.js';

/* ═══════════════════════════════════════════════════════════════════════════
   VERSION MIGRATION
═══════════════════════════════════════════════════════════════════════════ */

export const VERSION_KEY = 'ao3h:version';

export const LEGACY_MODULE_RENAMES = {
  downloadManager:          'ficDownloader',
  bookmarkManager:          'bookmarkVault',
  commentEnhancer:          'commentKit',
  paginationManager:        'pageControls',
  mainNavEnhancer:          'mainNavigation',
  visualPreferencesManager: 'visualPreferences',
  ficButtonsManager:        'ficActions',
  readerCorner:             'readingDashboard',
  tagsDisplayManager:       'tagsDisplay',
  markedForLaterManager:    'laterShelf',
  workReminder:             'laterShelf',
};

const settingsKey = moduleId => `ao3h:mod:${moduleId}:settings`;

function readJSON (storage, key) {
  try {
    const parsed = JSON.parse(storage.getItem(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function migrateLegacyModuleSettings (storage = localStorage) {
  const migrated = [];
  for (const [oldId, newId] of Object.entries(LEGACY_MODULE_RENAMES)) {
    const oldKey = settingsKey(oldId);
    const oldData = readJSON(storage, oldKey);
    if (oldData === null && storage.getItem(oldKey) === null) continue;

    if (oldData) {
      const newKey = settingsKey(newId);
      const newData = readJSON(storage, newKey) || {};
      try {
        storage.setItem(newKey, JSON.stringify({ ...oldData, ...newData }));
      } catch {
        continue;
      }
    }
    try { storage.removeItem(oldKey); } catch { /* storage unavailable */ }
    migrated.push(oldKey);
  }
  return migrated;
}

export function runVersionMigrations (currentVersion, storage = localStorage) {
  const lastVersion = storage.getItem(VERSION_KEY);
  if (lastVersion === currentVersion) {
    return { ran: false, from: lastVersion, to: currentVersion, migrated: [] };
  }
  const migrated = migrateLegacyModuleSettings(storage);
  try { storage.setItem(VERSION_KEY, currentVersion); } catch { /* storage unavailable */ }
  return { ran: true, from: lastVersion, to: currentVersion, migrated };
}



/* ═══════════════════════════════════════════════════════════════════════════
   SHARED DATA COLLECTION
═══════════════════════════════════════════════════════════════════════════ */

// Scans localStorage for every AO3 Helper key. Shared by BackupOperations
// (backups), ImportExportLists (settings export), and CloudSync (sync push)
// so the scan logic exists in exactly one place instead of being copied into
// each submodule that needs "all of AO3 Helper's data".
/** @param {Storage} storage @param {{ exclude?: string }} [options] */
export function collectAO3HelperData (storage = localStorage, { exclude } = {}) {
  const NS = AO3H.env?.NS || 'ao3h';
  const data = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    if (!key.includes(NS) && !key.includes('AO3H')) continue;
    if (exclude && key.includes(exclude)) continue;
    data[key] = storage.getItem(key);
  }
  return data;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL BACKUP ENGINE

   Owned by the coordinator because it stores and transforms backup data but
   has no independently visible lifecycle. The export keeps the focused unit
   test and allows the coordinator's public API to delegate to a clear contract.
═══════════════════════════════════════════════════════════════════════════ */

export class BackupOperations {
  constructor (config = {}) {
    this.backups = config.backups || [];
    this.onBackupCreated = config.onBackupCreated || null;
    this.maxBackups = config.maxBackups || 10;
    this.getAllData = config.getAllData || (() => ({}));
  }

  _record (backup) {
    this.backups.unshift(backup);
    if (this.backups.length > this.maxBackups) this.backups.length = this.maxBackups;
    this.onBackupCreated?.(this.backups);
    return backup;
  }

  _restoreData (data) {
    Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value));
  }

  getAllAO3HelperData () { return this.getAllData(); }
  getBackups () { return this.backups; }

  createBackup () {
    const backup = this._record({
      timestamp: new Date().toISOString(),
      data: this.getAllAO3HelperData(),
    });
    console.log(`[BackupOperations] Backup saved (${this.backups.length}/${this.maxBackups})`);
    return backup;
  }

  restoreBackup (index = 0) {
    const backup = this.backups[index];
    if (!backup?.data || typeof backup.data !== 'object') {
      console.error('[BackupOperations] Backup not found or not restorable at index:', index);
      return false;
    }
    const date = new Date(backup.timestamp).toLocaleString();
    if (!confirm(`Restore backup from ${date}?\n\nThis will overwrite current data.`)) return false;
    this._restoreData(backup.data);
    console.log(`[BackupOperations] Restored backup from ${date}`);
    return true;
  }

  createSelectiveBackup (categories = []) {
    const all = this.getAllData();
    const data = categories.length === 0
      ? all
      : Object.fromEntries(Object.entries(all).filter(([key]) =>
          categories.some(category => key.toLowerCase().includes(category.toLowerCase()))
        ));
    const backup = this._record({
      timestamp: new Date().toISOString(),
      type: 'selective',
      categories,
      data,
    });
    console.log(`[BackupOperations] Selective backup saved (${Object.keys(data).length} keys, categories: ${categories.join(', ') || 'all'})`);
    return backup;
  }

  async _deriveKey (password, salt) {
    const encoded = new TextEncoder();
    const material = await crypto.subtle.importKey(
      'raw', encoded.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async createEncryptedBackup (password) {
    if (!password) throw new Error('[BackupOperations] Password required for encrypted backup.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this._deriveKey(password, salt);
    const plaintext = new TextEncoder().encode(JSON.stringify(this.getAllAO3HelperData()));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
    const backup = this._record({
      timestamp: new Date().toISOString(),
      type: 'encrypted',
      salt: Array.from(salt),
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ciphertext)),
    });
    console.log('[BackupOperations] Encrypted backup saved.');
    return backup;
  }

  async restoreEncryptedBackup (index = 0, password) {
    const backup = this.backups[index];
    if (!backup || backup.type !== 'encrypted') {
      console.error('[BackupOperations] No encrypted backup at index:', index);
      return false;
    }
    if (!password) throw new Error('[BackupOperations] Password required to restore encrypted backup.');
    const date = new Date(backup.timestamp).toLocaleString();
    if (!confirm(`Restore encrypted backup from ${date}?\n\nThis will overwrite current data.`)) return false;
    try {
      const key = await this._deriveKey(password, new Uint8Array(backup.salt));
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(backup.iv) },
        key,
        new Uint8Array(backup.ciphertext)
      );
      this._restoreData(JSON.parse(new TextDecoder().decode(plaintext)));
      console.log(`[BackupOperations] Encrypted backup restored from ${date}`);
      return true;
    } catch {
      console.error('[BackupOperations] Decryption failed — wrong password or corrupt backup.');
      return false;
    }
  }

  async _gzip (input, mode) {
    const stream = mode === 'compress' ? new CompressionStream('gzip') : new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    await writer.write(mode === 'compress' ? new TextEncoder().encode(input) : new Uint8Array(input));
    await writer.close();
    const chunks = [];
    const reader = stream.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const merged = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return mode === 'compress' ? Array.from(merged) : new TextDecoder().decode(merged);
  }

  async createCompressedBackup () {
    const data = this.getAllAO3HelperData();
    const serialized = JSON.stringify(data);
    const compressed = await this._gzip(serialized, 'compress');
    const backup = this._record({ timestamp: new Date().toISOString(), type: 'compressed', compressed });
    const ratio = ((1 - compressed.length / serialized.length) * 100).toFixed(1);
    console.log(`[BackupOperations] Compressed backup saved (${ratio}% smaller).`);
    return backup;
  }

  async restoreCompressedBackup (index = 0) {
    const backup = this.backups[index];
    if (!backup || backup.type !== 'compressed') {
      console.error('[BackupOperations] No compressed backup at index:', index);
      return false;
    }
    const date = new Date(backup.timestamp).toLocaleString();
    if (!confirm(`Restore compressed backup from ${date}?\n\nThis will overwrite current data.`)) return false;
    try {
      this._restoreData(JSON.parse(/** @type {string} */ (await this._gzip(backup.compressed, 'decompress'))));
      console.log(`[BackupOperations] Compressed backup restored from ${date}`);
      return true;
    } catch (error) {
      console.error('[BackupOperations] Decompression failed:', error);
      return false;
    }
  }

  createIncrementalBackup () {
    const current = this.getAllAO3HelperData();
    const base = this.backups.find(backup => backup.data && typeof backup.data === 'object') || null;
    const baseData = base?.data || {};
    const delta = {};
    for (const [key, value] of Object.entries(current)) {
      if (baseData[key] !== value) delta[key] = value;
    }
    for (const key of Object.keys(baseData)) {
      if (!(key in current)) delta[key] = null;
    }
    const backup = this._record({
      timestamp: new Date().toISOString(),
      type: 'incremental',
      baseTimestamp: base?.timestamp || null,
      delta,
    });
    console.log(`[BackupOperations] Incremental backup saved (${Object.keys(delta).length} changed keys).`);
    return backup;
  }

  restoreIncrementalBackup (index = 0) {
    const backup = this.backups[index];
    if (!backup || backup.type !== 'incremental') {
      console.error('[BackupOperations] No incremental backup at index:', index);
      return false;
    }
    const date = new Date(backup.timestamp).toLocaleString();
    if (!confirm(`Restore incremental backup from ${date}?\n\nThis will apply the stored delta to current data.`)) return false;
    for (const [key, value] of Object.entries(backup.delta)) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    console.log(`[BackupOperations] Incremental backup applied from ${date}`);
    return true;
  }

  cleanup () {}
}



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-backupAndSync');

const W    = getGlobalWindow();
const MOD  = 'backupAndSync';
const LOG  = `[AO3H][${MOD}]`;

// ── Default config ──────────────────────────────────────────────────────────
const DEFAULTS = {
  enableAutoBackup: true,
  backupInterval:   15,   // minutes (converted to ms at call site)
  maxBackups:       10,
  syncEnabled:      false, // browser native sync (opt-in)
};

const cfg = makeCfg(MOD, DEFAULTS);



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// The coordinated features are initialized during the module lifecycle below.



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  {
    displayName:      'Backup & Sync',
    description:      'Automatic backups, browser native cloud sync, and work list export.',
    tab:              'appearance',
    enabledByDefault: false,
    dependencies:     ['readingTracker', 'skipWorks', 'bookmarkVault'],
  },
  async function init () {
    const BACKUPS_KEY = `ao3h:${MOD}:backups`;
    const instances   = [];

    // ── Version-change migrations (legacy module-id settings cleanup) ──────
    try {
      const migration = runVersionMigrations(AO3H.env?.VERSION || '0');
      if (migration.ran && migration.migrated.length) {
        console.info(`${LOG} migrated ${migration.migrated.length} legacy setting key(s) (${migration.from || 'first run'} → ${migration.to})`);
      }
    } catch (err) {
      console.warn(`${LOG} version migration failed:`, err);
    }

    // Shared backups array — passed by reference to all submodules so they
    // stay in sync without re-reading localStorage on each operation.
    const sharedBackups = JSON.parse(localStorage.getItem(BACKUPS_KEY) || '[]');
    const onBackupCreated = (backups) => {
      localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
    };
    const getAllData = () => collectAO3HelperData(localStorage, { exclude: `:${MOD}:backups` });

    // ── Manual backup operations (instantiated first — AutoBackup delegates to it) ──
    const backupOpsInst = new BackupOperations({
      maxBackups:      cfg('maxBackups'),
      backups:         sharedBackups,
      onBackupCreated,
      getAllData,
    });
    instances.push(backupOpsInst);

    // ── Auto backup (delegates the actual work to backupOpsInst) ───────────
    const autoBackupInst = new AutoBackup({
      enableAutoBackup: cfg('enableAutoBackup'),
      backupInterval:   cfg('backupInterval') * 60 * 1000, // convert minutes → ms
      backupOps:        backupOpsInst,
    });
    autoBackupInst.init();
    instances.push(autoBackupInst);

    // ── Cloud sync ──────────────────────────────────────────────────────────
    const cloudSyncInst = new CloudSync({
      syncEnabled: cfg('syncEnabled'),
      getAllData,
    });
    cloudSyncInst.init().catch(err => {
      console.warn(`${LOG} CloudSync init failed:`, err);
    });
    instances.push(cloudSyncInst);

    // ── Import/export work lists ────────────────────────────────────────────
    const importExportInst = new ImportExportLists({ getAllData });
    instances.push(importExportInst);

    // ── Public API ──────────────────────────────────────────────────────────
    AO3H.backupAndSync = {
      createBackup:    () => backupOpsInst?.createBackup(),
      getBackups:      () => backupOpsInst?.getBackups() ?? [],
      restoreBackup:   (i) => backupOpsInst?.restoreBackup(i),
      createSelectiveBackup:    (categories) => backupOpsInst?.createSelectiveBackup(categories),
      createEncryptedBackup:    (password) => backupOpsInst?.createEncryptedBackup(password),
      restoreEncryptedBackup:   (i, password) => backupOpsInst?.restoreEncryptedBackup(i, password),
      createCompressedBackup:   () => backupOpsInst?.createCompressedBackup(),
      restoreCompressedBackup:  (i) => backupOpsInst?.restoreCompressedBackup(i),
      createIncrementalBackup:  () => backupOpsInst?.createIncrementalBackup(),
      restoreIncrementalBackup: (i) => backupOpsInst?.restoreIncrementalBackup(i),
      exportWorksList: (format) => {
        const works = importExportInst?.extractWorksList();
        if (!works) return;
        if (format === 'json')      importExportInst?.exportAsJSON(works);
        else if (format === 'csv')  importExportInst?.exportAsCSV(works);
        else if (format === 'html') importExportInst?.exportAsHTML(works);
      },
      exportSettings:  () => importExportInst?.exportSettings(),
      importFromFile:  () => importExportInst?.importFromFile(),
      buildUI:         (opts = {}) => importExportInst?.buildUI({
        ...opts,
        syncEnabled:   cfg('syncEnabled'),
        onSyncToggle:  (enabled) => {
          try {
            saveModuleSettings(MOD, { syncEnabled: enabled });
            if (cloudSyncInst) {
              cloudSyncInst.syncEnabled = enabled;
              if (enabled && !cloudSyncInst._storageListener) {
                cloudSyncInst.init().catch(err => {
                  console.warn(`${LOG} CloudSync init failed on toggle:`, err);
                });
              } else if (!enabled) {
                cloudSyncInst.cleanup();
              }
            }
          } catch (err) {
            console.warn(`${LOG} Failed to toggle sync:`, err);
          }
        },
      }),
    };

    console.info(`${LOG} init complete`);

    return function cleanup () {
      instances.forEach(inst => inst.cleanup?.());
      delete AO3H.backupAndSync;
      console.info(`${LOG} cleanup complete`);
    };
  }
);
