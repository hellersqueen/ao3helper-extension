/* ═══════════════════════════════════════════════════════════════════════════
   AO3 INTEGRATION - Bridges natifs AO3
   Why: Centraliser les patterns d'intégration avec les bibliothèques natives AO3
        (jQuery, Rails UJS, LiveValidation, TinyMCE, modals, etc.)
═══════════════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────────────────
   INITIALIZATION & READINESS DETECTION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Attendre que tous les systèmes AO3 soient prêts
 * Utilise un MutationObserver sur head+body pour détecter les changements DOM (meta CSRF,
 * chargement de scripts), avec un setInterval de secours pour window.jQuery qui n'est
 * pas observable via le DOM. Nettoyage complet (disconnect + clearInterval + clearTimeout)
 * à la résolution ou au timeout — aucune fuite.
 * @param {Object} options - Options { jquery, csrf, dom, timeout }
 * @returns {Promise<Object>} État de readiness
 */
export function waitForAO3Ready(options = {}) {
  const {
    jquery = true,
    csrf = true,
    dom = true,
    timeout = 10000
  } = options;

  return new Promise((resolve) => {
    const result = { jquery: false, csrf: false, dom: false, timeout: false };

    function checkConditions() {
      if (dom && !result.dom) {
        result.dom = document.readyState === 'complete' || document.readyState === 'interactive';
      }
      if (jquery && !result.jquery) {
        result.jquery = typeof window.jQuery !== 'undefined' ||
                        typeof window.$j !== 'undefined';
      }
      if (csrf && !result.csrf) {
        result.csrf = !!document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      }

      if ((!dom || result.dom) && (!jquery || result.jquery) && (!csrf || result.csrf)) {
        cleanup();
        resolve(result);
        return true;
      }
      return false;
    }

    let observer = null;
    let intervalId = null;
    let timeoutId = null;

    function cleanup() {
      if (observer) { observer.disconnect(); observer = null; }
      if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
      if (timeoutId !== null) { clearTimeout(timeoutId); timeoutId = null; }
    }

    // Résolution immédiate si toutes les conditions sont déjà remplies
    if (checkConditions()) return;

    // MutationObserver : détecte les ajouts de <meta>, <script>, etc. dans head+body
    observer = new MutationObserver(() => checkConditions());
    const headTarget = document.head || document.documentElement;
    const bodyTarget = document.body || document.documentElement;
    observer.observe(headTarget, { childList: true, subtree: true });
    if (bodyTarget !== headTarget) {
      observer.observe(bodyTarget, { childList: true, subtree: true });
    }

    // Fallback interval : pour window.jQuery/$j qui ne cause aucune mutation DOM
    intervalId = setInterval(() => checkConditions(), 100);

    // Timeout global
    timeoutId = setTimeout(() => {
      cleanup();
      result.timeout = true;
      resolve(result);
    }, timeout);
  });
}

/**
 * Hook into AO3's document ready events
 * Supports both jQuery ready and native DOMContentLoaded
 * @param {Function} callback
 */
export function onAO3Ready(callback) {
  const $ = window.jQuery || window.$j;
  
  if ($) {
    // Use jQuery ready (handles late attachment)
    $(callback);
  } else {
    // Fallback to native
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   JQUERY INTEGRATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Obtenir l'instance jQuery d'AO3
 * @returns {Function|null}
 */
export function getJQuery() {
  return window.$j || window.jQuery || (window.$ && window.$.fn?.jquery ? window.$ : null);
}

/**
 * Wrapper pour utiliser jQuery ou fallback vanilla
 * NOTE: Renommé de $() à jq() pour éviter conflit avec la fonction $ de utils.js
 * @param {string|Element} selector
 * @param {Document|Element} context
 * @returns {Object} jQuery object ou fallback
 */
export function jq(selector, context = document) {
  const jqInstance = getJQuery();
  if (jqInstance) {
    return jqInstance(selector, context);
  }
  
  // Fallback vanilla
  if (typeof selector === 'string') {
    return context.querySelectorAll(selector);
  }
  return selector ? [selector] : [];
}

/**
 * Utiliser livequery si disponible, sinon MutationObserver
 * Mimics jquery.livequery for dynamic elements
 * @param {string} selector - CSS selector
 * @param {Function} onAdd - Called when element matches
 * @param {Function} onRemove - Called when element removed (optional)
 * @returns {Function} Cleanup function
 */
export function liveQuery(selector, onAdd, onRemove = null) {
  const $ = getJQuery();
  
  // Use native livequery if available
  if ($ && $.fn.livequery) {
    const $elements = $(selector);
    $elements.livequery(onAdd, onRemove);
    return () => $elements.expire();
  }
  
  // Fallback: MutationObserver
  const processedElements = new WeakSet();
  
  // Process existing elements
  document.querySelectorAll(selector).forEach(el => {
    processedElements.add(el);
    try { onAdd.call(el); } catch (e) { console.error('[AO3H] liveQuery onAdd:', e); }
  });
  
  // Watch for new elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        
        // Check the node itself
        if (node.matches && node.matches(selector) && !processedElements.has(node)) {
          processedElements.add(node);
          try { onAdd.call(node); } catch (e) { console.error('[AO3H] liveQuery onAdd:', e); }
        }
        
        // Check descendants
        if (node.querySelectorAll) {
          node.querySelectorAll(selector).forEach(el => {
            if (!processedElements.has(el)) {
              processedElements.add(el);
              try { onAdd.call(el); } catch (e) { console.error('[AO3H] liveQuery onAdd:', e); }
            }
          });
        }
      });
      
      // Handle removed nodes (if onRemove provided)
      if (onRemove) {
        mutation.removedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(selector) && processedElements.has(node)) {
            try { onRemove.call(node); } catch (e) { console.error('[AO3H] liveQuery onRemove:', e); }
          }
        });
      }
    });
  });
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  return () => observer.disconnect();
}

/* ──────────────────────────────────────────────────────────────────────────
   RAILS UJS INTEGRATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Vérifier si Rails UJS est chargé
 * @returns {boolean}
 */
export function hasRailsUJS() {
  const $ = getJQuery();
  return !!($ && $.rails);
}

/**
 * Déclencher un événement Rails UJS
 * @param {Element} element
 * @param {string} eventName - e.g. 'ajax:before', 'ajax:success', 'confirm'
 * @param {*} data
 * @returns {boolean|Event} Event object or false if failed
 */
export function fireRailsEvent(element, eventName, data = null) {
  const $ = getJQuery();
  if (!$ || !element) return false;
  
  try {
    const $el = $(element);
    const event = $.Event(eventName);
    if (data) {
      $el.trigger(event, data);
    } else {
      $el.trigger(event);
    }
    return event;
  } catch (e) {
    console.warn('[AO3H] Failed to fire Rails event:', e);
    return false;
  }
}

/**
 * Enable/disable form elements via Rails UJS
 * @param {Element} element
 * @param {boolean} enable
 */
export function setFormElementEnabled(element, enable = true) {
  const $ = getJQuery();
  if (!$ || !$.rails) {
    // Fallback
    element.disabled = !enable;
    return;
  }
  
  const $el = $(element);
  if (enable) {
    if (typeof $.rails.enableFormElement === 'function') {
      $.rails.enableFormElement($el);
    } else {
      element.disabled = false;
    }
  } else {
    if (typeof $.rails.disableFormElement === 'function') {
      $.rails.disableFormElement($el);
    } else {
      element.disabled = true;
    }
  }
}

/**
 * Refresh CSRF tokens (AO3's updateCachedTokens equivalent)
 * @returns {string|null} New token
 */
export function refreshCSRFTokens() {
  const $ = getJQuery();
  if (!$ || !$.rails) return null;
  
  try {
    // Rails UJS has this built-in
    if (typeof $.rails.refreshCSRFTokens === 'function') {
      $.rails.refreshCSRFTokens();
    }
    return $.rails.csrfToken();
  } catch (e) {
    console.warn('[AO3H] CSRF refresh failed:', e);
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   LIVEVALIDATION INTEGRATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Obtenir une instance LiveValidation pour un champ
 * @param {string|Element} field - Field ID or element
 * @returns {Object|null} LiveValidation instance
 */
export function getLiveValidation(field) {
  if (typeof window.LiveValidation === 'undefined') return null;
  
  const element = typeof field === 'string' ? document.getElementById(field) : field;
  if (!element) return null;
  
  // Check if already has a LiveValidation instance
  // (stored in element's data or LiveValidation's internal registry)
  return element._liveValidation || null;
}

/**
 * Déclencher validation manuelle d'un champ
 * @param {string|Element} field
 * @returns {boolean} Is valid
 */
export function validateField(field) {
  const lv = getLiveValidation(field);
  if (!lv) return true; // No validation = assume valid
  
  try {
    return lv.validate();
  } catch (e) {
    console.warn('[AO3H] Validation failed:', e);
    return false;
  }
}

/**
 * Déclencher validation de tous les champs d'un formulaire
 * @param {HTMLFormElement} form
 * @returns {boolean} All valid
 */
export function validateForm(form) {
  if (!form || typeof window.LiveValidation === 'undefined') return true;
  
  try {
    // Get all LiveValidation instances for this form
    const fields = Array.from(form.querySelectorAll('input, textarea, select'));
    let allValid = true;
    
    fields.forEach(field => {
      const lv = getLiveValidation(field);
      if (lv && !lv.validate()) {
        allValid = false;
      }
    });
    
    return allValid;
  } catch (e) {
    console.warn('[AO3H] Form validation failed:', e);
    return false;
  }
}

/**
 * Scroller vers la première erreur (comme dans livevalidation_standalone.js)
 * @param {HTMLFormElement} form
 */
export function scrollToValidationError(form = document) {
  const $ = getJQuery();
  const errorField = form.querySelector('.LV_invalid_field, [aria-invalid="true"]');
  
  if (!errorField) return;
  
  if ($ && $.fn.scrollTo) {
    // Use AO3's jquery.scrollTo plugin
    try {
      $('html, body').scrollTo(errorField, { duration: 1000 });
    } catch {
      errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else {
    errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  // Focus après scroll
  setTimeout(() => {
    try { errorField.focus(); } catch {}
  }, 1100);
}

/* ──────────────────────────────────────────────────────────────────────────
   TINYMCE INTEGRATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Vérifier si TinyMCE est chargé
 * @returns {boolean}
 */
export function hasTinyMCE() {
  return typeof window.tinyMCE !== 'undefined';
}

/**
 * Sauvegarder le contenu TinyMCE dans les textareas
 * Nécessaire avant validation/submit (livevalidation le fait automatiquement)
 */
export function saveTinyMCE() {
  if (!hasTinyMCE()) return;
  
  try {
    if (typeof window.tinyMCE.triggerSave === 'function') {
      window.tinyMCE.triggerSave();
    } else if (typeof window.tinyMCE.activeEditor?.save === 'function') {
      window.tinyMCE.activeEditor.save();
    }
  } catch (e) {
    console.warn('[AO3H] TinyMCE save failed:', e);
  }
}

/**
 * Obtenir l'éditeur TinyMCE pour un textarea
 * @param {string|Element} textarea - ID or element
 * @returns {Object|null}
 */
export function getTinyMCEEditor(textarea) {
  if (!hasTinyMCE()) return null;
  
  const id = typeof textarea === 'string' ? textarea : textarea.id;
  if (!id) return null;
  
  try {
    return window.tinyMCE.get(id);
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   MODAL INTEGRATION (ao3modal.min.js)
─────────────────────────────────────────────────────────────────────────── */

/**
 * Obtenir le système de modal AO3
 * @returns {Object|null}
 */
export function getAO3Modal() {
  return window.ao3modal || null;
}

/**
 * Afficher du contenu dans une modal AO3
 * @param {string|Element} content - HTML string or element
 * @param {string} title - Modal title
 * @returns {boolean} Success
 */
export function showModal(content, title = '') {
  const modal = getAO3Modal();
  if (!modal || typeof modal.show !== 'function') return false;
  
  try {
    modal.show(content, title);
    return true;
  } catch (e) {
    console.warn('[AO3H] Modal show failed:', e);
    return false;
  }
}

/**
 * Cacher la modal AO3
 * @returns {boolean} Success
 */
export function hideModal() {
  const modal = getAO3Modal();
  if (!modal || typeof modal.hide !== 'function') return false;
  
  try {
    modal.hide();
    return true;
  } catch (e) {
    console.warn('[AO3H] Modal hide failed:', e);
    return false;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   ACCORDION & DROPDOWN INTEGRATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Setup un dropdown Bootstrap comme AO3 le fait
 * @param {Element} element - Dropdown toggle element
 */
export function setupDropdown(element) {
  const $ = getJQuery();
  if (!$ || !$.fn.dropdown) {
    console.warn('[AO3H] Bootstrap dropdown not available');
    return;
  }
  
  try {
    $(element).dropdown();
  } catch (e) {
    console.warn('[AO3H] Dropdown setup failed:', e);
  }
}

/**
 * Setup un accordéon comme dans application.js
 * @param {Element} container - Container with .expandable elements
 */
export function setupAccordion(container = document) {
  const expandables = container.querySelectorAll('.expandable');
  
  expandables.forEach(pane => {
    // Skip if in userstuff (user content)
    if (pane.closest('.userstuff')) return;
    
    // Hide pane if not hidden by default
    if (!pane.classList.contains('hidden')) {
      pane.classList.add('hidden');
    }
    
    // Setup expander (previous sibling)
    const expander = pane.previousElementSibling;
    if (!expander) return;
    
    expander.classList.remove('hidden');
    expander.classList.add('collapsed');
    
    expander.addEventListener('click', (e) => {
      if (expander.getAttribute('href') === '#') {
        e.preventDefault();
      }
      
      expander.classList.toggle('collapsed');
      expander.classList.toggle('expanded');
      pane.classList.toggle('hidden');
    });
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   UTILITIES INSPIRED BY application.js
─────────────────────────────────────────────────────────────────────────── */

/**
 * Check all checkboxes (comme dans application.js)
 * @param {Element} fieldset - Container
 * @param {string} filter - Optional ID filter
 */
export function checkAll(fieldset, filter = null) {
  const selector = filter 
    ? `input[id*="${filter}"][type="checkbox"]`
    : 'input[type="checkbox"]';
  
  fieldset.querySelectorAll(selector).forEach(cb => {
    cb.checked = true;
  });
}

/**
 * Uncheck all checkboxes
 * @param {Element} fieldset - Container
 * @param {string} filter - Optional ID filter
 */
export function checkNone(fieldset, filter = null) {
  const selector = filter 
    ? `input[id*="${filter}"][type="checkbox"]`
    : 'input[type="checkbox"]';
  
  fieldset.querySelectorAll(selector).forEach(cb => {
    cb.checked = false;
  });
}

/**
 * Shuffle elements (jquery-shuffle.js equivalent)
 * @param {Element} container
 */
export function shuffle(container) {
  const children = Array.from(container.children);
  
  // Fisher-Yates shuffle
  for (let i = children.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    container.insertBefore(children[j], children[i].nextSibling);
  }
}

/**
 * Setup expand/collapse/shuffle buttons (application.js pattern)
 * @param {Element} container
 */
export function setupExpandCollapse(container = document) {
  // Expand buttons
  container.querySelectorAll('.expand').forEach(btn => {
    const targetId = btn.dataset.actionTarget;
    if (!targetId) return;
    
    const list = document.querySelector(targetId);
    if (!list) return;
    
    // Hide list initially (unless forced)
    if (!list.dataset.forceExpand || list.children.length > 25 || list.dataset.forceContract) {
      list.style.display = 'none';
      btn.style.display = '';
    } else {
      // Show collapse and shuffle only
      const collapse = btn.nextElementSibling;
      if (collapse?.classList.contains('contract')) collapse.style.display = '';
      
      const shuffle = Array.from(btn.parentElement.children).find(el => el.classList.contains('shuffle'));
      if (shuffle) shuffle.style.display = '';
    }
    
    btn.addEventListener('click', () => {
      list.style.display = '';
      btn.style.display = 'none';
      
      const collapse = btn.nextElementSibling;
      if (collapse?.classList.contains('contract')) collapse.style.display = '';
      
      const shuffle = Array.from(btn.parentElement.children).find(el => el.classList.contains('shuffle'));
      if (shuffle) shuffle.style.display = '';
    });
  });
  
  // Collapse buttons
  container.querySelectorAll('.contract').forEach(btn => {
    const targetId = btn.dataset.actionTarget;
    if (!targetId) return;
    
    btn.addEventListener('click', () => {
      const list = document.querySelector(targetId);
      if (list) list.style.display = 'none';
      
      const expand = btn.previousElementSibling;
      if (expand?.classList.contains('expand')) expand.style.display = '';
      
      const shuffle = Array.from(btn.parentElement.children).find(el => el.classList.contains('shuffle'));
      if (shuffle) shuffle.style.display = 'none';
      
      btn.style.display = 'none';
    });
  });
  
  // Shuffle buttons
  container.querySelectorAll('.shuffle').forEach(btn => {
    const targetId = btn.dataset.actionTarget;
    if (!targetId) return;
    
    btn.addEventListener('click', () => {
      const list = document.querySelector(targetId);
      if (list) shuffle(list);
    });
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   EVENT DELEGATION (Rails UJS style)
─────────────────────────────────────────────────────────────────────────── */

/**
 * Délégation d'événements (comme Rails UJS le fait)
 * @param {string} selector - CSS selector
 * @param {string} eventName - Event name
 * @param {Function} handler - Event handler
 * @param {Element} root - Root element (default: document)
 * @returns {Function} Cleanup function
 */
export function delegate(selector, eventName, handler, root = document) {
  const wrappedHandler = (e) => {
    const target = e.target.closest(selector);
    if (target) {
      handler.call(target, e);
    }
  };
  
  root.addEventListener(eventName, wrappedHandler);
  
  return () => root.removeEventListener(eventName, wrappedHandler);
}
