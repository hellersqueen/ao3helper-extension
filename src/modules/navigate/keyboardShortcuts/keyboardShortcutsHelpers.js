/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Keyboard Shortcuts › Helpers

Pure logic behind combo parsing/matching, conflict detection, the shortcut
guide's category grouping and label fallback, and the page-jump math used by
the "jump N pages" shortcuts. Kept separate from keyboardShortcuts.js so this
can be tested without a real `document`/`KeyboardEvent` harness.

═══════════════════════════════════════════════════════════════════════════ */

/** Parses a "Ctrl+Shift+K" style combo string into its parts. */
export function parseCombo (str) {
  const parts = String(str || '').split('+');
  return {
    ctrl:  parts.includes('Ctrl'),
    shift: parts.includes('Shift'),
    alt:   parts.includes('Alt'),
    key:   parts[parts.length - 1],
  };
}

/** Inverse of parseCombo: rebuilds the canonical "Ctrl+Shift+K" string. */
export function comboToString (combo) {
  return [combo.ctrl && 'Ctrl', combo.shift && 'Shift', combo.alt && 'Alt', combo.key]
    .filter(Boolean).join('+');
}

/**
 * Whether a KeyboardEvent-like object matches a parsed combo. A combo with
 * no Shift but a single printable character (e.g. "?") also accepts the
 * transformed-printable event AO3H's own "?" default relies on, since
 * `event.key` already reflects the shifted character regardless of the
 * combo's own Shift flag.
 * @param {{ctrl:boolean, shift:boolean, alt:boolean, key:string}} combo
 * @param {{key:string, ctrlKey:boolean, shiftKey:boolean, altKey:boolean}} e
 */
export function matchesEvent (combo, e) {
  const transformedPrintable = !combo.shift && combo.key.length === 1 && e.key === combo.key;
  return e.key === combo.key &&
         e.ctrlKey  === combo.ctrl &&
         (e.shiftKey === combo.shift || transformedPrintable) &&
         e.altKey   === combo.alt;
}

/**
 * Detects combo collisions across a resolved action → keyStr map.
 * @param {Record<string, string>} map
 * @returns {{ conflicting: Set<string>, groups: Array<{key:string, actions:string[]}> }}
 *   `conflicting` is every action sharing a combo with at least one other;
 *   `groups` is one entry per colliding combo, for logging/reporting.
 */
export function detectConflicts (map) {
  const byCombo = new Map();
  for (const [action, keyStr] of Object.entries(map)) {
    const key = comboToString(parseCombo(keyStr));
    if (!byCombo.has(key)) byCombo.set(key, []);
    byCombo.get(key).push(action);
  }
  const conflicting = new Set();
  const groups = [];
  for (const [key, actions] of byCombo) {
    if (actions.length < 2) continue;
    actions.forEach((a) => conflicting.add(a));
    groups.push({ key, actions });
  }
  return { conflicting, groups };
}

/** Which category an action belongs to, given a { Category: [actions] } map. */
export function categoryFor (action, categories) {
  for (const [category, actions] of Object.entries(categories)) {
    if (actions.includes(action)) return category;
  }
  return 'Other';
}

/** Groups a resolved action → keyStr map into { Category: [[action, key], ...] }. */
export function groupByCategory (map, categories) {
  const grouped = {};
  for (const [action, key] of Object.entries(map)) {
    const category = categoryFor(action, categories);
    (grouped[category] ||= []).push([action, key]);
  }
  return grouped;
}

/** Human label for an action: the configured label, or a humanized fallback. */
export function actionLabel (action, labels) {
  if (labels[action]) return labels[action];
  return action.replace(/[_/]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

/**
 * Clamps a "jump N pages" move within [1, max]. Returns null when the move
 * wouldn't actually change the page (already at that bound), so callers can
 * treat that as "nothing to do" without a separate comparison.
 * @param {number} current
 * @param {number} delta - Signed page count to move by
 * @param {number} max
 * @returns {number|null}
 */
export function clampPageJump (current, delta, max) {
  const upper = Number.isFinite(max) ? max : Infinity;
  const target = Math.min(Math.max(current + delta, 1), upper);
  return target === current ? null : target;
}
