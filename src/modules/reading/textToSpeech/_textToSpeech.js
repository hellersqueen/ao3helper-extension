/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Text To Speech Coordinator

    Module ID: textToSpeech
    Display Name: Text To Speech
    Tab: Reading

    Purpose

    Coordinates work-text extraction, speech synthesis, playback controls,
    visual reading feedback, and custom pronunciation handling.

    Core responsibilities

    - readable work-content extraction and filtering
    - Web Speech API, voice selection, and utterance construction
    - playback interface, queue, rate, sleep timer, and chapter advancement

    Optional child modules

    - visualFeedback.js: current-text highlighting and automatic scrolling
    - pronunciationManager.js: persistent pronunciation replacements

    Notes

    - `AO3H_TextToSpeech` exposes shared storage, configuration, and splitting.
    - Voice, rate, sleep timer, and pronunciation preferences persist locally.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from "../../../core/lifecycle.js";
import { getGlobalWindow } from "../../../../lib/utils/globals.js";
import { css, lsGet, lsSet, onReady } from "../../../../lib/utils/index.js";
import { makeCfg } from "../../../../lib/storage/module-settings.js";
import { isWorkPage, findPrevNextLinks } from "../../../../lib/ao3/parsers.js";
import { showToast, clearAllToasts } from "../../../../lib/ui/toast.js";
import styles from "./textToSpeech.css?inline";

import "./visualFeedback.js";
import "./pronunciationManager.js";

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, "ao3h-textToSpeech");

const W = getGlobalWindow();
const NS = "ao3h";
const MOD = "textToSpeech";

const DEFAULTS = {
  voice: "",
  playbackSpeed: 1,
  volume: 1,
  pitch: 1,
  stopOnPageChange: true,
  autoNextChapter: true,
  confirmNextChapter: false,
  notifyChapterEnd: false,
  highlightSentence: true,
  highlightColor: "#fff3b0",
  autoScroll: true,
  scrollSpeed: "normal",
  skipAuthorNotes: true,
  skipSummary: true,
  floatingPanel: true,
};

const cfg = makeCfg(MOD, DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
}

export const SPEED_PRESETS = {
  comfortable: 0.85,
  normal: 1,
  fast: 1.25,
  audiobook: 1.5,
};
export const SCROLL_DURATIONS = { slow: 900, normal: 450, fast: 200 };

export function clampRange(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
export function clampVolume(value) {
  return clampRange(value, 0, 1, 1);
}
export function clampPitch(value) {
  return clampRange(value, 0, 2, 1);
}
export function computeFadeFactor(remainingMs, fadeMs) {
  if (!fadeMs || remainingMs === null || remainingMs === undefined) return 1;
  if (remainingMs >= fadeMs) return 1;
  if (remainingMs <= 0) return 0;
  return remainingMs / fadeMs;
}
export function nextSleepEnd(currentEnd, extraMinutes, now = Date.now()) {
  const base = currentEnd && currentEnd > now ? currentEnd : now;
  return base + extraMinutes * 60000;
}
export function clampSentenceIndex(index, length) {
  if (length <= 0) return 0;
  return Math.min(length - 1, Math.max(0, index));
}
export function getScrollDuration(speed) {
  return SCROLL_DURATIONS[speed] ?? SCROLL_DURATIONS.normal;
}
export function easeInOutQuad(t) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? 2 * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 2) / 2;
}
export function computeScrollY(startY, targetY, elapsedMs, durationMs) {
  if (durationMs <= 0) return targetY;
  return startY + (targetY - startY) * easeInOutQuad(elapsedMs / durationMs);
}
export function getVoiceLanguages(voices) {
  return [
    ...new Set((voices || []).map((voice) => voice.lang).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
}
export function filterVoicesByLang(voices, lang) {
  if (!lang) return voices || [];
  return (voices || []).filter((voice) => voice.lang === lang);
}
export function formatVoiceLabel(voice) {
  if (!voice) return "";
  const tags = [voice.localService ? "Local" : "Network"];
  if (voice.default) tags.push("Default");
  return `${voice.name} (${voice.lang}) — ${tags.join(" · ")}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL CORE — CONTENT PREPARATION
═══════════════════════════════════════════════════════════════════════════ */

function initContentPreparation() {
  const NOTES_SEL =
    ".notes, .preface .notes, .afterword .notes, #chapters .notes";
  const SUMMARY_SEL = ".preface .summary, .preface .notes";

  function extractContent() {
    const skipNotes = cfg("skipAuthorNotes") ?? true;
    const skipSummary = cfg("skipSummary") ?? true;
    const container = document.querySelector("#chapters");
    if (!container) return { sentences: [], paragraphs: [] };

    const paragraphs = [];
    for (const paragraph of container.querySelectorAll("p")) {
      if (skipNotes && paragraph.closest(NOTES_SEL)) continue;
      if (skipSummary && paragraph.closest(SUMMARY_SEL)) continue;

      const text = paragraph.textContent.trim();
      if (!text) continue;
      paragraphs.push({ el: paragraph, sentences: splitSentences(text) });
    }

    const sentences = paragraphs
      .flatMap((paragraph, paragraphIdx) =>
        paragraph.sentences.map((sentence, sentenceIdx) => ({
          text: sentence.trim(),
          paragraphIdx,
          paragraphEl: paragraph.el,
          sentenceIdx,
        })),
      )
      .filter((sentence) => sentence.text.length > 0);

    return { sentences, paragraphs };
  }

  W.AO3H_TTS_Content = { extractContent };
  return () => {
    delete W.AO3H_TTS_Content;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL CORE — SPEECH ENGINE
═══════════════════════════════════════════════════════════════════════════ */

const LS_VOICE = `${NS}:tts:voice`;
const LS_VOLUME = `${NS}:tts:volume`;
const LS_PITCH = `${NS}:tts:pitch`;

function initSpeechEngine() {
  if (!("speechSynthesis" in W)) {
    console.warn("[AO3H][textToSpeech]", "Web Speech API not supported");
    return () => {};
  }

  const synth = W.speechSynthesis;
  let voices = [];
  let selectedVoice = null;

  function loadVoices() {
    voices = synth.getVoices();
    const savedURI = lsGet(LS_VOICE) || cfg("voice") || null;
    selectedVoice = savedURI
      ? voices.find((voice) => voice.voiceURI === savedURI) || null
      : null;
  }

  function setVoice(voiceURI) {
    selectedVoice = voices.find((voice) => voice.voiceURI === voiceURI) || null;
    lsSet(LS_VOICE, voiceURI || "");
  }

  function createUtterance(text, rate, opts = {}) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate ?? cfg("playbackSpeed") ?? 1;
    utterance.volume = clampVolume(opts.volume ?? 1);
    utterance.pitch = clampPitch(opts.pitch ?? 1);
    if (selectedVoice) utterance.voice = selectedVoice;
    return utterance;
  }

  function preview(volume, pitch) {
    synth.cancel();
    synth.speak(
      createUtterance(
        "The quick brown fox jumps over the lazy dog.",
        cfg("playbackSpeed") ?? 1,
        { volume, pitch },
      ),
    );
  }

  loadVoices();
  synth.addEventListener("voiceschanged", loadVoices);
  W.AO3H_TTS_Engine = {
    getVoices: () => voices,
    setVoice,
    getSelectedVoice: () => selectedVoice,
    createUtterance,
    preview,
    synth,
  };

  return () => {
    synth.removeEventListener("voiceschanged", loadVoices);
    synth.cancel();
    delete W.AO3H_TTS_Engine;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL CORE — PLAYBACK AND PRIMARY CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

const LS_RATE = `${NS}:tts:rate`;
const LS_SLEEP = `${NS}:tts:sleepMinutes`;
const LS_LANG = `${NS}:tts:langFilter`;
const SLEEP_FADE_MS = 8000;
const SLEEP_EXTEND_MIN = 5;
const CHAPTER_FADE_CLASS = `${NS}-tts-chapter-fade`;
const CHAPTER_FADE_DELAY = 300;

function initPlaybackControls() {
  if (!("speechSynthesis" in W)) return () => {};

  const synth = W.speechSynthesis;
  let sentences = [];
  let currentIdx = 0;
  let isPlaying = false;
  let isPaused = false;
  let currentRate = parseFloat(lsGet(LS_RATE)) || cfg("playbackSpeed") || 1;
  let currentVolume = clampVolume(
    parseFloat(lsGet(LS_VOLUME)) || cfg("volume") || 1,
  );
  let currentPitch = clampPitch(
    parseFloat(lsGet(LS_PITCH)) || cfg("pitch") || 1,
  );
  let isMuted = false;
  let langFilter = lsGet(LS_LANG) || "";
  let sleepEnd = 0;
  let sleepTick = null;
  let playbackSession = 0;
  let currentUtterance = null;
  let attachActive = true;

  const panel = document.createElement("div");
  panel.className = `${NS}-tts-panel`;
  panel.style.display = "none";
  panel.setAttribute("tabindex", "-1");
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
    </div>`;

  const playBtn = panel.querySelector('[data-act="play"]');
  const pauseBtn = panel.querySelector('[data-act="pause"]');
  const stopBtn = panel.querySelector('[data-act="stop"]');
  const skipBackBtn = panel.querySelector('[data-act="skip-back"]');
  const skipForwardBtn = panel.querySelector('[data-act="skip-forward"]');
  const rateSlider = panel.querySelector(`.${NS}-tts-rate-range`);
  const rateVal = panel.querySelector(`.${NS}-tts-rate-val`);
  const presetBtns = panel.querySelectorAll(`.${NS}-tts-preset-btn`);
  const volumeSlider = panel.querySelector(`.${NS}-tts-volume-range`);
  const volumeVal = panel.querySelector(`.${NS}-tts-volume-val`);
  const muteBtn = panel.querySelector(`.${NS}-tts-mute-btn`);
  const pitchSlider = panel.querySelector(`.${NS}-tts-pitch-range`);
  const pitchVal = panel.querySelector(`.${NS}-tts-pitch-val`);
  const progressBar = panel.querySelector(`.${NS}-tts-progress-bar`);
  const closeBtn = panel.querySelector(`.${NS}-tts-close`);
  const langSelect = panel.querySelector(`.${NS}-tts-lang-filter`);
  const voiceSelect = panel.querySelector(`.${NS}-tts-voice-select`);
  const previewBtn = panel.querySelector(`.${NS}-tts-voice-preview`);
  const sleepSelect = panel.querySelector(`.${NS}-tts-sleep-row select`);
  const sleepCdEl = panel.querySelector(`.${NS}-tts-sleep-countdown`);
  const sleepExtendBtn = panel.querySelector(`.${NS}-tts-sleep-extend`);

  const fab = document.createElement("button");
  fab.className = `${NS}-tts-btn ${NS}-tts-fab`;
  fab.textContent = "🔊 Read Aloud";
  onReady(() => {
    if (!attachActive || cfg("floatingPanel") === false) return;
    document.body.appendChild(panel);
    document.body.appendChild(fab);
  });

  fab.addEventListener("click", () => {
    panel.style.display = "";
    fab.style.display = "none";
  });
  closeBtn.addEventListener("click", () => {
    stopPlayback();
    panel.style.display = "none";
    fab.style.display = "";
  });

  function populateVoices() {
    const engine = W.AO3H_TTS_Engine;
    if (!engine) return;
    const allVoices = engine.getVoices();
    const languages = getVoiceLanguages(allVoices);
    langSelect.innerHTML = '<option value="">All languages</option>';
    for (const lang of languages) {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = lang;
      langSelect.appendChild(option);
    }
    langSelect.value = languages.includes(langFilter) ? langFilter : "";

    voiceSelect.innerHTML = '<option value="">System default</option>';
    for (const voice of filterVoicesByLang(allVoices, langFilter)) {
      const option = document.createElement("option");
      option.value = voice.voiceURI;
      option.textContent = formatVoiceLabel(voice);
      voiceSelect.appendChild(option);
    }
    const selected = engine.getSelectedVoice();
    if (selected) voiceSelect.value = selected.voiceURI;
  }

  populateVoices();
  synth.addEventListener("voiceschanged", populateVoices);
  langSelect.addEventListener("change", () => {
    langFilter = langSelect.value;
    lsSet(LS_LANG, langFilter);
    populateVoices();
  });
  voiceSelect.addEventListener("change", () =>
    W.AO3H_TTS_Engine?.setVoice(voiceSelect.value),
  );
  previewBtn.addEventListener("click", () =>
    W.AO3H_TTS_Engine?.preview(currentVolume, currentPitch),
  );

  function setRate(rate, { persist = true } = {}) {
    currentRate = rate;
    rateSlider.value = String(rate);
    rateVal.textContent = `${rate}×`;
    if (persist) lsSet(LS_RATE, currentRate);
  }
  rateSlider.addEventListener("input", () =>
    setRate(parseFloat(rateSlider.value)),
  );
  for (const button of presetBtns) {
    button.addEventListener("click", () => {
      const preset = SPEED_PRESETS[button.dataset.preset];
      if (preset !== undefined) setRate(preset);
    });
  }

  volumeSlider.addEventListener("input", () => {
    currentVolume = clampVolume(parseFloat(volumeSlider.value));
    volumeVal.textContent = `${Math.round(currentVolume * 100)}%`;
    lsSet(LS_VOLUME, currentVolume);
    if (isMuted) {
      isMuted = false;
      muteBtn.textContent = "🔊";
      muteBtn.classList.remove(`${NS}-tts-active`);
    }
  });
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
    muteBtn.classList.toggle(`${NS}-tts-active`, isMuted);
  });
  pitchSlider.addEventListener("input", () => {
    currentPitch = clampPitch(parseFloat(pitchSlider.value));
    pitchVal.textContent = String(currentPitch);
    lsSet(LS_PITCH, currentPitch);
  });

  function loadSentences() {
    return W.AO3H_TTS_Content?.extractContent().sentences || [];
  }
  function updateProgress() {
    progressBar.style.width = `${sentences.length ? (currentIdx / sentences.length) * 100 : 0}%`;
  }
  function effectiveVolume() {
    if (isMuted) return 0;
    const remaining = sleepEnd ? sleepEnd - Date.now() : null;
    return clampVolume(
      currentVolume *
        computeFadeFactor(remaining, sleepEnd ? SLEEP_FADE_MS : 0),
    );
  }
  function setButtonsPlaying() {
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
  }
  function setButtonsPaused() {
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = false;
  }
  function setButtonsStopped() {
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
  }

  function speakSentence(idx, session) {
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
    const text =
      W.AO3H_TTS_Pronunciation?.applyPronunciations(info.text) || info.text;
    const utterance = engine.createUtterance(text, currentRate, {
      volume: effectiveVolume(),
      pitch: currentPitch,
    });
    currentUtterance = utterance;
    W.AO3H_TTS_Visual?.highlightSentence(info);
    utterance.onend = () => {
      if (currentUtterance === utterance) currentUtterance = null;
      if (isPlaying && session === playbackSession)
        speakSentence(idx + 1, session);
    };
    utterance.onerror = (event) => {
      if (event.error !== "interrupted")
        console.warn("[AO3H][textToSpeech]", "utterance error", event.error);
    };
    synth.speak(utterance);
  }

  function startPlayback() {
    sentences = loadSentences();
    if (!sentences.length) return;
    const session = ++playbackSession;
    isPlaying = true;
    isPaused = false;
    speakSentence(currentIdx, session);
    setButtonsPlaying();
  }
  function pausePlayback() {
    synth.pause();
    isPaused = true;
    setButtonsPaused();
  }
  function resumePlayback() {
    synth.resume();
    isPaused = false;
    setButtonsPlaying();
  }
  function clearSleep() {
    if (sleepTick) clearInterval(sleepTick);
    sleepTick = null;
    sleepEnd = 0;
    sleepCdEl.textContent = "";
    sleepExtendBtn.style.display = "none";
  }
  function stopPlayback() {
    playbackSession++;
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance = null;
    }
    synth.cancel();
    isPlaying = false;
    isPaused = false;
    currentIdx = 0;
    updateProgress();
    setButtonsStopped();
    W.AO3H_TTS_Visual?.clearHighlight();
    clearSleep();
  }
  function skipSentence(delta) {
    if (!sentences.length) return;
    const newIdx = clampSentenceIndex(currentIdx + delta, sentences.length);
    if (newIdx === currentIdx) return;
    if (!isPlaying) {
      currentIdx = newIdx;
      updateProgress();
      return;
    }
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance = null;
    }
    synth.cancel();
    isPaused = false;
    setButtonsPlaying();
    speakSentence(newIdx, playbackSession);
  }

  function onFinished(session) {
    if (session !== playbackSession) return;
    playbackSession++;
    currentUtterance = null;
    isPlaying = false;
    currentIdx = 0;
    updateProgress();
    setButtonsStopped();
    W.AO3H_TTS_Visual?.clearHighlight();
    clearSleep();
    if (cfg("notifyChapterEnd"))
      showToast("Chapter finished reading.", { type: "info" });

    if (cfg("autoNextChapter") ?? true) {
      const nextLink = findPrevNextLinks(document).next;
      if (nextLink) {
        const proceed = cfg("confirmNextChapter")
          ? confirm("Continue to the next chapter?")
          : true;
        if (proceed) {
          document.body.classList.add(CHAPTER_FADE_CLASS);
          setTimeout(() => nextLink.click(), CHAPTER_FADE_DELAY);
        }
      }
    }
  }

  skipBackBtn.addEventListener("click", () => skipSentence(-1));
  skipForwardBtn.addEventListener("click", () => skipSentence(1));
  playBtn.addEventListener("click", () =>
    isPaused ? resumePlayback() : startPlayback(),
  );
  pauseBtn.addEventListener("click", pausePlayback);
  stopBtn.addEventListener("click", stopPlayback);

  function startSleep(minutes) {
    clearSleep();
    if (!minutes) return;
    sleepEnd = Date.now() + minutes * 60000;
    lsSet(LS_SLEEP, minutes);
    sleepExtendBtn.style.display = "";
    sleepTick = setInterval(() => {
      const remaining = Math.max(0, sleepEnd - Date.now());
      if (remaining <= 0) {
        stopPlayback();
        return;
      }
      const minutesLeft = Math.floor(remaining / 60000);
      const secondsLeft = Math.floor((remaining % 60000) / 1000);
      sleepCdEl.textContent = `${minutesLeft}:${String(secondsLeft).padStart(2, "0")}`;
    }, 1000);
  }
  sleepSelect.addEventListener("change", () =>
    startSleep(parseInt(sleepSelect.value, 10)),
  );
  sleepExtendBtn.addEventListener("click", () => {
    if (sleepEnd) sleepEnd = nextSleepEnd(sleepEnd, SLEEP_EXTEND_MIN);
  });

  function onBeforeUnload() {
    if ((cfg("stopOnPageChange") ?? true) && isPlaying) synth.cancel();
  }
  function onKeydown(event) {
    if (
      event.code !== "Space" ||
      !document.activeElement?.closest(`.${NS}-tts-panel`)
    )
      return;
    event.preventDefault();
    if (isPlaying && !isPaused) pausePlayback();
    else if (isPaused) resumePlayback();
    else startPlayback();
  }
  W.addEventListener("beforeunload", onBeforeUnload);
  document.addEventListener("keydown", onKeydown);

  return () => {
    attachActive = false;
    stopPlayback();
    document.body.classList.remove(CHAPTER_FADE_CLASS);
    clearAllToasts();
    panel.remove();
    fab.remove();
    W.removeEventListener("beforeunload", onBeforeUnload);
    document.removeEventListener("keydown", onKeydown);
    synth.removeEventListener("voiceschanged", populateVoices);
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: "Text To Speech", enabledByDefault: false },
  async function init() {
    W.AO3H_TextToSpeech = {
      lsGet,
      lsSet,
      cfg,
      splitSentences,
      NS,
      DEFAULTS,
      SPEED_PRESETS,
      clampVolume,
      clampPitch,
      computeFadeFactor,
      nextSleepEnd,
      clampSentenceIndex,
      getScrollDuration,
      computeScrollY,
      getVoiceLanguages,
      filterVoicesByLang,
      formatVoiceLabel,
    };

    const coreCleanups = [];
    if (isWorkPage()) {
      coreCleanups.push(initContentPreparation());
      coreCleanups.push(initSpeechEngine());
      coreCleanups.push(initPlaybackControls());
    }

    return function cleanup() {
      for (const dispose of coreCleanups.reverse()) dispose();
      delete W.AO3H_TextToSpeech;
    };
  },
);
