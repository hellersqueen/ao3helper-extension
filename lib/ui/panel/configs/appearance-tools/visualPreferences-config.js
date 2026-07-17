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

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="dateAgeColoring">
                            Color dates by age
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tints dates on listings and work pages: today, this week, this month, or older</div>
                </div>

                </div><!-- /.ao3h-config-section: Stats Display -->

                <!-- ─── LISTING LAYOUT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Listing Layout</div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Spacing density</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="layoutDensity" data-setting="layoutDensity" value="compact"> Compact</label>
                        <label><input type="radio" name="layoutDensity" data-setting="layoutDensity" value="comfortable" checked> Comfortable</label>
                        <label><input type="radio" name="layoutDensity" data-setting="layoutDensity" value="spacious"> Spacious</label>
                    </div>
                    <div class="ao3h-setting-description">Applies across work listings (favorites, history, later shelf, search results…)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="gridView">
                            Grid / card view for listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows works as a wrapping grid of cards instead of a single-column list</div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Blurb section order</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="blurbSectionOrder" value="header,tags,summary,stats" style="width:100%;">
                    </div>
                    <div class="ao3h-setting-description">Comma-separated, from this list: header, tags, summary, stats. Default order matches AO3's own layout.</div>
                </div>

                </div><!-- /.ao3h-config-section: Listing Layout -->

                <!-- ─── TEXT ANALYSIS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Text Analysis</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="wordOccurrenceCounter">
                            Word/name occurrence counter
                        </label>
                    </div>
                    <div class="ao3h-setting-description">On a work page, adds a field to count how many times a character name (or any word) appears in the loaded chapters' text</div>
                </div>

                </div><!-- /.ao3h-config-section: Text Analysis -->

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
