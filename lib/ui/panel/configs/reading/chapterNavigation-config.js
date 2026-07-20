/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Chapter Navigation
   
   Configuration panel for the Chapter Navigation module.

   Sections:
   - Navigation options (sticky nav, breadcrumb, tab title, emphasis, prefetch)
   - Quick navigation (resume button)
   - Word count
   - Chapters panel (floating search/mini-map/marks button)
   - Auto scroll
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'chapterNavigation';
export const config = `

                <!-- ─── NAVIGATION ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Navigation</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="stickyNav">
                            Sticky navigation bar
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Previous/Next buttons always visible while reading</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showBreadcrumb" checked>
                            Breadcrumb
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"Work Title &gt; Chapter 5 &gt; Chapter Title" above the chapter text</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tabTitleChapter">
                            Chapter position in browser tab title
                        </label>
                    </div>
                    <div class="ao3h-setting-description">e.g. "Ch. 5/12 · My Fic" — off by default since it replaces the page title</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="emphasizeChapterTitle">
                            Larger chapter title
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Makes the current chapter's title bigger and bolder</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="prefetchNextChapter" checked>
                            Prefetch next chapter
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hints the browser to preload the next chapter's page so it opens faster</div>
                </div>
                </div><!-- /.ao3h-config-section: Navigation -->

                <!-- ─── QUICK NAVIGATION ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Navigation</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="resumeButton" checked>
                            Resume button on blurbs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adaptive label: "Start" / "Continue (Ch 5)" / "Continue (Ch 5) · 2 new"</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="lastChapterBtn" checked>
                            "Last chapter" button
                        </label>
                    </div>
                    <div class="ao3h-setting-description">e.g. "Last (Ch 47)"</div>
                </div>
                </div><!-- /.ao3h-config-section: Quick Navigation -->

                <!-- ─── WORD COUNT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Chapter Word Count</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterWordCount" checked>
                            Show current chapter word count
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Format: "X.XK words"</div>
                </div>
                </div><!-- /.ao3h-config-section: Chapter Word Count -->

                <!-- ─── CHAPTERS PANEL ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Chapters Panel</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="chapterPanel" checked>
                            Floating "📑 Chapters" button
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Search chapters by number/title, jump to the first unread or last chapter, mark favorites, add notes, and see recently visited chapters</div>
                </div>
                </div><!-- /.ao3h-config-section: Chapters Panel -->

                <!-- ─── AUTO SCROLL ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Auto Scroll</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoScrollShowControls" checked>
                            Show auto-scroll controls
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Display speed and play/pause controls while auto-scrolling</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default speed (px/s)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="autoScrollSpeed" value="50" min="5" max="500">
                    </div>
                    <div class="ao3h-setting-description">Pixels per second. Default: 50</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoScrollAutoAdvance">
                            Auto-advance to next chapter
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Automatically load the next chapter when scrolling reaches the end</div>
                </div>
                </div><!-- /.ao3h-config-section: Auto Scroll -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
