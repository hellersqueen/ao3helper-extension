/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — POV Tracker Coordinator

    Module ID: povTracker
    Display Name: POV Tracker
    Tab: Explore

    Purpose

    Coordinates cached point-of-view analysis with badges, filters, and listing
    presentation controls.

    Submodules

    - povAnalysis.js: pronoun heuristics and analysis cache
    - povPresentation.js: badge injection, filtering, and statistics

    Notes

    - The initialized analysis instance is exposed through AO3H_PovTracker.
    - User settings and analysis results use separate storage keys.
    - Cleanup destroys presentation before analysis and removes the shared API.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './povTracker.css?inline';

import { PovAnalysis } from './povAnalysis.js';
import { PovPresentation } from './povPresentation.js';
import { PovDetailPanel } from './povDetailPanel.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export const VALID_POV_KEYS = ['first', 'second', 'third', 'mixed', 'multi', 'unknown'];

export function parsePreferredPovs (raw) {
  return String(raw || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(value => VALID_POV_KEYS.includes(value));
}

export const MIN_ANALYZABLE_CHARS = 200;

const PRONOUN_PATTERNS = {
  first:  /\b(i|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi,
  second: /\b(you|your|yours|yourself|yourselves)\b/gi,
  third:  /\b(he|him|his|himself|she|her|hers|herself|they|them|their|theirs|themselves)\b/gi,
};

export function countPronouns (text) {
  const counts = { first: 0, second: 0, third: 0 };
  const value = String(text || '');
  for (const [key, pattern] of Object.entries(PRONOUN_PATTERNS)) {
    const matches = value.match(pattern);
    counts[key] = matches ? matches.length : 0;
  }
  return counts;
}

export function classifyByPronounCounts (counts) {
  const total = counts.first + counts.second + counts.third;
  if (total === 0) return null;
  const [[topKey, topCount], [, secondCount]] =
    Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topShare = topCount / total;
  if (topShare < 0.65 && secondCount / total >= 0.25) {
    return { pov: 'mixed', confidence: 'low' };
  }
  return { pov: topKey, confidence: topShare >= 0.85 ? 'high' : 'low' };
}

export function analyzeChapterText (text) {
  const clean = String(text || '').trim();
  if (clean.length < MIN_ANALYZABLE_CHARS) return null;
  const counts = countPronouns(clean);
  const result = classifyByPronounCounts(counts);
  if (!result) return null;
  return { ...result, sampleSize: counts.first + counts.second + counts.third };
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-povTracker');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'povTracker';
const LOG  = `[AO3H][${MOD}]`;

const DEFAULTS = {
  showBadgesOnBlurbs : true,
  badgeFirst         : true,
  badgeSecond        : false,
  badgeThird         : true,
  badgeMixed         : false,
  badgeMulti         : false,
  badgeUnknown       : false,
  enablePovFilters   : true,
  autoAnalyze        : true,
  showStats          : false,
  analyzeFullText    : true,
  showDetailPanel    : true,
  autoApplyPreferredFilter : false,
  preferredPovs      : '',
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Analysis and presentation communicate through the shared API created below.


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'POV Tracker',
  enabledByDefault : false,
}, async function init () {
  console.log(`${LOG} init`);

  const analysis     = new PovAnalysis({ analyzeChapterText });
  const presentation = new PovPresentation({ cfg, NS, parsePreferredPovs });
  const detailPanel  = new PovDetailPanel({ cfg });

  analysis.init();

  // Expose shared API after analysis is initialised (cache loaded + pruned)
  W.AO3H_PovTracker = { cfg, NS, LOG, _analysis: analysis };

  presentation.init();
  detailPanel.init();

  return function cleanup () {
    detailPanel.destroy();
    presentation.destroy();
    analysis.destroy();
    delete W.AO3H_PovTracker;
  };
});
