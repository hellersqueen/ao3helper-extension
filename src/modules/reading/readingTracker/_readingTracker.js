/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Reading Tracker Coordinator

    Module ID: readingTracker
    Display Name: Reading Tracker
    Tab: Reading

    Purpose

    Coordinates work-visit history, reading progress, listing-page markers,
    resume tools, update detection, and history-management actions.

    Submodules

    - seenTracking.js: work visits and updated-since listing indicators
    - visualMarkers.js: seen-work and chapter-progress listing markers
    - readingProgress.js: scroll persistence, resume tools, and progress display
    - viewHistory.js: history clearing, import, export, and panel actions

    Notes

- Visit history is capped at 2,000 entries.
- Progress is stored separately for each work.
- `AO3H_ReadingTracker` exposes progress, history, and seen-state operations.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet, lsDel, onReady } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';
import { relativeDate } from '../../../../lib/utils/format-date.js';
import styles from './readingTracker.css?inline';

import { SeenTracking } from './seenTracking.js';
import { VisualMarkers } from './visualMarkers.js';
import { ReadingProgress } from './readingProgress.js';
import { ViewHistory } from './viewHistory.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-readingTracker');

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'readingTracker';
const LOG = `[AO3H][${MOD}]`;

const DEFAULTS = {
  seenMode:                'mark',
  exceptBookmarks:         true,
  exceptSubscribed:        true,
  exceptMFL:               true,
  searchHistory:           true,
  deleteEntry:             true,
  exportHistory:           true,
  resumeToast:             true,
  chapterBadge:            true,
  resumeBanner:            true,
  lastReadTime:            true,
  positionMarker:          true,
  floatingBadge:           true,
  seenWorksOpacity:        0.4,
  historyClearAll:         true,
  showClearProgressButton: true,
  updatedBadge:            true,
  updatedOnlyMode:         false,
  updatedDateFormat:       'relative', // 'relative' | 'exact'
  bulkMarkSeen:            true,
  keyboardToggleSeen:      true,
  progressStyle:           'badge', // 'badge' | 'bar' | 'donut'
  clickToSeek:             true,
  progressMilestones:      true,
  manualBookmarks:         true,
  readingSpeedTracking:    true,
  historyGroupByPeriod:    true,
  continueReadingWidget:   true,
  cleanupOlderThanDays:    0, // 0 = disabled
};

const cfg = makeCfg(MOD, DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function isListingPage () {
  return (
    /^\/works(\/|$|\?)/.test(location.pathname)           ||
    /^\/tags\/[^/]+\/works/.test(location.pathname)       ||
    /^\/users\/[^/]+\/bookmarks/.test(location.pathname)  ||
    /^\/users\/[^/]+\/works/.test(location.pathname)      ||
    /^\/bookmarks(\/|$|\?)/.test(location.pathname)
  );
}

function isHistoryPage () {
  return /^\/users\/[^/]+\/readings/.test(location.pathname);
}

function isHomePage () {
  return location.pathname === '/' || location.pathname === '/welcome';
}

const SK_HISTORY  = 'ao3h:rt:history';
const SK_PROGRESS = (id) => `ao3h:rt:progress:${id}`;
const HISTORY_CAP = 2000;

function getHistory ()          { return lsGet(SK_HISTORY) || []; }
function saveHistory (arr)      { lsSet(SK_HISTORY, arr.slice(-HISTORY_CAP)); }
function getProgress (workId)   { return lsGet(SK_PROGRESS(workId)); }
function saveProgress (workId, data) {
  lsSet(SK_PROGRESS(workId), { ...getProgress(workId), ...data });
}
function clearProgress (workId) { lsDel(SK_PROGRESS(workId)); }

const relativeTime = relativeDate;

function sanitizeHref (href) {
  if (!href) return '#';
  if (href.startsWith('/') || href.startsWith(location.origin)) return href;
  return '#';
}

export function nextVisitCount (previousEntry) {
  return previousEntry ? (previousEntry.visitCount || 1) + 1 : 1;
}
export function groupHistoryByPeriod (history, now = Date.now()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayStart = startOfToday.getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 7 * 86400000;
  const groups = { today: [], yesterday: [], thisWeek: [], older: [] };
  history.forEach(entry => {
    const timestamp = entry.lastReadAt || entry.seenAt || 0;
    if (timestamp >= todayStart) groups.today.push(entry);
    else if (timestamp >= yesterdayStart) groups.yesterday.push(entry);
    else if (timestamp >= weekStart) groups.thisWeek.push(entry);
    else groups.older.push(entry);
  });
  return groups;
}
export function sortHistory (history, sortKey = 'date') {
  return [...history].sort((a, b) => sortKey === 'title'
    ? (a.title || '').localeCompare(b.title || '')
    : (b.lastReadAt || b.seenAt || 0) - (a.lastReadAt || a.seenAt || 0));
}
export function pinnedFirst (history) {
  return [...history.filter(entry => entry.pinned), ...history.filter(entry => !entry.pinned)];
}
export function entriesToCleanUp (history, olderThanDays, now = Date.now()) {
  const cutoff = now - olderThanDays * 86400000;
  return history
    .filter(entry => !entry.pinned && (entry.lastReadAt || entry.seenAt || 0) < cutoff)
    .map(entry => entry.id)
    .filter(Boolean);
}
export function computeReadingSpeed (samples) {
  const valid = samples.filter(sample => sample.words > 0 && sample.ms > 0);
  if (!valid.length) return null;
  const words = valid.reduce((sum, sample) => sum + sample.words, 0);
  const milliseconds = valid.reduce((sum, sample) => sum + sample.ms, 0);
  return Math.round((words / milliseconds) * 60000);
}
export function progressMilestonesCrossed (previousPct, nextPct, thresholds = [25, 50, 75]) {
  return thresholds.filter(threshold => previousPct < threshold && nextPct >= threshold);
}
export function donutDashArray (pct, circumference) {
  const dash = Math.max(0, Math.min(100, pct)) / 100 * circumference;
  return {
    dash: Math.round(dash * 10) / 10,
    gap: Math.round((circumference - dash) * 10) / 10,
  };
}
export function formatUpdatedLabel (updatedAt, format, relativeFn) {
  if (format === 'exact') {
    return new Date(updatedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }
  return relativeFn(updatedAt);
}
export function buildContinueReadingList (history, limit = 5) {
  return [...history]
    .filter(entry => entry.chapter && (!entry.totalChapters || entry.chapter < entry.totalChapters))
    .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
    .slice(0, limit);
}

export const readingTrackerHelpers = {
  nextVisitCount, groupHistoryByPeriod, sortHistory, pinnedFirst,
  entriesToCleanUp, computeReadingSpeed, progressMilestonesCrossed,
  donutDashArray, formatUpdatedLabel, buildContinueReadingList,
};

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Reading Tracker', enabledByDefault: false },
  async function init () {
    let active = true;

    W.AO3H_ReadingTracker = {
      getProgress,
      markSeen: null,
      getHistory,
      getReadingSpeed: () => ReadingProgress.getReadingSpeed(readingTrackerHelpers),
    };

    document.documentElement.style.setProperty('--ao3h-rt-seen-opacity', cfg('seenWorksOpacity') ?? 0.4);
    if (cfg('historyClearAll') === false) document.documentElement.classList.add('ao3h-rt-hide-history-clear');
    if (cfg('showClearProgressButton') === false) document.documentElement.classList.add('ao3h-rt-hide-progress-clear');

    const seenTracking    = new SeenTracking({ NS, cfg, getHistory, saveHistory, relativeTime, helpers: readingTrackerHelpers });
    W.AO3H_ReadingTracker.markSeen = (id) => seenTracking.markSeen(id);
    const visualMarkers   = new VisualMarkers({ NS, cfg, getHistory, getProgress });
    const readingProgress = new ReadingProgress({ NS, cfg, saveProgress, getProgress, relativeTime, sanitizeHref, helpers: readingTrackerHelpers });
    const viewHistory     = new ViewHistory({ NS, LOG, isHistoryPage, getHistory, saveHistory, clearProgress, helpers: readingTrackerHelpers });

    viewHistory.wirePanelActions({
      parseWorkId:       () => seenTracking.parseWorkId(),
      onHistoryFilter:   null,
      onClearProgressUI: () => {
        readingProgress.removePositionMarker();
        readingProgress.removeFloatingBadge();
        readingProgress.dismissBanner();
      },
    });

    if (isWorkPage()) {
      const workId = seenTracking.parseWorkId();
      if (workId) {
        const meta     = seenTracking.parseWorkMeta();
        const progress = getProgress(workId);
        const isReturn = !!progress?.chapter;

        seenTracking.recordVisit(workId, { ...meta, ...(progress ? {
          chapter:       progress.chapter,
          chapterId:     progress.chapterId,
          chapterHref:   progress.chapterHref,
          totalChapters: progress.totalChapters,
        } : {}) });

        if (meta.chapter) {
          saveProgress(workId, {
            chapter:       meta.chapter,
            chapterId:     meta.chapterId,
            chapterHref:   meta.chapterHref,
            totalChapters: meta.totalChapters,
            title:         meta.title,
            author:        meta.author,
          });
        }

        // document.body peut ne pas encore exister quand ce module boote —
        // sans ce report, injectFloatingBadge()/showResumeToast() plantaient
        // (Cannot read properties of null), constaté sur plusieurs modules
        // similaires en test.
        onReady(() => {
          if (!active) return;
          if (isReturn && progress.chapter) {
            readingProgress.showResumeToast(progress);
            readingProgress.showResumeBanner(workId, progress);
          }

          readingProgress.injectFloatingBadge();
          readingProgress.injectBookmarkControls(workId);
          readingProgress.setupScrollTracking(workId);
          readingProgress.schedulePositionMarker(workId, getProgress(workId));
        });
      }
    }

    if (isListingPage()) {
      visualMarkers.setup();
      seenTracking.setup();
    }

    if (isHomePage() && cfg('continueReadingWidget') !== false) {
      viewHistory.injectContinueReadingWidget();
    }

    return function cleanup () {
      active = false;
      seenTracking.teardown();
      visualMarkers.teardown();
      readingProgress.cleanup();
      viewHistory.removeContinueReadingWidget();
      viewHistory.teardown();
      document.documentElement.style.removeProperty('--ao3h-rt-seen-opacity');
      document.documentElement.classList.remove('ao3h-rt-hide-history-clear', 'ao3h-rt-hide-progress-clear');
      delete W.AO3H_ReadingTracker;
    };
  }
);
