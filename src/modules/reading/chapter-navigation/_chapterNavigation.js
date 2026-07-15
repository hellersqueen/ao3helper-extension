/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Chapter Navigation Module Coordinator
    Module ID: chapterNavigation
    Display Name: Chapter Navigation
    Tab: Reading

    Submodules (imported directly as ES modules):
        ./navigationControls.js -- sticky nav, chapter label, shortcuts, cache
        ./blurbNavigation.js    -- Start/Continue/Last buttons on listings
        ./autoScroll.js         -- auto-scroll widget (work pages)

    Registered child module (register(), parent: 'chapterNavigation'):
        chapterWordCount  -- "~ X.XK words" badge per chapter

    Storage:
        ao3h:cn:lastchap:{workId} -- { id, num } written on work-page load

    Integration (loose coupling):
        W.AO3H_ReadingTracker?.getProgress(workId)
        W.AO3H_KeyboardShortcuts (Ctrl+Left / Ctrl+Right) — migré (Phase 21,
        navigate/keyboard-shortcuts) ; le bridge window reste le contrat jusqu'à la Phase 26

    Config keys:
        stickyNav, resumeButton, lastChapterBtn
        autoScrollSpeed, autoScrollAutoAdvance, autoScrollShowControls

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './chapterNavigation.css?inline';

import { NavigationControls } from './navigationControls.js';
import { AutoScroll } from './autoScroll.js';
import { BlurbNavigation } from './blurbNavigation.js';
import './chapterWordCount.js';

css(styles, 'ao3h-chapterNavigation');

const W   = getGlobalWindow();
const MOD = 'chapterNavigation';
const NS  = 'ao3h';

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  stickyNav:               false,
  resumeButton:            true,
  lastChapterBtn:          true,
  autoScrollSpeed:         50,
  autoScrollAutoAdvance:   false,
  autoScrollShowControls:  true,
};

const cfg = makeCfg(MOD, DEFAULTS);

// ── Storage helpers ───────────────────────────────────────────────────────
const SK_LASTCHAP = (id) => `ao3h:cn:lastchap:${id}`;

// ── Route guards ──────────────────────────────────────────────────────────
function isWorkPage ()    { return /^\/works\/\d+/.test(location.pathname); }
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

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Chapter Navigation', enabledByDefault: false },
  async function init () {
    // ── Public API ────────────────────────────────────────────────────────
    W.AO3H_ChapterNavigation = {
      navPrev: () => navCtrl?.navPrev(),
      navNext: () => navCtrl?.navNext(),
      getChapterInfo: () => document.querySelector('dd.chapters')?.textContent ?? null,
    };

    const diOpts = { NS, cfg, lsGet, lsSet, SK_LASTCHAP };

    if (isWorkPage()) {
      const workIdMatch = location.pathname.match(/\/works\/(\d+)/);
      const workId = workIdMatch?.[1];

      navCtrl = new NavigationControls(diOpts);

      if (isMultiChapter()) {
        navCtrl.setupStickyNav();
        navCtrl.setupChapterIndexLabel();
        if (workId) navCtrl.cacheLastChapter(workId);
      }

      navCtrl.registerKeyboardShortcuts(MOD);

      // AutoScroll (work pages only)
      autoScroll = new AutoScroll(diOpts);
      autoScroll.setup();
    }

    let blurbNav = null;
    if (isListingPage()) {
      blurbNav = new BlurbNavigation(diOpts);
      blurbNav.setup();
    }

    return function cleanup () {
      autoScroll?.teardown();
      navCtrl?.teardownStickyNav();
      navCtrl?.teardownChapterIndexLabel();
      navCtrl?.unregisterKeyboardShortcuts(MOD);
      blurbNav?.teardown();
      delete W.AO3H_ChapterNavigation;
      navCtrl   = null;
      autoScroll = null;
    };
  }
);
