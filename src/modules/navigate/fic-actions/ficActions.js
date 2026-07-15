/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Actions Module
    Module ID: ficActions
    Display Name: Fic Actions

    Key Features:
        - Button reordering (drag & drop)
        - Button visibility toggles
        - Bottom Subscribe button option
        - Quick Subscribe buttons in listings
        - Subscription status indicator

  - Feature: Reorder buttons in work navigation
    - Option: Drag & drop button reordering (action buttons only: bookmark, mark, share, subscribe, download, comments)
    - Option: Visual drag handles (⠿ icon, cursor: grab)
    - Option: Custom button order persisted to localStorage
    - Setting: `buttonReordering` (boolean, default: false)

  - Feature: Button visibility toggles
    - Option: Hide Share button — Setting: `hideShare` (boolean, default: false)
    - Option: Hide Bookmark button — Setting: `hideBookmark` (boolean, default: false)
    - Option: Hide Subscribe button — Setting: `hideSubscribe` (boolean, default: false)
    - Option: CSS classes: `ao3h-hide-share`, `ao3h-hide-bookmark`, `ao3h-hide-subscribe` on <html>

  - Feature: Bottom Subscribe button option
    - Option: Duplicate Subscribe button at bottom of work
    - Option: Setting: `subscribeButtonBottom` (boolean, default: false)
    - Option: Convenient access after reading

  - Feature: Quick Subscribe buttons in listings
    - Option: Add Subscribe buttons to search results
    - Option: Quick subscription from listings

  - Feature: Subscription status indicator
    - Option: Visual indicator for subscribed works
    - Option: Shows subscription status at a glance

  - Feature: Per-user configuration
    - Option: Personalized button layout
    - Option: Settings persistence

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { $, $$, observe, css } from '../../../../lib/utils/index.js';
import { Routes } from '../../../../lib/ao3/routes.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './ficActions.css?inline';

css(styles, 'ao3h-ficActions');

const NS  = 'ao3h';
const MOD = 'ficActions';

const DEFAULTS = {
  subscribeButtonBottom:  false,
  subscribeFromListings:  false,
  showSubscriptionStatus: false,
  buttonReordering:       false,
  hideShare:              false,
  hideBookmark:           false,
  hideSubscribe:          false,
};

const cfg = makeCfg(MOD, DEFAULTS);

const SK_SUBSCRIBED    = `ao3h:${MOD}:subscribedWorks`;
const SK_BUTTON_ORDER  = `ao3h:${MOD}:buttonOrder`;
const REORDER_TARGETS  = new Set(['bookmark', 'mark', 'share', 'subscribe', 'download', 'comments']);
function getSubscribed () {
  try { return new Set(JSON.parse(localStorage.getItem(SK_SUBSCRIBED) || '[]')); } catch { return new Set(); }
}
function markSubscribed (workId) {
  const set = getSubscribed();
  set.add(String(workId));
  try { localStorage.setItem(SK_SUBSCRIBED, JSON.stringify([...set])); } catch { /* */ }
}

register(MOD, {
  title: 'Fic Actions',
  enabledByDefault: false,
}, async function init() {

  let subscribeObserver = null;
  let listingObserver   = null;
  let dragCleanup        = null;
  let originalButtonList = null;
  let originalButtonItems = null;
  let active = true;
  const requestController = new AbortController();
  const CLONE_MARK = `${NS}-bottom-subscribe`;

  // ═══════════════════════════════════════════════════════════════════════
  // TOP BUTTONS: Apply CSS class for reorganization
  // ═══════════════════════════════════════════════════════════════════════

  function applyTopButtons(enabled) {
    document.documentElement.classList.toggle(`${NS}-better-buttons`, enabled);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BUTTON VISIBILITY: Show/hide individual action buttons
  // ═══════════════════════════════════════════════════════════════════════

  function applyButtonVisibility () {
    document.documentElement.classList.toggle(`${NS}-hide-share`,     cfg('hideShare'));
    document.documentElement.classList.toggle(`${NS}-hide-bookmark`,  cfg('hideBookmark'));
    document.documentElement.classList.toggle(`${NS}-hide-subscribe`, cfg('hideSubscribe'));
  }

  function removeButtonVisibility () {
    document.documentElement.classList.remove(
      `${NS}-hide-share`, `${NS}-hide-bookmark`, `${NS}-hide-subscribe`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BOTTOM SUBSCRIBE: Clone subscribe button to bottom
  // ═══════════════════════════════════════════════════════════════════════

  function isAllowedRoute() {
    try {
      if (Routes.isWork?.()) return true;
      return /^\/works\/\d+/.test(location.pathname);
    } catch(e) {
      return /^\/works\/\d+/.test(location.pathname);
    }
  }

  function alreadyInjected() {
    return Boolean($(`li.subscribe.${CLONE_MARK}`));
  }

  function findTargets() {
    const subscribeLi = $('li.subscribe');
    const kudosForm = $('#new_kudo');
    const kudosAnchor = kudosForm?.parentElement || null;
    return { subscribeLi, kudosAnchor };
  }

  function injectSubscribeButton() {
    if (alreadyInjected()) return true;

    const { subscribeLi, kudosAnchor } = findTargets();
    if (!subscribeLi || !kudosAnchor) return false;

    const clone = subscribeLi.cloneNode(true);
    clone.classList.add(CLONE_MARK);

    const parent = kudosAnchor.parentElement;
    if (parent && parent.tagName === 'UL') {
      parent.appendChild(clone);
    } else {
      kudosAnchor.insertAdjacentElement('afterend', clone);
    }
    return true;
  }

  function removeSubscribeButton() {
    $$(`li.subscribe.${CLONE_MARK}`).forEach(n => n.remove());
    if (subscribeObserver) {
      subscribeObserver.disconnect();
      subscribeObserver = null;
    }
  }

  function applyBottomSubscribe(enabled) {
    if (!enabled || !isAllowedRoute()) {
      removeSubscribeButton();
      return;
    }

    if (!injectSubscribeButton()) {
      subscribeObserver = observe(document, { childList: true, subtree: true }, () => {
        if (injectSubscribeButton() && subscribeObserver) {
          subscribeObserver.disconnect();
          subscribeObserver = null;
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUBSCRIBE FROM LISTINGS: inject quick-subscribe button on blurbs
  // ═══════════════════════════════════════════════════════════════════════

  function applySubscribeFromListings () {
    document.querySelectorAll('li.work.blurb.group[id^="work_"]').forEach(blurb => {
      if (blurb.querySelector('.ao3h-quick-subscribe')) return;
      const workId = blurb.id.replace('work_', '');
      const btn = document.createElement('button');
      btn.className = 'ao3h-quick-subscribe';
      btn.title = 'Subscribe to this work';
      const isSubscribed = getSubscribed().has(String(workId));
      btn.textContent = isSubscribed ? '🔔' : '🔕';
      btn.dataset.subscribed = isSubscribed ? '1' : '0';
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.dataset.subscribed === '1') return;
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        if (!token) { location.assign(`/works/${workId}`); return; }
        const body = new URLSearchParams({
          'subscription[subscribable_type]': 'Work',
          'subscription[subscribable_id]': workId,
          authenticity_token: token,
        });
        try {
          const r = await fetch('/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
            body: body.toString(),
            signal: requestController.signal,
          });
          if (active && (r.ok || r.redirected)) {
            markSubscribed(workId);
            if (btn.isConnected) {
              btn.textContent = '🔔';
              btn.dataset.subscribed = '1';
              btn.disabled = true;
            }
          }
        } catch { /* */ }
      });
      const heading = blurb.querySelector('h4.heading, .heading');
      if (heading) heading.appendChild(btn);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION STATUS: badge on blurbs for subscribed works
  // ═══════════════════════════════════════════════════════════════════════

  function applySubscriptionStatus () {
    const subscribed = getSubscribed();
    if (!subscribed.size) return;
    document.querySelectorAll('li.work.blurb.group[id^="work_"]').forEach(blurb => {
      const workId = blurb.id.replace('work_', '');
      if (!subscribed.has(workId)) return;
      if (blurb.querySelector('.ao3h-sub-badge')) return;
      const badge = document.createElement('span');
      badge.className = 'ao3h-sub-badge';
      badge.textContent = '🔔 Subscribed';
      const heading = blurb.querySelector('h4.heading, .heading');
      if (heading) heading.appendChild(badge);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BUTTON REORDERING: Drag & drop reorder work action buttons
  // ═══════════════════════════════════════════════════════════════════════

  function getItemKey (li) {
    for (const cls of REORDER_TARGETS) if (li.classList.contains(cls)) return cls;
    return null;
  }

  function getButtonOrder () {
    try { return JSON.parse(localStorage.getItem(SK_BUTTON_ORDER) || 'null'); } catch { return null; }
  }

  function saveButtonOrder (order) {
    try { localStorage.setItem(SK_BUTTON_ORDER, JSON.stringify(order)); } catch { /* */ }
  }

  function applyButtonReordering (enabled) {
    const ul = document.querySelector('ul.work.navigation.actions');
    if (!ul) return;

    // Cleanup previous state
    ul.querySelectorAll(`.${NS}-drag-handle`).forEach(h => h.remove());
    ul.querySelectorAll('[draggable]').forEach(li => li.removeAttribute('draggable'));
    if (dragCleanup) { dragCleanup(); dragCleanup = null; }
    if (!enabled) {
      if (originalButtonList && originalButtonItems) {
        originalButtonItems.forEach(item => originalButtonList.appendChild(item));
      }
      originalButtonList = null;
      originalButtonItems = null;
      return;
    }

    const items = Array.from(ul.querySelectorAll('li')).filter(li => getItemKey(li));
    if (items.length < 2) return;
    originalButtonList = ul;
    originalButtonItems = Array.from(ul.children);

    // Restore saved order
    const savedOrder = getButtonOrder();
    if (savedOrder?.length) {
      const byKey = {};
      items.forEach(li => { const k = getItemKey(li); if (k) byKey[k] = li; });
      savedOrder.forEach(key => { if (byKey[key]) ul.appendChild(byKey[key]); });
      items.forEach(li => { const k = getItemKey(li); if (k && !savedOrder.includes(k)) ul.appendChild(li); });
    }

    // Add drag handles & make draggable
    items.forEach(li => {
      li.setAttribute('draggable', 'true');
      if (!li.querySelector(`.${NS}-drag-handle`)) {
        const handle = document.createElement('span');
        handle.className = `${NS}-drag-handle`;
        handle.title = 'Drag to reorder';
        handle.textContent = '⠿';
        handle.setAttribute('aria-hidden', 'true');
        li.prepend(handle);
      }
    });

    // Drag events
    let dragged = null;
    function onDragStart (e) {
      dragged = e.currentTarget;
      dragged.classList.add(`${NS}-dragging`);
      e.dataTransfer.effectAllowed = 'move';
    }
    function onDragEnd () {
      if (dragged) dragged.classList.remove(`${NS}-dragging`);
      dragged = null;
      const order = Array.from(ul.querySelectorAll('li')).map(getItemKey).filter(Boolean);
      saveButtonOrder(order);
    }
    function onDragOver (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const target = e.currentTarget;
      if (!dragged || target === dragged) return;
      const rect = target.getBoundingClientRect();
      ul.insertBefore(dragged, e.clientY < rect.top + rect.height / 2 ? target : target.nextSibling);
    }
    items.forEach(li => {
      li.addEventListener('dragstart', onDragStart);
      li.addEventListener('dragend',   onDragEnd);
      li.addEventListener('dragover',  onDragOver);
    });
    dragCleanup = () => {
      items.forEach(li => {
        li.removeEventListener('dragstart', onDragStart);
        li.removeEventListener('dragend',   onDragEnd);
        li.removeEventListener('dragover',  onDragOver);
        li.removeAttribute('draggable');
      });
      ul.querySelectorAll(`.${NS}-drag-handle`).forEach(h => h.remove());
      ul.querySelectorAll(`li.${NS}-dragging`).forEach(li => li.classList.remove(`${NS}-dragging`));
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION: Apply settings
  // ═══════════════════════════════════════════════════════════════════════

  // CSS class always active when module is enabled
  applyTopButtons(true);
  applyButtonVisibility();

  if (cfg('subscribeButtonBottom')) {
    applyBottomSubscribe(true);
  }

  if (cfg('subscribeFromListings')) {
    applySubscribeFromListings();
  }

  if (cfg('showSubscriptionStatus')) {
    applySubscriptionStatus();
  }

  if (cfg('subscribeFromListings') || cfg('showSubscriptionStatus')) {
    listingObserver = observe(document, { childList: true, subtree: true }, () => {
      if (cfg('subscribeFromListings')) applySubscribeFromListings();
      if (cfg('showSubscriptionStatus')) applySubscriptionStatus();
    });
  }

  if (cfg('buttonReordering') && isAllowedRoute()) {
    applyButtonReordering(true);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════════

  return () => {
    active = false;
    requestController.abort();
    applyTopButtons(false);
    removeButtonVisibility();
    applyButtonReordering(false);
    removeSubscribeButton();
    subscribeObserver?.disconnect();
    listingObserver?.disconnect();
    subscribeObserver = null;
    listingObserver = null;
    document.querySelectorAll('.ao3h-quick-subscribe, .ao3h-sub-badge').forEach(el => el.remove());
  };
});
