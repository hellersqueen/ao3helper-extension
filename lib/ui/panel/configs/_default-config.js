/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Default Template
   
   This is the default configuration template used for modules that don't
   have a custom config yet. It provides a basic "Status" display.
   
   To create a custom config for a module:
   1. Copy this file and rename to: moduleName-config.js
   2. Replace the content with your custom settings UI
   3. Register in index.js
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = '_default';

// Default config template - used when no custom config exists
export const config = `
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Status</label>
                    <div class="ao3h-setting-control">
                        <span style="color: #4caf50;">✓ Module configuration available</span>
                    </div>
                </div>
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
