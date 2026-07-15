/* ═══════════════════════════════════════════════════════════════════════════
   AO3 ACTIONS - Actions authentifiées sémantiques (kudos, MFL, subscribe)
   Why: trois modules re-codaient les mêmes POST authentifiés avec trois
   transports différents (kudosTracker: fetch+string, similarFics:
   GM_xmlhttpRequest, ficActions: fetch+URLSearchParams). Couche fine
   au-dessus de requests.postAO3Form ; recettes issues des implémentations
   qui fonctionnent en production.
═══════════════════════════════════════════════════════════════════════════ */

import { postAO3Form } from './requests.js';

/**
 * Donne un kudos à un work (recette kudosTracker)
 * @param {string} workId - ID du work
 * @param {{signal?: AbortSignal}} opts
 * @returns {Promise<boolean>} True si le kudos a été accepté
 */
export function giveKudos(workId, opts = {}) {
  if (!workId) return Promise.resolve(false);
  return postAO3Form(`/works/${workId}/kudos`, {}, opts);
}

/**
 * Marque un work « for later » (recette similarFics — _method=patch)
 * @param {string} workId - ID du work
 * @param {{signal?: AbortSignal}} opts
 * @returns {Promise<boolean>} True si le work a été marqué
 */
export function markWorkForLater(workId, opts = {}) {
  if (!workId) return Promise.resolve(false);
  return postAO3Form(`/works/${workId}/mark_for_later`, { _method: 'patch' }, opts);
}

/**
 * S'abonne à un work (recette ficActions)
 * @param {string} workId - ID du work
 * @param {{signal?: AbortSignal}} opts
 * @returns {Promise<boolean>} True si l'abonnement a été créé
 */
export function subscribeToWork(workId, opts = {}) {
  if (!workId) return Promise.resolve(false);
  return postAO3Form('/subscriptions', {
    'subscription[subscribable_type]': 'Work',
    'subscription[subscribable_id]': workId,
  }, opts);
}
