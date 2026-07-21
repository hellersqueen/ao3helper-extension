/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Comment Kit Coordinator

    Module ID: commentKit
    Display Name: Comment Kit
    Tab: Navigate & Interact

    Purpose

    Coordinates comment composition, navigation, highlighting, drafts, thread
    controls, and shared comment settings.

    Submodules

    - commentComposing.js: formatting tools, templates, and previews
    - commentNavigation.js: comment-section navigation
    - commentHighlighting.js: author and reply-to-me highlighting
    - draftManagement.js: draft persistence and comment counters
    - threadManagement.js: thread collapsing and unread tracking

    Notes

    - Submodules self-register under `commentKit` and share its settings scope.
    - The coordinator owns shared settings, inbox chapter badges, guest-comment
      defaults, and comment display density.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, observe, onReady } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './commentKit.css?inline';

import './commentComposing.js';
import './commentNavigation.js';
import './commentHighlighting.js';
import './draftManagement.js';
import './threadManagement.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-commentKit');
const W = getGlobalWindow();
const NS = 'ao3h';

const DEFAULTS = {
  chapterIndicator: true,
  guestCommentsDefault: false,
  commentDensity: 'normal',
};

const cfg = makeCfg('commentKit', DEFAULTS);
const guestCheckboxStates = new Map();
const DENSITY_CLASS_PREFIX = `${NS}-comment-density-`;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

export function fillTemplateVariables (text, vars = {}) {
  return String(text ?? '').replace(/\{(title|author)\}/g, (_, key) => vars[key] ?? '');
}
export function filterTemplates (templates, query) {
  const normalized = String(query ?? '').trim().toLowerCase();
  if (!normalized) return templates;
  return templates.filter(template => template.toLowerCase().includes(normalized));
}
export function draftKeyFor (workId, scope = 'top') {
  return scope === 'top' ? `ao3h:draft:${workId}` : `ao3h:draft:${workId}:${scope}`;
}
export function draftScopeForForm (parentCommentId) { return parentCommentId || 'top'; }
export function shouldAutoCollapse (replyCount, threshold, manualOverride) {
  if (manualOverride !== undefined) return manualOverride;
  return threshold > 0 && replyCount >= threshold;
}
export function parseHighlightRules (raw) {
  return String(raw ?? '').split(',').map(rule => rule.trim().toLowerCase()).filter(Boolean);
}
export function matchesCustomHighlight (comment, rules) {
  if (!rules.length) return false;
  const author = (comment.author || '').toLowerCase();
  const text = (comment.text || '').toLowerCase();
  return rules.some(rule => author === rule || text.includes(rule));
}
export function matchesSearch (text, query) {
  const normalized = String(query ?? '').trim().toLowerCase();
  return !normalized || String(text ?? '').toLowerCase().includes(normalized);
}
export function buildPageJumpUrl (currentUrl, pageNum) {
  const url = new URL(currentUrl);
  if (pageNum <= 1) url.searchParams.delete('page');
  else url.searchParams.set('page', String(pageNum));
  url.hash = 'comments';
  return url.toString();
}

/** Logged-in username from the AO3 header nav, or null. Scoped to
 *  `#header .user` (unlike the generic `detectUser()`) because work pages
 *  are full of other `/users/...` links (author byline, commenters) that a
 *  broader selector would risk picking up instead. */
export function getCurrentUsername () {
  const a = document.querySelector('#header .user a[href^="/users/"]');
  const m = a?.href.match(/\/users\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function addChapterIndicators () {
  document.querySelectorAll('.comment .heading, .inbox-comments .comment_content h4').forEach(heading => {
    if (heading.querySelector(`.${NS}-ch-badge`)) return;
    const link = heading.querySelector('a[href*="/works/"]');
    const match = link?.href.match(/\/works\/\d+\/chapters\/(\d+)/);
    if (!match) return;

    const badge = document.createElement('span');
    badge.className = `${NS}-ch-badge`;
    badge.textContent = `Ch ${match[1]}`;
    badge.title = 'Chapter number';
    badge.style.cssText =
      'display:inline-block;margin-left:0.4em;padding:1px 5px;font-size:0.78em;' +
      'background:#2a6496;color:#fff;border-radius:3px;vertical-align:middle;' +
      'font-weight:normal;';
    heading.appendChild(badge);
  });
}

function applyGuestCommentDefault () {
  if (!/\/works\/(new|edit|\d+\/edit)/.test(location.pathname)) return;
  const checkbox = document.querySelector('#work_allow_anon_commenting');
  if (!checkbox || checkbox.dataset.ao3hDefault) return;
  guestCheckboxStates.set(checkbox, checkbox.checked);
  checkbox.dataset.ao3hDefault = '1';
  checkbox.checked = true;
}

function applyCommentDensity (mode) {
  document.documentElement.classList.remove(
    `${DENSITY_CLASS_PREFIX}compact`,
    `${DENSITY_CLASS_PREFIX}spacious`
  );
  if (mode === 'compact' || mode === 'spacious') {
    document.documentElement.classList.add(`${DENSITY_CLASS_PREFIX}${mode}`);
  }
}

const commentKitHelpers = {
  fillTemplateVariables, filterTemplates, draftKeyFor, draftScopeForForm,
  shouldAutoCollapse, parseHighlightRules, matchesCustomHighlight,
  matchesSearch, buildPageJumpUrl, getCurrentUsername,
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register('commentKit', {
  title:            'Comment Kit',
  enabledByDefault: false,
}, async function init () {
  W.AO3H_CommentKit = commentKitHelpers;
  const cleanups = [];
  let active = true;

  onReady(() => {
    if (!active) return;
    if (cfg('chapterIndicator')) {
      addChapterIndicators();
      const observer = observe(document.body, { childList: true, subtree: true }, addChapterIndicators);
      cleanups.push(() => observer.disconnect());
    }
    if (cfg('guestCommentsDefault')) applyGuestCommentDefault();
    applyCommentDensity(cfg('commentDensity'));
  });

  return () => {
    active = false;
    cleanups.forEach(cleanup => cleanup());
    document.querySelectorAll(`.${NS}-ch-badge`).forEach(badge => badge.remove());
    guestCheckboxStates.forEach((checked, checkbox) => {
      checkbox.checked = checked;
      delete checkbox.dataset.ao3hDefault;
    });
    guestCheckboxStates.clear();
    applyCommentDensity('normal');
    delete W.AO3H_CommentKit;
  };
});
