/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH FILTERS - Utilitaires pour les filtres de recherche AO3
   Why: centraliser la logique spécifique aux filtres de works AO3
═══════════════════════════════════════════════════════════════════════════ */

import { findFilterForm } from './parsers.js';

/* ──────────────────────────────────────────────────────────────────────────
   FILTER FORM MANIPULATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Configure les valeurs de filtres core dans un formulaire AO3
 * @param {HTMLFormElement} form - Formulaire de filtres
 * @param {Object} filters - Filtres à appliquer {wordsFrom, complete, languageId}
 */
export function setCoreFilterValues(form, filters = {}) {
  if (!form) return;
  
  const { wordsFrom, complete, languageId } = filters;
  
  // Words from filter
  if (wordsFrom) {
    let wordsInput = form.querySelector('input[name="work_search[words_from]"]');
    if (!wordsInput) {
      wordsInput = document.createElement('input');
      wordsInput.type = 'hidden';
      wordsInput.name = 'work_search[words_from]';
      form.appendChild(wordsInput);
    }
    wordsInput.value = wordsFrom;
  }
  
  // Complete filter  
  if (complete) {
    let completeRadio = form.querySelector('input[name="work_search[complete]"][value="T"]');
    if (completeRadio) {
      completeRadio.checked = true;
    } else {
      let completeHidden = form.querySelector('input[type="hidden"][name="work_search[complete]"]');
      if (!completeHidden) {
        completeHidden = document.createElement('input');
        completeHidden.type = 'hidden';
        completeHidden.name = 'work_search[complete]';
        form.appendChild(completeHidden);
      }
      completeHidden.value = complete;
    }
  }
  
  // Language filter
  if (languageId) {
    let langSelect = form.querySelector('select[name="work_search[language_id]"]');
    if (langSelect) {
      langSelect.value = languageId;
    } else {
      let langHidden = form.querySelector('input[type="hidden"][name="work_search[language_id]"]');
      if (!langHidden) {
        langHidden = document.createElement('input');
        langHidden.type = 'hidden';
        langHidden.name = 'work_search[language_id]';
        form.appendChild(langHidden);
      }
      langHidden.value = languageId;
    }
  }
}

/**
 * Efface les valeurs de filtres core d'un formulaire AO3
 * @param {HTMLFormElement} form - Formulaire à nettoyer
 */
export function clearCoreFilterValues(form) {
  if (!form) return;
  
  // Language select
  const langSelect = form.querySelector('select[name="work_search[language_id]"]');
  if (langSelect) {
    langSelect.value = '';
    langSelect.selectedIndex = 0;
  }
  
  // Words inputs
  const wordsFrom = form.querySelector('input[name="work_search[words_from]"]');
  const wordsTo = form.querySelector('input[name="work_search[words_to]"]');
  if (wordsFrom) wordsFrom.value = '';
  if (wordsTo) wordsTo.value = '';
  
  // Complete filters
  const completeHidden = form.querySelector('input[type="hidden"][name="work_search[complete]"]');
  if (completeHidden) completeHidden.value = '';
  
  const completeRadio = form.querySelector('input[name="work_search[complete]"][value="T"]');
  if (completeRadio) completeRadio.checked = false;
  
  // Uncheck all complete-related radios
  form.querySelectorAll('input[type="radio"][name*="complete"]').forEach(radio => {
    radio.checked = false;
  });
}

/**
 * S'assure que le formulaire reviendra à la page 1 lors de la soumission
 * @param {HTMLFormElement} form - Formulaire à modifier
 */
export function ensurePageOne(form) {
  if (!form) return;
  
  let pageInput = form.querySelector('input[name="page"]');
  if (!pageInput) {
    pageInput = document.createElement('input');
    pageInput.type = 'hidden';
    pageInput.name = 'page';
    form.appendChild(pageInput);
  }
  pageInput.value = '1';
}

/* ──────────────────────────────────────────────────────────────────────────
   FORM SUBMISSION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Soumet un formulaire de manière sécurisée avec protection contre les doubles soumissions
 * @param {HTMLFormElement} form - Formulaire à soumettre
 * @param {Object} options - Options {guardKey, guardTimeout}
 * @returns {boolean} True si soumission effectuée
 */
export function safeFormSubmit(form, options = {}) {
  if (!form) return false;
  
  const { guardKey = 'default', guardTimeout = 800 } = options;
  const guardProperty = `__ao3h_submit_guard_${guardKey}`;
  
  // Vérifier le guard
  if (form[guardProperty]) return false;
  
  // Activer le guard
  form[guardProperty] = true;
  
  try {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.submit();
    }
    return true;
  } finally {
    // Relâcher le guard après un délai
    setTimeout(() => {
      form[guardProperty] = false;
    }, guardTimeout);
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   FILTER PRESETS
─────────────────────────────────────────────────────────────────────────── */

/**
 * Presets de filtres communs
 */
export const FILTER_PRESETS = {
  QUALITY_ENGLISH: {
    wordsFrom: '5000',
    complete: 'T',
    languageId: 'en'
  },
  
  COMPLETE_WORKS: {
    complete: 'T'
  },
  
  LONG_WORKS: {
    wordsFrom: '10000'
  },
  
  ENGLISH_ONLY: {
    languageId: 'en'
  }
};

/**
 * Applique un preset de filtres à un formulaire
 * @param {HTMLFormElement} form - Formulaire à modifier
 * @param {string|Object} preset - Nom du preset ou objet de filtres
 */
export function applyFilterPreset(form, preset) {
  if (!form) return;
  
  const filters = typeof preset === 'string' ? FILTER_PRESETS[preset] : preset;
  if (!filters) return;
  
  setCoreFilterValues(form, filters);
}

/* ──────────────────────────────────────────────────────────────────────────
   URL & SCOPE MANAGEMENT
─────────────────────────────────────────────────────────────────────────── */

/**
 * Vérifie si une URL contient les filtres désirés
 * @param {URL|string} url - URL à vérifier
 * @param {Object} desiredFilters - Filtres attendus
 * @returns {boolean} True si tous les filtres correspondent
 */
export function urlHasDesiredFilters(url, desiredFilters) {
  if (!url || !desiredFilters) return false;
  
  try {
    const urlObj = typeof url === 'string' ? new URL(url, location.origin) : url;
    const params = urlObj.searchParams;
    
    return Object.entries(desiredFilters).every(([key, value]) => {
      // Support des clés nested work_search[...]
      const searchKey = key.startsWith('work_search[') ? key : `work_search[${key}]`;
      return params.get(searchKey) === value;
    });
  } catch {
    return false;
  }
}

/**
 * Génère une clé de scope pour les filtres automatiques
 * @param {string} prefix - Préfixe de la clé
 * @param {Location} location - Location à analyser
 * @returns {string} Clé de scope
 */
export function createAutoFilterScopeKey(prefix, location = window.location) {
  if (!prefix) return null;
  
  const pathname = location.pathname || '';
  
  // Pages de tags
  const tagMatch = pathname.match(/^\/tags\/([^/]+)\/works\/?$/);
  if (tagMatch) {
    return `${prefix}:tag:${tagMatch[1]}`;
  }
  
  // Page works générale
  if (/^\/works\/?$/.test(pathname)) {
    return `${prefix}:works`;
  }
  
  // Fallback
  return `${prefix}:${pathname}`;
}

/* ──────────────────────────────────────────────────────────────────────────
   SESSION & PERSISTENCE
─────────────────────────────────────────────────────────────────────────── */

/**
 * Marque qu'un scope a été traité dans cette session
 * @param {string} scopeKey - Clé du scope
 */
export function markScopeAsApplied(scopeKey) {
  if (!scopeKey) return;
  try {
    sessionStorage.setItem(scopeKey, '1');
  } catch {}
}

/**
 * Vérifie si un scope a été traité dans cette session
 * @param {string} scopeKey - Clé du scope
 * @returns {boolean} True si déjà traité
 */
export function isScopeApplied(scopeKey) {
  if (!scopeKey) return false;
  try {
    return sessionStorage.getItem(scopeKey) === '1';
  } catch {
    return false;
  }
}

/**
 * Efface le marquage d'un scope
 * @param {string} scopeKey - Clé du scope
 */
export function clearScopeApplied(scopeKey) {
  if (!scopeKey) return;
  try {
    sessionStorage.removeItem(scopeKey);
  } catch {}
}

/* ──────────────────────────────────────────────────────────────────────────
   UTILITIES
─────────────────────────────────────────────────────────────────────────── */

/**
 * Applique des filtres automatiques une seule fois par scope
 * @param {Object} config - Configuration {filters, scopePrefix}
 * @returns {boolean} True si appliqué
 */
export function applyAutoFiltersOncePerScope(config = {}) {
  const { filters = {}, scopePrefix = 'autoFilters:applied' } = config;
  
  const currentUrl = new URL(location.href);
  const form = findFilterForm();
  
  if (!form) return false;
  
  // Éviter les exécutions répétées sur le même DOM
  if (form.__ao3h_autofilter_done) return false;
  
  const scopeKey = createAutoFilterScopeKey(scopePrefix);
  const alreadyApplied = isScopeApplied(scopeKey);
  const hasDesiredFilters = urlHasDesiredFilters(currentUrl, filters);
  
  if (hasDesiredFilters) {
    markScopeAsApplied(scopeKey);
    return false;
  }
  
  if (!alreadyApplied) {
    form.__ao3h_autofilter_done = true;
    setCoreFilterValues(form, filters);
    ensurePageOne(form);
    markScopeAsApplied(scopeKey);
    
    // Soumettre le formulaire
    requestAnimationFrame(() => safeFormSubmit(form));
    return true;
  }
  
  return false;
}