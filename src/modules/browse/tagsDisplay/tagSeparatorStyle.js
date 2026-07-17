/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Tag Separator Style

Lets the user override AO3's default ", " separator between displayed tags
with their own text (e.g. " · " or " | "), via a CSS custom property.

Notes

- Purely presentational: sets `--ao3h-tag-sep` on <html> and toggles the
  activation class; the actual rule lives in tagsDisplay.css.
- A no-op (skipped entirely) when the separator is the AO3 default, so the
  feature never adds an unnecessary style override.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';


/* ═══════════════════════════════════════════════════════════════════════════
   PURE SEPARATOR BUILDER
═══════════════════════════════════════════════════════════════════════════ */

export const DEFAULT_SEPARATOR = ', ';

// Escapes backslashes and double quotes so the result is safe to embed as a
// double-quoted CSS string value (used for the `content:` property).
export function buildSeparatorCssValue(text) {
  const safe = String(text ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${safe}"`;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'tagSeparatorStyle';
const NS   = 'ao3h';
const TOGGLE_CLASS = `${NS}-tag-sep-on`;
const CSS_VAR      = '--ao3h-tag-sep';

function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'Tag Separator Style',
  parent           : 'tagsDisplay',
  enabledByDefault : true,
}, async function init () {

  const separator = cfg('tagSeparator', DEFAULT_SEPARATOR);
  if (separator === DEFAULT_SEPARATOR) return () => {};

  document.documentElement.style.setProperty(CSS_VAR, buildSeparatorCssValue(separator));
  document.documentElement.classList.add(TOGGLE_CLASS);

  return () => {
    document.documentElement.classList.remove(TOGGLE_CLASS);
    document.documentElement.style.removeProperty(CSS_VAR);
  };
});
