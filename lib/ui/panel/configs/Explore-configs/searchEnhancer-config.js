/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Search Enhancer
   
   Configuration panel for the Search Enhancer module.
   Tag autocomplete, search history, custom result sorting.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'searchEnhancer';
export const config = `

                <!-- ─── TAG SUGGESTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Suggestions</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagSuggestions" checked>
                            Show related tag suggestions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tags co-used with your current search tags</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="historyBasedSuggestions" checked>
                            Include suggestions from reading history
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="suggestionWorkCount" checked>
                            Show work count per suggestion
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"Slow Burn — 45K"</div>
                </div>
                </div><!-- /.ao3h-config-section: Tag Suggestions -->

                <!-- ─── AUTOCOMPLETE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Autocomplete & History</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchHistory" checked>
                            Search history (25 searches max)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagAutocomplete" checked>
                            Tag autocomplete (canonical AO3 tags)
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Autocomplete & History -->

                <!-- ─── SORTING ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Result Sorting</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortByKudosRatio" checked>
                            Sort by kudos ratio
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortBySaveRate" checked>
                            Sort by save rate
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRatioInline" checked>
                            Show ratio next to stats
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Format: "12% eng." inline</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="groupSeriesInResults">
                            Group series in search results
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Default fandom sort</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="alpha" checked> Alphabetical</label>
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="popularity"> By size (most works first)</label>
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="history"> By reading history</label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Result Sorting -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
