/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Quick Mark for Later Button

Adds a configurable save-for-later control to work and bookmark blurbs.

Features

- Injects a quick-save button into each blurb heading.
- Reflects whether a work is already stored in the Later Shelf.
- Adds or removes works immediately and keeps the related status badge in sync.
- Re-injects controls when AO3 loads dynamic content.

Notes

- The `showQuickButton` setting enables or disables the feature.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { loadItems, saveItems, cfg } from './laterShelfStore.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';
import { observe } from '../../../../lib/utils/index.js';
import { appendHeadingBadge } from '../../../../lib/ui/badges.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';

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

  function widFromBlurb (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  function titleFromBlurb (blurb) {
    const a = blurb.querySelector('h4.heading a[href*="/works/"]');
    return a ? a.textContent.trim() : '';
  }

  function isInShelf (wid) {
    return loadItems().some(function (i) { return String(i.wid || i) === String(wid); });
  }

  function addToShelf (wid, title) {
    var items = loadItems();
    if (items.some(function (i) { return String(i.wid || i) === String(wid); })) return;
    items.push({ wid: wid, title: title, addedAt: Date.now() });
    saveItems(items);
    document.dispatchEvent(new CustomEvent(EV_MARKED_FOR_LATER, { detail: { workId: wid, title: title } }));
  }

  function removeFromShelf (wid) {
    saveItems(loadItems().filter(function (i) { return String(i.wid || i) !== String(wid); }));
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
      var nowActive = btn.classList.contains('ao3h-ls-active');
      if (nowActive) {
        removeFromShelf(wid);
        btn.classList.remove('ao3h-ls-active');
        btn.textContent = '📌 Save for later';
        btn.title = 'Add to Later Shelf';
        // update sibling badge in markedForLaterStatus
        var blurb = btn.closest('li.work.blurb, li.bookmark.blurb');
        if (blurb) {
          var badge = blurb.querySelector('.ao3h-ls-badge');
          if (badge) badge.remove();
        }
      } else {
        addToShelf(wid, title);
        btn.classList.add('ao3h-ls-active');
        btn.textContent = '📌 Saved';
        btn.title = 'Remove from Later Shelf';
        // inject badge immediately without waiting for markedForLaterStatus repaint
        var blurb = btn.closest('li.work.blurb, li.bookmark.blurb');
        if (blurb) {
          appendHeadingBadge(blurb, { className: 'ao3h-ls-badge', text: '📌', title: 'In your Later Shelf' });
        }
      }
    });
    return btn;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BUTTON INJECTION
  ═════════════════════════════════════════════════════════════════════════ */

  function injectButtons () {
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      if (blurb.querySelector('.ao3h-ls-btn')) return;
      var wid = widFromBlurb(blurb);
      if (!wid) return;
      var title = titleFromBlurb(blurb);
      var active = isInShelf(wid);
      var btn = makeBtn(wid, title, active);
      var heading = blurb.querySelector('h4.heading');
      if (heading) heading.appendChild(btn);
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — DYNAMIC CONTENT
  ═════════════════════════════════════════════════════════════════════════ */

  var debTimer = null;
  var observer = observe(D.body, { childList: true, subtree: true }, function () {
    clearTimeout(debTimer);
    debTimer = setTimeout(injectButtons, 250);
  });

  injectButtons();

  /* ═════════════════════════════════════════════════════════════════════════
     CLEANUP
  ═════════════════════════════════════════════════════════════════════════ */

  return function cleanup () {
    clearTimeout(debTimer);
    observer.disconnect();
    D.querySelectorAll('.ao3h-ls-btn').forEach(function (el) { el.remove(); });
    D.querySelectorAll('.ao3h-ls-badge').forEach(function (el) { el.remove(); });
  };

});
