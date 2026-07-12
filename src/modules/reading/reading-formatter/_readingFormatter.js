/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Formatter Module Coordinator
    Module ID: readingFormatter
    Display Name: Reading Formatter
    Tab: Reading

    Settings (delegated to submodules):
        autoCleanFormatting  -- fix double spaces, <br><br> sequences (contentCleanup)
        hideEmbeddedImages   -- hide <img> tags in work content (contentCleanup)
        removeBoldExcessive  -- strip <strong> from paragraphs (typography)
        convertSlashItalic   -- /text/ -> <em>text</em> (typography)
        sansSerifFont        -- CSS override to sans-serif on #workskin (typography)
        unifySceneBreaks     -- *** / --- / ~~~ -> ✦ ✦ ✦ (spacingAndStructure)
        cleanReadingMode     -- narrow max-width, hide secondary chrome (layoutAndDisplayModes)
        textAlignment        -- left / justify / center (readingViewOptimization)
        paragraphSpacing     -- margin-block between <p> elements (readingViewOptimization)

    Submodules (Tier 2 — self-register with parent: 'readingFormatter', discovered
    independently by src/modules.js's import.meta.glob, booted automatically
    by the cascade logic already built into core/lifecycle.js's bootOne()):
        contentCleanup          -- autoCleanFormatting, hideEmbeddedImages
        typography              -- removeBoldExcessive, convertSlashItalic, sansSerifFont
        spacingAndStructure     -- unifySceneBreaks
        layoutAndDisplayModes   -- cleanReadingMode
        readingViewOptimization -- textAlignment, paragraphSpacing
        readingControls         -- floating Aa panel (width / spacing / scale / indent)

    Shared API (W.AO3H_RF, set before submodule cascade):
        NS, ROOT_CLS, SANSSERIF_CLS, CLEAN_CLS, NOINDENT_CLS
        cfg(key), isWorkPage(), prefGet(key, def), prefSet(key, val), walkTextNodes(el, fn)

    Dependencies: themeBuilder (optional, accent colours) — migré (Phase 24, étape 290) ;
    accès via le bridge W.AO3H_ThemeBuilder, conservé jusqu'à la Phase 26

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { Storage } from '../../../../lib/storage/index.js';
import styles from './readingFormatter.css?inline';

import './contentCleanup.js';
import './typography.js';
import './spacingAndStructure.js';
import './layoutAndDisplayModes.js';
import './readingViewOptimization.js';
import './readingControls.js';

css(styles, 'ao3h-readingFormatter');

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'readingFormatter';

// ── Route guard ──────────────────────────────────────────────────────────
function isWorkPage () {
  return /^\/works\/\d+/.test(location.pathname);
}

// ── Config helpers ────────────────────────────────────────────────────────
const DEFAULTS = {
  autoCleanFormatting : true,
  hideEmbeddedImages  : false,
  removeBoldExcessive : false,
  convertSlashItalic  : false,
  unifySceneBreaks    : true,
  sansSerifFont       : false,
  cleanReadingMode    : false,
  textAlignment       : 'left',
  paragraphSpacing    : '0.5em',
};

const SK_SETTINGS = `${NS}:mod:${MOD}:settings`;

function lsGetSettings () {
  try { const v = localStorage.getItem(SK_SETTINGS); return v ? JSON.parse(v) : null; } catch { return null; }
}

function cfg (key) {
  const saved = lsGetSettings() || {};
  return key in saved ? saved[key] : (key in DEFAULTS ? DEFAULTS[key] : null);
}

// ── Persistent prefs (localStorage, bypassing Settings API) ───────────────
function prefGet (key, def) {
  return Storage.lsGet(key, def);
}
function prefSet (key, val) {
  Storage.lsSet(key, val);
}

// ── Shared utilities ──────────────────────────────────────────────────────

/** Walk only Text nodes inside a container. */
function walkTextNodes (el, fn) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) fn(node);
}

// ── CSS class names ───────────────────────────────────────────────────────
const ROOT_CLS      = `${NS}-rf-active`;
const SANSSERIF_CLS = `${NS}-rf-sansserif`;
const CLEAN_CLS      = `${NS}-rf-clean`;
const NOINDENT_CLS  = `${NS}-rf-noindent`;

// ══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Reading Formatter',
  enabledByDefault: false,
}, async function init () {

  // Expose shared namespace for submodules (must be set before cascade)
  W.AO3H_RF = {
    NS, SANSSERIF_CLS, CLEAN_CLS, ROOT_CLS, NOINDENT_CLS,
    cfg, isWorkPage, prefGet, prefSet, walkTextNodes,
  };

  return () => {
    delete W.AO3H_RF;
  };
});
