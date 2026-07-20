/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Main Navigation › Breadcrumbs

Renders a small breadcrumb trail under the AO3 header, built purely from the
current URL structure (no network requests).

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BREADCRUMB BAR
═══════════════════════════════════════════════════════════════════════════ */

export class Breadcrumbs {
  /**
   * @param {string} NS
   * @param {{ buildBreadcrumbs?: (pathname: string) => { label: string, href: string }[] }} [opts]
   */
  constructor (NS, { buildBreadcrumbs } = {}) {
    this.NS = NS;
    this._el = null;
    this._buildBreadcrumbs = buildBreadcrumbs || (() => []);
  }

  inject () {
    if (this._el) return;
    const crumbs = this._buildBreadcrumbs(location.pathname);
    if (crumbs.length < 2) return;

    const bar = document.createElement('nav');
    bar.className = `${this.NS}-breadcrumbs`;
    bar.setAttribute('aria-label', 'Breadcrumb');

    crumbs.forEach(({ label, href }, index) => {
      if (index > 0) {
        const sep = document.createElement('span');
        sep.className = `${this.NS}-breadcrumbs-sep`;
        sep.textContent = '›';
        bar.appendChild(sep);
      }
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        bar.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.className = `${this.NS}-breadcrumbs-current`;
        span.textContent = label;
        bar.appendChild(span);
      }
    });

    const header = document.querySelector('#header');
    if (header) {
      header.insertAdjacentElement('afterend', bar);
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

// The coordinator calls `inject()` on init and `reset()` during cleanup.
