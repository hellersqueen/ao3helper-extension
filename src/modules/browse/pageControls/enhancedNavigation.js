/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Enhanced Navigation

Adds first, previous, next, last, and optional ten-page jump controls around
each AO3 pagination block.

Notes

- Pagination state and destination URLs come from Core Navigation.
- Invalid, current-page, and out-of-range destinations render as disabled text.
- Ten-page jumps follow the shared Page Controls configuration.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { CoreNavigation as Core } from './coreNavigation.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const WRAP_CLASS = 'ao3h-en-wrap';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ENHANCED PAGINATION CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

function buildEnhancedRow (current, max, showTen) {
  const wrap  = document.createElement('div');
  wrap.className = WRAP_CLASS;

  function btn (label, page, title) {
    const disabled = page < 1 || page > max || page === current;
    const el = document.createElement(disabled ? 'span' : 'a');
    el.className = `ao3h-en-btn${disabled ? ' disabled' : ''}`;
    el.textContent = label;
    el.title = title || label;
    if (!disabled) {
      /** @type {HTMLAnchorElement} */ (el).href = Core.buildPageURL(page);
    }
    return el;
  }

  wrap.appendChild(btn('« First', 1, 'First page'));
  if (showTen) wrap.appendChild(btn('−10', current - 10, `Page ${current - 10}`));
  wrap.appendChild(btn('‹ Prev', current - 1, 'Previous page'));
  const cur       = document.createElement('span');
  cur.className   = 'ao3h-en-current';
  cur.textContent = `${current} / ${max}`;
  wrap.appendChild(cur);
  wrap.appendChild(btn('Next ›', current + 1, 'Next page'));
  if (showTen) wrap.appendChild(btn('+10', current + 10, `Page ${current + 10}`));
  wrap.appendChild(btn('Last »', max, 'Last page'));

  return wrap;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

export class EnhancedNavigation {
  constructor (opts) {
    this._opts    = opts || {};
    this._widgets = [];
  }

  setup () {
    const current  = Core.getCurrentPage();
    const max      = Core.getMaxPage();
    if (max <= 1)  return;

    const showTen  = this._opts.cfg ? this._opts.cfg('showPlusMinus10Buttons') : true;

    document.querySelectorAll('ol.pagination, ul.pagination, .pagination').forEach(pg => {
      if (pg.previousElementSibling?.classList.contains(WRAP_CLASS)) return;
      const row = buildEnhancedRow(current, max, showTen);
      pg.insertAdjacentElement('beforebegin', row);
      this._widgets.push(row);
    });
  }

  teardown () {
    this._widgets.forEach(w => w.remove());
    this._widgets = [];
  }
}
