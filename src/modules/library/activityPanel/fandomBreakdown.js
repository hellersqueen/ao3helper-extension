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
  const map = {};
  unique.forEach(s => {
    (s.fandoms || []).forEach(fandom => {
      if (!map[fandom]) map[fandom] = { works: 0, words: 0 };
      map[fandom].works++;
      map[fandom].words += (s.words || 0);
    });
  });
  return Object.entries(map)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.works - a.works);
}

function esc (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  function renderTable () {
    const sorted = [...stats].sort((a, b) => b[sortKey] - a[sortKey]);
    wrap.innerHTML = `
      <h4>📚 Fandom Breakdown</h4>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Fandom</th>
            <th data-sort="works">
              Works ${sortKey === 'works' ? '▼' : ''}
            </th>
            <th data-sort="words">
              Words ${sortKey === 'words' ? '▼' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          ${sorted.slice(0, 20).map((f, i) => `
            <tr class="${NS}-fb-row">
              <td>${i + 1}</td>
              <td>${esc(f.name)}</td>
              <td>${f.works}</td>
              <td>${f.words.toLocaleString()}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    wrap.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        sortKey = th.dataset.sort;
        renderTable();
      });
    });
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
