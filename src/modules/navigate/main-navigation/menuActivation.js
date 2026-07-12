// AO3 Helper — Menu Activation Submodule
// Submodule ID: mainNavigation/menuActivation

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
        if (!e.target.closest('#header .primary.navigation')) {
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
