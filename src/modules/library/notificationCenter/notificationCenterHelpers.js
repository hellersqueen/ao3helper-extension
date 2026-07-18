/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Notification Center › Helpers

Pure logic behind the feed's date grouping, digest summaries, priority
computation, and snoozing, plus the (DOM-parsing but side-effect-free)
extraction of subscribed work IDs from a fetched AO3 subscriptions page.
Kept separate from notificationCenter.js so these rules can be tested
without the module's fetch/localStorage/DOM lifecycle harness.

═══════════════════════════════════════════════════════════════════════════ */

import { findAllBlurbs, extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay (ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Which recency bucket a feed item's timestamp falls into, relative to `now`. */
export function bucketLabel (ts, now = Date.now()) {
  const diffDays = Math.round((startOfDay(now) - startOfDay(ts)) / DAY_MS);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'This week';
  return 'Older';
}

/**
 * Groups feed items into ordered recency buckets (Today / Yesterday / This
 * week / Older), dropping empty buckets. Items keep their relative order
 * within a bucket.
 */
export function groupByBucket (items, now = Date.now()) {
  const order = ['Today', 'Yesterday', 'This week', 'Older'];
  const buckets = new Map(order.map((label) => [label, []]));
  items.forEach((item) => buckets.get(bucketLabel(item.ts, now)).push(item));
  return order
    .map((label) => ({ label, items: buckets.get(label) }))
    .filter((group) => group.items.length > 0);
}

/**
 * A feed item's priority: 'high' for a completion celebration or an
 * unusually large chapter jump, 'normal' otherwise.
 * @param {{completedNow?: boolean, delta?: number}} [info]
 */
export function computePriority ({ completedNow, delta } = {}) {
  if (completedNow) return 'high';
  if ((delta || 0) >= 3) return 'high';
  return 'normal';
}

/** Whether a feed item is currently snoozed (hidden until `snoozedUntil`). */
export function isSnoozed (item, now = Date.now()) {
  return Number.isFinite(item?.snoozedUntil) && item.snoozedUntil > now;
}

/** Timestamp `hours` from now, for setting a `snoozedUntil` value. */
export function snoozeUntil (hours, now = Date.now()) {
  return now + hours * 60 * 60 * 1000;
}

function daysSinceEpoch (ts) {
  return Math.floor(ts / DAY_MS);
}

/** Digest bucket key for a timestamp: one per calendar day or per 7-day window. */
export function periodKey (ts, mode) {
  const days = daysSinceEpoch(ts);
  return mode === 'weekly' ? `w${Math.floor(days / 7)}` : `d${days}`;
}

/**
 * Collapses feed items into one summary per day/week: how many updates, how
 * many completions, and how many distinct works were involved. Returns null
 * when digests are off (mode is anything other than 'daily'/'weekly') so
 * callers can fall back to the normal per-item view without a branch of
 * their own.
 * @param {Array<{ts:number, wid:string, completedNow:boolean}>} items
 * @param {'off'|'daily'|'weekly'} mode
 */
export function buildDigest (items, mode) {
  if (mode !== 'daily' && mode !== 'weekly') return null;

  const groups = new Map();
  items.forEach((item) => {
    const key = periodKey(item.ts, mode);
    if (!groups.has(key)) groups.set(key, { key, ts: item.ts, updateCount: 0, finishedCount: 0, works: new Set() });
    const g = groups.get(key);
    g.updateCount += 1;
    if (item.completedNow) g.finishedCount += 1;
    g.works.add(item.wid);
    if (item.ts > g.ts) g.ts = item.ts;
  });

  return Array.from(groups.values())
    .sort((a, b) => b.ts - a.ts)
    .map(({ key, ts, updateCount, finishedCount, works }) => ({
      key, ts, updateCount, finishedCount, workCount: works.size,
    }));
}

/** Work IDs found in a fetched AO3 subscriptions listing page. */
export function parseSubscribedWorkIds (html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const ids = new Set();
  findAllBlurbs(doc).forEach((blurb) => {
    const id = extractWorkIdFromBlurb(blurb);
    if (id) ids.add(id);
  });
  return Array.from(ids);
}
