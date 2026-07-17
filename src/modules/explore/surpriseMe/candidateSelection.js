/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Surprise Me › Candidate Selection

Pure, DOM-reading helper functions used to build and filter the pool of
eligible work blurbs before a random draw. Extracted from surpriseMe.js so the
selection logic (word-count parsing, completeness parsing, sampling) can be
unit-tested without booting the whole module.

═══════════════════════════════════════════════════════════════════════════ */

/**
 * Reads the "current/total" chapter count off a blurb and says whether the
 * work is complete (current === total, e.g. "3/3", not "2/?").
 * @param {Element} blurb
 * @returns {boolean}
 */
export function isCompleteWork(blurb) {
  const chapters = blurb.querySelector('dd.chapters');
  if (!chapters) return false;
  const txt = chapters.textContent.trim();
  const m = txt.match(/^(\d+)\/(\d+)$/);
  return !!m && m[1] === m[2];
}

/**
 * Parses the word count off a blurb's `dd.words`. Returns 0 when absent or
 * unparsable so a `minWords` filter of 0 never excludes anything.
 * @param {Element} blurb
 * @returns {number}
 */
export function getWordCount(blurb) {
  const txt = blurb.querySelector('dd.words')?.textContent || '';
  const n = parseInt(txt.replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Filters a list of candidate blurbs down to the ones eligible for a draw.
 * @param {Element[]} blurbs
 * @param {{ completedOnly?: boolean, minWords?: number }} opts
 * @returns {Element[]}
 */
export function filterEligible(blurbs, { completedOnly = false, minWords = 0 } = {}) {
  let out = blurbs;
  if (completedOnly) out = out.filter(isCompleteWork);
  if (minWords > 0) out = out.filter(b => getWordCount(b) >= minWords);
  return out;
}

/**
 * Samples up to `n` distinct random items from `list` (Fisher-Yates partial
 * shuffle — avoids reshuffling the whole array when n is small).
 * @param {Array} list
 * @param {number} n
 * @returns {Array}
 */
export function pickRandomSample(list, n) {
  const count = Math.max(0, Math.min(n, list.length));
  const pool = list.slice();
  const picked = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}
