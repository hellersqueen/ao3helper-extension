/* ═══════════════════════════════════════════════════════════════════════════
   AO3 REQUESTS - Requêtes et authentification AO3
   Why: centraliser les patterns de requêtes AJAX vers AO3 avec CSRF et gestion d'erreurs
   Note: Compatible avec Rails UJS (jquery-ujs) et les patterns natifs d'AO3
═══════════════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────────────────
   CSRF & AUTHENTICATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Récupère le token CSRF depuis la page courante ou un document parsé
 * Compatible avec Rails UJS et application.js d'AO3
 * @param {Document} doc - Document à analyser (défaut: document courant)
 * @returns {string|null} Token CSRF ou null si non trouvé
 */
export function getCSRF(doc = document) {
  // Try Rails UJS method first (most reliable, live page only)
  if (doc === document) {
    const $ = window.jQuery || window.$j;
    if ($ && $.rails && typeof $.rails.csrfToken === 'function') {
      const token = $.rails.csrfToken();
      if (token) return token;
    }
  }

  // Fallback to meta tag
  const metaToken = doc.querySelector('meta[name="csrf-token"]');
  if (metaToken) return metaToken.getAttribute('content');

  // Last resort: form input
  const inputToken = doc.querySelector('input[name="authenticity_token"]');
  if (inputToken) return inputToken.value;

  return null;
}

/**
 * Crée des headers par défaut pour les requêtes AO3
 * @param {string} token - Token CSRF (optionnel, sera récupéré automatiquement)
 * @returns {Object} Headers pour fetch
 */
export function createAO3Headers(token = null) {
  const csrf = token || getCSRF();
  const headers = {
    'Accept': 'text/javascript, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };
  
  if (csrf) headers['X-CSRF-Token'] = csrf;
  
  return headers;
}

/* ──────────────────────────────────────────────────────────────────────────
   FETCH DE PAGES AO3 (double transport GM / fetch)
   Implémentation de référence : viewHistory.importAO3History — le seul
   endroit du projet qui gérait les deux transports.
─────────────────────────────────────────────────────────────────────────── */

/**
 * Télécharge une page AO3 en texte. Utilise GM.xmlhttpRequest quand
 * disponible (userscript, contourne CORS sur URL absolue), sinon fetch.
 * Rejette sur statut HTTP non-2xx (les deux transports) — sinon un 404/work
 * supprimé produirait un téléchargement silencieusement corrompu (shared.md,
 * § reste à faire : « fetchAO3PageText ne peut pas exposer ce statut quand
 * elle passe par le transport GM », désormais corrigé).
 * @param {string} url - URL relative ou absolue
 * @param {{signal?: AbortSignal}} opts
 * @returns {Promise<string>} HTML de la page
 */
export async function fetchAO3PageText(url, { signal } = {}) {
  const GM = typeof window !== 'undefined' ? window.GM : null;
  if (GM?.xmlhttpRequest) {
    const absolute = new URL(url, 'https://archiveofourown.org').toString();
    return new Promise((resolve, reject) => {
      const req = GM.xmlhttpRequest({
        method: 'GET',
        url: absolute,
        onload: (r) => {
          if (r.status < 200 || r.status >= 300) reject(new Error(`HTTP ${r.status}`));
          else resolve(r.responseText);
        },
        onerror: reject,
        onabort: () => reject(new DOMException('Aborted', 'AbortError')),
      });
      signal?.addEventListener('abort', () => req?.abort?.(), { once: true });
    });
  }
  const res = await fetch(url, { signal, credentials: 'same-origin' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * Télécharge le HTML complet d'un work (?view_full_work=true)
 * @param {string} workId - ID du work
 * @param {{signal?: AbortSignal}} opts
 * @returns {Promise<string>} HTML complet
 */
export function fetchWorkFullHTML(workId, opts = {}) {
  return fetchAO3PageText(`/works/${workId}?view_full_work=true&view_adult=true`, opts);
}

/**
 * Télécharge et parse la page complète d'un work
 * @param {string} workId - ID du work
 * @param {{signal?: AbortSignal}} opts
 * @returns {Promise<Document>} Document parsé
 */
export async function fetchWorkDocument(workId, opts = {}) {
  const html = await fetchWorkFullHTML(workId, opts);
  return new DOMParser().parseFromString(html, 'text/html');
}

/**
 * POST authentifié générique vers un endpoint AO3 (x-www-form-urlencoded,
 * CSRF + X-Requested-With). Le token est ajouté au corps sous
 * authenticity_token comme le font les formulaires Rails.
 * @param {string} path - Chemin de l'endpoint (ex: '/works/123/kudos')
 * @param {Object} params - Paires clé/valeur du corps (hors token)
 * @param {{signal?: AbortSignal}} opts
 * @returns {Promise<boolean>} True si la requête a abouti (2xx ou redirection)
 */
export async function postAO3Form(path, params = {}, { signal } = {}) {
  const token = getCSRF();
  if (!token) return false;
  const body = new URLSearchParams({ ...params, authenticity_token: token });
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRF-Token': token,
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
      body: body.toString(),
      signal,
    });
    return res.ok || res.redirected;
  } catch {
    return false;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   MARK FOR LATER REQUESTS
─────────────────────────────────────────────────────────────────────────── */

/**
 * POST simple vers mark_for_later
 * @param {string} workId - ID du work
 * @returns {Promise<Response>} Réponse fetch
 */
export async function postMarkForLater(workId) {
  if (!workId) throw new Error('WorkId required');
  
  const url = `/works/${workId}/mark_for_later`;
  const headers = createAO3Headers();
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include'
  });
  
  if (response.status === 401 || response.status === 403) {
    throw new Error('unauthorized');
  }
  
  return response;
}

/**
 * POST simple vers unmark_for_later  
 * @param {string} workId - ID du work
 * @returns {Promise<Response>} Réponse fetch
 */
export async function postUnmarkForLater(workId) {
  if (!workId) throw new Error('WorkId required');
  
  const url = `/works/${workId}/unmark_for_later`;
  const headers = createAO3Headers();
  
  const response = await fetch(url, {
    method: 'POST', 
    headers,
    credentials: 'include'
  });
  
  if (response.status === 401 || response.status === 403) {
    throw new Error('unauthorized');
  }
  
  return response;
}

/**
 * POST vers mark/unmark avec détection automatique de formulaires existants
 * @param {string} workId - ID du work
 * @param {string} action - "mark_for_later" ou "unmark_for_later"
 * @returns {Promise<boolean>} True si succès
 */
export async function postAO3Action(workId, action) {
  if (!workId || !action) return false;
  
  // Essayer d'abord les formulaires existants sur la page
  const selectors = [
    `form.button_to[action*="/works/${workId}/${action}"]`,
    `form.button_to[action*="/works/${workId}/${action}/"]`, 
    `form.button_to[action*="/works/${workId}"][action*="${action}"]`,
    `a[href*="/works/${workId}/${action}"]`,
    `a[href*="/works/${workId}/${action}/"]`
  ];

  let actionUrl = null;
  let params = new URLSearchParams();

  // Chercher un formulaire ou lien existant
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    
    const tag = el.tagName && el.tagName.toLowerCase();
    if (tag === 'form') {
      actionUrl = el.getAttribute('action') || el.action;
      Array.from(el.querySelectorAll('input[name]')).forEach(input => {
        if (input.type === 'file') return;
        params.append(input.name, input.value || '');
      });
      break;
    } else if (tag === 'a') {
      actionUrl = el.getAttribute('href') || el.href;
      break;
    }
  }

  // Si pas de formulaire trouvé, essayer de charger la page du work
  if (!actionUrl) {
    const workUrl = `/works/${workId}`;
    try {
      const workResponse = await fetch(workUrl, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Accept': 'text/html,application/xhtml+xml' }
      });
      
      if (workResponse.ok) {
        const html = await workResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const form = doc.querySelector(`form.button_to[action*="/works/${workId}/${action}"]`) ||
                    doc.querySelector(`form.button_to[action*="/works/${workId}"][action*="${action}"]`) ||
                    doc.querySelector('form.button_to');
                    
        if (form) {
          actionUrl = form.getAttribute('action') || form.action;
          Array.from(form.querySelectorAll('input[name]')).forEach(input => {
            if (input.type === 'file') return;
            params.append(input.name, input.value || '');
          });
        }
      }
    } catch (e) {
      console.warn(`[AO3Requests] Failed to fetch work page ${workUrl}`, e);
    }
  }

  // Fallback : construire l'URL manuellement
  if (!actionUrl) {
    actionUrl = `/works/${workId}/${action}`;
    const token = getCSRF();
    if (token) {
      params.set('authenticity_token', token);
      params.set('utf8', '✓');
    }
  }

  // Normaliser l'URL
  try {
    actionUrl = new URL(actionUrl, location.origin).toString();
  } catch (e) {
    console.warn(`[AO3Requests] Invalid action URL: ${actionUrl}`);
    return false;
  }

  // S'assurer qu'on a un token CSRF
  if (!params.has('authenticity_token')) {
    const token = getCSRF();
    if (token) params.set('authenticity_token', token);
  }

  // Effectuer la requête POST
  try {
    const response = await fetch(actionUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: createAO3Headers(params.get('authenticity_token')),
      body: params.toString(),
      redirect: 'follow'
    });
    
    return response.ok || (response.status >= 300 && response.status < 400);
  } catch (e) {
    console.warn(`[AO3Requests] POST failed for ${action} on work ${workId}`, e);
    return false;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   WORK STATUS CHECKING
─────────────────────────────────────────────────────────────────────────── */

/**
 * Vérifie si un work est marqué "for later" côté serveur
 * @param {string} workId - ID du work
 * @returns {Promise<boolean>} True si marqué
 */
export async function checkWorkMarked(workId) {
  if (!workId) return false;
  
  const workUrl = `/works/${workId}`;
  
  try {
    const response = await fetch(workUrl, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    
    // Heuristiques pour détecter si le work est déjà marqué
    const isMarked = 
      /\/works\/\d+\/unmark/i.test(html) ||                    // Présence d'unmark endpoint
      /mark\s*as\s*read/i.test(html) ||                        // Texte "mark as read"
      /already\s*marked/i.test(html) ||                        // Message "already marked"
      /unmark\s*for\s*later/i.test(html) ||                    // Bouton "unmark for later"
      /class=["'][^"']*\bmark\b[^"']*["'][^>]*>[^<]*(Unmark|Remove)/i.test(html);
    
    return isMarked;
  } catch (e) {
    console.warn(`[AO3Requests] Failed to check work ${workId}`, e);
    return false;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   BATCH OPERATIONS
─────────────────────────────────────────────────────────────────────────── */

/**
 * Vérifie le statut de plusieurs works en batch avec throttling
 * @param {string[]} workIds - Array des work IDs
 * @param {Function} callback - Callback appelé pour chaque résultat (workId, isMarked)
 * @param {Object} options - Options {batchSize: 10, throttleMs: 500}
 * @returns {Promise<Object>} Map workId -> boolean
 */
export async function checkMultipleWorksMarked(workIds, callback = null, options = {}) {
  const { batchSize = 10, throttleMs = 500 } = options;
  const results = {};
  
  if (!workIds || !workIds.length) return results;
  
  for (let i = 0; i < workIds.length; i += batchSize) {
    const batch = workIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (workId) => {
      try {
        const isMarked = await checkWorkMarked(workId);
        results[workId] = isMarked;
        if (callback) callback(workId, isMarked);
        return { workId, isMarked };
      } catch (e) {
        results[workId] = false;
        if (callback) callback(workId, false);
        return { workId, isMarked: false };
      }
    });
    
    await Promise.all(batchPromises);
    
    // Throttling entre les batches
    if (i + batchSize < workIds.length && throttleMs > 0) {
      await new Promise(resolve => setTimeout(resolve, throttleMs));
    }
  }
  
  return results;
}

/* ──────────────────────────────────────────────────────────────────────────
   UTILITIES
─────────────────────────────────────────────────────────────────────────── */

/**
 * Crée une requête AO3 configurée avec les bonnes options
 * @param {string} url - URL relative ou absolue
 * @param {Object} options - Options fetch supplémentaires
 * @returns {Promise<Response>} Réponse fetch
 */
export function createAO3Request(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: createAO3Headers()
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Merger les headers
  if (options.headers) {
    mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
  }
  
  // Normaliser l'URL
  const fullUrl = url.startsWith('http') ? url : new URL(url, location.origin).toString();
  
  return fetch(fullUrl, mergedOptions);
}