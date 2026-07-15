/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker: Analysis
    Module ID: povTracker (helper — instantiated by _povTracker.js)
    Class:     PovAnalysis
    Role:      Pronoun heuristics from tag/summary text + localStorage cache

    POV detection strategy:
        1. Parse the work's tags + summary DOM for pronoun signals
        2. Classify as: 'first', 'second', 'third', 'mixed', 'multi', 'unknown'
        3. Cache result in ao3h_pov_tracker_data_v1 keyed by workId

    Cache schema (per entry):
        { pov: string, confidence: 'high'|'low', lastUpdated: number }

═══════════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = 'ao3h_pov_tracker_data_v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ── Regex signal tables ───────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────
import { lsGet, lsSet } from '../../../../lib/utils/index.js';

function loadCache () {
  return lsGet(CACHE_KEY) || {};
}
function saveCache (cache) {
  lsSet(CACHE_KEY, cache);
}

// ── Detection logic ───────────────────────────────────────────────────────
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

// ── Class ─────────────────────────────────────────────────────────────────
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

  // ── Private ─────────────────────────────────────────────────────────────
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
