/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Similar Fics
   
   Configuration panel for the Similar Fics module.
   Suggests similar works on work pages based on tags, fandom, and length.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'similarFics';
export const config = `

                <!-- ─── RESULTS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Results</div>
                <div class="ao3h-setting-item ao3h-col1">
                    <label class="ao3h-setting-label">Number of results</label>
                    <div class="ao3h-setting-control ao3h-setting-control--radios">
                        <label><input type="radio" name="numResults" data-setting="numResults" value="5"> 5</label>
                        <label><input type="radio" name="numResults" data-setting="numResults" value="10" checked> 10</label>
                        <label><input type="radio" name="numResults" data-setting="numResults" value="15"> 15</label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Results -->

                <!-- ─── DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Display</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showSimilarityScore" checked>
                            Show similarity score
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Displays a percentage match for each recommendation</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightCommonTags" checked>
                            Highlight common tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tags shared with the current work are highlighted</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showSummary" checked>
                            Show summary in panel
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Displays the work summary directly in the recommendations panel</div>
                </div>
                </div><!-- /.ao3h-config-section: Display -->

                <!-- ─── FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="includeWIP">
                            Include works in progress
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="openInNewTab">
                            Open recommendations in a new tab
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Filters -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
