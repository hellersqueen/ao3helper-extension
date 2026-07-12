/* ──────────────────────────────────────────────────────────────────────────
   STORAGE (GM + localStorage mirror)
   Why: single API for persistent values; mirrors to LS so UIs can read fast.
─────────────────────────────────────────────────────────────────────────── */

const _key = (k) => `ao3h:${k}`;

export const Storage = {
  key: _key,
  get: async (k, d=null) => { try { return await GM_getValue(_key(k), d); } catch { return d; } },
  set: async (k, v) => { try { GM_setValue(_key(k), v); } catch(e){ console.error('[AO3H] GM_setValue failed', e); } return v; },
  del: async (k) => { try { GM_deleteValue(_key(k)); } catch(e){ console.error('[AO3H] GM_deleteValue failed', e); } },
  lsGet: (k, d=null) => { try { const v = localStorage.getItem(_key(k)); return v==null?d:JSON.parse(v); } catch { return d; } },
  lsSet: (k, v) => { try { localStorage.setItem(_key(k), JSON.stringify(v)); } catch(e){ console.error('[AO3H] ls set failed', e); } return v; },
  lsDel: (k) => { try { localStorage.removeItem(_key(k)); } catch(e){ console.error('[AO3H] ls del failed', e); } },
  // Raw versions for keys that are already prefixed (used by createStorageKeys)
  lsGetRaw: (k, d=null) => { try { const v = localStorage.getItem(k); return v==null?d:JSON.parse(v); } catch { return d; } },
  lsSetRaw: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){ console.error('[AO3H] ls set failed', e); } return v; },
  lsDelRaw: (k) => { try { localStorage.removeItem(k); } catch(e){ console.error('[AO3H] ls del failed', e); } },
};

// Generate storage keys for work-wide and chapter-specific data
export function createStorageKeys(namespace, feature, suffix, parseWorkIds) {
  return {
    workKey(suffix) {
      const ids = parseWorkIds?.() || null;
      if (!ids) return null;
      const { workId } = ids;
      return `${namespace}:${feature}:workwide:${suffix}:${workId}`;
    },
    
    chapterKey(suffix) {
      const ids = parseWorkIds?.() || null;
      if (!ids) return `${namespace}:${feature}:${suffix}:${location.pathname}`;
      const { workId, chapterId, isFull } = ids;
      return `${namespace}:${feature}:${suffix}:${workId}:${chapterId || 'work'}:${isFull?'full':'single'}`;
    }
  };
}

// Clear all localStorage items matching a prefix
export function clearStorageByPrefix(prefix, storage, logger) {
  const toDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) toDelete.push(k);
  }
  toDelete.forEach(k => storage.lsDelRaw(k));
  logger?.info?.('[AO3H]', `Cleared ${toDelete.length} stored preferences with prefix: ${prefix}`);
  return toDelete.length;
}

// Create toggle state manager with multi-level persistence (work + chapter)
export function createToggleStateManager(storageKeys, storage) {
  return {
    getInitialState(suffix, defaultExpanded = false) {
      const wk = storageKeys.workKey(suffix);
      if (wk) {
        const wv = storage.lsGetRaw(wk, null);
        if (wv && typeof wv.expanded === 'boolean') return { expanded: wv.expanded, source: 'work' };
      }
      const ck = storageKeys.chapterKey(suffix);
      const cv = storage.lsGetRaw(ck, null);
      if (cv && typeof cv.expanded === 'boolean') return { expanded: cv.expanded, source: 'chapter' };
      return { expanded: defaultExpanded, source: 'default' };
    },

    saveState(suffix, expanded, { scope = 'work+chapter' } = {}) {
      if (scope.includes?.('work') || scope === 'work+chapter') {
        const wk = storageKeys.workKey(suffix);
        if (wk) storage.lsSetRaw(wk, { expanded, ts: Date.now() });
      }
      if (scope.includes?.('chapter') || scope === 'work+chapter') {
        const ck = storageKeys.chapterKey(suffix);
        if (ck) storage.lsSetRaw(ck, { expanded, ts: Date.now() });
      }
    }
  };
}