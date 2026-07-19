/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Tracker › Visual Markers

Marks or hides previously visited listing works and adds saved chapter-progress
badges to resumable blurbs.

Notes

- Bookmarked, subscribed, and Marked for Later works can be excluded.
- Hide mode includes a temporary reveal control and hidden-work count.
- All injected classes, counters, and badges are removed by `teardown()`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const SEEN_MODE_CLASS = {
  mark:        'ao3h-seen-mark',
  hide:        'ao3h-seen-hidden',
  blur:        'ao3h-seen-blur',
  strikethrough: 'ao3h-seen-strike',
};

// Marker state is stored on each helper instance.

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SEEN-WORK MARKERS
═══════════════════════════════════════════════════════════════════════════ */

export class VisualMarkers {
  /** @param {{ NS, cfg, getHistory, getProgress }} opts */
  constructor ({ NS, cfg, getHistory, getProgress }) {
    this.NS          = NS;
    this.cfg         = cfg;
    this.getHistory  = getHistory;
    this.getProgress = getProgress;
    this._hiddenCount = 0;
  }

  _buildExceptionSet () {
    const { cfg } = this;
    const exceptions = new Set();
    if (cfg('exceptBookmarks')) {
      document.querySelectorAll('[data-bookmarked="true"], .own.bookmark').forEach(el => {
        const m = (el.closest('li.work.blurb, div.work.blurb')?.id || '').match(/^work_(\d+)$/);
        if (m) exceptions.add(m[1]);
      });
    }
    if (cfg('exceptMFL')) {
      document.querySelectorAll('[data-mfl="true"], .own.reading').forEach(el => {
        const m = (el.closest('li.work.blurb, div.work.blurb')?.id || '').match(/^work_(\d+)$/);
        if (m) exceptions.add(m[1]);
      });
    }
    if (cfg('exceptSubscribed')) {
      document.querySelectorAll('input[value="Unsubscribe"]').forEach(el => {
        const m = (el.closest('li.work.blurb, div.work.blurb')?.id || '').match(/^work_(\d+)$/);
        if (m) exceptions.add(m[1]);
      });
    }
    return exceptions;
  }

  _injectHideCounter (count) {
    const { NS } = this;
    const existing = document.getElementById(`${NS}-hide-counter`);
    if (existing) { existing.textContent = `${count} work${count !== 1 ? 's' : ''} hidden as seen`; return; }
    const main = document.getElementById('main');
    if (!main) return;
    const bar         = document.createElement('p');
    bar.id            = `${NS}-hide-counter`;
    bar.className     = `${NS}-hide-counter`;
    bar.textContent   = `${count} work${count !== 1 ? 's' : ''} hidden as seen`;
    const revealBtn   = document.createElement('button');
    revealBtn.className   = `${NS}-reveal-btn`;
    revealBtn.textContent = 'Reveal temporarily';
    revealBtn.addEventListener('click', () => {
      document.querySelectorAll(`.${NS}-seen-hidden`).forEach(el => {
        el.classList.remove(`${NS}-seen-hidden`);
        el.classList.add(`${NS}-seen-mark`);
      });
      bar.remove();
    });
    bar.appendChild(revealBtn);
    main.insertAdjacentElement('afterbegin', bar);
  }

  applySeenMarks () {
    const { NS, cfg, getHistory } = this;
    const mode       = cfg('seenMode');
    const history    = getHistory();
    const seenIds    = new Set(history.map(e => e.id));
    const exceptions = this._buildExceptionSet();
    this._hiddenCount = 0;
    document.querySelectorAll('li.work.blurb, div.work.blurb').forEach(blurb => {
      const m = (blurb.id || '').match(/^work_(\d+)$/);
      if (!m) return;
      const id = m[1];
      if (!seenIds.has(id) || exceptions.has(id)) return;
      if (mode === 'hide') {
        blurb.classList.add(SEEN_MODE_CLASS.hide);
        this._hiddenCount++;
      } else {
        blurb.classList.add(SEEN_MODE_CLASS[mode] || SEEN_MODE_CLASS.mark);
        const heading = blurb.querySelector('h4.heading');
        if (heading && !heading.querySelector(`.${NS}-seen-badge`)) {
          const badge       = document.createElement('span');
          badge.className   = `${NS}-seen-badge`;
          badge.textContent = '\u{1F441}';
          badge.title       = 'You have read this work';
          heading.appendChild(badge);
        }
      }
    });
    if (mode === 'hide' && this._hiddenCount > 0) this._injectHideCounter(this._hiddenCount);
  }

  removeSeenMarks () {
    const { NS } = this;
    const allClasses = Object.values(SEEN_MODE_CLASS);
    document.querySelectorAll(`.${allClasses.join(', .')}, .${NS}-seen-badge`).forEach(el => {
      el.classList.remove(...allClasses);
      if (el.classList.contains(`${NS}-seen-badge`)) el.remove();
    });
    document.getElementById(`${NS}-hide-counter`)?.remove();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — CHAPTER-PROGRESS BADGES
  ═════════════════════════════════════════════════════════════════════════ */

  applyChapterBadges () {
    const { NS, cfg, getProgress } = this;
    if (!cfg('chapterBadge')) return;
    document.querySelectorAll('li.work.blurb, div.work.blurb').forEach(blurb => {
      const m = (blurb.id || '').match(/^work_(\d+)$/);
      if (!m) return;
      const workId   = m[1];
      const progress = getProgress(workId);
      if (!progress?.chapter) return;
      const chapDd    = blurb.querySelector('dd.chapters');
      const chapText  = chapDd?.textContent.trim();
      const chapMatch = chapText?.match(/^(\d+)\/(\d+|\?)$/);
      const total     = chapMatch ? chapMatch[2] : '?';
      if (chapMatch && progress.chapter >= parseInt(chapMatch[1], 10)) return;
      const heading = blurb.querySelector('h4.heading');
      if (!heading || heading.querySelector(`.${NS}-ch-badge`)) return;
      const badge       = document.createElement('a');
      badge.className   = `${NS}-ch-badge`;
      badge.textContent = `Ch ${progress.chapter}/${total}`;
      badge.title       = 'Resume reading';
      badge.href        = progress.chapterHref || `/works/${workId}`;
      heading.appendChild(badge);
    });
  }

  removeChapterBadges () {
    document.querySelectorAll(`.${this.NS}-ch-badge`).forEach(el => el.remove());
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BULK "MARK AS SEEN"
  ═════════════════════════════════════════════════════════════════════════ */

  setupBulkMarking () {
    const { NS, cfg } = this;
    if (!cfg('bulkMarkSeen')) return;

    const blurbs = [...document.querySelectorAll('li.work.blurb, div.work.blurb')]
      .filter(b => /^work_\d+$/.test(b.id || ''));
    if (!blurbs.length) return;

    blurbs.forEach(blurb => {
      if (blurb.querySelector(`.${NS}-bulk-cb`)) return;
      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = `${NS}-bulk-cb`;
      cb.title     = 'Select to mark as seen';
      blurb.querySelector('h4.heading')?.prepend(cb);
    });

    if (document.getElementById(`${NS}-bulk-mark-bar`)) return;
    const main = document.getElementById('main');
    if (!main) return;
    const bar = document.createElement('p');
    bar.id        = `${NS}-bulk-mark-bar`;
    bar.className = `${NS}-bulk-mark-bar`;
    const btn = document.createElement('button');
    btn.type        = 'button';
    btn.textContent = 'Mark selected as seen';
    btn.addEventListener('click', () => {
      const checked = document.querySelectorAll(`.${NS}-bulk-cb:checked`);
      checked.forEach(cb => {
        const workId = cb.closest('li.work.blurb, div.work.blurb')?.id.match(/^work_(\d+)$/)?.[1];
        if (workId) W.AO3H_ReadingTracker?.markSeen?.(workId);
      });
      this.applySeenMarks();
    });
    bar.appendChild(btn);
    main.insertAdjacentElement('afterbegin', bar);
    this._bulkBar = bar;
  }

  removeBulkMarking () {
    const { NS } = this;
    document.querySelectorAll(`.${NS}-bulk-cb`).forEach(el => el.remove());
    document.getElementById(`${NS}-bulk-mark-bar`)?.remove();
    this._bulkBar = null;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — KEYBOARD SHORTCUT (reveal seen works temporarily)
  ═════════════════════════════════════════════════════════════════════════ */

  registerKeyboardShortcut () {
    if (!this.cfg('keyboardToggleSeen')) return;
    this._kbAction = 'readingTracker:toggleSeen';
    W.AO3H_Keyboard?.register?.(this._kbAction, 'v', () => {
      const active = document.documentElement.classList.toggle(`${this.NS}-rt-reveal-seen`);
      if (!active) return;
      document.querySelectorAll(`.${this.NS}-seen-hidden`).forEach(el => {
        el.classList.remove(`${this.NS}-seen-hidden`);
      });
    });
  }

  unregisterKeyboardShortcut () {
    if (this._kbAction) W.AO3H_Keyboard?.unregister?.(this._kbAction);
    this._kbAction = null;
    document.documentElement.classList.remove(`${this.NS}-rt-reveal-seen`);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  setup () {
    this.applySeenMarks();
    this.applyChapterBadges();
    this.setupBulkMarking();
    this.registerKeyboardShortcut();
  }

  teardown () {
    this.removeSeenMarks();
    this.removeChapterBadges();
    this.removeBulkMarking();
    this.unregisterKeyboardShortcut();
  }
}
