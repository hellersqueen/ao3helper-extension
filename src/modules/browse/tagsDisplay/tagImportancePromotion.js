/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Tag Importance Promotion

On listing pages, moves highlighted (favourite) tags to the front of their
own category — within each of warnings/relationships/characters/freeforms,
not across categories, so AO3's usual category ordering stays intact.

Notes

- "Important" = matches a tagHighlighting rule, read via the coordinator's
  shared getHighlightRules() (tagHighlighting.js owns the storage format).
- Original DOM order is remembered per blurb so disabling the feature (or
  its cleanup) restores AO3's native order exactly.
- MutationObserver re-applies to blurbs added later (AJAX/pagination).

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { observe } from '../../../../lib/utils/index.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'tagImportancePromotion';
const NS   = 'ao3h';
const W    = getGlobalWindow();
const findMatchingRule   = (...args) => W.AO3H_TagsDisplay.findMatchingRule(...args);
const sortByImportance   = (...args) => W.AO3H_TagsDisplay.sortByImportance(...args);
const cfg                = (...args) => W.AO3H_TagsDisplay.cfg(...args);
const loadHighlightRules = (...args) => W.AO3H_TagsDisplay.getHighlightRules(...args);
const PROCESSED_ATTR = 'data-ao3h-promoted';

function getItemKey (li) {
  return (li.querySelector('a.tag')?.textContent || li.textContent || '').trim();
}

function categoryOf (li) {
  return W.AO3H_TagsDisplay.TAG_CATEGORIES.find(c => li.classList.contains(c)) || '_other';
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PER-CATEGORY PROMOTION
═══════════════════════════════════════════════════════════════════════════ */

const originalOrders = new WeakMap(); // tagsList -> li[] in native order

function promoteList (tagsList, rules) {
  const allLis = Array.from(tagsList.querySelectorAll(':scope > li'));
  if (allLis.length < 2) return;
  if (!originalOrders.has(tagsList)) originalOrders.set(tagsList, allLis.slice());

  const groups = new Map();
  const order = [];
  for (const li of allLis) {
    const cat = categoryOf(li);
    if (!groups.has(cat)) { groups.set(cat, []); order.push(cat); }
    groups.get(cat).push(li);
  }

  const isImportant = (key) => !!findMatchingRule(key, rules);
  for (const cat of order) {
    sortByImportance(groups.get(cat), getItemKey, isImportant)
      .forEach(li => tagsList.appendChild(li));
  }
}

function processRoot (root, rules) {
  (root || document).querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(blurb => {
    if (blurb.getAttribute(PROCESSED_ATTR)) return;
    blurb.setAttribute(PROCESSED_ATTR, 'true');
    const tagsList = blurb.querySelector('ul.tags, .tags ul');
    if (tagsList) promoteList(tagsList, rules);
  });
}

function restoreAll () {
  document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(blurb => {
    const tagsList = blurb.querySelector('ul.tags, .tags ul');
    const original = tagsList && originalOrders.get(tagsList);
    if (original) original.forEach(li => tagsList.appendChild(li));
    blurb.removeAttribute(PROCESSED_ATTR);
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'Tag Importance Promotion',
  parent           : 'tagsDisplay',
  enabledByDefault : false,
}, async function init () {

  if (!cfg('promoteHighlightedTags', false)) return () => {};
  if (!document.querySelector('li.work.blurb, li.bookmark.blurb')) return () => {};

  const rules = loadHighlightRules();
  if (!rules.length) return () => {}; // nothing marked important — nothing to promote

  processRoot(document, rules);

  const main = document.querySelector('#main') || document.body;
  const obs = observe(main, { childList: true, subtree: true }, mutations => {
    for (const mut of mutations) {
      mut.addedNodes.forEach(node => { if (node instanceof Element) processRoot(node, rules); });
    }
  });

  return () => {
    obs.disconnect();
    restoreAll();
  };
});
