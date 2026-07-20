/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Chapter Navigation › Chapters Panel

A floating "📑 Chapters" button that opens a searchable chapter list: a mini
progress map (read / current / unread), star + personal note per chapter,
a "recently visited" shortlist for this work, and a copy-link action.

Notes

- Read/unread state is approximated from the Reading Tracker's last-known
  chapter (a soft dependency — the panel still works without it).
- Marks (star/note) are stored per work; recent chapters are session-scoped,
  since jumping around only matters within the current reading session.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { lsGet, lsSet, sessionGet, sessionSet } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const FAB_ID   = 'ao3h-chapters-fab';
const PANEL_ID = 'ao3h-chapters-panel';
const RECENT_CAP = 8;

export class ChaptersPanel {
  /** @param {{ NS, cfg, workId, helpers: typeof import('./_chapterNavigation.js').chapterNavigationHelpers }} opts */
  constructor ({ NS, cfg, workId, helpers }) {
    this.NS     = NS;
    this.cfg    = cfg;
    this.workId = workId;
    this.helpers = helpers;
    this._open  = false;
    this._onDocClick  = (e) => this._handleDocClick(e);
    this._onKeydown   = (e) => this._handleKeydown(e);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     STORAGE
  ═════════════════════════════════════════════════════════════════════════ */

  _marksKey ()  { return `ao3h:cn:marks:${this.workId}`; }
  _recentKey () { return `ao3h:cn:recent:${this.workId}`; }

  _getMarks ()  { return lsGet(this._marksKey(), {}) || {}; }
  _setMarks (m) { lsSet(this._marksKey(), m); }

  _getRecent ()  { return JSON.parse(sessionGet(this._recentKey(), '[]') || '[]'); }
  _setRecent (r) { sessionSet(this._recentKey(), JSON.stringify(r)); }

  _rtLastReadNum () {
    try {
      const progress = W.AO3H_ReadingTracker?.getProgress?.(this.workId)
        || lsGet(`ao3h:rt:progress:${this.workId}`);
      return progress?.chapter ?? null;
    } catch { return null; }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     DATA
  ═════════════════════════════════════════════════════════════════════════ */

  _readChapters () {
    const select = document.querySelector('select#selected_id');
    if (!select) return [];
    const options = Array.from(select.options).map(o => ({
      value: o.value, text: o.textContent, selected: o.selected,
    }));
    const parsed = this.helpers.parseChapterOptions(options);
    const currentId = parsed.find(c => c.selected)?.id ?? null;
    return this.helpers.buildChapterStates(parsed, { currentId, lastReadNum: this._rtLastReadNum() });
  }

  _chapterHref (id) {
    const wid = this.workId;
    return wid ? `/works/${wid}/chapters/${id}` : `#`;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — FLOATING BUTTON
  ═════════════════════════════════════════════════════════════════════════ */

  setup () {
    if (!this.cfg('chapterPanel')) return;
    if (document.getElementById(FAB_ID)) return;

    const fab = document.createElement('button');
    fab.id = FAB_ID;
    fab.type = 'button';
    fab.textContent = '📑 Chapters';
    fab.title = 'Browse, search, and mark chapters';
    fab.addEventListener('click', () => this._toggle());
    document.body.appendChild(fab);

    // Record this chapter as "recently visited" as soon as the panel boots.
    const current = this._readChapters().find(c => c.state === 'current');
    if (current) {
      this._setRecent(this.helpers.addRecentEntry(this._getRecent(), { id: current.id, num: current.num, title: current.title }, RECENT_CAP));
    }
  }

  teardown () {
    this._close();
    document.getElementById(FAB_ID)?.remove();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PANEL
  ═════════════════════════════════════════════════════════════════════════ */

  _toggle () { this._open ? this._close() : this._openPanel(); }

  _openPanel () {
    this._open = true;
    this._render('');
    document.addEventListener('click', this._onDocClick, true);
    document.addEventListener('keydown', this._onKeydown, true);
  }

  _close () {
    this._open = false;
    document.getElementById(PANEL_ID)?.remove();
    document.removeEventListener('click', this._onDocClick, true);
    document.removeEventListener('keydown', this._onKeydown, true);
  }

  _handleDocClick (e) {
    const panel = document.getElementById(PANEL_ID);
    const fab   = document.getElementById(FAB_ID);
    if (panel && !panel.contains(e.target) && e.target !== fab) this._close();
  }

  _handleKeydown (e) {
    if (e.key === 'Escape') this._close();
  }

  _render (query) {
    document.getElementById(PANEL_ID)?.remove();
    const { NS } = this;
    const chapters = this._readChapters();
    const marks    = this._getMarks();

    const panel = document.createElement('div');
    panel.id = PANEL_ID;

    // Search box
    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Search by number or title…';
    search.className = `${NS}-cp-search`;
    search.value = query;
    search.addEventListener('input', () => this._render(search.value));
    panel.appendChild(search);

    // Quick jumps
    const quick = document.createElement('div');
    quick.className = `${NS}-cp-quick`;
    const unread = this.helpers.firstUnreadChapter(chapters, this._rtLastReadNum());
    if (unread) quick.appendChild(this._linkBtn('▶ First unread', this._chapterHref(unread.id)));
    if (chapters.length) quick.appendChild(this._linkBtn('⏭ Last chapter', this._chapterHref(chapters[chapters.length - 1].id)));
    panel.appendChild(quick);

    // Recently visited
    const recent = this._getRecent().filter(r => chapters.some(c => c.id === r.id));
    if (recent.length > 1) {
      const recentWrap = document.createElement('div');
      recentWrap.className = `${NS}-cp-recent`;
      const label = document.createElement('span');
      label.textContent = 'Recent:';
      recentWrap.appendChild(label);
      recent.slice(0, 5).forEach(r => {
        recentWrap.appendChild(this._linkBtn(`Ch ${r.num}`, this._chapterHref(r.id)));
      });
      panel.appendChild(recentWrap);
    }

    // Chapter list
    const list = document.createElement('ul');
    list.className = `${NS}-cp-list`;
    this.helpers.filterChapters(chapters, query).forEach(ch => {
      list.appendChild(this._renderRow(ch, marks[ch.id]));
    });
    panel.appendChild(list);

    document.body.appendChild(panel);
    if (!query) search.focus();
  }

  _linkBtn (label, href) {
    const a = document.createElement('a');
    a.className = `${this.NS}-cp-linkbtn`;
    a.href = href;
    a.textContent = label;
    return a;
  }

  _renderRow (ch, mark) {
    const { NS } = this;
    const li = document.createElement('li');
    li.className = `${NS}-cp-row ${NS}-cp-row--${ch.state}`;

    const dot = document.createElement('span');
    dot.className = `${NS}-cp-dot`;
    dot.textContent = ch.state === 'read' ? '✓' : ch.state === 'current' ? '📍' : '';
    li.appendChild(dot);

    const link = document.createElement('a');
    link.href = this._chapterHref(ch.id);
    link.className = `${NS}-cp-title`;
    link.textContent = ch.title ? `${ch.num}. ${ch.title}` : `Chapter ${ch.num}`;
    li.appendChild(link);

    const star = document.createElement('button');
    star.type = 'button';
    star.className = `${NS}-cp-star` + (mark?.starred ? ' active' : '');
    star.title = mark?.starred ? 'Unmark favorite' : 'Mark as favorite / to reread';
    star.textContent = mark?.starred ? '★' : '☆';
    star.addEventListener('click', (e) => {
      e.preventDefault();
      const marks = this._getMarks();
      const entry = marks[ch.id] || {};
      entry.starred = !entry.starred;
      marks[ch.id] = entry;
      this._setMarks(marks);
      this._render(this._currentQuery());
    });
    li.appendChild(star);

    const noteBtn = document.createElement('button');
    noteBtn.type = 'button';
    noteBtn.className = `${NS}-cp-note-btn` + (mark?.note ? ' active' : '');
    noteBtn.title = 'Personal note for this chapter';
    noteBtn.textContent = '📝';
    noteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._toggleNoteEditor(li, ch);
    });
    li.appendChild(noteBtn);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = `${NS}-cp-copy`;
    copyBtn.title = 'Copy link to this chapter';
    copyBtn.textContent = '🔗';
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await navigator.clipboard.writeText(new URL(this._chapterHref(ch.id), location.origin).href); } catch {}
    });
    li.appendChild(copyBtn);

    if (mark?.note) {
      const noteText = document.createElement('div');
      noteText.className = `${NS}-cp-note-text`;
      noteText.textContent = mark.note;
      li.appendChild(noteText);
    }

    return li;
  }

  _currentQuery () {
    return /** @type {HTMLInputElement|null} */ (document.querySelector(`.${this.NS}-cp-search`))?.value || '';
  }

  _toggleNoteEditor (li, ch) {
    const existing = li.querySelector(`.${this.NS}-cp-note-editor`);
    if (existing) { existing.remove(); return; }

    const marks = this._getMarks();
    const editor = document.createElement('textarea');
    editor.className = `${this.NS}-cp-note-editor`;
    editor.value = marks[ch.id]?.note || '';
    editor.placeholder = 'Note for this chapter…';
    editor.addEventListener('blur', () => {
      const marks2 = this._getMarks();
      const entry  = marks2[ch.id] || {};
      const value  = editor.value.trim();
      if (value) entry.note = value; else delete entry.note;
      if (entry.starred || entry.note) marks2[ch.id] = entry; else delete marks2[ch.id];
      this._setMarks(marks2);
      this._render(this._currentQuery());
    });
    li.appendChild(editor);
    editor.focus();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// The coordinator constructs this on multi-chapter work pages and calls
// setup()/teardown() alongside the other chapterNavigation features.
