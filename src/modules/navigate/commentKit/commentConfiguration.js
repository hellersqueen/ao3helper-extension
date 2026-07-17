/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit › Comment Configuration

Adds chapter context to inbox comments and applies the configured guest-comment
default on work forms.

Notes

- Chapter indicators are enabled by default.
- Guest comments are enabled only when the parent setting opts into the behavior.
- Original checkbox states are restored during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { observe, onReady } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'commentConfiguration';
const NS   = 'ao3h';

const DEFAULTS = {
  chapterIndicator:   true,   // show chapter badge on inbox comments
  guestCommentsDefault: false, // auto-tick "Allow guest comments" on new works
};
const guestCheckboxStates = new Map();

const cfg = makeCfg('commentKit', DEFAULTS);

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — INBOX CHAPTER INDICATORS
═══════════════════════════════════════════════════════════════════════════ */

function addChapterIndicators () {
  // AO3 inbox: each comment is in a <li class="comment"> or a dashboard comment block
  document.querySelectorAll('.comment .heading, .inbox-comments .comment_content h4').forEach(heading => {
    if (heading.querySelector(`.${NS}-ch-badge`)) return; // already done

    const link  = heading.querySelector('a[href*="/works/"]');
    if (!link) return;

    const match = link.href.match(/\/works\/\d+\/chapters\/(\d+)/);
    if (!match) return;

    const badge = document.createElement('span');
    badge.className = `${NS}-ch-badge`;
    badge.textContent = `Ch ${match[1]}`;
    badge.title = 'Chapter number';
    badge.style.cssText =
      'display:inline-block;margin-left:0.4em;padding:1px 5px;font-size:0.78em;' +
      'background:#2a6496;color:#fff;border-radius:3px;vertical-align:middle;' +
      'font-weight:normal;';
    heading.appendChild(badge);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — GUEST-COMMENT DEFAULT
═══════════════════════════════════════════════════════════════════════════ */

function applyGuestCommentDefault () {
  // Only on the new-work / edit-work form
  if (!/\/works\/(new|edit|\d+\/edit)/.test(location.pathname)) return;

  const checkbox = document.querySelector('#work_allow_anon_commenting');
  if (!checkbox || checkbox.dataset.ao3hDefault) return;
  guestCheckboxStates.set(checkbox, checkbox.checked);
  checkbox.dataset.ao3hDefault = '1';
  checkbox.checked = true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Comment Configuration',
  parent:           'commentKit',
  enabledByDefault: true,
}, async function init () {
  const cleanups = [];

  // document.body peut ne pas encore exister quand ce module boote — sans ce
  // report, l'observer plantait (Cannot read properties of null), constaté
  // sur plusieurs modules similaires en test.
  let active = true;
  onReady(() => {
    if (!active) return;
    if (cfg('chapterIndicator')) {
      addChapterIndicators();
      const obs = observe(document.body, { childList: true, subtree: true }, addChapterIndicators);
      cleanups.push(() => obs.disconnect());
    }

    if (cfg('guestCommentsDefault')) {
      applyGuestCommentDefault();
    }
  });

  return () => {
    active = false;
    cleanups.forEach(fn => fn());
    document.querySelectorAll(`.${NS}-ch-badge`).forEach(badge => badge.remove());
    guestCheckboxStates.forEach((checked, checkbox) => {
      checkbox.checked = checked;
      delete checkbox.dataset.ao3hDefault;
    });
    guestCheckboxStates.clear();
  };
});
