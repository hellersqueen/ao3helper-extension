/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Timeline › Filter Presets

Named, saved advanced-filter criteria so a favorite search can be reapplied
later without re-entering every field.

═══════════════════════════════════════════════════════════════════════════ */

const KEY = 'ao3h:readingTimeline:filterPresets';
const MAX_PRESETS = 20;

export function loadPresets () {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function savePresets (list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* unavailable */ }
}

/**
 * Saves a named preset, replacing any existing preset with the same name.
 * @param {string} name
 * @param {Object} criteria - the filter criteria object to restore later
 */
export function savePreset (name, criteria) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return;
  const list = loadPresets().filter(p => p.name !== trimmed);
  list.push({ name: trimmed, criteria });
  if (list.length > MAX_PRESETS) list.shift();
  savePresets(list);
}

export function getPreset (name) {
  return loadPresets().find(p => p.name === name) || null;
}

export function deletePreset (name) {
  savePresets(loadPresets().filter(p => p.name !== name));
}
