/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Personal Ratings

Five-star personal ratings, stored locally per work id — independent from
tags, notes, and anything sent to AO3.

═══════════════════════════════════════════════════════════════════════════ */

export const RATINGS_KEY = 'ao3h:bookmarkVault:ratings';

function _load (storage) {
  try {
    const data = JSON.parse(storage.getItem(RATINGS_KEY) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

/** @returns {number} 0 when unrated, else 1–5 */
export function getRating (wid, storage = localStorage) {
  const value = _load(storage)[wid];
  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : 0;
}

/** Set 1–5; 0 (or clicking the current value) removes the rating. */
export function setRating (wid, value, storage = localStorage) {
  const data = _load(storage);
  if (Number.isInteger(value) && value >= 1 && value <= 5) data[wid] = value;
  else delete data[wid];
  try { storage.setItem(RATINGS_KEY, JSON.stringify(data)); } catch {}
}

/**
 * Builds the interactive ★★★★★ widget for a work.
 * Clicking the current rating clears it.
 */
export function buildStarsEl (wid, doc = document, storage = localStorage) {
  const wrap = doc.createElement('span');
  wrap.className = 'ao3h-bv-stars';
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', 'Personal rating');

  const paint = () => {
    const current = getRating(wid, storage);
    wrap.querySelectorAll('.ao3h-bv-star').forEach((star, i) => {
      star.textContent = i < current ? '★' : '☆';
      star.classList.toggle('ao3h-bv-star--on', i < current);
    });
    wrap.title = current ? `Personal rating: ${current}/5 (click the same star to clear)` : 'Personal rating';
  };

  for (let i = 1; i <= 5; i++) {
    const star = doc.createElement('button');
    star.type = 'button';
    star.className = 'ao3h-bv-star';
    star.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
    star.addEventListener('click', (e) => {
      e.preventDefault();
      const current = getRating(wid, storage);
      setRating(wid, current === i ? 0 : i, storage);
      paint();
    });
    wrap.appendChild(star);
  }
  paint();
  return wrap;
}
