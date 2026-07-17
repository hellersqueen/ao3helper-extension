/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fic Downloader

   Configuration panel for the Fic Downloader module.
   Previously: downloadManager

   Sections:
   - Default Format
   - Kindle
   - Calibre
   - Batch Download
   - Auto-Cache
   - Listings

   wireConfigArea() shows/hides the Kindle and Calibre sub-option blocks
   based on their "Enable" checkbox (the HTML alone always started them
   hidden — no listener ever un-hid them, so the Kindle email field in
   particular was never actually reachable from the panel).
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

                <!-- ─── CALIBRE ─── -->
                </div><!-- /.ao3h-config-section: Send to Kindle -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Calibre Integration</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="calibreEnabled" id="ao3h-dl-calibre">
                            Enable "Send to Calibre"
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a "Send to Calibre" action next to downloads, sending the file to your Calibre Content Server.</div>
                </div>

                <div id="ao3h-dl-calibre-opts" class="ao3h-indent" style="display: none;">
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Calibre server URL</label>
                        <div class="ao3h-setting-control">
                            <input type="text" class="ao3h-config-input" data-setting="calibreUrl" placeholder="http://localhost:8080">
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <label class="ao3h-setting-label">Library name (optional)</label>
                        <div class="ao3h-setting-control">
                            <input type="text" class="ao3h-config-input" data-setting="calibreLibrary" placeholder="Calibre Library">
                        </div>
                    </div>
                </div>

                <!-- ─── BATCH DOWNLOAD ─── -->
                </div><!-- /.ao3h-config-section: Calibre Integration -->
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

                <!-- ─── LISTINGS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Listings</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showQuickDownloadButtons" checked>
                            Show the quick-download icon on work listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a ⬇️ icon next to each work in listings for one-click download without opening the work page. Disable if you only use batch or per-work downloads.</div>
                </div>

                </div><!-- /.ao3h-config-section: Listings -->

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

/* ═══════════════════════════════════════════════════════════════════════════
   WIRING — toggle visibility of sub-option blocks based on their checkbox.
   L'appel initial synchronise l'affichage sur l'état actuel de la case (les
   deux blocs démarrent en display:none dans le HTML, quel que soit le
   réglage sauvegardé) ; sans ça la case "Enable" pouvait être cochée tout en
   laissant les champs (email Kindle, URL Calibre) invisibles en permanence.
═══════════════════════════════════════════════════════════════════════════ */

function _wireToggle(container, checkboxSelector, optsSelector) {
  const checkbox = container.querySelector(checkboxSelector);
  const opts = container.querySelector(optsSelector);
  if (!checkbox || !opts || checkbox.dataset.wired) return;
  checkbox.dataset.wired = '1';
  opts.style.display = checkbox.checked ? '' : 'none';
  checkbox.addEventListener('change', () => {
    opts.style.display = checkbox.checked ? '' : 'none';
  });
}

function wireConfigArea(container) {
  _wireToggle(container, '#ao3h-dl-kindle', '#ao3h-dl-kindle-opts');
  _wireToggle(container, '#ao3h-dl-calibre', '#ao3h-dl-calibre-opts');
}

export { wireConfigArea };
