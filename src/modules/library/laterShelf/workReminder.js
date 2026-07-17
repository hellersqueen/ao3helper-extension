/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Work Reminders

Adds optional, per-work reminders to the Marked for Later experience.

Features

- Stores dated reminders and exposes controls on Marked for Later blurbs.
- Shows reminder or unavailable-work badges on matching blurbs.
- Sends browser notifications when reminders become due.
- Checks reminders on page load and at a lightweight periodic interval.

Notes

- The `remindersEnabled` setting is disabled by default.
- Reminder checks are throttled through `LAST_CHECK_KEY`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { cfg } from './laterShelfStore.js';
import { appendHeadingBadge } from '../../../../lib/ui/status-badge.js';
import { sendNotification, requestNotifyPermission } from '../../../../lib/utils/notifications.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'workReminder';
const D   = document;
const SK_REMINDERS = 'ao3h:laterShelf:reminders'; // { [wid]: { title, remindAt, status } }
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const LAST_CHECK_KEY = 'ao3h:laterShelf:reminders:lastCheck';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Work Reminders',
  parent: 'laterShelf',
  enabledByDefault: false,
}, function init () {

  if (!cfg('remindersEnabled')) return function cleanup () {};

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — REMINDER STORAGE
  ═════════════════════════════════════════════════════════════════════════ */

  function loadReminders () {
    try { return JSON.parse(localStorage.getItem(SK_REMINDERS) || '{}'); } catch (_) { return {}; }
  }

  function saveReminders (obj) {
    try { localStorage.setItem(SK_REMINDERS, JSON.stringify(obj)); } catch (_) {}
  }

  function setReminder (wid, title, remindAt) {
    var reminders = loadReminders();
    reminders[String(wid)] = { title: title, remindAt: remindAt, status: 'pending' };
    saveReminders(reminders);
  }

  function cancelReminder (wid) {
    var reminders = loadReminders();
    delete reminders[String(wid)];
    saveReminders(reminders);
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
        notify(r.title || ('Work ' + wid), 'Your reminder for this work is due!');
        r.status = 'fired';
        changed = true;
      }
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
     FEATURE — REMINDER CONTROLS
  ═════════════════════════════════════════════════════════════════════════ */

  var isMFL = /\/users\/[^/]+\/readings/.test(location.pathname) &&
              /show=to-read/.test(location.search);

  function injectReminderButtons () {
    if (!isMFL) return;
    D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(function (blurb) {
      if (blurb.querySelector('.ao3h-ls-remind-btn')) return;
      var wid = extractWorkIdFromBlurb(blurb);
      if (!wid) return;
      var titleLink = blurb.querySelector('h4.heading a[href*="/works/"]');
      var title = titleLink ? titleLink.textContent.trim() : '';
      var btn = D.createElement('button');
      btn.type = 'button';
      btn.className = 'ao3h-ls-remind-btn';
      var reminders = loadReminders();
      btn.textContent = reminders[wid] ? '⏰ Edit reminder' : '⏰ Remind me';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var dateStr = prompt('Remind me about "' + title + '" on (YYYY-MM-DD or leave blank to cancel):');
        if (dateStr === null) return; // dismissed
        if (!dateStr.trim()) {
          cancelReminder(wid);
          btn.textContent = '⏰ Remind me';
          var badge = blurb.querySelector('.ao3h-ls-reminder-badge');
          if (badge) badge.remove();
          return;
        }
        var ts = Date.parse(dateStr.trim());
        if (isNaN(ts)) { alert('Invalid date. Please use YYYY-MM-DD format.'); return; }
        requestPermission(function (granted) {
          setReminder(wid, title, ts);
          btn.textContent = '⏰ Edit reminder';
          var badge = blurb.querySelector('.ao3h-ls-reminder-badge');
          if (badge) badge.remove();
          injectReminderBadges();
          if (!granted) {
            alert('Reminder saved! Note: browser notifications were denied — you\'ll only see the ⏰ badge.');
          }
        });
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

  /* ═════════════════════════════════════════════════════════════════════════
     CLEANUP
  ═════════════════════════════════════════════════════════════════════════ */

  return function cleanup () {
    clearInterval(checkTimer);
    D.querySelectorAll('.ao3h-ls-reminder-badge, .ao3h-ls-remind-btn').forEach(function (el) { el.remove(); });
  };

});
