// AO3 Helper — Core Navigation Submodule
// Submodule ID: pageControls/coreNavigation
// Role: page number input field + current/max detection + URL navigation

// ── URL helpers ───────────────────────────────────────────────────────────
// AO3 pagination uses ?page=N in query string
function getCurrentPage () {
  const m = location.search.match(/[?&]page=(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

function getMaxPage () {
  // Try reading the last page link in .pagination
  const lastLink = document.querySelector('.pagination a[href*="page="]:last-of-type, .pagination li:last-child a[href*="page="]');
  if (lastLink) {
    const m = lastLink.href.match(/[?&]page=(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  // Fallback: read "N-M of X" text
  const heading = document.querySelector('#main .heading');
  if (heading) {
    const m = heading.textContent.match(/of\s+([\d,]+)/);
    if (m) {
      const total   = parseInt(m[1].replace(/,/g, ''), 10);
      const perPage = parseInt(new URL(location.href).searchParams.get('items_per_page') || '20', 10);
      return Math.ceil(total / perPage) || 1;
    }
  }
  return 1;
}

function buildPageURL (pageNum) {
  const url    = new URL(location.href);
  if (pageNum <= 1) url.searchParams.delete('page');
  else              url.searchParams.set('page', pageNum);
  return url.toString();
}

// ── Widget ────────────────────────────────────────────────────────────────
const ROW_CLASS = 'ao3h-jtp-row';
const JTP_CLASS = 'ao3h-jtp';

function buildWidget (current, max) {
  const row   = document.createElement('div');
  row.className = ROW_CLASS;

  const wrap  = document.createElement('span');
  wrap.className = JTP_CLASS;

  const lbl       = document.createElement('span');
  lbl.className   = 'label';
  lbl.textContent = 'Page';

  const input     = document.createElement('input');
  input.type      = 'number';
  input.className = 'pg-input';
  input.value     = current;
  input.min       = 1;
  input.max       = max;
  input.setAttribute('aria-label', `Page number (1–${max})`);

  const sep       = document.createElement('span');
  sep.className   = 'sep';
  sep.textContent = `/ ${max}`;

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    let val = parseInt(input.value, 10);
    if (!isFinite(val) || val < 1)   val = 1;
    if (val > max)                    val = max;
    location.assign(buildPageURL(val));
  });

  input.addEventListener('blur', () => {
    let val = parseInt(input.value, 10);
    if (!isFinite(val) || val < 1)   input.value = 1;
    else if (val > max)              input.value = max;
  });

  wrap.appendChild(lbl);
  wrap.appendChild(input);
  wrap.appendChild(sep);
  row.appendChild(wrap);
  return row;
}

// ── Class ─────────────────────────────────────────────────────────────────
export class CoreNavigation {
  constructor (opts) {
    this._opts     = opts || {};
    this._widgets  = [];
  }

  setup () {
    const current = getCurrentPage();
    const max     = getMaxPage();
    if (max <= 1) return; // no pagination needed

    // Inject below each .pagination block
    document.querySelectorAll('ol.pagination, ul.pagination, .pagination').forEach(pg => {
      if (pg.nextElementSibling?.classList.contains(ROW_CLASS)) return; // already injected
      const widget = buildWidget(current, max);
      pg.insertAdjacentElement('afterend', widget);
      this._widgets.push(widget);
    });
  }

  teardown () {
    this._widgets.forEach(w => w.remove());
    this._widgets = [];
  }

  // Expose helpers for EnhancedNavigation
  static getCurrentPage () { return getCurrentPage(); }
  static getMaxPage ()     { return getMaxPage(); }
  static buildPageURL (n)  { return buildPageURL(n); }
}
