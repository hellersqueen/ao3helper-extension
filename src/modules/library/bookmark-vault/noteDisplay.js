import { register } from '../../../core/lifecycle.js';
import { observe } from '../../../../lib/utils/index.js';

const MOD = 'noteDisplay';
const NS  = 'ao3h';

const COLLAPSE_THRESHOLD = 200; // chars

// ── Feature 1: Auto-collapse long bookmark notes ─────────────────────────

function collapseNotes () {
  document.querySelectorAll('li.bookmark.blurb blockquote.userstuff').forEach(note => {
    if (note.dataset.ao3hCollapse || note.dataset.bvCollapsed) return;
    note.dataset.ao3hCollapse = '1';

    const text = note.textContent.trim();
    if (text.length <= COLLAPSE_THRESHOLD) return;

    const preview = document.createElement('p');
    preview.className = `${NS}-note-preview`;
    preview.textContent = text.slice(0, COLLAPSE_THRESHOLD) + '…';

    const toggle = document.createElement('button');
    toggle.className   = `${NS}-note-toggle`;
    toggle.textContent = 'Show note';

    let expanded = false;
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      note.style.display    = expanded ? '' : 'none';
      preview.style.display = expanded ? 'none' : '';
      toggle.textContent    = expanded ? 'Hide note' : 'Show note';
    });

    note.style.display    = 'none';
    note.parentNode.insertBefore(preview, note);
    note.parentNode.insertBefore(toggle, note);
  });
}

// ── Feature 2: Hover preview on bookmark note icons / titles ────────────

function addHoverPreviews () {
  document.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
    if (blurb.dataset.ao3hHover) return;
    const note = blurb.querySelector('blockquote.userstuff');
    if (!note) return;
    blurb.dataset.ao3hHover = '1';

    const noteText = note.textContent.trim();
    if (!noteText) return;

    const title = blurb.querySelector('h4.heading a');
    if (!title) return;

    const tooltip = document.createElement('span');
    tooltip.className  = `${NS}-note-tooltip`;
    tooltip.textContent = noteText.slice(0, 180) + (noteText.length > 180 ? '…' : '');

    title.style.position = 'relative';
    title.appendChild(tooltip);

    title.addEventListener('mouseenter', () => { tooltip.style.display = 'block'; });
    title.addEventListener('mouseleave', () => { tooltip.style.display = 'none';  });
  });
}

// ── Feature 3: Markdown rendering in bookmark notes ─────────────────────

function inlineMarkdown (raw) {
  // Extract links first (before HTML escaping to preserve URLs)
  const linkSlots = [];
  let text = raw.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, linkText, url) => {
    const safeText = linkText
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (url.startsWith('/') || url.startsWith('https://archiveofourown.org')) {
      const safeUrl = url.replace(/"/g, '%22');
      const idx = linkSlots.length;
      linkSlots.push(
        `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeText}</a>`
      );
      return `\x00L${idx}\x00`;
    }
    return safeText; // external URLs rendered as plain text
  });

  // Escape remaining HTML entities
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Bold, italic, code (order matters: bold before italic)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g,     '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g,
    `<code class="${NS}-note-code">$1</code>`);

  // Restore link slots
  linkSlots.forEach((html, i) => { text = text.replace(`\x00L${i}\x00`, html); });
  return text;
}

function renderMarkdown (raw) {
  const lines = raw.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Heading: ## text
    const headingMatch = line.match(/^## (.+)/);
    if (headingMatch) {
      out.push(`<h4 class="${NS}-note-h4">${inlineMarkdown(headingMatch[1])}</h4>`);
      i++; continue;
    }

    // Blockquote: > text
    const bqMatch = line.match(/^> (.+)/);
    if (bqMatch) {
      out.push(`<blockquote class="${NS}-note-quote">${inlineMarkdown(bqMatch[1])}</blockquote>`);
      i++; continue;
    }

    // Unordered list: - or * items (group consecutive lines)
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(`<li>${inlineMarkdown(lines[i].slice(2).trim())}</li>`);
        i++;
      }
      out.push(`<ul class="${NS}-note-list">${items.join('')}</ul>`);
      continue;
    }

    // Ordered list: 1. 2. … (group consecutive lines)
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${inlineMarkdown(lines[i].replace(/^\d+\. /, '').trim())}</li>`);
        i++;
      }
      out.push(`<ol class="${NS}-note-list">${items.join('')}</ol>`);
      continue;
    }

    // Empty line
    if (!line.trim()) { out.push('<br>'); i++; continue; }

    // Plain line
    out.push(`<p class="${NS}-note-p">${inlineMarkdown(line)}</p>`);
    i++;
  }
  return out.join('');
}

const MARKDOWN_SIGNALS = /\*\*|\*|`|^## |^> |^\s*[-*] |\[.*\]\(|^\d+\. /m;

function renderNoteMarkdown (note) {
  if (note.dataset.ao3hMd) return;
  const rawText = note.textContent.trim();
  if (!rawText || !MARKDOWN_SIGNALS.test(rawText)) return;
  note.dataset.ao3hMd = note.innerHTML; // save original
  note.innerHTML = renderMarkdown(rawText);
}

function applyMarkdownToNotes () {
  document.querySelectorAll('li.bookmark.blurb blockquote.userstuff').forEach(renderNoteMarkdown);
}

register(MOD, {
  title:            'Note Display',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  collapseNotes();
  addHoverPreviews();
  applyMarkdownToNotes();

  const obs = observe(document.body, { childList: true, subtree: true }, () => {
    collapseNotes();
    addHoverPreviews();
    applyMarkdownToNotes();
  });

  return () => {
    obs.disconnect();
    document.querySelectorAll(
      `.${NS}-note-preview, .${NS}-note-toggle, .${NS}-note-tooltip`
    ).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-hover]').forEach(el => delete el.dataset.ao3hHover);
    document.querySelectorAll('blockquote.userstuff[data-ao3h-collapse]').forEach(el => {
      el.style.display = '';
      delete el.dataset.ao3hCollapse;
    });
    // Restore original Markdown note HTML
    document.querySelectorAll('blockquote.userstuff[data-ao3h-md]').forEach(note => {
      note.innerHTML = note.dataset.ao3hMd;
      delete note.dataset.ao3hMd;
    });
  };
});
