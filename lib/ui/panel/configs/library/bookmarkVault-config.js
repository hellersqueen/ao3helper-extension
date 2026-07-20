/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Bookmark Vault

   Configuration panel for the Bookmark Vault module.
   Previously: bookmarkManager
   Fusion: bookmarkNotes + bookmarkOrganization + bookmarkStatus

   Sections:
   - Status Indicators
   - Rich Text Notes
   - Organization Tools

   wireConfigArea() shows/hides the "Bookmark Status Filter" sub-options
   (default view, show counter) based on their "Enable" checkbox — the HTML
   alone always started that block display:none with nothing to un-hide it,
   so those two settings (read by statusIndicators.js) were unreachable from
   the panel even with the feature enabled.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'bookmarkVault';
export const config = `

                <!-- ─── STATUS INDICATORS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Status Indicators</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPublicPrivateBadge" checked>
                            Badge ⭐/🔒 on blurbs
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showNoteIcon" checked>
                            Note icon 📝 if bookmark has notes
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tooltip shows the first 50–100 characters of the note</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showLastReadDate">
                            Show last-read date
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"Last read: X days ago" on bookmarked works</div>
                </div>

                <!-- ─── STATUS FILTER ─── -->
                </div><!-- /.ao3h-config-section: Status Indicators -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Bookmark Status Filter</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="bookmarkStatusFilterEnabled" id="ao3h-bv-statusFilter">
                            Enable status filter on listings
                        </label>
                    </div>
                </div>

                <div id="ao3h-bv-statusFilter-opts" class="ao3h-indent" style="display: none;">
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Default view</label>
                        <div class="ao3h-setting-control ao3h-radio-group">
                            <label><input type="radio" name="statusFilterDefault" data-setting="bookmarkStatusFilterDefault" value="all" checked> All</label>
                            <label><input type="radio" name="statusFilterDefault" data-setting="bookmarkStatusFilterDefault" value="bookmarked"> Bookmarked only</label>
                            <label><input type="radio" name="statusFilterDefault" data-setting="bookmarkStatusFilterDefault" value="unbookmarked"> Not bookmarked</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label>
                                <input type="checkbox" data-setting="showStatusFilterCount">
                                Show counter
                            </label>
                        </div>
                    </div>
                </div>

                <!-- ─── NOTES ─── -->
                </div><!-- /.ao3h-config-section: Bookmark Status Filter -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Notes</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="inlineNoteEditing" checked>
                            Inline note editing
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Edit notes directly in listings and on work pages</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoFillBookmarkForm" checked>
                            Auto-fill bookmark form
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Pre-fills title, author, summary, work ID</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickNoteOnWorkPage" checked>
                            Quick note on work pages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">📝 button under the title of any work — the note stays local, never sent to AO3. Start a note with "!" to highlight it. The editor offers templates and previous versions.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPersonalRating" checked>
                            Personal ★ rating
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Five local stars next to each note, separate from tags and notes</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Remind about unopened bookmarks after</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="staleReminderMonths">
                            <option value="0" selected>Never</option>
                            <option value="3">3 months</option>
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Shows "🔔 X bookmarks not opened for N+ months" on your bookmarks page</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideBlockedUsersBookmarks" checked>
                            Hide bookmarks from blocked users
                        </label>
                    </div>
                    <div class="ao3h-setting-description">On public bookmark listings, hides bookmarks created by users on your User Relationships block list</div>
                </div>

                <!-- ─── ORGANISATION ─── -->
                </div><!-- /.ao3h-config-section: Notes -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Organisation</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="createCategories" checked>
                            Use bookmark categories/folders
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showCategoryLabels" checked>
                            Show category labels on bookmarks
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="filterByCategory" checked>
                            Filter bookmarks by category
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideDeletedWorks">
                            Hide deleted/restricted works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Default: ⚠️ badge visible on unavailable works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="pinBookmarks">
                            Pin bookmarks to top of list
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="bulkSelection" checked>
                            Bulk selection
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Select multiple → delete, change visibility, assign category</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="privateByDefault">
                            Private bookmarks by default
                        </label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Organisation -->

                <!-- ─── QUICK ACTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Actions</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showBackButton">
                            &ldquo;← Back to work&rdquo; button after bookmarking
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Returns you to the work page you bookmarked from</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showViewBookmarkLink" checked>
                            &ldquo;🔖 My Bookmark&rdquo; link on work pages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Direct link to your bookmark on already-bookmarked works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoTagFandom">
                            Auto-tag bookmarks with fandom
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoTagRating">
                            Auto-tag bookmarks with rating
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showCompletionBadge" checked>
                            Completion badge on bookmark blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Colour-coded export-status badge (green &lt;30 days, orange ≥30 days)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showProgressRing">
                            Progress ring on bookmarked works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visual ring showing read-progress percentage</div>
                </div>

                </div><!-- /.ao3h-config-section: Quick Actions -->

                <!-- ─── ANALYTICS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analytics</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showAnalyticsDashboard">
                            Show bookmark analytics dashboard
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Top fandoms, tags, authors in your bookmarks</div>
                </div>

                </div><!-- /.ao3h-config-section: Analytics -->

                <!-- ─── ADVANCED ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Advanced</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="assignToCategories" checked>
                            Auto-assign bookmarks to categories
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Automatically assign new bookmarks to categories based on fandom/tags</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default sort order</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="defaultSort">
                            <option value="date" selected>Date added</option>
                            <option value="title">Title</option>
                            <option value="fandom">Fandom</option>
                            <option value="rating">Rating</option>
                        </select>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Advanced -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     Note: sortBy is already covered by defaultSort in Advanced section above.
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

/* ═══════════════════════════════════════════════════════════════════════════
   WIRING
═══════════════════════════════════════════════════════════════════════════ */

function wireConfigArea(container) {
  const checkbox = container.querySelector('#ao3h-bv-statusFilter');
  const opts = container.querySelector('#ao3h-bv-statusFilter-opts');
  if (!checkbox || !opts || checkbox.dataset.wired) return;
  checkbox.dataset.wired = '1';
  opts.style.display = checkbox.checked ? '' : 'none';
  checkbox.addEventListener('change', () => {
    opts.style.display = checkbox.checked ? '' : 'none';
  });
}

export { wireConfigArea };
