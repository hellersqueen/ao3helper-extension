/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Series Helper › Series Page

Enhances AO3 series pages (/series/{id}) and series listings:

- Word total + estimated reading time summary for the whole series
- Notice when listed works are fewer than the stated total (deleted/restricted)
- "▶ Next unread" button (readingTracker history, soft dependency)
- Records the subscription state so listing badges have real data
- Runs the sequential-vs-anthology title heuristic and stores the result
- Optionally hides empty series blurbs on series listings

Notes

- Everything works from data already present on the page — no extra requests.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { onReady, lsGet } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const MOD = 'seriesPage';
const NS = 'ao3h';

const DEFAULTS = { seriesSummary: true, hideEmptySeries: false };

const SK_RT_HIST = 'ao3h:rt:history'; // readingTracker — soft dep

function getAPI () { return W.AO3H_SeriesHelper || null; }

function isSeriesPage () { return /^\/series\/\d+/.test(location.pathname); }
function isSeriesListing () { return /^\/(users\/[^/]+\/series|series)\/?$/.test(location.pathname); }
function currentSeriesId () {
  const m = /^\/series\/(\d+)/.exec(location.pathname);
  return m ? m[1] : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SERIES PAGE ANALYSIS
═══════════════════════════════════════════════════════════════════════════ */

function getStatedWorksTotal () {
  const dts = document.querySelectorAll('dl.series.meta.group dt, dl.meta dt');
  for (const dt of dts) {
    if (/^\s*Works\s*:?\s*$/i.test(dt.textContent || '')) {
      const dd = dt.nextElementSibling;
      if (dd) return getAPI().parseCount(dd.textContent);
    }
  }
  return null;
}

function getListedWorks () {
  return Array.from(document.querySelectorAll('ul.series.work.index li.work.blurb, ol.work.index li.work.blurb'))
    .map(blurb => {
      const m = /^work_(\d+)$/.exec(blurb.id || '');
      const titleA = blurb.querySelector('h4.heading a[href*="/works/"]');
      const words = getAPI().parseCount(blurb.querySelector('dd.words')?.textContent);
      return {
        id: m ? m[1] : null,
        title: titleA?.textContent.trim() || '',
        href: titleA?.getAttribute('href') || (m ? `/works/${m[1]}` : null),
        words,
      };
    })
    .filter(w => w.id);
}

function getReadWorkIds () {
  const history = lsGet(SK_RT_HIST, []);
  return Array.isArray(history) ? history.map(e => String(e.id)) : [];
}

function injectSummary (works, statedTotal) {
  if (document.getElementById(`${NS}-sh-series-summary`)) return;
  const heading = document.querySelector('h2.heading');
  if (!heading) return;

  const box = document.createElement('div');
  box.id = `${NS}-sh-series-summary`;
  box.className = `${NS}-sh-series-summary`;

  const { sumWords, formatReadingTime, unavailableParts, firstUnreadIndex } = getAPI();
  const totalWords = sumWords(works.map(w => w.words));
  const time = formatReadingTime(totalWords);
  const parts = [];
  if (totalWords > 0) {
    parts.push(`📖 ${totalWords.toLocaleString('en-US')} words total`);
    if (time) parts.push(`⏱ ${time} to read`);
  }

  const missing = unavailableParts(statedTotal, works.length);
  if (missing > 0) {
    parts.push(`⚠️ ${missing} work${missing > 1 ? 's' : ''} unavailable (deleted or restricted)`);
  }

  const unreadIdx = firstUnreadIndex(works.map(w => w.id), getReadWorkIds());
  if (unreadIdx !== -1 && works[unreadIdx].href) {
    const label = unreadIdx === 0 ? '▶ Start reading' : `▶ Next unread: Part ${unreadIdx + 1}`;
    const a = document.createElement('a');
    a.className = `${NS}-sh-next-unread`;
    a.href = works[unreadIdx].href;
    a.textContent = label;
    a.title = works[unreadIdx].title;
    box.append(parts.join(' · '), parts.length ? ' · ' : '', a);
  } else {
    if (unreadIdx === -1 && works.length) parts.push('✓ All parts read');
    box.textContent = parts.join(' · ');
  }

  if (!box.textContent && !box.querySelector('a')) return;
  heading.insertAdjacentElement('afterend', box);
}

function recordSubscription (api, seriesId) {
  // AO3 shows "Unsubscribe" on the series page when subscribed. Recording it
  // here is what makes the "✓ Subscribed" listing badge actually appear —
  // the `sub` map was previously read but never written anywhere.
  const btn = Array.from(document.querySelectorAll('form[action*="subscription"] input[type="submit"], form[action*="subscription"] button'))
    .find(el => /unsubscribe/i.test(el.value || el.textContent || ''));
  const subs = api.lsGet('sub') || {};
  const wasSubscribed = !!subs[seriesId];
  const isSubscribed = !!btn;
  if (wasSubscribed !== isSubscribed) {
    if (isSubscribed) subs[seriesId] = 1;
    else delete subs[seriesId];
    api.lsSet('sub', subs);
  }
}

function recordSeriesType (api, seriesId, works) {
  const type = api.guessSeriesType(works.map(w => w.title));
  if (type) api.lsSet(`type:${seriesId}`, type);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SERIES LISTINGS
═══════════════════════════════════════════════════════════════════════════ */

function hideEmptySeriesBlurbs () {
  document.querySelectorAll('li.series.blurb').forEach(blurb => {
    const dts = blurb.querySelectorAll('dl.stats dt');
    for (const dt of dts) {
      if (/^\s*Works\s*:?\s*$/i.test(dt.textContent || '')) {
        const count = getAPI().parseCount(dt.nextElementSibling?.textContent);
        if (count === 0) blurb.classList.add(`${NS}-sh-empty-hidden`);
        return;
      }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Series Page',
  parent: 'seriesHelper',
  enabledByDefault: true,
}, async function init () {
  const cfg = loadModuleSettings('seriesHelper', DEFAULTS);

  let active = true;
  onReady(() => {
    if (!active) return;
    const api = getAPI();

    if (isSeriesPage() && api) {
      const seriesId = currentSeriesId();
      const works = getListedWorks();
      recordSubscription(api, seriesId);
      if (works.length) recordSeriesType(api, seriesId, works);
      if (cfg.seriesSummary) injectSummary(works, getStatedWorksTotal());
    }

    if (cfg.hideEmptySeries && isSeriesListing()) {
      hideEmptySeriesBlurbs();
    }
  });

  return function cleanup () {
    active = false;
    document.getElementById(`${NS}-sh-series-summary`)?.remove();
    document.querySelectorAll(`.${NS}-sh-empty-hidden`).forEach(el => {
      el.classList.remove(`${NS}-sh-empty-hidden`);
    });
  };
});
