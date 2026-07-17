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
    }
    if (cfg('hideEmbeddedImages')) {
      hideEmbeddedImages(content);
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
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READING VIEW OPTIMIZATION
═══════════════════════════════════════════════════════════════════════════ */

const READING_VIEW_OPTIMIZATION_MOD = 'readingViewOptimization';
const READING_VIEW_OPTIMIZATION_LOG = `[AO3H][readingFormatter/${READING_VIEW_OPTIMIZATION_MOD}]`;

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

  return () => {
    html.style.removeProperty('--ao3h-rvo-align');
    html.style.removeProperty('--ao3h-rvo-para-spacing');
  };
});

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// Both features above self-register under the Reading Formatter coordinator.
