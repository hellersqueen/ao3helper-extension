/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BADGE - Badge de statut sur le titre d'un blurb (h4.heading)
   Why: « créer un span classe+emoji+title et l'accrocher au heading » est le
   geste UI le plus répété du projet (~15 copies), avec des gardes anti-doublon
   et une accessibilité incohérentes d'une copie à l'autre.

   Le helper ne gère que la création + garde + insertion. Le contenu (emoji,
   libellé, date) et les éventuels listeners restent chez l'appelant.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ajoute un badge <span> au h4.heading d'un blurb, de façon idempotente.
 * @param {Element} blurb - Le li.blurb cible
 * @param {Object} opts
 * @param {string} opts.className - Classes CSS du badge (la 1re sert de garde)
 * @param {string} opts.text - Contenu texte (emoji / libellé)
 * @param {string} [opts.title] - Tooltip (aussi posé en aria-label)
 * @param {string} [opts.guardSelector] - Sélecteur anti-doublon custom
 *   (défaut : première classe de className)
 * @returns {HTMLSpanElement|null} Le badge créé, ou null si déjà présent /
 *   pas de heading
 */
export function appendHeadingBadge(blurb, { className, text, title = '', guardSelector = null }) {
  if (!blurb) return null;
  const guard = guardSelector || `.${String(className).split(/\s+/)[0]}`;
  if (blurb.querySelector(guard)) return null;
  const heading = blurb.querySelector('h4.heading');
  if (!heading) return null;
  const badge = document.createElement('span');
  badge.className = className;
  badge.textContent = text;
  if (title) {
    badge.title = title;
    badge.setAttribute('aria-label', title);
  }
  heading.appendChild(badge);
  return badge;
}
