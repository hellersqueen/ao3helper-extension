/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Archive Warnings Display Submodule
    Submodule ID: archiveWarningsDisplay
    Parent: tagsDisplay
    Display Name: Archive Warnings Display

    Replaces verbose AO3 archive warning text with compact, recognizable icons.
    This is a UX polish feature for faster scanning, not a filtering system.

    Features:
      - compactWarnings  : replace warning text with icons (master toggle)
      - archiveWarningsStyle : 'icon' | 'text' | 'badge' (default: 'icon')

    Fixed icon set (not customizable):
        ⚠️  Graphic Depictions Of Violence
        💀  Major Character Death
        🚫  Underage
        ⛔  Rape/Non-Con
        ❓  Creator Chose Not To Use Archive Warnings (always full text)
        ✓   No Archive Warnings Apply

    Accessibility: aria-label + title + tabindex=0 on every icon.
    MutationObserver: scans new nodes added to #main.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';
import { observe } from '../../../../lib/utils/index.js';

const MOD  = 'archiveWarningsDisplay';
const NS   = 'ao3h';

// ── Config ────────────────────────────────────────────────────────────────
function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}

// ── Constants ─────────────────────────────────────────────────────────────
const WARNING_ICONS = {
  'Graphic Depictions Of Violence'              : { icon: '⚠️', abbrev: 'Violence' },
  'Major Character Death'                       : { icon: '💀', abbrev: 'MCD' },
  'Underage'                                    : { icon: '🚫', abbrev: 'Underage' },
  'Rape/Non-Con'                                : { icon: '⛔', abbrev: 'Non-Con' },
  'Creator Chose Not To Use Archive Warnings'   : { icon: '❓', abbrev: null, alwaysFullText: true },
  'No Archive Warnings Apply'                   : { icon: '✓',  abbrev: 'No Warnings' },
};

const WARNING_SELECTOR = 'li.warnings a.tag, .warning.tags a, dd.warning.tags a';

// ── Conversion ────────────────────────────────────────────────────────────
function convertSingleWarning (tag, style) {
  if (!tag || tag.dataset.ao3hConverted) return;

  const originalText = tag.textContent.trim();
  const info = WARNING_ICONS[originalText];
  if (!info) return;

  tag.dataset.ao3hOriginalText = originalText;
  tag.dataset.ao3hConverted    = 'true';

  if (info.alwaysFullText) {
    tag.classList.add(`${NS}-warning-cntw`);
    return;
  }

  const span = document.createElement('span');
  span.className = `${NS}-warning-icon`;
  span.textContent = style === 'text'  ? (info.abbrev || originalText.split(' ')[0])
                   : style === 'badge' ? `${info.icon} ${info.abbrev || ''}`
                   :                     info.icon;
  span.setAttribute('aria-label', originalText);
  span.setAttribute('title',      originalText);
  span.setAttribute('role',       'img');
  span.setAttribute('tabindex',   '0');

  tag.textContent = '';
  tag.appendChild(span);
  tag.classList.add(`${NS}-warning-compact`);
}

function convertAll (style) {
  document.querySelectorAll(WARNING_SELECTOR).forEach(tag => convertSingleWarning(tag, style));
}

function restoreAll () {
  document.querySelectorAll('[data-ao3h-converted="true"]').forEach(tag => {
    const orig = tag.dataset.ao3hOriginalText;
    if (orig) {
      tag.textContent = orig;
      tag.classList.remove(`${NS}-warning-compact`, `${NS}-warning-cntw`);
      delete tag.dataset.ao3hConverted;
      delete tag.dataset.ao3hOriginalText;
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRATION
// ══════════════════════════════════════════════════════════════════════════

register(MOD, {
  title            : 'Archive Warnings Display',
  parent           : 'tagsDisplay',
  enabledByDefault : true,
}, async function init () {

  if (!cfg('compactWarnings', true)) return () => {};

  const style = cfg('archiveWarningsStyle', 'icon');

  convertAll(style);

  const main = document.querySelector('#main') || document.body;
  const obs = observe(main, { childList: true, subtree: true }, () => convertAll(style));

  return () => {
    obs.disconnect();
    restoreAll();
  };
});
