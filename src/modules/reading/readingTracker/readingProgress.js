/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Tracker › Reading Progress

Persists work-page scroll progress and provides resume banners, notifications,
floating progress feedback, and last-position markers.

Notes

- Scroll persistence uses a two-second debounce and flushes when the page hides.
- Resume destinations are sanitized before insertion into the banner.
- All timers, markers, badges, and listeners are removed during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { progressMilestonesCrossed, donutDashArray, computeReadingSpeed } from './readingTrackerHelpers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const SK_SPEED = 'ao3h:rt:readingSpeed'; // { wordsTotal, msTotal } rolling accumulator
const DONUT_CIRCUMFERENCE = 100.5; // 2*pi*16, matches the SVG r=16 below

export class ReadingProgress {
  /** @param {{ NS, cfg, saveProgress, getProgress, relativeTime, sanitizeHref }} opts */
  constructor ({ NS, cfg, saveProgress, getProgress, relativeTime, sanitizeHref }) {
    this.NS             = NS;
    this.cfg            = cfg;
    this.saveProgress   = saveProgress;
    this.getProgress    = getProgress;
    this.relativeTime   = relativeTime;
    this.sanitizeHref   = sanitizeHref;
    this._BANNER_ID     = `${NS}-resume-banner`;
    this._PROG_BADGE_ID = `${NS}-progress-badge`;
    this._MARKER_CLS    = `${NS}-pos-marker`;
    this._cleanupScroll = null;
    this._saveTimer     = null;
    this._toastTimers   = new Set();
    this._toasts        = new Set();
    this._markerRaf     = null;
    this._milestonesSeen = new Set();
    this._speedSample   = null; // { pct, at, totalWords }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — RESUME FEEDBACK
  ═════════════════════════════════════════════════════════════════════════ */

  showResumeBanner (workId, progress) {
    const { NS, cfg, relativeTime, sanitizeHref, _BANNER_ID } = this;
    if (!cfg('resumeBanner') || document.getElementById(_BANNER_ID)) return;
    const workskin = document.getElementById('workskin');
    if (!workskin) return;
    const ch   = progress.chapter;
    const href = progress.chapterHref
      || (progress.chapterId ? `/works/${workId}/chapters/${progress.chapterId}` : `/works/${workId}`);
    const ago  = cfg('lastReadTime') ? relativeTime(progress.lastReadAt) : null;
    const speed = cfg('readingSpeedTracking') ? ReadingProgress.getReadingSpeed() : null;
    const banner = document.createElement('div');
    banner.id        = _BANNER_ID;
    banner.className = `${NS}-resume-banner`;
    banner.setAttribute('role', 'status');
    banner.innerHTML = `
      <span>📍 Resume at <a href="${sanitizeHref(href)}">Chapter ${ch}</a>${ago ? ` <span class="${NS}-resume-banner-ago">· ${ago}</span>` : ''}${speed ? ` <span class="${NS}-resume-banner-ago">· ~${speed} wpm</span>` : ''}</span>
      <button class="${NS}-resume-banner-dismiss" aria-label="Dismiss">✕</button>
    `;
    banner.querySelector('button').addEventListener('click', () => banner.remove());
    workskin.insertAdjacentElement('beforebegin', banner);
  }

  dismissBanner () { document.getElementById(this._BANNER_ID)?.remove(); }

  injectFloatingBadge () {
    const { NS, cfg, _PROG_BADGE_ID } = this;
    if (!cfg('floatingBadge') || document.getElementById(_PROG_BADGE_ID)) return;
    const style = cfg('progressStyle') || 'badge';
    const badge = document.createElement('div');
    badge.id        = _PROG_BADGE_ID;
    badge.className = `${NS}-progress-badge ${NS}-progress-badge--${style}`;

    if (style === 'donut') {
      badge.innerHTML = `
        <svg viewBox="0 0 36 36" class="${NS}-progress-donut">
          <circle class="${NS}-progress-donut-bg" cx="18" cy="18" r="16" />
          <circle class="${NS}-progress-donut-fill" cx="18" cy="18" r="16"
                   stroke-dasharray="0 ${DONUT_CIRCUMFERENCE}" />
        </svg>
        <span class="${NS}-progress-donut-label">0%</span>`;
    } else if (style === 'bar') {
      badge.innerHTML = `<div class="${NS}-progress-bar-track"><div class="${NS}-progress-bar-fill" style="width:0%"></div></div>`;
      if (cfg('clickToSeek') !== false) {
        badge.addEventListener('click', (e) => {
          const rect = badge.getBoundingClientRect();
          const pct  = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          this._seekToPercent(pct);
        });
        badge.title = 'Click to jump to a position';
        badge.style.cursor = 'pointer';
      }
    } else {
      badge.textContent = '0%';
    }
    document.body.appendChild(badge);
  }

  updateFloatingBadge (pct) {
    const badge = document.getElementById(this._PROG_BADGE_ID);
    if (!badge) return;
    const rounded = Math.round(pct);
    if (badge.classList.contains(`${this.NS}-progress-badge--donut`)) {
      const { dash, gap } = donutDashArray(rounded, DONUT_CIRCUMFERENCE);
      const fill = badge.querySelector(`.${this.NS}-progress-donut-fill`);
      if (fill) fill.setAttribute('stroke-dasharray', `${dash} ${gap}`);
      const label = badge.querySelector(`.${this.NS}-progress-donut-label`);
      if (label) label.textContent = `${rounded}%`;
    } else if (badge.classList.contains(`${this.NS}-progress-badge--bar`)) {
      const fill = badge.querySelector(`.${this.NS}-progress-bar-fill`);
      if (fill) fill.style.width = `${rounded}%`;
    } else {
      badge.textContent = `${rounded}%`;
    }
  }

  removeFloatingBadge () { document.getElementById(this._PROG_BADGE_ID)?.remove(); }

  /** Scrolls the page to approximately the given percent of document height. */
  _seekToPercent (pct) {
    const docHeight = Math.max(document.documentElement.scrollHeight - W.innerHeight, 1);
    W.scrollTo({ top: (pct / 100) * docHeight, behavior: 'smooth' });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — POSITION MARKER AND SCROLL TRACKING
  ═════════════════════════════════════════════════════════════════════════ */

  injectPositionMarker (workId, progress) {
    if (!this.cfg('positionMarker') || !progress?.scrollY) return;
    this.removePositionMarker();
    const userstuff = document.querySelector('.userstuff.module, #workskin .userstuff');
    if (!userstuff) return;
    const paras = userstuff.querySelectorAll('p, div, blockquote');
    let best = null;
    for (const p of paras) {
      const top = p.getBoundingClientRect().top + W.scrollY;
      if (top <= progress.scrollY) best = p;
    }
    if (!best) return;
    const hr = document.createElement('hr');
    hr.className = this._MARKER_CLS;
    hr.setAttribute('aria-label', 'Last read position');
    best.insertAdjacentElement('afterend', hr);
  }

  removePositionMarker () {
    document.querySelectorAll(`.${this._MARKER_CLS}`).forEach(el => el.remove());
  }

  schedulePositionMarker (workId, progress) {
    if (this._markerRaf !== null) W.cancelAnimationFrame(this._markerRaf);
    this._markerRaf = W.requestAnimationFrame(() => {
      this._markerRaf = null;
      this.injectPositionMarker(workId, progress);
    });
  }

  /** Shows a small toast the first time a milestone (25/50/75%) is crossed this session. */
  _maybeShowMilestoneToast (prevPct, newPct) {
    if (!this.cfg('progressMilestones')) return;
    const crossed = progressMilestonesCrossed(prevPct, newPct).filter(m => !this._milestonesSeen.has(m));
    if (!crossed.length) return;
    crossed.forEach(m => this._milestonesSeen.add(m));
    const toast = document.createElement('div');
    toast.className   = `${this.NS}-rt-toast`;
    toast.textContent = `📖 ${crossed[crossed.length - 1]}% read`;
    document.body.appendChild(toast);
    this._toasts.add(toast);
    const removeTimer = setTimeout(() => {
      this._toastTimers.delete(removeTimer);
      this._toasts.delete(toast);
      toast.remove();
    }, 2500);
    this._toastTimers.add(removeTimer);
  }

  /** Records a words/ms sample into the rolling reading-speed accumulator. */
  _recordSpeedSample (pct, totalWords) {
    if (!this.cfg('readingSpeedTracking') || !totalWords) return;
    const now = Date.now();
    if (this._speedSample) {
      const deltaPct   = pct - this._speedSample.pct;
      const deltaMs    = now - this._speedSample.at;
      // Ignore idle gaps (tab left open) and any backward/zero movement.
      if (deltaPct > 0 && deltaMs > 0 && deltaMs < 10 * 60000) {
        const deltaWords = totalWords * (deltaPct / 100);
        let acc = { wordsTotal: 0, msTotal: 0 };
        try { acc = JSON.parse(localStorage.getItem(SK_SPEED) || 'null') || acc; } catch { /* ignore */ }
        acc.wordsTotal += deltaWords;
        acc.msTotal    += deltaMs;
        try { localStorage.setItem(SK_SPEED, JSON.stringify(acc)); } catch { /* unavailable */ }
      }
    }
    this._speedSample = { pct, at: now, totalWords };
  }

  /** @returns {number|null} average words-per-minute from all tracked sessions */
  static getReadingSpeed () {
    try {
      const acc = JSON.parse(localStorage.getItem(SK_SPEED) || 'null');
      if (!acc) return null;
      return computeReadingSpeed([{ words: acc.wordsTotal, ms: acc.msTotal }]);
    } catch { return null; }
  }

  setupScrollTracking (workId) {
    const { saveProgress } = this;
    const userstuff = document.querySelector('.userstuff.module, #workskin .userstuff');
    if (!userstuff) return;
    const totalWords = parseInt((document.querySelector('dl.stats dd.words')?.textContent || '').replace(/,/g, ''), 10) || 0;
    let lastPct = 0;
    const docHeight  = () => Math.max(document.documentElement.scrollHeight - W.innerHeight, 1);
    const getPercent = () => Math.min(100, Math.round((W.scrollY / docHeight()) * 100));
    const saveDebounced = () => {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null;
        const pct = getPercent();
        saveProgress(workId, { scrollY: W.scrollY, progress: pct, lastReadAt: Date.now() });
        this.updateFloatingBadge(pct);
        this._maybeShowMilestoneToast(lastPct, pct);
        this._recordSpeedSample(pct, totalWords);
        lastPct = pct;
      }, 2000);
    };
    const onScroll = () => { this.updateFloatingBadge(getPercent()); saveDebounced(); };
    const onVisibilityHide = () => {
      if (document.visibilityState === 'hidden') {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
        const pct = getPercent();
        saveProgress(workId, { scrollY: W.scrollY, progress: pct, lastReadAt: Date.now() });
      }
    };
    W.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityHide);
    this.updateFloatingBadge(getPercent());
    this._cleanupScroll = () => {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
      W.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityHide);
    };
  }

  showResumeToast (progress) {
    if (!this.cfg('resumeToast')) return;
    const toast = document.createElement('div');
    toast.className = `${this.NS}-rt-toast`;
    toast.textContent = `📍 Welcome back — Chapter ${progress.chapter}`;
    document.body.appendChild(toast);
    this._toasts.add(toast);
    const fadeTimer = setTimeout(() => {
      this._toastTimers.delete(fadeTimer);
      toast.style.opacity = '0';
      const removeTimer = setTimeout(() => {
        this._toastTimers.delete(removeTimer);
        this._toasts.delete(toast);
        toast.remove();
      }, 400);
      this._toastTimers.add(removeTimer);
    }, 4000);
    this._toastTimers.add(fadeTimer);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — MULTIPLE MANUAL BOOKMARKS
  ═════════════════════════════════════════════════════════════════════════ */

  addBookmark (workId, progress) {
    const label = W.prompt('Label for this bookmark (optional):', '') || `${Math.round(progress?.progress || 0)}%`;
    const bookmarks = [...(progress?.bookmarks || []), { scrollY: W.scrollY, label, createdAt: Date.now() }];
    this.saveProgress(workId, { bookmarks });
    return bookmarks;
  }

  removeBookmark (workId, progress, index) {
    const bookmarks = (progress?.bookmarks || []).filter((_, i) => i !== index);
    this.saveProgress(workId, { bookmarks });
    return bookmarks;
  }

  injectBookmarkControls (workId) {
    if (!this.cfg('manualBookmarks')) return;
    const { NS } = this;
    if (document.getElementById(`${NS}-bookmark-controls`)) return;
    const badge = document.getElementById(this._PROG_BADGE_ID);
    if (!badge) return;

    const wrap = document.createElement('div');
    wrap.id        = `${NS}-bookmark-controls`;
    wrap.className = `${NS}-bookmark-controls`;

    const addBtn = document.createElement('button');
    addBtn.type        = 'button';
    addBtn.className   = `${NS}-bookmark-add`;
    addBtn.textContent = '🔖';
    addBtn.title       = 'Add a bookmark here';
    addBtn.addEventListener('click', () => {
      const progress = this.getProgress(workId);
      this.addBookmark(workId, progress);
      renderList();
    });

    const list = document.createElement('ul');
    list.className = `${NS}-bookmark-list`;

    const renderList = () => {
      const progress   = this.getProgress(workId);
      const bookmarks  = progress?.bookmarks || [];
      list.innerHTML   = bookmarks.map((b, i) => `
        <li><a href="#" data-scroll="${b.scrollY}">${b.label}</a>
          <button type="button" class="${NS}-bookmark-remove" data-index="${i}" aria-label="Remove bookmark">✕</button>
        </li>`).join('');
      list.querySelectorAll('a[data-scroll]').forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          W.scrollTo({ top: parseInt(a.dataset.scroll, 10), behavior: 'smooth' });
        });
      });
      list.querySelectorAll(`.${NS}-bookmark-remove`).forEach(btn => {
        btn.addEventListener('click', () => {
          this.removeBookmark(workId, this.getProgress(workId), parseInt(btn.dataset.index, 10));
          renderList();
        });
      });
    };
    renderList();

    wrap.appendChild(addBtn);
    wrap.appendChild(list);
    badge.after(wrap);
  }

  removeBookmarkControls () {
    document.getElementById(`${this.NS}-bookmark-controls`)?.remove();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup () {
    this._cleanupScroll?.();
    this._cleanupScroll = null;
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    this._toastTimers.forEach(timer => clearTimeout(timer));
    this._toastTimers.clear();
    this._toasts.forEach(toast => toast.remove());
    this._toasts.clear();
    if (this._markerRaf !== null) W.cancelAnimationFrame(this._markerRaf);
    this._markerRaf = null;
    this._milestonesSeen.clear();
    this._speedSample = null;
    this.removeFloatingBadge();
    this.removeBookmarkControls();
    this.removePositionMarker();
    this.dismissBanner();
  }
}
