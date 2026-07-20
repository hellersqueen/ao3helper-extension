/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Tags Visibility

Truncates long listing-page tag groups by priority and adds controls for
revealing or collapsing the hidden tags within each work blurb.

Notes

- Warning and relationship tags are retained ahead of lower-priority tags.
- A maximum of zero means that all tags remain visible.
- Newly added listing blurbs are processed through a mutation observer.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';
import { observe } from '../../../../lib/utils/index.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'tagsVisibility';
const NS   = 'ao3h';
const W    = getGlobalWindow();
const isExcludedCategory = (...args) => W.AO3H_TagsDisplay.isExcludedCategory(...args);

const DEFAULT_DENSITY = 5;
const PRIORITY_CLASSES = ['warnings', 'relationships', 'characters', 'freeforms'];

function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}

// Which whole categories to hide entirely (independent of the density
// truncation below) — e.g. always hide Freeform tags, keep Characters.
const CATEGORY_HIDE_SETTINGS = {
  warnings     : 'hideTagsWarnings',
  relationships: 'hideTagsRelationships',
  characters   : 'hideTagsCharacters',
  freeforms    : 'hideTagsFreeforms',
};

function getExcludedCategories () {
  return W.AO3H_TagsDisplay.TAG_CATEGORIES.filter(cat => cfg(CATEGORY_HIDE_SETTINGS[cat], false));
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PRIORITIZED TAG TRUNCATION
═══════════════════════════════════════════════════════════════════════════ */

// Priority for smart truncation: lower index = higher priority (kept first)
// AO3 uses plural class names directly on the li element
function isListingPage () {
  return !!document.querySelector('li.work.blurb, li.bookmark.blurb');
}

function getPriorityScore (li) {
  // Check the li itself first, then walk up ancestors
  let el = li;
  while (el && el !== document.body) {
    for (let i = 0; i < PRIORITY_CLASSES.length; i++) {
      if (el.classList.contains(PRIORITY_CLASSES[i])) return i;
    }
    el = el.parentElement;
  }
  return PRIORITY_CLASSES.length; // lowest priority if unknown
}

// Whole-category exclusion (setting-driven, permanent — no "+N more" toggle).
function hideExcludedCategories (blurb, excluded) {
  if (!excluded.length) return;
  blurb.querySelectorAll('.tags li').forEach(li => {
    if (li.dataset.ao3hCatHidden) return;
    if (isExcludedCategory(li, excluded)) {
      li.dataset.ao3hCatHidden = '1';
      li.style.display = 'none';
    }
  });
}

function applyDensity (blurb, density) {
  // Category-excluded tags don't count toward the density budget or the
  // "+N more" total — they're gone regardless of density.
  const allTags = Array.from(blurb.querySelectorAll('.tags li')).filter(li => !li.dataset.ao3hCatHidden);
  if (allTags.length <= density) return;

  // Smart truncation: sort by priority descending (lowest priority hidden first)
  const sorted = allTags.slice().sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  const toHide  = sorted.slice(0, allTags.length - density);
  const hiddenCount = toHide.length;

  toHide.forEach(li => {
    li.dataset.ao3hHidden = '1';
    li.style.display = 'none';
  });

  // "Show more" button
  const showMoreBtn = document.createElement('button');
  showMoreBtn.className = `${NS}-show-more-tags`;
  showMoreBtn.textContent = `+ ${hiddenCount} more tag${hiddenCount !== 1 ? 's' : ''}`;

  // "Show less" button (created once, swapped)
  const showLessBtn = document.createElement('button');
  showLessBtn.className = `${NS}-show-less-tags`;
  showLessBtn.textContent = '– Show less';

  showMoreBtn.addEventListener('click', () => {
    toHide.forEach(li => { li.style.display = ''; delete li.dataset.ao3hHidden; });
    showMoreBtn.replaceWith(showLessBtn);
  });

  showLessBtn.addEventListener('click', () => {
    toHide.forEach(li => { li.dataset.ao3hHidden = '1'; li.style.display = 'none'; });
    showLessBtn.replaceWith(showMoreBtn);
  });

  // Insert after the last still-visible tag <li>
  const visibleTags = allTags.filter(li => !li.dataset.ao3hHidden);
  const anchor = visibleTags[visibleTags.length - 1];
  if (anchor) {
    anchor.insertAdjacentElement('afterend', showMoreBtn);
  } else {
    // Fallback: append to first tags list
    const tagsList = blurb.querySelector('ul.tags, .tags ul');
    if (tagsList) tagsList.appendChild(showMoreBtn);
  }
}

function processBlurbs (blurbs, density, excludedCategories) {
  blurbs.forEach(blurb => {
    hideExcludedCategories(blurb, excludedCategories);
    if (blurb.dataset.ao3hVis) return;
    blurb.dataset.ao3hVis = '1';
    if (density) applyDensity(blurb, density);
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Tags Visibility',
  parent:           'tagsDisplay',
  enabledByDefault: false,
}, async function init () {
  if (!isListingPage()) return () => {};

  const rawDensity = cfg('maxTagsVisible', DEFAULT_DENSITY);
  const density = rawDensity ? Math.max(1, parseInt(rawDensity, 10) || DEFAULT_DENSITY) : 0;
  const excludedCategories = getExcludedCategories();

  if (!density && !excludedCategories.length) return () => {}; // nothing to do

  processBlurbs(document.querySelectorAll('li.work.blurb, li.bookmark.blurb'), density, excludedCategories);

  const main = document.querySelector('#main');
  const obs = main ? observe(main, { childList: true, subtree: false }, mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.('li.work.blurb, li.bookmark.blurb')) {
          processBlurbs([node], density, excludedCategories);
        } else {
          node.querySelectorAll?.('li.work.blurb, li.bookmark.blurb')
            .forEach(el => processBlurbs([el], density, excludedCategories));
        }
      }
    }
  }) : null;

  return () => {
    obs?.disconnect();
    document.querySelectorAll(`.${NS}-show-more-tags, .${NS}-show-less-tags`)
      .forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-hidden]').forEach(li => {
      li.style.display = '';
      delete li.dataset.ao3hHidden;
    });
    document.querySelectorAll('[data-ao3h-cat-hidden]').forEach(li => {
      li.style.display = '';
      delete li.dataset.ao3hCatHidden;
    });
    document.querySelectorAll('[data-ao3h-vis]').forEach(el => {
      delete el.dataset.ao3hVis;
    });
  };
});
