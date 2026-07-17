/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Timeline › Timeline Visualization

Builds the interactive reading-timeline panel, calendar heatmaps, date details,
search tools, advanced filters, and data exports.

Notes

- History data and aggregate operations are supplied by `HistoryAnalytics`.
- The configured palette is resolved once when the visualization is created.
- Cleanup removes both the panel and its injected navigation control.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { downloadFile } from '../../../../lib/utils/json-file.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const HEATMAP_PALETTES = {
  green:  ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  purple: ['#ebedf0', '#c9b8e8', '#a47bcd', '#7c4ea1', '#5a2d82'],
  orange: ['#ebedf0', '#ffd700', '#ffa500', '#ff6b35', '#cc4400'],
  blue:   ['#ebedf0', '#bdd9f7', '#74b2e4', '#3a7dc9', '#1a4f8a'],
};

export class TimelineVisualization {
  /**
   * @param {{ heatmapColor?: string, defaultView?: string, calendarRange?: number, analytics: import('./historyAnalytics.js').HistoryAnalytics }} opts
   */
  constructor ({ heatmapColor, defaultView = 'year', calendarRange = 5, analytics }) {
    this.analytics     = analytics;
    this.panel         = null;
    this.heatmapData   = {};
    this.currentYear   = new Date().getFullYear();
    this.currentMonth  = new Date().getMonth();
    this.currentView   = defaultView;
    this.calendarRange = calendarRange;
    this.palette       = HEATMAP_PALETTES[heatmapColor] || HEATMAP_PALETTES.green;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — HEATMAP VIEWS
  ═════════════════════════════════════════════════════════════════════════ */

  getDateKey (date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getHeatmapColor (count) {
    const p = this.palette;
    if (count === 0) return p[0];
    if (count === 1) return p[1];
    if (count === 2) return p[2];
    if (count <= 4)  return p[3];
    return p[4];
  }

  /** Build and return the heatmap grid DOM element for the given data/view. */
  buildHeatmapGrid (heatmapData, year, view = 'year', month = 0) {
    this.heatmapData  = heatmapData;
    this.currentYear  = year;
    this.currentView  = view;
    this.currentMonth = month;

    const container = document.createElement('div');
    container.className = 'ao3h-timeline-heatmap';

    if (view === 'month') {
      container.appendChild(this._buildMonthGrid(heatmapData, year, month));
    } else {
      container.appendChild(this._buildYearGrid(heatmapData, year));
    }
    return container;
  }

  /** Year-view: GitHub-style contribution graph (columns = weeks, rows = weekdays). */
  _buildYearGrid (heatmapData, year) {
    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const wrapper = document.createElement('div');
    wrapper.className = 'ao3h-timeline-year-wrapper';

    // Left axis: day-of-week labels
    const axis = document.createElement('div');
    axis.className = 'ao3h-timeline-day-axis';
    DAY_LABELS.forEach(name => {
      const lbl = document.createElement('div');
      lbl.textContent = name;
      lbl.className = 'ao3h-timeline-day-label';
      axis.appendChild(lbl);
    });
    wrapper.appendChild(axis);

    // Grid: 7 rows (Mon–Sun), auto-flow column, one column per week
    const grid = document.createElement('div');
    grid.className = 'ao3h-timeline-year-grid';

    // Leading empty cells so Jan 1 lands on the correct weekday row (Mon = 0)
    const jan1     = new Date(year, 0, 1);
    const offset   = (jan1.getDay() + 6) % 7; // 0 = Monday
    for (let i = 0; i < offset; i++) {
      const empty = document.createElement('div');
      empty.className = 'ao3h-timeline-grid-empty';
      grid.appendChild(empty);
    }

    const startDate = new Date(year, 0, 1);
    const endDate   = new Date(year, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey    = this.getDateKey(d);
      const worksCount = heatmapData[dateKey]?.length || 0;

      const cell        = document.createElement('div');
      cell.className    = 'ao3h-heatmap-cell ao3h-heatmap-cell--year';
      cell.dataset.date = dateKey;
      cell.title        = `${dateKey}: ${worksCount} work(s)`;
      cell.style.background = this.getHeatmapColor(worksCount);
      cell.addEventListener('click', () => {
        this._showDateDetails(dateKey, heatmapData[dateKey] || []);
      });

      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  /** Month-view: calendar grid (Mon–Sun columns) for the given year/month. */
  _buildMonthGrid (heatmapData, year, month) {
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_NAMES   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    const wrapper = document.createElement('div');

    const title       = document.createElement('div');
    title.textContent = `${MONTH_NAMES[month]} ${year}`;
    title.className   = 'ao3h-timeline-month-title';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'ao3h-timeline-month-grid';

    // Day-of-week header row
    DAY_NAMES.forEach(name => {
      const h = document.createElement('div');
      h.textContent = name;
      h.className   = 'ao3h-timeline-month-day-header';
      grid.appendChild(h);
    });

    // Leading empty cells (week starts Monday)
    const firstDay    = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // 0 = Monday
    for (let i = 0; i < startOffset; i++) {
      grid.appendChild(document.createElement('div'));
    }

    // Day cells
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey    = this.getDateKey(new Date(year, month, day));
      const worksCount = heatmapData[dateKey]?.length || 0;

      const cell        = document.createElement('div');
      cell.className    = `ao3h-heatmap-cell ao3h-heatmap-cell--month${worksCount > 0 ? ' ao3h-heatmap-cell--filled' : ''}`;
      cell.dataset.date = dateKey;
      cell.title        = `${dateKey}: ${worksCount} work(s)`;
      cell.style.background = this.getHeatmapColor(worksCount);
      cell.textContent = String(day);
      cell.addEventListener('click', () => {
        this._showDateDetails(dateKey, heatmapData[dateKey] || []);
      });

      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  /** Replace the heatmap section inside the panel. */
  updateHeatmap (heatmapData, year, view = 'year', month = 0) {
    const old = this.panel.querySelector('.ao3h-timeline-heatmap');
    const neo = this.buildHeatmapGrid(heatmapData, year ?? this.currentYear, view, month);
    if (old) {
      old.replaceWith(neo);
    } else {
      // Insert before the details pane to preserve DOM order: controls → heatmap → details
      const details = this.panel.querySelector('.ao3h-timeline-details');
      if (details) this.panel.insertBefore(neo, details);
      else         this.panel.appendChild(neo);
    }
  }

  /** Filter heatmapData by a search query, then re-render. */
  filterBySearch (query, fullHeatmapData, year, view = 'year', month = 0) {
    if (!query.trim()) {
      this.updateHeatmap(fullHeatmapData, year, view, month);
      return;
    }
    const lower    = query.toLowerCase();
    const filtered = {};
    Object.entries(fullHeatmapData).forEach(([date, works]) => {
      const matches = works.filter(w =>
        w.title.toLowerCase().includes(lower) ||
        w.author.toLowerCase().includes(lower) ||
        w.tags.some(t => t.toLowerCase().includes(lower))
      );
      if (matches.length) filtered[date] = matches;
    });
    this.updateHeatmap(filtered, year, view, month);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SEARCH, FILTERS, AND EXPORT
  ═════════════════════════════════════════════════════════════════════════ */

  /** Build and return the collapsible advanced-filters <details> element.
   *  @param {() => Object} getHeatmapData  Returns current full heatmapData. */
  buildFiltersPanel (getHeatmapData) {
    this._getHeatmapData = getHeatmapData;
    this._lastFiltered   = null;

    const RATINGS = ['Not Rated', 'General Audiences', 'Teen And Up Audiences', 'Mature', 'Explicit'];

    const wrap = document.createElement('details');
    wrap.className   = 'ao3h-filters-panel';

    const summary = document.createElement('summary');
    summary.textContent = '🔍 Advanced Filters';
    summary.className = 'ao3h-filters-summary';
    wrap.appendChild(summary);

    // ── Fandom datalist (populated on open) ──────────────────────────────
    const fandomList = document.createElement('datalist');
    fandomList.id    = 'ao3h-fandom-datalist';
    wrap.appendChild(fandomList);
    wrap.addEventListener('toggle', () => {
      if (!wrap.open) return;
      const fandoms = new Set();
      Object.values(this._getHeatmapData?.() || {}).forEach(works =>
        works.forEach(w => { if (w.fandom) fandoms.add(w.fandom); })
      );
      fandomList.innerHTML = '';
      fandoms.forEach(f => {
        const opt = document.createElement('option'); opt.value = f;
        fandomList.appendChild(opt);
      });
    });

    const body = document.createElement('div');
    body.className = 'ao3h-filters-body';

    // Fandom
    const fandomGroup = this._filterField('Fandom', 'text', { placeholder: 'e.g. Harry Potter', list: 'ao3h-fandom-datalist' });

    // Author
    const authorGroup = this._filterField('Author', 'text', { placeholder: 'Author name' });

    // Rating checkboxes
    const ratingBox = document.createElement('div');
    const ratingLbl = document.createElement('div');
    ratingLbl.textContent = 'Rating';
    ratingLbl.className = 'ao3h-filter-group-label';
    ratingBox.appendChild(ratingLbl);
    const ratingChecks = {};
    RATINGS.forEach(r => {
      const lbl = document.createElement('label');
      lbl.className = 'ao3h-filter-checkbox-label';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = r;
      ratingChecks[r] = cb;
      lbl.appendChild(cb); lbl.append(r);
      ratingBox.appendChild(lbl);
    });

    // Status radios
    const statusBox = document.createElement('div');
    const statusLbl = document.createElement('div');
    statusLbl.textContent = 'Status';
    statusLbl.className = 'ao3h-filter-group-label';
    statusBox.appendChild(statusLbl);
    const statusRadios = {};
    ['All', 'Complete', 'WIP'].forEach((s, i) => {
      const lbl = document.createElement('label');
      lbl.className = 'ao3h-filter-radio-label';
      const rb = document.createElement('input'); rb.type = 'radio'; rb.name = 'ao3h-filter-status'; rb.value = s;
      if (i === 0) rb.checked = true;
      statusRadios[s] = rb;
      lbl.appendChild(rb); lbl.append(s);
      statusBox.appendChild(lbl);
    });

    // Word count
    const wcBox = document.createElement('div');
    const wcLbl = document.createElement('div');
    wcLbl.textContent = 'Word Count';
    wcLbl.className = 'ao3h-filter-group-label';
    wcBox.appendChild(wcLbl);
    const wcMin = this._numInput('Min');
    const wcMax = this._numInput('Max');
    wcBox.appendChild(wcMin.wrap);
    wcBox.appendChild(wcMax.wrap);

    // Date range
    const dateBox = document.createElement('div');
    const dateLbl = document.createElement('div');
    dateLbl.textContent = 'Date Range';
    dateLbl.className = 'ao3h-filter-group-label';
    dateBox.appendChild(dateLbl);
    const rangeSelect = document.createElement('select');
    rangeSelect.className = 'ao3h-filter-range-select';
    [['all','All time'],['7','Last 7 days'],['30','Last 30 days'],['90','Last 3 months'],['365','Last year'],['custom','Custom range']].forEach(([v, t]) => {
      const opt = document.createElement('option'); opt.value = v; opt.textContent = t;
      rangeSelect.appendChild(opt);
    });
    const customRange = document.createElement('div');
    customRange.className = 'ao3h-filter-custom-range';
    const dateFrom = this._dateInput('From');
    const dateTo   = this._dateInput('To  ');
    customRange.appendChild(dateFrom.wrap);
    customRange.appendChild(dateTo.wrap);
    rangeSelect.addEventListener('change', () => {
      customRange.style.display = rangeSelect.value === 'custom' ? 'flex' : 'none';
    });
    dateBox.appendChild(rangeSelect);
    dateBox.appendChild(customRange);

    // Buttons
    const btnBox = document.createElement('div');
    btnBox.className = 'ao3h-filter-btn-box';

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Filters';
    applyBtn.className = 'ao3h-filter-apply-btn';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Filters';
    clearBtn.className = 'ao3h-filter-secondary-btn';

    const exportCsvBtn = document.createElement('button');
    exportCsvBtn.textContent = 'Export CSV';
    exportCsvBtn.className = 'ao3h-filter-secondary-btn';

    // Wire Apply
    applyBtn.addEventListener('click', () => {
      const criteria = this._collectFilterCriteria({
        fandomInput:  fandomGroup.input,
        authorInput:  authorGroup.input,
        ratingChecks, statusRadios,
        wcMin:        wcMin.input, wcMax: wcMax.input,
        rangeSelect,  dateFrom: dateFrom.input, dateTo: dateTo.input,
      });
      this._lastFiltered = this._applyFilterCriteria(this._getHeatmapData?.() || {}, criteria);
      this.updateHeatmap(this._lastFiltered, this.currentYear, this.currentView, this.currentMonth);
    });

    // Wire Clear
    clearBtn.addEventListener('click', () => {
      fandomGroup.input.value = '';
      authorGroup.input.value = '';
      Object.values(ratingChecks).forEach(cb => { cb.checked = false; });
      statusRadios['All'].checked = true;
      wcMin.input.value = ''; wcMax.input.value = '';
      rangeSelect.value = 'all';
      customRange.style.display = 'none';
      dateFrom.input.value = ''; dateTo.input.value = '';
      this._lastFiltered = null;
      this.updateHeatmap(this._getHeatmapData?.() || {}, this.currentYear, this.currentView, this.currentMonth);
    });

    // Wire Export CSV
    exportCsvBtn.addEventListener('click', () => {
      this._exportFilteredCSV(this._lastFiltered || this._getHeatmapData?.() || {});
    });

    btnBox.appendChild(applyBtn);
    btnBox.appendChild(clearBtn);
    btnBox.appendChild(exportCsvBtn);

    body.appendChild(fandomGroup.wrap);
    body.appendChild(authorGroup.wrap);
    body.appendChild(ratingBox);
    body.appendChild(statusBox);
    body.appendChild(wcBox);
    body.appendChild(dateBox);
    body.appendChild(btnBox);
    wrap.appendChild(body);

    return wrap;
  }

  /** Create a labeled text input group. Returns { wrap, input }. */
  _filterField (labelText, type, attrs = {}) {
    const wrap  = document.createElement('div');
    const lbl   = document.createElement('div');
    lbl.textContent = labelText;
    lbl.className = 'ao3h-filter-group-label';
    const input = document.createElement('input');
    input.type  = type;
    input.className = 'ao3h-filter-text-input';
    Object.entries(attrs).forEach(([k, v]) => { input.setAttribute(k, v); });
    wrap.appendChild(lbl); wrap.appendChild(input);
    return { wrap, input };
  }

  /** Create a labeled number input. Returns { wrap, input }. */
  _numInput (labelText) {
    const wrap  = document.createElement('div');
    wrap.className = 'ao3h-num-input-wrap';
    const lbl   = document.createElement('span');
    lbl.textContent = labelText;
    lbl.className = 'ao3h-num-input-label';
    const input = document.createElement('input');
    input.type        = 'number';
    input.min         = '0';
    input.placeholder = labelText;
    input.className = 'ao3h-num-input';
    wrap.appendChild(lbl); wrap.appendChild(input);
    return { wrap, input };
  }

  /** Create a labeled date input. Returns { wrap, input }. */
  _dateInput (labelText) {
    const wrap  = document.createElement('div');
    wrap.className = 'ao3h-date-input-wrap';
    const lbl   = document.createElement('span');
    lbl.textContent = labelText;
    lbl.className = 'ao3h-date-input-label';
    const input = document.createElement('input');
    input.type  = 'date';
    input.className = 'ao3h-date-input';
    wrap.appendChild(lbl); wrap.appendChild(input);
    return { wrap, input };
  }

  /** Collect filter criteria from the form inputs. */
  _collectFilterCriteria ({ fandomInput, authorInput, ratingChecks, statusRadios, wcMin, wcMax, rangeSelect, dateFrom, dateTo }) {
    const ratings = Object.entries(ratingChecks)
      .filter(([, cb]) => cb.checked)
      .map(([r]) => r);

    const status = Object.entries(statusRadios)
      .find(([, rb]) => rb.checked)?.[0] || 'All';

    let dateStart = null, dateEnd = null;
    const rng = rangeSelect.value;
    if (rng !== 'all') {
      if (rng === 'custom') {
        dateStart = dateFrom.value ? new Date(dateFrom.value)              : null;
        dateEnd   = dateTo.value   ? new Date(dateTo.value + 'T23:59:59') : null;
      } else {
        dateStart = new Date(Date.now() - parseInt(rng, 10) * 86_400_000);
        dateEnd   = new Date();
      }
    }

    return {
      fandom:    fandomInput.value.trim().toLowerCase(),
      author:    authorInput.value.trim().toLowerCase(),
      ratings,
      status,
      wcMin:     wcMin.value ? parseInt(wcMin.value, 10) : null,
      wcMax:     wcMax.value ? parseInt(wcMax.value, 10) : null,
      dateStart,
      dateEnd,
    };
  }

  /** Apply filter criteria to heatmapData and return filtered copy. */
  _applyFilterCriteria (heatmapData, { fandom, author, ratings, status, wcMin, wcMax, dateStart, dateEnd }) {
    const result = {};
    Object.entries(heatmapData).forEach(([dateKey, works]) => {
      if (dateStart || dateEnd) {
        const d = new Date(dateKey);
        if (dateStart && d < dateStart) return;
        if (dateEnd   && d > dateEnd)   return;
      }
      const matched = works.filter(w => {
        if (fandom   && !w.fandom.toLowerCase().includes(fandom))   return false;
        if (author   && !w.author.toLowerCase().includes(author))   return false;
        if (ratings.length && !ratings.includes(w.rating))          return false;
        if (status === 'Complete' && !w.completed)                  return false;
        if (status === 'WIP'      &&  w.completed)                  return false;
        if (wcMin !== null && w.wordCount < wcMin)                  return false;
        if (wcMax !== null && w.wordCount > wcMax)                  return false;
        return true;
      });
      if (matched.length) result[dateKey] = matched;
    });
    return result;
  }

  /** Export the given heatmapData as a CSV download. */
  _exportFilteredCSV (heatmapData) {
    const rows = [['Date','Work ID','Title','Author','Fandom','Rating','Word Count','Completed','Chapters Read']];
    Object.entries(heatmapData).sort().forEach(([date, works]) => {
      works.forEach(w => {
        rows.push([
          date,
          w.workId,
          `"${String(w.title  || '').replace(/"/g, '""')}"`,
          `"${String(w.author || '').replace(/"/g, '""')}"`,
          `"${String(w.fandom || '').replace(/"/g, '""')}"`,
          w.rating      || '',
          w.wordCount   || 0,
          w.completed   ? 'Yes' : 'No',
          w.chaptersRead || 1,
        ]);
      });
    });
    const csv  = rows.map(r => r.join(',')).join('\n');
    downloadFile(csv, `ao3-timeline-filtered-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PANEL AND CONTROLS
  ═════════════════════════════════════════════════════════════════════════ */

  createPanel () {
    const panel = document.createElement('div');
    panel.className = 'ao3h-reading-timeline-panel';
    panel.appendChild(this._createHeader());
    panel.appendChild(this._createControls());
    const details = document.createElement('div');
    details.className = 'ao3h-timeline-details';
    panel.appendChild(details);
    return panel;
  }

  _createHeader () {
    const header = document.createElement('div');
    header.className = 'ao3h-timeline-header';
    const title = document.createElement('h2');
    title.className = 'ao3h-timeline-title';
    title.textContent = '📖 Reading Timeline';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ao3h-timeline-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.hidePanel());
    header.appendChild(title);
    header.appendChild(closeBtn);
    return header;
  }

  _createControls () {
    const controls = document.createElement('div');
    controls.className = 'ao3h-timeline-controls';
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const isMonthDefault = this.currentView === 'month';
    const yearBtn  = this._btn('Year View',  !isMonthDefault);
    const monthBtn = this._btn('Month View',  isMonthDefault);
    const setActive = (active, inactive) => {
      active.classList.add('ao3h-btn--active');
      active.classList.remove('ao3h-btn--inactive');
      inactive.classList.remove('ao3h-btn--active');
      inactive.classList.add('ao3h-btn--inactive');
    };
    const monthSel = document.createElement('select');
    monthSel.className = 'ao3h-timeline-month-select';
    monthSel.style.display = isMonthDefault ? '' : 'none';
    MONTHS.forEach((name, i) => {
      const opt = document.createElement('option');
      opt.value = String(i); opt.textContent = name;
      if (i === this.currentMonth) opt.selected = true;
      monthSel.appendChild(opt);
    });
    monthSel.addEventListener('change', () => { this.currentMonth = parseInt(monthSel.value); this._refresh(); });
    yearBtn.addEventListener('click', () => {
      this.currentView       = 'year';
      monthSel.style.display = 'none';
      setActive(yearBtn, monthBtn);
      this._refresh();
    });
    monthBtn.addEventListener('click', () => {
      this.currentView       = 'month';
      monthSel.style.display = '';
      setActive(monthBtn, yearBtn);
      this._refresh();
    });
    const toggle = document.createElement('div');
    toggle.className = 'ao3h-timeline-view-toggle';
    toggle.appendChild(yearBtn);
    toggle.appendChild(monthBtn);
    const yearSel = document.createElement('select');
    yearSel.className = 'ao3h-timeline-year-select';
    const curYear = new Date().getFullYear();
    for (let y = curYear; y >= curYear - this.calendarRange; y--) {
      const opt = document.createElement('option');
      opt.value = String(y); opt.textContent = String(y);
      yearSel.appendChild(opt);
    }
    yearSel.addEventListener('change', () => { this.currentYear = parseInt(yearSel.value); this._refresh(); });
    const search = document.createElement('input');
    search.type        = 'text';
    search.placeholder = 'Search works (title, author, tags)...';
    search.className = 'ao3h-timeline-search';
    search.addEventListener('input', () => {
      this.filterBySearch(search.value, this.analytics.heatmapData, this.currentYear, this.currentView, this.currentMonth);
    });
    const exportBtn = this._btn('Export JSON', false);
    exportBtn.addEventListener('click', () => this.analytics.exportJSON());
    controls.appendChild(toggle);
    controls.appendChild(yearSel);
    controls.appendChild(monthSel);
    controls.appendChild(search);
    controls.appendChild(exportBtn);
    return controls;
  }

  _btn (text, active) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = `ao3h-timeline-btn ${active ? 'ao3h-btn--active' : 'ao3h-btn--inactive'}`;
    return btn;
  }

  _showDateDetails (dateKey, works) {
    const detailsPanel = this.panel.querySelector('.ao3h-timeline-details');
    if (!works.length) { detailsPanel.style.display = 'none'; return; }
    detailsPanel.style.display = 'block';
    detailsPanel.innerHTML = '';
    const h = document.createElement('h3');
    h.className = 'ao3h-timeline-details-heading';
    h.textContent = `${dateKey} — ${works.length} work(s) read`;
    detailsPanel.appendChild(h);
    works.forEach(work => {
      const item = document.createElement('div');
      item.className = 'ao3h-timeline-work-item';
      const title = document.createElement('div');
      title.className = 'ao3h-timeline-work-title';
      const titleLink = document.createElement('a');
      titleLink.href        = `/works/${encodeURIComponent(work.workId)}`;
      titleLink.target      = '_blank';
      titleLink.rel         = 'noopener noreferrer';
      titleLink.textContent = work.title;
      title.appendChild(titleLink);
      const meta = document.createElement('div');
      meta.className = 'ao3h-timeline-work-meta';
      meta.textContent = `by ${work.author} • ${work.fandom} • ${work.rating} • ${work.wordCount.toLocaleString()} words`;
      item.appendChild(title);
      item.appendChild(meta);
      detailsPanel.appendChild(item);
    });
  }

  _refresh () {
    this.analytics.loadReadingHistory();
    this.updateHeatmap(this.analytics.heatmapData, this.currentYear, this.currentView, this.currentMonth);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  showPanel () {
    if (!this.panel) {
      this.panel = this.createPanel();
      document.body.appendChild(this.panel);
      const filtersEl = this.buildFiltersPanel(() => this.analytics.heatmapData);
      const detailsEl = this.panel.querySelector('.ao3h-timeline-details');
      this.panel.insertBefore(filtersEl, detailsEl);
    }
    this._refresh();
    this.panel.style.display = 'flex';
  }

  hidePanel () {
    if (this.panel) this.panel.style.display = 'none';
  }

  createMenuButton () {
    const btn = document.createElement('button');
    btn.className   = 'ao3h-timeline-menu-btn';
    btn.textContent = '📖 Reading Timeline';
    btn.addEventListener('click', () => this.showPanel());
    return btn;
  }

  injectMenuButton () {
    const nav = document.querySelector('#header ul.primary.navigation');
    if (nav) {
      const li = document.createElement('li');
      li.appendChild(this.createMenuButton());
      nav.appendChild(li);
    }
  }

  cleanup () {
    this.panel?.remove();
    this.panel = null;
    document.querySelector('.ao3h-timeline-menu-btn')?.closest('li')?.remove();
    this.analytics?.cleanupDom();
    this.analytics = null;
  }
}
