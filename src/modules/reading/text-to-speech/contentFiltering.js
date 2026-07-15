/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Content Filtering Submodule
    Submodule ID: textToSpeech/contentFiltering
    Display Name: Content Filtering
    Source Module: Text To Speech

    Features:
        - Extracts readable text from #chapters (chapter content container)
        - Skips author notes (begin / end notes)
        - Skips summary / preface
        - Splits text into sentences for per-sentence TTS
        - Provides paragraph→sentence mapping for highlight mapping

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';

const W   = getGlobalWindow();
const MOD = 'contentFiltering';
const LOG = `[AO3H][${MOD}]`;

function shared () { return W.AO3H_TextToSpeech || null; }
function cfg (k) { const s = shared(); return s ? s.cfg(k) : null; }
function splitSentences (t) { const s = shared(); return s ? s.splitSentences(t) : [t]; }


// ── Registration ──────────────────────────────────────────────────────────
register(MOD, { title: 'Content Filtering', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};

  // ── Selectors for content to skip ───────────────────────────────────────
  const NOTES_SEL  = '.notes, .preface .notes, .afterword .notes, #chapters .notes';
  const SUMMARY_SEL = '.preface .summary, .preface .notes';

  // ── Extract paragraphs with sentence breakdown ──────────────────────────
  function extractContent () {
    const skipNotes   = cfg('skipAuthorNotes') ?? true;
    const skipSummary = cfg('skipSummary') ?? true;

    const container = document.querySelector('#chapters');
    if (!container) return { sentences: [], paragraphs: [] };

    const paragraphs = [];
    const pElements = container.querySelectorAll('p');

    for (const p of pElements) {
      if (skipNotes && p.closest(NOTES_SEL)) continue;
      if (skipSummary && p.closest(SUMMARY_SEL)) continue;

      const text = p.textContent.trim();
      if (!text) continue;

      const pSentences = splitSentences(text);
      paragraphs.push({ el: p, sentences: pSentences });
    }

    const sentences = paragraphs.flatMap((pg, pgIdx) =>
      pg.sentences.map((s, sIdx) => ({
        text: s.trim(),
        paragraphIdx: pgIdx,
        paragraphEl: pg.el,
        sentenceIdx: sIdx,
      }))
    ).filter(s => s.text.length > 0);

    return { sentences, paragraphs };
  }

  // ── Public API ──────────────────────────────────────────────────────────
  W.AO3H_TTS_Content = { extractContent };

  console.log(LOG, 'init');
  return function cleanup () { delete W.AO3H_TTS_Content; };
});
