/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Hide By Tags: Hidden Works Counter

    Counts how many blurbs are currently folded or dimmed by hideByTags, and
    renders/updates a small banner above the results announcing the count.

═══════════════════════════════════════════════════════════════════════════ */

/** How many blurbs are currently folded (wrapped) or dimmed. */
export function countHiddenBlurbs (blurbs, NS) {
  return blurbs.filter(b =>
    b.classList.contains(`${NS}-wrapped`) || b.classList.contains(`${NS}-dimmed`)
  ).length;
}

/**
 * Create, update, or remove the "X works hidden" banner above #main.
 * Returns the (possibly new, possibly null) element to keep as state.
 */
export function renderHiddenCounter ({ doc, NS, count, enabled, el }) {
  if (!enabled || count === 0) {
    el?.remove();
    return null;
  }

  if (!el || !el.isConnected) {
    el = doc.createElement('div');
    el.className = `${NS}-hbt-counter`;
    doc.querySelector('#main')?.prepend(el);
  }
  el.textContent = `🚫 ${count} work${count === 1 ? '' : 's'} hidden because of your tag filters`;
  return el;
}
