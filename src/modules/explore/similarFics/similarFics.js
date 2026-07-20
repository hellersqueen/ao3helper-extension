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
    - Similar-pairing, general, same-author, and same-series result sections
    - Match scores with already-read and dismissed work exclusion
    - Removable "Based on" criteria chips to refine a search on the fly
    - Inline “Mark for Later” actions

    Notes

    - Cross-page result loading uses the userscript request transport.
    - Active searches and Mark-for-Later requests are aborted during cleanup.
    - Results below the score threshold (set by `matchStyle`) are excluded.
    - Recommendations stay local: same-tag matching only, no external/AI
      recommendation service, no cross-work taste profile (see similarFics.md
      "Décisions de conception").

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { getHistoryWorkIdSet } from '../../../../lib/storage/keys.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { createPersistedCache } from '../../../../lib/storage/cache.js';
import { markWorkForLater } from '../../../../lib/ao3/actions.js';
import { extractWorkIdFromHref, findAllBlurbs, getBlurbMeta } from '../../../../lib/ao3/parsers.js';
import { getWorkFandoms } from '../../../../lib/ao3/work-page.js';
import { getBlurbStats, getWorkPageStats } from '../../../../lib/ao3/work-stats.js';
import styles from './similarFics.css?inline';

/* ═══════════════════════════════════════════════════════════════════════════
   RECOMMENDATION HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const WORD_BUCKET_SIZES = [2_000, 5_000, 10_000, 20_000, 50_000, 100_000];

function baseWordRange (count) {
  if (typeof count !== 'number' || !isFinite(count) || count <= 0) {
    return { from: null, to: null };
  }
  let step = 5000;
  for (const size of WORD_BUCKET_SIZES) {
    if (count <= size) { step = size / 2; break; }
  }
  const half = step / 2;
  let from = Math.max(0, Math.floor((count - half) / 100) * 100);
  let to = Math.floor((count + half) / 100) * 100;
  if (from < 1000) from = 0;
  if (to < from) to = from;
  return { from, to };
}

export function getWordRangeForMode (count, mode = 'similar') {
  if (mode === 'quick') return { from: 0, to: 10_000 };
  if (mode === 'epic') return { from: 100_000, to: null };
  if (typeof count !== 'number' || !isFinite(count) || count <= 0) {
    return { from: null, to: null };
  }
  if (mode === 'shorter') return { from: 0, to: Math.max(1000, Math.floor(count * 0.7)) };
  if (mode === 'longer') return { from: Math.floor(count * 1.4), to: null };
  return baseWordRange(count);
}

export function minScoreForStyle (matchStyle = 'balanced') {
  if (matchStyle === 'close') return 80;
  if (matchStyle === 'variety') return 50;
  return 70;
}

export function scoreWork (blurb, info) {
  let score = 0;
  const reasons = [];
  if (info.fandomTag && blurb.fandoms.some(fandom =>
    fandom.toLowerCase() === info.fandomTag.toLowerCase())) {
    score += 40;
    reasons.push('fandom');
  }
  const blurbRelsLower = blurb.relationships.map(tag => tag.toLowerCase());
  const blurbOtherLower = blurb.freeforms.map(tag => tag.toLowerCase());
  const relTagsLower = (info.relationshipTags || []).map(tag => tag.toLowerCase());
  const otherTagsLower = (info.otherTags || []).map(tag => tag.toLowerCase());
  const relMatchCount = relTagsLower.filter(tag => blurbRelsLower.includes(tag)).length;
  const otherMatchCount = otherTagsLower.filter(tag => blurbOtherLower.includes(tag)).length;
  if (relMatchCount > 0) {
    score += Math.min(relMatchCount * 15, 30);
    reasons.push(`${relMatchCount} pairing tag${relMatchCount > 1 ? 's' : ''}`);
  }
  if (otherMatchCount > 0) {
    score += Math.min(otherMatchCount * 8, 24);
    reasons.push(`${otherMatchCount} tag${otherMatchCount > 1 ? 's' : ''}`);
  }
  if (info.words && blurb.wordCount > 0) {
    const ratio = Math.min(info.words, blurb.wordCount) / Math.max(info.words, blurb.wordCount);
    if (ratio >= 0.8) { score += 20; reasons.push('length'); }
    else if (ratio >= 0.5) score += 10;
  }
  return { score, reasons, relMatchCount };
}

export function passesLengthFilter (blurb, currentWords, lengthMode) {
  if (lengthMode !== 'similar' || !currentWords || !blurb.wordCount) return true;
  const ratio = Math.min(currentWords, blurb.wordCount) / Math.max(currentWords, blurb.wordCount);
  return ratio >= 0.8;
}

export function buildReasonText (reasons) {
  const labels = { fandom: 'same fandom', length: 'similar length' };
  return (reasons || []).map(reason => {
    if (labels[reason]) return labels[reason];
    const pairingMatch = reason.match(/^(\d+) pairing tags?$/);
    if (pairingMatch) {
      return `shares ${pairingMatch[1] === '1' ? 'a pairing tag' : pairingMatch[1] + ' pairing tags'}`;
    }
    const tagMatch = reason.match(/^(\d+) tags?$/);
    if (tagMatch) return `shares ${tagMatch[1] === '1' ? '1 tag' : tagMatch[1] + ' tags'}`;
    return reason;
  }).join(', ');
}

export function filterDismissed (items, dismissedIds) {
  if (!dismissedIds || !dismissedIds.size) return items;
  return items.filter(item => !dismissedIds.has(item.workId));
}

export function addDismissed (list, workId, cap = 200) {
  const rest = (Array.isArray(list) ? list : []).filter(id => id !== workId);
  return [workId, ...rest].slice(0, cap);
}

export function parseSeriesPartOf (text) {
  const match = /Part\s+(\d+)\s+of\s+(\d+)/i.exec(text || '');
  return match ? { part: +match[1], total: +match[2] } : null;
}


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

const MAX_REL_TAGS   = 2;
const MAX_OTHER_TAGS = 2;
const MAX_PER_SECTION_OPTIONS = [5, 10, 15];

const SK_DISMISSED = 'ao3h:sf:dismissed';
const resultsCache = createPersistedCache({ key: 'ao3h:sf:cache', ttlMs: 60 * 60 * 1000 });

const DEFAULTS = {
  numResults:           '10',
  showSimilarityScore:  true,
  highlightCommonTags:  true,
  showSummary:          true,
  includeWIP:           false,
  openInNewTab:         false,
  lengthMode:           'similar',  // 'similar' | 'shorter' | 'longer' | 'quick' | 'epic'
  matchStyle:           'balanced', // 'close' | 'balanced' | 'variety'
  matchRating:          true,
  cacheResults:         true,
  showSeriesSection:    true,
};

const cfg = makeCfg(MOD, DEFAULTS);

function log(...args) {
  console.log(LOG, ...args);
}

function maxPerSection() {
  const n = parseInt(cfg('numResults'), 10);
  return MAX_PER_SECTION_OPTIONS.includes(n) ? n : 10;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — DISMISSED ("NOT INTERESTED") WORKS
═══════════════════════════════════════════════════════════════════════════ */

function loadDismissed() {
  return new Set((lsGet(SK_DISMISSED) || []).map(String));
}

function dismissWork(workId) {
  lsSet(SK_DISMISSED, addDismissed(lsGet(SK_DISMISSED) || [], workId));
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

function uniqueTags(elements, cap) {
  const out = [];
  const seen = new Set();
  elements.forEach((el) => {
    const t = (el.textContent || '').trim();
    if (!t) return;
    const key = t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(t);
  });
  return cap ? out.slice(0, cap) : out;
}

/** Relationship/pairing tags, capped for query length. */
function getRelationshipTags() {
  return uniqueTags(document.querySelectorAll('dd.relationship.tags li a, li.relationships a.tag'), MAX_REL_TAGS);
}

/** Character/freeform ("additional") tags, capped for query length. */
function getOtherTags() {
  return uniqueTags(document.querySelectorAll('dd.freeform.tags li a, dd.additional.tags li a, dd.freeform a.tag'), MAX_OTHER_TAGS);
}

/** Series info for the current work, if it belongs to one — used to prioritize sequels/prequels. */
function getSeriesInfo() {
  const a = document.querySelector('dd.series a[href*="/series/"]');
  if (!a) return null;
  const seriesId = (a.getAttribute('href').match(/\/series\/(\d+)/) || [])[1] || null;
  if (!seriesId) return null;
  const dd = a.closest('dd.series');
  const partOf = parseSeriesPartOf(dd?.textContent || '');
  return { seriesId, seriesName: a.textContent.trim(), seriesHref: a.getAttribute('href'), ...partOf };
}

// Build an AO3 search URL from the similarity info (used as the fetch target).
function buildSimilarWorksUrl(info) {
  const base = new URL('/works', W.location.origin);

  // Fandom as tag_id to keep within same fandom.
  if (info.fandomTag) {
    base.searchParams.set('tag_id', info.fandomTag);
  }

  // Rating (only when the user wants matches restricted to the same rating).
  if (cfg('matchRating')) {
    const ratingParam = mapRatingToParam(info.rating);
    if (ratingParam) base.searchParams.set('work_search[ratings]', ratingParam);
  }

  // Words range, shaped by the configured length preference.
  if (info.wordsFrom != null) base.searchParams.set('work_search[words_from]', String(info.wordsFrom));
  if (info.wordsTo != null)   base.searchParams.set('work_search[words_to]', String(info.wordsTo));

  // Complete-only unless the user opted in to works-in-progress.
  if (!cfg('includeWIP')) base.searchParams.set('work_search[complete]', 'T');

  // Tags as search query (simple space-joined) — relationships + other tags.
  const keyTags = [...(info.relationshipTags || []), ...(info.otherTags || [])];
  if (keyTags.length) {
    base.searchParams.set('work_search[query]', keyTags.join(' '));
  }

  // Sort by kudos (as a nice default for recs).
  base.searchParams.set('work_search[sort_column]', 'kudos');

  return base.toString();
}

function collectSimilarityInfo() {
  const rating    = getRating();
  const words     = getWorkPageStats(document).words;
  const fandomTag = getWorkFandoms(document)[0] || null;
  const relationshipTags = getRelationshipTags();
  const otherTags = getOtherTags();
  const { from, to } = getWordRangeForMode(words || 0, cfg('lengthMode'));
  const authorEl      = document.querySelector('a[rel="author"]');
  const authorName    = authorEl ? authorEl.textContent.trim() : null;
  const authorHref    = authorEl ? (authorEl.getAttribute('href') || '') : '';
  const authorUsername = (authorHref.match(/\/users\/([^/]+)/) || [])[1] || null;
  const series = getSeriesInfo();

  return {
    rating, words, fandomTag, relationshipTags, otherTags,
    wordsFrom: from, wordsTo: to,
    authorName, authorUsername, series,
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
   FEATURE — REQUESTS, RESULT PARSING
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

// Fetch an AO3 search results (or series) page via GM_xmlhttpRequest.
async function fetchSimilarWorks(url) {
  const response = await runRequest({
    method: 'GET',
    url,
  });
  return response.responseText;
}

// Parse AO3 work blurbs from a search-results (or series) HTML string.
function parseWorkBlurbs(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return findAllBlurbs(doc).map((blurb) => {
    const meta = getBlurbMeta(blurb);
    if (!meta?.workId) return null;
    const stats   = getBlurbStats(blurb);
    const titleEl = blurb.querySelector('h4.heading a[href*="/works/"], .heading a[href*="/works/"]');
    return {
      workId:    meta.workId,
      title:     meta.title,
      href:      titleEl ? titleEl.getAttribute('href') : `/works/${meta.workId}`,
      author:    meta.author || 'Anonymous',
      kudos:     stats.kudos ?? 0,
      wordCount: stats.words ?? 0,
      summary:   meta.summary,
      fandoms:       meta.fandoms,
      relationships: meta.relationships,
      freeforms:     meta.freeforms,
    };
  }).filter(Boolean);
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
function createWorkCard(r, { showScore, showSummary, onDismiss }) {
  const card     = document.createElement('div');
  card.className = 'ao3h-sf-card';

  const top     = document.createElement('div');
  top.className = 'ao3h-sf-card-top';

  const titleLink       = document.createElement('a');
  titleLink.className   = 'ao3h-sf-work-title';
  titleLink.href        = r.href || `/works/${r.workId}`;
  if (cfg('openInNewTab')) { titleLink.target = '_blank'; titleLink.rel = 'noopener noreferrer'; }
  titleLink.textContent = r.title || `Work #${r.workId}`;
  top.appendChild(titleLink);

  if (showScore && r.score != null) {
    const scoreEl       = document.createElement('span');
    scoreEl.className   = 'ao3h-sf-score';
    scoreEl.textContent = `${r.score}% match`;
    if (r.reasons && r.reasons.length) scoreEl.textContent += ` · ${buildReasonText(r.reasons)}`;
    top.appendChild(scoreEl);
  }

  const metaEl       = document.createElement('div');
  metaEl.className   = 'ao3h-sf-card-meta';
  const mp           = [`by ${r.author}`];
  if (r.wordCount > 0) mp.push(`${r.wordCount.toLocaleString()} words`);
  if (r.kudos > 0)     mp.push(`${r.kudos.toLocaleString()} kudos`);
  metaEl.textContent = mp.join(' · ');

  card.appendChild(top);
  card.appendChild(metaEl);

  if (showSummary && r.summary) {
    const summaryEl     = document.createElement('p');
    summaryEl.className = 'ao3h-sf-card-summary';
    summaryEl.textContent = r.summary;
    card.appendChild(summaryEl);
  }

  const actions     = document.createElement('div');
  actions.className = 'ao3h-sf-actions';

  const openLink       = document.createElement('a');
  openLink.className   = 'ao3h-sf-open';
  openLink.href        = r.href || `/works/${r.workId}`;
  if (cfg('openInNewTab')) { openLink.target = '_blank'; openLink.rel = 'noopener noreferrer'; }
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

  const dismissBtn       = document.createElement('button');
  dismissBtn.type        = 'button';
  dismissBtn.className   = 'ao3h-sf-dismiss-btn';
  dismissBtn.title       = 'Not interested — don’t suggest this again';
  dismissBtn.textContent = '✕';
  dismissBtn.addEventListener('click', () => onDismiss(r.workId, card));

  actions.appendChild(openLink);
  actions.appendChild(mflBtn);
  actions.appendChild(dismissBtn);
  card.appendChild(actions);
  return card;
}

// Append a titled section of work cards to frag.
function renderSection(frag, title, items, { showScore, showSummary, onDismiss }) {
  if (!items.length) return;
  const section     = document.createElement('div');
  section.className = 'ao3h-sf-section';
  const hdr         = document.createElement('h4');
  hdr.className     = 'ao3h-sf-section-title';
  hdr.textContent   = title;
  section.appendChild(hdr);
  for (const r of items) section.appendChild(createWorkCard(r, { showScore, showSummary, onDismiss }));
  frag.appendChild(section);
}

// Render the "Based on: ..." line as removable criteria chips.
function renderCriteriaChips(frag, info, onExclude) {
  const chips = [];
  if (info.fandomTag) chips.push({ label: info.fandomTag, kind: 'fandom', value: info.fandomTag });
  (info.relationshipTags || []).forEach(t => chips.push({ label: t, kind: 'relationshipTags', value: t }));
  (info.otherTags || []).forEach(t => chips.push({ label: t, kind: 'otherTags', value: t }));
  if (!chips.length) return;

  const wrap     = document.createElement('div');
  wrap.className = 'ao3h-sf-criteria';
  const label     = document.createElement('span');
  label.className = 'ao3h-sf-criteria-label';
  label.textContent = 'Based on:';
  wrap.appendChild(label);

  chips.forEach(chip => {
    const pill       = document.createElement('span');
    pill.className   = 'ao3h-sf-criteria-chip';
    pill.textContent = chip.label;
    const remove       = document.createElement('button');
    remove.type         = 'button';
    remove.className    = 'ao3h-sf-criteria-remove';
    remove.title         = `Exclude "${chip.label}" from this search`;
    remove.textContent   = '✕';
    remove.addEventListener('click', () => onExclude(chip));
    pill.appendChild(remove);
    wrap.appendChild(pill);
  });

  frag.appendChild(wrap);
}

function renderResults(panel, { pairings, general, authorItems, seriesItems, info, excludedCount, onExclude, onDismiss }) {
  const body = panel?.querySelector('.ao3h-sf-body');
  if (!body) return;
  if (!pairings.length && !general.length && !authorItems.length && !seriesItems.length) {
    body.innerHTML = '<p class="ao3h-sf-empty">No similar stories found.</p>';
    return;
  }

  const frag = document.createDocumentFragment();

  renderCriteriaChips(frag, info, onExclude);

  const desc       = document.createElement('p');
  desc.className   = 'ao3h-sf-desc';
  desc.textContent = excludedCount > 0 ? `${excludedCount} already-read excluded` : '';
  if (desc.textContent) frag.appendChild(desc);

  const showScore   = cfg('showSimilarityScore');
  const showSummary = cfg('showSummary');
  const opts = { showScore, showSummary, onDismiss };

  if (seriesItems.length && cfg('showSeriesSection')) {
    renderSection(frag, `More in ${info.series?.seriesName || 'this series'}`, seriesItems, { ...opts, showScore: false });
  }
  renderSection(frag, 'Similar Pairings', pairings, opts);
  renderSection(frag, 'Similar Stories', general, opts);
  if (info.authorName) renderSection(frag, `More by ${info.authorName}`, authorItems, { ...opts, showScore: false });

  body.innerHTML = '';
  body.appendChild(frag);
}

function cacheKeyFor(workId, info) {
  return JSON.stringify([
    workId, cfg('lengthMode'), cfg('matchStyle'), cfg('matchRating'), cfg('includeWIP'),
    info.fandomTag, info.relationshipTags, info.otherTags,
  ]);
}

// Fetch (in parallel), filter by seen/dismissed works, score, split into sections and render.
async function loadAndRenderResults(panel, info, { onExclude, onDismiss }) {
  renderLoading(panel);
  const workId = getCurrentWorkId();
  const cacheKey = cacheKeyFor(workId, info);

  try {
    let payload = cfg('cacheResults') ? resultsCache.get(cacheKey) : null;

    if (!payload) {
      const mainUrl   = buildSimilarWorksUrl(info);
      const authorUrl = info.authorUsername ? buildAuthorWorksUrl(info.authorUsername) : null;
      const seriesUrl = info.series?.seriesId ? new URL(`/series/${info.series.seriesId}`, W.location.origin).toString() : null;

      const [mainHtml, authorHtml, seriesHtml] = await Promise.all([
        fetchSimilarWorks(mainUrl),
        authorUrl ? fetchSimilarWorks(authorUrl) : Promise.resolve(null),
        seriesUrl ? fetchSimilarWorks(seriesUrl) : Promise.resolve(null),
      ]);
      if (!active || !panel.isConnected) return;

      payload = { mainHtml, authorHtml, seriesHtml };
      if (cfg('cacheResults')) resultsCache.set(cacheKey, payload);
    }
    if (!active || !panel.isConnected) return;

    const seenIds = getHistoryWorkIdSet();
    const dismissed = loadDismissed();
    if (workId) seenIds.add(workId);

    // Main results: score, threshold, split into pairings vs general.
    const mainBlurbs    = parseWorkBlurbs(payload.mainHtml);
    const mainFiltered  = filterDismissed(mainBlurbs.filter(b => !seenIds.has(b.workId)), dismissed);
    const excludedCount = mainBlurbs.length - mainFiltered.length;
    const minScore       = minScoreForStyle(cfg('matchStyle'));

    const mainScored = mainFiltered
      .map(b   => ({ ...b, ...scoreWork(b, info) }))
      .filter(b => b.score >= minScore)
      .filter(b => passesLengthFilter(b, info.words, cfg('lengthMode')))
      .sort((a, b) => b.score - a.score);

    const perSection = maxPerSection();
    const pairings   = mainScored.filter(b => b.relMatchCount > 0).slice(0, perSection);
    const pairingIds = new Set(pairings.map(b => b.workId));
    const general    = mainScored.filter(b => !pairingIds.has(b.workId)).slice(0, perSection);

    // Author results: filter seen/dismissed, no score threshold.
    const authorItems = payload.authorHtml
      ? filterDismissed(parseWorkBlurbs(payload.authorHtml).filter(b => !seenIds.has(b.workId)), dismissed).slice(0, perSection)
      : [];

    // Series results: filter seen/dismissed/current work, no score threshold — precise, not fuzzy.
    const seriesItems = payload.seriesHtml
      ? filterDismissed(parseWorkBlurbs(payload.seriesHtml).filter(b => !seenIds.has(b.workId) && b.workId !== workId), dismissed).slice(0, perSection)
      : [];

    renderResults(panel, { pairings, general, authorItems, seriesItems, info, excludedCount, onExclude, onDismiss });
  } catch (err) {
    if (!active || err?.name === 'AbortError') return;
    log('fetch error', err);
    renderError(panel, 'Could not load similar stories. Try again later.');
  }
}

// Inject the "Similar Stories" button into the work actions nav.
function injectSimilarStoriesButton(baseInfo) {
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

  let currentInfo = baseInfo;
  const panel = () => document.getElementById(PANEL_ID);

  const refresh = () => {
    const p = panel();
    if (p) loadAndRenderResults(p, currentInfo, { onExclude, onDismiss });
  };

  function onExclude(chip) {
    if (chip.kind === 'fandom') {
      currentInfo = { ...currentInfo, fandomTag: null };
    } else {
      currentInfo = { ...currentInfo, [chip.kind]: currentInfo[chip.kind].filter(t => t !== chip.value) };
    }
    refresh();
  }

  function onDismiss(workId, cardEl) {
    dismissWork(workId);
    cardEl?.remove();
  }

  btn.addEventListener('click', async () => {
    const p       = createSimilarPanel();
    const opening = p.hidden;
    p.hidden      = !opening;
    btn.setAttribute('aria-expanded', String(opening));

    if (opening) await loadAndRenderResults(p, currentInfo, { onExclude, onDismiss });
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
