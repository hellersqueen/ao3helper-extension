/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Status Indicators
    Submodule of: bookmarkVault

    - Scans user's bookmark page → caches { workId: { pub, notes } }
    - On listing pages → injects ⭐/🔒 badge and 📝 icon on bookmarked works
    - Optional completion badge (✓ Complete / 🔄 WIP) based on chapter count
    - Optional progress ring (SVG circle showing chapters published / total)
    - Optional last-read date display
    - Optional status filter (All / Bookmarked only / Unbookmarked only)

═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb, isListingPage } from '../../../../../lib/ao3/parsers.js';
import { observe } from '../../../../../lib/utils/index.js';
import { relativeDate } from '../../../../../lib/utils/format-date.js';

const D = document;
const SK_DATA = 'ao3h:bookmarkVault:data';
const SK_LAST = 'ao3h:bookmarkVault:lastRead';

export class StatusIndicators {
  constructor (cfgFn) {
    this.cfg  = cfgFn;
    this._obs = [];
  }

  // ── Storage ──────────────────────────────────────────────────────────────
  _load (key, fb) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fb)); }
    catch (_) { return fb; }
  }
  _save (key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }

  // ── Route checks ─────────────────────────────────────────────────────────
  _isBookmarksPage () { return /\/bookmarks/.test(location.pathname); }
  _isListingPage   () { return isListingPage(); }

  _getWorkId (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  // ── Scan bookmarks page → build cache ────────────────────────────────────
  _scanAndCache () {
    const data = this._load(SK_DATA, {});
    D.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
      const wid = this._getWorkId(blurb);
      if (!wid) return;
      const isPublic = !!blurb.querySelector('.status span.public');
      const notesEl  = blurb.querySelector('.user.module.group blockquote.userstuff');
      const notes    = (notesEl?.textContent || '').trim().slice(0, 200);
      data[wid] = { pub: isPublic, notes };
    });
    this._save(SK_DATA, data);
  }

  // ── Inject badges on listing blurbs ──────────────────────────────────────
  _processBlurbs (blurbs) {
    const data      = this._load(SK_DATA, {});
    const lastRead  = this.cfg('showLastReadDate') ? this._load(SK_LAST, {}) : {};
    const showBadge = this.cfg('showPublicPrivateBadge');
    const showNote  = this.cfg('showNoteIcon');
    const showDate  = this.cfg('showLastReadDate');
    const showCompl = this.cfg('showCompletionBadge');
    const showRing  = this.cfg('showProgressRing');

    Array.from(blurbs).forEach(blurb => {
      if (blurb.dataset.bvSiDone) return;
      blurb.dataset.bvSiDone = '1';
      const wid = this._getWorkId(blurb);
      if (!wid || !data[wid]) return;
      const bm = data[wid];
      const h4 = blurb.querySelector('h4.heading');
      if (!h4) return;

      if (showBadge) {
        const b = D.createElement('span');
        b.className     = 'ao3h-bv-badge';
        b.textContent   = bm.pub ? '⭐' : '🔒';
        b.title         = bm.pub ? 'Public bookmark' : 'Private bookmark';
        h4.appendChild(b);
      }

      if (showNote && bm.notes) {
        const icon = D.createElement('span');
        icon.className     = 'ao3h-bv-note-icon';
        icon.textContent   = '📝';
        icon.title         = bm.notes.length > 100 ? bm.notes.slice(0, 100) + '…' : bm.notes;
        h4.appendChild(icon);
      }

      if (showDate && lastRead[wid]) {
        const label = relativeDate(lastRead[wid], { short: true });
        const span  = D.createElement('span');
        span.className     = 'ao3h-bv-last-read';
        span.textContent   = `Last read: ${label}`;
        h4.appendChild(span);
      }

      if (showCompl || showRing) {
        const chapStr = (blurb.querySelector('dd.chapters')?.textContent || '').trim();
        if (chapStr) {
          const parts      = chapStr.split('/');
          const latest     = parseInt(parts[0]) || 0;
          const total      = (parts[1] && parts[1] !== '?') ? (parseInt(parts[1]) || NaN) : NaN;
          const isComplete = Number.isFinite(total) && total > 0 && latest >= total;
          const pct        = (Number.isFinite(total) && total > 0) ? Math.min(latest / total, 1) : null;

          if (showCompl) {
            const cb = D.createElement('span');
            cb.className     = 'ao3h-bv-completion';
            cb.textContent   = isComplete ? '✓' : '🔄';
            cb.title         = isComplete ? 'Complete' : `WIP (${chapStr} chapters)`;
            cb.style.color = isComplete ? '#155724' : '#856404';
            h4.appendChild(cb);
          }

          if (showRing) {
            const r       = 8;
            const circ    = 2 * Math.PI * r;
            const fillPct = pct !== null ? pct : 0.5;
            const dash    = (fillPct * circ).toFixed(2);
            const color   = isComplete ? '#155724' : (pct !== null ? '#856404' : '#aaa');
            const tipText = isComplete
              ? 'Complete'
              : (pct !== null ? `${Math.round(pct * 100)}% complete (${chapStr})` : `WIP (${chapStr})`);

            const svg = D.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '20'); svg.setAttribute('height', '20');
            svg.setAttribute('viewBox', '0 0 20 20');
            svg.className = 'ao3h-bv-ring';

            const titleEl = D.createElementNS('http://www.w3.org/2000/svg', 'title');
            titleEl.textContent = tipText;

            const bg = D.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bg.setAttribute('cx', '10'); bg.setAttribute('cy', '10'); bg.setAttribute('r', String(r));
            bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', '#ddd'); bg.setAttribute('stroke-width', '2.5');

            const fg = D.createElementNS('http://www.w3.org/2000/svg', 'circle');
            fg.setAttribute('cx', '10'); fg.setAttribute('cy', '10'); fg.setAttribute('r', String(r));
            fg.setAttribute('fill', 'none');
            fg.setAttribute('stroke', color);
            fg.setAttribute('stroke-width', '2.5');
            fg.setAttribute('stroke-dasharray', `${dash} ${circ.toFixed(2)}`);
            fg.setAttribute('transform', 'rotate(-90 10 10)');

            svg.appendChild(titleEl);
            svg.appendChild(bg);
            svg.appendChild(fg);
            h4.appendChild(svg);
          }
        }
      }
    });
  }

  // ── Status filter ─────────────────────────────────────────────────────────
  _injectStatusFilter () {
    if (D.getElementById('ao3h-bv-sf')) return;
    const data       = this._load(SK_DATA, {});
    const bookmarked = new Set(Object.keys(data));
    const def        = this.cfg('bookmarkStatusFilterDefault') || 'all';
    const showCount  = this.cfg('showStatusFilterCount');

    const wrap = D.createElement('div');
    wrap.id    = 'ao3h-bv-sf';

    const label = D.createElement('strong');
    label.textContent = 'Bookmarked: ';
    wrap.appendChild(label);

    const countEl = showCount ? (() => {
      const s = D.createElement('span');
      s.id = 'ao3h-bv-sf-count';
      return s;
    })() : null;

    [
      { val: 'all',          lbl: 'All' },
      { val: 'bookmarked',   lbl: 'Bookmarked only' },
      { val: 'unbookmarked', lbl: 'Not bookmarked' },
    ].forEach(o => {
      const lbl = D.createElement('label');
      lbl.className = 'ao3h-bv-sf-lbl';
      const inp = D.createElement('input');
      inp.type    = 'radio';
      inp.name    = 'ao3h-bv-sf';
      inp.value   = o.val;
      inp.checked = o.val === def;
      inp.addEventListener('change', () => this._applyFilter(o.val, bookmarked, countEl));
      lbl.appendChild(inp);
      lbl.append(' ' + o.lbl);
      wrap.appendChild(lbl);
    });

    if (countEl) wrap.appendChild(countEl);
    const anchor = D.querySelector('#main > h2, #main > h3');
    if (anchor) anchor.insertAdjacentElement('afterend', wrap);
    else D.getElementById('main')?.insertAdjacentElement('afterbegin', wrap);
    if (def !== 'all') this._applyFilter(def, bookmarked, countEl);
  }

  _applyFilter (mode, bookmarked, countEl) {
    let shown = 0;
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(b => {
      const wid     = this._getWorkId(b);
      const visible = mode === 'all'        ? true
                    : mode === 'bookmarked' ? bookmarked.has(wid)
                    :                         !bookmarked.has(wid);
      b.style.display = visible ? '' : 'none';
      if (visible) { delete b.dataset.bvSfHidden; shown++; }
      else b.dataset.bvSfHidden = '1';
    });
    if (countEl) countEl.textContent = `(${shown} shown)`;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  boot () {
    if (this._isBookmarksPage()) this._scanAndCache();
    if (this._isListingPage()) {
      this._processBlurbs(D.querySelectorAll('li.work.blurb, li.bookmark.blurb'));
      const obs = observe(D.getElementById('main') || D.body, { childList: true, subtree: true }, () => {
        this._processBlurbs(D.querySelectorAll(
          'li.work.blurb:not([data-bv-si-done]), li.bookmark.blurb:not([data-bv-si-done])'
        ));
      });
      this._obs.push(obs);
      if (this.cfg('bookmarkStatusFilterEnabled')) this._injectStatusFilter();
    }
  }

  stop () {
    this._obs.forEach(o => o.disconnect());
    this._obs = [];
    D.querySelectorAll('.ao3h-bv-badge, .ao3h-bv-note-icon, .ao3h-bv-last-read, .ao3h-bv-completion, .ao3h-bv-ring').forEach(e => e.remove());
    D.getElementById('ao3h-bv-sf')?.remove();
    D.querySelectorAll('[data-bv-sf-hidden]').forEach(el => {
      el.style.display = '';
      delete el.dataset.bvSfHidden;
    });
    D.querySelectorAll('[data-bv-si-done]').forEach(el => delete el.dataset.bvSiDone);
  }
}
