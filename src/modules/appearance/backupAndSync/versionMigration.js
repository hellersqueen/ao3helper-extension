/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Backup & Sync › Version Migration

Purpose
    Detects AO3 Helper version changes and cleans up / converts stale data:
    settings saved under legacy module ids (before the camelCase rename wave)
    are moved to their current module id, then the legacy keys are removed.

Notes
    Runs once per version change (the last-seen version is stored under
    ao3h:version). Migrations are additive-safe: when the new key already
    has a value, existing values win over migrated legacy ones.

═══════════════════════════════════════════════════════════════════════════ */

export const VERSION_KEY = 'ao3h:version';

/** Legacy module id → current module id (from the panel-config "Previously:" notes). */
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

const settingsKey = (moduleId) => `ao3h:mod:${moduleId}:settings`;

function _readJSON (storage, key) {
  try {
    const parsed = JSON.parse(storage.getItem(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch { return null; }
}

/**
 * Moves settings stored under legacy module ids to their current id and
 * deletes the legacy keys. Existing values under the new id are preserved
 * (they win over the migrated legacy values).
 * @returns {string[]} the migrated legacy keys
 */
export function migrateLegacyModuleSettings (storage = localStorage) {
  const migrated = [];
  for (const [oldId, newId] of Object.entries(LEGACY_MODULE_RENAMES)) {
    const oldKey  = settingsKey(oldId);
    const oldData = _readJSON(storage, oldKey);
    if (oldData === null && storage.getItem(oldKey) === null) continue;

    if (oldData) {
      const newKey  = settingsKey(newId);
      const newData = _readJSON(storage, newKey) || {};
      try {
        storage.setItem(newKey, JSON.stringify({ ...oldData, ...newData }));
      } catch { continue; } // quota — leave the legacy key for a later retry
    }
    try { storage.removeItem(oldKey); } catch {}
    migrated.push(oldKey);
  }
  return migrated;
}

/**
 * Runs the data migrations when the extension version changed since the
 * last visit, then records the current version.
 * @returns {{ ran: boolean, from: string|null, to: string, migrated: string[] }}
 */
export function runVersionMigrations (currentVersion, storage = localStorage) {
  const last = storage.getItem(VERSION_KEY);
  if (last === currentVersion) {
    return { ran: false, from: last, to: currentVersion, migrated: [] };
  }

  const migrated = migrateLegacyModuleSettings(storage);
  try { storage.setItem(VERSION_KEY, currentVersion); } catch {}
  return { ran: true, from: last, to: currentVersion, migrated };
}
