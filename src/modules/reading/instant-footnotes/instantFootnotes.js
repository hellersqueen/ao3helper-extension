/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Instant Footnotes
    Module ID: instantFootnotes
    Display Name: Instant Footnotes
    Tab: Reading

    Previews end-chapter author's notes / footnotes in a popup on hover or
    click — no scrolling needed. Supports academic-style in-work references.

    Config keys (localStorage ao3h:mod:instantFootnotes:settings):
        trigger       -- 'hover' | 'click' (default: 'hover')
        delayIn       -- hover delay ms (default: 120)
        delayOut      -- hide delay ms (default: 160)
        maxWidth      -- popup max-width px (default: 420)
        pinOnClick    -- pin popup on click (default: true)
        showPermalink -- show "Go to note" link (default: true)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import styles from './instantFootnotes.css?inline';

css(styles, 'ao3h-instantFootnotes');

const MOD = 'instantFootnotes';
const LOG = `[AO3H][${MOD}]`;

// ── Route guard ───────────────────────────────────────────────────────────
function isWorkPage () {
  return /^\/works\/\d+/.test(location.pathname);
}

// ── Minimal inline utilities ──────────────────────────────────────────────
function qs  (sel, root)  { return (root || document).querySelector(sel); }
function qsa (sel, root)  { return Array.from((root || document).querySelectorAll(sel)); }

function debounce (fn, ms) {
  let t = null;
  const debounced = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => { t = null; fn(...args); }, ms);
  };
  debounced.cancel = () => { clearTimeout(t); t = null; };
  return debounced;
}

// ══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Instant Footnotes',
  enabledByDefault: false,
}, async function init () {

  if (!isWorkPage()) return () => {};

  const defaults = {
    trigger: 'hover',     // 'hover' | 'click'
    delayIn: 120,         // ms (hover)
    delayOut: 160,
    maxWidth: 420,        // px
    pinOnClick: true,
    showPermalink: true
  };
  let cfg = loadModuleSettings(MOD, defaults);

  document.documentElement.style.setProperty('--ao3h-if-max-width', cfg.maxWidth + 'px');

  /* --------------------------- Helpers ------------------------------ */
  const workRoot = qs('#workskin') || document.body;

    // Likely targets for endnotes/footnotes on AO3
    const NOTES_SELECTORS = [
      '#notes', '.end.notes', '.chapter .end.notes', '.notes.end', 'section.end.notes'
    ];

  const withinNotes = (el) =>
    !!el && NOTES_SELECTORS.some(sel => el.closest(sel));

  const resolveTarget = (href) => {
    if (!href || !href.startsWith('#')) return null;
    const id = href.slice(1);
    let target = document.getElementById(id);
    if (!target) target = document.querySelector(`[name="${CSS.escape(id)}"]`);
    return target;
  };

  const sanitizeClone = (node) => {
      // Clone and strip interactive controls; keep text & simple formatting
      const clone = node.cloneNode(true);
      // Remove nested anchors that jump around, but keep their text
    clone.querySelectorAll('a').forEach(a => {
      const span = document.createElement('span');
      span.textContent = a.textContent;
      a.replaceWith(span);
    });
    return clone;
  };

  /* --------------------------- Popovers ----------------------------- */
  let activePop = null;
  let hideTimer = null;
  let positionFrame = null;
  const linkController = new AbortController();
  const linkTimers = new Map();
  const originalAriaHaspopup = new WeakMap();

  function makePopoverFor(linkEl, targetEl) {
      const pop = document.createElement('div');
      pop.className = 'ao3h-gloss-pop';
      pop.role = 'tooltip';
      pop.tabIndex = -1;

      const titleText = targetEl.querySelector('h2,h3,strong,em')?.textContent?.trim() || 'Note';
      const bodyNode = sanitizeClone(targetEl);
      bodyNode.classList.add('ao3h-body');

      const arrow = document.createElement('div');
      arrow.className = 'ao3h-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      const title = document.createElement('div');
      title.className = 'ao3h-title';
      title.textContent = titleText;
      pop.appendChild(arrow);
      pop.appendChild(title);
      pop.appendChild(bodyNode);

      const actions = document.createElement('div');
      actions.className = 'ao3h-actions';
      if (cfg.showPermalink) {
        const a = document.createElement('a');
        a.href = `#${targetEl.id || ''}`;
        a.textContent = 'Go to note';
        actions.appendChild(a);
      }
      const pin = document.createElement('button');
      pin.textContent = 'Pin';
      const close = document.createElement('button');
      close.textContent = '✕';
      actions.append(pin, close);
      pop.appendChild(actions);

      document.body.appendChild(pop);

      // Events
      close.addEventListener('click', () => destroyPopover(pop, linkEl));
      pin.addEventListener('click', () => {
        pop.classList.add('pinned');
        linkEl.classList.add('ao3h-gloss-src');
        // No auto-hide while pinned
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      });

      // ESC to close current
      const onKey = (e) => {
        if (e.key === 'Escape') destroyPopover(pop, linkEl);
      };
      pop._onKey = onKey;
      addEventListener('keydown', onKey);

      return pop;
  }

  function positionPopover (pop, linkEl) {
    const r = linkEl.getBoundingClientRect();
    let x = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.left));
    let y = r.bottom + 8;
    if (y + pop.offsetHeight + 8 > window.innerHeight) {
      y = Math.max(8, r.top - pop.offsetHeight - 10);
      pop.querySelector('.ao3h-arrow').style.top = 'auto';
      pop.querySelector('.ao3h-arrow').style.bottom = '-5px';
    } else {
      pop.querySelector('.ao3h-arrow').style.top = '-5px';
      pop.querySelector('.ao3h-arrow').style.bottom = 'auto';
    }
    pop.style.left = `${Math.round(x)}px`;
    pop.style.top  = `${Math.round(y)}px`;
  }

  function destroyPopover (pop, linkEl) {
    if (!pop) return;
    removeEventListener('keydown', pop._onKey || (() => {}));
    try { pop.remove(); } catch {}
    if (linkEl) linkEl.classList.remove('ao3h-gloss-src');
    if (activePop === pop) activePop = null;
  }

  function showPopover (linkEl) {
    const href = linkEl.getAttribute('href') || '';
    const target = resolveTarget(href);
    if (!target || !withinNotes(target)) return;
    if (activePop) destroyPopover(activePop, activePop._src);
    const pop = makePopoverFor(linkEl, target);
    pop._src = linkEl;
    activePop = pop;
    linkEl.classList.add('ao3h-gloss-src');
    if (positionFrame !== null) cancelAnimationFrame(positionFrame);
    positionFrame = requestAnimationFrame(() => {
      positionFrame = null;
      if (pop.isConnected) positionPopover(pop, linkEl);
    });
  }

  function scheduleHide (linkEl) {
    if (!activePop || activePop.classList.contains('pinned')) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => destroyPopover(activePop, linkEl), cfg.delayOut);
  }

  const LINK_SELECTOR = [
    '#workskin sup a[href^="#"]',
    '#workskin a[href^="#"]'
  ].join(',');

  function eligibleLink (a) {
    if (!a || !a.getAttribute) return false;
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#')) return false;
    const target = resolveTarget(href);
    return !!(target && withinNotes(target));
  }

  // Single shared mousemove handler — added once, removed in cleanup
  const onMouseMove = (e) => {
    if (!activePop || activePop.classList.contains('pinned')) return;
    if (!activePop.contains(e.target) && e.target !== activePop._src) {
      scheduleHide(activePop._src);
    }
  };
  if (cfg.trigger === 'hover') document.addEventListener('mousemove', onMouseMove);

  function bindLink (a) {
    if (a._ao3hGlossBound) return;
    if (!eligibleLink(a)) return;
    a._ao3hGlossBound = true;
    originalAriaHaspopup.set(a, {
      present: a.hasAttribute('aria-haspopup'),
      value: a.getAttribute('aria-haspopup'),
    });
    a.setAttribute('aria-haspopup', 'dialog');
    const { signal } = linkController;
    const clearInTimer = () => {
      clearTimeout(linkTimers.get(a));
      linkTimers.delete(a);
    };
    if (cfg.trigger === 'hover') {
      a.addEventListener('mouseenter', () => {
        clearInTimer();
        linkTimers.set(a, setTimeout(() => {
          linkTimers.delete(a);
          showPopover(a);
        }, cfg.delayIn));
      }, { signal });
      a.addEventListener('mouseleave', () => { clearInTimer(); scheduleHide(a); }, { signal });
      a.addEventListener('focus', () => { clearInTimer(); showPopover(a); }, { signal });
      a.addEventListener('blur',  () => scheduleHide(a), { signal });
    } else {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (activePop && activePop._src === a && !activePop.classList.contains('pinned')) {
          destroyPopover(activePop, a);
        } else {
          showPopover(a);
          if (cfg.pinOnClick && activePop) activePop.classList.add('pinned');
        }
      }, { signal });
    }
  }

  function scanLinks () {
    qsa(LINK_SELECTOR, workRoot).forEach(bindLink);
  }

  scanLinks();
  const scanLinksDebounced = debounce(scanLinks, 100);
  const mo = new MutationObserver(scanLinksDebounced);
  mo.observe(workRoot, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
    scanLinksDebounced.cancel();
    linkController.abort();
    linkTimers.forEach(timer => clearTimeout(timer));
    linkTimers.clear();
    clearTimeout(hideTimer);
    hideTimer = null;
    if (positionFrame !== null) {
      cancelAnimationFrame(positionFrame);
      positionFrame = null;
    }
    document.removeEventListener('mousemove', onMouseMove);
    if (activePop) destroyPopover(activePop, activePop._src);
    qsa(LINK_SELECTOR, workRoot).forEach(a => {
      a._ao3hGlossBound = false;
      a.classList.remove('ao3h-gloss-src');
      const original = originalAriaHaspopup.get(a);
      if (original?.present) a.setAttribute('aria-haspopup', original.value);
      else a.removeAttribute('aria-haspopup');
      originalAriaHaspopup.delete(a);
    });
    document.documentElement.style.removeProperty('--ao3h-if-max-width');
  };
});
