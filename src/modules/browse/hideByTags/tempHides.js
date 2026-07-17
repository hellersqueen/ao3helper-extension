/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Hide By Tags › Temporary Hides

Day-scoped tag hides: a tag hidden with Shift+click on the 🚫 icon is
filtered only until the end of the current day, without ever entering the
permanent blacklist. Expired entries are purged on every read.

═══════════════════════════════════════════════════════════════════════════ */

export const TEMP_HIDES_KEY = 'ao3h:hideByTags:tempHides';

/** Timestamp of the last millisecond of the day containing `now`. */
export function endOfDay (now = Date.now()) {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function _load (storage) {
  try {
    const data = JSON.parse(storage.getItem(TEMP_HIDES_KEY) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

function _save (storage, data) {
  try { storage.setItem(TEMP_HIDES_KEY, JSON.stringify(data)); } catch {}
}

/** Hides `tag` until the end of the current day. */
export function addTempHide (tag, storage = localStorage, now = Date.now()) {
  const canon = String(tag || '').trim().toLowerCase();
  if (!canon) return;
  const data = _load(storage);
  data[canon] = endOfDay(now);
  _save(storage, data);
}

/** Removes a temporary hide before its expiry. */
export function removeTempHide (tag, storage = localStorage) {
  const data = _load(storage);
  delete data[String(tag || '').trim().toLowerCase()];
  _save(storage, data);
}

/**
 * Currently active temporary hides. Expired entries are purged from
 * storage as a side effect.
 * @returns {string[]}
 */
export function getActiveTempHides (storage = localStorage, now = Date.now()) {
  const data   = _load(storage);
  const active = [];
  let purged   = false;
  for (const [tag, expiry] of Object.entries(data)) {
    if (Number.isFinite(expiry) && expiry >= now) active.push(tag);
    else { delete data[tag]; purged = true; }
  }
  if (purged) _save(storage, data);
  return active;
}
