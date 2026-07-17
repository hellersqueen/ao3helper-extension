/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Blocked-User Bookmarks

Hides public bookmark blurbs created by users on the User Relationships
block list (key userBlocker:list) — e.g. on a work's /bookmarks page.

Notes
    Reads the block list maintained by userRelationships; reacts live to
    ao3h:blocking-changed events. Only other users' bookmark blurbs are
    concerned: the reader's own bookmark pages are left untouched.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { observe } from '../../../../lib/utils/index.js';

const MOD = 'blockedBookmarks';
const NS  = 'ao3h';

const cfg = makeCfg('bookmarkVault', { hideBlockedUsersBookmarks: true });

function getBlockedUsers () {
  try {
    return new Set(JSON.parse(localStorage.getItem('userBlocker:list') || '[]')
      .map(u => String(u).toLowerCase()));
  } catch { return new Set(); }
}

/** The bookmarker's username on a public bookmark blurb, lowercased. */
export function blurbOwner (blurb) {
  const link = blurb.querySelector('.user.module .byline a[href^="/users/"], h5.byline a[href^="/users/"]');
  const m = link?.getAttribute('href')?.match(/^\/users\/([^/]+)/);
  return m ? decodeURIComponent(m[1]).toLowerCase() : null;
}

function isOwnBookmarksPage () {
  return /^\/users\/[^/]+\/bookmarks/.test(location.pathname);
}

function processBlurbs (root = document) {
  const blocked = getBlockedUsers();
  root.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
    if (!(blurb instanceof HTMLElement)) return;
    const owner = blurbOwner(blurb);
    const hide  = !!owner && blocked.has(owner);
    if (hide) {
      blurb.style.display = 'none';
      blurb.dataset.bvBlockedHidden = '1';
    } else if (blurb.dataset.bvBlockedHidden) {
      blurb.style.display = '';
      delete blurb.dataset.bvBlockedHidden;
    }
  });
}

function restoreAll () {
  document.querySelectorAll('[data-bv-blocked-hidden]').forEach(blurb => {
    if (blurb instanceof HTMLElement) {
      blurb.style.display = '';
      delete blurb.dataset.bvBlockedHidden;
    }
  });
}

register(MOD, {
  title:            'Blocked-User Bookmarks',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  if (!cfg('hideBlockedUsersBookmarks') || isOwnBookmarksPage()) return () => {};

  processBlurbs();
  const onChange = () => processBlurbs();
  document.addEventListener('ao3h:blocking-changed', onChange);
  const obs = observe(document.getElementById('main') || document.body,
    { childList: true, subtree: true }, () => processBlurbs());

  return () => {
    document.removeEventListener('ao3h:blocking-changed', onChange);
    obs.disconnect();
    restoreAll();
  };
});
