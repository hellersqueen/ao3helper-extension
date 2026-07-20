/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Work Reminders

Adds optional, per-work reminders to the Marked for Later experience.

Features

- Stores dated reminders and exposes controls on Marked for Later blurbs.
- Shows reminder or unavailable-work badges on matching blurbs.
- Sends browser notifications when reminders become due, at the user's usual
  reading hour when activityPanel's habit data is available.
- Optional custom message and daily/weekly recurrence per reminder.
- A "Snooze 3 days" control on any blurb with a pending reminder.
- One-time, opt-in nudges for shelf works that were marked "dropped"
  (ficAppreciation) or that have sat unread for a long time.
- Keeps a small history log of fired/cancelled/snoozed reminders.
- Checks reminders on page load and at a lightweight periodic interval.

Notes

- The `remindersEnabled` setting is disabled by default.
- Reminder checks are throttled through `LAST_CHECK_KEY`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { cfg, loadItems } from './laterShelfStore.js';
import { appendHeadingBadge } from '../../../../lib/ui/badges.js';
import { sendNotification, requestNotifyPermission } from '../../../../lib/utils/notifications.js';
import { extractWorkIdFromBlurb, getBlurbMeta } from '../../../../lib/ao3/parsers.js';
import { showToast } from '../../../../lib/ui/toast.js';
import { KEY_ACTIVITY_PANEL_SESSIONS, getWorkIdsByStatus } from '../../../../lib/storage/keys.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'workReminder';
const D   = document;
const W   = getGlobalWindow();
const SK_REMINDERS = 'ao3h:laterShelf:reminders'; // { [wid]: { title, remindAt, status, message?, frequency?, special? } }
const SK_HISTORY   = 'ao3h:laterShelf:reminders:history'; // [{ wid, title, action, remindAt, special?, at }]
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const LAST_CHECK_KEY = 'ao3h:laterShelf:reminders:lastCheck';
const SNOOZE_DAYS = 3;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Work Reminders',
  parent: 'laterShelf',
  enabledByDefault: false,
}, function init () {
  const { isStale, snoozeDate, nextRecurrence, peakHourFromSessions } = W.AO3H_LaterShelf;

  if (!cfg('remindersEnabled')) return function cleanup () {};

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — REMINDER STORAGE
  ═════════════════════════════════════════════════════════════════════════ */

  function loadReminders () {
    return lsGet(SK_REMINDERS, {});
  }

  function saveReminders (obj) {
    lsSet(SK_REMINDERS, obj);
  }

  function loadHistory () {
    return lsGet(SK_HISTORY, []);
  }

  function recordHistory (entry) {
    var history = loadHistory();
    history.unshift(Object.assign({}, entry, { at: Date.now() }));
    lsSet(SK_HISTORY, history.slice(0, 200));
  }

  function setReminder (wid, title, remindAt, extra) {
    var reminders = loadReminders();
    reminders[String(wid)] = Object.assign({ title: title, remindAt: remindAt, status: 'pending' }, extra || {});
    saveReminders(reminders);
  }

  function cancelReminder (wid) {
    var reminders = loadReminders();
    var r = reminders[String(wid)];
    delete reminders[String(wid)];
    saveReminders(reminders);
    if (r) recordHistory({ wid: String(wid), title: r.title, action: 'cancelled', remindAt: r.remindAt });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — NOTIFICATION DISPATCH
  ═════════════════════════════════════════════════════════════════════════ */

  function notify (title, body) {
    sendNotification('AO3 Helper — Reminder', {
      body: title + '\n' + body,
      icon: 'https://archiveofourown.org/favicon.ico',
    });
  }

  function requestPermission (cb) {
    requestNotifyPermission().then(cb);
  }

  /** Peak reading hour from activityPanel's session history (soft cross-module read, may be empty). */
  function peakHour () {
    return peakHourFromSessions(lsGet(KEY_ACTIVITY_PANEL_SESSIONS, []));
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — DUE-REMINDER CHECKS
  ═════════════════════════════════════════════════════════════════════════ */

  function checkReminders () {
    var now = Date.now();
    localStorage.setItem(LAST_CHECK_KEY, String(now));
    var reminders = loadReminders();
    var changed = false;
    Object.keys(reminders).forEach(function (wid) {
      var r = reminders[wid];
      if (r.status !== 'pending') return;
      if (r.remindAt && now >= r.remindAt) {
        notify(r.title || ('Work ' + wid), r.message || 'Your reminder for this work is due!');
        recordHistory({ wid: wid, title: r.title, action: 'fired', remindAt: r.remindAt });
        var next = nextRecurrence(r.remindAt, r.frequency);
        if (next) { r.remindAt = next; } else { r.status = 'fired'; }
        changed = true;
      }
    });
    if (changed) saveReminders(reminders);
    checkAbandonedAndStale();
  }

  /** One-time, opt-in nudges for dropped or long-lingering shelf works (no existing reminder). */
  function checkAbandonedAndStale () {
    var reminders = loadReminders();
    var dropped = getWorkIdsByStatus('dropped');
    var staleDays = cfg('staleDays', 45);
    var changed = false;
    loadItems().forEach(function (item) {
      var wid = String(item.wid);
      if (reminders[wid]) return;
      var special = null;
      var body = '';
      if (dropped.has(wid)) {
        special = 'abandoned';
        body = 'This fic is marked "dropped" but still on your Later Shelf — give it another try, or clear it out?';
      } else if (isStale(item, staleDays)) {
        special = 'stale';
        body = 'This fic has been sitting on your Later Shelf for a while — still interested?';
      }
      if (!special) return;
      notify(item.title, body);
      reminders[wid] = { title: item.title, remindAt: Date.now(), status: 'fired', special: special };
      recordHistory({ wid: wid, title: item.title, action: 'fired', special: special, remindAt: Date.now() });
      changed = true;
    });
    if (changed) saveReminders(reminders);
  }

  function maybeCheck () {
    var last = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
    if (Date.now() - last >= CHECK_INTERVAL_MS) checkReminders();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — REMINDER BADGES
  ═════════════════════════════════════════════════════════════════════════ */

  function injectReminderBadges () {
    var reminders = loadReminders();
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      var wid = extractWorkIdFromBlurb(blurb);
      if (!wid) return;
      var r = reminders[wid];
      if (!r || r.status === 'fired') return;
      var unavailable = r.status === 'unavailable';
      appendHeadingBadge(blurb, {
        className: 'ao3h-ls-reminder-badge',
        text: unavailable ? '⚠️' : '⏰',
        title: unavailable
          ? 'Reminder set but this work may be unavailable'
          : 'Reminder: ' + (r.remindAt ? new Date(r.remindAt).toLocaleString() : 'pending'),
      });
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — REMINDER CONTROLS (set/edit, snooze)
  ═════════════════════════════════════════════════════════════════════════ */

  var isMFL = /\/users\/[^/]+\/readings/.test(location.pathname) &&
              /show=to-read/.test(location.search);

  function injectReminderButtons () {
    if (!isMFL) return;
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      if (blurb.querySelector('.ao3h-ls-remind-btn')) return;
      var wid = extractWorkIdFromBlurb(blurb);
      if (!wid) return;
      var title = getBlurbMeta(blurb)?.title || '';
      var btn = D.createElement('button');
      btn.type = 'button';
      btn.className = 'ao3h-ls-remind-btn';
      var reminders = loadReminders();
      btn.textContent = reminders[wid] ? '⏰ Edit reminder' : '⏰ Remind me';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
        var dateStr = prompt('Remind me about "' + title + '" on (YYYY-MM-DD or leave blank to cancel):', defaultDate);
        if (dateStr === null) return; // dismissed
        if (!dateStr.trim()) {
          cancelReminder(wid);
          btn.textContent = '⏰ Remind me';
          var badge = blurb.querySelector('.ao3h-ls-reminder-badge');
          if (badge) badge.remove();
          injectSnoozeButtons();
          return;
        }
        var ts = Date.parse(dateStr.trim());
        if (isNaN(ts)) { alert('Invalid date. Please use YYYY-MM-DD format.'); return; }
        var ph = peakHour();
        if (ph != null) {
          var d = new Date(ts);
          d.setHours(ph, 0, 0, 0);
          ts = d.getTime();
        }
        var message = prompt('Custom reminder message (optional):', '') || '';
        var freqRaw = (prompt('Repeat this reminder? Type "daily", "weekly", or leave blank for one-time:', '') || '').trim().toLowerCase();
        var frequency = (freqRaw === 'daily' || freqRaw === 'weekly') ? freqRaw : undefined;
        requestPermission(function (granted) {
          setReminder(wid, title, ts, { message: message || undefined, frequency: frequency });
          btn.textContent = '⏰ Edit reminder';
          var badge = blurb.querySelector('.ao3h-ls-reminder-badge');
          if (badge) badge.remove();
          injectReminderBadges();
          injectSnoozeButtons();
          if (!granted) {
            alert('Reminder saved! Note: browser notifications were denied — you\'ll only see the ⏰ badge.');
          }
        });
      });
      var heading = blurb.querySelector('h4.heading');
      if (heading) heading.appendChild(btn);
    });
  }

  function injectSnoozeButtons () {
    if (!isMFL) return;
    var reminders = loadReminders();
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      var wid = extractWorkIdFromBlurb(blurb);
      var r = wid && reminders[wid];
      var existing = blurb.querySelector('.ao3h-ls-snooze-btn');
      if (!r || r.status !== 'pending') { if (existing) existing.remove(); return; }
      if (existing) return;
      var btn = D.createElement('button');
      btn.type = 'button';
      btn.className = 'ao3h-ls-snooze-btn';
      btn.textContent = '💤 Snooze ' + SNOOZE_DAYS + 'd';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var current = loadReminders();
        var rr = current[wid];
        if (!rr) return;
        rr.remindAt = snoozeDate(rr.remindAt, SNOOZE_DAYS);
        saveReminders(current);
        recordHistory({ wid: wid, title: rr.title, action: 'snoozed', remindAt: rr.remindAt });
        injectReminderBadges();
        showToast('Reminder snoozed ' + SNOOZE_DAYS + ' days', { type: 'info' });
      });
      var heading = blurb.querySelector('h4.heading');
      if (heading) heading.appendChild(btn);
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PERIODIC CHECKS
  ═════════════════════════════════════════════════════════════════════════ */

  var checkTimer = setInterval(maybeCheck, 30 * 60 * 1000); // re-check every 30 min
  maybeCheck(); // check on load too

  injectReminderBadges();
  injectReminderButtons();
  injectSnoozeButtons();

  /* ═════════════════════════════════════════════════════════════════════════
     CLEANUP
  ═════════════════════════════════════════════════════════════════════════ */

  return function cleanup () {
    clearInterval(checkTimer);
    D.querySelectorAll('.ao3h-ls-reminder-badge, .ao3h-ls-remind-btn, .ao3h-ls-snooze-btn').forEach(function (el) { el.remove(); });
  };

});
