/* ═══════════════════════════════════════════════════════════════════════════
   TOAST - Notification éphémère en bas de page
   Why: 3 implémentations avec 2 jeux de classes CSS concurrents — le style
   des toasts dépendait du module qui les affichait. Classes alignées sur
   `ao3h-toast--<type>` (celles de backupAndSync.css) pour une bascule sans
   changement visuel côté backup-and-sync.

   Les timers sont suivis au niveau du module : appeler clearAllToasts() dans
   le cleanup d'un module suffit à tout nettoyer (pattern _toastTimers de
   dataTransfer, reproduit ici).
═══════════════════════════════════════════════════════════════════════════ */

import { css } from '../utils/index.js';

const timers = new Set();
const toasts = new Set();
let stylesInjected = false;

const TOAST_CSS = `
.ao3h-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100000;
  max-width: 80vw;
  padding: 10px 16px;
  border-radius: 6px;
  background: #333;
  color: #fff;
  font-size: 0.9em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  opacity: 1;
  transition: opacity 0.4s ease;
}
.ao3h-toast--success { background: #2e7d32; }
.ao3h-toast--error   { background: #c62828; }
.ao3h-toast--info    { background: #1565c0; }
`;

function track(fn, delay) {
  const t = setTimeout(() => { timers.delete(t); fn(); }, delay);
  timers.add(t);
  return t;
}

/**
 * Affiche un toast éphémère
 * @param {string} message - Texte du toast
 * @param {{type?: 'info'|'success'|'error', duration?: number}} opts
 * @returns {{dismiss: () => void}} Handle pour fermer le toast plus tôt
 */
export function showToast(message, { type = 'info', duration = 3000 } = {}) {
  if (!stylesInjected) {
    css(TOAST_CSS, 'ao3h-lib-toast');
    stylesInjected = true;
  }
  const el = document.createElement('div');
  el.textContent = message;
  el.className = `ao3h-toast ao3h-toast--${type}`;
  document.body.appendChild(el);
  toasts.add(el);

  const remove = () => { toasts.delete(el); el.remove(); };
  track(() => {
    el.style.opacity = '0';
    track(remove, 400);
  }, duration);

  return { dismiss: remove };
}

/**
 * Supprime immédiatement tous les toasts et annule leurs timers
 * (à appeler dans le cleanup des modules qui affichent des toasts)
 */
export function clearAllToasts() {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  toasts.forEach((el) => el.remove());
  toasts.clear();
}
