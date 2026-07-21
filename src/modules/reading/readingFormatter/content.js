/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Formatter › Content

Implements independently registered work-content cleanup and reading-view
optimization features.

Notes

- Formatting cleanup normalizes spaces and marks repeated line breaks visually.
- Embedded images can be hidden without removing them from the document.
- Original text and image display values are restored during cleanup.
- Both registrations consume configuration and utilities through `AO3H_RF`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { getWorkTitle, getWorkAuthor } from '../../../../lib/ao3/work-page.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

function cfg (key) {
  return W.AO3H_RF?.cfg(key) ?? null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CONTENT CLEANUP
═══════════════════════════════════════════════════════════════════════════ */

const CONTENT_CLEANUP_MOD = 'contentCleanup';
const CONTENT_CLEANUP_LOG = `[AO3H][readingFormatter/${CONTENT_CLEANUP_MOD}]`;
const originalText = new Map();
const originalImageDisplay = new Map();

/** Mark consecutive <br> pairs for visual paragraph separation. */
function fixDoubleBreaks (container) {
  container.querySelectorAll('p, div').forEach(block => {
    block.querySelectorAll('br').forEach(br => {
      const next = br.nextSibling;
      if (next?.nodeName === 'BR') {
        br.dataset.rfBr = '1';
        next.dataset.rfBr = '1';
      }
    });
  });
}

/** Collapse multiple spaces to single in text nodes. */
function fixDoubleSpaces (textNode) {
  if (textNode.textContent.includes('  ')) {
    if (!originalText.has(textNode)) originalText.set(textNode, textNode.textContent);
    textNode.textContent = textNode.textContent.replace(/  +/g, ' ');
  }
}

/** Hide embedded <img> tags inside work content (text-only mode). */
function hideEmbeddedImages (container) {
  container.querySelectorAll('img').forEach(img => {
    if (!originalImageDisplay.has(img)) originalImageDisplay.set(img, img.style.display);
    img.dataset.rfImgHidden = '1';
    img.style.display = 'none';
  });
}

/** Collapse nbsp runs left by word-processor pastes (same restore map). */
function fixPasteArtifacts (textNode) {
  const cleaned = W.AO3H_RF.cleanPasteArtifacts(textNode.textContent);
  if (cleaned !== textNode.textContent) {
    if (!originalText.has(textNode)) originalText.set(textNode, textNode.textContent);
    textNode.textContent = cleaned;
  }
}

/** Hide paragraphs that contain nothing but whitespace/nbsp filler. */
function hideEmptyParagraphs (container, NS) {
  container.querySelectorAll('p').forEach(p => {
    if (p.children.length === 0 && W.AO3H_RF.isEmptyParagraphText(p.textContent)) {
      p.classList.add(`${NS}-rf-empty-p`);
    }
  });
}

/** Split wall-of-text paragraphs into readable chunks (reversible). */
const wallReplacements = new Map(); // firstChunk <p> -> { original, extras: [<p>...] }
function splitTextWalls (container) {
  container.querySelectorAll('p').forEach(p => {
    // Only plain-text paragraphs — inline markup makes splitting unsafe
    if (p.children.length > 0) return;
    const chunks = W.AO3H_RF.splitWallText(p.textContent);
    if (chunks.length < 2) return;
    const replacement = /** @type {HTMLParagraphElement} */ (p.cloneNode(false));
    replacement.textContent = chunks[0];
    replacement.dataset.rfWall = '1';
    const extras = chunks.slice(1).map(chunk => {
      const el = /** @type {HTMLParagraphElement} */ (p.cloneNode(false));
      el.textContent = chunk;
      el.dataset.rfWall = '1';
      return el;
    });
    p.replaceWith(replacement);
    let anchor = replacement;
    extras.forEach(el => { anchor.insertAdjacentElement('afterend', el); anchor = el; });
    wallReplacements.set(replacement, { original: p, extras });
  });
}

register(CONTENT_CLEANUP_MOD, {
  title: 'Content Cleanup',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${CONTENT_CLEANUP_LOG} W.AO3H_RF not ready`); return () => {}; }

  const workskin = document.getElementById('workskin');

  if (RF.isWorkPage() && workskin) {
    const content = workskin.querySelector('.userstuff') || workskin;
    if (cfg('autoCleanFormatting')) {
      fixDoubleBreaks(content);
      RF.walkTextNodes(content, fixDoubleSpaces);
      RF.walkTextNodes(content, fixPasteArtifacts);
      hideEmptyParagraphs(content, RF.NS);
    }
    if (cfg('hideEmbeddedImages')) {
      hideEmbeddedImages(content);
    }
    if (cfg('splitTextWalls')) {
      splitTextWalls(content);
    }
  }

  return () => {
    // Remove br markers (visual only — no structural change was made)
    document.querySelectorAll('br[data-rf-br]').forEach(br => {
      delete (/** @type {HTMLElement} */ (br)).dataset.rfBr;
    });
    // Restore hidden images
    originalText.forEach((text, node) => { node.textContent = text; });
    originalText.clear();
    originalImageDisplay.forEach((display, img) => {
      img.style.display = display;
      delete img.dataset.rfImgHidden;
    });
    originalImageDisplay.clear();
    // Unhide empty paragraphs
    const NS = W.AO3H_RF?.NS || 'ao3h';
    document.querySelectorAll(`.${NS}-rf-empty-p`).forEach(p => {
      p.classList.remove(`${NS}-rf-empty-p`);
    });
    // Restore split walls
    wallReplacements.forEach(({ original, extras }, replacement) => {
      extras.forEach(el => el.remove());
      replacement.replaceWith(original);
    });
    wallReplacements.clear();
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READING VIEW OPTIMIZATION
═══════════════════════════════════════════════════════════════════════════ */

const READING_VIEW_OPTIMIZATION_MOD = 'readingViewOptimization';
const READING_VIEW_OPTIMIZATION_LOG = `[AO3H][readingFormatter/${READING_VIEW_OPTIMIZATION_MOD}]`;

/** Breathe mode: tag long paragraphs so CSS can widen their line spacing. */
function applyBreatheMode (container, NS) {
  container.querySelectorAll('p').forEach(p => {
    if (W.AO3H_RF.isLongParagraph(p.textContent)) p.classList.add(`${NS}-rf-breathe`);
  });
}

/** Semi-transparent horizontal band following the pointer (reading ruler). */
function createReadingRuler (NS) {
  const ruler = document.createElement('div');
  ruler.className = `${NS}-rf-ruler`;
  ruler.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ruler);
  const onMove = (e) => { ruler.style.top = `${e.clientY - 14}px`; };
  document.addEventListener('mousemove', onMove, { passive: true });
  return () => {
    document.removeEventListener('mousemove', onMove);
    ruler.remove();
  };
}

/** Repeat title / author / tags below the work for end-of-reading reference. */
function injectEndOfWorkInfo (NS) {
  if (document.getElementById(`${NS}-rf-endinfo`)) return;
  const title = getWorkTitle();
  if (!title) return;
  const author = getWorkAuthor().name;
  const tags = Array.from(document.querySelectorAll(
    '.work.meta.group dd.fandom.tags a.tag, .work.meta.group dd.relationship.tags a.tag, .work.meta.group dd.freeform.tags a.tag'
  )).slice(0, 12);

  const box = document.createElement('div');
  box.id = `${NS}-rf-endinfo`;
  box.className = `${NS}-rf-endinfo`;
  const heading = document.createElement('div');
  heading.className = `${NS}-rf-endinfo-title`;
  heading.textContent = author ? `${title} — ${author}` : title;
  box.appendChild(heading);
  if (tags.length) {
    const tagList = document.createElement('div');
    tagList.className = `${NS}-rf-endinfo-tags`;
    tags.forEach(tag => {
      const a = document.createElement('a');
      a.href = tag.getAttribute('href');
      a.textContent = tag.textContent;
      tagList.appendChild(a);
    });
    box.appendChild(tagList);
  }

  const anchor = document.querySelector('#workskin') || document.querySelector('#chapters');
  anchor?.insertAdjacentElement('afterend', box);
}

register(READING_VIEW_OPTIMIZATION_MOD, {
  title: 'Reading View Optimization',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${READING_VIEW_OPTIMIZATION_LOG} W.AO3H_RF not ready`); return () => {}; }

  if (!RF.isWorkPage()) return () => {};

  const html        = document.documentElement;
  const alignment   = cfg('textAlignment')    || 'left';
  const paraSpacing = cfg('paragraphSpacing') || '0.5em';

  html.style.setProperty('--ao3h-rvo-align',        alignment);
  html.style.setProperty('--ao3h-rvo-para-spacing', paraSpacing);

  const workskin = document.getElementById('workskin');
  if (cfg('breatheMode') && workskin) {
    applyBreatheMode(workskin.querySelector('.userstuff') || workskin, RF.NS);
  }

  let removeRuler = null;
  if (cfg('readingRuler')) removeRuler = createReadingRuler(RF.NS);

  if (cfg('endOfWorkInfo')) injectEndOfWorkInfo(RF.NS);

  return () => {
    html.style.removeProperty('--ao3h-rvo-align');
    html.style.removeProperty('--ao3h-rvo-para-spacing');
    const NS = W.AO3H_RF?.NS || 'ao3h';
    document.querySelectorAll(`.${NS}-rf-breathe`).forEach(p => p.classList.remove(`${NS}-rf-breathe`));
    removeRuler?.();
    document.getElementById(`${NS}-rf-endinfo`)?.remove();
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// Both features above self-register under the Reading Formatter coordinator.
