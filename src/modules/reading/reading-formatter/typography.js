/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Typography Submodule
    Submodule ID: typography
    Parent: readingFormatter
    Display Name: Typography

    Handles font-level transforms on work pages:
      - convertSlashItalic  : /text/ → <em>text</em>
      - removeBoldExcessive : strip <strong> when >60% of paragraph is bold
      - sansSerifFont       : CSS override to sans-serif on #workskin

    Reads config from parent module (readingFormatter).
    Shares utilities via W.AO3H_RF set up by coordinator.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W   = getGlobalWindow();
const MOD = 'typography';
const LOG = `[AO3H][readingFormatter/${MOD}]`;
const slashElements = new Set();
const boldReplacements = new Map();

// ── Config — reads from parent readingFormatter settings ─────────────────
function cfg (key) {
  return W.AO3H_RF?.cfg(key) ?? null;
}

// ── Text transforms ────────────────────────────────────────────────────

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

// ══════════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Typography',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${LOG} W.AO3H_RF not ready`); return () => {}; }

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
