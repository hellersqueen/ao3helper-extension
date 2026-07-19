/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit › Comment Composing

Enhances AO3 comment forms with formatting controls, reusable templates, template
management, and a sanitized live preview.

Notes

- Formatting shortcuts support `Ctrl+B`, `Ctrl+I`, and `Ctrl+K`.
- Custom templates persist in local storage.
- Preview rendering accepts only the configured AO3-compatible HTML subset.
- All feature settings are read from the parent Comment Kit scope.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { observe } from '../../../../lib/utils/index.js';
import { getWorkTitle, getWorkAuthor } from '../../../../lib/ao3/work-page.js';
import { fillTemplateVariables, filterTemplates } from './commentKitHelpers.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'commentComposing';
const NS   = 'ao3h';

const DEFAULTS = {
  showFormattingToolbar : true,
  showQuickTemplates    : false,
  commentTemplates      : false,
  enablePreview         : true,
  quoteFicSelection     : true,
};

const cfg = makeCfg('commentKit', DEFAULTS);

const TEMPLATES_KEY = `${NS}:commentComposing:templates`;

// {title} and {author} are substituted with the current work's title/author
// at insertion time (fillTemplateVariables) — works for custom templates too.
const DEFAULT_TEMPLATES = [
  'Loved this! ❤️',
  'This was so good!',
  "Can't wait for the next chapter!",
  'Amazing work! 💕',
  'Your writing is incredible!',
  'Thank you for sharing this! 💖',
  'The characterization is spot on!',
  'This deserves all the kudos!',
  'I loved {title}! Thank you for writing this, {author}.',
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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — FORMATTING TOOLBAR
═══════════════════════════════════════════════════════════════════════════ */

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

function buildToolbar (textarea, cleanups) {
  const toolbar = D.createElement('div');
  toolbar.className = `${NS}-format-toolbar ${NS}-composing-toolbar`;

  const BUTTONS = [
    { label: 'B',  title: 'Bold (Ctrl+B)',   before: '<b>',           after: '</b>',           placeholder: 'bold text'      },
    { label: 'I',  title: 'Italic (Ctrl+I)', before: '<i>',           after: '</i>',           placeholder: 'italic text'    },
    { label: 'U',  title: 'Underline',       before: '<u>',           after: '</u>',           placeholder: 'underlined text' },
    { label: 'S',  title: 'Strikethrough',   before: '<s>',           after: '</s>',           placeholder: 'struck text'     },
    { label: '🔗', title: 'Link (Ctrl+K)',   before: null,            after: null,             action: 'link'                },
    { label: '❝',  title: 'Quote',           before: '<blockquote>',  after: '</blockquote>',  placeholder: 'quoted text'    },
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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — COMMENT TEMPLATES
═══════════════════════════════════════════════════════════════════════════ */

function buildTemplatesPanel (textarea) {
  const container = D.createElement('div');
  container.className = `${NS}-templates-panel ${NS}-composing-templates`;

  const search = D.createElement('input');
  search.type = 'search';
  search.className = `${NS}-templates-search`;
  search.placeholder = 'Search your templates…';
  search.hidden = true;
  container.appendChild(search);

  const row = D.createElement('div');
  row.className = `${NS}-templates-row`;
  container.appendChild(row);

  const managePanel = D.createElement('div');
  managePanel.className = `${NS}-templates-manage-panel`;
  container.appendChild(managePanel);

  function refreshButtons () {
    const all = loadTemplates();
    search.hidden = all.length <= 5;
    const visible = filterTemplates(all, search.value);
    row.innerHTML = '';

    visible.forEach(text => {
      const btn = D.createElement('button');
      btn.type      = 'button';
      btn.className = `${NS}-template-btn`;
      btn.textContent = text.length > 30 ? text.slice(0, 28) + '…' : text;
      btn.title     = text;
      btn.addEventListener('click', () => {
        const filled = fillTemplateVariables(text, {
          title: getWorkTitle() || '',
          author: getWorkAuthor()?.name || '',
        });
        const cur = textarea.value;
        textarea.value = cur ? `${cur}\n\n${filled}` : filled;
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
      const updated = [...inputs].map(i => /** @type {HTMLInputElement} */ (i).value.trim()).filter(Boolean);
      saveTemplates(updated);
      managePanel.classList.remove('open');
      refreshButtons();
    });

    actions.appendChild(addBtn);
    actions.appendChild(saveBtn);
    managePanel.appendChild(actions);
  }

  search.addEventListener('input', refreshButtons);
  refreshButtons();
  return container;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — COMMENT PREVIEW
═══════════════════════════════════════════════════════════════════════════ */

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

/** "Posting as Guest: Name" or "Posting as username", or '' when undetectable. */
function postingAsLabel (form) {
  const nameField = form.querySelector('#comment_name, input[name="comment[name]"]');
  const emailField = form.querySelector('#comment_email, input[name="comment[email]"]');
  if (nameField || emailField) {
    const name = /** @type {HTMLInputElement} */ (nameField)?.value.trim();
    return `Posting as Guest${name ? `: ${name}` : ''}`;
  }
  const me = D.querySelector('#header .user a[href^="/users/"]');
  const m = me?.href.match(/\/users\/([^/]+)/);
  return m ? `Posting as ${decodeURIComponent(m[1])}` : '';
}

function buildPreviewToggle (form, textarea, cleanups) {
  const btn = D.createElement('button');
  btn.type      = 'button';
  btn.className = `${NS}-preview-toggle-btn ${NS}-composing-preview-btn`;
  btn.textContent = '👁 Preview';

  const preview = D.createElement('div');
  preview.className = `${NS}-comment-preview ${NS}-composing-preview-box`;

  const renderPreview = () => {
    const label = postingAsLabel(form);
    const labelHtml = label ? `<div class="${NS}-comment-preview-as">${label}</div>` : '';
    preview.innerHTML = labelHtml + (sanitiseHTML(textarea.value) || '<em style="color:#999">Nothing to preview yet.</em>');
  };

  btn.addEventListener('click', () => {
    const open = preview.classList.toggle('open');
    btn.classList.toggle('active', open);
    if (open) renderPreview();
  });

  // Keep preview in sync while it's open
  const onInput = () => { if (preview.classList.contains('open')) renderPreview(); };
  textarea.addEventListener('input', onInput);
  cleanups.push(() => textarea.removeEventListener('input', onInput));

  return { btn, preview };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — FORM ENHANCEMENT
═══════════════════════════════════════════════════════════════════════════ */

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
    const { btn, preview } = buildPreviewToggle(form, textarea, cleanups);
    textarea.after(preview);
    textarea.after(btn);
    cleanups.push(() => { btn.remove(); preview.remove(); });
  }
  formCleanups.set(form, () => cleanups.forEach(cleanup => cleanup()));
}

function enhanceAll () {
  D.querySelectorAll('form.comment.new, form.comment.edit').forEach(enhanceForm);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — QUOTE A FIC-TEXT SELECTION INTO THE MAIN COMMENT BOX
═══════════════════════════════════════════════════════════════════════════ */

let quotePopup = null;

function removeQuotePopup () {
  quotePopup?.remove();
  quotePopup = null;
}

function isInFicProse (node) {
  const el = node instanceof Element ? node : node?.parentElement;
  const prose = el?.closest?.('.userstuff');
  return !!prose && !prose.closest('li.comment') && !prose.closest('form.comment.new, form.comment.edit');
}

function setupQuoteFicSelection (cleanups) {
  const onMouseUp = () => {
    removeQuotePopup();
    const sel = W.getSelection?.();
    const text = sel?.toString().trim();
    if (!text || !sel.rangeCount || !isInFicProse(sel.anchorNode)) return;

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    quotePopup = D.createElement('button');
    quotePopup.type = 'button';
    quotePopup.className = `${NS}-quote-fic-popup`;
    quotePopup.textContent = '❝ Quote in comment';
    quotePopup.style.top  = `${rect.bottom + W.scrollY + 4}px`;
    quotePopup.style.left = `${rect.left + W.scrollX}px`;

    quotePopup.addEventListener('mousedown', (e) => e.preventDefault()); // keep the selection alive
    quotePopup.addEventListener('click', () => {
      const target = D.querySelector('form.comment.new textarea[name="comment[comment_content]"], form.comment.new textarea#comment_content');
      if (target) {
        const quote = `<blockquote>${text}</blockquote>\n\n`;
        target.value = target.value ? `${target.value}\n\n${quote}` : quote;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus();
      }
      removeQuotePopup();
    });

    D.body.appendChild(quotePopup);
  };

  D.addEventListener('mouseup', onMouseUp);
  const onDocMouseDown = (e) => { if (e.target !== quotePopup) removeQuotePopup(); };
  D.addEventListener('mousedown', onDocMouseDown);

  cleanups.push(() => {
    D.removeEventListener('mouseup', onMouseUp);
    D.removeEventListener('mousedown', onDocMouseDown);
    removeQuotePopup();
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Comment Composing',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  enhanceAll();

  const obs = observe(D.body, { childList: true, subtree: true }, enhanceAll);

  const globalCleanups = [];
  if (cfg('quoteFicSelection')) setupQuoteFicSelection(globalCleanups);

  return () => {
    obs.disconnect();
    formCleanups.forEach(cleanup => cleanup());
    formCleanups.clear();
    globalCleanups.forEach(cleanup => cleanup());
  };
});
