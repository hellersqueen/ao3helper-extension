/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Series Helper › Series Progress

Adds progress, type, subscription, and completion indicators to series links,
plus a compact series-navigation banner on work pages.

Notes

- Large-series warnings are controlled by the parent `epicSeriesWarning` setting.
- Series type and subscription state come from the coordinator's shared API.
- Dynamic listing content is enhanced through a mutation observer.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Storage } from '../../../../lib/storage/index.js';
import { wrapStorageForUser } from '../../../../lib/storage/user.js';
import { isWorkPage, isListingPage } from '../../../../lib/ao3/parsers.js';
import { observe, onReady } from '../../../../lib/utils/index.js';
import { remainingParts } from './seriesHelperMath.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const MOD = 'seriesProgress';
const NS = 'ao3h';

// AO3H.store resolves to wrapStorageForUser(Storage) (src/core/lifecycle.js) —
// reproduced directly via imports rather than going through window.AO3H.store.
const wrappedStorage = wrapStorageForUser(Storage);

const DEFAULTS = { epicSeriesWarning: false };

function getAPI() { return W.AO3H_SeriesHelper || null; }

// Matches e.g. "Part 3 of 10" or "3 of 10"
const PART_RE = /Part\s+(\d+)\s+of\s+(\d+)/i;
const OF_RE   = /(\d+)\s+of\s+(\d+)/i;

function parsePartOf(text) {
  let m = PART_RE.exec(text) || OF_RE.exec(text);
  if (m) return { part: +m[1], total: +m[2] };
  return null;
}

function seriesIdFromHref(href) {
  if (!href) return null;
  const m = /\/series\/(\d+)/.exec(href);
  return m ? m[1] : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SERIES LINK ENHANCEMENT
═══════════════════════════════════════════════════════════════════════════ */

function enhanceLink(a, cfg, api) {
  if (a.dataset.ao3hSh) return; // already enhanced
  a.dataset.ao3hSh = '1';

  const text = a.textContent || '';
  const parsed = parsePartOf(text);
  const seriesId = seriesIdFromHref(a.getAttribute('href'));

  if (parsed) {
    const { part, total } = parsed;
    const pct = Math.round((part / total) * 100);

    // Progress bar
    const wrap = document.createElement('span');
    wrap.className = `${NS}-sh-progress-wrap`;
    wrap.title = `Part ${part} of ${total} (${pct}%)`;
    const bar = document.createElement('span');
    bar.className = `${NS}-sh-progress-bar`;
    bar.style.width = `${pct}%`;
    wrap.appendChild(bar);
    a.parentNode.insertBefore(wrap, a.nextSibling);

    // Epic badge
    if (cfg.epicSeriesWarning && total >= 20) {
      const badge = document.createElement('span');
      badge.className = `${NS}-sh-badge ${NS}-sh-badge-epic`;
      badge.textContent = `⚠️ Epic: ${total} works`;
      a.parentNode.insertBefore(badge, wrap.nextSibling);
    }

    // Series type heuristic (stored per series ID by coordinator cache)
    if (seriesId && api) {
      const typeKey = `type:${seriesId}`;
      const type = api.lsGet(typeKey);
      if (type) {
        const badge = document.createElement('span');
        badge.className = `${NS}-sh-badge ${type === 'seq' ? `${NS}-sh-badge-seq` : `${NS}-sh-badge-anth`}`;
        badge.textContent = type === 'seq' ? '📖 Sequential' : '🗂️ Anthology';
        a.parentNode.insertBefore(badge, wrap.nextSibling);
      }
    }
  }

  // Subscription indicator — links to the series page, where AO3's native
  // Unsubscribe button lives (an in-place unsubscribe would need the per-user
  // subscription id + CSRF token, only present on that page).
  if (seriesId && api) {
    const subs = api.lsGet('sub') || {};
    if (subs[seriesId]) {
      const badge = document.createElement('a');
      badge.className = `${NS}-sh-badge ${NS}-sh-badge-sub`;
      badge.textContent = '✓ Subscribed';
      badge.href = `/series/${seriesId}`;
      badge.title = 'Subscribed — open the series page to unsubscribe';
      a.parentNode.insertBefore(badge, a.nextSibling);
    }
  }

  // Complete/ongoing status badge — detect from surrounding meta if available
  const parent = a.closest('dl, dd, li');
  if (parent) {
    const metaText = parent.textContent || '';
    const completeMatch = /\bComplete Work\b|\bCompleted\b/i.test(metaText);
    const ongoingMatch  = /\bWork in Progress\b|\bWIP\b/i.test(metaText);
    if (completeMatch) {
      const badge = document.createElement('span');
      badge.className = `${NS}-sh-badge ${NS}-sh-badge-done`;
      badge.textContent = '✓ Complete';
      a.parentNode.insertBefore(badge, a.nextSibling);
    } else if (ongoingMatch) {
      const badge = document.createElement('span');
      badge.className = `${NS}-sh-badge ${NS}-sh-badge-ongoing`;
      badge.textContent = '🔄 Ongoing';
      a.parentNode.insertBefore(badge, a.nextSibling);
    }
  }
}

function enhanceAllLinks(cfg, api) {
  document.querySelectorAll('dd.series a, .series a').forEach(a => {
    enhanceLink(a, cfg, api);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — WORK-PAGE SERIES BANNER
═══════════════════════════════════════════════════════════════════════════ */

function injectBanner(api) {
  if (document.getElementById(`${NS}-sh-banner`)) return;

  const seriesDDs = document.querySelectorAll('dd.series');
  if (!seriesDDs.length) return;

  // Collect series info: [{name, href, part, total, seriesId}]
  const entries = [];
  seriesDDs.forEach(dd => {
    const a = dd.querySelector('a[href*="/series/"]');
    if (!a) return;
    const seriesId = seriesIdFromHref(a.getAttribute('href'));
    const linkText = a.textContent || '';
    // AO3 format: "Part X of Y in Series Name"
    const parsed = parsePartOf(dd.textContent || '');
    entries.push({
      name: a.textContent.trim(),
      href: a.getAttribute('href'),
      seriesId,
      part: parsed?.part ?? null,
      total: parsed?.total ?? null
    });
  });
  if (!entries.length) return;

  const banner = document.createElement('div');
  banner.className = `${NS}-sh-banner`;
  banner.id = `${NS}-sh-banner`;

  const info = document.createElement('span');
  entries.forEach((e, i) => {
    if (i > 0) {
      info.appendChild(document.createTextNode(' · '));
    }
    info.appendChild(document.createTextNode('📚 '));
    if (e.part !== null && e.total !== null) {
      info.appendChild(document.createTextNode(`Part ${e.part} of ${e.total} in `));
    } else {
      info.appendChild(document.createTextNode('Part of '));
    }
    const a = document.createElement('a');
    a.href = e.href;
    a.textContent = e.name;
    info.appendChild(a);
    if (e.part !== null && e.total !== null) {
      const pct = Math.round((e.part / e.total) * 100);
      info.appendChild(document.createTextNode(` (${pct}%)`));
      // End-of-series nudge when only a couple of parts remain
      const left = remainingParts(e.part, e.total);
      if (left !== null && left > 0 && left <= 2) {
        const nudge = document.createElement('span');
        nudge.className = `${NS}-sh-banner-nudge`;
        nudge.textContent = ` 🏁 ${left === 1 ? 'Last part after this one!' : `Only ${left} parts left`}`;
        info.appendChild(nudge);
      } else if (left === 0) {
        const nudge = document.createElement('span');
        nudge.className = `${NS}-sh-banner-nudge`;
        nudge.textContent = ' 🎉 Final part';
        info.appendChild(nudge);
      }
    }
  });

  // Prev/Next navigation (AO3 native series navigation if present, otherwise link to series)
  const nav = document.createElement('span');
  nav.className = `${NS}-sh-banner-nav`;
  const prevLink = /** @type {HTMLAnchorElement|null} */ (
    document.querySelector('a[rel="prev"]') ||
    document.querySelector('.previous a')
  );
  const nextLink = /** @type {HTMLAnchorElement|null} */ (
    document.querySelector('a[rel="next"]') ||
    document.querySelector('.next a')
  );
  if (prevLink) {
    const a = document.createElement('a');
    a.href = prevLink.href;
    a.textContent = '← Prev';
    nav.appendChild(a);
  }
  if (nextLink) {
    const a = document.createElement('a');
    a.href = nextLink.href;
    a.textContent = 'Next →';
    nav.appendChild(a);
  }
  // Always offer a link to the series page
  if (entries[0]?.href) {
    const a = document.createElement('a');
    a.href = entries[0].href;
    a.textContent = '📋 Series';
    nav.appendChild(a);
  }

  const collapseBtn = document.createElement('button');
  collapseBtn.className = `${NS}-sh-banner-collapse`;
  collapseBtn.title = 'Collapse';
  collapseBtn.textContent = '×';
  collapseBtn.addEventListener('click', () => banner.remove());

  banner.appendChild(info);
  banner.appendChild(nav);
  banner.appendChild(collapseBtn);

  // Insert after .title.heading
  const titleEl = document.querySelector('.title.heading') ||
                  document.querySelector('h2.title');
  if (titleEl && titleEl.parentNode) {
    titleEl.parentNode.insertBefore(banner, titleEl.nextSibling);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — DYNAMIC CONTENT
═══════════════════════════════════════════════════════════════════════════ */

let observer = null;
function startObserver(cfg, api) {
  if (observer) return;
  observer = observe(document.body, { childList: true, subtree: true }, () => enhanceAllLinks(cfg, api));
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Series Progress',
  parent: 'seriesHelper',
  enabledByDefault: true
}, async function init() {
  const _raw = wrappedStorage.lsGet?.(`mod:seriesHelper:settings`, null);
  const parentCfg = (_raw && typeof _raw === 'object') ? _raw : {};
  const cfg = Object.assign({}, DEFAULTS, parentCfg);
  const api = getAPI();

  // Le DOM (dd.series, .title.heading…) peut ne pas encore être parsé quand
  // ce module boote sur une grosse page — sans ce report, enhanceAllLinks()
  // trouve 0 lien au premier passage, et le MutationObserver démarré ensuite
  // ne voit plus rien à observer si le parsing s'est déjà terminé entre
  // temps (constaté en test).
  let active = true;
  onReady(() => {
    if (!active) return;
    if (isListingPage()) {
      enhanceAllLinks(cfg, api);
      startObserver(cfg, api);
    }

    if (isWorkPage() && api) {
      injectBanner(api);
    }
  });

  return function cleanup() {
    active = false;
    if (observer) { observer.disconnect(); observer = null; }
    document.querySelectorAll(
      `.${NS}-sh-progress-wrap, .${NS}-sh-badge, #${NS}-sh-banner`
    ).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-sh]').forEach(el => {
      delete el.dataset.ao3hSh;
    });
  };
});
