/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Main Navigation › Menu Activation

Applies hover- or click-based behavior to AO3's primary navigation menus, and
provides arrow-key navigation between and inside them.

Notes

- Click mode closes sibling menus and dismisses open menus on outside clicks.
- Arrow keys move focus between top-level items (←/→) and within an open
  dropdown (↑/↓); Escape closes the open menu. Active in both modes.
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
    this._keyAbort = null;
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

    this._applyKeyboardNav();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — ARROW-KEY MENU NAVIGATION
  ═════════════════════════════════════════════════════════════════════════ */

  _applyKeyboardNav() {
    this._keyAbort = new AbortController();
    const { signal } = this._keyAbort;
    const menuItems = this._menuItems;

    document.addEventListener('keydown', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (!target?.closest?.('#header .primary.navigation')) return;

      const currentItem = target.closest('#header .primary.navigation > li');
      if (!currentItem) return;
      const idx = menuItems.indexOf(/** @type {*} */ (currentItem));
      if (idx === -1) return;

      const topLink = (item) => item.querySelector(':scope > a');
      const subLinks = (item) => Array.from(item.querySelectorAll(':scope ul a, :scope div a'));

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 1 : -1;
        const next = menuItems[(idx + delta + menuItems.length) % menuItems.length];
        currentItem.classList.remove('open');
        topLink(next)?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const links = subLinks(currentItem);
        if (!links.length) return;
        currentItem.classList.add('open');
        const pos = links.indexOf(target);
        links[pos === -1 ? 0 : Math.min(pos + 1, links.length - 1)].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const links = subLinks(currentItem);
        const pos = links.indexOf(target);
        if (pos > 0) links[pos - 1].focus();
        else topLink(currentItem)?.focus();
      } else if (e.key === 'Escape') {
        currentItem.classList.remove('open');
        topLink(currentItem)?.focus();
      }
    }, { signal });
  }

  reset() {
    this._clickAbort?.abort();
    this._clickAbort = null;
    this._keyAbort?.abort();
    this._keyAbort = null;
    document.documentElement.classList.remove(`${this.NS}-no-hover-menu`);
    this._menuItems.forEach(item => item.classList.remove('open'));
    this._menuItems = [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// The coordinator applies the selected mode and calls `reset()` on cleanup.
