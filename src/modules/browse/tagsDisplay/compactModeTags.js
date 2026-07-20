/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Compact Mode

Enables the CSS-driven compact presentation that collapses listing tags and
summaries until the user hovers over them (or scrolls them into view, or
force-opens everything with a keyboard shortcut).

Notes

- Presentation rules live in tagsDisplay.css; this file only toggles classes.
- Each tag category (+ the summary) collapses independently — which ones
  participate is controlled by the compactCat* settings.
- Cleanup removes every class this feature can add and restores normal
  presentation.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { observe } from '../../../../lib/utils/index.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   PURE COMPACT-MODE RULES
═══════════════════════════════════════════════════════════════════════════ */

// Maps each collapsible target to the boolean setting that enables it.
export const CATEGORY_SETTINGS = {
  warnings     : 'compactCatWarnings',
  relationships: 'compactCatRelationships',
  characters   : 'compactCatCharacters',
  freeforms    : 'compactCatFreeforms',
  summary      : 'compactCatSummary',
};

// getSetting: (key, fallback) => value — same shape as this module's cfg().
export function enabledCompactCategories(getSetting) {
  return Object.entries(CATEGORY_SETTINGS)
    .filter(([, key]) => !!getSetting(key, true))
    .map(([category]) => category);
}

const FIELD_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function isCompactToggleShortcut(e) {
  if (!e) return false;
  if (e.key !== 't' && e.key !== 'T') return false;
  if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return false;

  const target = e.target;
  if (target) {
    if (FIELD_TAGS.has(target.tagName)) return false;
    if (target.isContentEditable) return false;
  }
  return true;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'compactMode';
const NS = 'ao3h';
const W  = getGlobalWindow();

const FORCE_OPEN_CLASS  = `${NS}-cm-force-open`;
const IN_VIEW_CLASS     = `${NS}-cm-in-view`;
const AUTOEXPAND_CLASS  = `${NS}-cm-autoexpand-scroll`;
const categoryClass     = (cat) => `${NS}-cm-cat-${cat}`;
const forceOpenKey      = () => `${NS}:tagsDisplay:compactForceOpen:${location.pathname}`;
const cfg               = (...args) => W.AO3H_TagsDisplay.cfg(...args);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — KEYBOARD SHORTCUT (TOGGLE ALL OPEN) + PER-PAGE MEMORY
═══════════════════════════════════════════════════════════════════════════ */

// Persisted in localStorage (not sessionStorage): the point of this feature
// is to remember the choice across visits, not just within the current tab.
function loadForceOpen () {
  try { return localStorage.getItem(forceOpenKey()) === '1'; } catch { return false; }
}
function saveForceOpen (on) {
  try {
    if (on) localStorage.setItem(forceOpenKey(), '1');
    else localStorage.removeItem(forceOpenKey());
  } catch { /* */ }
}

function onKeydown (e) {
  if (!isCompactToggleShortcut(e)) return;
  e.preventDefault();
  const next = !document.documentElement.classList.contains(FORCE_OPEN_CLASS);
  document.documentElement.classList.toggle(FORCE_OPEN_CLASS, next);
  saveForceOpen(next);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — AUTO-EXPAND ON SCROLL INTO VIEW
═══════════════════════════════════════════════════════════════════════════ */

let scrollObserver = null;

function watchBlurbsForScroll (root) {
  if (!scrollObserver) return;
  (root || document).querySelectorAll('.blurb').forEach(el => scrollObserver.observe(el));
}

function setupScrollAutoExpand () {
  document.documentElement.classList.add(AUTOEXPAND_CLASS);
  scrollObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.classList.toggle(IN_VIEW_CLASS, entry.isIntersecting);
    }
  }, { rootMargin: '0px', threshold: 0.15 });
  watchBlurbsForScroll(document);
}

function teardownScrollAutoExpand () {
  if (scrollObserver) { scrollObserver.disconnect(); scrollObserver = null; }
  document.documentElement.classList.remove(AUTOEXPAND_CLASS);
  document.querySelectorAll(`.${IN_VIEW_CLASS}`).forEach(el => el.classList.remove(IN_VIEW_CLASS));
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'Compact Mode',
  parent           : 'tagsDisplay',
  enabledByDefault : false,
}, async function init () {

  if (!cfg('compactMode', false)) return () => {};

  document.documentElement.classList.add(`${NS}-compact-mode-on`);

  const activeCategories = enabledCompactCategories(cfg);
  for (const cat of activeCategories) document.documentElement.classList.add(categoryClass(cat));

  if (loadForceOpen()) document.documentElement.classList.add(FORCE_OPEN_CLASS);
  document.addEventListener('keydown', onKeydown);

  let listObserver = null;
  if (cfg('compactModeAutoExpandScroll', false)) {
    setupScrollAutoExpand();
    const main = document.querySelector('#main') || document.body;
    listObserver = observe(main, { childList: true, subtree: true }, mutations => {
      for (const mut of mutations) {
        mut.addedNodes.forEach(node => { if (node instanceof Element) watchBlurbsForScroll(node); });
      }
    });
  }

  return () => {
    document.removeEventListener('keydown', onKeydown);
    if (listObserver) listObserver.disconnect();
    teardownScrollAutoExpand();
    document.documentElement.classList.remove(`${NS}-compact-mode-on`, FORCE_OPEN_CLASS);
    for (const cat of Object.keys(CATEGORY_SETTINGS)) document.documentElement.classList.remove(categoryClass(cat));
  };
});
