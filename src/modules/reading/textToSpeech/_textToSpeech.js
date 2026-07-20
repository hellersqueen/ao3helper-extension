/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Text To Speech Coordinator

    Module ID: textToSpeech
    Display Name: Text To Speech
    Tab: Reading

    Purpose

    Coordinates work-text extraction, speech synthesis, playback controls,
    visual reading feedback, and custom pronunciation handling.

    Submodules

    - speechEngine.js: Web Speech API and voice selection
    - playbackControls.js: playback interface, rate, and sleep timer
    - visualFeedback.js: current-text highlighting and automatic scrolling
    - contentFiltering.js: readable sentence extraction and filtering
    - pronunciationManager.js: persistent pronunciation replacements

    Notes

    - `AO3H_TextToSpeech` exposes shared storage, configuration, and splitting.
    - Voice, rate, sleep timer, and pronunciation preferences persist locally.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './textToSpeech.css?inline';

import './speechEngine.js';
import './playbackControls.js';
import './visualFeedback.js';
import './contentFiltering.js';
import './pronunciationManager.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-textToSpeech');

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'textToSpeech';

const DEFAULTS = {
  voice:              '',
  playbackSpeed:      1,
  volume:             1,
  pitch:              1,
  stopOnPageChange:   true,
  autoNextChapter:    true,
  confirmNextChapter: false,
  notifyChapterEnd:   false,
  highlightSentence:  true,
  highlightColor:     '#fff3b0',
  autoScroll:         true,
  scrollSpeed:        'normal',
  skipAuthorNotes:    true,
  skipSummary:        true,
  floatingPanel:      true,
};

const cfg = makeCfg(MOD, DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function splitSentences (text) {
  return text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
}

export const SPEED_PRESETS = { comfortable: 0.85, normal: 1, fast: 1.25, audiobook: 1.5 };
export const SCROLL_DURATIONS = { slow: 900, normal: 450, fast: 200 };

export function clampRange (value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
export function clampVolume (value) { return clampRange(value, 0, 1, 1); }
export function clampPitch (value) { return clampRange(value, 0, 2, 1); }
export function computeFadeFactor (remainingMs, fadeMs) {
  if (!fadeMs || remainingMs === null || remainingMs === undefined) return 1;
  if (remainingMs >= fadeMs) return 1;
  if (remainingMs <= 0) return 0;
  return remainingMs / fadeMs;
}
export function nextSleepEnd (currentEnd, extraMinutes, now = Date.now()) {
  const base = currentEnd && currentEnd > now ? currentEnd : now;
  return base + extraMinutes * 60000;
}
export function clampSentenceIndex (index, length) {
  if (length <= 0) return 0;
  return Math.min(length - 1, Math.max(0, index));
}
export function getScrollDuration (speed) {
  return SCROLL_DURATIONS[speed] ?? SCROLL_DURATIONS.normal;
}
export function easeInOutQuad (t) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5 ? 2 * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 2) / 2;
}
export function computeScrollY (startY, targetY, elapsedMs, durationMs) {
  if (durationMs <= 0) return targetY;
  return startY + (targetY - startY) * easeInOutQuad(elapsedMs / durationMs);
}
export function getVoiceLanguages (voices) {
  return [...new Set((voices || []).map(voice => voice.lang).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}
export function filterVoicesByLang (voices, lang) {
  if (!lang) return voices || [];
  return (voices || []).filter(voice => voice.lang === lang);
}
export function formatVoiceLabel (voice) {
  if (!voice) return '';
  const tags = [voice.localService ? 'Local' : 'Network'];
  if (voice.default) tags.push('Default');
  return `${voice.name} (${voice.lang}) — ${tags.join(' · ')}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Text To Speech', enabledByDefault: false },
  async function init () {
    W.AO3H_TextToSpeech = {
      lsGet, lsSet, cfg, splitSentences, NS, DEFAULTS,
      SPEED_PRESETS, clampVolume, clampPitch, computeFadeFactor,
      nextSleepEnd, clampSentenceIndex, getScrollDuration, computeScrollY,
      getVoiceLanguages, filterVoicesByLang, formatVoiceLabel,
    };
    return function cleanup () {
      delete W.AO3H_TextToSpeech;
    };
  }
);
