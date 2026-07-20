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
const LS_VOLUME = `${NS}:tts:volume`;
const LS_PITCH  = `${NS}:tts:pitch`;

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
  let currentVolume = shared().clampVolume(parseFloat(lsGet(LS_VOLUME)) || cfg('volume') || 1);
  let currentPitch  = shared().clampPitch(parseFloat(lsGet(LS_PITCH)) || cfg('pitch') || 1);

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

  function setVolume (volume) {
    currentVolume = shared().clampVolume(volume);
    lsSet(LS_VOLUME, currentVolume);
  }

  function setPitch (pitch) {
    currentPitch = shared().clampPitch(pitch);
    lsSet(LS_PITCH, currentPitch);
  }

  function createUtterance (text, rate, opts = {}) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate ?? cfg('playbackSpeed') ?? 1;
    u.volume = shared().clampVolume(opts.volume ?? currentVolume);
    u.pitch = shared().clampPitch(opts.pitch ?? currentPitch);
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
    setVolume,
    setPitch,
    getVolume: () => currentVolume,
    getPitch: () => currentPitch,
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
