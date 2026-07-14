/* ═══════════════════════════════════════════════════════════════════════════
   AO3 PARSERS - Extraction et parsing des données AO3
   Why: centraliser toutes les fonctions d'extraction dupliquées dans les modules
═══════════════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────────────────
   WORK ID EXTRACTION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Extrait l'ID de work depuis une URL/href
 * Matches: /works/12345, /works/12345/, /works/12345/chapters/678, etc.
 * @param {string} href - URL à parser
 * @returns {string|null} Work ID ou null si non trouvé
 */
export function extractWorkIdFromHref(href) {
  if (!href) return null;
  const m = String(href).match(/\/works\/(\d+)(?:[\/?#]|$)/);
  return m ? m[1] : null;
}

/**
 * Extrait l'ID de work depuis un élément blurb
 * Cherche le premier lien vers un work dans le blurb
 * @param {Element} blurb - Élément blurb contenant des liens
 * @returns {string|null} Work ID ou null si non trouvé
 */
export function extractWorkIdFromBlurb(blurb) {
  if (!blurb || !blurb.querySelector) return null;
  
  // Priorité aux liens dans l'en-tête, puis n'importe quel lien work
  const selectors = [
    '.header .heading a[href*="/works/"]',
    '.heading a[href*="/works/"]', 
    'a[href*="/works/"]'
  ];
  
  for (const selector of selectors) {
    const link = blurb.querySelector(selector);
    if (link) {
      const workId = extractWorkIdFromHref(link.getAttribute('href'));
      if (workId) return workId;
    }
  }
  
  return null;
}

/**
 * Parse les IDs de work/chapitre depuis l'URL actuelle
 * Fonction déjà utilisée dans collapseAuthorNotes - centralisée ici
 * @param {Location} location - Objet location (défaut: window.location)
 * @returns {Object|null} {workId, chapterId, isFull} ou null
 */
export function parseWorkIds(location = window.location) {
  if (!location || !location.pathname) return null;
  
  // Pattern pour /works/123 ou /works/123/chapters/456
  const workMatch = location.pathname.match(/\/works\/(\d+)(?:\/chapters\/(\d+))?/);
  if (!workMatch) return null;
  
  const workId = workMatch[1];
  const chapterId = workMatch[2] || null;
  const isFull = location.search.includes('view_full_work=true');
  
  return { workId, chapterId, isFull };
}

/* ──────────────────────────────────────────────────────────────────────────
   ROUTE DETECTION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Vérifie si le pathname correspond à une page de liste de works
 * @param {string} pathname - Chemin à vérifier (défaut: location.pathname)
 * @returns {boolean} True si c'est une page de works
 */
export function isWorksLikePath(pathname = location.pathname) {
  if (!pathname) return false;
  return /^\/works\/?$/.test(pathname) || /^\/tags\/[^/]+\/works\/?$/.test(pathname);
}

/**
 * Vérifie si on est sur une page de liste (search, tags, bookmarks, etc.)
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {boolean} True si c'est une page de liste
 */
export function isListRoute(doc = document) {
  // Vérification rapide par pathname
  const path = location.pathname;
  if (/^\/works\/\d+/.test(path)) return false; // Page de work individuel
  if (/\/users\/[^/]+\/kudos-history/.test(path)) return false; // Page kudos history
  
  // Vérification par présence de blurbs
  const blurbSelectors = [
    'li[role="article"]',
    '.work.blurb.group',
    '.blurb.work',
    'li.blurb.group'
  ];
  
  return blurbSelectors.some(selector => doc.querySelector(selector));
}

/**
 * Vérifie si on est sur une page de work individuel
 * @param {string} pathname - Chemin à vérifier (défaut: location.pathname)
 * @returns {boolean} True si c'est une page de work
 */
export function isWorkRoute(pathname = location.pathname) {
  return /\/works\/\d+(?:\?|\/(?:chapters\/\d+)?(?:\?|#|$)|$)/.test(pathname);
}

/**
 * Vérifie si on est sur une page de chapitre
 * @param {string} pathname - Chemin à vérifier (défaut: location.pathname)  
 * @returns {boolean} True si c'est une page de chapitre
 */
export function isChapterRoute(pathname = location.pathname) {
  return /\/works\/\d+\/chapters\/\d+/.test(pathname);
}

/**
 * Vérifie si on est sur une page de recherche  
 * @param {string} pathname - Chemin à vérifier (défaut: location.pathname)
 * @returns {boolean} True si c'est une page de recherche
 */
export function isSearchRoute(pathname = location.pathname) {
  return /^\/works\/?$/.test(pathname) || new URLSearchParams(location.search).has('work_search[query]');
}

/**
 * Vérifie si on est sur une page de tag works
 * @param {string} pathname - Chemin à vérifier (défaut: location.pathname)
 * @returns {boolean} True si c'est une page de tag works
 */
export function isTagWorksRoute(pathname = location.pathname) {
  return /^\/tags\/[^/]+\/works\/?$/.test(pathname);
}

/**
 * Vérifie si on est sur une page de bookmarks
 * @param {string} pathname - Chemin à vérifier (défaut: location.pathname)
 * @returns {boolean} True si c'est une page de bookmarks  
 */
export function isBookmarksRoute(pathname = location.pathname) {
  return /^\/users\/[^/]+\/bookmarks/.test(pathname);
}

/* ──────────────────────────────────────────────────────────────────────────
   FORM DETECTION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Trouve le formulaire de filtres de works sur une page
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {HTMLFormElement|null} Formulaire trouvé ou null
 */
export function findFilterForm(doc = document) {
  // Essayer les sélecteurs AO3 communs d'abord
  const commonSelectors = [
    '#work-filters form',
    'form#work_search',
    '.works-search form'
  ];
  
  for (const selector of commonSelectors) {
    const form = doc.querySelector(selector);
    if (form) return form;
  }
  
  // Sinon, chercher tout formulaire qui cible /works ou /tags/.../works
  const allForms = Array.from(doc.querySelectorAll('form'));
  return allForms.find(form => {
    try {
      const action = form.getAttribute('action') || '';
      const url = new URL(action, location.href);
      return /\/works\/?$/.test(url.pathname) || /^\/tags\/[^/]+\/works\/?$/.test(url.pathname);
    } catch {
      return false;
    }
  }) || null;
}

/**
 * Trouve les formulaires Mark/Unmark for Later dans un blurb
 * @param {Element} blurb - Élément blurb à analyser
 * @returns {Object} {markForm, unmarkForm} - Formulaires trouvés ou null
 */
export function findMarkForLaterForms(blurb) {
  if (!blurb) return { markForm: null, unmarkForm: null };
  
  const markForm = blurb.querySelector('form.button_to[action*="/mark_for_later"]') || null;
  const unmarkForm = blurb.querySelector('form.button_to[action*="/unmark_for_later"]') || null;
  
  return { markForm, unmarkForm };
}

/**
 * Vérifie si un work est marqué "for later" depuis le HTML d'une page de work
 * @param {string} html - HTML de la page de work
 * @returns {boolean} True si le work est marqué for later
 */
export function isWorkMarkedForLater(html) {
  if (!html) return false;
  
  // Heuristiques robustes pour détecter l'état "marked"
  return /\/works\/\d+\/unmark/i.test(html) ||        // présence d'un endpoint de "unmark"
         /mark\s*as\s*read/i.test(html) ||            // texte bouton
         /already\s*marked/i.test(html) ||            // message état
         /class=["'][^"']*\bmark\b[^"']*["'][^>]*>[^<]*(Unmark|Unmark for later|Remove)/i.test(html);
}

/**
 * Extrait les statistiques de chapitre depuis la page
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {Object} {chapterIndex, chapterTotal} - Stats des chapitres
 */
export function getChapterStats(doc = document) {
  let idx = 1, total = 1;
  
  // Essayer d'abord les métadonnées du work
  const node = doc.querySelector('.work.meta .chapters, .work.meta dd.chapters, .meta .chapters, dd.chapters');
  if (node) {
    const m = node.textContent.trim().match(/(\d+)\s*\/\s*(\d+|\?)/);
    if (m) { 
      idx = parseInt(m[1], 10) || 1; 
      total = (m[2] === '?' ? 1 : parseInt(m[2], 10) || 1); 
    }
  } else {
    // Fallback : titre de chapitre
    const nav = doc.querySelector('.chapter .title, .chapter .heading, .title.heading');
    const m2 = nav && nav.textContent.match(/chapter\s+(\d+)\s*(?:of\s+(\d+))?/i);
    if (m2) { 
      idx = parseInt(m2[1], 10) || 1; 
      total = parseInt(m2[2], 10) || 1; 
    }
  }
  
  return {
    chapterIndex: idx,
    chapterTotal: Math.max(1, total)
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   BLURB MANIPULATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Trouve le point d'insertion approprié dans un blurb
 * @param {Element} blurb - Élément blurb
 * @returns {Object} {beforeNode, container} - Point d'insertion
 */
export function findBlurbInsertPoint(blurb) {
  if (!blurb) return { beforeNode: null, container: null };
  
  // Priorités d'insertion : stats > datetime > header
  const targets = [
    '.stats',
    '.datetime', 
    '.header'
  ];
  
  for (const selector of targets) {
    const element = blurb.querySelector(selector);
    if (element) {
      return {
        beforeNode: element.nextElementSibling || null,
        container: element.parentElement || blurb
      };
    }
  }
  
  // Fallback : fin du blurb
  return {
    beforeNode: null,
    container: blurb
  };
}

/**
 * Trouve un conteneur approprié pour injecter des éléments dans un blurb
 * Utilisé par quickMarkButton
 * @param {Element} blurb - Élément blurb
 * @returns {Element|null} Conteneur trouvé
 */
export function findBlurbContainer(blurb) {
  if (!blurb) return null;
  
  // Priorités : datetime > heading > fallback premier élément approprié
  const selectors = [
    '.datetime',
    '.stats .datetime', 
    '.header .datetime',
    '.header .heading',
    'h4.heading'
  ];
  
  for (const selector of selectors) {
    const element = blurb.querySelector(selector);
    if (element) return element;
  }
  
  return blurb; // Fallback
}

/**
 * Vérifie si un blurb a déjà une action Mark for Later native d'AO3
 * @param {Element} blurb - Élément blurb à vérifier
 * @returns {boolean} True si MFL existe déjà
 */
export function hasExistingMarkForLater(blurb) {
  if (!blurb) return false;
  return !!blurb.querySelector('a[href*="/mark_for_later"], form[action*="/mark_for_later"]');
}

/* ──────────────────────────────────────────────────────────────────────────
   SCOPE & STORAGE KEYS
─────────────────────────────────────────────────────────────────────────── */

/**
 * Génère une clé de scope basée sur la location actuelle
 * Utilisé pour le stockage par page/tag
 * @param {string} prefix - Préfixe de la clé
 * @param {Location} loc - Location à analyser (défaut: location)
 * @returns {string} Clé de scope générée
 */
export function createScopeKey(prefix, loc = location) {
  if (!prefix || !loc) return null;
  
  const pathname = loc.pathname || '';
  
  // Pour les pages de tags
  const tagMatch = pathname.match(/^\/tags\/([^/]+)\/works\/?$/);
  if (tagMatch) {
    return `${prefix}:tag:${tagMatch[1]}`;
  }
  
  // Pour la page works générale
  if (/^\/works\/?$/.test(pathname)) {
    return `${prefix}:works`;
  }
  
  // Fallback : utiliser le pathname
  return `${prefix}:${pathname}`;
}

/* ──────────────────────────────────────────────────────────────────────────
   URL MANIPULATION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Vérifie si une URL contient les paramètres de recherche désirés
 * @param {URL|string} url - URL à vérifier
 * @param {Object} desiredParams - Paramètres attendus {key: value}
 * @returns {boolean} True si tous les paramètres correspondent
 */
export function urlHasParams(url, desiredParams) {
  if (!url || !desiredParams) return false;
  
  try {
    const urlObj = typeof url === 'string' ? new URL(url, location.origin) : url;
    const searchParams = urlObj.searchParams;
    
    return Object.entries(desiredParams).every(([key, value]) => {
      return searchParams.get(key) === value;
    });
  } catch {
    return false;
  }
}

/**
 * Supprime des paramètres spécifiques d'une URL
 * @param {string} url - URL à nettoyer
 * @param {string[]} keysToRemove - Clés à supprimer
 * @returns {string} URL nettoyée
 */
export function stripUrlParams(url, keysToRemove) {
  if (!url || !keysToRemove || !keysToRemove.length) return url;
  
  try {
    const urlObj = new URL(url, location.origin);
    
    for (const key of keysToRemove) {
      urlObj.searchParams.delete(key);
      
      // Gestion des clés nested work_search[...]
      if (key.startsWith('work_search[')) {
        const inner = key.slice('work_search['.length, -1);
        urlObj.searchParams.delete(`work_search[${inner}]`);
      }
      
      // Supprimer aussi les variations
      for (const [paramKey] of Array.from(urlObj.searchParams)) {
        if (paramKey.includes(key) || key.includes(paramKey)) {
          urlObj.searchParams.delete(paramKey);
        }
      }
    }
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   UTILITIES
─────────────────────────────────────────────────────────────────────────── */

/**
 * Génère des URLs AO3 courantes
 * @param {string} workId - ID du work
 * @returns {Object} URLs générées {work, markForLater, unmarkForLater}
 */
export function createWorkUrls(workId) {
  if (!workId) return { work: null, markForLater: null, unmarkForLater: null };
  
  return {
    work: `/works/${workId}`,
    markForLater: `/works/${workId}/mark_for_later`,
    unmarkForLater: `/works/${workId}/unmark_for_later`
  };
}

/**
 * Trouve tous les blurbs sur une page
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {Element[]} Array des blurbs trouvés
 */
export function findAllBlurbs(doc = document) {
  const selectors = [
    'li[role="article"]',
    '.work.blurb.group',
    '.blurb.work',
    'li.blurb.group'
  ];
  
  const blurbs = new Set();
  
  selectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(blurb => blurbs.add(blurb));
  });
  
  return Array.from(blurbs);
}

/* ──────────────────────────────────────────────────────────────────────────
   FORM ID EXTRACTION
─────────────────────────────────────────────────────────────────────────── */

/**
 * Extrait l'ID de work depuis un formulaire Mark for Later
 * Pattern: /works/123456/mark_for_later
 * @param {HTMLFormElement} formEl - Formulaire à parser
 * @returns {string|null} Work ID ou null
 */
export function getWorkIdFromMarkForLaterForm(formEl) {
  if (!formEl) return null;
  const action = formEl.getAttribute('action') || '';
  const m = action.match(/\/works\/(\d+)\/mark_for_later/);
  return m ? m[1] : null;
}

/**
 * Extrait l'ID de work depuis un formulaire Unmark for Later
 * Pattern: /works/123456/unmark_for_later
 * @param {HTMLFormElement} formEl - Formulaire à parser
 * @returns {string|null} Work ID ou null
 */
export function getWorkIdFromUnmarkForLaterForm(formEl) {
  if (!formEl) return null;
  const action = formEl.getAttribute('action') || '';
  const m = action.match(/\/works\/(\d+)\/unmark_for_later/);
  return m ? m[1] : null;
}

/**
 * Extrait l'ID de work depuis un formulaire Mark as Read
 * Pattern: /works/123456/mark_as_read
 * @param {HTMLFormElement} formEl - Formulaire à parser
 * @returns {string|null} Work ID ou null
 */
export function getWorkIdFromMarkAsReadForm(formEl) {
  if (!formEl) return null;
  const action = formEl.getAttribute('action') || '';
  const m = action.match(/\/works\/(\d+)\/mark_as_read/);
  return m ? m[1] : null;
}

/* ──────────────────────────────────────────────────────────────────────────
   HTML PAGE PARSING
─────────────────────────────────────────────────────────────────────────── */

/**
 * Parse le HTML d'une page /readings?show=to-read pour extraire les work IDs
 * Utilisé par markForLaterStatus pour crawler les pages "Marked for Later"
 * @param {string} htmlString - HTML de la page readings
 * @returns {Object} {ids: Set<workId>, blurbsSeen: number, hasNext: boolean}
 */
export function parseReadingsPageHTML(htmlString) {
  if (!htmlString) return { ids: new Set(), blurbsSeen: 0, hasNext: false };
  
  const tmp = document.createElement('div');
  tmp.innerHTML = htmlString;

  // Trouver la liste principale de works
  const main = tmp.querySelector('#main');
  let list = null;
  if (main) {
    const candidates = main.querySelectorAll('ol.index.group');
    list = candidates[0] || null;
  }

  // Extraire tous les blurbs de works
  const blurbs = list 
    ? Array.from(list.querySelectorAll('li.blurb.work'))
    : [];

  // Extraire les work IDs
  const ids = new Set();
  blurbs.forEach(blurb => {
    const workId = extractWorkIdFromBlurb(blurb);
    if (workId) ids.add(workId);
  });

  // Vérifier s'il y a une page suivante
  const hasNext = !!tmp.querySelector('li.next a, .pagination li.next a');

  return {
    ids,
    blurbsSeen: blurbs.length,
    hasNext
  };
}

/**
 * Parse le HTML d'une page bookmarks pour extraire les work IDs et privacy
 * Utilisé par bookmarkStatus pour crawler les pages de bookmarks
 * @param {string} htmlString - HTML de la page bookmarks
 * @returns {Object} {bookmarks: Array<{workId, isPrivate}>, blurbsSeen: number, hasNext: boolean}
 */
export function parseBookmarksPageHTML(htmlString) {
  if (!htmlString) return { bookmarks: [], blurbsSeen: 0, hasNext: false };
  
  const tmp = document.createElement('div');
  tmp.innerHTML = htmlString;
  
  const blurbNodes = tmp.querySelectorAll('li.bookmark.blurb');
  const bookmarks = [];
  
  blurbNodes.forEach(blurb => {
    const workId = extractWorkIdFromBlurb(blurb);
    if (!workId) return;
    
    // Détecter si le bookmark est privé
    const isPrivate = blurb.classList.contains('private') || 
                     !!blurb.querySelector('.private');
    
    bookmarks.push({ workId, isPrivate });
  });

  // Vérifier s'il y a une page suivante
  const hasNext = !!tmp.querySelector('li.next a, .pagination li.next a');

  return {
    bookmarks,
    blurbsSeen: blurbNodes.length,
    hasNext
  };
}