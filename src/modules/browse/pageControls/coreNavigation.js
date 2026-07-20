/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Core Navigation

Detects the current and final listing pages, builds pagination URLs, and adds
a numeric page-jump field beside each AO3 pagination block.

Notes

- AO3 pagination is represented by the `page` query parameter.
- The maximum page falls back to the listing result count when necessary.
- Pagination state and URL helpers (getCurrentPage/getMaxPage/buildPageURL)
  live in the coordinator and are shared via pageHelpers, since Enhanced
  Navigation and Infinite Scroll need them too.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const ROW_CLASS = 'ao3h-jtp-row';
const JTP_CLASS = 'ao3h-jtp';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PAGE-JUMP WIDGET
═══════════════════════════════════════════════════════════════════════════ */

function buildWidget (current, max, cfg, pageHelpers) {
  const opt = (key, fallback) => (cfg ? cfg(key, fallback) : fallback);
  const { randomPage, percentPage, listingKey, getRecentPages, buildPageURL } = pageHelpers;

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
  input.value     = String(current);
  input.min       = '1';
  input.max       = String(max);
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
    if (!isFinite(val) || val < 1)   input.value = '1';
    else if (val > max)              input.value = String(max);
  });

  wrap.appendChild(lbl);
  wrap.appendChild(input);
  wrap.appendChild(sep);
  row.appendChild(wrap);

  // ── 🎲 Random page ────────────────────────────────────────────────────────
  if (opt('showRandomPageButton', true)) {
    const rnd = document.createElement('a');
    rnd.className   = 'ao3h-jtp-extra ao3h-jtp-random';
    rnd.href        = 'javascript:void(0);';
    rnd.textContent = '🎲';
    rnd.title       = 'Go to a random page';
    rnd.addEventListener('click', e => {
      e.preventDefault();
      location.assign(buildPageURL(randomPage(current, max)));
    });
    row.appendChild(rnd);
  }

  // ── ¼ ½ ¾ percent jumps ───────────────────────────────────────────────────
  if (opt('showPercentJumpButtons', true)) {
    [
      { label: '¼', fraction: 0.25 },
      { label: '½', fraction: 0.5 },
      { label: '¾', fraction: 0.75 },
    ].forEach(({ label, fraction }) => {
      const page = percentPage(fraction, max);
      const el = document.createElement(page === current ? 'span' : 'a');
      el.className   = `ao3h-jtp-extra ao3h-jtp-pct${page === current ? ' disabled' : ''}`;
      el.textContent = label;
      el.title       = `Page ${page} (${Math.round(fraction * 100)}%)`;
      if (page !== current) {
        /** @type {HTMLAnchorElement} */ (el).href = buildPageURL(page);
      }
      row.appendChild(el);
    });
  }

  // ── Recently visited pages of this listing ───────────────────────────────
  if (opt('rememberRecentPages', true)) {
    const recent = getRecentPages(listingKey(location.href)).filter(p => p !== current && p <= max);
    if (recent.length) {
      const recentWrap = document.createElement('span');
      recentWrap.className = 'ao3h-jtp-recent';
      const recentLbl = document.createElement('span');
      recentLbl.className   = 'label';
      recentLbl.textContent = current === 1 ? 'Resume:' : 'Recent:';
      recentWrap.appendChild(recentLbl);
      recent.forEach(p => {
        const a = document.createElement('a');
        a.className   = 'ao3h-jtp-recent-link';
        a.href        = buildPageURL(p);
        a.textContent = String(p);
        a.title       = `Back to page ${p}`;
        recentWrap.appendChild(a);
      });
      row.appendChild(recentWrap);
    }
  }

  return row;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

export class CoreNavigation {
  constructor (opts) {
    this._opts     = opts || {};
    this._widgets  = [];
  }

  setup () {
    const cfg     = this._opts.cfg || null;
    const pageHelpers = this._opts.pageHelpers;
    if (!pageHelpers) return;
    const current = pageHelpers.getCurrentPage();
    const max     = pageHelpers.getMaxPage();
    if (max <= 1) return; // no pagination needed

    // Remember this visit so the widget can offer "resume"/"recent" links
    if (!cfg || cfg('rememberRecentPages', true)) {
      pageHelpers.recordVisit(pageHelpers.listingKey(location.href), current);
    }

    // Inject beside each .pagination block (position is configurable)
    const above = cfg && cfg('pageInputPosition', 'below') === 'above';
    document.querySelectorAll('ol.pagination, ul.pagination, .pagination').forEach(pg => {
      const neighbor = above ? pg.previousElementSibling : pg.nextElementSibling;
      if (neighbor?.classList.contains(ROW_CLASS)) return; // already injected
      const widget = buildWidget(current, max, cfg, pageHelpers);
      pg.insertAdjacentElement(above ? 'beforebegin' : 'afterend', widget);
      this._widgets.push(widget);
    });
  }

  teardown () {
    this._widgets.forEach(w => w.remove());
    this._widgets = [];
  }
}
