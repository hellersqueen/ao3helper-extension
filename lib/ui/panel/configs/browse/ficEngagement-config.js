/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Engagement

   Configuration panel for the Fic Engagement module.
   Fusion: ficEngagement + hiddenGems

   3 engagement metrics (automatic) + Hidden Gems badge (automatic).
   Only one user-facing option: metric colour coding.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'ficEngagement';

export const config = `

                <!-- ─── METRICS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Engagement Metrics</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="colorCodeMetrics">
                            Colour-code metrics
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Green = high · Yellow = medium · Red = low engagement ratio. Hover the ⓘ badge on any work for the exact thresholds.</div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideLowEngagement">
                            Hide low-engagement works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides blurbs whose kudos ratio falls in the "low" tier (&lt;8%)</div>
                </div>
                </div><!-- /.ao3h-config-section: Engagement Metrics -->

                <!-- ─── HIDDEN GEMS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Hidden Gems Thresholds</div>
                <div class="ao3h-setting-description">A work is a Hidden Gem when its kudos/hits ratio clears the minimum below AND it's still low-popularity (kudos or bookmarks under the caps).</div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Minimum ratio (%)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-field--sm" data-setting="gemMinRatio" value="5" min="1" max="50">
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Max kudos (low-popularity cap)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-field--sm" data-setting="gemMaxKudos" value="100" min="1">
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Max bookmarks (low-popularity cap)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-field--sm" data-setting="gemMaxBookmarks" value="10" min="1">
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Minimum hits (enough data)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-field--sm" data-setting="gemMinHits" value="50" min="1">
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="gemCompareToPageAverage">
                            Also flag gems relative to this page's average
                        </label>
                    </div>
                    <div class="ao3h-setting-description">In addition to the fixed thresholds above, also flags works well above the average ratio of the works currently shown on the page — an approximation of "compare to the fandom", since only the current page's works are visible to the extension (not a fandom's full catalogue).</div>
                </div>
                </div><!-- /.ao3h-config-section: Hidden Gems Thresholds -->

                <!-- ─── INFO ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>
                <div class="ao3h-setting-description">
                    The following are always active:
                    <ul class="ao3h-config-list">
                        <li>Kudos ratio · Kudos density · Save rate · Comment rate on all blurbs</li>
                        <li>Tooltip on hover → raw numbers; ⓘ badge → how to read each ratio</li>
                        <li>💎🥇🥈 Hidden Gem badge (medal tier) on underexposed works</li>
                        <li>Sorting by engagement via Search Enhancer</li>
                        <li>Personal fic ratings → Fic Appreciation's star ratings</li>
                    </ul>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
