/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker › POV Analysis

Classifies work blurbs from POV-related tag and summary signals, then caches
the result per work for reuse by the presentation layer.

Notes

- Supported classifications are first, second, third, mixed, multi, and unknown.
- Cache entries contain POV, confidence, and last-updated fields.
- Entries expire after seven days and are pruned during initialization.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { lsGet, lsSet } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = 'ao3h_pov_tracker_data_v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const SIGNALS = {
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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CACHE STORAGE
═══════════════════════════════════════════════════════════════════════════ */

function loadCache () {
  return lsGet(CACHE_KEY) || {};
}
function saveCache (cache) {
  lsSet(CACHE_KEY, cache);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — POV SIGNAL DETECTION
═══════════════════════════════════════════════════════════════════════════ */

function detectPov (blurb) {
  // Collect text from tags and summary
  const tagEls   = blurb.querySelectorAll('.tags .tag');
  const summaryEl = blurb.querySelector('blockquote.userstuff, .summary');

  const tagTexts = Array.from(tagEls).map(el => el.textContent);
  const summaryText = summaryEl ? summaryEl.textContent : '';
  const allText  = tagTexts.concat([summaryText]).join(' ');

  const hits = { first: 0, second: 0, third: 0, multi: 0 };

  for (const [pov, patterns] of Object.entries(SIGNALS)) {
    for (const re of patterns) {
      if (re.test(allText)) { hits[pov]++; break; }
    }
  }

  if (hits.multi > 0) return { pov: 'multi',   confidence: 'high' };

  const detected = Object.entries(hits).filter(([, n]) => n > 0).map(([k]) => k);

  if (detected.length === 0)  return { pov: 'unknown', confidence: 'low' };
  if (detected.length > 1)    return { pov: 'mixed',   confidence: 'high' };

  return { pov: detected[0], confidence: 'high' };
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

export class PovAnalysis {
  constructor () {
    this._cache = {};
    this._dirty = false;
  }

  init () {
    this._cache = loadCache();
    this._pruneCache();
  }

  /**
   * Get (or detect + cache) the POV classification for a blurb element.
   * @param {string} workId
   * @param {Element} blurb
   * @returns {{ pov: string, confidence: string }}
   */
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

  /**
   * Return the cached entry for a workId without triggering fresh detection.
   * Returns { pov, confidence } or null if not cached / expired.
   */
  getFromCache (workId) {
    const now   = Date.now();
    const entry = this._cache[workId];
    if (!entry || (now - entry.lastUpdated) >= CACHE_TTL) return null;
    return { pov: entry.pov, confidence: entry.confidence };
  }

  /**
   * Force re-analysis for a specific workId (clears cache entry).
   */
  reanalyze (workId, blurb) {
    delete this._cache[workId];
    const result = this.getOrDetect(workId, blurb);
    this.flush();
    return result;
  }

  /**
   * Persist the in-memory cache to localStorage.
   * Call this once after a batch of getOrDetect() calls.
   */
  flush () {
    if (this._dirty) {
      saveCache(this._cache);
      this._dirty = false;
    }
  }

  /**
   * Return full cache — used by presentation for stats panel.
   */
  getStats () {
    const counts = { first: 0, second: 0, third: 0, mixed: 0, multi: 0, unknown: 0 };
    for (const entry of Object.values(this._cache)) {
      const k = entry.pov;
      if (k in counts) counts[k]++;
    }
    return counts;
  }

  destroy () {
    this.flush();
    this._cache = {};
    this._dirty = false;
  }

  _pruneCache () {
    const now    = Date.now();
    let changed  = false;
    for (const [id, entry] of Object.entries(this._cache)) {
      if ((now - entry.lastUpdated) >= CACHE_TTL) {
        delete this._cache[id];
        changed = true;
      }
    }
    if (changed) { this._dirty = true; this.flush(); }
  }
}
