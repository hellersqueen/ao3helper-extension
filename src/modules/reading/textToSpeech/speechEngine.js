/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech › Speech Engine

Wraps the Web Speech API with persistent voice selection, voice preview, and
sentence-level utterance construction.

Notes

- The feature remains inactive when speech synthesis is unavailable.
- Chrome's asynchronous `voiceschanged` event refreshes the voice list.
- The engine runtime API is removed and speech is cancelled during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'speechEngine';
const LOG = `[AO3H][${MOD}]`;

function shared () { return W.AO3H_TextToSpeech || null; }
function cfg (k) { const s = shared(); return s ? s.cfg(k) : null; }

const LS_VOICE = `${NS}:tts:voice`;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Speech Engine', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};
  if (!('speechSynthesis' in W)) {
    console.warn(LOG, 'Web Speech API not supported');
    return () => {};
  }

  const synth = W.speechSynthesis;
  let voices = [];
  let selectedVoice = null;

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — VOICE SELECTION AND UTTERANCES
  ═════════════════════════════════════════════════════════════════════════ */

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
