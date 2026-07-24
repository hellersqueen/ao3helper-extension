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
                        <input type="time" class="ao3h-config-input ao3h-field--sm" data-setting="quietHoursStart" value="22:00">
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">To</label>
                    <div class="ao3h-setting-control">
                        <input type="time" class="ao3h-config-input ao3h-field--sm" data-setting="quietHoursEnd" value="08:00">
                    </div>
                </div>
                </div><!-- /#ao3h-nc-quiet-opts -->

                </div><!-- /.ao3h-config-section -->

                <!-- ─── SOURCES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tracked Sources</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="checkbox" data-setting="trackBookmarks" checked> ⭐ Bookmarks</label>
                        <label><input type="checkbox" data-setting="trackMFL" checked> 📌 Marked for Later</label>
                        <label><input type="checkbox" data-setting="trackHistory" checked> 📚 Reading history</label>
                        <label><input type="checkbox" data-setting="trackSubscriptions"> 📰 AO3 subscriptions</label>
                    </div>
                    <div class="ao3h-setting-description">Which lists to check for new chapters. AO3 subscriptions are checked at most every 6 hours (a full listing page fetch, so less frequent than the other sources).</div>
                </div>
                </div><!-- /.ao3h-config-section: Tracked Sources -->

                <!-- ─── FEED DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Feed Display</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Digest mode</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="digestMode">
                            <option value="off">Off — one entry per update</option>
                            <option value="daily">Daily summary</option>
                            <option value="weekly">Weekly summary</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Collapses the feed into one summary line per day/week instead of one line per update</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showHomepageWidget" checked>
                            Show widget on AO3 homepage
                        </label>
                    </div>
                    <div class="ao3h-setting-description">A compact "What's New" box on the homepage, in addition to the bell in the menu</div>
                </div>
                </div><!-- /.ao3h-config-section: Feed Display -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
