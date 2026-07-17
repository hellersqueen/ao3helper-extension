/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Surprise Me › Draw History

Keeps a capped, most-recent-first log of past random draws so the module can
avoid immediately re-suggesting the same work and so the config panel can show
"what did I draw recently".

═══════════════════════════════════════════════════════════════════════════ */

export const KEY_SURPRISE_ME_HISTORY = 'ao3h:surpriseMe:history';

const MAX_HISTORY = 50;
// How many of the most recent draws are excluded from the next draw's pool.
const AVOID_REPEAT_WINDOW = 20;

export function loadHistory() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY_SURPRISE_ME_HISTORY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try { localStorage.setItem(KEY_SURPRISE_ME_HISTORY, JSON.stringify(list)); } catch { /* unavailable */ }
}

/**
 * Prepends a draw to the history log, capped at MAX_HISTORY entries.
 * @param {{ id: string, title: string, href: string }} entry
 */
export function recordDraw(entry) {
  if (!entry?.id) return;
  const list = loadHistory();
  list.unshift({ id: entry.id, title: entry.title || '(untitled)', href: entry.href || null, at: Date.now() });
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
  saveHistory(list);
}

export function clearHistory() {
  saveHistory([]);
}

/**
 * IDs drawn within the last AVOID_REPEAT_WINDOW entries — used to skip
 * immediate repeats without permanently blocking a work from ever recurring.
 * @returns {Set<string>}
 */
export function getRecentDrawIds() {
  return new Set(loadHistory().slice(0, AVOID_REPEAT_WINDOW).map(e => String(e.id)));
}
