/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit › Draft Management

Protects comment text with per-work draft persistence and enhances comment forms
with live counters and an optional floating editor.

Notes

- Draft writes use a 500-millisecond debounce and expire after 30 days.
- The floating editor remains synchronized with AO3's original textarea.
- Settings are read from the parent Comment Kit scope.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';
import { observe, lsGet, lsSet, lsDel } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'draftManagement';
const NS   = 'ao3h';

const DEFAULTS = {
  enableAutoSave  : true,
  realtimeCounter : true,
  showFloatingBox : false,
};

const cfg = makeCfg('commentKit', DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — DRAFT STORAGE
═══════════════════════════════════════════════════════════════════════════ */

const DRAFT_PREFIX  = `${NS}:draft:`;
const MAX_AGE_MS    = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEBOUNCE_MS   = 500;

/**
 * The nearest ancestor comment's id, if `form` is a reply form nested inside
 * an existing comment — used to scope its draft separately from the
 * top-level new-comment form (and from other comments' reply forms), so
 * writing in two reply boxes at once doesn't overwrite either draft.
 */
function parentCommentIdFor (form) {
  return form.closest('li.comment')?.id || null;
}

function saveDraft (key, content) {
  if (content.trim()) {
    lsSet(key, { content, ts: Date.now() });
  } else {
    lsDel(key);
  }
}

function loadDraft (key) {
  const draft = lsGet(key, null);
  if (!draft) return null;
  if (Date.now() - draft.ts > MAX_AGE_MS) { lsDel(key); return null; }
  return draft.content || null;
}

function clearDraft (key) {
  lsDel(key);
}

function pruneOldDrafts () {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DRAFT_PREFIX)) continue;
    const draft = lsGet(key, null);
    if (!draft) continue;
    if (Date.now() - (draft.ts || 0) > MAX_AGE_MS) lsDel(key);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — FLOATING COMMENT BOX
═══════════════════════════════════════════════════════════════════════════ */

const BOX_POS_KEY = `${NS}:commentKit:floatingBoxPos`;

function loadBoxPos () {
  return lsGet(BOX_POS_KEY, null);
}
function saveBoxPos (pos) {
  lsSet(BOX_POS_KEY, pos);
}

function buildFloatingBox (form, textarea) {
  const box = D.createElement('div');
  box.className = `${NS}-floating-box ${NS}-float-box-widget`;

  const savedPos = loadBoxPos();
  if (savedPos) {
    box.style.left = `${savedPos.left}px`;
    box.style.top  = `${savedPos.top}px`;
    box.style.right = 'auto';
    box.style.bottom = 'auto';
  }

  // Header
  const header = D.createElement('div');
  header.className = `${NS}-floating-box-header`;
  header.title = 'Drag to move';
  const title = D.createElement('span');
  title.textContent = '💬 Comment';
  const toggleBtn = D.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = `${NS}-floating-box-toggle`;
  toggleBtn.textContent = '−';
  toggleBtn.title = 'Minimize';
  header.appendChild(title);
  header.appendChild(toggleBtn);

  // Dragging (mouse only — this is a desktop convenience widget)
  let dragging = false, dragDX = 0, dragDY = 0;
  const onDragMove = (e) => {
    if (!dragging) return;
    const left = e.clientX - dragDX;
    const top  = e.clientY - dragDY;
    box.style.left = `${left}px`;
    box.style.top  = `${top}px`;
    box.style.right = 'auto';
    box.style.bottom = 'auto';
  };
  const onDragEnd = () => {
    if (!dragging) return;
    dragging = false;
    const rect = box.getBoundingClientRect();
    saveBoxPos({ left: rect.left, top: rect.top });
  };
  const onDragStart = (e) => {
    if (e.target === toggleBtn) return;
    dragging = true;
    const rect = box.getBoundingClientRect();
    dragDX = e.clientX - rect.left;
    dragDY = e.clientY - rect.top;
    e.preventDefault();
  };
  header.addEventListener('mousedown', onDragStart);
  D.addEventListener('mousemove', onDragMove);
  D.addEventListener('mouseup', onDragEnd);

  // Body
  const body = D.createElement('div');
  body.className = `${NS}-floating-box-body`;

  const floatTA = D.createElement('textarea');
  floatTA.className = `${NS}-floating-box-textarea`;
  floatTA.placeholder = 'Write your comment…';
  floatTA.rows = 4;
  floatTA.value = textarea.value;

  const postBtn = D.createElement('button');
  postBtn.type = 'button';
  postBtn.className = `${NS}-floating-box-post-btn`;
  postBtn.textContent = 'Post Comment';

  body.appendChild(floatTA);
  body.appendChild(postBtn);
  box.appendChild(header);
  box.appendChild(body);
  D.body.appendChild(box);

  // Two-way sync
  const onFloatInput = () => {
    textarea.value = floatTA.value;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const onRealInput = () => { if (floatTA !== D.activeElement) floatTA.value = textarea.value; };
  floatTA.addEventListener('input', onFloatInput);
  textarea.addEventListener('input', onRealInput);

  // Post: submit the real form
  postBtn.addEventListener('click', () => {
    textarea.value = floatTA.value;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    const submit = form.querySelector('input[type="submit"], button[type="submit"]');
    if (submit) submit.click();
  });

  // Minimize / expand
  let minimized = false;
  toggleBtn.addEventListener('click', () => {
    minimized = !minimized;
    body.style.display = minimized ? 'none' : '';
    toggleBtn.textContent = minimized ? '+' : '−';
    toggleBtn.title = minimized ? 'Expand' : 'Minimize';
  });

  // Show when real form is off-screen
  const io = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    box.style.display = visible ? 'none' : 'flex';
    if (!visible) floatTA.value = textarea.value;
  }, { threshold: 0.1 });
  io.observe(form);

  return () => {
    io.disconnect();
    floatTA.removeEventListener('input', onFloatInput);
    textarea.removeEventListener('input', onRealInput);
    header.removeEventListener('mousedown', onDragStart);
    D.removeEventListener('mousemove', onDragMove);
    D.removeEventListener('mouseup', onDragEnd);
    box.remove();
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — FORM ENHANCEMENT
═══════════════════════════════════════════════════════════════════════════ */

const formCleanups = new Map();

function enhanceForm (form, workId) {
  if (formCleanups.has(form)) return;

  const textarea = form.querySelector(
    'textarea[name="comment[comment_content]"], textarea#comment_content'
  );
  if (!textarea) return;

  const cleanups = [];
  const draftKey = W.AO3H_CommentKit.draftKeyFor(
    workId,
    W.AO3H_CommentKit.draftScopeForForm(parentCommentIdFor(form))
  );

  // ── Auto-save ────────────────────────────────────────────────────────
  if (cfg('enableAutoSave') && workId) {
    // Restore draft
    const saved = loadDraft(draftKey);
    if (saved && !textarea.value.trim()) {
      textarea.value = saved;

      // Restoration notice
      const notice   = D.createElement('div');
      notice.className = `${NS}-draft-restored`;
      notice.innerHTML = '📝 Draft restored.';

      const dismiss  = D.createElement('button');
      dismiss.type   = 'button';
      dismiss.className = `${NS}-draft-restored-dismiss`;
      dismiss.title  = 'Dismiss';
      dismiss.textContent = '✕';
      notice.appendChild(dismiss);

      textarea.before(notice);

      const autoDismiss = setTimeout(() => notice.remove(), 10000);
      dismiss.addEventListener('click', () => { clearTimeout(autoDismiss); notice.remove(); });
      cleanups.push(() => { clearTimeout(autoDismiss); notice.remove(); });
    }

    // Auto-save on input
    let timer = null;
    const onInput = () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveDraft(draftKey, textarea.value), DEBOUNCE_MS);
    };
    textarea.addEventListener('input', onInput);
    const onBeforeUnload = () => saveDraft(draftKey, textarea.value);
    W.addEventListener('beforeunload', onBeforeUnload);

    // Clear draft on submit
    let submitTimer = null;
    const onSubmit = () => { submitTimer = setTimeout(() => {
      if (!textarea.value.trim()) clearDraft(draftKey);
    }, 1000); };
    form.addEventListener('submit', onSubmit);

    cleanups.push(() => {
      clearTimeout(timer);
      clearTimeout(submitTimer);
      textarea.removeEventListener('input', onInput);
      W.removeEventListener('beforeunload', onBeforeUnload);
      form.removeEventListener('submit', onSubmit);
    });
  }

  // ── Floating box ─────────────────────────────────────────────────────
  if (cfg('showFloatingBox')) {
    cleanups.push(buildFloatingBox(form, textarea));
  }

  // ── Character / word counter ─────────────────────────────────────────
  if (cfg('realtimeCounter')) {
    const counter   = D.createElement('div');
    counter.className = `${NS}-draft-counter`;

    function updateCounter () {
      const val   = textarea.value;
      const chars = val.length;
      const words = val.trim() ? val.trim().split(/\s+/).length : 0;
      counter.textContent = `${chars} char${chars !== 1 ? 's' : ''} · ${words} word${words !== 1 ? 's' : ''}`;
    }

    updateCounter();
    textarea.addEventListener('input', updateCounter);
    textarea.after(counter);
    cleanups.push(() => { counter.remove(); textarea.removeEventListener('input', updateCounter); });
  }
  formCleanups.set(form, () => cleanups.forEach(cleanup => cleanup()));
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Draft Management',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  if (!/^\/works\/\d+/.test(W.location.pathname)) return () => {};

  pruneOldDrafts();

  const workId = extractWorkIdFromHref(W.location.pathname);

  const enhanceAll = () =>
    D.querySelectorAll('form.comment.new, form.comment.edit').forEach(f => enhanceForm(f, workId));

  enhanceAll();

  const obs = observe(D.body, { childList: true, subtree: true }, enhanceAll);

  return () => {
    obs.disconnect();
    formCleanups.forEach(cleanup => cleanup());
    formCleanups.clear();
    D.querySelectorAll(`.${NS}-draft-restored, .${NS}-draft-counter, .${NS}-float-box-widget`).forEach(el => el.remove());
  };
});
