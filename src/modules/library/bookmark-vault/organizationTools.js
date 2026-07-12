/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Organization Tools
    Submodule of: bookmarkVault

    - Category creation + labels on blurbs
    - Filter by category on bookmarks page
    - Bulk selection (checkboxes + batch actions with confirmation)
    - Pin bookmarks to top of list

═══════════════════════════════════════════════════════════════════════════ */

const D = document;
const SK_CATS   = 'ao3h:bookmarkVault:categories';
const SK_PINNED = 'ao3h:bookmarkVault:pinned';

export class OrganizationTools {
  constructor (cfgFn) {
    this.cfg  = cfgFn;
    this._obs = [];
    this._bookmarkAddedHandler = null;
  }

  // ── Storage ──────────────────────────────────────────────────────────────
  _loadCats   () { try { return JSON.parse(localStorage.getItem(SK_CATS)   || '[]');  } catch (_) { return []; } }
  _saveCats   (c) { try { localStorage.setItem(SK_CATS,   JSON.stringify(c)); } catch (_) {} }
  _loadPinned () { try { return new Set(JSON.parse(localStorage.getItem(SK_PINNED) || '[]')); } catch (_) { return new Set(); } }
  _savePinned (s) { try { localStorage.setItem(SK_PINNED, JSON.stringify([...s])); } catch (_) {} }

  _isBookmarksPage () { return /\/users\/[^/]+\/bookmarks/.test(location.pathname); }
  _getWorkId (blurb) {
    const a = blurb.querySelector('h4.heading a[href*="/works/"]');
    const m = (a?.getAttribute('href') || '').match(/\/works\/(\d+)/);
    return m ? m[1] : null;
  }

  // ── Category labels on blurbs ─────────────────────────────────────────────
  _injectCategoryLabels (blurbs) {
    const cats = this._loadCats();
    if (!cats.length) return;
    const byWork = {};
    cats.forEach(c => (c.workIds || []).forEach(wid => {
      (byWork[wid] = byWork[wid] || []).push(c);
    }));
    Array.from(blurbs).forEach(blurb => {
      const wid = this._getWorkId(blurb);
      if (!wid || !byWork[wid]) return;
      const h4 = blurb.querySelector('h4.heading');
      if (!h4) return;
      byWork[wid].forEach(c => {
        const lbl = D.createElement('span');
        lbl.className     = 'ao3h-bv-cat-lbl';
        lbl.textContent   = c.name;
        lbl.dataset.catId = c.id;
        lbl.style.background = c.color || '#900';
        h4.appendChild(lbl);
      });
    });
  }

  // ── Category filter ───────────────────────────────────────────────────────
  _injectCategoryFilter () {
    if (D.getElementById('ao3h-bv-cf')) return;
    const cats = this._loadCats();
    if (!cats.length) return;
    const wrap = D.createElement('div');
    wrap.id    = 'ao3h-bv-cf';
    const lbl = D.createElement('strong');
    lbl.textContent = '📂 Category: ';
    wrap.appendChild(lbl);

    const mkBtn = (text, color, active, onClick) => {
      const btn = D.createElement('button');
      btn.textContent = text;
      btn.className   = 'ao3h-bv-cf-btn';
      btn.style.borderColor = color;
      btn.style.background  = active ? color : '';
      btn.style.color       = active ? '#fff' : color;
      btn.addEventListener('click', onClick);
      return btn;
    };

    wrap.appendChild(mkBtn('All', '#900', true, () => {
      D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(b => {
        b.style.display = '';
        delete b.dataset.bvOrgCfHidden;
      });
    }));
    cats.forEach(c => {
      const wids = new Set(c.workIds || []);
      wrap.appendChild(mkBtn(c.name, c.color || '#900', false, () => {
        D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(b => {
          const hide = !wids.has(this._getWorkId(b));
          b.style.display = hide ? 'none' : '';
          if (hide) b.dataset.bvOrgCfHidden = '1';
          else delete b.dataset.bvOrgCfHidden;
        });
      }));
    });

    const anchor = D.querySelector('#main > h2, #main > h3');
    if (anchor) anchor.insertAdjacentElement('afterend', wrap);
  }

  // ── Category manager panel ────────────────────────────────────────────────
  _injectCategoryManager () {
    if (D.getElementById('ao3h-bv-cm')) return;
    const panel = D.createElement('div');
    panel.id    = 'ao3h-bv-cm';
    const title = D.createElement('strong');
    title.textContent = '📂 My Categories';
    panel.appendChild(title);

    const list = D.createElement('ul');
    list.id = 'ao3h-bv-cm-list';
    const renderList = () => {
      list.innerHTML = '';
      this._loadCats().forEach(c => {
        const li = D.createElement('li');
        const dot = D.createElement('span');
        dot.className    = 'ao3h-bv-cat-dot';
        dot.style.background = c.color || '#900';
        li.appendChild(dot);
        li.append(`${c.name} (${(c.workIds||[]).length})`);
        list.appendChild(li);
      });
    };
    renderList();
    panel.appendChild(list);

    const form = D.createElement('div');
    form.className = 'ao3h-bv-cm-form';
    const nameIn  = D.createElement('input');
    nameIn.type   = 'text'; nameIn.placeholder = 'Category name…';
    const colorIn = D.createElement('input');
    colorIn.type  = 'color'; colorIn.value = '#c00040';
    const addBtn  = D.createElement('button');
    addBtn.textContent = '+ Add';
    addBtn.addEventListener('click', () => {
      const name = nameIn.value.trim();
      if (!name) return;
      const cats = this._loadCats();
      cats.push({ id: `cat_${Date.now()}`, name, color: colorIn.value, workIds: [] });
      this._saveCats(cats);
      nameIn.value = '';
      renderList();
    });
    form.appendChild(nameIn); form.appendChild(colorIn); form.appendChild(addBtn);
    panel.appendChild(form);

    const sidebar = D.querySelector('#sidebar, aside');
    if (sidebar) sidebar.insertAdjacentElement('afterbegin', panel);
    else D.querySelector('#main > h2')?.insertAdjacentElement('afterend', panel);
  }

  // ── Bulk selection ────────────────────────────────────────────────────────
  _injectBulkSelection (blurbs) {
    if (!D.getElementById('ao3h-bv-bulk-bar')) this._createBulkBar();
    Array.from(blurbs).forEach(blurb => {
      if (blurb.dataset.bvOrgDone) return;
      blurb.dataset.bvOrgDone = '1';
      const chk = D.createElement('input');
      chk.type  = 'checkbox'; chk.className = 'ao3h-bv-bulk-chk';
      blurb.style.position = 'relative';
      blurb.insertBefore(chk, blurb.firstChild);
      chk.addEventListener('change', () => this._updateBulkBar());
    });
  }

  _createBulkBar () {
    const bar = D.createElement('div');
    bar.id    = 'ao3h-bv-bulk-bar';
    const selAll = D.createElement('button');
    selAll.textContent = 'Select All';
    selAll.addEventListener('click', () => {
      const unchecked = D.querySelectorAll('.ao3h-bv-bulk-chk:not(:checked)').length > 0;
      D.querySelectorAll('.ao3h-bv-bulk-chk').forEach(c => c.checked = unchecked);
      selAll.textContent = unchecked ? 'Deselect All' : 'Select All';
      this._updateBulkBar();
    });
    const count = D.createElement('span');
    count.id = 'ao3h-bv-bulk-count';
    const delBtn = D.createElement('button');
    delBtn.textContent = '🗑 Remove Selected';
    delBtn.addEventListener('click', () => {
      const checked = Array.from(D.querySelectorAll('.ao3h-bv-bulk-chk:checked'));
      if (!checked.length) return;
      if (!window.confirm(`Remove ${checked.length} bookmark(s) from view?`)) return;
      checked.forEach(c => c.closest('li.work.blurb, li.bookmark.blurb')?.remove());
      this._updateBulkBar();
    });
    bar.appendChild(selAll); bar.appendChild(count); bar.appendChild(delBtn);
    const main = D.getElementById('main');
    if (main) main.insertBefore(bar, main.firstChild);
  }

  _updateBulkBar () {
    const bar   = D.getElementById('ao3h-bv-bulk-bar');
    const count = D.getElementById('ao3h-bv-bulk-count');
    if (!bar) return;
    const n = D.querySelectorAll('.ao3h-bv-bulk-chk:checked').length;
    bar.style.display = n ? '' : 'none';
    if (count) count.textContent = `${n} selected`;
  }

  // ── Pin bookmarks ─────────────────────────────────────────────────────────
  _injectPinButtons (blurbs) {
    const pinned = this._loadPinned();
    Array.from(blurbs).forEach(blurb => {
      if (blurb.querySelector('.ao3h-bv-pin-btn')) return;
      const wid = this._getWorkId(blurb);
      if (!wid) return;
      const isPinned = pinned.has(wid);
      const btn = D.createElement('button');
      btn.className   = 'ao3h-bv-pin-btn';
      btn.textContent = isPinned ? '📌 Pinned' : '📌 Pin';
      btn.style.borderColor = isPinned ? '#900' : '#ccc';
      btn.style.color       = isPinned ? '#900' : '#999';
      btn.addEventListener('click', () => {
        const p = this._loadPinned();
        const now = p.has(wid);
        if (now) { p.delete(wid); btn.textContent = '📌 Pin'; btn.style.borderColor = '#ccc'; btn.style.color = '#999'; }
        else     { p.add(wid);    btn.textContent = '📌 Pinned'; btn.style.borderColor = '#900'; btn.style.color = '#900'; }
        this._savePinned(p);
      });
      blurb.querySelector('h4.heading')?.insertAdjacentElement('afterend', btn);
    });
  }

  _sortPinnedToTop () {
    const pinned = this._loadPinned();
    if (!pinned.size) return;
    const ol = D.querySelector('ol.work.index, ul.work.index, ol.bookmark.index, ul.bookmark.index');
    if (!ol) return;
    Array.from(ol.querySelectorAll(':scope > li')).forEach(li => {
      if (pinned.has(this._getWorkId(li))) ol.insertBefore(li, ol.firstChild);
    });
  }

  // ── Sort bookmarks ────────────────────────────────────────────────────────
  _injectSortControls () {
    if (D.getElementById('ao3h-bv-sort')) return;
    const wrap = D.createElement('div');
    wrap.id    = 'ao3h-bv-sort';
    const lbl = D.createElement('strong');
    lbl.textContent = 'Sort: ';
    wrap.appendChild(lbl);
    const sel = D.createElement('select');
    const def = this.cfg('defaultSort') || 'date';
    [
      { val: 'date',   lbl: 'Date added' },
      { val: 'title',  lbl: 'Title' },
      { val: 'fandom', lbl: 'Fandom' },
    ].forEach(o => {
      const opt = D.createElement('option');
      opt.value = o.val; opt.textContent = o.lbl;
      if (o.val === def) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => this._sortBlurbs(sel.value));
    wrap.appendChild(sel);
    const anchor = D.querySelector('#main > h2, #main > h3');
    if (anchor) anchor.insertAdjacentElement('afterend', wrap);
    if (def !== 'date') this._sortBlurbs(def);
  }

  _sortBlurbs (mode) {
    const ol = D.querySelector('ol.work.index, ul.work.index, ol.bookmark.index, ul.bookmark.index');
    if (!ol) return;
    const blurbs = Array.from(ol.querySelectorAll(':scope > li'));
    blurbs.sort((a, b) => {
      if (mode === 'title') {
        const ta = (a.querySelector('h4.heading a')?.textContent || '').toLowerCase();
        const tb = (b.querySelector('h4.heading a')?.textContent || '').toLowerCase();
        return ta.localeCompare(tb);
      }
      if (mode === 'fandom') {
        const fa = (a.querySelector('h5.fandoms a')?.textContent || '').toLowerCase();
        const fb = (b.querySelector('h5.fandoms a')?.textContent || '').toLowerCase();
        return fa.localeCompare(fb);
      }
      return 0; // date: keep original order
    });
    blurbs.forEach(b => ol.appendChild(b));
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  boot () {
    if (this._isBookmarksPage() === false) return;
    const blurbs = D.querySelectorAll('li.work.blurb, li.bookmark.blurb');
    if (this.cfg('showCategoryLabels'))  this._injectCategoryLabels(blurbs);
    if (this.cfg('filterByCategory'))    this._injectCategoryFilter();
    if (this.cfg('createCategories'))    this._injectCategoryManager();
    if (this.cfg('bulkSelection'))       this._injectBulkSelection(blurbs);
    if (this.cfg('pinBookmarks'))      { this._injectPinButtons(blurbs); this._sortPinnedToTop(); }
    // defaultSort: inject sort controls
    this._injectSortControls();
    // assignToCategories: feature flag — auto-assign new bookmarks to matching categories
    const autoAssign = this.cfg('assignToCategories');
    if (autoAssign) {
      this._bookmarkAddedHandler = e => {
        const { workId, fandoms } = e.detail || {};
        if (!workId || !fandoms) return;
        const cats = this._loadCats();
        cats.forEach(c => {
          if (fandoms.some(f => c.name.toLowerCase() === f.toLowerCase())) {
            if (!c.workIds.includes(workId)) { c.workIds.push(workId); }
          }
        });
        this._saveCats(cats);
      };
      D.addEventListener('ao3h:bookmarkAdded', this._bookmarkAddedHandler);
    }

    const obs = new MutationObserver(() => {
      const fresh = D.querySelectorAll(
        'li.work.blurb:not([data-bv-org-done]), li.bookmark.blurb:not([data-bv-org-done])'
      );
      if (!fresh.length) return;
      if (this.cfg('showCategoryLabels')) this._injectCategoryLabels(fresh);
      if (this.cfg('bulkSelection'))      this._injectBulkSelection(fresh);
      if (this.cfg('pinBookmarks'))       this._injectPinButtons(fresh);
    });
    obs.observe(D.getElementById('main') || D.body, { childList: true, subtree: true });
    this._obs.push(obs);
  }

  stop () {
    this._obs.forEach(o => o.disconnect());
    this._obs = [];
    if (this._bookmarkAddedHandler) {
      D.removeEventListener('ao3h:bookmarkAdded', this._bookmarkAddedHandler);
      this._bookmarkAddedHandler = null;
    }
    D.querySelectorAll('.ao3h-bv-cat-lbl, .ao3h-bv-pin-btn, .ao3h-bv-bulk-chk').forEach(e => e.remove());
    D.getElementById('ao3h-bv-cf')?.remove();
    D.getElementById('ao3h-bv-cm')?.remove();
    D.getElementById('ao3h-bv-bulk-bar')?.remove();
    D.getElementById('ao3h-bv-sort')?.remove();
    D.querySelectorAll('[data-bv-org-cf-hidden]').forEach(el => {
      el.style.display = '';
      delete el.dataset.bvOrgCfHidden;
    });
    D.querySelectorAll('[data-bv-org-done]').forEach(el => delete el.dataset.bvOrgDone);
  }
}
