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
import { commentRate, classifyLevel } from './ficEngagementHelpers.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const BADGE_CLS = 'ao3h-engagement-badge';
const WRAP_CLS  = 'ao3h-engagement-metrics';
const DATA_ATTR = 'ao3hEngagement';
const HELP_TEXT =
  'Kudos ratio (kudos/hits): high ≥20% · medium 8–20% · low <8%. ' +
  'Kudos density (kudos per 1,000 words): high ≥50 · medium 20–50 · low <20. ' +
  'Save rate (bookmarks/kudos): high ≥20% · medium 10–20% · low <10%. ' +
  'Comment rate (comments/kudos): high ≥15% · medium 5–15% · low <5%.';

export class EngagementMetrics {
  constructor ({ colorCode = false, hideLowEngagement = false } = {}) {
    this.colorCode = colorCode;
    this.hideLowEngagement = hideLowEngagement;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — METRIC CALCULATION
  ═════════════════════════════════════════════════════════════════════════ */

  getStats (blurb) {
    if (!blurb.querySelector('dl.stats')) return null;
    return getBlurbStats(blurb);
  }

  kudosRatio (s)  { return (s.kudos != null && s.hits) ? (s.kudos / s.hits) * 100 : null; }
  kudosDensity (s){ return (s.kudos != null && s.words) ? (s.kudos / s.words) * 1000 : null; }
  saveRate (s)    { return (s.bookmarks != null && s.kudos) ? (s.bookmarks / s.kudos) * 100 : null; }
  commentRate (s) { return commentRate(s); }

  densityColour (v) {
    if (!this.colorCode || v == null) return '';
    const level = classifyLevel(v, { high: 50, mid: 20 });
    return level ? `ao3h-metric-${level}` : '';
  }
  saveColour (v) {
    if (!this.colorCode || v == null) return '';
    const level = classifyLevel(v, { high: 20, mid: 10 });
    return level ? `ao3h-metric-${level}` : '';
  }
  commentColour (v) {
    if (!this.colorCode || v == null) return '';
    const level = classifyLevel(v, { high: 15, mid: 5 });
    return level ? `ao3h-metric-${level}` : '';
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

    const cr = this.commentRate(s);
    if (cr != null) wrap.appendChild(this.badge(
      cr.toFixed(1), '% 💬', this.commentColour(cr),
      `${(s.comments || 0).toLocaleString()} comments / ${(s.kudos || 0).toLocaleString()} kudos`
    ));

    if (wrap.children.length) {
      const help = document.createElement('span');
      help.className = `${BADGE_CLS} ao3h-engagement-help`;
      help.textContent = 'ⓘ';
      help.title = HELP_TEXT;
      wrap.appendChild(help);
    }

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

    if (this.hideLowEngagement && classifyLevel(this.kudosRatio(s), { high: 20, mid: 8 }) === 'low') {
      blurb.classList.add('ao3h-low-engagement-hidden');
      blurb.style.display = 'none';
      return;
    }

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
    document.querySelectorAll('.ao3h-low-engagement-hidden').forEach(el => {
      el.style.display = '';
      el.classList.remove('ao3h-low-engagement-hidden');
    });
  }
}
