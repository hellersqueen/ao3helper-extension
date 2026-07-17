/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Archive Warnings Display

Replaces verbose AO3 archive-warning labels with compact icon, text, or badge
representations to make work listings easier to scan.

Notes

- The warning-to-icon mapping is fixed and does not filter any works.
- “Creator Chose Not To Use Archive Warnings” remains fully visible.
- Compact warnings retain accessible labels, titles, roles, and keyboard focus.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';
import { observe } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'archiveWarningsDisplay';
const NS   = 'ao3h';

function cfg (key, fallback) {
  try {
    const v = Flags.get(`mod:tagsDisplay:${key}`);
    if (v !== undefined && v !== null) return v;
  } catch { /* */ }
  return fallback;
}

// Clés vérifiées identiques à lib/ao3/constants.js ARCHIVE_WARNINGS (forme
// tag canonique) — gardées ici en objet plutôt qu'importées car chaque
// entrée porte aussi son icône/abréviation, pas juste le libellé.
const WARNING_ICONS = {
  'Graphic Depictions Of Violence'              : { icon: '⚠️', abbrev: 'Violence' },
  'Major Character Death'                       : { icon: '💀', abbrev: 'MCD' },
  'Underage'                                    : { icon: '🚫', abbrev: 'Underage' },
  'Rape/Non-Con'                                : { icon: '⛔', abbrev: 'Non-Con' },
  'Creator Chose Not To Use Archive Warnings'   : { icon: '❓', abbrev: null, alwaysFullText: true },
  'No Archive Warnings Apply'                   : { icon: '✓',  abbrev: 'No Warnings' },
};

const WARNING_SELECTOR = 'li.warnings a.tag, .warning.tags a, dd.warning.tags a';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — WARNING CONVERSION AND RESTORATION
═══════════════════════════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
