/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — User Relationships Coordinator

    Module ID: userRelationships
    Display Name: User Relationships
    Tab: Navigate & Interact

    Purpose

    Coordinates author preferences, tracking, blocking, blocklist management,
    and the filtering of works, comments, and bookmark notes.

    Submodules

    - authorBlocking.js: hides listing blurbs from blocked authors
    - authorPreference.js: per-author visibility, favorite, priority, and tag controls
    - authorTracking.js: followed-author notes and new-work detection
    - authorCard.js: read-only hover popover summarizing an author's status
    - commentHiding.js: filters blocked-user comments and bookmark notes

    Notes

    - Shared defaults are defined before child modules start.
    - The coordinator owns blocklist storage, contextual actions, and management UI.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Settings } from '../../../../lib/utils/config.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import styles from './userRelationships.css?inline';

import './authorBlocking.js';
import './authorPreference.js';
import './authorTracking.js';
import './authorCard.js';
import './commentHiding.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-userRelationships');

const MOD  = 'userRelationships';
const W    = getGlobalWindow();
const NS   = 'ao3h';
const STATS_KEY = 'userBlocker:hiddenStats';
const MENU_CLASS = 'ao3h-user-context-menu';

export const DEFAULTS = {
  favoritesOnlyFilter: false,
  showPlaceholder: true,
  tempRevealHidden: false,
};

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

export function parseUserHref (href) {
  const match = String(href || '').match(/\/users\/([^/?#]+)(?:\/pseuds\/([^/?#]+))?/);
  if (!match) return null;
  return { username: decodeURIComponent(match[1]), pseud: match[2] ? decodeURIComponent(match[2]) : null };
}
export function accountKey (username) { return String(username || '').trim().toLowerCase(); }
export function pseudKey (username, pseud) {
  return `${accountKey(username)}/${String(pseud || '').trim().toLowerCase()}`;
}
export function isBlockedIdentity (blockedSet, username, pseud) {
  if (!username || !blockedSet) return false;
  return blockedSet.has(accountKey(username)) || Boolean(pseud && blockedSet.has(pseudKey(username, pseud)));
}
export function describeIdentity (key) {
  const [username, pseud] = String(key || '').split('/');
  return pseud ? `${username} (pseud: ${pseud})` : username;
}
export const PRIORITY_LEVELS = ['normal', 'high', 'low'];
export function cyclePriority (current) {
  const index = PRIORITY_LEVELS.indexOf(current);
  return PRIORITY_LEVELS[(index + 1) % PRIORITY_LEVELS.length];
}
export function priorityIcon (priority) { return { high: '🔥', low: '💤' }[priority] || ''; }
export function parseTags (raw) {
  const seen = new Set();
  const tags = [];
  String(raw || '').split(',').forEach(value => {
    const tag = value.trim();
    if (!tag || seen.has(tag.toLowerCase())) return;
    seen.add(tag.toLowerCase());
    tags.push(tag);
  });
  return tags;
}
export function sortByKudosURL (href) {
  const url = new URL(href);
  url.searchParams.set('work_search[sort_column]', 'kudos_count');
  return url.toString();
}

export function getUserRelationshipsSettings () {
  return loadModuleSettings(MOD, DEFAULTS);
}

function loadHiddenStats () {
  return { works: 0, comments: 0, ...lsGet(STATS_KEY, {}) };
}

export function bumpHiddenStat (field) {
  const stats = loadHiddenStats();
  stats[field] = (stats[field] || 0) + 1;
  lsSet(STATS_KEY, stats);
}

export function getHiddenStats () { return loadHiddenStats(); }

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED STORAGE — READ ACCESSORS FOR SIBLING SUBMODULES

   Each key below has one owner. The coordinator owns the blocklist while
   authorTracking.js and authorPreference.js own their feature data. These
   accessors keep read-only consumers from reimplementing storage parsing.
═══════════════════════════════════════════════════════════════════════════ */

const BLOCKLIST_KEY = 'userBlocker:list';
const REASONS_KEY   = 'userBlocker:reasons';
const FOLLOWED_KEY  = 'authorTracking:followed';
const NOTES_KEY     = 'authorTracking:notes';
const PREFS_KEY     = 'authorPreferences:data';

export function getBlockedList () {
  return lsGet(BLOCKLIST_KEY, []).map(u => String(u).toLowerCase());
}
export function saveBlockedList (arr) { lsSet(BLOCKLIST_KEY, arr); }

export function getBlockReasons () { return lsGet(REASONS_KEY, {}); }
export function saveBlockReasons (reasons) { lsSet(REASONS_KEY, reasons); }

export function getFollowedAuthors () { return new Set(lsGet(FOLLOWED_KEY, [])); }
export function saveFollowedAuthors (set) { lsSet(FOLLOWED_KEY, [...set]); }

export function getAuthorNotes () { return lsGet(NOTES_KEY, {}); }
export function saveAuthorNotes (notes) { lsSet(NOTES_KEY, notes); }

export function getAuthorPrefsMap () { return lsGet(PREFS_KEY, {}); }
export function saveAuthorPrefsMap (map) { lsSet(PREFS_KEY, map); }
export function getAuthorPrefsFor (author) {
  return { hidden: false, favorite: false, readCount: 0, priority: 'normal', tags: [], ...getAuthorPrefsMap()[author] };
}

function notifyBlockingChanged (action, username) {
  document.dispatchEvent(new CustomEvent('ao3h:blocking-changed', {
    detail: { action, username },
    bubbles: false,
  }));
}

class BlockingInterface {
  constructor () {
    this._blockedKeys = new Set();
    this._reasons = {};
    this._boundOnContext = this._onContextMenu.bind(this);
    this._boundOnClick = this._onDocClick.bind(this);
    this._clickTimer = null;
  }

  init () {
    this._blockedKeys = new Set(getBlockedList());
    this._reasons = getBlockReasons();
    document.addEventListener('contextmenu', this._boundOnContext);
  }

  block (key, reason) {
    if (this._blockedKeys.has(key)) return false;
    this._blockedKeys.add(key);
    saveBlockedList([...this._blockedKeys]);
    if (reason) {
      this._reasons[key] = reason;
      saveBlockReasons(this._reasons);
    }
    notifyBlockingChanged('block', key);
    return true;
  }

  unblock (key) {
    if (!this._blockedKeys.has(key)) return false;
    this._blockedKeys.delete(key);
    saveBlockedList([...this._blockedKeys]);
    if (key in this._reasons) {
      delete this._reasons[key];
      saveBlockReasons(this._reasons);
    }
    notifyBlockingChanged('unblock', key);
    return true;
  }

  cleanup () {
    document.removeEventListener('contextmenu', this._boundOnContext);
    document.removeEventListener('click', this._boundOnClick);
    clearTimeout(this._clickTimer);
    this._clickTimer = null;
    this._removeMenu();
  }

  _onContextMenu (event) {
    const link = event.target.closest('a[rel="author"], a[href*="/users/"]');
    if (!link) return;
    const identity = parseUserHref(link.href);
    if (!identity?.username) return;
    event.preventDefault();
    this._showMenu(event.clientX, event.clientY, identity);
  }

  _showMenu (x, y, { username, pseud }) {
    this._removeMenu();
    const menu = document.createElement('div');
    menu.className = MENU_CLASS;
    Object.assign(menu.style, {
      left: `${Math.min(x, window.innerWidth - 200)}px`,
      top: `${Math.min(y, window.innerHeight - 90)}px`,
    });

    const addMenuItem = (label, color, onClick) => {
      const item = document.createElement('div');
      item.textContent = label;
      item.className = `${MENU_CLASS}-item`;
      item.style.color = color;
      item.addEventListener('click', () => {
        onClick();
        this._removeMenu();
      });
      menu.appendChild(item);
    };

    const account = accountKey(username);
    const accountBlocked = this._blockedKeys.has(account);
    addMenuItem(
      accountBlocked ? `Unblock ${username} (all pseuds)` : `Block ${username} (all pseuds)`,
      accountBlocked ? '#0d6efd' : '#dc3545',
      () => {
        if (accountBlocked) return this.unblock(account);
        const reason = window.prompt(`Optional: why are you blocking ${username}?`, '') || '';
        return this.block(account, reason.trim());
      }
    );

    if (pseud) {
      const pseudIdentity = pseudKey(username, pseud);
      const pseudBlocked = this._blockedKeys.has(pseudIdentity);
      addMenuItem(
        pseudBlocked ? `Unblock this pseud only (${pseud})` : `Block this pseud only (${pseud})`,
        pseudBlocked ? '#0d6efd' : '#dc3545',
        () => {
          if (pseudBlocked) return this.unblock(pseudIdentity);
          const reason = window.prompt(`Optional: why are you blocking the pseud "${pseud}"?`, '') || '';
          return this.block(pseudIdentity, reason.trim());
        }
      );
    }

    document.body.appendChild(menu);
    clearTimeout(this._clickTimer);
    this._clickTimer = setTimeout(() => {
      this._clickTimer = null;
      document.addEventListener('click', this._boundOnClick);
    }, 0);
  }

  _onDocClick (event) {
    const menu = document.querySelector(`.${MENU_CLASS}`);
    if (menu && !menu.contains(event.target)) this._removeMenu();
  }

  _removeMenu () {
    document.querySelectorAll(`.${MENU_CLASS}`).forEach(menu => menu.remove());
    document.removeEventListener('click', this._boundOnClick);
  }
}

function removeBlockReason (key) {
  const reasons = getBlockReasons();
  if (key in reasons) {
    delete reasons[key];
    saveBlockReasons(reasons);
  }
}

function buildBlocklistPanel () {
  const wrap = document.createElement('div');
  wrap.id = `${NS}-blocklist-manager`;

  function render () {
    const list = getBlockedList();
    const stats = getHiddenStats();
    wrap.innerHTML = `
      <h4>AO3 Helper — Blocked Users (${list.length})</h4>
      <p class="${NS}-bl-stats">
        🚫 ${list.length} blocked · 📕 ${stats.works} work${stats.works !== 1 ? 's' : ''} hidden · 💬 ${stats.comments} comment${stats.comments !== 1 ? 's' : ''} hidden (all-time)
      </p>
      <ul id="${NS}-bl-list"></ul>
      <div class="${NS}-bl-controls">
        <input id="${NS}-bl-input" type="text" placeholder="Username to block" />
        <input id="${NS}-bl-reason" type="text" placeholder="Reason (optional)" />
        <button id="${NS}-bl-add">Add</button>
        <button id="${NS}-bl-export">Export JSON</button>
        <label class="${NS}-bl-label">Import JSON<input id="${NS}-bl-import" type="file" accept=".json" /></label>
        <button id="${NS}-bl-clear">Clear All</button>
      </div>`;

    const listElement = wrap.querySelector(`#${NS}-bl-list`);
    const reasons = getBlockReasons();
    if (!list.length) {
      listElement.innerHTML = `<li class="${NS}-bl-empty">No blocked users.</li>`;
    } else {
      list.forEach(key => {
        const item = document.createElement('li');
        item.className = `${NS}-bl-item`;
        const name = document.createElement('span');
        name.className = `${NS}-bl-name`;
        name.textContent = describeIdentity(key);
        if (reasons[key]) {
          const reason = document.createElement('span');
          reason.className = `${NS}-bl-reason-text`;
          reason.textContent = ` — ${reasons[key]}`;
          name.appendChild(reason);
        }
        const removeButton = document.createElement('button');
        removeButton.textContent = '✕ Remove';
        removeButton.className = `${NS}-bl-remove-btn`;
        removeButton.addEventListener('click', () => {
          saveBlockedList(getBlockedList().filter(username => username !== key));
          removeBlockReason(key);
          notifyBlockingChanged('unblock', key);
          render();
        });
        item.append(name, removeButton);
        listElement.appendChild(item);
      });
    }

    wrap.querySelector(`#${NS}-bl-add`).addEventListener('click', () => {
      const input = wrap.querySelector(`#${NS}-bl-input`);
      const reasonInput = wrap.querySelector(`#${NS}-bl-reason`);
      const username = input.value.trim().toLowerCase();
      if (!username) return;
      const current = getBlockedList();
      if (!current.includes(username)) saveBlockedList([...current, username]);
      const reason = reasonInput.value.trim();
      if (reason) saveBlockReasons({ ...getBlockReasons(), [username]: reason });
      input.value = '';
      reasonInput.value = '';
      notifyBlockingChanged('block', username);
      render();
    });

    wrap.querySelector(`#${NS}-bl-input`).addEventListener('keydown', event => {
      if (event.key === 'Enter') wrap.querySelector(`#${NS}-bl-add`).click();
    });
    wrap.querySelector(`#${NS}-bl-export`).addEventListener('click', () => {
      downloadJSON(getBlockedList(), 'ao3h-blocklist.json');
    });
    wrap.querySelector(`#${NS}-bl-import`).addEventListener('change', event => {
      const file = /** @type {HTMLInputElement} */ (event.target).files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (typeof reader.result !== 'string') throw new Error('invalid text file');
          const imported = JSON.parse(reader.result);
          if (!Array.isArray(imported)) throw new Error('not an array');
          saveBlockedList([...new Set([...getBlockedList(), ...imported.map(value => String(value).toLowerCase())])]);
          notifyBlockingChanged('import');
          render();
        } catch (_) {
          // Invalid file — silently ignore.
        }
      };
      reader.readAsText(file);
    });
    wrap.querySelector(`#${NS}-bl-clear`).addEventListener('click', () => {
      if (!confirm('AO3 Helper: Clear all blocked users?')) return;
      saveBlockedList([]);
      saveBlockReasons({});
      notifyBlockingChanged('clear');
      render();
    });
  }

  render();
  return wrap;
}

function isBlocklistManagementPage () {
  return /\/users\/[^/]+\/(preferences|profile|dashboard)/.test(location.pathname) ||
    /\/users\/[^/]+$/.test(location.pathname);
}

const relationshipHelpers = {
  parseUserHref, accountKey, pseudKey, isBlockedIdentity, describeIdentity,
  cyclePriority, priorityIcon, parseTags, sortByKudosURL,
  getUserRelationshipsSettings, bumpHiddenStat, getHiddenStats,
  getBlockedList, saveBlockedList, getBlockReasons, saveBlockReasons,
  getFollowedAuthors, saveFollowedAuthors, getAuthorNotes, saveAuthorNotes,
  getAuthorPrefsMap, saveAuthorPrefsMap, getAuthorPrefsFor,
};

// The lifecycle can request two overlapping boots while both legacy and
// canonical enablement flags are being synchronized. Keep the coordinator's
// visible UI singleton so those requests cannot duplicate listeners or DOM.
let activeBlockingInterface = null;
let activeManagementPanel = null;

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'User Relationships',
  enabledByDefault: false,
}, async function init () {
  await Settings.define(MOD, DEFAULTS);
  W.AO3H_UserRelationships = relationshipHelpers;
  if (!activeBlockingInterface) {
    activeBlockingInterface = new BlockingInterface();
    activeBlockingInterface.init();
  }

  if (isBlocklistManagementPage() && !activeManagementPanel?.isConnected) {
    activeManagementPanel = buildBlocklistPanel();
    document.querySelector('#main')?.prepend(activeManagementPanel);
  }

  return () => {
    activeBlockingInterface?.cleanup();
    activeBlockingInterface = null;
    activeManagementPanel?.remove();
    activeManagementPanel = null;
    delete W.AO3H_UserRelationships;
  };
});
