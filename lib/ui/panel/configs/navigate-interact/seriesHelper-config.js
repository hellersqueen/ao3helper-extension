/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Series Helper
   
   Configuration panel for the Series Helper module.
   Shows extra series information: progress, type detection, navigation banner.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'seriesHelper';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Series Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="epicSeriesWarning">
                            "Epic Series" warning badge
                        </label>
                    </div>
                    <div class="ao3h-setting-description">“Epic Series” shown on series with 20+ works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="groupSeriesInSearch">
                            Group series works in search results
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Collapses works belonging to the same series</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Auto-collapse groups from</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="autoCollapseThreshold">
                            <option value="0" selected>Never</option>
                            <option value="3">3+ works</option>
                            <option value="5">5+ works</option>
                            <option value="10">10+ works</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Groups this large start collapsed — expanding one is remembered</div>
                </div>

                </div><!-- /.ao3h-config-section -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Series Pages</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="seriesSummary" checked>
                            Summary on series pages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Total words, estimated reading time, “Next unread” button, and a notice when some parts are deleted or restricted</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideEmptySeries">
                            Hide empty series in series listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Series with 0 visible works are hidden on series list pages</div>
                </div>
                </div><!-- /.ao3h-config-section: Series Pages -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
