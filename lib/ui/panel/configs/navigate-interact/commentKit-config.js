/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Comment Kit
   
   Configuration panel for the Comment Kit module.
   Previously: commentEnhancer
   Fusion: commentThreadManager + commentHighlighter + commentNavigator + commentSettings
   
   Sections:
   - Draft Management
   - Composing Tools
   - Thread Navigation
   - Comment Configuration
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'commentKit';
export const config = `

                <!-- ─── DRAFT MANAGEMENT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Draft Management</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="realtimeCounter" checked>
                            Live character / word counter
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showFloatingBox">
                            Floating comment box (stays visible while reading)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableAutoSave" checked>
                            Auto-save drafts (restored on reload)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enablePreview" checked>
                            Preview mode before posting
                        </label>
                    </div>
                </div>

                <!-- ─── COMPOSING ─── -->
                </div><!-- /.ao3h-config-section: Draft Management -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Composing</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showFormattingToolbar" checked>
                            Formatting toolbar (Bold / Italic / Link / Quote)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickTemplates">
                            Quick templates panel
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show customizable quick-comment template buttons</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="commentTemplates">
                            Comment templates
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Save reusable templates, insert from a "Manage templates" button. Use {title}/{author} — filled in automatically when inserted</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quoteFicSelection" checked>
                            Quote selected fic text
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Select text while reading to get a "❝ Quote in comment" button</div>
                </div>

                <!-- ─── THREAD NAVIGATION ─── -->
                </div><!-- /.ao3h-config-section: Composing -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Thread Navigation</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="collapseExpandButtons" checked>
                            Collapse / expand buttons on each comment
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Auto-collapse threads with many replies</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="autoCollapseThreshold" data-setting="autoCollapseThreshold" value="0" checked> Off</label>
                        <label><input type="radio" name="autoCollapseThreshold" data-setting="autoCollapseThreshold" value="5"> 5+ replies</label>
                        <label><input type="radio" name="autoCollapseThreshold" data-setting="autoCollapseThreshold" value="10"> 10+ replies</label>
                        <label><input type="radio" name="autoCollapseThreshold" data-setting="autoCollapseThreshold" value="20"> 20+ replies</label>
                    </div>
                    <div class="ao3h-setting-description">Manually expanding a specific thread always overrides this</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuoteReplyButton" checked>
                            "❝ Reply" button (quote a comment in your reply)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="unreadTracking">
                            Read / unread tracking ("NEW" badge)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightAuthorReplies">
                            Highlight author replies
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visually reinforces the author vs. reader distinction</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightRepliesToMe" checked>
                            Highlight replies to my comments
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Author comments filter</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="authorFilterMode" data-setting="authorFilterMode" value="off" checked> Off</label>
                        <label><input type="radio" name="authorFilterMode" data-setting="authorFilterMode" value="hide"> Hide author's comments</label>
                        <label><input type="radio" name="authorFilterMode" data-setting="authorFilterMode" value="only"> Only show author's comments</label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Highlight specific usernames or keywords</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="customHighlights" placeholder="e.g. friendname, spoiler">
                    </div>
                    <div class="ao3h-setting-description">Comma-separated. Matches the commenter's username or a word anywhere in their comment</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="jumpToCommentsButton">
                            💬 "Jump to Comments" button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="commentSearchBox" checked>
                            Search box above comments
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Highlights matches and lets you step through them</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="floatingNavPanel">
                            Floating thread navigator
                        </label>
                    </div>
                    <div class="ao3h-setting-description">First/previous/next/last thread buttons, a comment-page jump field, and Alt+↑/↓ shortcuts</div>
                </div>

                </div><!-- /.ao3h-config-section: Thread Navigation -->

                <!-- ─── COMMENT CONFIGURATION ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Comment Configuration</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterIndicator" checked>
                            Chapter badge on inbox comments
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows "Ch N" next to comments in your inbox so you know which chapter they're from</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="guestCommentsDefault">
                            Default "Allow guest comments" on new works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Auto-ticks the guest comment option when posting a new work</div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Comment display density</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="commentDensity" data-setting="commentDensity" value="compact"> Compact</label>
                        <label><input type="radio" name="commentDensity" data-setting="commentDensity" value="normal" checked> Normal</label>
                        <label><input type="radio" name="commentDensity" data-setting="commentDensity" value="spacious"> Spacious</label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Comment Configuration -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
