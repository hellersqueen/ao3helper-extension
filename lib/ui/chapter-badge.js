/* ═══════════════════════════════════════════════════════════════════════════
   CHAPTER BADGE — badge partagé sous le titre d'un chapitre
   Why: chapterWordCount (reading) et readingTime (browse/workLength)
   injectaient chacun leur propre badge au même endroit (après le titre du
   chapitre) — « ~5.2K words in this chapter » et « (20 min read) » côte à
   côte quand les deux modules sont actifs. Décision produit (shared.md,
   section Z2) : un seul badge, chaque module y contribue sa propre partie.
   Ni l'un ni l'autre n'a besoin de connaître les réglages de l'autre — le
   badge se construit/se défait tout seul selon qui contribue quoi.
   ⚠️ Non testé en conditions réelles sur AO3 — voir shared.md § reste à faire.
═══════════════════════════════════════════════════════════════════════════ */

const CLASS = 'ao3h-chapter-badge';
const ORDER = ['words', 'time']; // ordre d'affichage stable, indépendant de l'ordre d'injection
const partsByBadge = new WeakMap();

function render(badge) {
  const parts = partsByBadge.get(badge);
  badge.textContent = ORDER.filter(k => parts.has(k)).map(k => parts.get(k)).join(' · ');
}

/**
 * Ajoute/actualise la partie `partKey` (ex. 'words' ou 'time') du badge
 * inséré juste après `afterEl`. Crée le badge s'il n'existe pas encore.
 * @param {Element} afterEl - élément après lequel le badge doit se trouver
 * @param {string} partKey
 * @param {string} text
 */
export function upsertChapterBadgePart(afterEl, partKey, text) {
  if (!afterEl) return null;
  let badge = afterEl.nextElementSibling;
  if (!badge?.classList?.contains(CLASS)) {
    badge = document.createElement('div');
    badge.className = CLASS;
    afterEl.insertAdjacentElement('afterend', badge);
  }
  if (!partsByBadge.has(badge)) partsByBadge.set(badge, new Map());
  partsByBadge.get(badge).set(partKey, text);
  render(badge);
  return badge;
}

/**
 * Retire la partie `partKey` de tous les badges du document (cleanup d'un
 * module). Supprime le badge entier si plus aucune partie n'y reste.
 * @param {string} partKey
 */
export function removeChapterBadgePartsByKey(partKey) {
  document.querySelectorAll(`.${CLASS}`).forEach(badge => {
    const parts = partsByBadge.get(badge);
    if (!parts) { badge.remove(); return; }
    parts.delete(partKey);
    if (parts.size === 0) {
      partsByBadge.delete(badge);
      badge.remove();
    } else {
      render(badge);
    }
  });
}
