/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Quick Mark for Later Button

Adds a configurable save-for-later control to work and bookmark blurbs.

Features

- Injects a quick-save button into each blurb heading (position configurable).
- Reflects whether a work is already stored in the Later Shelf.
- Adds or removes works immediately and keeps the related status badge in sync.
- Optional note prompt on add, and an "Undo" toast after add/remove.
- Optional bulk-add from any listing page, and one-click whole-series add.
- Re-injects controls when AO3 loads dynamic content.

Notes

- The `showQuickButton` setting enables or disables the feature.
- Removing a work archives it (see laterShelfStore.removeItem) rather than
  deleting it outright — the Undo toast restores it from that archive.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { loadItems, addItem, removeItem, restoreItem, cfg } from './laterShelfStore.js';
import { observe } from '../../../../lib/utils/index.js';
import { appendHeadingBadge } from '../../../../lib/ui/badges.js';
import { extractWorkIdFromBlurb, getBlurbMeta, parseChapterCount } from '../../../../lib/ao3/parsers.js';
import { showToast } from '../../../../lib/ui/toast.js';
import { createBulkSelect } from '../../../../lib/ui/bulk-select.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'quickMarkForLaterButton';
const D   = document;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Quick Mark for Later Button',
  parent: 'laterShelf',
  enabledByDefault: true,
}, function init () {

  if (!cfg('showQuickButton')) return function cleanup () {};

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SHELF HELPERS
  ═════════════════════════════════════════════════════════════════════════ */

  function titleFromBlurb (blurb) {
    return getBlurbMeta(blurb)?.title || '';
  }

  function chapterSnapshotFromBlurb (blurb) {
    var parsed = parseChapterCount(blurb && blurb.querySelector('dd.chapters'));
    return { chaptersAtAdd: parsed.published, completeAtAdd: parsed.isComplete };
  }

  function isInShelf (wid) {
    return loadItems().some(function (i) { return String(i.wid || i) === String(wid); });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — QUICK-SAVE BUTTON
  ═════════════════════════════════════════════════════════════════════════ */

  function makeBtn (wid, title, active) {
    var btn = D.createElement('button');
    btn.type = 'button';
    btn.className = 'ao3h-ls-btn' + (active ? ' ao3h-ls-active' : '');
    btn.dataset.lsWid = wid;
    btn.textContent = active ? '📌 Saved' : '📌 Save for later';
    btn.title = active ? 'Remove from Later Shelf' : 'Add to Later Shelf';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var blurb = btn.closest('li.work.blurb, li.bookmark.blurb');
      var nowActive = btn.classList.contains('ao3h-ls-active');
      if (nowActive) {
        removeItem(wid, { archive: true });
        btn.classList.remove('ao3h-ls-active');
        btn.textContent = '📌 Save for later';
        btn.title = 'Add to Later Shelf';
        if (blurb) {
          var badge = blurb.querySelector('.ao3h-ls-badge');
          if (badge) badge.remove();
        }
        showToast('Removed from Later Shelf', {
          actionLabel: 'Undo',
          onAction: function () {
            restoreItem(wid);
            btn.classList.add('ao3h-ls-active');
            btn.textContent = '📌 Saved';
            btn.title = 'Remove from Later Shelf';
            if (blurb) appendHeadingBadge(blurb, { className: 'ao3h-ls-badge', text: '📌', title: 'In your Later Shelf' });
          },
        });
      } else {
        var note = cfg('noteOnAdd') ? (prompt('Quick note for "' + title + '" (optional):') || '') : '';
        var extra = Object.assign({}, chapterSnapshotFromBlurb(blurb), note ? { note: note } : {});
        addItem(wid, title, extra);
        btn.classList.add('ao3h-ls-active');
        btn.textContent = '📌 Saved';
        btn.title = 'Remove from Later Shelf';
        if (blurb) {
          appendHeadingBadge(blurb, { className: 'ao3h-ls-badge', text: '📌', title: 'In your Later Shelf' });
        }
        showToast('Added to Later Shelf', {
          actionLabel: 'Undo',
          onAction: function () {
            removeItem(wid, { archive: false });
            btn.classList.remove('ao3h-ls-active');
            btn.textContent = '📌 Save for later';
            btn.title = 'Add to Later Shelf';
            if (blurb) {
              var b = blurb.querySelector('.ao3h-ls-badge');
              if (b) b.remove();
            }
          },
        });
      }
    });
    return btn;
  }

  function placeButton (blurb, btn) {
    var position = cfg('buttonPosition') || 'after-title';
    var heading = blurb.querySelector('h4.heading');
    if (position === 'before-title' && heading) {
      heading.insertBefore(btn, heading.firstChild);
    } else if (position === 'end-of-blurb') {
      blurb.appendChild(btn);
    } else if (heading) {
      heading.appendChild(btn);
    } else {
      blurb.appendChild(btn);
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BUTTON INJECTION
  ═════════════════════════════════════════════════════════════════════════ */

  function injectButtons () {
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      if (blurb.querySelector('.ao3h-ls-btn')) return;
      var wid = extractWorkIdFromBlurb(blurb);
      if (!wid) return;
      var title = titleFromBlurb(blurb);
      var active = isInShelf(wid);
      var btn = makeBtn(wid, title, active);
      placeButton(blurb, btn);
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — ADD WHOLE SERIES IN ONE CLICK
  ═════════════════════════════════════════════════════════════════════════ */

  function isSeriesPage () {
    return /^\/series\/\d+/.test(location.pathname);
  }

  function injectSeriesAddButton () {
    if (!isSeriesPage() || D.getElementById('ao3h-ls-series-add')) return;
    var main = D.getElementById('main');
    if (!main) return;
    var btn = D.createElement('button');
    btn.type = 'button';
    btn.id = 'ao3h-ls-series-add';
    btn.className = 'ao3h-ls-series-btn';
    btn.textContent = '📌 Add whole series to Later Shelf';
    btn.addEventListener('click', function () {
      var added = 0;
      main.querySelectorAll('li.work.blurb').forEach(function (blurb) {
        var wid = extractWorkIdFromBlurb(blurb);
        if (!wid || isInShelf(wid)) return;
        addItem(wid, titleFromBlurb(blurb), chapterSnapshotFromBlurb(blurb));
        added++;
      });
      injectButtons();
      showToast(added ? ('Added ' + added + ' work' + (added > 1 ? 's' : '') + ' to Later Shelf') : 'Already all in your Later Shelf',
        { type: 'success' });
    });
    var meta = main.querySelector('.series.meta, dl.series.meta');
    if (meta) meta.insertAdjacentElement('afterend', btn);
    else main.insertBefore(btn, main.firstChild);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BULK-ADD FROM ANY LISTING PAGE
  ═════════════════════════════════════════════════════════════════════════ */

  var bulkAdd = null;
  if (cfg('bulkAddEnabled')) {
    bulkAdd = createBulkSelect({
      id: 'ao3h-ls-bulk-add',
      labels: { remove: '📌 Add Selected to Shelf' },
      onRemove: function (blurbs) {
        var added = 0;
        blurbs.forEach(function (blurb) {
          var wid = extractWorkIdFromBlurb(blurb);
          if (!wid || isInShelf(wid)) return;
          addItem(wid, titleFromBlurb(blurb), chapterSnapshotFromBlurb(blurb));
          added++;
        });
        injectButtons();
        showToast(added + ' work' + (added === 1 ? '' : 's') + ' added to Later Shelf', { type: 'success' });
      },
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — DYNAMIC CONTENT
  ═════════════════════════════════════════════════════════════════════════ */

  var debTimer = null;
  var observer = observe(D.body, { childList: true, subtree: true }, function () {
    clearTimeout(debTimer);
    debTimer = setTimeout(function () {
      injectButtons();
      if (bulkAdd) bulkAdd.scan();
    }, 250);
  });

  injectButtons();
  injectSeriesAddButton();
  if (bulkAdd) bulkAdd.scan();

  /* ═════════════════════════════════════════════════════════════════════════
     CLEANUP
  ═════════════════════════════════════════════════════════════════════════ */

  return function cleanup () {
    clearTimeout(debTimer);
    observer.disconnect();
    D.querySelectorAll('.ao3h-ls-btn').forEach(function (el) { el.remove(); });
    D.querySelectorAll('.ao3h-ls-badge').forEach(function (el) { el.remove(); });
    D.getElementById('ao3h-ls-series-add')?.remove();
    if (bulkAdd) bulkAdd.destroy();
  };

});
