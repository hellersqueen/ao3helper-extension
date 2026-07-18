/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Actions › Helpers

Pure helpers behind the icon-only button mode and the bottom-subscribe
placement choice: icon lookup for a given action key, and resolution of the
container element used when the duplicated Subscribe button is placed at the
very end of the page instead of next to the kudos button.

═══════════════════════════════════════════════════════════════════════════ */

export const ACTION_ICONS = {
  bookmark: '🔖',
  mark: '✅',
  share: '📤',
  subscribe: '🔔',
  download: '⬇️',
  comments: '💬',
};

/** Icon for a reorderable action button key, falling back to a neutral dot. */
export function getActionIcon (key) {
  return ACTION_ICONS[key] || '•';
}

/**
 * Container to append the bottom Subscribe clone into when the user picked
 * "very end of the page". Returns null for any other position (the caller
 * falls back to inserting next to the kudos button) or when `#main` is
 * missing from the document.
 */
export function resolveBottomSubscribeContainer (doc, position) {
  if (position !== 'pageEnd') return null;
  return doc.querySelector('#main') || null;
}
