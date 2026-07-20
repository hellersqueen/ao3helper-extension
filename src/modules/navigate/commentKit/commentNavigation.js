/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit › Comment Navigation

Adds work-page controls for jumping to the comments section and returning to the
top of the page.

Notes

- The jump control includes AO3's displayed comment count when available.
- `Ctrl+J` activates the same smooth-scroll behavior.
- Controls are injected only on work pages.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'commentNavigation';
const NS   = 'ao3h';

const DEFAULTS = {
  jumpToCommentsButton: false,
  commentSearchBox:     true,
  floatingNavPanel:     false,
};

const cfg = makeCfg('commentKit', DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — COMMENT-SECTION NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */

/** Reads the comment count from AO3's stats block, returns number or null. */
function readCommentCount () {
  // AO3 stats: <dd class="comments"><a href="...">42</a></dd>
  const el = D.querySelector('dd.comments a, dd.comments');
  if (!el) return null;
  const n = parseInt(el.textContent.replace(/\D/g, ''), 10);
  return isNaN(n) ? null : n;
}

/** Returns the comments section element, or null. */
function findCommentsSection () {
  return (
    D.getElementById('comments') ||
    D.querySelector('#chapter-comments, .comments-header, #comment_pagination, ol.thread')
  );
}

let jumpBtn  = null;
let topBtn   = null;
let keyHandler = null;

function injectJumpButton () {
  if (jumpBtn) return; // already injected

  const commentsSection = findCommentsSection();
  if (!commentsSection) return;

  const count = readCommentCount();
  const label = count !== null ? `💬 Jump to Comments (${count})` : '💬 Jump to Comments';

  // Inject into the work action bar (<ul class="work navigation actions">)
  const actionsList = D.querySelector('ul.work.navigation.actions, .work-navigation .actions');

  jumpBtn      = D.createElement(actionsList ? 'li' : 'span');
  const inner  = D.createElement('button');
  inner.type   = 'button';
  inner.className = `${NS}-jump-comments-btn`;
  inner.textContent = label;
  inner.title  = 'Scroll to the comments section (Ctrl+J)';
  inner.addEventListener('click', scrollToComments);
  jumpBtn.appendChild(inner);

  if (actionsList) {
    actionsList.appendChild(jumpBtn);
  } else {
    // Fallback: prepend before the comments section
    commentsSection.before(jumpBtn);
  }

  // "Back to top" button after comments section
  topBtn = D.createElement('div');
  topBtn.className = `${NS}-back-to-top-wrap`;
  const topInner = D.createElement('button');
  topInner.type  = 'button';
  topInner.className = `${NS}-back-to-top-btn`;
  topInner.textContent = '↑ Back to top';
  topInner.addEventListener('click', () => W.scrollTo({ top: 0, behavior: 'smooth' }));
  topBtn.appendChild(topInner);
  commentsSection.after(topBtn);

  // Keyboard shortcut Ctrl+J
  keyHandler = function (e) {
    if (e.ctrlKey && e.key === 'j') { e.preventDefault(); scrollToComments(); }
  };
  D.addEventListener('keydown', keyHandler);
}

function scrollToComments () {
  const target = findCommentsSection();
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SEARCH WITHIN COMMENTS
═══════════════════════════════════════════════════════════════════════════ */

let searchBox = null;
const MATCH_CLASS = `${NS}-comment-match`;

/** Each visible comment's own text content (own reply, not nested replies). */
function commentTextNodes () {
  return Array.from(D.querySelectorAll('li.comment blockquote.userstuff, li.comment .comment-content blockquote'));
}

function clearMatches () {
  D.querySelectorAll(`.${MATCH_CLASS}`).forEach(el => {
    el.replaceWith(D.createTextNode(el.textContent));
  });
}

function highlightMatches (query) {
  clearMatches();
  if (!query.trim()) return [];
  const found = [];
  commentTextNodes().forEach(node => {
    if (!W.AO3H_CommentKit.matchesSearch(node.textContent, query)) return;
    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
    node.innerHTML = escapeHtml(node.textContent).replace(re, m => `<mark class="${MATCH_CLASS}">${m}</mark>`);
    found.push(...node.querySelectorAll(`.${MATCH_CLASS}`));
  });
  return found;
}

function injectSearchBox () {
  const commentsSection = findCommentsSection();
  if (!commentsSection || searchBox) return;

  searchBox = D.createElement('div');
  searchBox.className = `${NS}-comment-search`;

  const input = D.createElement('input');
  input.type = 'search';
  input.className = `${NS}-comment-search-input`;
  input.placeholder = 'Search comments…';

  const counter = D.createElement('span');
  counter.className = `${NS}-comment-search-counter`;

  let matches = [];
  let idx = -1;

  const goTo = (i) => {
    if (!matches.length) return;
    idx = (i + matches.length) % matches.length;
    matches.forEach(m => m.classList.remove(`${MATCH_CLASS}--current`));
    matches[idx].classList.add(`${MATCH_CLASS}--current`);
    matches[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    counter.textContent = `${idx + 1} / ${matches.length}`;
  };

  input.addEventListener('input', () => {
    matches = highlightMatches(input.value);
    idx = -1;
    counter.textContent = input.value.trim() ? `0 / ${matches.length}` : '';
    if (matches.length) goTo(0);
  });

  const prevBtn = D.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = `${NS}-thread-bulk-btn`;
  prevBtn.textContent = '◀';
  prevBtn.addEventListener('click', () => goTo(idx - 1));

  const nextBtn = D.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = `${NS}-thread-bulk-btn`;
  nextBtn.textContent = '▶';
  nextBtn.addEventListener('click', () => goTo(idx + 1));

  searchBox.appendChild(input);
  searchBox.appendChild(prevBtn);
  searchBox.appendChild(nextBtn);
  searchBox.appendChild(counter);
  commentsSection.before(searchBox);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — FLOATING THREAD-NAVIGATION PANEL
═══════════════════════════════════════════════════════════════════════════ */

let navPanel = null;
let navKeyHandler = null;

/** Top-level comment threads only (a comment nested inside another isn't one). */
function topLevelThreads () {
  return Array.from(D.querySelectorAll('li.comment[id]')).filter(c => !c.parentElement.closest('li.comment'));
}

function findPaginationMax () {
  let max = 1;
  D.querySelectorAll('#comment_pagination a, .pagination a').forEach(a => {
    const n = parseInt((a.textContent || '').replace(/\D+/g, ''), 10);
    if (Number.isFinite(n)) max = Math.max(max, n);
  });
  return max;
}

function injectNavPanel () {
  if (navPanel) return;
  const threads = topLevelThreads();
  if (!threads.length) return;

  let idx = 0;
  const goTo = (i) => {
    idx = Math.max(0, Math.min(threads.length - 1, i));
    threads[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  navPanel = D.createElement('div');
  navPanel.className = `${NS}-comment-nav-panel`;

  const mk = (label, title, onClick) => {
    const b = D.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', onClick);
    return b;
  };

  navPanel.appendChild(mk('⏮', 'First thread', () => goTo(0)));
  navPanel.appendChild(mk('◀', 'Previous thread (Alt+↑)', () => goTo(idx - 1)));
  navPanel.appendChild(mk('▶', 'Next thread (Alt+↓)', () => goTo(idx + 1)));
  navPanel.appendChild(mk('⏭', 'Last thread', () => goTo(threads.length - 1)));

  const maxPage = findPaginationMax();
  if (maxPage > 1) {
    const pageInput = D.createElement('input');
    pageInput.type = 'number';
    pageInput.min = '1';
    pageInput.max = String(maxPage);
    pageInput.className = `${NS}-comment-nav-page-input`;
    pageInput.placeholder = `1–${maxPage}`;
    const goBtn = mk('Go', 'Jump to comment page', () => {
      const n = parseInt(pageInput.value, 10);
      if (Number.isFinite(n) && n >= 1 && n <= maxPage) W.location.href = W.AO3H_CommentKit.buildPageJumpUrl(W.location.href, n);
    });
    navPanel.appendChild(pageInput);
    navPanel.appendChild(goBtn);
  }

  D.body.appendChild(navPanel);

  navKeyHandler = (e) => {
    if (!e.altKey) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); goTo(idx + 1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); goTo(idx - 1); }
  };
  D.addEventListener('keydown', navKeyHandler);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Comment Navigation',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  // Only active on work pages
  if (!/^\/works\/\d+/.test(W.location.pathname)) return () => {};

  if (cfg('jumpToCommentsButton')) {
    injectJumpButton();
  }
  if (cfg('commentSearchBox')) {
    injectSearchBox();
  }
  if (cfg('floatingNavPanel')) {
    injectNavPanel();
  }

  return () => {
    if (keyHandler) D.removeEventListener('keydown', keyHandler);
    if (navKeyHandler) D.removeEventListener('keydown', navKeyHandler);
    jumpBtn?.remove();
    topBtn?.remove();
    searchBox?.remove();
    navPanel?.remove();
    clearMatches();
    jumpBtn = topBtn = keyHandler = searchBox = navPanel = navKeyHandler = null;
  };
});
