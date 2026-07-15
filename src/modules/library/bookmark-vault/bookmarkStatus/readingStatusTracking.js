/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Reading Status Tracking
    Submodule of: bookmarkVault

    - Records last-read timestamp on work page visits
    - Auto-collapses long bookmark notes (~200 chars) with show/hide toggle
    - Full-text search in notes on the bookmarks page
    - ⚠️ badge (or hide) for deleted/restricted bookmarks

═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb, extractWorkIdFromHref, isListingPage } from '../../../../../lib/ao3/parsers.js';
import { observe } from '../../../../../lib/utils/index.js';

const D = document;
const SK_LAST = 'ao3h:bookmarkVault:lastRead';

export class ReadingStatusTracking {
  constructor (cfgFn) {
    this.cfg  = cfgFn;
    this._obs = [];
    this._collapsedNotes = new Map();
  }

  _load (key, fb) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fb)); } catch (_) { return fb; } }
  _save (key, v)  { try { localStorage.setItem(key, JSON.stringify(v)); } catch (_) {} }

  _isWorkPage      () { return /^\/works\/\d+/.test(location.pathname); }
  _isBookmarksPage () { return /\/bookmarks/.test(location.pathname); }
  _isListingPage   () { return isListingPage(); }

  _getWorkId (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  // ── Track last-read timestamp on work pages ───────────────────────────────
  _trackLastRead () {
    const workId = extractWorkIdFromHref(location.pathname);
    if (!workId) return;
    const data = this._load(SK_LAST, {});
    data[workId] = Date.now();
    this._save(SK_LAST, data);
  }

  // ── Note auto-collapse ────────────────────────────────────────────────────
  _collapseNotes (blurbs) {
    Array.from(blurbs).forEach(blurb => {
      if (blurb.dataset.bvRstDone) return;
      blurb.dataset.bvRstDone = '1';
      this._checkDeleted(blurb);
      const notesEl = blurb.querySelector('.user.module.group blockquote.userstuff');
      if (!notesEl) return;
      const fullText = notesEl.textContent.trim();
      if (fullText.length <= 200 || notesEl.dataset.bvCollapsed) return;
      notesEl.dataset.bvCollapsed = '1';
      const preview  = fullText.slice(0, 200) + '…';
      const origHTML = notesEl.innerHTML;
      this._collapsedNotes.set(notesEl, origHTML);
      notesEl.textContent = preview;
      const toggle = D.createElement('button');
      toggle.className = 'ao3h-bv-note-toggle';
      toggle.textContent = 'Show more';
      toggle.addEventListener('click', () => {
        if (toggle.textContent === 'Show more') {
          notesEl.innerHTML = origHTML;
          notesEl.appendChild(toggle);
          toggle.textContent = 'Show less';
        } else {
          notesEl.textContent = preview;
          notesEl.appendChild(toggle);
          toggle.textContent = 'Show more';
        }
      });
      notesEl.appendChild(toggle);
    });
  }

  // ── Deleted/restricted badge ──────────────────────────────────────────────
  _checkDeleted (blurb) {
    const msg = blurb.querySelector('p.message');
    if (!msg) return;
    if (this.cfg('hideDeletedWorks')) {
      blurb.style.display = 'none';
      return;
    }
    if (blurb.querySelector('.ao3h-bv-unavail')) return;
    const badge = D.createElement('span');
    badge.className   = 'ao3h-bv-unavail';
    badge.textContent = '⚠️ Unavailable';
    msg.insertAdjacentElement('beforebegin', badge);
  }

  // ── Full-text search in notes ─────────────────────────────────────────────
  _injectNoteSearch () {
    if (D.getElementById('ao3h-bv-note-search')) return;
    const wrap = D.createElement('div');
    wrap.id    = 'ao3h-bv-note-search';
    const label = D.createElement('label');
    label.textContent = '🔍 Search notes: ';
    label.htmlFor = 'ao3h-bv-ns-input';
    const inp = D.createElement('input');
    inp.type        = 'search';
    inp.id          = 'ao3h-bv-ns-input';
    inp.placeholder = 'Search in bookmark notes…';
    const count = D.createElement('span');
    count.id = 'ao3h-bv-ns-count';
    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      let shown = 0;
      D.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
        const notes   = blurb.querySelector('.user.module.group blockquote.userstuff')?.textContent || '';
        const visible = !q || notes.toLowerCase().includes(q);
        blurb.style.display = visible ? '' : 'none';
        if (visible) shown++;
      });
      count.textContent = q ? `${shown} results` : '';
    });
    wrap.appendChild(label);
    wrap.appendChild(inp);
    wrap.appendChild(count);
    const anchor = D.querySelector('#main > h2, #main > h3');
    if (anchor) anchor.insertAdjacentElement('afterend', wrap);
    else D.getElementById('main')?.insertAdjacentElement('afterbegin', wrap);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  boot () {
    if (this._isWorkPage()) this._trackLastRead();
    if (this._isListingPage()) {
      this._collapseNotes(D.querySelectorAll('li.bookmark.blurb'));
      const obs = observe(D.getElementById('main') || D.body, { childList: true, subtree: true }, () => {
        this._collapseNotes(D.querySelectorAll('li.bookmark.blurb:not([data-bv-rst-done])'));
      });
      this._obs.push(obs);
      if (this._isBookmarksPage()) this._injectNoteSearch();
    }
  }

  stop () {
    this._obs.forEach(o => o.disconnect());
    this._obs = [];
    this._collapsedNotes.forEach((html, el) => { if (el.isConnected) el.innerHTML = html; });
    this._collapsedNotes.clear();
    D.querySelectorAll('.ao3h-bv-unavail, .ao3h-bv-note-toggle').forEach(e => e.remove());
    D.getElementById('ao3h-bv-note-search')?.remove();
    D.querySelectorAll('[data-bv-rst-done]').forEach(el => delete el.dataset.bvRstDone);
    D.querySelectorAll('[data-bv-collapsed]').forEach(el => delete el.dataset.bvCollapsed);
  }
}
