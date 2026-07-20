/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Chapter Navigation Coordinator

    Module ID: chapterNavigation
    Display Name: Chapter Navigation
    Tab: Reading

    Purpose

    Coordinates work-page chapter controls, automatic scrolling, chapter word
    counts, and quick reading links on listing blurbs.

    Submodules

    - navigationControls.js: sticky navigation, labels, shortcuts, breadcrumb,
      tab title, chapter-title emphasis, next-chapter prefetch, and cache
    - blurbNavigation.js: Start, Continue, and Last Chapter listing links
    - autoScroll.js: configurable automatic work-page scrolling
    - chapterWordCount.js: per-chapter prose word-count badges
    - chaptersPanel.js: floating "📑 Chapters" search/mini-map/marks panel

    Notes

    - Last-chapter destinations are cached per work in local storage.
    - Reading progress and keyboard shortcuts use optional runtime bridges.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { extractWorkIdFromHref, isWorkPage, isListingPage } from '../../../../lib/ao3/parsers.js';
import styles from './chapterNavigation.css?inline';

import { NavigationControls } from './navigationControls.js';
import { AutoScroll } from './autoScroll.js';
import { BlurbNavigation } from './blurbNavigation.js';
import { ChaptersPanel } from './chaptersPanel.js';
import './chapterWordCount.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-chapterNavigation');

const W   = getGlobalWindow();
const MOD = 'chapterNavigation';
const NS  = 'ao3h';

const DEFAULTS = {
  stickyNav:               false,
  resumeButton:            true,
  lastChapterBtn:          true,
  autoScrollSpeed:         50,
  autoScrollAutoAdvance:   false,
  autoScrollShowControls:  true,
  chapterPanel:            true,
  showBreadcrumb:          true,
  tabTitleChapter:         false,
  emphasizeChapterTitle:   false,
  prefetchNextChapter:     true,
};

const cfg = makeCfg(MOD, DEFAULTS);

const SK_LASTCHAP = (id) => `ao3h:cn:lastchap:${id}`;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function isMultiChapter () { return !!document.querySelector('select#selected_id'); }

export function parseChapterOptions (options) {
  if (!Array.isArray(options)) return [];
  return options.map((option, index) => {
    const text = String(option.text ?? '').trim();
    const match = text.match(/^(\d+)\.\s*(.*)$/);
    return {
      id: String(option.value),
      num: match ? parseInt(match[1], 10) : index + 1,
      title: match && match[2] ? match[2].trim() : '',
      selected: Boolean(option.selected),
    };
  });
}
export function filterChapters (chapters, query) {
  const normalized = String(query ?? '').trim().toLowerCase();
  if (!normalized) return chapters;
  return chapters.filter(chapter =>
    String(chapter.num).includes(normalized) || chapter.title.toLowerCase().includes(normalized)
  );
}
/**
 * @template {{ id: string, num: number }} T
 * @param {T[]} chapters
 * @param {{ currentId?: string, lastReadNum?: number|null }} [opts]
 * @returns {(T & { state: string })[]}
 */
export function buildChapterStates (chapters, { currentId, lastReadNum } = {}) {
  return chapters.map(chapter => ({
    ...chapter,
    state: chapter.id === currentId
      ? 'current'
      : (lastReadNum != null && chapter.num <= lastReadNum ? 'read' : 'unread'),
  }));
}
export function firstUnreadChapter (chapters, lastReadNum) {
  if (!chapters.length) return null;
  if (lastReadNum == null) return chapters[0];
  return chapters.find(chapter => chapter.num > lastReadNum) || chapters[chapters.length - 1];
}
export function addRecentEntry (list, entry, cap = 8) {
  const rest = (Array.isArray(list) ? list : []).filter(item => item.id !== entry.id);
  return [entry, ...rest].slice(0, cap);
}
export function buildBreadcrumbText (workTitle, num, title) {
  const parts = [workTitle || 'Work', `Chapter ${num}`];
  if (title) parts.push(title);
  return parts.join(' > ');
}
export function prependChapterToTitle (originalTitle, num, total) {
  const position = total ? `Ch. ${num}/${total}` : `Ch. ${num}`;
  return originalTitle ? `${position} · ${originalTitle}` : position;
}
/** Parses AO3's "X/Y" chapter-count text (e.g. `dd.chapters`'s textContent)
 *  into `{ current, total }`, or null for single-chapter works or unparseable text. */
export function parseChapterInfo (text) {
  const m = String(text ?? '').trim().match(/^(\d+)\/(\d+)$/);
  if (!m) return null;
  const current = parseInt(m[1], 10);
  const total   = parseInt(m[2], 10);
  return total <= 1 ? null : { current, total };
}
/** Reading progress for a work: prefers readingTracker's live API (if that
 *  soft dependency is active), falling back to its own last-known cache. */
export function getReadingProgress (workId) {
  try {
    return W.AO3H_ReadingTracker?.getProgress?.(workId) || lsGet(`ao3h:rt:progress:${workId}`);
  } catch { return null; }
}

export const chapterNavigationHelpers = {
  parseChapterOptions, filterChapters, buildChapterStates, firstUnreadChapter,
  addRecentEntry, buildBreadcrumbText, prependChapterToTitle,
  parseChapterInfo, getReadingProgress,
};

let navCtrl   = null;
let autoScroll = null;
let chaptersPanel = null;

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Chapter Navigation', enabledByDefault: false },
  async function init () {
    W.AO3H_ChapterNavigation = {
      navPrev: () => navCtrl?.navPrev(),
      navNext: () => navCtrl?.navNext(),
      getChapterInfo: () => document.querySelector('dd.chapters')?.textContent ?? null,
    };

    if (isWorkPage()) {
      const workId = extractWorkIdFromHref(location.pathname);
      const diOpts = { NS, cfg, lsGet, lsSet, SK_LASTCHAP, workId };

      navCtrl = new NavigationControls({ ...diOpts, helpers: chapterNavigationHelpers });

      if (isMultiChapter()) {
        navCtrl.setupStickyNav();
        navCtrl.setupChapterIndexLabel();
        if (workId) navCtrl.cacheLastChapter(workId);

        chaptersPanel = new ChaptersPanel({ NS, cfg, workId, helpers: chapterNavigationHelpers });
        chaptersPanel.setup();
      }

      navCtrl.setupBreadcrumb();
      navCtrl.setupTabTitle();
      navCtrl.setupEmphasis();
      navCtrl.setupPrefetch();
      navCtrl.registerKeyboardShortcuts(MOD);

      autoScroll = new AutoScroll(diOpts);
      autoScroll.setup();
    }

    let blurbNav = null;
    if (isListingPage()) {
      blurbNav = new BlurbNavigation({ NS, cfg, lsGet, SK_LASTCHAP, helpers: chapterNavigationHelpers });
      blurbNav.setup();
    }

    return function cleanup () {
      autoScroll?.teardown();
      chaptersPanel?.teardown();
      navCtrl?.teardownStickyNav();
      navCtrl?.teardownChapterIndexLabel();
      navCtrl?.teardownBreadcrumb();
      navCtrl?.teardownTabTitle();
      navCtrl?.teardownEmphasis();
      navCtrl?.teardownPrefetch();
      navCtrl?.unregisterKeyboardShortcuts(MOD);
      blurbNav?.teardown();
      delete W.AO3H_ChapterNavigation;
      navCtrl   = null;
      autoScroll = null;
      chaptersPanel = null;
    };
  }
);
