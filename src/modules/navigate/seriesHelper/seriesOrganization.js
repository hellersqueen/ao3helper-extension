/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Series Helper › Series Organization

Groups multiple works from the same series on listing pages and provides group
navigation, hiding, and persistent collapse controls.

Notes

- Grouping is opt-in through the parent `groupSeriesInSearch` setting.
- Only series represented by at least two listing blurbs are grouped.
- Original blurb positions are restored during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Storage } from '../../../../lib/storage/index.js';
import { wrapStorageForUser } from '../../../../lib/storage/user.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const MOD = 'seriesOrganization';
const NS = 'ao3h';

// AO3H.store resolves to wrapStorageForUser(Storage) (src/core/lifecycle.js) —
// reproduced directly via imports rather than going through window.AO3H.store.
const wrappedStorage = wrapStorageForUser(Storage);

const DEFAULTS = { groupSeriesInSearch: false };

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SERIES IDENTIFICATION AND GROUP STATE
═══════════════════════════════════════════════════════════════════════════ */

function isListingPage() {
  return /^\/(works|tags|bookmarks|users|search)/.test(location.pathname);
}

function getAPI() { return W.AO3H_SeriesHelper || null; }

function getSeriesIdFromBlurb(blurb) {
  const a = blurb.querySelector('dd.series a[href*="/series/"]');
  if (!a) return null;
  const m = /\/series\/(\d+)/.exec(a.getAttribute('href') || '');
  return m ? m[1] : null;
}

function getSeriesNameFromBlurb(blurb) {
  const a = blurb.querySelector('dd.series a[href*="/series/"]');
  return a ? a.textContent.trim() : null;
}

function getSeriesHrefFromBlurb(blurb) {
  const a = blurb.querySelector('dd.series a[href*="/series/"]');
  return a ? a.getAttribute('href') : null;
}

function isCollapsed(api, seriesId) {
  const map = api.lsGet('collapsedGroups') || {};
  return !!map[seriesId];
}

function setCollapsed(api, seriesId, val) {
  const map = api.lsGet('collapsedGroups') || {};
  if (val) map[seriesId] = 1;
  else delete map[seriesId];
  api.lsSet('collapsedGroups', map);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SERIES GROUPING
═══════════════════════════════════════════════════════════════════════════ */

function buildGroupHeader(seriesId, seriesName, seriesHref, count, collapsed, api) {
  const header = document.createElement('li');
  header.className = `${NS}-sh-group-header`;
  header.dataset.ao3hShGroup = seriesId;

  const title = document.createElement('span');
  const titleLink = document.createElement('a');
  titleLink.href = seriesHref;
  titleLink.textContent = seriesName;
  const titleCount = document.createElement('small');
  titleCount.textContent = ` (${count} work${count > 1 ? 's' : ''})`;
  title.appendChild(titleLink);
  title.appendChild(titleCount);

  const actions = document.createElement('span');
  actions.className = `${NS}-sh-group-actions`;

  // Read Series button
  const readBtn = document.createElement('button');
  readBtn.textContent = '📖 Read Series';
  readBtn.title = 'Go to the series page';
  readBtn.addEventListener('click', () => {
    window.location.href = seriesHref;
  });

  // Skip All button
  const skipBtn = document.createElement('button');
  skipBtn.textContent = '⏭ Skip All';
  skipBtn.title = 'Hide all works in this series';
  skipBtn.addEventListener('click', () => {
    document.querySelectorAll(`[data-ao3h-sh-series="${seriesId}"]`).forEach(el => {
      el.classList.add(`${NS}-sh-group-hidden`);
    });
    header.style.display = 'none';
  });

  // Expand/Collapse toggle
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = collapsed ? '▼ Expand' : '▲ Collapse';
  toggleBtn.title = collapsed ? 'Show works in this series' : 'Collapse series works';
  toggleBtn.addEventListener('click', () => {
    const nowCollapsed = !isCollapsed(api, seriesId);
    setCollapsed(api, seriesId, nowCollapsed);
    toggleBtn.textContent = nowCollapsed ? '▼ Expand' : '▲ Collapse';
    document.querySelectorAll(`[data-ao3h-sh-series="${seriesId}"]`).forEach(el => {
      el.classList.toggle(`${NS}-sh-group-hidden`, nowCollapsed);
    });
  });

  actions.appendChild(readBtn);
  actions.appendChild(skipBtn);
  actions.appendChild(toggleBtn);
  header.appendChild(title);
  header.appendChild(actions);
  return header;
}

function groupSeriesBlurbs(api) {
  const workList = document.querySelector('ol.work.index, ul.work.index');
  if (!workList) return [];

  const blurbs = Array.from(workList.querySelectorAll('li.work.blurb'));
  if (!blurbs.length) return [];
  const originalPositions = [];

  // Group blurbs by series ID; track order of first appearance
  const groups = new Map(); // seriesId → [blurb, ...]
  const order  = [];

  blurbs.forEach(blurb => {
    const sid = getSeriesIdFromBlurb(blurb);
    if (sid) {
      if (!groups.has(sid)) {
        groups.set(sid, []);
        order.push(sid);
      }
      groups.get(sid).push(blurb);
      blurb.dataset.ao3hShSeries = sid;
    }
  });

  // Only act on series with 2+ works in the results
  groups.forEach((blurbList, seriesId) => {
    if (blurbList.length < 2) return;

    const seriesName = getSeriesNameFromBlurb(blurbList[0]);
    const seriesHref = getSeriesHrefFromBlurb(blurbList[0]);
    if (!seriesName || !seriesHref) return;

    const collapsed = isCollapsed(api, seriesId);
    const header = buildGroupHeader(
      seriesId, seriesName, seriesHref, blurbList.length, collapsed, api
    );

    blurbList.forEach(blurb => {
      const marker = document.createComment(`ao3h-series-position:${seriesId}`);
      blurb.parentNode.insertBefore(marker, blurb);
      originalPositions.push({ blurb, marker });
    });

    // Move all blurbs to follow the header in correct order
    const firstBlurb = blurbList[0];
    firstBlurb.parentNode.insertBefore(header, firstBlurb);
    let insertAfter = header;
    blurbList.forEach(blurb => {
      insertAfter.parentNode.insertBefore(blurb, insertAfter.nextSibling);
      insertAfter = blurb;
    });

    // Apply collapsed state
    if (collapsed) {
      blurbList.forEach(blurb => blurb.classList.add(`${NS}-sh-group-hidden`));
    }
  });

  return originalPositions;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Series Organization',
  parent: 'seriesHelper',
  enabledByDefault: true
}, async function init() {
  const _raw = wrappedStorage.lsGet?.(`mod:seriesHelper:settings`, null);
  const parentCfg = (_raw && typeof _raw === 'object') ? _raw : {};
  const cfg = Object.assign({}, DEFAULTS, parentCfg);
  const api = getAPI();

  if (!cfg.groupSeriesInSearch) return function cleanup() {};
  if (!isListingPage() || !api) return function cleanup() {};

  const originalPositions = groupSeriesBlurbs(api);

  return function cleanup() {
    // Remove group headers
    document.querySelectorAll(`[data-ao3h-sh-group]`).forEach(el => el.remove());
    // Restore every moved blurb at its exact original position
    originalPositions.forEach(({ blurb, marker }) => {
      if (marker.isConnected) marker.replaceWith(blurb);
    });
    // Unhide any hidden blurbs and clear data attrs
    document.querySelectorAll('[data-ao3h-sh-series]').forEach(el => {
      el.classList.remove(`${NS}-sh-group-hidden`);
      delete el.dataset.ao3hShSeries;
    });
  };
});
