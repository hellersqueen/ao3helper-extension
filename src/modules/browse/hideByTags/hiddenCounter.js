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
 * `onRescan` (optional) adds a "↻ Re-scan" button that re-runs the filters
 * without reloading the page.
 */
export function renderHiddenCounter ({ doc, NS, count, enabled, el, onRescan }) {
  if (!enabled || count === 0) {
    el?.remove();
    return null;
  }

  if (!el || !el.isConnected) {
    el = doc.createElement('div');
    el.className = `${NS}-hbt-counter`;
    doc.querySelector('#main')?.prepend(el);
  }

  let text = el.querySelector(`.${NS}-hbt-counter-text`);
  if (!text) {
    text = doc.createElement('span');
    text.className = `${NS}-hbt-counter-text`;
    el.textContent = '';
    el.appendChild(text);
  }
  text.textContent = `🚫 ${count} work${count === 1 ? '' : 's'} hidden because of your tag filters`;

  if (typeof onRescan === 'function' && !el.querySelector(`.${NS}-hbt-rescan`)) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = `${NS}-hbt-rescan`;
    btn.textContent = '↻ Re-scan';
    btn.title = 'Re-check every work on this page against your filters';
    btn.addEventListener('click', () => onRescan());
    el.appendChild(btn);
  }
  return el;
}
