/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Notification Center
   
   Configuration panel for the Notification Center module.
   Tracks updates to subscribed and followed works.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'notificationCenter';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Notifications</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="desktopNotifications">
                            Desktop notifications
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Browser permission required. Requires desktop notifications to be active.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="soundEffects">
                            Sound effects
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Active only when desktop notifications are enabled</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quietHoursEnabled" id="ao3h-nc-quiet">
                            Enable quiet hours
                        </label>
                    </div>
                </div>

                <div class="ao3h-indent" id="ao3h-nc-quiet-opts">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">From</label>
                    <div class="ao3h-setting-control">
                        <input type="time" data-setting="quietHoursStart" value="22:00" style="width: 90px;">
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">To</label>
                    <div class="ao3h-setting-control">
                        <input type="time" data-setting="quietHoursEnd" value="08:00" style="width: 90px;">
                    </div>
                </div>
                </div><!-- /#ao3h-nc-quiet-opts -->

                </div><!-- /.ao3h-config-section -->

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
