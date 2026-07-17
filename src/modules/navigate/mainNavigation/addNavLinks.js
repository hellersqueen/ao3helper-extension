/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Main Navigation › Add Navigation Links

Adds authenticated-user shortcuts for Bookmarks, Marked for Later, and History
to AO3's primary header navigation.

Notes

- No links are injected when the current AO3 username is unavailable.
- The injected navigation slot is removed by `reset()`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// No imports required.

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const LINKS = [
  { label: '🔖 Bookmarks',        path: u => `/users/${encodeURIComponent(u)}/bookmarks` },
  { label: '📌 Marked for Later', path: u => `/users/${encodeURIComponent(u)}/bookmarks?show=to-read` },
  { label: '📚 History',          path: u => `/users/${encodeURIComponent(u)}/readings` },
];

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — NAVIGATION LINK INJECTION
═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// The coordinator creates this helper and calls `reset()` during cleanup.
