/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Appreciation
   
   Configuration panel for the Fic Appreciation module.
   Fusion: completionTracker + kudosManager + starRatings
   
   Sections:
   - Completion Tracker
   - Kudos Manager
   - Star Ratings
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'ficAppreciation';
export const config = `

                <!-- ─── STATUS TRACKING ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Status Tracking</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showManualCheckButton">
                            Manual &ldquo;Mark as read&rdquo; button on work pages
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="statusNotes">
                            Notes for reading status
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Attach a personal note to each status (Finished, Dropped, etc.)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideStatusFilter">
                            Hide status filter button on listings
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Status Tracking -->

                <!-- ─── COMPLETION TRACKER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Completion Tracker</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="completionNotes">
                            Completion notes
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Optional personal note when marking a work as finished</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="filterCompletedWorks" checked>
                            Filter finished works in listings
                        </label>
                    </div>
                </div>

                <!-- ─── KUDOS MANAGER ─── -->
                </div><!-- /.ao3h-config-section: Completion Tracker -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Kudos Manager</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickKudosButton">
                            Quick kudos button on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Kudos a work without opening it</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="commentAssistOnRevisit">
                            Suggest a comment on re-visit
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Prompt only — never automatic</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideKudosedFilter">
                            Filter: hide already-kudosed works
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="kudosReminder">
                            Reminder banner for finished-but-not-kudosed works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown when you revisit a work you marked finished but never kudosed, with a one-click kudos button</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="confirmBeforeKudos">
                            Confirm before giving kudos from a listing
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Requires a second click on the quick-kudos button — avoids accidental taps</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="kudosBookmarkFinder" checked>
                            "Find kudosed works not bookmarked" button
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown on your own Bookmarks page — scans your recent bookmarks and lists kudosed works missing from them</div>
                </div>

                <!-- ─── STAR RATINGS ─── -->
                </div><!-- /.ao3h-config-section: Kudos Manager -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Star Ratings</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRatingOnBlurbs">
                            Show my rating on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Star badge visible in search results and listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="ratingNotes">
                            Allow notes with ratings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Personal comment attached to each star rating</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Kudos icon</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="kudosIcon" value="♥" maxlength="4" style="width: 60px;">
                    </div>
                    <div class="ao3h-setting-description">Icon shown on the quick kudos button and blurb badge</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Tooltip date format</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="tooltipDateFormat">
                            <option value="relative" selected>Relative (e.g. &ldquo;3 days ago&rdquo;)</option>
                            <option value="short">Short (e.g. &ldquo;Jan 15&rdquo;)</option>
                            <option value="iso">ISO (YYYY-MM-DD)</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="halfStars">
                            Allow half-star ratings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Click the left half of a star on the work page for a .5 rating</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="ratingCategories">
                            Category ratings (Plot / Characters / Writing)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds mini rating rows on the work page and a combined-score badge on listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="moodTags">
                            Mood tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Free-form tags (funny, comforting, angsty…) attached to your rating, on the work page</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showCommunityStats">
                            Show community kudos/hits next to your rating
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="promptRatingOnFinish">
                            Prompt to rate when marking a work finished
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Scrolls to and highlights the star widget — never rates automatically</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="completionMilestones" checked>
                            Celebrate completion milestones
                        </label>
                    </div>
                    <div class="ao3h-setting-description">A small toast at 10, 25, 50, 100… finished works</div>
                </div>

                </div><!-- /.ao3h-config-section: Star Ratings -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Sync & Refresh</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable sync</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableSync">
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Sort by</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="sortBy">
                            <option value="date-added">Date Added</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-refresh data</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoRefresh">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Sync & Refresh -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
