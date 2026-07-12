// ── ChapterWordCount ──────────────────────────────────────────────────────────
// Submodule of: chapterNavigation — work pages only
// Submodule ID: chapterWordCount
// Registered via register(), parent: 'chapterNavigation'
//
// Responsibilities:
//   - Show a "~ X.XK words in this chapter" badge on each chapter
//   - Works on multi-chapter works (badge per chapter) and single-chapter works
//   - Counts only story prose — excludes preface, summary, author notes, endnotes
//   - Retries a few times to handle late DOM inserts / custom skins
//   - Cleanup: removes all injected badges
//
// Format: abbreviated (e.g. "~ 5.2K words") per spec — NOT comma-formatted
// No config keys — behaviour is fixed (display only, no user options)

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Routes } from '../../../../lib/ao3/routes.js';

const W = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'chapterWordCount';
const LOG = `[AO3H][${MOD}]`;

// retry a few times to catch late inserts / slow skins
const MAX_TRIES = 3;
const DELAY_MS  = 600;

/* ---------- selectors & helpers ---------- */

// containers to exclude from counting
const EXCLUDE_SCOPES = '.preface, .summary, .notes, .endnotes, .chapter.preface';

// primary: AO3 prose lives in `.userstuff.module` inside the chapter
function proseNodesForChapter(ch){
  // 1) the canonical prose nodes
  let main = Array.from(ch.querySelectorAll('.userstuff.module'));
  main = main.filter(el => !el.closest(EXCLUDE_SCOPES));
  if (main.length) return main;

  // 2) fallback: any .userstuff inside the chapter
  let all = Array.from(ch.querySelectorAll('.userstuff'));
  all = all.filter(el => !el.closest(EXCLUDE_SCOPES));
  if (all.length) return all;

  // 3) last resort: sibling area between this chapter and the next
  return userstuffsBetweenChapters(ch);
}

// walk forward siblings until next .chapter; collect .userstuff there
function userstuffsBetweenChapters(ch){
  const out = [];
  for (let n = ch.nextElementSibling; n; n = n.nextElementSibling){
    if (n.classList?.contains('chapter')) break; // stop at next chapter
    if (n.matches?.('.userstuff')) out.push(n);
    out.push(...(n.querySelectorAll?.('.userstuff') || []));
  }
  const main = out.filter(el => !el.closest(EXCLUDE_SCOPES));
  return main.length ? main : out;
}

// whole-page fallback (single-chapter or nonstandard markup)
function userstuffsWholeWorkskin(){
  const ws = document.getElementById('workskin') || document.querySelector('#workskin') || document;
  const all = Array.from(ws.querySelectorAll('.userstuff.module, .userstuff'));
  const main = all.filter(el => !el.closest(EXCLUDE_SCOPES));
  return main.length ? main : all;
}

function textFromNodes(nodes){
  return nodes.map(n => n.innerText || '').join('\n');
}

function countWordsFromText(text){
  if (!text) return 0;
  const s = text.replace(/\s+/g, ' ').trim();
  if (!s) return 0;
  try {
    const tokens = s.match(/[\p{L}\p{N}’'-]+/gu);
    if (tokens) return tokens.length;
  } catch {}
  const simple = s.match(/\S+/g);
  return simple ? simple.length : 0;
}

function wordsForChapter(ch){
  let nodes = proseNodesForChapter(ch);
  if (!nodes.length) nodes = userstuffsWholeWorkskin();
  return countWordsFromText(textFromNodes(nodes));
}

function setTextIfChanged(el, text){
  if (!el) return false;
  if (el.textContent === text) return false;
  el.textContent = text;
  return true;
}

function abbreviateWords(n){
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function insertOrUpdateBadge(afterEl, words, scope='chapter'){
  if (!afterEl) return false;
  const content = `~ ${abbreviateWords(words)} words in this ${scope}`;
  const next = afterEl.nextElementSibling;
  if (next && next.classList?.contains(`${NS}-wc-badge`)) {
    return setTextIfChanged(next, content);
  }
  const el = document.createElement('div');
  el.className = `${NS}-wc-badge`;
  el.setAttribute('data-ao3h-mod', MOD);
  el.textContent = content;
  afterEl.insertAdjacentElement('afterend', el);
  return true;
}

/* ---------- main passes ---------- */

function injectPerChapterBadges(){
  let chapters = Array.from(document.querySelectorAll('#chapters .chapter'));
  if (!chapters.length) chapters = Array.from(document.querySelectorAll('#workskin .chapter'));
  if (!chapters.length) return false;

  chapters.forEach(ch => {
    const words = wordsForChapter(ch);
    const header =
      ch.querySelector('h3.title, h2.heading, h3.heading, h2, h3') || ch;
    insertOrUpdateBadge(header, words, 'chapter');
  });
  return true;
}

function injectSingleChapterBadge(){
  const ws = document.getElementById('workskin') || document.querySelector('#workskin');
  if (!ws) return;
  const ch = ws.querySelector('.chapter') || ws;
  const words = wordsForChapter(ch);
  const anchor =
    ws.querySelector('h2.title, h2.heading, h3.title, h3.heading') ||
    ch.querySelector?.('h2, h3') ||
    ws;
  insertOrUpdateBadge(anchor, words, 'chapter');
}

function onRightPage(){
  return !!(Routes.isWork?.() || Routes.isChapter?.() || Routes.isWorkShow?.());
}

function runOnce(){
  if (!onRightPage()) return;
  const did = injectPerChapterBadges();
  if (!did) injectSingleChapterBadge();
}

function createScheduler(){
  let active = true;
  let observer = null;
  let idleId = null;
  let debounceTimer = null;
  let readyHandler = null;
  const retryTimers = new Set();

  const cancelScheduledRuns = () => {
    retryTimers.forEach(timer => clearTimeout(timer));
    retryTimers.clear();
    if (idleId !== null && typeof W.cancelIdleCallback === 'function') W.cancelIdleCallback(idleId);
    idleId = null;
  };

  const scheduleRuns = () => {
    if (!active) return;
    cancelScheduledRuns();
    let tries = 0;
    const doRun = () => {
      if (!active) return;
      tries++;
      try { runOnce(); } catch(e){ console.error(LOG, `run ${tries} failed`, e); }
      if (tries < MAX_TRIES) {
        const timer = setTimeout(() => { retryTimers.delete(timer); doRun(); }, DELAY_MS);
        retryTimers.add(timer);
      }
    };
    if (typeof W.requestIdleCallback === 'function') {
      idleId = W.requestIdleCallback(() => { idleId = null; doRun(); }, { timeout: 1200 });
    } else {
      const timer = setTimeout(() => { retryTimers.delete(timer); doRun(); }, 0);
      retryTimers.add(timer);
    }
  };

  const start = () => {
    if (!active) return;
    scheduleRuns();
    observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scheduleRuns, 250);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    readyHandler = start;
    document.addEventListener('DOMContentLoaded', readyHandler, { once: true });
  } else {
    start();
  }

  return () => {
    active = false;
    if (readyHandler) document.removeEventListener('DOMContentLoaded', readyHandler);
    observer?.disconnect();
    clearTimeout(debounceTimer);
    cancelScheduledRuns();
  };
}

function removeBadges(){
  document.querySelectorAll(`.${NS}-wc-badge,[data-ao3h-mod="${MOD}"]`).forEach(el => el.remove());
}

/* ---------- registration ---------- */

register(MOD, { title: 'Chapter word count', parent: 'chapterNavigation', enabledByDefault: true }, async function init(){
  const stopScheduler = createScheduler();

  console.log(LOG, 'ready');

  return function cleanup () {
    stopScheduler();
    removeBadges();
  };
});
