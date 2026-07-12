/* ──────────────────────────────────────────────────────────────────────────
   USER STORAGE (Per-AO3-Account Storage)
   Why: Isolate data by AO3 username instead of sharing across all accounts.
   Note: Uses user-detector.js for username detection (deduplication)
─────────────────────────────────────────────────────────────────────────── */

import { Storage } from './index.js';
// Étape 314 : detectUser importé directement (avant : lecture window.AO3H_Common.detectUser).
// Le build legacy strippe la ligne — detectUser est fourni par user-detector.js,
// concaténé avant ce fichier.
import { detectUser } from '../utils/user-detector.js';

// Get username from user-detector.js
// Fallback to "guest" if detection fails (e.g. DOM not ready yet)
function getCurrentUserId() {
  const username = detectUser();
  if (username) return username.toLowerCase();
  return "guest";
}

// Detect user ID - will be "guest" if DOM not ready yet
let AO3H_USER_ID = getCurrentUserId();

// Re-detect after DOM is ready if we got "guest"
if (typeof document !== 'undefined' && AO3H_USER_ID === 'guest') {
  const redetect = () => {
    const newId = getCurrentUserId();
    if (newId !== 'guest' && newId !== AO3H_USER_ID) {
      AO3H_USER_ID = newId;
      if (typeof UserStorage !== 'undefined') {
        UserStorage.id = newId;
      }
      console.log('[AO3H] User re-detected after DOM ready:', newId);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', redetect);
  } else {
    // DOM already loaded, try now
    setTimeout(redetect, 100);
  }
}

// Build a namespaced key for this AO3 user
function userKey(name) {
  // Example result: "ao3h.ehly.hiddenTags"
  return `ao3h.${AO3H_USER_ID}.${name}`;
}

/**
 * Per-user storage wrapper that automatically scopes all keys
 * to the currently logged-in AO3 username.
 * 
 * @example
 * // Get user-specific data
 * const tags = UserStorage.get('hiddenTags', []);
 * 
 * // Set user-specific data
 * UserStorage.set('hiddenTags', ['angst', 'mcd']);
 * 
 * // Keys are automatically namespaced:
 * // ao3h.username.hiddenTags
 */
export const UserStorage = {
  /** The current AO3 user id (lowercase username or "guest"). */
  id: AO3H_USER_ID,

  /** Build a fully qualified key for this user. */
  key(name) {
    return userKey(name);
  },

  /** Get a value for this user from GM storage. */
  async get(name, defaultValue) {
    if (!Storage) return defaultValue;
    return Storage.get(userKey(name), defaultValue);
  },

  /** Set a value for this user in GM storage. */
  async set(name, value) {
    if (!Storage) return;
    return Storage.set(userKey(name), value);
  },

  /** Remove a value for this user from GM storage. */
  async remove(name) {
    if (!Storage) return;
    return Storage.del(userKey(name));
  },

  /**
   * Optional helper to migrate old global keys to per-user keys.
   *
   * Usage example in a module later:
   *   UserStorage.migrateFromGlobal({
   *     hiddenTags: "hiddenTags",
   *     hiddenWorks: "hiddenWorks"
   *   });
   *
   * This copies the old global values into the new user-specific keys
   * if they are not already set.
   */
  async migrateFromGlobal(mapping) {
    if (!Storage || !mapping || typeof mapping !== "object") return;

    for (const [userName, oldKeyName] of Object.entries(mapping)) {
      const newKey = userKey(userName);

      // If per-user value already exists, don't override it
      const already = await Storage.get(newKey);
      if (already !== undefined && already !== null) continue;

      const oldValue = await Storage.get(oldKeyName);
      if (oldValue !== undefined && oldValue !== null) {
        await Storage.set(newKey, oldValue);
      }
    }
  },
};

/**
 * Create a compatibility wrapper that makes the base Storage API
 * automatically use per-user storage.
 * 
 * This allows existing modules to continue using AO3H.store.get/set
 * without any code changes while gaining per-user isolation.
 * 
 * @param {Object} baseStorage - The original Storage object
 * @returns {Object} Wrapped storage with per-user support
 */
export function wrapStorageForUser(baseStorage) {
  if (!baseStorage) return baseStorage;

  return {
    // Main storage methods (per-user)
    get: async (k, d) => UserStorage.get(k, d),
    set: async (k, v) => UserStorage.set(k, v),
    del: async (k) => UserStorage.remove(k),
    remove: async (k) => UserStorage.remove(k),

    // Keep all localStorage methods unchanged (they work on raw keys)
    key: baseStorage.key,
    lsGet: baseStorage.lsGet,
    lsSet: baseStorage.lsSet,
    lsDel: baseStorage.lsDel,
    lsGetRaw: baseStorage.lsGetRaw,
    lsSetRaw: baseStorage.lsSetRaw,
    lsDelRaw: baseStorage.lsDelRaw,
  };
}

/**
 * Per-user localStorage wrapper for synchronous storage operations
 * Automatically namespaces keys with username: ao3h.username.keyName
 * 
 * Use this as a drop-in replacement for direct localStorage calls
 * @example
 * // Before: localStorage.getItem('myKey')
 * // After:  UserLocalStorage.getItem('myKey')
 */
export const UserLocalStorage = {
  /** Get item with automatic user namespacing */
  getItem(key) {
    try {
      return localStorage.getItem(userKey(key));
    } catch (e) {
      console.error('[UserStorage] getItem failed:', e);
      return null;
    }
  },

  /** Set item with automatic user namespacing */
  setItem(key, value) {
    try {
      localStorage.setItem(userKey(key), value);
    } catch (e) {
      console.error('[UserStorage] setItem failed:', e);
    }
  },

  /** Remove item with automatic user namespacing */
  removeItem(key) {
    try {
      localStorage.removeItem(userKey(key));
    } catch (e) {
      console.error('[UserStorage] removeItem failed:', e);
    }
  },

  /** Check if key exists (with user namespacing) */
  hasItem(key) {
    return this.getItem(key) !== null;
  },

  /** Get and parse JSON with user namespacing */
  getJSON(key, defaultValue = null) {
    try {
      const raw = this.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.error('[UserStorage] getJSON failed:', e);
      return defaultValue;
    }
  },

  /** Set JSON with user namespacing */
  setJSON(key, value) {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[UserStorage] setJSON failed:', e);
    }
  }
};

// Étape 314 : bridge AO3H_Common.{UserStorage,UserLocalStorage,wrapStorageForUser}
// supprimé — plus aucun lecteur : src/ importe ce fichier directement, et le seul
// lecteur legacy (core/lifecycle.js) résout avec gardes `?.`/fallback.
