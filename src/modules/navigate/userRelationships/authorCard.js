/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Author Card

Shows a small popover on hover over an author's name, summarizing what the
other User Relationships submodules already know about them (followed, note,
favorite, reading priority, tags, read count) without needing to click
anything. Purely a read-only aggregate view — it writes nothing.

Notes

- Reads authorTracking.js's/authorPreference.js's data through the shared
  read accessors on the coordinator (`W.AO3H_UserRelationships`), same as
  the shared blocklist readers — not by reimplementing the storage reads.
- A short hover delay avoids flickering the card while the mouse passes over.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'authorCard';
const NS  = 'ao3h';
const W = getGlobalWindow();
const parseUserHref = (...args) => W.AO3H_UserRelationships.parseUserHref(...args);
const priorityIcon = (...args) => W.AO3H_UserRelationships.priorityIcon(...args);
// Optional-chained: a stray hover callback can still fire in the brief
// window after this module's coordinator has already torn down.
const getFollowed = (...args) => W.AO3H_UserRelationships?.getFollowedAuthors(...args) ?? new Set();
const getNotes = (...args) => W.AO3H_UserRelationships?.getAuthorNotes(...args) ?? {};
// authorPreference.js keys its map by the exact-case author name as displayed
// on the page (not lowercased) — must match that convention here too.
const getAuthorPrefs = (...args) => W.AO3H_UserRelationships?.getAuthorPrefsFor(...args)
  ?? { hidden: false, favorite: false, readCount: 0, priority: 'normal', tags: [] };
const CARD_CLASS = `${NS}-author-card`;
const HOVER_DELAY_MS = 350;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CARD CONTENT
═══════════════════════════════════════════════════════════════════════════ */

function buildCard (username) {
  const key = username.toLowerCase();
  // Exact-case username, not `key` — authorPreference.js's storage isn't lowercased.
  const prefs = getAuthorPrefs(username);
  const note = getNotes()[key];

  const card = document.createElement('div');
  card.className = CARD_CLASS;

  const title = document.createElement('strong');
  title.textContent = username;
  card.appendChild(title);

  const lines = [];
  if (getFollowed().has(key)) lines.push('★ You follow this author');
  if (prefs.favorite) lines.push('⭐ Favorite');
  if (prefs.priority && prefs.priority !== 'normal') {
    lines.push(`${priorityIcon(prefs.priority)} Priority: ${prefs.priority}`);
  }
  if (prefs.readCount > 0) lines.push(`📖 ${prefs.readCount} read`);
  if (prefs.tags?.length) lines.push(`🏷️ ${prefs.tags.join(', ')}`);
  if (note) lines.push(`📝 ${note}`);

  if (!lines.length) lines.push('No notes yet for this author.');

  lines.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    card.appendChild(p);
  });

  return card;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — HOVER BEHAVIOR
═══════════════════════════════════════════════════════════════════════════ */

class AuthorCardController {
  constructor () {
    this._cardEl = null;
    this._hoverTimer = null;
    this._boundEnter = this._onMouseOver.bind(this);
    this._boundLeave = this._onMouseOut.bind(this);
  }

  init () {
    document.addEventListener('mouseover', this._boundEnter);
    document.addEventListener('mouseout', this._boundLeave);
  }

  cleanup () {
    document.removeEventListener('mouseover', this._boundEnter);
    document.removeEventListener('mouseout', this._boundLeave);
    clearTimeout(this._hoverTimer);
    this._removeCard();
  }

  _onMouseOver (e) {
    const link = e.target.closest?.('a[rel="author"], .authors a[href*="/users/"]');
    if (!link) return;
    const identity = parseUserHref(link.getAttribute('href'));
    if (!identity?.username) return;

    clearTimeout(this._hoverTimer);
    this._hoverTimer = setTimeout(() => this._showCard(link, identity.username), HOVER_DELAY_MS);
  }

  _onMouseOut (e) {
    const link = e.target.closest?.('a[rel="author"], .authors a[href*="/users/"]');
    if (!link) return;
    clearTimeout(this._hoverTimer);
    this._removeCard();
  }

  _showCard (anchor, username) {
    this._removeCard();
    const card = buildCard(username);
    const rect = anchor.getBoundingClientRect();
    card.style.position = 'fixed';
    card.style.left = `${Math.min(rect.left, window.innerWidth - 260)}px`;
    card.style.top = `${rect.bottom + 4}px`;
    document.body.appendChild(card);
    this._cardEl = card;
  }

  _removeCard () {
    this._cardEl?.remove();
    this._cardEl = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Author Card',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  const instance = new AuthorCardController();
  instance.init();
  return () => instance.cleanup();
});
