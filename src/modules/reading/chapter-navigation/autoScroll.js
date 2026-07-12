// ── AutoScroll ────────────────────────────────────────────────────────────
// Submodule of: chapterNavigation
// Scope: work pages only
//
// Responsibilities:
//   - Automatic scrolling at configurable speed (px/s)
//   - Pause on user interaction (mousemove, click, keydown, wheel, touch)
//   - Auto-advance to next chapter on reaching the bottom
//   - Speed preset controls (floating pill widget)
//   - Cleanup: cancel scroll, remove UI
//
// Config keys (passed via parent diOpts.cfg):
//   autoScrollSpeed        (number, px/s, default 50)
//   autoScrollAutoAdvance  (bool, default false)
//   autoScrollShowControls (bool, default true)

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();

const CTRL_ID        = 'ao3h-autoscroll-ctrl';
const RESUME_DELAY   = 2500; // ms of user inactivity before resuming

const PRESETS = [
  { label: '0.5×', speed: 25  },
  { label: '1×',   speed: 50  },
  { label: '2×',   speed: 100 },
  { label: '4×',   speed: 200 },
];

export class AutoScroll {
  /** @param {{ NS: string, cfg: Function }} opts */
  constructor (opts) {
    this.NS  = opts?.NS || 'ao3h';
    this.cfg = opts?.cfg || (() => undefined);

    this._rafId        = null;
    this._lastTs       = null;
    this._paused       = false;
    this._resumeTimer  = null;
    this._speed        = 0;        // px/s — 0 = stopped
    this._listeners    = [];
  }

  // ── Public API ─────────────────────────────────────────────────────────

  setup () {
    if (this.cfg('autoScrollShowControls') !== false) {
      this._injectControls();
    }
    // Don't auto-start on setup — user must press a preset button
  }

  teardown () {
    this._stopScroll();
    this._removeControls();
    this._removeListeners();
  }

  // ── Scroll engine ──────────────────────────────────────────────────────

  _startScroll (speed) {
    this._stopScroll();
    this._speed   = speed;
    this._paused  = false;
    this._lastTs  = null;
    this._attachInteractionListeners();
    this._rafId = W.requestAnimationFrame(ts => this._tick(ts));
    this._updateIndicator(true);
  }

  _stopScroll () {
    if (this._rafId) { W.cancelAnimationFrame(this._rafId); this._rafId = null; }
    if (this._resumeTimer) { clearTimeout(this._resumeTimer); this._resumeTimer = null; }
    this._speed  = 0;
    this._paused = false;
    this._removeListeners();
    this._updateIndicator(false);
  }

  _tick (ts) {
    if (!this._speed) return;
    if (!this._paused) {
      if (this._lastTs !== null) {
        const delta = (ts - this._lastTs) / 1000; // seconds
        W.scrollBy(0, this._speed * delta);
      }
      this._lastTs = ts;

      // Auto-advance to next chapter at bottom
      if (this.cfg('autoScrollAutoAdvance')) {
        const atBottom = (W.scrollY + W.innerHeight) >= W.document.documentElement.scrollHeight - 4;
        if (atBottom) {
          this._stopScroll();
          this._advanceChapter();
          return;
        }
      }
    } else {
      this._lastTs = null; // don't accumulate delta while paused
    }
    this._rafId = W.requestAnimationFrame(ts => this._tick(ts));
  }

  _pause () {
    this._paused = true;
    this._updateIndicator(false);
    if (this._resumeTimer) clearTimeout(this._resumeTimer);
    this._resumeTimer = setTimeout(() => {
      this._paused = false;
      this._lastTs = null;
      this._updateIndicator(true);
    }, RESUME_DELAY);
  }

  _advanceChapter () {
    const nextBtn = document.querySelector(
      'li.chapter.next a, a[rel="next"], .navigation.actions a[href*="chapters"]'
    );
    if (nextBtn) nextBtn.click();
  }

  // ── User interaction listeners ─────────────────────────────────────────

  _attachInteractionListeners () {
    const events = ['mousemove', 'click', 'keydown', 'wheel', 'touchstart'];
    const handler = () => this._paused || this._pause();
    events.forEach(ev => {
      W.addEventListener(ev, handler, { passive: true });
      this._listeners.push({ ev, handler });
    });
  }

  _removeListeners () {
    this._listeners.forEach(({ ev, handler }) =>
      W.removeEventListener(ev, handler)
    );
    this._listeners = [];
  }

  // ── Controls widget ────────────────────────────────────────────────────

  _injectControls () {
    if (document.getElementById(CTRL_ID)) return;

    const bar = document.createElement('div');
    bar.id    = CTRL_ID;

    const lbl       = document.createElement('span');
    lbl.className   = 'ao3h-as-label';
    lbl.textContent = 'Auto-scroll:';
    bar.appendChild(lbl);

    const savedSpeed = this.cfg('autoScrollSpeed') ?? 50;
    PRESETS.forEach(({ label, speed }) => {
      const btn       = document.createElement('button');
      btn.textContent = label;
      btn.dataset.speed = speed;
      btn.title         = `Scroll at ${speed} px/s`;
      // Highlight the preset that matches the user's saved speed preference
      if (speed === savedSpeed) btn.classList.add('active');
      btn.addEventListener('click', () => {
        bar.querySelectorAll('button:not(.ao3h-as-stop)').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._startScroll(speed);
      });
      bar.appendChild(btn);
    });

    const stop       = document.createElement('button');
    stop.className   = 'ao3h-as-stop';
    stop.textContent = '■ Stop';
    stop.title       = 'Stop auto-scroll';
    stop.addEventListener('click', () => {
      bar.querySelectorAll('button:not(.ao3h-as-stop)').forEach(b => b.classList.remove('active'));
      this._stopScroll();
    });
    bar.appendChild(stop);

    const dot     = document.createElement('span');
    dot.className = 'ao3h-as-pause-indicator';
    bar.appendChild(dot);

    document.body.appendChild(bar);
  }

  _removeControls () {
    document.getElementById(CTRL_ID)?.remove();
  }

  _updateIndicator (running) {
    const dot = document.querySelector(`#${CTRL_ID} .ao3h-as-pause-indicator`);
    if (!dot) return;
    dot.classList.toggle('running', running);
  }

}
