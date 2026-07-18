/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker › Preferences

Parses the user's preferred-POV setting (comma-separated key list, same
convention as workLength's customBooks lines) for the auto-apply filter
feature.

═══════════════════════════════════════════════════════════════════════════ */

export const VALID_POV_KEYS = ['first', 'second', 'third', 'mixed', 'multi', 'unknown'];

/**
 * Parses a comma-separated "preferredPovs" setting into a list of valid POV
 * keys, ignoring blanks, whitespace, casing, and unknown keys.
 * @param {string} raw
 * @returns {string[]}
 */
export function parsePreferredPovs (raw) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => VALID_POV_KEYS.includes(s));
}
