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

export const LONG_PARAGRAPH_CHARS = 600;
export const WALL_OF_TEXT_CHARS   = 1500;
export const WALL_TARGET_CHARS    = 500;

export function isLongParagraph (text, threshold = LONG_PARAGRAPH_CHARS) {
  return typeof text === 'string' && text.length >= threshold;
}

export function splitWallText (text, {
  wallThreshold = WALL_OF_TEXT_CHARS,
  targetLen = WALL_TARGET_CHARS,
} = {}) {
  if (typeof text !== 'string' || text.length < wallThreshold) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+["'”’)\]]*\s*/g);
  if (!sentences || sentences.length < 2) return [text];
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && (current.length + sentence.length) > targetLen) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 1 ? chunks : [text];
}

export function cleanPasteArtifacts (text) {
  if (typeof text !== 'string') return text;
  return text.replace(/[   ]+/g, ' ');
}

export function isEmptyParagraphText (text) {
  return typeof text === 'string' && text.replace(/[\s   ]/g, '') === '';
}

export function findDialogueSpans (text) {
  if (typeof text !== 'string' || !text) return [];
  const spans = [];
  const re = /“[^”]{1,500}”|"[^"]{1,500}"/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    spans.push({ start: match.index, end: match.index + match[0].length });
  }
  return spans;
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
    isLongParagraph, splitWallText, cleanPasteArtifacts,
    isEmptyParagraphText, findDialogueSpans,
  };

  return () => {
    delete W.AO3H_RF;
  };
});
