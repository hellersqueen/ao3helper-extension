/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Author Blocking Submodule
    Submodule ID: authorBlocking
    Parent: userRelationships
    Display Name: Author Blocking

    - Feature: Works filtering
      - Option: Process work blurbs on listing pages
      - Option: Hide blurbs whose author is on the blocklist
      - Option: Case-insensitive author name matching
      - Option: Reads blocklist from storage key: `userBlocker:list`
      - Option: Dynamic observation for new content (MutationObserver)

    - Feature: Hidden work indicators
      - Option: Replace blurb with "[Hidden — Author blocked: {name}]" placeholder
      - Option: Temporary reveal button to show the blurb without unblocking
      - Option: Re-hide button after temporary reveal

    - Feature: Blocklist statistics
      - Option: Count of hidden works displayed in placeholder

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getUserRelationshipsSettings } from './userRelationshipsSettings.js';
import { observe, onReady } from '../../../../lib/utils/index.js';

const MOD  = 'authorBlocking';
const NS   = 'ao3h';

const STORAGE_KEY = 'userBlocker:list';
const originalDisplays = new Map();

function getBlockedAuthors () {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(u => u.toLowerCase()));
  } catch (_) {
    return new Set();
  }
}

function getAuthorName (blurb) {
  const link = blurb.querySelector('a[rel="author"], .authors a[href*="/users/"]');
  return link ? link.textContent.trim().toLowerCase() : null;
}

function hideBlurb (blurb, authorName) {
  if (blurb.dataset.ao3hBlocked) return;
  blurb.dataset.ao3hBlocked = '1';

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
    if (blurb.dataset.ao3hBlocked) return;
    const author = getAuthorName(blurb);
    if (author && blocked.has(author)) hideBlurb(blurb, author);
  });
}

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
    observer = observe(document.body, { childList: true, subtree: true }, () => processBlurbs(getBlockedAuthors()));
  });

  // Live-update when blockingInterface dispatches a block/unblock action
  const onBlockingChanged = () => { restoreBlurbs(); processBlurbs(getBlockedAuthors()); };
  document.addEventListener('ao3h:blocking-changed', onBlockingChanged);

  return () => {
    active = false;
    observer?.disconnect();
    document.removeEventListener('ao3h:blocking-changed', onBlockingChanged);
    restoreBlurbs();
  };
});
