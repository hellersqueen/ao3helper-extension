/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Chapter Navigation › Chapter Word Count

Counts story prose and adds an abbreviated word-count badge to each chapter on
single- and multi-chapter work pages.

Notes

- Prefaces, summaries, notes, endnotes, and chapter prefaces are excluded.
- A short retry schedule handles delayed markup and custom work skins.
- Word counts use abbreviated display such as `5.2K`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Routes } from '../../../../lib/ao3/routes.js';
import { observe, countWords } from '../../../../lib/utils/index.js';
import { upsertChapterBadgePart, removeChapterBadgePartsByKey } from '../../../../lib/ui/chapter-badge.js';
import { getChapterProse } from '../../../../lib/ao3/work-page.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const MOD = 'chapterWordCount';
const LOG = `[AO3H][${MOD}]`;

// retry a few times to catch late inserts / slow skins
const MAX_TRIES = 3;
const DELAY_MS  = 600;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PROSE EXTRACTION AND WORD COUNTING
═══════════════════════════════════════════════════════════════════════════ */

// Extraction de la prose (exclusion préfaces/notes, repli sur le workskin
// entier) déléguée à lib/ao3/work-page.js — connaissance du markup AO3
// partagée avec readingTime.js (shared.md, Z1/Z2).
function wordsForChapter(ch){
  return countWords(getChapterProse(ch));
}

function abbreviateWords(n){
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function insertOrUpdateBadge(afterEl, words, scope='chapter'){
  if (!afterEl) return false;
  const content = `~ ${abbreviateWords(words)} words in this ${scope}`;
  upsertChapterBadgePart(afterEl, 'words', content);
  return true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CHAPTER BADGES
═══════════════════════════════════════════════════════════════════════════ */

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
    observer = observe(document.body, { childList: true, subtree: true }, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scheduleRuns, 250);
    });
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
  removeChapterBadgePartsByKey('words');
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Chapter word count', parent: 'chapterNavigation', enabledByDefault: true }, async function init(){
  const stopScheduler = createScheduler();

  console.log(LOG, 'ready');

  return function cleanup () {
    stopScheduler();
    removeBadges();
  };
});
