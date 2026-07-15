/**
 * Module Factory - Standardized module registration and lifecycle management
 * Eliminates the multiple patterns of module registration found across the codebase
 */

import { getGlobalWindow, getAO3H, areModulesReady, waitForAO3H } from './globals.js';

/**
 * Standard module configuration interface
 * @typedef {Object} ModuleConfig
 * @property {string} title - Display title for the module
 * @property {boolean} [enabledByDefault=true] - Whether module should be enabled by default
 * @property {Object} [routes] - Route restrictions (e.g., {lists: true})
 * @property {string} [description] - Module description
 * @property {Array<string>} [dependencies] - List of required dependencies
 */

/**
 * Standard module lifecycle hooks
 * @typedef {Object} ModuleHooks
 * @property {Function} [init] - Initialization function, called when module starts
 * @property {Function} [dispose] - Cleanup function, called when module stops
 * @property {Function} [onFlagsUpdated] - Called when module enabled/disabled state changes
 */

/**
 * Create and register a module using the standardized pattern
 * This replaces all the different registration patterns found in the codebase:
 * - AO3H.register('ModuleName', {...})
 * - AO3H.modules.register(id, meta, initFn)
 * - Manual registration with various fallbacks
 * 
 * @param {string} moduleId - Unique module identifier
 * @param {ModuleConfig} config - Module configuration
 * @param {Function|ModuleHooks} lifecycle - Module lifecycle function or hooks object
 * @returns {Promise<boolean>} True if registration successful
 */
export async function createModule(moduleId, config = {}, lifecycle = {}) {
  if (!moduleId || typeof moduleId !== 'string') {
    console.error('[ModuleFactory] Invalid module ID provided:', moduleId);
    return false;
  }

  // Normalize config with defaults
  const normalizedConfig = {
    title: config.title || moduleId,
    enabledByDefault: config.enabledByDefault !== false, // Default to true
    routes: config.routes || {},
    description: config.description || '',
    dependencies: config.dependencies || [],
    ...config
  };

  // Normalize lifecycle hooks
  let hooks = {};
  if (typeof lifecycle === 'function') {
    // If lifecycle is a function, treat it as the init function
    hooks.init = lifecycle;
  } else if (typeof lifecycle === 'object' && lifecycle !== null) {
    hooks = { ...lifecycle };
  }

  // Wait for AO3H to be ready before attempting registration
  const isReady = await waitForAO3H(5000);
  if (!isReady) {
    console.warn(`[ModuleFactory] AO3H not ready after timeout, attempting registration anyway for module: ${moduleId}`);
  }

  return attemptRegistration(moduleId, normalizedConfig, hooks);
}

/**
 * Attempt to register the module using available registration methods
 * @private
 */
function attemptRegistration(moduleId, config, hooks) {
  const ao3h = getAO3H();

  // Method 1: Use the new modules.register API (preferred)
  if (ao3h.modules && typeof ao3h.modules.register === 'function') {
    try {
      ao3h.modules.register(moduleId, config, async () => {
        let disposeFunction = null;

        // Call init hook if provided
        if (typeof hooks.init === 'function') {
          try {
            const result = await hooks.init({ enabled: true });
            if (typeof result === 'function') {
              disposeFunction = result;
            }
          } catch (error) {
            console.error(`[ModuleFactory] Init failed for module ${moduleId}:`, error);
          }
        }

        // Return cleanup function
        return () => {
          try {
            if (typeof disposeFunction === 'function') {
              disposeFunction();
            } else if (typeof hooks.dispose === 'function') {
              hooks.dispose();
            }
          } catch (error) {
            console.error(`[ModuleFactory] Dispose failed for module ${moduleId}:`, error);
          }
        };
      });

      // Set up flag change listener if onFlagsUpdated is provided
      if (typeof hooks.onFlagsUpdated === 'function' && ao3h.flags) {
        const flagKey = `mod:${moduleId}:enabled`;
        const altFlagKey = `mod:${moduleId.toLowerCase().replace(/[^a-z0-9]+/g, '')}:enabled`;
        
        ao3h.flags.watch(flagKey, (enabled) => {
          try {
            hooks.onFlagsUpdated({ enabled: !!enabled });
          } catch (error) {
            console.error(`[ModuleFactory] onFlagsUpdated failed for module ${moduleId}:`, error);
          }
        });

        if (altFlagKey !== flagKey) {
          ao3h.flags.watch(altFlagKey, (enabled) => {
            try {
              hooks.onFlagsUpdated({ enabled: !!enabled });
            } catch (error) {
              console.error(`[ModuleFactory] onFlagsUpdated (alt) failed for module ${moduleId}:`, error);
            }
          });
        }
      }

      console.log(`[ModuleFactory] Successfully registered module: ${moduleId}`);
      return true;
    } catch (error) {
      console.error(`[ModuleFactory] Failed to register module ${moduleId} with modules.register:`, error);
    }
  }

  // Method 2: Fallback to legacy AO3H.register API
  if (typeof ao3h.register === 'function') {
    try {
      ao3h.register(moduleId, {
        title: config.title,
        defaultFlagKey: moduleId,
        init: hooks.init,
        dispose: hooks.dispose,
        onFlagsUpdated: hooks.onFlagsUpdated
      });

      console.log(`[ModuleFactory] Successfully registered module using legacy API: ${moduleId}`);
      return true;
    } catch (error) {
      console.error(`[ModuleFactory] Failed to register module ${moduleId} with legacy register:`, error);
    }
  }

  // Method 3: Last resort - register in a way that can be picked up later
  console.warn(`[ModuleFactory] No registration method available, queuing module for later: ${moduleId}`);
  queueModuleForLater(moduleId, config, hooks);
  return false;
}

/**
 * Queue a module for registration when AO3H becomes available
 * Étape 313 : file d'attente locale au module (avant : état posé sur
 * window.AO3H_ModuleQueue, que seul ce fichier lisait).
 * @private
 */
let _moduleQueue = [];

function queueModuleForLater(moduleId, config, hooks) {
  _moduleQueue.push({ moduleId, config, hooks });

  // Set up a listener for when AO3H becomes ready
  const checkAndRegister = () => {
    if (areModulesReady()) {
      const queue = _moduleQueue;
      _moduleQueue = [];

      queue.forEach(({ moduleId: queuedId, config: queuedConfig, hooks: queuedHooks }) => {
        attemptRegistration(queuedId, queuedConfig, queuedHooks);
      });
    }
  };

  // Listen for various ready events
  const events = ['AO3H:ready', 'AO3H:modules:ready'];
  events.forEach(eventName => {
    try {
      const W = getGlobalWindow();
      W.addEventListener(eventName, checkAndRegister, { once: true });
    } catch (e) {
      // Event listeners might not be available
    }
  });

  // Also try bus events if available
  try {
    const ao3h = getAO3H();
    if (ao3h.bus && typeof ao3h.bus.on === 'function') {
      ao3h.bus.on('core:ready', checkAndRegister);
      ao3h.bus.on('modules:ready', checkAndRegister);
    }
  } catch (e) {
    // Bus might not be available yet
  }
}

/**
 * Create a simple module with just an init function
 * Convenience wrapper for the most common use case
 * 
 * @param {string} moduleId - Module identifier
 * @param {string} title - Display title
 * @param {Function} initFunction - Initialization function
 * @param {Object} [options] - Additional options
 * @returns {Promise<boolean>} Registration success
 */
export async function createSimpleModule(moduleId, title, initFunction, options = {}) {
  return createModule(moduleId, { title, ...options }, { init: initFunction });
}

/**
 * Create a module with full lifecycle hooks
 * 
 * @param {string} moduleId - Module identifier
 * @param {string} title - Display title
 * @param {Object} hooks - Lifecycle hooks {init, dispose, onFlagsUpdated}
 * @param {Object} [options] - Additional options
 * @returns {Promise<boolean>} Registration success
 */
export async function createFullModule(moduleId, title, hooks, options = {}) {
  return createModule(moduleId, { title, ...options }, hooks);
}

// Étape 313 : bloc de pose window.AO3H_ModuleFactory + module.exports supprimé —
// aucun lecteur dans le repo (ni src/, ni lib/, ni modules/ legacy).
// Les exports ES ci-dessus font foi.
