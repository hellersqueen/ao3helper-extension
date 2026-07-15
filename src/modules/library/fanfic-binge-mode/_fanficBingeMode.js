/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fanfic Binge Mode
    Module ID:    fanficBingeMode
    Display Name: Fanfic Binge Mode
    Tab:          Standalone (outside 6-tab UI)

    Features (each gated by a cfg key):
        continueReadingModal      -- modal at 95% scroll on last chapter
        showHomepagePanel         -- "Continue Reading" panel on AO3 homepage
        showPostReadingSuggestions -- suggestions block below work content
        queueEnabled              -- per-blurb Add to Queue button + queue panel
        autoAdvanceDelay          -- countdown auto-advance in modal (0 = off)

    Storage keys:
        ao3h:mod:fanficBingeMode:settings  -- user settings
        ao3h:fbm:queue                     -- [{ id, title, href, addedAt, priority }]
    Reads (soft dependency — graceful fallback if absent):
        ao3h:rt:history            -- readingTracker history list

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './fanficBingeMode.css?inline';

css(styles, 'ao3h-fanficBingeMode');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'fanficBingeMode';
const LOG  = `[AO3H][${MOD}]`;

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  continueReadingModal       : true,
  showHomepagePanel          : true,
  showPostReadingSuggestions : true,
  queueEnabled               : false,
  autoAdvanceDelay           : 0,    // seconds; 0 = disabled
};

// ── Storage ───────────────────────────────────────────────────────────────
const SK_QUEUE    = 'ao3h:fbm:queue';
const SK_RT_HIST  = 'ao3h:rt:history';  // readingTracker — soft dep

const cfg = makeCfg(MOD, DEFAULTS);

// ── Route helpers ─────────────────────────────────────────────────────────
function isHomePage ()  { return location.pathname === '/' || location.pathname === '/home'; }
function isWorkPage ()  { return /^\/works\/\d+/.test(location.pathname); }
function isListPage ()  {
  return /^\/works$/.test(location.pathname) ||
         /^\/tags\/[^/]+\/works/.test(location.pathname) ||
         /^\/users\/[^/]+\/(bookmarks|works|history)/.test(location.pathname) ||
         /^\/collections\/[^/]+\/works/.test(location.pathname);
}
function getWorkId () {
  const m = location.pathname.match(/\/works\/(\d+)/);
  return m ? m[1] : null;
}

// ── Last-chapter detection ────────────────────────────────────────────────
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

// ── "Continue Reading?" modal ─────────────────────────────────────────────
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
      <p>Finished reading <em>${workTitle.replace(/</g, '&lt;')}</em>. What next?</p>
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
        location.href = '/works';
      } else {
        update();
      }
    }, 1000);
  }
}

// ── Homepage "Continue Reading" panel ─────────────────────────────────────
const HP_PANEL_ID = `${NS}-fbm-homepage-panel`;

function injectHomepagePanel () {
  if (document.getElementById(HP_PANEL_ID)) return;

  const history = lsGet(SK_RT_HIST) || [];
  const recent  = history.slice(0, 5);
  if (recent.length === 0) return;

  const panel   = document.createElement('div');
  panel.id      = HP_PANEL_ID;

  const items   = recent.map(entry => {
    const title = entry.title ? entry.title.replace(/</g, '&lt;') : `Work ${entry.id}`;
    const href  = entry.chapterHref || entry.href || `/works/${entry.id}`;
    const ch    = entry.chapter ? `<span class="${NS}-fbm-meta">Ch ${entry.chapter}</span>` : '';
    return `<li><a href="${href}">${title}</a>${ch}</li>`;
  }).join('');

  panel.innerHTML = `<h3>Continue Reading</h3><ul>${items}</ul>`;

  const main = document.getElementById('main') || document.querySelector('#content .inner');
  if (main) main.insertAdjacentElement('afterbegin', panel);
}

// ── Post-reading suggestions ──────────────────────────────────────────────
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
    `<a class="${NS}-fbm-sugg-link" href="${l.href}">${l.label.replace(/</g, '&lt;')}</a>`
  ).join('');
  panel.innerHTML = `<h3>What to read next</h3><div class="${NS}-fbm-sugg-list">${items}</div>`;

  // Inject after the work content
  const endNotes = document.querySelector('#work_endnotes') ||
                   document.querySelector('.afterword') ||
                   document.querySelector('#chapters');
  if (endNotes) endNotes.insertAdjacentElement('afterend', panel);
}

// ── Reading queue ─────────────────────────────────────────────────────────
const QUEUE_PANEL_ID  = `${NS}-fbm-queue-panel`;
const QUEUE_BTN_CLASS = `${NS}-fbm-add-queue`;
function getQueue ()        { return lsGet(SK_QUEUE) || []; }
function saveQueue (queue)  { lsSet(SK_QUEUE, queue); }
function isInQueue (workId) { return getQueue().some(e => e.id === workId); }

function addToQueue (workId, title, href) {
  const queue = getQueue();
  if (queue.some(e => e.id === workId)) return;
  queue.push({ id: workId, title, href, addedAt: Date.now(), priority: 'normal' });
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
  if (entry) entry.priority = entry.priority === 'high' ? 'normal' : 'high';
  saveQueue(queue);
  refreshQueuePanel();
}

// Build a single <li> element with drag, priority, link and remove controls
function buildQueueItem (e) {
  const li  = document.createElement('li');
  li.dataset.id = e.id;
  li.draggable  = true;

  const safeTitle = e.title?.replace(/</g, '&lt;') ?? `Work ${e.id}`;
  const safeAttr  = e.title?.replace(/"/g, '&quot;') ?? '';
  const isHigh    = e.priority === 'high';

  li.innerHTML = `
    <span class="${NS}-fbm-qp-drag" title="Drag to reorder">&#9776;</span>
    <a href="${e.href}" title="${safeAttr}">${safeTitle}</a>
    <button class="${NS}-fbm-qp-priority${isHigh ? ' high' : ''}" data-id="${e.id}" title="${isHigh ? 'High priority — click to reset' : 'Set high priority'}">&#9733;</button>
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

// ── Observer (queue buttons on dynamic blurbs) ────────────────────────────
let _observer = null;
function startObserver () {
  if (!cfg('queueEnabled')) return;
  const target = document.getElementById('main') || document.body;
  _observer = new MutationObserver(() => addQueueButtonsToBlurbs());
  _observer.observe(target, { childList: true, subtree: true });
}

// ── Module registration ───────────────────────────────────────────────────
register(MOD, {
  title            : 'Fanfic Binge Mode',
  enabledByDefault : false,
}, async function init () {
  console.log(`${LOG} init`);

  // Homepage panel
  if (cfg('showHomepagePanel') && isHomePage()) {
    injectHomepagePanel();
  }

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
    if (isListPage()) addQueueButtonsToBlurbs();
    startObserver();
  }

  return function cleanup () {
    // Modal
    removeModal();
    if (_scrollHandler) {
      window.removeEventListener('scroll', _scrollHandler);
      _scrollHandler = null;
    }
    // Homepage panel
    document.getElementById(HP_PANEL_ID)?.remove();
    // Suggestions
    document.getElementById(SUGG_ID)?.remove();
    // Queue
    document.getElementById(QUEUE_PANEL_ID)?.remove();
    document.querySelectorAll(`.${QUEUE_BTN_CLASS}`).forEach(el => el.remove());
    _observer?.disconnect();
    _observer = null;
  };
});
