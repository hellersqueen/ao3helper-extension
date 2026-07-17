/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Series Helper Coordinator

    Module ID: seriesHelper
    Display Name: Series Helper
    Tab: Navigate & Interact

    Purpose

    Coordinates series grouping, progress presentation, and the shared storage
    bridge consumed by both child modules.

    Submodules

    - seriesOrganization.js: groups related works on listing pages
    - seriesProgress.js: progress badges and work-page series navigation

    Notes

    - `AO3H_SeriesHelper` exposes namespaced JSON storage to child modules.
    - The shared runtime bridge is removed when the coordinator stops.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './seriesHelper.css?inline';

import './seriesOrganization.js';
import './seriesProgress.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-seriesHelper');

const W   = getGlobalWindow();
const MOD = 'seriesHelper';
const NS  = 'ao3h';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function lsGet(key) {
  try { const v = localStorage.getItem(`${NS}:sh:${key}`); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(`${NS}:sh:${key}`, JSON.stringify(val)); }
  catch { /* quota */ }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Series Helper',
  enabledByDefault: true
}, async function init() {
  // Expose shared API for submodules (must be set before cascade)
  W.AO3H_SeriesHelper = { lsGet, lsSet, NS };

  return function cleanup() {
    delete W.AO3H_SeriesHelper;
  };
});
