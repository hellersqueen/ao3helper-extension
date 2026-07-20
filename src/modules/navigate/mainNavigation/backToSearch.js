/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Main Navigation › Back To Search

Remembers the last listing/search page visited (full URL, filters included)
and offers a "← Back to search" link on work pages.

Notes

- The origin URL is kept in sessionStorage: it is per-tab and vanishes with
  the session, which matches how a "return to my search" gesture works.
- Nothing is shown when no listing page was visited in this tab.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { isWorkPage } from '../../../../lib/ao3/parsers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const SS_KEY = 'ao3h:nav:lastSearchUrl';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BACK-TO-SEARCH LINK
═══════════════════════════════════════════════════════════════════════════ */

export class BackToSearch {
  /**
   * @param {string} NS
   * @param {{ isSearchOrigin?: (url: string) => boolean }} [opts]
   */
  constructor (NS, { isSearchOrigin } = {}) {
    this.NS = NS;
    this._el = null;
    this._isSearchOrigin = isSearchOrigin || (() => false);
  }

  /** Record the current page as a search origin, or inject the link on works. */
  apply () {
    const current = location.pathname + location.search;
    if (this._isSearchOrigin(current)) {
      try { sessionStorage.setItem(SS_KEY, current); } catch { /* storage off */ }
      return;
    }
    if (!isWorkPage()) return;

    let saved = null;
    try { saved = sessionStorage.getItem(SS_KEY); } catch { /* storage off */ }
    if (!saved || !this._isSearchOrigin(saved)) return;

    const bar = document.createElement('div');
    bar.className = `${this.NS}-back-to-search`;
    const a = document.createElement('a');
    a.href = saved;
    a.textContent = '← Back to search';
    a.title = 'Return to the results page you came from, filters intact';
    bar.appendChild(a);

    const anchor = document.querySelector('#workskin') || document.querySelector('#main');
    if (anchor) {
      anchor.insertAdjacentElement('beforebegin', bar);
      this._el = bar;
    }
  }

  reset () {
    this._el?.remove();
    this._el = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// The coordinator calls `apply()` on init and `reset()` during cleanup.
