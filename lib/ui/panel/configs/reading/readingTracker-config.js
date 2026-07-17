/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Reading Tracker

   Unified reading lifecycle: seen, progress, completion.
   Fusion: seenWorksMarker + readingProgress

   Sections:
   - Seen Works Marker
   - Exceptions
   - History
   - Reading Progress
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'readingTracker';
export const config = `

                <!-- ─── SEEN WORKS MARKER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Seen Works Marker</div>

                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Display mode for seen works</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="mark" checked> Mark as seen (60% fade)</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="seenMode" data-setting="seenMode" value="hide"> Hide from listings</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Display mode for seen works -->

                <!-- ─── EXCEPTIONS ─── -->
                </div><!-- /.ao3h-config-section: Seen Works Marker -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Exceptions — never mark as seen</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptBookmarks" checked>
                            Works in my bookmarks
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptSubscribed" checked>
                            Works I'm subscribed to
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exceptMFL" checked>
                            Works in my Later Shelf
                        </label>
                    </div>
                </div>

                <!-- ─── HISTORY ─── -->
                </div><!-- /.ao3h-config-section: Exceptions — never mark as seen -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">History</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchHistory" checked>
                            Search in history
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="deleteEntry" checked>
                            Delete individual entries
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="exportHistory" checked>
                            Export history (JSON)
                        </label>
                    </div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-ao3-history">⬇️ Import from AO3 History</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-history">🗑️ Clear History</button>
                </div>

                <!-- ─── READING PROGRESS ─── -->
                </div><!-- /.ao3h-config-section: History -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Reading Progress</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeToast" checked>
                            Resume toast on re-open
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterBadge" checked>
                            Clickable "Ch X/Y" badge on in-progress works
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeBanner" checked>
                            "📍 Resume at chapter X" banner on re-open
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="lastReadTime" checked>
                            Show last-read time in banner ("X days ago")
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="positionMarker" checked>
                            Last-read position marker line
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="floatingBadge" checked>
                            Floating progress badge while reading ("34%")
                        </label>
                    </div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-progress">✕ Clear reading progress for this work</button>
                </div>

                </div><!-- /.ao3h-config-section: Reading Progress -->

                <!-- ─── ADVANCED ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Advanced</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Seen works opacity</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="seenWorksOpacity"
                               min="0.2" max="1" step="0.1" value="0.6">
                        <span class="ao3h-range-value" data-for="seenWorksOpacity">60%</span>
                    </div>
                    <div class="ao3h-setting-description">Opacity when a work is marked as seen (lower = more faded)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="historyClearAll" checked>
                            Show "Clear all history" button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showClearProgressButton" checked>
                            Show "Clear progress" button per work
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Advanced -->

                <!-- ─── UPDATES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Updates</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="updatedBadge" checked>
                            &ldquo;Updated&rdquo; badge on recently-updated works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Highlights works with new chapters since your last visit</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="updatedOnlyMode">
                            Show only updated works in subscriptions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Filters your subscription inbox to show only works with new chapters</div>
                </div>

                </div><!-- /.ao3h-config-section: Updates -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-apply filters</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoApply" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-save progress</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoSave" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Update interval (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="interval" value="30" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
