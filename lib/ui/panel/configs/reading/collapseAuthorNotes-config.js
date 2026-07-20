/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Collapse Author Notes
   
   Configuration panel for the Collapse Author Notes module.
   Standalone — no dependencies.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'collapseAuthorNotes';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Author Notes</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCollapseBeginning">
                            Auto-collapse beginning notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCollapseEnd">
                            Auto-collapse end notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoExpandWarnings" checked>
                            Always expand notes containing TW / CW / trigger warning / content warning
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Prevents safety information from being accidentally hidden</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideCollectionBanners">
                            Hide collection banners
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides collection / gift / challenge banners</div>
                </div>
                </div><!-- /.ao3h-config-section -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Fine-tuning</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Only auto-collapse notes longer than</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="autoCollapseMinChars" value="0" min="0" max="20000" style="width:90px;"> characters
                    </div>
                    <div class="ao3h-setting-description">0 = auto-collapse regardless of length. Short notes stay visible when a threshold is set.</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Always expand notes containing these words</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="autoExpandKeywords" placeholder="e.g. sequel, playlist, schedule" style="width:100%;">
                    </div>
                    <div class="ao3h-setting-description">Comma-separated, case-insensitive — on top of the TW/CW detection above</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="clearStatesOnDisable">
                            Forget saved open/closed choices when the module is disabled
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Fine-tuning -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
