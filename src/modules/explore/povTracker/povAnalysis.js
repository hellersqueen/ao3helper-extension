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
  /**
   * @param {{ analyzeChapterText?: (text: string) => ({ pov: string, confidence: string }|null) }} [opts]
   */
  constructor ({ analyzeChapterText } = {}) {
    this._cache = {};
    this._dirty = false;
    this._analyzeChapterText = analyzeChapterText || (() => null);
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
   * Records a full-text analysis result for one chapter of a work (called
   * from the work-page detail panel, as chapters are actually read — this
   * never fetches or analyzes chapters proactively). Updates the entry in
   * place, keyed by chapterId so re-visiting a chapter replaces its result
   * rather than duplicating it. Returns null when the text is too short or
   * has no pronoun signal (see the helpers injected by _povTracker.js).
   * @param {string} workId
   * @param {string} chapterId
   * @param {string} label - Display label for this chapter (e.g. its title)
   * @param {string} text - Full chapter prose
   */
  recordChapterAnalysis (workId, chapterId, label, text) {
    const result = this._analyzeChapterText(text);
    if (!result) return null;

    const now = Date.now();
    const entry = this._cache[workId] || {};
    const chapters = entry.chapters ? entry.chapters.slice() : [];
    const record = { chapterId, label: label || 'Chapter', ...result, lastUpdated: now };
    const idx = chapters.findIndex((c) => c.chapterId === chapterId);
    if (idx >= 0) chapters[idx] = record; else chapters.push(record);

    this._cache[workId] = { ...entry, chapters, lastUpdated: entry.lastUpdated || now };
    this._dirty = true;
    return record;
  }

  /** Full-text chapter analyses recorded so far for a work, in visit order. */
  getChapterAnalyses (workId) {
    return this._cache[workId]?.chapters || [];
  }

  /**
   * Best-available POV verdict for a work: combines full-text chapter
   * analyses (more reliable) when any exist, falling back to the
   * tag/summary-based result used for blurbs. When chapters disagree, the
   * verdict is 'multi' with high confidence — this is more accurate than
   * the tag-only heuristic for fics that don't explicitly tag themselves as
   * multi-POV.
   * @param {string} workId
   * @returns {{pov: string, confidence: string, chapters: Array}|null}
   */
  getCombinedResult (workId) {
    const chapters = this.getChapterAnalyses(workId);
    if (chapters.length === 1) {
      return { pov: chapters[0].pov, confidence: chapters[0].confidence, chapters };
    }
    if (chapters.length > 1) {
      const distinct = new Set(chapters.map((c) => c.pov));
      return distinct.size > 1
        ? { pov: 'multi', confidence: 'high', chapters }
        : { pov: chapters[0].pov, confidence: 'high', chapters };
    }
    const entry = this._cache[workId];
    return entry?.pov ? { pov: entry.pov, confidence: entry.confidence, chapters: [] } : null;
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
