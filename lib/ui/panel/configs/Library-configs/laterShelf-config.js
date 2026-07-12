/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Later Shelf
   
   Configuration panel for the Later Shelf module.
   Previously: markedForLaterManager + workReminder
   
   Sections:
   - Quick Button
   - Work Reminders
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'laterShelf';
export const config = `

                <!-- ─── QUICK BUTTON ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Button</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickButton" checked>
                            Show 📌 button on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown in all contexts, except works already bookmarked</div>
                </div>

                <!-- ─── REMINDERS ─── -->
                </div><!-- /.ao3h-config-section: Quick Button -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Work Reminders</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="remindersEnabled" id="ao3h-ls-reminders">
                            Enable work reminders
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Opt-in — in-browser notifications only. Set reminders per work from the MFL list.</div>
                </div>

                </div><!-- /.ao3h-config-section: Work Reminders -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Sync & Refresh</div>

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
                </div><!-- /.ao3h-config-section: Sync & Refresh -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
