/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Fandom Breakdown

Builds a sortable dashboard table of unique works and word totals grouped by
fandom from recorded Activity Panel sessions.

Notes

- Each work ID contributes at most once to the aggregation.
- The table may be reordered by work or word count.
- Only the highest-ranked twenty fandoms are displayed.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'fandomBreakdown';
const NS  = 'ao3h';

const SESSIONS_KEY = 'ao3h:activityPanel:sessions';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — FANDOM STATISTICS AND TABLE
═══════════════════════════════════════════════════════════════════════════ */

function loadSessions () {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch (_) { return []; }
}

function computeFandomStats (sessions) {
  // Deduplicate: count each work only once per workId
  const seen   = new Set();
  const unique = sessions.filter(s => {
    if (!s.workId || seen.has(s.workId)) return false;
    seen.add(s.workId);
    return true;
  });

  const kudosByFandom = new Map(
    (W.AO3H?.ficAppreciation?.getKudosStats?.()?.byFandom || []).map(f => [f.key, f.count])
  );

  const map = {};
  unique.forEach(s => {
    (s.fandoms || []).forEach(fandom => {
      if (!map[fandom]) map[fandom] = { works: 0, words: 0, kudos: kudosByFandom.get(fandom) || 0 };
      map[fandom].works++;
      map[fandom].words += (s.words || 0);
    });
  });
  return Object.entries(map)
    .map(([name, d]) => ({ name, ...d, hours: Math.round((d.words / 250 / 60) * 10) / 10 }))
    .sort((a, b) => b.works - a.works);
}

function esc (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const PIE_COLORS = ['#2c5f8a', '#5b8fb9', '#8ab4d6', '#b0c4de', '#d0722a', '#e8a05c', '#7a9e7e', '#a8c9ab'];

function buildPieChart (stats, totalWorks) {
  const top = W.AO3H_ActivityPanel.fandomPercentages(stats.slice(0, 8), totalWorks);
  if (!top.length) return '';
  let acc = 0;
  const stops = top.map((f, i) => {
    const start = acc;
    acc += f.pct;
    return `${PIE_COLORS[i % PIE_COLORS.length]} ${start}% ${acc}%`;
  }).join(', ');
  const legend = top.map((f, i) =>
    `<li><span class="${NS}-fb-swatch" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></span>${esc(f.name)} — ${f.pct}%</li>`
  ).join('');
  return `
    <div class="${NS}-fb-pie-wrap">
      <div class="${NS}-fb-pie" style="background: conic-gradient(${stops});"></div>
      <ul class="${NS}-fb-legend">${legend}</ul>
    </div>`;
}

function buildTable (stats) {
  const wrap = document.createElement('div');
  wrap.id = `${NS}-fandom-breakdown`;

  if (!stats.length) {
    wrap.innerHTML =
      '<p>' +
      'No fandom data yet — enable Session History to start tracking.</p>';
    return wrap;
  }

  let sortKey = 'works';
  const totalWorks = stats.reduce((a, f) => a + f.works, 0);
  const compared = new Set();

  function renderTable () {
    const sorted = [...stats].sort((a, b) => b[sortKey] - a[sortKey]);
    wrap.innerHTML = `
      <h4>📚 Fandom Breakdown</h4>
      ${buildPieChart(sorted, totalWorks)}
      <p class="${NS}-fb-compare-hint">Check up to 3 fandoms to compare them directly.</p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>Fandom</th>
            <th data-sort="works">Works ${sortKey === 'works' ? '▼' : ''}</th>
            <th data-sort="words">Words ${sortKey === 'words' ? '▼' : ''}</th>
            <th data-sort="hours">Hours ${sortKey === 'hours' ? '▼' : ''}</th>
            <th data-sort="kudos">Kudos ${sortKey === 'kudos' ? '▼' : ''}</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.slice(0, 20).map((f, i) => `
            <tr class="${NS}-fb-row">
              <td><input type="checkbox" class="${NS}-fb-compare-cb" data-name="${esc(f.name)}" ${compared.has(f.name) ? 'checked' : ''}></td>
              <td>${i + 1}</td>
              <td>${esc(f.name)}</td>
              <td>${f.works}</td>
              <td>${f.words.toLocaleString('en-US')}</td>
              <td>${f.hours}</td>
              <td>${f.kudos || 0}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="${NS}-fb-compare-result" hidden></div>`;

    wrap.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        sortKey = th.dataset.sort;
        renderTable();
      });
    });

    wrap.querySelectorAll(`.${NS}-fb-compare-cb`).forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          if (compared.size >= 3) { cb.checked = false; return; }
          compared.add(cb.dataset.name);
        } else {
          compared.delete(cb.dataset.name);
        }
        renderCompare();
      });
    });
    renderCompare();
  }

  function renderCompare () {
    const resultEl = wrap.querySelector(`.${NS}-fb-compare-result`);
    if (!resultEl) return;
    if (compared.size < 2) { resultEl.hidden = true; return; }
    const rows = [...compared].map(name => stats.find(f => f.name === name)).filter(Boolean);
    resultEl.hidden = false;
    resultEl.innerHTML = `
      <h5>Comparing ${rows.map(f => esc(f.name)).join(' vs ')}</h5>
      <table>
        <tbody>
          <tr><td></td>${rows.map(f => `<th>${esc(f.name)}</th>`).join('')}</tr>
          <tr><td>Works</td>${rows.map(f => `<td>${f.works}</td>`).join('')}</tr>
          <tr><td>Words</td>${rows.map(f => `<td>${f.words.toLocaleString('en-US')}</td>`).join('')}</tr>
          <tr><td>Hours</td>${rows.map(f => `<td>${f.hours}</td>`).join('')}</tr>
          <tr><td>Kudos</td>${rows.map(f => `<td>${f.kudos || 0}</td>`).join('')}</tr>
        </tbody>
      </table>`;
  }

  renderTable();
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
  title:            'Fandom Breakdown',
  parent:           'activityPanel',
  enabledByDefault: false,
}, async function init () {
  if (!isDashboardPage()) return () => {};

  const stats = computeFandomStats(loadSessions());
  const table = buildTable(stats);
  const anchor = document.querySelector('#dashboard-modules, #main');
  if (anchor) anchor.prepend(table);

  return () => table.remove();
});
