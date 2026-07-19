/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit › Helpers

Pure logic shared across commentKit's submodules: template variable
substitution and search, per-form draft scoping, auto-collapse threshold
rules, custom highlight matching, and comment-page navigation math.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATES
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Replaces `{title}`/`{author}` placeholders in a template with real values.
 * Unknown placeholders are left as-is; missing values fall back to ''.
 * @param {string} text
 * @param {{title?:string, author?:string}} vars
 * @returns {string}
 */
export function fillTemplateVariables (text, vars = {}) {
  return String(text ?? '').replace(/\{(title|author)\}/g, (_, key) => vars[key] ?? '');
}

/**
 * Case-insensitive substring filter over template strings.
 * @param {string[]} templates
 * @param {string} query
 * @returns {string[]}
 */
export function filterTemplates (templates, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return templates;
  return templates.filter(t => t.toLowerCase().includes(q));
}

/* ═══════════════════════════════════════════════════════════════════════════
   DRAFTS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Draft storage key for a given work + form scope. The unscoped 'top' scope
 * keeps the original (pre-Chantier-4) key so existing drafts still resolve;
 * reply forms get their own key so replying to two different comments (or a
 * reply plus the main new-comment box) don't overwrite each other's draft.
 * @param {string} workId
 * @param {string} scope - 'top' or a comment id, e.g. 'comment_12345'
 * @returns {string}
 */
export function draftKeyFor (workId, scope = 'top') {
  return scope === 'top' ? `ao3h:draft:${workId}` : `ao3h:draft:${workId}:${scope}`;
}

/**
 * Determines a comment-reply form's draft scope from its nearest ancestor
 * comment id, if any.
 * @param {string|null} parentCommentId - e.g. 'comment_12345', or null for the top-level form
 * @returns {string}
 */
export function draftScopeForForm (parentCommentId) {
  return parentCommentId || 'top';
}

/* ═══════════════════════════════════════════════════════════════════════════
   THREAD AUTO-COLLAPSE
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Whether a thread should render collapsed: a manual per-thread override
 * always wins; otherwise a reply count at or above `threshold` auto-collapses
 * (threshold <= 0 disables auto-collapse entirely).
 * @param {number} replyCount
 * @param {number} threshold
 * @param {boolean|undefined} manualOverride
 * @returns {boolean}
 */
export function shouldAutoCollapse (replyCount, threshold, manualOverride) {
  if (manualOverride !== undefined) return manualOverride;
  return threshold > 0 && replyCount >= threshold;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM HIGHLIGHTS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Parses the comma-separated `customHighlights` setting into normalized rules.
 * @param {string} raw
 * @returns {string[]}
 */
export function parseHighlightRules (raw) {
  return String(raw ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Whether a comment matches any custom highlight rule, by author username or
 * by a keyword appearing in its text.
 * @param {{author?:string, text?:string}} comment
 * @param {string[]} rules - already-normalized (parseHighlightRules)
 * @returns {boolean}
 */
export function matchesCustomHighlight (comment, rules) {
  if (!rules.length) return false;
  const author = (comment.author || '').toLowerCase();
  const text   = (comment.text || '').toLowerCase();
  return rules.some(rule => author === rule || text.includes(rule));
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════════════════════════════ */

/** Case-insensitive substring match, used to filter comments by keyword. */
export function matchesSearch (text, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return true;
  return String(text ?? '').toLowerCase().includes(q);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Builds a URL for a specific comment page, replacing any existing `page`
 * param and anchoring to the comments section.
 * @param {string} currentUrl
 * @param {number} pageNum
 * @returns {string}
 */
export function buildPageJumpUrl (currentUrl, pageNum) {
  const u = new URL(currentUrl);
  if (pageNum <= 1) u.searchParams.delete('page');
  else u.searchParams.set('page', String(pageNum));
  u.hash = 'comments';
  return u.toString();
}
