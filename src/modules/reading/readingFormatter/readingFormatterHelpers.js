/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Formatter › Pure Helpers

Pure computations backing the chantier-4 additions: long-paragraph detection
(Breathe mode), wall-of-text splitting, paste-artifact cleanup, and
dialogue-span detection.

═══════════════════════════════════════════════════════════════════════════ */

export const LONG_PARAGRAPH_CHARS = 600;   // Breathe mode threshold
export const WALL_OF_TEXT_CHARS   = 1500;  // splitting threshold
export const WALL_TARGET_CHARS    = 500;   // aimed chunk size when splitting

export function isLongParagraph (text, threshold = LONG_PARAGRAPH_CHARS) {
  return typeof text === 'string' && text.length >= threshold;
}

/**
 * Split a wall of text into readable chunks at sentence boundaries.
 * Returns [text] unchanged when below the threshold or nothing to split on.
 */
export function splitWallText (text, {
  wallThreshold = WALL_OF_TEXT_CHARS,
  targetLen = WALL_TARGET_CHARS,
} = {}) {
  if (typeof text !== 'string' || text.length < wallThreshold) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+["'”’)\]]*\s*/g);
  if (!sentences || sentences.length < 2) return [text];

  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && (current.length + sentence.length) > targetLen) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 1 ? chunks : [text];
}

/** Collapse non-breaking-space runs (Word paste artifacts) to plain spaces.
 *  The character classes below contain literal U+00A0, U+2007 and U+202F —
 *  invisible in most editors but intentional. */
export function cleanPasteArtifacts (text) {
  if (typeof text !== 'string') return text;
  return text.replace(/[   ]+/g, ' ');
}

/** True when a paragraph's text is only whitespace/nbsp (an empty filler <p>). */
export function isEmptyParagraphText (text) {
  return typeof text === 'string' && text.replace(/[\s   ]/g, '') === '';
}

/**
 * Find quoted dialogue spans in a text string.
 * Handles “smart” quotes and straight double quotes (paired within the text).
 * @returns {Array<{start: number, end: number}>} indexes covering the quotes
 */
export function findDialogueSpans (text) {
  if (typeof text !== 'string' || !text) return [];
  const spans = [];
  const re = /“[^”]{1,500}”|"[^"]{1,500}"/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  return spans;
}
