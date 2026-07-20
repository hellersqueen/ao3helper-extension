/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Author Blocking

Hides work and bookmark blurbs authored by blocked users and optionally replaces
them with temporarily revealable placeholders.

Notes

- Author matching is case-insensitive.
- Dynamic listing content is processed through a mutation observer.
- Original display values are restored during cleanup or blocklist changes.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { observe, onReady } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'authorBlocking';
const NS   = 'ao3h';
const W    = getGlobalWindow();
const parseUserHref = (...args) => W.AO3H_UserRelationships.parseUserHref(...args);
const isBlockedIdentity = (...args) => W.AO3H_UserRelationships.isBlockedIdentity(...args);
const getUserRelationshipsSettings = (...args) => W.AO3H_UserRelationships.getUserRelationshipsSettings(...args);
const bumpHiddenStat = (...args) => W.AO3H_UserRelationships.bumpHiddenStat(...args);
// Optional-chained: a stray MutationObserver callback can still fire in the
// brief window after this module's coordinator has already torn down.
const getBlockedList = (...args) => W.AO3H_UserRelationships?.getBlockedList(...args) ?? [];

const originalDisplays = new Map();

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BLOCKED-AUTHOR FILTERING
═══════════════════════════════════════════════════════════════════════════ */

function getBlockedAuthors () {
  return new Set(getBlockedList());
}

function getAuthorIdentity (blurb) {
  const link = blurb.querySelector('a[rel="author"], .authors a[href*="/users/"]');
  if (!link) return null;
  return parseUserHref(link.getAttribute('href'));
}

function hideBlurb (blurb, authorName) {
  if (blurb.dataset.ao3hBlocked) return;
  blurb.dataset.ao3hBlocked = '1';
  bumpHiddenStat('works');

  if (!originalDisplays.has(blurb)) originalDisplays.set(blurb, blurb.style.display);
  blurb.style.display = 'none';

  const settings = getUserRelationshipsSettings();
  if (!settings.showPlaceholder) return;

  const placeholder = document.createElement('p');
  placeholder.className = `${NS}-blocked-work`;
  placeholder.textContent = `[Hidden — Author blocked: ${authorName}]`;

  const revealBtn = document.createElement('button');
  revealBtn.textContent = 'Reveal';
  revealBtn.className = `${NS}-reveal-btn`;

  revealBtn.addEventListener('click', function () {
    blurb.style.display = originalDisplays.get(blurb) ?? '';
    delete blurb.dataset.ao3hBlocked;

    if (!settings.tempRevealHidden) { placeholder.remove(); return; }

    const hideAgain = document.createElement('button');
    hideAgain.textContent = 'Hide again';
    hideAgain.className = `${NS}-hide-again-btn`;
    hideAgain.addEventListener('click', () => {
      hideAgain.remove();
      hideBlurb(blurb, authorName);
    });
    blurb.prepend(hideAgain);
    placeholder.remove();
  });

  placeholder.appendChild(revealBtn);
  blurb.parentNode.insertBefore(placeholder, blurb);
}

function restoreBlurbs () {
  originalDisplays.forEach((display, blurb) => {
    blurb.style.display = display;
    delete blurb.dataset.ao3hBlocked;
  });
  originalDisplays.clear();
  document.querySelectorAll(`.${NS}-blocked-work, .${NS}-hide-again-btn`).forEach(el => el.remove());
}

function processBlurbs (blocked) {
  if (!blocked.size) return;
  document.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(blurb => {
    if (/** @type {HTMLElement} */ (blurb).dataset.ao3hBlocked) return;
    const identity = getAuthorIdentity(blurb);
    if (!identity) return;
    const { username, pseud } = identity;
    if (isBlockedIdentity(blocked, username, pseud)) {
      hideBlurb(blurb, pseud ? `${username} (${pseud})` : username);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Author Blocking',
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
    const blocked = getBlockedAuthors();
    processBlurbs(blocked);
    observer = observe(document.body, { childList: true, subtree: true }, () => {
      if (!active) return;
      processBlurbs(getBlockedAuthors());
    });
  });

  // Live-update when blockingInterface dispatches a block/unblock action
  const onBlockingChanged = () => { if (active) { restoreBlurbs(); processBlurbs(getBlockedAuthors()); } };
  document.addEventListener('ao3h:blocking-changed', onBlockingChanged);

  return () => {
    active = false;
    observer?.disconnect();
    document.removeEventListener('ao3h:blocking-changed', onBlockingChanged);
    restoreBlurbs();
  };
});
