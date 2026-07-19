/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Session History

Records work-page reading sessions with timing, activity, fandom, and word-count
metadata for use by the Activity Panel analytics.

Notes

- Persisted history retains the 500 most recent sessions.
- Scroll and click activity update the session at most twice per second.
- Cleanup records the session once if the page has not already unloaded.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'sessionHistory';

const SESSIONS_KEY   = 'ao3h:activityPanel:sessions';
const MAX_SESSIONS   = 500;


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SESSION METADATA AND PERSISTENCE
═══════════════════════════════════════════════════════════════════════════ */

function loadSessions () {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch (_) { return []; }
}

function saveSessions (sessions) {
  // Keep only the most recent MAX_SESSIONS entries
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-MAX_SESSIONS)));
}

function getWorkMeta () {
  const workId = extractWorkIdFromHref(location.pathname);
  if (!workId) return null;
  const title = document.querySelector('h2.title')?.textContent.trim() ||
                document.title.split('|')[0].trim();
  const fandomTags = [...document.querySelectorAll('.fandom.tags a')]
    .map(a => a.textContent.trim());
  const freeformTags = [...document.querySelectorAll('dd.freeform.tags a')]
    .map(a => a.textContent.trim());
  const words = parseInt(
    (document.querySelector('.stats dd.words')?.textContent || '0').replace(/,/g, ''), 10
  ) || 0;
  const rating   = document.querySelector('dd.rating.tags a')?.textContent.trim() || null;
  const category = document.querySelector('dd.category.tags a')?.textContent.trim() || null;
  return { workId, title, fandoms: fandomTags, tags: freeformTags, words, rating, category };
}

function startSession (meta) {
  return {
    workId:      meta.workId,
    title:       meta.title,
    fandoms:     meta.fandoms,
    tags:        meta.tags,
    rating:      meta.rating,
    category:    meta.category,
    words:       meta.words,
    startedAt:   Date.now(),
    lastActiveAt: Date.now(),
    pageViews:   1,
    hourOfDay:   new Date().getHours(),
  };
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Session History',
  parent:           'activityPanel',
  enabledByDefault: false,
}, async function init () {
  const meta = getWorkMeta();
  if (!meta) return () => {};

  let session = startSession(meta);

  // Track activity: scroll / click updates lastActiveAt + pageViews (debounced)
  let lastView = 0;
  function trackActivity () {
    const now = Date.now();
    session.lastActiveAt = now;
    if (now - lastView > 500) { session.pageViews++; lastView = now; }
  }

  document.addEventListener('scroll', trackActivity, { passive: true });
  document.addEventListener('click',  trackActivity, { passive: true });

  let saved = false;
  function endSession () {
    if (saved) return;
    saved = true;
    const sessions = loadSessions();
    sessions.push(session);
    saveSessions(sessions);
  }

  window.addEventListener('beforeunload', endSession);

  return () => {
    document.removeEventListener('scroll', trackActivity);
    document.removeEventListener('click',  trackActivity);
    window.removeEventListener('beforeunload', endSession);
    endSession();
  };
});
