/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Speech Engine Submodule
    Submodule ID: textToSpeech/speechEngine
    Display Name: Speech Engine
    Source Module: Text To Speech

    Features:
        - Web Speech API wrapper
        - Voice selection with persistence
        - Voice preview
        - Sentence-by-sentence utterance queue for highlight/progress tracking

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'speechEngine';
const LOG = `[AO3H][${MOD}]`;

// ── Helpers from coordinator ──────────────────────────────────────────────
function shared () { return W.AO3H_TextToSpeech || null; }
function cfg (k) { const s = shared(); return s ? s.cfg(k) : null; }

const LS_VOICE = `${NS}:tts:voice`;

// ── Route guard — work pages only ─────────────────────────────────────────
function isWorkPage () { return /^\/works\/\d+/.test(location.pathname); }

// ── Registration ──────────────────────────────────────────────────────────
register(MOD, { title: 'Speech Engine', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};
  if (!('speechSynthesis' in W)) {
    console.warn(LOG, 'Web Speech API not supported');
    return () => {};
  }

  const synth = W.speechSynthesis;
  let voices = [];
  let selectedVoice = null;

  // ── Load voices (async — Chrome fires voiceschanged) ────────────────────
  function loadVoices () {
    voices = synth.getVoices();
    const savedURI = lsGet(LS_VOICE) || cfg('voice') || null;
    if (savedURI) {
      selectedVoice = voices.find(v => v.voiceURI === savedURI) || null;
    }
  }

  loadVoices();
  synth.addEventListener('voiceschanged', loadVoices);

  function setVoice (voiceURI) {
    selectedVoice = voices.find(v => v.voiceURI === voiceURI) || null;
    lsSet(LS_VOICE, voiceURI || '');
  }

  // ── Create utterance for a single sentence ──────────────────────────────
  function createUtterance (text, rate) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate ?? cfg('playbackSpeed') ?? 1;
    if (selectedVoice) u.voice = selectedVoice;
    return u;
  }

  function preview () {
    synth.cancel();
    const u = createUtterance('The quick brown fox jumps over the lazy dog.', cfg('playbackSpeed') ?? 1);
    synth.speak(u);
  }

  // ── Public engine API ───────────────────────────────────────────────────
  W.AO3H_TTS_Engine = {
    getVoices: () => voices,
    setVoice,
    getSelectedVoice: () => selectedVoice,
    createUtterance,
    preview,
    synth,
  };

  console.log(LOG, 'init — voices:', voices.length);

  return function cleanup () {
    synth.removeEventListener('voiceschanged', loadVoices);
    synth.cancel();
    delete W.AO3H_TTS_Engine;
  };
});
