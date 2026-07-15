/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Marked for Later Status Submodule
    Submodule ID: markedForLaterStatus
    Display Name: MFL Status & List Tools
    Source Module: Later Shelf

    - Feature: 📌 badge on listing blurbs
      - Behaviour: Shown on all work/bookmark blurbs whose work is in the shelf
      - Behaviour: Badge appended to h4.heading automatically on page load
      - Behaviour: MutationObserver re-injects badges for dynamic content

    - Feature: MFL page enhancements (only on /readings?show=to-read)
      - Behaviour: Total work counter injected into page header
      - Behaviour: "Date added" label shown below each blurb's stats block
      - Behaviour: Sort toolbar (date added / title / word count / last updated)
      - Behaviour: Filter toolbar (WIP-only / Complete-only / word count range / fandom)
      - Behaviour: Per-blurb multi-select checkboxes
      - Behaviour: "Select all / Deselect all" toggle button
      - Behaviour: Batch delete — removes selected works from AO3 list + shelf storage

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { loadItems, saveItems } from './laterShelfStore.js';
import { appendHeadingBadge } from '../../../../lib/ui/status-badge.js';
import { observe } from '../../../../lib/utils/index.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { createBulkSelect } from '../../../../lib/ui/bulk-select.js';

const MOD = 'markedForLaterStatus';
const D   = document;

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

  // ── Helpers ──────────────────────────────────────────────────────────────
  function widFromBlurb (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  // ── 📌 badges on listing blurbs ──────────────────────────────────────────
  function injectMFLBadges () {
    const wids = new Set(loadItems().map(function (i) { return String(i.wid || i); }));
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      const wid = widFromBlurb(blurb);
      if (!wid || !wids.has(wid)) return;
      appendHeadingBadge(blurb, { className: 'ao3h-ls-badge', text: '📌', title: 'In your Later Shelf' });
    });
  }

  // ── MFL page: counter in header ──────────────────────────────────────────
  function injectCounter () {
    const h2 = D.querySelector('#main h2');
    if (!h2 || D.getElementById('ao3h-ls-count')) return;
    const blurbCount = D.querySelectorAll('.bookmark.blurb').length;
    var span = D.createElement('span');
    span.id = 'ao3h-ls-count';
    span.textContent = '(' + blurbCount + ' work' + (blurbCount !== 1 ? 's' : '') + ')';
    h2.appendChild(span);
  }

  // ── MFL page: date added on blurbs ───────────────────────────────────────
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

  // ── MFL page: sort + filter bar ──────────────────────────────────────────
  function injectSortBar () {
    if (D.getElementById('ao3h-ls-sort')) return;
    var bar = D.createElement('div');
    bar.id = 'ao3h-ls-sort';

    var sortLbl = D.createElement('strong');
    sortLbl.textContent = 'Sort:';
    var sortSel = D.createElement('select');
    sortSel.id = 'ao3h-ls-sort-sel';
    [['date','Date added'],['title','Title'],['words','Word count'],['updated','Last updated']].forEach(function (o) {
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

    [sortLbl, sortSel, wipLbl, compLbl, wcLbl, wc1, wc2, fanLbl, fanSel].forEach(function (el) { bar.appendChild(el); });

    var anchor = D.querySelector('#main h2, #main h3');
    if (anchor) anchor.insertAdjacentElement('afterend', bar);
  }

  function sortBlurbs (mode) {
    var ol = D.querySelector('ol.bookmark.index, ul.bookmark.index, ol.reading.index, ul.reading.index');
    if (!ol) return;
    var dateMap = {};
    loadItems().forEach(function (i) { if (i.wid) dateMap[String(i.wid)] = i.addedAt || 0; });
    var blurbs = Array.from(ol.querySelectorAll(':scope > li'));
    blurbs.sort(function (a, b) {
      if (mode === 'title') {
        var ta = (a.querySelector('h4.heading a') || {}).textContent || '';
        var tb = (b.querySelector('h4.heading a') || {}).textContent || '';
        return ta.toLowerCase().localeCompare(tb.toLowerCase());
      }
      if (mode === 'words') {
        var wa = parseInt(((a.querySelector('.words') || {}).textContent || '0').replace(/\D/g, ''), 10) || 0;
        var wb = parseInt(((b.querySelector('.words') || {}).textContent || '0').replace(/\D/g, ''), 10) || 0;
        return wb - wa;
      }
      if (mode === 'updated') {
        var ua = (a.querySelector('.datetime') || {}).textContent || '';
        var ub = (b.querySelector('.datetime') || {}).textContent || '';
        return new Date(ub) - new Date(ua);
      }
      var widA = widFromBlurb(a);
      var widB = widFromBlurb(b);
      return (dateMap[widB] || 0) - (dateMap[widA] || 0);
    });
    blurbs.forEach(function (bl) { ol.appendChild(bl); });
  }

  function applyFilters () {
    var wipChk  = D.getElementById('ao3h-ls-wip');
    var compChk = D.getElementById('ao3h-ls-comp');
    var wc1     = D.getElementById('ao3h-ls-wc1');
    var wc2     = D.getElementById('ao3h-ls-wc2');
    var fanSel  = D.getElementById('ao3h-ls-fandom');
    var wantWip  = wipChk  && wipChk.checked;
    var wantComp = compChk && compChk.checked;
    var minW = wc1 ? parseInt(wc1.value, 10) || 0 : 0;
    var maxW = wc2 ? parseInt(wc2.value, 10) || 0 : 0;
    var fandom = fanSel ? fanSel.value : '';
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
      if (!hiddenStates.has(blurb)) hiddenStates.set(blurb, blurb.hidden);
      blurb.hidden = !show;
      if (!show) blurb.dataset.lsHidden = '1';
      else delete blurb.dataset.lsHidden;
    });
  }

  // ── MFL page: multi-select + batch delete ────────────────────────────────
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
      var toRemove = new Set();
      selected.forEach(function (blurb) {
        var wid = widFromBlurb(blurb);
        if (wid) toRemove.add(wid);
        var form = blurb.querySelector('form[data-method="delete"], form[action*="mark_for_later"]');
        if (form) { form.submit(); } else { blurb.remove(); }
      });
      if (toRemove.size > 0) {
        saveItems(loadItems().filter(function (i) { return !toRemove.has(String(i.wid || i)); }));
      }
    },
  });

  function injectMultiSelect () {
    bulkSelect.scan();
  }

  // ── MutationObserver for dynamic content ─────────────────────────────────
  var observer = observe(D.body, { childList: true, subtree: true }, function () { injectMFLBadges(); });

  // ── Boot ─────────────────────────────────────────────────────────────────
  injectMFLBadges();
  if (isMFL) {
    rememberOriginalPositions();
    injectCounter();
    injectDateAdded();
    injectSortBar();
    injectMultiSelect();
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────
  return function cleanup () {
    observer.disconnect();
    bulkSelect.destroy();
    ['ao3h-ls-sort','ao3h-ls-count'].forEach(function (id) {
      var el = D.getElementById(id); if (el) el.remove();
    });
    D.querySelectorAll('.ao3h-ls-badge, .ao3h-ls-date').forEach(function (el) { el.remove(); });
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
