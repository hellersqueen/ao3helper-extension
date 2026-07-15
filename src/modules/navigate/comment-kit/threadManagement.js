/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Thread Management Submodule
    Submodule ID: threadManagement
    Parent Module: commentKit
    Display Name: Thread Management

    - Feature: Collapse / expand comment threads
      - Toggle button injected into each top-level comment's action bar
      - Hides/shows the nested reply thread (ol.thread inside the comment)
      - Collapsed state persisted per work in localStorage
      - "Collapse all" / "Expand all" buttons above the comments section
      - State auto-cleaned after 30 days

    - Feature: Read / unread tracking
      - Records all visible comment IDs on each visit (per work)
      - On the next visit, comments not seen before get a "NEW" badge
      - "Mark all as read" button injected above the comments section
      - Read markers expire after 30 days of inactivity

    Settings (read from parent commentKit panel):
        collapseExpandButtons  [default: true]
        unreadTracking         [default: false]

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'threadManagement';
const NS   = 'ao3h';

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  collapseExpandButtons : true,
  unreadTracking        : false,
};

const cfg = makeCfg('commentKit', DEFAULTS);

// ── Storage ───────────────────────────────────────────────────────────────
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function collapseKey (workId) { return `${NS}:threadCollapse:${workId}`; }
function seenKey     (workId) { return `${NS}:threadSeen:${workId}`; }

function loadJSON (key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
}

function saveJSON (key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

function loadCollapseState (workId) {
  const data = loadJSON(collapseKey(workId), { ts: 0, collapsed: [] });
  if (Date.now() - (data.ts || 0) > MAX_AGE_MS) return [];
  return Array.isArray(data.collapsed) ? data.collapsed : [];
}

function saveCollapseState (workId, collapsedIds) {
  saveJSON(collapseKey(workId), { ts: Date.now(), collapsed: collapsedIds });
}

function loadSeenIds (workId) {
  const data = loadJSON(seenKey(workId), { ts: 0, ids: [] });
  if (Date.now() - (data.ts || 0) > MAX_AGE_MS) return new Set();
  return new Set(Array.isArray(data.ids) ? data.ids : []);
}

function saveSeenIds (workId, idSet) {
  saveJSON(seenKey(workId), { ts: Date.now(), ids: [...idSet] });
}

// ── CSS ───────────────────────────────────────────────────────────────────
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

// ── Collapse feature ──────────────────────────────────────────────────────

function setupCollapse (workId) {
  const collapsed = new Set(loadCollapseState(workId));

  function persist () { saveCollapseState(workId, [...collapsed]); }

  function addButton (comment) {
    if (comment.querySelector(`.${NS}-collapse-btn`)) return;

    // Only add to comments that have a nested thread
    const thread = comment.querySelector(':scope > ol.thread, :scope > .thread');
    if (!thread) return;

    const id = comment.id; // e.g. "comment_12345"

    const btn = D.createElement('button');
    btn.type      = 'button';
    btn.className = `${NS}-collapse-btn`;
    btn.title     = 'Toggle thread';
    btn.textContent = collapsed.has(id) ? 'Expand' : 'Collapse';

    if (collapsed.has(id)) comment.classList.add(`${NS}-thread-collapsed`);

    btn.addEventListener('click', () => {
      const isCollapsed = collapsed.has(id);
      if (isCollapsed) {
        collapsed.delete(id);
        comment.classList.remove(`${NS}-thread-collapsed`);
        btn.textContent = 'Collapse';
      } else {
        collapsed.add(id);
        comment.classList.add(`${NS}-thread-collapsed`);
        btn.textContent = 'Expand';
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
        collapsed.add(c.id);
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
        collapsed.delete(c.id);
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

// ── Read / unread tracking ────────────────────────────────────────────────

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

// ── Module registration ───────────────────────────────────────────────────

register(MOD, {
  title:            'Thread Management',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  if (!/^\/works\/\d+/.test(W.location.pathname)) return () => {};

  const workId = extractWorkIdFromHref(W.location.pathname);
  if (!workId) return () => {};

  let processNew = null;

  if (cfg('collapseExpandButtons')) {
    processNew = setupCollapse(workId);
  }

  if (cfg('unreadTracking')) {
    setupUnread(workId);
  }

  const obs = new MutationObserver(() => processNew?.());
  if (processNew) obs.observe(D.body, { childList: true, subtree: true });

  return () => {
    obs.disconnect();
    D.querySelectorAll(
      `.${NS}-collapse-btn, .${NS}-thread-bulk-bar, .${NS}-thread-bulk-btn, .${NS}-new-badge`
    ).forEach(el => el.remove());
    D.querySelectorAll(`.${NS}-thread-collapsed`)
      .forEach(el => el.classList.remove(`${NS}-thread-collapsed`));
  };
});
