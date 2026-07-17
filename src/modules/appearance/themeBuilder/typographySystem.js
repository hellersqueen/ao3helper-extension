/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Builder › Typography System

Purpose
    Applies typography presets or custom body and heading fonts with adjustable
    font size, line height, and letter spacing.

Notes
    Typography settings are persisted and restored on page load. Generated CSS
    targets work and user content while allowing a separate heading font.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'typographySystem';
const LOG  = `[AO3H][${MOD}]`;
const TYPO_SK    = `${NS}:tb:typography`;
const STYLE_ID   = `${NS}-tb-typography`;



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — TYPOGRAPHY PRESETS
═══════════════════════════════════════════════════════════════════════════ */

const PRESETS = [
  { id: 'default',        label: 'AO3 Default',    fontFamily: 'inherit',                          fontFamilyHeading: 'inherit',                    fontSize: 1.0,  lineHeight: 1.5, letterSpacing: 0 },
  { id: 'serif-classic',  label: 'Serif Classic',  fontFamily: '"Georgia", serif',                 fontFamilyHeading: '"Palatino Linotype", serif', fontSize: 1.05, lineHeight: 1.7, letterSpacing: 0.01 },
  { id: 'sans-modern',    label: 'Sans Modern',    fontFamily: '"Helvetica Neue", sans-serif',      fontFamilyHeading: '"Arial", sans-serif',        fontSize: 1.0,  lineHeight: 1.6, letterSpacing: 0.02 },
  { id: 'ereader',        label: 'E-Reader',       fontFamily: '"Book Antiqua", Palatino, serif',   fontFamilyHeading: '"Georgia", serif',           fontSize: 1.1,  lineHeight: 1.8, letterSpacing: 0.0 },
  { id: 'high-contrast',  label: 'High Contrast',  fontFamily: '"Verdana", sans-serif',             fontFamilyHeading: '"Verdana", sans-serif',      fontSize: 1.1,  lineHeight: 1.7, letterSpacing: 0.03 },
  { id: 'custom',         label: '— Custom —',     fontFamily: 'inherit',                          fontFamilyHeading: 'inherit',                    fontSize: 1.0,  lineHeight: 1.5, letterSpacing: 0 },
];



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — TYPOGRAPHY CSS
═══════════════════════════════════════════════════════════════════════════ */

function buildCSS (config) {
  const ff  = config.fontFamily        || 'inherit';
  const ffh = config.fontFamilyHeading || ff;
  const fs  = config.fontSize          || 1.0;
  const lh  = config.lineHeight        || 1.5;
  const ls  = config.letterSpacing     ?? 0;
  return `
    #workskin, .userstuff, .work .userstuff {
      font-family: ${ff} !important;
      font-size: ${fs}em !important;
      line-height: ${lh} !important;
      letter-spacing: ${ls}em !important;
    }
    #workskin h1, #workskin h2, #workskin h3,
    #workskin h4, #workskin h5, #workskin h6,
    .userstuff h1, .userstuff h2, .userstuff h3,
    .userstuff h4, .userstuff h5, .userstuff h6 {
      font-family: ${ffh} !important;
    }
  `;
}

// Écrit le style sans persister — utilisé par l'aperçu en direct des curseurs
function previewTypography (config) {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildCSS(config);
}

function applyTypography (config) {
  previewTypography(config);
  lsSet(TYPO_SK, config);
}



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — TYPOGRAPHY CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

/** @type {HTMLDivElement|null} */
let panelEl = null;
/** @type {HTMLButtonElement|null} */
let triggerBtn = null;

function openPanel () {
  if (panelEl) { panelEl.remove(); panelEl = null; return; }

  const saved = lsGet(TYPO_SK) || PRESETS[0];
  const presetOpts = PRESETS.map(p =>
    `<option value="${p.id}"${saved.preset === p.id ? ' selected' : ''}>${p.label}</option>`
  ).join('');

  panelEl = document.createElement('div');
  panelEl.className = `${NS}-tb-panel`;
  panelEl.innerHTML = `
    <button class="${NS}-tb-panel-close" aria-label="Close typography">✕</button>
    <h4>Aa Typography</h4>

    <div class="${NS}-tb-section-title">Preset</div>
    <select class="${NS}-tb-select" id="${NS}-tb-preset-sel">${presetOpts}</select>

    <div class="${NS}-tb-section">
      <label>Body font family</label>
      <input type="text" id="${NS}-tb-font-family" value="${escapeHtml(saved.fontFamily || 'inherit')}">

      <label>Heading font family</label>
      <input type="text" id="${NS}-tb-font-family-heading" value="${escapeHtml(saved.fontFamilyHeading || saved.fontFamily || 'inherit')}">

      <label>Font size <span class="${NS}-tb-value-label" id="${NS}-tb-fs-val">${saved.fontSize || 1.0}em</span></label>
      <input type="range" id="${NS}-tb-font-size" min="0.8" max="1.6" step="0.05" value="${saved.fontSize || 1.0}">

      <label>Line height <span class="${NS}-tb-value-label" id="${NS}-tb-lh-val">${saved.lineHeight || 1.5}</span></label>
      <input type="range" id="${NS}-tb-line-height" min="1.2" max="2.2" step="0.05" value="${saved.lineHeight || 1.5}">

      <label>Letter spacing <span class="${NS}-tb-value-label" id="${NS}-tb-ls-val">${saved.letterSpacing || 0}em</span></label>
      <input type="range" id="${NS}-tb-letter-spacing" min="-0.02" max="0.1" step="0.005" value="${saved.letterSpacing || 0}">
    </div>

    <div class="${NS}-tb-row">
      <button class="${NS}-tb-btn primary" data-action="apply">Apply</button>
      <button class="${NS}-tb-btn" data-action="reset">Reset</button>
    </div>
  `;
  document.body.appendChild(panelEl);

  // ── Live update labels + live preview ─────────────────────────────────
  const fsRange = /** @type {HTMLInputElement} */ (panelEl.querySelector(`#${NS}-tb-font-size`));
  const lhRange = /** @type {HTMLInputElement} */ (panelEl.querySelector(`#${NS}-tb-line-height`));
  const lsRange = /** @type {HTMLInputElement} */ (panelEl.querySelector(`#${NS}-tb-letter-spacing`));

  // Aperçu en direct : chaque mouvement de curseur (ou changement de police)
  // s'applique immédiatement, sans persister — Apply enregistre, Reset annule.
  function collectCurrent () {
    return {
      preset:             panelEl.querySelector(`#${NS}-tb-preset-sel`).value,
      fontFamily:         panelEl.querySelector(`#${NS}-tb-font-family`).value,
      fontFamilyHeading:  panelEl.querySelector(`#${NS}-tb-font-family-heading`).value,
      fontSize:           parseFloat(fsRange.value),
      lineHeight:         parseFloat(lhRange.value),
      letterSpacing:      parseFloat(lsRange.value),
    };
  }
  const livePreview = () => previewTypography(collectCurrent());

  fsRange.addEventListener('input', () => { panelEl.querySelector(`#${NS}-tb-fs-val`).textContent = `${fsRange.value}em`; livePreview(); });
  lhRange.addEventListener('input', () => { panelEl.querySelector(`#${NS}-tb-lh-val`).textContent = lhRange.value; livePreview(); });
  lsRange.addEventListener('input', () => { panelEl.querySelector(`#${NS}-tb-ls-val`).textContent = `${lsRange.value}em`; livePreview(); });
  panelEl.querySelector(`#${NS}-tb-font-family`).addEventListener('input', livePreview);
  panelEl.querySelector(`#${NS}-tb-font-family-heading`).addEventListener('input', livePreview);

  // ── Preset selection fills fields ─────────────────────────────────────
  const presetSelect = /** @type {HTMLSelectElement} */ (panelEl.querySelector(`#${NS}-tb-preset-sel`));
  presetSelect.addEventListener('change', () => {
    const p = PRESETS.find(x => x.id === presetSelect.value);
    if (!p || p.id === 'custom') return;
    panelEl.querySelector(`#${NS}-tb-font-family`).value = p.fontFamily;
    panelEl.querySelector(`#${NS}-tb-font-family-heading`).value = p.fontFamilyHeading || p.fontFamily;
    fsRange.value = String(p.fontSize);
    lhRange.value = String(p.lineHeight);
    lsRange.value = String(p.letterSpacing);
    fsRange.dispatchEvent(new Event('input'));
    lhRange.dispatchEvent(new Event('input'));
    lsRange.dispatchEvent(new Event('input'));
  });

  panelEl.querySelector('[data-action="apply"]').addEventListener('click', () => {
    const fontFamilyInput = /** @type {HTMLInputElement} */ (panelEl.querySelector(`#${NS}-tb-font-family`));
    const headingInput = /** @type {HTMLInputElement} */ (panelEl.querySelector(`#${NS}-tb-font-family-heading`));
    const config = {
      preset:             presetSelect.value,
      fontFamily:         fontFamilyInput.value,
      fontFamilyHeading:  headingInput.value,
      fontSize:           parseFloat(fsRange.value),
      lineHeight:         parseFloat(lhRange.value),
      letterSpacing:      parseFloat(lsRange.value),
    };
    applyTypography(config);
    console.log(LOG, 'Typography applied:', config);
  });

  panelEl.querySelector('[data-action="reset"]').addEventListener('click', () => {
    document.getElementById(STYLE_ID)?.remove();
    lsSet(TYPO_SK, null);
    panelEl?.remove(); panelEl = null;
  });

  panelEl.querySelector(`.${NS}-tb-panel-close`).addEventListener('click', () => {
    // Fermer sans Apply : on revient à la configuration enregistrée
    const savedCfg = lsGet(TYPO_SK);
    if (savedCfg) previewTypography(savedCfg);
    else document.getElementById(STYLE_ID)?.remove();
    panelEl?.remove(); panelEl = null;
  });
}



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Typography System', parent: 'themeBuilder', enabledByDefault: true },
  async function init () {
    console.log(LOG, 'init');

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild plantait (Cannot read properties of null),
    // constaté sur plusieurs modules similaires en test.
    let active = true;
    onReady(() => {
      if (!active) return;
      // Re-apply saved typography on load
      const saved = lsGet(TYPO_SK);
      if (saved) applyTypography(saved);

      triggerBtn = document.createElement('button');
      triggerBtn.className = `${NS}-tb-trigger ${NS}-tb-trigger--typography`;
      triggerBtn.textContent = 'Aa';
      triggerBtn.setAttribute('aria-label', 'Open typography panel');
      triggerBtn.addEventListener('click', openPanel);
      document.body.appendChild(triggerBtn);
    });

    return function cleanup () {
      active = false;
      document.getElementById(STYLE_ID)?.remove();
      panelEl?.remove();
      triggerBtn?.remove();
      panelEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
