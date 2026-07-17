/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Trope Bingo Patterns

Generates and persists a 5×5 trope bingo card, checks cells from work-page
tags, and detects completed lines and advanced board patterns.

Notes

- The center cell is always a pre-checked FREE space.
- Completed rows, columns, diagonals, X, frame, corners, and blackout persist.
- Users may also toggle cells manually or generate a new card.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeBingoPatterns';
const LOG  = `[AO3H][${MOD}]`;
const SK   = `${NS}:tg:bingo`;

function getShared () { return W.AO3H_TropeGames || null; }


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CARD GENERATION AND PERSISTENCE
═══════════════════════════════════════════════════════════════════════════ */

const FREE_CENTER = 12; // index 12 of 25 cells

function shuffle (arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCard () {
  const TROPE_LIST = getShared()?.TROPE_LIST || [];
  const tropes = shuffle([...TROPE_LIST]).slice(0, 24);
  // Insert FREE space at index 12
  tropes.splice(FREE_CENTER, 0, 'FREE');
  return tropes;
}

function loadState () {
  const state = lsGet(SK);
  if (state?.card?.length === 25) return state;
  const fresh = { card: generateCard(), checked: Array(25).fill(false), completed: [] };
  fresh.checked[FREE_CENTER] = true; // FREE square pre-checked
  lsSet(SK, fresh);
  return fresh;
}

function saveState (state) { lsSet(SK, state); }


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PATTERN DETECTION AND TAG AUTO-CHECKING
═══════════════════════════════════════════════════════════════════════════ */

const PATTERNS = {
  'Row 1': [0,1,2,3,4],
  'Row 2': [5,6,7,8,9],
  'Row 3': [10,11,12,13,14],
  'Row 4': [15,16,17,18,19],
  'Row 5': [20,21,22,23,24],
  'Col 1': [0,5,10,15,20],
  'Col 2': [1,6,11,16,21],
  'Col 3': [2,7,12,17,22],
  'Col 4': [3,8,13,18,23],
  'Col 5': [4,9,14,19,24],
  'Diagonal \\': [0,6,12,18,24],
  'Diagonal /': [4,8,12,16,20],
  'X': [0,4,6,8,12,16,18,20,24],
  'Frame': [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24],
  'Corners': [0,4,20,24],
  'Blackout': Array.from({length: 25}, (_, i) => i),
};

function detectPatterns (checked) {
  const found = [];
  for (const [name, indices] of Object.entries(PATTERNS)) {
    if (indices.every(i => checked[i])) found.push(name);
  }
  return found;
}

function autoCheckFromTags (state) {
  const tagEls = document.querySelectorAll('dd.freeform.tags li a.tag');
  if (!tagEls.length) return state;
  const pageTags = Array.from(tagEls).map(el => el.textContent.trim().toLowerCase());
  let changed = false;
  state.card.forEach((trope, idx) => {
    if (trope === 'FREE') return;
    if (state.checked[idx]) return;
    if (pageTags.some(t => t.includes(trope.toLowerCase()) || trope.toLowerCase().includes(t))) {
      state.checked[idx] = true;
      changed = true;
      console.log(LOG, 'Auto-checked:', trope);
    }
  });
  if (changed) {
    state.completed = detectPatterns(state.checked);
    saveState(state);
  }
  return state;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BINGO CARD INTERFACE
═══════════════════════════════════════════════════════════════════════════ */

let wrapEl = null;
let toggleBtn = null;
let isOpen = false;

function renderCard (state) {
  // Build set of all cell indices that belong to any completed pattern
  const patternCells = new Set();
  for (const name of state.completed) {
    if (PATTERNS[name]) PATTERNS[name].forEach(i => patternCells.add(i));
  }

  const cellsHtml = state.card.map((trope, i) => {
    const classes = [
      `${NS}-tg-bingo-cell`,
      trope === 'FREE'    ? `${NS}-tg-free`    : '',
      state.checked[i]    ? `${NS}-tg-checked`  : '',
      patternCells.has(i) ? `${NS}-tg-pattern`  : '',
    ].filter(Boolean).join(' ');
    return `<div class="${classes}" data-idx="${i}" title="${escapeHtml(trope)}">${escapeHtml(trope)}</div>`;
  }).join('');

  return `
    <div class="${NS}-tg-bingo-title">TROPE BINGO
      <button class="${NS}-tg-bingo-close" aria-label="Close bingo card">✕</button>
    </div>
    <div class="${NS}-tg-bingo-grid">${cellsHtml}</div>
    <div class="${NS}-tg-bingo-actions">
      <button class="${NS}-tg-btn ${NS}-tg-bingo-reset">New Card</button>
      <button class="${NS}-tg-btn ${NS}-tg-bingo-export">Patterns: ${state.completed.length}</button>
    </div>
  `;
}

function openCard (state) {
  if (!wrapEl) {
    wrapEl = document.createElement('div');
    wrapEl.className = `${NS}-tg-bingo-wrap`;
    document.body.appendChild(wrapEl);
  }
  wrapEl.innerHTML = renderCard(state);
  wrapEl.style.display = 'block';
  isOpen = true;
  attachCardEvents(state);
}

function attachCardEvents (state) {
  wrapEl.querySelector(`.${NS}-tg-bingo-close`)?.addEventListener('click', () => {
    wrapEl.style.display = 'none';
    isOpen = false;
  });
  wrapEl.querySelector(`.${NS}-tg-bingo-reset`)?.addEventListener('click', () => {
    const fresh = { card: generateCard(), checked: Array(25).fill(false), completed: [] };
    fresh.checked[FREE_CENTER] = true;
    saveState(fresh);
    wrapEl.innerHTML = renderCard(fresh);
    attachCardEvents(fresh);
  });
  wrapEl.querySelector(`.${NS}-tg-bingo-export`)?.addEventListener('click', () => {
    const list = state.completed.length
      ? state.completed.join(', ')
      : 'No patterns completed yet.';
    // Show a small overlay inside the wrap
    let info = wrapEl.querySelector(`.${NS}-tg-bingo-patterns-info`);
    if (!info) {
      info = document.createElement('div');
      info.className = `${NS}-tg-bingo-patterns-info`;
      wrapEl.appendChild(info);
    }
    info.textContent = `Patterns: ${list}`;
  });
  wrapEl.querySelectorAll(`.${NS}-tg-bingo-cell`).forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = parseInt(cell.dataset.idx, 10);
      if (state.card[idx] === 'FREE') return;
      state.checked[idx] = !state.checked[idx];
      state.completed = detectPatterns(state.checked);
      saveState(state);
      wrapEl.innerHTML = renderCard(state);
      attachCardEvents(state);
    });
  });
}

function injectToggle () {
  toggleBtn = document.createElement('button');
  toggleBtn.className = `${NS}-tg-bingo-toggle`;
  toggleBtn.textContent = '🎯 Bingo';
  toggleBtn.setAttribute('aria-label', 'Toggle Trope Bingo card');
  toggleBtn.addEventListener('click', () => {
    if (isOpen && wrapEl) {
      wrapEl.style.display = 'none';
      isOpen = false;
    } else {
      const state = loadState();
      openCard(state);
    }
  });
  document.body.appendChild(toggleBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Bingo', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    if (loadModuleSettings(MOD).enableBingo === false) return () => {};
    console.log(LOG, 'init');
    let state = loadState();

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild plantait (Cannot read properties of null),
    // constaté sur plusieurs modules similaires en test.
    let active = true;
    onReady(() => {
      if (!active) return;
      // Auto-check from work page tags
      if (isWorkPage()) {
        state = autoCheckFromTags(state);
      }

      injectToggle();
    });

    return function cleanup () {
      active = false;
      wrapEl?.remove();
      toggleBtn?.remove();
      wrapEl = null;
      toggleBtn = null;
      isOpen = false;
      console.log(LOG, 'cleanup');
    };
  }
);
