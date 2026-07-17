/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Vault Tools

Pure helpers for the vault features added on top of the cached bookmark
store: CSV/HTML exports, stale-bookmark detection, AND/OR note-search
queries, and the "important note" convention.

═══════════════════════════════════════════════════════════════════════════ */

const _csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/**
 * CSV export of the cached vault (one row per bookmark).
 * @param {Record<string, any>} data - ao3h:bookmarkVault:data
 * @param {Record<string, string>} [notes] - inline personal notes by work id
 */
export function vaultToCSV (data, notes = {}) {
  const rows = [['workId', 'title', 'visibility', 'bookmarkNote', 'personalNote']];
  for (const [wid, bm] of Object.entries(data || {})) {
    rows.push([wid, bm?.title || '', bm?.pub ? 'public' : 'private', bm?.notes || '', notes[wid] || '']);
  }
  return rows.map(r => r.map(_csvCell).join(',')).join('\r\n');
}

const _esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Standalone HTML export of the cached vault, links back to AO3. */
export function vaultToHTML (data, notes = {}) {
  const rows = Object.entries(data || {}).map(([wid, bm]) => `
    <tr>
      <td><a href="https://archiveofourown.org/works/${_esc(wid)}">${_esc(bm?.title || `Work ${wid}`)}</a></td>
      <td>${bm?.pub ? 'public' : 'private'}</td>
      <td>${_esc(bm?.notes || '')}</td>
      <td>${_esc(notes[wid] || '')}</td>
    </tr>`).join('');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>AO3 Bookmarks export</title>
<style>body{font-family:Georgia,serif;max-width:900px;margin:30px auto;padding:0 16px}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 10px;text-align:left}
th{background:#f5f5f5}</style></head>
<body><h1>AO3 Bookmarks (${Object.keys(data || {}).length})</h1>
<p>Exported ${new Date().toISOString().slice(0, 10)} by AO3 Helper</p>
<table><tr><th>Work</th><th>Visibility</th><th>Bookmark note</th><th>Personal note</th></tr>${rows}
</table></body></html>`;
}

/**
 * Bookmarks not opened for `months` months (or never opened at all).
 * @param {Record<string, any>} data — cached bookmarks by work id
 * @param {Record<string, number>} lastRead — last-opened timestamps by work id
 * @returns {string[]} stale work ids
 */
export function findStaleBookmarks (data, lastRead, months, now = Date.now()) {
  const m = parseInt(String(months), 10);
  if (!Number.isFinite(m) || m <= 0) return [];
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - m);
  const limit = cutoff.getTime();
  return Object.keys(data || {}).filter(wid => {
    const seen = lastRead?.[wid];
    return !Number.isFinite(seen) || seen < limit;
  });
}

/**
 * Note-search matcher with AND/OR operators:
 *   "angst && fluff"  → both required
 *   "angst || fluff"  → either suffices
 *   "angst"           → plain substring
 * Mixing operators keeps the first one found (&& wins over ||).
 */
export function noteQueryMatch (text, query) {
  const haystack = String(text || '').toLowerCase();
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  if (q.includes('&&')) {
    return q.split('&&').map(s => s.trim()).filter(Boolean).every(part => haystack.includes(part));
  }
  if (q.includes('||')) {
    return q.split('||').map(s => s.trim()).filter(Boolean).some(part => haystack.includes(part));
  }
  return haystack.includes(q);
}

/** Convention: a personal note starting with "!" is visually highlighted. */
export function isImportantNote (text) {
  return /^\s*!/.test(String(text || ''));
}
