/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Theme Builder Coordinator

    Module ID: themeBuilder
    Display Name: Theme Builder
    Tab: Appearance & Tools

    Purpose
        Coordinates theme creation tools, exposes their shared storage and CSS
        helpers, and restores the active theme on each page load.

    Submodules
        customStyling.js    — Edits, validates, and injects custom CSS.
        themeManagement.js  — Saves, applies, imports, and exports themes.
        typographySystem.js — Manages font and text-spacing controls.
        visualBuilder.js    — Builds themes with visual controls and preview.

    Notes
        Submodules register independently through side-effect imports. Shared
        helpers remain available through window.AO3H_ThemeBuilder for lazy
        access. Built-in themes stay local to themeManagement.js to preserve
        compatibility with themes already saved by users.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './themeBuilder.css?inline';

import './customStyling.js';
import './themeManagement.js';
import './typographySystem.js';
import './visualBuilder.js';



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-themeBuilder');

const W    = getGlobalWindow();
const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'themeBuilder';
const LOG  = `[AO3H][${MOD}]`;
const ACTIVE_SK = `${NS}:tb:active`;
const APPLIED_ID = `${NS}-tb-active-theme`;

export { lsGet, lsSet };

const TB_DEFAULTS = {
  mode:          'visual',
  importEnabled: true,
};

export const tbCfg = makeCfg(MOD, TB_DEFAULTS);



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

export function applyCSS (cssText, source) {
  let el = document.getElementById(APPLIED_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = APPLIED_ID;
    document.head.appendChild(el);
  }
  el.textContent = cssText || '';
  if (cssText) lsSet(ACTIVE_SK, { source: source || 'manual', css: cssText });
}

export function removeCSS () {
  document.getElementById(APPLIED_ID)?.remove();
  lsSet(ACTIVE_SK, null);
}

export { NS, APPLIED_ID };



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Theme Builder', enabledByDefault: false },
  async function init () {
    console.log(LOG, 'coordinator init');
    // ── Public API ──────────────────────────────────────────────────────
    W.AO3H_ThemeBuilder = { lsGet, lsSet, applyCSS, removeCSS, NS, APPLIED_ID, cfg: tbCfg };

    // Re-apply any previously saved active theme
    const active = lsGet(ACTIVE_SK);
    if (active?.css) {
      applyCSS(active.css, active.source);
      console.log(LOG, 'Restored active theme from', active.source);
    }

    return function cleanup () {
      document.getElementById(APPLIED_ID)?.remove();
      delete W.AO3H_ThemeBuilder;
      console.log(LOG, 'coordinator cleanup');
    };
  }
);
