/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Reading Formatter
   
   Configuration panel for the Reading Formatter module.
   Fusion: ficFormatter + appearanceManager

   Sections:
   - Cleanup options (text formatting)
   - Display options (reading experience)
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'readingFormatter';
export const config = `

                <!-- ─── CLEANUP ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Text Cleanup</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCleanFormatting" checked>
                            Auto-clean formatting
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Double spaces, merged paragraphs, &lt;br&gt;&lt;br&gt; → real paragraphs</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="removeBoldExcessive">
                            Remove excessive bold
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Stylistic risk — author may intend the bold</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="convertSlashItalic">
                            Convert /text/ to italic
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Old fanfic italic convention</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="unifySceneBreaks" checked>
                            Unify scene separators
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Replaces ***, ---, ~~~ etc. with the separator below</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Separator style</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-setting-input" data-setting="sceneBreakStyle" placeholder="✦ ✦ ✦" style="width:110px;">
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="splitTextWalls">
                            Split walls of text
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Very long single paragraphs are split at sentence boundaries (reversible)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideEmbeddedImages">
                            Hide embedded images
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Text-only mode — hides &lt;img&gt; tags in work content</div>                </div>
                </div><!-- /.ao3h-config-section: Text Cleanup -->

                <!-- ─── DISPLAY ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Display</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sansSerifFont">
                            Sans-serif font
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Overrides the author's font choice</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="cleanReadingMode">
                            Clean reading mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Reduced margins, secondary elements hidden</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Text alignment</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-input" data-setting="textAlignment">
                            <option value="left">Left</option>
                            <option value="justify">Justified</option>
                            <option value="center">Center</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Paragraph spacing</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-setting-input" data-setting="paragraphSpacing" placeholder="e.g. 0.5em">
                    </div>
                    <div class="ao3h-setting-description">Extra margin between paragraphs (e.g. 0.5em, 1em)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="breatheMode">
                            “Breathe” mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Long paragraphs get extra line spacing for easier reading</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="readingRuler">
                            Reading ruler
                        </label>
                    </div>
                    <div class="ao3h-setting-description">A subtle horizontal band follows your pointer to keep your place</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightDialogue">
                            Highlight dialogue
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Quoted speech gets a subtle tint to stand out from narration</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="endOfWorkInfo">
                            Repeat work info at the end
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Title, author and main tags shown again below the work</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="perWorkPrefs">
                            Remember Aa panel per work
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Width / spacing / size / indent are stored per work instead of globally</div>
                </div>
                </div><!-- /.ao3h-config-section: Display -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
