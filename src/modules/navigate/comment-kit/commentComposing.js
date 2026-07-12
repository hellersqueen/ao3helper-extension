/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Composing Submodule
    Submodule ID: commentComposing
    Parent Module: commentKit
    Display Name: Comment Composing

    - Feature: Formatting toolbar
      - Bold, Italic, Link, Quote buttons above comment textarea
      - Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link)
      - Wraps selected text or inserts placeholder at cursor

    - Feature: Comment templates panel
      - Quick-insert template buttons below the toolbar
      - Default templates (praise, appreciation, encouragement)
      - Templates persisted in localStorage

    - Feature: Comment templates management
      - "Manage templates" button opens CRUD panel
      - Add / edit / remove custom templates
      - Controlled independently from quick-insert row

    - Feature: Comment preview
      - "Preview" button below the textarea
      - Toggles a read-only rendered HTML preview of the comment
      - Sanitised: only renders allowed AO3 HTML tags (b, i, a, blockquote, p, br)

    Settings (read from parent commentKit panel):
        showFormattingToolbar  [default: true]
        showQuickTemplates     [default: true]
        commentTemplates       [default: true]
        enablePreview          [default: true]

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'commentComposing';
const NS   = 'ao3h';

// ── Defaults (settings are saved under the parent commentKit panel) ──────
const DEFAULTS = {
  showFormattingToolbar : true,
  showQuickTemplates    : false,
  commentTemplates      : false,
  enablePreview         : true,
};

function cfg (key) {
  try {
    const s = JSON.parse(localStorage.getItem('ao3h:mod:commentKit:settings') || '{}');
    return (key in s) ? s[key] : DEFAULTS[key];
  } catch (_) { return DEFAULTS[key]; }
}

// ── Template storage ─────────────────────────────────────────────────────
const TEMPLATES_KEY = `${NS}:commentComposing:templates`;

const DEFAULT_TEMPLATES = [
  'Loved this! ❤️',
  'This was so good!',
  "Can't wait for the next chapter!",
  'Amazing work! 💕',
  'Your writing is incredible!',
  'Thank you for sharing this! 💖',
  'The characterization is spot on!',
  'This deserves all the kudos!',
];

function loadTemplates () {
  try {
    const stored = JSON.parse(localStorage.getItem(TEMPLATES_KEY));
    return Array.isArray(stored) && stored.length ? stored : [...DEFAULT_TEMPLATES];
  } catch (_) { return [...DEFAULT_TEMPLATES]; }
}

function saveTemplates (list) {
  try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list)); } catch (_) {}
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Wraps selected text in before/after, or inserts placeholder if no selection. */
function wrapSelection (textarea, before, after, placeholder) {
  const start  = textarea.selectionStart;
  const end    = textarea.selectionEnd;
  const sel    = textarea.value.slice(start, end) || placeholder || '';
  const newVal = textarea.value.slice(0, start) + before + sel + after + textarea.value.slice(end);
  textarea.value = newVal;
  const cursor = start + before.length + sel.length;
  textarea.setSelectionRange(cursor, cursor);
  textarea.focus();
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// ── Formatting toolbar ────────────────────────────────────────────────────

function buildToolbar (textarea, cleanups) {
  const toolbar = D.createElement('div');
  toolbar.className = `${NS}-format-toolbar ${NS}-composing-toolbar`;

  const BUTTONS = [
    { label: 'B',  title: 'Bold (Ctrl+B)',   before: '<b>',           after: '</b>',           placeholder: 'bold text'   },
    { label: 'I',  title: 'Italic (Ctrl+I)', before: '<i>',           after: '</i>',           placeholder: 'italic text' },
    { label: '🔗', title: 'Link (Ctrl+K)',   before: null,            after: null,             action: 'link'             },
    { label: '❝',  title: 'Quote',           before: '<blockquote>',  after: '</blockquote>',  placeholder: 'quoted text' },
  ];

  BUTTONS.forEach(({ label, title, before, after, placeholder, action }) => {
    const btn = D.createElement('button');
    btn.type      = 'button';
    btn.className = `${NS}-format-btn`;
    btn.innerHTML = label;
    btn.title     = title;

    btn.addEventListener('click', () => {
      if (action === 'link') {
        const url = W.prompt('Enter URL:');
        if (!url) return;
        wrapSelection(textarea, `<a href="${url}">`, '</a>', 'link text');
      } else {
        wrapSelection(textarea, before, after, placeholder);
      }
    });

    toolbar.appendChild(btn);
  });

  // Keyboard shortcuts
  const onKeydown = function (e) {
    if (!e.ctrlKey) return;
    if (e.key === 'b') { e.preventDefault(); wrapSelection(textarea, '<b>', '</b>', 'bold text'); }
    if (e.key === 'i') { e.preventDefault(); wrapSelection(textarea, '<i>', '</i>', 'italic text'); }
    if (e.key === 'k') {
      e.preventDefault();
      const url = W.prompt('Enter URL:');
      if (url) wrapSelection(textarea, `<a href="${url}">`, '</a>', 'link text');
    }
  };
  textarea.addEventListener('keydown', onKeydown);
  cleanups.push(() => textarea.removeEventListener('keydown', onKeydown));

  return toolbar;
}

// ── Templates panel ───────────────────────────────────────────────────────

function buildTemplatesPanel (textarea) {
  const container = D.createElement('div');
  container.className = `${NS}-templates-panel ${NS}-composing-templates`;

  const row = D.createElement('div');
  row.className = `${NS}-templates-row`;
  container.appendChild(row);

  const managePanel = D.createElement('div');
  managePanel.className = `${NS}-templates-manage-panel`;
  container.appendChild(managePanel);

  function refreshButtons () {
    row.innerHTML = '';

    loadTemplates().forEach(text => {
      const btn = D.createElement('button');
      btn.type      = 'button';
      btn.className = `${NS}-template-btn`;
      btn.textContent = text.length > 30 ? text.slice(0, 28) + '…' : text;
      btn.title     = text;
      btn.addEventListener('click', () => {
        const cur = textarea.value;
        textarea.value = cur ? `${cur}\n\n${text}` : text;
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      });
      row.appendChild(btn);
    });

    if (cfg('commentTemplates')) {
      const manageBtn = D.createElement('button');
      manageBtn.type      = 'button';
      manageBtn.className = `${NS}-manage-templates-btn`;
      manageBtn.textContent = '⚙ Manage templates';
      manageBtn.addEventListener('click', () => {
        managePanel.classList.toggle('open');
        if (managePanel.classList.contains('open')) buildManagePanel();
      });
      row.appendChild(manageBtn);
    }
  }

  function buildManagePanel () {
    managePanel.innerHTML = '';
    const templates = loadTemplates();

    const list = D.createElement('div');

    templates.forEach((text, idx) => {
      const editRow = D.createElement('div');
      editRow.className = `${NS}-template-edit-row`;

      const input = D.createElement('input');
      input.type      = 'text';
      input.className = `${NS}-template-edit-input`;
      input.value     = text;

      const del = D.createElement('button');
      del.type      = 'button';
      del.className = `${NS}-template-del-btn`;
      del.textContent = '✕';
      del.title     = 'Remove template';
      del.addEventListener('click', () => {
        const updated = loadTemplates();
        updated.splice(idx, 1);
        saveTemplates(updated);
        buildManagePanel();
        refreshButtons();
      });

      editRow.appendChild(input);
      editRow.appendChild(del);
      list.appendChild(editRow);
    });

    managePanel.appendChild(list);

    const actions = D.createElement('div');
    actions.className = `${NS}-template-manage-actions`;

    const addBtn = D.createElement('button');
    addBtn.type      = 'button';
    addBtn.className = `${NS}-template-add-btn`;
    addBtn.textContent = '+ Add template';
    addBtn.addEventListener('click', () => {
      const updated = loadTemplates();
      updated.push('New template');
      saveTemplates(updated);
      buildManagePanel();
      refreshButtons();
    });

    const saveBtn = D.createElement('button');
    saveBtn.type      = 'button';
    saveBtn.className = `${NS}-template-save-btn`;
    saveBtn.textContent = 'Save changes';
    saveBtn.addEventListener('click', () => {
      const inputs = list.querySelectorAll(`.${NS}-template-edit-input`);
      const updated = [...inputs].map(i => i.value.trim()).filter(Boolean);
      saveTemplates(updated);
      managePanel.classList.remove('open');
      refreshButtons();
    });

    actions.appendChild(addBtn);
    actions.appendChild(saveBtn);
    managePanel.appendChild(actions);
  }

  refreshButtons();
  return container;
}

// ── Preview panel ─────────────────────────────────────────────────────────

/** Allowed tags for the comment preview renderer (mirrors AO3's HTML subset). */
const ALLOWED_TAGS = new Set(['b', 'i', 'em', 'strong', 'a', 'blockquote', 'p', 'br', 'u', 's']);

function sanitiseHTML (raw) {
  const tmpl = D.createElement('template');
  tmpl.innerHTML = raw;
  const frag = tmpl.content;
  // Walk all elements and remove disallowed tags (keep their text content)
  frag.querySelectorAll('*').forEach(el => {
    if (!ALLOWED_TAGS.has(el.tagName.toLowerCase())) {
      el.replaceWith(D.createTextNode(el.textContent));
    }
  });
  const div = D.createElement('div');
  div.appendChild(frag);
  return div.innerHTML;
}

function buildPreviewToggle (textarea, cleanups) {
  const btn = D.createElement('button');
  btn.type      = 'button';
  btn.className = `${NS}-preview-toggle-btn ${NS}-composing-preview-btn`;
  btn.textContent = '👁 Preview';

  const preview = D.createElement('div');
  preview.className = `${NS}-comment-preview ${NS}-composing-preview-box`;

  btn.addEventListener('click', () => {
    const open = preview.classList.toggle('open');
    btn.classList.toggle('active', open);
    if (open) {
      preview.innerHTML = sanitiseHTML(textarea.value) || '<em style="color:#999">Nothing to preview yet.</em>';
    }
  });

  // Keep preview in sync while it's open
  const onInput = () => {
    if (preview.classList.contains('open')) {
      preview.innerHTML = sanitiseHTML(textarea.value) || '<em style="color:#999">Nothing to preview yet.</em>';
    }
  };
  textarea.addEventListener('input', onInput);
  cleanups.push(() => textarea.removeEventListener('input', onInput));

  return { btn, preview };
}

// ── Per-form enhancement ──────────────────────────────────────────────────

const formCleanups = new Map();

function enhanceForm (form) {
  if (formCleanups.has(form)) return;

  const textarea = form.querySelector(
    'textarea[name="comment[comment_content]"], textarea#comment_content'
  );
  if (!textarea) return;

  const cleanups = [];

  if (cfg('showFormattingToolbar')) {
    const toolbar = buildToolbar(textarea, cleanups);
    textarea.before(toolbar);
    cleanups.push(() => toolbar.remove());
  }

  if (cfg('showQuickTemplates')) {
    const templates = buildTemplatesPanel(textarea);
    textarea.before(templates);
    cleanups.push(() => templates.remove());
  }

  if (cfg('enablePreview')) {
    const { btn, preview } = buildPreviewToggle(textarea, cleanups);
    textarea.after(preview);
    textarea.after(btn);
    cleanups.push(() => { btn.remove(); preview.remove(); });
  }
  formCleanups.set(form, () => cleanups.forEach(cleanup => cleanup()));
}

function enhanceAll () {
  D.querySelectorAll('form.comment.new, form.comment.edit').forEach(enhanceForm);
}

// ── Module registration ───────────────────────────────────────────────────

register(MOD, {
  title:            'Comment Composing',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  enhanceAll();

  const obs = new MutationObserver(enhanceAll);
  obs.observe(D.body, { childList: true, subtree: true });

  return () => {
    obs.disconnect();
    formCleanups.forEach(cleanup => cleanup());
    formCleanups.clear();
  };
});
