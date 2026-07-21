/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Trope Bingo Patterns

Generates and persists an N×N trope bingo card, checks cells from work-page
tags, and detects completed lines and advanced board patterns.

Notes

- The center cell is always a pre-checked FREE space.
- Completed rows, columns, diagonals, X, frame, corners, and blackout persist.
- Users may also toggle cells manually or generate a new card.
- Card size, category, and exclusions are configurable (chantier 4); newly
  completed patterns found during background tag scanning surface as a toast
  even if the card isn't open (chantier 4).

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';
import { showToast } from '../../../../lib/ui/toast.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeBingoPatterns';
const LOG  = `[AO3H][${MOD}]`;
function getShared () { return W.AO3H_TropeGames || null; }
const storageKey = () => W.AO3H_TropeGames.storageKeys.bingo;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CARD GENERATION AND PERSISTENCE
═══════════════════════════════════════════════════════════════════════════ */

function shuffle (arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCard (size, category, exclude) {
  const TROPE_LIST = getShared()?.TROPE_LIST || [];
  const excludeSet = new Set((exclude || []).map(t => t.trim().toLowerCase()).filter(Boolean));
  const needed = size * size - 1;

  const preferred = shuffle(W.AO3H_TropeGames.filterTropesByCategory(TROPE_LIST, category).filter(t => !excludeSet.has(t.toLowerCase())));
  const fillers = shuffle(TROPE_LIST.filter(t => !preferred.includes(t) && !excludeSet.has(t.toLowerCase())));
  const tropes = [...preferred, ...fillers].slice(0, needed);

  tropes.splice(W.AO3H_TropeGames.freeCenterIndex(size), 0, 'FREE');
  return tropes;
}

function cardOptions (cfg) {
  const size = cfg('bingoSize') === 9 ? 3 : 5;
  return { size, category: cfg('bingoCategory') || '', exclude: (cfg('bingoExclude') || '').split(',') };
}

function freshState (opts) {
  const fresh = { card: generateCard(opts.size, opts.category, opts.exclude), checked: Array(opts.size * opts.size).fill(false), completed: [], size: opts.size };
  fresh.checked[W.AO3H_TropeGames.freeCenterIndex(opts.size)] = true;
  return fresh;
}

function loadState (opts) {
  const state = lsGet(storageKey());
  if (state?.card?.length === opts.size * opts.size) return state;
  const fresh = freshState(opts);
  lsSet(storageKey(), fresh);
  return fresh;
}

function saveState (state) { lsSet(storageKey(), state); }


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PATTERN DETECTION AND TAG AUTO-CHECKING
═══════════════════════════════════════════════════════════════════════════ */

function detectPatterns (checked, patterns) {
  const found = [];
  for (const [name, indices] of Object.entries(patterns)) {
    if (indices.every(i => checked[i])) found.push(name);
  }
  return found;
}

function autoCheckFromTags (state, patterns) {
  const pageTags = getShared()?.getPageFreeformTagsLower() || [];
  if (!pageTags.length) return state;
  const previouslyCompleted = new Set(state.completed);
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
    state.completed = detectPatterns(state.checked, patterns);
    saveState(state);
    // Surface newly completed patterns even if the card isn't open (chantier 4)
    const newlyCompleted = state.completed.filter(p => !previouslyCompleted.has(p));
    newlyCompleted.forEach(name => {
      showToast(`🎯 Bingo pattern completed: ${name}!`, { type: 'success', duration: 5000 });
    });
  }
  return state;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BINGO CARD INTERFACE
═══════════════════════════════════════════════════════════════════════════ */

let wrapEl = null;
let toggleBtn = null;
let isOpen = false;

function renderCard (state, patterns) {
  const patternCells = new Set();
  for (const name of state.completed) {
    if (patterns[name]) patterns[name].forEach(i => patternCells.add(i));
  }
  const size = state.size || 5;
  const freeIdx = W.AO3H_TropeGames.freeCenterIndex(size);
  const progress = W.AO3H_TropeGames.bingoProgressPercent(state.checked, freeIdx);

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
    <div class="${NS}-tg-bingo-grid ${NS}-tg-bingo-grid-${size}">${cellsHtml}</div>
    <div class="${NS}-tg-bingo-progress" title="${progress}% of the card checked">${progress}% complete</div>
    <div class="${NS}-tg-bingo-actions">
      <button class="${NS}-tg-btn ${NS}-tg-bingo-reset">New Card</button>
      <button class="${NS}-tg-btn ${NS}-tg-bingo-export">Patterns: ${state.completed.length}</button>
    </div>
  `;
}

function openCard (state, patterns, opts) {
  if (!wrapEl) {
    wrapEl = document.createElement('div');
    wrapEl.className = `${NS}-tg-bingo-wrap`;
    document.body.appendChild(wrapEl);
  }
  wrapEl.innerHTML = renderCard(state, patterns);
  wrapEl.style.display = 'block';
  isOpen = true;
  attachCardEvents(state, patterns, opts);
}

function attachCardEvents (state, patterns, opts) {
  wrapEl.querySelector(`.${NS}-tg-bingo-close`)?.addEventListener('click', () => {
    wrapEl.style.display = 'none';
    isOpen = false;
  });
  wrapEl.querySelector(`.${NS}-tg-bingo-reset`)?.addEventListener('click', () => {
    const fresh = freshState(opts);
    saveState(fresh);
    wrapEl.innerHTML = renderCard(fresh, patterns);
    attachCardEvents(fresh, patterns, opts);
  });
  wrapEl.querySelector(`.${NS}-tg-bingo-export`)?.addEventListener('click', () => {
    const list = state.completed.length
      ? state.completed.join(', ')
      : 'No patterns completed yet.';
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
      state.completed = detectPatterns(state.checked, patterns);
      saveState(state);
      wrapEl.innerHTML = renderCard(state, patterns);
      attachCardEvents(state, patterns, opts);
    });
  });
}

function injectToggle (opts) {
  toggleBtn = document.createElement('button');
  toggleBtn.className = `${NS}-tg-btn ${NS}-tg-trigger-btn ${NS}-tg-bingo-toggle`;
  toggleBtn.textContent = '🎯 Bingo';
  toggleBtn.setAttribute('aria-label', 'Toggle Trope Bingo card');
  toggleBtn.addEventListener('click', () => {
    if (isOpen && wrapEl) {
      wrapEl.style.display = 'none';
      isOpen = false;
    } else {
      const patterns = W.AO3H_TropeGames.buildBingoPatterns(opts.size);
      const state = loadState(opts);
      openCard(state, patterns, opts);
    }
  });
  W.AO3H_TropeGames?.registerMenuItem(toggleBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Bingo', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    const cfg = (key) => getShared()?.cfg(key);
    if (cfg('enableBingo') === false) return () => {};
    console.log(LOG, 'init');

    const opts = cardOptions(cfg);
    const patterns = W.AO3H_TropeGames.buildBingoPatterns(opts.size);
    let state = loadState(opts);

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild plantait (Cannot read properties of null),
    // constaté sur plusieurs modules similaires en test.
    let active = true;
    onReady(() => {
      if (!active) return;
      if (isWorkPage()) {
        state = autoCheckFromTags(state, patterns);
      }
      injectToggle(opts);
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
