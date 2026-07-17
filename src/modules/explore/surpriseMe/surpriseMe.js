/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Surprise Me

    Module ID: surpriseMe
    Display Name: Surprise Me
    Tab: Explore

    Purpose

    Selects a random eligible work from the current AO3 listing and either
    opens it immediately or presents a compact preview first.

    Features

    - Visible, unread, and optionally completed-only work selection
    - Rerollable title, summary, and statistics preview
    - Shared trigger API for the Keyboard Shortcuts module

    Notes

    - Hidden blurbs and works present in reading history are excluded.
    - No-result feedback dismisses itself after three seconds.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { getHistoryWorkIdSet } from '../../../../lib/storage/keys.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './surpriseMe.css?inline';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-surpriseMe');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'surpriseMe';
const LOG  = `[AO3H][${MOD}]`;

const DEFAULTS = {
  showPreviewBeforeOpen: false,
  completedOnly:         false,
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ELIGIBLE WORK SELECTION
═══════════════════════════════════════════════════════════════════════════ */

function isListingPage () {
  const p = location.pathname;
  return /^\/works(\?|$)/.test(p) ||
         /^\/tags\/[^/]+\/works/.test(p) ||
         /^\/users\/[^/]+\/(bookmarks|works|readings)/.test(p) ||
         /^\/collections\/[^/]+\/works/.test(p) ||
         /^\/bookmarks(\?|$)/.test(p) ||
         /^\/search/.test(p);
}

function getWorkId (blurb) {
  return extractWorkIdFromBlurb(blurb);
}

function isVisible (el) {
  return el.offsetParent !== null &&
         getComputedStyle(el).display !== 'none' &&
         getComputedStyle(el).visibility !== 'hidden';
}

function getBlurbs () {
  const seenIds = getHistoryWorkIdSet();
  let all = Array.from(document.querySelectorAll(
    'li.work.blurb, li.bookmark.blurb, li.blurb.group'
  ));

  // Exclude hidden blurbs (filtered out by hideByTags or other modules)
  all = all.filter(isVisible);

  // Exclude already-read works (readingTracker dependency)
  all = all.filter(b => {
    const id = getWorkId(b);
    return !id || !seenIds.has(id);
  });

  if (!cfg('completedOnly')) return all;

  // Filter to complete works only (chapters match: "3/3", not "2/?")
  return all.filter(b => {
    const chapters = b.querySelector('dd.chapters');
    if (!chapters) return false;
    const txt = chapters.textContent.trim();
    const m = txt.match(/^(\d+)\/(\d+)$/);
    return m && m[1] === m[2];
  });
}

function pickRandom () {
  const blurbs = getBlurbs();
  if (!blurbs.length) return null;
  return blurbs[Math.floor(Math.random() * blurbs.length)];
}

function getWorkUrl (blurb) {
  const a = blurb.querySelector('.heading a[href*="/works/"]');
  return a?.href || null;
}

function getWorkMeta (blurb) {
  const title   = blurb.querySelector('.heading a[href*="/works/"]')?.textContent.trim() || '(untitled)';
  const author  = blurb.querySelector('[rel="author"]')?.textContent.trim() || '?';
  const summary = blurb.querySelector('.summary blockquote, blockquote.userstuff')?.textContent.trim() || '';
  const words   = blurb.querySelector('dd.words')?.textContent.trim() || '';
  const kudos   = blurb.querySelector('dd.kudos a')?.textContent.trim() || '0';
  return { title, author, summary: summary.slice(0, 200), words, kudos };
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RANDOM-WORK PREVIEW AND FEEDBACK
═══════════════════════════════════════════════════════════════════════════ */

let previewEl = null;

function showPreview (blurb, container) {
  const url  = getWorkUrl(blurb);
  const meta = getWorkMeta(blurb);
  if (!url) return;

  removePreview();
  previewEl = document.createElement('div');
  previewEl.className = `${NS}-random-preview`;
  previewEl.innerHTML = `
    <h4>${escapeHtml(meta.title)}</h4>
    <p><em>by ${escapeHtml(meta.author)}</em> · ${escapeHtml(meta.words)} words · ${escapeHtml(meta.kudos)} kudos</p>
    ${meta.summary ? `<p>${escapeHtml(meta.summary)}${meta.summary.length >= 200 ? '…' : ''}</p>` : ''}
    <div class="${NS}-random-preview-actions">
      <button class="primary" data-go>Open</button>
      <button data-reroll>Reroll</button>
      <button data-close>Close</button>
    </div>
  `;

  previewEl.querySelector('[data-go]').addEventListener('click', () => { location.href = url; });
  previewEl.querySelector('[data-reroll]').addEventListener('click', () => {
    const next = pickRandom();
    if (next) showPreview(next, container);
    else { removePreview(); showNoResults(); }
  });
  previewEl.querySelector('[data-close]').addEventListener('click', removePreview);

  container.insertAdjacentElement('afterend', previewEl);
}

function removePreview () {
  previewEl?.remove();
  previewEl = null;
}

let emptyMsgEl = null;
let emptyMsgTimer = null;

function showNoResults () {
  removeEmptyMsg();
  emptyMsgEl = document.createElement('span');
  emptyMsgEl.className = `${NS}-random-empty`;
  emptyMsgEl.textContent = 'No eligible works found.';
  btnEl?.insertAdjacentElement('afterend', emptyMsgEl);
  emptyMsgTimer = setTimeout(() => {
    emptyMsgTimer = null;
    removeEmptyMsg();
  }, 3000);
}

function removeEmptyMsg () {
  if (emptyMsgTimer !== null) {
    clearTimeout(emptyMsgTimer);
    emptyMsgTimer = null;
  }
  emptyMsgEl?.remove();
  emptyMsgEl = null;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RANDOM-WORK CONTROL AND SHARED API
═══════════════════════════════════════════════════════════════════════════ */

let btnEl = null;

function injectButton () {
  if (document.querySelector(`.${NS}-random-btn`)) return;

  btnEl = document.createElement('button');
  btnEl.className = `${NS}-random-btn`;
  btnEl.textContent = 'Random Work';
  btnEl.title = 'Pick a random work from this page';

  btnEl.addEventListener('click', triggerRandom);

  // Insert before the work list
  const list = document.querySelector('ol.work.index.group, ol.index.group, ul.index.group');
  if (list?.parentNode) {
    list.parentNode.insertBefore(btnEl, list);
  } else {
    const main = document.querySelector('#main');
    if (main) main.prepend(btnEl);
  }
}

function triggerRandom () {
  const blurb = pickRandom();
  if (!blurb) { showNoResults(); return; }
  removeEmptyMsg();
  if (cfg('showPreviewBeforeOpen')) {
    showPreview(blurb, btnEl || document.querySelector(`#main`));
  } else {
    const url = getWorkUrl(blurb);
    if (url) location.href = url;
  }
}

// ── Keyboard Shortcuts integration ────────────────────────────────────────
// keyboardShortcuts.js has a built-in "surpriseMe" action (Ctrl+Shift+R)
// that delegates to W.AO3H_SurpriseMe.trigger when present.
function exposeApi () {
  W.AO3H_SurpriseMe = { trigger: triggerRandom };
}

function hideApi () {
  delete W.AO3H_SurpriseMe;
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

function cleanup () {
  btnEl?.remove(); btnEl = null;
  removePreview();
  removeEmptyMsg();
  hideApi();
  console.log(LOG, 'cleaned up');
}

register(MOD, {
  title: 'Surprise Me',
  enabledByDefault: false,
}, async function init () {
  if (!isListingPage()) return;

  injectButton();
  exposeApi();

  console.log(LOG, 'initialized');
  return cleanup;
});
