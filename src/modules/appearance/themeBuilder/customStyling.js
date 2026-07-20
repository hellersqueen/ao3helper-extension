/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Builder › Custom Styling

Purpose
    Provides a highlighted code editor for targeted CSS, HTML, or JavaScript
    injection, with configurable priority and reusable snippets.

Notes
    CSS is checked by both a lightweight syntax validator and ThemeValidator
    before injection. HTML and JavaScript are injected directly at the user's
    request. Stored v1 CSS is migrated to the current type/page/priority model.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { ThemeValidator } from '../../../../lib/themes/engine/themeUtils.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const findProtectedViolations = (...args) => W.AO3H_ThemeBuilder.findProtectedViolations(...args);
const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'customStyling';
const LOG  = `[AO3H][${MOD}]`;
const CSS_SK   = `${NS}:tb:customcss`;
const TYPE_SK  = `${NS}:tb:customtype`;
const PAGES_SK = `${NS}:tb:custompages`;
const PRIORITY_SK      = `${NS}:tb:custompriority`;
const USER_SNIPPETS_SK = `${NS}:tb:usersnippets`;
const STYLE_ID         = `${NS}-tb-custom-style`;
const HTML_CONTAINER_ID = `${NS}-tb-injected-html`;
const JS_TAG_ID         = `${NS}-tb-injected-js`;
const DEFAULT_PRIORITY  = 5;



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PAGE TARGETING AND INJECTION
═══════════════════════════════════════════════════════════════════════════ */

const PAGE_TARGETS = [
  { id: 'all',      label: 'All pages',      test: () => true },
  { id: 'work',     label: 'Work pages',     test: () => /^\/works\/\d+/.test(location.pathname) },
  { id: 'listing',  label: 'Listing pages',  test: () => /\/works$|\/tags\/[^/]+\/works|\/bookmarks/.test(location.pathname) },
  { id: 'dashboard',label: 'Dashboard',      test: () => /\/users\/[^/]+\/(dashboard|profile)/.test(location.pathname) },
];

function matchesCurrentPage (pages) {
  if (!pages || pages.length === 0 || pages.includes('all')) return true;
  return PAGE_TARGETS.filter(t => pages.includes(t.id)).some(t => t.test());
}

function getShared () { return W.AO3H_ThemeBuilder || null; }

// Injects code as a <style>/<div>/<script> and re-orders by priority.
// Priority 1 = injected early (AO3 styles can override).
// Priority 10 = injected last in <head> (wins over everything).
function injectWithPriority (code, type, priority) {
  const p = Math.max(1, Math.min(10, priority || DEFAULT_PRIORITY));
  if (type === 'css') {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = code;
    el.dataset.priority = String(p);
    reorderStyles();
  } else if (type === 'html') {
    document.getElementById(HTML_CONTAINER_ID)?.remove();
    const wrap = document.createElement('div');
    wrap.id = HTML_CONTAINER_ID;
    wrap.dataset.priority = String(p);
    wrap.innerHTML = code;
    document.body.appendChild(wrap);
  } else if (type === 'js') {
    document.getElementById(JS_TAG_ID)?.remove();
    const script = document.createElement('script');
    script.id = JS_TAG_ID;
    script.dataset.priority = String(p);
    script.textContent = code;
    document.body.appendChild(script);
  }
}

function clearInjection (type) {
  if (type === 'css') {
    const el = document.getElementById(STYLE_ID);
    if (el) el.textContent = '';
  } else if (type === 'html') {
    document.getElementById(HTML_CONTAINER_ID)?.remove();
  } else if (type === 'js') {
    document.getElementById(JS_TAG_ID)?.remove();
  }
}

// Re-sort all <style data-priority> tags in <head> by ascending priority.
function reorderStyles () {
  const styles = Array.from(document.head.querySelectorAll('style[data-priority]'));
  if (styles.length < 2) return;
  styles.sort((a, b) => Number(a.dataset.priority) - Number(b.dataset.priority));
  styles.forEach(el => document.head.appendChild(el)); // append re-orders
}



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — STYLE SNIPPETS
═══════════════════════════════════════════════════════════════════════════ */

function getUserSnippets () { return lsGet(USER_SNIPPETS_SK) || []; }
function saveUserSnippets (arr) { lsSet(USER_SNIPPETS_SK, arr); }

const SNIPPETS = [
  { label: 'Wider reading area', css: '#workskin { max-width: 900px !important; }' },
  { label: 'Larger text',        css: '#workskin p { font-size: 1.1em; line-height: 1.7; }' },
  { label: 'Dark sidebar',       css: '#sidebar { background: #222; color: #eee; } #sidebar a { color: #adf; }' },
  { label: 'Hide tag clouds',    css: '.tags.freeform { display: none; }' },
  { label: 'Compact blurbs',     css: 'li.work.blurb { padding: 6px 8px !important; }' },
];



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CUSTOM CODE EDITOR
═══════════════════════════════════════════════════════════════════════════ */

let panelEl    = null;
let triggerBtn = null;
let activeType = 'css'; // tracks current injection type across panel open/close

function renderPanel () {
  const savedCSS = lsGet(CSS_SK) || '';
  const snippetOpts = SNIPPETS.map(
    (s, i) => `<option value="${i}">${s.label}</option>`
  ).join('');

  panelEl = document.createElement('div');
  panelEl.className = `${NS}-tb-panel`;
  panelEl.innerHTML = `
    <button class="${NS}-tb-panel-close" aria-label="Close CSS editor">✕</button>
    <h4>✏️ Custom Code Injection</h4>

    <div class="${NS}-tb-section-title">Injection type</div>
    <div class="${NS}-tb-row">
      <label><input type="radio" name="${NS}-tb-inj-type" value="css" checked> CSS</label>
      <label><input type="radio" name="${NS}-tb-inj-type" value="html"> HTML</label>
      <label><input type="radio" name="${NS}-tb-inj-type" value="js"> JavaScript</label>
    </div>
    <div id="${NS}-tb-js-notice" class="${NS}-tb-css-warn" style="display:none">⚠ JS runs immediately on Apply and cannot be undone on Clear.</div>

    <div class="${NS}-tb-section-title">Apply on</div>
    <div class="${NS}-tb-row" id="${NS}-tb-pages-row">
      <label><input type="checkbox" name="${NS}-tb-page" value="all"> All pages</label>
      <label><input type="checkbox" name="${NS}-tb-page" value="work"> Work pages</label>
      <label><input type="checkbox" name="${NS}-tb-page" value="listing"> Listing pages</label>
      <label><input type="checkbox" name="${NS}-tb-page" value="dashboard"> Dashboard</label>
    </div>
    <div id="${NS}-tb-pages-note"></div>

    <div class="${NS}-tb-section-title">Snippets</div>
    <select class="${NS}-tb-select" id="${NS}-tb-snippet-select">
      <option value="">— Insert a snippet —</option>
      <optgroup label="Built-in">
        ${snippetOpts}
      </optgroup>
      <optgroup label="Your presets" id="${NS}-tb-user-optgroup"></optgroup>
    </select>
    <ul class="${NS}-tb-preset-list" id="${NS}-tb-preset-list"></ul>

    <label id="${NS}-tb-code-label" for="${NS}-tb-css-input">Your CSS:</label>
    <div class="${NS}-tb-editor-wrap">
      <pre id="${NS}-tb-css-highlight" aria-hidden="true"></pre>
      <textarea id="${NS}-tb-css-input" spellcheck="false" placeholder="/* Enter your CSS here */">${escapeHtml(savedCSS)}</textarea>
    </div>
    <div id="${NS}-tb-css-status" class="${NS}-tb-css-status" aria-live="polite"></div>

    <div class="${NS}-tb-row ${NS}-tb-row--center" id="${NS}-tb-priority-row">
      <label for="${NS}-tb-priority" class="${NS}-tb-label--nowrap">Priority (1–10):</label>
      <input type="number" id="${NS}-tb-priority" class="${NS}-tb-input" min="1" max="10" value="5"
        title="1 = low (AO3 styles can override), 10 = high (overrides everything)">
      <span class="${NS}-tb-hint">1 = low, 10 = high</span>
    </div>

    <div class="${NS}-tb-row">
      <button class="${NS}-tb-btn primary" data-action="apply">Apply</button>
      <button class="${NS}-tb-btn" data-action="save-preset">Save as preset…</button>
      <button class="${NS}-tb-btn" data-action="save-theme">Save as Theme…</button>
      <button class="${NS}-tb-btn" data-action="clear">Clear</button>
    </div>
  `;
  document.body.appendChild(panelEl);

  const textarea = panelEl.querySelector(`#${NS}-tb-css-input`);
  const snippetSel = panelEl.querySelector(`#${NS}-tb-snippet-select`);

  panelEl.querySelector(`.${NS}-tb-panel-close`).addEventListener('click', () => closePanel());
  setupHighlighter(panelEl.querySelector(`.${NS}-tb-editor-wrap`));

  // ── Type selector ──
  const typeRadios  = panelEl.querySelectorAll(`[name="${NS}-tb-inj-type"]`);
  const jsNotice    = panelEl.querySelector(`#${NS}-tb-js-notice`);
  const codeLabel   = panelEl.querySelector(`#${NS}-tb-code-label`);
  const saveThemeBtn = panelEl.querySelector('[data-action="save-theme"]');
  const highlightWrap = panelEl.querySelector(`.${NS}-tb-editor-wrap`);

  // Restore saved type
  const savedType = lsGet(TYPE_SK) || 'css';
  activeType = savedType;
  typeRadios.forEach(r => { if (r.value === savedType) r.checked = true; });
  applyTypeUI(savedType);

  function applyTypeUI (type) {
    codeLabel.textContent = type === 'css' ? 'Your CSS:' : type === 'html' ? 'Your HTML:' : 'Your JavaScript:';
    jsNotice.style.display = type === 'js' ? '' : 'none';
    saveThemeBtn.style.display = type === 'css' ? '' : 'none';
    // Swap highlighter: CSS gets coloring, others get plain pre
    highlightWrap.dataset.type = type;
    syncHighlight(type, textarea.value);
  }

  function syncHighlight (type, val) {
    const pre = highlightWrap.querySelector(`#${NS}-tb-css-highlight`);
    if (!pre) return;
    if (type === 'css') {
      pre.innerHTML = val ? highlightCSS(val) : `<span class="${NS}-tb-muted">/* Enter your CSS here */</span>`;
    } else {
      pre.textContent = val || '';
    }
  }

  typeRadios.forEach(r => r.addEventListener('change', () => {
    activeType = r.value;
    lsSet(TYPE_SK, activeType);
    applyTypeUI(activeType);
    updateStatus();
  }));

  // ── Page targeting ──
  const pageChecks = panelEl.querySelectorAll(`[name="${NS}-tb-page"]`);
  const pagesNote  = panelEl.querySelector(`#${NS}-tb-pages-note`);
  const savedPages = lsGet(PAGES_SK) || ['all'];

  function restorePageChecks (pages) {
    pageChecks.forEach(cb => { cb.checked = pages.includes(cb.value); });
    updatePagesNote();
  }

  function getCheckedPages () {
    return Array.from(pageChecks).filter(cb => cb.checked).map(cb => cb.value);
  }

  function updatePagesNote () {
    const checked = getCheckedPages();
    if (checked.length === 0) {
      pagesNote.textContent = '⚠ No pages selected — injection will be skipped.';
    } else if (checked.includes('all')) {
      pagesNote.textContent = '';
    } else {
      const labels = PAGE_TARGETS.filter(t => checked.includes(t.id)).map(t => t.label);
      const active = PAGE_TARGETS.filter(t => checked.includes(t.id)).some(t => t.test());
      pagesNote.textContent = (active ? '✓ Active on this page.' : '— Not active on this page.') + ' (' + labels.join(', ') + ')';
    }
  }

  // "All pages" is mutually exclusive with the others
  pageChecks.forEach(cb => cb.addEventListener('change', () => {
    if (cb.value === 'all' && cb.checked) {
      pageChecks.forEach(c => { if (c.value !== 'all') c.checked = false; });
    } else if (cb.value !== 'all' && cb.checked) {
      panelEl.querySelector(`[name="${NS}-tb-page"][value="all"]`).checked = false;
    }
    updatePagesNote();
  }));

  restorePageChecks(savedPages);

  // ── User presets ──
  const userOptgroup = panelEl.querySelector(`#${NS}-tb-user-optgroup`);
  const presetList   = panelEl.querySelector(`#${NS}-tb-preset-list`);

  function renderUserPresets () {
    const presets = getUserSnippets();
    userOptgroup.innerHTML = '';
    presets.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = `user:${idx}`;
      opt.textContent = p.label;
      userOptgroup.appendChild(opt);
    });
    presetList.innerHTML = '';
    if (presets.length === 0) {
      const empty = document.createElement('li');
      empty.classList.add(`${NS}-tb-muted`);
      empty.textContent = 'No saved presets yet.';
      presetList.appendChild(empty);
      return;
    }
    presets.forEach((p, idx) => {
      const li = document.createElement('li');
      const delBtn = document.createElement('button');
      delBtn.title = 'Delete preset';
      delBtn.textContent = '🗑';
      delBtn.addEventListener('click', () => {
        const all = getUserSnippets();
        all.splice(idx, 1);
        saveUserSnippets(all);
        renderUserPresets();
      });
      const tag = document.createElement('span');
      tag.className = `${NS}-tb-preset-tag`;
      tag.textContent = p.type || 'css';
      const name = document.createElement('span');
      name.className = `${NS}-tb-preset-name`;
      name.title = p.label;
      name.textContent = p.label;
      li.append(delBtn, tag, name);
      presetList.appendChild(li);
    });
  }

  // ── Priority input ──
  const priorityInput = panelEl.querySelector(`#${NS}-tb-priority`);
  const savedPriority = lsGet(PRIORITY_SK) ?? DEFAULT_PRIORITY;
  priorityInput.value = savedPriority;

  const statusEl = panelEl.querySelector(`#${NS}-tb-css-status`);
  function updateStatus () {
    const val = textarea.value.trim();
    if (!val || activeType !== 'css') { statusEl.textContent = ''; statusEl.className = `${NS}-tb-css-status`; return; }
    const errs = validateCSS(val);
    if (errs.length === 0) {
      statusEl.textContent = '✓ Valid CSS';
      statusEl.className = `${NS}-tb-css-status ${NS}-tb-css-ok`;
    } else {
      statusEl.textContent = '⚠ ' + errs[0];
      statusEl.className = `${NS}-tb-css-status ${NS}-tb-css-warn`;
    }
  }
  textarea.addEventListener('input', () => {
    syncHighlight(activeType, textarea.value);
    updateStatus();
  });
  if (savedCSS) updateStatus();

  snippetSel.addEventListener('change', () => {
    const val = snippetSel.value;
    if (!val) return;
    if (val.startsWith('user:')) {
      const idx = parseInt(val.slice(5), 10);
      const preset = getUserSnippets()[idx];
      if (preset) {
        textarea.value += (textarea.value ? '\n' : '') + preset.code;
        textarea.dispatchEvent(new Event('input'));
      }
    } else {
      const idx = parseInt(val, 10);
      if (!isNaN(idx) && SNIPPETS[idx]) {
        textarea.value += (textarea.value ? '\n' : '') + SNIPPETS[idx].css;
        textarea.dispatchEvent(new Event('input'));
      }
    }
    snippetSel.value = '';
  });

  panelEl.querySelector('[data-action="save-preset"]').addEventListener('click', () => {
    const code = textarea.value.trim();
    if (!code) return;
    const label = prompt('Preset name:', 'My preset');
    if (!label) return;
    const all = getUserSnippets();
    all.push({ label, code, type: activeType });
    saveUserSnippets(all);
    renderUserPresets();
  });

  renderUserPresets();

  panelEl.querySelector('[data-action="apply"]').addEventListener('click', () => {
    const code  = textarea.value.trim();
    if (!code) return;
    const pages = getCheckedPages();
    if (pages.length === 0) {
      pagesNote.textContent = '⚠ No pages selected — injection skipped.';
      return;
    }
    const priority = parseInt(priorityInput.value, 10) || DEFAULT_PRIORITY;
    lsSet(PAGES_SK, pages);
    lsSet(PRIORITY_SK, priority);
    lsSet(CSS_SK, code);
    if (!matchesCurrentPage(pages)) {
      pagesNote.textContent = '✓ Saved. Not active on this page (' + pages.join(', ') + ').';
      return;
    }
    if (activeType === 'css') {
      // Contrôle de sécurité (lib/themes/engine/themeUtils.js) — distinct
      // du linter de syntaxe validateCSS() ci-dessous ; bloque plutôt que
      // d'avertir, car c'est un motif dangereux et non une simple coquille.
      try {
        ThemeValidator.validate(code);
      } catch (err) {
        statusEl.textContent = '⛔ ' + err.message;
        statusEl.className = `${NS}-tb-css-status ${NS}-tb-css-warn`;
        return;
      }
      // Zone protection: refuse rules that would blank out the fic text or
      // the page itself (distinct from the syntax linter below).
      const violations = findProtectedViolations(code);
      if (violations.length > 0) {
        statusEl.textContent = '⛔ ' + violations[0];
        statusEl.className = `${NS}-tb-css-status ${NS}-tb-css-warn`;
        return;
      }
      const errs = validateCSS(code);
      if (errs.length > 0) {
        statusEl.textContent = '⚠ ' + errs[0] + ' — applied anyway';
        statusEl.className = `${NS}-tb-css-status ${NS}-tb-css-warn`;
      }
      injectWithPriority(code, 'css', priority);
      console.log(LOG, 'Custom CSS applied at priority', priority);
    } else {
      injectWithPriority(code, activeType, priority);
      console.log(LOG, `Custom ${activeType} injected at priority`, priority);
    }
  });

  panelEl.querySelector('[data-action="clear"]').addEventListener('click', () => {
    textarea.value = '';
    lsSet(CSS_SK, '');
    clearInjection(activeType);
    statusEl.textContent = '';
    statusEl.className = `${NS}-tb-css-status`;
    syncHighlight(activeType, '');
  });

  panelEl.querySelector('[data-action="save-theme"]').addEventListener('click', () => {
    const css = textarea.value.trim();
    if (!css) return;
    const name = prompt('Theme name:', 'My Custom Theme');
    if (!name) return;
    // Delegate to themeManagement via shared storage
    const SK = `${NS}:tb:themes`;
    const themes = lsGet(SK) || [];
    themes.push({ id: `t${Date.now()}`, name, css, createdAt: new Date().toISOString() });
    lsSet(SK, themes);
    console.log(LOG, 'Theme saved:', name);
    alert(`Theme "${name}" saved!`);
  });
}

function closePanel () {
  panelEl?.remove();
  panelEl = null;
}



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CSS VALIDATION AND HIGHLIGHTING
═══════════════════════════════════════════════════════════════════════════ */

// Returns an array of error strings (empty = valid).
function validateCSS (raw) {
  const errors = [];
  if (!raw.trim()) return errors;

  // Strip comments so they don't affect brace counting
  const noComments = raw.replace(/\/\*[^]*?\*\//g, '');

  // Unclosed comment
  if (/\/\*/.test(noComments)) errors.push('Unclosed comment (missing */).');

  // Balanced braces
  let depth = 0;
  for (const ch of noComments) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth < 0) { errors.push('Unexpected } — too many closing braces.'); break; }
  }
  if (depth > 0) errors.push(`Unclosed rule block — missing ${depth} closing brace${depth > 1 ? 's' : ''}.`);

  // Empty rule blocks { }
  if (/\{\s*\}/.test(noComments)) errors.push('One or more empty rule blocks {}.');

  // Property without colon — check all innermost blocks (handles @media nesting)
  const innermostBlocks = [...noComments.matchAll(/\{([^{}]*)\}/g)].map(m => m[1]);
  for (const inner of innermostBlocks) {
    const trimmed = inner.trim();
    if (!trimmed) continue;
    const declarations = trimmed.split(';').map(s => s.trim()).filter(Boolean);
    for (const decl of declarations) {
      if (!decl.includes(':')) {
        errors.push(`Declaration missing ':' — "${decl.slice(0, 30)}".`);
        break;
      }
    }
    if (errors.length) break;
  }

  return errors;
}

function highlightCSS (raw) {
  const esc  = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const wrap = (color, text) => `<span style="color:${color}">${text}</span>`;
  const HL = {
    comment:   '#6a9955',
    selector:  '#4ec9b0',
    atRule:    '#c586c0',
    property:  '#9cdcfe',
    value:     '#ce9178',
    important: '#f44747',
    brace:     '#ffd700',
  };

  // Stack-based tokeniser that handles nested blocks (@media, @keyframes, etc.)
  // Each stack entry is one of: 'sel' (selector context) | 'rule' (declaration block).
  // Entering a '{' pushes a new context; '}' pops back to the parent.
  let out = '', i = 0, buf = '';
  // stack[0] = outermost context. Start in selector context.
  const stack = ['sel'];

  function currentState () { return stack[stack.length - 1]; }

  function flush () {
    if (!buf) return;
    const state = currentState();
    if (state === 'sel') {
      // Highlight @-rules differently from regular selectors
      buf.split(/(@[a-z][a-z-]*)/i).forEach((p, idx) => {
        if (p) out += idx % 2 ? wrap(HL.atRule, esc(p)) : wrap(HL.selector, esc(p));
      });
    } else if (state === 'rule') {
      out += wrap(HL.property, esc(buf));
    } else if (state === 'val') {
      buf.split(/(!important)/i).forEach((p, idx) => {
        if (p) out += idx % 2 ? wrap(HL.important, esc(p)) : wrap(HL.value, esc(p));
      });
    }
    buf = '';
  }

  while (i < raw.length) {
    const ch  = raw[i];
    const ch2 = raw.slice(i, i + 2);

    // Comments — consume entirely regardless of context
    if (ch2 === '/*') {
      flush();
      let j = i + 2;
      while (j < raw.length - 1 && raw.slice(j, j + 2) !== '*/') j++;
      const end = raw.slice(j, j + 2) === '*/' ? j + 2 : raw.length;
      out += wrap(HL.comment, esc(raw.slice(i, end)));
      i = end;
      continue;
    }

    const state = currentState();

    if (state === 'sel') {
      if (ch === '{') {
        // Capture buf before flush() clears it — needed for @-rule detection.
        const preBuf = buf;
        flush();
        out += wrap(HL.brace, '{');
        // An @-rule outer block (e.g. @media) opens another selector context;
        // a regular selector opens a declaration block.
        const isAtRule = /@[a-z]/i.test(preBuf);
        stack.push(isAtRule ? 'sel' : 'rule');
        i++; continue;
      }
      buf += ch; i++; continue;
    }

    if (state === 'rule') {
      if (ch === '}') {
        flush();
        out += wrap(HL.brace, '}');
        if (stack.length > 1) stack.pop();
        i++; continue;
      }
      if (ch === '{') {
        // Nested selector inside a rule block (e.g. inside @keyframes)
        flush();
        out += wrap(HL.brace, '{');
        stack.push('rule');
        i++; continue;
      }
      if (ch === ':') { flush(); out += ':'; stack.push('val'); i++; continue; }
      buf += ch; i++; continue;
    }

    if (state === 'val') {
      if (ch === ';') { flush(); out += ';'; stack.pop(); i++; continue; }
      if (ch === '}') {
        flush();
        out += wrap(HL.brace, '}');
        // Pop 'val', then pop 'rule'
        if (stack.length > 1) stack.pop();
        if (stack.length > 1) stack.pop();
        i++; continue;
      }
      buf += ch; i++; continue;
    }

    buf += ch; i++;
  }
  flush();
  return out + '\n';
}

function setupHighlighter (wrapper) {
  const ta  = wrapper.querySelector(`#${NS}-tb-css-input`);
  const pre = wrapper.querySelector(`#${NS}-tb-css-highlight`);
  if (!ta || !pre) return;
  // Input sync is handled by syncHighlight() in renderPanel (type-aware).
  // Here we only wire scroll mirroring.
  ta.addEventListener('scroll', () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; });
}



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Custom Styling', parent: 'themeBuilder', enabledByDefault: true },
  async function init () {
    console.log(LOG, 'init');

    // ── Storage migration (v1 → v2) ────────────────────────────────────────
    // v1 stored only a raw CSS string in CSS_SK with no type/pages/priority.
    // If CSS_SK has a value but TYPE_SK is absent, this is a v1 user.
    // Migrate by writing the missing keys with safe defaults.
    const legacyCode = lsGet(CSS_SK);
    const hasTypeKey = lsGet(TYPE_SK) !== null;
    if (legacyCode && !hasTypeKey) {
      lsSet(TYPE_SK, 'css');
      lsSet(PAGES_SK, ['all']);
      lsSet(PRIORITY_SK, DEFAULT_PRIORITY);
      console.log(LOG, 'migrated v1 storage → v2');
    }

    // document.body peut ne pas encore exister quand ce module boote (surtout
    // sur une grosse page) — sans ce report, le bouton déclencheur plantait
    // (Cannot read properties of null (reading 'appendChild')), constaté en test.
    let active = true;
    onReady(() => {
      if (!active) return;

      // Re-apply saved injection on page load if current page matches
      const savedCode   = lsGet(CSS_SK) || '';
      const savedType2  = lsGet(TYPE_SK) || 'css';
      const savedPages2 = lsGet(PAGES_SK) || ['all'];
      const savedPrio2  = lsGet(PRIORITY_SK) ?? DEFAULT_PRIORITY;
      if (savedCode && matchesCurrentPage(savedPages2)) {
        injectWithPriority(savedCode, savedType2, savedPrio2);
        console.log(LOG, 'restored injection on', location.pathname, 'priority', savedPrio2);
      }

      triggerBtn = document.createElement('button');
      triggerBtn.className = `${NS}-tb-trigger`;
      triggerBtn.textContent = '✏️ CSS';
      triggerBtn.setAttribute('aria-label', 'Open custom CSS editor');
      triggerBtn.addEventListener('click', () => {
        if (panelEl) { closePanel(); } else { renderPanel(); }
      });
      document.body.appendChild(triggerBtn);
      if (getShared()?.cfg?.('mode') === 'visual') triggerBtn.style.display = 'none';
    });

    return function cleanup () {
      active = false;
      closePanel();
      triggerBtn?.remove();
      triggerBtn = null;
      document.getElementById(STYLE_ID)?.remove();
      document.getElementById(HTML_CONTAINER_ID)?.remove();
      document.getElementById(JS_TAG_ID)?.remove();
      console.log(LOG, 'cleanup');
    };
  }
);
