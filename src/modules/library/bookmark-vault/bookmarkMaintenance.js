import { register } from '../../../core/lifecycle.js';

const MOD = 'bookmarkMaintenance';
const NS  = 'ao3h';

// ── Feature list ────────────────────────────────────────────────────────
// 1. Auto-tick "Private" checkbox on the AO3 bookmark form (opt-in via
//    privateByDefault setting; watches for AJAX-opened forms too)
// 2. Export badge + button on the bookmarks page — shows last export date
//    (or warns if never exported); clicking exports ao3h:bookmarkVault:data
//    as a timestamped JSON and updates the badge immediately
// 3. Analytics dashboard (collapsible) — total count, top fandoms, WIP
//    vs complete ratio, public vs private ratio (opt-in)

const EXPORT_KEY   = 'ao3h:bookmarkVault:lastExport';
const BM_DATA_KEY  = 'ao3h:bookmarkVault:data';

const DEFAULTS = {
  privateByDefault:        false,
  showAnalyticsDashboard:  false,
};

function cfg (key) {
  try {
    const s = JSON.parse(localStorage.getItem('ao3h:mod:bookmarkVault:settings') || '{}');
    return (key in s) ? s[key] : DEFAULTS[key];
  } catch (_) { return DEFAULTS[key]; }
}

// ── Feature 1: Auto-tick "Private" on the bookmark form ─────────────────

function applyPrivateDefault () {
  if (!cfg('privateByDefault')) return;
  // AO3 bookmark form: #bookmark_private checkbox
  const checkbox = document.querySelector('#bookmark_private');
  if (!checkbox || checkbox.dataset.ao3hDefault) return;
  checkbox.dataset.ao3hDefault = '1';
  checkbox.checked = true;
}

// ── Feature 2: Export badge + button ────────────────────────────────────────

function doExport () {
  const data = (() => {
    try { return JSON.parse(localStorage.getItem(BM_DATA_KEY) || '{}'); }
    catch (_) { return {}; }
  })();
  const blob = new Blob(
    [JSON.stringify({ exported: new Date().toISOString(), bookmarks: data }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `ao3h-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  localStorage.setItem(EXPORT_KEY, String(Date.now()));
}

function refreshBadge (badge) {
  const lastExport = localStorage.getItem(EXPORT_KEY);
  if (!lastExport) {
    badge.textContent = '⚠️ No backup';
    badge.className   = `${NS}-export-badge ${NS}-export-badge--warn`;
    badge.title       = 'Bookmarks have never been exported';
  } else {
    const days = Math.floor((Date.now() - Number(lastExport)) / 86400000);
    badge.textContent = days < 30 ? `✅ Backed up ${days}d ago` : `⚠️ Backup ${days}d ago`;
    badge.className   = `${NS}-export-badge ${NS}-export-badge--${days < 30 ? 'ok' : 'warn'}`;
    badge.title       = `Last exported: ${new Date(Number(lastExport)).toLocaleDateString()}`;
  }
}

// ── Feature 3: Analytics dashboard ────────────────────────────────────

function injectAnalyticsDashboard () {
  if (!cfg('showAnalyticsDashboard')) return;
  if (!/\/users\/[^/]+\/bookmarks/.test(location.pathname)) return;
  if (document.getElementById(`${NS}-bm-analytics`)) return;

  const blurbs = Array.from(document.querySelectorAll('li.bookmark.blurb'));
  if (!blurbs.length) return;

  const fandomCounts = {};
  let wip = 0, complete = 0, pub = 0, priv = 0;

  blurbs.forEach(blurb => {
    blurb.querySelectorAll('h5.fandoms a.tag').forEach(a => {
      const f = a.textContent.trim();
      fandomCounts[f] = (fandomCounts[f] || 0) + 1;
    });
    const chaps = blurb.querySelector('dd.chapters')?.textContent || '';
    if (chaps.includes('?')) wip++; else complete++;
    if (blurb.querySelector('.status span.public')) pub++; else priv++;
  });

  const total      = blurbs.length;
  const topFandoms = Object.entries(fandomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const panel = document.createElement('details');
  panel.id = `${NS}-bm-analytics`;

  const sumEl = document.createElement('summary');
  sumEl.textContent   = `📊 Bookmark Stats (${total})`;
  panel.appendChild(sumEl);

  const inner = document.createElement('div');
  inner.className = `${NS}-bm-analytics-inner`;

  const counts = document.createElement('div');
  counts.innerHTML =
    `<strong>Total:</strong> ${total}<br>` +
    `<strong>WIP:</strong> ${wip} · <strong>Complete:</strong> ${complete}<br>` +
    `<strong>Public:</strong> ${pub} · <strong>Private:</strong> ${priv}`;
  inner.appendChild(counts);

  if (topFandoms.length) {
    const fDiv = document.createElement('div');
    fDiv.innerHTML = '<strong>Top fandoms:</strong><br>' +
      topFandoms.map(([f, n]) => {
        const safe = f.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `${safe} (${n})`;
      }).join('<br>');
    inner.appendChild(fDiv);
  }

  panel.appendChild(inner);

  const anchor = document.querySelector('#main h2.heading, #main h3.heading');
  if (anchor) anchor.insertAdjacentElement('afterend', panel);
}

function injectExportBadge () {
  if (!/\/users\/[^/]+\/bookmarks/.test(location.pathname)) return;
  const heading = document.querySelector('#main h2.heading, #main h3.heading');
  if (!heading || heading.querySelector(`.${NS}-export-badge`)) return;

  const badge = document.createElement('span');
  badge.className = `${NS}-export-badge`;
  refreshBadge(badge);
  heading.appendChild(badge);

  const exportBtn = document.createElement('button');
  exportBtn.className   = `${NS}-export-btn`;
  exportBtn.textContent = '↓ Export';
  exportBtn.addEventListener('click', () => {
    doExport();
    refreshBadge(badge);
  });
  heading.appendChild(exportBtn);
}

register(MOD, {
  title:            'Bookmark Maintenance',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  // Try immediately (bookmark page with inline form already in DOM)
  applyPrivateDefault();
  injectExportBadge();
  injectAnalyticsDashboard();

  // Only watch for the bookmark form opening dynamically if the feature is on
  let obs = null;
  if (cfg('privateByDefault')) {
    obs = new MutationObserver(applyPrivateDefault);
    obs.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    obs?.disconnect();
    document.getElementById(`${NS}-bm-analytics`)?.remove();
    document.querySelectorAll(`.${NS}-export-badge, .${NS}-export-btn`).forEach(el => el.remove());
  };
});
