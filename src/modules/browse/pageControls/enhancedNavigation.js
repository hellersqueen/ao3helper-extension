// AO3 Helper — Enhanced Navigation Submodule
// Submodule ID: pageControls/enhancedNavigation
// Role: ±10 page buttons + First/Last page links, injected top & bottom

import { CoreNavigation as Core } from './coreNavigation.js';

const WRAP_CLASS = 'ao3h-en-wrap';

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
      el.href = Core.buildPageURL(page);
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

// ── Class ─────────────────────────────────────────────────────────────────
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
