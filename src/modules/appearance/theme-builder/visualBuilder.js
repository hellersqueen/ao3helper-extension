/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Builder Submodule
    Submodule ID: visualBuilder
    Display Name: Visual Builder
    Source Module: Theme Builder

    - Feature: Visual CSS builder
      - Option: Point-and-click CSS creation
      - Option: No coding required
      - Option: Visual style controls

    - Feature: Live preview
      - Option: Real-time style preview
      - Option: See changes immediately
      - Option: Toggle preview on/off

    - Feature: Element inspector
      - Option: Inspect page elements
      - Option: Identify CSS selectors
      - Option: Target specific elements
      - Option: DevTools-like inspector

═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';

const W    = getGlobalWindow();
// Étape 318 : AO3H importé du core/lifecycle (avant : capture window.AO3H).
const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'visualBuilder';
const LOG  = `[AO3H][${MOD}]`;
const VISUAL_SK  = `${NS}:tb:visual`;
const PREVIEW_ID = `${NS}-tb-visual-preview`;

// ── Helpers ───────────────────────────────────────────────────────────────
function getShared () { return W.AO3H_ThemeBuilder || null; }
function applyCSS (css) { getShared()?.applyCSS(css, 'visual'); }

// ── Default visual config ─────────────────────────────────────────────────
const VISUAL_DEFAULTS = {
  accentColor:  '#900',
  bgColor:      '#ffffff',
  textColor:    '#333333',
  linkColor:    '#2a5298',
  headerBg:     '#333333',
  fontSize:     1.0,
  lineHeight:   1.5,
};

// ── Generate CSS from visual config ──────────────────────────────────────
function buildCSS (c) {
  return `
    body, #main         { background-color: ${c.bgColor} !important; color: ${c.textColor} !important; }
    a                   { color: ${c.linkColor} !important; }
    a:hover             { color: ${c.accentColor} !important; }
    #header             { background: ${c.headerBg} !important; }
    #header a           { color: #fff !important; }
    input[type="submit"], .action { background: ${c.accentColor} !important; border-color: ${c.accentColor} !important; }
    #workskin, .userstuff {
      font-size: ${c.fontSize}em !important;
      line-height: ${c.lineHeight} !important;
    }
  `;
}

function applyPreview (config) {
  let el = document.getElementById(PREVIEW_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = PREVIEW_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildCSS(config);
}

function removePreview () {
  document.getElementById(PREVIEW_ID)?.remove();
}

// ── Inspector mode ────────────────────────────────────────────────────────
let inspectorActive = false;
let inspectorHighlight = null;
let inspectorInfoEl   = null;

function getSimpleSelector (el) {
  if (el.id) return `#${el.id}`;
  const classes = Array.from(el.classList).slice(0, 3).join('.');
  return `${el.tagName.toLowerCase()}${classes ? '.' + classes : ''}`;
}

function startInspector (infoEl) {
  inspectorActive = true;
  inspectorInfoEl = infoEl;
  document.body.style.cursor = 'crosshair';

  if (!inspectorHighlight) {
    inspectorHighlight = document.createElement('div');
    inspectorHighlight.className = 'ao3h-tb-inspector-highlight';
    document.body.appendChild(inspectorHighlight);
  }
}

function stopInspector () {
  inspectorActive = false;
  document.body.style.cursor = '';
  inspectorHighlight?.remove();
  inspectorHighlight = null;
}

const onHover = e => {
  if (!inspectorActive) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (inspectorHighlight) {
    inspectorHighlight.style.top    = `${rect.top}px`;
    inspectorHighlight.style.left   = `${rect.left}px`;
    inspectorHighlight.style.width  = `${rect.width}px`;
    inspectorHighlight.style.height = `${rect.height}px`;
  }
};

const onClick = e => {
  if (!inspectorActive) return;
  e.preventDefault(); e.stopPropagation();
  const sel = getSimpleSelector(e.target);
  if (inspectorInfoEl) inspectorInfoEl.value = sel;
  stopInspector();
};

// ── Panel ─────────────────────────────────────────────────────────────────
let panelEl   = null;
let triggerBtn = null;

function openPanel () {
  if (panelEl) { panelEl.remove(); panelEl = null; stopInspector(); return; }

  const saved = lsGet(VISUAL_SK) || VISUAL_DEFAULTS;

  panelEl = document.createElement('div');
  panelEl.className = `${NS}-tb-panel`;
  panelEl.innerHTML = `
    <button class="${NS}-tb-panel-close" aria-label="Close visual builder">✕</button>
    <h4>🖌 Visual Builder</h4>

    <div class="${NS}-tb-section-title">Colors</div>
    ${colorRow('Accent / hover', 'accentColor', saved.accentColor)}
    ${colorRow('Background', 'bgColor', saved.bgColor)}
    ${colorRow('Text', 'textColor', saved.textColor)}
    ${colorRow('Links', 'linkColor', saved.linkColor)}
    ${colorRow('Header bg', 'headerBg', saved.headerBg)}

    <div class="${NS}-tb-section">
      <div class="${NS}-tb-section-title">Reading area</div>
      <label>Font size <span class="${NS}-tb-value-label" id="${NS}-vb-fs-val">${saved.fontSize}em</span></label>
      <input type="range" id="${NS}-vb-font-size" min="0.8" max="1.6" step="0.05" value="${saved.fontSize}">

      <label>Line height <span class="${NS}-tb-value-label" id="${NS}-vb-lh-val">${saved.lineHeight}</span></label>
      <input type="range" id="${NS}-vb-line-height" min="1.2" max="2.2" step="0.05" value="${saved.lineHeight}">
    </div>

    <div class="${NS}-tb-section">
      <div class="${NS}-tb-section-title">Inspector</div>
      <input type="text" id="${NS}-vb-selector" placeholder="Click 🎯 then click an element">
      <div class="${NS}-tb-row">
        <button class="${NS}-tb-btn" data-action="inspector">🎯 Pick element</button>
      </div>
    </div>

    <div class="${NS}-tb-row">
      <button class="${NS}-tb-btn primary" data-action="apply">Apply</button>
      <button class="${NS}-tb-btn" data-action="preview">Preview</button>
      <button class="${NS}-tb-btn" data-action="reset">Reset</button>
    </div>
  `;
  document.body.appendChild(panelEl);

  // ── Live labels ───────────────────────────────────────────────────────
  const fsR = panelEl.querySelector(`#${NS}-vb-font-size`);
  const lhR = panelEl.querySelector(`#${NS}-vb-line-height`);
  fsR.addEventListener('input', () => { panelEl.querySelector(`#${NS}-vb-fs-val`).textContent = `${fsR.value}em`; });
  lhR.addEventListener('input', () => { panelEl.querySelector(`#${NS}-vb-lh-val`).textContent = lhR.value; });

  // ── Actions ───────────────────────────────────────────────────────────
  function collectConfig () {
    return {
      accentColor: panelEl.querySelector('[data-field="accentColor"]').value,
      bgColor:     panelEl.querySelector('[data-field="bgColor"]').value,
      textColor:   panelEl.querySelector('[data-field="textColor"]').value,
      linkColor:   panelEl.querySelector('[data-field="linkColor"]').value,
      headerBg:    panelEl.querySelector('[data-field="headerBg"]').value,
      fontSize:    parseFloat(fsR.value),
      lineHeight:  parseFloat(lhR.value),
    };
  }

  panelEl.querySelector('[data-action="preview"]').addEventListener('click', () => {
    if (document.getElementById(PREVIEW_ID)) { removePreview(); return; }
    applyPreview(collectConfig());
  });

  panelEl.querySelector('[data-action="apply"]').addEventListener('click', () => {
    const config = collectConfig();
    lsSet(VISUAL_SK, config);
    applyCSS(buildCSS(config));
    console.log(LOG, 'Visual config applied');
  });

  panelEl.querySelector('[data-action="reset"]').addEventListener('click', () => {
    removePreview();
    getShared()?.removeCSS();
    lsSet(VISUAL_SK, null);
    panelEl?.remove(); panelEl = null;
  });

  const inspectorInfo = panelEl.querySelector(`#${NS}-vb-selector`);
  panelEl.querySelector('[data-action="inspector"]').addEventListener('click', () => {
    startInspector(inspectorInfo);
  });

  panelEl.querySelector(`.${NS}-tb-panel-close`).addEventListener('click', () => {
    stopInspector();
    panelEl?.remove(); panelEl = null;
  });
}

function colorRow (label, field, value) {
  return `
    <div class="${NS}-vb-color-row">
      <input type="color" value="${escapeHtml(value)}" data-field="${field}">
      <span class="${NS}-vb-color-row-label">${label}</span>
    </div>
  `;
}

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Visual Builder', parent: 'themeBuilder', enabledByDefault: true },
  async function init () {
    console.log(LOG, 'init');

    // Register inspector events
    document.addEventListener('mousemove', onHover);
    document.addEventListener('click', onClick, true);

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild plantait (Cannot read properties of null),
    // constaté sur plusieurs modules similaires en test.
    let active = true;
    onReady(() => {
      if (!active) return;
      triggerBtn = document.createElement('button');
      triggerBtn.className = `${NS}-tb-trigger ${NS}-tb-trigger--visual`;
      triggerBtn.textContent = '🖌';
      triggerBtn.setAttribute('aria-label', 'Open visual builder');
      triggerBtn.addEventListener('click', openPanel);
      document.body.appendChild(triggerBtn);
      if (getShared()?.cfg?.('mode') === 'css') triggerBtn.style.display = 'none';
    });

    return function cleanup () {
      active = false;
      stopInspector();
      removePreview();
      document.removeEventListener('mousemove', onHover);
      document.removeEventListener('click', onClick, true);
      panelEl?.remove();
      triggerBtn?.remove();
      panelEl = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
