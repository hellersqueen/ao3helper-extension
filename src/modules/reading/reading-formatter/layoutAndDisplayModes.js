/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Layout and Display Modes Submodule
    Submodule ID: layoutAndDisplayModes
    Parent: readingFormatter
    Display Name: Layout and Display Modes

    Handles global CSS class overrides on all pages:
      - cleanReadingMode : narrow max-width, hide secondary chrome

    Reads config from parent module (readingFormatter).
    CSS classes defined in coordinator's CSS file.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W   = getGlobalWindow();
const MOD = 'layoutAndDisplayModes';
const LOG = `[AO3H][readingFormatter/${MOD}]`;

// ── Config — reads from parent readingFormatter settings ─────────────────
function cfg (key) {
  return W.AO3H_RF?.cfg(key) ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Layout and Display Modes',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${LOG} W.AO3H_RF not ready`); return () => {}; }

  // Clean reading mode applies on all pages
  if (cfg('cleanReadingMode')) {
    document.documentElement.classList.add(RF.CLEAN_CLS);
  }

  return () => {
    document.documentElement.classList.remove(RF.CLEAN_CLS);
  };
});
