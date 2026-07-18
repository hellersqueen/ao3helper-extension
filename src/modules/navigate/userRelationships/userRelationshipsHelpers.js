/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Helpers

Pure logic shared by several submodules: parsing a user/pseud identity out of
an AO3 profile link, building/reading blocklist identity keys (so a block can
target a whole account or a single pseud), author priority cycling, and tag
parsing. Kept separate from the submodules so this can be tested without a
DOM/localStorage harness.

═══════════════════════════════════════════════════════════════════════════ */

/**
 * Parses a `/users/USERNAME` or `/users/USERNAME/pseuds/PSEUD` href.
 * @param {string} href
 * @returns {{username: string, pseud: string|null}|null}
 */
export function parseUserHref (href) {
  const m = String(href || '').match(/\/users\/([^/?#]+)(?:\/pseuds\/([^/?#]+))?/);
  if (!m) return null;
  return { username: decodeURIComponent(m[1]), pseud: m[2] ? decodeURIComponent(m[2]) : null };
}

/** Canonical blocklist key for blocking a whole account. */
export function accountKey (username) {
  return String(username || '').trim().toLowerCase();
}

/** Canonical blocklist key for blocking a single pseud of an account. */
export function pseudKey (username, pseud) {
  return `${accountKey(username)}/${String(pseud || '').trim().toLowerCase()}`;
}

/**
 * Whether {username, pseud} is covered by a set of blocklist identity keys
 * (each either a bare "username", or a pseud-scoped "username/pseud").
 * A whole-account block always covers all of that account's pseuds.
 */
export function isBlockedIdentity (blockedSet, username, pseud) {
  if (!username || !blockedSet) return false;
  if (blockedSet.has(accountKey(username))) return true;
  if (pseud && blockedSet.has(pseudKey(username, pseud))) return true;
  return false;
}

/** Human label for a blocklist identity key ("name" or "name (pseud: X)"). */
export function describeIdentity (key) {
  const [username, pseud] = String(key || '').split('/');
  return pseud ? `${username} (pseud: ${pseud})` : username;
}

export const PRIORITY_LEVELS = ['normal', 'high', 'low'];

/** Next priority level in the cycle: normal → high → low → normal. */
export function cyclePriority (current) {
  const idx = PRIORITY_LEVELS.indexOf(current);
  return PRIORITY_LEVELS[(idx + 1) % PRIORITY_LEVELS.length];
}

/** Icon for a priority level; '' for 'normal' (nothing to show). */
export function priorityIcon (priority) {
  return { high: '🔥', low: '💤' }[priority] || '';
}

/** Parses a comma-separated tag list into a deduplicated, trimmed array. */
export function parseTags (raw) {
  const seen = new Set();
  const out = [];
  String(raw || '').split(',').forEach((t) => {
    const tag = t.trim();
    if (!tag || seen.has(tag.toLowerCase())) return;
    seen.add(tag.toLowerCase());
    out.push(tag);
  });
  return out;
}

/** Builds the URL for an author's works page sorted by kudos (AO3's own sort, no scraping). */
export function sortByKudosURL (href) {
  const url = new URL(href);
  url.searchParams.set('work_search[sort_column]', 'kudos_count');
  return url.toString();
}
