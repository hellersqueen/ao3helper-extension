/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Formatter › Reading Controls

Adds a floating work-page panel for adjusting reading width, line spacing, text
scale, and first-line indentation.

Notes

- Each display preference persists through the coordinator's storage helpers.
- Text scale is constrained between 85 and 140 percent.
- Shared classes and route checks come from `AO3H_RF`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'readingControls';
const LOG = `[AO3H][readingFormatter/${MOD}]`;

const PK_WIDTH   = 'readingFormatter:width';
const PK_SPACING = 'readingFormatter:spacing';
const PK_SCALE   = 'readingFormatter:scale';
const PK_INDENT  = 'readingFormatter:indent';

const WIDTH_PRESETS = [
  { id: 'default', label: 'Default', value: null   },
  { id: 'narrow',  label: 'Narrow',  value: '48ch' },
  { id: 'book',    label: 'Book',    value: '60ch' },
  { id: 'medium',  label: 'Medium',  value: '75ch' },
  { id: 'wide',    label: 'Wide',    value: '90ch' },
];

const PANEL_ID = `${NS}-rf-panel`;
const BTN_ID   = `${NS}-rf-btn`;

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READING CONTROLS PANEL
═══════════════════════════════════════════════════════════════════════════ */

function buildPanel (width, spacing, scale, indent) {
  const panel = document.createElement('div');
  panel.id        = PANEL_ID;
  panel.className = `${NS}-rf-panel`;
  panel.hidden    = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Reading Formatter controls');

  const widthBtns = WIDTH_PRESETS.map(p =>
    `<button class="${NS}-rf-width-btn${width === p.id ? ` ${NS}-rf-active-btn` : ''}"
             data-width="${p.id}">${p.label}</button>`
  ).join('');

  const spacingOpts = [
    { id: 'compact',  label: 'Compact',  val: 1.4 },
    { id: 'normal',   label: 'Normal',   val: 1.6 },
    { id: 'spacious', label: 'Spacious', val: 1.9 },
  ];
  const spacingBtns = spacingOpts.map(o =>
    `<button class="${NS}-rf-spacing-btn${Math.abs(spacing - o.val) < 0.05 ? ` ${NS}-rf-active-btn` : ''}"
             data-spacing="${o.val}">${o.label}</button>`
  ).join('');

  panel.innerHTML = `
    <div class="${NS}-rf-panel-section">
      <span class="${NS}-rf-section-label">Width</span>
      <div class="${NS}-rf-btn-group">${widthBtns}</div>
    </div>
    <div class="${NS}-rf-panel-section">
      <span class="${NS}-rf-section-label">Spacing</span>
      <div class="${NS}-rf-btn-group">${spacingBtns}</div>
    </div>
    <div class="${NS}-rf-panel-section">
      <span class="${NS}-rf-section-label">Text size</span>
      <div class="${NS}-rf-btn-group">
        <button class="${NS}-rf-scale-btn" data-delta="-0.1" aria-label="Decrease font size">A−</button>
        <span class="${NS}-rf-scale-display">${Math.round(scale * 100)}%</span>
        <button class="${NS}-rf-scale-btn" data-delta="0.1"  aria-label="Increase font size">A+</button>
      </div>
    </div>
    <div class="${NS}-rf-panel-section">
      <label class="${NS}-rf-toggle-row">
        <input type="checkbox" class="${NS}-rf-indent-toggle"${indent ? ' checked' : ''}>
        Remove indentation
      </label>
    </div>
  `;
  return panel;
}

function buildToggleBtn () {
  const btn       = document.createElement('button');
  btn.id          = BTN_ID;
  btn.className   = `${NS}-rf-toggle-btn`;
  btn.textContent = 'Aa';
  btn.title       = 'Reading formatter controls';
  btn.setAttribute('aria-controls', PANEL_ID);
  btn.setAttribute('aria-expanded', 'false');
  return btn;
}

function attachPanelEvents (btn, panel, state, prefSet, applyReadingVars) {
  // Toggle panel open
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !panel.hidden;
    panel.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
  });

  // Close on outside click
  const onOutsideClick = (e) => {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  };
  document.addEventListener('click', onOutsideClick);

  // Width buttons
  panel.querySelectorAll(`.${NS}-rf-width-btn`).forEach(b => {
    b.addEventListener('click', () => {
      state.width = b.dataset.width;
      prefSet(PK_WIDTH, state.width);
      applyReadingVars();
      panel.querySelectorAll(`.${NS}-rf-width-btn`).forEach(x =>
        x.classList.toggle(`${NS}-rf-active-btn`, x.dataset.width === state.width)
      );
    });
  });

  // Spacing buttons
  panel.querySelectorAll(`.${NS}-rf-spacing-btn`).forEach(b => {
    b.addEventListener('click', () => {
      state.spacing = parseFloat(b.dataset.spacing);
      prefSet(PK_SPACING, state.spacing);
      applyReadingVars();
      panel.querySelectorAll(`.${NS}-rf-spacing-btn`).forEach(x =>
        x.classList.toggle(`${NS}-rf-active-btn`, Math.abs(parseFloat(x.dataset.spacing) - state.spacing) < 0.05)
      );
    });
  });

  // Scale buttons
  panel.querySelectorAll(`.${NS}-rf-scale-btn`).forEach(b => {
    b.addEventListener('click', () => {
      const delta = parseFloat(b.dataset.delta);
      state.scale = Math.min(1.4, Math.max(0.85, parseFloat((state.scale + delta).toFixed(2))));
      prefSet(PK_SCALE, state.scale);
      applyReadingVars();
      const disp = panel.querySelector(`.${NS}-rf-scale-display`);
      if (disp) disp.textContent = `${Math.round(state.scale * 100)}%`;
    });
  });

  // Indent toggle
  panel.querySelector(`.${NS}-rf-indent-toggle`)?.addEventListener('change', (e) => {
    state.indent = e.target.checked;
    prefSet(PK_INDENT, state.indent);
    applyReadingVars();
  });

  return () => { document.removeEventListener('click', onOutsideClick); };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Reading Controls',
  parent:           'readingFormatter',
  enabledByDefault: true,
}, async function init () {
  const RF = W.AO3H_RF;
  if (!RF) { console.warn(`${LOG} W.AO3H_RF not ready`); return () => {}; }

  const { ROOT_CLS, NOINDENT_CLS, isWorkPage, prefGet, prefSet } = RF;

  if (!isWorkPage() || !document.getElementById('workskin')) return () => {};

  const state = {
    scale:   prefGet(PK_SCALE,   1.0),
    spacing: prefGet(PK_SPACING, 1.6),
    width:   prefGet(PK_WIDTH,   'default'),
    indent:  prefGet(PK_INDENT,  false),
  };

  const html = document.documentElement;

  function applyReadingVars () {
    html.style.setProperty('--ao3h-rf-scale',   String(state.scale));
    html.style.setProperty('--ao3h-rf-spacing', String(state.spacing));
    const preset = WIDTH_PRESETS.find(p => p.id === state.width) || WIDTH_PRESETS[0];
    if (preset.value) {
      html.style.setProperty('--ao3h-rf-width', preset.value);
    } else {
      html.style.removeProperty('--ao3h-rf-width');
    }
    if (state.indent) {
      html.classList.add(NOINDENT_CLS);
    } else {
      html.classList.remove(NOINDENT_CLS);
    }
  }

  function removeReadingVars () {
    html.style.removeProperty('--ao3h-rf-scale');
    html.style.removeProperty('--ao3h-rf-spacing');
    html.style.removeProperty('--ao3h-rf-width');
    html.classList.remove(NOINDENT_CLS);
  }

  html.classList.add(ROOT_CLS);
  applyReadingVars();

  const btn   = buildToggleBtn();
  const panel = buildPanel(state.width, state.spacing, state.scale, state.indent);
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  const detachPanel = attachPanelEvents(btn, panel, state, prefSet, applyReadingVars);

  return () => {
    detachPanel?.();
    btn.remove();
    panel.remove();
    removeReadingVars();
    html.classList.remove(ROOT_CLS);
  };
});
