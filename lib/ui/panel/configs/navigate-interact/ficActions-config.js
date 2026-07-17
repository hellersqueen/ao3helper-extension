/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Actions
   
   Configuration panel for the Fic Actions module.
   Previously: ficButtonsManager
   
   Sections:
   - Subscribe options
   - Button order (managed via drag & drop in the panel UI)
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'ficActions';
export const config = `

                <!-- ─── SUBSCRIBE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Subscribe</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="subscribeButtonBottom">
                            Subscribe button at bottom of page
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Duplicates the Subscribe button at the bottom of the page for easy access after reading</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="subscribeFromListings">
                            Quick subscribe from listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Add a 🔕 subscribe button to work blurbs in search results and listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showSubscriptionStatus">
                            Show subscription status indicator
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show a 🔔 badge on blurbs for works you have subscribed to</div>
                </div>

                <!-- ─── HIDE BUTTONS ─── -->
                </div><!-- /.ao3h-config-section: Subscribe -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Hide Buttons</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideShare">
                            Hide &ldquo;Share&rdquo; button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideBookmark">
                            Hide &ldquo;Bookmark&rdquo; button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideSubscribe">
                            Hide &ldquo;Subscribe&rdquo; button
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Hide Buttons -->

                <!-- ─── BUTTON ORDER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Button Order</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="buttonReordering" checked>
                            Enable button drag-and-drop reordering
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Drag buttons in the fic action bar to reorder them. Order is saved automatically.</div>
                </div>

                </div><!-- /.ao3h-config-section: Button Order -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
