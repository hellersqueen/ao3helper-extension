/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Peek Module
    Module ID: ficPeek
    Display Name: Fic Peek

    Key Features:
        - Preview button on work blurbs ("👁️ Preview")
        - First paragraph extraction
        - Inline preview display (expandable/collapsible)
        - Preview caching (in-memory and SessionStorage)
        - Async content loading
        - Works on search results, tag pages, bookmark listings

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './ficPeek.css?inline';

css(styles, 'ao3h-ficPeek');

const MOD_ID = 'ficPeek';
const LOG_PREFIX = `[AO3H][${MOD_ID}]`;
const ROOT_CLASS = 'ao3h-fic-sampler-enabled';
const W = getGlobalWindow();

// In-memory cache (fast lookup within a page session).
const previewCache = new Map();
const behaviorCleanups = new Set();
const requestControllers = new Set();
// SessionStorage key prefix for cross-navigation caching.
const SS_KEY_PREFIX = 'ao3h:ficPeek:preview:';

/**
 * Get the main work URL from a blurb.
 * Typically the title link points to /works/ID or /works/ID/chapters/CHID.
 */
function getWorkUrlFromBlurb(blurb) {
  if (!blurb) return null;
  const link =
    blurb.querySelector('h4.heading a[href*="/works/"]') ||
    blurb.querySelector('a[href*="/works/"]');

  if (!link) return null;

  const href = link.getAttribute('href');
  if (!href) return null;

  // Normalize to absolute URL using the browser.
  try {
    const url = new URL(href, window.location.origin);
    return url.toString();
  } catch (e) {
    return null;
  }
}

/**
 * Create or find the preview container for a blurb.
 * This will hold the preview content and is toggled by the button.
 */
function ensurePreviewContainer(blurb) {
  let box = blurb.querySelector('.ao3h-fic-preview-box');
  if (box) return box;

  box = document.createElement('div');
  box.className = 'ao3h-fic-preview-box';
  box.setAttribute('hidden', 'hidden');

  const target =
    blurb.querySelector('.summary') ||
    blurb.querySelector('blockquote.userstuff') ||
    blurb.lastElementChild ||
    blurb;

  target.insertAdjacentElement('afterend', box);

  return box;
}

/**
 * Create or find the preview button for a blurb.
 */
function ensurePreviewButton(blurb) {
  let btn = blurb.querySelector('.ao3h-fic-preview-button');
  if (btn) return btn;

  btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ao3h-fic-preview-button';
  btn.textContent = 'Preview';

  // Insert the button in the meta area if possible, or else near the title.
  const heading = blurb.querySelector('h4.heading');
  if (heading) {
    const controls = blurb.querySelector('.ao3h-fic-preview-controls') ||
      (function () {
        const wrap = document.createElement('div');
        wrap.className = 'ao3h-fic-preview-controls';
        heading.insertAdjacentElement('afterend', wrap);
        return wrap;
      })();
    controls.appendChild(btn);
  } else {
    blurb.insertBefore(btn, blurb.firstChild);
  }

  return btn;
}

// ── Settings reader ──────────────────────────────────────────────────────
const cfg = makeCfg(MOD_ID);

/**
 * Extract preview text from a work page HTML string.
 * Respects excerptMode setting: 'paragraph' | '100words' | '250words' | 'custom'
 */
function extractPreviewText(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  const userstuff =
    doc.querySelector('#chapters .chapter .userstuff') ||
    doc.querySelector('#workskin .userstuff') ||
    doc.querySelector('.userstuff');

  if (!userstuff) return null;

  const mode = cfg('excerptMode', 'paragraph');

  if (mode === 'paragraph') {
    // Return first non-empty paragraph
    for (const p of userstuff.querySelectorAll('p')) {
      const text = (p.textContent || '').trim();
      if (text.length) return text;
    }
    return null;
  }

  // Word-limit modes
  let limit;
  if (mode === '100words') limit = 100;
  else if (mode === '250words') limit = 250;
  else limit = parseInt(cfg('excerptCustomWords', 150), 10) || 150;

  // Collect text from all paragraphs until limit
  const parts = [];
  let count = 0;
  for (const p of userstuff.querySelectorAll('p')) {
    const text = (p.textContent || '').trim();
    if (!text) continue;
    const words = text.split(/\s+/);
    const remaining = limit - count;
    if (remaining <= 0) break;
    if (words.length <= remaining) {
      parts.push(text);
      count += words.length;
    } else {
      parts.push(words.slice(0, remaining).join(' ') + '…');
      count += remaining;
      break;
    }
  }
  return parts.join('\n\n') || null;
}

/**
 * Fetch the work page and return a preview text (first paragraph).
 */
async function fetchPreviewText(workUrl, signal) {
  if (!workUrl) return null;

  // Check in-memory cache first.
  if (previewCache.has(workUrl)) {
    return previewCache.get(workUrl);
  }
  // Fall back to SessionStorage (persists across navigations in the same tab).
  try {
    const stored = sessionStorage.getItem(SS_KEY_PREFIX + workUrl);
    if (stored !== null) {
      previewCache.set(workUrl, stored);
      return stored;
    }
  } catch (_) { /* sessionStorage unavailable */ }

  try {
    const res = await fetch(workUrl, {
      credentials: 'include',
      signal,
    });
    if (!res.ok) {
      console.warn(`${LOG_PREFIX} Failed to fetch work page`, res.status);
      return null;
    }

    const html = await res.text();
    const preview = (extractPreviewText(html) || '').trim();
    const finalText = preview || '[No preview text found]';

    previewCache.set(workUrl, finalText);
    try { sessionStorage.setItem(SS_KEY_PREFIX + workUrl, finalText); } catch (_) { /* quota exceeded or unavailable */ }
    return finalText;
  } catch (err) {
    if (err?.name === 'AbortError') return null;
    console.warn(`${LOG_PREFIX} Error fetching work page`, err);
    return null;
  }
}

/**
 * Handle click on the preview button.
 */
function attachPreviewBehavior(blurb) {
  if (!blurb) return;

  const workUrl = getWorkUrlFromBlurb(blurb);
  if (!workUrl) return;

  const btn = ensurePreviewButton(blurb);
  const box = ensurePreviewContainer(blurb);

  if (btn.dataset.ao3hPreviewAttached === 'true') {
    return; // already wired
  }
  btn.dataset.ao3hPreviewAttached = 'true';

  let isLoading = false;
  let disposed = false;
  let hoverTimer = null;

  const showBox = async () => {
    if (disposed || isLoading) return;
    if (box.textContent) {
      box.removeAttribute('hidden');
      btn.classList.add('is-open');
      btn.textContent = 'Hide preview';
      return;
    }

    isLoading = true;
    box.removeAttribute('hidden');
    btn.classList.add('is-loading');
    btn.textContent = 'Loading preview…';
    box.textContent = 'Loading preview…';

    const requestController = new AbortController();
    requestControllers.add(requestController);
    const text = await fetchPreviewText(workUrl, requestController.signal);
    requestControllers.delete(requestController);

    isLoading = false;
    if (disposed || requestController.signal.aborted) return;
    btn.classList.remove('is-loading');

    if (!text) {
      box.textContent = 'Could not load preview.';
      btn.textContent = 'Preview';
      return;
    }

    if (cfg('spoilerFreeMode', false)) {
      // Render blurred text with a reveal button on top.
      box.innerHTML = '';
      const blurWrap = document.createElement('div');
      blurWrap.className = 'ao3h-fic-preview-spoiler-blur';
      blurWrap.textContent = text;
      const revealBtn = document.createElement('button');
      revealBtn.type = 'button';
      revealBtn.className = 'ao3h-fic-preview-spoiler-reveal';
      revealBtn.textContent = '⚠ Reveal spoilers';
      revealBtn.addEventListener('click', () => {
        blurWrap.classList.add('revealed');
        revealBtn.remove();
      }, { once: true });
      box.appendChild(blurWrap);
      box.appendChild(revealBtn);
    } else {
      box.textContent = text;
    }
    btn.textContent = 'Hide preview';
    btn.classList.add('is-open');
  };

  const hideBox = () => {
    box.setAttribute('hidden', 'hidden');
    btn.classList.remove('is-open');
    btn.textContent = 'Preview';
  };

  const toggleBox = () => {
    if (box.hasAttribute('hidden')) showBox();
    else hideBox();
  };

  if (cfg('hoverMode', false)) {
    // Hover mode: show after delay, hide on mouse-leave.
    const onMouseEnter = () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(showBox, cfg('hoverDelay', 400));
    };
    const onMouseLeave = () => {
      clearTimeout(hoverTimer);
      hoverTimer = null;
      hideBox();
    };
    blurb.addEventListener('mouseenter', onMouseEnter);
    blurb.addEventListener('mouseleave', onMouseLeave);
    // Still allow click on button to toggle manually.
    btn.addEventListener('click', toggleBox);

    behaviorCleanups.add(() => {
      disposed = true;
      clearTimeout(hoverTimer);
      hoverTimer = null;
      blurb.removeEventListener('mouseenter', onMouseEnter);
      blurb.removeEventListener('mouseleave', onMouseLeave);
    });
  } else {
    btn.addEventListener('click', toggleBox);
    behaviorCleanups.add(() => { disposed = true; });
  }
}

/**
 * Scan all blurbs on the page and attach preview buttons/logic.
 */
function scanBlurbsForSampler() {
  const blurbs = document.querySelectorAll(
    'li.work.blurb, li.bookmark.blurb, li.series.blurb, .work.blurb, .blurb'
  );
  if (!blurbs.length) return;
  blurbs.forEach(attachPreviewBehavior);
}

/**
 * Observe DOM changes for new blurbs (pagination, filters, etc).
 */
function setupObserver() {
  const root = document.querySelector('#main') || document.body;
  if (!root || typeof MutationObserver === 'undefined') return null;

  const observer = new MutationObserver(() => {
    scanBlurbsForSampler();
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
  });

  // Initial pass
  scanBlurbsForSampler();

  return () => observer.disconnect();
}

/**
 * Main init function for the module.
 * Called by AO3 Helper when the module is enabled.
 */
function init(/* context */) {
  console.log(`${LOG_PREFIX} init`);

  document.documentElement.classList.add(ROOT_CLASS);
  if (cfg('hoverMode', false)) document.documentElement.classList.add('hover-mode');

  const stopObserver = setupObserver();

  return function dispose() {
    console.log(`${LOG_PREFIX} stopped`);
    document.documentElement.classList.remove(ROOT_CLASS);
    document.documentElement.classList.remove('hover-mode');
    if (typeof stopObserver === 'function') {
      stopObserver();
    }
    behaviorCleanups.forEach(cleanup => cleanup());
    behaviorCleanups.clear();
    requestControllers.forEach(controller => controller.abort());
    requestControllers.clear();
    document.querySelectorAll('.ao3h-fic-preview-controls, .ao3h-fic-preview-button, .ao3h-fic-preview-box')
      .forEach(el => el.remove());
    previewCache.clear();
  };
}

register(
  MOD_ID,
  { title: 'Fic Peek', enabledByDefault: false },
  init
);
