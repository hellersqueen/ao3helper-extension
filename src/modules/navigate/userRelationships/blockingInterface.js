/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Blocking Interface

Adds a contextual block or unblock action to AO3 author and user-profile links.

Notes

- Usernames are normalized to lowercase in the shared blocklist.
- Blocklist changes dispatch `ao3h:blocking-changed` for filtering submodules.
- The custom context menu closes after selection or an outside click.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MENU_CLASS  = 'ao3h-user-context-menu';
const W = getGlobalWindow();
const parseUserHref = (...args) => W.AO3H_UserRelationships.parseUserHref(...args);
const accountKey = (...args) => W.AO3H_UserRelationships.accountKey(...args);
const pseudKey = (...args) => W.AO3H_UserRelationships.pseudKey(...args);
const isBlockedIdentity = (...args) => W.AO3H_UserRelationships.isBlockedIdentity(...args);
const getBlockedList = (...args) => W.AO3H_UserRelationships.getBlockedList(...args);
const saveBlockedList = (...args) => W.AO3H_UserRelationships.saveBlockedList(...args);
const getBlockReasons = (...args) => W.AO3H_UserRelationships.getBlockReasons(...args);
const saveBlockReasons = (...args) => W.AO3H_UserRelationships.saveBlockReasons(...args);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CONTEXTUAL BLOCKING
═══════════════════════════════════════════════════════════════════════════ */

class BlockingInterface {
  constructor() {
    this._blockedKeys    = new Set();
    this._reasons        = {};
    this._boundOnContext = this._onContextMenu.bind(this);
    this._boundOnClick   = this._onDocClick.bind(this);
    this._clickTimer     = null;
  }

  init() {
    this._loadList();
    this._loadReasons();
    document.addEventListener('contextmenu', this._boundOnContext);
  }

  /** @param {string} username @param {string|null} [pseud] */
  isBlocked(username, pseud = null) {
    return isBlockedIdentity(this._blockedKeys, username, pseud);
  }

  /**
   * @param {string} key - accountKey(username) or pseudKey(username, pseud)
   * @param {string} [reason]
   */
  block(key, reason) {
    if (this._blockedKeys.has(key)) return false;
    this._blockedKeys.add(key);
    this._saveList();
    if (reason) { this._reasons[key] = reason; this._saveReasons(); }
    this._dispatch('ao3h:blocking-changed', { action: 'block', username: key });
    return true;
  }

  unblock(key) {
    if (!this._blockedKeys.has(key)) return false;
    this._blockedKeys.delete(key);
    this._saveList();
    if (key in this._reasons) { delete this._reasons[key]; this._saveReasons(); }
    this._dispatch('ao3h:blocking-changed', { action: 'unblock', username: key });
    return true;
  }

  getList() {
    return Array.from(this._blockedKeys);
  }

  getReasons() {
    return { ...this._reasons };
  }

  cleanup() {
    document.removeEventListener('contextmenu', this._boundOnContext);
    document.removeEventListener('click', this._boundOnClick);
    clearTimeout(this._clickTimer);
    this._clickTimer = null;
    this._removeMenu();
  }

  _loadList() {
    this._blockedKeys = new Set(getBlockedList());
  }

  _saveList() {
    saveBlockedList(Array.from(this._blockedKeys));
  }

  _loadReasons() {
    this._reasons = getBlockReasons();
  }

  _saveReasons() {
    saveBlockReasons(this._reasons);
  }

  _onContextMenu(e) {
    const link = e.target.closest('a[rel="author"], a[href*="/users/"]');
    if (!link) return;

    const identity = parseUserHref(link.href);
    if (!identity?.username) return;

    e.preventDefault();
    this._showMenu(e.clientX, e.clientY, identity);
  }

  _showMenu(x, y, { username, pseud }) {
    this._removeMenu();

    const menu = document.createElement('div');
    menu.className = MENU_CLASS;
    Object.assign(menu.style, {
      left: `${Math.min(x, window.innerWidth - 200)}px`,
      top:  `${Math.min(y, window.innerHeight - 90)}px`,
    });

    const addItem = (label, color, onClick) => {
      const item = document.createElement('div');
      item.textContent = label;
      item.className   = `${MENU_CLASS}-item`;
      item.style.color = color;
      item.addEventListener('click', () => { onClick(); this._removeMenu(); });
      menu.appendChild(item);
    };

    const accKey = accountKey(username);
    const accountBlocked = this._blockedKeys.has(accKey);
    addItem(
      accountBlocked ? `Unblock ${username} (all pseuds)` : `Block ${username} (all pseuds)`,
      accountBlocked ? '#0d6efd' : '#dc3545',
      () => {
        if (accountBlocked) { this.unblock(accKey); return; }
        const reason = window.prompt(`Optional: why are you blocking ${username}?`, '') || '';
        this.block(accKey, reason.trim());
      },
    );

    if (pseud) {
      const pKey = pseudKey(username, pseud);
      const pseudBlocked = this._blockedKeys.has(pKey);
      addItem(
        pseudBlocked ? `Unblock this pseud only (${pseud})` : `Block this pseud only (${pseud})`,
        pseudBlocked ? '#0d6efd' : '#dc3545',
        () => {
          if (pseudBlocked) { this.unblock(pKey); return; }
          const reason = window.prompt(`Optional: why are you blocking the pseud "${pseud}"?`, '') || '';
          this.block(pKey, reason.trim());
        },
      );
    }

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

  _dispatch(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail, bubbles: false }));
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register('blockingInterface', {
  title:            'Blocking Interface',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  const instance = new BlockingInterface();
  instance.init();
  return () => instance.cleanup();
});
