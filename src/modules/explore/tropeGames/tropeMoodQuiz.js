/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Trope Mood Quiz

A one-question mood quiz that recommends a trope and an AO3 search link
matching the chosen mood.

Notes

- Mood → trope mapping is owned by the tropeGames coordinator (pickTropeForMood).
- The trigger button joins the coordinator's shared floating menu.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { onReady } from '../../../../lib/utils/index.js';
import { getLogger } from '../../../../lib/utils/logger.js';
const log = getLogger('tropeMoodQuiz');


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeMoodQuiz';

function getTropeList () { return W.AO3H_TropeGames?.TROPE_LIST || []; }

function buildSearchUrl (trope) {
  return `https://archiveofourown.org/works?work_search[query]=${encodeURIComponent(trope)}`;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — QUIZ MODAL
═══════════════════════════════════════════════════════════════════════════ */

let modalEl = null;
let triggerBtn = null;

function renderQuestion () {
  const q = W.AO3H_TropeGames.MOOD_QUIZ[0];
  const options = q.options.map((opt, i) =>
    `<button class="${NS}-tg-btn ${NS}-tg-mood-opt" data-mood="${escapeHtml(opt.mood)}">${escapeHtml(opt.label)}</button>`
  ).join('');
  return `
    <div class="${NS}-tg-mood-inner" role="dialog" aria-modal="true" aria-label="Trope Mood Quiz">
      <button class="${NS}-tg-modal-close" aria-label="Close mood quiz">✕</button>
      <div class="${NS}-tg-mood-title">🎭 What's Your Mood?</div>
      <p class="${NS}-tg-mood-question">${escapeHtml(q.question)}</p>
      <div class="${NS}-tg-mood-options">${options}</div>
    </div>
  `;
}

function renderResult (trope) {
  return `
    <div class="${NS}-tg-mood-inner" role="dialog" aria-modal="true" aria-label="Trope Mood Quiz result">
      <button class="${NS}-tg-modal-close" aria-label="Close mood quiz">✕</button>
      <div class="${NS}-tg-mood-title">🎭 Your Trope</div>
      <p class="${NS}-tg-mood-result">${escapeHtml(trope)}</p>
      <div class="${NS}-tg-mood-actions">
        <button class="${NS}-tg-btn ${NS}-tg-mood-again">Try Again</button>
        <a class="${NS}-tg-btn" href="${escapeHtml(buildSearchUrl(trope))}"
           target="_blank" rel="noopener noreferrer">Search AO3 ↗</a>
      </div>
    </div>
  `;
}

function openModal () {
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = `${NS}-tg-mood-modal`;
    modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
    document.body.appendChild(modalEl);
  }
  showQuestion();
  modalEl.style.display = 'flex';
}

function showQuestion () {
  modalEl.innerHTML = renderQuestion();
  modalEl.querySelector(`.${NS}-tg-modal-close`).addEventListener('click', closeModal);
  modalEl.querySelectorAll(`.${NS}-tg-mood-opt`).forEach(btn => {
    btn.addEventListener('click', () => {
      const trope = W.AO3H_TropeGames.pickTropeForMood(btn.dataset.mood, getTropeList());
      if (trope) showResult(trope);
    });
  });
}

function showResult (trope) {
  modalEl.innerHTML = renderResult(trope);
  modalEl.querySelector(`.${NS}-tg-modal-close`).addEventListener('click', closeModal);
  modalEl.querySelector(`.${NS}-tg-mood-again`).addEventListener('click', showQuestion);
}

function closeModal () {
  if (modalEl) modalEl.style.display = 'none';
}

function injectTrigger () {
  triggerBtn = document.createElement('button');
  triggerBtn.className = `${NS}-tg-btn ${NS}-tg-trigger-btn ${NS}-tg-mood-trigger`;
  triggerBtn.textContent = '🎭 Mood Quiz';
  triggerBtn.setAttribute('aria-label', 'Open Trope Mood Quiz');
  triggerBtn.addEventListener('click', openModal);
  W.AO3H_TropeGames?.registerMenuItem(triggerBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Mood Quiz', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    if (W.AO3H_TropeGames?.cfg('enableMoodQuiz') === false) return () => {};
    log.debug('init');

    let active = true;
    onReady(() => {
      if (!active) return;
      injectTrigger();
    });

    return function cleanup () {
      active = false;
      closeModal();
      modalEl?.remove();
      triggerBtn?.remove();
      modalEl = null;
      triggerBtn = null;
      log.debug('cleanup');
    };
  }
);
