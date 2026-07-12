/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading View Optimization Submodule
    Submodule ID: readingViewOptimization
    Parent: readingFormatter
    Display Name: Reading View Optimization

    Handles per-config CSS tweaks on work pages:
      - textAlignment    : text-align for .userstuff content
                           Setting: `textAlignment` ('left' | 'justify' | 'center',
                           default: 'left')
      - paragraphSpacing : extra margin-block between <p> elements
                           Setting: `paragraphSpacing` (string, default: '0.5em')

    Reads config from parent module (readingFormatter).
    Injects its own <style> tag; removed on cleanup.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W   = getGlobalWindow();
const MOD = 'readingViewOptimization';
const LOG = `[AO3H][readingFormatter/${MOD}]`;

// ── Config — reads from parent readingFormatter settings ─────────────────
function cfg (key) {
  return W.AO3H_RF?.cfg(key) ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Reading View Optimization',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${LOG} W.AO3H_RF not ready`); return () => {}; }

  if (!RF.isWorkPage()) return () => {};

  const html        = document.documentElement;
  const alignment   = cfg('textAlignment')    || 'left';
  const paraSpacing = cfg('paragraphSpacing') || '0.5em';

  html.style.setProperty('--ao3h-rvo-align',        alignment);
  html.style.setProperty('--ao3h-rvo-para-spacing', paraSpacing);

  return () => {
    html.style.removeProperty('--ao3h-rvo-align');
    html.style.removeProperty('--ao3h-rvo-para-spacing');
  };
});
