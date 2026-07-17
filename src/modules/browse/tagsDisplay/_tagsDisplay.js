/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Tags Display Coordinator

    Module ID: tagsDisplay
    Display Name: Tags Display
    Tab: Browse

    Purpose

    Coordinates tag presentation features and synchronizes panel settings to
    the flags consumed by its independently registered child modules.

    Submodules

    - archiveWarningsDisplay.js: archive-warning presentation
    - autoHideNoiseTags.js: automatic noise-tag hiding
    - compactModeTags.js: compact tag and summary presentation
    - tagHighlighting.js: configurable favourite-tag highlighting
    - tagsReordering.js: drag-and-drop tag ordering on work pages
    - tagsVisibility.js: long-list truncation on listing pages

    Notes

    - Settings are stored under mod:tagsDisplay:settings.
    - Child modules register with parent `tagsDisplay` and lifecycle cascade
      booting starts them after this coordinator completes.
    - Settings must be synchronized before the children read their flags.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
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


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-tagsDisplay');

const MOD  = 'tagsDisplay';

const DEFAULTS = {
  autoHideNoiseTags    : false,
  compactMode          : false,
  highlightFavoriteTags: true,
  highlightColor       : 0,
  archiveWarningsStyle : 'badge',
  maxTagsVisible       : 0,
};


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
