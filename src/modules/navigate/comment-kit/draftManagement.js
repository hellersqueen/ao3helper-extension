/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Draft Management Submodule
    Submodule ID: draftManagement
    Parent Module: commentKit
    Display Name: Draft Management

    - Feature: Auto-save comment drafts
      - Auto-save as you type (500 ms debounce)
      - Per-work localStorage persistence (key: ao3h:draft:{workId})
      - Draft restored on page reload with a dismissable notification (auto-dismiss 10s)
      - Draft cleared automatically after successful form submit
      - Old drafts (>30 days) cleaned up on init

    - Feature: Real-time character / word counter
      - Live "N chars · N words" display below each comment textarea
      - Updates on every keystroke

    - Feature: Floating comment box
      - Sticky panel fixed at bottom-right of the viewport
      - Appears when the native comment form scrolls out of view
      - Two-way sync with the real textarea
      - "Post Comment" button submits the real form
      - Minimize / expand toggle

    Settings (read from parent commentKit panel):
        enableAutoSave   [default: true]
        realtimeCounter  [default: true]
        showFloatingBox  [default: false]

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';

const W    = getGlobalWindow();
const D    = document;
const MOD  = 'draftManagement';
const NS   = 'ao3h';

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  enableAutoSave  : true,
  realtimeCounter : true,
  showFloatingBox : false,
};

const cfg = makeCfg('commentKit', DEFAULTS);

// ── Storage helpers ───────────────────────────────────────────────────────
const DRAFT_PREFIX  = `${NS}:draft:`;
const MAX_AGE_MS    = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEBOUNCE_MS   = 500;

function draftKey (workId) { return `${DRAFT_PREFIX}${workId}`; }

function saveDraft (workId, content) {
  try {
    if (content.trim()) {
      localStorage.setItem(draftKey(workId), JSON.stringify({ content, ts: Date.now() }));
    } else {
      localStorage.removeItem(draftKey(workId));
    }
  } catch (_) {}
}

function loadDraft (workId) {
  try {
    const raw = localStorage.getItem(draftKey(workId));
    if (!raw) return null;
    const { content, ts } = JSON.parse(raw);
    if (Date.now() - ts > MAX_AGE_MS) { localStorage.removeItem(draftKey(workId)); return null; }
    return content || null;
  } catch (_) { return null; }
}

function clearDraft (workId) {
  try { localStorage.removeItem(draftKey(workId)); } catch (_) {}
}

function pruneOldDrafts () {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key?.startsWith(DRAFT_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const { ts } = JSON.parse(raw);
      if (Date.now() - (ts || 0) > MAX_AGE_MS) localStorage.removeItem(key);
    }
  } catch (_) {}
}

// ── Floating comment box ─────────────────────────────────────────────────

function buildFloatingBox (form, textarea) {
  const box = D.createElement('div');
  box.className = `${NS}-floating-box ${NS}-float-box-widget`;

  // Header
  const header = D.createElement('div');
  header.className = `${NS}-floating-box-header`;
  const title = D.createElement('span');
  title.textContent = '💬 Comment';
  const toggleBtn = D.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = `${NS}-floating-box-toggle`;
  toggleBtn.textContent = '−';
  toggleBtn.title = 'Minimize';
  header.appendChild(title);
  header.appendChild(toggleBtn);

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
    box.remove();
  };
}

// ── Per-form enhancement ──────────────────────────────────────────────────

const formCleanups = new Map();

function enhanceForm (form, workId) {
  if (formCleanups.has(form)) return;

  const textarea = form.querySelector(
    'textarea[name="comment[comment_content]"], textarea#comment_content'
  );
  if (!textarea) return;

  const cleanups = [];

  // ── Auto-save ────────────────────────────────────────────────────────
  if (cfg('enableAutoSave') && workId) {
    // Restore draft
    const saved = loadDraft(workId);
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
      timer = setTimeout(() => saveDraft(workId, textarea.value), DEBOUNCE_MS);
    };
    textarea.addEventListener('input', onInput);
    const onBeforeUnload = () => saveDraft(workId, textarea.value);
    W.addEventListener('beforeunload', onBeforeUnload);

    // Clear draft on submit
    let submitTimer = null;
    const onSubmit = () => { submitTimer = setTimeout(() => {
      if (!textarea.value.trim()) clearDraft(workId);
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

// ── Module registration ───────────────────────────────────────────────────

register(MOD, {
  title:            'Draft Management',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  if (!/^\/works\/\d+/.test(W.location.pathname)) return () => {};

  pruneOldDrafts();

  const workId = (W.location.pathname.match(/\/works\/(\d+)/) || [])[1] || null;

  const enhanceAll = () =>
    D.querySelectorAll('form.comment.new, form.comment.edit').forEach(f => enhanceForm(f, workId));

  enhanceAll();

  const obs = new MutationObserver(enhanceAll);
  obs.observe(D.body, { childList: true, subtree: true });

  return () => {
    obs.disconnect();
    formCleanups.forEach(cleanup => cleanup());
    formCleanups.clear();
    D.querySelectorAll(`.${NS}-draft-restored, .${NS}-draft-counter, .${NS}-float-box-widget`).forEach(el => el.remove());
  };
});
