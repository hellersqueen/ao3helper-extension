/* ═══════════════════════════════════════════════════════════════════════════
   WORK STATS - Lecture des statistiques d'un work (kudos, hits, mots…)
   Why: 5 techniques divergentes coexistaient dans les modules (dd.kudos avec
   parseInt, regex sur textContent, retours 0 vs null…). Ici : une seule
   connaissance du DOM AO3 (dl.stats), et parseStatNumber retourne null en cas
   d'absence — l'appelant décide de son défaut (`?? 0`).
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Parse le nombre d'un nœud de stat AO3 (retire les virgules)
 * @param {Element|string|null} source - Nœud dd.* ou texte (« 1,234 »)
 * @returns {number|null} Nombre, ou null si absent/illisible
 */
export function parseStatNumber(source) {
  if (source == null) return null;
  const text = typeof source === 'string' ? source : (source.textContent || '');
  const m = text.replace(/,/g, '').match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

/**
 * Lit les statistiques d'un blurb de listing (dl.stats)
 * @param {Element} blurb - Élément li.blurb
 * @returns {{kudos: number|null, hits: number|null, bookmarks: number|null,
 *            comments: number|null, words: number|null}}
 */
export function getBlurbStats(blurb) {
  const q = (sel) => blurb?.querySelector?.(sel) ?? null;
  return {
    kudos:     parseStatNumber(q('dl.stats dd.kudos, dd.kudos')),
    hits:      parseStatNumber(q('dl.stats dd.hits, dd.hits')),
    bookmarks: parseStatNumber(q('dl.stats dd.bookmarks, dd.bookmarks')),
    comments:  parseStatNumber(q('dl.stats dd.comments, dd.comments')),
    words:     parseStatNumber(q('dl.stats dd.words, dd.words')),
  };
}

/**
 * Lit les statistiques depuis la page d'un work (bloc .work.meta)
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {{kudos: number|null, hits: number|null, bookmarks: number|null,
 *            comments: number|null, words: number|null}}
 */
export function getWorkPageStats(doc = document) {
  const q = (sel) => doc.querySelector(sel);
  return {
    kudos:     parseStatNumber(q('dl.stats dd.kudos')),
    hits:      parseStatNumber(q('dl.stats dd.hits')),
    bookmarks: parseStatNumber(q('dl.stats dd.bookmarks')),
    comments:  parseStatNumber(q('dl.stats dd.comments')),
    words:     parseStatNumber(q('dl.stats dd.words')),
  };
}
