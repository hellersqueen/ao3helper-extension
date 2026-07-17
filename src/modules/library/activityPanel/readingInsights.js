/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Reading Insights

Builds the overview widget containing reading totals, the current streak, and
earned achievements on supported profile, statistics, and dashboard pages.

Notes

- Data Collection owns aggregation and Reading Stats owns derived milestones.
- The widget is omitted until at least one work has been recorded.
- Injection anchors adapt to the current AO3 account page.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { store } from './activityPanelShared.js';
import { DataCollection } from './dataCollection.js';
import { ReadingStats } from './readingStats.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'readingInsights';
const NS  = 'ao3h';

const WIDGET_ID = `${NS}-reading-insights`;


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — INSIGHTS WIDGET
═══════════════════════════════════════════════════════════════════════════ */

function isTargetPage () {
  const p = location.pathname;
  return (
    /^\/users\/[^/]+\/profile/.test(p) ||
    /^\/users\/[^/]+\/stats/.test(p) ||
    /^\/users\/[^/]+\/?$/.test(p) ||
    p === '/' || p === '/welcome'
  );
}

function buildWidget (totalWorks, totalWords, totalKudos, streak, achievements) {
  const container = document.createElement('div');
  container.id = WIDGET_ID;
  container.className = `${NS}-reading-insights`;

  const heading = document.createElement('h3');
  heading.textContent = 'Your Reading Insights';
  container.appendChild(heading);

  // ── Stat cards ─────────────────────────────────────────────
  const row = document.createElement('div');
  row.className = `${NS}-insights-row`;

  [
    { label: 'Works read',  value: totalWorks.toLocaleString() },
    { label: 'Words read',  value: totalWords.toLocaleString() },
    { label: 'Kudos given', value: totalKudos.toLocaleString() },
  ].forEach(({ label, value }) => {
    const card = document.createElement('div');
    card.className = `${NS}-insights-card`;
    card.innerHTML =
      `<strong>${value}</strong>` +
      `<span>${label}</span>`;
    row.appendChild(card);
  });
  container.appendChild(row);

  // ── Streak banner ───────────────────────────────────────────
  if (streak > 0) {
    const banner = document.createElement('p');
    banner.className = `${NS}-streak-banner`;
    banner.textContent = `🔥 ${streak}-day reading streak`;
    container.appendChild(banner);
  }

  // ── Achievements ────────────────────────────────────────────
  if (achievements.length > 0) {
    const grid = document.createElement('div');
    grid.className = `${NS}-insights-achievements`;
    achievements.forEach(({ name, icon, desc }) => {
      const badge = document.createElement('span');
      badge.className = `${NS}-achievement-badge`;
      badge.title = desc;
      badge.textContent = `${icon} ${name}`;
      grid.appendChild(badge);
    });
    container.appendChild(grid);
  } else {
    const empty = document.createElement('p');
    empty.className = `${NS}-insights-empty`;
    empty.textContent = 'No achievements yet — keep reading!';
    container.appendChild(empty);
  }

  return container;
}

function injectWidget (widget) {
  const p = location.pathname;

  if (/\/users\/[^/]+\/profile/.test(p)) {
    const anchor = document.querySelector('#main dl.meta') ||
                   document.querySelector('#main .module');
    if (anchor) { anchor.insertAdjacentElement('afterend', widget); return; }
  }

  if (/\/users\/[^/]+\/stats/.test(p)) {
    const anchor = document.querySelector('.stats-page aside') ||
                   document.querySelector('#main h2');
    if (anchor) { anchor.insertAdjacentElement('afterend', widget); return; }
  }

  // Dashboard / user home
  const main   = document.querySelector('#main');
  const anchor = document.querySelector('#main .module') ||
                 document.querySelector('#main ul') ||
                 main;
  if (anchor && anchor !== main) {
    anchor.insertAdjacentElement('beforebegin', widget);
  } else if (main) {
    main.prepend(widget);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Reading Insights',
  parent:           'activityPanel',
  enabledByDefault: false,
}, async function init () {
  if (!isTargetPage()) return () => {};
  if (document.getElementById(WIDGET_ID)) return () => {};

  const dc   = new DataCollection({ storage: store });
  const data = dc.aggregate();

  if (!data.totalWorks) return () => {};

  const rs           = new ReadingStats();
  const streak       = rs.calculateStreak(data._readingHistory);
  const achievements = rs.calculateAchievements({ ...data, readingStreak: streak });

  const widget = buildWidget(
    data.totalWorks, data.totalWords, data.totalKudos, streak, achievements
  );

  injectWidget(widget);

  return () => {
    document.getElementById(WIDGET_ID)?.remove();
  };
});
