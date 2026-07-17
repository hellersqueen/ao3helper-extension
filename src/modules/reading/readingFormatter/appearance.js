/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Formatter › Appearance

Implements the independently registered typography, spacing and structure, and
layout display features owned by Reading Formatter.

Notes

- Slash italics, excessive bold removal, and scene-break replacement are reversible.
- Each feature reads configuration and shared utilities through `AO3H_RF`.
- The three registrations remain independently controllable child modules.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

function cfg (key) {
  return W.AO3H_RF?.cfg(key) ?? null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — TYPOGRAPHY
═══════════════════════════════════════════════════════════════════════════ */

const TYPOGRAPHY_MOD = 'typography';
const TYPOGRAPHY_LOG = `[AO3H][readingFormatter/${TYPOGRAPHY_MOD}]`;
const slashElements = new Set();
const boldReplacements = new Map();

/** Replace /text/ with <em>text</em> in a text node. */
function applySlashItalic (textNode) {
  const src = textNode.textContent;
  if (!src.includes('/')) return;
  const re = /\/([^/\n]{1,120}?)\//g;
  if (!re.test(src)) return;
  re.lastIndex = 0;

  const frag = document.createDocumentFragment();
  let last = 0, m;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) {
      frag.appendChild(document.createTextNode(src.slice(last, m.index)));
    }
    const em = document.createElement('em');
    em.textContent = m[1];
    em.dataset.rfSlash = '1';
    slashElements.add(em);
    frag.appendChild(em);
    last = m.index + m[0].length;
  }
  if (last < src.length) {
    frag.appendChild(document.createTextNode(src.slice(last)));
  }
  textNode.parentNode?.replaceChild(frag, textNode);
}

/** Strip excessive <strong> (paragraphs where > 60% of text is bold). */
function stripExcessiveBold (container) {
  const paras = container.querySelectorAll('p');
  paras.forEach(p => {
    const total = p.textContent.length;
    if (total < 10) return;
    let bold = 0;
    p.querySelectorAll('strong, b').forEach(el => { bold += el.textContent.length; });
    if (bold / total > 0.6) {
      p.querySelectorAll('strong, b').forEach(el => {
        const span = document.createElement('span');
        span.dataset.rfBold = '1';
        while (el.firstChild) span.appendChild(el.firstChild);
        el.replaceWith(span);
        boldReplacements.set(span, el);
      });
    }
  });
}

register(TYPOGRAPHY_MOD, {
  title: 'Typography',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${TYPOGRAPHY_LOG} W.AO3H_RF not ready`); return () => {}; }

  const html     = document.documentElement;
  const workskin = document.getElementById('workskin');

  // Sans-serif applies on all pages
  if (cfg('sansSerifFont')) html.classList.add(RF.SANSSERIF_CLS);

  // Text transforms: work pages only
  if (RF.isWorkPage() && workskin) {
    const content = workskin.querySelector('.userstuff') || workskin;
    if (cfg('convertSlashItalic')) RF.walkTextNodes(content, applySlashItalic);
    if (cfg('removeBoldExcessive')) stripExcessiveBold(content);
  }

  return () => {
    html.classList.remove(RF.SANSSERIF_CLS);
    // Revert slash-italic: unwrap <em data-rf-slash>
    slashElements.forEach(em => {
      em.replaceWith(`/${em.textContent}/`);
    });
    slashElements.clear();
    // Restore the exact original <b>/<strong> element, attributes included.
    boldReplacements.forEach((original, span) => {
      while (span.firstChild) original.appendChild(span.firstChild);
      span.replaceWith(original);
    });
    boldReplacements.clear();
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SPACING AND STRUCTURE
═══════════════════════════════════════════════════════════════════════════ */

const SPACING_AND_STRUCTURE_MOD = 'spacingAndStructure';
const SPACING_AND_STRUCTURE_LOG = `[AO3H][readingFormatter/${SPACING_AND_STRUCTURE_MOD}]`;
const sceneBreakReplacements = new Map();

function unifySceneBreaks (container) {
  const NS = W.AO3H_RF?.NS || 'ao3h';
  container.querySelectorAll('p, div').forEach(el => {
    const text = el.textContent.trim();
    if (/^([*\-~_=+]{3,}|(\*\s*){3,}|(–\s*){3,})$/.test(text)) {
      const replacement = document.createElement('p');
      replacement.textContent = '✦ ✦ ✦';
      replacement.className = `${NS}-rf-scene-break`;
      replacement.dataset.rfBreak = '1';
      el.replaceWith(replacement);
      sceneBreakReplacements.set(replacement, el);
    }
  });
  // Replace standalone <hr> with styled dividers
  container.querySelectorAll('hr').forEach(hr => {
    if (hr.dataset.rfBreak) return;
    const NS2 = W.AO3H_RF?.NS || 'ao3h';
    const div = document.createElement('p');
    div.textContent = '✦ ✦ ✦';
    div.className = `${NS2}-rf-scene-break`;
    div.dataset.rfBreak = '1';
    div.dataset.rfHrReplaced = '1';
    hr.replaceWith(div);
    sceneBreakReplacements.set(div, hr);
  });
}

register(SPACING_AND_STRUCTURE_MOD, {
  title: 'Spacing and Structure',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${SPACING_AND_STRUCTURE_LOG} W.AO3H_RF not ready`); return () => {}; }

  const workskin = document.getElementById('workskin');

  if (RF.isWorkPage() && workskin && cfg('unifySceneBreaks')) {
    const content = workskin.querySelector('.userstuff') || workskin;
    unifySceneBreaks(content);
  }

  return () => {
    sceneBreakReplacements.forEach((original, replacement) => replacement.replaceWith(original));
    sceneBreakReplacements.clear();
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — LAYOUT AND DISPLAY MODES
═══════════════════════════════════════════════════════════════════════════ */

const LAYOUT_AND_DISPLAY_MODES_MOD = 'layoutAndDisplayModes';
const LAYOUT_AND_DISPLAY_MODES_LOG = `[AO3H][readingFormatter/${LAYOUT_AND_DISPLAY_MODES_MOD}]`;

register(LAYOUT_AND_DISPLAY_MODES_MOD, {
  title: 'Layout and Display Modes',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${LAYOUT_AND_DISPLAY_MODES_LOG} W.AO3H_RF not ready`); return () => {}; }

  // Clean reading mode applies on all pages
  if (cfg('cleanReadingMode')) {
    document.documentElement.classList.add(RF.CLEAN_CLS);
  }

  return () => {
    document.documentElement.classList.remove(RF.CLEAN_CLS);
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// Each feature above self-registers under the Reading Formatter coordinator.
