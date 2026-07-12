// AO3 Helper — Quick Links Submodule
// Submodule ID: mainNavigation/quickLinks

const STORAGE_KEY = 'ao3h:mod:mainNavigation:quickLinks';
const STORAGE_KEY_LEGACY = 'ao3h_main_nav_quick_links';
const MAX_LINKS = 5;

function isSafeHref(href) {
  try {
    const url = new URL(href, location.href);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch { return false; }
}

export class QuickLinks {
  constructor(NS, settings = {}) {
    this.NS = NS;
    this.settings = settings;
    this._el = null;
  }

  static migrateLegacySettings(settings = {}) {
    if (settings.quickLink1Label || settings.quickLink1Url) return null;
    try {
      const sourceKey = localStorage.getItem(STORAGE_KEY) ? STORAGE_KEY : STORAGE_KEY_LEGACY;
      const links = JSON.parse(localStorage.getItem(sourceKey) || '[]');
      if (!Array.isArray(links) || !links.length) return null;
      const patch = {};
      links.slice(0, MAX_LINKS).forEach((link, index) => {
        patch[`quickLink${index + 1}Label`] = String(link?.label || '');
        patch[`quickLink${index + 1}Url`] = String(link?.href || '');
      });
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_LEGACY);
      return patch;
    } catch { return null; }
  }

  getLinks() {
    const links = [];
    for (let index = 1; index <= MAX_LINKS; index += 1) {
      links.push({
        label: this.settings[`quickLink${index}Label`],
        href: this.settings[`quickLink${index}Url`],
      });
    }
    return links;
  }

  inject(headerUL) {
    if (this._el) return;
    const links = this.getLinks().filter(l => l && l.label && l.href && isSafeHref(l.href));
    if (!links.length) return;

    const slot = document.createElement('li');
    slot.className = `${this.NS}-quick-links`;

    links.forEach(({ label, href }) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      slot.appendChild(a);
    });

    headerUL.appendChild(slot);
    this._el = slot;
  }

  reset() {
    this._el?.remove();
    this._el = null;
  }
}
