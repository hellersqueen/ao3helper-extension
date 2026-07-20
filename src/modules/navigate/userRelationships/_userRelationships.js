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
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
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
  return { works: 0, comments: 0, ...lsGet(STATS_KEY, {}) };
}

export function bumpHiddenStat (field) {
  const stats = loadHiddenStats();
  stats[field] = (stats[field] || 0) + 1;
  lsSet(STATS_KEY, stats);
}

export function getHiddenStats () { return loadHiddenStats(); }

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED STORAGE — READ ACCESSORS FOR SIBLING SUBMODULES

   Each key below has exactly one *owner* submodule that also writes it
   (authorTracking.js for followed/notes, authorPreference.js for prefs,
   blockingInterface.js/blocklistManagement.js for the blocklist) — these
   accessors exist so read-only consumers (authorCard.js, authorBlocking.js,
   commentHiding.js) don't each reimplement the same JSON localStorage read.
═══════════════════════════════════════════════════════════════════════════ */

const BLOCKLIST_KEY = 'userBlocker:list';
const REASONS_KEY   = 'userBlocker:reasons';
const FOLLOWED_KEY  = 'authorTracking:followed';
const NOTES_KEY     = 'authorTracking:notes';
const PREFS_KEY     = 'authorPreferences:data';

export function getBlockedList () {
  return lsGet(BLOCKLIST_KEY, []).map(u => String(u).toLowerCase());
}
export function saveBlockedList (arr) { lsSet(BLOCKLIST_KEY, arr); }

export function getBlockReasons () { return lsGet(REASONS_KEY, {}); }
export function saveBlockReasons (reasons) { lsSet(REASONS_KEY, reasons); }

export function getFollowedAuthors () { return new Set(lsGet(FOLLOWED_KEY, [])); }
export function saveFollowedAuthors (set) { lsSet(FOLLOWED_KEY, [...set]); }

export function getAuthorNotes () { return lsGet(NOTES_KEY, {}); }
export function saveAuthorNotes (notes) { lsSet(NOTES_KEY, notes); }

export function getAuthorPrefsMap () { return lsGet(PREFS_KEY, {}); }
export function saveAuthorPrefsMap (map) { lsSet(PREFS_KEY, map); }
export function getAuthorPrefsFor (author) {
  return { hidden: false, favorite: false, readCount: 0, priority: 'normal', tags: [], ...getAuthorPrefsMap()[author] };
}

const relationshipHelpers = {
  parseUserHref, accountKey, pseudKey, isBlockedIdentity, describeIdentity,
  cyclePriority, priorityIcon, parseTags, sortByKudosURL,
  getUserRelationshipsSettings, bumpHiddenStat, getHiddenStats,
  getBlockedList, saveBlockedList, getBlockReasons, saveBlockReasons,
  getFollowedAuthors, saveFollowedAuthors, getAuthorNotes, saveAuthorNotes,
  getAuthorPrefsMap, saveAuthorPrefsMap, getAuthorPrefsFor,
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
