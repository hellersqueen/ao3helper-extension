/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Page Controls
   
   Configuration panel for the Page Controls module.
   Previously: paginationManager
   Fusion: jumpToPage + worksPerPage
   
   Sections:
   - Jump To Page
   - Works Per Page
   - Infinite Scroll
   - Back to Top
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'pageControls';

export const config = `

                <!-- ─── JUMP TO PAGE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Jump To Page</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPlusMinus10Buttons" checked>
                            Show quick page-jump buttons
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Add &ldquo;&minus;N&rdquo; and &ldquo;+N&rdquo; page jump buttons next to pagination</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Quick jump step</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="quickJumpStep" value="10" min="1" max="10000" style="width: 80px;">
                    </div>
                    <div class="ao3h-setting-description">How many pages the quick buttons jump (default: 10)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showBigJumpButtons">
                            Also show big-jump buttons
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Big jump step</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="bigJumpStep" value="50" min="1" max="10000" style="width: 80px;">
                    </div>
                    <div class="ao3h-setting-description">How many pages the big buttons jump (default: 50)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRandomPageButton" checked>
                            Show the 🎲 random page button
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPercentJumpButtons" checked>
                            Show ¼ / ½ / ¾ percent jumps
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Jump straight to a fraction of the listing</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="rememberRecentPages" checked>
                            Remember recently visited pages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows "Resume"/"Recent" links back to the pages you visited in this listing</div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Page input position</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="pageInputPosition" data-setting="pageInputPosition" value="below" checked> Below pagination</label>
                        <label><input type="radio" name="pageInputPosition" data-setting="pageInputPosition" value="above"> Above pagination</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPaginationProgressBar" checked>
                            Show a pagination progress bar
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Thin bar under the navigation row showing where you are in the listing</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="stickyEnhancedNav">
                            Keep the top navigation row sticky while scrolling
                        </label>
                    </div>
                </div>

                <!-- ─── WORKS PER PAGE ─── -->
                </div><!-- /.ao3h-config-section: Jump To Page -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Works Per Page</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="worksPerPageEnabled" checked>
                            Enable works-per-page selector
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show a 20 / 50 / 100 density switcher above work listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default count</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="20"> 20 (AO3 default)</label>
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="50" checked> 50</label>
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="100"> 100</label>
                        <label><input type="radio" name="worksPerPage" data-setting="worksPerPage" value="200"> 200</label>
                    </div>
                </div>

                <!-- ─── INFINITE SCROLL ─── -->
                </div><!-- /.ao3h-config-section: Works Per Page -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Infinite Scroll</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="infiniteScrollEnabled">
                            Enable infinite scroll
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Loads the next page automatically as you approach the bottom of the list. Jump-to-page controls are disabled while active.</div>
                </div>

                </div><!-- /.ao3h-config-section: Infinite Scroll -->

                <!-- ─── BACK TO TOP ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Back to Top</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showBackToTopButton" checked>
                            Show a "back to top" button
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Floating button appears after scrolling down a listing page</div>
                </div>

                </div><!-- /.ao3h-config-section: Back to Top -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
