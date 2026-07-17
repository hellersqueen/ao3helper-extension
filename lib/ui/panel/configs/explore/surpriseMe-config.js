/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Surprise Me
   
   Configuration panel for the Surprise Me module.
   Random work picker respecting active filters.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'surpriseMe';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Options</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPreviewBeforeOpen">
                            Show preview before opening
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Title + summary + stats shown before opening the work</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="completedOnly">
                            Complete works only
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analysis & Recommendations</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show detailed analysis</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="showDetails" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable recommendations</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableRecommendations" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max results</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="maxResults" value="10" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Analysis & Recommendations -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
