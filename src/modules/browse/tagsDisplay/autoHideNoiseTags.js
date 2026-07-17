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
import { Flags } from '../../../../lib/utils/config.js';
import { observe } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'autoHideNoiseTags';
const NS             = 'ao3h';
const HIDDEN_CLS     = `${NS}-noise-tag-hidden`;
const PROCESSED_ATTR = 'data-ao3h-noise-checked';

function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}

const NOISE_PATTERNS = [
  'idk',
  "i don't know",
  'i dont know',
  "i'm sorry",
  'im sorry',
  'sorry this is bad',
  'my first fic',
  'first fic pls be nice',
  'first fanfic pls be nice',
  'pls be nice',
  "don't read this",
  'dont read this',
  'this is dumb',
  'this is stupid',
  'this sucks',
  'i cant write',
  'i cannot write',
  'probably bad',
  'badly written',
  'unbetaed',
  "unbeta'd",
  'no beta we die like men',
  'not beta read',
  'idk what im doing',
  "idk what i'm doing",
];


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — NOISE-TAG DETECTION AND VISIBILITY
═══════════════════════════════════════════════════════════════════════════ */

function normalize (text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '').trim();
}

function isNoiseTag (text) {
  const norm = normalize(text);
  if (!norm || norm.length < 3) return false;
  return NOISE_PATTERNS.some(p => norm.includes(p));
}

const TAG_SELECTOR = 'a.tag, dd.tags a, dd.fandom a, dd.relationship a, dd.freeform a';

function processRoot (root) {
  (root || document).querySelectorAll(TAG_SELECTOR).forEach(el => {
    if (el.getAttribute(PROCESSED_ATTR)) return;
    el.setAttribute(PROCESSED_ATTR, 'true');
    const text = el.textContent?.trim();
    if (!text) return;
    if (isNoiseTag(text)) {
      const li = el.closest('li');
      (li || el).classList.add(HIDDEN_CLS);
    }
  });
}

function restoreAll () {
  document.querySelectorAll(`.${HIDDEN_CLS}`).forEach(el => el.classList.remove(HIDDEN_CLS));
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

  if (!cfg('autoHideNoiseTags', false)) return () => {};

  document.documentElement.classList.add(`${NS}-noise-filter-on`);
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
    document.documentElement.classList.remove(`${NS}-noise-filter-on`);
    restoreAll();
  };
});
