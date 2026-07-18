/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech › Playback Controls

Provides the floating read-aloud interface, sentence playback queue, voice and
rate selection, sleep timer, progress display, and chapter advancement.

Notes

- Space toggles playback only while focus is inside the controls panel.
- Playback uses runtime APIs exposed by the content, engine, visual, and
  pronunciation submodules.
- Active speech, timers, and listeners are stopped during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';
import { showToast, clearAllToasts } from '../../../../lib/ui/toast.js';
import { SPEED_PRESETS, clampVolume, clampPitch, computeFadeFactor, nextSleepEnd, clampSentenceIndex } from './playbackHelpers.js';
import { getVoiceLanguages, filterVoicesByLang, formatVoiceLabel } from './voiceHelpers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'playbackControls';
const LOG = `[AO3H][${MOD}]`;

function shared ()  { return W.AO3H_TextToSpeech || null; }
function cfg (k)    { const s = shared(); return s ? s.cfg(k) : null; }

const LS_RATE   = `${NS}:tts:rate`;
const LS_VOLUME = `${NS}:tts:volume`;
const LS_PITCH  = `${NS}:tts:pitch`;
const LS_SLEEP  = `${NS}:tts:sleepMinutes`;
const LS_LANG   = `${NS}:tts:langFilter`;

const SLEEP_FADE_MS   = 8000;  // fade the last 8s of the sleep countdown
const SLEEP_EXTEND_MIN = 5;
const CHAPTER_FADE_CLASS = `${NS}-tts-chapter-fade`;
const CHAPTER_FADE_DELAY = 300;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Playback Controls', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};
  if (!('speechSynthesis' in W)) return () => {};

  const synth = W.speechSynthesis;

  let sentences   = [];
  let currentIdx  = 0;
  let isPlaying   = false;
  let isPaused    = false;
  let currentRate   = parseFloat(lsGet(LS_RATE))   || cfg('playbackSpeed') || 1;
  let currentVolume = clampVolume(parseFloat(lsGet(LS_VOLUME)) || cfg('volume') || 1);
  let currentPitch  = clampPitch(parseFloat(lsGet(LS_PITCH))   || cfg('pitch')  || 1);
  let isMuted     = false;
  let langFilter  = lsGet(LS_LANG) || '';
  let sleepTimer  = null;
  let sleepEnd    = 0;
  let sleepTick   = null;
  let playbackSession = 0;
  let currentUtterance = null;

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PLAYBACK PANEL
  ═════════════════════════════════════════════════════════════════════════ */

  const panel = document.createElement('div');
  panel.className = `${NS}-tts-panel`;
  panel.style.display = 'none';           // hidden until user clicks Play fab
  panel.setAttribute('tabindex', '-1');    // focusable for keyboard
  panel.innerHTML = `
    <button class="${NS}-tts-close" title="Close">✕</button>
    <div class="${NS}-tts-panel-title">🔊 Text to Speech</div>
    <div class="${NS}-tts-progress"><div class="${NS}-tts-progress-bar"></div></div>

    <div class="${NS}-tts-voice-row">
      <select class="${NS}-tts-lang-filter" title="Filter voices by language">
        <option value="">All languages</option>
      </select>
      <select class="${NS}-tts-voice-select"><option value="">System default</option></select>
      <button class="${NS}-tts-voice-preview" title="Preview voice">🔈</button>
    </div>

    <div class="${NS}-tts-controls">
      <button class="${NS}-tts-btn" data-act="skip-back" title="Skip back one sentence">⏮</button>
      <button class="${NS}-tts-btn" data-act="play">▶ Play</button>
      <button class="${NS}-tts-btn" data-act="pause" disabled>⏸</button>
      <button class="${NS}-tts-btn" data-act="stop" disabled>⏹</button>
      <button class="${NS}-tts-btn" data-act="skip-forward" title="Skip ahead one sentence">⏭</button>
    </div>

    <div class="${NS}-tts-row">
      <label>Speed</label>
      <input type="range" class="${NS}-tts-rate-range" min="0.5" max="2" step="0.1" value="${currentRate}">
      <span class="${NS}-tts-val ${NS}-tts-rate-val">${currentRate}×</span>
    </div>

    <div class="${NS}-tts-preset-row">
      <button class="${NS}-tts-preset-btn" data-preset="comfortable" title="0.85×">🐢 Comfortable</button>
      <button class="${NS}-tts-preset-btn" data-preset="normal" title="1×">Normal</button>
      <button class="${NS}-tts-preset-btn" data-preset="fast" title="1.25×">🐇 Fast</button>
      <button class="${NS}-tts-preset-btn" data-preset="audiobook" title="1.5×">🎧 Audiobook</button>
    </div>

    <div class="${NS}-tts-row">
      <label>Volume</label>
      <input type="range" class="${NS}-tts-volume-range" min="0" max="1" step="0.05" value="${currentVolume}">
      <span class="${NS}-tts-val ${NS}-tts-volume-val">${Math.round(currentVolume * 100)}%</span>
      <button class="${NS}-tts-mute-btn" title="Mute">🔊</button>
    </div>

    <div class="${NS}-tts-row">
      <label>Pitch</label>
      <input type="range" class="${NS}-tts-pitch-range" min="0" max="2" step="0.1" value="${currentPitch}">
      <span class="${NS}-tts-val ${NS}-tts-pitch-val">${currentPitch}</span>
    </div>

    <div class="${NS}-tts-sleep-row">
      <label>Sleep</label>
      <select>
        <option value="0">Off</option>
        <option value="15">15 min</option>
        <option value="30">30 min</option>
        <option value="60">60 min</option>
      </select>
      <span class="${NS}-tts-sleep-countdown"></span>
      <button class="${NS}-tts-sleep-extend" title="Add 5 minutes" style="display:none">+5m</button>
    </div>
  `;
  const playBtn    = panel.querySelector('[data-act="play"]');
  const pauseBtn   = panel.querySelector('[data-act="pause"]');
  const stopBtn    = panel.querySelector('[data-act="stop"]');
  const skipBackBtn    = panel.querySelector('[data-act="skip-back"]');
  const skipForwardBtn = panel.querySelector('[data-act="skip-forward"]');
  const rateSlider = panel.querySelector(`.${NS}-tts-rate-range`);
  const rateVal    = panel.querySelector(`.${NS}-tts-rate-val`);
  const presetBtns = panel.querySelectorAll(`.${NS}-tts-preset-btn`);
  const volumeSlider = panel.querySelector(`.${NS}-tts-volume-range`);
  const volumeVal     = panel.querySelector(`.${NS}-tts-volume-val`);
  const muteBtn        = panel.querySelector(`.${NS}-tts-mute-btn`);
  const pitchSlider = panel.querySelector(`.${NS}-tts-pitch-range`);
  const pitchVal    = panel.querySelector(`.${NS}-tts-pitch-val`);
  const progressBar = panel.querySelector(`.${NS}-tts-progress-bar`);
  const closeBtn   = panel.querySelector(`.${NS}-tts-close`);
  const langSelect  = panel.querySelector(`.${NS}-tts-lang-filter`);
  const voiceSelect = panel.querySelector(`.${NS}-tts-voice-select`);
  const previewBtn  = panel.querySelector(`.${NS}-tts-voice-preview`);
  const sleepSelect = panel.querySelector(`.${NS}-tts-sleep-row select`);
  const sleepCdEl   = panel.querySelector(`.${NS}-tts-sleep-countdown`);
  const sleepExtendBtn = panel.querySelector(`.${NS}-tts-sleep-extend`);

  const fab = document.createElement('button');
  fab.className = `${NS}-tts-btn ${NS}-tts-fab`;
  fab.textContent = '🔊 Read Aloud';
  // document.body peut ne pas encore exister quand ce module boote — sans ce
  // report, l'appendChild plantait (Cannot read properties of null), constaté
  // sur plusieurs modules similaires en test.
  let attachActive = true;
  onReady(() => {
    if (!attachActive) return;
    if (cfg('floatingPanel') !== false) { document.body.appendChild(panel); document.body.appendChild(fab); }
  });

  fab.addEventListener('click', () => {
    panel.style.display = '';
    fab.style.display = 'none';
  });
  closeBtn.addEventListener('click', () => {
    stopPlayback();
    panel.style.display = 'none';
    fab.style.display = '';
  });

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — VOICE, RATE, VOLUME AND PITCH CONTROLS
  ═════════════════════════════════════════════════════════════════════════ */

  function populateVoices () {
    const engine = W.AO3H_TTS_Engine;
    if (!engine) return;
    const allVoices = engine.getVoices();

    const languages = getVoiceLanguages(allVoices);
    langSelect.innerHTML = '<option value="">All languages</option>';
    languages.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = lang;
      langSelect.appendChild(opt);
    });
    langSelect.value = languages.includes(langFilter) ? langFilter : '';

    const voices = filterVoicesByLang(allVoices, langFilter);
    voiceSelect.innerHTML = '<option value="">System default</option>';
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      opt.textContent = formatVoiceLabel(v);
      voiceSelect.appendChild(opt);
    });
    const sel = engine.getSelectedVoice();
    if (sel) voiceSelect.value = sel.voiceURI;
  }
  populateVoices();
  W.speechSynthesis.addEventListener('voiceschanged', populateVoices);

  langSelect.addEventListener('change', () => {
    langFilter = langSelect.value;
    lsSet(LS_LANG, langFilter);
    populateVoices();
  });
  voiceSelect.addEventListener('change', () => {
    const engine = W.AO3H_TTS_Engine;
    if (engine) engine.setVoice(voiceSelect.value);
  });
  previewBtn.addEventListener('click', () => {
    const engine = W.AO3H_TTS_Engine;
    if (engine) engine.preview();
  });

  function setRate (rate, { persist = true } = {}) {
    currentRate = rate;
    rateSlider.value = String(rate);
    rateVal.textContent = rate + '×';
    if (persist) lsSet(LS_RATE, currentRate);
  }

  rateSlider.addEventListener('input', () => {
    setRate(parseFloat(rateSlider.value));
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = SPEED_PRESETS[btn.dataset.preset];
      if (preset !== undefined) setRate(preset);
    });
  });

  function setVolumeLabel () {
    volumeVal.textContent = Math.round(currentVolume * 100) + '%';
  }

  volumeSlider.addEventListener('input', () => {
    currentVolume = clampVolume(parseFloat(volumeSlider.value));
    setVolumeLabel();
    lsSet(LS_VOLUME, currentVolume);
    const engine = W.AO3H_TTS_Engine;
    if (engine) engine.setVolume(currentVolume);
    if (isMuted) { isMuted = false; muteBtn.textContent = '🔊'; muteBtn.classList.remove(`${NS}-tts-active`); }
  });

  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle(`${NS}-tts-active`, isMuted);
  });

  pitchSlider.addEventListener('input', () => {
    currentPitch = clampPitch(parseFloat(pitchSlider.value));
    pitchVal.textContent = String(currentPitch);
    lsSet(LS_PITCH, currentPitch);
    const engine = W.AO3H_TTS_Engine;
    if (engine) engine.setPitch(currentPitch);
  });

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SENTENCE PLAYBACK
  ═════════════════════════════════════════════════════════════════════════ */

  function loadSentences () {
    const content = W.AO3H_TTS_Content;
    if (!content) return [];
    const { sentences: s } = content.extractContent();
    return s;
  }

  function updateProgress () {
    const pct = sentences.length ? ((currentIdx / sentences.length) * 100) : 0;
    progressBar.style.width = pct + '%';
  }

  function effectiveVolume () {
    if (isMuted) return 0;
    const remaining = sleepEnd ? sleepEnd - Date.now() : null;
    const fade = sleepEnd ? computeFadeFactor(remaining, SLEEP_FADE_MS) : 1;
    return clampVolume(currentVolume * fade);
  }

  function speakSentence (idx, session) {
    if (!isPlaying || session !== playbackSession) return;
    if (idx >= sentences.length) {
      onFinished(session);
      return;
    }
    currentIdx = idx;
    updateProgress();

    const info = sentences[idx];
    const engine = W.AO3H_TTS_Engine;
    if (!engine) return;

    // Apply pronunciation substitutions
    let text = info.text;
    const pron = W.AO3H_TTS_Pronunciation;
    if (pron) text = pron.applyPronunciations(text);

    const utterance = engine.createUtterance(text, currentRate, {
      volume: effectiveVolume(),
      pitch: currentPitch,
    });
    currentUtterance = utterance;

    // Visual feedback
    const visual = W.AO3H_TTS_Visual;
    if (visual) visual.highlightSentence(info);

    utterance.onend = () => {
      if (currentUtterance === utterance) currentUtterance = null;
      if (isPlaying && session === playbackSession) speakSentence(idx + 1, session);
    };
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') console.warn(LOG, 'utterance error', e.error);
    };
    synth.speak(utterance);
  }

  function startPlayback () {
    sentences = loadSentences();
    if (!sentences.length) return;
    const session = ++playbackSession;
    isPlaying = true;
    isPaused  = false;
    speakSentence(currentIdx, session);
    setButtonsPlaying();
  }

  function pausePlayback () {
    synth.pause();
    isPaused = true;
    setButtonsPaused();
  }

  function resumePlayback () {
    synth.resume();
    isPaused = false;
    setButtonsPlaying();
  }

  function stopPlayback () {
    playbackSession++;
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance = null;
    }
    synth.cancel();
    isPlaying = false;
    isPaused  = false;
    currentIdx = 0;
    updateProgress();
    setButtonsStopped();
    const visual = W.AO3H_TTS_Visual;
    if (visual) visual.clearHighlight();
    clearSleep();
  }

  function skipSentence (delta) {
    if (!sentences.length) return;
    const newIdx = clampSentenceIndex(currentIdx + delta, sentences.length);
    if (newIdx === currentIdx) return;
    if (isPlaying) {
      if (currentUtterance) {
        currentUtterance.onend = null;
        currentUtterance.onerror = null;
        currentUtterance = null;
      }
      synth.cancel();
      isPaused = false;
      setButtonsPlaying();
      speakSentence(newIdx, playbackSession);
    } else {
      currentIdx = newIdx;
      updateProgress();
    }
  }
  skipBackBtn.addEventListener('click', () => skipSentence(-1));
  skipForwardBtn.addEventListener('click', () => skipSentence(1));

  function onFinished (session) {
    if (session !== playbackSession) return;
    playbackSession++;
    currentUtterance = null;
    isPlaying = false;
    currentIdx = 0;
    updateProgress();
    setButtonsStopped();
    const visual = W.AO3H_TTS_Visual;
    if (visual) visual.clearHighlight();
    clearSleep();

    if (cfg('notifyChapterEnd')) {
      showToast('Chapter finished reading.', { type: 'info' });
    }

    // Auto-advance to next chapter
    if (cfg('autoNextChapter') ?? true) {
      const nextLink = document.querySelector('ul.work.navigation.actions li.chapter.next a, #feedback ul.actions li.chapter.next a');
      if (nextLink) {
        const proceed = cfg('confirmNextChapter') ? confirm('Continue to the next chapter?') : true;
        if (proceed) {
          console.log(LOG, 'auto-advancing to next chapter');
          document.body.classList.add(CHAPTER_FADE_CLASS);
          setTimeout(() => nextLink.click(), CHAPTER_FADE_DELAY);
        }
      }
    }
  }

  function setButtonsPlaying () {
    playBtn.disabled  = true;
    pauseBtn.disabled = false;
    stopBtn.disabled  = false;
  }
  function setButtonsPaused () {
    playBtn.disabled  = false;
    pauseBtn.disabled = true;
    stopBtn.disabled  = false;
  }
  function setButtonsStopped () {
    playBtn.disabled  = false;
    pauseBtn.disabled = true;
    stopBtn.disabled  = true;
  }

  playBtn.addEventListener('click', () => {
    if (isPaused) resumePlayback();
    else startPlayback();
  });
  pauseBtn.addEventListener('click', pausePlayback);
  stopBtn.addEventListener('click', stopPlayback);

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SLEEP TIMER
  ═════════════════════════════════════════════════════════════════════════ */

  function startSleep (minutes) {
    clearSleep();
    if (!minutes) return;
    sleepEnd = Date.now() + minutes * 60000;
    lsSet(LS_SLEEP, minutes);
    sleepExtendBtn.style.display = '';

    sleepTick = setInterval(() => {
      const remaining = Math.max(0, sleepEnd - Date.now());
      if (remaining <= 0) {
        stopPlayback();
        sleepCdEl.textContent = '';
        return;
      }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      sleepCdEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  function clearSleep () {
    if (sleepTick) { clearInterval(sleepTick); sleepTick = null; }
    sleepEnd = 0;
    sleepCdEl.textContent = '';
    sleepExtendBtn.style.display = 'none';
  }

  sleepSelect.addEventListener('change', () => {
    startSleep(parseInt(sleepSelect.value, 10));
  });

  sleepExtendBtn.addEventListener('click', () => {
    if (!sleepEnd) return;
    sleepEnd = nextSleepEnd(sleepEnd, SLEEP_EXTEND_MIN);
  });

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PAGE AND KEYBOARD EVENTS
  ═════════════════════════════════════════════════════════════════════════ */

  function onBeforeUnload () {
    if ((cfg('stopOnPageChange') ?? true) && isPlaying) synth.cancel();
  }
  W.addEventListener('beforeunload', onBeforeUnload);

  function onKeydown (e) {
    if (e.code !== 'Space') return;
    if (document.activeElement && document.activeElement.closest(`.${NS}-tts-panel`)) {
      e.preventDefault();
      if (isPlaying && !isPaused) pausePlayback();
      else if (isPaused) resumePlayback();
      else startPlayback();
    }
  }
  document.addEventListener('keydown', onKeydown);

  console.log(LOG, 'init');

  return function cleanup () {
    attachActive = false;
    stopPlayback();
    document.body.classList.remove(CHAPTER_FADE_CLASS);
    clearAllToasts();
    panel.remove();
    fab.remove();
    W.removeEventListener('beforeunload', onBeforeUnload);
    document.removeEventListener('keydown', onKeydown);
    W.speechSynthesis.removeEventListener('voiceschanged', populateVoices);
  };
});
