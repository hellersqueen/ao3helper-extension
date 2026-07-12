// ── BlurbNavigation ───────────────────────────────────────────────────────
// Submodule of: chapterNavigation — listing pages only
//
// Responsibilities:
//   - "Start" button on unread works (links to /works/{id})
//   - "Continue (Ch X)" button on in-progress works (links to last read chapter)
//   - "Continue (Ch X) · N new" label when new chapters exist since last read
//   - "Last (Ch Y)" button to jump directly to the final chapter
//   - Reads progress from W.AO3H_ReadingTracker.getProgress() or localStorage fallback
//   - Reads last-chapter cache written by NavigationControls (SK_LASTCHAP)
//   - Buttons injected into h4.heading on each work blurb
//   - Cleanup: removes all injected button wrappers
//
// Config keys (passed via parent diOpts.cfg):
//   resumeButton    (bool, default true)  — show Start / Continue button
//   lastChapterBtn  (bool, default true)  — show Last (Ch Y) button
//
// readingTracker isn't migrated to ES Modules yet (Étape 239) — kept as a
// global bridge read (Phase 18: don't migrate a dependency whose target isn't ready).

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();

export class BlurbNavigation {
  /** @param {{ NS, cfg, lsGet, SK_LASTCHAP }} opts */
  constructor ({ NS, cfg, lsGet, SK_LASTCHAP }) {
    this.NS          = NS;
    this.cfg         = cfg;
    this.lsGet       = lsGet;
    this.SK_LASTCHAP = SK_LASTCHAP;
    this._wrapCls    = `${NS}-qnav-wrap`;
  }

  _parseChapters (text) {
    const m = (text || '').trim().match(/^(\d+)\/(\d+)$/);
    if (!m) return null;
    const current = parseInt(m[1], 10);
    const total   = parseInt(m[2], 10);
    return total <= 1 ? null : { current, total };
  }

  _rtGetProgress (workId) {
    if (W.AO3H_ReadingTracker?.getProgress) {
      try { return W.AO3H_ReadingTracker.getProgress(workId) || null; } catch {}
    }
    return this.lsGet(`ao3h:rt:progress:${workId}`);
  }

  _resolveResumeState (workId, blurb) {
    const progress = this._rtGetProgress(workId);
    const chapDd   = blurb.querySelector('dd.chapters');
    const chapInfo = chapDd ? this._parseChapters(chapDd.textContent) : null;

    if (!progress?.chapter) {
      return { label: 'Start', href: `/works/${workId}`, isStart: true };
    }
    const ch          = progress.chapter;
    const newChapters = (chapInfo && ch < chapInfo.total) ? chapInfo.total - ch : 0;
    const label       = newChapters > 0
      ? `Continue (Ch ${ch}) · ${newChapters} new`
      : `Continue (Ch ${ch})`;
    const href = progress.chapterHref
      || (progress.chapterId ? `/works/${workId}/chapters/${progress.chapterId}` : `/works/${workId}`);
    return { label, href, isStart: false };
  }

  _resolveLastChapterHref (workId) {
    const cached = this.lsGet(this.SK_LASTCHAP(workId));
    if (cached?.id) return `/works/${workId}/chapters/${cached.id}`;
    return `/works/${workId}/navigate`;
  }

  setup () {
    const { NS }     = this;
    const doResume   = this.cfg('resumeButton');
    const doLastChap = this.cfg('lastChapterBtn');
    if (!doResume && !doLastChap) return;

    document.querySelectorAll('li.work.blurb, div.work.blurb').forEach(blurb => {
      const m = (blurb.id || '').match(/^work_(\d+)$/);
      const workId = m ? m[1] : null;
      if (!workId) return;
      if (blurb.querySelector(`.${this._wrapCls}`)) return;

      const heading  = blurb.querySelector('h4.heading');
      if (!heading) return;

      const chapDd   = blurb.querySelector('dd.chapters');
      const chapInfo = chapDd ? this._parseChapters(chapDd.textContent) : null;
      const wrap     = document.createElement('span');
      wrap.className = this._wrapCls;

      if (doResume) {
        const { label, href, isStart } = this._resolveResumeState(workId, blurb);
        const btn       = document.createElement('a');
        btn.className   = `${NS}-qnav-btn` + (isStart ? ` ${NS}-qnav-start` : '');
        btn.href        = href;
        btn.textContent = label;
        btn.title       = isStart ? 'Start reading' : 'Resume where you left off';
        wrap.appendChild(btn);
      }

      if (doLastChap && chapInfo) {
        const btn       = document.createElement('a');
        btn.className   = `${NS}-qnav-btn`;
        btn.href        = this._resolveLastChapterHref(workId);
        btn.textContent = `Last (Ch ${chapInfo.total})`;
        btn.title       = `Jump to chapter ${chapInfo.total}`;
        wrap.appendChild(btn);
      }

      if (wrap.childElementCount > 0) heading.appendChild(wrap);
    });
  }

  teardown () {
    document.querySelectorAll(`.${this._wrapCls}`).forEach(el => el.remove());
  }
}
