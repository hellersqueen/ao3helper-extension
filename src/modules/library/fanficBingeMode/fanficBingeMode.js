/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fanfic Binge Mode

    Module ID: fanficBingeMode
    Display Name: Fanfic Binge Mode
    Tab: Library

    Purpose

    Connects end-of-work actions, recent reading, discovery suggestions, and a
    persistent reading queue into a continuous browsing workflow.

    Features

    - End-of-fic action modal with optional countdown
    - Homepage continuation panel and post-reading suggestions
    - Persistent, prioritized, drag-reorderable reading queue

    Notes

    - Reading history and Fic Appreciation are soft dependencies.
    - The queue stores work metadata and priority under ao3h:fbm:queue.
    - Dynamic listing blurbs receive queue controls through an observer.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet, observe, onReady } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { extractWorkIdFromHref, isWorkPage, isListingPage } from '../../../../lib/ao3/parsers.js';
import { relativeDate } from '../../../../lib/utils/format-date.js';
import { showToast, clearAllToasts } from '../../../../lib/ui/toast.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import styles from './fanficBingeMode.css?inline';

/* ═══════════════════════════════════════════════════════════════════════════
   BINGE QUEUE HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export const PRIORITY_LEVELS = ['low', 'medium', 'high'];
export const PRIORITY_ICON = { low: '⚪', medium: '⭐', high: '🌟' };

function normalizePriority (priority) {
  if (priority === 'normal') return 'medium';
  return PRIORITY_LEVELS.includes(priority) ? priority : 'medium';
}

export function nextPriority (current) {
  const index = PRIORITY_LEVELS.indexOf(normalizePriority(current));
  return PRIORITY_LEVELS[(index + 1) % PRIORITY_LEVELS.length];
}

export function priorityRank (priority) {
  return PRIORITY_LEVELS.indexOf(normalizePriority(priority));
}

export function priorityIcon (priority) {
  return PRIORITY_ICON[normalizePriority(priority)];
}

export function pickNextQueueEntry (queue) {
  if (!queue || !queue.length) return null;
  return queue.reduce((best, entry) =>
    priorityRank(entry.priority) > priorityRank(best.priority) ? entry : best);
}

export function isResumable (entry) {
  if (!entry) return false;
  if (!entry.totalChapters || !entry.chapter) return true;
  return entry.chapter < entry.totalChapters;
}

export function resumableEntries (history, limit) {
  return (history || []).filter(isResumable).slice(0, limit);
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-fanficBingeMode');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'fanficBingeMode';
const LOG  = `[AO3H][${MOD}]`;

const DEFAULTS = {
  continueReadingModal       : true,
  showHomepagePanel          : true,
  showPostReadingSuggestions : true,
  queueEnabled               : false,
  autoAdvanceDelay           : 0,    // seconds; 0 = disabled
  resumeCount                : 5,
  homepagePanelStyle         : 'list',   // list | banner | sidebar
  reminderScope              : 'home',   // home | home+search | everywhere
  breakReminderMinutes       : 0,        // 0 = off
};

const SK_QUEUE    = 'ao3h:fbm:queue';
const SK_RT_HIST  = 'ao3h:rt:history';  // readingTracker — soft dep
const SK_RT_PROGRESS_PREFIX = 'ao3h:rt:progress:';  // readingTracker — soft dep

const cfg = makeCfg(MOD, DEFAULTS);

function isHomePage ()  { return location.pathname === '/' || location.pathname === '/home'; }
function getWorkId () {
  return extractWorkIdFromHref(location.pathname);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — END-OF-FIC CONTINUATION
═══════════════════════════════════════════════════════════════════════════ */

// Returns true if the current page is the last (or only) chapter
function isLastChapter () {
  // No chapter select = full-work view (single chapter or all chapters)
  const sel = document.querySelector('select#selected_id');
  if (!sel) return true;  // no chapter select = full-work view
  const opts    = Array.from(sel.options);
  const current = sel.value;
  return opts.length > 0 && opts[opts.length - 1].value === current;
}

// ── Scroll detection (95% threshold) ─────────────────────────────────────
let _scrollHandler    = null;
let _countdownInterval = null;

function watchForEndOfFic (onReach) {
  _scrollHandler = () => {
    const scrolled = window.scrollY + window.innerHeight;
    const total    = document.documentElement.scrollHeight;
    if (total > 0 && scrolled / total >= 0.95) {
      window.removeEventListener('scroll', _scrollHandler);
      _scrollHandler = null;
      onReach();
    }
  };
  window.addEventListener('scroll', _scrollHandler, { passive: true });
}

const MODAL_ID    = `${NS}-fbm-modal`;
function removeModal () {
  if (_countdownInterval) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }
  document.getElementById(`${MODAL_ID}-overlay`)?.remove();
}

function showContinueModal () {
  if (document.getElementById(`${MODAL_ID}-overlay`)) return;

  const workTitle = document.querySelector('.title.heading')?.textContent.trim() || 'this work';
  const overlay   = document.createElement('div');
  overlay.id      = `${MODAL_ID}-overlay`;

  overlay.innerHTML = `
    <div id="${MODAL_ID}">
      <button id="${MODAL_ID}-close" title="Close">&times;</button>
      <h3>You've reached the end!</h3>
      <p>Finished reading <em>${escapeHtml(workTitle)}</em>. What next?</p>
      <div class="${NS}-fbm-actions">
        <button class="primary ${NS}-fbm-btn-read">Mark as Read</button>
        <button class="${NS}-fbm-btn-bookmark">Bookmark</button>
        <button class="${NS}-fbm-btn-mfl">Add to MFL</button>
        <button class="${NS}-fbm-btn-dismiss">Dismiss</button>
      </div>
    </div>`;

  overlay.querySelector(`#${MODAL_ID}-close`).addEventListener('click', removeModal);
  overlay.querySelector(`.${NS}-fbm-btn-dismiss`).addEventListener('click', removeModal);

  // "Mark as Read" → delegate to ficAppreciation if available, else just close
  overlay.querySelector(`.${NS}-fbm-btn-read`).addEventListener('click', () => {
    const workId = getWorkId();
    if (workId && W.AO3H_FicAppreciation?.markAsRead) {
      W.AO3H_FicAppreciation.markAsRead(workId);
    }
    removeModal();
  });

  // "Bookmark" → AO3 native bookmarks form
  overlay.querySelector(`.${NS}-fbm-btn-bookmark`).addEventListener('click', () => {
    const workId = getWorkId();
    if (workId) location.href = `/works/${workId}/bookmarks/new`;
    else removeModal();
  });

  // "Add to MFL" → AO3 native mark-for-later endpoint
  overlay.querySelector(`.${NS}-fbm-btn-mfl`).addEventListener('click', () => {
    const workId = getWorkId();
    if (workId) location.href = `/works/${workId}/mark_for_later`;
    else removeModal();
  });

  // Close on overlay click (outside modal)
  overlay.addEventListener('click', e => { if (e.target === overlay) removeModal(); });

  document.body.appendChild(overlay);

  // Optional auto-advance countdown
  const delay = cfg('autoAdvanceDelay');
  if (delay > 0) {
    const countdownEl = document.createElement('p');
    countdownEl.className = `${NS}-fbm-countdown`;
    document.getElementById(MODAL_ID).appendChild(countdownEl);

    let remaining = delay;
    const update = () => {
      countdownEl.textContent = `Loading next fic in ${remaining}s… `;
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.className = 'ao3h-fbm-countdown-cancel';
      cancelBtn.addEventListener('click', removeModal);
      countdownEl.appendChild(cancelBtn);
    };
    update();
    _countdownInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        removeModal();
        const next = pickNextQueueEntry(getQueue());
        location.href = next ? (next.href || `/works/${next.id}`) : '/works';
      } else {
        update();
      }
    }, 1000);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CONTINUE READING AND DISCOVERY PANELS
═══════════════════════════════════════════════════════════════════════════ */

const HP_PANEL_ID = `${NS}-fbm-homepage-panel`;
const RESUME_WIDGET_ID = `${NS}-fbm-resume-widget`;

function getResumableEntries () {
  const history = lsGet(SK_RT_HIST) || [];
  return resumableEntries(history, cfg('resumeCount'));
}

function buildResumeItemHTML (entry) {
  const title = entry.title ? escapeHtml(entry.title) : `Work ${entry.id}`;
  const href  = entry.chapterHref || entry.href || `/works/${entry.id}`;
  const ch    = entry.chapter ? `<span class="${NS}-fbm-meta">Ch ${entry.chapter}</span>` : '';
  const ago   = entry.lastReadAt ? relativeDate(entry.lastReadAt) : null;
  const agoEl = ago ? `<span class="${NS}-fbm-meta">${ago}</span>` : '';
  return `<li><a href="${href}">${title}</a>${ch}${agoEl}</li>`;
}

function injectHomepagePanel () {
  if (document.getElementById(HP_PANEL_ID)) return;

  const recent = getResumableEntries();
  if (recent.length === 0) return;

  const style = cfg('homepagePanelStyle') || 'list';
  const panel = document.createElement('div');
  panel.id    = HP_PANEL_ID;
  panel.className = `${NS}-fbm-hp--${style}`;

  if (style === 'banner') {
    // Banner: a single prominent entry — the most recently read work
    panel.innerHTML = `<h3>Continue Reading</h3>${buildResumeItemHTML(recent[0]).replace('<li>', '<div>').replace('</li>', '</div>')}`;
  } else {
    const items = recent.map(buildResumeItemHTML).join('');
    panel.innerHTML = `<h3>Continue Reading</h3><ul>${items}</ul>`;
  }

  if (style === 'sidebar') {
    document.body.appendChild(panel);  // fixed position, see CSS
  } else {
    const main = document.getElementById('main') || document.querySelector('#content .inner');
    if (main) main.insertAdjacentElement('afterbegin', panel);
  }
}

// Compact "📖 Continue: <title>" pill for pages that aren't the homepage,
// shown when reminderScope extends past 'home'.
function injectResumeWidget () {
  if (document.getElementById(RESUME_WIDGET_ID)) return;
  const [entry] = getResumableEntries();
  if (!entry) return;

  const title = entry.title ? escapeHtml(entry.title) : `Work ${entry.id}`;
  const href  = entry.chapterHref || entry.href || `/works/${entry.id}`;
  const widget = document.createElement('a');
  widget.id        = RESUME_WIDGET_ID;
  widget.href      = href;
  widget.innerHTML = `📖 Continue: ${title}`;
  document.body.appendChild(widget);
}

function maybeInjectReminders () {
  const scope = cfg('reminderScope') || 'home';

  if (cfg('showHomepagePanel') && isHomePage()) injectHomepagePanel();

  if (scope === 'home') return;
  if (isHomePage()) return; // homepage already has the full panel above
  if (scope === 'home+search' && !isListingPage()) return;
  injectResumeWidget();
}

const SUGG_ID  = `${NS}-fbm-suggestions`;

function injectPostReadingSuggestions () {
  if (document.getElementById(SUGG_ID)) return;

  const workId = getWorkId();
  if (!workId) return;

  const authorEl  = document.querySelector('.byline a[href*="/users/"]');
  const seriesEl  = document.querySelector('.series .series');
  const nextInSer = seriesEl?.querySelector('a[href*="/series/"]');

  const links = [];

  if (authorEl) {
    const authorHref  = authorEl.getAttribute('href');
    const authorName  = authorEl.textContent.trim();
    links.push({ label: `More by ${authorName}`, href: `${authorHref}/works` });
  }

  if (nextInSer) {
    const seriesHref = nextInSer.getAttribute('href');
    const seriesName = nextInSer.textContent.trim();
    links.push({ label: `More in series: ${seriesName}`, href: seriesHref });
  }

  // Fallback: search for similar freeform tags
  const firstTag = document.querySelector('.freeform.tags li .tag');
  if (firstTag) {
    const tagText = encodeURIComponent(firstTag.textContent.trim());
    links.push({ label: `More tagged: ${firstTag.textContent.trim()}`, href: `/tags/${tagText}/works` });
  }

  if (links.length === 0) return;

  const panel  = document.createElement('div');
  panel.id     = SUGG_ID;
  const items  = links.map(l =>
    `<a class="${NS}-fbm-sugg-link" href="${l.href}">${escapeHtml(l.label)}</a>`
  ).join('');
  panel.innerHTML = `<h3>What to read next</h3><div class="${NS}-fbm-sugg-list">${items}</div>`;

  // Inject after the work content
  const endNotes = document.querySelector('#work_endnotes') ||
                   document.querySelector('.afterword') ||
                   document.querySelector('#chapters');
  if (endNotes) endNotes.insertAdjacentElement('afterend', panel);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READING QUEUE
═══════════════════════════════════════════════════════════════════════════ */

const QUEUE_PANEL_ID  = `${NS}-fbm-queue-panel`;
const QUEUE_BTN_CLASS = `${NS}-fbm-add-queue`;
function getQueue ()        { return lsGet(SK_QUEUE) || []; }
function saveQueue (queue)  { lsSet(SK_QUEUE, queue); }
function isInQueue (workId) { return getQueue().some(e => e.id === workId); }

function addToQueue (workId, title, href) {
  const queue = getQueue();
  if (queue.some(e => e.id === workId)) return;
  queue.push({ id: workId, title, href, addedAt: Date.now(), priority: 'medium' });
  saveQueue(queue);
  refreshQueuePanel();
}

function removeFromQueue (workId) {
  saveQueue(getQueue().filter(e => e.id !== workId));
  refreshQueuePanel();
}

function togglePriority (workId) {
  const queue = getQueue();
  const entry = queue.find(e => e.id === workId);
  if (entry) entry.priority = nextPriority(entry.priority);
  saveQueue(queue);
  refreshQueuePanel();
}

function getReadProgress (workId) {
  const progress = lsGet(`${SK_RT_PROGRESS_PREFIX}${workId}`);
  return typeof progress?.progress === 'number' ? progress.progress : null;
}

// Build a single <li> element with drag, priority, progress, link and remove controls
function buildQueueItem (e) {
  const li  = document.createElement('li');
  li.dataset.id = e.id;
  li.draggable  = true;

  const safeTitle = e.title ? escapeHtml(e.title) : `Work ${e.id}`;
  const safeAttr  = e.title ? escapeHtml(e.title) : '';
  const icon      = priorityIcon(e.priority);
  const pct       = getReadProgress(e.id);
  const progressEl = pct !== null
    ? `<span class="${NS}-fbm-qp-progress" title="${pct}% read"><span class="${NS}-fbm-qp-progress-bar" style="width:${pct}%"></span></span>`
    : '';

  li.innerHTML = `
    <span class="${NS}-fbm-qp-drag" title="Drag to reorder">&#9776;</span>
    <a href="${e.href}" title="${safeAttr}">${safeTitle}</a>
    ${progressEl}
    <button class="${NS}-fbm-qp-priority" data-id="${e.id}" title="Priority: ${e.priority || 'medium'} — click to cycle">${icon}</button>
    <button class="${NS}-fbm-qp-remove" data-id="${e.id}" title="Remove">&times;</button>`;

  return li;
}

// Wire drag-and-drop reordering on the queue <ul>
function wireQueueDrag (ul) {
  let dragSrcId = null;

  ul.addEventListener('dragstart', e => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    dragSrcId = li.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
  });
  ul.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const li = e.target.closest('li[data-id]');
    ul.querySelectorAll('li').forEach(el => el.classList.remove('drag-over'));
    if (li && li.dataset.id !== dragSrcId) li.classList.add('drag-over');
  });
  ul.addEventListener('dragleave', () => {
    ul.querySelectorAll('li').forEach(el => el.classList.remove('drag-over'));
  });
  ul.addEventListener('drop', e => {
    e.preventDefault();
    ul.querySelectorAll('li').forEach(el => el.classList.remove('drag-over'));
    const targetLi = e.target.closest('li[data-id]');
    if (!targetLi || !dragSrcId || targetLi.dataset.id === dragSrcId) return;
    const queue   = getQueue();
    const fromIdx = queue.findIndex(x => x.id === dragSrcId);
    const toIdx   = queue.findIndex(x => x.id === targetLi.dataset.id);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = queue.splice(fromIdx, 1);
    queue.splice(toIdx, 0, moved);
    saveQueue(queue);
    refreshQueuePanel();
  });
}

function refreshQueuePanel () {
  const panel = document.getElementById(QUEUE_PANEL_ID);
  if (!panel) return;
  const queue  = getQueue();
  const ul     = panel.querySelector('ul');
  const header = panel.querySelector(`.${NS}-fbm-qp-header span`);
  if (!ul) return;
  if (header) header.textContent = `Reading Queue (${queue.length})`;
  ul.innerHTML = '';
  if (queue.length === 0) {
    ul.innerHTML = `<li class="${NS}-fbm-qp-empty">Queue is empty</li>`;
    return;
  }
  queue.forEach(e => ul.appendChild(buildQueueItem(e)));
  ul.querySelectorAll(`.${NS}-fbm-qp-priority`).forEach(btn => {
    btn.addEventListener('click', () => togglePriority(btn.dataset.id));
  });
  ul.querySelectorAll(`.${NS}-fbm-qp-remove`).forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromQueue(btn.dataset.id);
      document.querySelectorAll(`.${QUEUE_BTN_CLASS}[data-work-id="${btn.dataset.id}"]`)
        .forEach(b => b.classList.remove('queued'));
    });
  });
}

function injectQueuePanel () {
  if (document.getElementById(QUEUE_PANEL_ID)) return;
  const panel = document.createElement('div');
  panel.id    = QUEUE_PANEL_ID;

  panel.innerHTML = `
    <div class="${NS}-fbm-qp-header">
      <span>Reading Queue (0)</span>
      <button id="${NS}-fbm-qp-close" title="Close">&times;</button>
    </div>
    <ul></ul>`;

  panel.querySelector(`#${NS}-fbm-qp-close`).addEventListener('click', () => panel.remove());
  wireQueueDrag(panel.querySelector('ul'));
  document.body.appendChild(panel);
  refreshQueuePanel();  // populate after DOM insertion
}

function addQueueButtonsToBlurbs () {
  document.querySelectorAll('li.work.blurb, div.work.blurb').forEach(blurb => {
    if (blurb.querySelector(`.${QUEUE_BTN_CLASS}`)) return;
    const m = (blurb.id || '').match(/^work_(\d+)$/);
    if (!m) return;
    const workId  = m[1];
    const heading = blurb.querySelector('h4.heading, h5.heading');
    const titleA  = heading?.querySelector('a[href*="/works/"]');
    const title   = titleA?.textContent.trim() || `Work ${workId}`;
    const href    = titleA?.getAttribute('href') || `/works/${workId}`;
    const btn     = document.createElement('button');
    btn.className = QUEUE_BTN_CLASS;
    btn.dataset.workId = workId;
    btn.textContent = isInQueue(workId) ? '✓ Queue' : '+ Queue';
    if (isInQueue(workId)) btn.classList.add('queued');
    btn.title = 'Add to reading queue';
    btn.addEventListener('click', () => {
      if (isInQueue(workId)) {
        removeFromQueue(workId);
        btn.textContent = '+ Queue';
        btn.classList.remove('queued');
      } else {
        addToQueue(workId, title, href);
        btn.textContent = '✓ Queue';
        btn.classList.add('queued');
      }
    });
    if (heading) heading.appendChild(btn);
  });
}

let _observer = null;
function startObserver () {
  if (!cfg('queueEnabled')) return;
  const target = document.getElementById('main') || document.body;
  _observer = observe(target, { childList: true, subtree: true }, () => addQueueButtonsToBlurbs());
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BREAK REMINDER
═══════════════════════════════════════════════════════════════════════════ */

// Coarse elapsed-active-time counter (visible tab only) — deliberately simple,
// not a persisted lifetime stat (see fanficBingeMode.md for why session stats
// and goals were dropped: unreliable without a real time measurement, and
// this project avoids turning reading into a numbers game).
const BREAK_TICK_MS = 30000;
let _breakInterval  = null;
let _breakElapsedMs = 0;

function startBreakReminder (minutes) {
  stopBreakReminder();
  _breakElapsedMs = 0;
  const thresholdMs = minutes * 60000;
  _breakInterval = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    _breakElapsedMs += BREAK_TICK_MS;
    if (_breakElapsedMs >= thresholdMs) {
      _breakElapsedMs = 0;
      showToast('You’ve been reading for a while — maybe take a break? 🌿', { type: 'info', duration: 6000 });
    }
  }, BREAK_TICK_MS);
}

function stopBreakReminder () {
  if (_breakInterval) { clearInterval(_breakInterval); _breakInterval = null; }
  _breakElapsedMs = 0;
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'Fanfic Binge Mode',
  enabledByDefault : false,
}, async function init () {
  console.log(`${LOG} init`);

  // document.body peut ne pas encore exister quand ce module boote — sans ce
  // report, l'appendChild/l'observer plantaient (Cannot read properties of
  // null), constaté sur plusieurs modules similaires en test.
  let active = true;
  let unregisterShortcut = null;
  onReady(() => {
    if (!active) return;

    // Homepage panel + compact resume widget on other pages
    maybeInjectReminders();

    // Continue-reading modal (work pages, last chapter, 95% scroll)
    if (cfg('continueReadingModal') && isWorkPage() && isLastChapter()) {
      watchForEndOfFic(showContinueModal);
    }

    // Post-reading suggestions (work pages)
    if (cfg('showPostReadingSuggestions') && isWorkPage()) {
      injectPostReadingSuggestions();
    }

    // Reading queue (listing pages + work pages)
    if (cfg('queueEnabled')) {
      injectQueuePanel();
      if (isListingPage()) addQueueButtonsToBlurbs();
      startObserver();
    }

    // Break reminder (work pages only — that's where a "session" happens)
    if (cfg('breakReminderMinutes') > 0 && isWorkPage()) {
      startBreakReminder(cfg('breakReminderMinutes'));
    }

    // Keyboard shortcut to jump to the top resumable work (soft dep)
    unregisterShortcut = W.AO3H_Keyboard?.register('fbmResume', 'Alt+R', () => {
      const [entry] = getResumableEntries();
      if (entry) location.href = entry.chapterHref || entry.href || `/works/${entry.id}`;
      return true;
    }) || null;
  });

  return function cleanup () {
    active = false;
    // Modal
    removeModal();
    if (_scrollHandler) {
      window.removeEventListener('scroll', _scrollHandler);
      _scrollHandler = null;
    }
    // Homepage panel
    document.getElementById(HP_PANEL_ID)?.remove();
    document.getElementById(RESUME_WIDGET_ID)?.remove();
    // Suggestions
    document.getElementById(SUGG_ID)?.remove();
    // Queue
    document.getElementById(QUEUE_PANEL_ID)?.remove();
    document.querySelectorAll(`.${QUEUE_BTN_CLASS}`).forEach(el => el.remove());
    _observer?.disconnect();
    _observer = null;
    // Break reminder
    stopBreakReminder();
    clearAllToasts();
    // Keyboard shortcut
    unregisterShortcut?.();
    unregisterShortcut = null;
  };
});
