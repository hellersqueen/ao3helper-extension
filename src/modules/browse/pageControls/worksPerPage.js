/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Works Per Page

Persists a preferred listing density, applies it when AO3 has no explicit
override, and adds a selector for 20, 50, or 100 works per page.

Notes

- AO3 represents listing density with the `items_per_page` query parameter.
- Changing density resets pagination to the first page.
- Explicit URL values take precedence over the saved preference on page load.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { lsGet, lsSet } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const SK_WPP      = 'ao3h:pc:worksPerPage';
const VALID_WPP   = [20, 50, 100];
const DEFAULT_WPP = 20;
const WIDGET_ID   = 'ao3h-wpp-selector';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SAVED LISTING DENSITY
═══════════════════════════════════════════════════════════════════════════ */

// AO3 uses ?items_per_page=N
function buildURL (n) {
  const url = new URL(location.href);
  url.searchParams.set('items_per_page', n);
  url.searchParams.delete('page'); // reset to page 1
  return url.toString();
}

function getSaved () {
  const v = lsGet(SK_WPP);
  return VALID_WPP.includes(v) ? v : DEFAULT_WPP;
}

// Apply saved preference on page load if URL doesn't already specify it
function applyOnLoad () {
  const urlParam = new URL(location.href).searchParams.get('items_per_page');
  if (urlParam !== null) return; // user or link already specified it — don't override
  const saved = getSaved();
  if (saved !== DEFAULT_WPP) location.replace(buildURL(saved));
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — WORKS-PER-PAGE SELECTOR
═══════════════════════════════════════════════════════════════════════════ */

function buildWidget () {
  const current = parseInt(new URL(location.href).searchParams.get('items_per_page') || '20', 10);
  const saved   = getSaved();
  const active  = VALID_WPP.includes(current) ? current : saved;

  const wrap      = document.createElement('div');
  wrap.id         = WIDGET_ID;
  wrap.className  = 'ao3h-wpp-wrap';

  const lbl       = document.createElement('span');
  lbl.className   = 'ao3h-wpp-label';
  lbl.textContent = 'Per page:';
  wrap.appendChild(lbl);

  VALID_WPP.forEach(n => {
    const btn       = document.createElement('a');
    btn.className   = `ao3h-wpp-btn${n === active ? ' active' : ''}`;
    btn.textContent = String(n);
    btn.href        = buildURL(n);
    btn.title       = `Show ${n} works per page`;
    btn.addEventListener('click', e => {
      e.preventDefault();
      lsSet(SK_WPP, n);
      location.assign(buildURL(n));
    });
    wrap.appendChild(btn);
  });

  return wrap;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

export class WorksPerPage {
  constructor (opts) {
    this._opts   = opts || {};
    this._widget = null;
  }

  setup () {
    applyOnLoad();

    // Inject widget near the top of the works listing
    if (document.getElementById(WIDGET_ID)) return;
    const anchor = document.querySelector('#main .heading, #main h2.heading, #main .works-index, ol.work.index');
    if (!anchor) return;
    this._widget = buildWidget();
    anchor.insertAdjacentElement('beforebegin', this._widget);
  }

  teardown () {
    this._widget?.remove();
    this._widget = null;
  }
}
