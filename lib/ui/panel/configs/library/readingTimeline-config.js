/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Reading Timeline

   Calendar heatmap of your reading history.

   Sections:
   - Appearance
   - Default View
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'readingTimeline';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Appearance</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Heatmap colour</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="heatmapColor">
                            <option value="green" selected>Green (default)</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                            <option value="blue">Blue</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Color palette used for the activity heatmap</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Calendar range</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="calendarRange">
                            <option value="3">3 years</option>
                            <option value="5" selected>5 years (default)</option>
                            <option value="10">10 years</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">How many past years appear in the year selector</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Heatmap intensity</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="heatmapIntensity">
                            <option value="low">Low (needs more reads per shade)</option>
                            <option value="medium" selected>Medium (default)</option>
                            <option value="high">High (reaches deepest shade sooner)</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">How quickly a day's color reaches the deepest shade</div>
                </div>
                </div><!-- /.ao3h-config-section: Appearance -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Default View</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Open timeline in</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="defaultView">
                            <option value="year" selected>Year heatmap</option>
                            <option value="month">Month detail</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Which view opens when you launch the timeline</div>
                </div>
                </div><!-- /.ao3h-config-section: Default View -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Listings</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideReadWorks">
                            Hide already-read works instead of highlighting them
                        </label>
                    </div>
                    <div class="ao3h-setting-description">On listing pages, remove already-read works instead of just tinting/badging them</div>
                </div>
                </div><!-- /.ao3h-config-section: Listings -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
