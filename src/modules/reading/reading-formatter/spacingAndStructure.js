/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Spacing and Structure Submodule
    Submodule ID: spacingAndStructure
    Parent: readingFormatter
    Display Name: Spacing and Structure

    Handles visual scene separators on work pages:
      - unifySceneBreaks : replace *** / --- / ~~~ sequences with ✦ ✦ ✦

    Reads config from parent module (readingFormatter).
    NS is accessed via W.AO3H_RF set up by coordinator.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W   = getGlobalWindow();
const MOD = 'spacingAndStructure';
const LOG = `[AO3H][readingFormatter/${MOD}]`;
const replacements = new Map();

// ── Config — reads from parent readingFormatter settings ─────────────────
function cfg (key) {
  return W.AO3H_RF?.cfg(key) ?? null;
}

// ── Scene-break unifier ───────────────────────────────────────────────────

function unifySceneBreaks (container) {
  const NS = W.AO3H_RF?.NS || 'ao3h';
  container.querySelectorAll('p, div').forEach(el => {
    const text = el.textContent.trim();
    if (/^([*\-~_=+]{3,}|(\*\s*){3,}|(–\s*){3,})$/.test(text)) {
      const replacement = document.createElement('p');
      replacement.textContent = '✦ ✦ ✦';
      replacement.className = `${NS}-rf-scene-break`;
      replacement.dataset.rfBreak = '1';
      el.replaceWith(replacement);
      replacements.set(replacement, el);
    }
  });
  // Replace standalone <hr> with styled dividers
  container.querySelectorAll('hr').forEach(hr => {
    if (hr.dataset.rfBreak) return;
    const NS2 = W.AO3H_RF?.NS || 'ao3h';
    const div = document.createElement('p');
    div.textContent = '✦ ✦ ✦';
    div.className = `${NS2}-rf-scene-break`;
    div.dataset.rfBreak = '1';
    div.dataset.rfHrReplaced = '1';
    hr.replaceWith(div);
    replacements.set(div, hr);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Spacing and Structure',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${LOG} W.AO3H_RF not ready`); return () => {}; }

  const workskin = document.getElementById('workskin');

  if (RF.isWorkPage() && workskin && cfg('unifySceneBreaks')) {
    const content = workskin.querySelector('.userstuff') || workskin;
    unifySceneBreaks(content);
  }

  return () => {
    replacements.forEach((original, replacement) => replacement.replaceWith(original));
    replacements.clear();
  };
});
