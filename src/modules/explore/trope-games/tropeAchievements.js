/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Achievements Submodule
    Submodule ID: tropeAchievements
    Display Name: Trope Achievements
    Source Module: Trope Games

    - Feature: Achievement checking
      - Option: Validate stats against conditions
      - Option: Detect new unlocks

    - Feature: Unlock notifications (toast, auto-dismiss 5s, click to dismiss)

    - Feature: Achievement history
      - Option: Store all unlocked badge IDs
      - Option: Prevent duplicate unlocks
      - Option: LocalStorage persistence

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeAchievements';
const LOG  = `[AO3H][${MOD}]`;
const SK   = `${NS}:tg:achievements`;
const BINGO_SK = `${NS}:tg:bingo`;
const STATS_SK = `${NS}:tg:stats`;
const activeToasts = new Set();
const activeTimers = new Set();

// ── Helpers ───────────────────────────────────────────────────────────────
function getShared () { return W.AO3H_TropeGames || null; }
function lsGet (key) {
  const s = getShared();
  if (s) return s.lsGet(key);
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet (key, val) {
  const s = getShared();
  if (s) return s.lsSet(key, val);
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function escapeHtml (str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function schedule (callback, delay) {
  const timer = setTimeout(() => {
    activeTimers.delete(timer);
    callback();
  }, delay);
  activeTimers.add(timer);
  return timer;
}

// ── Achievement definitions ───────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id: 'first_trope',
    icon: '🌱',
    title: 'First Steps',
    desc: 'Read a work tagged with any tracked trope.',
    check: (stats) => Object.values(stats).some(n => n >= 1),
  },
  {
    id: 'trope_10',
    icon: '📚',
    title: 'Trope Curious',
    desc: 'Read 10 works tagged with tracked tropes.',
    check: (stats) => Object.values(stats).reduce((a, b) => a + b, 0) >= 10,
  },
  {
    id: 'trope_50',
    icon: '🏆',
    title: 'Trope Aficionado',
    desc: 'Read 50 works tagged with tracked tropes.',
    check: (stats) => Object.values(stats).reduce((a, b) => a + b, 0) >= 50,
  },
  {
    id: 'variety_5',
    icon: '🌈',
    title: 'Variety Pack',
    desc: 'Read works covering at least 5 different tropes.',
    check: (stats) => Object.keys(stats).length >= 5,
  },
  {
    id: 'variety_20',
    icon: '🎨',
    title: 'Trope Connoisseur',
    desc: 'Read works covering at least 20 different tropes.',
    check: (stats) => Object.keys(stats).length >= 20,
  },
  {
    id: 'bingo_line',
    icon: '🎯',
    title: 'Bingo!',
    desc: 'Complete at least one line on your Bingo card.',
    check: (stats, bingo) => (bingo?.completed?.length || 0) >= 1,
  },
  {
    id: 'bingo_x',
    icon: '✖️',
    title: 'X Marks the Spot',
    desc: 'Complete the X pattern on your Bingo card.',
    check: (stats, bingo) => bingo?.completed?.includes('X'),
  },
  {
    id: 'bingo_blackout',
    icon: '🌑',
    title: 'Blackout',
    desc: 'Check every cell on your Bingo card.',
    check: (stats, bingo) => bingo?.completed?.includes('Blackout'),
  },
  {
    id: 'obsessed',
    icon: '💜',
    title: 'Obsessed',
    desc: 'Read 10 or more works with the same trope.',
    check: (stats) => Object.values(stats).some(n => n >= 10),
  },
];

// ── State management ──────────────────────────────────────────────────────
function loadUnlocked () { return lsGet(SK) || []; }
function saveUnlocked (list) { lsSet(SK, list); }

function checkNewUnlocks () {
  const stats   = lsGet(STATS_SK) || {};
  const bingo   = lsGet(BINGO_SK) || {};
  const current = loadUnlocked();
  const unlockedIds = new Set(current.map(u => u.id));
  const newUnlocks  = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlockedIds.has(ach.id)) continue;
    try {
      if (ach.check(stats, bingo)) newUnlocks.push(ach);
    } catch {}
  }

  if (newUnlocks.length) {
    const updated = [...current, ...newUnlocks.map(a => ({ id: a.id, unlockedAt: new Date().toISOString() }))];
    saveUnlocked(updated);
    console.log(LOG, 'New achievements unlocked:', newUnlocks.map(a => a.title));
  }
  return newUnlocks;
}

// ── Toast notification ────────────────────────────────────────────────────
function showToast (ach) {
  const el = document.createElement('div');
  el.className = `${NS}-tg-achievement-toast`;
  el.innerHTML = `
    <div class="${NS}-tg-ach-icon">${escapeHtml(ach.icon)}</div>
    <div class="${NS}-tg-ach-subtitle">🎉 Achievement Unlocked!</div>
    <div class="${NS}-tg-ach-title-text">${escapeHtml(ach.title)}</div>
    <div class="${NS}-tg-ach-desc-text">${escapeHtml(ach.desc)}</div>
  `;
  document.body.appendChild(el);
  activeToasts.add(el);
  const timer = schedule(() => {
    el.remove();
    activeToasts.delete(el);
  }, 5000);
  el.addEventListener('click', () => {
    clearTimeout(timer);
    activeTimers.delete(timer);
    el.style.transition = 'transform .3s, opacity .3s';
    el.style.transform = 'scale(0.9)';
    el.style.opacity = '0';
    schedule(() => {
      el.remove();
      activeToasts.delete(el);
    }, 300);
  }, { once: true });
}

// ── Achievements panel ────────────────────────────────────────────────────
let panelEl   = null;
let triggerBtn = null;

function renderPanel () {
  const unlocked = loadUnlocked();
  const unlockedIds = new Set(unlocked.map(u => u.id));
  const rows = ACHIEVEMENTS.map(ach => {
    const done = unlockedIds.has(ach.id);
    return `
      <div class="${NS}-tg-ach-row${done ? ' is-done' : ''}">
        <span class="${NS}-tg-ach-row-icon">${escapeHtml(ach.icon)}</span>
        <div>
          <div class="${NS}-tg-ach-row-title">${escapeHtml(ach.title)}</div>
          <div class="${NS}-tg-ach-row-desc">${escapeHtml(ach.desc)}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="${NS}-tg-ach-panel-header">
      🏅 Achievements (${unlockedIds.size}/${ACHIEVEMENTS.length})
      <button class="${NS}-tg-ach-close" aria-label="Close achievements">✕</button>
    </div>
    ${rows}
  `;
}

function openPanel () {
  if (!panelEl) {
    panelEl = document.createElement('div');
    panelEl.className = `${NS}-tg-ach-panel`;
    document.body.appendChild(panelEl);
  }
  panelEl.innerHTML = renderPanel();
  panelEl.style.display = 'block';
  panelEl.querySelector(`.${NS}-tg-ach-close`).addEventListener('click', () => {
    panelEl.style.display = 'none';
  });
}

function injectTrigger () {
  triggerBtn = document.createElement('button');
  triggerBtn.className = `${NS}-tg-btn ${NS}-tg-trigger-btn ${NS}-tg-ach-trigger`;
  triggerBtn.textContent = '🏅 Achievements';
  triggerBtn.setAttribute('aria-label', 'Open Trope Achievements');
  triggerBtn.addEventListener('click', () => {
    if (panelEl?.style.display === 'block') {
      panelEl.style.display = 'none';
    } else {
      openPanel();
    }
  });
  document.body.appendChild(triggerBtn);
}

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Trope Achievements', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    console.log(LOG, 'init');

    // Check achievementsEnabled setting (default true)
    let s = {};
    try {
      s = JSON.parse(localStorage.getItem('ao3h:mod:tropeAchievements:settings') || '{}');
    } catch { /* malformed settings fall back to defaults */ }
    if (s.achievementsEnabled === false) return () => {};

    // Check for newly unlocked achievements
    const newUnlocks = checkNewUnlocks();
    for (const ach of newUnlocks) {
      showToast(ach);
    }

    injectTrigger();

    return function cleanup () {
      panelEl?.remove();
      triggerBtn?.remove();
      activeTimers.forEach(timer => clearTimeout(timer));
      activeTimers.clear();
      activeToasts.forEach(toast => toast.remove());
      activeToasts.clear();
      panelEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
