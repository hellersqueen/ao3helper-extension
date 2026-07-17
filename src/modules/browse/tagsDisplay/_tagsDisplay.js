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
    - externalTagLinks.js: Fanlore/TV Tropes search links appended to tags
    - tagSeparatorStyle.js: custom separator between displayed tags
    - tagImportancePromotion.js: promotes highlighted tags within their category

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
import { DEFAULT_SEPARATOR } from './tagSeparatorStyle.js';

import './archiveWarningsDisplay.js';
import './autoHideNoiseTags.js';
import './compactModeTags.js';
import './tagHighlighting.js';
import './tagsReordering.js';
import './tagsVisibility.js';
import './externalTagLinks.js';
import './tagSeparatorStyle.js';
import './tagImportancePromotion.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-tagsDisplay');

const MOD  = 'tagsDisplay';

const DEFAULTS = {
  autoHideNoiseTags       : false,
  noiseTagStyle           : 'hide',
  compactMode             : false,
  compactCatWarnings      : true,
  compactCatRelationships : true,
  compactCatCharacters    : true,
  compactCatFreeforms     : true,
  compactCatSummary       : true,
  compactModeAutoExpandScroll: false,
  highlightFavoriteTags   : true,
  highlightColor          : 0,
  highlightPalette        : 'default',
  highlightStyle          : 'fill',
  archiveWarningsStyle    : 'badge',
  maxTagsVisible          : 0,
  hideTagsWarnings        : false,
  hideTagsRelationships   : false,
  hideTagsCharacters      : false,
  hideTagsFreeforms       : false,
  tagSeparator            : DEFAULT_SEPARATOR,
  promoteHighlightedTags  : false,
  confirmSensitiveWarnings: false,
  tagExternalLinks        : false,
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
    Flags.set(`mod:${MOD}:noiseTagStyle`,         str('noiseTagStyle')),
    Flags.set(`mod:${MOD}:compactMode`,           bool('compactMode')),
    Flags.set(`mod:${MOD}:compactCatWarnings`,      bool('compactCatWarnings')),
    Flags.set(`mod:${MOD}:compactCatRelationships`, bool('compactCatRelationships')),
    Flags.set(`mod:${MOD}:compactCatCharacters`,    bool('compactCatCharacters')),
    Flags.set(`mod:${MOD}:compactCatFreeforms`,     bool('compactCatFreeforms')),
    Flags.set(`mod:${MOD}:compactCatSummary`,       bool('compactCatSummary')),
    Flags.set(`mod:${MOD}:compactModeAutoExpandScroll`, bool('compactModeAutoExpandScroll')),
    Flags.set(`mod:${MOD}:highlightFavoriteTags`, bool('highlightFavoriteTags')),
    Flags.set(`mod:${MOD}:highlightColor`,        int('highlightColor')),
    Flags.set(`mod:${MOD}:highlightPalette`,      str('highlightPalette')),
    Flags.set(`mod:${MOD}:highlightStyle`,        str('highlightStyle')),
    Flags.set(`mod:${MOD}:archiveWarningsStyle`,  str('archiveWarningsStyle')),
    Flags.set(`mod:${MOD}:maxTagsVisible`,        int('maxTagsVisible')),
    Flags.set(`mod:${MOD}:hideTagsWarnings`,      bool('hideTagsWarnings')),
    Flags.set(`mod:${MOD}:hideTagsRelationships`, bool('hideTagsRelationships')),
    Flags.set(`mod:${MOD}:hideTagsCharacters`,    bool('hideTagsCharacters')),
    Flags.set(`mod:${MOD}:hideTagsFreeforms`,     bool('hideTagsFreeforms')),
    Flags.set(`mod:${MOD}:tagSeparator`,          str('tagSeparator')),
    Flags.set(`mod:${MOD}:promoteHighlightedTags`, bool('promoteHighlightedTags')),
    Flags.set(`mod:${MOD}:confirmSensitiveWarnings`, bool('confirmSensitiveWarnings')),
    Flags.set(`mod:${MOD}:tagExternalLinks`,         bool('tagExternalLinks')),
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
