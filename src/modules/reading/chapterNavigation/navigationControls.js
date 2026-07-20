/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Chapter Navigation › Navigation Controls

Provides sticky work navigation, a chapter-position label, last-chapter caching,
and previous or next chapter keyboard actions.

Notes

- Sticky navigation is opt-in through the parent configuration.
- Keyboard shortcuts register through the optional shared shortcut API.
- The coordinator invokes each teardown method during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { getWorkTitle } from '../../../../lib/ao3/work-page.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

export class NavigationControls {
  /** @param {{ NS, cfg, lsGet, lsSet, SK_LASTCHAP, workId, helpers: typeof import('./_chapterNavigation.js').chapterNavigationHelpers }} opts */
  constructor ({ NS, cfg, lsGet, lsSet, SK_LASTCHAP, workId, helpers }) {
    this.NS         = NS;
    this.cfg        = cfg;
    this.lsGet      = lsGet;
    this.lsSet      = lsSet;
    this.SK_LASTCHAP = SK_LASTCHAP;
    this.workId      = workId;
    this.helpers     = helpers;
    this._stickyCls  = `${NS}-sticky-nav-active`;
    this._labelId    = `${NS}-chapidx-label`;
    this._breadcrumbId = `${NS}-chapter-breadcrumb`;
    this._originalTitle = null;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — STICKY NAVIGATION AND CHAPTER LABEL
  ═════════════════════════════════════════════════════════════════════════ */

  setupStickyNav () {
    if (!this.cfg('stickyNav')) return;
    const wrapper = document.querySelector('.work') || document.getElementById('main');
    if (wrapper) wrapper.classList.add(this._stickyCls);
  }

  teardownStickyNav () {
    document.querySelectorAll(`.${this._stickyCls}`)
      .forEach(el => el.classList.remove(this._stickyCls));
  }

  _getChapterInfo () {
    const dd = document.querySelector('dd.chapters');
    return dd ? this.helpers.parseChapterInfo(dd.textContent) : null;
  }

  setupChapterIndexLabel () {
    if (document.getElementById(this._labelId)) return;
    const info = this._getChapterInfo();
    if (!info) return;
    const indexList = document.getElementById('chapter_index');
    if (!indexList) return;
    const label     = document.createElement('span');
    label.id        = this._labelId;
    label.className = `${this.NS}-chapidx-label`;
    label.textContent = `Chapter ${info.current} of ${info.total}`;
    indexList.insertAdjacentElement('beforebegin', label);
  }

  teardownChapterIndexLabel () {
    document.getElementById(this._labelId)?.remove();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — LAST-CHAPTER CACHE
  ═════════════════════════════════════════════════════════════════════════ */

  cacheLastChapter (workId) {
    const select = document.querySelector('select#selected_id');
    if (!select || select.options.length < 2) return;
    const last = select.options[select.options.length - 1];
    this.lsSet(this.SK_LASTCHAP(workId), { id: last.value, num: select.options.length });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BREADCRUMB
  ═════════════════════════════════════════════════════════════════════════ */

  setupBreadcrumb () {
    if (!this.cfg('showBreadcrumb')) return;
    if (document.getElementById(this._breadcrumbId)) return;
    const info = this._getChapterInfo();
    if (!info) return;
    const opt = document.querySelector('select#selected_id option[selected]');
    const title = (opt?.textContent || '').replace(/^\d+\.\s*/, '').trim();
    const el = document.createElement('div');
    el.id = this._breadcrumbId;
    el.className = `${this.NS}-chapter-breadcrumb`;
    el.textContent = this.helpers.buildBreadcrumbText(getWorkTitle(), info.current, title);
    const anchor = document.getElementById('workskin');
    anchor?.insertAdjacentElement('afterbegin', el);
  }

  teardownBreadcrumb () {
    document.getElementById(this._breadcrumbId)?.remove();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — TAB TITLE
  ═════════════════════════════════════════════════════════════════════════ */

  setupTabTitle () {
    if (!this.cfg('tabTitleChapter')) return;
    const info = this._getChapterInfo();
    if (!info) return;
    this._originalTitle = document.title;
    document.title = this.helpers.prependChapterToTitle(document.title, info.current, info.total);
  }

  teardownTabTitle () {
    if (this._originalTitle !== null) {
      document.title = this._originalTitle;
      this._originalTitle = null;
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — EMPHASIZED CHAPTER TITLE
  ═════════════════════════════════════════════════════════════════════════ */

  setupEmphasis () {
    if (!this.cfg('emphasizeChapterTitle')) return;
    document.querySelector('#workskin .chapter .title, #workskin .preface h3.title')
      ?.classList.add(`${this.NS}-chapter-title-emphasized`);
  }

  teardownEmphasis () {
    document.querySelectorAll(`.${this.NS}-chapter-title-emphasized`)
      .forEach(el => el.classList.remove(`${this.NS}-chapter-title-emphasized`));
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — NEXT-CHAPTER PREFETCH
  ═════════════════════════════════════════════════════════════════════════ */

  setupPrefetch () {
    if (!this.cfg('prefetchNextChapter')) return;
    const next = document.querySelector('ul.work.navigation.actions li.chapter.next a');
    const href = next?.getAttribute('href');
    if (!href) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.className = `${this.NS}-chapter-prefetch`;
    document.head.appendChild(link);
  }

  teardownPrefetch () {
    document.querySelectorAll(`.${this.NS}-chapter-prefetch`).forEach(el => el.remove());
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — CHAPTER SHORTCUTS
  ═════════════════════════════════════════════════════════════════════════ */

  _readChapters () {
    const select = document.querySelector('select#selected_id');
    if (!select) return [];
    return this.helpers.parseChapterOptions(Array.from(select.options).map(o => ({
      value: o.value, text: o.textContent, selected: o.selected,
    })));
  }

  _lastReadNum () {
    return this.helpers.getReadingProgress(this.workId)?.chapter ?? null;
  }

  jumpToFirstUnread () {
    const chapters = this._readChapters();
    const target = this.helpers.firstUnreadChapter(chapters, this._lastReadNum());
    if (target && this.workId) location.href = `/works/${this.workId}/chapters/${target.id}`;
  }

  jumpToLastChapter () {
    const chapters = this._readChapters();
    const last = chapters[chapters.length - 1];
    if (last && this.workId) location.href = `/works/${this.workId}/chapters/${last.id}`;
  }

  registerKeyboardShortcuts (MOD) {
    try {
      W.AO3H_KeyboardShortcuts?.register?.(MOD, [
        { key: 'ArrowLeft',  ctrlKey: true, label: 'Previous chapter', action: () => this.navPrev() },
        { key: 'ArrowRight', ctrlKey: true, label: 'Next chapter',     action: () => this.navNext() },
        { key: 'Home', ctrlKey: true, shiftKey: true, label: 'Jump to first unread chapter', action: () => this.jumpToFirstUnread() },
        { key: 'End',  ctrlKey: true, shiftKey: true, label: 'Jump to last chapter',          action: () => this.jumpToLastChapter() },
      ]);
    } catch {}
  }

  unregisterKeyboardShortcuts (MOD) {
    try { W.AO3H_KeyboardShortcuts?.unregister?.(MOD); } catch {}
  }

  navPrev () {
    document.querySelector('ul.work.navigation.actions li.chapter.prev a')?.click();
  }

  navNext () {
    document.querySelector('ul.work.navigation.actions li.chapter.next a')?.click();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// The coordinator constructs this helper and calls its teardown methods.
