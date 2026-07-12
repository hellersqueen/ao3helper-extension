/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Downloader
   
   Configuration panel for the Fic Downloader module.
   Previously: downloadManager
   
   Sections:
   - Default Format
   - Kindle
   - Auto-Cache
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'ficDownloader';
export const config = `

                <!-- ─── FORMAT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Default Download Format</div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Format</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="epub" checked> EPUB</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="mobi"> MOBI</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="azw3"> AZW3</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="pdf"> PDF</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="html"> HTML</label>
                        <label><input type="radio" name="defaultFormat" data-setting="defaultFormat" value="txt"> TXT</label>
                    </div>
                </div>

                <!-- ─── KINDLE ─── -->
                </div><!-- /.ao3h-config-section: Default Download Format -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Send to Kindle</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sendToKindleEnabled" id="ao3h-dl-kindle">
                            Enable "Send to Kindle"
                        </label>
                    </div>
                </div>

                <div id="ao3h-dl-kindle-opts" class="ao3h-indent" style="display: none;">
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Kindle email address</label>
                        <div class="ao3h-setting-control">
                            <input type="email" class="ao3h-config-input" data-setting="kindleEmail" placeholder="your-device@kindle.com">
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label>
                                <input type="checkbox" data-setting="autoKindleSend">
                                Auto-send on download
                            </label>
                        </div>
                    </div>
                </div>

                <!-- ─── BATCH DOWNLOAD ─── -->
                </div><!-- /.ao3h-config-section: Send to Kindle -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Batch Download</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Max works per batch</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="maxWorks" value="10" min="1" max="100" style="width: 80px;">
                    </div>
                    <div class="ao3h-setting-description">Maximum number of works downloaded in a single batch operation</div>
                </div>

                </div><!-- /.ao3h-config-section: Batch Download -->

                <!-- ─── AUTO-CACHE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Auto-Cache</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoCacheMFL">
                            Auto-cache "Later Shelf" works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Silently downloads MFL works in the background for offline access</div>
                </div>

                </div><!-- /.ao3h-config-section: Auto-Cache -->

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
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
