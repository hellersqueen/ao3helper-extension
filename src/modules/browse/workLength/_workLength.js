/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Work Length Coordinator

    Module ID: workLength
    Display Name: Work Length
    Tab: Browse

    Purpose

    Coordinates word-count presentation and reading-time estimates across AO3
    work pages, chapters, and listing blurbs.

    Submodules

    - lengthDisplay.js: page equivalents and length-category badges
    - readingTime.js: configurable reading-time estimates

    Notes

    - Both submodules share one snapshot of the Work Length settings.
    - Each submodule returns its own cleanup callback and exposes reset logic.
    - Reading-speed presets may be replaced by a custom words-per-minute value.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import styles from './workLength.css?inline';

import { LengthDisplay } from './lengthDisplay.js';
import { ReadingTime } from './readingTime.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-workLength');

const NS   = 'ao3h';
const MOD  = 'workLength';

const DEFAULTS = {
  showPageEquiv:      false,
  wordsPerPage:       275,
  pageFormat:         'compact', // 'compact' (~X pg) | 'full' (~X pages)
  readSpeed:          'average',
  customWPM:          250,
  showEstimate:       true,
  estimateFicPage:    true,
  estimatePerChapter: true,
  estimateListings:   false,
  showRemainingTime:  true,
  showOneSitting:     false,
  oneSittingMinutes:  60,
  finishByTime:       '',    // "HH:MM" — empty disables the finish-by badge
  showLengthCategory: true,
  thresholdFlash:     1000,
  thresholdShort:     17500,
  thresholdNovella:   60000,
  thresholdEpic:      150000,
  showAvgChapterLength: false,
  showSeriesTotal:    true,
  lengthGradient:     false,
  customBooks:        '',    // one per line: "Title: 50000"
};


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function loadSettings() { return loadModuleSettings(MOD); }


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Work Length', enabledByDefault: false }, async function init() {
  const saved = loadSettings();
  function cfg(key) { return saved[key] ?? DEFAULTS[key]; }

  const lengthDisplay = new LengthDisplay(NS, cfg);
  const readingTime   = new ReadingTime(NS, cfg);

  const cleanupLD = lengthDisplay.setup();
  const cleanupRT = readingTime.setup();

  return function cleanup() {
    cleanupLD?.();
    cleanupRT?.();
    lengthDisplay.reset();
    readingTime.reset();
  };
});
