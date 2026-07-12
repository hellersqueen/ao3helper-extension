/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Content Cleanup Submodule
    Submodule ID: contentCleanup
    Parent: readingFormatter
    Display Name: Content Cleanup

    Handles structural DOM fixes on work pages:
      - autoCleanFormatting : fix double spaces (text nodes) +
                              mark double-<br> sequences
      - hideEmbeddedImages  : hide <img> tags embedded in work content
                              (text-only mode, bandwidth saving)

    Reads config from parent module (readingFormatter).
    Shares utilities via W.AO3H_RF set up by coordinator.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W   = getGlobalWindow();
const MOD = 'contentCleanup';
const LOG = `[AO3H][readingFormatter/${MOD}]`;
const originalText = new Map();
const originalImageDisplay = new Map();

// ── Config — reads from parent readingFormatter settings ─────────────────
function cfg (key) {
  return W.AO3H_RF?.cfg(key) ?? null;
}

// ── Cleanup helpers ────────────────────────────────────────────────────

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

// ══════════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

register(MOD, {
  title: 'Content Cleanup',
  parent: 'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${LOG} W.AO3H_RF not ready`); return () => {}; }

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
      delete br.dataset.rfBr;
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
