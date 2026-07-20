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
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

/** Parses AO3's "3/10" (or "5/?") chapters stat. total is null when unknown. */
export function parseChapterProgress (text) {
  const m = String(text || '').trim().match(/^(\d+)\s*\/\s*(\d+|\?)$/);
  if (!m) return null;
  return { published: parseInt(m[1], 10), total: m[2] === '?' ? null : parseInt(m[2], 10) };
}

/** Average words per published chapter (null when unknown). */
export function avgChapterWords (words, publishedChapters) {
  if (!Number.isFinite(words) || !Number.isFinite(publishedChapters) || publishedChapters < 1) return null;
  return Math.round(words / publishedChapters);
}

/** Estimated words left after finishing a chapter, assuming even chapter sizes. */
export function remainingWordsAfterChapter (words, currentChapter, publishedChapters) {
  if (!Number.isFinite(words) || !Number.isFinite(currentChapter) || !Number.isFinite(publishedChapters)) return null;
  if (publishedChapters < 1 || currentChapter < 1 || currentChapter > publishedChapters) return null;
  return Math.round(words * (publishedChapters - currentChapter) / publishedChapters);
}

/** Returns 'yes', 'maybe', or 'no' for the next occurrence of targetHHMM. */
export function canFinishBy (minutesNeeded, targetHHMM, now = new Date()) {
  const m = String(targetHHMM || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hours = parseInt(m[1], 10), minutes = parseInt(m[2], 10);
  if (hours > 23 || minutes > 59 || !Number.isFinite(minutesNeeded)) return null;

  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);

  const available = (target.getTime() - now.getTime()) / 60000;
  if (minutesNeeded <= available) return 'yes';
  if (minutesNeeded <= available * 1.2) return 'maybe';
  return 'no';
}

/** Background tint for a word count relative to the listing's range. */
export function gradientColor (words, min, max) {
  const span = max - min;
  const t = span > 0 ? Math.min(Math.max((words - min) / span, 0), 1) : 0;
  const alpha = (0.06 + t * 0.3).toFixed(3);
  return `hsla(220, 70%, 50%, ${alpha})`;
}

/** Parses custom book comparisons, one "Title: words" entry per line. */
export function parseCustomBooks (text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const m = line.match(/^(.+?)\s*[:=]\s*([\d,\s]+)$/);
      if (!m) return null;
      const words = parseInt(m[2].replace(/[,\s]/g, ''), 10);
      const title = m[1].trim();
      return title && Number.isFinite(words) && words > 0 ? { title, words } : null;
    })
    .filter(Boolean);
}

/** Page-count label in the configured format. */
export function formatPages (pages, format = 'compact') {
  return format === 'full' ? `~${pages} pages` : `~${pages} pg`;
}

export const lengthMathHelpers = {
  parseChapterProgress,
  avgChapterWords,
  remainingWordsAfterChapter,
  canFinishBy,
  gradientColor,
  parseCustomBooks,
  formatPages,
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

  const lengthDisplay = new LengthDisplay(NS, cfg, lengthMathHelpers);
  const readingTime   = new ReadingTime(NS, cfg, lengthMathHelpers);

  const cleanupLD = lengthDisplay.setup();
  const cleanupRT = readingTime.setup();

  return function cleanup() {
    cleanupLD?.();
    cleanupRT?.();
    lengthDisplay.reset();
    readingTime.reset();
  };
});
