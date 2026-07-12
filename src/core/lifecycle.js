// src/core/lifecycle.js — ES Module version
// Original: core/lifecycle.js (legacy IIFE — old build system removed in Phase 27, file no longer on disk)
// Étape 312 : le core importe ses dépendances (globals, logger, Flags/Settings, Bus,
// Storage, UserStorage, Routes) au lieu de lire window.AO3H_Globals / window.AO3H_Logger /
// window.AO3H_Common. La pose du namespace window.AO3H reste en place : elle est consommée
// par lib/ui (menu, panel), les contrats E1/E2 des modules et lib/dev-tools — suppression
// prévue en fin de Phase 26 (étapes 315-318).

import { getGlobalWindow, hasRailsUJS, hasTinyMCE, hasLiveValidation, getAO3Modal } from '../../lib/utils/globals.js';
import { getLogger, configureLogger } from '../../lib/utils/logger.js';
import { Flags, Settings } from '../../lib/utils/config.js';
import { Bus } from '../../lib/utils/event-bus.js';
import { Storage } from '../../lib/storage/index.js';
import { UserStorage, wrapStorageForUser } from '../../lib/storage/user.js';
import { Routes } from '../../lib/ao3/routes.js';

/* ──────────────────────────────────────────────────────────────────────────
   ROUTE FLAGS (no early return)
   Why: The core must always initialize so the global AO3H namespace exists.
        Modules are responsible for skipping themselves on restricted routes
        (e.g., Kudos History). We only set a route flag here.
─────────────────────────────────────────────────────────────────────────── */
try {
  const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
  W.__AO3H_ROUTE_FLAGS__ = W.__AO3H_ROUTE_FLAGS__ || {};
  const path = location.pathname;
  const IS_KUDOS_HISTORY = /^\/users\/[^/]+\/kudos-history(?:\/|$)/.test(path);
  W.__AO3H_ROUTE_FLAGS__.isKudosHistory = !!IS_KUDOS_HISTORY;

  if (IS_KUDOS_HISTORY) {
    console.log('[AO3H] Kudos History detected — core will init; modules should self-guard.');
  }
} catch (e) {
  // Soft-fail: never block core init because of a route check
  console.warn('[AO3H] route flag init failed:', e);
}


  const W = getGlobalWindow();

   /* ──────────────────────────────────────────────────────────────────────────
     ENV / NAMESPACE / LOG
     Why: keep a small, consistent shell for versioning + logging everywhere.
  ─────────────────────────────────────────────────────────────────────────── */
 
  const NS              = 'ao3h';
  const VERSION         = '1.2.3';
  const DEBUG           = false;          // true for global debug
  const PRODUCTION_MODE = false;          // true to silence debug/info logs
  const LOG_LVL         = 1;              // 0: silent, 1: info, 2: debug

  // Use centralized logger
  const log = getLogger('core');

  // Storage, Routes, Bus, Flags et Settings sont désormais importés en tête de fichier
  // (étape 312) — plus de lecture différée de window.AO3H_Common.
    /* ──────────────────────────────────────────────────────────────────────────
     guard() GLOBAL UTILE
     Why: wrap module init/stop to keep one module's error from killing all.
  ─────────────────────────────────────────────────────────────────────────── */
 
  
  async function guard(fn, label=''){
    try { 
      return await fn(); 
    }
    catch(e){
      log.error('guard error', label, e);
      // Note (étape 312) : le report vers AO3H_ErrorHandler a été retiré — lib/utils/error.js
      // n'a jamais fait partie du graphe Vite, ce chemin était mort dans ce bundle.
      try { Bus.emit('error', { label, error:e }); } catch {}
      return undefined;
    }
  }


  

  /* ──────────────────────────────────────────────────────────────────────────
     MODULE REGISTRY
     Why: unified API to register/start/stop modules; flags wire into this.
  ─────────────────────────────────────────────────────────────────────────── */
  
  function slugify(name){
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  const Modules = (()=>{
    // name => { meta, init, enabledKey, enabledKeyAlt, _booted, _dispose }
    const list = new Map();

    function _disposer(ret){
      if (typeof ret === 'function') return ret;
      if (ret && typeof ret.dispose === 'function') return ()=>ret.dispose();
      return null;
    }

    function _keyPair(name){
      const canonical = `mod:${name}:enabled`;
      const alt = `mod:${slugify(name)}:enabled`;
      return { canonical, alt };
    }

    function _effectiveOn(m){
      return !!Flags.get(m.enabledKey, !!m.meta?.enabledByDefault)
          || !!Flags.get(m.enabledKeyAlt, false);
    }

    async function bootOne(name){
      const m = list.get(name);
      if (!m || m._booted) return false;

      // If this is a child, verify parent is booted
      if (m.meta?.parent) {
        const parent = list.get(m.meta.parent);
        if (!parent || !parent._booted) return false;
      }

      return await guard(async ()=>{
        log.info(`Boot ${name}`);
        log.info(`Boot ${name} - has init:`, !!m.init, 'type:', typeof m.init);
        const ret = await m.init?.();
        log.info(`Boot ${name} - init returned:`, typeof ret);
        m._dispose = _disposer(ret);
        m._booted  = true;
        Bus.emit('module:started', { name });

        // Cascade: boot enabled children
        for (const [childName, child] of list) {
          if (child.meta?.parent === name && !child._booted && _effectiveOn(child)) {
            await bootOne(childName);
          }
        }

        return true;
      }, `init:${name}`);
    }

    async function stopOne(name){
      const m = list.get(name);
      if (!m || !m._booted) return false;
      return await guard(async ()=>{
        // Cascade: stop children first
        for (const [childName, child] of list) {
          if (child.meta?.parent === name && child._booted) {
            await stopOne(childName);
          }
        }

        log.info(`Stop ${name}`);
        try { m._dispose?.(); } catch(e){ log.error('dispose failed', e); }
        m._dispose = null;
        m._booted  = false;
        Bus.emit('module:stopped', { name });
        return true;
      }, `stop:${name}`);
    }

    async function _refresh(name){
      const m = list.get(name); if (!m) return;

      // If this is a child, also require parent to be booted
      if (m.meta?.parent) {
        const parent = list.get(m.meta.parent);
        if (!parent?._booted) {
          if (m._booted) await stopOne(name);
          return;
        }
      }

      const want = _effectiveOn(m);
      if (want && !m._booted) await bootOne(name);
      else if (!want && m._booted) await stopOne(name);
    }

    function register(name, meta, init){
      const { canonical, alt } = _keyPair(name);
      const prev = list.get(name);
      const base = {
        meta: meta || prev?.meta || {},
        init: init || prev?.init,
        enabledKey: canonical,
        enabledKeyAlt: alt,
        _booted: false,
        _dispose: null,
      };
      list.set(name, base);
      // DIAG: module registered

      // Watch both keys — ONLY start/stop, never write flags here.
      Flags.watch(canonical, ()=>{ _refresh(name); });
      if (alt !== canonical) Flags.watch(alt, ()=>{ _refresh(name); });

      // Handle late registration if module loader is available
      try {
        if (typeof W.AO3H?.moduleLoader?.handleLateRegistration === 'function') {
          W.AO3H.moduleLoader.handleLateRegistration(name);
        } else {
          // Fallback: rebuild menu when new module is registered
          if (typeof W.AO3H?.menu?.rebuild === 'function') {
            W.AO3H.menu.rebuild();
          }
        }
      } catch (e) {
        // Module loader or menu might not be ready yet, that's ok
        log.debug('Late registration handler not available:', e);
      }
    }

    async function bootAll(){
      for (const [name, m] of list) {
        // Skip children — they'll be booted by their parent's cascade
        if (m.meta?.parent) continue;
        if (_effectiveOn(m)) await bootOne(name);
      }
    }
    async function stopAll(){ for (const [name] of list) await stopOne(name); }

    async function setEnabled(name, val){
      const m = list.get(name); if (!m) return;
      await Flags.set(m.enabledKey, !!val);
      if (m.enabledKeyAlt !== m.enabledKey) await Flags.set(m.enabledKeyAlt, !!val);
      // Watchers call _refresh; 
    }

    async function onFlagChanged(key, val){
      for (const [name, m] of list){
        if (m.enabledKey === key || m.enabledKeyAlt === key) {
          await setEnabled(name, !!val);
          break;
        }
      }
    }

    function all(){
      return Array.from(list.entries()).map(([name, m])=>({ name, ...m }));
    }

    function getChildren(parentName){
      return Array.from(list.entries())
        .filter(([_, m]) => m.meta?.parent === parentName)
        .map(([name, m]) => ({ name, ...m }));
    }

    async function restartOne(name) {
      const m = list.get(name);
      if (!m) return;

      // Refresh AO3H_Config from localStorage so the restarted module picks up new settings
      try {
        const raw = localStorage.getItem(`ao3h:mod:${name}:settings`);
        if (raw) {
          W.AO3H_Config = W.AO3H_Config || {};
          W.AO3H_Config[name] = W.AO3H_Config[name] || {};
          W.AO3H_Config[name].defaults = Object.assign(
            W.AO3H_Config[name].defaults || {},
            JSON.parse(raw)
          );
        }
      } catch (e) {
        log.warn('restartOne: failed to refresh config for', name, e);
      }

      if (m._booted) await stopOne(name);
      if (_effectiveOn(m)) await bootOne(name);
    }

    return { register, all, getChildren, bootAll, stopAll, setEnabled, onFlagChanged, restartOne, _bootOne: bootOne, _stopOne: stopOne, _list: list };
  })();




   /* ──────────────────────────────────────────────────────────────────────────
     BASE STYLES - Moved to modular CSS structure
     Why: Centralized CSS management for better maintenance.
     Location: lib/styles/ (variables, base, dialog, …)
  ─────────────────────────────────────────────────────────────────────────── */

  // CSS importé en ?inline dans src/main.js et injecté via GM_addStyle (build Vite)




  /* ──────────────────────────────────────────────────────────────────────────
     NAVIGATION BUTTON CREATION
     Why: Create AO3Helper button in navigation bar, shared by menu system.
  ─────────────────────────────────────────────────────────────────────────── */
  
  let navigationButton = null;
  let navigationContainer = null;

  function createNavigationButton() {
    // Return existing button if already created
    if (navigationButton && document.contains(navigationButton)) {
      return { button: navigationButton, container: navigationContainer };
    }

    // Check if button already exists (avoid duplicates)
    const existing = document.querySelector(`li.${NS}-root`);
    if (existing) {
      navigationContainer = existing;
      navigationButton = existing.querySelector(`.${NS}-navlink`);
      return { button: navigationButton, container: navigationContainer };
    }

    // Create the navigation button container
    navigationContainer = document.createElement('li');
    navigationContainer.className = `dropdown ${NS}-root`;
    navigationContainer.setAttribute('aria-haspopup', 'true');
    navigationContainer.tabIndex = 0;

    // Create the button element
    navigationButton = document.createElement('span');
    navigationButton.className = `${NS}-navlink`;
    navigationButton.textContent = 'AO3 Helper';
    navigationButton.setAttribute('aria-hidden', 'true');
    navigationButton.setAttribute('aria-expanded', 'false');
    navigationButton.style.pointerEvents = 'auto';

    // Add button to container
    navigationContainer.appendChild(navigationButton);

    // Find navigation and insert the button
    const navUL = document.querySelector('ul.primary.navigation.actions') ||
                  document.querySelector('#header .primary.navigation ul') ||
                  document.querySelector('#header .navigation ul');

    if (navUL) {
      navUL.insertBefore(navigationContainer, navUL.firstChild);
    } else {
      // Fallback: floating button
      const floater = document.createElement('div');
      floater.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:999999;';
      floater.appendChild(navigationContainer);
      (document.body || document.documentElement).appendChild(floater);
    }

    log.info('Navigation button created');
    return { button: navigationButton, container: navigationContainer };
  }

  // Utility function to wait for DOM ready
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     PUBLIC API EXPORT
     Why: expose common services so menu.js / modules can attach.
  ─────────────────────────────────────────────────────────────────────────── */
  
  // Per-user storage wrapper — imports directs (étape 312), plus de lecture AO3H_Common
  const wrappedStorage = wrapStorageForUser(Storage);

  const AO3H_API = {
    env: { NS, VERSION, DEBUG, PRODUCTION_MODE },
    // util reste un miroir de window.AO3H_Common pour les consommateurs non migrés
    // (menu/panel — étapes 315-318). Getter paresseux : spread au moment de la lecture,
    // pour exposer les helpers posés après l'évaluation de ce fichier.
    get util() { return { ...window.AO3H_Common, log, guard, onReady }; },
    store: wrappedStorage, // Per-user storage wrapper
    user: UserStorage, // Direct access to UserStorage API
    routes: Routes,
    bus: Bus,
    flags: Flags,
    // lib/utils/error.js n'a jamais été dans le graphe Vite : ce champ a toujours été
    // undefined dans ce bundle (étape 312 — indirection morte retirée).
    errorHandler: null,
    modules: Modules,
    settings: Settings,
    // Navigation button creation
    createNavigationButton,
    // AO3 native integration helpers (from ao3-integration.js)
    ao3: {
      // Lazy getters to common integration functions
      get waitForReady() { return window.AO3H_Common?.waitForAO3Ready; },
      get getJQuery() { return window.AO3H_Common?.getJQuery; },
      get liveQuery() { return window.AO3H_Common?.liveQuery; },
      get hasRailsUJS() { return window.AO3H_Common?.hasRailsUJS; },
      get validateForm() { return window.AO3H_Common?.validateForm; },
      get showModal() { return window.AO3H_Common?.showModal; },
      get hideModal() { return window.AO3H_Common?.hideModal; },
    },
    // Filled by menu.js later
    menu: { addToggle:()=>{}, addAction:()=>{}, addSeparator:()=>{}, rebuild:()=>{} },
  };

  // Pose du namespace global window.AO3H — bridge conservé pour lib/ui (menu, panel),
  // les contrats E1/E2 des modules et lib/dev-tools ; suppression prévue étapes 315-318.
  // Merge si AO3H existait déjà (ne pas écraser), sinon pose directe (pas de copie :
  // l'objet canonique runtime et AO3H_API restent identiques).
  const AO3H = W.AO3H ? Object.assign(W.AO3H, AO3H_API) : (W.AO3H = AO3H_API);
  try { if (typeof window !== 'undefined' && window !== W) window.AO3H = W.AO3H; } catch {}





    /* ──────────────────────────────────────────────────────────────────────────
     Legacy register() shim
     Why: keep older module definitions working until fully migrated.
  ─────────────────────────────────────────────────────────────────────────── */
  
  if (!AO3H.register) {
    AO3H.register = function(defOrId, maybeDef){
      const defs = [];
      if (typeof defOrId === 'string') {
        defs.push({ id: defOrId, ...(maybeDef || {}) });
      } else if (defOrId && typeof defOrId === 'object' && !maybeDef) {
        if (defOrId.id) defs.push(defOrId);
        else for (const [id, v] of Object.entries(defOrId)) {
          if (v && typeof v === 'object') defs.push({ id, ...v });
        }
      } else { return; }

      for (const def of defs) {
        const id    = def.id;
       const title = (typeof def.title === 'string' && def.title.trim())
   ? def.title.trim()
   : id;

        Modules.register(id, { title, enabledByDefault: true }, async function init(){
          try { def.onFlagsUpdated?.({ enabled: true }); } catch {}
          let ret = undefined;
          try { ret = await def.init?.({ enabled: true }); }
          catch(e){ log.error('legacy init failed', id, e); }

          const disposer = (typeof ret === 'function') ? ret
                : (ret && typeof ret.dispose === 'function') ? ()=>ret.dispose()
                : (typeof def.dispose === 'function') ? ()=>def.dispose()
                : null;

          return () => {
            try { def.onFlagsUpdated?.({ enabled: false }); } catch {}
            try { disposer?.(); } catch(e){ log.error('legacy dispose failed', id, e); }
          };
        });

        const canonical = `mod:${id}:enabled`;
        const alt = `mod:${String(id).toLowerCase().replace(/[^a-z0-9]+/g,'')}:enabled`;
        Flags.watch(canonical, (val)=> { try { def.onFlagsUpdated?.({ enabled: !!val }); } catch {} });
        if (alt !== canonical) Flags.watch(alt, (val)=> { try { def.onFlagsUpdated?.({ enabled: !!val }); } catch {} });
      }
    };
  }




  /* ──────────────────────────────────────────────────────────────────────────
     BOOT
     Why: Initialize core system and prepare for module loading.
     NOTE: Module loading is now handled by module-loader.js
  ─────────────────────────────────────────────────────────────────────────── */
  
  const DEFAULT_FLAGS = {
    'ui:showMenuButton': false,
  };

  (async function boot(){
    await Flags.init(DEFAULT_FLAGS);

    // Configure logger based on environment (import direct — étape 312)
    configureLogger({
      debug: DEBUG,
      productionMode: PRODUCTION_MODE
    });

    log.info('Core ready', VERSION);
    if (PRODUCTION_MODE) {
      console.log('[AO3H] Production mode enabled - debug logs silenced');
    }

    // Log per-user storage status
    log.info(`Per-user storage active for: ${UserStorage.id}`);

    // Diagnostic: Check AO3 integration availability
    if (DEBUG) {
      const diagnostics = {
        jquery: typeof window.jQuery !== 'undefined' || typeof window.$j !== 'undefined',
        railsUJS: hasRailsUJS() || false,
        tinyMCE: hasTinyMCE() || false,
        liveValidation: hasLiveValidation() || false,
        ao3Modal: getAO3Modal() !== null,
        integrationUtils: !!(window.AO3H_Common?.waitForAO3Ready && window.AO3H_Common?.liveQuery)
      };
      log.debug('AO3 Integration Status:', diagnostics);
    }

    Bus.emit('core:ready', { version: VERSION });

    // Bridge native AO3 events to our bus (optional enhancement, not critical)
    if (Bus.bridge) {
      const bridgeEvents = async () => {
        // Try to get jQuery without blocking - event bridging is optional
        // Check immediately available instances first
        let $ = window.jQuery || window.$j || window.$;
        
        // If not immediately available, wait briefly (3s max)
        if (!$ || !$.fn?.jquery) {
          $ = await new Promise(resolve => {
            const check = setInterval(() => {
              const jq = window.jQuery || window.$j || (window.$ && window.$.fn?.jquery ? window.$ : null);
              if (jq) { clearInterval(check); resolve(jq); }
            }, 100);
            // Shorter timeout - event bridging is optional
            setTimeout(() => { clearInterval(check); resolve(null); }, 3000);
          });
        }
        
        if (!$) {
          // Silent skip - jQuery event bridging is optional, menu works without it
          log.debug('jQuery not available, event bridging skipped (menu functionality unaffected)');
          return;
        }
        
        log.debug('jQuery available, setting up event bridging');
        
        // Bridge CSRF loaded event (from application.js)
        try {
          $(document).on('loadedCSRF', () => {
            Bus.emit('ao3:csrf-ready');
            W.__AO3H_CSRF_READY__ = true;
            log.info('CSRF token ready');
          });
        } catch (e) {
          log.warn('Failed to bridge CSRF event:', e);
        }

        // Bridge Rails UJS events (if Rails UJS is loaded)
        if (hasRailsUJS() !== false) {
          try {
            $(document).on('ajax:before', (e) => {
              Bus.emit('ao3:ajax-before', e.target);
            });
            $(document).on('ajax:success', (e, data) => {
              Bus.emit('ao3:ajax-success', { target: e.target, data });
            });
            $(document).on('ajax:error', (e, xhr) => {
              Bus.emit('ao3:ajax-error', { target: e.target, xhr });
            });
            $(document).on('ajax:complete', (e, xhr) => {
              Bus.emit('ao3:ajax-complete', { target: e.target, xhr });
            });
            log.info('Rails UJS events bridged');
          } catch (e) {
            log.warn('Failed to bridge Rails UJS events:', e);
          }
        }
      };
      
      // Execute bridging asynchronously
      bridgeEvents().catch(e => log.error('Event bridging failed:', e));
    }
    
    // Create navigation button (unless on restricted routes)
    onReady(() => {
      if (!W.__AO3H_ROUTE_FLAGS__?.isKudosHistory) {
        createNavigationButton();
      }
    });
    
    // Module loading is now handled by module-loader.js
  })();

// ─── ES Module Exports ──────────────────────────────────────────────────────
// These exports allow the new Vite architecture to import core functions directly.
// The window.AO3H bridge above remains active for non-migrated modules (étapes 315-318).
// AO3H est l'objet canonique (=== window.AO3H) : coordinator.js et module-loader.js
// l'importent au lieu de relire le global (étape 312).
export { Modules, guard, AO3H };
export const { register, bootAll, stopAll, setEnabled, all, getChildren, restartOne } = Modules;
