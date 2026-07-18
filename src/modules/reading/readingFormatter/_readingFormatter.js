/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Reading Formatter Coordinator

    Module ID: readingFormatter
    Display Name: Reading Formatter
    Tab: Reading

    Purpose

    Coordinates reversible work-text cleanup, typography and layout options,
    reading-view optimization, and the floating reading-controls panel.

    Submodules

    - content.js: content cleanup and reading-view optimization
    - appearance.js: typography, scene breaks, and layout modes
    - readingControls.js: persistent width, spacing, scale, and indent controls

    Notes

    - `AO3H_RF` exposes shared settings, storage, classes, and text utilities.
    - Theme Builder integration remains optional through its runtime bridge.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { Storage } from '../../../../lib/storage/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';
import styles from './readingFormatter.css?inline';

import './content.js';
import './appearance.js';
import './readingControls.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-readingFormatter');

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'readingFormatter';

const DEFAULTS = {
  autoCleanFormatting : true,
  hideEmbeddedImages  : false,
  removeBoldExcessive : false,
  convertSlashItalic  : false,
  unifySceneBreaks    : true,
  sceneBreakStyle     : '✦ ✦ ✦',
  sansSerifFont       : false,
  cleanReadingMode    : false,
  textAlignment       : 'left',
  paragraphSpacing    : '0.5em',
  breatheMode         : false,
  splitTextWalls      : false,
  readingRuler        : false,
  endOfWorkInfo       : false,
  highlightDialogue   : false,
  perWorkPrefs        : false,
};

const cfg = makeCfg(MOD, DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function prefGet (key, def) {
  return Storage.lsGet(key, def);
}
function prefSet (key, val) {
  Storage.lsSet(key, val);
}

/** Walk only Text nodes inside a container. */
function walkTextNodes (el, fn) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) fn(node);
}

const ROOT_CLS      = `${NS}-rf-active`;
const SANSSERIF_CLS = `${NS}-rf-sansserif`;
const CLEAN_CLS      = `${NS}-rf-clean`;
const NOINDENT_CLS  = `${NS}-rf-noindent`;

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Reading Formatter',
  enabledByDefault: false,
}, async function init () {

  W.AO3H_RF = {
    NS, SANSSERIF_CLS, CLEAN_CLS, ROOT_CLS, NOINDENT_CLS,
    cfg, isWorkPage, prefGet, prefSet, walkTextNodes,
  };

  return () => {
    delete W.AO3H_RF;
  };
});
