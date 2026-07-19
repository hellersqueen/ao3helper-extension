/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Pattern Analysis

Detects seasonal peaks, length preferences, fandom changes, and reading slumps
from session history and summarizes them in a dashboard widget.

Notes

- A slump requires prior activity and no sessions during the last fourteen days.
- Fandom shifts compare the last thirty days with the overall top fandom.
- Length preferences use average recorded work length.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import {
  detectTagTrend, quarterlyBreakdown, groupByField, compareByPeriod,
  detectRereads, detectIntensiveSessions, estimateAbandonPoint,
} from './activityPanelHelpers.js';

const W = getGlobalWindow();


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'patternAnalysis';
const NS  = 'ao3h';

const SESSIONS_KEY = 'ao3h:activityPanel:sessions';

function loadSessions () {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch (_) { return []; }
}

const SEASON_MONTHS = {
  winter: [11, 0, 1], spring: [2, 3, 4],
  summer: [5, 6, 7],  autumn: [8, 9, 10],
};


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READING PATTERN DETECTION
═══════════════════════════════════════════════════════════════════════════ */

function detectPatterns (sessions) {
  if (!sessions.length) return null;

  // Seasonal distribution
  const bySeason = { winter: 0, spring: 0, summer: 0, autumn: 0 };
  sessions.forEach(s => {
    if (!s.startedAt) return;
    const month = new Date(s.startedAt).getMonth();
    for (const [season, months] of Object.entries(SEASON_MONTHS)) {
      if (months.includes(month)) { bySeason[season]++; break; }
    }
  });
  const peakSeason = Object.entries(bySeason).sort((a, b) => b[1] - a[1])[0][0];

  // Length preference (words)
  const withWords = sessions.filter(s => s.words > 0);
  let lengthPreference = 'mixed';
  if (withWords.length) {
    const avg = withWords.reduce((a, s) => a + s.words, 0) / withWords.length;
    lengthPreference = avg < 5000 ? 'short fics (<5k)'
      : avg < 30000 ? 'medium fics (5k–30k)'
      : 'long fics (>30k)';
  }

  // Slump detection: no sessions in last 14 days
  const recent = sessions.filter(s => s.startedAt && Date.now() - s.startedAt < 14 * 86400000);
  const slump  = sessions.length > 5 && recent.length === 0;

  // Fandom shift: top fandom last 30d vs overall
  const countFandoms = (list) => {
    const m = {};
    list.forEach(s => (s.fandoms || []).forEach(f => { m[f] = (m[f] || 0) + 1; }));
    return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  };
  const recentSessions = sessions.filter(s => s.startedAt && Date.now() - s.startedAt < 30 * 86400000);
  const topOverall  = countFandoms(sessions);
  const topRecent   = countFandoms(recentSessions);
  const fandomShift = topOverall && topRecent && topOverall !== topRecent;

  // Rising tags (last 30 days vs the 30 days before that)
  const tagTrend = detectTagTrend(sessions);

  // Quarterly breakdown and top category (genre) per season
  const quarters = quarterlyBreakdown(sessions);
  const bySeasonCategory = {};
  for (const [season, months] of Object.entries(SEASON_MONTHS)) {
    const seasonSessions = sessions.filter(s => s.startedAt && months.includes(new Date(s.startedAt).getMonth()));
    const top = groupByField(seasonSessions, 'category')[0];
    if (top) bySeasonCategory[season] = top.name;
  }

  // This month/year vs the previous one
  const monthCompare = compareByPeriod(sessions, 'month');
  const yearCompare   = compareByPeriod(sessions, 'year');

  // Rereads and unusually long sessions
  const rereads    = detectRereads(sessions);
  const intensive  = detectIntensiveSessions(sessions);

  // Typical abandon point: average pages viewed on works never marked finished
  const isFinished = (workId) => !!W.AO3H?.ficAppreciation?.isFinished?.(workId);
  const abandonPoint = estimateAbandonPoint(sessions, isFinished);

  return {
    peakSeason, lengthPreference, slump, topOverall, topRecent, fandomShift,
    tagTrend, quarters, bySeasonCategory, monthCompare, yearCompare,
    rereads, intensive, abandonPoint,
  };
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PATTERN SUMMARY WIDGET
═══════════════════════════════════════════════════════════════════════════ */

function esc (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildWidget (p) {
  const wrap = document.createElement('div');
  wrap.id = `${NS}-pattern-widget`;

  if (!p) {
    wrap.innerHTML = '<p>Not enough data yet.</p>';
    return wrap;
  }

  const items = [
    `🍂 Peak reading season: <strong>${p.peakSeason}</strong>`,
    `📏 Length preference: <strong>${p.lengthPreference}</strong>`,
    p.fandomShift
      ? `🔀 Fandom shift detected — you've moved from <strong>${esc(p.topOverall)}</strong> to <strong>${esc(p.topRecent)}</strong>`
      : `🎯 Consistent fandom: <strong>${esc(p.topOverall || '—')}</strong>`,
    p.slump
      ? `⚠️ <strong>Reading slump detected</strong> — no sessions in the last 14 days. Whenever you're ready, there's always something good waiting for you 💛`
      : `✅ Active reader`,
  ];

  if (p.tagTrend.length) {
    items.push(`📈 Reading more <strong>${esc(p.tagTrend[0].tag)}</strong> lately (${p.tagTrend[0].count} recently vs ${p.tagTrend[0].priorCount} before)`);
  }
  if (p.monthCompare.previous.works > 0 || p.monthCompare.current.works > 0) {
    const d = p.monthCompare.deltaPct;
    items.push(`📅 This month: <strong>${p.monthCompare.current.works}</strong> work${p.monthCompare.current.works !== 1 ? 's' : ''} vs <strong>${p.monthCompare.previous.works}</strong> last month${d !== null ? ` (${d >= 0 ? '+' : ''}${d}%)` : ''}`);
  }
  if (p.rereads.length) {
    items.push(`🔁 You've reread <strong>${esc(p.rereads[0].title)}</strong>${p.rereads.length > 1 ? ` and ${p.rereads.length - 1} other work${p.rereads.length > 2 ? 's' : ''}` : ''}`);
  }
  if (p.intensive.length) {
    items.push(`🚀 ${p.intensive.length} intensive reading session${p.intensive.length !== 1 ? 's' : ''} detected (well above your usual pace)`);
  }
  if (p.abandonPoint !== null) {
    items.push(`📉 On works you haven't finished, you typically stop after about <strong>${p.abandonPoint}</strong> page view${p.abandonPoint !== 1 ? 's' : ''}`);
  }
  if (p.quarters.length) {
    const lastQ = p.quarters[p.quarters.length - 1];
    items.push(`📊 ${p.quarters.length} quarter${p.quarters.length !== 1 ? 's' : ''} tracked — most recent (${esc(lastQ.label)}): ${lastQ.count} session${lastQ.count !== 1 ? 's' : ''}`);
  }
  const seasonCategoryEntries = Object.entries(p.bySeasonCategory);
  if (seasonCategoryEntries.length) {
    items.push(`🎭 Category by season: ${seasonCategoryEntries.map(([s, c]) => `${s} → ${esc(c)}`).join(', ')}`);
  }

  wrap.innerHTML = `
    <h4>🔍 Reading Patterns</h4>
    <ul>
      ${items.map(i => `<li>${i}</li>`).join('')}
    </ul>`;

  return wrap;
}

function isDashboardPage () {
  return /\/users\/[^/]+\/dashboard/.test(location.pathname) ||
         /\/users\/[^/]+\/?$/.test(location.pathname);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Pattern Analysis',
  parent:           'activityPanel',
  enabledByDefault: false,
}, async function init () {
  if (!isDashboardPage()) return () => {};

  const widget = buildWidget(detectPatterns(loadSessions()));
  const anchor = document.querySelector('#dashboard-modules, #main');
  if (anchor) anchor.prepend(widget);

  return () => widget.remove();
});
