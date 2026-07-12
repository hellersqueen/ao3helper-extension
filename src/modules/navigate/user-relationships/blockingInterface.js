/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Blocking Interface Submodule
    Submodule ID: blockingInterface
    Parent: userRelationships
    Display Name: Blocking Interface

    - Feature: Right-click context menu blocking
      - Option: Right-click on usernames to block
      - Option: "Block this user" context menu option
      - Option: "Unblock {username}" for blocked users
      - Option: Instant blocking from any username link
      - Option: Works on author links (rel="author")
      - Option: Works on user profile links (/users/)

    - Feature: User blocking
      - Option: Add users to blocked list
      - Option: Case-insensitive username matching
      - Option: Set storage with blocked users array
      - Option: Storage key: `userBlocker:list`

    - Feature: User unblocking
      - Option: Remove users from blocked list
      - Option: Reprocess page to show content
      - Option: Update storage after unblock

    - Feature: Context menu UI
      - Option: Custom context menu on right-click
      - Option: Fixed positioning at cursor
      - Option: White background with shadow
      - Option: Hover effects on menu items
      - Option: Close menu on outside click

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';

const STORAGE_KEY = 'userBlocker:list';
const MENU_CLASS  = 'ao3h-user-context-menu';

class BlockingInterface {
  constructor() {
    this._blockedUsers   = new Set();
    this._boundOnContext = this._onContextMenu.bind(this);
    this._boundOnClick   = this._onDocClick.bind(this);
    this._clickTimer     = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  init() {
    this._loadList();
    document.addEventListener('contextmenu', this._boundOnContext);
  }

  isBlocked(username) {
    return this._blockedUsers.has(username.toLowerCase());
  }

  block(username) {
    const key = username.toLowerCase();
    if (this._blockedUsers.has(key)) return false;
    this._blockedUsers.add(key);
    this._saveList();
    this._dispatch('ao3h:blocking-changed', { action: 'block', username: key });
    return true;
  }

  unblock(username) {
    const key = username.toLowerCase();
    if (!this._blockedUsers.has(key)) return false;
    this._blockedUsers.delete(key);
    this._saveList();
    this._dispatch('ao3h:blocking-changed', { action: 'unblock', username: key });
    return true;
  }

  getList() {
    return Array.from(this._blockedUsers);
  }

  cleanup() {
    document.removeEventListener('contextmenu', this._boundOnContext);
    document.removeEventListener('click', this._boundOnClick);
    clearTimeout(this._clickTimer);
    this._clickTimer = null;
    this._removeMenu();
  }

  // ── Storage ──────────────────────────────────────────────────────────────

  _loadList() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      this._blockedUsers = new Set(arr.map(u => String(u).toLowerCase()));
    } catch (_) {
      this._blockedUsers = new Set();
    }
  }

  _saveList() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this._blockedUsers)));
    } catch (_) {}
  }

  // ── Context menu ─────────────────────────────────────────────────────────

  _onContextMenu(e) {
    const link = e.target.closest('a[rel="author"], a[href*="/users/"]');
    if (!link) return;

    const username = this._usernameFromLink(link);
    if (!username) return;

    e.preventDefault();
    this._showMenu(e.clientX, e.clientY, username);
  }

  _usernameFromLink(link) {
    const match = (link.href || '').match(/\/users\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  _showMenu(x, y, username) {
    this._removeMenu();

    const menu = document.createElement('div');
    menu.className = MENU_CLASS;
    Object.assign(menu.style, {
      left: `${Math.min(x, window.innerWidth - 180)}px`,
      top:  `${Math.min(y, window.innerHeight - 60)}px`,
    });

    const blocked = this.isBlocked(username);
    const label   = blocked ? `Unblock ${username}` : `Block ${username}`;

    const item = document.createElement('div');
    item.textContent = label;
    item.className   = `${MENU_CLASS}-item`;
    item.style.color = blocked ? '#0d6efd' : '#dc3545';
    item.addEventListener('click', () => {
      blocked ? this.unblock(username) : this.block(username);
      this._removeMenu();
    });

    menu.appendChild(item);
    document.body.appendChild(menu);

    // Close when clicking outside
    clearTimeout(this._clickTimer);
    this._clickTimer = setTimeout(() => {
      this._clickTimer = null;
      document.addEventListener('click', this._boundOnClick);
    }, 0);
  }

  _onDocClick(e) {
    const menu = document.querySelector(`.${MENU_CLASS}`);
    if (menu && !menu.contains(e.target)) {
      this._removeMenu();
    }
  }

  _removeMenu() {
    document.querySelectorAll(`.${MENU_CLASS}`).forEach(m => m.remove());
    document.removeEventListener('click', this._boundOnClick);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _dispatch(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail, bubbles: false }));
  }
}

register('blockingInterface', {
  title:            'Blocking Interface',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  const instance = new BlockingInterface();
  instance.init();
  return () => instance.cleanup();
});
