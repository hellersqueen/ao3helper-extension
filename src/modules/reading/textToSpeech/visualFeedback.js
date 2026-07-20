/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech › Visual Feedback

Highlights the paragraph currently being spoken and optionally scrolls it into
the center of the viewport.

Notes

- Paragraph-level wrapping avoids damaging mixed inline markup.
- Playback Controls invokes the exposed highlight and clear operations.
- Cleanup unwraps any active highlight before removing the runtime API.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'visualFeedback';
const LOG = `[AO3H][${MOD}]`;

function shared () { return W.AO3H_TextToSpeech || null; }
function cfg (k) { const s = shared(); return s ? s.cfg(k) : null; }

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Visual Feedback', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};

  const HL_CLASS = `${NS}-tts-highlight`;
  let activeWrap = null;
  let scrollRafId = null;

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — CURRENT-PARAGRAPH HIGHLIGHTING
  ═════════════════════════════════════════════════════════════════════════ */

  function highlightSentence (sentenceInfo) {
    if (!(cfg('highlightSentence') ?? true)) return;
    clearHighlight();

    const el = sentenceInfo.paragraphEl;
    if (!el) return;

    // Wrap entire paragraph for simplicity (sentence-level splitting in DOM
    // is brittle with mixed inline elements). Good enough for per-sentence TTS.
    const mark = document.createElement('mark');
    mark.className = HL_CLASS;
    const color = cfg('highlightColor');
    if (color) mark.style.backgroundColor = color;
    while (el.firstChild) mark.appendChild(el.firstChild);
    el.appendChild(mark);
    activeWrap = { mark, parent: el };

    // Auto-scroll
    if (cfg('autoScroll') ?? true) {
      scrollParagraphIntoView(el);
    }
  }

  function scrollParagraphIntoView (el) {
    if (scrollRafId) { W.cancelAnimationFrame(scrollRafId); scrollRafId = null; }

    const rect = el.getBoundingClientRect();
    const startY = W.scrollY;
    const targetY = startY + rect.top - (W.innerHeight / 2 - rect.height / 2);
    const duration = shared().getScrollDuration(cfg('scrollSpeed'));
    const startTime = W.performance.now();

    function step (now) {
      const elapsed = now - startTime;
      W.scrollTo(0, shared().computeScrollY(startY, targetY, elapsed, duration));
      if (elapsed < duration) {
        scrollRafId = W.requestAnimationFrame(step);
      } else {
        scrollRafId = null;
      }
    }
    scrollRafId = W.requestAnimationFrame(step);
  }

  function clearHighlight () {
    if (!activeWrap) return;
    const { mark, parent } = activeWrap;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    mark.remove();
    activeWrap = null;
  }

  W.AO3H_TTS_Visual = { highlightSentence, clearHighlight };

  console.log(LOG, 'init');
  return function cleanup () {
    if (scrollRafId) { W.cancelAnimationFrame(scrollRafId); scrollRafId = null; }
    clearHighlight();
    delete W.AO3H_TTS_Visual;
  };
});
