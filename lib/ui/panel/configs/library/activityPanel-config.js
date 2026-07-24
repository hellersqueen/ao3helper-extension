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
                    <div class="ao3h-setting-description">Clickable cloud of your most-read tags — size reflects frequency, click to search that tag on AO3</div>
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
                    Always visible, all statistics shown together (no per-stat toggles by design):
                    <ul class="ao3h-config-list">
                        <li>Works read · Words read · Kudos given</li>
                        <li>Period selector: Today / 7d / 30d / Year / All time</li>
                        <li>Export JSON (⬇) + Refresh (🔄) buttons</li>
                        <li>Fandom breakdown: pie chart, hours + kudos columns, compare up to 3 fandoms</li>
                        <li>Reading habits: weekly heatmap, predicted best reading time, night-owl/regularity profile</li>
                        <li>Reading patterns: rising tags, month-over-month comparison, rereads, intensive sessions, typical abandon point, quarterly &amp; per-season breakdowns</li>
                        <li>Quick links to Bookmarks / History / Subscriptions</li>
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
