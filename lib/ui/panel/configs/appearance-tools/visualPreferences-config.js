/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Visual Preferences
   
   Configuration panel for the Visual Preferences module.
   Previously: visualPreferencesManager
   
   Sections:
   - Engagement Stats
   - Dates
   - Layout
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'visualPreferences';
export const config = `

                <!-- ─── ENGAGEMENT STATS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Engagement Stats</div>
                <div class="ao3h-setting-description">Hidden stats are revealed on hover.</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideWordCount">
                            Hide word count
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideKudosCount">
                            Hide kudos
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideCommentsCount">
                            Hide comments
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideBookmarksCount">
                            Hide bookmarks
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideHits">
                            Hide hits
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Engagement Stats -->

                <!-- ─── DATES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Dates</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hidePublishedDate">
                            Hide published date
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideUpdatedDate">
                            Hide updated date
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideCompletedDate">
                            Hide completed date
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideChapterDates">
                            Hide chapter dates
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Dates -->

                <!-- ─── LAYOUT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Layout</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="minimalHeader">
                            Minimal header
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides the AO3 banner, reduces header height</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideStatsOnChaptersList">
                            Hide stats on chapters list
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Word counts, comment counts, dates on the chapter list view</div>
                </div>

                </div><!-- /.ao3h-config-section: Layout -->

                <!-- ─── STATS DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Stats Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="statsAsIcons">
                            Show stats as icons
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Replace stat labels with emoji icons (📝 📖 💬 ❤️ 🔖 👁)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-label">Icons mode</div>
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="statsIconsMode" data-setting="statsIconsMode" value="icons"> Icons only</label>
                        <label><input type="radio" name="statsIconsMode" data-setting="statsIconsMode" value="icons-text"> Icons + text</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="relativeDates">
                            Show relative dates
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Display "4 years ago" instead of absolute dates (hover to see original)</div>
                </div>

                </div><!-- /.ao3h-config-section: Stats Display -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Styling</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable custom styles</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="customStyles" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Styling -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
