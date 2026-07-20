/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Reading Status Tracking

Records the last time a work was opened and adds bookmark-list controls for
long notes, full-text note search, and unavailable works.

Notes

- Notes longer than 200 characters receive an expandable preview.
- Deleted or restricted works may be hidden or marked with a warning badge.
- Original note markup is restored when the component stops.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb, extractWorkIdFromHref, isListingPage } from '../../../../../lib/ao3/parsers.js';
import { observe } from '../../../../../lib/utils/index.js';
import { getGlobalWindow } from '../../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const D = document;
const W = getGlobalWindow();
const noteQueryMatch = (...args) => W.AO3H_BookmarkVault.noteQueryMatch(...args);
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
  // Sur les bookmarks d'un user précisément (pas /works/:id/bookmarks) —
  // même garde que l'ex-noteManagement.injectNotesSearch, fusionnée ici.
  _isBookmarksPage () { return /\/users\/[^/]+\/bookmarks/.test(location.pathname); }
  _isListingPage   () { return isListingPage(); }

  _getWorkId (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — LAST-READ TRACKING
  ═══════════════════════════════════════════════════════════════════════ */

  _trackLastRead () {
    const workId = extractWorkIdFromHref(location.pathname);
    if (!workId) return;
    const data = this._load(SK_LAST, {});
    data[workId] = Date.now();
    this._save(SK_LAST, data);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — NOTE COLLAPSE AND UNAVAILABLE WORKS
  ═══════════════════════════════════════════════════════════════════════ */

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

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — NOTE SEARCH
  ═══════════════════════════════════════════════════════════════════════ */

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
    inp.placeholder = 'Search in bookmark notes… (a && b, a || b)';
    inp.title       = 'Operators: "angst && fluff" requires both, "angst || fluff" matches either';
    const count = D.createElement('span');
    count.id = 'ao3h-bv-ns-count';
    const clearBtn = D.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = '✕';
    clearBtn.title = 'Clear search';
    function applyFilter () {
      const q = inp.value.trim();
      let shown = 0;
      D.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
        const notes   = blurb.querySelector('.user.module.group blockquote.userstuff')?.textContent || '';
        const visible = noteQueryMatch(notes, q);
        blurb.style.display = visible ? '' : 'none';
        if (visible) shown++;
      });
      count.textContent = q ? `${shown} results` : '';
    }
    inp.addEventListener('input', applyFilter);
    clearBtn.addEventListener('click', () => { inp.value = ''; applyFilter(); });
    wrap.appendChild(label);
    wrap.appendChild(inp);
    wrap.appendChild(clearBtn);
    wrap.appendChild(count);
    const anchor = D.querySelector('#main > h2, #main > h3');
    if (anchor) anchor.insertAdjacentElement('afterend', wrap);
    else D.getElementById('main')?.insertAdjacentElement('afterbegin', wrap);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

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
