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
                        <label><input type="radio" name="excerptLength" data-setting="excerptMode" value="fullChapter"> Full chapter</label>
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Custom word count</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="excerptCustomWords" value="150" min="10" max="1000" style="width: 80px;">
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col1">
                    <label class="ao3h-setting-label">Which chapter</label>
                    <div class="ao3h-setting-control ao3h-setting-control--radios">
                        <label><input type="radio" name="excerptChapter" data-setting="excerptChapter" value="first" checked> First chapter</label>
                        <label><input type="radio" name="excerptChapter" data-setting="excerptChapter" value="last"> Last chapter</label>
                        <label><input type="radio" name="excerptChapter" data-setting="excerptChapter" value="random"> Random chapter</label>
                    </div>
                    <div class="ao3h-setting-description">Fetching a chapter other than the first loads the whole work in one request (AO3's "entire work" view)</div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Preview box max height (em)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="maxPreviewHeightEm" value="8.5" min="2" max="50" step="0.5" style="width: 80px;">
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Excerpt Length -->

                <!-- ─── CACHING ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Caching</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="disableCache">
                            Never cache previews
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Always re-fetch the excerpt, even for a work you already previewed this session</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="persistCache">
                            Remember previews across browser sessions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">By default previews are forgotten when the tab closes. Enable to keep them (until the expiry below) even after closing the browser.</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Refresh cached previews after (hours)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="cacheTTLHours" value="168" min="1" max="2160" style="width: 90px;">
                    </div>
                    <div class="ao3h-setting-description">168 = 1 week. Applies to both session and persistent caching.</div>
                </div>
                </div><!-- /.ao3h-config-section: Caching -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
