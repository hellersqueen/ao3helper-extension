/* ──────────────────────────────────────────────────────────────────────────
   UI COMPONENTS - Menu item creators and helpers
   Why: reusable UI components for building menus
─────────────────────────────────────────────────────────────────────────── */

export function sanitizeLabel(label, flagKey) {
  if (typeof label === 'string') {
    const t = label.trim();
    if (t && t.toLowerCase() !== 'true' && t.toLowerCase() !== 'false') {
      return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return inferLabelFromRegistry(flagKey) || humanizeFromFlag(flagKey);
}

export function moduleNameFromFlagKey(flagKey, modules = []) {
  const hit = modules.find(m => m.enabledKey === flagKey || m.enabledKeyAlt === flagKey);
  return hit ? hit.name : null;
}

export function inferLabelFromRegistry(flagKey, modules = []) {
  const hit = modules.find(m => m.enabledKey === flagKey || m.enabledKeyAlt === flagKey);
  return hit?.meta?.title || hit?.name || null;
}

export function humanizeFromFlag(flagKey) {
  // e.g. "mod:readingProgress:enabled" → "Reading Progress"
  const m = /mod:([^:]+):/.exec(flagKey);
  const base = m ? m[1] : String(flagKey);
  const withSpaces = base.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[\W_]+/g, ' ').trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export function itemToggle(label, flagKey, current, NS) {
  const li = document.createElement('li');
  const a  = document.createElement('a');
  a.href = '#';
  a.dataset.flag = flagKey;
  a.setAttribute('role','menuitemcheckbox');
  a.setAttribute('aria-checked', String(!!current));
  if (current) a.classList.add(`${NS}-on`);
  a.innerHTML = `
    <span class="${NS}-label">${sanitizeLabel(label, flagKey)}</span>
    <span class="${NS}-switch" aria-hidden="true"></span>
  `;
  li.appendChild(a);
  return li;
}

export function itemAction(label, hint, handler, NS) {
  // we still record actions so code calling addAction doesn't break,
  // but we will *not* render them in fillMenu()
  const li = document.createElement('li');
  const a  = document.createElement('a');
  a.href = '#';
  a.innerHTML = `<span class="${NS}-label">${label}</span>${hint ? `<span class="${NS}-kbd">${hint}</span>` : ''}`;
  a.addEventListener('click', (e)=>{ e.preventDefault(); handler?.(); });
  li.appendChild(a);
  return li;
}

export function itemDivider(NS) {
  const li = document.createElement('li');
  li.className = `${NS}-divider`;
  return li;
}

export function itemSubmenu(label, buildChildren, NS) {
  const li  = document.createElement('li');

  const a   = document.createElement('a');
  a.href = '#';
  a.innerHTML = `<span class="${NS}-label">${label}</span><span class="${NS}-caret">▾</span>`;
  a.setAttribute('aria-haspopup','true');
  a.setAttribute('aria-expanded','false');

  const sub = document.createElement('ul');
  sub.className = `menu dropdown-menu ${NS}-submenu`;
  sub.setAttribute('role','menu');

  buildChildren(sub);

  const maybeAlignRight = () => {
    const r = a.getBoundingClientRect();
    const willOverflowRight = (r.left + 240) > (window.innerWidth - 12);
    sub.classList.toggle(`${NS}-align-right`, !!willOverflowRight);
  };

  const toggle = (force) => {
    const isOpen = sub.classList.contains('open');
    const next = (typeof force === 'boolean') ? force : !isOpen;
    if (next) { maybeAlignRight(); }
    sub.classList.toggle('open', next);
    a.setAttribute('aria-expanded', String(next));
  };

  a.addEventListener('click', (e)=>{ e.preventDefault(); toggle(); });
  a.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(true); sub.querySelector('a')?.focus(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); toggle(true); sub.querySelector('a')?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); toggle(false); }
  });
  sub.addEventListener('keydown', (e)=>{
    if (e.key === 'ArrowUp' || e.key === 'Escape') { e.preventDefault(); toggle(false); a.focus(); }
  });

  document.addEventListener('pointerdown', (ev)=>{
    if (!(ev.target instanceof Node) || !li.contains(ev.target)) toggle(false);
  });

  li.append(a, sub);
  return li;
}

/* ──────────────────────────────────────────────────────────────────────────
   TOGGLE STYLES LOADER
─────────────────────────────────────────────────────────────────────────── */

/**
 * Charge les styles CSS pour les composants toggle
 * Utilise le fichier styles/components/toggles.css
 * @param {Function} css - Fonction CSS d'injection (AO3H.util.css ou équivalent)
 */
export function loadToggleStyles(css) {
  if (!css || typeof css !== 'function') {
    console.warn('[AO3H] loadToggleStyles: css function not provided');
    return;
  }

  // Ces styles correspondent au fichier styles/components/toggles.css
  // En production, le fichier CSS séparé sera chargé
  // En développement, on injecte directement via cette fonction
  const toggleStyles = `
/* AO3 Helper - Toggle UI Components */
:root {
  --ao3h-toggle-size: 16px;
  --ao3h-toggle-bg: #fff;
  --ao3h-toggle-color: #333;
  --ao3h-toggle-opacity: 0.7;
  --ao3h-toggle-opacity-hover: 0.85;
  --ao3h-toggle-border: rgba(0, 0, 0, 0.08);
  --ao3h-toggle-font-size: 10px;
  --ao3h-toggle-spacing: 6px;
}

[class*="-toggle"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ao3h-toggle-size);
  height: var(--ao3h-toggle-size);
  padding: 0;
  border-radius: 999px;
  border: none;
  background: var(--ao3h-toggle-bg);
  color: var(--ao3h-toggle-color);
  opacity: var(--ao3h-toggle-opacity);
  box-shadow: 0 0 0 1px var(--ao3h-toggle-border);
  cursor: pointer;
  user-select: none;
  line-height: 1;
  font-size: var(--ao3h-toggle-font-size);
  vertical-align: text-bottom;
  transition: opacity 0.15s ease, filter 0.15s ease;
}

[class*="-toggle"]:hover {
  opacity: var(--ao3h-toggle-opacity-hover);
  filter: brightness(0.98);
}

[class*="-toggle"]:focus {
  outline: 2px solid var(--ao3h-accent, #c21);
  outline-offset: 1px;
}

[class*="-toggle"] .chev {
  font-size: inherit;
  transition: opacity 0.2s ease;
}

[class*="-toggle-wrap"] {
  display: block;
  float: right;
  margin-left: var(--ao3h-toggle-spacing);
  margin-bottom: 2px;
}

[class*="-notes-group"],
[class*="-section-group"],
[class*="-collapsible-group"] {
  clear: both;
}

[class*="-sr"] {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ao3h-toggle-bg: #2a2a2a;
    --ao3h-toggle-color: #e0e0e0;
    --ao3h-toggle-border: rgba(255, 255, 255, 0.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  [class*="-toggle"],
  [class*="-toggle"] .chev {
    transition: none;
  }
}`;

  css(toggleStyles, 'ao3h-toggle-styles');
}

/* ──────────────────────────────────────────────────────────────────────────
   WIDGET CREATORS
─────────────────────────────────────────────────────────────────────────── */

/**
 * Crée un widget UI générique avec un conteneur
 * @param {Object} options - Configuration du widget
 * @returns {Object} {container, controls, update, destroy}
 */
export function createWidget(options = {}) {
  const {
    className = 'ao3h-widget',
    position = 'fixed',
    content = '',
    cssText = '',
    parent = document.body
  } = options;
  
  const container = document.createElement('div');
  container.className = className;
  
  if (position === 'fixed') {
    container.style.cssText = `position:fixed; z-index:999999; ${cssText}`;
  } else if (cssText) {
    container.style.cssText = cssText;
  }
  
  if (content) {
    container.innerHTML = content;
  }
  
  const controls = {};
  
  // Auto-collect controls with data attributes
  const collectControls = () => {
    container.querySelectorAll('[data-control]').forEach(el => {
      const name = el.getAttribute('data-control');
      if (name) controls[name] = el;
    });
  };
  
  const update = (newContent) => {
    if (newContent) {
      container.innerHTML = newContent;
      collectControls();
    }
  };
  
  const destroy = () => {
    try {
      container.remove();
    } catch {}
  };
  
  if (parent && parent.appendChild) {
    parent.appendChild(container);
  }
  
  collectControls();
  
  return {
    container,
    controls,
    update,
    destroy
  };
}

/**
 * Crée un input range avec label dynamique
 * @param {Object} options - Configuration
 * @returns {Object} {container, input, label, getValue, setValue}
 */
export function createRangeInput(options = {}) {
  const {
    min = 0,
    max = 100,
    step = 1,
    value = 50,
    label = 'Value',
    unit = '',
    className = 'ao3h-range-input'
  } = options;
  
  const container = document.createElement('div');
  container.className = className;
  
  const labelEl = document.createElement('label');
  labelEl.style.cssText = 'display:flex; align-items:center; gap:6px;';
  
  const span = document.createElement('span');
  span.textContent = label;
  
  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  
  const valueDisplay = document.createElement('span');
  
  const updateDisplay = () => {
    valueDisplay.textContent = input.value + (unit ? ` ${unit}` : '');
  };
  
  updateDisplay();
  
  input.addEventListener('input', updateDisplay);
  
  labelEl.appendChild(span);
  labelEl.appendChild(input);
  labelEl.appendChild(valueDisplay);
  container.appendChild(labelEl);
  
  return {
    container,
    input,
    label: labelEl,
    getValue: () => parseInt(input.value, 10),
    setValue: (val) => {
      input.value = val;
      updateDisplay();
    }
  };
}

/**
 * Crée un bouton toggle avec état visuel
 * @param {Object} options - Configuration
 * @returns {Object} {button, isActive, setActive, toggle}
 */
export function createToggleButton(options = {}) {
  const {
    text = 'Toggle',
    activeText = null,
    className = 'ao3h-toggle-btn',
    initialState = false,
    onClick = null
  } = options;
  
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  
  let active = initialState;
  
  const updateButton = () => {
    button.textContent = active ? (activeText || text) : text;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('active', active);
  };
  
  const setActive = (state) => {
    active = !!state;
    updateButton();
  };
  
  const toggle = () => {
    setActive(!active);
    return active;
  };
  
  button.addEventListener('click', (e) => {
    const newState = toggle();
    if (onClick) onClick(newState, e);
  });
  
  updateButton();
  
  return {
    button,
    isActive: () => active,
    setActive,
    toggle
  };
}