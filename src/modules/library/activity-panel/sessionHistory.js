/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Activity Panel › SessionHistory sub-module
    Records work-page sessions to localStorage (ao3h:activityPanel:sessions).
    Captures startedAt, lastActiveAt, pageViews, hourOfDay, fandoms[], words.
    Registered as: sessionHistory (parent: activityPanel)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';

const MOD = 'sessionHistory';

const SESSIONS_KEY   = 'ao3h:activityPanel:sessions';
const MAX_SESSIONS   = 500;

function loadSessions () {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch (_) { return []; }
}

function saveSessions (sessions) {
  // Keep only the most recent MAX_SESSIONS entries
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-MAX_SESSIONS)));
}

function getWorkMeta () {
  const match = location.pathname.match(/\/works\/(\d+)/);
  if (!match) return null;
  const title = document.querySelector('h2.title')?.textContent.trim() ||
                document.title.split('|')[0].trim();
  const fandomTags = [...document.querySelectorAll('.fandom.tags a')]
    .map(a => a.textContent.trim());
  const words = parseInt(
    (document.querySelector('.stats dd.words')?.textContent || '0').replace(/,/g, ''), 10
  ) || 0;
  return { workId: match[1], title, fandoms: fandomTags, words };
}

function startSession (meta) {
  return {
    workId:      meta.workId,
    title:       meta.title,
    fandoms:     meta.fandoms,
    words:       meta.words,
    startedAt:   Date.now(),
    lastActiveAt: Date.now(),
    pageViews:   1,
    hourOfDay:   new Date().getHours(),
  };
}

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
