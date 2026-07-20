/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Rich Text Notes

Auto-fills bookmark metadata and tags on work or series pages and provides
inline personal-note editing with Markdown-style previews on bookmark listings.

Notes

- Auto-fill avoids duplicating the current work or series identifier.
- Inline edits save after an 800 ms delay and update the bookmark cache preview.
- Pending save timers are cancelled during cleanup.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { observe, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { buildStarsEl } from './personalRatings.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { SK_DATA } from './bookmarkStatus/statusIndicators.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const D = document;
const W = getGlobalWindow();
const isImportantNote = (...args) => W.AO3H_BookmarkVault.isImportantNote(...args);
export const SK_NOTES = 'ao3h:bookmarkVault:inlineNotes';
export const NOTE_HISTORY_KEY = 'ao3h:bookmarkVault:noteHistory';
export const MAX_VERSIONS = 5;

function _loadNoteHistory (storage) {
  try {
    const data = JSON.parse(storage.getItem(NOTE_HISTORY_KEY) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

/**
 * Records `text` as a past version of the note (call it with the OLD value
 * before overwriting). Empty values and immediate duplicates are skipped.
 */
export function pushNoteVersion (wid, text, storage = localStorage, now = Date.now()) {
  const value = String(text || '').trim();
  if (!value) return;
  const data = _loadNoteHistory(storage);
  const list = Array.isArray(data[wid]) ? data[wid] : [];
  if (list[0]?.text === value) return;
  data[wid] = [{ text: value, at: now }, ...list].slice(0, MAX_VERSIONS);
  try { storage.setItem(NOTE_HISTORY_KEY, JSON.stringify(data)); } catch {}
}

/** Past versions, most recent first. @returns {{ text: string, at: number }[]} */
export function getNoteVersions (wid, storage = localStorage) {
  const list = _loadNoteHistory(storage)[wid];
  return Array.isArray(list) ? list.filter(v => v && typeof v.text === 'string') : [];
}

export class RichTextNotes {
  constructor (cfgFn) {
    this.cfg  = cfgFn;
    this._obs = [];
    this._timers = new Set();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — NOTE STORAGE AND MARKDOWN PREVIEWS
  ═══════════════════════════════════════════════════════════════════════ */

  _mdToHtml (text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  _isWorkOrSeries  () { return /^\/(works|series)\/\d+/.test(location.pathname); }
  _isBookmarksPage () { return /\/bookmarks/.test(location.pathname); }
  _getKindAndId () {
    const m = location.pathname.match(/\/(works|series)\/(\d+)/);
    return m ? { kind: m[1], id: m[2] } : null;
  }

  _cleanWS (s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  _getText  (sel) { return this._cleanWS(D.querySelector(sel)?.textContent || ''); }
  _digitsFromAny (x) {
    const m = String(x || '').replace(/[,\s  ]/g, '').match(/\d+/);
    return m ? parseInt(m[0], 10) : NaN;
  }
  _wordBucket (n) {
    if (Number.isFinite(n) === false) return '';
    if (n < 10000)  return '<10K words';
    if (n < 50000)  return '10-50K words';
    if (n < 100000) return '50-100K words';
    return '>100K words';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — BOOKMARK FORM AUTO-FILL
  ═══════════════════════════════════════════════════════════════════════ */

  _extractWork () {
    const title   = this._getText('.title.heading');
    const author  = this._getText('#workskin .preface .byline') ||
                    this._getText('[rel="author"]') || 'Anonymous';
    const summary = this._cleanWS(D.querySelector('.summary .userstuff, .summary')?.textContent || '') || 'no summary';
    const chapDD = D.evaluate(
      './/*[@id="main"]//dl[contains(@class,"stats")]//dt[text()="Chapters:"]/following-sibling::*[1]',
      D, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    const chapStr = this._cleanWS(chapDD?.textContent || '');
    let latest = NaN, total = NaN, isWIP = false;
    if (chapStr) {
      const [a, b] = chapStr.split('/');
      latest = this._digitsFromAny(a);
      total  = b === '?' ? NaN : this._digitsFromAny(b);
      isWIP  = Number.isFinite(total) === false || Number.isFinite(latest) === false || latest !== total;
    }
    const wordsDD = D.evaluate(
      './/*[@id="main"]//dl[contains(@class,"stats")]//dt[text()="Words:"]/following-sibling::*[1]',
      D, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    const wordsInt = this._digitsFromAny(wordsDD?.textContent || '');
    const fandom = this._cleanWS(D.querySelector('dd.fandom a.tag')?.textContent || '');
    const rating = this._cleanWS(D.querySelector('dd.rating a.tag')?.textContent || '');
    return { title, author, summary, isWIP, latest, total, wordsInt, fandom, rating };
  }

  _extractSeries () {
    const title   = this._getText('h2.heading') || this._getText('h2');
    const author  = this._getText('[rel="author"]') || 'Anonymous';
    const summary = this._cleanWS(D.querySelector('.series.meta.group .userstuff')?.textContent || '') || 'no series summary';
    const el = D.evaluate(
      '//dl[contains(@class,"series")][contains(@class,"meta")]//dl[contains(@class,"stats")]//dt[contains(text(),"Complete")]/following-sibling::*[1]',
      D, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    const isWIP = this._cleanWS(el?.textContent || '').toLowerCase() === 'no';
    return { title, author, summary, isWIP };
  }

  _applyAutoFill () {
    const notesEl = D.getElementById('bookmark_notes');
    const tagsEl  = D.getElementById('bookmark_tag_string_autocomplete') ||
                    D.querySelector('.input #bookmark_tag_string_autocomplete');
    if (notesEl === null || tagsEl === null) return;
    const ids = this._getKindAndId();
    if (ids === null) return;
    const isSeries = ids.kind === 'series';
    const meta     = isSeries ? this._extractSeries() : this._extractWork();
    const summary   = isSeries ? meta.summary : escapeHtml(meta.summary);
    const kindLabel = isSeries ? 'Series' : 'Fic';
    const idLabel   = isSeries ? 'SeriesID' : 'WorkID';
    const infoBlock = '<details><summary>' + kindLabel + ' Info</summary>' +
      '<b>' + escapeHtml(meta.title) + ' by ' + escapeHtml(meta.author) + '</b> (' + idLabel + ': ' + ids.id + ')' +
      '<blockquote>Summary: ' + summary + '</blockquote></details>';
    const old = String(notesEl.innerHTML || '');
    if (old.indexOf(ids.id) === -1) {
      notesEl.innerHTML = (old ? infoBlock + old : infoBlock).replace(/<img[^>]*>/gi, '');
    }
    if (this.cfg('privateByDefault')) {
      const privEl = /** @type {HTMLInputElement|null} */ (D.getElementById('bookmark_private'));
      if (privEl) privEl.checked = true;
    }
    const d   = new Date();
    const yr  = d.getFullYear();
    const mo  = String(d.getMonth() + 1).padStart(2, '0');
    const dy  = String(d.getDate()).padStart(2, '0');
    const ym  = yr + '-' + mo;
    const ymd = yr + '-' + mo + '-' + dy;
    const tags = [];
    if (meta.isWIP) {
      tags.push('WIP');
      if (isSeries === false && Number.isFinite(meta.latest)) tags.push('Read up to chapter ' + meta.latest);
    } else {
      const bucket = this._wordBucket(meta.wordsInt);
      if (bucket && isSeries === false) tags.push(bucket);
    }
    if (this.cfg('autoTagFandom') && !isSeries && meta.fandom) tags.push(meta.fandom);
    if (this.cfg('autoTagRating') && !isSeries && meta.rating) tags.push(meta.rating);
    tags.push('Read ' + ym.replace('-', '/'));
    tags.push('tracker ' + ymd);
    const tagsInput = /** @type {HTMLInputElement|HTMLTextAreaElement} */ (tagsEl);
    const parts = (tagsInput.value || '').split(',').map(t => t.trim()).filter(t => t.length > 0);
    const seen  = new Set(parts.map(t => t.toLowerCase()));
    tags.forEach(t => { if (seen.has(t.toLowerCase()) === false) { parts.push(t); seen.add(t.toLowerCase()); } });
    tagsInput.value = parts.join(', ');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — INLINE NOTE EDITING
  ═══════════════════════════════════════════════════════════════════════ */

  _processBlurbsForNotes (blurbs) {
    const notes = lsGet(SK_NOTES, {});
    Array.from(blurbs).forEach(blurb => {
      if (blurb.dataset.bvRtnDone) return;
      blurb.dataset.bvRtnDone = '1';
      const wid = extractWorkIdFromBlurb(blurb);
      if (wid === null) return;
      const note = notes[wid] || '';
      const wrap = D.createElement('div');
      wrap.className = 'ao3h-bv-note-wrap';
      if (note) {
        const prev = D.createElement('span');
        prev.className = 'ao3h-bv-note-preview';
        prev.classList.toggle('ao3h-bv-note-important', isImportantNote(note));
        prev.innerHTML = this._mdToHtml(note.length > 200 ? note.slice(0, 200) + '…' : note);

        wrap.appendChild(prev);
        wrap.appendChild(D.createTextNode(' '));
      }
      const btn = D.createElement('button');
      btn.className   = 'ao3h-bv-note-btn';
      btn.textContent = note ? '✏️' : '📝 Note';
      btn.title       = note ? 'Edit note' : 'Add note (start with "!" to highlight it)';
      btn.addEventListener('click', e => { e.preventDefault(); this._openEditor(blurb, wid, wrap, btn); });
      wrap.appendChild(btn);
      if (this.cfg('showPersonalRating')) {
        wrap.appendChild(D.createTextNode(' '));
        wrap.appendChild(buildStarsEl(wid, D));
      }
      const userMod = blurb.querySelector('.user.module.group') || blurb;
      userMod.insertAdjacentElement('beforeend', wrap);
    });
  }

  _openEditor (blurb, wid, wrap, btn) {
    if (wrap.querySelector('.ao3h-bv-editor')) return;
    const notes  = lsGet(SK_NOTES, {});
    const editor = D.createElement('div');
    editor.className = 'ao3h-bv-editor';
    const ta = D.createElement('textarea');
    ta.value = notes[wid] || '';
    ta.placeholder = 'Personal note… (Markdown: **bold**, *italic* — start with "!" to highlight)';
    ta.className = 'ao3h-bv-note-ta';

    // ── Note templates (only offered while the note is empty) ─────────────
    const TEMPLATES = {
      '📓 Reading log': '**Started:** \n**Finished:** \n**Thoughts:** \n',
      '💬 Quotes':      '**Favorite quotes:**\n> \n> \n',
      '💭 Reactions':   '**How it made me feel:** \n**Would re-read:** yes/no\n**Read next:** \n',
    };
    const tplRow = D.createElement('div');
    tplRow.className = 'ao3h-bv-note-tpls';
    Object.entries(TEMPLATES).forEach(([label, body]) => {
      const tplBtn = D.createElement('button');
      tplBtn.type = 'button';
      tplBtn.className = 'ao3h-bv-note-tpl';
      tplBtn.textContent = label;
      tplBtn.title = 'Insert this note template';
      tplBtn.addEventListener('click', () => {
        if (ta.value.trim() && !window.confirm('Replace the current note with this template?')) return;
        ta.value = body;
        ta.focus();
      });
      tplRow.appendChild(tplBtn);
    });

    // ── Previous versions of this note ────────────────────────────────────
    const versions = getNoteVersions(wid);
    let histSel = null;
    if (versions.length) {
      histSel = D.createElement('select');
      histSel.className = 'ao3h-bv-note-hist';
      const first = D.createElement('option');
      first.value = '';
      first.textContent = `↩ Previous versions (${versions.length})…`;
      histSel.appendChild(first);
      versions.forEach((v, idx) => {
        const opt = D.createElement('option');
        opt.value = String(idx);
        const label = v.text.length > 40 ? v.text.slice(0, 38) + '…' : v.text;
        opt.textContent = `${new Date(v.at).toLocaleDateString()} — ${label}`;
        histSel.appendChild(opt);
      });
      histSel.addEventListener('change', () => {
        const v = versions[parseInt(histSel.value, 10)];
        if (v) { ta.value = v.text; ta.focus(); }
        histSel.value = '';
      });
    }
    let timer = null;
    const clearSaveTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        this._timers.delete(timer);
        timer = null;
      }
    };
    ta.addEventListener('input', () => {
      clearSaveTimer();
      timer = setTimeout(() => {
        this._timers.delete(timer);
        timer = null;
        this._persistNote(wid, ta.value.trim());
      }, 800);
      this._timers.add(timer);
    });
    const saveBtn = D.createElement('button');
    saveBtn.textContent = '✓ Save';
    saveBtn.className = 'ao3h-bv-note-save';
    saveBtn.addEventListener('click', () => {
      clearSaveTimer();
      const val = ta.value.trim();
      this._persistNote(wid, val);
      editor.remove();
      this._refreshPreview(wrap, btn, wid, val);
    });
    const cancelBtn = D.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'ao3h-bv-note-cancel';
    cancelBtn.addEventListener('click', () => { clearSaveTimer(); editor.remove(); });
    editor.appendChild(tplRow);
    editor.appendChild(ta);
    editor.appendChild(D.createElement('br'));
    editor.appendChild(saveBtn);
    editor.appendChild(cancelBtn);
    if (histSel) editor.appendChild(histSel);
    wrap.appendChild(editor);
    ta.focus();
  }

  _persistNote (wid, val) {
    const n = lsGet(SK_NOTES, {});
    // Keep the overwritten version so it can be restored from the editor
    if ((n[wid] || '') !== val) pushNoteVersion(wid, n[wid] || '');
    if (val) n[wid] = val; else delete n[wid];
    lsSet(SK_NOTES, n);
    const d = lsGet(SK_DATA, {});
    if (d[wid]) { d[wid].notes = val.slice(0, 200); lsSet(SK_DATA, d); }
  }

  _refreshPreview (wrap, btn, wid, val) {
    const prev = wrap.querySelector('.ao3h-bv-note-preview');
    if (val) {
      const html = this._mdToHtml(val.length > 200 ? val.slice(0, 200) + '…' : val);
      if (prev) {
        prev.innerHTML = html;
        prev.classList.toggle('ao3h-bv-note-important', isImportantNote(val));
      }
      else {
        const newPrev = D.createElement('span');
        newPrev.className = 'ao3h-bv-note-preview';
        newPrev.classList.toggle('ao3h-bv-note-important', isImportantNote(val));
        newPrev.innerHTML = html;
        wrap.insertBefore(newPrev, btn);
        wrap.insertBefore(D.createTextNode(' '), btn);
      }
      btn.textContent = '✏️'; btn.title = 'Edit note';
    } else {
      if (prev) prev.remove();
      btn.textContent = '📝 Note'; btn.title = 'Add note';
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  /** Quick personal note directly from a work page (same store as listings). */
  _injectQuickNote () {
    const m = location.pathname.match(/^\/works\/(\d+)/);
    if (!m || D.querySelector('.ao3h-bv-quicknote')) return;
    const wid   = m[1];
    const title = D.querySelector('.title.heading');
    if (!title) return;

    const wrap = D.createElement('div');
    wrap.className = 'ao3h-bv-note-wrap ao3h-bv-quicknote';
    const note = lsGet(SK_NOTES, {})[wid] || '';
    if (note) {
      const prev = D.createElement('span');
      prev.className = 'ao3h-bv-note-preview';
      prev.classList.toggle('ao3h-bv-note-important', isImportantNote(note));
      prev.innerHTML = this._mdToHtml(note.length > 200 ? note.slice(0, 200) + '…' : note);
      wrap.appendChild(prev);
      wrap.appendChild(D.createTextNode(' '));
    }
    const btn = D.createElement('button');
    btn.className   = 'ao3h-bv-note-btn';
    btn.textContent = note ? '✏️' : '📝 Note';
    btn.title       = note ? 'Edit personal note' : 'Quick personal note (kept locally, never sent to AO3)';
    btn.addEventListener('click', e => { e.preventDefault(); this._openEditor(null, wid, wrap, btn); });
    wrap.appendChild(btn);
    if (this.cfg('showPersonalRating')) {
      wrap.appendChild(D.createTextNode(' '));
      wrap.appendChild(buildStarsEl(wid, D));
    }
    title.insertAdjacentElement('afterend', wrap);
  }

  boot () {
    if (this.cfg('quickNoteOnWorkPage') && /^\/works\/\d+/.test(location.pathname)) {
      this._injectQuickNote();
    }
    if (this.cfg('autoFillBookmarkForm') && this._isWorkOrSeries()) {
      const tryFill = () => { if (D.getElementById('bookmark_notes')) this._applyAutoFill(); };
      tryFill();
      const obs = observe(D.getElementById('main') || D.body, { childList: true, subtree: true }, tryFill);
      this._obs.push(obs);
    }
    if (this.cfg('inlineNoteEditing') && this._isBookmarksPage()) {
      this._processBlurbsForNotes(D.querySelectorAll('li.work.blurb, li.bookmark.blurb'));
      const obs2 = observe(D.getElementById('main') || D.body, { childList: true, subtree: true }, () => {
        this._processBlurbsForNotes(D.querySelectorAll(
          'li.work.blurb:not([data-bv-rtn-done]), li.bookmark.blurb:not([data-bv-rtn-done])'
        ));
      });
      this._obs.push(obs2);
    }
  }

  stop () {
    this._timers.forEach(timer => clearTimeout(timer));
    this._timers.clear();
    this._obs.forEach(o => o.disconnect());
    this._obs = [];
    D.querySelectorAll('.ao3h-bv-note-wrap').forEach(e => e.remove());
    D.querySelectorAll('[data-bv-rtn-done]').forEach(el => delete el.dataset.bvRtnDone);
  }
}
