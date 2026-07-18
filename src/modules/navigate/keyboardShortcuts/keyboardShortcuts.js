/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Keyboard Shortcuts

    Module ID: keyboardShortcuts
    Display Name: Keyboard Shortcuts
    Tab: Navigate & Interact

    Purpose

    Provides configurable keyboard access to common AO3 actions and exposes a
    temporary registration API for shortcuts owned by other modules.

    Features

    - Built-in chapter, pagination, subscription, bookmark, and shelf actions
    - External single-action and grouped shortcut registration
    - Conflict detection, execution feedback, and an on-page shortcut guide

    Notes

    - Shortcut handling is suppressed while the user is typing.
    - The public APIs exist only while this module is active.
    - `?` opens the active-shortcut guide by default.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import styles from './keyboardShortcuts.css?inline';
import { css, getCurrentPage, getMaxPageFromDOM, buildURLForPage } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import {
  parseCombo, matchesEvent, detectConflicts, groupByCategory, actionLabel, clampPageJump,
} from './keyboardShortcutsHelpers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-keyboardShortcuts');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'keyboardShortcuts';
const LOG  = `[AO3H][${MOD}]`;

const cfg = makeCfg(MOD);

// Key strings use the format: "Ctrl+Shift+K" or single keys like "?"
const DEFAULTS = {
  prevChapter:      'Ctrl+ArrowLeft',
  nextChapter:      'Ctrl+ArrowRight',
  prevPage:         'Shift+ArrowLeft',
  nextPage:         'Shift+ArrowRight',
  firstPage:        'Ctrl+Home',
  lastPage:         'Ctrl+End',
  jumpBackPages:    'Shift+PageUp',
  jumpForwardPages: 'Shift+PageDown',
  guide:            '?',
  commandPalette:   'Ctrl+/',
  surpriseMe:       'Ctrl+Shift+R',
  subscribe:        'Ctrl+Shift+S',
  bookmark:         'Ctrl+Shift+B',
  markForLater:     'Ctrl+Shift+M',
  kudos:            'Ctrl+Shift+K',
};

// Actions grouped for the shortcut guide's category headers. Anything not
// listed here (e.g. shortcuts registered by other modules) falls back to "Other".
const CATEGORIES = {
  Navigation: ['prevChapter', 'nextChapter', 'prevPage', 'nextPage', 'firstPage', 'lastPage', 'jumpBackPages', 'jumpForwardPages'],
  Actions:    ['surpriseMe', 'subscribe', 'bookmark', 'markForLater', 'kudos'],
  Interface:  ['guide', 'commandPalette'],
};
const DEFAULT_SHORTCUTS = { ...DEFAULTS };
const externalShortcuts = new Map();
function getShortcuts () {
  const result = {};
  // Registered module actions take priority when they intentionally reuse a
  // built-in combination (chapter-navigation delegates Ctrl+ArrowLeft/Right).
  for (const [action, key] of externalShortcuts) result[action] = key;
  for (const [action, defaultKey] of Object.entries(DEFAULT_SHORTCUTS)) {
    result[action] = cfg(action, defaultKey);
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SHORTCUT RESOLUTION
═══════════════════════════════════════════════════════════════════════════ */

/** detectConflicts() + logs each colliding group to the console for developers. */
function reportConflicts (map) {
  const { conflicting, groups } = detectConflicts(map);
  groups.forEach(({ key, actions }) => {
    console.warn(LOG, `Shortcut conflict: "${key}" used by ${actions.join(', ')}`);
  });
  return conflicting;
}

const FLASH_ID = `${NS}-kb-flash`;
let flashTimeout = null;

function triggerFlash () {
  let el = document.getElementById(FLASH_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = FLASH_ID;
    document.body.appendChild(el);
  }
  el.classList.remove(`${NS}-kb-flash-active`);
  void el.offsetWidth; // force reflow to restart animation
  el.classList.add(`${NS}-kb-flash-active`);
  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => el.classList.remove(`${NS}-kb-flash-active`), 300);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BUILT-IN ACTIONS
═══════════════════════════════════════════════════════════════════════════ */

// Each action returns true if it performed an operation.

function prevChapter () {
  const a = document.querySelector('.chapter.previous a, #chapters .previous a, a[rel="prev"]');
  if (a) { a.click(); return true; }
  return false;
}

function nextChapter () {
  const a = document.querySelector('.chapter.next a, #chapters .next a, a[rel="next"]');
  if (a) { a.click(); return true; }
  return false;
}

function prevPage () {
  const a = document.querySelector('.pagination .previous a, .pagination a[rel="prev"]');
  if (a) { a.click(); return true; }
  return false;
}

function nextPage () {
  const a = document.querySelector('.pagination .next a, .pagination a[rel="next"]');
  if (a) { a.click(); return true; }
  return false;
}

function actionSurpriseMe () {
  // Delegate to surpriseMe module if available
  const fn = W.AO3H_SurpriseMe?.trigger;
  if (typeof fn === 'function') { fn(); return true; }
  // Fallback: click the injected button if present in the DOM
  const btn = document.querySelector(`.${NS}-surprise-btn, [data-ao3h-action="surpriseMe"]`);
  if (btn) { btn.click(); return true; }
  return false;
}

function actionSubscribe () {
  const btn = document.querySelector('#subscribe input[type="submit"], .subscribe input[type="submit"], [data-ao3h-action="subscribe"]');
  if (btn) { btn.click(); return true; }
  return false;
}

function actionBookmark () {
  const btn = document.querySelector('a.bookmark, .bookmark-popup input[type="submit"], [data-ao3h-action="bookmark"]');
  if (btn) { btn.click(); return true; }
  return false;
}

function actionMarkForLater () {
  // Delegate to laterShelf module if available
  const fn = W.AO3H_LaterShelf?.markCurrent;
  if (typeof fn === 'function') { fn(); return true; }
  // Fallback: click the injected 📌 button if present
  const btn = document.querySelector(`.${NS}-mfl-btn, [data-ao3h-action="markForLater"]`);
  if (btn) { btn.click(); return true; }
  return false;
}

function actionKudos () {
  const btn = document.querySelector('#kudo_submit, .kudos input[type="submit"], [data-ao3h-action="kudos"]');
  if (btn) { btn.click(); return true; }
  return false;
}

const PAGE_JUMP = 5;

function firstPage () {
  if (getCurrentPage() <= 1) return false;
  location.assign(buildURLForPage(1));
  return true;
}

function lastPage () {
  const max = getMaxPageFromDOM();
  if (max <= 1 || getCurrentPage() >= max) return false;
  location.assign(buildURLForPage(max));
  return true;
}

function jumpBackPages () {
  const target = clampPageJump(getCurrentPage(), -PAGE_JUMP, getMaxPageFromDOM());
  if (target === null) return false;
  location.assign(buildURLForPage(target));
  return true;
}

function jumpForwardPages () {
  const target = clampPageJump(getCurrentPage(), PAGE_JUMP, getMaxPageFromDOM());
  if (target === null) return false;
  location.assign(buildURLForPage(target));
  return true;
}

// Built-in actions. External modules add more via W.AO3H_Keyboard.register().
const BUILTIN_ACTIONS = {
  prevChapter,
  nextChapter,
  prevPage,
  nextPage,
  firstPage,
  lastPage,
  jumpBackPages,
  jumpForwardPages,
  surpriseMe:   actionSurpriseMe,
  subscribe:    actionSubscribe,
  bookmark:     actionBookmark,
  markForLater: actionMarkForLater,
  kudos:        actionKudos,
  // guide and commandPalette are handled separately in onKeyDown
};
const externalActions = new Map();

function actionFor (action) {
  return externalActions.get(action) || BUILTIN_ACTIONS[action];
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — EXTERNAL REGISTRATION API
═══════════════════════════════════════════════════════════════════════════ */

function registerAction (action, keyStr, fn) {
  if (typeof action !== 'string' || typeof keyStr !== 'string' || typeof fn !== 'function') {
    return () => {};
  }
  externalActions.set(action, fn);
  externalShortcuts.set(action, keyStr);
  reportConflicts(getShortcuts());
  console.log(LOG, `external shortcut registered: ${action} → ${keyStr}`);
  return () => unregisterAction(action);
}

function registerGroup (moduleId, definitions) {
  if (typeof moduleId !== 'string' || !Array.isArray(definitions)) return () => {};
  unregisterGroup(moduleId);
  definitions.forEach((definition, index) => {
    if (!definition || typeof definition.action !== 'function' || typeof definition.key !== 'string') return;
    const action = `${moduleId}:${index}`;
    const combo = [
      definition.ctrlKey && 'Ctrl', definition.shiftKey && 'Shift',
      definition.altKey && 'Alt', definition.key,
    ].filter(Boolean).join('+');
    registerAction(action, combo, () => { definition.action(); return true; });
  });
  return () => unregisterGroup(moduleId);
}

function unregisterAction (action) {
  externalActions.delete(action);
  externalShortcuts.delete(action);
}

function unregisterGroup (moduleId) {
  const prefix = `${moduleId}:`;
  [...externalActions.keys()].filter(action => action.startsWith(prefix)).forEach(unregisterAction);
}

function createKeyboardApi () {
  return {
    register (actionOrModule, keyOrDefinitions, fn) {
      return Array.isArray(keyOrDefinitions)
        ? registerGroup(actionOrModule, keyOrDefinitions)
        : registerAction(actionOrModule, keyOrDefinitions, fn);
    },
    unregister (actionOrModule) {
      unregisterAction(actionOrModule);
      unregisterGroup(actionOrModule);
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SHORTCUT GUIDE
═══════════════════════════════════════════════════════════════════════════ */

let overlayEl = null;

const LABELS = {
  prevChapter:      '← Previous chapter',
  nextChapter:      'Next chapter →',
  prevPage:         '← Previous page',
  nextPage:         'Next page →',
  firstPage:        '⇤ First page',
  lastPage:         'Last page ⇥',
  jumpBackPages:    `⇤ Jump back ${PAGE_JUMP} pages`,
  jumpForwardPages: `Jump forward ${PAGE_JUMP} pages ⇥`,
  guide:            'Show this guide',
  commandPalette:   'Command palette',
  surpriseMe:       '🎲 Surprise Me',
  subscribe:        'Subscribe to work',
  bookmark:         'Bookmark work',
  markForLater:     '📌 Mark for Later',
  kudos:            '❤️ Leave kudos',
};

function runAction (action) {
  const fn = actionFor(action);
  if (fn && fn()) triggerFlash();
}

function showGuide (paletteMode = false) {
  if (overlayEl) { hideGuide(); return; }

  const map = getShortcuts();
  const conflicts = detectConflicts(map).conflicting;

  const panel = document.createElement('div');
  panel.className = `${NS}-kb-panel`;

  const title = document.createElement('h3');
  title.textContent = paletteMode ? '⌨️ Command Palette' : '⌨️ Keyboard Shortcuts';
  panel.appendChild(title);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = `${NS}-kb-search`;
  searchInput.placeholder = paletteMode ? 'Type a command and press Enter…' : 'Search shortcuts…';
  panel.appendChild(searchInput);

  const list = document.createElement('div');
  list.className = `${NS}-kb-list`;
  panel.appendChild(list);

  function renderRows (filter) {
    list.innerHTML = '';
    const q = (filter || '').trim().toLowerCase();
    const grouped = groupByCategory(map, CATEGORIES);
    for (const [category, entries] of Object.entries(grouped)) {
      const matches = entries.filter(([action, key]) =>
        !q || actionLabel(action, LABELS).toLowerCase().includes(q) || key.toLowerCase().includes(q));
      if (!matches.length) continue;
      if (!paletteMode) {
        const hdr = document.createElement('div');
        hdr.className = `${NS}-kb-category`;
        hdr.textContent = category;
        list.appendChild(hdr);
      }
      matches.forEach(([action, key]) => {
        const row = document.createElement('div');
        row.className = `${NS}-kb-row` + (conflicts.has(action) ? ` ${NS}-kb-conflict` : '');
        row.dataset.action = action;
        if (conflicts.has(action)) row.title = 'Conflicts with another shortcut using the same keys';
        const label = document.createElement('span');
        label.textContent = actionLabel(action, LABELS) + (conflicts.has(action) ? ' ⚠️' : '');
        const keyEl = document.createElement('span');
        keyEl.className = `${NS}-kb-key`;
        keyEl.textContent = key;
        row.appendChild(label);
        row.appendChild(keyEl);
        if (paletteMode) {
          row.classList.add(`${NS}-kb-row--clickable`);
          row.addEventListener('click', () => { runAction(action); hideGuide(); });
        }
        list.appendChild(row);
      });
    }
    if (!list.children.length) {
      const empty = document.createElement('div');
      empty.className = `${NS}-kb-empty`;
      empty.textContent = 'No matching shortcuts.';
      list.appendChild(empty);
    }
  }

  renderRows('');
  searchInput.addEventListener('input', () => renderRows(searchInput.value));
  if (paletteMode) {
    searchInput.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const first = list.querySelector(`.${NS}-kb-row`);
      if (first) { runAction(first.dataset.action); hideGuide(); }
    });
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = `${NS}-kb-close`;
  closeBtn.innerHTML = 'Close <small>(Esc)</small>';
  closeBtn.addEventListener('click', hideGuide);
  panel.appendChild(closeBtn);

  overlayEl = document.createElement('div');
  overlayEl.className = `${NS}-kb-overlay`;
  overlayEl.appendChild(panel);
  overlayEl.addEventListener('click', e => { if (e.target === overlayEl) hideGuide(); });
  document.addEventListener('keydown', onGuideKeyDown);
  document.body.appendChild(overlayEl);

  if (paletteMode) searchInput.focus();
}

function hideGuide () {
  overlayEl?.remove();
  overlayEl = null;
  document.removeEventListener('keydown', onGuideKeyDown);
}

function onGuideKeyDown (e) {
  if (e.key === 'Escape') { e.preventDefault(); hideGuide(); return; }
  // Don't let "?" close the overlay while the user is typing in its search box.
  if (e.key === '?' && e.target.tagName !== 'INPUT') { e.preventDefault(); hideGuide(); }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — KEYBOARD DISPATCH
═══════════════════════════════════════════════════════════════════════════ */

function onKeyDown (e) {
  // Never intercept when user is typing
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
  if (cfg('allShortcutsDisabled', false)) return;

  const map = getShortcuts();

  // Guide toggle
  if (map.guide) {
    const combo = parseCombo(map.guide);
    if (matchesEvent(combo, e)) { e.preventDefault(); showGuide(false); return; }
  }

  // Command palette toggle
  if (map.commandPalette) {
    const combo = parseCombo(map.commandPalette);
    if (matchesEvent(combo, e)) { e.preventDefault(); showGuide(true); return; }
  }

  // All other actions
  for (const [action, keyStr] of Object.entries(map)) {
    if (action === 'guide' || action === 'commandPalette') continue;
    const fn = actionFor(action);
    if (!fn) continue;
    const combo = parseCombo(keyStr);
    if (matchesEvent(combo, e)) {
      if (fn()) { triggerFlash(); e.preventDefault(); }
      return;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

function cleanup () {
  document.removeEventListener('keydown', onKeyDown);
  hideGuide();
  clearTimeout(flashTimeout);
  document.getElementById(FLASH_ID)?.remove();
  externalActions.clear();
  externalShortcuts.clear();
  if (W.AO3H_Keyboard === keyboardApi) delete W.AO3H_Keyboard;
  if (W.AO3H_KeyboardShortcuts === keyboardApi) delete W.AO3H_KeyboardShortcuts;
  keyboardApi = null;
  console.log(LOG, 'cleaned up');
}

let keyboardApi = null;

register(MOD, {
  title: 'Keyboard Shortcuts',
  enabledByDefault: false,
}, async function init () {
  keyboardApi = createKeyboardApi();
  W.AO3H_Keyboard = keyboardApi;
  W.AO3H_KeyboardShortcuts = keyboardApi;
  reportConflicts(getShortcuts());
  document.addEventListener('keydown', onKeyDown);
  console.log(LOG, 'initialized');
  return cleanup;
});
