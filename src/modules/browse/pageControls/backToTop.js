/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Back To Top

Adds a floating button that appears after scrolling past a threshold and
smooth-scrolls back to the top of the page on click.

Notes

- The button is hidden until the page has been scrolled past the threshold.
- Scroll listening uses a passive listener; no debounce is needed since the
  handler only toggles a class/display, no layout-heavy work.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const SHOW_AFTER_PX = 400;


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

export class BackToTop {
  constructor (opts) {
    this._opts = opts || {};
    this._btn = null;
    this._onScroll = null;
  }

  setup () {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ao3h-pc-backtotop';
    btn.textContent = '↑';
    btn.title = 'Back to top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    this._btn = btn;

    this._onScroll = () => {
      const visible = window.scrollY > SHOW_AFTER_PX;
      btn.classList.toggle('ao3h-pc-backtotop--visible', visible);
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._onScroll();
  }

  teardown () {
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll);
      this._onScroll = null;
    }
    this._btn?.remove();
    this._btn = null;
  }
}
