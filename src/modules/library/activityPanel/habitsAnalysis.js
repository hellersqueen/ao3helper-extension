/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Habits Analysis

Analyzes session times into hourly and day-period distributions and presents a
dashboard histogram with the user’s peak hour and preferred reading period.

Notes

- Sessions are grouped into morning, afternoon, evening, and night.
- The hourly maximum determines the highlighted chart bar.
- Empty session histories receive an instructional placeholder.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import {
  dayHourHeatmap, bestReadingSlot, formatSlotLabel, isNightOwl, regularityScore,
} from './activityPanelHelpers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'habitsAnalysis';
const NS  = 'ao3h';

const SESSIONS_KEY = 'ao3h:activityPanel:sessions';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READING-TIME ANALYSIS AND HISTOGRAM
═══════════════════════════════════════════════════════════════════════════ */

function loadSessions () {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch (_) { return []; }
}

function analyzeHabits (sessions) {
  const byHour = new Array(24).fill(0);
  sessions.forEach(s => { if (s.hourOfDay >= 0 && s.hourOfDay < 24) byHour[s.hourOfDay]++; });

  const maxVal  = Math.max(...byHour, 1);
  const peakHour = byHour.indexOf(maxVal);

  const periods = {
    morning:   byHour.slice(6,  12).reduce((a, b) => a + b, 0),
    afternoon: byHour.slice(12, 18).reduce((a, b) => a + b, 0),
    evening:   byHour.slice(18, 24).reduce((a, b) => a + b, 0),
    night:     [...byHour.slice(0, 6)].reduce((a, b) => a + b, 0),
  };
  const preferred = Object.entries(periods).sort((a, b) => b[1] - a[1])[0][0];

  return { byHour, maxVal, peakHour, periods, preferred };
}

function buildWidget (habits, total, sessions) {
  const wrap = document.createElement('div');
  wrap.id = `${NS}-habits-widget`;

  if (total === 0) {
    wrap.innerHTML =
      '<p class="ao3h-habits-empty">' +
      'No session data yet — enable Session History to start tracking.</p>';
    return wrap;
  }

  const { byHour, maxVal, peakHour, preferred } = habits;
  const peakLabel = `${String(peakHour).padStart(2, '0')}:00`;

  const bars = byHour.map((count, h) => {
    const pct   = maxVal ? Math.round((count / maxVal) * 100) : 0;
    const label = `${String(h).padStart(2, '0')}h`;
    const isPeak = h === peakHour;
    return `<div title="${label}: ${count} session${count !== 1 ? 's' : ''}" class="ao3h-habits-bar">
      <div class="ao3h-habits-bar-fill${isPeak ? ' ao3h-habits-bar-peak' : ''}" style="height:${pct}%;"></div>
      ${h % 6 === 0 ? `<span class="ao3h-habits-bar-label">${label}</span>` : ''}
    </div>`;
  }).join('');

  const slot = bestReadingSlot(dayHourHeatmap(sessions));
  const slotLabel = formatSlotLabel(slot);
  const nightOwl = isNightOwl(byHour);
  const regularity = regularityScore(sessions);
  const profileLine = `${nightOwl ? '🌙 You mostly read at night' : '☀️ You mostly read during the day'} &nbsp;·&nbsp; ${
    regularity >= 60 ? '📅 Very regular reader' : regularity >= 25 ? '📆 Fairly regular reader' : '🎲 Reads in bursts'
  } (${regularity}% of days active)`;

  wrap.innerHTML = `
    <h4>🕐 Reading Habits</h4>
    <p class="ao3h-habits-meta">
      ${total} session${total !== 1 ? 's' : ''} tracked &nbsp;·&nbsp;
      Peak: <strong>${peakLabel}</strong> &nbsp;·&nbsp;
      Preferred period: <strong>${preferred}</strong>
    </p>
    <div class="ao3h-habits-bars">
      ${bars}
    </div>
    ${slotLabel ? `<p class="ao3h-habits-prediction">🔮 You're most likely to read on <strong>${slotLabel}</strong></p>` : ''}
    <p class="ao3h-habits-profile">${profileLine}</p>
    ${buildHeatmap(sessions)}`;

  return wrap;
}

function buildHeatmap (sessions) {
  const grid = dayHourHeatmap(sessions);
  const max  = Math.max(1, ...grid.flat());
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rows = grid.map((row, day) => `
    <div class="ao3h-heatmap-row">
      <span class="ao3h-heatmap-daylabel">${dayLabels[day]}</span>
      ${row.map(count => {
        const alpha = count ? 0.15 + 0.85 * (count / max) : 0;
        return `<span class="ao3h-heatmap-cell" style="background: rgba(44,95,138,${alpha.toFixed(2)});" title="${count} session${count !== 1 ? 's' : ''}"></span>`;
      }).join('')}
    </div>`).join('');
  return `<div class="ao3h-heatmap-wrap"><h5>Weekly heatmap</h5>${rows}</div>`;
}

function isDashboardPage () {
  return /\/users\/[^/]+\/dashboard/.test(location.pathname) ||
         /\/users\/[^/]+\/?$/.test(location.pathname);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Habits Analysis',
  parent:           'activityPanel',
  enabledByDefault: false,
}, async function init () {
  if (!isDashboardPage()) return () => {};

  const sessions = loadSessions();
  const widget   = buildWidget(analyzeHabits(sessions), sessions.length, sessions);
  const anchor   = document.querySelector('#dashboard-modules, #main');
  if (anchor) anchor.prepend(widget);

  return () => widget.remove();
});
