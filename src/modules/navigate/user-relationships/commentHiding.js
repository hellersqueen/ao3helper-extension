/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Hiding Submodule
    Submodule ID: commentHiding
    Parent: userRelationships
    Display Name: Comment Hiding

    - Feature: Comment hiding
      - Option: Hides comments on work pages whose author is on the blocklist
      - Option: Reads blocklist from storage key: `userBlocker:list`
      - Option: Replaces comment with "[Comment hidden — blocked user: {name}]" placeholder
      - Option: "Reveal" button lets user temporarily see the comment
      - Option: MutationObserver watches for dynamically loaded comments

    - Feature: Bookmark note hiding
      - Option: Hides the bookmark note (blockquote.userstuff) on bookmark blurbs
        whose bookmarker is on the blocklist
      - Option: Replaces note with "📝 Bookmark note hidden — blocked user: {name}"

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getUserRelationshipsSettings } from './userRelationshipsSettings.js';

const MOD  = 'commentHiding';
const NS   = 'ao3h';

const STORAGE_KEY = 'userBlocker:list';
const originalDisplays = new Map();

function getBlockedUsers () {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch (_) { return new Set(); }
}

function getCommentAuthor (comment) {
  const link = comment.querySelector('.heading a[href*="/users/"]');
  return link ? link.textContent.trim().toLowerCase() : null;
}

function hideComment (comment, author) {
  if (comment.dataset.ao3hHidden) return;
  comment.dataset.ao3hHidden   = '1';
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
    const author = getCommentAuthor(comment);
    if (author && blocked.has(author)) hideComment(comment, author);
  });

  document.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
    const link = blurb.querySelector('a.author[href*="/users/"]');
    if (!link) return;
    const author = link.textContent.trim().toLowerCase();
    if (blocked.has(author)) hideBookmarkNote(blurb, author);
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

register(MOD, {
  title:            'Comment Hiding',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  processPage(getBlockedUsers());

  const observer = new MutationObserver(() => processPage(getBlockedUsers()));
  observer.observe(document.body, { childList: true, subtree: true });

  // Live-update when blockingInterface dispatches a block/unblock action
  const onBlockingChanged = () => { restoreHiddenContent(); processPage(getBlockedUsers()); };
  document.addEventListener('ao3h:blocking-changed', onBlockingChanged);

  return () => {
    observer.disconnect();
    document.removeEventListener('ao3h:blocking-changed', onBlockingChanged);
    restoreHiddenContent();
  };
});
