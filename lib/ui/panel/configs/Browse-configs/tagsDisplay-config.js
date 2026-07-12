/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Tags Display
   
   Configuration panel for the Tags Display module.
   Previously: tagsDisplayManager
   
   Sections:
   - Tag Noise Filtering (autoHideNoiseTags)
   - Compact Mode (compactModeTags)
   - Highlighting (tagsHighlighting)
   - Archive Warnings Style (archiveWarningsDisplay)
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'tagsDisplay';

export const config = `

                <!-- ─── TAG NOISE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoHideNoiseTags">
                            Auto-hide noise tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">~25 recognised filler expressions hidden automatically</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="compactMode">
                            Compact mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tags + summaries collapsed, expand on hover</div>
                </div>

                <!-- ─── HIGHLIGHTING ─── -->
                </div><!-- /.ao3h-config-section: Tag Display -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Favourite Tag Highlighting</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightFavoriteTags" checked>
                            Highlight favourite tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Right-click any tag → "Highlight this tag" → choose style</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default highlight colour</label>
                    <div class="ao3h-setting-control ao3h-color-swatch-group">
                        <label class="ao3h-color-swatch-label" title="Yellow">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="0" checked>
                            <span class="ao3h-color-swatch" style="background:#fef9c3; border:2px solid #facc15;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Green">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="1">
                            <span class="ao3h-color-swatch" style="background:#dcfce7; border:2px solid #4ade80;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Blue">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="2">
                            <span class="ao3h-color-swatch" style="background:#dbeafe; border:2px solid #60a5fa;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Pink">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="3">
                            <span class="ao3h-color-swatch" style="background:#fce7f3; border:2px solid #f472b6;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Purple">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="4">
                            <span class="ao3h-color-swatch" style="background:#f3e8ff; border:2px solid #c084fc;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Orange">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="5">
                            <span class="ao3h-color-swatch" style="background:#fff7ed; border:2px solid #fb923c;"></span>
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Colour used when you quick-highlight a tag (right-click to override per-tag)</div>
                </div>

                <!-- ─── ARCHIVE WARNING STYLE ─── -->
                </div><!-- /.ao3h-config-section: Favourite Tag Highlighting -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Archive Warning Style</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Display as</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="badge" checked> Badge</label>
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="text"> Text</label>
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="icon"> Icon</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="compactWarnings">
                            Compact archive warnings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Abbreviate warnings (e.g. &ldquo;MCD&rdquo; instead of full text)</div>
                </div>

                </div><!-- /.ao3h-config-section: Archive Warning Style -->

                <!-- ─── TAG LIMITS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Visibility</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max tags visible per work</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="0" checked> All</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="5"> 5</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="10"> 10</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="15"> 15</label>
                    </div>
                    <div class="ao3h-setting-description">Tags beyond the limit are hidden with a "+N more" link</div>
                </div>

                </div><!-- /.ao3h-config-section: Tag Visibility -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Data</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-backup</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoBackup">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Data -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
