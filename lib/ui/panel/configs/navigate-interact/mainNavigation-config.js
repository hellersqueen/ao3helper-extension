/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Main Navigation
   
   Configuration panel for the Main Navigation module.
   Previously: mainNavEnhancer
   
   Sections:
   - Navbar Links
   - Quick Links
   - Menu Activation
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'mainNavigation';
export const config = `

                <!-- ─── NAVBAR LINKS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Navbar Links</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="addNavLinks" checked>
                            Add Bookmarks / MFL / History to navbar
                        </label>
                    </div>
                    <div class="ao3h-setting-description">“History” opens AO3’s reading history at /users/[username]/readings.</div>
                </div>

                <!-- ─── QUICK LINKS ─── -->
                </div><!-- /.ao3h-config-section: Navbar Links -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Custom Quick Links</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickLinksEnabled">
                            Enable custom quick links
                        </label>
                    </div>
                    <div class="ao3h-setting-description">URL + label — up to 5 links. Free URL or fandom/pairing via autocomplete.</div>
                </div>

                ${[1, 2, 3, 4, 5].map(index => `
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Link ${index}</label>
                    <div class="ao3h-setting-control" style="display:flex;gap:6px;flex-wrap:wrap;">
                        <input type="text" class="ao3h-config-input" data-setting="quickLink${index}Label" placeholder="Label" style="width:110px;">
                        <input type="url" class="ao3h-config-input" data-setting="quickLink${index}Url" placeholder="https://archiveofourown.org/..." style="min-width:230px;flex:1;">
                    </div>
                </div>`).join('')}

                <!-- ─── MENU ACTIVATION ─── -->
                </div><!-- /.ao3h-config-section: Custom Quick Links -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Menu Activation</div>

                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Open menu</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="menuActivation" data-setting="menuActivation" value="hover" checked> On hover</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="menuActivation" data-setting="menuActivation" value="click"> On click only</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Open menu -->

                </div><!-- /.ao3h-config-section: Menu Activation -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
