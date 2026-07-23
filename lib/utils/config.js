/* ──────────────────────────────────────────────────────────────────────────
   CONFIG - FLAGS / SETTINGS 
   Why: central feature switches; watchers react to changes.
─────────────────────────────────────────────────────────────────────────── */

import { Storage } from '../storage/index.js';
import { Bus } from './event-bus.js';

// Ancré sur globalThis (voir event-bus.js) : un seul registre de flags partagé
// entre le graphe statique et les import() dynamiques, sinon deux caches de
// flags divergents.
export const Flags = (globalThis.__AO3H_Flags__ || (globalThis.__AO3H_Flags__ = (()=> {
  const DEF_KEY = 'flags';
  let cache = null;
  const watchers = new Map(); // key => Set<fn>

  function _ensureLoaded(){ if (cache) return cache; cache = Storage.lsGet(DEF_KEY, null); return cache; }
  async function init(defaults={}){
    const fromGM = await Storage.get(DEF_KEY, {});
    cache = Object.assign({}, defaults, fromGM);
    await Storage.set(DEF_KEY, cache);
    Storage.lsSet(DEF_KEY, cache);
    console.log('[AO3H] Flags initialized', cache);
  }
  function getAll(){ return cache || _ensureLoaded() || {}; }
  function get(key, d=null){ const all = getAll(); return (key in all)? all[key] : d; }

  // Change-detection to prevent feedback loops or redundant watcher fires
  async function set(key, val){
    const all  = getAll();
    const prev = all[key];
    if (prev === val) return val; // no-op

    all[key] = val;
    await Storage.set(DEF_KEY, all);
    Storage.lsSet(DEF_KEY, all);

    const set = watchers.get(key);
    if (set) for (const fn of set) try{ fn(val); }catch(e){ console.error('[AO3H] flag watcher', e); }
    return val;
  }

  function watch(key, fn){
    if(!watchers.has(key)) watchers.set(key, new Set());
    watchers.get(key).add(fn);
    return ()=> watchers.get(key)?.delete(fn);
  }
  
  function toggle(key, defaultVal = false){
    const current = get(key, defaultVal);
    return set(key, !current);
  }
  
  return { init, getAll, get, set, watch, toggle };
})()));

export const Settings = (()=> {
  const KEY = (name)=> `mod:${name}:settings`;
  const Defaults = new Map(); // name -> defaults object

  return {
    async define(name, defaults = {}){
      Defaults.set(name, { ...defaults });
      let cur = await Storage.get(KEY(name), null);

      if (!cur || typeof cur !== 'object') {
        cur = { ...defaults };
        await Storage.set(KEY(name), cur);
        Storage.lsSet(KEY(name), cur);
        try { Bus.emit('settings:changed', { module: name, value: cur }); } catch {}
        return cur;
      }

      // Merge in any newly-added defaults
      let changed = false;
      for (const [k,v] of Object.entries(defaults)) {
        if (!(k in cur)) { cur[k] = v; changed = true; }
      }
      if (changed) {
        await Storage.set(KEY(name), cur);
        Storage.lsSet(KEY(name), cur);
        try { Bus.emit('settings:changed', { module: name, value: cur }); } catch {}
      }
      return cur;
    },

    async get(name){
      const gm = await Storage.get(KEY(name), null);
      if (gm && typeof gm === 'object') {
        Storage.lsSet(KEY(name), gm);
        return gm;
      }
      return { ...(Defaults.get(name) || {}) };
    },

    async set(name, patch = {}){
      const cur = await this.get(name);
      const next = Object.assign({}, cur, patch);
      await Storage.set(KEY(name), next);
      Storage.lsSet(KEY(name), next);
      try { Bus.emit('settings:changed', { module: name, value: next }); } catch {}
      return next;
    },

    async reset(name){
      await Storage.del(KEY(name));
      Storage.lsDel(KEY(name));
      const def = Defaults.get(name) || {};
      await Storage.set(KEY(name), { ...def });
      Storage.lsSet(KEY(name), { ...def });
      try { Bus.emit('settings:changed', { module: name, value: { ...def } }); } catch {}
      return { ...def };
    },

    watch(name, fn){
      const cb = (evt)=>{ if (evt && evt.module === name) { try { fn(evt.value); } catch(e){ console.error(e); } } };
      Bus.on('settings:changed', cb);
      return ()=> Bus.off('settings:changed', cb);
    },
  };
})();
