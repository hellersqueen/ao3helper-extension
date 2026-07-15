/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Notification Center
    Module ID: notificationCenter

    - Feature: What's New feed
      - Option: Tracks chapter updates for bookmarked, MFL, and history works
      - Option: Delta display ("+ 2 chapters")
      - Option: "Finished!" celebration (special badge + confetti)
      - Option: 90-day rolling history (older entries auto-purged)
      - Option: Mark item as seen / Mark all seen
      - Option: Sort by date or title
      - Option: Filter by source (bookmarks / MFL / history)
      - Option: Hide completed works from feed

    - Feature: Navbar badge
      - Option: Bell icon with unread count in header
      - Option: Active state (red) when there are unseen updates
      - Option: Click opens the What's New feed panel

    - Feature: Auto-refresh
      - Option: Background check every 15 minutes
      - Option: Checks up to 5 unvisited WIP works per cycle
      - Option: Immediate check on page load if last refresh > 15 min ago

    - Feature: Desktop notifications
      - Option: Browser Notification API (requires permission)
      - Option: Sound effect via AudioContext on notification fire
      - Option: Quiet hours (start/end time — no notifications in window)

    - Feature: Work page integration
      - Option: Detects new chapters when visiting a tracked work page directly

    Dépendances croisées en lecture seule (par clé localStorage directe, pas d'import —
    contrat volontairement découplé, indépendant de l'état de migration des modules) :
        ao3h:bookmarkVault:data  -- bookmarkVault (Library, migré Phase 23)
        ao3h:laterShelf:items    -- laterShelf (Library, migré Phase 23)
        ao3h:rt:history          -- readingTracker (Reading, migré Phase 20)

════════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { KEY_RT_HISTORY, KEY_BOOKMARK_VAULT_DATA, KEY_LATER_SHELF_ITEMS } from '../../../../lib/storage/keys.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { sendNotification, requestNotifyPermission } from '../../../../lib/utils/notifications.js';
import styles from './notificationCenter.css?inline';

css(styles, 'ao3h-notificationCenter');

const W   = getGlobalWindow();
const MOD  = 'notificationCenter';
const NS   = 'ao3h';
const PFX  = NS + '-nc';
const LOG  = `[AO3H][${MOD}]`;
const D    = document;

// ── Storage keys ──────────────────────────────────────────────────────────
const SK_FEED     = 'ao3h:notifCenter:feed';
const SK_CHAPTERS = 'ao3h:notifCenter:knownChapters';
const SK_REFRESH  = 'ao3h:notifCenter:lastRefresh';

// ── Defaults ───────────────────────────────────────────────────────────────────
const DEFAULTS = {
  desktopNotifications: false,
  soundEffects:         false,
  quietHoursEnabled:    false,
  quietHoursStart:      '22:00',
  quietHoursEnd:        '08:00',
};

const cfg = makeCfg(MOD, DEFAULTS, { globalConfig: true });

register(MOD, {
  title: 'Notification Center',
  enabledByDefault: false,
}, function init () {
  var active = true;
  var requestController = new AbortController();
  var confettiTimer = null;
  var audioContexts = new Set();

  // ── Storage helpers ───────────────────────────────────────────────────────────────────
  function loadFeed ()       { try { return JSON.parse(localStorage.getItem(SK_FEED)     || '[]'); } catch (_) { return []; } }
  function saveFeed (feed)   { try { localStorage.setItem(SK_FEED, JSON.stringify(feed)); } catch (_) {} }
  function loadChapters ()   { try { return JSON.parse(localStorage.getItem(SK_CHAPTERS) || '{}'); } catch (_) { return {}; } }
  function saveChapters (ch) { try { localStorage.setItem(SK_CHAPTERS, JSON.stringify(ch)); } catch (_) {} }

  function purgeFeed (feed) {
    var cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    return feed.filter(function (item) { return item.ts >= cutoff; });
  }

  function unseenCount (feed) {
    return feed.filter(function (i) { return !i.seen; }).length;
  }

  // ── Quiet-hours ───────────────────────────────────────────────────────────────────────
  function isQuietTime () {
    if (cfg('quietHoursEnabled') === false) return false;
    var now    = new Date();
    var cur    = now.getHours() * 60 + now.getMinutes();
    var qsStr  = cfg('quietHoursStart') || '22:00';
    var qeStr  = cfg('quietHoursEnd')   || '08:00';
    var sParts = qsStr.split(':').map(Number);
    var eParts = qeStr.split(':').map(Number);
    var start  = sParts[0] * 60 + sParts[1];
    var end    = eParts[0] * 60 + eParts[1];
    return start > end ? (cur >= start || cur < end) : (cur >= start && cur < end);
  }

  // ── Collect tracked work IDs from other modules' localStorage ────────────
  function getTrackedWorks () {
    var wids = new Map();
    try {
      var bvData = JSON.parse(localStorage.getItem(KEY_BOOKMARK_VAULT_DATA) || '{}');
      Object.keys(bvData).forEach(function (w) { if (wids.has(w) === false) wids.set(w, 'bookmark'); });
    } catch (_) {}
    try {
      var mfl = JSON.parse(localStorage.getItem(KEY_LATER_SHELF_ITEMS) || '[]');
      mfl.forEach(function (item) {
        var id = String(item.wid || item.id || item || '');
        if (id && wids.has(id) === false) wids.set(id, 'mfl');
      });
    } catch (_) {}
    try {
      var hist = JSON.parse(localStorage.getItem(KEY_RT_HISTORY) || '[]');
      hist.forEach(function (item) {
        var id = String(item.wid || item.workId || item.id || '');
        if (id && wids.has(id) === false) wids.set(id, 'history');
      });
    } catch (_) {}
    return wids;
  }

  // ── Parse fetched work page HTML ───────────────────────────────────────────────────
  function parseWorkHTML (html) {
    var parser  = new DOMParser();
    var doc     = parser.parseFromString(html, 'text/html');
    var titleEl = doc.querySelector('h2.title.heading');
    var title   = titleEl ? titleEl.textContent.trim() : '';
    var chapEl  = doc.querySelector('dd.chapters');
    var currentChaps = 0, totalChaps = null, isComplete = false;
    if (chapEl) {
      var parts = chapEl.textContent.trim().split('/');
      currentChaps = parseInt(parts[0], 10) || 0;
      if (parts[1] && parts[1] !== '?') totalChaps = parseInt(parts[1], 10);
      if (totalChaps !== null && currentChaps === totalChaps) isComplete = true;
    }
    var statusEl = doc.querySelector('dd.status');
    if (statusEl && statusEl.textContent.toLowerCase().includes('complete')) isComplete = true;
    return { title: title, currentChaps: currentChaps, totalChaps: totalChaps, isComplete: isComplete };
  }

  // ── Update knownChapters when visiting a work page ──────────────────────────
  function onWorkPage () {
    var match = location.pathname.match(/^\/works\/(\d+)/);
    if (match === null) return;
    var wid     = match[1];
    var chapEl  = D.querySelector('dd.chapters');
    var titleEl = D.querySelector('h2.title.heading');
    if (chapEl === null) return;
    var parts        = chapEl.textContent.trim().split('/');
    var currentChaps = parseInt(parts[0], 10) || 0;
    var totalChaps   = (parts[1] && parts[1] !== '?') ? parseInt(parts[1], 10) : null;
    var isComplete   = totalChaps !== null && currentChaps === totalChaps;
    var title = titleEl ? titleEl.textContent.trim() : 'Work #' + wid;
    var href  = '/works/' + wid;
    var known = loadChapters();
    var prev  = known[wid];
    known[wid] = { count: currentChaps, total: totalChaps, isComplete: isComplete,
                   title: title, href: href, ts: Date.now() };
    saveChapters(known);
    if (prev && prev.count < currentChaps) {
      var delta        = currentChaps - prev.count;
      var completedNow = (prev.isComplete === false) && isComplete;
      var feed = purgeFeed(loadFeed());
      feed = feed.filter(function (i) { return i.wid !== wid; });
      feed.unshift({ wid: wid, title: title, href: href, delta: delta,
                     source: 'history', completedNow: completedNow, ts: Date.now(), seen: false });
      saveFeed(feed);
      updateBadge();
      if (completedNow) {
        triggerConfetti();
        fireDesktopNotif('🎉 Finished!', title + ' is now complete!');
      } else {
        fireDesktopNotif('🔄 Update', title + ' — +' + delta + ' chapter' + (delta !== 1 ? 's' : ''));
      }
    }
  }

  // ── Background refresh: fetch up to 5 un-visited WIP works ───────────────────
  async function runBackgroundCheck () {
    if (active === false) return;
    var tracked  = getTrackedWorks();
    var known    = loadChapters();
    var feed     = purgeFeed(loadFeed());
    var toCheck  = [];
    var ONE_HOUR = 60 * 60 * 1000;
    tracked.forEach(function (source, wid) {
      var k = known[wid];
      if (k && k.isComplete) return;
      if (k === undefined || (Date.now() - (k.ts || 0) > ONE_HOUR)) toCheck.push({ wid: wid, source: source });
    });
    var batch = toCheck.slice(0, 5);
    for (var n = 0; n < batch.length; n++) {
      var wid    = batch[n].wid;
      var source = batch[n].source;
      try {
        var resp = await fetch('/works/' + wid, {
          credentials: 'same-origin',
          signal: requestController.signal,
        });
        if (active === false) return;
        if (resp.ok === false) continue;
        var html = await resp.text();
        if (active === false) return;
        var info = parseWorkHTML(html);
        var prev = known[wid];
        known[wid] = { count: info.currentChaps, total: info.totalChaps, isComplete: info.isComplete,
                       title: info.title || ('Work #' + wid), href: '/works/' + wid, ts: Date.now() };
        if (prev && prev.count < info.currentChaps) {
          var delta        = info.currentChaps - prev.count;
          var completedNow = (prev.isComplete === false) && info.isComplete;
          feed = feed.filter(function (i) { return i.wid !== wid; });
          feed.unshift({ wid: wid, title: info.title || ('Work #' + wid), href: '/works/' + wid,
                         delta: delta, source: source, completedNow: completedNow,
                         ts: Date.now(), seen: false });
          if (completedNow) fireDesktopNotif('🎉 Finished!', info.title + ' is now complete!');
          else fireDesktopNotif('🔄 Update', info.title + ' — +' + delta + ' chapter' + (delta !== 1 ? 's' : ''));
        }
      } catch (_) {}
    }
    if (active === false) return;
    saveChapters(known);
    saveFeed(feed);
    localStorage.setItem(SK_REFRESH, String(Date.now()));
    updateBadge();
    if (feedPanel) renderFeedItems();
  }

  // ── Badge ────────────────────────────────────────────────────────────────────────────────────
  var badgeEl = null;

  function injectBadge () {
    if (D.getElementById(`${PFX}-badge`)) return;
    var feed  = loadFeed();
    var count = unseenCount(feed);
    var badge = D.createElement('a');
    badge.id          = `${PFX}-badge`;
    badge.href        = '#ao3h-whats-new';
    badge.className   = count > 0 ? `${PFX}-badge ${PFX}-badge-active` : `${PFX}-badge`;
    badge.textContent = '🔔 ' + count;
    badge.title       = count + ' unread update' + (count !== 1 ? 's' : '');
    badge.addEventListener('click', function (e) { e.preventDefault(); toggleFeedPanel(); });
    var greeting = D.querySelector('#greeting .user');
    if (greeting) greeting.appendChild(badge);
    badgeEl = badge;
  }

  function updateBadge () {
    if (badgeEl === null) return;
    var count = unseenCount(loadFeed());
    badgeEl.textContent = '🔔 ' + count;
    badgeEl.title = count + ' unread update' + (count !== 1 ? 's' : '');
    badgeEl.className = count > 0 ? `${PFX}-badge ${PFX}-badge-active` : `${PFX}-badge`;
  }

  // ── Feed panel ───────────────────────────────────────────────────────────────────────────
  var feedPanel   = null;
  var filterState = { sort: 'date', source: 'all', hideComplete: false };

  function buildFeedItem (item) {
    var li = D.createElement('li');
    li.className  = `${PFX}-item` +
      (item.seen         ? ` ${PFX}-seen`     : '') +
      (item.completedNow ? ` ${PFX}-finished` : '');
    li.dataset.wid = item.wid;
    if (item.completedNow) {
      var fin = D.createElement('span');
      fin.className   = `${PFX}-fin-badge`;
      fin.textContent = '🎉 Finished!';
      li.appendChild(fin);
    }
    var titleLink = D.createElement('a');
    titleLink.href        = item.href;
    titleLink.textContent = item.title || ('Work #' + item.wid);
    titleLink.className   = `${PFX}-title`;
    li.appendChild(titleLink);
    var srcMap = { bookmark: '⭐', mfl: '📌', history: '📚', visit: '📚' };
    var meta = D.createElement('span');
    meta.className   = `${PFX}-meta`;
    meta.textContent = (srcMap[item.source] || '') + ' +' + item.delta + ' ch. • ' +
                        new Date(item.ts).toLocaleDateString();
    li.appendChild(meta);
    var seenBtn = D.createElement('button');
    seenBtn.className   = `${PFX}-seen-btn`;
    seenBtn.textContent = item.seen ? 'Seen' : 'Mark seen';
    seenBtn.addEventListener('click', function () {
      var feed  = loadFeed();
      var entry = feed.find(function (i) { return i.wid === item.wid && i.ts === item.ts; });
      if (entry) { entry.seen = true; saveFeed(feed); }
      li.classList.add(`${PFX}-seen`);
      seenBtn.textContent = 'Seen';
      updateBadge();
    });
    li.appendChild(seenBtn);
    return li;
  }

  function getFilteredFeed () {
    var feed = purgeFeed(loadFeed());
    if (filterState.source !== 'all') feed = feed.filter(function (i) { return i.source === filterState.source; });
    if (filterState.hideComplete)     feed = feed.filter(function (i) { return !i.completedNow; });
    if (filterState.sort === 'title') feed.sort(function (a, b) { return (a.title || '').localeCompare(b.title || ''); });
    return feed;
  }

  function renderFeedItems () {
    if (feedPanel === null) return;
    var ul = D.getElementById(`${PFX}-list`);
    if (ul === null) return;
    ul.innerHTML = '';
    var feed = getFilteredFeed();
    if (feed.length === 0) {
      var empty = D.createElement('li');
      empty.className   = `${PFX}-empty`;
      empty.textContent = 'No updates in the last 90 days.';
      ul.appendChild(empty);
      return;
    }
    var finished = feed.filter(function (i) { return  i.completedNow; });
    var updates  = feed.filter(function (i) { return !i.completedNow; });
    function renderGroup (items, label) {
      if (items.length === 0) return;
      var hdr = D.createElement('li');
      hdr.className   = `${PFX}-group-hdr`;
      hdr.textContent = label;
      ul.appendChild(hdr);
      items.forEach(function (i) { ul.appendChild(buildFeedItem(i)); });
    }
    renderGroup(finished, '🎉 Finished');
    renderGroup(updates,  '🔄 Updates');
  }

  function injectFeedPanel () {
    var existing = D.getElementById(`${PFX}-panel`);
    if (existing) { feedPanel = existing; return; }
    var panel = D.createElement('div');
    panel.id        = `${PFX}-panel`;
    panel.className = `${PFX}-panel`;
    panel.hidden    = true;
    // Header
    var hdr = D.createElement('div');
    hdr.className = `${PFX}-hdr`;
    var hdrTitle = D.createElement('strong');
    hdrTitle.textContent = "🔔 What's New";
    var closeBtn = D.createElement('button');
    closeBtn.id          = `${PFX}-close`;
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', function () { panel.hidden = true; });
    hdr.appendChild(hdrTitle);
    hdr.appendChild(closeBtn);
    // Toolbar
    var tb = D.createElement('div');
    tb.className = `${PFX}-toolbar`;
    var sortSel = D.createElement('select');
    sortSel.id    = `${PFX}-sort`;
    sortSel.title = 'Sort by';
    [['date','Date'],['title','Title']].forEach(function (o) {
      var opt = D.createElement('option');
      opt.value = o[0]; opt.textContent = o[1]; sortSel.appendChild(opt);
    });
    sortSel.addEventListener('change', function (e) { filterState.sort = e.target.value; renderFeedItems(); });
    var srcSel = D.createElement('select');
    srcSel.id    = `${PFX}-source`;
    srcSel.title = 'Filter by source';
    [['all','All sources'],['bookmark','⭐ Bookmarks'],['mfl','📌 MFL'],['history','📚 History']].forEach(function (o) {
      var opt = D.createElement('option');
      opt.value = o[0]; opt.textContent = o[1]; srcSel.appendChild(opt);
    });
    srcSel.addEventListener('change', function (e) { filterState.source = e.target.value; renderFeedItems(); });
    var hideCompleteLbl = D.createElement('label');
    var hideCompleteChk = D.createElement('input');
    hideCompleteChk.type = 'checkbox';
    hideCompleteChk.id   = `${PFX}-hide-complete`;
    hideCompleteChk.addEventListener('change', function (e) { filterState.hideComplete = e.target.checked; renderFeedItems(); });
    hideCompleteLbl.appendChild(hideCompleteChk);
    hideCompleteLbl.appendChild(D.createTextNode(' Hide completed'));
    var markAllBtn = D.createElement('button');
    markAllBtn.id          = `${PFX}-mark-all`;
    markAllBtn.textContent = 'Mark all seen';
    markAllBtn.addEventListener('click', function () {
      var feed = loadFeed();
      feed.forEach(function (i) { i.seen = true; });
      saveFeed(feed);
      renderFeedItems();
      updateBadge();
    });
    tb.appendChild(sortSel);
    tb.appendChild(srcSel);
    tb.appendChild(hideCompleteLbl);
    tb.appendChild(markAllBtn);
    // List
    var ul = D.createElement('ul');
    ul.id = `${PFX}-list`;
    panel.appendChild(hdr);
    panel.appendChild(tb);
    panel.appendChild(ul);
    D.body.appendChild(panel);
    feedPanel = panel;
  }

  function toggleFeedPanel () {
    if (feedPanel === null) injectFeedPanel();
    feedPanel.hidden = (feedPanel.hidden === false);
    if (feedPanel.hidden === false) renderFeedItems();
  }

  // ── Confetti overlay ───────────────────────────────────────────────────────────────────
  function triggerConfetti () {
    D.getElementById(`${PFX}-confetti`)?.remove();
    if (confettiTimer) clearTimeout(confettiTimer);
    var el = D.createElement('div');
    el.id = `${PFX}-confetti`;
    D.body.appendChild(el);
    confettiTimer = setTimeout(function () {
      confettiTimer = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }

  // ── Desktop notification + optional sound ─────────────────────────────────────────
  function fireDesktopNotif (title, body) {
    if (cfg('desktopNotifications') === false) return;
    if (isQuietTime()) return;
    if (typeof Notification === 'undefined') return;
    function fire () {
      if (active === false) return;
      sendNotification(title, { body: body, tag: 'ao3h-notif' });
      if (cfg('soundEffects')) {
        try {
          var ctx  = new (W.AudioContext || W.webkitAudioContext)();
          var osc  = ctx.createOscillator();
          var gain = ctx.createGain();
          audioContexts.add(ctx);
          osc.addEventListener('ended', function () {
            audioContexts.delete(ctx);
            ctx.close().catch(function () {});
          }, { once: true });
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        } catch (_) {}
      }
    }
    requestNotifyPermission().then(function (ok) { if (ok && active) fire(); });
  }

  // ── Schedule auto-refresh every 15 min ──────────────────────────────────────────────────
  var refreshTimer = null;
  var initialRefreshTimer = null;
  function scheduleRefresh () {
    var INTERVAL = 15 * 60 * 1000;
    refreshTimer = setInterval(runBackgroundCheck, INTERVAL);
    var lastRefresh = parseInt(localStorage.getItem(SK_REFRESH) || '0', 10);
    if (Date.now() - lastRefresh > INTERVAL) {
      initialRefreshTimer = setTimeout(function () {
        initialRefreshTimer = null;
        runBackgroundCheck();
      }, 5000);
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────────────────────────

  injectBadge();
  onWorkPage();
  scheduleRefresh();

  // ── Cleanup ───────────────────────────────────────────────────────────────────────────────────
  return function cleanup () {
    active = false;
    requestController.abort();
    if (badgeEl   && badgeEl.parentNode)   badgeEl.parentNode.removeChild(badgeEl);
    if (feedPanel && feedPanel.parentNode) feedPanel.parentNode.removeChild(feedPanel);
    if (refreshTimer) clearInterval(refreshTimer);
    if (initialRefreshTimer) clearTimeout(initialRefreshTimer);
    if (confettiTimer) clearTimeout(confettiTimer);
    D.getElementById(`${PFX}-confetti`)?.remove();
    audioContexts.forEach(function (ctx) { ctx.close().catch(function () {}); });
    audioContexts.clear();
    badgeEl = null; feedPanel = null; refreshTimer = null;
    initialRefreshTimer = null; confettiTimer = null;
  };

});
