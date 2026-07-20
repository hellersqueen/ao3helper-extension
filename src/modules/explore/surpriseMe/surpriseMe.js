/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Surprise Me

    Module ID: surpriseMe
    Display Name: Surprise Me
    Tab: Explore

    Purpose

    Selects one or more random eligible works from the current AO3 listing
    (optionally widened to the listing's following pages) and either opens
    the pick immediately, or presents a rerollable preview / shortlist first.

    Features

    - Visible, unread, and optionally completed-only / minimum-word work selection
    - Single-pick preview (Open / Reroll / Close / Add to Later Shelf) or a
      multi-pick shortlist of up to 10 works with a bulk "Add checked to Later
      Shelf" action
    - Draw scope: current page only, or current page + its following listing
      pages
    - Draw history (avoids immediately re-suggesting a recently drawn work)
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
import { getHistoryWorkIdSet, addLaterShelfItem } from '../../../../lib/storage/keys.js';
import { extractWorkIdFromBlurb, getBlurbMeta, isListingPage } from '../../../../lib/ao3/parsers.js';
import { getBlurbStats } from '../../../../lib/ao3/work-stats.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './surpriseMe.css?inline';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export function isCompleteWork (blurb) {
  const chapters = blurb.querySelector('dd.chapters');
  if (!chapters) return false;
  const match = chapters.textContent.trim().match(/^(\d+)\/(\d+)$/);
  return !!match && match[1] === match[2];
}

export function getWordCount (blurb) {
  const text = blurb.querySelector('dd.words')?.textContent || '';
  const count = parseInt(text.replace(/,/g, ''), 10);
  return Number.isFinite(count) ? count : 0;
}

export function filterEligible (blurbs, { completedOnly = false, minWords = 0 } = {}) {
  let eligible = blurbs;
  if (completedOnly) eligible = eligible.filter(isCompleteWork);
  if (minWords > 0) eligible = eligible.filter(blurb => getWordCount(blurb) >= minWords);
  return eligible;
}

export function pickRandomSample (list, amount) {
  const count = Math.max(0, Math.min(amount, list.length));
  const pool = list.slice();
  const picked = [];
  for (let index = 0; index < count; index++) {
    const poolIndex = Math.floor(Math.random() * pool.length);
    picked.push(pool[poolIndex]);
    pool.splice(poolIndex, 1);
  }
  return picked;
}

export const KEY_SURPRISE_ME_HISTORY = 'ao3h:surpriseMe:history';
const MAX_HISTORY = 50;
const AVOID_REPEAT_WINDOW = 20;

export function loadHistory () {
  try {
    const history = JSON.parse(localStorage.getItem(KEY_SURPRISE_ME_HISTORY) || '[]');
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveHistory (history) {
  try {
    localStorage.setItem(KEY_SURPRISE_ME_HISTORY, JSON.stringify(history));
  } catch { /* storage unavailable */ }
}

export function recordDraw (entry) {
  if (!entry?.id) return;
  const history = loadHistory();
  history.unshift({
    id: entry.id,
    title: entry.title || '(untitled)',
    href: entry.href || null,
    at: Date.now(),
  });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  saveHistory(history);
}

export function clearHistory () {
  saveHistory([]);
}

export function getRecentDrawIds () {
  return new Set(loadHistory().slice(0, AVOID_REPEAT_WINDOW).map(entry => String(entry.id)));
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-surpriseMe');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'surpriseMe';
const LOG  = `[AO3H][${MOD}]`;

const MAX_EXTRA_PAGES = 4; // 'allPages' scope: current page + up to 4 more

const DEFAULTS = {
  showPreviewBeforeOpen: false,
  completedOnly:         false,
  resultCount:           1,
  minWords:              0,
  drawScope:             'page', // 'page' | 'allPages'
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ELIGIBLE WORK SELECTION
═══════════════════════════════════════════════════════════════════════════ */

function isVisible (el) {
  return el.offsetParent !== null &&
         getComputedStyle(el).display !== 'none' &&
         getComputedStyle(el).visibility !== 'hidden';
}

function getResultCount () {
  const n = parseInt(String(cfg('resultCount') ?? 1), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 10);
}

function getMinWords () {
  return parseInt(String(cfg('minWords') ?? 0), 10) || 0;
}

// Local page blurbs: applies the DOM-only filters (hidden by another module,
// already read) plus the shared eligibility filters (completed / min words).
function getLocalEligibleBlurbs ({ seenIds, excludeIds }) {
  let all = Array.from(document.querySelectorAll(
    'li.work.blurb, li.bookmark.blurb, li.blurb.group'
  ));

  all = all.filter(isVisible);
  all = all.filter(b => {
    const id = extractWorkIdFromBlurb(b);
    return !id || (!seenIds.has(id) && !excludeIds.has(id));
  });

  return filterEligible(all, { completedOnly: cfg('completedOnly'), minWords: getMinWords() });
}

// 'allPages' scope: fetches the listing's following pages (same query, same
// origin) and parses their blurbs. Off-page blurbs were never rendered here,
// so the "hidden by another module" check does not apply to them — only the
// already-read / min-words / completed-only filters do.
function getPaginationRange () {
  const currentPage = parseInt(new URLSearchParams(location.search).get('page') || '1', 10) || 1;
  let lastPage = currentPage;
  document.querySelectorAll('ol.pagination a[href*="page="]').forEach(a => {
    const m = a.href.match(/[?&]page=(\d+)/);
    if (m) lastPage = Math.max(lastPage, parseInt(m[1], 10));
  });
  return { currentPage, lastPage };
}

function buildPageUrl (pageNum) {
  const url = new URL(location.href);
  url.searchParams.set('page', String(pageNum));
  return url.toString();
}

async function fetchExtraPageBlurbs () {
  const { currentPage, lastPage } = getPaginationRange();
  const upper = Math.min(lastPage, currentPage + MAX_EXTRA_PAGES);
  const blurbs = [];

  for (let page = currentPage + 1; page <= upper; page++) {
    try {
      const res = await fetch(buildPageUrl(page));
      if (!res.ok) break;
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      blurbs.push(...doc.querySelectorAll('li.work.blurb, li.bookmark.blurb, li.blurb.group'));
    } catch {
      break;
    }
  }

  return blurbs;
}

async function buildCandidatePool () {
  const seenIds    = getHistoryWorkIdSet();
  const excludeIds = getRecentDrawIds();

  const pool = getLocalEligibleBlurbs({ seenIds, excludeIds });

  if (cfg('drawScope') !== 'allPages') return pool;

  const extra = await fetchExtraPageBlurbs();
  const eligibleExtra = filterEligible(extra, { completedOnly: cfg('completedOnly'), minWords: getMinWords() })
    .filter(b => {
      const id = extractWorkIdFromBlurb(b);
      return !id || (!seenIds.has(id) && !excludeIds.has(id));
    });

  return pool.concat(eligibleExtra);
}

function getWorkUrl (blurb) {
  const a = blurb.querySelector('.heading a[href*="/works/"]');
  return a?.href || null;
}

function getWorkMeta (blurb) {
  const meta  = getBlurbMeta(blurb);
  const stats = getBlurbStats(blurb);
  return {
    title:   meta.title || '(untitled)',
    author:  meta.author || '?',
    summary: (meta.summary || '').slice(0, 200),
    words:   stats.words != null ? stats.words.toLocaleString() : '',
    kudos:   stats.kudos != null ? stats.kudos.toLocaleString() : '0',
  };
}

function rememberDraw (blurb) {
  const id = extractWorkIdFromBlurb(blurb);
  if (!id) return;
  recordDraw({ id, title: getWorkMeta(blurb).title, href: getWorkUrl(blurb) });
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SINGLE-PICK PREVIEW AND FEEDBACK
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
      <button data-add-later>📌 Add to Later Shelf</button>
      <button data-reroll>Reroll</button>
      <button data-close>Close</button>
    </div>
  `;

  previewEl.querySelector('[data-go]').addEventListener('click', () => { location.href = url; });
  previewEl.querySelector('[data-add-later]').addEventListener('click', (e) => {
    const id = extractWorkIdFromBlurb(blurb);
    if (addLaterShelfItem(id, meta.title)) {
      e.target.textContent = '📌 Added';
      e.target.disabled = true;
    }
  });
  previewEl.querySelector('[data-reroll]').addEventListener('click', async () => {
    const pool = await buildCandidatePool();
    if (!pool.length) { removePreview(); showNoResults(); return; }
    const next = pool[Math.floor(Math.random() * pool.length)];
    rememberDraw(next);
    showPreview(next, container);
  });
  previewEl.querySelector('[data-close]').addEventListener('click', removePreview);

  container.insertAdjacentElement('afterend', previewEl);
}

function removePreview () {
  previewEl?.remove();
  previewEl = null;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — MULTI-PICK SHORTLIST
═══════════════════════════════════════════════════════════════════════════ */

let multiPreviewEl = null;

function showMultiPreview (blurbs, container) {
  removeMultiPreview();

  const items = blurbs.map(b => ({ id: extractWorkIdFromBlurb(b), url: getWorkUrl(b), meta: getWorkMeta(b) }))
    .filter(item => item.id && item.url);
  if (!items.length) { showNoResults(); return; }

  multiPreviewEl = document.createElement('div');
  multiPreviewEl.className = `${NS}-random-multi`;
  multiPreviewEl.innerHTML = `
    <ul class="${NS}-random-multi-list">
      ${items.map(item => `
        <li class="${NS}-random-multi-item">
          <label>
            <input type="checkbox" data-wid="${escapeHtml(item.id)}" checked>
            <a href="${escapeHtml(item.url)}">${escapeHtml(item.meta.title)}</a>
          </label>
          <span class="${NS}-random-multi-meta">by ${escapeHtml(item.meta.author)} · ${escapeHtml(item.meta.words)} words · ${escapeHtml(item.meta.kudos)} kudos</span>
        </li>
      `).join('')}
    </ul>
    <div class="${NS}-random-preview-actions">
      <button class="primary" data-add-checked>📌 Add checked to Later Shelf</button>
      <button data-reroll>Reroll</button>
      <button data-close>Close</button>
    </div>
  `;

  multiPreviewEl.querySelector('[data-add-checked]').addEventListener('click', (e) => {
    const checked = Array.from(multiPreviewEl.querySelectorAll('input[type="checkbox"]:checked'));
    checked.forEach(box => {
      const item = items.find(i => i.id === box.dataset.wid);
      if (item) addLaterShelfItem(item.id, item.meta.title);
    });
    e.target.textContent = '📌 Added';
    e.target.disabled = true;
  });
  multiPreviewEl.querySelector('[data-reroll]').addEventListener('click', async () => {
    const pool = await buildCandidatePool();
    const picks = pickRandomSample(pool, getResultCount());
    if (!picks.length) { removeMultiPreview(); showNoResults(); return; }
    picks.forEach(rememberDraw);
    showMultiPreview(picks, container);
  });
  multiPreviewEl.querySelector('[data-close]').addEventListener('click', removeMultiPreview);

  container.insertAdjacentElement('afterend', multiPreviewEl);
}

function removeMultiPreview () {
  multiPreviewEl?.remove();
  multiPreviewEl = null;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — EMPTY-RESULT FEEDBACK
═══════════════════════════════════════════════════════════════════════════ */

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

async function triggerRandom () {
  removeEmptyMsg();
  removePreview();
  removeMultiPreview();

  const pool = await buildCandidatePool();
  if (!pool.length) { showNoResults(); return; }

  const anchor = btnEl || document.querySelector('#main');
  const n = getResultCount();

  if (n <= 1) {
    const blurb = pool[Math.floor(Math.random() * pool.length)];
    rememberDraw(blurb);
    if (cfg('showPreviewBeforeOpen')) {
      showPreview(blurb, anchor);
    } else {
      const url = getWorkUrl(blurb);
      if (url) location.href = url;
    }
    return;
  }

  const picks = pickRandomSample(pool, n);
  picks.forEach(rememberDraw);
  showMultiPreview(picks, anchor);
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
  removeMultiPreview();
  removeEmptyMsg();
  hideApi();
  console.log(LOG, 'cleaned up');
}

// Set by tropeGames' Trope Roulette "🎲 Surprise Pick" button before it
// navigates to a combo search — same-tab handoff, not a persisted API
// (chantier 4, tropeGames side).
const AUTO_SURPRISE_KEY = `${NS}:tg:autoSurprise`;

register(MOD, {
  title: 'Surprise Me',
  enabledByDefault: false,
}, async function init () {
  if (!isListingPage()) return;

  injectButton();
  exposeApi();

  let autoRequested = false;
  try { autoRequested = sessionStorage.getItem(AUTO_SURPRISE_KEY) === '1'; } catch { /* storage off */ }
  if (autoRequested) {
    try { sessionStorage.removeItem(AUTO_SURPRISE_KEY); } catch { /* storage off */ }
    triggerRandom();
  }

  console.log(LOG, 'initialized');
  return cleanup;
});
