/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Word Occurrence Math

Pure counting logic for the "how many times does this word appear" feature
— whole-word, case-insensitive matching over a text blob.

═══════════════════════════════════════════════════════════════════════════ */

function _escapeRegex (s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Counts whole-word, case-insensitive occurrences of `word` in `text`.
 * Multi-word phrases ("Harry Potter") are matched as a literal phrase.
 * @returns {number} 0 for an empty word or no matches.
 */
export function countOccurrences (text, word) {
  const needle = String(word || '').trim();
  if (!needle) return 0;
  let re;
  try {
    re = new RegExp(`\\b${_escapeRegex(needle)}\\b`, 'gi');
  } catch {
    return 0;
  }
  return (String(text || '').match(re) || []).length;
}
