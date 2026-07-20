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
    - commentConfiguration.js: inbox chapter badges and guest-comment defaults

    Notes

    - Submodules self-register under `commentKit` and share its settings scope.
    - The coordinator itself owns no runtime feature state.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './commentKit.css?inline';

import './commentComposing.js';
import './commentNavigation.js';
import './commentHighlighting.js';
import './draftManagement.js';
import './threadManagement.js';
import './commentConfiguration.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-commentKit');
const W = getGlobalWindow();

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
  return () => { delete W.AO3H_CommentKit; };
});
