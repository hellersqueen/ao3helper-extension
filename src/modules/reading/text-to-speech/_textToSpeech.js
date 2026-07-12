/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech Module Coordinator
    Module ID: textToSpeech
    Display Name: Text To Speech
    Tab: Reading

    Submodules (Tier 2 — self-register with parent: 'textToSpeech', discovered
    independently by src/modules.js's import.meta.glob, booted automatically
    by the cascade logic already built into core/lifecycle.js's bootOne()):
        speechEngine         -- voice selection, Web Speech API wrapper
        playbackControls     -- play/pause/stop, speed, sleep timer
        visualFeedback       -- sentence highlighting, auto-scroll
        contentFiltering     -- skip author notes/summary, text cleanup
        pronunciationManager -- custom pronunciation dictionary

    Public API (W.AO3H_TextToSpeech):
        lsGet(key), lsSet(key, val), cfg, splitSentences, NS

    Created by init() before the child cascade and removed by cleanup().
    Cross-submodule wiring reads the shared globals fresh at call time.

    Storage keys:
        ao3h:tts:voice, :rate, :pronunciations, :sleepMinutes

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './textToSpeech.css?inline';

import './speechEngine.js';
import './playbackControls.js';
import './visualFeedback.js';
import './contentFiltering.js';
import './pronunciationManager.js';

css(styles, 'ao3h-textToSpeech');

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'textToSpeech';

// ── Shared storage helpers ────────────────────────────────────────────────
function lsGet (key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet (key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Shared config reader ──────────────────────────────────────────────────
const DEFAULTS = {
  voice:            '',
  playbackSpeed:    1,
  stopOnPageChange: true,
  autoNextChapter:  true,
  highlightSentence:true,
  autoScroll:       true,
  skipAuthorNotes:  true,
  skipSummary:      true,
  floatingPanel:    true,
};

function cfg (key) {
  try {
    const saved = JSON.parse(localStorage.getItem(`${NS}:mod:${MOD}:settings`) || '{}');
    return saved[key] !== undefined ? saved[key] : DEFAULTS[key];
  } catch { return DEFAULTS[key]; }
}

// ── Sentence splitter (shared utility for submodules) ─────────────────────
function splitSentences (text) {
  return text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
}

// ── Coordinator registration ──────────────────────────────────────────────
register(
  MOD,
  { title: 'Text To Speech', enabledByDefault: false },
  async function init () {
    W.AO3H_TextToSpeech = { lsGet, lsSet, cfg, splitSentences, NS, DEFAULTS };
    return function cleanup () {
      delete W.AO3H_TextToSpeech;
    };
  }
);
