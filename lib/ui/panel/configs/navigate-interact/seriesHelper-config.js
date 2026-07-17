/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Series Helper
   
   Configuration panel for the Series Helper module.
   Shows extra series information: progress, type detection, navigation banner.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'seriesHelper';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Series Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="epicSeriesWarning">
                            "Epic Series" warning badge
                        </label>
                    </div>
                    <div class="ao3h-setting-description">“Epic Series” shown on series with 20+ works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="groupSeriesInSearch">
                            Group series works in search results
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Collapses works belonging to the same series</div>
                </div>

                </div><!-- /.ao3h-config-section -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Behaviour</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable shortcuts</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableShortcuts" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable user filters</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableFilters" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Behaviour -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
