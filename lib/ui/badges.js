/* ═══════════════════════════════════════════════════════════════════════════
   SHARED BADGES

   Reusable badge builders for chapter details, engagement ratios, and work
   statuses. Each helper keeps its own small responsibility while sharing one
   import location.
═══════════════════════════════════════════════════════════════════════════ */


/* ── Chapter badge ─────────────────────────────────────────────────────── */

const CHAPTER_BADGE_CLASS = 'ao3h-chapter-badge';
const CHAPTER_PART_ORDER = ['words', 'time'];
const partsByBadge = new WeakMap();

function renderChapterBadge(badge) {
  const parts = partsByBadge.get(badge);
  badge.textContent = CHAPTER_PART_ORDER
    .filter(key => parts.has(key))
    .map(key => parts.get(key))
    .join(' · ');
}

export function upsertChapterBadgePart(afterEl, partKey, text) {
  if (!afterEl) return null;
  let badge = afterEl.nextElementSibling;
  if (!badge?.classList?.contains(CHAPTER_BADGE_CLASS)) {
    badge = document.createElement('div');
    badge.className = CHAPTER_BADGE_CLASS;
    afterEl.insertAdjacentElement('afterend', badge);
  }
  if (!partsByBadge.has(badge)) partsByBadge.set(badge, new Map());
  partsByBadge.get(badge).set(partKey, text);
  renderChapterBadge(badge);
  return badge;
}

export function removeChapterBadgePartsByKey(partKey) {
  document.querySelectorAll(`.${CHAPTER_BADGE_CLASS}`).forEach(badge => {
    const parts = partsByBadge.get(badge);
    if (!parts) {
      badge.remove();
      return;
    }
    parts.delete(partKey);
    if (parts.size === 0) {
      partsByBadge.delete(badge);
      badge.remove();
    } else {
      renderChapterBadge(badge);
    }
  });
}


/* ── Engagement badge ──────────────────────────────────────────────────── */

export const ENGAGEMENT_BADGE_CLASS = 'ao3h-engagement-badge';
export const RATIO_BADGE_CLASS = 'ao3h-engagement-badge--ratio';

export function buildKudosRatioBadge(stats, { colorCode = false } = {}) {
  const { kudos, hits } = stats;
  if (kudos == null || !hits) return null;
  const ratio = (kudos / hits) * 100;

  const badge = document.createElement('span');
  badge.className = `${ENGAGEMENT_BADGE_CLASS} ${RATIO_BADGE_CLASS}`;
  if (colorCode) {
    badge.classList.add(ratio >= 20 ? 'ao3h-metric-high' : ratio >= 8 ? 'ao3h-metric-mid' : 'ao3h-metric-low');
  }
  badge.textContent = `${ratio.toFixed(1)}% ❤️/👁️`;
  badge.title = `${kudos.toLocaleString()} kudos / ${hits.toLocaleString()} hits`;
  return badge;
}


/* ── Status badge ──────────────────────────────────────────────────────── */

export function appendHeadingBadge(blurb, { className, text, title = '', guardSelector = null }) {
  if (!blurb) return null;
  const guard = guardSelector || `.${String(className).split(/\s+/)[0]}`;
  if (blurb.querySelector(guard)) return null;
  const heading = blurb.querySelector('h4.heading');
  if (!heading) return null;
  const badge = document.createElement('span');
  badge.className = className;
  badge.textContent = text;
  if (title) {
    badge.title = title;
    badge.setAttribute('aria-label', title);
  }
  heading.appendChild(badge);
  return badge;
}
