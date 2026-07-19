/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer › Series Grouping Helpers

Pure logic for sorting series groups by how much of each series the user has
actually read, cross-referencing each group's work IDs against readingTracker's
visit history instead of just keeping page order.

═══════════════════════════════════════════════════════════════════════════ */

/**
 * Attach a `readCount` to each group: how many of its works appear in the
 * set of already-visited work IDs.
 * @template {{workIds:string[]}} T
 * @param {T[]} groups
 * @param {Set<string>} readWorkIds
 * @returns {(T & {readCount:number})[]}
 */
export function withReadCounts (groups, readWorkIds) {
  return groups.map(g => ({
    ...g,
    readCount: g.workIds.filter(id => readWorkIds.has(id)).length,
  }));
}

/**
 * Sort groups by real reading history (most-read series first), falling
 * back to their original relative order for ties (stable sort).
 * @template {{workIds:string[]}} T
 * @param {T[]} groups
 * @param {Set<string>} readWorkIds
 * @returns {(T & {readCount:number})[]}
 */
export function sortGroupsByReadHistory (groups, readWorkIds) {
  return withReadCounts(groups, readWorkIds)
    .map((g, i) => ({ g, i }))
    .sort((a, b) => b.g.readCount - a.g.readCount || a.i - b.i)
    .map(({ g }) => g);
}
