/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Statistics Submodule
    Submodule ID: tropeStatistics
    Display Name: Trope Statistics
    Source Module: Trope Games

    - Feature: Automatic tracking
      - Option: Track on work pages
      - Option: Store work ID + tropes

    - Feature: Reading history storage
      - Option: Last 1000 works
      - Option: LocalStorage persistence

    - Feature: Per-trope counts, reading streak calculation, top tropes
      ranking, CSV/JSON export.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON, downloadFile } from '../../../../lib/utils/json-file.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeStatistics';
const LOG  = `[AO3H][${MOD}]`;
const SK   = `${NS}:tg:stats`;

// ── Helpers ───────────────────────────────────────────────────────────────
function getShared () { return W.AO3H_TropeGames || null; }

function isWorkPage () {
  return /^\/works\/\d+/.test(location.pathname);
}

const SK_SEEN = `${NS}:tg:stats:seen`;

// ── Stats logic ───────────────────────────────────────────────────────────
function loadStats () { return lsGet(SK) || {}; }
function saveStats (stats) { lsSet(SK, stats); }

function loadSeen () { return lsGet(SK_SEEN) || []; }
function saveSeen (seen) { lsSet(SK_SEEN, seen); }

function todayKey () {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calcStreak (seen) {
  const dates = new Set(seen.map(e => (typeof e === 'object' ? e.date : null)).filter(Boolean));
  if (!dates.size) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dates.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function recordTropes (stats) {
  const workId = extractWorkIdFromHref(location.pathname);
  if (workId) {
    const seen = loadSeen();
    if (seen.some(e => (typeof e === 'object' ? e.id : e) === workId)) {
      console.log(LOG, 'Work already recorded, skipping:', workId);
      return stats;
    }
    seen.push({ id: workId, date: todayKey() });
    if (seen.length > 1000) seen.splice(0, seen.length - 1000);
    saveSeen(seen);
  }

  const TROPE_LIST = getShared()?.TROPE_LIST || [];
  const tagEls = document.querySelectorAll('dd.freeform.tags li a.tag');
  const pageTags = Array.from(tagEls).map(el => el.textContent.trim().toLowerCase());
  let changed = false;
  TROPE_LIST.forEach(trope => {
    if (pageTags.some(t => t.includes(trope.toLowerCase()) || trope.toLowerCase().includes(t))) {
      stats[trope] = (stats[trope] || 0) + 1;
      changed = true;
    }
  });
  if (changed) saveStats(stats);
  return stats;
}

function getTopTen (stats) {
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

// ── Panel injection ───────────────────────────────────────────────────────
let panelEl = null;
let triggerBtn = null;

function renderPanel (stats) {
  const streak = calcStreak(loadSeen());
  const streakHtml = streak > 0
    ? `<div class="${NS}-tg-stats-streak">🔥 ${streak}-day reading streak!</div>`
    : '';
  const top = getTopTen(stats);
  const max = top[0]?.[1] || 1;
  const rows = top.length
    ? top.map(([trope, count]) => `
        <div class="${NS}-tg-stats-row">
          <div class="${NS}-tg-stats-row-label">${escapeHtml(trope)} <span class="${NS}-tg-stats-row-count">(${count})</span></div>
          <div class="${NS}-tg-stats-bar-bg">
            <div class="${NS}-tg-stats-bar-fill" style="width:${Math.round(count / max * 100)}%"></div>
          </div>
        </div>`).join('')
    : `<p class="${NS}-tg-stats-empty">No tropes tracked yet. Read some works!</p>`;

  return `
    <div class="${NS}-tg-stats-header">
      📊 Top Tropes
      <button class="${NS}-tg-stats-close" aria-label="Close statistics">✕</button>
    </div>
    ${streakHtml}
    ${rows}
    <div class="${NS}-tg-stats-actions">
      <button class="${NS}-tg-btn ${NS}-tg-stats-export-json">Export JSON</button>
      <button class="${NS}-tg-btn ${NS}-tg-stats-export-csv">Export CSV</button>
    </div>
  `;
}

function openPanel () {
  const stats = loadStats();
  if (!panelEl) {
    panelEl = document.createElement('div');
    panelEl.className = `${NS}-tg-stats-panel`;
    document.body.appendChild(panelEl);
  }
  panelEl.innerHTML = renderPanel(stats);
  panelEl.style.display = 'block';

  panelEl.querySelector(`.${NS}-tg-stats-close`).addEventListener('click', () => {
    panelEl.style.display = 'none';
  });
  panelEl.querySelector(`.${NS}-tg-stats-export-json`).addEventListener('click', () => {
    downloadJSON(stats, 'ao3h-trope-stats.json');
  });
  panelEl.querySelector(`.${NS}-tg-stats-export-csv`).addEventListener('click', () => {
    const rows = [['Trope', 'Count'], ...Object.entries(stats).sort((a, b) => b[1] - a[1])];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadFile(csv, 'ao3h-trope-stats.csv', 'text/csv');
  });
}

function injectTrigger () {
  triggerBtn = document.createElement('button');
  triggerBtn.className = `${NS}-tg-btn ${NS}-tg-trigger-btn ${NS}-tg-stats-trigger`;
  triggerBtn.textContent = '📊 Stats';
  triggerBtn.setAttribute('aria-label', 'Open Trope Statistics');
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
  { title: 'Trope Statistics', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    if (loadModuleSettings(MOD).enableStats === false) return () => {};
    console.log(LOG, 'init');

    // Record tropes on work pages
    if (isWorkPage()) {
      const stats = loadStats();
      recordTropes(stats);
    }

    injectTrigger();

    return function cleanup () {
      panelEl?.remove();
      triggerBtn?.remove();
      panelEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
