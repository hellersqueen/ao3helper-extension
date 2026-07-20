/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Page Controls Coordinator

    Module ID: pageControls
    Display Name: Page Controls
    Tab: Browse

    Purpose

    Adds configurable navigation and result-density controls to AO3 listing
    pages while keeping each control group independently maintainable.

    Submodules

    - coreNavigation.js: page input and URL navigation
    - worksPerPage.js: works-per-page selector
    - enhancedNavigation.js: previous/next jumps and first/last controls

    Notes

    - The coordinator runs only on supported work, bookmark, and history lists.
    - Submodules receive the shared module configuration accessor.
    - Cleanup runs in reverse setup order.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './pageControls.css?inline';

import { CoreNavigation } from './coreNavigation.js';
import { WorksPerPage } from './worksPerPage.js';
import { EnhancedNavigation } from './enhancedNavigation.js';
import { BackToTop } from './backToTop.js';
import { InfiniteScroll } from './infiniteScroll.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

// AO3 pagination uses ?page=N in query string. Shared by coreNavigation,
// enhancedNavigation, and infiniteScroll — kept here instead of exposed
// through a sibling import (see architecture.md's guidance on cross-file
// dependencies within the same parent module).
export function getCurrentPage () {
  const m = location.search.match(/[?&]page=(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

export function getMaxPage () {
  // Try reading the last page link in .pagination
  const lastLink = document.querySelector('.pagination a[href*="page="]:last-of-type, .pagination li:last-child a[href*="page="]');
  if (lastLink) {
    const m = lastLink.href.match(/[?&]page=(\d+)/);
    if (m) return parseInt(m[1], 10);
  }
  // Fallback: read "N-M of X" text
  const heading = document.querySelector('#main .heading');
  if (heading) {
    const m = heading.textContent.match(/of\s+([\d,]+)/);
    if (m) {
      const total   = parseInt(m[1].replace(/,/g, ''), 10);
      const perPage = parseInt(new URL(location.href).searchParams.get('items_per_page') || '20', 10);
      return Math.ceil(total / perPage) || 1;
    }
  }
  return 1;
}

export function buildPageURL (pageNum) {
  const url    = new URL(location.href);
  if (pageNum <= 1) url.searchParams.delete('page');
  else              url.searchParams.set('page', pageNum);
  return url.toString();
}

export function clampPage (page, max) {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.round(page), 1), Math.max(max, 1));
}

export function normalizeStep (step, fallback) {
  const value = parseInt(String(step), 10);
  return Number.isFinite(value) && value >= 1 && value <= 10000 ? value : fallback;
}

export function percentPage (fraction, max) {
  return clampPage(Math.round(max * fraction), max);
}

export function randomPage (current, max, rng = Math.random) {
  if (max <= 1) return 1;
  let page = clampPage(1 + Math.floor(rng() * max), max);
  if (page === current) page = page === max ? page - 1 : page + 1;
  return clampPage(page, max);
}

export const MEMORY_KEY = 'ao3h:pc:recentPages';
export const MAX_PAGES_PER_LISTING = 5;
export const MAX_LISTINGS = 30;

export function listingKey (href) {
  try {
    const url = new URL(href, 'https://archiveofourown.org');
    const params = [...url.searchParams.entries()]
      .filter(([key]) => key !== 'page')
      .sort(([a], [b]) => a.localeCompare(b));
    const query = params.map(([key, value]) => `${key}=${value}`).join('&');
    return url.pathname + (query ? `?${query}` : '');
  } catch {
    return String(href);
  }
}

function loadPaginationMemory (storage) {
  try {
    const data = JSON.parse(storage.getItem(MEMORY_KEY) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function savePaginationMemory (storage, data) {
  try { storage.setItem(MEMORY_KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

export function recordVisit (key, page, storage = localStorage) {
  if (!Number.isFinite(page) || page < 1) return;
  const data = loadPaginationMemory(storage);
  const entry = data[key] || { pages: [], at: 0 };
  entry.pages = [page, ...entry.pages.filter(previous => previous !== page)]
    .slice(0, MAX_PAGES_PER_LISTING);
  entry.at = Date.now();
  data[key] = entry;
  const keys = Object.keys(data);
  if (keys.length > MAX_LISTINGS) {
    keys.sort((a, b) => (data[a].at || 0) - (data[b].at || 0));
    for (const stale of keys.slice(0, keys.length - MAX_LISTINGS)) delete data[stale];
  }
  savePaginationMemory(storage, data);
}

export function getRecentPages (key, storage = localStorage) {
  const entry = loadPaginationMemory(storage)[key];
  return Array.isArray(entry?.pages)
    ? entry.pages.filter(page => Number.isFinite(page) && page >= 1)
    : [];
}

export function getLastPage (key, storage = localStorage) {
  return getRecentPages(key, storage)[0] ?? null;
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-pageControls');

const MOD  = 'pageControls';
const LOG  = `[AO3H][${MOD}]`;

const DEFAULTS = {
  showPlusMinus10Buttons : true,
  quickJumpStep          : 10,
  showBigJumpButtons     : false,
  bigJumpStep            : 50,
  showRandomPageButton   : true,
  showPercentJumpButtons : true,
  rememberRecentPages    : true,
  pageInputPosition      : 'below', // 'below' | 'above' the pagination block
  showPaginationProgressBar : true,
  stickyEnhancedNav      : false,
  worksPerPageEnabled    : true,
  worksPerPage           : 20,
  infiniteScrollEnabled  : false,
  showBackToTopButton    : true,
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function isListingPage () {
  return (
    /^\/works$/.test(location.pathname)                                ||
    /^\/tags\/[^/]+\/works/.test(location.pathname)                    ||
    /^\/users\/[^/]+\/(bookmarks|works|history)/.test(location.pathname) ||
    /^\/bookmarks$/.test(location.pathname)                            ||
    /^\/collections\/[^/]+\/works/.test(location.pathname)
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Page Controls', enabledByDefault: false }, init);

async function init() {
  console.log(`${LOG} init`);

  if (!isListingPage()) return () => {};

  const diOpts = {
    cfg,
    pageHelpers: { randomPage, percentPage, listingKey, recordVisit, getRecentPages, getCurrentPage, getMaxPage, buildPageURL },
    normalizeStep,
  };

  // Infinite scroll replaces the jump-to-page controls (they'd point at
  // pages the appended list has already absorbed).
  const infinite = cfg('infiniteScrollEnabled');

  const coreNav  = infinite ? null : new CoreNavigation(diOpts);
  const wpp      = cfg('worksPerPageEnabled')
                     ? new WorksPerPage(diOpts)
                     : null;
  const enhanced = infinite ? null : new EnhancedNavigation(diOpts);
  const infScroll = infinite ? new InfiniteScroll(diOpts) : null;
  const backToTop = cfg('showBackToTopButton')
                     ? new BackToTop(diOpts)
                     : null;

  coreNav?.setup();
  wpp?.setup();
  enhanced?.setup();
  infScroll?.setup();
  backToTop?.setup();

  return function cleanup () {
    backToTop?.teardown();
    infScroll?.teardown();
    enhanced?.teardown();
    wpp?.teardown();
    coreNav?.teardown();
  };
}
