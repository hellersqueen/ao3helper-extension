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
import { observe, onReady } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'authorTracking';
const NS   = 'ao3h';

const NOTES_KEY     = 'authorTracking:notes';
const FOLLOWED_KEY  = 'authorTracking:followed';
const SNAPSHOTS_KEY = 'authorTracking:snapshots';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — TRACKING STORAGE
═══════════════════════════════════════════════════════════════════════════ */

function getNotes () {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); }
  catch (_) { return {}; }
}

function getFollowed () {
  try { return new Set(JSON.parse(localStorage.getItem(FOLLOWED_KEY) || '[]')); }
  catch (_) { return new Set(); }
}

function getSnapshots () {
  try { return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '{}'); }
  catch (_) { return {}; }
}

function saveSnapshots (snaps) {
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snaps));
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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — LISTING ANNOTATIONS
═══════════════════════════════════════════════════════════════════════════ */

function annotateBlurbs () {
  const followed = getFollowed();
  const notes    = getNotes();

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

    if (followed.has(key)) {
      const star = document.createElement('span');
      star.textContent = '★';
      star.title       = 'You follow this author';
      star.className   = `${NS}-tracking-star`;
      badges.appendChild(star);
    }

    if (notes[key]) {
      const noteIcon = document.createElement('span');
      noteIcon.textContent = '📝';
      noteIcon.title       = `Your note: ${notes[key]}`;
      noteIcon.className   = `${NS}-tracking-note-icon`;
      badges.appendChild(noteIcon);
    }

    if (badges.children.length) link.parentNode.appendChild(badges);
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
    }

    annotateBlurbs();
    observer = observe(document.body, { childList: true, subtree: true }, annotateBlurbs);
  });

  return () => {
    active = false;
    observer?.disconnect();
    document.querySelectorAll(`.${NS}-author-tracking-badges`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-author-new-works`).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-tracked]').forEach(blurbEl => {
      delete (/** @type {HTMLElement} */ (blurbEl)).dataset.ao3hTracked;
    });
  };
});
