// Panel Loader - Main entry point
// Opens panel-mockup in modal overlay
import { NS, createPanelElements } from './panel-ui.js';
import { setupCloseHandlers, setupTabSwitching, setupGlobalSearch } from './panel-tab-system.js';
import { tabContent } from './panel-tab-content.js';

// Function to open panel modal overlay
export function openAO3HPanel(moduleName) {
  console.log('[AO3H][panel-loader] 🎨 Opening panel for:', moduleName);
    
    // Remove existing if any
    const existing = document.querySelector(`.${NS}-panel-backdrop`);
    if (existing) {
      existing.remove();
    }
    
    // Create panel elements
    const { backdrop, box } = createPanelElements();
    
    // Setup all event handlers
    setupCloseHandlers(backdrop, box);
    
    // Setup tab system
    setupTabSwitching(box);

    // Setup global search (searches across all tabs)
    setupGlobalSearch(box);
    
    // Add to page
    document.body.append(backdrop, box);

    // If a module name is provided, navigate to it
    if (moduleName) {
      // Small delay to ensure panel is fully rendered
      setTimeout(() => {
        navigateToModule(moduleName, box);
      }, 100);
    }
    
    console.log('[AO3H][panel-loader] ✅ Panel displayed');
  };
  
  /**
   * Find which tab contains a module by searching through tab templates
   */
  function findModuleTab(moduleName) {
    // tabContent imported from panel-tab-content.js
    if (!tabContent) {
      console.warn('[AO3H][panel-loader] Tab content not available');
      return null;
    }
    
    // Search through each tab's HTML template
    for (const [tabId, html] of Object.entries(tabContent)) {
      if (html.includes(`data-module-id="${moduleName}"`)) {
        console.log('[AO3H][panel-loader] Found module in tab:', tabId);
        return tabId;
      }
    }
    
    console.warn('[AO3H][panel-loader] Module not found in any tab:', moduleName);
    return null;
  }

  /**
   * Navigate to a specific module in the panel
   * - Switch to the correct tab
   * - Scroll to the module
   * - Expand its config area
   */
  function navigateToModule(moduleName, panelBox) {
    console.log('[AO3H][panel-loader] 🔍 Navigating to module:', moduleName);
    
    // First, find which tab contains this module by searching templates
    const targetTab = findModuleTab(moduleName);
    
    if (!targetTab) {
      console.warn('[AO3H][panel-loader] Cannot navigate - module not found in templates');
      return;
    }
    
    // Switch to that tab
    const tabBtn = panelBox.querySelector(`.ao3h-tab-btn[data-tab="${targetTab}"]`);
    if (tabBtn) {
      console.log('[AO3H][panel-loader] Switching to tab:', targetTab);
      tabBtn.click();
    }
    
    // Wait for tab content to load, then find and scroll to module
    setTimeout(() => {
      const moduleContainer = panelBox.querySelector(`[data-module-id="${moduleName}"]`);
      
      if (!moduleContainer) {
        console.warn('[AO3H][panel-loader] Module container not found after tab switch:', moduleName);
        return;
      }
      
      // Scroll the module into view
      moduleContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Expand the config area
      const configArea = moduleContainer.querySelector('.ao3h-module-config-area');
      const configBtn = moduleContainer.querySelector('.ao3h-config-btn');
      
      if (configArea && !configArea.classList.contains('ao3h-expanded')) {
        configArea.classList.add('ao3h-expanded');
        if (configBtn) {
          configBtn.textContent = '▲';
        }
        console.log('[AO3H][panel-loader] ✅ Module config expanded');
      }
      
      // Add a highlight effect
      moduleContainer.classList.add('ao3h-highlight');
      setTimeout(() => {
        moduleContainer.classList.remove('ao3h-highlight');
      }, 2000);
      
      console.log('[AO3H][panel-loader] ✅ Navigated to module:', moduleName);
      
    }, 200); // Wait for tab content to render
  }
  
console.log('[AO3H][panel-loader] ✅ Panel loader ready');

// Étape 315 : pose window.openAO3HPanel supprimée du source — menu.js et
// menu-grouper.js importent openAO3HPanel directement ; le bundler legacy
// (supprimé en Phase 27) réinjectait la pose via son shim `invoke`.
