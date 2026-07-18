/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Chapter Navigation › Chapters Panel Helpers

Pure logic for the "📑 Chapters" floating panel: parsing the native chapter
select into {id, num, title} entries, filtering by search query, computing
read/unread/current state for the mini progress map, tracking recently
visited chapters, and building the breadcrumb / tab-title strings.

═══════════════════════════════════════════════════════════════════════════ */

/**
 * Parse the native `select#selected_id` options into structured chapters.
 * AO3 renders option text as "N. Title" (or just "N." when untitled).
 * @param {{value:string, text:string, selected?:boolean}[]} options
 * @returns {{id:string, num:number, title:string, selected:boolean}[]}
 */
export function parseChapterOptions (options) {
  if (!Array.isArray(options)) return [];
  return options.map((opt, i) => {
    const text = String(opt.text ?? '').trim();
    const m = text.match(/^(\d+)\.\s*(.*)$/);
    const num   = m ? parseInt(m[1], 10) : i + 1;
    const title = m && m[2] ? m[2].trim() : '';
    return { id: String(opt.value), num, title, selected: !!opt.selected };
  });
}

/**
 * Filter chapters by a free-text query matched against the chapter number
 * or its title (case-insensitive substring).
 * @template {{num:number, title:string}} T
 * @param {T[]} chapters
 * @param {string} query
 * @returns {T[]}
 */
export function filterChapters (chapters, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return chapters;
  return chapters.filter(ch =>
    String(ch.num).includes(q) || ch.title.toLowerCase().includes(q)
  );
}

/**
 * Annotate each chapter with a `state` for the mini progress map:
 * 'current' (currently viewed), 'read' (num <= lastReadNum), or 'unread'.
 * @template {{id:string, num:number}} T
 * @param {T[]} chapters
 * @param {{currentId?:string, lastReadNum?:number|null}} opts
 * @returns {(T & {state:string})[]}
 */
export function buildChapterStates (chapters, { currentId, lastReadNum } = {}) {
  return chapters.map(ch => ({
    ...ch,
    state: ch.id === currentId
      ? 'current'
      : (lastReadNum != null && ch.num <= lastReadNum ? 'read' : 'unread'),
  }));
}

/**
 * First unread chapter, i.e. the chapter right after the last one read.
 * Falls back to the first chapter when nothing has been read yet.
 * @template {{num:number}} T
 * @param {T[]} chapters
 * @param {number|null|undefined} lastReadNum
 * @returns {T|null}
 */
export function firstUnreadChapter (chapters, lastReadNum) {
  if (!chapters.length) return null;
  if (lastReadNum == null) return chapters[0];
  const next = chapters.find(ch => ch.num > lastReadNum);
  return next || chapters[chapters.length - 1];
}

/**
 * Add a chapter to a "recently visited" list: dedupe by id, most recent
 * first, capped to `cap` entries.
 * @template {{id:string}} T
 * @param {T[]} list
 * @param {T} entry
 * @param {number} cap
 * @returns {T[]}
 */
export function addRecentEntry (list, entry, cap = 8) {
  const rest = (Array.isArray(list) ? list : []).filter(e => e.id !== entry.id);
  return [entry, ...rest].slice(0, cap);
}

/**
 * Breadcrumb text: "Work Title > Chapter N > Chapter Title".
 * @param {string} workTitle
 * @param {number} num
 * @param {string} title
 */
export function buildBreadcrumbText (workTitle, num, title) {
  const parts = [workTitle || 'Work', `Chapter ${num}`];
  if (title) parts.push(title);
  return parts.join(' > ');
}

/**
 * Prefix a document title with the current chapter position, e.g.
 * "Ch. 5/12 · Original Title".
 * @param {string} originalTitle
 * @param {number} num
 * @param {number|null} total
 */
export function prependChapterToTitle (originalTitle, num, total) {
  const pos = total ? `Ch. ${num}/${total}` : `Ch. ${num}`;
  return originalTitle ? `${pos} · ${originalTitle}` : pos;
}
