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
      getReadingSpeed: ReadingProgress.getReadingSpeed,
    };

    document.documentElement.style.setProperty('--ao3h-rt-seen-opacity', cfg('seenWorksOpacity') ?? 0.4);
    if (cfg('historyClearAll') === false) document.documentElement.classList.add('ao3h-rt-hide-history-clear');
    if (cfg('showClearProgressButton') === false) document.documentElement.classList.add('ao3h-rt-hide-progress-clear');

    const seenTracking    = new SeenTracking({ NS, cfg, getHistory, saveHistory, relativeTime });
    W.AO3H_ReadingTracker.markSeen = (id) => seenTracking.markSeen(id);
    const visualMarkers   = new VisualMarkers({ NS, cfg, getHistory, getProgress });
    const readingProgress = new ReadingProgress({ NS, cfg, saveProgress, getProgress, relativeTime, sanitizeHref });
    const viewHistory     = new ViewHistory({ NS, LOG, isHistoryPage, getHistory, saveHistory, clearProgress });

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
