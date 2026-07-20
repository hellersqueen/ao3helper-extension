/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit › Comment Highlighting

Highlights work-author comments and direct replies to the current user's
comments within work-page threads.

Notes

- Author and current-user identities are derived from AO3 page markup.
- Each highlight type is controlled through the parent Comment Kit settings.
- Injected classes, badges, and processing markers are removed during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { observe } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'commentHighlighting';
const NS   = 'ao3h';

const DEFAULTS = {
  highlightAuthorReplies : false,
  highlightRepliesToMe   : true,
  authorFilterMode       : 'off', // 'off' | 'hide' | 'only'
  customHighlights       : '',    // comma-separated usernames/keywords
};

const cfg = makeCfg('commentKit', DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PARTICIPANT DETECTION
═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — COMMENT HIGHLIGHTING
═══════════════════════════════════════════════════════════════════════════ */

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

/** Own comment text (not nested replies' text). */
function getCommentText (comment) {
  const bq = comment.querySelector(
    ':scope > .comment-reply blockquote.userstuff, :scope > .thread > .comment-reply blockquote.userstuff'
  );
  return bq ? bq.textContent.trim() : '';
}

function processComment (comment, ctx) {
  const { authorNames, myName, doAuthors, doReplies, filterMode, highlightRules } = ctx;
  if (comment.dataset[`${NS}Highlighted`]) return;
  comment.dataset[`${NS}Highlighted`] = '1';

  const author = getCommentAuthor(comment);
  if (!author) return;

  const heading = comment.querySelector('h4.heading.byline');
  const isAuthorComment = authorNames.has(author);

  if (doAuthors && isAuthorComment) {
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

  if (filterMode !== 'off') {
    const shouldHide = filterMode === 'hide' ? isAuthorComment : !isAuthorComment;
    comment.classList.toggle(`${NS}-filter-hidden`, shouldHide);
  }

  if (highlightRules.length && W.AO3H_CommentKit.matchesCustomHighlight({ author, text: getCommentText(comment) }, highlightRules)) {
    comment.classList.add(`${NS}-custom-highlight-comment`);
    if (heading && !heading.querySelector(`.${NS}-custom-highlight-badge`)) {
      const badge = D.createElement('span');
      badge.className = `${NS}-custom-highlight-badge`;
      badge.textContent = '★';
      heading.appendChild(badge);
    }
  }
}

function processAll (ctx) {
  D.querySelectorAll('li.comment').forEach(c => processComment(c, ctx));
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Comment Highlighting',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  if (!/^\/works\/\d+/.test(W.location.pathname)) return () => {};

  const doAuthors     = cfg('highlightAuthorReplies');
  const doReplies     = cfg('highlightRepliesToMe');
  const filterMode    = cfg('authorFilterMode');
  const highlightRules = W.AO3H_CommentKit.parseHighlightRules(cfg('customHighlights'));
  if (!doAuthors && !doReplies && filterMode === 'off' && !highlightRules.length) return () => {};

  const ctx = {
    authorNames: getWorkAuthors(),
    myName: W.AO3H_CommentKit.getCurrentUsername(),
    doAuthors, doReplies, filterMode, highlightRules,
  };

  processAll(ctx);

  const obs = observe(D.body, { childList: true, subtree: true }, () => processAll(ctx));

  return () => {
    obs.disconnect();
    D.querySelectorAll(
      `.${NS}-author-comment, .${NS}-reply-to-me-comment, .${NS}-filter-hidden, .${NS}-custom-highlight-comment`
    ).forEach(el => {
      el.classList.remove(
        `${NS}-author-comment`, `${NS}-reply-to-me-comment`,
        `${NS}-filter-hidden`, `${NS}-custom-highlight-comment`
      );
      delete el.dataset[`${NS}Highlighted`];
    });
    D.querySelectorAll(`.${NS}-author-badge, .${NS}-reply-badge, .${NS}-custom-highlight-badge`)
      .forEach(el => el.remove());
  };
});
