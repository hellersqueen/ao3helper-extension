/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Compact Mode

Enables the CSS-driven compact presentation that collapses listing tags and
summaries until the user hovers over the work blurb.

Notes

- The feature requires no per-blurb DOM mutation.
- Presentation rules live in tagsDisplay.css.
- Cleanup removes the root activation class and restores normal presentation.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'compactMode';
const NS = 'ao3h';

function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — COMPACT TAG AND SUMMARY PRESENTATION
═══════════════════════════════════════════════════════════════════════════ */

// The feature itself is activated through the root class managed below.


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
