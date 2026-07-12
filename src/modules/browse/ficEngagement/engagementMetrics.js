/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Engagement Metrics Submodule
    Submodule ID: engagementMetrics
    Parent Module: ficEngagement

    Computes and injects engagement metric badges onto work blurbs and work
    pages:
        • Kudos ratio   — (kudos / hits) × 100      → "X.X% ❤️/👁️"
        • Kudos density — (kudos / words) × 1000    → "X.X /1Kw"
        • Save rate     — (bookmarks / kudos) × 100 → "X.X% 💾"

    Thresholds (not user-configurable):
        Ratio   — high ≥ 20 %  · mid 8–20 %  · low < 8 %
        Density — high ≥ 50    · mid 20–50    · low < 20
        Save    — high ≥ 20 %  · mid 10–20 %  · low < 10 %

═══════════════════════════════════════════════════════════════════════════ */

const BADGE_CLS = 'ao3h-engagement-badge';
const WRAP_CLS  = 'ao3h-engagement-metrics';
const DATA_ATTR = 'ao3hEngagement';

export class EngagementMetrics {
  constructor ({ colorCode = false } = {}) {
    this.colorCode = colorCode;
  }

  /* ── Number parser ──────────────────────────────────────────────── */
  parseNum (node) {
    if (!node) return null;
    const raw = (node.textContent || '').replace(/,/g, '').trim();
    const n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  }

  /* ── Stats from a blurb ─────────────────────────────────────────── */
  getStats (blurb) {
    const dl = blurb.querySelector('dl.stats');
    if (!dl) return null;
    return {
      kudos:     this.parseNum(dl.querySelector('dd.kudos')),
      hits:      this.parseNum(dl.querySelector('dd.hits')),
      bookmarks: this.parseNum(dl.querySelector('dd.bookmarks')),
      words:     this.parseNum(dl.querySelector('dd.words')),
    };
  }

  /* ── Metric calculators ─────────────────────────────────────────── */
  kudosRatio (s)  { return (s.kudos != null && s.hits)  ? (s.kudos / s.hits)  * 100  : null; }
  kudosDensity (s){ return (s.kudos != null && s.words) ? (s.kudos / s.words) * 1000 : null; }
  saveRate (s)    { return (s.bookmarks != null && s.kudos) ? (s.bookmarks / s.kudos) * 100 : null; }

  /* ── Colour classes ─────────────────────────────────────────────── */
  ratioColour (v)  {
    if (!this.colorCode || v == null) return '';
    return v >= 20 ? 'ao3h-metric-high' : v >= 8  ? 'ao3h-metric-mid' : 'ao3h-metric-low';
  }
  densityColour (v) {
    if (!this.colorCode || v == null) return '';
    return v >= 50 ? 'ao3h-metric-high' : v >= 20 ? 'ao3h-metric-mid' : 'ao3h-metric-low';
  }
  saveColour (v) {
    if (!this.colorCode || v == null) return '';
    return v >= 20 ? 'ao3h-metric-high' : v >= 10 ? 'ao3h-metric-mid' : 'ao3h-metric-low';
  }

  /* ── Badge element ──────────────────────────────────────────────── */
  badge (value, unit, cls, tooltip) {
    const sp = document.createElement('span');
    sp.className = BADGE_CLS + (cls ? ' ' + cls : '');
    sp.textContent = value + unit;
    sp.title = tooltip;
    return sp;
  }

  /* ── Build wrap from stats object ───────────────────────────────── */
  buildWrap (s) {
    const wrap = document.createElement('span');
    wrap.className = WRAP_CLS;

    const kr = this.kudosRatio(s);
    if (kr != null) wrap.appendChild(this.badge(
      kr.toFixed(1), '% ❤️/👁️', this.ratioColour(kr),
      `${(s.kudos || 0).toLocaleString()} kudos / ${(s.hits || 0).toLocaleString()} hits`
    ));

    const kd = this.kudosDensity(s);
    if (kd != null) wrap.appendChild(this.badge(
      kd.toFixed(1), ' /1Kw', this.densityColour(kd),
      `${(s.kudos || 0).toLocaleString()} kudos / ${(s.words || 0).toLocaleString()} words`
    ));

    const sr = this.saveRate(s);
    if (sr != null) wrap.appendChild(this.badge(
      sr.toFixed(1), '% 💾', this.saveColour(sr),
      `${(s.bookmarks || 0).toLocaleString()} bookmarks / ${(s.kudos || 0).toLocaleString()} kudos`
    ));

    return wrap.children.length ? wrap : null;
  }

  /* ── Process one blurb ──────────────────────────────────────────── */
  processBlurb (blurb) {
    if (blurb.dataset[DATA_ATTR]) return;
    blurb.dataset[DATA_ATTR] = '1';

    const s = this.getStats(blurb);
    if (!s) return;

    const wrap = this.buildWrap(s);
    if (!wrap) return;

    const dl = blurb.querySelector('dl.stats');
    if (dl && dl.parentNode) dl.parentNode.insertBefore(wrap, dl.nextSibling);
  }

  /* ── Scan all blurbs on the page ────────────────────────────────── */
  scan () {
    document.querySelectorAll(
      'li.work.blurb.group, li.bookmark.blurb.group'
    ).forEach(b => this.processBlurb(b));
  }

  /* ── Work page injection ────────────────────────────────────────── */
  processWorkPage () {
    if (!/^\/works\/\d+/.test(location.pathname)) return;
    const dl = document.querySelector('dl.work.meta.group dl.stats, #main dl.stats');
    if (!dl || dl.dataset[DATA_ATTR]) return;
    dl.dataset[DATA_ATTR] = '1';

    const s = {
      kudos:     this.parseNum(dl.querySelector('dd.kudos')),
      hits:      this.parseNum(dl.querySelector('dd.hits')),
      bookmarks: this.parseNum(dl.querySelector('dd.bookmarks')),
      words:     this.parseNum(dl.querySelector('dd.words')),
    };

    const wrap = this.buildWrap(s);
    if (wrap) {
      const ddStats = dl.parentNode;
      (ddStats.parentNode || ddStats).insertBefore(wrap, ddStats.nextSibling);
    }
  }

  /* ── Cleanup ────────────────────────────────────────────────────── */
  cleanup () {
    document.querySelectorAll('.' + WRAP_CLS).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-engagement]').forEach(el => {
      delete el.dataset[DATA_ATTR];
    });
  }
}
