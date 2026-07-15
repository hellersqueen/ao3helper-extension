/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Author Tracking Submodule
    Submodule ID: authorTracking
    Parent: userRelationships
    Display Name: Author Tracking

    - Feature: Author notes
      - Option: Store personal notes per author
      - Option: Storage key: `authorTracking:notes`
      - Option: Note badge (📝) shown on blurbs for authors with notes
      - Option: Note text shown on hover via title attribute

    - Feature: Follow tracking
      - Option: Maintain a followed-authors list
      - Option: Storage key: `authorTracking:followed`
      - Option: Star badge (★) shown on blurbs for followed authors

    - Feature: New work detection
      - Option: When visiting an author's works page, record current work count + timestamp
      - Option: Storage key: `authorTracking:snapshots`
      - Option: On return visit, detect if work count has increased
      - Option: Show green banner "X new works since your last visit!" at top of page

    - Feature: Author statistics snapshots
      - Option: Record { workCount, lastSeen } per author on each works-page visit
      - Option: Persists across sessions via localStorage

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { observe } from '../../../../lib/utils/index.js';

const MOD  = 'authorTracking';
const NS   = 'ao3h';

const NOTES_KEY     = 'authorTracking:notes';
const FOLLOWED_KEY  = 'authorTracking:followed';
const SNAPSHOTS_KEY = 'authorTracking:snapshots';

// ── Storage helpers ──────────────────────────────────────────────────────

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

// ── Author works page helpers ────────────────────────────────────────────

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

// ── New-work detection ───────────────────────────────────────────────────

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

// ── Listing page annotations ─────────────────────────────────────────────

function annotateBlurbs () {
  const followed = getFollowed();
  const notes    = getNotes();

  document.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(blurb => {
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

// ── Module registration ──────────────────────────────────────────────────

register(MOD, {
  title:            'Author Tracking',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  if (isAuthorWorksPage()) {
    const author = getAuthorFromPath();
    const count  = getWorkCountFromPage();
    if (author && count !== null) {
      const newWorks = checkAndUpdateSnapshot(author.toLowerCase(), count);
      if (newWorks > 0) showNewWorksBanner(author, newWorks);
    }
  }

  annotateBlurbs();
  const observer = observe(document.body, { childList: true, subtree: true }, annotateBlurbs);

  return () => {
    observer.disconnect();
    document.querySelectorAll(`.${NS}-author-tracking-badges`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-author-new-works`).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-tracked]').forEach(blurb => {
      delete blurb.dataset.ao3hTracked;
    });
  };
});
