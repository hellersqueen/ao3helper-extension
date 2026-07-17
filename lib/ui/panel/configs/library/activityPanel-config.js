/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Activity Panel
   
   Configuration panel for the Activity Panel module.
   Fusion: activityPanel + readingInsights

   Sections:
   - Optional visualisation features
   - Automatic Behaviours
   - Behaviour Settings (placeholder — not yet wired to module)
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'activityPanel';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Optional Visualisation Features</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showTagCloud">
                            Show tag cloud
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visual view of your most-read tags (computed from full history)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="readingAchievements">
                            Enable reading achievements
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Milestone badges: 10K / 100K / 1M words read</div>
                </div>
                </div><!-- /.ao3h-config-section: Optional Visualisation Features -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>
                <div class="ao3h-setting-description">
                    Always visible:
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                        <li>Works read · Kudos given · Bookmarks</li>
                        <li>Period selector: Today / 7d / 30d / Year / All</li>
                        <li>Export JSON + Refresh button</li>
                    </ul>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to _activityPanel.js
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Behaviour Settings</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable sync</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableSync">
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Sort by</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="sortBy">
                            <option value="date-added">Date Added</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-refresh data</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoRefresh">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Behaviour Settings -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
