/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Page Controls
   
   Configuration panel for the Page Controls module.
   Previously: paginationManager
   Fusion: jumpToPage + worksPerPage
   
   Sections:
   - Jump To Page
   - Works Per Page
   - Infinite Scroll
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
                            Show &plusmn;10 page buttons
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Add &ldquo;&minus;10&rdquo; and &ldquo;+10&rdquo; page jump buttons next to pagination</div>
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
                    <div class="ao3h-setting-description">Jump-to-page controls are hidden when infinite scroll is active</div>
                </div>

                </div><!-- /.ao3h-config-section: Infinite Scroll -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
