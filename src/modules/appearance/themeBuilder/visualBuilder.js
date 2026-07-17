/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Builder › Visual Builder

Purpose
    Builds a theme from color and reading controls, provides a temporary CSS
    preview, and identifies simple selectors through a visual inspector.

Notes
    Applied configurations are persisted and delegated to the Theme Builder
    coordinator. Preview CSS remains temporary. Inspector listeners and visual
    overlays are removed during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import {
  contrastRatio,
  contrastVerdict,
  COLORBLIND_PALETTES,
  buildElementRule,
  findProtectedViolations,
} from './themeSafety.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'visualBuilder';
const LOG  = `[AO3H][${MOD}]`;
const VISUAL_SK  = `${NS}:tb:visual`;
const PREVIEW_ID = `${NS}-tb-visual-preview`;
const ELEMENT_RULES_SK = `${NS}:tb:elementRules`;
const ELEMENT_STYLE_ID = `${NS}-tb-element-rules`;

function getShared () { return W.AO3H_ThemeBuilder || null; }
function applyCSS (css) { getShared()?.applyCSS(css, 'visual'); }

const VISUAL_DEFAULTS = {
  accentColor:  '#900',
  bgColor:      '#ffffff',
  textColor:    '#333333',
  linkColor:    '#2a5298',
  headerBg:     '#333333',
  fontSize:     1.0,
  lineHeight:   1.5,
};



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — VISUAL THEME CSS
═══════════════════════════════════════════════════════════════════════════ */

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

/* ── Persistent per-element rules built from the inspector ─────────────── */

function applyElementRules () {
  const css = lsGet(ELEMENT_RULES_SK) || '';
  let el = document.getElementById(ELEMENT_STYLE_ID);
  if (!css) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('style');
    el.id = ELEMENT_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function appendElementRule (rule) {
  const css = (lsGet(ELEMENT_RULES_SK) || '');
  lsSet(ELEMENT_RULES_SK, css ? `${css}\n${rule}` : rule);
  applyElementRules();
}

function clearElementRules () {
  lsSet(ELEMENT_RULES_SK, '');
  applyElementRules();
}



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ELEMENT INSPECTOR
═══════════════════════════════════════════════════════════════════════════ */

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



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — VISUAL CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

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
    <div id="${NS}-vb-contrast" class="${NS}-vb-contrast" aria-live="polite"></div>
    <div class="${NS}-tb-row">
      ${COLORBLIND_PALETTES.map(p => `<button class="${NS}-tb-btn" data-palette="${p.id}">${p.label}</button>`).join('')}
    </div>

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
      <div class="${NS}-vb-el-style" id="${NS}-vb-el-style">
        <label>Text <input type="color" id="${NS}-vb-el-color" value="#333333"></label>
        <label>Background <input type="color" id="${NS}-vb-el-bg" value="#ffffff"></label>
        <label><input type="checkbox" id="${NS}-vb-el-hide"> Hide element</label>
        <div class="${NS}-tb-row">
          <button class="${NS}-tb-btn" data-action="style-element">Apply to element</button>
          <button class="${NS}-tb-btn" data-action="clear-element-rules">Clear element styles</button>
        </div>
        <div id="${NS}-vb-el-status" aria-live="polite"></div>
      </div>
    </div>

    <div class="${NS}-tb-row">
      <button class="${NS}-tb-btn primary" data-action="apply">Apply</button>
      <button class="${NS}-tb-btn" data-action="preview">Preview</button>
      <button class="${NS}-tb-btn" data-action="reset">Reset</button>
    </div>
  `;
  document.body.appendChild(panelEl);

  // ── Live labels + live preview ────────────────────────────────────────
  const fsR = panelEl.querySelector(`#${NS}-vb-font-size`);
  const lhR = panelEl.querySelector(`#${NS}-vb-line-height`);
  // Sliders and color pickers preview live — no need to press Apply to see
  // the result (Apply persists, Reset discards).
  const livePreview = () => { applyPreview(collectConfig()); updateContrast(); };
  fsR.addEventListener('input', () => { panelEl.querySelector(`#${NS}-vb-fs-val`).textContent = `${fsR.value}em`; livePreview(); });
  lhR.addEventListener('input', () => { panelEl.querySelector(`#${NS}-vb-lh-val`).textContent = lhR.value; livePreview(); });
  panelEl.querySelectorAll('input[type="color"][data-field]').forEach(inp => {
    inp.addEventListener('input', livePreview);
  });

  // ── Contrast check (WCAG) ─────────────────────────────────────────────
  const contrastEl = panelEl.querySelector(`#${NS}-vb-contrast`);
  function updateContrast () {
    const c = collectConfig();
    const checks = [
      { label: 'text/background',  ratio: contrastRatio(c.textColor, c.bgColor) },
      { label: 'links/background', ratio: contrastRatio(c.linkColor, c.bgColor) },
    ];
    contrastEl.innerHTML = '';
    checks.forEach(({ label, ratio }) => {
      if (!Number.isFinite(ratio)) return;
      const verdict = contrastVerdict(ratio);
      const line = document.createElement('div');
      line.className = `${NS}-vb-contrast-line ${NS}-vb-contrast--${verdict}`;
      const mark = verdict === 'low' ? '⚠' : '✓';
      const hint = verdict === 'low' ? ' — aim for ≥ 4.5:1' : verdict === 'ok' ? ' (AA)' : ' (AAA)';
      line.textContent = `${mark} ${label}: ${ratio.toFixed(1)}:1${hint}`;
      contrastEl.appendChild(line);
    });
  }

  // ── Colorblind-safe palettes ──────────────────────────────────────────
  panelEl.querySelectorAll('[data-palette]').forEach(btn => {
    btn.addEventListener('click', () => {
      const palette = COLORBLIND_PALETTES.find(p => p.id === btn.dataset.palette);
      if (!palette) return;
      Object.entries(palette.colors).forEach(([field, value]) => {
        const inp = panelEl.querySelector(`[data-field="${field}"]`);
        if (inp) inp.value = value;
      });
      livePreview();
    });
  });

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

  // ── Quick element styling from the picked selector ────────────────────
  const elStatus = panelEl.querySelector(`#${NS}-vb-el-status`);
  panelEl.querySelector('[data-action="style-element"]').addEventListener('click', () => {
    const rule = buildElementRule(inspectorInfo.value, {
      textColor: panelEl.querySelector(`#${NS}-vb-el-color`).value,
      bgColor:   panelEl.querySelector(`#${NS}-vb-el-bg`).value,
      hide:      panelEl.querySelector(`#${NS}-vb-el-hide`).checked,
    });
    if (!rule) { elStatus.textContent = '⚠ Pick an element first.'; return; }
    // The zone protection applies here too — no hiding the fic text
    const violations = findProtectedViolations(rule);
    if (violations.length) { elStatus.textContent = '⛔ ' + violations[0]; return; }
    appendElementRule(rule);
    elStatus.textContent = `✓ Applied to ${inspectorInfo.value}`;
  });

  panelEl.querySelector('[data-action="clear-element-rules"]').addEventListener('click', () => {
    clearElementRules();
    elStatus.textContent = 'Element styles cleared.';
  });

  updateContrast();

  panelEl.querySelector(`.${NS}-tb-panel-close`).addEventListener('click', () => {
    stopInspector();
    removePreview(); // fermer sans Apply annule l'aperçu en direct
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



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
      // Re-apply the persisted per-element rules built with the inspector
      applyElementRules();
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
      document.getElementById(ELEMENT_STYLE_ID)?.remove();
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
