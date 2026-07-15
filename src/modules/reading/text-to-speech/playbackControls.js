/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Playback Controls Submodule
    Submodule ID: textToSpeech/playbackControls
    Display Name: Playback Controls
    Source Module: Text To Speech

    Features:
        - Floating control panel with Play / Pause / Stop
        - Speed slider (0.5× – 2×)
        - Voice selector (populated from speechEngine)
        - Sleep timer (15 / 30 / 60 min with countdown)
        - Auto-advance to next chapter on completion
        - Progress bar (sentence-based)
        - Keyboard shortcut: Space to toggle play/pause (when panel focused)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'playbackControls';
const LOG = `[AO3H][${MOD}]`;

function shared ()  { return W.AO3H_TextToSpeech || null; }
function cfg (k)    { const s = shared(); return s ? s.cfg(k) : null; }

const LS_RATE  = `${NS}:tts:rate`;
const LS_SLEEP = `${NS}:tts:sleepMinutes`;


register(MOD, { title: 'Playback Controls', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};
  if (!('speechSynthesis' in W)) return () => {};

  const synth = W.speechSynthesis;

  // ── State ───────────────────────────────────────────────────────────────
  let sentences   = [];
  let currentIdx  = 0;
  let isPlaying   = false;
  let isPaused    = false;
  let currentRate = parseFloat(lsGet(LS_RATE)) || cfg('playbackSpeed') || 1;
  let sleepTimer  = null;
  let sleepEnd    = 0;
  let sleepTick   = null;
  let playbackSession = 0;
  let currentUtterance = null;

  // ── Build panel ─────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = `${NS}-tts-panel`;
  panel.style.display = 'none';           // hidden until user clicks Play fab
  panel.setAttribute('tabindex', '-1');    // focusable for keyboard
  panel.innerHTML = `
    <button class="${NS}-tts-close" title="Close">✕</button>
    <div class="${NS}-tts-panel-title">🔊 Text to Speech</div>
    <div class="${NS}-tts-progress"><div class="${NS}-tts-progress-bar"></div></div>

    <div class="${NS}-tts-voice-row">
      <select class="${NS}-tts-voice-select"><option value="">System default</option></select>
      <button class="${NS}-tts-voice-preview" title="Preview voice">🔈</button>
    </div>

    <div class="${NS}-tts-controls">
      <button class="${NS}-tts-btn" data-act="play">▶ Play</button>
      <button class="${NS}-tts-btn" data-act="pause" disabled>⏸</button>
      <button class="${NS}-tts-btn" data-act="stop" disabled>⏹</button>
    </div>

    <div class="${NS}-tts-row">
      <label>Speed</label>
      <input type="range" min="0.5" max="2" step="0.1" value="${currentRate}">
      <span class="${NS}-tts-val">${currentRate}×</span>
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
    </div>
  `;
  if (cfg('floatingPanel') !== false) document.body.appendChild(panel);

  // ── Element refs ────────────────────────────────────────────────────────
  const playBtn    = panel.querySelector('[data-act="play"]');
  const pauseBtn   = panel.querySelector('[data-act="pause"]');
  const stopBtn    = panel.querySelector('[data-act="stop"]');
  const rateSlider = panel.querySelector('input[type="range"]');
  const rateVal    = panel.querySelector(`.${NS}-tts-val`);
  const progressBar = panel.querySelector(`.${NS}-tts-progress-bar`);
  const closeBtn   = panel.querySelector(`.${NS}-tts-close`);
  const voiceSelect = panel.querySelector(`.${NS}-tts-voice-select`);
  const previewBtn  = panel.querySelector(`.${NS}-tts-voice-preview`);
  const sleepSelect = panel.querySelector(`.${NS}-tts-sleep-row select`);
  const sleepCdEl   = panel.querySelector(`.${NS}-tts-sleep-countdown`);

  // ── Floating trigger button (always visible on work pages) ──────────────
  const fab = document.createElement('button');
  fab.className = `${NS}-tts-btn ${NS}-tts-fab`;
  fab.textContent = '🔊 Read Aloud';
  if (cfg('floatingPanel') !== false) document.body.appendChild(fab);

  fab.addEventListener('click', () => {
    panel.style.display = '';
    fab.style.display = 'none';
  });
  closeBtn.addEventListener('click', () => {
    stopPlayback();
    panel.style.display = 'none';
    fab.style.display = '';
  });

  // ── Populate voice selector (wait for engine) ───────────────────────────
  function populateVoices () {
    const engine = W.AO3H_TTS_Engine;
    if (!engine) return;
    const voices = engine.getVoices();
    voiceSelect.innerHTML = '<option value="">System default</option>';
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
    const sel = engine.getSelectedVoice();
    if (sel) voiceSelect.value = sel.voiceURI;
  }
  populateVoices();
  W.speechSynthesis.addEventListener('voiceschanged', populateVoices);

  voiceSelect.addEventListener('change', () => {
    const engine = W.AO3H_TTS_Engine;
    if (engine) engine.setVoice(voiceSelect.value);
  });
  previewBtn.addEventListener('click', () => {
    const engine = W.AO3H_TTS_Engine;
    if (engine) engine.preview();
  });

  // ── Playback core ───────────────────────────────────────────────────────
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

    const utterance = engine.createUtterance(text, currentRate);
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

    // Auto-advance to next chapter
    if (cfg('autoNextChapter') ?? true) {
      const nextLink = document.querySelector('ul.work.navigation.actions li.chapter.next a, #feedback ul.actions li.chapter.next a');
      if (nextLink) {
        console.log(LOG, 'auto-advancing to next chapter');
        nextLink.click();
      }
    }
  }

  // ── Button state helpers ────────────────────────────────────────────────
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

  // ── Event listeners ─────────────────────────────────────────────────────
  playBtn.addEventListener('click', () => {
    if (isPaused) resumePlayback();
    else startPlayback();
  });
  pauseBtn.addEventListener('click', pausePlayback);
  stopBtn.addEventListener('click', stopPlayback);

  rateSlider.addEventListener('input', () => {
    currentRate = parseFloat(rateSlider.value);
    rateVal.textContent = currentRate + '×';
    lsSet(LS_RATE, currentRate);
  });

  // ── Sleep timer ─────────────────────────────────────────────────────────
  function startSleep (minutes) {
    clearSleep();
    if (!minutes) return;
    sleepEnd = Date.now() + minutes * 60000;
    lsSet(LS_SLEEP, minutes);

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
    sleepCdEl.textContent = '';
  }

  sleepSelect.addEventListener('change', () => {
    startSleep(parseInt(sleepSelect.value, 10));
  });

  // ── Stop on page change ─────────────────────────────────────────────────
  function onBeforeUnload () {
    if ((cfg('stopOnPageChange') ?? true) && isPlaying) synth.cancel();
  }
  W.addEventListener('beforeunload', onBeforeUnload);

  // ── Keyboard: Space toggles play/pause when panel focused ───────────────
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
    stopPlayback();
    panel.remove();
    fab.remove();
    W.removeEventListener('beforeunload', onBeforeUnload);
    document.removeEventListener('keydown', onKeydown);
    W.speechSynthesis.removeEventListener('voiceschanged', populateVoices);
  };
});
