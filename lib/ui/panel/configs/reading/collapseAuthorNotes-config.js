/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Collapse Author Notes
   
   Configuration panel for the Collapse Author Notes module.
   Standalone — no dependencies.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'collapseAuthorNotes';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Author Notes</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCollapseBeginning">
                            Auto-collapse beginning notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCollapseEnd">
                            Auto-collapse end notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoExpandWarnings" checked>
                            Always expand notes containing TW / CW / trigger warning / content warning
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Prevents safety information from being accidentally hidden</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideCollectionBanners">
                            Hide collection banners
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides collection / gift / challenge banners</div>
                </div>
                </div><!-- /.ao3h-config-section -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-apply filters</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoApply" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-save progress</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoSave" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Update interval (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="interval" value="30" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
