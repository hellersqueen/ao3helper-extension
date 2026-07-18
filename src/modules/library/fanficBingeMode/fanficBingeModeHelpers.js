/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fanfic Binge Mode › Helpers

Pure computations backing _fanficBingeMode.js: queue priority cycling and
ordering, and resumable-history filtering for the homepage panel.

═══════════════════════════════════════════════════════════════════════════ */

// Legacy entries only ever used 'normal' | 'high' — folded into 'medium' here.
export const PRIORITY_LEVELS = ['low', 'medium', 'high'];

export const PRIORITY_ICON = { low: '⚪', medium: '⭐', high: '🌟' };

function normalizePriority (priority) {
  if (priority === 'normal') return 'medium';
  return PRIORITY_LEVELS.includes(priority) ? priority : 'medium';
}

export function nextPriority (current) {
  const idx = PRIORITY_LEVELS.indexOf(normalizePriority(current));
  return PRIORITY_LEVELS[(idx + 1) % PRIORITY_LEVELS.length];
}

export function priorityRank (priority) {
  return PRIORITY_LEVELS.indexOf(normalizePriority(priority));
}

export function priorityIcon (priority) {
  return PRIORITY_ICON[normalizePriority(priority)];
}

/** The queue entry to auto-open next: highest priority first, ties keep queue order. */
export function pickNextQueueEntry (queue) {
  if (!queue || !queue.length) return null;
  return queue.reduce((best, entry) =>
    priorityRank(entry.priority) > priorityRank(best.priority) ? entry : best
  );
}

/** True when a history entry still has unread chapters (or completion is unknown). */
export function isResumable (entry) {
  if (!entry) return false;
  if (!entry.totalChapters || !entry.chapter) return true;
  return entry.chapter < entry.totalChapters;
}

export function resumableEntries (history, limit) {
  return (history || []).filter(isResumable).slice(0, limit);
}
