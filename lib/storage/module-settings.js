/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETTINGS - Lecture des réglages écrits par le panneau de config
   Why: le contrat panneau ↔ module (clé `ao3h:mod:<MOD>:settings`, JSON,
   fallback sur les DEFAULTS du module) était recopié dans ~40 fichiers avec
   de petites divergences. C'est de la connaissance d'infrastructure, pas du
   métier.

   Trois usages :
   - makeCfg(mod, DEFAULTS)            → cfg(key) « live » (relit à chaque
     appel — les changements du panneau prennent effet sans rechargement)
   - loadModuleSettings(mod, DEFAULTS) → snapshot fusionné { ...DEFAULTS,
     ...saved } (pour les modules qui lisent une fois à l'init)
   - saveModuleSettings(mod, patch)    → merge-patch (rarement utile côté
     module ; le panneau reste l'écrivain principal)

   Cas « enfant lit la clé du parent » (comment-kit, search-enhancer,
   bookmark-vault) : passer l'ID du parent, ex. makeCfg('commentKit', D).
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../utils/globals.js';

const NS = 'ao3h';

function settingsKey(moduleId) {
  return `${NS}:mod:${moduleId}:settings`;
}

function readRaw(moduleId) {
  try {
    const raw = localStorage.getItem(settingsKey(moduleId));
    if (!raw) return {};
    const saved = JSON.parse(raw);
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

/**
 * Snapshot fusionné des réglages d'un module
 * @param {string} moduleId - ID du module (ou du parent pour les sous-modules)
 * @param {Object} DEFAULTS - Valeurs par défaut
 * @returns {Object} { ...DEFAULTS, ...réglages sauvegardés }
 */
export function loadModuleSettings(moduleId, DEFAULTS = {}) {
  return { ...DEFAULTS, ...readRaw(moduleId) };
}

/**
 * Fabrique un lecteur de réglages « live » (relit le localStorage à chaque appel)
 * @param {string} moduleId - ID du module (ou du parent pour les sous-modules)
 * @param {Object} DEFAULTS - Valeurs par défaut
 * @param {{ globalConfig?: boolean }} opts - globalConfig: consulter aussi
 *   window.AO3H_Config[moduleId].defaults entre les réglages sauvés et DEFAULTS
 *   (comportement historique de notificationCenter / activityPanel)
 * @returns {(key: string, fallback?: *) => *} cfg(key, fallback?)
 */
export function makeCfg(moduleId, DEFAULTS = {}, { globalConfig = false } = {}) {
  return function cfg(key, fallback) {
    const saved = readRaw(moduleId);
    if (key in saved) return saved[key];
    if (globalConfig) {
      const W = getGlobalWindow();
      const configured = W.AO3H_Config?.[moduleId]?.defaults?.[key];
      if (configured !== undefined) return configured;
    }
    if (key in DEFAULTS) return DEFAULTS[key];
    return fallback;
  };
}

/**
 * Fusionne un patch dans les réglages sauvegardés du module
 * @param {string} moduleId - ID du module
 * @param {Object} patch - Clés à écrire
 */
export function saveModuleSettings(moduleId, patch) {
  try {
    localStorage.setItem(
      settingsKey(moduleId),
      JSON.stringify({ ...readRaw(moduleId), ...patch })
    );
  } catch { /* quota / storage indisponible */ }
}
