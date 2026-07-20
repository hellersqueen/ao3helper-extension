/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Author Tracking

Annotates listing blurbs for followed authors and saved notes, and detects new
works since the previous visit to an author's works page.

Notes

- Notes, followed authors, and visit snapshots use separate local-storage keys.
- New-work detection compares AO3's displayed work count with the prior snapshot.
- Dynamic listing content is annotated through a mutation observer.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { observe, onReady, lsGet, lsSet } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'authorTracking';
const NS   = 'ao3h';
const W    = getGlobalWindow();
const sortByKudosURL = (...args) => W.AO3H_UserRelationships.sortByKudosURL(...args);
// Optional-chained: a stray MutationObserver callback can still fire in the
// brief window after this module's coordinator has already torn down.
const getNotes = (...args) => W.AO3H_UserRelationships?.getAuthorNotes(...args) ?? {};
const saveNotes = (...args) => W.AO3H_UserRelationships?.saveAuthorNotes(...args);
const getFollowed = (...args) => W.AO3H_UserRelationships?.getFollowedAuthors(...args) ?? new Set();
const saveFollowed = (...args) => W.AO3H_UserRelationships?.saveFollowedAuthors(...args);

const SNAPSHOTS_KEY = 'authorTracking:snapshots';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — TRACKING STORAGE
═══════════════════════════════════════════════════════════════════════════ */

function getSnapshots () {
  return lsGet(SNAPSHOTS_KEY, {});
}

function saveSnapshots (snaps) {
  lsSet(SNAPSHOTS_KEY, snaps);
}

function setFollowed (key, isFollowed) {
  const followed = getFollowed();
  if (isFollowed) followed.add(key);
  else followed.delete(key);
  saveFollowed(followed);
}

function setNote (key, note) {
  const notes = getNotes();
  if (note) notes[key] = note;
  else delete notes[key];
  saveNotes(notes);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — NEW-WORK DETECTION
═══════════════════════════════════════════════════════════════════════════ */

function isAuthorWorksPage () {
  return /^\/users\/[^/]+\/(pseuds\/[^/]+\/)?works/.test(location.pathname);
}

function getAuthorFromPath () {
  const m = location.pathname.match(/^\/users\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function getWorkCountFromPage () {
  const heading = document.querySelector('h2.heading');
  if (!heading) return null;
  const m = heading.textContent.match(/(\d[\d,]*)\s+Works?/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}

function checkAndUpdateSnapshot (key, currentCount) {
  const snaps    = getSnapshots();
  const previous = snaps[key];
  snaps[key]     = { workCount: currentCount, lastSeen: Date.now() };
  saveSnapshots(snaps);
  return previous && previous.workCount < currentCount
    ? currentCount - previous.workCount
    : 0;
}

function showNewWorksBanner (author, newCount) {
  const banner = document.createElement('p');
  banner.className = `${NS}-author-new-works`;
  banner.textContent =
    `AO3 Helper: ${author} posted ${newCount} new work${newCount > 1 ? 's' : ''} since your last visit!`;
  const main = document.querySelector('#main');
  if (main) main.prepend(banner);
}

/** Link to the same author works page, sorted by kudos via AO3's own sort — no scraping needed. */
function showMostPopularLink () {
  if (document.querySelector(`.${NS}-author-popular-link`)) return;
  const link = document.createElement('a');
  link.className   = `${NS}-author-popular-link`;
  link.href        = sortByKudosURL(location.href);
  link.textContent = '🏆 Sort by kudos (most popular first)';
  const main = document.querySelector('#main');
  if (main) main.prepend(link);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — LISTING ANNOTATIONS
═══════════════════════════════════════════════════════════════════════════ */

function annotateBlurbs () {
  document.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(blurbEl => {
    const blurb = /** @type {HTMLElement} */ (blurbEl);
    if (blurb.dataset.ao3hTracked) return;
    blurb.dataset.ao3hTracked = '1';

    const link = blurb.querySelector('.authors a[rel="author"]');
    if (!link) return;
    const author = link.textContent.trim();
    const key    = author.toLowerCase();

    const badges = document.createElement('span');
    badges.className = `${NS}-author-tracking-badges`;

    const followBtn = document.createElement('button');
    followBtn.type      = 'button';
    followBtn.className = `${NS}-tracking-star ${NS}-tracking-btn`;
    const paintFollow = isFollowing => {
      followBtn.textContent = isFollowing ? '★' : '☆';
      followBtn.title = isFollowing
        ? 'You follow this author — click to unfollow'
        : 'Click to follow this author';
    };
    paintFollow(getFollowed().has(key));
    followBtn.addEventListener('click', e => {
      e.preventDefault();
      const nowFollowing = !getFollowed().has(key);
      setFollowed(key, nowFollowing);
      paintFollow(nowFollowing);
    });
    badges.appendChild(followBtn);

    const noteBtn = document.createElement('button');
    noteBtn.type      = 'button';
    noteBtn.className = `${NS}-tracking-note-icon ${NS}-tracking-btn`;
    const paintNote = note => {
      noteBtn.textContent = note ? '📝' : '📝?';
      noteBtn.title = note ? `Your note: ${note} (click to edit)` : 'Add a note about this author';
    };
    paintNote(getNotes()[key] || '');
    noteBtn.addEventListener('click', e => {
      e.preventDefault();
      const next = window.prompt(`Note about ${author}:`, getNotes()[key] || '');
      if (next === null) return;
      const trimmed = next.trim();
      setNote(key, trimmed);
      paintNote(trimmed);
    });
    badges.appendChild(noteBtn);

    link.parentNode.appendChild(badges);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Author Tracking',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  // document.body peut ne pas encore exister quand ce module boote — sans ce
  // report, l'observer plantait (Cannot read properties of null), constaté
  // sur plusieurs modules similaires en test.
  let active = true;
  let observer = null;
  onReady(() => {
    if (!active) return;
    if (isAuthorWorksPage()) {
      const author = getAuthorFromPath();
      const count  = getWorkCountFromPage();
      if (author && count !== null) {
        const newWorks = checkAndUpdateSnapshot(author.toLowerCase(), count);
        if (newWorks > 0) showNewWorksBanner(author, newWorks);
      }
      showMostPopularLink();
    }

    annotateBlurbs();
    observer = observe(document.body, { childList: true, subtree: true }, () => {
      if (active) annotateBlurbs();
    });
  });

  return () => {
    active = false;
    observer?.disconnect();
    document.querySelectorAll(`.${NS}-author-tracking-badges`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-author-new-works`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-author-popular-link`).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-tracked]').forEach(blurbEl => {
      delete (/** @type {HTMLElement} */ (blurbEl)).dataset.ao3hTracked;
    });
  };
});
