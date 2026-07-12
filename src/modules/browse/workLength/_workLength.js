/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Work Length Module Coordinator
    Module ID: workLength
    Display Name: Work Length
    Tab: Browse

    Submodules (imported directly as ES modules):
        1. ./lengthDisplay.js -- badges, book comparisons, page count
        2. ./readingTime.js   -- time estimation (WPM), per-chapter time, listing time

    Panel config keys:
        showPageEquiv       -- show '~X pages' badge
        readSpeed           -- slow | average | fast | custom
        customWPM           -- number (used when readSpeed === 'custom')
        showEstimate        -- master toggle for reading time
        estimateFicPage     -- show time on /works/:id pages
        estimatePerChapter  -- show per-chapter time
        estimateListings    -- show time on listing blurbs

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './workLength.css?inline';

import { LengthDisplay } from './lengthDisplay.js';
import { ReadingTime } from './readingTime.js';

css(styles, 'ao3h-workLength');

const NS   = 'ao3h';
const MOD  = 'workLength';

const DEFAULTS = {
  showPageEquiv:      false,
  readSpeed:          'average',
  customWPM:          250,
  showEstimate:       true,
  estimateFicPage:    true,
  estimatePerChapter: true,
  estimateListings:   false,
  showLengthCategory: true,
  thresholdShort:     17500,
  thresholdNovella:   60000,
};

function loadSettings() {
  try { const v = localStorage.getItem(`${NS}:mod:${MOD}:settings`); return v ? JSON.parse(v) : {}; }
  catch { return {}; }
}

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
