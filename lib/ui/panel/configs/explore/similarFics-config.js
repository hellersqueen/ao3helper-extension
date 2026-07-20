/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Similar Fics
   
   Configuration panel for the Similar Fics module.
   Suggests similar works on work pages based on tags, fandom, and length.

   Sections: Results, Display, Filters, Matching (length/style/series/cache).
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
                    <div class="ao3h-setting-description">Off by default: only complete works are suggested</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="matchRating" checked>
                            Match the current work's rating
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Uncheck to see suggestions across all ratings</div>
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

                <!-- ─── MATCHING ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Matching</div>
                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Length preference</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="lengthMode" data-setting="lengthMode" value="similar" checked> Similar length</label>
                        <label><input type="radio" name="lengthMode" data-setting="lengthMode" value="shorter"> Shorter</label>
                        <label><input type="radio" name="lengthMode" data-setting="lengthMode" value="longer"> Longer</label>
                        <label><input type="radio" name="lengthMode" data-setting="lengthMode" value="quick"> Quick reads (&lt; 10K words)</label>
                        <label><input type="radio" name="lengthMode" data-setting="lengthMode" value="epic"> Epics (100K+ words)</label>
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Match style</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="matchStyle" data-setting="matchStyle" value="close"> Close matches only</label>
                        <label><input type="radio" name="matchStyle" data-setting="matchStyle" value="balanced" checked> Balanced</label>
                        <label><input type="radio" name="matchStyle" data-setting="matchStyle" value="variety"> More variety</label>
                    </div>
                    <div class="ao3h-setting-description">Controls the minimum match score required to show a suggestion</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showSeriesSection" checked>
                            Prioritize sequels/prequels from the same series
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="cacheResults" checked>
                            Cache recommendations for an hour
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Reopening the panel won't re-fetch results until they expire</div>
                </div>
                </div><!-- /.ao3h-config-section: Matching -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
