/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - User Relationships
   
   Author favorites & user blocking.
   Fusion: authorManager + userBlocker

   Sections:
   - Author Manager
   - User Blocker
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'userRelationships';
export const config = `

                <!-- ─── AUTHOR MANAGER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Author Manager</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="favoritesOnlyFilter">
                            Filter: favourite authors only
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-description">Favourite and hide controls are available beside authors on work listings.</div>

                <!-- ─── USER BLOCKER ─── -->
                </div><!-- /.ao3h-config-section: Author Manager -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">User Blocker</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPlaceholder" checked>
                            Show placeholder when content is hidden
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"[Hidden — Author blocked]" shown. Disable for silent removal.</div>
                </div>

                <div class="ao3h-indent">
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tempRevealHidden">
                            Temporarily reveal on click
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Click a placeholder to temporarily show the hidden work</div>
                </div>
                </div>

                <div class="ao3h-setting-description">Right-click a username to block it. The full list is available on profile and preferences pages.</div>

                </div><!-- /.ao3h-config-section: User Blocker -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
