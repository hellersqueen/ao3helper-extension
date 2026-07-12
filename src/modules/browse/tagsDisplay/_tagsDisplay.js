/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display Module Coordinator
    Module ID: tagsDisplay
    Display Name: Tags Display
    Tab: Browse

    Submodules (Tier 2 — imported by this coordinator, self-register with
    parent: 'tagsDisplay', then boot automatically through the cascade logic
    built into core/lifecycle.js's bootOne()):
        1. archiveWarningsDisplay — compact icons for archive warnings
        2. autoHideNoiseTags      — hides self-deprecating freeform tags
        3. compactMode            — collapses tags/summaries, expand on hover
        4. tagHighlighting        — highlight favourite tags by pattern
        5. tagsReordering         — drag-and-drop reorder tags on work pages
        6. tagsVisibility         — truncate long tag lists on listing pages

    Settings (synced from panel → Flags before cascade):
        autoHideNoiseTags    bool   → mod:tagsDisplay:autoHideNoiseTags
        compactMode          bool   → mod:tagsDisplay:compactMode
        highlightFavoriteTags bool  → mod:tagsDisplay:highlightFavoriteTags
        highlightColor       int    → mod:tagsDisplay:highlightColor
        archiveWarningsStyle string → mod:tagsDisplay:archiveWarningsStyle
        maxTagsVisible       int    → mod:tagsDisplay:maxTagsVisible

    Storage key: mod:tagsDisplay:settings (JSON, written by panel)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Storage } from '../../../../lib/storage/index.js';
import { Flags } from '../../../../lib/utils/config.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './tagsDisplay.css?inline';

import './archiveWarningsDisplay.js';
import './autoHideNoiseTags.js';
import './compactModeTags.js';
import './tagHighlighting.js';
import './tagsReordering.js';
import './tagsVisibility.js';

css(styles, 'ao3h-tagsDisplay');

const MOD  = 'tagsDisplay';

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  autoHideNoiseTags    : false,
  compactMode          : false,
  highlightFavoriteTags: true,
  highlightColor       : 0,
  archiveWarningsStyle : 'badge',
  maxTagsVisible       : 0,
};

// ── Sync panel settings → flags ───────────────────────────────────────────
async function syncFlags () {
  let saved = null;
  try {
    saved = Storage.lsGet(`mod:${MOD}:settings`, null);
  } catch { /* */ }

  const s = (saved && typeof saved === 'object') ? saved : {};

  const bool = (key) =>
    (key in s) ? !!s[key] : DEFAULTS[key];
  const int  = (key) =>
    (key in s) ? (parseInt(s[key], 10) || DEFAULTS[key]) : DEFAULTS[key];
  const str  = (key) =>
    (key in s) ? String(s[key]) : DEFAULTS[key];

  await Promise.all([
    Flags.set(`mod:${MOD}:autoHideNoiseTags`,     bool('autoHideNoiseTags')),
    Flags.set(`mod:${MOD}:compactMode`,           bool('compactMode')),
    Flags.set(`mod:${MOD}:highlightFavoriteTags`, bool('highlightFavoriteTags')),
    Flags.set(`mod:${MOD}:highlightColor`,        int('highlightColor')),
    Flags.set(`mod:${MOD}:archiveWarningsStyle`,  str('archiveWarningsStyle')),
    Flags.set(`mod:${MOD}:maxTagsVisible`,        int('maxTagsVisible')),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════

register(MOD, {
  title            : 'Tags Display',
  enabledByDefault : false,
}, async function init () {

  // Sync before cascade so all children read correct flag values
  await syncFlags();

  // Children registered with { parent: 'tagsDisplay' } are cascade-booted
  // automatically by bootOne() once this parent finishes booting (see
  // core/lifecycle.js) — no explicit call needed here. The original coordinator
  // called `AO3H.modules.bootCascade?.(MOD)`, but bootCascade doesn't exist
  // anywhere in lifecycle.js; that call was always a silent no-op.

  return () => {
    // Children handle their own cleanup via their registered teardown functions
  };
});
