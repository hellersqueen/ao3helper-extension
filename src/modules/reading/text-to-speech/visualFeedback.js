/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Feedback Submodule
    Submodule ID: textToSpeech/visualFeedback
    Display Name: Visual Feedback
    Source Module: Text To Speech

    Features:
        - Highlights the paragraph containing the current sentence being read aloud
        - Auto-scrolls to keep the highlighted paragraph in view
        - Provides highlight/unhighlight API for playbackControls to call

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'visualFeedback';
const LOG = `[AO3H][${MOD}]`;

function shared () { return W.AO3H_TextToSpeech || null; }
function cfg (k) { const s = shared(); return s ? s.cfg(k) : null; }

function isWorkPage () { return /^\/works\/\d+/.test(location.pathname); }

register(MOD, { title: 'Visual Feedback', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};

  const HL_CLASS = `${NS}-tts-highlight`;
  let activeWrap = null;

  // ── Wrap a sentence's text portion inside a <mark> ──────────────────────
  function highlightSentence (sentenceInfo) {
    if (!(cfg('highlightSentence') ?? true)) return;
    clearHighlight();

    const el = sentenceInfo.paragraphEl;
    if (!el) return;

    // Wrap entire paragraph for simplicity (sentence-level splitting in DOM
    // is brittle with mixed inline elements). Good enough for per-sentence TTS.
    const mark = document.createElement('mark');
    mark.className = HL_CLASS;
    while (el.firstChild) mark.appendChild(el.firstChild);
    el.appendChild(mark);
    activeWrap = { mark, parent: el };

    // Auto-scroll
    if (cfg('autoScroll') ?? true) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearHighlight () {
    if (!activeWrap) return;
    const { mark, parent } = activeWrap;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    mark.remove();
    activeWrap = null;
  }

  // ── Public API ──────────────────────────────────────────────────────────
  W.AO3H_TTS_Visual = { highlightSentence, clearHighlight };

  console.log(LOG, 'init');
  return function cleanup () {
    clearHighlight();
    delete W.AO3H_TTS_Visual;
  };
});
