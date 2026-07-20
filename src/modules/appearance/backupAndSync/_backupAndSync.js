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
        backupOperations.js  — Creates, stores, lists, and restores backups.
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
import { BackupOperations } from './backupOperations.js';
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
