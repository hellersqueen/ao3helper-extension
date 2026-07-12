// ── VisualMarkers ─────────────────────────────────────────────────────────
// Submodule of: readingTracker — listing pages

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
        blurb.classList.add(`${NS}-seen-hidden`);
        this._hiddenCount++;
      } else {
        blurb.classList.add(`${NS}-seen-mark`);
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
    document.querySelectorAll(`.${NS}-seen-mark, .${NS}-seen-hidden, .${NS}-seen-badge`).forEach(el => {
      el.classList.remove(`${NS}-seen-mark`, `${NS}-seen-hidden`);
      if (el.classList.contains(`${NS}-seen-badge`)) el.remove();
    });
    document.getElementById(`${NS}-hide-counter`)?.remove();
  }

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

  setup ()    { this.applySeenMarks(); this.applyChapterBadges(); }
  teardown () { this.removeSeenMarks(); this.removeChapterBadges(); }
}
