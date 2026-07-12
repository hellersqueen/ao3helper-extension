/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Activity Panel › PatternAnalysis sub-module
    Detects reading patterns (seasonal peaks, length preference, fandom shifts,
    reading slumps) from session history and injects a summary widget into
    the user's dashboard page. Reads: ao3h:activityPanel:sessions
    Registered as: patternAnalysis (parent: activityPanel)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';

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

  return { peakSeason, lengthPreference, slump, topOverall, topRecent, fandomShift };
}

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
      ? `⚠️ <strong>Reading slump detected</strong> — no sessions in the last 14 days`
      : `✅ Active reader`,
  ];

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
