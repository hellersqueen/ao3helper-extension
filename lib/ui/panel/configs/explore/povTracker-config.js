/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - POV Tracker

   Configuration panel for the POV Tracker module.
   Detects narrative point of view (1st/2nd/3rd/mixed/multi) via pronoun
   heuristics, shows badges on blurbs, and filters listings by POV.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'povTracker';
export const config = `

                <!-- ─── BADGES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Badges</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showBadgesOnBlurbs" checked>
                            Show POV badges on work blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Only shown for works that have already been analyzed</div>
                </div>
                <div class="ao3h-setting-item ao3h-indent">
                    <label class="ao3h-setting-label">Badge types to display</label>
                    <div class="ao3h-setting-control">
                        <label><input type="checkbox" data-setting="badgeFirst" checked> 1st person</label>
                        <label><input type="checkbox" data-setting="badgeSecond"> 2nd person</label>
                        <label><input type="checkbox" data-setting="badgeThird" checked> 3rd person</label>
                        <label><input type="checkbox" data-setting="badgeMixed"> Mixed</label>
                        <label><input type="checkbox" data-setting="badgeMulti"> Multi</label>
                        <label><input type="checkbox" data-setting="badgeUnknown"> Unknown</label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Badges -->

                <!-- ─── FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enablePovFilters" checked>
                            Enable POV filters in listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds POV checkboxes to filter listings by narrative perspective</div>
                </div>
                </div><!-- /.ao3h-config-section: Filters -->

                <!-- ─── ANALYSIS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analysis</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoAnalyze" checked>
                            Auto-analyze on work page load
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showStats">
                            Show personal POV statistics
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Summary of POV distribution across your reading history</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="analyzeFullText" checked>
                            Analyze full chapter text
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Reads the actual chapter text (pronoun frequency) on work pages, more accurate than tags/summary alone. Only analyzes chapters you actually open.</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showDetailPanel" checked>
                            Show detail panel on work pages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows the combined POV verdict and a per-chapter breakdown (as you read chapters), including a warning if the POV changes partway through</div>
                </div>
                </div><!-- /.ao3h-config-section: Analysis -->

                <!-- ─── PREFERENCES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Preferences</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoApplyPreferredFilter">
                            Automatically filter to my preferred POVs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Auto-hides works whose detected POV isn't in your preferred list below, without needing to click the filter buttons each time</div>
                </div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Preferred POVs</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input ao3h-field--lg" data-setting="preferredPovs" placeholder="first,third">
                    </div>
                    <div class="ao3h-setting-description">Comma-separated: first, second, third, mixed, multi, unknown</div>
                </div>
                </div><!-- /.ao3h-config-section: Preferences -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
