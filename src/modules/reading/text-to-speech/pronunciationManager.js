/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Pronunciation Manager Submodule
    Submodule ID: textToSpeech/pronunciationManager
    Display Name: Pronunciation Manager
    Source Module: Text To Speech

    Features:
        - Custom pronunciation dictionary stored in localStorage
        - Text pre-processing: replaces hard-to-pronounce words before TTS
        - Import / export dictionary as JSON
        - Applies rules to sentence text before speechEngine creates utterances

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'pronunciationManager';
const LOG = `[AO3H][${MOD}]`;

function shared () { return W.AO3H_TextToSpeech || null; }
function lsGet (k) { const s = shared(); return s ? s.lsGet(k) : null; }
function lsSet (k, v) { const s = shared(); if (s) s.lsSet(k, v); }

const LS_DICT = `${NS}:tts:pronunciations`;

function isWorkPage () { return /^\/works\/\d+/.test(location.pathname); }

register(MOD, { title: 'Pronunciation Manager', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};

  function loadDict () { return lsGet(LS_DICT) || []; }
  function saveDict (arr) { lsSet(LS_DICT, arr); }

  function escapeRegex (str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── Apply pronunciation rules to a sentence ─────────────────────────────
  function applyPronunciations (text) {
    const dict = loadDict();
    if (!dict.length) return text;
    let result = text;
    for (const entry of dict) {
      if (!entry.find) continue;
      try {
        const pattern = new RegExp(escapeRegex(entry.find), 'gi');
        result = result.replace(pattern, entry.replace || '');
      } catch { /* bad pattern — skip */ }
    }
    return result;
  }

  function addEntry (find, replace) {
    const dict = loadDict();
    const existing = dict.find(e => e.find === find);
    if (existing) {
      existing.replace = replace;
    } else {
      dict.push({ find, replace });
    }
    saveDict(dict);
  }

  function removeEntry (find) {
    const dict = loadDict().filter(e => e.find !== find);
    saveDict(dict);
  }

  function exportDict () {
    const blob = new Blob(
      [JSON.stringify(loadDict(), null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ao3h-tts-pronunciations.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importDict (jsonStr) {
    try {
      const arr = JSON.parse(jsonStr);
      if (Array.isArray(arr)) { saveDict(arr); return true; }
    } catch { /* invalid */ }
    return false;
  }

  // ── Public API ──────────────────────────────────────────────────────────
  W.AO3H_TTS_Pronunciation = {
    applyPronunciations,
    loadDict,
    saveDict,
    addEntry,
    removeEntry,
    exportDict,
    importDict,
  };

  console.log(LOG, 'init — dict entries:', loadDict().length);
  return function cleanup () { delete W.AO3H_TTS_Pronunciation; };
});
