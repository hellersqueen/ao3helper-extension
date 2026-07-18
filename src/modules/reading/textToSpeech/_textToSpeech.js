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

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
