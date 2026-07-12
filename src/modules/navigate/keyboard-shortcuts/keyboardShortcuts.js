/* ═══════════════════════════════════════════════════════════════════════════
   AO3 Helper — Keyboard Shortcuts
   Module ID : keyboardShortcuts

   Provides configurable keyboard shortcuts for common AO3 actions.
   Press "?" to show a help overlay listing active shortcuts.

   Settings:
     customizationEnabled  – allow remapping (future)
     allShortcutsDisabled  – emergency kill switch
     shortcuts             – map of action → key combo

   External API (available only while the module is active):
     W.AO3H_Keyboard.register(action, keyStr, fn)
     W.AO3H_KeyboardShortcuts.register(moduleId, shortcutDefinitions)
       → both forms return an unregister function
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import styles from './keyboardShortcuts.css?inline';
import { css } from '../../../../lib/utils/index.js';

css(styles, 'ao3h-keyboardShortcuts');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'keyboardShortcuts';
const LOG  = `[AO3H][${MOD}]`;

// ── Settings reader ───────────────────────────────────────────────────────
function cfg (key, fallback) {
  try {
    const raw = localStorage.getItem(`ao3h:mod:${MOD}:settings`);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    return (key in saved) ? saved[key] : fallback;
  } catch { return fallback; }
}

// ── Default shortcut map (action → key string) ────────────────────────────
// Key strings use the format: "Ctrl+Shift+K" or single keys like "?"
const DEFAULTS = {
  prevChapter:  'Ctrl+ArrowLeft',
  nextChapter:  'Ctrl+ArrowRight',
  prevPage:     'Shift+ArrowLeft',
  nextPage:     'Shift+ArrowRight',
  guide:        '?',
  surpriseMe:   'Ctrl+Shift+R',
  subscribe:    'Ctrl+Shift+S',
  bookmark:     'Ctrl+Shift+B',
  markForLater: 'Ctrl+Shift+M',
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

// ── Parse a key string into { ctrl, shift, alt, key } ────────────────────
function parseCombo (str) {
  const parts = str.split('+');
  return {
    ctrl:  parts.includes('Ctrl'),
    shift: parts.includes('Shift'),
    alt:   parts.includes('Alt'),
    key:   parts[parts.length - 1],
  };
}

function comboToString (combo) {
  return [combo.ctrl && 'Ctrl', combo.shift && 'Shift', combo.alt && 'Alt', combo.key]
    .filter(Boolean).join('+');
}

function matchesEvent (combo, e) {
  // event.key already contains the transformed printable character. Thus a
  // configured "?" must also match the Shift+key event used to produce it.
  const transformedPrintable = !combo.shift && combo.key.length === 1 && e.key === combo.key;
  return e.key === combo.key &&
         e.ctrlKey  === combo.ctrl &&
         (e.shiftKey === combo.shift || transformedPrintable) &&
         e.altKey   === combo.alt;
}

// ── Conflict detection ────────────────────────────────────────────────────
function detectConflicts (map) {
  const seen = new Map(); // comboString → action
  for (const [action, keyStr] of Object.entries(map)) {
    const combo = parseCombo(keyStr);
    const key = comboToString(combo);
    if (seen.has(key)) {
      console.warn(LOG, `Shortcut conflict: "${key}" used by both "${seen.get(key)}" and "${action}"`);
    } else {
      seen.set(key, action);
    }
  }
}

// ── Visual feedback ───────────────────────────────────────────────────────
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

// ── Built-in actions ──────────────────────────────────────────────────────
// Each action returns true if it did something (so we can preventDefault).

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

// ── Action registry ───────────────────────────────────────────────────────
// Built-in actions. External modules add more via W.AO3H_Keyboard.register().
const BUILTIN_ACTIONS = {
  prevChapter,
  nextChapter,
  prevPage,
  nextPage,
  surpriseMe:   actionSurpriseMe,
  subscribe:    actionSubscribe,
  bookmark:     actionBookmark,
  markForLater: actionMarkForLater,
  // guide is handled separately in onKeyDown
};
const externalActions = new Map();

function actionFor (action) {
  return externalActions.get(action) || BUILTIN_ACTIONS[action];
}

// ── External registration API ─────────────────────────────────────────────
function registerAction (action, keyStr, fn) {
  if (typeof action !== 'string' || typeof keyStr !== 'string' || typeof fn !== 'function') {
    return () => {};
  }
  externalActions.set(action, fn);
  externalShortcuts.set(action, keyStr);
  detectConflicts(getShortcuts());
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

// ── Help overlay ──────────────────────────────────────────────────────────

let overlayEl = null;

const LABELS = {
  prevChapter:  '← Previous chapter',
  nextChapter:  'Next chapter →',
  prevPage:     '← Previous page',
  nextPage:     'Next page →',
  guide:        'Show this guide',
  surpriseMe:   '🎲 Surprise Me',
  subscribe:    'Subscribe to work',
  bookmark:     'Bookmark work',
  markForLater: '📌 Mark for Later',
};

function actionLabel (action) {
  if (LABELS[action]) return LABELS[action];
  // Convert camelCase / snake_case / slash-separated to readable words
  return action.replace(/[_/]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function showGuide () {
  if (overlayEl) { hideGuide(); return; }

  const map = getShortcuts();
  const rows = Object.entries(map)
    .map(([action, key]) =>
      `<div class="${NS}-kb-row"><span>${actionLabel(action)}</span><span class="${NS}-kb-key">${key}</span></div>`)
    .join('');

  overlayEl = document.createElement('div');
  overlayEl.className = `${NS}-kb-overlay`;
  overlayEl.innerHTML = `
    <div class="${NS}-kb-panel">
      <h3>⌨️ Keyboard Shortcuts</h3>
      ${rows}
      <button class="${NS}-kb-close">Close <small>(Esc or ?)</small></button>
    </div>
  `;

  overlayEl.querySelector(`.${NS}-kb-close`).addEventListener('click', hideGuide);
  overlayEl.addEventListener('click', e => { if (e.target === overlayEl) hideGuide(); });
  document.addEventListener('keydown', onGuideKeyDown);
  document.body.appendChild(overlayEl);
}

function hideGuide () {
  overlayEl?.remove();
  overlayEl = null;
  document.removeEventListener('keydown', onGuideKeyDown);
}

function onGuideKeyDown (e) {
  if (e.key === 'Escape' || e.key === '?') { e.preventDefault(); hideGuide(); }
}

// ── Main keydown handler ──────────────────────────────────────────────────
function onKeyDown (e) {
  // Never intercept when user is typing
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
  if (cfg('allShortcutsDisabled', false)) return;

  const map = getShortcuts();

  // Guide toggle
  if (map.guide) {
    const combo = parseCombo(map.guide);
    if (matchesEvent(combo, e)) { e.preventDefault(); showGuide(); return; }
  }

  // All other actions
  for (const [action, keyStr] of Object.entries(map)) {
    if (action === 'guide') continue;
    const fn = actionFor(action);
    if (!fn) continue;
    const combo = parseCombo(keyStr);
    if (matchesEvent(combo, e)) {
      if (fn()) { triggerFlash(); e.preventDefault(); }
      return;
    }
  }
}

// ── Cleanup ───────────────────────────────────────────────────────────────
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

// ── Registration ──────────────────────────────────────────────────────────
let keyboardApi = null;

register(MOD, {
  title: 'Keyboard Shortcuts',
  enabledByDefault: false,
}, async function init () {
  // customizationEnabled — future: controls whether key bindings are editable
  const _remappingEnabled = cfg('customizationEnabled', false); // eslint-disable-line no-unused-vars
  keyboardApi = createKeyboardApi();
  W.AO3H_Keyboard = keyboardApi;
  W.AO3H_KeyboardShortcuts = keyboardApi;
  detectConflicts(getShortcuts());
  document.addEventListener('keydown', onKeyDown);
  console.log(LOG, 'initialized');
  return cleanup;
});
