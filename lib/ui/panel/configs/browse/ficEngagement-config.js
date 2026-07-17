/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Engagement

   Configuration panel for the Fic Engagement module.
   Fusion: ficEngagement + hiddenGems

   3 engagement metrics (automatic) + Hidden Gems badge (automatic).
   Only one user-facing option: metric colour coding.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'ficEngagement';

export const config = `

                <!-- ─── METRICS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Engagement Metrics</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="colorCodeMetrics">
                            Colour-code metrics
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Green = high · Yellow = medium · Red = low engagement ratio</div>
                </div>
                </div><!-- /.ao3h-config-section: Engagement Metrics -->

                <!-- ─── INFO ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>
                <div class="ao3h-setting-description">
                    The following are always active:
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                        <li>Kudos ratio · Kudos density · Save rate on all blurbs</li>
                        <li>Tooltip on hover → raw numbers</li>
                        <li>💎 Hidden Gem badge on underexposed works</li>
                        <li>Sorting by engagement via Search Enhancer</li>
                    </ul>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
