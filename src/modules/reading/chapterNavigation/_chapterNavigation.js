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
import { extractWorkIdFromHref, isWorkPage } from '../../../../lib/ao3/parsers.js';
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
function isListingPage () {
  return (
    /^\/works($|\?)/.test(location.pathname)               ||
    /^\/tags\/[^/]+\/works/.test(location.pathname)       ||
    /^\/users\/[^/]+\/bookmarks/.test(location.pathname)  ||
    /^\/users\/[^/]+\/works/.test(location.pathname)      ||
    /^\/bookmarks(\/|$|\?)/.test(location.pathname)
  );
}

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

      navCtrl = new NavigationControls(diOpts);

      if (isMultiChapter()) {
        navCtrl.setupStickyNav();
        navCtrl.setupChapterIndexLabel();
        if (workId) navCtrl.cacheLastChapter(workId);

        chaptersPanel = new ChaptersPanel({ NS, cfg, workId });
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
      blurbNav = new BlurbNavigation({ NS, cfg, lsGet, SK_LASTCHAP });
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
