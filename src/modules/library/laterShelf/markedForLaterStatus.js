/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Marked-for-Later Status

Decorates shelf works across listings and enhances AO3’s marked-for-later page
with counts, dates, sorting, filtering, bulk removal, priority/notes/groups,
manual drag-and-drop reordering, a random pick, a reading-time budget picker,
grid view, and CSV/links export.

Notes

- Original work order and hidden states are retained for cleanup.
- Bulk removal updates both AO3 forms and Later Shelf persistence.
- Dynamic listing content receives badges through an observer.
- Priority/note/group editing and drag reorder only render on the MFL page
  itself; the 📌 badge and the "updated since you saved it" badge render on
  any listing where a shelved work's blurb appears.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { loadItems, saveItems, updateItem, removeItem, reorderItems, getGroups, cfg } from './laterShelfStore.js';
import { appendHeadingBadge } from '../../../../lib/ui/badges.js';
import { observe } from '../../../../lib/utils/index.js';
import { extractWorkIdFromBlurb, parseChapterCount } from '../../../../lib/ao3/parsers.js';
import { createBulkSelect } from '../../../../lib/ui/bulk-select.js';
import { showToast } from '../../../../lib/ui/toast.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { saveModuleSettings } from '../../../../lib/storage/module-settings.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { EV_WORK_FINISHED } from '../../../../lib/utils/event-names.js';
import {
  sortEntries, pickRandom, estimateTotalReadingMinutes,
  suggestByTimeBudget, detectUpdates, toCSV, toLinksList,
} from './laterShelfHelpers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'markedForLaterStatus';
const D   = document;
const W   = getGlobalWindow();

const LIST_SELECTOR = 'ol.bookmark.index, ul.bookmark.index, ol.reading.index, ul.reading.index';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'MFL Status & List Tools',
  parent: 'laterShelf',
  enabledByDefault: true,
}, function init () {
  const originalMarkers = new Map();
  const hiddenStates = new Map();

  const isMFL = /\/users\/[^/]+\/readings/.test(location.pathname) &&
                /show=to-read/.test(location.search);

  function rememberOriginalPositions () {
    D.querySelectorAll('ol.bookmark.index, ul.bookmark.index, ol.reading.index, ul.reading.index')
      .forEach(function (list) {
        Array.from(list.querySelectorAll(':scope > li')).forEach(function (blurb) {
          if (originalMarkers.has(blurb)) return;
          const marker = D.createComment('ao3h-ls-original-position');
          list.insertBefore(marker, blurb);
          originalMarkers.set(blurb, marker);
        });
      });
  }

  function widFromBlurb (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  function numFromBlurb (blurb, cls) {
    var stats = blurb.querySelector('dl.stats');
    var el = stats && stats.querySelector('dd.' + cls);
    if (!el) return null;
    var n = parseInt(el.textContent.replace(/\D/g, ''), 10);
    return isNaN(n) ? null : n;
  }

  function itemsMap () {
    var map = {};
    loadItems().forEach(function (i) { map[String(i.wid || i)] = i; });
    return map;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — SHELF BADGES AND METADATA
  ═══════════════════════════════════════════════════════════════════════ */

  function injectMFLBadges () {
    const wids = new Set(loadItems().map(function (i) { return String(i.wid || i); }));
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      const wid = widFromBlurb(blurb);
      if (!wid || !wids.has(wid)) return;
      appendHeadingBadge(blurb, { className: 'ao3h-ls-badge', text: '📌', title: 'In your Later Shelf' });
    });
  }

  /** "Updated since you saved it" — passive DOM comparison, no background crawling. */
  function injectUpdateBadges () {
    const map = itemsMap();
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      const wid = widFromBlurb(blurb);
      const item = map[wid];
      if (!item || item.chaptersAtAdd == null || blurb.querySelector('.ao3h-ls-update-badge')) return;
      const parsed = parseChapterCount(blurb.querySelector('dd.chapters'));
      const updates = detectUpdates(item, { chapters: parsed.published, complete: parsed.isComplete });
      if (!updates.hasNewChapter && !updates.hasCompleted) return;
      const badge = D.createElement('span');
      badge.className = 'ao3h-ls-update-badge';
      badge.textContent = updates.hasCompleted ? '✅ Completed!' : '🆕 New chapter';
      badge.title = updates.hasCompleted
        ? 'This work has been completed since you saved it'
        : 'This work has a new chapter since you saved it';
      const heading = blurb.querySelector('h4.heading');
      if (heading) heading.appendChild(badge);
    });
  }

  function injectCounter () {
    const h2 = D.querySelector('#main h2');
    if (!h2 || D.getElementById('ao3h-ls-count')) return;
    const blurbCount = D.querySelectorAll('.bookmark.blurb').length;
    var span = D.createElement('span');
    span.id = 'ao3h-ls-count';
    span.textContent = '(' + blurbCount + ' work' + (blurbCount !== 1 ? 's' : '') + ')';
    h2.appendChild(span);

    var words = Array.from(D.querySelectorAll('.bookmark.blurb .words'))
      .map(function (el) { return parseInt(el.textContent.replace(/\D/g, ''), 10) || 0; })
      .map(function (w) { return { words: w }; });
    var speed = (W.AO3H_ReadingTracker && typeof W.AO3H_ReadingTracker.getReadingSpeed === 'function')
      ? W.AO3H_ReadingTracker.getReadingSpeed() : null;
    var totalMinutes = estimateTotalReadingMinutes(words, speed || undefined);
    if (totalMinutes > 0 && !D.getElementById('ao3h-ls-time-total')) {
      var timeEl = D.createElement('div');
      timeEl.id = 'ao3h-ls-time-total';
      timeEl.textContent = '⏱ ~' + formatMinutes(totalMinutes) + ' total reading time';
      h2.insertAdjacentElement('afterend', timeEl);
    }
  }

  function formatMinutes (minutes) {
    var m = Math.round(minutes);
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), rem = m % 60;
    return h + 'h' + (rem ? ' ' + rem + 'min' : '');
  }

  function injectDateAdded () {
    var dateMap = {};
    loadItems().forEach(function (i) { if (i.wid && i.addedAt) dateMap[String(i.wid)] = i.addedAt; });
    D.querySelectorAll('.bookmark.blurb').forEach(function (blurb) {
      const wid = widFromBlurb(blurb);
      if (!wid || !dateMap[wid]) return;
      if (blurb.querySelector('.ao3h-ls-date')) return;
      var el = D.createElement('span');
      el.className   = 'ao3h-ls-date';
      el.textContent = 'Added ' + new Date(dateMap[wid]).toLocaleDateString();
      var stats = blurb.querySelector('dl.stats');
      if (stats) stats.insertAdjacentElement('afterend', el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — PRIORITY, NOTE, GROUP (per-item controls, MFL page only)
  ═══════════════════════════════════════════════════════════════════════ */

  function ensureGroupsDatalist () {
    var dl = D.getElementById('ao3h-ls-groups-datalist');
    if (!dl) {
      dl = D.createElement('datalist');
      dl.id = 'ao3h-ls-groups-datalist';
      D.body.appendChild(dl);
    }
    dl.innerHTML = '';
    getGroups().forEach(function (g) {
      var opt = D.createElement('option'); opt.value = g; dl.appendChild(opt);
    });
  }

  function injectItemControls () {
    const map = itemsMap();
    D.querySelectorAll('.bookmark.blurb').forEach(function (blurb) {
      const wid = widFromBlurb(blurb);
      const item = map[wid];
      if (!wid || !item || blurb.querySelector('.ao3h-ls-controls')) return;

      var row = D.createElement('div');
      row.className = 'ao3h-ls-controls';

      var prioritySel = D.createElement('select');
      prioritySel.className = 'ao3h-ls-priority-sel';
      prioritySel.title = 'Priority';
      [['high', '🔴 High'], ['normal', '🟡 Normal'], ['low', '🟢 Low']].forEach(function (o) {
        var opt = D.createElement('option');
        opt.value = o[0]; opt.textContent = o[1];
        if ((item.priority || 'normal') === o[0]) opt.selected = true;
        prioritySel.appendChild(opt);
      });
      prioritySel.addEventListener('change', function () { updateItem(wid, { priority: prioritySel.value }); });

      var groupInput = D.createElement('input');
      groupInput.type = 'text';
      groupInput.className = 'ao3h-ls-group-input';
      groupInput.placeholder = 'Group…';
      groupInput.value = item.group || '';
      groupInput.setAttribute('list', 'ao3h-ls-groups-datalist');
      groupInput.addEventListener('change', function () {
        updateItem(wid, { group: groupInput.value.trim() });
        ensureGroupsDatalist();
        refreshGroupFilterOptions();
      });

      var noteBtn = D.createElement('button');
      noteBtn.type = 'button';
      noteBtn.className = 'ao3h-ls-note-btn';
      noteBtn.textContent = item.note ? '📝 Edit note' : '📝 Add note';
      if (item.note) noteBtn.title = item.note;
      noteBtn.addEventListener('click', function () {
        var next = prompt('Note for this fic:', item.note || '');
        if (next === null) return;
        updateItem(wid, { note: next });
        item.note = next;
        noteBtn.textContent = next ? '📝 Edit note' : '📝 Add note';
        noteBtn.title = next || '';
      });

      row.appendChild(prioritySel);
      row.appendChild(groupInput);
      row.appendChild(noteBtn);

      var dateEl = blurb.querySelector('.ao3h-ls-date');
      var stats  = blurb.querySelector('dl.stats');
      var anchor = dateEl || stats;
      if (anchor) anchor.insertAdjacentElement('afterend', row);
      else blurb.appendChild(row);
    });
    ensureGroupsDatalist();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — SHELF SORTING AND FILTERING
  ═══════════════════════════════════════════════════════════════════════ */

  function refreshGroupFilterOptions () {
    var sel = /** @type {HTMLSelectElement|null} */ (D.getElementById('ao3h-ls-group-filter'));
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = '';
    var allOpt = D.createElement('option'); allOpt.value = ''; allOpt.textContent = 'All groups'; sel.appendChild(allOpt);
    getGroups().forEach(function (g) {
      var opt = D.createElement('option'); opt.value = g; opt.textContent = g; sel.appendChild(opt);
    });
    sel.value = current;
  }

  function injectSortBar () {
    if (D.getElementById('ao3h-ls-sort')) return;
    var bar = D.createElement('div');
    bar.id = 'ao3h-ls-sort';

    var sortLbl = D.createElement('strong');
    sortLbl.textContent = 'Sort:';
    var sortSel = D.createElement('select');
    sortSel.id = 'ao3h-ls-sort-sel';
    [
      ['date', 'Date added'], ['title', 'Title'], ['words', 'Word count'], ['updated', 'Last updated'],
      ['priority', 'Priority'], ['gems', 'Hidden gems first'], ['smart', 'Smart (priority + gems + oldest)'],
      ['manual', 'Manual (drag to reorder)'],
    ].forEach(function (o) {
      var opt = D.createElement('option');
      opt.value = o[0]; opt.textContent = o[1]; sortSel.appendChild(opt);
    });
    sortSel.addEventListener('change', function () { sortBlurbs(sortSel.value); });

    var wipLbl = D.createElement('label');
    var wipChk = D.createElement('input');
    wipChk.type = 'checkbox'; wipChk.id = 'ao3h-ls-wip';
    wipLbl.appendChild(wipChk);
    wipLbl.appendChild(D.createTextNode(' WIP only'));

    var compLbl = D.createElement('label');
    var compChk = D.createElement('input');
    compChk.type = 'checkbox'; compChk.id = 'ao3h-ls-comp';
    compLbl.appendChild(compChk);
    compLbl.appendChild(D.createTextNode(' Complete only'));

    wipChk.addEventListener('change', function () { if (wipChk.checked) compChk.checked = false; applyFilters(); });
    compChk.addEventListener('change', function () { if (compChk.checked) wipChk.checked = false; applyFilters(); });

    var wcLbl = D.createElement('span'); wcLbl.textContent = 'Words:';
    var wc1 = D.createElement('input');
    wc1.type = 'number'; wc1.id = 'ao3h-ls-wc1'; wc1.placeholder = 'min'; wc1.min = '0';
    var wc2 = D.createElement('input');
    wc2.type = 'number'; wc2.id = 'ao3h-ls-wc2'; wc2.placeholder = 'max'; wc2.min = '0';
    [wc1, wc2].forEach(function (el) { el.addEventListener('input', applyFilters); });

    var fanLbl = D.createElement('span'); fanLbl.textContent = 'Fandom:';
    var fanSel = D.createElement('select'); fanSel.id = 'ao3h-ls-fandom';
    var allOpt = D.createElement('option'); allOpt.value = ''; allOpt.textContent = 'All'; fanSel.appendChild(allOpt);
    var fanSet = new Set();
    D.querySelectorAll('.bookmark.blurb .fandoms a').forEach(function (a) { fanSet.add(a.textContent.trim()); });
    Array.from(fanSet).sort().forEach(function (f) {
      var opt = D.createElement('option'); opt.value = f; opt.textContent = f; fanSel.appendChild(opt);
    });
    fanSel.addEventListener('change', applyFilters);

    var groupSel = D.createElement('select'); groupSel.id = 'ao3h-ls-group-filter';
    groupSel.addEventListener('change', applyFilters);

    var gridLbl = D.createElement('label');
    var gridChk = D.createElement('input');
    gridChk.type = 'checkbox'; gridChk.id = 'ao3h-ls-grid-toggle';
    gridChk.checked = !!cfg('gridView');
    gridChk.addEventListener('change', function () {
      saveModuleSettings('laterShelf', { gridView: gridChk.checked });
      applyGridView(gridChk.checked);
    });
    gridLbl.appendChild(gridChk);
    gridLbl.appendChild(D.createTextNode(' Grid view'));

    var pickBtn = D.createElement('button');
    pickBtn.type = 'button'; pickBtn.textContent = '🎲 Pick for me';
    pickBtn.addEventListener('click', pickForMe);

    var timeInput = D.createElement('input');
    timeInput.type = 'number'; timeInput.id = 'ao3h-ls-time-budget'; timeInput.min = '1';
    timeInput.placeholder = 'minutes';
    timeInput.style.width = '70px';
    var timeBtn = D.createElement('button');
    timeBtn.type = 'button'; timeBtn.textContent = '⏱ Suggest';
    timeBtn.addEventListener('click', suggestForTime);

    var csvBtn = D.createElement('button');
    csvBtn.type = 'button'; csvBtn.textContent = '⬇ CSV';
    csvBtn.addEventListener('click', function () { downloadFile(toCSV(loadItems()), 'later-shelf.csv', 'text/csv;charset=utf-8'); });
    var linksBtn = D.createElement('button');
    linksBtn.type = 'button'; linksBtn.textContent = '⬇ Links';
    linksBtn.addEventListener('click', function () { downloadFile(toLinksList(loadItems()), 'later-shelf-links.txt', 'text/plain;charset=utf-8'); });

    [
      sortLbl, sortSel, wipLbl, compLbl, wcLbl, wc1, wc2, fanLbl, fanSel, groupSel, gridLbl,
      pickBtn, timeInput, timeBtn, csvBtn, linksBtn,
    ].forEach(function (el) { bar.appendChild(el); });

    var anchor = D.querySelector('#main h2, #main h3');
    if (anchor) anchor.insertAdjacentElement('afterend', bar);

    refreshGroupFilterOptions();
  }

  function buildEntry (blurb, map) {
    var wid = widFromBlurb(blurb);
    var item = map[wid] || {};
    return {
      wid: wid,
      blurbEl: blurb,
      title: (blurb.querySelector('h4.heading a') || {}).textContent || '',
      words: parseInt(((blurb.querySelector('.words') || {}).textContent || '0').replace(/\D/g, ''), 10) || 0,
      updated: (function () {
        var t = (blurb.querySelector('.datetime') || {}).textContent || '';
        return t ? new Date(t).getTime() : 0;
      })(),
      addedAt: item.addedAt || 0,
      order: item.order != null ? item.order : 0,
      priority: item.priority || 'normal',
      stats: { kudos: numFromBlurb(blurb, 'kudos'), hits: numFromBlurb(blurb, 'hits'), bookmarks: numFromBlurb(blurb, 'bookmarks') },
    };
  }

  function sortBlurbs (mode) {
    var ol = D.querySelector(LIST_SELECTOR);
    if (!ol) return;
    var map = itemsMap();
    var blurbs = Array.from(ol.querySelectorAll(':scope > li'));
    var entries = sortEntries(blurbs.map(function (b) { return buildEntry(b, map); }), mode);
    entries.forEach(function (entry) { ol.appendChild(entry.blurbEl); });
    toggleManualDragMode(mode === 'manual');
  }

  function toggleManualDragMode (enabled) {
    var ol = D.querySelector(LIST_SELECTOR);
    if (!ol) return;
    Array.from(ol.querySelectorAll(':scope > li')).forEach(function (blurb) {
      blurb.draggable = enabled;
      blurb.classList.toggle('ao3h-ls-draggable', enabled);
    });
  }

  var draggedEl = null;
  function onDragStart (e) {
    var li = e.target.closest && e.target.closest('li[draggable="true"]');
    if (!li) return;
    draggedEl = li;
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver (e) {
    if (!draggedEl) return;
    var li = e.target.closest && e.target.closest('li');
    if (!li || li === draggedEl || li.parentNode !== draggedEl.parentNode) return;
    e.preventDefault();
    var rect = li.getBoundingClientRect();
    var before = (e.clientY - rect.top) < rect.height / 2;
    li.parentNode.insertBefore(draggedEl, before ? li : li.nextSibling);
  }
  function onDrop (e) {
    if (!draggedEl) return;
    e.preventDefault();
    var ol = draggedEl.parentNode;
    var order = Array.from(ol.querySelectorAll(':scope > li')).map(widFromBlurb).filter(Boolean);
    reorderItems(order);
    draggedEl = null;
  }

  function pickForMe () {
    var visible = Array.from(D.querySelectorAll('.bookmark.blurb')).filter(function (b) { return !b.hidden; });
    var picked = pickRandom(visible);
    if (picked) highlightBlurb(picked);
  }

  function suggestForTime () {
    var input = /** @type {HTMLInputElement|null} */ (D.getElementById('ao3h-ls-time-budget'));
    var minutes = input ? parseInt(input.value, 10) : 0;
    if (!minutes || minutes <= 0) return;
    var visible = Array.from(D.querySelectorAll('.bookmark.blurb')).filter(function (b) { return !b.hidden; });
    var withWords = visible.map(function (b) {
      return { blurbEl: b, words: parseInt(((b.querySelector('.words') || {}).textContent || '0').replace(/\D/g, ''), 10) || 0 };
    });
    var speed = (W.AO3H_ReadingTracker && typeof W.AO3H_ReadingTracker.getReadingSpeed === 'function')
      ? W.AO3H_ReadingTracker.getReadingSpeed() : null;
    var picked = suggestByTimeBudget(withWords, minutes, speed || undefined);
    if (picked && picked.blurbEl) highlightBlurb(picked.blurbEl);
    else showToast('Nothing on the shelf matches that time budget yet.', { type: 'info' });
  }

  function highlightBlurb (blurb) {
    blurb.scrollIntoView({ behavior: 'smooth', block: 'center' });
    blurb.classList.add('ao3h-ls-picked');
    setTimeout(function () { blurb.classList.remove('ao3h-ls-picked'); }, 2500);
  }

  function applyGridView (enabled) {
    var ol = D.querySelector(LIST_SELECTOR);
    if (ol) ol.classList.toggle('ao3h-ls-grid', enabled);
  }

  function applyFilters () {
    var wipChk  = /** @type {HTMLInputElement|null} */ (D.getElementById('ao3h-ls-wip'));
    var compChk = /** @type {HTMLInputElement|null} */ (D.getElementById('ao3h-ls-comp'));
    var wc1     = /** @type {HTMLInputElement|null} */ (D.getElementById('ao3h-ls-wc1'));
    var wc2     = /** @type {HTMLInputElement|null} */ (D.getElementById('ao3h-ls-wc2'));
    var fanSel  = /** @type {HTMLSelectElement|null} */ (D.getElementById('ao3h-ls-fandom'));
    var groupSel = /** @type {HTMLSelectElement|null} */ (D.getElementById('ao3h-ls-group-filter'));
    var wantWip  = wipChk  && wipChk.checked;
    var wantComp = compChk && compChk.checked;
    var minW = wc1 ? parseInt(wc1.value, 10) || 0 : 0;
    var maxW = wc2 ? parseInt(wc2.value, 10) || 0 : 0;
    var fandom = fanSel ? fanSel.value : '';
    var group  = groupSel ? groupSel.value : '';
    var map = itemsMap();
    D.querySelectorAll('.bookmark.blurb').forEach(function (blurb) {
      var show = true;
      if (wantWip || wantComp) {
        var isComplete = blurb.querySelector('.work.complete') !== null;
        if (wantWip  && isComplete)  show = false;
        if (wantComp && !isComplete) show = false;
      }
      if (show && (minW > 0 || maxW > 0)) {
        var words = parseInt(((blurb.querySelector('.words') || {}).textContent || '0').replace(/\D/g, ''), 10) || 0;
        if (minW > 0 && words < minW) show = false;
        if (maxW > 0 && words > maxW) show = false;
      }
      if (show && fandom) {
        var fandoms = Array.from(blurb.querySelectorAll('.fandoms a')).map(function (a) { return a.textContent.trim(); });
        if (fandoms.indexOf(fandom) === -1) show = false;
      }
      if (show && group) {
        var wid = widFromBlurb(blurb);
        var item = map[wid];
        if (!item || (item.group || '') !== group) show = false;
      }
      if (!hiddenStates.has(blurb)) hiddenStates.set(blurb, blurb.hidden);
      blurb.hidden = !show;
      if (!show) blurb.dataset.lsHidden = '1';
      else delete blurb.dataset.lsHidden;
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — BULK SHELF REMOVAL (with undo when nothing was submitted to AO3)
  ═══════════════════════════════════════════════════════════════════════ */

  // lib/ui/bulk-select.js — fusionné avec organizationTools (shared.md, E6).
  var bulkSelect = createBulkSelect({
    blurbSelector: '.bookmark.blurb',
    barId:         'ao3h-ls-ms-bar',
    checkboxClass: 'ao3h-ls-chk',
    removeId:      'ao3h-ls-del',
    labels: {
      selectAll:   'Select all',
      deselectAll: 'Deselect all',
      remove:      '🗑 Remove selected',
    },
    onRemove: function (selected) {
      if (!confirm('Remove ' + selected.length + ' work' + (selected.length !== 1 ? 's' : '') + ' from your Later Shelf?')) return;
      var toRemove = [];
      var anyFormSubmitted = false;
      selected.forEach(function (blurb) {
        var wid = widFromBlurb(blurb);
        if (wid) toRemove.push(wid);
        var form = blurb.querySelector('form[data-method="delete"], form[action*="mark_for_later"]');
        if (form) { anyFormSubmitted = true; form.submit(); } else { blurb.remove(); }
      });
      var removedItems = [];
      if (toRemove.length > 0) {
        var toRemoveSet = new Set(toRemove);
        var items = loadItems();
        removedItems = items.filter(function (i) { return toRemoveSet.has(String(i.wid || i)); });
        saveItems(items.filter(function (i) { return !toRemoveSet.has(String(i.wid || i)); }));
      }
      if (!anyFormSubmitted && removedItems.length) {
        showToast(removedItems.length + ' work' + (removedItems.length !== 1 ? 's' : '') + ' removed from Later Shelf', {
          actionLabel: 'Undo',
          onAction: function () {
            var items = loadItems();
            removedItems.forEach(function (it) { items.push(it); });
            saveItems(items);
            injectMFLBadges();
          },
        });
      }
    },
  });

  function injectMultiSelect () {
    bulkSelect.scan();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — AUTO-REMOVE ON FINISH (opt-in, cross-module: ficAppreciation)
  ═══════════════════════════════════════════════════════════════════════ */

  function onWorkFinished (e) {
    if (!cfg('autoRemoveOnFinish')) return;
    var wid = String((e && e.detail && e.detail.workId) || '');
    if (!wid || !loadItems().some(function (i) { return String(i.wid || i) === wid; })) return;
    removeItem(wid, { archive: true });
    injectMFLBadges();
  }

  D.addEventListener(EV_WORK_FINISHED, onWorkFinished);

  var observer = observe(D.body, { childList: true, subtree: true }, function () {
    injectMFLBadges();
    injectUpdateBadges();
  });

  injectMFLBadges();
  injectUpdateBadges();
  if (isMFL) {
    rememberOriginalPositions();
    injectCounter();
    injectDateAdded();
    injectItemControls();
    injectSortBar();
    injectMultiSelect();
    applyGridView(!!cfg('gridView'));
    D.addEventListener('dragstart', onDragStart);
    D.addEventListener('dragover', onDragOver);
    D.addEventListener('drop', onDrop);
  }

  return function cleanup () {
    observer.disconnect();
    bulkSelect.destroy();
    D.removeEventListener(EV_WORK_FINISHED, onWorkFinished);
    D.removeEventListener('dragstart', onDragStart);
    D.removeEventListener('dragover', onDragOver);
    D.removeEventListener('drop', onDrop);
    ['ao3h-ls-sort', 'ao3h-ls-count', 'ao3h-ls-time-total', 'ao3h-ls-groups-datalist'].forEach(function (id) {
      var el = D.getElementById(id); if (el) el.remove();
    });
    D.querySelectorAll('.ao3h-ls-badge, .ao3h-ls-date, .ao3h-ls-controls, .ao3h-ls-update-badge').forEach(function (el) { el.remove(); });
    D.querySelectorAll('.ao3h-ls-draggable').forEach(function (el) { el.draggable = false; el.classList.remove('ao3h-ls-draggable'); });
    var ol = D.querySelector(LIST_SELECTOR);
    if (ol) ol.classList.remove('ao3h-ls-grid');
    hiddenStates.forEach(function (hidden, blurb) {
      blurb.hidden = hidden;
      delete blurb.dataset.lsHidden;
    });
    hiddenStates.clear();
    originalMarkers.forEach(function (marker, blurb) {
      marker.parentNode?.insertBefore(blurb, marker.nextSibling);
      marker.remove();
    });
    originalMarkers.clear();
  };

});
