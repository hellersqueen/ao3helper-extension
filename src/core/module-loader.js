// src/core/module-loader.js — ES Module version
// Original: core/module-loader.js (legacy IIFE — old build system removed in Phase 27, file no longer on disk)
// Étape 312 : dépendances importées (lifecycle, logger) au lieu des lectures
// window.AO3H_Globals / window.AO3H_Logger / window.AO3H ; le différé isAO3HReady
// devient inutile (l'import de lifecycle.js garantit un core initialisé).
// La pose AO3H.moduleLoader reste (lue par register() dans lifecycle.js).

/**
 * Module Loader for AO3 Helper
 * Handles module initialization, loading, and lifecycle management
 */

import { getLogger } from '../../lib/utils/logger.js';
import { Bus } from '../../lib/utils/event-bus.js';
import { Flags } from '../../lib/utils/config.js';
import { AO3H, Modules } from './lifecycle.js';

// Populated when initModuleLoader() completes; not imported anywhere (consumers
// read AO3H.moduleLoader instead, see below) — kept private, not re-exported.
let ModuleLoader = null;

function initModuleLoader() {
  const log = getLogger('module-loader');

  /* ──────────────────────────────────────────────────────────────────────────
     MODULE LOADER CONFIGURATION
     Default flags for modules - centralized configuration
  ─────────────────────────────────────────────────────────────────────────── */
  
  const DEFAULT_MODULE_FLAGS = {
    'mod:SaveScroll:enabled': true,
    'mod:CheckForKudos:enabled': true,
    'mod:QuickMarkButton:enabled': true,
  };

  /* ──────────────────────────────────────────────────────────────────────────
     MODULE LOADING ORCHESTRATION
     Handles the sequential loading and initialization of modules
  ─────────────────────────────────────────────────────────────────────────── */
  
  async function loadModules() {
    log.info('Starting module initialization...');
    
    try {
      // Initialize module flags first
      await initializeModuleFlags();
      
      // Boot all enabled modules
      await Modules.bootAll();
      performance.mark?.('ao3h:modules:ready');
      
      // Log registered modules for debugging
      logRegisteredModules();
      
      const allModules = Modules.all();
      
      Bus.emit('modules:loaded', { 
        timestamp: Date.now(),
        modules: allModules.map(m => ({ name: m.name, enabled: m._booted })),
        totalModules: allModules.length
      });
      
      log.info(`All modules loaded successfully (${allModules.length} total)`);
      
    } catch (error) {
      log.error('Failed to load modules:', error);
      Bus.emit('modules:load-error', { error });
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     MODULE FLAGS INITIALIZATION
     Sets up default flags for modules before they are loaded
  ─────────────────────────────────────────────────────────────────────────── */
  
  async function initializeModuleFlags() {
    log.info('Initializing module flags...');
    
    for (const [flagKey, defaultValue] of Object.entries(DEFAULT_MODULE_FLAGS)) {
      try {
        // Only set if not already defined
        const currentValue = Flags.get(flagKey);
        if (currentValue === null || currentValue === undefined) {
          await Flags.set(flagKey, defaultValue);
          log.debug(`Set default flag ${flagKey} = ${defaultValue}`);
        }
      } catch (error) {
        log.warn(`Failed to set flag ${flagKey}:`, error);
      }
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     MODULE REGISTRY MONITORING
     Provides debugging and monitoring capabilities for registered modules
  ─────────────────────────────────────────────────────────────────────────── */
  
  function logRegisteredModules() {
    try {
      const modules = Modules.all();
      log.info(`${modules.length} modules registered:`);
      
      modules.forEach(module => {
        const status = module._booted ? '✓ ACTIVE' : '✗ INACTIVE';
        log.info(`  - ${module.name} [${status}] (${module.enabledKey})`);
      });
    } catch (error) {
      log.warn('Failed to log registered modules:', error);
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     DYNAMIC MODULE MANAGEMENT
     Provides utilities for runtime module management
  ─────────────────────────────────────────────────────────────────────────── */
  
  async function reloadModule(moduleName) {
    log.info(`Reloading module ${moduleName}...`);
    
    try {
      await Modules._stopOne(moduleName);
      await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause
      await Modules._bootOne(moduleName);
      
      Bus.emit('module:reloaded', { name: moduleName });
      log.info(`Successfully reloaded ${moduleName}`);
      return true;
    } catch (error) {
      log.error(`Failed to reload ${moduleName}:`, error);
      return false;
    }
  }

  async function enableModule(moduleName) {
    log.info(`Enabling module ${moduleName}...`);
    
    try {
      await Modules.setEnabled(moduleName, true);
      log.info(`Successfully enabled ${moduleName}`);
      return true;
    } catch (error) {
      log.error(`Failed to enable ${moduleName}:`, error);
      return false;
    }
  }

  async function disableModule(moduleName) {
    log.info(`Disabling module ${moduleName}...`);
    
    try {
      await Modules.setEnabled(moduleName, false);
      log.info(`Successfully disabled ${moduleName}`);
      return true;
    } catch (error) {
      log.error(`Failed to disable ${moduleName}:`, error);
      return false;
    }
  }

  /* ──────────────────────────────────────────────────────────────────────────
     PUBLIC API EXPORT
     Expose module loader functionality to the global AO3H namespace
  ─────────────────────────────────────────────────────────────────────────── */
  
  /* ──────────────────────────────────────────────────────────────────────────
     LATE REGISTRATION SUPPORT
     Allows modules to register after the initial loading phase
  ─────────────────────────────────────────────────────────────────────────── */
  
  async function handleLateRegistration(moduleName) {
    log.info(`Handling late registration for ${moduleName}`);
    
    try {
      // Check if the module was just registered and should be started
      const moduleInfo = Modules._list.get(moduleName);
      if (moduleInfo) {
        const shouldStart = Flags.get(moduleInfo.enabledKey, !!moduleInfo.meta?.enabledByDefault) ||
                           Flags.get(moduleInfo.enabledKeyAlt, false);
        
        log.info(`Module ${moduleName} - shouldStart: ${shouldStart}, _booted: ${moduleInfo._booted}, init exists: ${!!moduleInfo.init}`);
        
        if (shouldStart && !moduleInfo._booted) {
          await Modules._bootOne(moduleName);
          log.info(`Late-registered module ${moduleName} started successfully`);
        } else if (moduleInfo._booted) {
          log.info(`Module ${moduleName} already booted, skipping`);
        } else if (!shouldStart) {
          log.info(`Module ${moduleName} should not start (flag disabled)`);
        }
        
        // Rebuild menu to include the new module
        try {
          if (typeof AO3H.menu?.rebuild === 'function') {
            AO3H.menu.rebuild();
          }
        } catch (e) {
          log.warn('Failed to rebuild menu after late registration:', e);
        }
        
        return true;
      }
    } catch (error) {
      log.error(`Failed to handle late registration for ${moduleName}:`, error);
    }
    
    return false;
  }

  const _ModuleLoader = {
    load: loadModules,
    reload: reloadModule,
    enable: enableModule,
    disable: disableModule,
    getStatus: () => Modules.all().map(m => ({ 
      name: m.name, 
      enabled: m._booted,
      flagKey: m.enabledKey
    })),
    initializeFlags: initializeModuleFlags,
    logModules: logRegisteredModules,
    handleLateRegistration: handleLateRegistration
  };

  ModuleLoader = _ModuleLoader;

  // Attach to the canonical namespace (=== window.AO3H) — lu par register() de
  // lifecycle.js pour la late registration ; bridge global à revoir à l'étape 318.
  AO3H.moduleLoader = _ModuleLoader;

  /* ──────────────────────────────────────────────────────────────────────────
     AUTO-INITIALIZATION
     Start loading modules when this file is loaded
  ─────────────────────────────────────────────────────────────────────────── */
  
  // Listen for core ready event to start loading modules
  Bus.on('core:ready', async () => {
    await loadModules();
    
    // Wait a bit more for external modules to register, then emit final ready events
      setTimeout(() => {
      log.info('Waiting period complete, emitting final ready events...');
      
      Bus.emit('modules:ready', { timestamp: Date.now() });
      try {
        const readyEvent = new CustomEvent('AO3H:modules:ready', { detail: { timestamp: Date.now() } });
        window.dispatchEvent(readyEvent);
      } catch (e) {
        log.warn('Failed to emit final modules:ready events:', e);
      }
    }, 200); // Wait 200ms for external modules to register
  });
  
  // Emit a legacy event for backward compatibility
  const emitLegacyReady = () => {
    // Emit both window event and bus event for maximum compatibility
    try {
      const legacyEvent = new CustomEvent('AO3H:ready', { detail: { moduleLoader: true } });
      window.dispatchEvent(legacyEvent);
    } catch (e) {
      log.warn('Failed to emit legacy AO3H:ready event:', e);
    }
  };
  
  // Emit legacy ready event after core is ready
  Bus.on('core:ready', () => {
    setTimeout(emitLegacyReady, 50); // Small delay to ensure core is fully initialized
  });
  
  // If core is already ready, start immediately
  if (AO3H.env) {
    setTimeout(async () => {
      await loadModules();
      emitLegacyReady();
      
      // Also emit final ready events after delay
      setTimeout(() => {
        Bus.emit('modules:ready', { timestamp: Date.now() });
        try {
          const readyEvent = new CustomEvent('AO3H:modules:ready', { detail: { timestamp: Date.now() } });
          window.dispatchEvent(readyEvent);
        } catch (e) {
          log.warn('Failed to emit final ready events:', e);
        }
      }, 200);
    }, 10);
  }

  log.info('Initialized and ready');
}

initModuleLoader();
