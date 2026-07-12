/* ──────────────────────────────────────────────────────────────────────────
   MENU GROUPER — ES Module
   Organises menu toggles into category submenus.
   ────────────────────────────────────────────────────────────────────────── */

import { GROUPS } from './menu-groups-config.js';
// Étape 315 : ouverture du panel par import direct (avant : window.openAO3HPanel
// + chaîne de fallback AO3H_PanelLoader). Le bundler legacy (supprimé en
// Phase 27) remplaçait cet import par un shim window.
import { openAO3HPanel } from '../panel/panel-index.js';
// Étape 317 : core et helpers importés directement (avant : lectures window.AO3H
// — dont un `AO3H?.utils?.onReady` avec faute de frappe, .utils au lieu de .util,
// qui retombait toujours sur le fallback local). TABS importé de tab-registry
// (le TODO historique le demandait ; la lecture window.AO3H_Common.TabRegistry
// était cassée côté Vite depuis le retrait de la pose à l'étape 315).
// Le bundler legacy (supprimé en Phase 27) fournissait des shims.
import { AO3H, Modules } from '../../../src/core/lifecycle.js';
import { Flags } from '../../utils/config.js';
import { Bus } from '../../utils/event-bus.js';
import { onReady } from '../../utils/index.js';
import { TABS } from '../panel/tab-registry.js';


// ---- utils & NS ----
const _W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
const lc = s => String(s||'').toLowerCase();
const ready = onReady;
const NS  = (AO3H.env && AO3H.env.NS) || 'ao3h';

// GROUPS is now imported from menu-groups-config.js.
// Replacing the previous window.AO3H_Common / inline fallback lookup.
const getGroups = () => GROUPS;
  const SEL = {
    rootLI:        `li.${NS}-root`,
    navlink:       `.${NS}-navlink`,
    menuUL:        `ul.${NS}-menu`,
    topLevelA:     `ul.${NS}-menu > li > a`,                // (was only [data-flag]) now we inspect all
    submenuUL:     `ul.${NS}-submenu`,
  };

  // SESSION STATE - persists during navigation, resets on reload/new tab
  const stateManager = (() => {
    const ssKey = `${NS}-submenu-state`;
    const navKey = `${NS}-nav-id`;
    
    // Check if this is a reload (hard refresh) or new session
    const isReload = () => {
      try {
        // Modern API
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          return navEntries[0].type === 'reload';
        }
        // Fallback for older browsers
        return performance.navigation?.type === 1;
      } catch { return false; }
    };
    
    // Clear state on reload
    if (isReload()) {
      try { sessionStorage.removeItem(ssKey); } catch {}
    }
    
    const loadState = () => {
      try { return new Map(Object.entries(JSON.parse(sessionStorage.getItem(ssKey) || '{}'))); }
      catch { return new Map(); }
    };
    const saveState = (map) => {
      try { sessionStorage.setItem(ssKey, JSON.stringify(Object.fromEntries(map))); } catch {}
    };
    const submenuState = loadState();
    
    return {
      get: (label) => submenuState.get(label),
      set: (label, value) => {
        submenuState.set(label, value);
        saveState(submenuState);
      },
      has: (label) => submenuState.has(label),
      getState: () => submenuState
    };
  })();

  // ---- CSS: Moved to modular structure ----
  // CSS injection no longer needed - styles are in styles/core/menu-grouper.css

  // ---- submenu builder ----
  function createSubmenu(label){
    const li  = document.createElement('li');
    li.className = `${NS}-group-container`;
    li.setAttribute('data-ao3h-submenu','1');
    li.setAttribute('data-group-label', label);

    const a   = document.createElement('a');
    a.href = '#';
    a.innerHTML = `<span class="${NS}-label">${label}</span><span class="${NS}-caret">▾</span>`;
    a.setAttribute('aria-haspopup','true');
    a.setAttribute('aria-expanded','false');

    const ul  = document.createElement('ul');
    ul.className = `menu dropdown-menu ${NS}-submenu`;
    ul.setAttribute('role','menu');
    ul.setAttribute('data-group-label', label);

    const setOpen = (next, save = true) => {
      ul.classList.toggle('open', !!next);
      a.setAttribute('aria-expanded', String(!!next));
      if (save) stateManager.set(label, !!next);
    };

    // Restore saved state from sessionStorage (persists during navigation)
    if (stateManager.has(label) && stateManager.get(label)) {
      setOpen(true, false); // Don't re-save during initialization
    }

    const toggle = (force)=>{
      const open = ul.classList.contains('open');
      setOpen(typeof force === 'boolean' ? force : !open);
    };

    a.addEventListener('click', (e)=>{ e.preventDefault(); toggle(); });
    a.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); ul.querySelector('a')?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setOpen(false); }
    });
    ul.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowUp' || e.key === 'Escape') { e.preventDefault(); setOpen(false); a.focus(); }
    });

    document.addEventListener('pointerdown', (ev)=>{
      const root = document.querySelector(SEL.rootLI);
      if (!root) return;
      const insideRoot = root.contains(ev.target);
      const insideThis = li.contains(ev.target);
      // Close visually but don't save state (automatic close, not user action)
      if (!insideRoot) setOpen(false, false);
    });

    li.append(a, ul);
    li.__ao3hSetOpen = setOpen; // expose for reapply
    return { li, ul, toggle, header:a, setOpen };
  }

  // ---- Create Manager Panel button (looks like a category) ----
  function createManagerPanelButton() {
    const li = document.createElement('li');
    li.className = `${NS}-group-container ${NS}-manager-panel-btn`;
    li.setAttribute('data-ao3h-manager-btn', '1');

    const a = document.createElement('a');
    a.href = '#';
    a.innerHTML = `<span class="${NS}-icon-btn" aria-hidden="true"><span class="${NS}-icon">⋯</span></span><span class="${NS}-label">Manager Panel</span>`;
    a.setAttribute('aria-haspopup', 'false');
    a.setAttribute('role', 'button');
    a.title = 'Open the AO3 Helper Manager Panel';

    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('[AO3H][menu-grouper] Manager Panel button clicked');

      // Étape 315 : import direct — l'ancienne chaîne de fallback
      // (window → unsafeWindow → AO3H_PanelLoader) est devenue inutile.
      if (typeof openAO3HPanel === 'function') {
        openAO3HPanel();
      } else {
        console.warn('[AO3H][menu-grouper] Manager panel not loaded yet');
      }
    });

    li.appendChild(a);
    return li;
  }

  // ---- Create empty group structure immediately ----
  function createEmptyGroups() {
    console.log('[AO3H][menu-grouper] Creating empty group structure...');
    
    const menuUL = document.querySelector(SEL.menuUL);
    if (!menuUL) {
      console.warn('[AO3H][menu-grouper] Menu UL not found for empty groups');
      return;
    }

    // Hide the entire menu during reorganization to prevent flash
    menuUL.style.visibility = 'hidden';

    // Remove any existing group structure
    menuUL.querySelectorAll(`li[data-ao3h-submenu="1"]`).forEach(li => {
      const prev = li.previousElementSibling;
      if (prev && prev.classList.contains(`${NS}-divider`) && prev.getAttribute('data-ao3h-submenu') === '1') prev.remove();
      li.remove();
    });
    
    // Remove any existing manager panel button
    menuUL.querySelectorAll(`li[data-ao3h-manager-btn="1"]`).forEach(li => {
      const prev = li.previousElementSibling;
      if (prev && prev.classList.contains(`${NS}-divider`) && prev.getAttribute('data-ao3h-manager-btn') === '1') prev.remove();
      li.remove();
    });

    const groups = getGroups();
    console.log(`[AO3H][menu-grouper] Creating ${groups.length} empty groups:`, groups.map(g => g.label));

    // Create all groups upfront (empty)
    for (const groupConfig of groups) {
      const { li, ul } = createSubmenu(groupConfig.label);
      
      const divider = document.createElement('li');
      divider.className = `${NS}-divider`;
      divider.setAttribute('data-ao3h-submenu','1');
      
      menuUL.appendChild(divider);
      menuUL.appendChild(li);
    }
    
    // Add Manager Panel button at the bottom (looks like a category)
    const managerDivider = document.createElement('li');
    managerDivider.className = `${NS}-divider`;
    managerDivider.setAttribute('data-ao3h-manager-btn', '1');
    menuUL.appendChild(managerDivider);
    
    const managerBtn = createManagerPanelButton();
    menuUL.appendChild(managerBtn);
    console.log('[AO3H][menu-grouper] Manager Panel button added to menu');

    // Hide all top-level toggles immediately (will be revealed if ungrouped during population)
    const topAs = Array.from(document.querySelectorAll(SEL.topLevelA));
    const topToggleAs = topAs.filter(a => a.matches('[data-flag]'));
    console.log(`[AO3H][menu-grouper] Hiding ${topToggleAs.length} toggles until population`);
    
    topToggleAs.forEach(a => {
      const li = a.closest('li');
      if (li) {
        li.setAttribute('data-ao3h-grouped-original', '1'); // Hide it temporarily
        
        // Also hide following action rows
        const tails = collectFollowingModuleRows(li);
        tails.forEach(row => row.setAttribute('data-ao3h-grouped-original', '1'));
      }
    });

    // Reveal the menu now that groups are created
    menuUL.style.visibility = '';

    console.log('[AO3H][menu-grouper] Empty group structure created, all toggles hidden, menu revealed');
  }

// ---- group resolver ----
// Map group keys (from module-registry.js) to the current tab labels.
// Built dynamically from tab-registry so renaming a label in tab-registry.js
// is automatically reflected here — no manual sync needed.
// Étape 317 : TABS importé (le TODO ci-dessus est réalisé).
const _tabDefs = TABS || [];
  const GROUP_KEY_TO_LABEL = Object.fromEntries(_tabDefs.map(t => [t.id, t.label]));
  // Legacy key aliases (old group keys before the merge) — point to the same labels
  if (GROUP_KEY_TO_LABEL['reading'])    { GROUP_KEY_TO_LABEL['filters']    = GROUP_KEY_TO_LABEL['reading']; }
  if (GROUP_KEY_TO_LABEL['explore'])    { GROUP_KEY_TO_LABEL['analysis']   = GROUP_KEY_TO_LABEL['explore'];
                                          GROUP_KEY_TO_LABEL['discover']   = GROUP_KEY_TO_LABEL['explore']; }
  if (GROUP_KEY_TO_LABEL['library'])    { GROUP_KEY_TO_LABEL['mystats']    = GROUP_KEY_TO_LABEL['library']; }
  if (GROUP_KEY_TO_LABEL['navigate'])   { GROUP_KEY_TO_LABEL['engage']     = GROUP_KEY_TO_LABEL['navigate'];
                                          GROUP_KEY_TO_LABEL['navigation'] = GROUP_KEY_TO_LABEL['navigate']; }

  function decideGroup(mod){
    const groups = getGroups();
    const name  = mod?.name || '';
    const title = mod?.meta?.title || name;
    
    // First, try to map module's group key to the full label
    if (mod?.meta?.group) {
      const groupLabel = GROUP_KEY_TO_LABEL[mod.meta.group];
      if (groupLabel) {
        console.log(`[AO3H][menu-grouper] Module "${name}" group key "${mod.meta.group}" → label "${groupLabel}"`);
        return groupLabel;
      }
      
      // Fallback: try to find by partial match
      const g = groups.find(grp => lc(grp.label).includes(lc(mod.meta.group)));
      if (g) return g.label;
    }
    
    // Second, try to match by module name in the include list
    for (const g of groups) {
      if (g.include && g.include.map(lc).includes(lc(name))) return g.label;
    }
    
    // Third, try regex matching
    for (const g of groups) {
      if (g.match && (g.match.test(title) || g.match.test(name))) return g.label;
    }
    
    return null;
  }

  // ---- clear build + unhide originals ----
  function clearPrevious(menuUL){
    menuUL.querySelectorAll(`li[data-ao3h-submenu="1"]`).forEach(li => {
      const prev = li.previousElementSibling;
      if (prev && prev.classList.contains(`${NS}-divider`) && prev.getAttribute('data-ao3h-submenu') === '1') prev.remove();
      li.remove();
    });
    let originals = [];
    try {
      originals = menuUL.querySelectorAll(`:scope > li[data-ao3h-grouped-original="1"]`);
    } catch {
      originals = Array.from(menuUL.children).filter(el => el.matches(`li[data-ao3h-grouped-original="1"]`));
    }
    originals.forEach(li => li.removeAttribute('data-ao3h-grouped-original'));
  }

  // ---- helpers to classify top-level rows ----
  const isToggle = (a)=> a && a.matches('[data-flag]');
  const isAction = (a)=> a && !a.matches('[data-flag]');

  // Move-following heuristic:
  // After finding a module toggle at top-level, we will also move
  // the immediate next siblings that look like *its* actions,
  // stopping when we hit:
  //   - another toggle row
  //   - a "Manage" tail
  //   - a divider we inserted for group anchors
  function collectFollowingModuleRows(startLI){
    const rows = [];
    let cur = startLI.nextElementSibling;
    while (cur) {
      const a = cur.querySelector(':scope > a');
      if (!a) break;

      // Stop if we reached another module toggle at top level
      if (isToggle(a)) break;

      // Stop if we reached our grouper's anchors
      if (cur.classList.contains(`${NS}-manage-tail`) || cur.classList.contains(`${NS}-manage-sep`)) break;

      // Looks like an action or custom row → group it along with the module
      rows.push(cur);
      cur = cur.nextElementSibling;
    }
    return rows;
  }

  // ---- populate groups: move items into existing group structure ----
  function populateGroups(){
    console.log('[AO3H][menu-grouper] Populating groups with menu items...');
    
    const menuUL = document.querySelector(SEL.menuUL);
    if (!menuUL) {
      console.warn('[AO3H][menu-grouper] Menu UL not found');
      return;
    }

    // Clear any previous clones in groups (but keep the group structure)
    menuUL.querySelectorAll(`.${NS}-submenu`).forEach(submenuUL => {
      submenuUL.innerHTML = ''; // Clear all cloned items
    });

    const topAs = Array.from(document.querySelectorAll(SEL.topLevelA));
    console.log(`[AO3H][menu-grouper] Found ${topAs.length} top-level menu items`);
    if (!topAs.length) return;

    // Get all registered modules and create flag -> module map
    const mods = (Modules?.all?.() ?? []);
    console.log(`[AO3H][menu-grouper] Found ${mods.length} registered modules:`, mods.length > 0 ? mods.map(m => m.name) : '(none yet)');
    
    const byFlag = new Map();
    for (const m of mods) {
      if (m.enabledKey) byFlag.set(m.enabledKey, m);
      if (m.enabledKeyAlt && m.enabledKeyAlt !== m.enabledKey) byFlag.set(m.enabledKeyAlt, m);
    }
    
    console.log(`[AO3H][menu-grouper] Flag mappings:`, byFlag.size > 0 ? Array.from(byFlag.keys()) : '(none yet)');

    // Find existing group containers
    const findGroupUL = (label) => {
      const container = menuUL.querySelector(`li[data-ao3h-submenu="1"][data-group-label="${label}"]`);
      return container ? container.querySelector(`.${NS}-submenu`) : null;
    };

    // Only process top-level LIs that contain a data-flag (module toggles created by menu.js)
    const topToggleAs = topAs.filter(a => a.matches('[data-flag]'));
    console.log(`[AO3H][menu-grouper] Found ${topToggleAs.length} toggle items with data-flag:`, topToggleAs.length > 0 ? topToggleAs.map(a => a.dataset.flag) : '(none)');
    
    let groupedCount = 0;
    for (const a of topToggleAs){
      const li = a.closest('li');
      if (!li) continue;
      
      const flagKey = a.dataset.flag;
      const mod = byFlag.get(flagKey);
      
      // Determine group using the registered module info
      let group = null;
      if (mod) {
        group = decideGroup(mod);
        console.log(`[AO3H][menu-grouper] Module "${mod.name}" (${flagKey}) → Group: "${group}"`);
      } else {
        // Module not loaded yet - infer group from flag name using group patterns
        const groups = getGroups();
        for (const g of groups) {
          if (g.include && g.include.some(name => lc(name) === lc(flagKey))) {
            group = g.label;
            break;
          }
          if (g.match && g.match.test(flagKey)) {
            group = g.label;
            break;
          }
        }
        console.log(`[AO3H][menu-grouper] Module not loaded yet for flag: ${flagKey}, inferred group: "${group}"`);
      }
      
      if (!group) {
        // No group - reveal this item (remove hidden attribute)
        li.removeAttribute('data-ao3h-grouped-original');
        
        // Also reveal its action rows
        const tails = collectFollowingModuleRows(li);
        tails.forEach(row => row.removeAttribute('data-ao3h-grouped-original'));
        continue;
      }

      const ul = findGroupUL(group);
      if (!ul) {
        console.warn(`[AO3H][menu-grouper] Group UL not found for: ${group}`);
        // Reveal since we can't group it
        li.removeAttribute('data-ao3h-grouped-original');
        const tails = collectFollowingModuleRows(li);
        tails.forEach(row => row.removeAttribute('data-ao3h-grouped-original'));
        continue;
      }

      // Clone the main toggle row into the group (keep it hidden at top level)
      const clonedLi = li.cloneNode(true);
      ul.appendChild(clonedLi);
      // li already has data-ao3h-grouped-original="1" from createEmptyGroups
      
      // Étape 317 : bloc « re-attach settings listener » supprimé — il était gardé par
      // w.AO3H_openModuleSettings / w.AO3H_ManagerPanel, globals jamais posés nulle part
      // (chemin mort dans les deux builds ; le clic passe par la délégation de menu.js).

      // Also sweep & clone the adjacent action rows that belong to this module
      const tails = collectFollowingModuleRows(li);
      for (const row of tails){
        ul.appendChild(row.cloneNode(true));
        // row already has data-ao3h-grouped-original="1" from createEmptyGroups
      }
      
      groupedCount++;
    }

    console.log(`[AO3H][menu-grouper] Populated ${groupedCount} modules into groups`);
    
    // Signal that grouping is complete
    try {
      console.log('[AO3H][menu-grouper] Signaling grouper ready state');
      window.dispatchEvent(new CustomEvent('AO3H:grouper:ready'));
      window.dispatchEvent(new CustomEvent('AO3H:menu:grouped'));
      
      // Also notify via bus if available
      if (Bus?.emit) {
        Bus.emit('grouper:ready');
        Bus.emit('menu:grouped');
      }
    } catch (err) {
      console.warn('[AO3H][menu-grouper] Failed to signal grouper ready:', err);
    }
    
    // submenu open/closed already restored when groups were created
  }

  // ---- keep clones' on/off classes in sync with flags ----
  function syncCloneStates(){
    const flags = Flags;
    if (!flags) return;
    document.querySelectorAll(`${SEL.submenuUL} a[data-flag]`).forEach(a => {
      const on = !!flags.get(a.dataset.flag, false);
      a.setAttribute('aria-checked', String(on));
      // Remove both classes first, then add the correct one
      a.classList.remove(`${NS}-on`, `${NS}-off`);
      a.classList.add(on ? `${NS}-on` : `${NS}-off`);
    });
  }

  // ---- reapply previously saved open/closed state (without rebuilding) ----
  function reapplySubmenuState(){
    console.log('[AO3H][menu-grouper] 🔄 Reapplying submenu state...');
    const subs = document.querySelectorAll(`li[data-ao3h-submenu="1"]`);
    console.log('[AO3H][menu-grouper] Found', subs.length, 'potential submenus to check');
    
    let processed = 0;
    subs.forEach(li => {
      const header = li.querySelector('a[aria-haspopup="true"]');
      const ul = li.querySelector(`.${NS}-submenu`);
      
      // Skip dividers and other elements without submenu structure
      if (!header || !ul) return;

      const label = header.querySelector(`.${NS}-label`)?.textContent?.trim() || '';
      if (!label) return;

      processed++;
      const currentlyOpen = ul.classList.contains('open');
      const shouldBeOpen = !!stateManager.get(label);
      console.log('[AO3H][menu-grouper] Group', label, '- currently:', currentlyOpen, ', should be:', shouldBeOpen);
      
      if (currentlyOpen !== shouldBeOpen) {
        ul.classList.toggle('open', shouldBeOpen);
        header.setAttribute('aria-expanded', String(shouldBeOpen));
        console.log('[AO3H][menu-grouper] ✓ Updated', label, 'to', shouldBeOpen);
      }
    });
    console.log('[AO3H][menu-grouper] ✓ Reapply complete -', processed, 'groups processed');
  }

  // ---- wire up: create empty groups immediately, populate on first open ----
  let groupsCreated = false;
  let populated = false;

  function hookOpenOnce(){
    const root = document.querySelector(SEL.rootLI);
    if (!root || root.__ao3hOpenGroupOnce) return;

    const populateIfNeeded = ()=> {
      // Populate groups with items on first open
      if (populated) return;
      populated = true;
      console.log('[AO3H][menu-grouper] Populating groups...');
      setTimeout(()=>{ populateGroups(); syncCloneStates(); reapplySubmenuState(); }, 0);
    };

    const reapplyOnOpen = ()=> { 
      setTimeout(reapplySubmenuState, 0); 
    };

    root.addEventListener('mouseenter', populateIfNeeded, { passive:true });
    root.addEventListener('focusin',    populateIfNeeded);
    root.querySelector(SEL.navlink)?.addEventListener('click', populateIfNeeded);

    root.addEventListener('mouseenter', reapplyOnOpen, { passive:true });
    root.addEventListener('focusin',    reapplyOnOpen);

    root.__ao3hOpenGroupOnce = true;
  }

  function hookMenuRebuild(){
    const api = AO3H.menu;
    if (api && typeof api.rebuild === 'function' && !api.__ao3hGroupPatch){
      console.log('[AO3H][menu-grouper] Hooking menu rebuild function...');
      const orig = api.rebuild.bind(api);
      api.rebuild = function(){
        console.log('[AO3H][menu-grouper] Menu rebuild triggered, recreating groups...');
        const r = orig();
        populated = false; // next open will repopulate
        
        // Recreate empty groups after menu rebuild
        createEmptyGroups();
        
        const root = document.querySelector(SEL.rootLI);
        if (root && root.classList.contains('open')) {
          setTimeout(()=>{ 
            console.log('[AO3H][menu-grouper] Repopulating groups after menu rebuild...');
            populateGroups(); 
            syncCloneStates(); 
            reapplySubmenuState(); 
          }, 0);
        }
        return r;
      };
      api.__ao3hGroupPatch = true;
    } else if (!api) {
      console.warn('[AO3H][menu-grouper] Menu API not available for hooking');
    } else if (api.__ao3hGroupPatch) {
      console.log('[AO3H][menu-grouper] Menu rebuild already hooked');
    }
  }

  function hookFlagSync(){
    document.addEventListener(`${NS}:flags-updated`, () => {
      setTimeout(syncCloneStates, 0);
    });
  }

  function boot(){
    if (!document.querySelector(SEL.menuUL)) { setTimeout(boot, 100); return; }
    console.log('[AO3H][menu-grouper] Menu found, initializing grouper...');
    
    // Create empty group structure immediately
    if (!groupsCreated) {
      createEmptyGroups();
      groupsCreated = true;
    }
    
    hookOpenOnce();
    hookMenuRebuild();
    hookFlagSync();
  }

  // Wait for menu to be built (modules can load later)
  function waitForMenu(){
    const checkMenuAvailable = () => {
      const menuUL = document.querySelector(SEL.menuUL);
      const hasMenuItems = menuUL && menuUL.children.length > 0;
      return !!hasMenuItems;
    };
    
    // If menu is already available, start immediately
    if (checkMenuAvailable()) {
      console.log('[AO3H][menu-grouper] Menu already available, starting...');
      setTimeout(boot, 50);
      return;
    }
    
    console.log('[AO3H][menu-grouper] Waiting for menu to be available...');
    
    let started = false;
    
    const startGrouper = () => {
      if (started) return;
      
      // Check if menu is available
      if (!checkMenuAvailable()) {
        console.log('[AO3H][menu-grouper] Menu not ready yet, waiting more...');
        setTimeout(() => {
          if (!started) startGrouper();
        }, 100);
        return;
      }
      
      started = true;
      console.log('[AO3H][menu-grouper] Menu available, starting grouper...');
      setTimeout(boot, 50);
    };
    
    // Listen for menu ready events
    if (Bus?.on) {
      Bus.on('menu:ready', startGrouper);
    }
    
    try {
      window.addEventListener('AO3H:menu:ready', startGrouper);
    } catch (e) {
      console.warn('[AO3H][menu-grouper] Could not set up window event listeners:', e);
    }
    
    // Polling fallback - check every 200ms for up to 20 seconds
    // Increased from 10s to 20s to account for jQuery loading time (15s) + menu construction
    let attempts = 0;
    const maxAttempts = 100; // 100 * 200ms = 20 seconds
    const pollForReadiness = () => {
      attempts++;
      if (started) return;
      
      if (checkMenuAvailable()) {
        console.log('[AO3H][menu-grouper] Menu found via polling after ' + (attempts * 200) + 'ms, starting...');
        startGrouper();
      } else if (attempts < maxAttempts) {
        setTimeout(pollForReadiness, 200);
      } else {
        console.warn('[AO3H][menu-grouper] Timeout waiting for menu after 20s (menu may not have been built)');
      }
    };
    
    // Start polling after a brief delay
    setTimeout(pollForReadiness, 200);
  }

// ---- Public API ----
export const menuGrouper = {
  sync: syncCloneStates,
  rebuild: () => {
    console.log('[AO3H][menu-grouper] External rebuild requested');
    populated = false; // Reset to allow repopulation
    setTimeout(() => {
      populateGroups();
      syncCloneStates();
      reapplySubmenuState();
    }, 10);
  }
};

// Étape 317 : pose window.AO3H_MenuGrouper supprimée — menu.js importe menuGrouper
// directement (seul lecteur).

export function initMenuGrouper() {
  // Start when DOM is ready, only wait for menu (not modules)
  ready(waitForMenu);
}
