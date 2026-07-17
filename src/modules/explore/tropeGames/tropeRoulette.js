/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Trope Roulette

Generates three unique random tropes and presents them in a modal with controls
for rerolling or opening a combined AO3 search.

Notes

- Tropes come from the coordinator’s shared canonical list.
- Search links open in a separate protected tab.
- The modal closes through its button, backdrop, or Escape key.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { onReady } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeRoulette';
const LOG  = `[AO3H][${MOD}]`;


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RANDOM COMBINATION AND AO3 SEARCH
═══════════════════════════════════════════════════════════════════════════ */

function getTropeList () {
  return W.AO3H_TropeGames?.TROPE_LIST || [];
}

function pickRandom (n) {
  const list = getTropeList();
  if (!list.length) return [];
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function buildSearchUrl (tropes) {
  const query = tropes.map(t => encodeURIComponent(t)).join('+');
  return `https://archiveofourown.org/works?work_search[query]=${query}`;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ROULETTE MODAL
═══════════════════════════════════════════════════════════════════════════ */

let modalEl  = null;
let triggerBtn = null;
let onKey = null;

function renderModal (tropes) {
  const li = tropes.map(t => `<li>${escapeHtml(t)}</li>`).join('');
  return `
    <div class="${NS}-tg-roulette-inner" role="dialog" aria-modal="true" aria-label="Trope Roulette">
      <button class="${NS}-tg-modal-close" aria-label="Close roulette">✕</button>
      <div class="${NS}-tg-roulette-title">🎲 Trope Roulette</div>
      <p class="${NS}-tg-roulette-tagline">Feeling adventurous?</p>
      <ul class="${NS}-tg-roulette-tropes">${li}</ul>
      <div class="${NS}-tg-roulette-actions">
        <button class="${NS}-tg-btn ${NS}-tg-spin-again">Spin Again</button>
        <a class="${NS}-tg-btn" href="${escapeHtml(buildSearchUrl(tropes))}"
           target="_blank" rel="noopener noreferrer">Search AO3 ↗</a>
      </div>
    </div>
  `;
}

function openModal () {
  const tropes = pickRandom(3);
  if (!tropes.length) return;

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = `${NS}-tg-roulette-modal`;
    // Backdrop click — wired once on creation
    modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = renderModal(tropes);
  modalEl.style.display = 'flex';

  modalEl.querySelector(`.${NS}-tg-modal-close`).addEventListener('click', closeModal);
  modalEl.querySelector(`.${NS}-tg-spin-again`).addEventListener('click', () => openModal());

  // Keyboard close — remove previous listener before adding new one
  if (onKey) document.removeEventListener('keydown', onKey);
  onKey = e => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', onKey);
}

function closeModal () {
  if (modalEl) { modalEl.style.display = 'none'; }
  if (onKey) { document.removeEventListener('keydown', onKey); onKey = null; }
}

function injectTrigger () {
  triggerBtn = document.createElement('button');
  triggerBtn.className = `${NS}-tg-btn ${NS}-tg-trigger-btn ${NS}-tg-roulette-trigger`;
  triggerBtn.textContent = '🎲 Roulette';
  triggerBtn.setAttribute('aria-label', 'Open Trope Roulette');
  triggerBtn.addEventListener('click', openModal);
  document.body.appendChild(triggerBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Roulette', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    if (loadModuleSettings(MOD).enableRoulette === false) return () => {};
    console.log(LOG, 'init');
    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild plantait (Cannot read properties of null),
    // constaté sur plusieurs modules similaires en test.
    let active = true;
    onReady(() => {
      if (!active) return;
      injectTrigger();
    });

    return function cleanup () {
      active = false;
      closeModal();
      modalEl?.remove();
      triggerBtn?.remove();
      modalEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
