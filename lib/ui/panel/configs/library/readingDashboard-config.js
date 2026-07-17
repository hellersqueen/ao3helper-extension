/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Reading Dashboard

   Personal reading dashboard.
   Previously: readerCorner

   Sections:
   - Visible Widgets
   - Display Settings
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'readingDashboard';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Visible Widgets</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRecentWorks" checked>
                            Recent Works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Last fics you opened on AO3</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showWipTracker" checked>
                            Currently Reading / WIP Tracker
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Unfinished reads sorted by last activity</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showTopFandoms" checked>
                            Top Fandoms
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Your most-visited fandoms</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showTopTags" checked>
                            Top Tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Your most-read tags</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickLinks" checked>
                            Quick Links
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shortcuts to your AO3 pages</div>
                </div>
                </div><!-- /.ao3h-config-section: Visible Widgets -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Display Settings</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Recent works to display</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="recentWorksCount">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Top fandoms to display</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="topFandomsCount">
                            <option value="3">3</option>
                            <option value="6" selected>6</option>
                            <option value="10">10</option>
                        </select>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Display Settings -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
