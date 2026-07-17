/* ═══════════════════════════════════════════════════════════════════════════
   skipWorks — hiddenWorksMirror

   Cross-device sync for the hidden-works list. skipWorks stores its data in
   IndexedDB, but backupAndSync (backupOperations.js / dataTransfer.js /
   cloudSync.js) only ever scans localStorage for keys containing "ao3h" —
   it has no IndexedDB support and no plugin/registry mechanism to add any.

   Rather than have skipWorks import backupAndSync (this codebase's modules
   never import each other directly — each stays self-contained), we mirror
   the hidden-works list into a plain localStorage key. backupAndSync then
   picks it up automatically through its existing generic scan, with zero
   changes needed on its side. On the next page load (possibly on another
   device, after a cloud sync round-trip), the mirror is merged back into
   IndexedDB — see mergeWorkLists().
═══════════════════════════════════════════════════════════════════════════ */

export function buildMirrorKey(username) {
  return `ao3h:skipWorks:hiddenWorksMirror:${username}`;
}

export function saveMirror(username, works) {
  try { localStorage.setItem(buildMirrorKey(username), JSON.stringify(works || [])); } catch { /* quota */ }
}

export function loadMirror(username) {
  try {
    const arr = JSON.parse(localStorage.getItem(buildMirrorKey(username)));
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

// Per-workId merge of the local IndexedDB records against the (possibly
// remote, possibly stale) localStorage mirror: the record with the newer
// `updatedAt` wins; ties keep the local copy. Records without `updatedAt`
// (written before this feature existed) count as timestamp 0.
export function mergeWorkLists(local, remote) {
  const map = new Map();
  for (const rec of (local || [])) {
    if (rec?.workId) map.set(rec.workId, rec);
  }
  for (const rec of (remote || [])) {
    if (!rec?.workId) continue;
    const existing = map.get(rec.workId);
    if (!existing || (rec.updatedAt || 0) > (existing.updatedAt || 0)) {
      map.set(rec.workId, rec);
    }
  }
  return Array.from(map.values());
}
