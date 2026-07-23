/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech › Pronunciation Manager

Applies persistent pronunciation substitutions before sentences are passed to
the speech engine and exposes dictionary-management operations.

Notes

- Dictionary entries are matched case-insensitively as escaped literal text.
- Pronunciation dictionaries can be imported or exported as JSON.
- Invalid imported data and malformed entries are ignored safely.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { lsGet, lsSet, escapeRegex } from '../../../../lib/utils/index.js';
import { isWorkPage } from '../../../../lib/ao3/parsers.js';
import { getLogger } from '../../../../lib/utils/logger.js';
const log = getLogger('pronunciationManager');

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'pronunciationManager';

function shared () { return W.AO3H_TextToSpeech || null; }

const LS_DICT = `${NS}:tts:pronunciations`;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Pronunciation Manager', parent: 'textToSpeech', enabledByDefault: true }, async function init () {
  if (!isWorkPage()) return () => {};

  function loadDict () { return lsGet(LS_DICT) || []; }
  function saveDict (arr) { lsSet(LS_DICT, arr); }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PRONUNCIATION DICTIONARY
  ═════════════════════════════════════════════════════════════════════════ */

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
    downloadJSON(loadDict(), 'ao3h-tts-pronunciations.json');
  }

  function importDict (jsonStr) {
    try {
      const arr = JSON.parse(jsonStr);
      if (Array.isArray(arr)) { saveDict(arr); return true; }
    } catch { /* invalid */ }
    return false;
  }

  W.AO3H_TTS_Pronunciation = {
    applyPronunciations,
    loadDict,
    saveDict,
    addEntry,
    removeEntry,
    exportDict,
    importDict,
  };

  log.debug('init — dict entries:', loadDict().length);
  return function cleanup () { delete W.AO3H_TTS_Pronunciation; };
});
