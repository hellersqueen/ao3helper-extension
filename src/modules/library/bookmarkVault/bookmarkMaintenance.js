/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Bookmark Maintenance

Applies bookmark-form defaults, provides export recency controls, and presents
an optional summary dashboard on AO3 bookmark listings.

Notes

- Private-by-default also applies to dynamically opened bookmark forms.
- Export status becomes a warning when the latest backup is at least 30 days old.
- Analytics summarize only the bookmarks visible on the current page.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { downloadJSON, downloadFile } from '../../../../lib/utils/json-file.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { observe, onReady } from '../../../../lib/utils/index.js';
import { relativeDate } from '../../../../lib/utils/format-date.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'bookmarkMaintenance';
const NS  = 'ao3h';
const W   = getGlobalWindow();
const vaultToCSV = (...args) => W.AO3H_BookmarkVault.vaultToCSV(...args);
const vaultToHTML = (...args) => W.AO3H_BookmarkVault.vaultToHTML(...args);
const findStaleBookmarks = (...args) => W.AO3H_BookmarkVault.findStaleBookmarks(...args);

const EXPORT_KEY   = 'ao3h:bookmarkVault:lastExport';
const BM_DATA_KEY  = 'ao3h:bookmarkVault:data';

const DEFAULTS = {
  privateByDefault:        false,
  showAnalyticsDashboard:  false,
  staleReminderMonths:     0, // 0 = off; 3/6/12 = remind about unopened bookmarks
};

const cfg = makeCfg('bookmarkVault', DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BOOKMARK FORM DEFAULTS
═══════════════════════════════════════════════════════════════════════════ */

function applyPrivateDefault () {
  if (!cfg('privateByDefault')) return;
  // AO3 bookmark form: #bookmark_private checkbox
  const checkbox = document.querySelector('#bookmark_private');
  if (!checkbox || checkbox.dataset.ao3hDefault) return;
  checkbox.dataset.ao3hDefault = '1';
  checkbox.checked = true;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — EXPORT AND BACKUP RECENCY
═══════════════════════════════════════════════════════════════════════════ */

function _loadVault () {
  try { return JSON.parse(localStorage.getItem(BM_DATA_KEY) || '{}'); }
  catch (_) { return {}; }
}

function _loadInlineNotes () {
  try { return JSON.parse(localStorage.getItem('ao3h:bookmarkVault:inlineNotes') || '{}'); }
  catch (_) { return {}; }
}

function doExport (format = 'json') {
  const data  = _loadVault();
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    downloadFile(vaultToCSV(data, _loadInlineNotes()), `ao3h-bookmarks-${stamp}.csv`, 'text/csv;charset=utf-8');
  } else if (format === 'html') {
    downloadFile(vaultToHTML(data, _loadInlineNotes()), `ao3h-bookmarks-${stamp}.html`, 'text/html;charset=utf-8');
  } else {
    downloadJSON({ exported: new Date().toISOString(), bookmarks: data }, `ao3h-bookmarks-${stamp}.json`);
  }
  localStorage.setItem(EXPORT_KEY, String(Date.now()));
}

function refreshBadge (badge) {
  const lastExport = localStorage.getItem(EXPORT_KEY);
  if (!lastExport) {
    badge.textContent = '⚠️ No backup';
    badge.className   = `${NS}-export-badge ${NS}-export-badge--warn`;
    badge.title       = 'Bookmarks have never been exported';
  } else {
    const days  = Math.floor((Date.now() - Number(lastExport)) / 86400000);
    const label = relativeDate(Number(lastExport), { short: true });
    badge.textContent = days < 30 ? `✅ Backed up ${label}` : `⚠️ Backup ${label}`;
    badge.className   = `${NS}-export-badge ${NS}-export-badge--${days < 30 ? 'ok' : 'warn'}`;
    badge.title       = `Last exported: ${new Date(Number(lastExport)).toLocaleDateString()}`;
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BOOKMARK ANALYTICS DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — STALE-BOOKMARK REMINDER
═══════════════════════════════════════════════════════════════════════════ */

function injectStaleReminder () {
  const months = parseInt(String(cfg('staleReminderMonths') ?? 0), 10) || 0;
  if (months <= 0) return;
  if (!/\/users\/[^/]+\/bookmarks/.test(location.pathname)) return;
  if (document.getElementById(`${NS}-bm-stale`)) return;

  const lastRead = (() => {
    try { return JSON.parse(localStorage.getItem('ao3h:bookmarkVault:lastRead') || '{}'); }
    catch (_) { return {}; }
  })();
  const stale = new Set(findStaleBookmarks(_loadVault(), lastRead, months));
  if (!stale.size) return;

  const banner = document.createElement('div');
  banner.id = `${NS}-bm-stale`;
  const text = document.createElement('span');
  text.textContent = `🔔 ${stale.size} bookmark${stale.size !== 1 ? 's' : ''} not opened for ${months}+ months — worth a revisit?`;
  banner.appendChild(text);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${NS}-bm-stale-btn`;
  btn.textContent = 'Highlight on this page';
  btn.addEventListener('click', () => {
    let found = 0;
    document.querySelectorAll('li.bookmark.blurb, li.work.blurb').forEach(blurb => {
      const wid = extractWorkIdFromBlurb(blurb);
      if (wid && stale.has(String(wid))) { blurb.classList.add(`${NS}-bm-stale-hl`); found++; }
    });
    btn.textContent = found ? `${found} highlighted here` : 'None on this page';
    btn.disabled = true;
  });
  banner.appendChild(btn);

  const anchor = document.querySelector('#main h2.heading, #main h3.heading');
  if (anchor) anchor.insertAdjacentElement('afterend', banner);
}

function injectExportBadge () {
  if (!/\/users\/[^/]+\/bookmarks/.test(location.pathname)) return;
  const heading = document.querySelector('#main h2.heading, #main h3.heading');
  if (!heading || heading.querySelector(`.${NS}-export-badge`)) return;

  const badge = document.createElement('span');
  badge.className = `${NS}-export-badge`;
  refreshBadge(badge);
  heading.appendChild(badge);

  const fmtSel = document.createElement('select');
  fmtSel.className = `${NS}-export-fmt`;
  ['json', 'csv', 'html'].forEach(fmt => {
    const opt = document.createElement('option');
    opt.value = fmt;
    opt.textContent = fmt.toUpperCase();
    fmtSel.appendChild(opt);
  });

  const exportBtn = document.createElement('button');
  exportBtn.className   = `${NS}-export-btn`;
  exportBtn.textContent = '↓ Export';
  exportBtn.addEventListener('click', () => {
    doExport(fmtSel.value);
    refreshBadge(badge);
  });
  heading.appendChild(fmtSel);
  heading.appendChild(exportBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Bookmark Maintenance',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  // document.body peut ne pas encore exister quand ce module boote (surtout
  // sur une grosse page) — sans ce report, l'observer plantait (Cannot read
  // properties of null), constaté sur plusieurs modules similaires en test.
  let active = true;
  let obs = null;
  onReady(() => {
    if (!active) return;
    // Try immediately (bookmark page with inline form already in DOM)
    applyPrivateDefault();
    injectExportBadge();
    injectAnalyticsDashboard();
    injectStaleReminder();

    // Only watch for the bookmark form opening dynamically if the feature is on
    if (cfg('privateByDefault')) {
      obs = observe(document.body, { childList: true, subtree: true }, applyPrivateDefault);
    }
  });

  return () => {
    active = false;
    obs?.disconnect();
    document.getElementById(`${NS}-bm-analytics`)?.remove();
    document.getElementById(`${NS}-bm-stale`)?.remove();
    document.querySelectorAll(`.${NS}-export-badge, .${NS}-export-btn, .${NS}-export-fmt`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-bm-stale-hl`).forEach(el => el.classList.remove(`${NS}-bm-stale-hl`));
  };
});
