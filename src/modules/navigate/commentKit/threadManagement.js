/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit › Thread Management

Adds persistent collapse controls and optional read-state tracking to work-page
comment threads.

Notes

- Collapsed and seen-comment states persist separately for each work.
- Stored thread state expires after 30 days.
- Collapse controls are enabled by default; unread tracking is opt-in.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';
import { observe } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'threadManagement';
const NS   = 'ao3h';

const DEFAULTS = {
  collapseExpandButtons : true,
  unreadTracking        : false,
  autoCollapseThreshold : '0', // '0' = off, else reply count above which a thread auto-collapses
  showQuoteReplyButton  : true,
};

const cfg = makeCfg('commentKit', DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — THREAD-STATE STORAGE
═══════════════════════════════════════════════════════════════════════════ */

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function collapseKey (workId) { return `${NS}:threadCollapse:${workId}`; }
function seenKey     (workId) { return `${NS}:threadSeen:${workId}`; }

function loadJSON (key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
}

function saveJSON (key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

/**
 * Manual per-thread collapse overrides: { [commentId]: true|false }. A
 * present key always wins over the auto-collapse threshold (shouldAutoCollapse).
 * Legacy shape was { ts, collapsed: [ids] } — every listed id was explicitly
 * collapsed, so it migrates 1:1 into manual[id] = true.
 */
function loadCollapseState (workId) {
  const data = loadJSON(collapseKey(workId), { ts: 0, manual: {} });
  if (Date.now() - (data.ts || 0) > MAX_AGE_MS) return {};
  if (Array.isArray(data.collapsed)) {
    const manual = {};
    data.collapsed.forEach(id => { manual[id] = true; });
    return manual;
  }
  return data.manual && typeof data.manual === 'object' ? data.manual : {};
}

function saveCollapseState (workId, manual) {
  saveJSON(collapseKey(workId), { ts: Date.now(), manual });
}

function loadSeenIds (workId) {
  const data = loadJSON(seenKey(workId), { ts: 0, ids: [] });
  if (Date.now() - (data.ts || 0) > MAX_AGE_MS) return new Set();
  return new Set(Array.isArray(data.ids) ? data.ids : []);
}

function saveSeenIds (workId, idSet) {
  saveJSON(seenKey(workId), { ts: Date.now(), ids: [...idSet] });
}

const CSS = `
  .${NS}-collapse-btn {
    margin-left: 6px;
    padding: 1px 6px;
    background: white;
    border: 1px solid #bbb;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.78em;
    color: #555;
    vertical-align: middle;
  }
  .${NS}-collapse-btn:hover { border-color: #900; color: #900; }

  .${NS}-thread-bulk-bar {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }
  .${NS}-thread-bulk-btn {
    padding: 3px 9px;
    background: white;
    border: 1px solid #bbb;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.82em;
    color: #333;
  }
  .${NS}-thread-bulk-btn:hover { border-color: #900; color: #900; }

  .${NS}-thread-collapsed > .thread { display: none !important; }
  .${NS}-thread-collapsed > .comment-reply .${NS}-collapse-btn::before { content: '▶ '; }
  .${NS}-collapse-btn::before { content: '▼ '; }

  .${NS}-new-badge {
    display: inline-block;
    margin-left: 0.4em;
    padding: 1px 5px;
    background: #e74c3c;
    color: #fff;
    font-size: 0.72em;
    border-radius: 3px;
    vertical-align: middle;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — THREAD COLLAPSING
═══════════════════════════════════════════════════════════════════════════ */

function setupCollapse (workId, threshold) {
  const manual = loadCollapseState(workId);

  function persist () { saveCollapseState(workId, manual); }

  function addButton (comment) {
    if (comment.querySelector(`.${NS}-collapse-btn`)) return;

    // Only add to comments that have a nested thread
    const thread = comment.querySelector(':scope > ol.thread, :scope > .thread');
    if (!thread) return;

    const id = comment.id; // e.g. "comment_12345"
    const replyCount = thread.querySelectorAll('li.comment').length;
    const isCollapsed = W.AO3H_CommentKit.shouldAutoCollapse(replyCount, threshold, manual[id]);

    const btn = D.createElement('button');
    btn.type      = 'button';
    btn.className = `${NS}-collapse-btn`;
    btn.title     = 'Toggle thread';
    btn.textContent = isCollapsed ? 'Expand' : 'Collapse';

    if (isCollapsed) comment.classList.add(`${NS}-thread-collapsed`);

    btn.addEventListener('click', () => {
      const nowCollapsed = comment.classList.contains(`${NS}-thread-collapsed`);
      if (nowCollapsed) {
        comment.classList.remove(`${NS}-thread-collapsed`);
        btn.textContent = 'Collapse';
        manual[id] = false;
      } else {
        comment.classList.add(`${NS}-thread-collapsed`);
        btn.textContent = 'Expand';
        manual[id] = true;
      }
      persist();
    });

    // Inject into the comment's action list or heading
    const actions = comment.querySelector(':scope > .comment-reply ul.actions, :scope > ul.actions');
    if (actions) {
      const li = D.createElement('li');
      li.appendChild(btn);
      actions.appendChild(li);
    } else {
      const heading = comment.querySelector(':scope > .comment-reply h4.heading, :scope > h4.heading');
      if (heading) heading.appendChild(btn);
    }
  }

  function processAll () {
    D.querySelectorAll('li.comment[id]').forEach(addButton);
  }

  processAll();

  // Bulk bar
  const commentsSection = D.getElementById('comments') ||
    D.querySelector('#chapter-comments, ol.thread');
  if (commentsSection) {
    const bar = D.createElement('div');
    bar.className = `${NS}-thread-bulk-bar`;

    const collapseAll = D.createElement('button');
    collapseAll.type      = 'button';
    collapseAll.className = `${NS}-thread-bulk-btn`;
    collapseAll.textContent = '⊟ Collapse all';
    collapseAll.addEventListener('click', () => {
      D.querySelectorAll('li.comment[id]').forEach(c => {
        const thread = c.querySelector(':scope > ol.thread, :scope > .thread');
        if (!thread) return;
        manual[c.id] = true;
        c.classList.add(`${NS}-thread-collapsed`);
        const btn = c.querySelector(`.${NS}-collapse-btn`);
        if (btn) btn.textContent = 'Expand';
      });
      persist();
    });

    const expandAll = D.createElement('button');
    expandAll.type      = 'button';
    expandAll.className = `${NS}-thread-bulk-btn`;
    expandAll.textContent = '⊞ Expand all';
    expandAll.addEventListener('click', () => {
      D.querySelectorAll('li.comment[id]').forEach(c => {
        manual[c.id] = false;
        c.classList.remove(`${NS}-thread-collapsed`);
        const btn = c.querySelector(`.${NS}-collapse-btn`);
        if (btn) btn.textContent = 'Collapse';
      });
      persist();
    });

    bar.appendChild(collapseAll);
    bar.appendChild(expandAll);
    commentsSection.before(bar);
  }

  return processAll;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — QUOTE & REPLY
═══════════════════════════════════════════════════════════════════════════ */

function getCommentHeaderAuthor (comment) {
  const a = comment.querySelector(
    ':scope > .comment-reply > h4.heading a[href*="/users/"], :scope > .thread > .comment-reply > h4.heading a[href*="/users/"]'
  );
  return a ? a.textContent.trim() : 'them';
}

function getCommentExcerpt (comment) {
  const bq = comment.querySelector(
    ':scope > .comment-reply blockquote.userstuff, :scope > .thread > .comment-reply blockquote.userstuff'
  );
  const text = bq ? bq.textContent.trim() : '';
  return text.length > 150 ? `${text.slice(0, 147)}…` : text;
}

function findReplyLink (comment) {
  const links = comment.querySelectorAll(':scope > .comment-reply ul.actions a, :scope > ul.actions a');
  return Array.from(links).find(a => /^reply$/i.test((a.textContent || '').trim()));
}

/** AO3 lazily injects the reply form via its own AJAX — poll briefly for its textarea. */
function waitForReplyTextarea (comment, cb, tries = 15) {
  const ta = comment.querySelector('textarea[name="comment[comment_content]"], textarea#comment_content');
  if (ta) { cb(ta); return; }
  if (tries <= 0) return;
  setTimeout(() => waitForReplyTextarea(comment, cb, tries - 1), 200);
}

function addQuoteReplyButton (comment) {
  if (comment.querySelector(`.${NS}-quote-reply-btn`)) return;

  const btn = D.createElement('button');
  btn.type      = 'button';
  btn.className = `${NS}-quote-reply-btn`;
  btn.title     = 'Quote this comment in your reply';
  btn.textContent = '❝ Reply';
  btn.addEventListener('click', () => {
    const existingTa = comment.querySelector('textarea[name="comment[comment_content]"], textarea#comment_content');
    if (!existingTa) findReplyLink(comment)?.click();
    waitForReplyTextarea(comment, (ta) => {
      const quote = `<blockquote>${getCommentHeaderAuthor(comment)} wrote: "${getCommentExcerpt(comment)}"</blockquote>\n\n`;
      if (!ta.value.startsWith(quote)) ta.value = quote + ta.value;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  const actions = comment.querySelector(':scope > .comment-reply ul.actions, :scope > ul.actions');
  if (actions) {
    const li = D.createElement('li');
    li.appendChild(btn);
    actions.appendChild(li);
  } else {
    const heading = comment.querySelector(':scope > .comment-reply h4.heading, :scope > h4.heading');
    if (heading) heading.appendChild(btn);
  }
}

function setupQuoteReply () {
  const processAll = () => D.querySelectorAll('li.comment[id]').forEach(addQuoteReplyButton);
  processAll();
  return processAll;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READ-STATE TRACKING
═══════════════════════════════════════════════════════════════════════════ */

function setupUnread (workId) {
  const seenIds = loadSeenIds(workId);
  const currentIds = new Set();

  D.querySelectorAll('li.comment[id]').forEach(comment => {
    currentIds.add(comment.id);

    if (!seenIds.has(comment.id)) {
      // Mark as new
      const heading = comment.querySelector(
        ':scope > .comment-reply h4.heading, :scope > h4.heading'
      );
      if (heading && !heading.querySelector(`.${NS}-new-badge`)) {
        const badge = D.createElement('span');
        badge.className  = `${NS}-new-badge`;
        badge.textContent = 'NEW';
        heading.appendChild(badge);
      }
    }
  });

  // "Mark all as read" button
  const commentsSection = D.getElementById('comments') ||
    D.querySelector('#chapter-comments, ol.thread');
  if (commentsSection) {
    const markReadBtn = D.createElement('button');
    markReadBtn.type      = 'button';
    markReadBtn.className = `${NS}-thread-bulk-btn ${NS}-thread-mark-read-btn`;
    markReadBtn.textContent = '✓ Mark all as read';
    markReadBtn.addEventListener('click', () => {
      D.querySelectorAll(`.${NS}-new-badge`).forEach(el => el.remove());
      currentIds.forEach(id => seenIds.add(id));
      saveSeenIds(workId, seenIds);
      markReadBtn.remove();
    });
    commentsSection.before(markReadBtn);
  }

  // Save current visit IDs
  currentIds.forEach(id => seenIds.add(id));
  saveSeenIds(workId, seenIds);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Thread Management',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  if (!/^\/works\/\d+/.test(W.location.pathname)) return () => {};

  const workId = extractWorkIdFromHref(W.location.pathname);
  if (!workId) return () => {};

  let processCollapse = null;
  let processQuoteReply = null;

  if (cfg('collapseExpandButtons')) {
    const threshold = parseInt(cfg('autoCollapseThreshold'), 10) || 0;
    processCollapse = setupCollapse(workId, threshold);
  }

  if (cfg('showQuoteReplyButton')) {
    processQuoteReply = setupQuoteReply();
  }

  if (cfg('unreadTracking')) {
    setupUnread(workId);
  }

  // Rien à observer si aucune des deux fonctionnalités par-commentaire n'est
  // active : pas d'objet MutationObserver inerte, juste rien à connecter.
  const obs = (processCollapse || processQuoteReply)
    ? observe(D.body, { childList: true, subtree: true }, () => {
        processCollapse?.();
        processQuoteReply?.();
      })
    : null;

  return () => {
    obs?.disconnect();
    D.querySelectorAll(
      `.${NS}-collapse-btn, .${NS}-thread-bulk-bar, .${NS}-thread-bulk-btn, .${NS}-new-badge, .${NS}-quote-reply-btn`
    ).forEach(el => el.remove());
    D.querySelectorAll(`.${NS}-thread-collapsed`)
      .forEach(el => el.classList.remove(`${NS}-thread-collapsed`));
  };
});
