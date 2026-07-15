/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Quick Mark for Later Button Submodule
    Submodule ID: quickMarkForLaterButton
    Display Name: Quick Mark for Later Button
    Source Module: Later Shelf

    - Feature: 📌 button on listing blurbs
      - Option: showQuickButton (default: true) — can be disabled in settings
      - Behaviour: Injected into h4.heading of all work/bookmark blurbs
      - Behaviour: Active state (pinned) shown when work is already in shelf
      - Behaviour: Toggle adds/removes work from shelf storage on click
      - Behaviour: Immediately updates the sibling 📌 badge (markedForLaterStatus)
      - Behaviour: MutationObserver re-injects buttons for dynamic content

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { loadItems, saveItems, cfg } from './laterShelfStore.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';
import { appendHeadingBadge } from '../../../../lib/ui/status-badge.js';

const MOD = 'quickMarkForLaterButton';
const D   = document;

register(MOD, {
  title: 'Quick Mark for Later Button',
  parent: 'laterShelf',
  enabledByDefault: true,
}, function init () {

  if (!cfg('showQuickButton')) return function cleanup () {};

  // ── Helpers ──────────────────────────────────────────────────────────────
  function widFromBlurb (blurb) {
    const a = blurb.querySelector('h4.heading a[href*="/works/"]');
    if (!a) return null;
    const m = (a.getAttribute('href') || '').match(/\/works\/(\d+)/);
    return m ? m[1] : null;
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

  // ── Button factory ───────────────────────────────────────────────────────
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

  // ── Injection ────────────────────────────────────────────────────────────
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

  // ── MutationObserver for dynamic content ─────────────────────────────────
  var debTimer = null;
  var observer = new MutationObserver(function () {
    clearTimeout(debTimer);
    debTimer = setTimeout(injectButtons, 250);
  });
  observer.observe(D.body, { childList: true, subtree: true });

  injectButtons();

  // ── Cleanup ──────────────────────────────────────────────────────────────
  return function cleanup () {
    clearTimeout(debTimer);
    observer.disconnect();
    D.querySelectorAll('.ao3h-ls-btn').forEach(function (el) { el.remove(); });
    D.querySelectorAll('.ao3h-ls-badge').forEach(function (el) { el.remove(); });
  };

});
