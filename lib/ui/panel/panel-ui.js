// Panel UI - Creates the DOM structure for the panel
import { NS } from './panel-config.js';
import { TABS } from './tab-registry.js';

const _W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

export function createPanelElements() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = `${NS}-panel-backdrop`;

    // Create modal box
    const box = document.createElement('div');
    box.className = `${NS}-panel-box`;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', `${NS}-panel-title`);

    // ── Build tab buttons from tab-registry (single source of truth) ──────
    // TABS imported from tab-registry.js
    if (!TABS.length) {
      console.warn('[AO3H][panel-ui] tab-registry not loaded — tab buttons may be missing');
    }

    const makeBtn = (id, label, isFirst) =>
      `<button class="${NS}-tab-btn${isFirst ? ` ${NS}-tab-active` : ''}" data-tab="${id}" role="tab" aria-selected="${isFirst ? 'true' : 'false'}" id="${NS}-tab-btn-${id}">${label}</button>`;

    // Single row: all tabs + About
    const allTabsHTML = [
      ...TABS.map((t, i) => makeBtn(t.id, t.label, i === 0)),
      makeBtn('about', 'About', false),
    ].join('\n          ');

    // Panel content
    box.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%;">
      <!-- Header -->
      <div class="${NS}-panel-header">
        <h1 class="${NS}-panel-title" id="${NS}-panel-title">AO3 Helper Settings</h1>
        <button class="${NS}-panel-close" aria-label="Close panel">×</button>
      </div>

      <!-- Tabs (generated from tab-registry + About) -->
      <div class="${NS}-panel-tabs-container">
        <div class="${NS}-panel-tabs-row" role="tablist" aria-label="AO3 Helper sections">
          ${allTabsHTML}
        </div>
      </div>

      <!-- Global Search + Bulk Actions -->
      <div class="${NS}-global-search-wrapper">
        <div class="${NS}-bulk-actions-buttons">
          <button class="ao3h-panel-action-btn" data-action="enable-all">Enable All</button>
          <button class="ao3h-panel-action-btn" data-action="disable-all">Disable All</button>
        </div>
        <input type="text" id="${NS}-global-search" class="${NS}-global-search-input" placeholder="🔍 Search all modules..." autocomplete="off">
      </div>

      <!-- Body -->
      <div class="${NS}-panel-body">
        <div id="${NS}-tab-container" role="tabpanel" tabindex="0">
          <p style="color: #999; padding: 20px; text-align: center;">Loading...</p>
        </div>
      </div>
    </div>
  `;

    return { backdrop, box };
}

export function closePanel() {
  const backdrop = document.querySelector(`.${NS}-panel-backdrop`);
  const box = document.querySelector(`.${NS}-panel-box`);

  if (backdrop) backdrop.remove();
  if (box) box.remove();
}

// Étape 315 : pose window.AO3H_PanelLoader.{createPanelElements,closePanel} supprimée
// du source — le bundler legacy (supprimé en Phase 27) la réinjectait via son shim `invoke`.
