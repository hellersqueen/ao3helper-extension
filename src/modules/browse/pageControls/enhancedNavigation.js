/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Enhanced Navigation

Adds first, previous, next, last, and optional ten-page jump controls around
each AO3 pagination block.

Notes

- Pagination state and destination URLs come from the coordinator's shared
  pageHelpers (getCurrentPage/getMaxPage/buildPageURL).
- Invalid, current-page, and out-of-range destinations render as disabled text.
- Ten-page jumps follow the shared Page Controls configuration.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const WRAP_CLASS = 'ao3h-en-wrap';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ENHANCED PAGINATION CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

export function buildEnhancedRow (current, max, opts = {}) {
  const {
    showStep    = true,   // small quick-jump buttons (historic ±10)
    step        = 10,     // configurable small jump
    showBigStep = false,  // big quick-jump buttons
    bigStep     = 50,     // configurable big jump
    progressBar = true,   // thin position bar under the row
    buildPageURL = (page) => `?page=${page}`, // overridden by pageHelpers in real use
  } = opts;

  const wrap  = document.createElement('div');
  wrap.className = WRAP_CLASS;

  function btn (label, page, title) {
    const disabled = page < 1 || page > max || page === current;
    const el = document.createElement(disabled ? 'span' : 'a');
    el.className = `ao3h-en-btn${disabled ? ' disabled' : ''}`;
    el.textContent = label;
    el.title = title || label;
    if (!disabled) {
      /** @type {HTMLAnchorElement} */ (el).href = buildPageURL(page);
    }
    return el;
  }

  wrap.appendChild(btn('« First', 1, 'First page'));
  if (showBigStep) wrap.appendChild(btn(`−${bigStep}`, current - bigStep, `Page ${current - bigStep}`));
  if (showStep)    wrap.appendChild(btn(`−${step}`, current - step, `Page ${current - step}`));
  wrap.appendChild(btn('‹ Prev', current - 1, 'Previous page'));
  const cur       = document.createElement('span');
  cur.className   = 'ao3h-en-current';
  cur.textContent = `${current} / ${max}`;
  wrap.appendChild(cur);
  wrap.appendChild(btn('Next ›', current + 1, 'Next page'));
  if (showStep)    wrap.appendChild(btn(`+${step}`, current + step, `Page ${current + step}`));
  if (showBigStep) wrap.appendChild(btn(`+${bigStep}`, current + bigStep, `Page ${current + bigStep}`));
  wrap.appendChild(btn('Last »', max, 'Last page'));

  // Thin visual bar showing where the current page sits in the listing
  if (progressBar) {
    const track = document.createElement('div');
    track.className = 'ao3h-en-progress';
    const fill = document.createElement('div');
    fill.className = 'ao3h-en-progress-fill';
    fill.style.width = `${Math.round((current / Math.max(max, 1)) * 100)}%`;
    track.title = `Page ${current} of ${max}`;
    track.appendChild(fill);
    wrap.appendChild(track);
  }

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
    const pageHelpers = this._opts.pageHelpers;
    if (!pageHelpers) return;
    const current  = pageHelpers.getCurrentPage();
    const max      = pageHelpers.getMaxPage();
    if (max <= 1)  return;

    const cfg  = this._opts.cfg || null;
    const normalizeStep = this._opts.normalizeStep || ((value, fallback) => fallback);
    const opts = {
      showStep:    cfg ? cfg('showPlusMinus10Buttons', true) : true,
      step:        normalizeStep(cfg ? cfg('quickJumpStep', 10) : 10, 10),
      showBigStep: cfg ? cfg('showBigJumpButtons', false) : false,
      bigStep:     normalizeStep(cfg ? cfg('bigJumpStep', 50) : 50, 50),
      progressBar: cfg ? cfg('showPaginationProgressBar', true) : true,
      buildPageURL: pageHelpers.buildPageURL,
    };
    const sticky = cfg ? cfg('stickyEnhancedNav', false) : false;

    let first = true;
    document.querySelectorAll('ol.pagination, ul.pagination, .pagination').forEach(pg => {
      if (pg.previousElementSibling?.classList.contains(WRAP_CLASS)) return;
      const row = buildEnhancedRow(current, max, opts);
      // Only the top row sticks — a sticky bottom bar would cover the list
      if (sticky && first) row.classList.add('ao3h-en-wrap--sticky');
      first = false;
      pg.insertAdjacentElement('beforebegin', row);
      this._widgets.push(row);
    });
  }

  teardown () {
    this._widgets.forEach(w => w.remove());
    this._widgets = [];
  }
}
