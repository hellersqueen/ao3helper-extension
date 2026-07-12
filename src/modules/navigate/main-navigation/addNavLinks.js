// AO3 Helper — Add Nav Links Submodule
// Submodule ID: mainNavigation/addNavLinks

const LINKS = [
  { label: '🔖 Bookmarks',        path: u => `/users/${encodeURIComponent(u)}/bookmarks` },
  { label: '📌 Marked for Later', path: u => `/users/${encodeURIComponent(u)}/bookmarks?show=to-read` },
  { label: '📚 History',          path: u => `/users/${encodeURIComponent(u)}/readings` },
];

export class AddNavLinks {
  constructor(NS) {
    this.NS = NS;
    this._el = null;
  }

  inject(headerUL, user) {
    if (this._el) return;
    const slot = document.createElement('li');
    slot.className = `${this.NS}-add-nav-links`;

    LINKS.forEach(({ label, path }) => {
      const resolvedHref = user ? path(user) : null;
      if (!resolvedHref) return;
      const a = document.createElement('a');
      a.href = resolvedHref;
      a.textContent = label;
      slot.appendChild(a);
    });

    if (!slot.children.length) return;
    headerUL.appendChild(slot);
    this._el = slot;
  }

  reset() {
    this._el?.remove();
    this._el = null;
  }
}
