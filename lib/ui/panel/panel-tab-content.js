/* ═══════════════════════════════════════════════════════════════════════════
   PANEL TAB CONTENT — Generated at module load time from tab-registry.js

   Each module has data-module-id attribute for icon-button association.
   The icon button in menu opens panel directly to the associated module.

   Module configs are loaded dynamically from AO3H_PanelConfigs.

   Étape 393 (Phase 30) : ce fichier contenait auparavant un objet HTML figé,
   régénéré à la main par un script (build/generate-tab-content.js) supprimé
   depuis l'étape 331 — ajouter un module à tab-registry.js ne mettait donc
   plus à jour le panel. Remplacé par une génération dynamique depuis
   TABS/ALL_MODULES : ajouter un module au registre suffit désormais à le
   rendre visible ici, sans étape de build séparée.
═══════════════════════════════════════════════════════════════════════════ */

import { TABS, ALL_MODULES } from './tab-registry.js';

function escapeHtml (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function moduleBlock ({ id, title, desc }) {
  return `
        <div class="ao3h-module-container" data-module-id="${escapeHtml(id)}">
            <div class="ao3h-module-row">
                <label class="ao3h-module-quick-toggle" onclick="event.stopPropagation()">
                    <input type="checkbox" class="ao3h-quick-enable-checkbox">
                </label>
                <div class="ao3h-module-info">
                    <div class="ao3h-module-name">${escapeHtml(title)}</div>
                    <div class="ao3h-module-desc">${escapeHtml(desc)}</div>
                </div>
                <div class="ao3h-module-controls">
                    <button class="ao3h-config-btn">▼</button>
                </div>
            </div>
            <div class="ao3h-module-config-area" data-config-module="${escapeHtml(id)}">
                <!-- Config loaded dynamically from AO3H_PanelConfigs -->
            </div>
        </div>`;
}

function tabBlock (tab) {
  return `
<div class="ao3h-tab-content" data-tab="${escapeHtml(tab.id)}">
    <div class="ao3h-tab-count">${tab.modules.length} modules</div>
    <div class="ao3h-modules-list">${tab.modules.map(moduleBlock).join('')}
    </div>
</div>
`;
}

function aboutBlock () {
  return `
<div class="ao3h-tab-content" data-tab="about">
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0 0 4px; font-size: 20px; color: #900;">AO3 Helper</h2>
            <p style="color: #999; margin: 0; font-size: 13px;">Version 1.0.0</p>
        </div>

        <div style="padding: 14px; background: #f9f9f9; border-radius: 8px; margin-bottom: 16px;">
            <p style="color: #555; line-height: 1.6; font-size: 13px; margin: 0;">AO3 Helper enhances your Archive of Our Own experience with ${ALL_MODULES.length} modules across ${TABS.length} categories — covering reading, filtering, bookmarking, navigation, appearance, and more.</p>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
            <div style="flex: 1; padding: 12px; background: #fff5f5; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #900;">${ALL_MODULES.length}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px;">Modules</div>
            </div>
            <div style="flex: 1; padding: 12px; background: #f5f5ff; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #336;">${TABS.length}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px;">Categories</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 10px; font-size: 14px; color: #333;">Quick Actions</h3>
            <button class="ao3h-config-save-btn" style="width: 100%; margin-bottom: 6px; cursor: pointer;" onclick="document.querySelectorAll('.ao3h-quick-enable-checkbox').forEach(c => { c.checked = true; c.dispatchEvent(new Event('change', {bubbles:true})); })">✅ Enable All Modules</button>
            <button class="ao3h-config-save-btn" style="width: 100%; margin-bottom: 6px; cursor: pointer;" onclick="document.querySelectorAll('.ao3h-quick-enable-checkbox').forEach(c => { c.checked = false; c.dispatchEvent(new Event('change', {bubbles:true})); })">❌ Disable All Modules</button>
            <button class="ao3h-config-save-btn" style="width: 100%; background: #f0f0f0; color: #333; cursor: pointer;" onclick="if(confirm('Reset all settings to defaults?')) { localStorage.removeItem('ao3h-settings'); location.reload(); }">🔄 Reset to Defaults</button>
        </div>

        <div style="padding: 12px; background: #f9f9f9; border-radius: 8px; font-size: 12px; color: #888;">
            <div style="margin-bottom: 6px;"><strong style="color: #666;">Created by:</strong> ehly</div>
            <div style="margin-bottom: 6px;"><strong style="color: #666;">License:</strong> MIT</div>
            <div><strong style="color: #666;">Feedback:</strong> Report issues or suggest features on GitHub</div>
        </div>
    </div>
</div>
    `;
}

export const tabContent = Object.fromEntries([
  ...TABS.map(tab => [tab.id, tabBlock(tab)]),
  ['about', aboutBlock()],
]);

console.log(`[AO3H][panel-tab-content] Tab content generated - ${TABS.length} tabs + About, ${ALL_MODULES.length} modules`);
