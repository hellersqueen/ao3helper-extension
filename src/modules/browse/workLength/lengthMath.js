/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Work Length › Length Math

Pure helpers behind the Work Length badges: chapter progress parsing,
per-chapter averages, remaining-time estimates, "can I finish by …?"
verdicts, listing color gradients, and user-defined book comparisons.

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

/**
 * Estimated words left after finishing chapter `currentChapter`, assuming
 * evenly sized chapters. Null when the position is unknown or out of range.
 */
export function remainingWordsAfterChapter (words, currentChapter, publishedChapters) {
  if (!Number.isFinite(words) || !Number.isFinite(currentChapter) || !Number.isFinite(publishedChapters)) return null;
  if (publishedChapters < 1 || currentChapter < 1 || currentChapter > publishedChapters) return null;
  return Math.round(words * (publishedChapters - currentChapter) / publishedChapters);
}

/**
 * Can a read of `minutesNeeded` finish before the next occurrence of
 * `targetHHMM` ("23:30")? Returns 'yes' | 'maybe' (up to 20% over) | 'no',
 * or null when the target is not a valid time.
 */
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

/**
 * Background tint for a word count relative to the listing's range —
 * faint for the shortest works, stronger for the longest (single neutral
 * hue, so no good/bad connotation).
 */
export function gradientColor (words, min, max) {
  const span = max - min;
  const t = span > 0 ? Math.min(Math.max((words - min) / span, 0), 1) : 0;
  const alpha = (0.06 + t * 0.3).toFixed(3);
  return `hsla(220, 70%, 50%, ${alpha})`;
}

/**
 * Parses the user's own comparison books, one per line:
 *   "My Favorite Doorstopper: 250,000"
 * Also accepts "=" as separator. Invalid lines are skipped.
 * @returns {{ title: string, words: number }[]}
 */
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
