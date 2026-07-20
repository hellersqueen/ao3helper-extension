/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Reading Insights

Builds the overview widget containing reading totals, the current streak,
earned achievements, a period selector, a clickable tag cloud, export/refresh
controls, and quick links, on supported profile, statistics, and dashboard
pages.

Notes

- Data Collection owns all-time aggregation; Reading Stats owns milestones.
- Stat cards respect the period selector (Today/7d/30d/Year/All); streak and
  achievements are inherently all-time concepts and are not period-filtered.
- The widget is omitted until at least one work has been recorded.
- Injection anchors adapt to the current AO3 account page.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { detectUser } from '../../../../lib/utils/user-detector.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'readingInsights';
const NS  = 'ao3h';
const W   = getGlobalWindow();

const WIDGET_ID  = `${NS}-reading-insights`;
const PREFS_KEY  = 'activityPanel:preferences';

const PERIOD_LABELS = { today: 'Today', week: 'Last 7 days', month: 'Last 30 days', year: 'This year', all: 'All time' };

function getStore () { return W.AO3H_ActivityPanel.store; }


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PREFERENCES
═══════════════════════════════════════════════════════════════════════════ */

function loadPrefs () { return getStore().get(PREFS_KEY) || {}; }
function savePrefs (patch) { getStore().set(PREFS_KEY, { ...loadPrefs(), ...patch }); }


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PERIOD-FILTERED STAT CARDS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {'today'|'week'|'month'|'year'|'all'} period
 * @param {{workId?: string, words?: number, startedAt?: number}[]} allSessions
 * @param {Record<string, {date?: string}>} kudosHistory
 */
function computePeriodStats (period, allSessions, kudosHistory) {
  const { filterSessionsByPeriod } = W.AO3H_ActivityPanel;
  const sessions = filterSessionsByPeriod(allSessions, period);
  const totalWorks = new Set(sessions.map(s => s.workId).filter(Boolean)).size;
  const totalWords = sessions.reduce((a, s) => a + (s.words || 0), 0);
  const kudosEntries = Object.values(kudosHistory).map(v => ({ startedAt: v.date ? new Date(v.date).getTime() : 0 }));
  const totalKudos = filterSessionsByPeriod(kudosEntries, period).length;
  return { totalWorks, totalWords, totalKudos };
}

function recapLabel (period, now = new Date()) {
  if (period === 'month') {
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (period === 'year') return String(now.getFullYear());
  return null;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — WIDGET
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

function render (container, data, cfg) {
  const { buildTagCloud, buildRecapText } = W.AO3H_ActivityPanel;
  const { totalWorks, totalWords, totalKudos, streak, achievements, topTags } = data;
  const period = loadPrefs().timePeriod || 'all';

  container.innerHTML = '';

  const heading = document.createElement('div');
  heading.className = `${NS}-insights-heading-row`;
  heading.innerHTML = `
    <h3>Your Reading Insights</h3>
    <div class="${NS}-insights-controls">
      <select class="${NS}-insights-period" aria-label="Time period">
        ${Object.entries(PERIOD_LABELS).map(([v, label]) =>
          `<option value="${v}"${v === period ? ' selected' : ''}>${label}</option>`).join('')}
      </select>
      <button type="button" class="${NS}-insights-refresh" title="Recalculate now">🔄</button>
      <button type="button" class="${NS}-insights-export" title="Export all stats as JSON">⬇</button>
    </div>
  `;
  container.appendChild(heading);

  const label = recapLabel(period);
  if (label) {
    const recap = document.createElement('p');
    recap.className = `${NS}-insights-recap`;
    recap.textContent = buildRecapText(label, { works: totalWorks, words: totalWords });
    container.appendChild(recap);
  }

  const row = document.createElement('div');
  row.className = `${NS}-insights-row`;
  [
    { label: 'Works read',  value: totalWorks.toLocaleString('en-US') },
    { label: 'Words read',  value: totalWords.toLocaleString('en-US') },
    { label: 'Kudos given', value: totalKudos.toLocaleString('en-US') },
  ].forEach(({ label: l, value }) => {
    const card = document.createElement('div');
    card.className = `${NS}-insights-card`;
    card.innerHTML = `<strong>${value}</strong><span>${l}</span>`;
    row.appendChild(card);
  });
  container.appendChild(row);

  if (streak > 0) {
    const banner = document.createElement('p');
    banner.className = `${NS}-streak-banner`;
    banner.textContent = `🔥 ${streak}-day reading streak`;
    container.appendChild(banner);
  }

  if (achievements.length > 0) {
    const grid = document.createElement('div');
    grid.className = `${NS}-insights-achievements`;
    achievements.forEach(({ name, icon, desc }) => {
      const badge = document.createElement('span');
      badge.className = `${NS}-achievement-badge`;
      badge.title = desc;
      badge.textContent = `${icon} ${name}`;
      grid.appendChild(badge);
    });
    container.appendChild(grid);
  } else {
    const empty = document.createElement('p');
    empty.className = `${NS}-insights-empty`;
    empty.textContent = 'No achievements yet — keep reading!';
    container.appendChild(empty);
  }

  if (cfg('showTagCloud') && topTags.length) {
    const cloudWrap = document.createElement('div');
    cloudWrap.className = `${NS}-tag-cloud`;
    buildTagCloud(topTags, { minSize: 11, maxSize: 26 }).forEach(({ name, size }) => {
      const a = document.createElement('a');
      a.className   = `${NS}-tag-cloud-item`;
      a.style.fontSize = `${size}px`;
      a.textContent = name;
      a.href = `/tags/${encodeURIComponent(name)}/works`;
      cloudWrap.appendChild(a);
    });
    container.appendChild(cloudWrap);
  }

  const username = detectUser();
  if (username) {
    const links = document.createElement('div');
    links.className = `${NS}-insights-quicklinks`;
    links.innerHTML = [
      ['Bookmarks', `/users/${username}/bookmarks`],
      ['History', `/users/${username}/readings`],
      ['Subscriptions', `/users/${username}/subscriptions`],
    ].map(([l, href]) => `<a href="${href}">${l}</a>`).join(' · ');
    container.appendChild(links);
  }
}

function collectAndRender (container, cfg) {
  const store = getStore();
  const { DataCollection, ReadingStats } = W.AO3H_ActivityPanel;
  const dc   = new DataCollection({ storage: store });
  const data = dc.aggregate();
  if (!data.totalWorks) { container.hidden = true; return false; }
  container.hidden = false;

  const rs           = new ReadingStats();
  const streak        = rs.calculateStreak(data._readingHistory);
  const achievements  = cfg('readingAchievements') !== false
    ? rs.calculateAchievements({ ...data, readingStreak: streak })
    : [];

  const allSessions  = store.get('activityPanel:sessions') || [];
  const kudosHistory = store.get('ficAppreciation:kudosed') || {};
  const period        = loadPrefs().timePeriod || 'all';
  const periodStats    = period === 'all'
    ? { totalWorks: data.totalWorks, totalWords: data.totalWords, totalKudos: data.totalKudos }
    : computePeriodStats(period, allSessions, kudosHistory);

  render(container, { ...periodStats, streak, achievements, topTags: data.topTags }, cfg);
  return true;
}

function buildWidget (cfg) {
  const store = getStore();
  const { DataCollection } = W.AO3H_ActivityPanel;
  const container = document.createElement('div');
  container.id = WIDGET_ID;
  container.className = `${NS}-reading-insights`;

  const hasData = collectAndRender(container, cfg);
  if (!hasData) return null;

  container.addEventListener('change', (e) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains(`${NS}-insights-period`)) {
      savePrefs({ timePeriod: /** @type {HTMLSelectElement} */ (e.target).value });
      collectAndRender(container, cfg);
    }
  });

  container.addEventListener('click', (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    if (target.closest(`.${NS}-insights-refresh`)) {
      collectAndRender(container, cfg);
    }
    if (target.closest(`.${NS}-insights-export`)) {
      const dc = new DataCollection({ storage: store });
      const data = dc.aggregate();
      const { _readingHistory, ...stats } = data;
      downloadJSON(
        { exportedAt: new Date().toISOString(), stats, sessions: store.get('activityPanel:sessions') || [] },
        `ao3h-activity-stats-${new Date().toISOString().slice(0, 10)}.json`
      );
    }
  });

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
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Reading Insights',
  parent:           'activityPanel',
  enabledByDefault: false,
}, async function init () {
  if (!isTargetPage()) return () => {};
  if (document.getElementById(WIDGET_ID)) return () => {};

  const widget = buildWidget(W.AO3H_ActivityPanel.cfg);
  if (!widget) return () => {};

  injectWidget(widget);

  return () => {
    document.getElementById(WIDGET_ID)?.remove();
  };
});
