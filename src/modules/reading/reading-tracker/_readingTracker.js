/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Tracker Module Coordinator
    Module ID: readingTracker
    Display Name: Reading Tracker
    Tab: Reading

    Seen Works Marker:
        seenMode (mark|hide), exceptBookmarks, exceptSubscribed, exceptMFL
        Fades or hides already-opened works in listings.

    History:
        Records work-page visits in localStorage (LRU cap 2000).
        ao3h:rt:history -- array of { id, title, author, href, seenAt,
                           chapter, chapterId, chapterHref, totalChapters,
                           lastReadAt, progress }

    Reading Progress:
        Auto-saves scroll position + chapter (debounced 2s).
        ao3h:rt:progress:{workId} -- { chapter, chapterId, chapterHref,
                                       totalChapters, scrollY, progress,
                                       lastReadAt, title, author }

    Public API (W.AO3H_ReadingTracker):
        getProgress(workId), markSeen(workId), getHistory()

    Submodules (imported directly as ES modules):
        ./seenTracking.js    -- work visit recording, updated-since badges (listing pages)
        ./visualMarkers.js   -- seen marks, chapter badges (listing pages)
        ./readingProgress.js -- scroll tracking, progress badge, position marker, resume banner (work pages)
        ./viewHistory.js     -- history clear/export/import, panel actions

    Integration (loose coupling):
        chapterNavigation reads W.AO3H_ReadingTracker?.getProgress(workId) (Étape 237)
        readingDashboard, readingTimeline, notificationCenter — migrés (Phase 23), lisent
        les données via clés localStorage / bridges window (conservés jusqu'à la Phase 26)
        backupAndSync — migré (Phase 24, étape 291), lit les mêmes clés localStorage

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet, lsDel } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';
import styles from './readingTracker.css?inline';

import { SeenTracking } from './seenTracking.js';
import { VisualMarkers } from './visualMarkers.js';
import { ReadingProgress } from './readingProgress.js';
import { ViewHistory } from './viewHistory.js';

css(styles, 'ao3h-readingTracker');

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'readingTracker';
const LOG = `[AO3H][${MOD}]`;

// ── Defaults ──────────────────────────────────────────────────────────────
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
};

const cfg = makeCfg(MOD, DEFAULTS);

// ── Route guards ──────────────────────────────────────────────────────────

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

// ── Storage ───────────────────────────────────────────────────────────────
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

// ── Utilities ─────────────────────────────────────────────────────────────
function relativeTime (ts) {
  if (!ts) return null;
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function sanitizeHref (href) {
  if (!href) return '#';
  if (href.startsWith('/') || href.startsWith(location.origin)) return href;
  return '#';
}

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Reading Tracker', enabledByDefault: false },
  async function init () {
    // ── Public API ────────────────────────────────────────────────────────
    W.AO3H_ReadingTracker = {
      getProgress,
      markSeen: null,
      getHistory,
    };

    // ── Apply config-driven CSS values ──────────────────────────────────────
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

        if (isReturn && progress.chapter) {
          readingProgress.showResumeToast(progress);
          readingProgress.showResumeBanner(workId, progress);
        }

        readingProgress.injectFloatingBadge();
        readingProgress.setupScrollTracking(workId);
        readingProgress.schedulePositionMarker(workId, getProgress(workId));
      }
    }

    if (isListingPage()) {
      visualMarkers.setup();
      seenTracking.setup();
    }

    return function cleanup () {
      seenTracking.teardown();
      visualMarkers.teardown();
      readingProgress.cleanup();
      viewHistory.teardown();
      document.documentElement.style.removeProperty('--ao3h-rt-seen-opacity');
      document.documentElement.classList.remove('ao3h-rt-hide-history-clear', 'ao3h-rt-hide-progress-clear');
      delete W.AO3H_ReadingTracker;
    };
  }
);
