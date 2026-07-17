/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager › Works Filter Manager

Purpose
    Classifies one-shot and crossover work blurbs and provides quick controls
    for filtering those classifications.

Notes
    Classification is stored in data attributes, while visibility is controlled
    by document-root classes and rules in filterManager.css. Processed blurbs
    are marked to avoid duplicate work during rescans.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This submodule has no direct imports.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class WorksFilterManager {
  constructor ({ NS, cfg }) {
    this.NS       = NS;
    this.cfg      = cfg;
    this._panel   = null;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK CLASSIFICATION
  ═════════════════════════════════════════════════════════════════════════ */

  _isOneshot (blurb) {
    const chapters = blurb.querySelector('dd.chapters')?.textContent.trim();
    return chapters === '1/1' || chapters === '1';
  }

  _isCrossover (blurb) {
    return blurb.querySelectorAll('h6.fandoms a.tag').length > 1;
  }

  apply (blurbs) {
    for (const blurb of blurbs) {
      if (blurb.dataset.fmWfm) continue;
      blurb.dataset.fmWfm = '1';
      if (this._isOneshot(blurb))   blurb.dataset.fmOneshot   = '1';
      if (this._isCrossover(blurb)) blurb.dataset.fmCrossover = '1';
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — QUICK FILTER CONTROLS
  ═════════════════════════════════════════════════════════════════════════ */

  buildPanel () {
    const NS        = this.NS;
    const showOne   = this.cfg('quickFilterOneshot');
    const showCross = this.cfg('quickFilterCrossover');
    if (!showOne && !showCross) return null;

    const panel = document.createElement('div');
    panel.className = `${NS}-fm-quick-panel`;

    const label = document.createElement('span');
    label.className   = `${NS}-fm-quick-label`;
    label.textContent = 'Quick filters:';
    panel.appendChild(label);

    if (showOne) {
      const btn = this._makeBtn('1️⃣ One-shots only', () => {
        const active = document.documentElement.classList.toggle(`${NS}-fm-filter-oneshot`);
        btn.classList.toggle(`${NS}-fm-active`, active);
        btn.setAttribute('aria-pressed', String(active));
      });
      panel.appendChild(btn);
    }

    if (showCross) {
      const btn = this._makeBtn('🚫 Hide crossovers', () => {
        const active = document.documentElement.classList.toggle(`${NS}-fm-hide-crossover`);
        btn.classList.toggle(`${NS}-fm-active`, active);
        btn.setAttribute('aria-pressed', String(active));
      });
      panel.appendChild(btn);
    }

    this._panel = panel;
    return panel;
  }

  _makeBtn (label, onClick) {
    const NS  = this.NS;
    const btn = document.createElement('button');
    btn.type        = 'button';
    btn.className   = `${NS}-fm-quick-btn`;
    btn.textContent = label;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', onClick);
    return btn;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup () {
    const NS = this.NS;
    document.documentElement.classList.remove(
      `${NS}-fm-filter-oneshot`,
      `${NS}-fm-hide-crossover`
    );
    document.querySelectorAll('[data-fm-wfm]').forEach(el => {
      delete el.dataset.fmWfm;
      delete el.dataset.fmOneshot;
      delete el.dataset.fmCrossover;
    });
    this._panel?.remove();
    this._panel   = null;
  }
}
