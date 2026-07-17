/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Timeline › Date Annotations

Personal free-text notes attached to a specific calendar date on the
heatmap (e.g. "holiday binge-read"), independent of any single work.

═══════════════════════════════════════════════════════════════════════════ */

const KEY = 'ao3h:readingTimeline:annotations';
const MAX_LENGTH = 140;

export function loadAnnotations () {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveAnnotations (map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* unavailable */ }
}

export function getAnnotation (dateKey) {
  return loadAnnotations()[dateKey] || '';
}

/**
 * Saves (or clears, when `text` is empty) the annotation for a date.
 * @param {string} dateKey - 'YYYY-MM-DD'
 * @param {string} text
 */
export function setAnnotation (dateKey, text) {
  if (!dateKey) return;
  const map = loadAnnotations();
  const trimmed = String(text || '').trim().slice(0, MAX_LENGTH);
  if (trimmed) map[dateKey] = trimmed;
  else delete map[dateKey];
  saveAnnotations(map);
}

export function clearAnnotation (dateKey) {
  setAnnotation(dateKey, '');
}
