// Tab System & Event Handlers - Tab switching, interactivity, and all panel events
// Consolidated from: panel-tab-system.js + panel-events.js
import { ALL_MODULES } from './tab-registry.js';
import { NS, closePanel } from './panel-ui.js';
import { tabContent } from './panel-tab-content.js';
import { getConfig, runInitializer } from './configs/index.js';
import { wireHelpButtons } from './help-tooltips.js';
import { EV_SETTINGS_CHANGED } from '../../utils/event-names.js';
import { getLogger } from '../../utils/logger.js';
const log = getLogger('panel-tab-system');

const _W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
const panelFooterState = {
    pendingSaves: 0,
    dirty: false,
    _savedTimer: null,
  };

  const PANEL_MODULE_IDS = new Set((ALL_MODULES || []).map(m => m.id));

  function getTotalModuleCount() {
    return ALL_MODULES?.length || 0;
  }

  function getEnabledModuleCount() {
    const flags = window.AO3H?.flags || _W.AO3H?.flags;
    const allModules = window.AO3H?.modules?.all?.() || _W.AO3H?.modules?.all?.() || [];
    // Only count panel-facing modules — exclude internal children (e.g. tagsDisplay's
    // sub-toggles) that self-register but never get their own panel entry, so this
    // count can't exceed getTotalModuleCount().
    const modules = allModules.filter(module => PANEL_MODULE_IDS.has(module?.name));

    if (!flags || typeof flags.get !== 'function' || !modules.length) {
      return modules.filter(module => module?._booted).length;
    }

    return modules.reduce((count, module) => {
      const enabledKey = module?.enabledKey || `mod:${module?.name}:enabled`;
      const defaultEnabled = !!module?.meta?.enabledByDefault;
      return count + (flags.get(enabledKey, defaultEnabled) ? 1 : 0);
    }, 0);
  }

  function updateFooterStatus() {
    const status = document.getElementById('ao3h-panel-footer-status');
    if (!status) return;

    const enabled = getEnabledModuleCount();
    const total = getTotalModuleCount();
    const state = panelFooterState.dirty
      ? '<span class="ao3h-footer-unsaved">Unsaved changes</span>'
      : 'All changes saved';

    status.innerHTML = `<strong>${enabled}</strong> enabled · ${total} modules total · ${state}`;
  }

  function beginPanelSave() {
    panelFooterState.pendingSaves += 1;
    panelFooterState.dirty = true;
    clearTimeout(panelFooterState._savedTimer);
    updateFooterStatus();
  }

  function endPanelSave(success) {
    if (panelFooterState.pendingSaves > 0) {
      panelFooterState.pendingSaves -= 1;
    }

    if (success === false) {
      panelFooterState.dirty = true;
      updateFooterStatus();
      return;
    }

    // Keep "Unsaved changes" visible for at least 1.5s so the user sees it,
    // then flip to "All changes saved" once no more saves are pending.
    clearTimeout(panelFooterState._savedTimer);
    panelFooterState._savedTimer = setTimeout(() => {
      if (panelFooterState.pendingSaves === 0) {
        panelFooterState.dirty = false;
      }
      updateFooterStatus();
    }, 1500);
  }

  // ─── Inject per-module config HTML from configs/index.js ─────────────────
export function injectConfigs() {
    document.querySelectorAll('[data-config-module]').forEach(area => {
      const id = area.dataset.configModule;
      const html = getConfig(id) || '';
      if (html) {
        area.innerHTML = html;
        // Wire the config area immediately after injecting HTML.
        // This calls wireConfigArea(area) which renders the stored tag list
        // and attaches all button listeners — no ▼ click required.
        runInitializer(id, area);
        // Same reasoning for (?) help buttons — wiring only on the ▼ click
        // handler left them dead when a config area is expanded programmatically
        // (deep link from the menu, "jump to module", or a search result click).
        wireHelpButtons(area);
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOSE HANDLERS (from panel-events.js)
  // ═══════════════════════════════════════════════════════════════════════════

export function setupCloseHandlers(backdrop, box) {
    // closePanel imported from panel-ui.js

    // Close on backdrop click
    backdrop.addEventListener('click', closePanel);

    // Close on × button click and footer Save & Close button
    box.querySelectorAll(`.${NS}-panel-close, .ao3h-footer-close`).forEach(btn => {
      btn.addEventListener('click', closePanel);
    });

    // Close on ESC key
    const escHandler = function(e) {
      if (e.key === 'Escape') {
        closePanel();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    log.debug('✅ Close handlers attached');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK ACTIONS (from panel-events.js)
  // ═══════════════════════════════════════════════════════════════════════════

export function setupBulkActions(tabContainer, tabId) {
    // Remove any existing bottom bar before recreating
    const panelBody = tabContainer.closest(`.${NS}-panel-body`);
    const existingBulk = panelBody?.parentElement?.querySelector(`.${NS}-bulk-actions`);
    if (existingBulk) existingBulk.remove();

    // Bottom bar: Save & Close
    const footer = document.createElement('div');
    footer.className = `${NS}-bulk-actions`;
    footer.innerHTML = `
      <div class="note-box ao3h-footer-status" id="ao3h-panel-footer-status" aria-live="polite"></div>
      <button class="ao3h-panel-action-btn ao3h-footer-save-close">Save &amp; Close</button>
    `;

    if (panelBody?.parentElement) {
      panelBody.parentElement.appendChild(footer);
      footer.querySelector('.ao3h-footer-save-close').addEventListener('click', saveAllAndClose);
    }

    updateFooterStatus();

    log.debug('✅ Bulk actions setup for tab:', tabId);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CHIP PICKERS (from panel-events.js)
  // Generic pattern for dropdown + add button + removable chips
  // Used by: language picker, tag selector, fandom picker, etc.
  // ═══════════════════════════════════════════════════════════════════════════

export function setupChipPickers(container) {
    const pickerRows = container.querySelectorAll('.ao3h-picker-row');

    pickerRows.forEach(row => {
      const picker = row.querySelector('.ao3h-picker');
      const addBtn = row.querySelector('[data-action^="add"]');
      const chipsContainer = row.parentElement.querySelector('.ao3h-chip-container');

      if (!picker || !addBtn || !chipsContainer) return;

      const pickerType = picker.dataset.pickerType || 'item';
      const chipsCard = chipsContainer.closest('.ao3h-tag-chips-card');

      // Get currently stored items (from data attribute or empty array)
      let selectedItems = [];
      try {
        const stored = chipsContainer.dataset.value;
        if (stored) selectedItems = JSON.parse(stored);
      } catch (e) {}

      function renderChips() {
        chipsContainer.innerHTML = '';
        selectedItems.forEach(itemCode => {
          const option = picker.querySelector(`option[value="${itemCode}"]`);
          const itemName = option ? option.textContent : itemCode;
          addChip(itemCode, itemName, false);
        });
        updateDataValue();
      }

      function updateDataValue() {
        chipsContainer.dataset.value = JSON.stringify(selectedItems);
        if (chipsCard) chipsCard.classList.toggle('ao3h-tag-chips-card--empty', selectedItems.length === 0);
        chipsContainer.dispatchEvent(new CustomEvent('chipsChanged', {
          detail: { type: pickerType, items: selectedItems },
          bubbles: true
        }));
      }

      function addChip(value, text, updateArray = true) {
        if (updateArray && !selectedItems.includes(value)) {
          selectedItems.push(value);
        }

        const chip = document.createElement('span');
        chip.className = 'ao3h-chip ao3h-chip--neutral ao3h-chip--square';
        chip.dataset.value = value;
        chip.innerHTML = `${text} <button type="button" title="Remove ${text}" aria-label="Remove ${text}">×</button>`;

        chip.querySelector('button').addEventListener('click', () => {
          chip.remove();
          selectedItems = selectedItems.filter(i => i !== value);
          updateDataValue();
          log.debug(`Removed:`, value);
        });

        chipsContainer.appendChild(chip);
      }

      function addItem() {
        const value = picker.value;
        if (!value) return;

        const text = picker.options[picker.selectedIndex]?.text;

        if (selectedItems.includes(value)) {
          log.debug(`Already added:`, value);
          return;
        }

        addChip(value, text, true);
        updateDataValue();

        // Reset dropdown
        picker.selectedIndex = 0;

        log.debug(`Added:`, value, '| Total:', selectedItems.length);
      }

      addBtn.addEventListener('click', addItem);

      // Allow Enter key
      picker.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addItem();
        }
      });

      // Initial render
      renderChips();

      log.debug(`✅ Chip picker setup (${pickerType})`);
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG BUTTONS & MODULE ROWS
  // ═══════════════════════════════════════════════════════════════════════════

  function setupResetButtons(tabContainer) {
    const resetButtons = tabContainer.querySelectorAll('.ao3h-config-reset-btn');
    resetButtons.forEach(btn => {
      let confirmTimer = null;
      const originalLabel = btn.textContent.trim();
      const isFullReset = btn.dataset.fullReset === 'true';

      btn.addEventListener('click', function() {
        if (this.classList.contains('ao3h-reset-confirming')) {
          // Second click — do the actual reset
          clearTimeout(confirmTimer);
          this.classList.remove('ao3h-reset-confirming');
          this.textContent = originalLabel;

          if (isFullReset) {
            // Full reset: wipe all AO3H settings and reload
            try {
              Object.keys(localStorage)
                .filter(k => k.startsWith('ao3h'))
                .forEach(k => localStorage.removeItem(k));
            } catch (e) {}
            location.reload();
          } else {
            // Module reset: reset all form fields in this config area to defaults
            const configArea = this.closest('.ao3h-module-config-area');
            if (configArea) {
              configArea.querySelectorAll('input, select, textarea').forEach(el => {
                if (el.type === 'checkbox' || el.type === 'radio') {
                  el.checked = el.defaultChecked;
                } else if (el.tagName === 'SELECT') {
                  Array.from(el.options).forEach(opt => { opt.selected = opt.defaultSelected; });
                } else {
                  el.value = el.defaultValue;
                }
                el.dispatchEvent(new Event('change', { bubbles: true }));
              });
            }
            log.debug('Module reset confirmed');
          }
        } else {
          // First click — enter confirming state
          this.classList.add('ao3h-reset-confirming');
          this.textContent = isFullReset ? '⚠ Reset everything?' : '⚠ Confirm reset?';

          // Auto-revert after 3 seconds if not confirmed
          confirmTimer = setTimeout(() => {
            this.classList.remove('ao3h-reset-confirming');
            this.textContent = originalLabel;
          }, 3000);
        }
      });
    });
  }

  // ── Shared: collect + persist settings for a configArea ──────────────────
  async function persistSettings(configArea) {
    const moduleId = configArea.dataset.configModule;
    if (!moduleId) return;

    const inputs = configArea.querySelectorAll('[data-setting]');
    const patch = {};
    const radiosSeen = new Set();

    inputs.forEach(input => {
      const key = input.dataset.setting;
      if (!key) return;
      if (input.type === 'checkbox') {
        patch[key] = input.checked;
      } else if (input.type === 'radio') {
        if (!radiosSeen.has(key)) {
          radiosSeen.add(key);
          const checked = configArea.querySelector(`input[type="radio"][data-setting="${key}"]:checked`);
          if (checked) patch[key] = checked.value;
        }
      } else {
        patch[key] = input.value;
      }
    });

    const Settings = window.AO3H?.settings || _W.AO3H?.settings;
    if (Settings) {
      await Settings.set(moduleId, patch);
    } else {
      const storageKey = `ao3h:mod:${moduleId}:settings`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
      localStorage.setItem(storageKey, JSON.stringify(Object.assign({}, existing, patch)));
    }

    // Notify modules that their settings changed
    document.dispatchEvent(new CustomEvent(EV_SETTINGS_CHANGED, {
      bubbles: false,
      detail: { moduleId, settings: patch }
    }));
  }

  // ── Save all visible config areas then close the panel ───────────────────
  async function saveAllAndClose() {
    const configAreas = document.querySelectorAll('.ao3h-module-config-area');
    for (const area of configAreas) {
      try {
        await persistSettings(area);
      } catch (e) {
        console.error('[AO3H][tab-system] Save failed for', area.dataset.configModule, e);
      }
    }
    panelFooterState.dirty = false;
    panelFooterState.pendingSaves = 0;
    closePanel();
  }

  // ── Restore saved settings into all config areas (runs at tab load) ────────
  function restoreAllConfigs(container) {
    container.querySelectorAll('[data-config-module]').forEach(area => {
      const moduleId = area.dataset.configModule;
      if (!moduleId) return;
      try {
        const raw = localStorage.getItem(`ao3h:mod:${moduleId}:settings`);
        if (!raw) return;
        const saved = JSON.parse(raw);
        area.querySelectorAll('[data-setting]').forEach(el => {
          const key = el.dataset.setting;
          if (!(key in saved)) return;
          if (el.type === 'checkbox') {
            el.checked = !!saved[key];
          } else if (el.type === 'radio') {
            el.checked = (el.value === saved[key]);
          } else {
            el.value = saved[key];
          }
        });
      } catch {}
    });
  }

  // ── Mark dirty on any input change (no auto-save — user must click Save) ──
  function setupAutoSave(tabContainer) {
    tabContainer.querySelectorAll('.ao3h-module-config-area').forEach(configArea => {
      if (configArea.dataset.autoSaveWired) return;
      configArea.dataset.autoSaveWired = '1';
      configArea.addEventListener('change', e => {
        const input = e.target.closest('[data-setting]');
        if (!input) return;
        panelFooterState.dirty = true;
        clearTimeout(panelFooterState._savedTimer);
        updateFooterStatus();
      });
    });
  }

  function setupSaveButtons(tabContainer) {
    const saveButtons = tabContainer.querySelectorAll('.ao3h-config-save-btn');
    saveButtons.forEach(btn => {
      btn.addEventListener('click', async function() {
        const configArea = this.closest('.ao3h-module-config-area');
        if (!configArea) return;
        if (!configArea.dataset.configModule) return;

        beginPanelSave();
        try {
          await persistSettings(configArea);
          endPanelSave(true);
        } catch (e) {
          endPanelSave(false);
          console.error('[AO3H][tab-system] Save failed for', configArea.dataset.configModule, e);
          return;
        }

        // Visual feedback on the button
        const orig = this.textContent;
        this.textContent = '✓ Saved';
        this.classList.add('ao3h-save-success');
        setTimeout(() => {
          this.textContent = orig;
          this.classList.remove('ao3h-save-success');
        }, 1500);
      });
    });
  }

  function setupConfigButtons(tabContainer) {
    const configButtons = tabContainer.querySelectorAll('.ao3h-config-btn');
    configButtons.forEach(btn => {
      // Set initial ARIA
      btn.setAttribute('aria-label', 'Module settings');
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const container = this.closest('.ao3h-module-container');
        const configArea = container.querySelector('.ao3h-module-config-area');

        if (configArea) {
          const isExpanded = configArea.classList.contains('ao3h-expanded');
          configArea.classList.toggle('ao3h-expanded');
          this.textContent = isExpanded ? '▼' : '▲';
          this.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');

          // Notify modules when their config opens + scroll into view
          if (!isExpanded) {
            const moduleId = container.dataset.moduleId;
            // Run any registered initializer for this module (primary wiring path)
            runInitializer(moduleId, configArea);
            // Also dispatch event for legacy / other listeners
            configArea.dispatchEvent(new CustomEvent('ao3h:configOpen', {
              bubbles: true,
              detail: { moduleId, configArea }
            }));

            setTimeout(() => {
              const tabContainerEl = document.querySelector('#ao3h-tab-container');
              if (!tabContainerEl) return;

              const containerRect = container.getBoundingClientRect();
              const tabContainerRect = tabContainerEl.getBoundingClientRect();

              const scrollOffset = containerRect.top - tabContainerRect.top;
              if (Math.abs(scrollOffset) > 5) {
                tabContainerEl.scrollBy({
                  top: scrollOffset,
                  behavior: 'smooth'
                });
              }
            }, 450);
          }

          log.debug('Config toggled:', isExpanded ? 'closed' : 'opened');
        }
      });
    });
  }

  function setupModuleRows(tabContainer) {
    const moduleRows = tabContainer.querySelectorAll('.ao3h-module-row');
    moduleRows.forEach(row => {
      const container = row.closest('.ao3h-module-container');
      const moduleId  = container?.dataset.moduleId;

      // Restore checkbox state from persistent flag
      const checkbox = row.querySelector('.ao3h-quick-enable-checkbox');
      if (checkbox && moduleId) {
        // ARIA label using the visible module name
        const moduleName = row.querySelector('.ao3h-module-name')?.textContent?.trim() || moduleId;
        checkbox.setAttribute('aria-label', `Enable ${moduleName}`);

        const Flags = window.AO3H?.flags || _W.AO3H?.flags;
        const Modules = window.AO3H?.modules;
        const mod = Modules?.all?.()?.find?.(m => m.name === moduleId);
        const defaultEnabled = !!(mod?.meta?.enabledByDefault);
        const enabled = Flags
          ? !!Flags.get(`mod:${moduleId}:enabled`, defaultEnabled)
          : defaultEnabled;
        checkbox.checked = enabled;

        // Wire change → persist + start/stop module + notify menu
        // No footer impact: enable/disable saves automatically, no user action needed
        checkbox.addEventListener('change', async function() {
          if (!moduleId) return;
          try {
            // Use _W (unsafeWindow) — in Tampermonkey, window.AO3H is undefined
            const modules = _W.AO3H?.modules || window.AO3H?.modules;
            if (modules?.setEnabled) {
              await modules.setEnabled(moduleId, this.checked);
            }
            updateFooterStatus(); // refresh enabled count without changing saved/unsaved state
          } catch (err) {
            console.error('[AO3H][tab-system] setEnabled failed for', moduleId, err);
          }
          // Notify menu so its toggle stays in sync
          document.dispatchEvent(new CustomEvent('ao3h:flags-updated', {
            detail: { key: `mod:${moduleId}:enabled`, value: this.checked }
          }));
          log.debug('', moduleId, this.checked ? 'enabled' : 'disabled');
        });

        // Keep checkbox in sync when menu toggle changes while panel is open
        document.addEventListener('ao3h:flags-updated', function(e) {
          if (e.detail?.key === `mod:${moduleId}:enabled`) {
            checkbox.checked = !!e.detail.value;
          }
        });
      }

      row.addEventListener('click', function(e) {
        // Ignore clicks on the checkbox or its expanded label hit area
        if (e.target.closest('.ao3h-quick-enable-wrap')) return;

        const container = this.closest('.ao3h-module-container');
        const configBtn = container.querySelector('.ao3h-config-btn');
        if (configBtn) {
          configBtn.click();
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB CONTENT LOADING
  // ═══════════════════════════════════════════════════════════════════════════

export function loadTabContent(tabId, tabContainer) {
    // tabContent imported from panel-tab-content.js
    // setupBulkActions defined in this module

    log.debug('📥 Loading tab:', tabId);

    const content = tabContent[tabId];
    if (!content) {
      tabContainer.innerHTML = `<p style="color: #d32f2f;">❌ Unknown tab: ${tabId}</p>`;
      return;
    }

    // Smooth fade out, then replace content, then fade in
    tabContainer.style.transition = 'opacity 0.2s ease-out';
    tabContainer.style.opacity = '0';

    setTimeout(() => {
      tabContainer.innerHTML = content;
      tabContainer.scrollTop = 0;

      // Inject module configs from configs/index.js (ES Module)
      injectConfigs();
      restoreAllConfigs(tabContainer);

      // Fade back in
      setTimeout(() => {
        tabContainer.style.opacity = '1';

        // Wire up config buttons, reset buttons and module rows AFTER content is visible
        setupConfigButtons(tabContainer);
        setupResetButtons(tabContainer);
        setupSaveButtons(tabContainer);
        setupAutoSave(tabContainer);
        setupModuleRows(tabContainer);

        // Setup chip pickers if present
        setupChipPickers(tabContainer);
      }, 20);

      // Add bulk actions buttons if not About tab
      setTimeout(() => {
        if (tabId !== 'about') {
          setupBulkActions(tabContainer, tabId);
        } else {
          const existingBulk = document.querySelector(`.${NS}-bulk-actions`);
          if (existingBulk) {
            existingBulk.remove();
          }
          // About tab: minimal bar with just Close
          const panelBody = tabContainer.closest(`.${NS}-panel-body`);
          if (panelBody?.parentElement) {
            const bar = document.createElement('div');
            bar.className = `${NS}-bulk-actions`;
            bar.innerHTML = `
              <div class="note-box ao3h-footer-status" id="ao3h-panel-footer-status" aria-live="polite"></div>
              <button class="ao3h-panel-action-btn ao3h-footer-close">Close</button>
            `;
            panelBody.parentElement.appendChild(bar);
            updateFooterStatus();
          }
          setupAboutTab(tabContainer);
        }
      }, 10);
    }, 200);

    // Re-initialize interactivity after tab loads
    if (typeof window.initializeTabInteractivity === 'function') {
      window.initializeTabInteractivity();
    }

    log.debug('✅ Tab content loaded:', tabId);
  };

  // ═══════════════════════════════════════════════════════════════════════════  // ABOUT TAB — Quick Access Module pin
  // ══════════════════════════════════════════════════════════════════════════

  function setupAboutTab (tabContainer) {
    const select  = tabContainer.querySelector('#ao3h-pinned-module');
    const saveBtn = tabContainer.querySelector('#ao3h-pin-save-btn');
    if (!select || !saveBtn) return;

    // Populate from module registry
    const mods = window.AO3H?.modules?.all?.() || [];
    for (const { name, meta } of mods) {
      const opt = document.createElement('option');
      opt.value       = name;
      opt.textContent = meta?.title || name;
      select.appendChild(opt);
    }

    // Restore saved value
    const saved = localStorage.getItem('ao3h:pinnedModule');
    if (saved && select.querySelector(`option[value="${saved}"]`)) { select.value = saved; }

    saveBtn.addEventListener('click', () => {
      const val = select.value;
      if (val) {
        localStorage.setItem('ao3h:pinnedModule', val);
      } else {
        localStorage.removeItem('ao3h:pinnedModule');
      }
      const orig = saveBtn.textContent;
      saveBtn.textContent = '✓ Saved';
      setTimeout(() => { saveBtn.textContent = orig; }, 1500);
    });
  }

  // ══════════════════════════════════════════════════════════════════════════  // TAB SWITCHING
  // ═══════════════════════════════════════════════════════════════════════════

export function setupTabSwitching(box) {
    // loadTabContent defined in this module
    log.debug('Setting up tab switching');

    const tabButtons = box.querySelectorAll(`.${NS}-tab-btn`);
    const tabContainer = box.querySelector(`#${NS}-tab-container`);

    tabButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');

        // Update active state + ARIA selected
        tabButtons.forEach(b => {
          b.classList.remove(`${NS}-tab-active`);
          b.setAttribute('aria-selected', 'false');
        });
        this.classList.add(`${NS}-tab-active`);
        this.setAttribute('aria-selected', 'true');

        // Update tabpanel labelledby
        tabContainer.setAttribute('aria-labelledby', `${NS}-tab-btn-${tabId}`);

        // Load content
        loadTabContent(tabId, tabContainer);

        log.debug('Switched to tab:', tabId);
      });
    });

    // Load first tab content on open (use the visually-active tab button, not a hardcoded id)
    const initialBtn = box.querySelector(`.${NS}-tab-btn.${NS}-tab-active`) || tabButtons[0];
    const initialTabId = initialBtn ? initialBtn.getAttribute('data-tab') : 'browse';
    // Set initial ARIA state on all buttons and the tabpanel
    tabButtons.forEach(b => b.setAttribute('aria-selected', b === initialBtn ? 'true' : 'false'));
    if (initialBtn) tabContainer.setAttribute('aria-labelledby', `${NS}-tab-btn-${initialTabId}`);
    log.debug('Loading initial tab:', initialTabId);
    loadTabContent(initialTabId, tabContainer);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL SEARCH
  // ═══════════════════════════════════════════════════════════════════════════

export function setupGlobalSearch(box) {
    const tabContainer = box.querySelector(`#${NS}-tab-container`);
    const searchInput = box.querySelector(`#${NS}-global-search`);

    if (!searchInput || !tabContainer) {
      console.warn('[AO3H][global-search] Search input or tab container not found');
      return;
    }

    function getAllModules() {
      return ALL_MODULES || [];
    }

    const initialActiveBtn = box.querySelector(`.${NS}-tab-btn.${NS}-tab-active`) || box.querySelector(`.${NS}-tab-btn`);
    let activeTabId = initialActiveBtn ? initialActiveBtn.getAttribute('data-tab') : 'browse';

    // Track active tab changes and clear search on manual tab switch
    box.querySelectorAll(`.${NS}-tab-btn`).forEach(btn => {
      btn.addEventListener('click', () => {
        activeTabId = btn.getAttribute('data-tab');
        searchInput.value = '';
      });
    });

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = searchInput.value.trim().toLowerCase();
        const allModules = getAllModules();

        if (!query) {
          // Revert to active tab
          box.querySelectorAll(`.${NS}-tab-btn`).forEach(b => {
            b.classList.toggle(`${NS}-tab-active`, b.getAttribute('data-tab') === activeTabId);
          });
          loadTabContent(activeTabId, tabContainer);
          return;
        }

        // Deactivate all tab buttons during search
        box.querySelectorAll(`.${NS}-tab-btn`).forEach(b => b.classList.remove(`${NS}-tab-active`));

        // Filter across all modules
        const results = allModules.filter(m =>
          (m.title || '').toLowerCase().includes(query) ||
          (m.desc || '').toLowerCase().includes(query) ||
          (m.id || '').toLowerCase().includes(query) ||
          (m.tabLabel || '').toLowerCase().includes(query)
        );

        renderSearchResults(results, query, tabContainer);
      }, 150);
    });

    function renderSearchResults(results, query, container) {
      let modulesHTML;

      if (results.length === 0) {
        modulesHTML = `<p class="ao3h-search-no-results">No modules found for "<strong>${query}</strong>"</p>`;
      } else {
        modulesHTML = results.map(m => `
        <div class="ao3h-module-container" data-module-id="${m.id}">
          <div class="ao3h-module-row">
            <label class="ao3h-quick-enable-wrap" onclick="event.stopPropagation()">
              <input type="checkbox" class="ao3h-quick-enable-checkbox">
            </label>
            <div class="ao3h-module-info">
              <div class="ao3h-module-name">${m.title}</div>
              <div class="ao3h-module-desc">${m.desc}</div>
            </div>
            <div class="ao3h-module-controls">
              <span class="ao3h-search-tab-badge">${m.tabLabel}</span>
              <button class="ao3h-config-btn">▼</button>
            </div>
          </div>
          <div class="ao3h-module-config-area" data-config-module="${m.id}">
            <!-- Config loaded dynamically from AO3H_PanelConfigs -->
          </div>
        </div>`).join('\n');
      }

      const html = `<div class="ao3h-tab-content ao3h-search-results" data-tab="search-results">
  <div class="ao3h-modules-list">
    ${modulesHTML}
  </div>
</div>`;

      container.style.transition = 'opacity 0.15s ease-out';
      container.style.opacity = '0';

      // Remove bulk actions bar during search
      const existingBulk = document.querySelector(`.${NS}-bulk-actions`);
      if (existingBulk) existingBulk.remove();

      setTimeout(() => {
        container.innerHTML = html;
        container.scrollTop = 0;

        injectConfigs();
        restoreAllConfigs(container);

        setTimeout(() => {
          container.style.opacity = '1';
          setupConfigButtons(container);
          setupResetButtons(container);
          setupSaveButtons(container);
          setupAutoSave(container);
          setupModuleRows(container);
          setupChipPickers(container);
        }, 20);
      }, 150);
    }

    log.debug('✅ Global search setup complete');
  };

// Étape 315 : pose window.AO3H_PanelLoader supprimée du source.
// Étape 333 : loadPanelScript() supprimée — elle ne servait qu'au dev loader legacy
// (lecture de window.AO3H_DEV_BASE, exception G du registre de l'étape 324, sortie
// programmée avec l'outillage legacy en Phase 27).
