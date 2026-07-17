/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Engagement › Engagement Metrics

Purpose
    Calculates and displays kudos ratio, kudos density, and bookmark save rate
    badges on work blurbs and supported work pages.

Notes
    Optional colour coding uses fixed thresholds. Processed elements are marked
    to prevent duplicate badges during dynamic rescans.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { buildKudosRatioBadge } from '../../../../lib/ui/badges.js';
import { getBlurbStats, getWorkPageStats } from '../../../../lib/ao3/work-stats.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const BADGE_CLS = 'ao3h-engagement-badge';
const WRAP_CLS  = 'ao3h-engagement-metrics';
const DATA_ATTR = 'ao3hEngagement';

export class EngagementMetrics {
  constructor ({ colorCode = false } = {}) {
    this.colorCode = colorCode;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — METRIC CALCULATION
  ═════════════════════════════════════════════════════════════════════════ */

  getStats (blurb) {
    if (!blurb.querySelector('dl.stats')) return null;
    return getBlurbStats(blurb);
  }

  kudosDensity (s){ return (s.kudos != null && s.words) ? (s.kudos / s.words) * 1000 : null; }
  saveRate (s)    { return (s.bookmarks != null && s.kudos) ? (s.bookmarks / s.kudos) * 100 : null; }

  densityColour (v) {
    if (!this.colorCode || v == null) return '';
    return v >= 50 ? 'ao3h-metric-high' : v >= 20 ? 'ao3h-metric-mid' : 'ao3h-metric-low';
  }
  saveColour (v) {
    if (!this.colorCode || v == null) return '';
    return v >= 20 ? 'ao3h-metric-high' : v >= 10 ? 'ao3h-metric-mid' : 'ao3h-metric-low';
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BADGE RENDERING
  ═════════════════════════════════════════════════════════════════════════ */

  badge (value, unit, cls, tooltip) {
    const sp = document.createElement('span');
    sp.className = BADGE_CLS + (cls ? ' ' + cls : '');
    sp.textContent = value + unit;
    sp.title = tooltip;
    return sp;
  }

  buildWrap (s) {
    const wrap = document.createElement('span');
    wrap.className = WRAP_CLS;

    const ratioBadge = buildKudosRatioBadge(s, { colorCode: this.colorCode });
    if (ratioBadge) wrap.appendChild(ratioBadge);

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


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PAGE PROCESSING
  ═════════════════════════════════════════════════════════════════════════ */

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

  scan () {
    document.querySelectorAll(
      'li.work.blurb.group, li.bookmark.blurb.group'
    ).forEach(b => this.processBlurb(b));
  }

  processWorkPage () {
    if (!/^\/works\/\d+/.test(location.pathname)) return;
    const dl = document.querySelector('dl.work.meta.group dl.stats, #main dl.stats');
    if (!dl || dl.dataset[DATA_ATTR]) return;
    dl.dataset[DATA_ATTR] = '1';

    const s = getWorkPageStats(document);

    const wrap = this.buildWrap(s);
    if (wrap) {
      const ddStats = dl.parentNode;
      (ddStats.parentNode || ddStats).insertBefore(wrap, ddStats.nextSibling);
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup () {
    document.querySelectorAll('.' + WRAP_CLS).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-engagement]').forEach(el => {
      delete el.dataset[DATA_ATTR];
    });
  }
}
