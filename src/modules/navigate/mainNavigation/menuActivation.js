/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Main Navigation › Menu Activation

Applies hover- or click-based behavior to AO3's primary navigation menus.

Notes

- Click mode closes sibling menus and dismisses open menus on outside clicks.
- Event listeners are scoped to an abort controller for reliable cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// No imports required.

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

// Menu state is stored on each helper instance.

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — MENU ACTIVATION MODE
═══════════════════════════════════════════════════════════════════════════ */

export class MenuActivation {
  constructor(NS) {
    this.NS = NS;
    this._menuItems = [];
    this._clickAbort = null;
  }

  apply(mode) {
    const NS = this.NS;

    this._menuItems = Array.from(document.querySelectorAll('#header .primary.navigation > li'));
    const clickOnly = mode === 'click';
    document.documentElement.classList.toggle(`${NS}-no-hover-menu`, clickOnly);

    if (clickOnly) {
      this._clickAbort = new AbortController();
      const signal = this._clickAbort.signal;
      const menuItems = this._menuItems;
      menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (!link || !item.querySelector('ul, div')) return;
        link.addEventListener('click', (e) => {
          if (item.querySelector('ul, div')) {
            e.preventDefault();
            item.classList.toggle('open');
            menuItems.forEach(other => { if (other !== item) other.classList.remove('open'); });
          }
        }, { signal });
      });
      document.addEventListener('click', (e) => {
        if (!/** @type {HTMLElement} */ (e.target).closest('#header .primary.navigation')) {
          menuItems.forEach(item => item.classList.remove('open'));
        }
      }, { signal });
    } else {
      this._menuItems.forEach(item => item.classList.remove('open'));
    }
  }

  reset() {
    this._clickAbort?.abort();
    this._clickAbort = null;
    document.documentElement.classList.remove(`${this.NS}-no-hover-menu`);
    this._menuItems.forEach(item => item.classList.remove('open'));
    this._menuItems = [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// The coordinator applies the selected mode and calls `reset()` on cleanup.
