/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Trope Achievements

Evaluates trope statistics and bingo progress against achievement conditions,
persists new unlocks, and presents notifications and a history panel.

Notes

- Achievement IDs prevent duplicate unlocks.
- Unlock notifications dismiss automatically after five seconds.
- Cleanup cancels all active timers and removes transient UI.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { medalIcon } from './tropeGamesHelpers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeAchievements';
const LOG  = `[AO3H][${MOD}]`;
const SK   = `${NS}:tg:achievements`;
const BINGO_SK = `${NS}:tg:bingo`;
const STATS_SK = `${NS}:tg:stats`;
const activeToasts = new Set();
const activeTimers = new Set();

function schedule (callback, delay) {
  const timer = setTimeout(() => {
    activeTimers.delete(timer);
    callback();
  }, delay);
  activeTimers.add(timer);
  return timer;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ACHIEVEMENT DEFINITIONS AND UNLOCKS
═══════════════════════════════════════════════════════════════════════════ */

const ACHIEVEMENTS = [
  {
    id: 'first_trope',
    icon: '🌱',
    tier: 'bronze',
    title: 'First Steps',
    desc: 'Read a work tagged with any tracked trope.',
    check: (stats) => Object.values(stats).some(n => n >= 1),
  },
  {
    id: 'trope_10',
    icon: '📚',
    tier: 'bronze',
    title: 'Trope Curious',
    desc: 'Read 10 works tagged with tracked tropes.',
    check: (stats) => Object.values(stats).reduce((a, b) => a + b, 0) >= 10,
  },
  {
    id: 'trope_50',
    icon: '🏆',
    tier: 'gold',
    title: 'Trope Aficionado',
    desc: 'Read 50 works tagged with tracked tropes.',
    check: (stats) => Object.values(stats).reduce((a, b) => a + b, 0) >= 50,
  },
  {
    id: 'variety_5',
    icon: '🌈',
    tier: 'silver',
    title: 'Variety Pack',
    desc: 'Read works covering at least 5 different tropes.',
    check: (stats) => Object.keys(stats).length >= 5,
  },
  {
    id: 'variety_20',
    icon: '🎨',
    tier: 'platinum',
    title: 'Trope Connoisseur',
    desc: 'Read works covering at least 20 different tropes.',
    check: (stats) => Object.keys(stats).length >= 20,
  },
  {
    id: 'bingo_line',
    icon: '🎯',
    tier: 'bronze',
    title: 'Bingo!',
    desc: 'Complete at least one line on your Bingo card.',
    check: (stats, bingo) => (bingo?.completed?.length || 0) >= 1,
  },
  {
    id: 'bingo_x',
    icon: '✖️',
    tier: 'silver',
    title: 'X Marks the Spot',
    desc: 'Complete the X pattern on your Bingo card.',
    check: (stats, bingo) => bingo?.completed?.includes('X'),
  },
  {
    id: 'bingo_blackout',
    icon: '🌑',
    tier: 'platinum',
    title: 'Blackout',
    desc: 'Check every cell on your Bingo card.',
    check: (stats, bingo) => bingo?.completed?.includes('Blackout'),
  },
  {
    id: 'obsessed',
    icon: '💜',
    tier: 'silver',
    title: 'Obsessed',
    desc: 'Read 10 or more works with the same trope.',
    check: (stats) => Object.values(stats).some(n => n >= 10),
  },
];

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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — UNLOCK NOTIFICATIONS AND HISTORY PANEL
═══════════════════════════════════════════════════════════════════════════ */

function showToast (ach) {
  const el = document.createElement('div');
  el.className = `${NS}-tg-achievement-toast`;
  el.innerHTML = `
    <div class="${NS}-tg-ach-icon">${escapeHtml(ach.icon)}</div>
    <div class="${NS}-tg-ach-subtitle">🎉 Achievement Unlocked! ${escapeHtml(medalIcon(ach.tier))}</div>
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

let panelEl   = null;
let triggerBtn = null;
let showHistory = false;

function renderPanel () {
  const unlocked = loadUnlocked();
  const unlockedIds = new Map(unlocked.map(u => [u.id, u.unlockedAt]));
  const rows = ACHIEVEMENTS.map(ach => {
    const done = unlockedIds.has(ach.id);
    return `
      <div class="${NS}-tg-ach-row${done ? ' is-done' : ''}">
        <span class="${NS}-tg-ach-row-icon">${escapeHtml(ach.icon)}</span>
        <div>
          <div class="${NS}-tg-ach-row-title">${escapeHtml(ach.title)} <span class="${NS}-tg-ach-medal">${escapeHtml(medalIcon(ach.tier))}</span></div>
          <div class="${NS}-tg-ach-row-desc">${escapeHtml(ach.desc)}</div>
        </div>
      </div>
    `;
  }).join('');

  const historyRows = [...unlocked]
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .map(u => {
      const ach = ACHIEVEMENTS.find(a => a.id === u.id);
      if (!ach) return '';
      const when = new Date(u.unlockedAt).toLocaleDateString();
      return `<div class="${NS}-tg-ach-history-row">${escapeHtml(medalIcon(ach.tier))} ${escapeHtml(ach.title)} — <span class="${NS}-tg-ach-history-date">${escapeHtml(when)}</span></div>`;
    }).join('');

  return `
    <div class="${NS}-tg-ach-panel-header">
      🏅 Achievements (${unlockedIds.size}/${ACHIEVEMENTS.length})
      <button class="${NS}-tg-ach-close" aria-label="Close achievements">✕</button>
    </div>
    <button class="${NS}-tg-btn ${NS}-tg-ach-history-toggle">${showHistory ? 'Hide' : 'Show'} unlock history</button>
    ${showHistory ? `<div class="${NS}-tg-ach-history">${historyRows || 'Nothing unlocked yet.'}</div>` : ''}
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
  panelEl.querySelector(`.${NS}-tg-ach-history-toggle`).addEventListener('click', () => {
    showHistory = !showHistory;
    openPanel();
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
  W.AO3H_TropeGames?.registerMenuItem(triggerBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Achievements', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    console.log(LOG, 'init');

    // Check achievementsEnabled setting (default true)
    if (W.AO3H_TropeGames?.cfg('achievementsEnabled') === false) return () => {};

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild plantait (Cannot read properties of null),
    // constaté sur plusieurs modules similaires en test.
    let active = true;
    onReady(() => {
      if (!active) return;
      // Check for newly unlocked achievements
      const newUnlocks = checkNewUnlocks();
      for (const ach of newUnlocks) {
        showToast(ach);
      }

      injectTrigger();
    });

    return function cleanup () {
      active = false;
      panelEl?.remove();
      triggerBtn?.remove();
      activeTimers.forEach(timer => clearTimeout(timer));
      activeTimers.clear();
      activeToasts.forEach(toast => toast.remove());
      activeToasts.clear();
      showHistory = false;
      panelEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
