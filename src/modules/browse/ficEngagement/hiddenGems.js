/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Hidden Gems Submodule
    Submodule ID: hiddenGems
    Parent Module: ficEngagement

    Identifies "hidden gem" works — low popularity but high engagement ratio —
    and injects a 💎 badge onto their blurbs and work pages.

    Detection criteria (fixed thresholds):
        • Kudos/hits ratio ≥ 5%
        • Kudos ≤ 100  (low popularity)
        • Bookmarks ≤ 10  (OR kudos ≤ 100)
        • Minimum hits ≥ 50  (enough data)
        • Minimum kudos ≥ 5  (enough data)

    Tooltip: "Under the radar: low kudos but high ratio — X% ratio · N kudos · N hits"

═══════════════════════════════════════════════════════════════════════════ */

const GEM_BADGE_CLS = 'ao3h-gem-badge';
const GEM_BLURB_CLS = 'ao3h-gem-blurb';
const DATA_ATTR     = 'ao3hGemChecked';

const MIN_HITS      = 50;
const MIN_KUDOS     = 5;
const MIN_RATIO     = 0.05;  // 5%
const MAX_KUDOS     = 100;
const MAX_BOOKMARKS = 10;

export class HiddenGems {

  /* ── Number parser ──────────────────────────────────────────────── */
  _parseNum (node) {
    if (!node) return null;
    const n = parseInt((node.textContent || '').replace(/,/g, '').trim(), 10);
    return isNaN(n) ? null : n;
  }

  /* ── Stats from a blurb ─────────────────────────────────────────── */
  _getStatsFromBlurb (blurb) {
    const dl = blurb.querySelector('dl.stats');
    if (!dl) return null;
    const kudos     = this._parseNum(dl.querySelector('dd.kudos'));
    const hits      = this._parseNum(dl.querySelector('dd.hits'));
    const bookmarks = this._parseNum(dl.querySelector('dd.bookmarks'));
    if (kudos == null && hits == null) return null;
    return { kudos, hits, bookmarks };
  }

  /* ── Stats from work page ───────────────────────────────────────── */
  _getStatsFromWorkPage () {
    const dl = document.querySelector('dl.work.meta.group dl.stats, #main dl.stats');
    if (!dl) return null;
    const kudos     = this._parseNum(dl.querySelector('dd.kudos'));
    const hits      = this._parseNum(dl.querySelector('dd.hits'));
    const bookmarks = this._parseNum(dl.querySelector('dd.bookmarks'));
    if (kudos == null && hits == null) return null;
    return { kudos, hits, bookmarks };
  }

  /* ── Is this a hidden gem? ──────────────────────────────────────── */
  _isGem (stats) {
    if (!stats) return false;
    const { kudos, hits, bookmarks } = stats;
    if (!kudos || !hits) return false;
    if (hits < MIN_HITS || kudos < MIN_KUDOS) return false;
    const ratio  = kudos / hits;
    const lowPop = kudos <= MAX_KUDOS || (bookmarks != null && bookmarks <= MAX_BOOKMARKS);
    return ratio >= MIN_RATIO && lowPop;
  }

  /* ── Build tooltip ──────────────────────────────────────────────── */
  _tooltip (stats) {
    const { kudos, hits } = stats;
    const ratio = hits ? ((kudos / hits) * 100).toFixed(1) : null;
    const parts = ['Under the radar: low kudos but high ratio'];
    if (ratio != null) parts.push(`${ratio}% ratio`);
    if (kudos  != null) parts.push(`${kudos.toLocaleString()} kudos`);
    if (hits   != null) parts.push(`${hits.toLocaleString()} hits`);
    return parts[0] + ' — ' + parts.slice(1).join(' · ');
  }

  /* ── Create badge ───────────────────────────────────────────────── */
  _createBadge (stats) {
    const span = document.createElement('span');
    span.className = GEM_BADGE_CLS;
    span.textContent = '💎 Hidden Gem';
    span.title = this._tooltip(stats);
    return span;
  }

  /* ── Attach badge to a blurb ────────────────────────────────────── */
  _attachToBlurb (blurb, stats) {
    if (blurb.querySelector('.' + GEM_BADGE_CLS)) return;
    blurb.classList.add(GEM_BLURB_CLS);
    const target = blurb.querySelector('h4.heading') || blurb;
    target.appendChild(this._createBadge(stats));
  }

  /* ── Attach badge to work page ──────────────────────────────────── */
  _attachToWorkPage (stats) {
    const target =
      document.querySelector('div.preface.group h2.title') ||
      document.querySelector('h2.title.heading');
    if (!target || target.querySelector('.' + GEM_BADGE_CLS)) return;
    target.appendChild(this._createBadge(stats));
  }

  /* ── Process one blurb ──────────────────────────────────────────── */
  _processBlurb (blurb) {
    if (blurb.dataset[DATA_ATTR]) return;
    blurb.dataset[DATA_ATTR] = '1';
    const stats = this._getStatsFromBlurb(blurb);
    if (this._isGem(stats)) this._attachToBlurb(blurb, stats);
  }

  /* ── Scan all blurbs ────────────────────────────────────────────── */
  _scan () {
    document.querySelectorAll('li.work.blurb.group, li.bookmark.blurb.group')
      .forEach(b => this._processBlurb(b));
  }

  /* ── init ───────────────────────────────────────────────────────── */
  init () {
    this._scan();

    if (/^\/works\/\d+/.test(location.pathname)) {
      const stats = this._getStatsFromWorkPage();
      if (this._isGem(stats)) this._attachToWorkPage(stats);
    }

    const mo = new MutationObserver(() => this._scan());
    mo.observe(document.querySelector('#main') || document.body, {
      childList: true, subtree: true,
    });
    this._mo = mo;
  }

  /* ── cleanup ────────────────────────────────────────────────────── */
  cleanup () {
    this._mo?.disconnect();
    document.querySelectorAll('.' + GEM_BADGE_CLS).forEach(el => el.remove());
    document.querySelectorAll('.' + GEM_BLURB_CLS).forEach(el => {
      el.classList.remove(GEM_BLURB_CLS);
    });
    document.querySelectorAll('[data-ao3h-gem-checked]')
      .forEach(el => delete el.dataset[DATA_ATTR]);
  }
}
