/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Peek
   
   Configuration panel for the Fic Peek module.

   Excerpt length in the inline preview.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'ficPeek';
export const config = `

                <!-- ─── TRIGGER ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Trigger</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show preview on</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hoverMode" data-setting="hoverMode" value="hover" checked> Hover</label>
                        <label><input type="radio" name="hoverMode" data-setting="hoverMode" value="click"> Click</label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Hover delay (ms)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="hoverDelay" value="300" min="0" max="2000" step="50" style="width: 80px;">
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="spoilerFreeMode">
                            Spoiler-free mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Hides author notes and end-of-chapter notes from the preview</div>
                </div>

                </div><!-- /.ao3h-config-section: Trigger -->

                <!-- ─── EXCERPT LENGTH ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Excerpt Length</div>
                <div class="ao3h-setting-item ao3h-col1">
                    <label class="ao3h-setting-label">Excerpt length</label>
                    <div class="ao3h-setting-control ao3h-setting-control--radios">
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="paragraph" checked> First paragraph</label>
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="100words"> First 100 words</label>
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="250words"> First 250 words</label>
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="custom"> Custom word count</label>
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Custom word count</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="excerptCustomWords" value="150" min="10" max="1000" style="width: 80px;">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Excerpt Length -->

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Analysis & Recommendations</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show detailed analysis</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="showDetails" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Enable recommendations</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="enableRecommendations" checked>
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max results</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="maxResults" value="10" min="0">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Analysis & Recommendations -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
