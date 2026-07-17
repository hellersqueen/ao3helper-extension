/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › External Tag Links

Appends small Fanlore / TV Tropes search links after each tag, so users can
look a trope or fandom concept up without leaving the tag in place.

Notes

- Purely additive: never modifies or hides the original tag.
- Links open in a new tab and never carry `rel="author"` semantics.
- MutationObserver re-applies links to newly added blurbs (AJAX/pagination).

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';
import { observe } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   PURE EXTERNAL SEARCH URL BUILDERS
═══════════════════════════════════════════════════════════════════════════ */

export function buildFanloreSearchUrl(tagText) {
  return `https://fanlore.org/index.php?search=${encodeURIComponent(tagText)}`;
}

export function buildTvTropesSearchUrl(tagText) {
  return `https://tvtropes.org/pmwiki/results_search.php?q=${encodeURIComponent(tagText)}`;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'externalTagLinks';
const NS   = 'ao3h';
const PROCESSED_ATTR = 'data-ao3h-extlinks-checked';
const TAG_SELECTOR   = 'a.tag';

function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — LINK INJECTION
═══════════════════════════════════════════════════════════════════════════ */

function addLinksAfter (tagEl) {
  const text = tagEl.textContent?.trim();
  if (!text) return;

  const wrap = document.createElement('span');
  wrap.className = `${NS}-tag-extlinks`;

  const fanlore = document.createElement('a');
  fanlore.href = buildFanloreSearchUrl(text);
  fanlore.target = '_blank';
  fanlore.rel = 'noopener noreferrer';
  fanlore.title = `Search "${text}" on Fanlore`;
  fanlore.textContent = '📖';
  wrap.appendChild(fanlore);

  const tvtropes = document.createElement('a');
  tvtropes.href = buildTvTropesSearchUrl(text);
  tvtropes.target = '_blank';
  tvtropes.rel = 'noopener noreferrer';
  tvtropes.title = `Search "${text}" on TV Tropes`;
  tvtropes.textContent = '🌀';
  wrap.appendChild(tvtropes);

  tagEl.insertAdjacentElement('afterend', wrap);
}

function processRoot (root) {
  (root || document).querySelectorAll(TAG_SELECTOR).forEach(el => {
    if (el.getAttribute(PROCESSED_ATTR)) return;
    el.setAttribute(PROCESSED_ATTR, 'true');
    addLinksAfter(el);
  });
}

function restoreAll () {
  document.querySelectorAll(`.${NS}-tag-extlinks`).forEach(el => el.remove());
  document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => el.removeAttribute(PROCESSED_ATTR));
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'External Tag Links',
  parent           : 'tagsDisplay',
  enabledByDefault : false,
}, async function init () {

  if (!cfg('tagExternalLinks', false)) return () => {};

  processRoot(document);

  const main = document.querySelector('#main') || document.body;
  const obs = observe(main, { childList: true, subtree: true }, mutations => {
    for (const mut of mutations) {
      mut.addedNodes.forEach(node => {
        if (node instanceof Element) processRoot(node);
      });
    }
  });

  return () => {
    obs.disconnect();
    restoreAll();
  };
});
