/* ═══════════════════════════════════════════════════════════════════════════
   CACHE MANAGER - Cache persisté avec TTL
   Why: plusieurs modules maintiennent un cache localStorage avec expiration
   (relatedSearches, povTracker, ficPeek…) chacun avec sa propre mécanique.
   Complément persisté de createCache (lib/utils/index.js), qui est mémoire.

   Étape 314 : l'ancienne IIFE inerte (pose AO3H_Common) a été remplacée par
   ce module ES lors du palier 2 du plan shared.md.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Crée un cache persisté avec TTL. Toutes les entrées vivent sous une seule
 * clé de storage, au format { [entryKey]: { v, ts } }.
 * @param {Object} options
 * @param {string} options.key - Clé de storage (ex: 'ao3h:se:sugcache')
 * @param {number} options.ttlMs - Durée de vie d'une entrée en ms
 * @param {Storage} [options.storage] - localStorage (défaut) ou sessionStorage
 * @returns {{ get(entryKey): *|null, set(entryKey, value): void,
 *             delete(entryKey): void, clear(): void }}
 */
export function createPersistedCache({ key, ttlMs, storage }) {
  if (!key || !ttlMs) throw new Error('[cache] key and ttlMs are required');
  const store = storage || localStorage;

  function readAll() {
    try {
      const raw = store.getItem(key);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    } catch {
      return {};
    }
  }

  function writeAll(data) {
    try { store.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
  }

  return {
    get(entryKey) {
      const data = readAll();
      const entry = data[entryKey];
      if (!entry) return null;
      if (Date.now() - entry.ts > ttlMs) {
        delete data[entryKey];
        writeAll(data);
        return null;
      }
      return entry.v;
    },
    set(entryKey, value) {
      const data = readAll();
      data[entryKey] = { v: value, ts: Date.now() };
      writeAll(data);
    },
    delete(entryKey) {
      const data = readAll();
      if (entryKey in data) { delete data[entryKey]; writeAll(data); }
    },
    clear() {
      try { store.removeItem(key); } catch { /* */ }
    },
  };
}
