/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Series Helper Coordinator

    Module ID: seriesHelper
    Display Name: Series Helper
    Tab: Navigate & Interact

    Purpose

    Coordinates series grouping, progress presentation, and the shared storage
    bridge consumed by both child modules.

    Submodules

    - seriesOrganization.js: groups related works on listing pages
    - seriesProgress.js: progress badges and work-page series navigation
    - seriesPage.js: series-page summary, next-unread, type/subscription recording

    Notes

    - `AO3H_SeriesHelper` exposes namespaced JSON storage to child modules.
    - The shared runtime bridge is removed when the coordinator stops.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet as sharedLsGet, lsSet as sharedLsSet } from '../../../../lib/utils/index.js';
import styles from './seriesHelper.css?inline';

import './seriesOrganization.js';
import './seriesProgress.js';
import './seriesPage.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-seriesHelper');

const W   = getGlobalWindow();
const MOD = 'seriesHelper';
const NS  = 'ao3h';
const WORDS_PER_MINUTE = 250;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function lsGet(key) {
  return sharedLsGet(`${NS}:sh:${key}`, null);
}
function lsSet(key, val) {
  sharedLsSet(`${NS}:sh:${key}`, val);
}

export function parseCount (text) {
  if (!text) return null;
  const count = parseInt(String(text).replace(/[,\s]/g, ''), 10);
  return Number.isFinite(count) ? count : null;
}

export function sumWords (counts) {
  return (counts || []).reduce((sum, count) => sum + (Number.isFinite(count) ? count : 0), 0);
}

export function formatReadingTime (words) {
  if (!words || words <= 0) return null;
  const minutes = Math.round(words / WORDS_PER_MINUTE);
  if (minutes < 60) return `~${Math.max(1, minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `~${hours} h ${String(rest).padStart(2, '0')} min` : `~${hours} h`;
}

export function unavailableParts (statedTotal, listedCount) {
  if (!Number.isFinite(statedTotal) || !Number.isFinite(listedCount)) return 0;
  return Math.max(0, statedTotal - listedCount);
}

export function firstUnreadIndex (workIds, readIds) {
  const read = new Set(readIds || []);
  return (workIds || []).findIndex(id => !read.has(String(id)));
}

export function remainingParts (part, total) {
  if (!Number.isFinite(part) || !Number.isFinite(total)) return null;
  return Math.max(0, total - part);
}

export function shouldAutoCollapse (count, threshold, manualState) {
  if (manualState === true || manualState === false) return manualState;
  if (!threshold || threshold <= 0) return false;
  return count >= threshold;
}

const SEQUENCE_MARKER = /\b(?:part|book|volume|vol|episode|chapter|arc)\b|\b\d+\b|[#№]\d/i;

function commonPrefixLength (a, b) {
  const max = Math.min(a.length, b.length);
  let index = 0;
  while (index < max && a[index].toLowerCase() === b[index].toLowerCase()) index += 1;
  return index;
}

export function guessSeriesType (titles) {
  const list = (titles || []).map(title => String(title || '').trim()).filter(Boolean);
  if (list.length < 2) return null;
  if (list.filter(title => SEQUENCE_MARKER.test(title)).length / list.length >= 0.6) return 'seq';

  let prefixed = 0;
  for (let index = 1; index < list.length; index += 1) {
    if (commonPrefixLength(list[0], list[index]) >= 8) prefixed += 1;
  }
  return prefixed / (list.length - 1) >= 0.6 ? 'seq' : 'anth';
}

const seriesHelperCalculations = {
  parseCount, sumWords, formatReadingTime, unavailableParts, firstUnreadIndex,
  remainingParts, shouldAutoCollapse, guessSeriesType,
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Series Helper',
  enabledByDefault: true
}, async function init() {
  // Expose shared API for submodules (must be set before cascade)
  W.AO3H_SeriesHelper = { lsGet, lsSet, NS, ...seriesHelperCalculations };

  return function cleanup() {
    delete W.AO3H_SeriesHelper;
  };
});
