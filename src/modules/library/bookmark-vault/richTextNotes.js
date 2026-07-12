/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Rich Text Notes
    Submodule of: bookmarkVault

    - Auto-fill bookmark form (title, author, summary, work ID, tags)
    - Auto-tag fandom (first fandom tag) when autoTagFandom is on
    - Auto-tag AO3 rating (General/Teen/Mature/Explicit) when autoTagRating is on
    - Inline note editing on bookmark listing blurbs
    - Auto-save while typing; Markdown-style preview

═══════════════════════════════════════════════════════════════════════════ */

const D = document;
const SK_NOTES = 'ao3h:bookmarkVault:inlineNotes';
const SK_DATA  = 'ao3h:bookmarkVault:data';

export class RichTextNotes {
  constructor (cfgFn) {
    this.cfg  = cfgFn;
    this._obs = [];
    this._timers = new Set();
  }

  _loadNotes () {
    try { return JSON.parse(localStorage.getItem(SK_NOTES) || '{}'); }
    catch (_) { return {}; }
  }
  _saveNotes (n) { try { localStorage.setItem(SK_NOTES, JSON.stringify(n)); } catch (_) {} }

  _mdToHtml (text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  _isWorkOrSeries  () { return /^\/(works|series)\/\d+/.test(location.pathname); }
  _isBookmarksPage () { return /\/bookmarks/.test(location.pathname); }
  _getWorkId (blurb) {
    const a = blurb.querySelector('h4.heading a[href*="/works/"]');
    const m = (a?.getAttribute('href') || '').match(/\/works\/(\d+)/);
    return m ? m[1] : null;
  }
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
    const esc = s => String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const summary   = isSeries ? meta.summary : esc(meta.summary);
    const kindLabel = isSeries ? 'Series' : 'Fic';
    const idLabel   = isSeries ? 'SeriesID' : 'WorkID';
    const infoBlock = '<details><summary>' + kindLabel + ' Info</summary>' +
      '<b>' + esc(meta.title) + ' by ' + esc(meta.author) + '</b> (' + idLabel + ': ' + ids.id + ')' +
      '<blockquote>Summary: ' + summary + '</blockquote></details>';
    const old = String(notesEl.innerHTML || '');
    if (old.indexOf(ids.id) === -1) {
      notesEl.innerHTML = (old ? infoBlock + old : infoBlock).replace(/<img[^>]*>/gi, '');
    }
    if (this.cfg('privateByDefault')) {
      const privEl = D.getElementById('bookmark_private');
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
    const parts = (tagsEl.value || '').split(',').map(t => t.trim()).filter(t => t.length > 0);
    const seen  = new Set(parts.map(t => t.toLowerCase()));
    tags.forEach(t => { if (seen.has(t.toLowerCase()) === false) { parts.push(t); seen.add(t.toLowerCase()); } });
    tagsEl.value = parts.join(', ');
  }

  _processBlurbsForNotes (blurbs) {
    const notes = this._loadNotes();
    Array.from(blurbs).forEach(blurb => {
      if (blurb.dataset.bvRtnDone) return;
      blurb.dataset.bvRtnDone = '1';
      const wid = this._getWorkId(blurb);
      if (wid === null) return;
      const note = notes[wid] || '';
      const wrap = D.createElement('div');
      wrap.className = 'ao3h-bv-note-wrap';
      if (note) {
        const prev = D.createElement('span');
        prev.className = 'ao3h-bv-note-preview';
        prev.innerHTML = this._mdToHtml(note.length > 200 ? note.slice(0, 200) + '…' : note);

        wrap.appendChild(prev);
        wrap.appendChild(D.createTextNode(' '));
      }
      const btn = D.createElement('button');
      btn.className   = 'ao3h-bv-note-btn';
      btn.textContent = note ? '✏️' : '📝 Note';
      btn.title       = note ? 'Edit note' : 'Add note';
      btn.addEventListener('click', e => { e.preventDefault(); this._openEditor(blurb, wid, wrap, btn); });
      wrap.appendChild(btn);
      const userMod = blurb.querySelector('.user.module.group') || blurb;
      userMod.insertAdjacentElement('beforeend', wrap);
    });
  }

  _openEditor (blurb, wid, wrap, btn) {
    if (wrap.querySelector('.ao3h-bv-editor')) return;
    const notes  = this._loadNotes();
    const editor = D.createElement('div');
    editor.className = 'ao3h-bv-editor';
    const ta = D.createElement('textarea');
    ta.value = notes[wid] || '';
    ta.placeholder = 'Personal note… (Markdown: **bold**, *italic*)';
    ta.className = 'ao3h-bv-note-ta';
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
    editor.appendChild(ta);
    editor.appendChild(D.createElement('br'));
    editor.appendChild(saveBtn);
    editor.appendChild(cancelBtn);
    wrap.appendChild(editor);
    ta.focus();
  }

  _persistNote (wid, val) {
    const n = this._loadNotes();
    if (val) n[wid] = val; else delete n[wid];
    this._saveNotes(n);
    try {
      const d = JSON.parse(localStorage.getItem(SK_DATA) || '{}');
      if (d[wid]) { d[wid].notes = val.slice(0, 200); localStorage.setItem(SK_DATA, JSON.stringify(d)); }
    } catch (_) {}
  }

  _refreshPreview (wrap, btn, wid, val) {
    const prev = wrap.querySelector('.ao3h-bv-note-preview');
    if (val) {
      const html = this._mdToHtml(val.length > 200 ? val.slice(0, 200) + '…' : val);
      if (prev) { prev.innerHTML = html; }
      else {
        const newPrev = D.createElement('span');
        newPrev.className = 'ao3h-bv-note-preview';
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

  boot () {
    if (this.cfg('autoFillBookmarkForm') && this._isWorkOrSeries()) {
      const tryFill = () => { if (D.getElementById('bookmark_notes')) this._applyAutoFill(); };
      tryFill();
      const obs = new MutationObserver(tryFill);
      obs.observe(D.getElementById('main') || D.body, { childList: true, subtree: true });
      this._obs.push(obs);
    }
    if (this.cfg('inlineNoteEditing') && this._isBookmarksPage()) {
      this._processBlurbsForNotes(D.querySelectorAll('li.work.blurb, li.bookmark.blurb'));
      const obs2 = new MutationObserver(() => {
        this._processBlurbsForNotes(D.querySelectorAll(
          'li.work.blurb:not([data-bv-rtn-done]), li.bookmark.blurb:not([data-bv-rtn-done])'
        ));
      });
      obs2.observe(D.getElementById('main') || D.body, { childList: true, subtree: true });
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
