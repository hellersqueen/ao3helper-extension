/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Works Filter Manager Submodule
    Submodule ID: worksFilterManager
    Parent Module: filterManager

    - Feature: Blurb classification
      - Option: Marks one-shot blurbs (dd.chapters === "1/1") with data-fm-oneshot
      - Option: Marks crossover blurbs (multiple fandoms in h6.fandoms a.tag) with data-fm-crossover
      - Option: Guards against re-processing blurbs (data-fm-wfm marker)

    - Feature: Quick-filter panel
      - Option: "1️⃣ One-shots only" toggle button (shown when quickFilterOneshot is true)
      - Option: "🚫 Hide crossovers" toggle button (shown when quickFilterCrossover is true)
      - Option: Panel hidden entirely if both options are disabled

    - Feature: CSS-based filtering
      - Option: Toggling one-shots button adds ao3h-fm-filter-oneshot class to <html>
      - Option: Toggling crossover button adds ao3h-fm-hide-crossover class to <html>
      - Option: CSS rules hide non-matching blurbs without re-processing the DOM
      - Option: Buttons reflect active state via aria-pressed and active class

    - Feature: CSS-class-based filtering
      - Option: CSS rules live in filterManager.css (scoped to html.ao3h-fm-*)
      - Option: Class toggles on <html> trigger CSS visibility without DOM mutation

    - Feature: Cleanup
      - Option: Removes filter classes from <html>
      - Option: Removes data-fm-wfm, data-fm-oneshot, data-fm-crossover from all blurbs
      - Option: Removes the quick-filter panel and injected styles

    Dependencies injected via constructor: NS, cfg

═══════════════════════════════════════════════════════════════════════════ */

export class WorksFilterManager {
  constructor ({ NS, cfg }) {
    this.NS       = NS;
    this.cfg      = cfg;
    this._panel   = null;
  }

  /* ── Classification helpers ─────────────────────────────────────── */

  _isOneshot (blurb) {
    const chapters = blurb.querySelector('dd.chapters')?.textContent.trim();
    return chapters === '1/1' || chapters === '1';
  }

  _isCrossover (blurb) {
    return blurb.querySelectorAll('h6.fandoms a.tag').length > 1;
  }

  /* ── Classify blurbs and inject data attributes ─────────────────── */

  apply (blurbs) {
    for (const blurb of blurbs) {
      if (blurb.dataset.fmWfm) continue;
      blurb.dataset.fmWfm = '1';
      if (this._isOneshot(blurb))   blurb.dataset.fmOneshot   = '1';
      if (this._isCrossover(blurb)) blurb.dataset.fmCrossover = '1';
    }
  }

  /* ── Build quick-filter panel ───────────────────────────────────── */

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

  /* ── Cleanup ────────────────────────────────────────────────────── */

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
