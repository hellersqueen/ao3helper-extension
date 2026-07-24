// Help tooltips — wires the "?" button next to a setting that has a
// description, replacing the inline .ao3h-setting-description text with a
// floating tooltip shown on demand. Styling lives in panel.css (see "TOOLTIPS
// D'AIDE (?)"); this file provides the behavior it was written for but never
// had — window.AO3H_wireHelpButtons was referenced from panel-tab-system.js
// since the first commit but never implemented anywhere.
//
// Idempotent: each wired .ao3h-setting-item is marked [data-help-wired] (this
// is also what panel.css keys off to hide the now-redundant inline text), so
// calling wireHelpButtons() again on the same container is a no-op for items
// already converted.

const CLOSE_FADE_MS = 400; // matches the .ao3h-help-tooltip--closing transition in panel.css

let openTooltip = null;
let openAnchor = null;
let outsideClickHandler = null;

function closeOpenTooltip() {
  if (!openTooltip) return;
  const tip = openTooltip;
  openTooltip = null;
  openAnchor = null;
  if (outsideClickHandler) {
    document.removeEventListener('click', outsideClickHandler, true);
    outsideClickHandler = null;
  }
  tip.classList.add('ao3h-help-tooltip--closing');
  setTimeout(() => tip.remove(), CLOSE_FADE_MS);
}

function showTooltip(anchor, text) {
  const reopeningSameAnchor = openAnchor === anchor;
  closeOpenTooltip();
  if (reopeningSameAnchor) return; // clicking the same "?" again just closes it

  const tip = document.createElement('div');
  tip.className = 'ao3h-help-tooltip';
  tip.textContent = text;
  document.body.appendChild(tip);
  openTooltip = tip;
  openAnchor = anchor;

  const r = anchor.getBoundingClientRect();
  tip.style.left = `${r.left}px`;
  tip.style.top = `${r.bottom + 6}px`;

  requestAnimationFrame(() => {
    const tr = tip.getBoundingClientRect();
    if (tr.right > window.innerWidth - 8) tip.style.left = `${Math.max(8, window.innerWidth - tr.width - 8)}px`;
    if (tr.bottom > window.innerHeight - 8) tip.style.top = `${r.top - tr.height - 6}px`;
  });

  outsideClickHandler = (e) => {
    if (!tip.contains(e.target) && e.target !== anchor) closeOpenTooltip();
  };
  setTimeout(() => document.addEventListener('click', outsideClickHandler, true), 0);
}

/**
 * Convert each setting's inline description into a "?" button + on-demand
 * floating tooltip, within the given container.
 * @param {Element} container - a module's .ao3h-module-config-area (or any ancestor)
 */
export function wireHelpButtons(container) {
  if (!container) return;

  container.querySelectorAll('.ao3h-setting-item:not([data-help-wired])').forEach((item) => {
    const desc = item.querySelector('.ao3h-setting-description');
    const text = desc?.textContent.trim();
    if (!text) return;

    // Radio/checkbox groups have a dedicated .ao3h-setting-label; a lone
    // checkbox setting instead has its text inside a native <label> nested
    // in .ao3h-setting-control. Anchor the "?" right after whichever exists.
    const anchor = item.querySelector('.ao3h-setting-label') || item.querySelector('.ao3h-setting-control label');
    if (!anchor) return;

    item.setAttribute('data-help-wired', '1');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ao3h-help-btn';
    btn.textContent = '?';
    btn.setAttribute('aria-label', `Help: ${text}`);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showTooltip(btn, text);
    });

    anchor.insertAdjacentElement('afterend', btn);
  });
}
