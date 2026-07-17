/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Text To Speech
   
   Configuration panel for the Text To Speech module.
   Browser-native speech engine. Ultra-minimal by design.

   Sections:
   - Speech Engine
   - Playback Controls
   - Visual Feedback
   - Content Filtering
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'textToSpeech';
export const config = `

                <div class="ao3h-config-section">
                <!-- ─── SPEECH ENGINE ─── -->
                <div class="ao3h-config-section-title">Speech Engine</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Voice</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="voice" id="ao3h-tts-voice">
                            <option value="">System default…</option>
                        </select>
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="preview-voice" title="Test voice">Preview</button>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Speech Engine -->

                <div class="ao3h-config-section">
                <!-- ─── PLAYBACK ─── -->
                <div class="ao3h-config-section-title">Playback</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Playback speed</label>
                    <div class="ao3h-setting-control">
                        <input type="range" class="ao3h-config-range" data-setting="playbackSpeed"
                               min="0.5" max="2" step="0.1" value="1">
                        <span class="ao3h-range-value" data-for="playbackSpeed">1×</span>
                    </div>
                    <div class="ao3h-setting-description">0.5× → 2×</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="stopOnPageChange" checked>
                            Stop on page change
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoNextChapter" checked>
                            Auto-read next chapter
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Playback -->

                <div class="ao3h-config-section">
                <!-- ─── VISUAL FEEDBACK ─── -->
                <div class="ao3h-config-section-title">Visual Feedback</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightSentence" checked>
                            Highlight current sentence
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoScroll" checked>
                            Auto-scroll to follow reading
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Visual Feedback -->

                <div class="ao3h-config-section">
                <!-- ─── CONTENT FILTERING ─── -->
                <div class="ao3h-config-section-title">Content Filtering</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="skipAuthorNotes" checked>
                            Skip author notes
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="skipSummary" checked>
                            Skip summary / preface
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Content Filtering -->

                <!-- ─── INTERFACE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Interface</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="floatingPanel" checked>
                            Floating playback panel
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Fixed-position panel that stays visible while scrolling</div>
                </div>
                </div><!-- /.ao3h-config-section: Interface -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
