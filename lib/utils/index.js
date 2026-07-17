/* ──────────────────────────────────────────────────────────────────────────
   UTILS - Generic utilities for DOM manipulation, events, and styling
   Why: tiny helpers used by multiple modules; no external deps.
─────────────────────────────────────────────────────────────────────────── */

// Étape 313 : Bus importé directement (le build legacy strippe la ligne — Bus est
// fourni par event-bus.js, concaténé avant ce fichier).
import { Bus } from './event-bus.js';

export const onReady = (fn) => (document.readyState === 'loading')
  ? document.addEventListener('DOMContentLoaded', fn, {once:true})
  : fn();

export const $  = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
export const on = (el, evt, cb, opts) => el && el.addEventListener(evt, cb, opts);
export const once = (el, evt, cb, opts)=> on(el, evt, (e)=>{ el.removeEventListener(evt, cb, opts); cb(e); }, opts);
export const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

// Element creation helper
export function createElement(tag, attrs = {}) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('data-')) {
      el.setAttribute(key, value);
    } else if (key in el) {
      el[key] = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
}
export const debounce = (fn,ms=200)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
export const throttle = (fn,ms=200)=>{ let t=0; return (...a)=>{ const n=Date.now(); if(n-t>=ms){ t=n; fn(...a); } }; };

// Lightweight MutationObserver wrapper
export function observe(rootOrCb, optsOrCb, maybeCb){
  let root = document.documentElement;
  let opts = { childList: true, subtree: true };
  let cb;

  if (typeof rootOrCb === 'function') {
    cb = rootOrCb;
  } else {
    if (rootOrCb) root = rootOrCb;
    if (typeof optsOrCb === 'function') cb = optsOrCb;
    else { if (optsOrCb) opts = optsOrCb; cb = maybeCb; }
  }

  if (typeof cb !== 'function') { console.warn('[AO3H] observe(): missing callback'); cb = ()=>{}; }
  const mo = new MutationObserver(cb);
  mo.observe(root, opts);
  return mo;
}

// NOTE: parseWorkIds moved to ao3-parsers.js for better organization

// Check if URL contains specific hash anchors
export function hasHashAnchor(patterns) {
  const hash = (location.hash || '').toLowerCase();
  if (!hash) return false;
  if (typeof patterns === 'string') return hash.includes(patterns);
  return Array.isArray(patterns) ? patterns.some(p => hash.includes(p)) : false;
}

// Page navigation utilities
export function getCurrentPage() {
  const p = new URLSearchParams(location.search).get('page');
  const n = parseInt(p || '1', 10);
  return isFinite(n) && n > 0 ? n : 1;
}

export function getMaxPageFromDOM() {
  let max = 1;
  $$('.pagination a, .pagination .current').forEach(a => {
    const n = parseInt(a.textContent.replace(/\D+/g,''), 10);
    if (isFinite(n)) max = Math.max(max, n);
  });
  const hasNext = !!$('.pagination a[rel="next"], .pagination a.next');
  if (max === 1 && hasNext) max = 999;
  return max;
}

export function buildURLForPage(n) {
  const url = new URL(location.href);
  if (n <= 1) url.searchParams.delete('page');
  else url.searchParams.set('page', String(n));
  return url.toString();
}

// Position and measurement utilities
export function pageY(el) {
  if (!el || !el.getBoundingClientRect) return null;
  const r = el.getBoundingClientRect();
  const scrollY = (typeof window.scrollY === 'number')
    ? window.scrollY
    : (document.documentElement.scrollTop || 0);
  return scrollY + r.top;
}

// Cache and storage utilities
export function createCache(ttlMs = 30 * 60 * 1000) {
  const cache = new Map();
  
  return {
    get(key) {
      const entry = cache.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > ttlMs) {
        cache.delete(key);
        return null;
      }
      return entry.value;
    },
    
    set(key, value) {
      cache.set(key, {
        value,
        timestamp: Date.now()
      });
    },
    
    delete(key) {
      cache.delete(key);
    },
    
    clear() {
      cache.clear();
    }
  };
}

// LocalStorage helpers with error handling
export function lsGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Compte les mots d'un texte (tokenisation Unicode — la version la plus
 * correcte du projet, issue de chapterWordCount ; remplace les split(/\s+/))
 * @param {string} text - Texte à compter
 * @returns {number} Nombre de mots
 */
export function countWords(text) {
  if (!text) return 0;
  const s = String(text).replace(/\s+/g, ' ').trim();
  if (!s) return 0;
  try {
    const tokens = s.match(/[\p{L}\p{N}’'-]+/gu);
    if (tokens) return tokens.length;
  } catch { /* moteur sans support Unicode property escapes */ }
  const simple = s.match(/\S+/g);
  return simple ? simple.length : 0;
}

export function lsDel(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// SessionStorage helpers with error handling
export function sessionGet(key, defaultValue = null) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw !== null ? raw : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function sessionSet(key, value) {
  try {
    sessionStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function sessionDel(key) {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// Element measurement helper
export function measureTextWidth(text, className = '') {
  let measurer = /** @type {HTMLElement} */ (document.querySelector('.ao3h-text-measurer'));
  if (!measurer || !document.body.contains(measurer)) {
    measurer = document.createElement('span');
    measurer.className = `ao3h-text-measurer ${className}`;
    measurer.style.cssText = 'position:absolute; visibility:hidden; white-space:pre; font:inherit; line-height:1.4; padding:.2em .5em; border:1px solid #ccc; border-radius:3px;';
    document.body.appendChild(measurer);
  }
  
  if (className && !measurer.classList.contains(className)) {
    measurer.className = `ao3h-text-measurer ${className}`;
  }
  
  measurer.textContent = String(text || '1');
  return Math.ceil(measurer.getBoundingClientRect().width);
}

// Interaction detection utility
export function createInteractionDetector(callback, debounceMs = 500) {
  let isInteracting = false;
  const resetInteraction = debounce(() => {
    isInteracting = false;
    if (callback) callback(false);
  }, debounceMs);

  const bump = () => {
    const wasInteracting = isInteracting;
    isInteracting = true;
    if (!wasInteracting && callback) callback(true);
    resetInteraction();
  };

  const events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  events.forEach(ev => {
    window.addEventListener(ev, bump, { passive: true });
  });

  return {
    isInteracting: () => isInteracting,
    destroy: () => {
      events.forEach(ev => {
        window.removeEventListener(ev, bump);
      });
    }
  };
}

// Accessibility utilities
export function prefersReducedMotion() {
  try {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// Scroll utilities
export const now = () => performance.now();

export function atBottom() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.ceil(window.scrollY) >= max;
}

export function isAtTop() {
  return window.scrollY === 0;
}

// AO3-specific utilities

/**
 * Get jQuery instance from page (AO3 uses both $ and $j)
 * @returns {any} jQuery function or null
 */
export function getJQuery() {
  if (typeof window.jQuery !== 'undefined') return window.jQuery;
  if (typeof window.$j !== 'undefined') return window.$j;
  if (typeof window.$ !== 'undefined' && window.$.fn && window.$.fn.jquery) return window.$;
  return null;
}

/**
 * Wait for jQuery to be loaded (since AO3 loads it async)
 * @param {number} timeout - Max wait time in ms
 * @returns {Promise<Function|null>} jQuery or null
 */
export async function waitForJQuery(timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const jq = getJQuery();
    if (jq) return jq;
    await sleep(50);
  }
  return null;
}

/**
 * Wait for AO3's CSRF token to be loaded
 * AO3 uses updateCachedTokens() in application.js for logged-out users
 * @param {number} timeout - Max wait time in ms
 * @returns {Promise<string|null>}
 */
export async function waitForCSRF(timeout = 5000) {
  const $ = getJQuery();
  if (!$) return null;
  
  // If already loaded
  const existing = $('meta[name=csrf-token]').attr('content');
  if (existing) return existing;
  
  // Wait for loadedCSRF event (fired by application.js)
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve($('meta[name=csrf-token]').attr('content') || null);
      }
    }, timeout);
    
    $(document).one('loadedCSRF', () => {
      if (!resolved) {
        clearTimeout(timer);
        resolved = true;
        resolve($('meta[name=csrf-token]').attr('content') || null);
      }
    });
  });
}

/**
 * Check if TinyMCE (rich text editor) is active
 * @returns {boolean}
 */
export function hasTinyMCE() {
  return typeof window.tinyMCE !== 'undefined' && window.tinyMCE !== null;
}

/**
 * Trigger TinyMCE to save content into textareas (needed before validation)
 * AO3's livevalidation_standalone.js does this on blur/submit
 */
export function triggerTinyMCESave() {
  if (hasTinyMCE() && typeof window.tinyMCE.triggerSave === 'function') {
    try {
      window.tinyMCE.triggerSave();
    } catch (e) {
      console.warn('[AO3H] TinyMCE save failed:', e);
    }
  }
}

/**
 * Wait for element with livequery-style dynamic detection
 * Inspired by jquery.livequery but vanilla JS
 * @param {string} selector - CSS selector
 * @param {Function} callback - Called with element when found
 * @param {number} timeout - Max wait time
 * @returns {Object} {found: boolean, element: Element|null, disconnect: Function}
 */
export function waitForElement(selector, callback = null, timeout = 10000) {
  const existing = document.querySelector(selector);
  if (existing) {
    if (callback) callback(existing);
    return { found: true, element: existing, disconnect: () => {} };
  }
  
  let resolved = false;
  let foundElement = null;
  const observer = new MutationObserver(() => {
    if (resolved) return;
    const el = document.querySelector(selector);
    if (el) {
      resolved = true;
      foundElement = el;
      if (callback) callback(el);
      observer.disconnect();
    }
  });
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  if (timeout > 0) {
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        observer.disconnect();
      }
    }, timeout);
  }
  
  return {
    found: false,
    element: foundElement,
    disconnect: () => observer.disconnect()
  };
}

/**
 * Check if Rails UJS is loaded and active
 * @returns {boolean}
 */
export function hasRailsUJS() {
  const $ = getJQuery();
  return $ && typeof $.rails !== 'undefined';
}

/**
 * Trigger Rails UJS events manually
 * Useful when programmatically clicking data-remote elements
 * @param {HTMLElement} element
 * @param {string} eventName - e.g. 'ajax:before', 'ajax:success'
 * @param {*} data
 */
export function triggerRailsEvent(element, eventName, data = null) {
  const $ = getJQuery();
  if (!$ || !element) return false;
  
  try {
    const $el = $(element);
    if (data !== null) {
      $el.trigger(eventName, data);
    } else {
      $el.trigger(eventName);
    }
    return true;
  } catch (e) {
    console.warn(`[AO3H] Failed to trigger Rails event ${eventName}:`, e);
    return false;
  }
}

/**
 * Safely enable a Rails UJS disabled form element
 * Uses $.rails.enableFormElement if available
 * @param {HTMLElement} element
 */
export function enableFormElement(element) {
  const $ = getJQuery();
  if (!$ || !element) return;
  
  if ($.rails && typeof $.rails.enableFormElement === 'function') {
    try {
      $.rails.enableFormElement($(element));
      return;
    } catch (e) {
      console.warn('[AO3H] Rails enableFormElement failed:', e);
    }
  }
  
  // Fallback: manual enable
  /** @type {HTMLButtonElement} */ (element).disabled = false;
  if (element.dataset.ujsDisabled) {
    delete element.dataset.ujsDisabled;
  }
}

/**
 * Check if we're in LiveValidation error state
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
export function hasValidationErrors(form) {
  if (!form) return false;
  return form.querySelectorAll('.LV_invalid_field, [aria-invalid="true"]').length > 0;
}

/**
 * Scroll to first validation error (mimics livevalidation behavior)
 * @param {HTMLFormElement|Document} [form]
 */
export function scrollToFirstError(form = document) {
  const $ = getJQuery();
  const errorField = /** @type {HTMLElement} */ (form.querySelector('.LV_invalid_field, [aria-invalid="true"]'));
  
  if (errorField) {
    if ($ && $.fn.scrollTo) {
      // Use AO3's jquery.scrollTo if available
      try {
        $('html, body').scrollTo(errorField, { duration: 300 });
      } catch {
        errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Focus after scroll
    setTimeout(() => {
      try { errorField.focus(); } catch {}
    }, 350);
  }
}

// CSS helper (idempotent, returns remove handle)
const _cssKeys = new Set();
const _cssOwners = new Map();   // moduleId → Set<styleElement>

export function css(first, ...rest){
  let text = '';
  let key  = `block-${_cssKeys.size}`;
  if (Array.isArray(first) && Object.prototype.hasOwnProperty.call(first, 'raw')) {
    const strings = first, vals = rest;
    text = strings.map((s,i)=> s + (i < vals.length ? vals[i] : '')).join('');
  } else {
    text = String(first ?? '');
    if (typeof rest[0] === 'string') key = rest[0];
  }
  if (_cssKeys.has(key)) return () => {};
  _cssKeys.add(key);

  let styleEl;
  try {
    styleEl = GM_addStyle(text);
  } catch {
    styleEl = document.createElement('style');
    styleEl.textContent = text;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  let removed = false;
  return function remove() {
    if (removed) return;
    removed = true;
    _cssKeys.delete(key);
    try { styleEl?.remove?.(); } catch {}
  };
}

/**
 * Module-scoped CSS — auto-removed when the module stops.
 * Usage:  css.scoped(MOD, `...styles...`);
 *         css.scoped(MOD)`...tagged template...`;
 * Cleanup: css.removeAll(MOD)  or automatic via module:stopped event.
 */
css.scoped = function scopedCss(moduleId, textOrStrings, ...vals) {
  // Support both: css.scoped(id, str)  and  css.scoped(id)`template`
  if (textOrStrings === undefined) {
    // Curried: css.scoped(id) returns a tag function
    return (strings, ...v) => css._addScoped(moduleId, strings, ...v);
  }
  return css._addScoped(moduleId, textOrStrings, ...vals);
};

css._addScoped = function(moduleId, first, ...rest) {
  const remove = css(first, ...rest);
  if (!_cssOwners.has(moduleId)) _cssOwners.set(moduleId, new Set());
  // Track the remove handle (not the element) for portability
  _cssOwners.get(moduleId).add(remove);
  return remove;
};

/**
 * Remove all CSS injected via css.scoped() for a given module.
 */
css.removeAll = function(moduleId) {
  const handles = _cssOwners.get(moduleId);
  if (!handles) return;
  for (const remove of handles) remove();
  _cssOwners.delete(moduleId);
};

// Auto-cleanup listener (wired once, works for all modules)
// Étape 313 : Bus importé — plus de lecture window.AO3H_Common ni de différé.
try {
  Bus.on('module:stopped', ({ name }) => css.removeAll(name));
} catch {}
