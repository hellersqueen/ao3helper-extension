/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Highlighting Submodule
    Submodule ID: commentHighlighting
    Parent Module: commentKit
    Display Name: Comment Highlighting

    - Feature: Highlight author replies
      - Detects work author username(s) from the work byline
      - Adds a coloured left-border + "Author" badge to each author comment
      - Works on all comment threads on the work page

    - Feature: Highlight replies to my comments
      - Detects the logged-in username from the AO3 header
      - Marks comments that are direct replies to the current user's comments
      - Adds a "↩ Reply to you" badge

    Settings (read from parent commentKit panel):
        highlightAuthorReplies  [default: true]
        highlightRepliesToMe    [default: false]

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'commentHighlighting';
const NS   = 'ao3h';

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  highlightAuthorReplies : false,
  highlightRepliesToMe   : true,
};

function cfg (key) {
  try {
    const s = JSON.parse(localStorage.getItem('ao3h:mod:commentKit:settings') || '{}');
    return (key in s) ? s[key] : DEFAULTS[key];
  } catch (_) { return DEFAULTS[key]; }
}

// ── Username detection ────────────────────────────────────────────────────

/** Returns the logged-in username from the AO3 header, or null. */
function getMyUsername () {
  // AO3: <li class="user"> <a href="/users/USERNAME/...">USERNAME</a>
  const a = D.querySelector('#header .user a[href^="/users/"]');
  if (!a) return null;
  const m = a.href.match(/\/users\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Returns an array of work author usernames from the work byline. */
function getWorkAuthors () {
  // AO3: <a rel="author" href="/users/USERNAME/...">USERNAME</a>
  const links = D.querySelectorAll('a[rel="author"][href*="/users/"]');
  const names = new Set();
  links.forEach(a => {
    const m = a.href.match(/\/users\/([^/]+)/);
    if (m) names.add(decodeURIComponent(m[1]).toLowerCase());
  });
  return names;
}

// ── Per-comment processing ────────────────────────────────────────────────

/**
 * AO3 comment structure:
 *   <li class="comment" id="comment_12345">
 *     <div class="comment-reply">
 *       <h4 class="heading byline">
 *         <a href="/users/USERNAME/...">USERNAME</a> on <a href="...">Work</a>
 *       </h4>
 *       ...
 *     </div>
 *   </li>
 *
 * "Reply to" relationship: a child <li.comment> nested inside a parent
 * <li.comment> means it is a reply to that parent's author.
 */

function getCommentAuthor (comment) {
  const a = comment.querySelector(':scope > .comment-reply > h4.heading a[href*="/users/"], ' +
    ':scope > .thread > .comment-reply > h4.heading a[href*="/users/"]');
  if (!a) return null;
  const m = a.href.match(/\/users\/([^/]+)/);
  return m ? decodeURIComponent(m[1]).toLowerCase() : null;
}

function getParentCommentAuthor (comment) {
  // Walk up DOM to find the nearest ancestor <li.comment>
  let el = comment.parentElement;
  while (el && el !== D.body) {
    if (el.matches('li.comment')) return getCommentAuthor(el);
    el = el.parentElement;
  }
  return null;
}

function processComment (comment, authorNames, myName, doAuthors, doReplies) {
  if (comment.dataset[`${NS}Highlighted`]) return;
  comment.dataset[`${NS}Highlighted`] = '1';

  const author = getCommentAuthor(comment);
  if (!author) return;

  const heading = comment.querySelector('h4.heading.byline');

  if (doAuthors && authorNames.has(author)) {
    comment.classList.add(`${NS}-author-comment`);
    if (heading && !heading.querySelector(`.${NS}-author-badge`)) {
      const badge = D.createElement('span');
      badge.className = `${NS}-author-badge`;
      badge.textContent = 'Author';
      heading.appendChild(badge);
    }
  }

  if (doReplies && myName) {
    const parentAuthor = getParentCommentAuthor(comment);
    if (parentAuthor && parentAuthor === myName.toLowerCase()) {
      comment.classList.add(`${NS}-reply-to-me-comment`);
      if (heading && !heading.querySelector(`.${NS}-reply-badge`)) {
        const badge = D.createElement('span');
        badge.className = `${NS}-reply-badge`;
        badge.textContent = '↩︎ Reply to you';
        heading.appendChild(badge);
      }
    }
  }
}

function processAll (authorNames, myName, doAuthors, doReplies) {
  D.querySelectorAll('li.comment').forEach(c =>
    processComment(c, authorNames, myName, doAuthors, doReplies)
  );
}

// ── Module registration ───────────────────────────────────────────────────

register(MOD, {
  title:            'Comment Highlighting',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  if (!/^\/works\/\d+/.test(W.location.pathname)) return () => {};

  const doAuthors = cfg('highlightAuthorReplies');
  const doReplies = cfg('highlightRepliesToMe');
  if (!doAuthors && !doReplies) return () => {};

  const authorNames = getWorkAuthors();
  const myName      = getMyUsername();

  processAll(authorNames, myName, doAuthors, doReplies);

  const obs = new MutationObserver(() =>
    processAll(authorNames, myName, doAuthors, doReplies)
  );
  obs.observe(D.body, { childList: true, subtree: true });

  return () => {
    obs.disconnect();
    D.querySelectorAll(
      `.${NS}-author-comment, .${NS}-reply-to-me-comment`
    ).forEach(el => {
      el.classList.remove(`${NS}-author-comment`, `${NS}-reply-to-me-comment`);
      delete el.dataset[`${NS}Highlighted`];
    });
    D.querySelectorAll(`.${NS}-author-badge, .${NS}-reply-badge`)
      .forEach(el => el.remove());
  };
});
