/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker › Full-Text Analysis

Pronoun-frequency heuristics used when the full text of a chapter is
available (work/chapter pages), as a more accurate complement to the
tag/summary detection used on listing blurbs. Requires a minimum amount of
text before returning a verdict, to avoid classifying from a near-empty
sample (e.g. a chapter that hasn't finished rendering).

═══════════════════════════════════════════════════════════════════════════ */

export const MIN_ANALYZABLE_CHARS = 200;

const PRONOUN_PATTERNS = {
  first:  /\b(i|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi,
  second: /\b(you|your|yours|yourself|yourselves)\b/gi,
  third:  /\b(he|him|his|himself|she|her|hers|herself|they|them|their|theirs|themselves)\b/gi,
};

/** Counts first/second/third-person pronoun occurrences in a block of text. */
export function countPronouns (text) {
  const counts = { first: 0, second: 0, third: 0 };
  const str = String(text || '');
  for (const [key, re] of Object.entries(PRONOUN_PATTERNS)) {
    const matches = str.match(re);
    counts[key] = matches ? matches.length : 0;
  }
  return counts;
}

/**
 * Classifies pronoun counts into a POV verdict.
 * @param {{first:number, second:number, third:number}} counts
 * @returns {{pov: string, confidence: 'high'|'low'}|null} null when there are
 *   no pronoun hits at all (nothing to classify from).
 */
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

/**
 * Analyzes a chapter's full prose text. Returns null when the sample is too
 * short to trust (see MIN_ANALYZABLE_CHARS) or contains no pronoun signal.
 * @param {string} text
 * @returns {{pov: string, confidence: string, sampleSize: number}|null}
 */
export function analyzeChapterText (text) {
  const clean = String(text || '').trim();
  if (clean.length < MIN_ANALYZABLE_CHARS) return null;

  const counts = countPronouns(clean);
  const result = classifyByPronounCounts(counts);
  if (!result) return null;

  return { ...result, sampleSize: counts.first + counts.second + counts.third };
}
