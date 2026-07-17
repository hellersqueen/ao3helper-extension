/* ═══════════════════════════════════════════════════════════════════════════
   ENGAGEMENT BADGE — badge de ratio kudos÷hits partagé
   Why: ficEngagement (browse) et resultsSorting (explore/searchEnhancer)
   affichaient chacun leur propre badge de ratio kudos÷hits sur les mêmes
   blurbs, avec des libellés, seuils et parseurs différents (shared.md,
   décision produit O3). Source unique désormais : chaque module vérifie la
   présence du badge de l'autre (classe ao3h-engagement-badge--ratio) avant
   d'en injecter un second.
   ⚠️ Non testé en conditions réelles sur AO3 — voir shared.md § reste à faire.
═══════════════════════════════════════════════════════════════════════════ */

export const ENGAGEMENT_BADGE_CLASS = 'ao3h-engagement-badge';
export const RATIO_BADGE_CLASS      = 'ao3h-engagement-badge--ratio';

/**
 * @param {{kudos: number|null, hits: number|null}} stats
 * @param {{colorCode?: boolean}} [opts]
 * @returns {HTMLElement|null} badge <span>, ou null si hits/kudos indisponibles
 */
export function buildKudosRatioBadge(stats, { colorCode = false } = {}) {
  const { kudos, hits } = stats;
  if (kudos == null || !hits) return null;
  const ratio = (kudos / hits) * 100;

  const badge = document.createElement('span');
  badge.className = `${ENGAGEMENT_BADGE_CLASS} ${RATIO_BADGE_CLASS}`;
  if (colorCode) {
    badge.classList.add(ratio >= 20 ? 'ao3h-metric-high' : ratio >= 8 ? 'ao3h-metric-mid' : 'ao3h-metric-low');
  }
  badge.textContent = `${ratio.toFixed(1)}% ❤️/👁️`;
  badge.title = `${kudos.toLocaleString()} kudos / ${hits.toLocaleString()} hits`;
  return badge;
}
