/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Comment Hiding

Hides comments and bookmark notes written by blocked users, with configurable
placeholders and temporary comment reveals.

Notes

- Blocklist matching is case-insensitive.
- Dynamic comments are processed through a mutation observer.
- Hidden content is restored when the module stops or the blocklist changes.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getUserRelationshipsSettings } from './userRelationshipsSettings.js';
import { observe, onReady } from '../../../../lib/utils/index.js';
import { parseUserHref, isBlockedIdentity } from './userRelationshipsHelpers.js';
import { bumpHiddenStat } from './blockingStats.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'commentHiding';
const NS   = 'ao3h';

const STORAGE_KEY = 'userBlocker:list';
const originalDisplays = new Map();

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BLOCKED-USER CONTENT FILTERING
═══════════════════════════════════════════════════════════════════════════ */

function getBlockedUsers () {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(list.map(u => u.toLowerCase()));
  } catch (_) { return new Set(); }
}

function getCommentAuthorIdentity (comment) {
  const link = comment.querySelector('.heading a[href*="/users/"]');
  if (!link) return null;
  return parseUserHref(link.getAttribute('href'));
}

function hideComment (comment, author) {
  if (comment.dataset.ao3hHidden) return;
  comment.dataset.ao3hHidden   = '1';
  bumpHiddenStat('comments');
  if (!originalDisplays.has(comment)) originalDisplays.set(comment, comment.style.display);
  comment.style.display        = 'none';

  const settings = getUserRelationshipsSettings();
  if (!settings.showPlaceholder) return;

  const placeholder = document.createElement('p');
  placeholder.className = `${NS}-hidden-comment`;
  placeholder.textContent = `[Comment hidden — blocked user: ${author}]`;

  const btn = document.createElement('button');
  btn.textContent  = 'Reveal';
  btn.className    = `${NS}-reveal-btn`;
  btn.addEventListener('click', function () {
    comment.style.display = originalDisplays.get(comment) ?? '';
    delete comment.dataset.ao3hHidden;
    placeholder.remove();
  });

  placeholder.appendChild(btn);
  if (!settings.tempRevealHidden) btn.remove();
  comment.parentNode.insertBefore(placeholder, comment);
}

function hideBookmarkNote (blurb, author) {
  const note = blurb.querySelector('blockquote.userstuff');
  if (!note || note.dataset.ao3hHidden) return;
  note.dataset.ao3hHidden = '1';
  if (!originalDisplays.has(note)) originalDisplays.set(note, note.style.display);
  note.style.display      = 'none';

  if (!getUserRelationshipsSettings().showPlaceholder) return;

  const placeholder = document.createElement('p');
  placeholder.className = `${NS}-hidden-note`;
  placeholder.textContent = `📝 Bookmark note hidden — blocked user: ${author}`;
  note.parentNode.insertBefore(placeholder, note);
}

function processPage (blocked) {
  if (!blocked.size) return;

  document.querySelectorAll('.comment').forEach(comment => {
    const identity = getCommentAuthorIdentity(comment);
    if (!identity) return;
    const { username, pseud } = identity;
    if (isBlockedIdentity(blocked, username, pseud)) {
      hideComment(comment, pseud ? `${username} (${pseud})` : username);
    }
  });

  document.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
    const link = blurb.querySelector('a.author[href*="/users/"]');
    if (!link) return;
    const identity = parseUserHref(link.getAttribute('href'));
    if (!identity) return;
    const { username, pseud } = identity;
    if (isBlockedIdentity(blocked, username, pseud)) {
      hideBookmarkNote(blurb, pseud ? `${username} (${pseud})` : username);
    }
  });
}

function restoreHiddenContent () {
  originalDisplays.forEach((display, element) => {
    element.style.display = display;
    delete element.dataset.ao3hHidden;
  });
  originalDisplays.clear();
  document.querySelectorAll(`.${NS}-hidden-comment, .${NS}-hidden-note`).forEach(el => el.remove());
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Comment Hiding',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  // document.body peut ne pas encore exister quand ce module boote (surtout
  // sur une grosse page) — sans ce report, l'observer plantait (Cannot read
  // properties of null), constaté en test, et .comment n'existait pas encore
  // au premier passage de processPage().
  let active = true;
  let observer = null;
  onReady(() => {
    if (!active) return;
    processPage(getBlockedUsers());
    observer = observe(document.body, { childList: true, subtree: true }, () => processPage(getBlockedUsers()));
  });

  // Live-update when blockingInterface dispatches a block/unblock action
  const onBlockingChanged = () => { restoreHiddenContent(); processPage(getBlockedUsers()); };
  document.addEventListener('ao3h:blocking-changed', onBlockingChanged);

  return () => {
    active = false;
    observer?.disconnect();
    document.removeEventListener('ao3h:blocking-changed', onBlockingChanged);
    restoreHiddenContent();
  };
});
