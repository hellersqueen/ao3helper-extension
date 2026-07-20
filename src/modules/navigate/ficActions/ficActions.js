/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Actions

    Module ID: ficActions
    Display Name: Fic Actions
    Tab: Navigate & Interact

    Purpose

    Customizes AO3 work actions with visibility controls, drag-and-drop ordering,
    convenient subscription controls, and subscription status indicators.

    Features

    - Configurable work-action visibility and layout
    - Persistent drag-and-drop action ordering
    - Optional bottom-of-work Subscribe control
    - Quick subscription and status indicators on listing blurbs

    Notes

    - Custom action order and observed subscriptions persist in local storage.
    - Quick subscription falls back to the work page when no CSRF token exists.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { $, $$, observe, css } from '../../../../lib/utils/index.js';
import { Routes } from '../../../../lib/ao3/routes.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { subscribeToWork } from '../../../../lib/ao3/actions.js';
import { getCSRF } from '../../../../lib/ao3/requests.js';
import { makeListReorderable, applySavedOrder } from '../../../../lib/ui/drag-reorder.js';
import styles from './ficActions.css?inline';

/* ═══════════════════════════════════════════════════════════════════════════
   ACTION HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export const ACTION_ICONS = {
  bookmark: '🔖',
  mark: '✅',
  share: '📤',
  subscribe: '🔔',
  download: '⬇️',
  comments: '💬',
};

export function getActionIcon (key) {
  return ACTION_ICONS[key] || '•';
}

export function resolveBottomSubscribeContainer (doc, position) {
  if (position !== 'pageEnd') return null;
  return doc.querySelector('#main') || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-ficActions');

const NS  = 'ao3h';
const MOD = 'ficActions';

const DEFAULTS = {
  subscribeButtonBottom:  false,
  bottomSubscribePosition: 'nearKudos',
  subscribeFromListings:  false,
  showSubscriptionStatus: false,
  buttonReordering:       false,
  iconOnlyButtons:        false,
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

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK-ACTION PRESENTATION
  ═════════════════════════════════════════════════════════════════════════ */

  function applyTopButtons(enabled) {
    document.documentElement.classList.toggle(`${NS}-better-buttons`, enabled);
  }

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

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BOTTOM SUBSCRIBE CONTROL
  ═════════════════════════════════════════════════════════════════════════ */

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
    if (!subscribeLi) return false;

    const clone = subscribeLi.cloneNode(true);
    clone.classList.add(CLONE_MARK);

    const pageEndContainer = resolveBottomSubscribeContainer(document, cfg('bottomSubscribePosition'));
    if (pageEndContainer) {
      pageEndContainer.appendChild(clone);
      applyIconOnlyButtons(cfg('iconOnlyButtons'));
      return true;
    }

    if (!kudosAnchor) return false;
    const parent = kudosAnchor.parentElement;
    if (parent && parent.tagName === 'UL') {
      parent.appendChild(clone);
    } else {
      kudosAnchor.insertAdjacentElement('afterend', clone);
    }
    applyIconOnlyButtons(cfg('iconOnlyButtons'));
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

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — LISTING SUBSCRIPTIONS
  ═════════════════════════════════════════════════════════════════════════ */

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
        if (!getCSRF()) { location.assign(`/works/${workId}`); return; }
        try {
          const ok = await subscribeToWork(workId, { signal: requestController.signal });
          if (active && ok) {
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

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — ICON-ONLY BUTTONS
  ═════════════════════════════════════════════════════════════════════════ */

  function applyIconOnlyButtons (enabled) {
    const buttons = $$(Array.from(REORDER_TARGETS).map(k => `li.${k}`).join(', '));
    buttons.forEach((li) => {
      const key = getItemKey(li);
      const anchor = li.querySelector('a');
      if (!key || !anchor) return;

      if (enabled) {
        if (anchor.querySelector(`.${NS}-action-icon`)) return;
        const label = document.createElement('span');
        label.className = `${NS}-sr-only`;
        while (anchor.firstChild) label.appendChild(anchor.firstChild);
        if (!anchor.title) anchor.title = label.textContent.trim();
        const icon = document.createElement('span');
        icon.className = `${NS}-action-icon`;
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = getActionIcon(key);
        anchor.appendChild(icon);
        anchor.appendChild(label);
      } else {
        const label = anchor.querySelector(`.${NS}-sr-only`);
        if (label) anchor.textContent = label.textContent;
      }
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BUTTON REORDERING
  ═════════════════════════════════════════════════════════════════════════ */

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
    applySavedOrder(ul, getButtonOrder(), getItemKey, 'li');

    dragCleanup = makeListReorderable(ul, {
      getItemKey,
      onOrderChanged: saveButtonOrder,
      handleGlyph: '⠿',
      itemSelector: 'li',
      filter: (li) => !!getItemKey(li),
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     INITIALIZATION
  ═════════════════════════════════════════════════════════════════════════ */

  // CSS class always active when module is enabled
  applyTopButtons(true);
  applyButtonVisibility();
  applyIconOnlyButtons(cfg('iconOnlyButtons'));

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

  /* ═════════════════════════════════════════════════════════════════════════
     CLEANUP
  ═════════════════════════════════════════════════════════════════════════ */

  return () => {
    active = false;
    requestController.abort();
    applyTopButtons(false);
    removeButtonVisibility();
    applyIconOnlyButtons(false);
    applyButtonReordering(false);
    removeSubscribeButton();
    subscribeObserver?.disconnect();
    listingObserver?.disconnect();
    subscribeObserver = null;
    listingObserver = null;
    document.querySelectorAll('.ao3h-quick-subscribe, .ao3h-sub-badge').forEach(el => el.remove());
  };
});
