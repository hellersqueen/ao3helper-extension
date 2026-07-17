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
import { getBookmarkVaultNote } from '../../../../lib/storage/keys.js';
import { computeMilestones, getHeatmapLevel } from './timelineStats.js';
import { getAnnotation, setAnnotation } from './dateAnnotations.js';
import { loadPresets, savePreset, getPreset, deletePreset } from './filterPresets.js';

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
   * @param {{ heatmapColor?: string, defaultView?: string, calendarRange?: number, heatmapIntensity?: string, analytics: import('./historyAnalytics.js').HistoryAnalytics }} opts
   */
  constructor ({ heatmapColor, defaultView = 'year', calendarRange = 5, heatmapIntensity = 'medium', analytics }) {
    this.analytics     = analytics;
    this.panel         = null;
    this.heatmapData   = {};
    this.currentYear   = new Date().getFullYear();
    this.currentMonth  = new Date().getMonth();
    this.currentView   = defaultView;
    this.calendarRange = calendarRange;
    this.intensity     = heatmapIntensity;
    this.palette       = HEATMAP_PALETTES[heatmapColor] || HEATMAP_PALETTES.green;
    this.searchQuery   = '';
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
    return this.palette[getHeatmapLevel(count, this.intensity)];
  }

  /** Build and return the heatmap grid DOM element for the given data/view. */
  buildHeatmapGrid (heatmapData, year, view = 'year', month = 0) {
    this.heatmapData  = heatmapData;
    this.currentYear  = year;
    this.currentView  = view;
    this.currentMonth = month;
    this.milestones   = computeMilestones(this.analytics?.heatmapData || heatmapData);

    const container = document.createElement('div');
    container.className = 'ao3h-timeline-heatmap';

    if (view === 'month') {
      container.appendChild(this._buildMonthGrid(heatmapData, year, month));
    } else {
      container.appendChild(this._buildYearGrid(heatmapData, year));
    }
    return container;
  }

  /** True when a day's works match the current search query. Used to
   *  highlight matching cells without hiding the rest of the calendar. */
  _matchesSearch (works) {
    if (!this.searchQuery) return false;
    const q = this.searchQuery.toLowerCase();
    return (works || []).some(w =>
      w.title.toLowerCase().includes(q) ||
      w.author.toLowerCase().includes(q) ||
      w.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  /** Applies the milestone/annotation/search-match modifier classes and
   *  tooltip suffix shared by both the year and month cell builders. */
  _decorateCell (cell, dateKey, works) {
    if (this.milestones?.[dateKey]) {
      cell.classList.add('ao3h-heatmap-cell--milestone');
      cell.title += ` — ${this.milestones[dateKey]}`;
    }
    if (getAnnotation(dateKey)) {
      cell.classList.add('ao3h-heatmap-cell--annotated');
    }
    if (this._matchesSearch(works)) {
      cell.classList.add('ao3h-heatmap-cell--search-match');
    }
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
      const works      = heatmapData[dateKey] || [];
      const worksCount = works.length;

      const cell        = document.createElement('div');
      cell.className    = 'ao3h-heatmap-cell ao3h-heatmap-cell--year';
      cell.dataset.date = dateKey;
      cell.title        = `${dateKey}: ${worksCount} work(s)`;
      cell.style.background = this.getHeatmapColor(worksCount);
      this._decorateCell(cell, dateKey, works);
      cell.addEventListener('click', () => {
        this._showDateDetails(dateKey, works);
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
      const works      = heatmapData[dateKey] || [];
      const worksCount = works.length;

      const cell        = document.createElement('div');
      cell.className    = `ao3h-heatmap-cell ao3h-heatmap-cell--month${worksCount > 0 ? ' ao3h-heatmap-cell--filled' : ''}`;
      cell.dataset.date = dateKey;
      cell.title        = `${dateKey}: ${worksCount} work(s)`;
      cell.style.background = this.getHeatmapColor(worksCount);
      cell.textContent = String(day);
      this._decorateCell(cell, dateKey, works);
      cell.addEventListener('click', () => {
        this._showDateDetails(dateKey, works);
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

  /** Highlights days matching a search query (a ring around the cell) without
   *  hiding the rest of the calendar — keeps the full activity picture while
   *  making matches stand out, rather than filtering days away. */
  filterBySearch (query, fullHeatmapData, year, view = 'year', month = 0) {
    this.searchQuery = query.trim();
    this.updateHeatmap(fullHeatmapData, year, view, month);
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

    // Saved filter presets
    const presetBox = document.createElement('div');
    presetBox.className = 'ao3h-filter-preset-box';
    const presetLbl = document.createElement('div');
    presetLbl.textContent = 'Saved Filters';
    presetLbl.className = 'ao3h-filter-group-label';
    presetBox.appendChild(presetLbl);

    const presetSelect = document.createElement('select');
    presetSelect.className = 'ao3h-filter-preset-select';
    const presetPlaceholder = document.createElement('option');
    presetPlaceholder.value = '';
    presetPlaceholder.textContent = '— Load a saved filter —';
    presetSelect.appendChild(presetPlaceholder);

    const refreshPresetOptions = () => {
      const selected = presetSelect.value;
      const presets  = loadPresets();
      presetSelect.innerHTML = '';
      presetSelect.appendChild(presetPlaceholder);
      presets.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name; opt.textContent = p.name;
        presetSelect.appendChild(opt);
      });
      presetSelect.value = presets.some(p => p.name === selected) ? selected : '';
    };
    refreshPresetOptions();

    const formRefs = {
      fandomInput: fandomGroup.input, authorInput: authorGroup.input,
      ratingChecks, statusRadios, wcMinInput: wcMin.input, wcMaxInput: wcMax.input,
      rangeSelect, dateFromInput: dateFrom.input, dateToInput: dateTo.input, customRange,
    };

    presetSelect.addEventListener('change', () => {
      if (!presetSelect.value) return;
      const preset = getPreset(presetSelect.value);
      if (!preset) return;
      this._applyCriteriaToForm(preset.criteria, formRefs);
      this._lastFiltered = this._applyFilterCriteria(this._getHeatmapData?.() || {}, preset.criteria);
      this.updateHeatmap(this._lastFiltered, this.currentYear, this.currentView, this.currentMonth);
    });

    const presetNameInput = document.createElement('input');
    presetNameInput.type = 'text';
    presetNameInput.placeholder = 'Name this filter…';
    presetNameInput.className = 'ao3h-filter-preset-name-input';

    const savePresetBtn = document.createElement('button');
    savePresetBtn.textContent = 'Save Filter';
    savePresetBtn.className = 'ao3h-filter-secondary-btn';
    savePresetBtn.addEventListener('click', () => {
      if (!presetNameInput.value.trim()) return;
      const criteria = this._collectFilterCriteria({
        fandomInput: fandomGroup.input, authorInput: authorGroup.input,
        ratingChecks, statusRadios, wcMin: wcMin.input, wcMax: wcMax.input,
        rangeSelect, dateFrom: dateFrom.input, dateTo: dateTo.input,
      });
      savePreset(presetNameInput.value, criteria);
      presetNameInput.value = '';
      refreshPresetOptions();
    });

    const deletePresetBtn = document.createElement('button');
    deletePresetBtn.textContent = 'Delete Selected';
    deletePresetBtn.className = 'ao3h-filter-secondary-btn';
    deletePresetBtn.addEventListener('click', () => {
      if (!presetSelect.value) return;
      deletePreset(presetSelect.value);
      refreshPresetOptions();
    });

    presetBox.appendChild(presetSelect);
    presetBox.appendChild(presetNameInput);
    presetBox.appendChild(savePresetBtn);
    presetBox.appendChild(deletePresetBtn);

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
    body.appendChild(presetBox);
    body.appendChild(btnBox);
    wrap.appendChild(body);

    return wrap;
  }

  /** Repopulates the filter form fields from a saved preset's criteria
   *  (the inverse of _collectFilterCriteria). */
  _applyCriteriaToForm (criteria, { fandomInput, authorInput, ratingChecks, statusRadios, wcMinInput, wcMaxInput, rangeSelect, dateFromInput, dateToInput, customRange }) {
    fandomInput.value = criteria.fandom || '';
    authorInput.value = criteria.author || '';
    Object.entries(ratingChecks).forEach(([r, cb]) => { cb.checked = (criteria.ratings || []).includes(r); });
    Object.entries(statusRadios).forEach(([s, rb]) => { rb.checked = s === (criteria.status || 'All'); });
    wcMinInput.value = criteria.wcMin ?? '';
    wcMaxInput.value = criteria.wcMax ?? '';
    if (criteria.dateStart || criteria.dateEnd) {
      rangeSelect.value = 'custom';
      customRange.style.display = 'flex';
      dateFromInput.value = criteria.dateStart ? new Date(criteria.dateStart).toISOString().slice(0, 10) : '';
      dateToInput.value   = criteria.dateEnd   ? new Date(criteria.dateEnd).toISOString().slice(0, 10)   : '';
    } else {
      rangeSelect.value = 'all';
      customRange.style.display = 'none';
      dateFromInput.value = ''; dateToInput.value = '';
    }
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

  /** Renders the current year's heatmap to a canvas and downloads it as a
   *  PNG — drawn from heatmapData directly (not a DOM screenshot), so no
   *  screenshot library is needed. PDF export was left out: it would need a
   *  PDF-generation dependency, which conflicts with keeping the bundle lean. */
  exportPNG () {
    const year        = this.currentYear;
    const data         = this._lastFiltered || this.analytics.heatmapData;
    const cellSize     = 12;
    const gap          = 3;
    const leftMargin   = 26;
    const topMargin    = 20;

    const jan1       = new Date(year, 0, 1);
    const offset     = (jan1.getDay() + 6) % 7; // 0 = Monday
    const startDate  = new Date(year, 0, 1);
    const endDate    = new Date(year, 11, 31);
    const totalDays  = offset + Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
    const cols       = Math.ceil(totalDays / 7);

    const canvas = document.createElement('canvas');
    canvas.width  = leftMargin + cols * (cellSize + gap);
    canvas.height = topMargin + 7 * (cellSize + gap);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333333';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Reading activity — ${year}`, leftMargin, 14);

    ctx.font = '9px sans-serif';
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((label, row) => {
      ctx.fillText(label, 0, topMargin + row * (cellSize + gap) + cellSize - 2);
    });

    let dayIndex = offset;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = this.getDateKey(d);
      const count   = data[dateKey]?.length || 0;
      const col     = Math.floor(dayIndex / 7);
      const row     = dayIndex % 7;
      ctx.fillStyle = this.getHeatmapColor(count);
      ctx.fillRect(leftMargin + col * (cellSize + gap), topMargin + row * (cellSize + gap), cellSize, cellSize);
      dayIndex++;
    }

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ao3-timeline-${year}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
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
    const exportPngBtn = this._btn('Export PNG', false);
    exportPngBtn.addEventListener('click', () => this.exportPNG());
    controls.appendChild(toggle);
    controls.appendChild(yearSel);
    controls.appendChild(monthSel);
    controls.appendChild(search);
    controls.appendChild(exportBtn);
    controls.appendChild(exportPngBtn);
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
    const existingNote  = getAnnotation(dateKey);
    if (!works.length && !existingNote) { detailsPanel.style.display = 'none'; return; }
    detailsPanel.style.display = 'block';
    detailsPanel.innerHTML = '';

    const h = document.createElement('h3');
    h.className = 'ao3h-timeline-details-heading';
    h.textContent = works.length ? `${dateKey} — ${works.length} work(s) read` : dateKey;
    detailsPanel.appendChild(h);

    const milestone = this.milestones?.[dateKey];
    if (milestone) {
      const banner = document.createElement('div');
      banner.className = 'ao3h-timeline-milestone-banner';
      banner.textContent = milestone;
      detailsPanel.appendChild(banner);
    }

    detailsPanel.appendChild(this._buildAnnotationEditor(dateKey, existingNote));

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

      const bookmarkNote = getBookmarkVaultNote(String(work.workId));
      if (bookmarkNote) {
        const noteEl = document.createElement('div');
        noteEl.className = 'ao3h-timeline-work-bookmark-note';
        noteEl.textContent = `📌 ${bookmarkNote}`;
        item.appendChild(noteEl);
      }

      detailsPanel.appendChild(item);
    });
  }

  /** Small editable note field for a single date ("holiday binge-read"). */
  _buildAnnotationEditor (dateKey, existingNote) {
    const wrap = document.createElement('div');
    wrap.className = 'ao3h-timeline-annotation';

    const input = document.createElement('input');
    input.type        = 'text';
    input.maxLength   = 140;
    input.placeholder = 'Add a note for this day (e.g. "holiday binge-read")';
    input.className   = 'ao3h-timeline-annotation-input';
    input.value       = existingNote || '';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save note';
    saveBtn.className   = 'ao3h-timeline-annotation-save';
    saveBtn.addEventListener('click', () => {
      setAnnotation(dateKey, input.value);
      this._refreshCellAnnotationState(dateKey);
    });

    wrap.appendChild(input);
    wrap.appendChild(saveBtn);
    return wrap;
  }

  /** Toggle the annotated-marker class on a single cell after saving a note,
   *  without a full grid re-render. */
  _refreshCellAnnotationState (dateKey) {
    const cell = this.panel?.querySelector(`.ao3h-heatmap-cell[data-date="${dateKey}"]`);
    if (!cell) return;
    cell.classList.toggle('ao3h-heatmap-cell--annotated', !!getAnnotation(dateKey));
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
