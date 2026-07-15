/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Navigation Submodule
    Submodule ID: commentNavigation
    Parent Module: commentKit
    Display Name: Comment Navigation

    - Feature: Jump to comments button
      - "💬 Jump to Comments (N)" button injected into work action toolbar
      - Shows AO3 comment count from the stats block
      - Smooth scroll to the comments section
      - "↑ Back to top" button appended after comments section
      - Keyboard shortcut: Ctrl+J

    Settings (read from parent commentKit panel):
        jumpToCommentsButton  [default: true]

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'commentNavigation';
const NS   = 'ao3h';

// ── Defaults (settings stored under parent commentKit panel) ─────────────
const DEFAULTS = { jumpToCommentsButton: false };

const cfg = makeCfg('commentKit', DEFAULTS);

// ── Helpers ───────────────────────────────────────────────────────────────

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

// ── Feature: Jump to Comments button ─────────────────────────────────────

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

// ── Module registration ───────────────────────────────────────────────────

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

  return () => {
    if (keyHandler) D.removeEventListener('keydown', keyHandler);
    jumpBtn?.remove();
    topBtn?.remove();
    jumpBtn = topBtn = keyHandler = null;
  };
});
