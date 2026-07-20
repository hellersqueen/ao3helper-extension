/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Instant Footnotes
   
   Configuration panel for the Instant Footnotes module.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'instantFootnotes';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Trigger</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show footnote popup on</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="trigger">
                            <option value="hover">Hover</option>
                            <option value="click">Click</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Hover delay in (ms)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="delayIn" value="120" min="0" max="2000">
                    </div>
                    <div class="ao3h-setting-description">Delay before popup appears on hover</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Hover delay out (ms)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="delayOut" value="160" min="0" max="2000">
                    </div>
                    <div class="ao3h-setting-description">Delay before popup hides after cursor leaves</div>
                </div>
                </div><!-- /.ao3h-config-section: Trigger -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Popup</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max width (px)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-setting-input" data-setting="maxWidth" value="420" min="200" max="800">
                    </div>
                    <div class="ao3h-setting-description">Maximum width of the footnote popup</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Pin on click</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="pinOnClick" checked>
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Clicking a footnote link pins the popup open (hover mode only)</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Show &ldquo;Go to note&rdquo; link</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="showPermalink" checked>
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Show a link in the popup to scroll to the note in the text</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Popup colour theme</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="bubbleTheme">
                            <option value="auto">Auto (follow system)</option>
                            <option value="light">Always light</option>
                            <option value="dark">Always dark</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Overrides the automatic light/dark popup colours</div>
                </div>
                </div><!-- /.ao3h-config-section: Popup -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
