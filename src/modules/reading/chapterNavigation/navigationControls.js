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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

export class NavigationControls {
  /** @param {{ NS, cfg, lsSet, SK_LASTCHAP }} opts */
  constructor ({ NS, cfg, lsSet, SK_LASTCHAP }) {
    this.NS         = NS;
    this.cfg        = cfg;
    this.lsSet      = lsSet;
    this.SK_LASTCHAP = SK_LASTCHAP;
    this._stickyCls  = `${NS}-sticky-nav-active`;
    this._labelId    = `${NS}-chapidx-label`;
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
    if (!dd) return null;
    const m = (dd.textContent || '').trim().match(/^(\d+)\/(\d+)$/);
    if (!m) return null;
    const current = parseInt(m[1], 10);
    const total   = parseInt(m[2], 10);
    return total <= 1 ? null : { current, total };
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
     FEATURE — CHAPTER SHORTCUTS
  ═════════════════════════════════════════════════════════════════════════ */

  registerKeyboardShortcuts (MOD) {
    try {
      W.AO3H_KeyboardShortcuts?.register?.(MOD, [
        { key: 'ArrowLeft',  ctrlKey: true, label: 'Previous chapter', action: () => this.navPrev() },
        { key: 'ArrowRight', ctrlKey: true, label: 'Next chapter',     action: () => this.navNext() },
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
