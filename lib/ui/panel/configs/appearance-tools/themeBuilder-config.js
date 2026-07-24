/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Theme Builder
   
   Configuration panel for the Theme Builder module.
   Creates and applies custom visual themes to AO3.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'themeBuilder';
export const config = `

                <!-- ─── VISUAL THEME ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Visual Theme</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Accent colour</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="accentColor" value="#990000">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Background</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="bgColor" value="#ffffff">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Text colour</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="textColor" value="#333333">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Link colour</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="linkColor" value="#2a5298">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Header background</label>
                    <div class="ao3h-setting-control">
                        <input type="color" class="ao3h-config-input" data-setting="headerBg" value="#333333">
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Visual Theme -->

                <!-- ─── TYPOGRAPHY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Typography</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Base font size</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="fontSize" min="0.8" max="2.0" step="0.1" value="1.0">
                        <span class="ao3h-range-value" data-for="fontSize">1.0em</span>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Line height</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="lineHeight" min="1.2" max="2.4" step="0.1" value="1.5">
                        <span class="ao3h-range-value" data-for="lineHeight">1.6</span>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Typography -->

                <!-- ─── BUILDER MODE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Builder Mode</div>
                <div class="ao3h-setting-label">Editor mode</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="editorMode" data-setting="mode" value="visual" checked> Visual builder (sliders + pickers)</label>
                    </div>
                </div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="editorMode" data-setting="mode" value="css"> CSS editor (full control)</label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Builder Mode -->

                <!-- ─── IMPORT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Import a Theme</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="importEnabled" checked>
                            Import from
                        </label>
                    </div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-theme">Import theme (file or URL)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-theme">Export current theme</button>
                </div>
                </div><!-- /.ao3h-config-section: Import a Theme -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Styling</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable custom styles</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="customStyles" checked>
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Styling -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
