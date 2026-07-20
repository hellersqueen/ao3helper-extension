/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Auto Hide Noise Tags

Detects low-signal, self-deprecating freeform tags with a fixed substring list
and hides their list entries while the feature is active.

Notes

- Matching is case-insensitive and uses normalized substring comparisons.
- Processed tags are marked to avoid duplicate scans.
- All classes and processing attributes are removed during cleanup.

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

const MOD  = 'autoHideNoiseTags';
const NS             = 'ao3h';
const W              = getGlobalWindow();
const HIDDEN_CLS     = `${NS}-noise-tag-hidden`;
const PROCESSED_ATTR = 'data-ao3h-noise-checked';

export const BLURRED_CLASS     = 'ao3h-noise-tag-blurred';

const cfg = (...args) => W.AO3H_TagsDisplay.cfg(...args);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — NOISE-TAG DETECTION AND VISIBILITY
═══════════════════════════════════════════════════════════════════════════ */

const TAG_SELECTOR = 'a.tag, dd.tags a, dd.fandom a, dd.relationship a, dd.freeform a';

// Set once at init from the config panel's settings/lists.
let noiseApi         = null;
let activePatterns   = [];
let authorExceptions = [];
let styleClass       = HIDDEN_CLS; // HIDDEN_CLS (display:none) or BLURRED_CLASS (filter: blur)

function processRoot (root) {
  (root || document).querySelectorAll(TAG_SELECTOR).forEach(el => {
    if (el.getAttribute(PROCESSED_ATTR)) return;
    el.setAttribute(PROCESSED_ATTR, 'true');
    const text = el.textContent?.trim();
    if (!text) return;
    if (!noiseApi.isNoiseTag(text, activePatterns)) return;

    const blurb = el.closest('li.blurb');
    if (blurb && noiseApi.isExceptedAuthor(noiseApi.extractBlurbAuthor(blurb), authorExceptions)) return;

    const li = el.closest('li');
    if (li) {
      // Normal case: keep the <li> (so the .commas li::after comma stays put),
      // hide/blur its original content, and offer a per-tag reveal chip instead.
      li.classList.add(styleClass);
      if (!li.querySelector(`.${noiseApi.REVEAL_CHIP_CLASS}`)) li.appendChild(noiseApi.createRevealChip(document, { preview: text }));
    } else {
      // Rare fallback (no wrapping <li> found): hide the tag element itself.
      // No reveal chip here — nesting a <button> inside an <a> would be invalid.
      el.classList.add(styleClass);
    }
  });
}

// Individually reveal a single noise-hidden tag, without disabling the whole filter.
function onRevealChipClick (e) {
  const chip = e.target.closest(`.${noiseApi.REVEAL_CHIP_CLASS}`);
  if (!chip) return;
  noiseApi.revealNoiseTag(chip.closest('li'));
}

function restoreAll () {
  document.querySelectorAll(`.${HIDDEN_CLS}, .${BLURRED_CLASS}`).forEach(el => {
    el.classList.remove(HIDDEN_CLS, BLURRED_CLASS, noiseApi.REVEALED_CLASS);
    el.querySelector(`.${noiseApi.REVEAL_CHIP_CLASS}`)?.remove();
  });
  document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => el.removeAttribute(PROCESSED_ATTR));
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title            : 'Auto Hide Noise Tags',
  parent           : 'tagsDisplay',
  enabledByDefault : false,
}, async function init () {

  noiseApi = W.AO3H_TagsDisplay;

  if (!cfg('autoHideNoiseTags', false)) return () => {};

  activePatterns   = noiseApi.mergeNoisePatterns(noiseApi.NOISE_PATTERNS, noiseApi.getCustomNoiseWords());
  authorExceptions = noiseApi.getAuthorExceptions();
  styleClass       = cfg('noiseTagStyle', 'hide') === 'blur' ? BLURRED_CLASS : HIDDEN_CLS;

  document.documentElement.classList.add(`${NS}-noise-filter-on`);
  processRoot(document);
  document.addEventListener('click', onRevealChipClick);

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
    document.removeEventListener('click', onRevealChipClick);
    document.documentElement.classList.remove(`${NS}-noise-filter-on`);
    restoreAll();
    activePatterns   = noiseApi.NOISE_PATTERNS;
    authorExceptions = [];
    styleClass       = HIDDEN_CLS;
    noiseApi         = null;
  };
});
