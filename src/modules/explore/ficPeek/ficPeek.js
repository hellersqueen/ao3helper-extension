/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Peek

    Module ID: ficPeek
    Display Name: Fic Peek
    Tab: Explore

    Purpose

    Adds on-demand inline excerpts to work, bookmark, and series blurbs without
    requiring users to leave the current listing page.

    Features

    - Configurable paragraph or word-limited excerpt extraction
    - Click or delayed-hover preview activation
    - Optional spoiler-blurred previews
    - In-memory and tab-scoped preview caching
    - Automatic support for dynamically inserted blurbs

    Notes

    - Preview requests include the current AO3 credentials.
    - Active requests are aborted when the module stops.
    - Session-storage failures fall back transparently to memory caching.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, observe as libObserve } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './ficPeek.css?inline';

/* ═══════════════════════════════════════════════════════════════════════════
   EXCERPT HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export const MAX_FULL_CHAPTER_CHARS = 20000;

export function pickChapterIndex (count, mode) {
  if (!Number.isFinite(count) || count < 1) return 0;
  if (mode === 'last') return count - 1;
  if (mode === 'random') return Math.floor(Math.random() * count);
  return 0;
}

/**
 * @param {string} workUrl
 * @param {{ chapterMode: string, excerptMode: string, excerptCustomWords?: number }} settings
 */
export function buildCacheKey (workUrl, { chapterMode, excerptMode, excerptCustomWords }) {
  const wordsPart = excerptMode === 'custom' ? String(excerptCustomWords ?? '') : '';
  return `${workUrl}::${chapterMode}::${excerptMode}::${wordsPart}`;
}

export function isCacheEntryFresh (cachedAt, ttlHours) {
  if (!Number.isFinite(cachedAt)) return false;
  if (!Number.isFinite(ttlHours) || ttlHours <= 0) return true;
  return (Date.now() - cachedAt) < ttlHours * 3600 * 1000;
}

export function truncateFullChapterText (text) {
  const value = String(text || '');
  return value.length > MAX_FULL_CHAPTER_CHARS
    ? value.slice(0, MAX_FULL_CHAPTER_CHARS) + '…'
    : value;
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-ficPeek');

const MOD_ID = 'ficPeek';
const LOG_PREFIX = `[AO3H][${MOD_ID}]`;
const ROOT_CLASS = 'ao3h-fic-sampler-enabled';
const W = getGlobalWindow();

// In-memory cache (fast lookup within a page session).
const previewCache = new Map();
const behaviorCleanups = new Set();
const requestControllers = new Set();
// SessionStorage key prefix for cross-navigation caching (session-scoped).
const SS_KEY_PREFIX = 'ao3h:ficPeek:preview:';
// LocalStorage key prefix, used instead of SS_KEY_PREFIX when persistCache is on.
const LS_KEY_PREFIX = 'ao3h:ficPeek:preview:persist:';

const cfg = makeCfg(MOD_ID);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PREVIEW CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

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
  const maxHeightEm = parseFloat(cfg('maxPreviewHeightEm', 8.5));
  if (Number.isFinite(maxHeightEm) && maxHeightEm > 0) {
    box.style.setProperty('--ao3h-fp-box-max-height', `${maxHeightEm}em`);
  }

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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — EXCERPT EXTRACTION AND CACHING
═══════════════════════════════════════════════════════════════════════════ */

/** All chapter `.userstuff` nodes available in a fetched work document, in order. */
function collectChapterUserstuffs(doc) {
  const chapters = Array.from(doc.querySelectorAll('#chapters .chapter'));
  if (chapters.length) {
    return chapters
      .map((ch) => ch.querySelector('.userstuff.module') || ch.querySelector('.userstuff'))
      .filter(Boolean);
  }
  const single = doc.querySelector('#workskin .userstuff') || doc.querySelector('.userstuff');
  return single ? [single] : [];
}

/**
 * Extract preview text from a work page HTML string.
 * Respects excerptMode ('paragraph' | '100words' | '250words' | 'custom' |
 * 'fullChapter') and chapterMode ('first' | 'last' | 'random').
 */
function extractPreviewText(htmlText, { excerptMode, excerptCustomWords, chapterMode }) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  const userstuffs = collectChapterUserstuffs(doc);
  if (!userstuffs.length) return null;
  const userstuff = userstuffs[pickChapterIndex(userstuffs.length, chapterMode)];

  if (excerptMode === 'fullChapter') {
    const full = Array.from(userstuff.querySelectorAll('p'))
      .map((p) => (p.textContent || '').trim())
      .filter(Boolean)
      .join('\n\n');
    return truncateFullChapterText(full) || null;
  }

  if (excerptMode === 'paragraph') {
    // Return first non-empty paragraph
    for (const p of userstuff.querySelectorAll('p')) {
      const text = (p.textContent || '').trim();
      if (text.length) return text;
    }
    return null;
  }

  // Word-limit modes
  let limit;
  if (excerptMode === '100words') limit = 100;
  else if (excerptMode === '250words') limit = 250;
  else limit = parseInt(excerptCustomWords, 10) || 150;

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

/** Builds the URL to fetch: the plain work URL for chapter 1, or the full
 *  work (all chapters in one document) when a non-default chapter is wanted. */
function buildFetchUrl(workUrl, chapterMode) {
  if (chapterMode === 'first') return workUrl;
  try {
    const url = new URL(workUrl);
    url.searchParams.set('view_full_work', 'true');
    return url.toString();
  } catch (_) {
    return workUrl;
  }
}

function excerptSettings() {
  return {
    excerptMode: cfg('excerptMode', 'paragraph'),
    excerptCustomWords: cfg('excerptCustomWords', 150),
    chapterMode: cfg('excerptChapter', 'first'),
  };
}

function readCachedEntry(key) {
  if (cfg('disableCache', false)) return null;
  if (previewCache.has(key)) return previewCache.get(key);

  const store = cfg('persistCache', false) ? localStorage : sessionStorage;
  const prefix = cfg('persistCache', false) ? LS_KEY_PREFIX : SS_KEY_PREFIX;
  try {
    const raw = store.getItem(prefix + key);
    if (raw === null) return null;
    const entry = JSON.parse(raw);
    if (!isCacheEntryFresh(entry.cachedAt, cfg('cacheTTLHours', 168))) return null;
    previewCache.set(key, entry.text);
    return entry.text;
  } catch (_) { return null; }
}

function writeCachedEntry(key, text) {
  if (cfg('disableCache', false)) return;
  previewCache.set(key, text);
  const store = cfg('persistCache', false) ? localStorage : sessionStorage;
  const prefix = cfg('persistCache', false) ? LS_KEY_PREFIX : SS_KEY_PREFIX;
  try {
    store.setItem(prefix + key, JSON.stringify({ text, cachedAt: Date.now() }));
  } catch (_) { /* quota exceeded or unavailable */ }
}

/**
 * Fetch the work page and return preview text for the configured chapter and
 * excerpt length, using the in-memory/session/local cache when available.
 */
async function fetchPreviewText(workUrl, signal) {
  if (!workUrl) return null;

  const settings = excerptSettings();
  const key = buildCacheKey(workUrl, settings);

  const cached = readCachedEntry(key);
  if (cached !== null) return cached;

  try {
    const res = await fetch(buildFetchUrl(workUrl, settings.chapterMode), {
      credentials: 'include',
      signal,
    });
    if (!res.ok) {
      console.warn(`${LOG_PREFIX} Failed to fetch work page`, res.status);
      return null;
    }

    const html = await res.text();
    const preview = (extractPreviewText(html, settings) || '').trim();
    const finalText = preview || '[No preview text found]';

    writeCachedEntry(key, finalText);
    return finalText;
  } catch (err) {
    if (err?.name === 'AbortError') return null;
    console.warn(`${LOG_PREFIX} Error fetching work page`, err);
    return null;
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — INTERACTIVE PREVIEW BEHAVIOR
═══════════════════════════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — DYNAMIC BLURB DISCOVERY
═══════════════════════════════════════════════════════════════════════════ */

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

  const observer = libObserve(root, {
    childList: true,
    subtree: true,
  }, () => {
    scanBlurbsForSampler();
  });

  // Initial pass
  scanBlurbsForSampler();

  return () => observer.disconnect();
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
