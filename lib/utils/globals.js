/**
 * Global Utilities - Centralized access to global objects
 * Eliminates duplication of window/unsafeWindow access patterns
 */

/**
 * Get the global window object (unsafeWindow for userscripts, window for regular scripts)
 * Replaces the repeated pattern: const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
 */
export function getGlobalWindow() {
  return (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
}

/**
 * Get the main AO3H namespace object
 * @returns {Object} The AO3H object or empty object if not available
 */
export function getAO3H() {
  const W = getGlobalWindow();
  return W.AO3H || {};
}

/**
 * Get the AO3H_Common bundle namespace
 * @returns {Object} The AO3H_Common object or empty object if not available
 */
export function getCommonBundle() {
  const W = getGlobalWindow();
  return W.AO3H_Common || {};
}

/**
 * Safely access a property from AO3H namespace
 * @param {string} property - Property name to access (e.g., 'modules', 'flags', 'bus')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} The property value or default
 */
export function getAO3HProperty(property, defaultValue = null) {
  const ao3h = getAO3H();
  return ao3h[property] || defaultValue;
}

/**
 * Safely access a property from AO3H_Common bundle
 * @param {string} property - Property name to access (e.g., 'Storage', 'Bus', 'AO3Parsers')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} The property value or default
 */
export function getCommonProperty(property, defaultValue = null) {
  const common = getCommonBundle();
  return common[property] || defaultValue;
}

/**
 * Initialize AO3H namespace if it doesn't exist
 * @param {Object} initialProps - Initial properties to set
 */
export function initializeAO3H(initialProps = {}) {
  const W = getGlobalWindow();
  if (!W.AO3H) {
    W.AO3H = { ...initialProps };
  } else {
    Object.assign(W.AO3H, initialProps);
  }
  
  // Also expose on regular window for compatibility
  try {
    if (typeof window !== 'undefined' && window !== W) {
      window.AO3H = W.AO3H;
    }
  } catch (e) {
    // Silently fail if window access is restricted
  }
  
  return W.AO3H;
}

/**
 * Check if AO3H core is ready
 * @returns {boolean} True if core is initialized
 */
export function isAO3HReady() {
  const ao3h = getAO3H();
  return !!(ao3h.env && ao3h.modules && ao3h.flags);
}

/**
 * Check if AO3H modules system is ready
 * @returns {boolean} True if modules can be registered
 */
export function areModulesReady() {
  const ao3h = getAO3H();
  return !!(ao3h.modules && typeof ao3h.modules.register === 'function');
}

/**
 * Wait for AO3H to be ready with timeout
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @param {number} interval - Check interval in milliseconds (default: 100)
 * @returns {Promise<boolean>} Promise that resolves when ready or times out
 */
export function waitForAO3H(timeout = 5000, interval = 100) {
  return new Promise((resolve) => {
    if (isAO3HReady()) {
      resolve(true);
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isAO3HReady()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, interval);
  });
}

/**
 * Check if jQuery is loaded on the page
 * AO3 uses jQuery (exposed as $j or jQuery)
 * @returns {boolean}
 */
export function hasJQuery() {
  const W = getGlobalWindow();
  return typeof W.jQuery !== 'undefined' || 
         typeof W.$j !== 'undefined' || 
         (typeof W.$ !== 'undefined' && W.$.fn && W.$.fn.jquery);
}

/**
 * Get jQuery instance (prefer $j, fallback to jQuery or $)
 * @returns {Function|null}
 */
export function getJQuery() {
  const W = getGlobalWindow();
  if (typeof W.$j !== 'undefined') return W.$j;
  if (typeof W.jQuery !== 'undefined') return W.jQuery;
  if (typeof W.$ !== 'undefined' && W.$.fn && W.$.fn.jquery) return W.$;
  return null;
}

/**
 * Check if Rails UJS (jquery-ujs) is loaded
 * @returns {boolean}
 */
export function hasRailsUJS() {
  const $ = getJQuery();
  return $ && typeof $.rails !== 'undefined';
}

/**
 * Check if TinyMCE (rich text editor) is loaded
 * @returns {boolean}
 */
export function hasTinyMCE() {
  const W = getGlobalWindow();
  return typeof W.tinyMCE !== 'undefined';
}

/**
 * Check if LiveValidation is loaded
 * @returns {boolean}
 */
export function hasLiveValidation() {
  const W = getGlobalWindow();
  return typeof W.LiveValidation !== 'undefined';
}

/**
 * Get AO3's modal system if available (ao3modal.min.js)
 * @returns {Object|null}
 */
export function getAO3Modal() {
  const W = getGlobalWindow();
  return W.ao3modal || null;
}

/**
 * Check if page is fully ready (DOM + jQuery + CSRF)
 * More complete than just document.readyState
 * @returns {boolean}
 */
export function isPageFullyReady() {
  const W = getGlobalWindow();
  return document.readyState === 'complete' && 
         hasJQuery() && 
         (W.__AO3H_CSRF_READY__ || document.querySelector('meta[name="csrf-token"]'));
}

// Étape 313 : le double bloc d'export (module.exports CJS + pose window.AO3H_Globals)
// est supprimé. Côté Vite la pose était une branche morte (interop CJS : `module` défini
// dans le bundle) ; côté legacy, tous les lecteurs (core/*.js, lib/dev-tools) résolvent
// window.AO3H_Globals avec fallback. Les exports ES ci-dessus font foi.