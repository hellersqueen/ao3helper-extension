/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Similar Fics

    Module ID: similarFics
    Display Name: Similar Fics
    Tab: Explore

    Purpose

    Builds on-demand recommendations from the current work’s fandom, tags,
    length, rating, and author, then presents scored results inline.

    Features

    - Metadata-driven AO3 recommendation queries
    - Similar-pairing, general, and same-author result sections
    - Match scores with already-read work exclusion
    - Inline “Mark for Later” actions

    Notes

    - Cross-page result loading uses the userscript request transport.
    - Active searches and Mark-for-Later requests are aborted during cleanup.
    - Results below the fixed similarity threshold are excluded.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { getHistoryWorkIdSet } from '../../../../lib/storage/keys.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { markWorkForLater } from '../../../../lib/ao3/actions.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';
import styles from './similarFics.css?inline';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-similarFics');

const MOD = 'similarFics';
const W   = getGlobalWindow();
const LOG = `[AO3H][${MOD}]`;

const ROOT_CLASS = 'ao3h-similar-fics-enabled';
const PANEL_ID = 'ao3h-similar-fics-panel';
const BUTTON_LI_ID = 'ao3h-similar-stories-li';
const activeRequests = new Set();
let active = false;

const MAX_TAGS = 4;
const MAX_PER_SECTION = 5;
const MIN_SCORE = 70;
const WORD_BUCKET_SIZES = [2_000, 5_000, 10_000, 20_000, 50_000, 100_000];

const DEFAULTS = {
  numResults:           '10',
  showSimilarityScore:  true,
  highlightCommonTags:  true,
  showSummary:          true,
  includeWIP:           false,
  openInNewTab:         false,
};

const cfg = makeCfg(MOD, DEFAULTS);

function log(...args) {
  console.log(LOG, ...args);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — WORK METADATA AND RECOMMENDATION QUERIES
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Detect if we are on a work/chapter page.
 */
function isWorkPage() {
  const path = W.location.pathname;
  return /\/works\/\d+/.test(path || '') || !!document.querySelector('#workskin');
}

/**
 * Extract rating text from the work meta.
 */
function getRating() {
  const dd = document.querySelector('dl.work.meta dd.rating');
  if (!dd) return null;
  return (dd.textContent || '').trim();
}

/**
 * Map rating text to AO3 rating search parameter.
 * These names are visible on AO3, so we try to map loosely.
 */
function mapRatingToParam(ratingText) {
  if (!ratingText) return null;
  const t = ratingText.toLowerCase();

  // These rough keys match AO3 "ratings" search IDs.
  if (t.includes('general')) return 'General Audiences';
  if (t.includes('teen')) return 'Teen And Up Audiences';
  if (t.includes('mature')) return 'Mature';
  if (t.includes('explicit')) return 'Explicit';
  if (t.includes('not rated')) return 'Not Rated';
  return null;
}

/**
 * Extract total word count from stats, as a number.
 */
function getWordCount() {
  const dd = document.querySelector('dl.stats dd.words');
  if (!dd) return null;

  const raw = (dd.textContent || '').replace(/,/g, '').trim();
  const n = parseInt(raw, 10);
  if (isNaN(n)) return null;
  return n;
}

/**
 * Given a word count, find an approximate "from/to" range.
 * Ex: 23k → [20k, 30k]
 */
function getWordRangeAround(count) {
  if (typeof count !== 'number' || !isFinite(count) || count <= 0) {
    return { from: null, to: null };
  }

  // Use the closest bucket as step.
  let step = 5000;
  for (const size of WORD_BUCKET_SIZES) {
    if (count <= size) {
      step = size / 2;
      break;
    }
  }

  const half = step / 2;
  let from = Math.max(0, Math.floor((count - half) / 100) * 100);
  let to = Math.floor((count + half) / 100) * 100;

  if (from < 1000) from = 0;
  if (to < from) to = from;

  return { from, to };
}

/**
 * Extract fandom (first fandom tag) from the work.
 */
function getFandomTag() {
  // AO3 usually: dd.fandom.tags li a
  const el = document.querySelector('dd.fandom.tags li a, dd.fandom a.tag');
  if (!el) return null;
  return (el.textContent || '').trim();
}

/**
 * Collect "key tags" from relationships + additional tags.
 * We'll reuse the first few for similarity.
 */
function getKeyTags() {
  const tags = [];

  // Relationships
  const relEls = document.querySelectorAll('dd.relationship.tags li a, li.relationships a.tag');
  relEls.forEach((el) => {
    const t = (el.textContent || '').trim();
    if (t) tags.push(t);
  });

  // Additional tags
  const addEls = document.querySelectorAll('dd.freeform.tags li a, dd.additional.tags li a, dd.freeform a.tag');
  addEls.forEach((el) => {
    const t = (el.textContent || '').trim();
    if (t) tags.push(t);
  });

  // Deduplicate, keep first few.
  const unique = [];
  const seen = new Set();
  for (const t of tags) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(t);
    if (unique.length >= MAX_TAGS) break;
  }

  return unique;
}

// Build an AO3 search URL from the similarity info (used as the fetch target).
function buildSimilarWorksUrl(info) {
  const base = new URL('/works', W.location.origin);

  // Fandom as tag_id to keep within same fandom.
  if (info.fandomTag) {
    base.searchParams.set('tag_id', info.fandomTag);
  }

  // Rating
  const ratingParam = mapRatingToParam(info.rating);
  if (ratingParam) {
    base.searchParams.set('work_search[ratings]', ratingParam);
  }

  // Words range
  if (info.wordsFrom != null && info.wordsTo != null) {
    if (info.wordsFrom > 0) base.searchParams.set('work_search[words_from]', String(info.wordsFrom));
    base.searchParams.set('work_search[words_to]', String(info.wordsTo));
  }

  // Tags as search query (simple space-joined)
  if (info.keyTags && info.keyTags.length) {
    const query = info.keyTags.join(' ');
    base.searchParams.set('work_search[query]', query);
  }

  // Sort by kudos (as a nice default for recs).
  base.searchParams.set('work_search[sort_column]', 'kudos');

  return base.toString();
}

function collectSimilarityInfo() {
  const rating    = getRating();
  const words     = getWordCount();
  const fandomTag = getFandomTag();
  const keyTags   = getKeyTags();
  const { from, to } = getWordRangeAround(words || 0);
  const authorEl      = document.querySelector('a[rel="author"]');
  const authorName    = authorEl ? authorEl.textContent.trim() : null;
  const authorHref    = authorEl ? (authorEl.getAttribute('href') || '') : '';
  const authorUsername = (authorHref.match(/\/users\/([^/]+)/) || [])[1] || null;

  return {
    rating, words, fandomTag, keyTags,
    wordsFrom: from, wordsTo: to,
    authorName, authorUsername,
  };
}

// Extract the current work ID from the URL.
function getCurrentWorkId() {
  return extractWorkIdFromHref(W.location.pathname);
}

// Build a URL for an author's works page sorted by kudos.
function buildAuthorWorksUrl(username) {
  if (!username) return null;
  const base = new URL(`/users/${encodeURIComponent(username)}/works`, W.location.origin);
  base.searchParams.set('work_search[sort_column]', 'kudos');
  return base.toString();
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — REQUESTS, RESULT PARSING, AND SCORING
═══════════════════════════════════════════════════════════════════════════ */

function runRequest(options) {
  return new Promise((resolve, reject) => {
    if (typeof GM_xmlhttpRequest === 'undefined') {
      reject(new Error('GM_xmlhttpRequest unavailable'));
      return;
    }

    let request = null;
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      activeRequests.delete(trackedRequest);
      callback(value);
    };
    const trackedRequest = {
      abort() {
        if (settled) return;
        request?.abort?.();
        finish(reject, new DOMException('Request aborted', 'AbortError'));
      },
    };

    activeRequests.add(trackedRequest);
    try {
      request = GM_xmlhttpRequest({
        ...options,
        onload: (response) => finish(resolve, response),
        onerror: (error) => finish(reject, error),
        onabort: () => finish(reject, new DOMException('Request aborted', 'AbortError')),
      });
    } catch (error) {
      finish(reject, error);
    }
  });
}

// POST mark_for_later for a given work ID.
// Transport note: was GM_xmlhttpRequest, now fetch (via lib/ao3/actions.js) —
// same-origin relative POST, no CORS need ; abort tracking preserved via
// activeRequests so module cleanup still cancels in-flight requests.
async function markForLater(workId) {
  const controller = new AbortController();
  const tracked = { abort: () => controller.abort() };
  activeRequests.add(tracked);
  try {
    return await markWorkForLater(workId, { signal: controller.signal });
  } catch {
    return false;
  } finally {
    activeRequests.delete(tracked);
  }
}

// Fetch an AO3 search results page via GM_xmlhttpRequest.
async function fetchSimilarWorks(url) {
  const response = await runRequest({
    method: 'GET',
    url,
  });
  return response.responseText;
}

// Parse AO3 work blurbs from a search-results HTML string.
function parseWorkBlurbs(html) {
  const doc     = new DOMParser().parseFromString(html, 'text/html');
  const results = [];
  doc.querySelectorAll('li.work.blurb').forEach((blurb) => {
    const idMatch = (blurb.id || '').match(/work_(\d+)/);
    if (!idMatch) return;
    const workId    = idMatch[1];
    const titleEl   = blurb.querySelector('h4.heading a:first-child');
    const authorEl  = blurb.querySelector('a[rel="author"]');
    const kudosEl   = blurb.querySelector('dd.kudos');
    const wordsEl   = blurb.querySelector('dd.words');
    const fandoms       = Array.from(blurb.querySelectorAll('.fandoms a.tag')).map(e => e.textContent.trim());
    const relationships = Array.from(blurb.querySelectorAll('.relationships a.tag')).map(e => e.textContent.trim());
    const freeforms     = Array.from(blurb.querySelectorAll('.freeforms a.tag')).map(e => e.textContent.trim());
    results.push({
      workId,
      title:     titleEl  ? titleEl.textContent.trim()                                       : '',
      href:      titleEl  ? titleEl.getAttribute('href')                                     : `/works/${workId}`,
      author:    authorEl ? authorEl.textContent.trim()                                      : 'Anonymous',
      kudos:     kudosEl  ? parseInt((kudosEl.textContent || '').replace(/,/g, ''), 10) || 0 : 0,
      wordCount: wordsEl  ? parseInt((wordsEl.textContent  || '').replace(/,/g, ''), 10) || 0 : 0,
      fandoms, relationships, freeforms,
    });
  });
  return results;
}

// Score a blurb against the current work's info. Returns { score, reasons, relMatchCount }.
function scoreWork(blurb, info) {
  let score = 0;
  const reasons = [];

  if (info.fandomTag && blurb.fandoms.some(f => f.toLowerCase() === info.fandomTag.toLowerCase())) {
    score += 40;
    reasons.push('fandom');
  }

  const blurbRelsLower  = blurb.relationships.map(t => t.toLowerCase());
  const blurbTagsLower  = [...blurbRelsLower, ...blurb.freeforms.map(t => t.toLowerCase())];
  const infoTagsLower   = (info.keyTags || []).map(t => t.toLowerCase());
  const relMatchCount   = infoTagsLower.filter(t => blurbRelsLower.includes(t)).length;
  const tagMatchCount   = infoTagsLower.filter(t => blurbTagsLower.includes(t)).length;
  if (tagMatchCount > 0) {
    score += Math.min(tagMatchCount * 10, 40);
    reasons.push(`${tagMatchCount} tag${tagMatchCount > 1 ? 's' : ''}`);
  }

  if (info.words && blurb.wordCount > 0) {
    const ratio = Math.min(info.words, blurb.wordCount) / Math.max(info.words, blurb.wordCount);
    if (ratio >= 0.8)      { score += 20; reasons.push('length'); }
    else if (ratio >= 0.5) { score += 10; }
  }

  return { score, reasons, relMatchCount };
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RECOMMENDATION PANEL AND ACTIONS
═══════════════════════════════════════════════════════════════════════════ */

// Create the panel shell (header + empty body). Starts hidden.
function createSimilarPanel() {
  const existing = document.getElementById(PANEL_ID);
  if (existing) return existing;

  const panel     = document.createElement('section');
  panel.id        = PANEL_ID;
  panel.className = 'ao3h-similar-fics-panel';
  panel.hidden    = true;

  const hdr      = document.createElement('div');
  hdr.className  = 'ao3h-sf-header';
  const h3       = document.createElement('h3');
  h3.className   = 'ao3h-sf-title';
  h3.textContent = 'Similar Stories';
  hdr.appendChild(h3);

  const body     = document.createElement('div');
  body.className = 'ao3h-sf-body';

  panel.appendChild(hdr);
  panel.appendChild(body);

  const anchor =
    document.querySelector('#main .work.meta') ||
    document.querySelector('dl.work.meta') ||
    document.querySelector('#main');
  if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(panel, anchor.nextSibling);
  } else {
    document.body.appendChild(panel);
  }
  return panel;
}

function renderLoading(panel) {
  const body = panel?.querySelector('.ao3h-sf-body');
  if (body) body.innerHTML = '<p class="ao3h-sf-loading">Finding similar stories…</p>';
}

function renderError(panel, msg) {
  const body = panel?.querySelector('.ao3h-sf-body');
  if (body) body.innerHTML = `<p class="ao3h-sf-error">${msg}</p>`;
}

// Build a single work card element.
function createWorkCard(r, showScore) {
  const card     = document.createElement('div');
  card.className = 'ao3h-sf-card';

  const top     = document.createElement('div');
  top.className = 'ao3h-sf-card-top';

  const titleLink       = document.createElement('a');
  titleLink.className   = 'ao3h-sf-work-title';
  titleLink.href        = r.href || `/works/${r.workId}`;
  titleLink.target      = '_blank';
  titleLink.rel         = 'noopener noreferrer';
  titleLink.textContent = r.title || `Work #${r.workId}`;
  top.appendChild(titleLink);

  if (showScore && r.score != null) {
    const scoreEl       = document.createElement('span');
    scoreEl.className   = 'ao3h-sf-score';
    scoreEl.textContent = `${r.score}% match`;
    if (r.reasons && r.reasons.length) scoreEl.textContent += ` · ${r.reasons.join(', ')}`;
    top.appendChild(scoreEl);
  }

  const metaEl       = document.createElement('div');
  metaEl.className   = 'ao3h-sf-card-meta';
  const mp           = [`by ${r.author}`];
  if (r.wordCount > 0) mp.push(`${r.wordCount.toLocaleString()} words`);
  if (r.kudos > 0)     mp.push(`${r.kudos.toLocaleString()} kudos`);
  metaEl.textContent = mp.join(' · ');

  const actions     = document.createElement('div');
  actions.className = 'ao3h-sf-actions';

  const openLink       = document.createElement('a');
  openLink.className   = 'ao3h-sf-open';
  openLink.href        = r.href || `/works/${r.workId}`;
  openLink.target      = '_blank';
  openLink.rel         = 'noopener noreferrer';
  openLink.textContent = 'Open';

  const mflBtn       = document.createElement('button');
  mflBtn.type        = 'button';
  mflBtn.className   = 'ao3h-sf-mfl-btn';
  mflBtn.textContent = '+ MFL';
  mflBtn.addEventListener('click', async () => {
    mflBtn.disabled    = true;
    mflBtn.textContent = '…';
    const ok           = await markForLater(r.workId);
    if (active && mflBtn.isConnected) mflBtn.textContent = ok ? '✓ MFL' : '✗ failed';
  });

  actions.appendChild(openLink);
  actions.appendChild(mflBtn);
  card.appendChild(top);
  card.appendChild(metaEl);
  card.appendChild(actions);
  return card;
}

// Append a titled section of work cards to frag.
function renderSection(frag, title, items, showScore) {
  if (!items.length) return;
  const section     = document.createElement('div');
  section.className = 'ao3h-sf-section';
  const hdr         = document.createElement('h4');
  hdr.className     = 'ao3h-sf-section-title';
  hdr.textContent   = title;
  section.appendChild(hdr);
  for (const r of items) section.appendChild(createWorkCard(r, showScore));
  frag.appendChild(section);
}

function renderResults(panel, { pairings, general, authorItems, info, excludedCount }) {
  const body = panel?.querySelector('.ao3h-sf-body');
  if (!body) return;
  if (!pairings.length && !general.length && !authorItems.length) {
    body.innerHTML = '<p class="ao3h-sf-empty">No similar stories found.</p>';
    return;
  }

  const frag = document.createDocumentFragment();

  const desc       = document.createElement('p');
  desc.className   = 'ao3h-sf-desc';
  const basedParts = [];
  if (info.fandomTag)                      basedParts.push(info.fandomTag);
  if (info.keyTags && info.keyTags.length) basedParts.push(`${info.keyTags.length} tag${info.keyTags.length > 1 ? 's' : ''}`);
  desc.textContent = `Based on: ${basedParts.join(' · ')}` +
    (excludedCount > 0 ? ` · ${excludedCount} already-read excluded` : '');
  frag.appendChild(desc);

  renderSection(frag, 'Similar Pairings', pairings, true);
  renderSection(frag, 'Similar Stories', general, true);
  if (info.authorName) renderSection(frag, `More by ${info.authorName}`, authorItems, false);

  body.innerHTML = '';
  body.appendChild(frag);
}

// Fetch (in parallel), filter by seen works, score, split into sections and render.
async function loadAndRenderResults(panel, info) {
  renderLoading(panel);
  try {
    const mainUrl   = buildSimilarWorksUrl(info);
    const authorUrl = info.authorUsername ? buildAuthorWorksUrl(info.authorUsername) : null;

    const [mainHtml, authorHtml] = await Promise.all([
      fetchSimilarWorks(mainUrl),
      authorUrl ? fetchSimilarWorks(authorUrl) : Promise.resolve(null),
    ]);
    if (!active || !panel.isConnected) return;

    const seenIds = getHistoryWorkIdSet();
    const curId   = getCurrentWorkId();
    if (curId) seenIds.add(curId);

    // Main results: score, threshold, split into pairings vs general.
    const mainBlurbs    = parseWorkBlurbs(mainHtml);
    const mainFiltered  = mainBlurbs.filter(b => !seenIds.has(b.workId));
    const excludedCount = mainBlurbs.length - mainFiltered.length;

    const mainScored = mainFiltered
      .map(b   => ({ ...b, ...scoreWork(b, info) }))
      .filter(b => b.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score);

    const pairings   = mainScored.filter(b => b.relMatchCount > 0).slice(0, MAX_PER_SECTION);
    const pairingIds = new Set(pairings.map(b => b.workId));
    const general    = mainScored.filter(b => !pairingIds.has(b.workId)).slice(0, MAX_PER_SECTION);

    // Author results: filter seen, no score threshold.
    const authorItems = authorHtml
      ? parseWorkBlurbs(authorHtml).filter(b => !seenIds.has(b.workId)).slice(0, MAX_PER_SECTION)
      : [];

    renderResults(panel, { pairings, general, authorItems, info, excludedCount });
  } catch (err) {
    if (!active || err?.name === 'AbortError') return;
    log('fetch error', err);
    renderError(panel, 'Could not load similar stories. Try again later.');
  }
}

// Inject the "Similar Stories" button into the work actions nav.
function injectSimilarStoriesButton(info) {
  if (document.getElementById(BUTTON_LI_ID)) return;

  const actionsList = document.querySelector('ul.work.navigation.actions');
  if (!actionsList) return;

  const li     = document.createElement('li');
  li.id        = BUTTON_LI_ID;
  li.className = 'ao3h-similar-stories';

  const btn       = document.createElement('button');
  btn.type        = 'button';
  btn.className   = 'ao3h-similar-stories-btn';
  btn.textContent = 'Similar Stories';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', PANEL_ID);

  let loaded = false;

  btn.addEventListener('click', async () => {
    const panel   = createSimilarPanel();
    const opening = panel.hidden;
    panel.hidden  = !opening;
    btn.setAttribute('aria-expanded', String(opening));

    if (opening && !loaded) {
      loaded = true;
      await loadAndRenderResults(panel, info);
    }
  });

  li.appendChild(btn);
  actionsList.appendChild(li);
}

// Build similarity info and inject the button on work pages.
function setupSimilarFicsPanel() {
  if (!isWorkPage()) {
    log('Not on a work page; skipping similar fics panel.');
    return;
  }
  const info = collectSimilarityInfo();
  injectSimilarStoriesButton(info);
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Main init function.
 */
async function init() {
  log('init');
  active = true;
  const html = document.documentElement;
  html.classList.add(ROOT_CLASS);

  setupSimilarFicsPanel();

  // No observers needed for v0; page is static enough.
  return function dispose() {
    log('stopped');
    active = false;
    activeRequests.forEach(request => request.abort());
    activeRequests.clear();
    html.classList.remove(ROOT_CLASS);
    const panel = document.getElementById(PANEL_ID);
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    const btnLi = document.getElementById(BUTTON_LI_ID);
    if (btnLi && btnLi.parentNode) btnLi.parentNode.removeChild(btnLi);
  };
}

register(
  MOD,
  { title: 'Similar Fics', enabledByDefault: false },
  init
);
