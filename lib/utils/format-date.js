/* ═══════════════════════════════════════════════════════════════════════════
   FORMAT DATE - Dates relatives et formats de date lisibles
   Why: 6 implémentations divergentes du « il y a X » coexistaient (jours
   seulement, jours+mois+années, buckets, minutes) — l'utilisateur voyait des
   formats incohérents entre badges. Référence : kudosDisplay (la plus
   complète). ⚠️ Faire converger un module change ses libellés visibles —
   à valider visuellement lors de la bascule.
═══════════════════════════════════════════════════════════════════════════ */

const DAY_MS = 86400000;

/**
 * Libellé relatif : today / yesterday / N days / N months / N years ago
 * (ou, en format court : today / yesterday / Nd ago — pour les badges
 * compacts qui n'ont pas la place pour « months »/« years », ex.
 * statusIndicators/bookmarkMaintenance, shared.md § reste à faire)
 * @param {number|Date} ts - Timestamp ms ou Date
 * @param {{short?: boolean}} [opts]
 * @returns {string|null} Libellé, ou null si ts absent
 */
export function relativeDate(ts, { short = false } = {}) {
  if (!ts) return null;
  const time = ts instanceof Date ? ts.getTime() : ts;
  const diff = Math.round((Date.now() - time) / DAY_MS);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (short) return `${diff}d ago`;
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365) return `${Math.round(diff / 30)} months ago`;
  return `${Math.round(diff / 365)} years ago`;
}

/**
 * Nombre de jours entiers écoulés depuis ts
 * @param {number|Date} ts - Timestamp ms ou Date
 * @returns {number|null}
 */
export function daysAgo(ts) {
  if (!ts) return null;
  const time = ts instanceof Date ? ts.getTime() : ts;
  return Math.floor((Date.now() - time) / DAY_MS);
}

/**
 * Formate une date en libellé long / court / relatif
 * (reprend kudosDisplay._formatDate : les dates « YYYY-MM-DD » sont ancrées
 * à minuit local pour éviter le décalage UTC)
 * @param {string|number|Date} input - Date à formater
 * @param {'long'|'short'|'relative'} format - Format voulu (défaut: 'long')
 * @returns {string}
 */
export function formatDate(input, format = 'long') {
  try {
    const d = typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)
      ? new Date(input + 'T00:00:00')
      : new Date(input);
    if (format === 'short') return d.toLocaleDateString('en-CA');
    if (format === 'relative') return relativeDate(d) ?? '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return String(input);
  }
}
