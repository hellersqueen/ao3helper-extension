/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Series Helper Module Coordinator
    Module ID: seriesHelper
    Display Name: Series Helper
    Tab: Navigate & Interact

    Submodules (Tier 2 — imported by this coordinator, self-register with
    parent: 'seriesHelper', then boot automatically through the cascade logic
    built into core/lifecycle.js's bootOne()):
        seriesOrganization
        seriesProgress

    Shared API (W.AO3H_SeriesHelper, set before submodule cascade):
        W.AO3H_SeriesHelper.lsGet(key)
        W.AO3H_SeriesHelper.lsSet(key, val)
        W.AO3H_SeriesHelper.NS

    Config keys:
        epicSeriesWarning   -- warning badge for large series (20+ works) — key: epicSeriesWarning
        groupSeriesInSearch -- group series works in search results

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './seriesHelper.css?inline';

import './seriesOrganization.js';
import './seriesProgress.js';

css(styles, 'ao3h-seriesHelper');

const W   = getGlobalWindow();
const MOD = 'seriesHelper';
const NS  = 'ao3h';

// ── Shared storage helpers ────────────────────────────────────────────────
function lsGet(key) {
  try { const v = localStorage.getItem(`${NS}:sh:${key}`); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(`${NS}:sh:${key}`, JSON.stringify(val)); }
  catch { /* quota */ }
}

// ── Coordinator init ──────────────────────────────────────────────────────
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
