/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fanfic Binge Mode

   Configuration panel for the Fanfic Binge Mode module.
   Library tab module.

   Sections:
   - Binge Session
   - Discovery
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'fanficBingeMode';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Binge Session</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="continueReadingModal" checked>
                            &ldquo;Continue Reading?&rdquo; modal
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown at 95% scroll on the last chapter — suggests next fic, mark as read, bookmark</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Auto-advance delay (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="autoAdvanceDelay" value="0" min="0" max="60" style="width: 70px;">
                    </div>
                    <div class="ao3h-setting-description">Countdown before auto-advancing to the next work (0 = off). Automatically navigates to /works when it hits zero.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showHomepagePanel" checked>
                            &ldquo;Continue Reading&rdquo; panel on homepage
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Quick access to your most recently read works</div>
                </div>

                </div><!-- /.ao3h-config-section: Binge Session -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Discovery</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPostReadingSuggestions" checked>
                            Post-reading suggestions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Next in series · More by this author · More like this</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="queueEnabled">
                            Reading queue
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Build and manage a personal reading queue — add, reorder, remove works</div>
                </div>

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
