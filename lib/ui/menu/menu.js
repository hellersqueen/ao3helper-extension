/* ──────────────────────────────────────────────────────────────────────────
   MENU — ES Module
   Main AO3 Helper menu: build, insert, toggle modules.
   ────────────────────────────────────────────────────────────────────────── */

import { ensureIEDialog, openIEDialog } from '../dialog.js';
import {
  sanitizeLabel,
  moduleNameFromFlagKey as _moduleNameFromFlagKey,
  itemAction as _itemAction,
  itemDivider as _itemDivider,
  itemSubmenu as _itemSubmenu,
} from '../components.js';
// Étape 315 : ouverture du panel par import direct (avant : window.openAO3HPanel).
// Le bundler legacy (supprimé en Phase 27) remplaçait cet import par un shim window.
import { openAO3HPanel } from '../panel/panel-index.js';
// Étape 317 : le menu importe directement le core et ses helpers (avant : lectures
// window.AO3H / window.AO3H_Common). Le bundler legacy (supprimé en Phase 27) fournissait des shims.
import { AO3H, Modules } from '../../../src/core/lifecycle.js';
import { Flags } from '../../utils/config.js';
import { Bus } from '../../utils/event-bus.js';
import { $, on, onReady } from '../../utils/index.js';
import { hasJQuery, isPageFullyReady } from '../../utils/globals.js';
import { menuGrouper } from './menu-grouper.js';

// Page window (for globals exposed by other modules)
const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  // Base refs — AO3H est l'objet canonique importé (=== window.AO3H)
  const NS   = (AO3H.env && AO3H.env.NS) || 'ao3h';

  // How long the top-level menu remains open after the pointer leaves
  const HOVER_CLOSE_DELAY = 400; // ms
  
  // Module loading state - prevents menu interaction until modules are ready
  let modulesReady = false;
  
  // Menu grouper state - prevents menu opening until grouper has finished organizing
  let grouperReady = false;
  
  // Flag to track if grouper has signaled (to prevent timeout activation)
  let grouperSignaled = false;
  
  // Flag to prevent menu opening during rebuild/regrouping
  let rebuilding = false;
  
  // Counter for modules currently being registered
  let modulesRegistering = 0;
  
  console.log('[AO3H][menu] Initial state - modulesReady:', modulesReady, ', grouperReady:', grouperReady);

  // $, on, onReady, Flags, Modules : importés (étape 317) — implémentations
  // identiques aux anciens fallbacks locaux.

  /* ===================== IMPORT/EXPORT DIALOG (Hidden Works) ===================== */
  // Imported from lib/ui/dialog.js
  const ensureIE = () => ensureIEDialog(NS);
  const openIE   = () => openIEDialog(NS);

  /* ===================== helpers for labels ===================== */
  // Imported from lib/ui/components.js — wrappers bind NS and Modules registry
  // sanitizeLabel is imported directly (same signature)
  const moduleNameFromFlagKey = (flagKey) => _moduleNameFromFlagKey(flagKey, Modules?.all?.() ?? []);
  const itemAction            = (label, hint, handler) => _itemAction(label, hint, handler, NS);
  const itemDivider           = () => _itemDivider(NS);
  const itemSubmenu           = (label, buildChildren) => _itemSubmenu(label, buildChildren, NS);

  /* ===================== MENU BUILD (+ API publique) ===================== */

  let rootLI, toggleEl, menuUL;

  // Store custom items; we'll ignore actions when rendering
  const customItems = []; // {type:'toggle'|'action'|'sep', label, hint, flagKey, defaultOn, handler}

  function closeAllSubmenus(){
    // Query from rootLI (more reliable than menuUL reference) and close ALL submenus.
    // Group submenu visual state is closed here; saved state in sessionStorage is preserved
    // so menu-grouper will reopen them on next menu open via reapplySubmenuState().
    const root = rootLI || document.querySelector(`li.${NS}-root`);
    if (!root) return;
    const openSubmenus = root.querySelectorAll(`.${NS}-submenu.open`);
    openSubmenus.forEach(sub => {
      sub.classList.remove('open');
      const toggle = sub.previousElementSibling;
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Use UI item creator functions from common bundle
  const itemToggle = (label, flagKey, current, moduleName = null) => {
    console.log('[AO3H][menu] 🧪 itemToggle called with:', { label, flagKey, current, moduleName });
    
    // TEMPORARILY DISABLED: Force use of fallback with settings button support
    // TODO: Update uiComponents.itemToggle in common bundle to support settings buttons
    // if (uiComponents && typeof uiComponents.itemToggle === 'function') {
    //   console.log('[AO3H][menu] Using uiComponents.itemToggle (no settings button support yet)');
    //   return uiComponents.itemToggle(label, flagKey, current, NS);
    // }
    
    console.log('[AO3H][menu] 🧪 Creating fallback toggle with button');
    // Fallback implementation with integrated icon (matching attached file)
    const li = document.createElement('li');
    
    const a = document.createElement('a');
    a.href = '#';
    a.dataset.flag = flagKey;
    a.setAttribute('role', 'menuitemcheckbox');
    a.setAttribute('aria-checked', String(!!current));
    if (current) a.classList.add(`${NS}-on`);
    
    console.log('[AO3H][menu] Creating icon button for module:', moduleName);
    
    // Create icon button using component (or fallback)
    let iconBtn;
    // Bridge temporaire legacy.
    // À supprimer lorsque lib/ui/icon-button.js sera migré en ES Module et importé directement.
    // Étape 317 : lecture window.AO3H_IconButton conservée volontairement —
    // lib/ui/icon-button.js est hors graphe Vite (fallback ci-dessous utilisé côté
    // Vite, bouton riche côté legacy). Résolu en Phase 27.
    if (window.AO3H_IconButton && typeof window.AO3H_IconButton.createSettingsButton === 'function') {
      iconBtn = window.AO3H_IconButton.createSettingsButton(moduleName || '', sanitizeLabel(label, flagKey));
    } else {
      // Fallback: create button manually if component not loaded
      iconBtn = document.createElement('button');
      iconBtn.className = `${NS}-icon-btn`;
      iconBtn.type = 'button';
      iconBtn.setAttribute('aria-label', `Settings for ${sanitizeLabel(label, flagKey)}`);
      iconBtn.dataset.moduleName = moduleName || '';
      iconBtn.innerHTML = `<span class="${NS}-icon" aria-hidden="true">⋯</span>`;
      
      iconBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const modName = this.dataset.moduleName;
        console.log('[AO3H][menu] Opening panel for module:', modName);
        
        if (typeof openAO3HPanel === 'function') {
          openAO3HPanel(modName);
        } else {
          console.warn('[AO3H][menu] Panel opener not available');
        }
        
        return false;
      };
    }
    
    // Create label
    const labelSpan = document.createElement('span');
    labelSpan.className = `${NS}-label`;
    labelSpan.textContent = sanitizeLabel(label, flagKey);
    
    // Create switch
    const switchSpan = document.createElement('span');
    switchSpan.className = `${NS}-switch`;
    switchSpan.setAttribute('aria-hidden', 'true');
    
    // Assemble in order: icon button, label, switch
    a.appendChild(iconBtn);
    a.appendChild(labelSpan);
    a.appendChild(switchSpan);
    
    li.appendChild(a);
    
    console.log('[AO3H][menu] Created module item with settings button:', li);
    return li;
  };

  // itemAction, itemDivider, itemSubmenu are now defined earlier as imported wrappers.

  // (itemSubmenu already declared as imported wrapper above)

  function fillMenu(){
    menuUL.innerHTML = '';

    // 0) Quick Access pinned module
    const pinnedId = localStorage.getItem('ao3h:pinnedModule');
    if (pinnedId) {
      const allMods = (Modules && Modules.all ? Modules.all() : []);
      const pinnedMod = allMods.find(m => m.name === pinnedId);
      if (pinnedMod) {
        const quickItem = itemAction(
          `⚡ ${sanitizeLabel(pinnedMod.meta?.title || pinnedId, null)}`,
          '',
          () => {
            if (typeof openAO3HPanel === 'function') {
              openAO3HPanel(pinnedId);
            } else {
              console.warn('[AO3H][menu] openAO3HPanel not available');
            }
          }
        );
        quickItem.classList.add(`${NS}-quick-access`);
        menuUL.appendChild(quickItem);
        menuUL.appendChild(itemDivider());
      }
    }

    // 1) Auto toggles for registered modules (label sanitized)
    // Only top-level modules — skip child/sub-modules (those with meta.parent set)
    const mods = (Modules && Modules.all ? Modules.all() : []).filter(m => !m.meta?.parent);
    if (mods.length){
      for (const { name, meta, enabledKey } of mods){
        const lbl = sanitizeLabel(meta?.title || name, enabledKey);
        const onNow = !!Flags.get(enabledKey, !!meta?.enabledByDefault);
        menuUL.appendChild(itemToggle(lbl, enabledKey, onNow, name));
      }
    } else {
      // No modules? show nothing (or a note)
      const li = document.createElement('li');
      li.innerHTML = `<a><span class="${NS}-label">No modules registered</span></a>`;
      menuUL.appendChild(li);
    }

    // 2) Separator
    menuUL.appendChild(itemDivider());

    // 3) Custom items added by other scripts
    //    👉 We deliberately ignore ACTIONS here so only toggles appear.
    for (const it of customItems){
      if (it.type === 'sep') { menuUL.appendChild(itemDivider()); continue; }
      if (it.type === 'toggle'){
        const onNow = !!Flags.get(it.flagKey, !!it.defaultOn);
        menuUL.appendChild(itemToggle(sanitizeLabel(it.label, it.flagKey), it.flagKey, onNow, it.moduleName));
        continue;
      }
      // if (it.type === 'action') { /* skip on purpose */ }
    }

    // 4) Manage button (opens full manager panel) - DISABLED BUT KEPT FOR BACKUP
    // Uncomment the section below to re-enable the Module Manager button
    /*
    const manageSep = itemDivider();
    manageSep.classList.add(`${NS}-manage-sep`);
    menuUL.appendChild(manageSep);

    const manage = itemAction('⚙ Module Manager', '', () => {
      // Open the manager panel
      if (typeof W.AO3H_openManagerPanel === 'function') {
        W.AO3H_openManagerPanel();
      } else if (W.AO3H_ManagerPanel?.UI?.openPanel) {
        W.AO3H_ManagerPanel.UI.openPanel();
      } else {
        console.warn('[AO3H][menu] Manager panel not loaded yet');
      }
    });
    manage.classList.add(`${NS}-manage-tail`);
    menuUL.appendChild(manage);
    */
  }

  // === Hover-close delay implementation ===
  let closeTimer = null;
  function cancelCloseTimer(){
    if (closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
  }
  function openMenu(){
    // Don't open menu if modules aren't ready yet
    if (!modulesReady) {
      console.log('[AO3H][menu] Menu blocked: modules not ready yet');
      return;
    }
    
    // Don't open menu if modules are still registering
    if (modulesRegistering > 0) {
      console.log('[AO3H][menu] Menu blocked: modules still registering (' + modulesRegistering + ' remaining)');
      return;
    }
    
    // Don't open menu if grouper hasn't finished organizing modules yet
    if (!grouperReady) {
      console.log('[AO3H][menu] Menu blocked: waiting for menu-grouper to finish organizing');
      return;
    }
    
    // Don't open menu if we're currently rebuilding/regrouping
    if (rebuilding) {
      console.log('[AO3H][menu] Menu blocked: currently rebuilding/regrouping');
      return;
    }
    
    console.log('[AO3H][menu] Opening menu (modules ready:', modulesReady, ', grouper ready:', grouperReady, ')');
    
    cancelCloseTimer();
    rootLI.classList.add('open');
    toggleEl.setAttribute('aria-expanded','true');
    
    // Mettre à jour les indicateurs de scroll après l'ouverture
    requestAnimationFrame(() => {
      if (typeof window.updateScrollIndicators === 'function') {
        window.updateScrollIndicators();
      }
    });
  }
  function closeMenu(opts = {}){
    const { defer = false, delay = HOVER_CLOSE_DELAY } = opts;
    if (defer){
      cancelCloseTimer();
      closeTimer = setTimeout(() => closeMenu({ defer:false }), delay);
      return;
    }
    cancelCloseTimer();
    closeAllSubmenus();
    rootLI.classList.remove('open');
    toggleEl.setAttribute('aria-expanded','false');
  }

  function buildMenu(){
    // Get or create navigation button from core
    let navResult;
    if (typeof AO3H.createNavigationButton === 'function') {
      navResult = AO3H.createNavigationButton();
      rootLI = navResult.container;
      toggleEl = navResult.button;
    } else {
      // Fallback: look for existing button or create one
      rootLI = document.querySelector(`li.${NS}-root`);
      if (rootLI) {
        toggleEl = rootLI.querySelector(`.${NS}-navlink`);
      }
    }

    if (!rootLI || !toggleEl) {
      console.warn('[AO3H][menu] Navigation button not found or created, menu cannot be built');
      return;
    }

    // Ensure aria attributes are set for menu functionality
    if (!toggleEl.hasAttribute('aria-expanded')) {
      toggleEl.setAttribute('aria-expanded', 'false');
    }

    // Create menu UL if it doesn't exist
    menuUL = rootLI.querySelector(`.${NS}-menu`);
    if (!menuUL) {
      menuUL = document.createElement('ul');
      menuUL.className = `menu dropdown-menu ${NS}-menu`;
      menuUL.setAttribute('role', 'menu');
      rootLI.appendChild(menuUL);
    }

    // Configure menu event listeners only if not already configured
    if (!rootLI.hasAttribute('data-ao3h-menu-configured')) {
      // top-level menu keeps hover behavior (submenu is click-only)
      // Note: openMenu() now checks modulesReady before opening
      on(rootLI, 'mouseenter', () => {
        openMenu();
        cancelCloseTimer(); // Annuler toute fermeture en cours
      });
      
      // Gestion améliorée du mouseleave avec zone de tolérance
      const TOLERANCE_ZONE = 20; // px - doit correspondre au CSS
      let mouseMoveHandler = null;
      
      on(rootLI, 'mouseleave', () => {
        // Démarrer le suivi de la souris pour vérifier si elle reste dans la zone de tolérance
        if (mouseMoveHandler) {
          document.removeEventListener('mousemove', mouseMoveHandler);
        }
        
        mouseMoveHandler = (e) => {
          if (!rootLI.classList.contains('open')) {
            document.removeEventListener('mousemove', mouseMoveHandler);
            mouseMoveHandler = null;
            return;
          }
          
          const rect = menuUL.getBoundingClientRect();
          const x = e.clientX;
          const y = e.clientY;
          
          const inToleranceZone = (
            x >= rect.left - TOLERANCE_ZONE &&
            x <= rect.right + TOLERANCE_ZONE &&
            y >= rect.top - TOLERANCE_ZONE &&
            y <= rect.bottom + TOLERANCE_ZONE
          );
          
          if (!inToleranceZone) {
            closeMenu({ defer:true });
            document.removeEventListener('mousemove', mouseMoveHandler);
            mouseMoveHandler = null;
          }
        };
        
        document.addEventListener('mousemove', mouseMoveHandler);
        // Aussi déclencher une vérification immédiate au cas où la souris ne bouge pas
        setTimeout(() => {
          if (mouseMoveHandler) {
            const e = new MouseEvent('mousemove');
            if (window.lastMouseX !== undefined && window.lastMouseY !== undefined) {
              Object.defineProperty(e, 'clientX', { value: window.lastMouseX });
              Object.defineProperty(e, 'clientY', { value: window.lastMouseY });
            }
            mouseMoveHandler(e);
          }
        }, 100);
      });
      
      // Suivre la dernière position de la souris globalement
      on(document, 'mousemove', (e) => {
        window.lastMouseX = e.clientX;
        window.lastMouseY = e.clientY;
      });
      
      on(rootLI, 'focusin', openMenu);
      on(rootLI, 'focusout', (e)=>{ if(!rootLI.contains(e.relatedTarget)) closeMenu(); });

      // Ensure button click works (may already be set by core, but this is safe)
      if (toggleEl && !toggleEl.hasAttribute('data-ao3h-click-configured')) {
        on(toggleEl, 'click', (e)=>{ 
          e.preventDefault(); 
          
          console.log('[AO3H][menu] Button clicked!');
          // Étape 317 : bloc « TEST MODE » supprimé — il testait W.AO3H_openManagerPanel,
          // global jamais posé nulle part (chemin mort dans les deux builds).

          // Normal mode: dropdown menu
          // Check both modules and grouper ready state for click interactions
          if (!modulesReady || !grouperReady) {
            console.log('[AO3H][menu] Click blocked: waiting for modules and grouper to be ready');
            return;
          }
          rootLI.classList.contains('open') ? closeMenu() : openMenu(); 
        });
        toggleEl.setAttribute('data-ao3h-click-configured', 'true');
      }

      rootLI.setAttribute('data-ao3h-menu-configured', 'true');
    }

    on(menuUL, 'keydown', (e)=>{
      const items = Array.from(menuUL.querySelectorAll('a'));
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown'){ e.preventDefault(); (items[i+1]||items[0])?.focus(); }
      if (e.key === 'ArrowUp'){ e.preventDefault(); (items[i-1]||items[items.length-1])?.focus(); }
      if (e.key === 'Home'){ e.preventDefault(); items[0]?.focus(); }
      if (e.key === 'End'){ e.preventDefault(); items[items.length-1]?.focus(); }
    });

    on(menuUL, 'click', async (e)=>{
      // Check if click is on settings button
      const settingsBtn = e.target.closest(`.${NS}-icon-btn`);
      if (settingsBtn) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[AO3H][menu] ⚙️ Settings button clicked');
        
        const moduleName = settingsBtn.dataset.moduleName;
        console.log('[AO3H][menu] Opening panel for module:', moduleName);
        
        // Étape 315 : ouverture via import direct de panel-index.js
        if (typeof openAO3HPanel === 'function') {
          openAO3HPanel(moduleName);
        } else {
          console.error('[AO3H][menu] ❌ openAO3HPanel function not available');
        }
        return;
      }
      
      // Check if click is on the switch element only
      const switchEl = e.target.closest(`.${NS}-switch`);
      if (!switchEl) return; // Only toggle if clicking the switch
      
      const a = switchEl.closest('a[data-flag]');
      if (!a) return;
      e.preventDefault();

      const key  = a.dataset.flag;

      const mods = (Modules && Modules.all ? Modules.all() : []);
      const hit  = mods.find(m => m.enabledKey === key || m.enabledKeyAlt === key);

      const next = !Flags.get(key, false);

      try {
        if (hit) {
          await Modules.setEnabled(hit.name, next);
        } else {
          await Flags.set(key, next);
        }
      } catch (err) {
        console.error('[AO3H][menu] toggle failed', key, err);
      }

      a.setAttribute('aria-checked', String(next));
      a.classList.toggle(`${NS}-on`, next);

      try {
        document.dispatchEvent(new CustomEvent(`${NS}:flags-updated`, { detail: { key, value: next } }));
      } catch {}
    });

    on(document, 'click', (e)=>{ if (!rootLI.contains(e.target)) closeMenu(); });
    on(document, 'keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });
    // Close nav menu when the settings panel is closed (Save & Close / backdrop / Esc)
    document.addEventListener('ao3h:panel-closed', () => closeMenu());

    // Détection de l'état de scroll pour activer les fade indicators
    window.updateScrollIndicators = () => {
      if (!menuUL) return;
      
      const hasScroll = menuUL.scrollHeight > menuUL.clientHeight;
      const isScrolledDown = menuUL.scrollTop > 10;
      const isScrolledToBottom = (menuUL.scrollTop + menuUL.clientHeight) >= (menuUL.scrollHeight - 10);
      
      menuUL.classList.toggle('ao3h-has-scroll', hasScroll && !isScrolledToBottom);
      menuUL.classList.toggle('ao3h-scrolled-down', isScrolledDown);
    };
    
    on(menuUL, 'scroll', window.updateScrollIndicators);
    
    // Observer pour détecter les changements de contenu du menu
    const menuObserver = new MutationObserver(window.updateScrollIndicators);
    menuObserver.observe(menuUL, { childList: true, subtree: true });

    fillMenu();

    // --- Keep "Manage" last by intercepting appends to this UL only ---
    (function installBottomGuard(ul){
      if (!ul || ul.__ao3hBottomGuard) return;

      const isBottom = (node) =>
        node && node.nodeType === 1 &&
        node.matches?.(`li.${NS}-manage-tail, li.${NS}-manage-sep`);

      const anchor = () => ul.querySelector(`li.${NS}-manage-tail`);

      const _appendChild     = ul.appendChild.bind(ul);
      const _insertBefore    = ul.insertBefore.bind(ul);
      const _append          = ul.append?.bind(ul);
      const _replaceChildren = ul.replaceChildren?.bind(ul);

      ul.appendChild = function(node){
        const m = anchor();
        if (m && !isBottom(node)) return _insertBefore(node, m);
        return _appendChild(node);
      };

      if (_append) {
        ul.append = function(...nodes){
          nodes.forEach(n => {
            if (typeof n === 'string') n = document.createTextNode(n);
            this.appendChild(n);
          });
        };
      }

      ul.insertBefore = function(node, refNode){
        if (refNode == null) return this.appendChild(node);
        return _insertBefore(node, refNode);
      };

      if (_replaceChildren) {
        ul.replaceChildren = function(...nodes){
          _replaceChildren(...nodes);
          const sep = this.querySelector(`li.${NS}-manage-sep`);
          const m   = this.querySelector(`li.${NS}-manage-tail`);
          if (sep) this.appendChild(sep);
          if (m)   this.appendChild(m);
        };
      }

      ul.__ao3hBottomGuard = true;
    })(menuUL);
  }

  // ✅ addToggle: supports legacy + explicit signatures; actions hidden at render
  function addToggle(flagKey, labelOrDefault, maybeDefault){
    // Supported:
    //   addToggle(flagKey, true)                      → defaultOn=true, label inferred
    //   addToggle(flagKey, "Nice Label", true/false) → explicit label + default
    //   addToggle(flagKey, "Nice Label")             → explicit label, defaultOff
    let defaultOn = false;
    let label     = '';

    if (typeof labelOrDefault === 'boolean' && typeof maybeDefault === 'undefined') {
      defaultOn = labelOrDefault;
      label = null; // force inference below
    } else {
      label     = (labelOrDefault == null) ? '' : String(labelOrDefault);
      defaultOn = !!maybeDefault;
    }

    const cleanLabel = sanitizeLabel(label, flagKey);

    customItems.push({
      type:'toggle',
      flagKey,
      label: cleanLabel,
      defaultOn,
      moduleName: moduleNameFromFlagKey(flagKey)
    });
    if (menuUL) fillMenu();
  }

  function addAction(label, handler, hint=''){
    // record but we won't render actions in fillMenu()
    customItems.push({ type:'action', label, handler, hint });
    // no fillMenu() call needed since it won't show anyway, but harmless if left:
    if (menuUL) fillMenu();
  }

  function addSeparator(){
    customItems.push({ type:'sep' });
    if (menuUL) fillMenu();
  }

  function rebuild(){ if (menuUL) fillMenu(); }

  // Bridge temporaire legacy.
  // À supprimer lorsque les consommateurs du menu utiliseront addToggle/addAction via import direct.
  AO3H.menu = { addToggle, addAction, addSeparator, rebuild };

  /* ===================== Module Loading State Management ===================== */
  
  function setupModuleReadyListeners() {
    // Track modules being registered
    const handleModuleLoading = (e) => {
      modulesRegistering++;
      console.log('[AO3H][menu] Module loading:', e.detail?.name, '(total registering:', modulesRegistering + ')');
    };
    
    const handleModuleRegistered = (e) => {
      modulesRegistering = Math.max(0, modulesRegistering - 1);
      console.log('[AO3H][menu] Module registered:', e.detail?.name, '(remaining:', modulesRegistering + ')');
      
      // If all modules are done registering, allow menu to rebuild
      if (modulesRegistering === 0 && menuUL) {
        console.log('[AO3H][menu] All modules registered, menu ready for interaction');
      }
    };
    
    const markModulesReady = () => {
      if (modulesReady) return; // Already marked as ready
      
      console.log('[AO3H][menu] Modules are ready, enabling menu interactions');
      modulesReady = true;
      
      // Rebuild menu to reflect current module state
      if (menuUL) fillMenu();
    };
    
    const markGrouperReady = () => {
      if (grouperReady || grouperSignaled) return; // Already marked as ready or signaled
      
      console.log('[AO3H][menu] Menu-grouper has finished organizing');
      grouperSignaled = true; // Immediately mark as signaled to prevent timeout activation
      grouperReady = true; // Mark as ready immediately - grouper has done its work
      
      // Menu is already built and grouped - no need to rebuild
      console.log('[AO3H][menu] Menu interactions enabled (grouper ready)');
    };

    // Listen for module ready events from the bus system
    if (Bus && typeof Bus.on === 'function') {
      Bus.on('modules:ready', markModulesReady);
      Bus.on('modules:loaded', markModulesReady);
    }

    // Listen for window events as fallback
    try {
      window.addEventListener('AO3H:modules:ready', markModulesReady);
      window.addEventListener('AO3H:ready', markModulesReady); // Legacy compatibility
      
      // Listen for grouper ready events
      window.addEventListener('AO3H:grouper:ready', markGrouperReady);
      window.addEventListener('AO3H:menu:grouped', markGrouperReady);
      
      // Listen for module registration events
      window.addEventListener('AO3H:module:loading', handleModuleLoading);
      window.addEventListener('AO3H:module:registered', handleModuleRegistered);
    } catch (err) {
      console.warn('[AO3H][menu] Failed to setup window event listeners:', err);
    }

    // Fallback: check if modules are already ready
    setTimeout(() => {
      if (!modulesReady) {
        const hasModules = (Modules && Modules.all && Modules.all().length > 0);
        if (hasModules) {
          console.log('[AO3H][menu] Modules detected via fallback check, enabling menu');
          markModulesReady();
        } else {
          // Étape 317 : hasJQuery importé (avant : window.AO3H_Common, absent côté Vite)
          if (hasJQuery()) {
            console.log('[AO3H][menu] jQuery detected, assuming modules will load soon');
          }
        }
      }
      
      // Fallback: check if grouper is available but hasn't signaled ready yet
      if (!grouperReady) {
        // Étape 317 : menuGrouper importé (avant : lecture window.AO3H_MenuGrouper)
        if (!menuGrouper) {
          console.log('[AO3H][menu] No menu-grouper detected, allowing menu interaction');
          markGrouperReady();
        } else {
          // Grouper exists but may not have finished - give it more time
          console.log('[AO3H][menu] Menu-grouper detected but not ready yet, waiting...');
          setTimeout(() => {
            if (!grouperReady && !grouperSignaled) {
              console.log('[AO3H][menu] Timeout waiting for grouper, enabling menu anyway');
              grouperReady = true; // Direct activation for timeout case
            } else if (grouperSignaled && !grouperReady) {
              console.log('[AO3H][menu] Timeout reached but grouper already signaled, waiting for its delay to complete');
            }
          }, 3000); // Additional 3 seconds for grouper
        }
      }
    }, 2000); // 2 second fallback delay

    // Immediate check if AO3H.moduleLoader exists and reports ready modules
    try {
      if (AO3H.moduleLoader && typeof AO3H.moduleLoader.getStatus === 'function') {
        const moduleStatus = AO3H.moduleLoader.getStatus();
        if (moduleStatus && moduleStatus.length > 0) {
          console.log('[AO3H][menu] Module loader reports ready modules, enabling menu');
          markModulesReady();
        }
      }
      
      // Additional check: if AO3 is ready and we have modules, enable immediately
      // Étape 317 : isPageFullyReady importé (avant : window.AO3H_Common, absent côté Vite)
      if (isPageFullyReady()) {
        const hasModules = (Modules && Modules.all && Modules.all().length > 0);
        if (hasModules && !modulesReady) {
          console.log('[AO3H][menu] Page fully ready with modules, enabling menu immediately');
          markModulesReady();
        }
      }
    } catch (err) {
      console.warn('[AO3H][menu] Failed to check module loader status:', err);
    }
  }

  /* ===================== Boot & live sync ===================== */
export function initMenu() {
  onReady(async ()=>{
  // ⛔ Do not inject the AO3 Helper menu on Kudos History pages
  if (/\/users\/[^/]+\/kudos-history(?:\/?\/|$)/.test(location.pathname)) {
    return; // skip menu bootstrap entirely on this route
  }

    try {
      // Setup module ready listeners before building menu
      setupModuleReadyListeners();
      
      // Wait for AO3's native libraries (jQuery, CSRF) before building menu
      // Note: Menu will build even without jQuery - it's not strictly required
      // Étape 317 : lecture window.AO3H_Common conservée volontairement —
      // waitForAO3Ready vient de lib/ao3/integration.js, hors graphe Vite
      // (no-op côté Vite, actif côté legacy où le bundler l'auto-expose).
      // Résolu en Phase 27 avec la suppression du build legacy.
      const ao3Common = window.AO3H_Common;
      if (ao3Common && typeof ao3Common.waitForAO3Ready === 'function') {
        console.log('[AO3H][menu] Waiting for AO3 libraries (jQuery, CSRF)...');
        // Only wait for DOM, not jQuery/CSRF (menu doesn't require them)
        const result = await ao3Common.waitForAO3Ready({ 
          jquery: false,  // Don't wait for jQuery - menu works without it
          csrf: false,     // Don't wait for CSRF - not needed for menu
          dom: true,
          timeout: 5000    // Shorter timeout since we only wait for DOM
        });
        
        if (result.timeout) {
          console.warn('[AO3H][menu] DOM not ready after 5s, building menu anyway');
        } else {
          console.log('[AO3H][menu] DOM ready, building menu');
        }
      }
      
      // Show diagnostics in debug mode
      if (AO3H.DEBUG) {
        const diagnostics = [];
        if (ao3Common) {
          if (typeof ao3Common.hasJQuery === 'function') {
            diagnostics.push(`jQuery: ${ao3Common.hasJQuery() ? '✓' : '✗'}`);
          }
          if (typeof ao3Common.hasRailsUJS === 'function') {
            diagnostics.push(`Rails UJS: ${ao3Common.hasRailsUJS() ? '✓' : '✗'}`);
          }
          if (typeof ao3Common.hasTinyMCE === 'function') {
            diagnostics.push(`TinyMCE: ${ao3Common.hasTinyMCE() ? '✓' : '✗'}`);
          }
          if (typeof ao3Common.hasLiveValidation === 'function') {
            diagnostics.push(`LiveValidation: ${ao3Common.hasLiveValidation() ? '✓' : '✗'}`);
          }
        }
        diagnostics.push(`Modules ready: ${modulesReady}`);
        diagnostics.push(`Grouper ready: ${grouperReady}`);
        console.log(`[AO3H][menu] Integration status: ${diagnostics.join(', ')}`);
      }
      
      buildMenu();

      // Keep switch UI in sync if flags change elsewhere
      document.addEventListener(`${NS}:flags-updated`, () => {
        if (!menuUL) return;
        const get = (k)=> Flags.get ? Flags.get(k, false) : false;
        menuUL.querySelectorAll('a[data-flag]').forEach(a => {
          const on = !!get(a.dataset.flag);
          a.setAttribute('aria-checked', String(on));
          a.classList.toggle(`${NS}-on`, on);
        });
      });

      try {
        GM_registerMenuCommand?.('AO3 Helper — Open', ()=> {
          const tab = document.querySelector(`li.${NS}-root`);
          tab?.dispatchEvent(new Event('mouseenter'));
        });
      } catch {}
    } catch (err) {
      console.error('[AO3H][menu] build failed', err);
    }
  });
}

  // ============================================================================
  // PANEL MODAL
  // ============================================================================
  
  async function openPanelModal(moduleName) {
    console.log('[AO3H][menu] Creating panel modal for:', moduleName);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = `${NS}-panel-overlay`;
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = `${NS}-panel-modal`;
    
    // Create header
    const header = document.createElement('div');
    header.className = `${NS}-panel-header`;
    
    const title = document.createElement('h2');
    title.textContent = `Settings: ${moduleName}`;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = `${NS}-panel-close`;
    closeBtn.innerHTML = '✕';
    closeBtn.setAttribute('aria-label', 'Close');
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Create content container (not iframe)
    const iframeContainer = document.createElement('div');
    iframeContainer.className = `${NS}-panel-content`;
    iframeContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;"><p>Loading panel...</p></div>';
    
    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(iframeContainer);
    overlay.appendChild(modal);
    
    // Close handlers
    const closeModal = () => {
      overlay.classList.add(`${NS}-panel-closing`);
      setTimeout(() => overlay.remove(), 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    
    // Escape key to close
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Add to page
    document.body.appendChild(overlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add(`${NS}-panel-open`);
    });
    
    // TEMPORARY TEST: Simple content instead of loading from server
    iframeContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px;">
        <h1 style="font-size: 32px; margin-bottom: 20px;">✅ Panel Modal Works!</h1>
        <p style="font-size: 16px; color: #666;">Module: ${moduleName}</p>
        <p style="margin-top: 20px; font-size: 14px; color: #999;">The panel-mockup will be loaded here.</p>
      </div>
    `;
    console.log('[AO3H][menu] ✅ Panel displayed with test content');
    
    /* TODO: Re-enable panel-mockup loading once basic modal works
    // Load panel content
    try {
      const baseUrl = 'http://127.0.0.1:5501/panel-mockup';
      
      // Helper to fetch with GM_xmlhttpRequest (bypasses CORS)
      const gmFetch = (url) => new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: url,
          onload: (response) => {
            if (response.status >= 200 && response.status < 300) {
              resolve(response.responseText);
            } else {
              reject(new Error(`HTTP ${response.status}`));
            }
          },
          onerror: reject
        });
      });
      
      const [html, css, js] = await Promise.all([
        gmFetch(`${baseUrl}/index.html?t=${Date.now()}`),
        gmFetch(`${baseUrl}/styles.css?t=${Date.now()}`),
        gmFetch(`${baseUrl}/script.js?t=${Date.now()}`)
      ]);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyContent = doc.body.innerHTML;
      
      const panelWrapper = document.createElement('div');
      panelWrapper.className = `${NS}-panel-wrapper`;
      panelWrapper.innerHTML = bodyContent;
      
      const style = document.createElement('style');
      style.textContent = css;
      panelWrapper.appendChild(style);
      
      iframeContainer.innerHTML = '';
      iframeContainer.appendChild(panelWrapper);
      
      // Execute JavaScript in isolated scope (IIFE)
      const script = document.createElement('script');
      script.textContent = `(function() {\n${js}\n})();`;
      panelWrapper.appendChild(script);
      
      console.log('[AO3H][menu] ✅ Panel loaded');
      
    } catch (error) {
      console.error('[AO3H][menu] ❌ Failed to load panel:', error);
      iframeContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999; text-align: center; padding: 40px;">
          <p style="font-size: 18px; margin-bottom: 10px;">⚠️ Failed to load panel</p>
          <p style="font-size: 14px;">Make sure Live Server is running on port 5501</p>
          <p style="font-size: 12px; margin-top: 20px; color: #ccc;">${error.message}</p>
        </div>
      `;
    }
    */
  }
