/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — User Relationships Coordinator

    Module ID: userRelationships
    Display Name: User Relationships
    Tab: Navigate & Interact

    Purpose

    Coordinates author preferences, tracking, blocking, blocklist management,
    and the filtering of works, comments, and bookmark notes.

    Submodules

    - authorBlocking.js: hides listing blurbs from blocked authors
    - authorPreference.js: per-author visibility, favorite, priority, and tag controls
    - authorTracking.js: followed-author notes and new-work detection
    - authorCard.js: read-only hover popover summarizing an author's status
    - blockingInterface.js: contextual block and unblock actions (whole account or one pseud)
    - blocklistManagement.js: blocklist editing interface (with reasons and stats)
    - commentHiding.js: filters blocked-user comments and bookmark notes

    Notes

    - Shared defaults are defined before child modules start.
    - Runtime feature behavior is delegated entirely to the submodules.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Settings } from '../../../../lib/utils/config.js';
import { css } from '../../../../lib/utils/index.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import styles from './userRelationships.css?inline';

import './authorBlocking.js';
import './authorPreference.js';
import './authorTracking.js';
import './authorCard.js';
import './blockingInterface.js';
import './blocklistManagement.js';
import './commentHiding.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-userRelationships');

const MOD  = 'userRelationships';
const W    = getGlobalWindow();
const STATS_KEY = 'userBlocker:hiddenStats';

export const DEFAULTS = {
  favoritesOnlyFilter: false,
  showPlaceholder: true,
  tempRevealHidden: false,
};

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

export function parseUserHref (href) {
  const match = String(href || '').match(/\/users\/([^/?#]+)(?:\/pseuds\/([^/?#]+))?/);
  if (!match) return null;
  return { username: decodeURIComponent(match[1]), pseud: match[2] ? decodeURIComponent(match[2]) : null };
}
export function accountKey (username) { return String(username || '').trim().toLowerCase(); }
export function pseudKey (username, pseud) {
  return `${accountKey(username)}/${String(pseud || '').trim().toLowerCase()}`;
}
export function isBlockedIdentity (blockedSet, username, pseud) {
  if (!username || !blockedSet) return false;
  return blockedSet.has(accountKey(username)) || Boolean(pseud && blockedSet.has(pseudKey(username, pseud)));
}
export function describeIdentity (key) {
  const [username, pseud] = String(key || '').split('/');
  return pseud ? `${username} (pseud: ${pseud})` : username;
}
export const PRIORITY_LEVELS = ['normal', 'high', 'low'];
export function cyclePriority (current) {
  const index = PRIORITY_LEVELS.indexOf(current);
  return PRIORITY_LEVELS[(index + 1) % PRIORITY_LEVELS.length];
}
export function priorityIcon (priority) { return { high: '🔥', low: '💤' }[priority] || ''; }
export function parseTags (raw) {
  const seen = new Set();
  const tags = [];
  String(raw || '').split(',').forEach(value => {
    const tag = value.trim();
    if (!tag || seen.has(tag.toLowerCase())) return;
    seen.add(tag.toLowerCase());
    tags.push(tag);
  });
  return tags;
}
export function sortByKudosURL (href) {
  const url = new URL(href);
  url.searchParams.set('work_search[sort_column]', 'kudos_count');
  return url.toString();
}

export function getUserRelationshipsSettings () {
  return loadModuleSettings(MOD, DEFAULTS);
}

function loadHiddenStats () {
  try { return { works: 0, comments: 0, ...JSON.parse(localStorage.getItem(STATS_KEY) || '{}') }; }
  catch { return { works: 0, comments: 0 }; }
}

export function bumpHiddenStat (field) {
  const stats = loadHiddenStats();
  stats[field] = (stats[field] || 0) + 1;
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { /* unavailable */ }
}

export function getHiddenStats () { return loadHiddenStats(); }

const relationshipHelpers = {
  parseUserHref, accountKey, pseudKey, isBlockedIdentity, describeIdentity,
  cyclePriority, priorityIcon, parseTags, sortByKudosURL,
  getUserRelationshipsSettings, bumpHiddenStat, getHiddenStats,
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'User Relationships',
  enabledByDefault: false,
}, async function init () {
  await Settings.define(MOD, DEFAULTS);
  W.AO3H_UserRelationships = relationshipHelpers;
  return () => { delete W.AO3H_UserRelationships; };
});
