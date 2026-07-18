/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Blocking Stats

All-time counters of how many works and comments/notes have actually been
hidden because their author was blocked. Shared by authorBlocking.js and
commentHiding.js (each bumps its own field), and displayed by
blocklistManagement.js.

═══════════════════════════════════════════════════════════════════════════ */

const STATS_KEY = 'userBlocker:hiddenStats';

function loadStats () {
  try {
    const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    return { works: 0, comments: 0, ...stats };
  } catch (_) {
    return { works: 0, comments: 0 };
  }
}

function saveStats (stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (_) { /* unavailable */ }
}

/**
 * Increments an all-time hidden-content counter by 1.
 * @param {'works'|'comments'} field
 */
export function bumpHiddenStat (field) {
  const stats = loadStats();
  stats[field] = (stats[field] || 0) + 1;
  saveStats(stats);
}

/** Current all-time counters, for display in the blocklist management panel. */
export function getHiddenStats () {
  return loadStats();
}
