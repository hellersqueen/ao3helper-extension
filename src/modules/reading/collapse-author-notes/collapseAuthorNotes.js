/* ═══════════════════════════════════════════════════════════════════════════
   AO3 Helper — Collapse Author's Notes
   Module ID : collapseAuthorNotes

   What it does:
     On work pages, finds beginning notes (div.notes.module) and end notes
     (div.end.notes.module) and collapses them behind a small ▼ / ▲ toggle.

   Settings (from config.js, read via localStorage directly):
     autoCollapseBeginning  – auto-collapse beginning notes on load
     autoCollapseEnd        – auto-collapse end notes on load
     autoExpandWarnings     – always expand notes containing TW / CW keywords
     hideCollectionBanners  – hide collection / gift / challenge banners

   Persistence:
     Per-work collapse state saved in localStorage under
     ao3h:notes:{workId}:pre  and  ao3h:notes:{workId}:end

   Anchor respect:
     If the URL hash is #notes or #endnotes, the targeted section is forced
     open regardless of saved state or auto-collapse setting.
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { Flags } from '../../../../lib/utils/config.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';
import styles from './collapseAuthorNotes.css?inline';

css(styles, 'ao3h-collapseAuthorNotes');

const W = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'collapseAuthorNotes';
const LOG = `[AO3H][${MOD}]`;
const ENABLE_KEY = `mod:${MOD}:enabled`;

// ── Defaults (required for audit tooling) ──────────────────────────
const DEFAULTS = {
  autoCollapseBeginning:    false,  // ☐ Replier automatiquement les notes de début
  autoCollapseEnd:          false,  // ☐ Replier automatiquement les notes de fin
  autoExpandWarnings:       true,   // ☑ Toujours déplier les notes contenant TW/CW
  hideCollectionBanners:    false,  // ☐ Masquer les bandeaux de collection (collection/cadeau/défi)
};

// ── Settings reader ───────────────────────────────────────────────────────
const cfg = makeCfg(MOD);

// ── Route guard ───────────────────────────────────────────────────────────
function isWorkPage () {
  return /^\/works\/\d+/.test(location.pathname);
}

function parseWorkId () {
  return extractWorkIdFromHref(location.pathname);
}

// ── Persistence (localStorage, per-work) ──────────────────────────────────
function stateKey (suffix) {
  const wid = parseWorkId();
  return wid ? `${NS}:notes:${wid}:${suffix}` : null;
}

function loadState (suffix) {
  const k = stateKey(suffix);
  if (!k) return null;                     // null = no saved preference
  try {
    const v = localStorage.getItem(k);
    if (v === 'true')  return true;
    if (v === 'false') return false;
  } catch {}
  return null;
}

function saveState (suffix, expanded) {
  const k = stateKey(suffix);
  if (!k) return;
  try { localStorage.setItem(k, String(expanded)); } catch {}
}

function clearAllStates () {
  try {
    const prefix = `${NS}:notes:`;
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
}

// ── Anchor detection ──────────────────────────────────────────────────────
function anchorTargets (suffix) {
  const h = (location.hash || '').replace('#', '').toLowerCase();
  if (!h) return false;
  if (suffix === 'pre') return h === 'notes';
  if (suffix === 'end') return h === 'endnotes' || h === 'end_notes';
  return false;
}

// ── Warning keyword detection ─────────────────────────────────────────────
const WARNING_RE = /\b(tw|cw|trigger\s*warning|content\s*warning)\b/i;

function containsWarning (el) {
  return WARNING_RE.test(el.textContent || '');
}

// ── DOM helpers ───────────────────────────────────────────────────────────
function $$ (sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

// ── Find notes containers ─────────────────────────────────────────────────
// AO3 wraps author notes in:
//   <div class="notes module" role="complementary">  (beginning)
//   <div class="end notes module" role="complementary">  (end)
function findNotes () {
  const results = [];

  $$('div.notes.module').forEach(el => {
    // "end notes" also matches "notes module", so check for "end" class
    const isEnd = el.classList.contains('end');
    results.push({ el, suffix: isEnd ? 'end' : 'pre' });
  });

  return results;
}

// ── Collection banners ────────────────────────────────────────────────────
// AO3 shows banners like "This work is part of a collection" etc.
// Selectors: .collection.module, .gift .module, .challenge .module, or
//            the preface group .preface .notes on some skins.
function hideCollectionBanners () {
  $$('#main .collections.module').forEach(el => {
    el.classList.add(`${NS}-banner-hidden`);
  });
}

function showCollectionBanners () {
  $$(`.${NS}-banner-hidden`).forEach(el => el.classList.remove(`${NS}-banner-hidden`));
}

// ── Toggle UI per notes block ─────────────────────────────────────────────

const originalAccessibility = new WeakMap();

function rememberAccessibility (contentEl) {
  if (originalAccessibility.has(contentEl)) return;
  originalAccessibility.set(contentEl, {
    inert: contentEl.hasAttribute('inert') ? contentEl.getAttribute('inert') : null,
    ariaHidden: contentEl.hasAttribute('aria-hidden')
      ? contentEl.getAttribute('aria-hidden')
      : null,
  });
}

function restoreAccessibility (contentEl) {
  const original = originalAccessibility.get(contentEl);
  if (!original) return;

  if (original.inert === null) contentEl.removeAttribute('inert');
  else contentEl.setAttribute('inert', original.inert);

  if (original.ariaHidden === null) contentEl.removeAttribute('aria-hidden');
  else contentEl.setAttribute('aria-hidden', original.ariaHidden);

  originalAccessibility.delete(contentEl);
}

function wireToggle (notesEl, suffix) {
  if (notesEl.dataset[`${NS}Wired`]) return;     // already processed
  notesEl.dataset[`${NS}Wired`] = '1';

  // Create toggle button
  const wrap = document.createElement('span');
  wrap.className = `${NS}-notes-toggle-wrap`;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${NS}-notes-toggle`;
  btn.setAttribute('aria-expanded', 'true');
  btn.setAttribute('aria-label', 'Collapse notes');
  btn.innerHTML = `<span class="${NS}-sr">Toggle notes</span><span class="chev" aria-hidden="true">▼</span>`;
  wrap.appendChild(btn);

  // Insert toggle inside the h3 heading (floated right), falling back to before the block
  const heading = notesEl.querySelector('h3.heading');
  if (heading) {
    heading.appendChild(wrap);
  } else {
    notesEl.parentNode.insertBefore(wrap, notesEl);
  }

  // Collapse only the content (blockquote), not the heading that holds the button
  const contentEl = notesEl.querySelector('blockquote.userstuff') || notesEl;
  rememberAccessibility(contentEl);

  // ── State helpers ──
  function setExpanded (expanded) {
    if (expanded) {
      contentEl.classList.remove(`${NS}-notes-collapsed`);
      contentEl.removeAttribute('inert');
      contentEl.removeAttribute('aria-hidden');
    } else {
      contentEl.classList.add(`${NS}-notes-collapsed`);
      contentEl.setAttribute('inert', '');
      contentEl.setAttribute('aria-hidden', 'true');
    }
    const chev = btn.querySelector('.chev');
    if (chev) chev.textContent = expanded ? '▼' : '▶';
    btn.setAttribute('aria-expanded', String(expanded));
    btn.setAttribute('aria-label', expanded ? 'Collapse notes' : 'Expand notes');
  }

  // ── Determine initial state ──
  const saved     = loadState(suffix);
  const anchored  = anchorTargets(suffix);
  const hasWarn   = cfg('autoExpandWarnings', true) && containsWarning(notesEl);
  const autoPref  = suffix === 'pre'
    ? cfg('autoCollapseBeginning', false)
    : cfg('autoCollapseEnd', false);

  let startExpanded;
  if (anchored)          startExpanded = true;   // URL anchor wins
  else if (hasWarn)      startExpanded = true;   // warnings always visible
  else if (saved !== null) startExpanded = saved; // user's saved choice
  else                   startExpanded = !autoPref; // setting default

  setExpanded(startExpanded);

  // ── Click handler ──
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const next = !isOpen;
    setExpanded(next);
    saveState(suffix, next);
  });
}

// ── Main process ──────────────────────────────────────────────────────────
let observer = null;
let unwatchEnable = null;

function process () {
  const notes = findNotes();
  notes.forEach(({ el, suffix }) => wireToggle(el, suffix));

  if (cfg('hideCollectionBanners', false)) {
    hideCollectionBanners();
  }
}

// ── Cleanup ───────────────────────────────────────────────────────────────
function cleanup () {
  // Disconnect observer
  if (observer) { observer.disconnect(); observer = null; }

  // Remove all toggle buttons
  $$(`.${NS}-notes-toggle-wrap`).forEach(el => el.remove());

  // Restore all notes blocks
  $$(`[data-${NS}-wired]`).forEach(el => {
    const content = el.querySelector('blockquote.userstuff') || el;
    content.classList.remove(`${NS}-notes-collapsed`);
    restoreAccessibility(content);
    delete el.dataset[`${NS}Wired`];
  });

  // Restore banners
  showCollectionBanners();

  // Unregister flags watcher
  if (unwatchEnable) { unwatchEnable(); unwatchEnable = null; }

  console.log(LOG, 'cleaned up');
}

// ── Registration ──────────────────────────────────────────────────────────

register(MOD, {
  title: 'Collapse Author Notes',
  enabledByDefault: false,
}, async function init () {
  if (!isWorkPage()) return;

  process();

  // Watch for dynamically added content (rare on AO3, but safe)
  observer = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n instanceof Element && (
          n.matches?.('div.notes.module') ||
          n.querySelector?.('.notes.module')
        )) {
          process();
          return;
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Live toggle via flags
  unwatchEnable = Flags?.watch(ENABLE_KEY, (val) => {
    if (!val) cleanup();
    else { process(); }
  }) ?? null;

  console.log(LOG, 'initialized');

  return cleanup;
});
