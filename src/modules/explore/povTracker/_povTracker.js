/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — POV Tracker Coordinator

    Module ID: povTracker
    Display Name: POV Tracker
    Tab: Explore

    Purpose

    Coordinates cached point-of-view analysis with badges, filters, and listing
    presentation controls.

    Submodules

    - povPresentation.js: badge injection, filtering, and statistics
    - povDetailPanel.js: work-page verdict and chapter breakdown

    Notes

    - Analysis heuristics and cache ownership live in this coordinator.
    - User settings and analysis results use separate storage keys.
    - Cleanup destroys both UI components before analysis and removes the shared API.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './povTracker.css?inline';

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

const CACHE_KEY = 'ao3h_pov_tracker_data_v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const PRONOUN_PATTERNS = {
  first:  /\b(i|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi,
  second: /\b(you|your|yours|yourself|yourselves)\b/gi,
  third:  /\b(he|him|his|himself|she|her|hers|herself|they|them|their|theirs|themselves)\b/gi,
};

const BLURB_SIGNALS = {
  first: [
    /\bpov[\s:_-]*first[\s_-]*person\b/i,
    /\bfirst[\s_-]*person[\s_-]*(?:pov|narrat)/i,
    /\b1st[\s_-]*person\b/i,
    /\bi\/me\s+narrator\b/i,
    /\bI-narrator\b/i,
  ],
  second: [
    /\bpov[\s:_-]*second[\s_-]*person\b/i,
    /\bsecond[\s_-]*person[\s_-]*(?:pov|narrat)/i,
    /\b2nd[\s_-]*person\b/i,
    /\breader[\s_-]*insert\b/i,
    /\byou-centric\b/i,
  ],
  third: [
    /\bpov[\s:_-]*third[\s_-]*person\b/i,
    /\bthird[\s_-]*person[\s_-]*(?:pov|narrat|limited|omniscient)\b/i,
    /\b3rd[\s_-]*person\b/i,
  ],
  multi: [
    /\bmultiple[\s_-]*pov[s]?\b/i,
    /\balternating[\s_-]*pov[s]?\b/i,
    /\bmulti[\s_-]*pov[s]?\b/i,
    /\bpov[\s_-]*switch/i,
  ],
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

function detectPov (blurb) {
  const tagTexts = Array.from(blurb.querySelectorAll('.tags .tag')).map(el => el.textContent);
  const summaryText = blurb.querySelector('blockquote.userstuff, .summary')?.textContent || '';
  const allText = tagTexts.concat([summaryText]).join(' ');
  const hits = { first: 0, second: 0, third: 0, multi: 0 };

  for (const [pov, patterns] of Object.entries(BLURB_SIGNALS)) {
    for (const pattern of patterns) {
      if (pattern.test(allText)) {
        hits[pov]++;
        break;
      }
    }
  }

  if (hits.multi > 0) return { pov: 'multi', confidence: 'high' };
  const detected = Object.entries(hits).filter(([, count]) => count > 0).map(([pov]) => pov);
  if (detected.length === 0) return { pov: 'unknown', confidence: 'low' };
  if (detected.length > 1) return { pov: 'mixed', confidence: 'high' };
  return { pov: detected[0], confidence: 'high' };
}

export class PovAnalysis {
  constructor () {
    this._cache = {};
    this._dirty = false;
  }

  init () {
    this._cache = lsGet(CACHE_KEY) || {};
    this._pruneCache();
  }

  getOrDetect (workId, blurb) {
    const now = Date.now();
    const entry = this._cache[workId];
    if (entry && (now - entry.lastUpdated) < CACHE_TTL) {
      return { pov: entry.pov, confidence: entry.confidence };
    }
    const result = detectPov(blurb);
    this._cache[workId] = { ...result, lastUpdated: now };
    this._dirty = true;
    return result;
  }

  getFromCache (workId) {
    const now = Date.now();
    const entry = this._cache[workId];
    if (!entry || (now - entry.lastUpdated) >= CACHE_TTL) return null;
    return { pov: entry.pov, confidence: entry.confidence };
  }

  reanalyze (workId, blurb) {
    delete this._cache[workId];
    const result = this.getOrDetect(workId, blurb);
    this.flush();
    return result;
  }

  flush () {
    if (!this._dirty) return;
    lsSet(CACHE_KEY, this._cache);
    this._dirty = false;
  }

  recordChapterAnalysis (workId, chapterId, label, text) {
    const result = analyzeChapterText(text);
    if (!result) return null;

    const now = Date.now();
    const entry = this._cache[workId] || {};
    const chapters = entry.chapters ? entry.chapters.slice() : [];
    const record = { chapterId, label: label || 'Chapter', ...result, lastUpdated: now };
    const index = chapters.findIndex(chapter => chapter.chapterId === chapterId);
    if (index >= 0) chapters[index] = record;
    else chapters.push(record);

    this._cache[workId] = { ...entry, chapters, lastUpdated: entry.lastUpdated || now };
    this._dirty = true;
    return record;
  }

  getChapterAnalyses (workId) {
    return this._cache[workId]?.chapters || [];
  }

  getCombinedResult (workId) {
    const chapters = this.getChapterAnalyses(workId);
    if (chapters.length === 1) {
      return { pov: chapters[0].pov, confidence: chapters[0].confidence, chapters };
    }
    if (chapters.length > 1) {
      const distinct = new Set(chapters.map(chapter => chapter.pov));
      return distinct.size > 1
        ? { pov: 'multi', confidence: 'high', chapters }
        : { pov: chapters[0].pov, confidence: 'high', chapters };
    }
    const entry = this._cache[workId];
    return entry?.pov ? { pov: entry.pov, confidence: entry.confidence, chapters: [] } : null;
  }

  getStats () {
    const counts = { first: 0, second: 0, third: 0, mixed: 0, multi: 0, unknown: 0 };
    for (const entry of Object.values(this._cache)) {
      if (entry.pov in counts) counts[entry.pov]++;
    }
    return counts;
  }

  destroy () {
    this.flush();
    this._cache = {};
    this._dirty = false;
  }

  _pruneCache () {
    const now = Date.now();
    let changed = false;
    for (const [id, entry] of Object.entries(this._cache)) {
      if ((now - entry.lastUpdated) >= CACHE_TTL) {
        delete this._cache[id];
        changed = true;
      }
    }
    if (changed) {
      this._dirty = true;
      this.flush();
    }
  }
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

  const analysis     = new PovAnalysis();
  const presentation = new PovPresentation({ cfg, analysis, parsePreferredPovs });
  const detailPanel  = new PovDetailPanel({ cfg, analysis });

  analysis.init();

  // Expose shared API after analysis is initialised (cache loaded + pruned)
  W.AO3H_PovTracker = { cfg, NS, LOG };

  presentation.init();
  detailPanel.init();

  return function cleanup () {
    detailPanel.destroy();
    presentation.destroy();
    analysis.destroy();
    delete W.AO3H_PovTracker;
  };
});
