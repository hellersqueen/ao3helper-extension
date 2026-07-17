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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

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
    const banner = document.createElement('div');
    banner.id        = _BANNER_ID;
    banner.className = `${NS}-resume-banner`;
    banner.setAttribute('role', 'status');
    banner.innerHTML = `
      <span>📍 Resume at <a href="${sanitizeHref(href)}">Chapter ${ch}</a>${ago ? ` <span class="${NS}-resume-banner-ago">· ${ago}</span>` : ''}</span>
      <button class="${NS}-resume-banner-dismiss" aria-label="Dismiss">✕</button>
    `;
    banner.querySelector('button').addEventListener('click', () => banner.remove());
    workskin.insertAdjacentElement('beforebegin', banner);
  }

  dismissBanner () { document.getElementById(this._BANNER_ID)?.remove(); }

  injectFloatingBadge () {
    const { NS, cfg, _PROG_BADGE_ID } = this;
    if (!cfg('floatingBadge') || document.getElementById(_PROG_BADGE_ID)) return;
    const badge       = document.createElement('div');
    badge.id          = _PROG_BADGE_ID;
    badge.className   = `${NS}-progress-badge`;
    badge.textContent = '0%';
    document.body.appendChild(badge);
  }

  updateFloatingBadge (pct) {
    const badge = document.getElementById(this._PROG_BADGE_ID);
    if (badge) badge.textContent = `${Math.round(pct)}%`;
  }

  removeFloatingBadge () { document.getElementById(this._PROG_BADGE_ID)?.remove(); }

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

  setupScrollTracking (workId) {
    const { saveProgress } = this;
    const userstuff = document.querySelector('.userstuff.module, #workskin .userstuff');
    if (!userstuff) return;
    const docHeight  = () => Math.max(document.documentElement.scrollHeight - W.innerHeight, 1);
    const getPercent = () => Math.min(100, Math.round((W.scrollY / docHeight()) * 100));
    const saveDebounced = () => {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null;
        const pct = getPercent();
        saveProgress(workId, { scrollY: W.scrollY, progress: pct, lastReadAt: Date.now() });
        this.updateFloatingBadge(pct);
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
    this.removeFloatingBadge();
    this.removePositionMarker();
    this.dismissBanner();
  }
}
