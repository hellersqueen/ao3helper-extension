/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Comment Kit
   
   Configuration panel for the Comment Kit module.
   Previously: commentEnhancer
   Fusion: commentThreadManager + commentHighlighter + commentNavigator + commentSettings
   
   Sections:
   - Draft Management
   - Composing Tools
   - Thread Navigation
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
                    <div class="ao3h-setting-description">Save reusable templates, insert from a "Manage templates" button</div>
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

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="jumpToCommentsButton">
                            💬 "Jump to Comments" button
                        </label>
                    </div>
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

                </div><!-- /.ao3h-config-section: Comment Configuration -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
