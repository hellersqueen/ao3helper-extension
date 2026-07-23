/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Collapse Author Notes

    Module ID: collapseAuthorNotes
    Display Name: Collapse Author Notes
    Tab: Reading

    Purpose

    Adds accessible collapse controls to beginning and ending author notes on
    work pages while preserving important warnings and anchored destinations.

    Features

    - Independent beginning- and end-note collapse preferences
    - Per-work persisted expansion state
    - Automatic warning-note expansion and URL-anchor handling
    - Optional collection-banner hiding

    Notes

    - Collapse state is stored separately for each work and note position.
    - Original accessibility attributes are restored during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, onReady, observe, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { Flags } from '../../../../lib/utils/config.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { extractWorkIdFromHref, isWorkPage } from '../../../../lib/ao3/parsers.js';
import { Storage, clearStorageByPrefix } from '../../../../lib/storage/index.js';
import styles from './collapseAuthorNotes.css?inline';
import { getLogger } from '../../../../lib/utils/logger.js';
const log = getLogger('collapseAuthorNotes');

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-collapseAuthorNotes');

const W = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'collapseAuthorNotes';
const ENABLE_KEY = `mod:${MOD}:enabled`;

export const WARNING_RE = /\b(tw|cw|trigger\s*warning|content\s*warning)\b/i;

export function containsWarningText (text) {
  return WARNING_RE.test(String(text || ''));
}

export function matchesKeywords (text, keywordsCsv) {
  const haystack = String(text || '').toLowerCase();
  return String(keywordsCsv || '')
    .split(',')
    .map(keyword => keyword.trim().toLowerCase())
    .filter(Boolean)
    .some(keyword => haystack.includes(keyword));
}

export function exceedsMinLength (text, minChars) {
  const min = parseInt(String(minChars), 10);
  if (!Number.isFinite(min) || min <= 0) return true;
  return String(text || '').trim().length >= min;
}

const DEFAULTS = {
  autoCollapseBeginning:    false,  // ☐ Replier automatiquement les notes de début
  autoCollapseEnd:          false,  // ☐ Replier automatiquement les notes de fin
  autoCollapseMinChars:     0,      // 0 = replier quelle que soit la longueur ; sinon seuil en caractères
  autoExpandWarnings:       true,   // ☑ Toujours déplier les notes contenant TW/CW
  autoExpandKeywords:       '',     // mots-clés perso (séparés par des virgules) qui gardent une note dépliée
  hideCollectionBanners:    false,  // ☐ Masquer les bandeaux de collection (collection/cadeau/défi)
  clearStatesOnDisable:     false,  // ☐ Oublier les préférences repli/dépli quand le module est désactivé
};

const cfg = makeCfg(MOD);

function parseWorkId () {
  return extractWorkIdFromHref(location.pathname);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — NOTE-STATE PERSISTENCE
═══════════════════════════════════════════════════════════════════════════ */

function stateKey (suffix) {
  const wid = parseWorkId();
  return wid ? `${NS}:notes:${wid}:${suffix}` : null;
}

function loadState (suffix) {
  const k = stateKey(suffix);
  return k ? lsGet(k, null) : null;          // null = no saved preference
}

function saveState (suffix, expanded) {
  const k = stateKey(suffix);
  if (k) lsSet(k, expanded);
}

function clearAllStates () {
  clearStorageByPrefix(`${NS}:notes:`, Storage);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — NOTE DISCOVERY AND DISPLAY RULES
═══════════════════════════════════════════════════════════════════════════ */

function anchorTargets (suffix) {
  const h = (location.hash || '').replace('#', '').toLowerCase();
  if (!h) return false;
  if (suffix === 'pre') return h === 'notes';
  if (suffix === 'end') return h === 'endnotes' || h === 'end_notes';
  return false;
}

function containsWarning (el) {
  return containsWarningText(el.textContent);
}

function $$ (sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ACCESSIBLE NOTE TOGGLES
═══════════════════════════════════════════════════════════════════════════ */

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
    heading.classList.add(`${NS}-notes-heading`);
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
  const noteText  = notesEl.textContent || '';
  const hasWarn   = cfg('autoExpandWarnings', true) && containsWarning(notesEl);
  // User-chosen keep-open keywords, on top of the TW/CW detection
  const hasKeyword = matchesKeywords(noteText, cfg('autoExpandKeywords', ''));
  // Auto-collapse only applies past the configured length (0 = always)
  const autoPref  = (suffix === 'pre'
    ? cfg('autoCollapseBeginning', false)
    : cfg('autoCollapseEnd', false))
    && exceedsMinLength(noteText, cfg('autoCollapseMinChars', 0));

  let startExpanded;
  if (anchored)          startExpanded = true;   // URL anchor wins
  else if (hasWarn)      startExpanded = true;   // warnings always visible
  else if (hasKeyword)   startExpanded = true;   // user keywords keep it open
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

let observer = null;
let unwatchEnable = null;
let active = false;

function process () {
  const notes = findNotes();
  notes.forEach(({ el, suffix }) => wireToggle(el, suffix));

  if (cfg('hideCollectionBanners', false)) {
    hideCollectionBanners();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

function cleanup () {
  active = false;

  // Disconnect observer
  if (observer) { observer.disconnect(); observer = null; }

  // Remove all toggle buttons
  $$(`.${NS}-notes-toggle-wrap`).forEach(el => el.remove());
  $$(`.${NS}-notes-heading`).forEach(el => el.classList.remove(`${NS}-notes-heading`));

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

  log.debug('cleaned up');
}

register(MOD, {
  title: 'Collapse Author Notes',
  enabledByDefault: false,
}, async function init () {
  if (!isWorkPage()) return;

  active = true;

  // document.body peut ne pas encore exister quand ce module boote — sans ce
  // report, l'observer plantait (Cannot read properties of null), constaté
  // sur plusieurs modules similaires en test.
  onReady(() => {
    if (!active) return;
    process();

    // Watch for dynamically added content (rare on AO3, but safe)
    observer = observe(document.body, { childList: true, subtree: true }, (muts) => {
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
  });

  // Live toggle via flags
  unwatchEnable = Flags?.watch(ENABLE_KEY, (val) => {
    if (!val) {
      // Optionally forget every saved collapse preference on disable
      if (cfg('clearStatesOnDisable', false)) clearAllStates();
      cleanup();
    }
    else { process(); }
  }) ?? null;

  log.debug('initialized');

  return cleanup;
});
