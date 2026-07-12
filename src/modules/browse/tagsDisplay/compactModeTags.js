/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Compact Mode Tags Submodule
    Submodule ID: compactMode
    Parent: tagsDisplay
    Display Name: Compact Mode

    Collapses tags and summaries in work listings. On hover, they expand
    smoothly via CSS transition. Pure CSS solution — no DOM mutation needed.

    Features:
      - compactMode : master toggle (default: false)

    DOM side-effects:
      - Class `ao3h-compact-mode-on` on <html> while active
      - CSS rules live in tagsDisplay.css (scoped to .ao3h-compact-mode-on)

    CSS behaviour:
      - Collapsed: max-height 0, opacity 0.3, overflow hidden
      - Expanded (hover): max-height 500px, opacity 1, 0.3s ease

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';

const MOD  = 'compactMode';
const NS = 'ao3h';

// ── Config ────────────────────────────────────────────────────────────────
function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}

// ══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════

register(MOD, {
  title            : 'Compact Mode',
  parent           : 'tagsDisplay',
  enabledByDefault : false,
}, async function init () {

  if (!cfg('compactMode', false)) return () => {};

  document.documentElement.classList.add(`${NS}-compact-mode-on`);

  return () => {
    document.documentElement.classList.remove(`${NS}-compact-mode-on`);
  };
});
