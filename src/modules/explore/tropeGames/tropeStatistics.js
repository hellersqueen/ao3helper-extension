/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Trope Statistics

Records tracked tropes from visited work pages, calculates reading streaks and
top-trope rankings, and exports the accumulated statistics.

Notes

- Each work is counted once and the seen-work history is capped at 1,000.
- Daily visit dates provide the consecutive reading-streak calculation.
- Statistics can be exported as JSON or CSV.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON, downloadFile } from '../../../../lib/utils/json-file.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { extractWorkIdFromHref, isWorkPage } from '../../../../lib/ao3/parsers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeStatistics';
const LOG  = `[AO3H][${MOD}]`;
// Exported so sibling modules (tropeAchievements, tropeHoroscope) reference
// this module's key constants instead of duplicating the string literals.
export const STATS_KEY = `${NS}:tg:stats`;
const SK   = STATS_KEY;

function getShared () { return W.AO3H_TropeGames || null; }

export const STATS_SEEN_KEY = `${NS}:tg:stats:seen`;
const SK_SEEN = STATS_SEEN_KEY;


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — TROPE TRACKING AND READING STREAKS
═══════════════════════════════════════════════════════════════════════════ */

function loadStats () { return lsGet(SK) || {}; }
function saveStats (stats) { lsSet(SK, stats); }

function loadSeen () { return lsGet(SK_SEEN) || []; }
function saveSeen (seen) { lsSet(SK_SEEN, seen); }

function calcStreak (seen) {
  const dates = new Set(seen.map(e => (typeof e === 'object' ? e.date : null)).filter(Boolean));
  if (!dates.size) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    if (!dates.has(getShared().dateKey(d))) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function recordTropes (stats) {
  const workId = extractWorkIdFromHref(location.pathname);
  const TROPE_LIST = getShared()?.TROPE_LIST || [];
  const pageTags = getShared()?.getPageFreeformTagsLower() || [];
  const matched = TROPE_LIST.filter(trope =>
    pageTags.some(t => t.includes(trope.toLowerCase()) || trope.toLowerCase().includes(t))
  );

  if (workId) {
    const seen = loadSeen();
    if (seen.some(e => (typeof e === 'object' ? e.id : e) === workId)) {
      console.log(LOG, 'Work already recorded, skipping:', workId);
      return stats;
    }
    // `tropes` (chantier 4) backs the weekly challenge, monthly trend, and
    // horoscope retrospective — earlier entries predating this field simply
    // contribute nothing to those computations.
    seen.push({ id: workId, date: getShared().dateKey(), tropes: matched });
    if (seen.length > 1000) seen.splice(0, seen.length - 1000);
    saveSeen(seen);
  }

  let changed = false;
  matched.forEach(trope => {
    stats[trope] = (stats[trope] || 0) + 1;
    changed = true;
  });
  if (changed) saveStats(stats);
  return stats;
}

function getTopTen (stats) {
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — STATISTICS PANEL AND EXPORTS
═══════════════════════════════════════════════════════════════════════════ */

let panelEl = null;
let triggerBtn = null;

function renderBarRows (entries, max) {
  return entries.map(([trope, count]) => `
    <div class="${NS}-tg-stats-row">
      <div class="${NS}-tg-stats-row-label">${escapeHtml(trope)} <span class="${NS}-tg-stats-row-count">(${count})</span></div>
      <div class="${NS}-tg-stats-bar-bg">
        <div class="${NS}-tg-stats-bar-fill" style="width:${Math.round(count / max * 100)}%"></div>
      </div>
    </div>`).join('');
}

function renderChallengeSection (seen) {
  const { distinct, target, complete } = getShared().computeWeeklyChallenge(seen);
  return `
    <div class="${NS}-tg-stats-challenge${complete ? ' is-complete' : ''}">
      🗓️ Weekly Challenge: ${distinct}/${target} different tropes this week
      ${complete ? ' ✅' : ''}
    </div>
  `;
}

function renderRareSection (tropeList, stats) {
  const unseen = getShared().unexploredTropes(tropeList, stats);
  if (!unseen.length) return `<div class="${NS}-tg-stats-rare">🔍 You've read every tracked trope at least once!</div>`;
  const shown = unseen.slice(0, 5).map(escapeHtml).join(', ');
  const more = unseen.length > 5 ? ` (+${unseen.length - 5} more)` : '';
  return `<div class="${NS}-tg-stats-rare">🔍 ${unseen.length} tropes left to explore: ${shown}${more}</div>`;
}

function renderTrendSection (seen) {
  const { current, previous, rising } = getShared().monthlyTrend(seen);
  if (!current.length && !previous.length) return '';
  const currentHtml = current.length
    ? current.map(([t, c]) => `${escapeHtml(t)} (${c})${rising.includes(t) ? ' 📈' : ''}`).join(', ')
    : '—';
  const previousHtml = previous.length ? previous.map(([t, c]) => `${escapeHtml(t)} (${c})`).join(', ') : '—';
  return `
    <div class="${NS}-tg-stats-trend">
      <div><strong>This month:</strong> ${currentHtml}</div>
      <div><strong>Last month:</strong> ${previousHtml}</div>
    </div>
  `;
}

function renderCategorySection (stats) {
  const groups = getShared().groupStatsByCategory(stats);
  const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '';
  const max = entries[0][1] || 1;
  return `<div class="${NS}-tg-stats-categories">${renderBarRows(entries, max)}</div>`;
}

function renderPanel (stats) {
  const seen = loadSeen();
  const streak = calcStreak(seen);
  const streakHtml = streak > 0
    ? `<div class="${NS}-tg-stats-streak">🔥 ${streak}-day reading streak!</div>`
    : '';
  const top = getTopTen(stats);
  const max = top[0]?.[1] || 1;
  const rows = top.length
    ? renderBarRows(top, max)
    : `<p class="${NS}-tg-stats-empty">No tropes tracked yet. Read some works!</p>`;
  const TROPE_LIST = getShared()?.TROPE_LIST || [];

  return `
    <div class="${NS}-tg-stats-header">
      📊 Top Tropes
      <button class="${NS}-tg-stats-close" aria-label="Close statistics">✕</button>
    </div>
    ${streakHtml}
    ${renderChallengeSection(seen)}
    ${rows}
    <div class="${NS}-tg-stats-section-title">By category</div>
    ${renderCategorySection(stats)}
    <div class="${NS}-tg-stats-section-title">Trend</div>
    ${renderTrendSection(seen)}
    ${renderRareSection(TROPE_LIST, stats)}
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
  W.AO3H_TropeGames?.registerMenuItem(triggerBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Statistics', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    if (getShared()?.cfg('enableStats') === false) return () => {};
    console.log(LOG, 'init');

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild plantait (Cannot read properties of null),
    // constaté sur plusieurs modules similaires en test.
    let active = true;
    onReady(() => {
      if (!active) return;
      // Record tropes on work pages
      if (isWorkPage()) {
        const stats = loadStats();
        recordTropes(stats);
      }

      injectTrigger();
    });

    return function cleanup () {
      active = false;
      panelEl?.remove();
      triggerBtn?.remove();
      panelEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
