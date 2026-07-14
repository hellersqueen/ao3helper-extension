/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Roulette Submodule
    Submodule ID: tropeRoulette
    Display Name: Trope Roulette
    Source Module: Trope Games

    - Feature: Random combo generation
      - Option: Generate 3 random tropes
      - Option: No duplicates in combo

    - Feature: AO3 search integration
      - Option: Build combined tag search URL

    - Feature: Modal dialog UI with spin again / search / close actions

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeRoulette';
const LOG  = `[AO3H][${MOD}]`;

// ── Helpers ───────────────────────────────────────────────────────────────
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

// ── Modal ─────────────────────────────────────────────────────────────────
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

// ── Trigger button ────────────────────────────────────────────────────────
function injectTrigger () {
  triggerBtn = document.createElement('button');
  triggerBtn.className = `${NS}-tg-btn ${NS}-tg-trigger-btn ${NS}-tg-roulette-trigger`;
  triggerBtn.textContent = '🎲 Roulette';
  triggerBtn.setAttribute('aria-label', 'Open Trope Roulette');
  triggerBtn.addEventListener('click', openModal);
  document.body.appendChild(triggerBtn);
}

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Trope Roulette', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    try {
      const s = JSON.parse(localStorage.getItem('ao3h:mod:tropeRoulette:settings') || '{}');
      if (s.enableRoulette === false) return () => {};
    } catch {}
    console.log(LOG, 'init');
    injectTrigger();

    return function cleanup () {
      closeModal();
      modalEl?.remove();
      triggerBtn?.remove();
      modalEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
