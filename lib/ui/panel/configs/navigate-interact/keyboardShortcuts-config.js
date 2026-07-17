/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Keyboard Shortcuts
   
   Configuration panel for the Keyboard Shortcuts module.
   Hub for shortcuts — 6 modules delegate their shortcuts here.

   Sections:
   - Global options
   - Default shortcuts reference table
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'keyboardShortcuts';
export const config = `

                <!-- ─── GLOBAL OPTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Global Options</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="customizationEnabled">
                            Enable shortcut remapping
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Enable customization of key bindings (coming soon).</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="allShortcutsDisabled">
                            Disable all shortcuts (emergency toggle)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Emergency kill switch — disables all keyboard shortcuts immediately.</div>
                </div>
                </div><!-- /.ao3h-config-section: Global Options -->

                <!-- ─── REFERENCE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Shortcut Bindings</div>
                <div class="ao3h-setting-description" style="margin-bottom: 8px;">Format: Ctrl+Key, Shift+Key, Ctrl+Shift+Key, or a single key. Leave empty to disable.</div>
                <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-top: 4px;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 1px solid var(--ao3h-border, #e5e7eb);">
                            <th style="padding: 3px 6px;">Action</th>
                            <th style="padding: 3px 6px;">Shortcut</th>
                            <th style="padding: 3px 6px;">Context</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 2px 6px;">Previous chapter</td><td style="padding: 2px 6px;"><input type="text" data-setting="prevChapter" value="Ctrl+ArrowLeft" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Next chapter</td><td style="padding: 2px 6px;"><input type="text" data-setting="nextChapter" value="Ctrl+ArrowRight" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Previous page</td><td style="padding: 2px 6px;"><input type="text" data-setting="prevPage" value="Shift+ArrowLeft" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Next page</td><td style="padding: 2px 6px;"><input type="text" data-setting="nextPage" value="Shift+ArrowRight" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Shortcut guide</td><td style="padding: 2px 6px;"><input type="text" data-setting="guide" value="?" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Everywhere</td></tr>
                        <tr><td style="padding: 2px 6px;">Surprise Me 🎲</td><td style="padding: 2px 6px;"><input type="text" data-setting="surpriseMe" value="Ctrl+Shift+R" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Subscribe</td><td style="padding: 2px 6px;"><input type="text" data-setting="subscribe" value="Ctrl+Shift+S" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Bookmark</td><td style="padding: 2px 6px;"><input type="text" data-setting="bookmark" value="Ctrl+Shift+B" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page / listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Mark for later</td><td style="padding: 2px 6px;"><input type="text" data-setting="markForLater" value="Ctrl+Shift+M" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page / listings</td></tr>
                    </tbody>
                </table>

                <div class="ao3h-config-row" style="margin-top: 10px; flex-wrap: wrap; gap: 6px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-shortcuts">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-shortcuts">Export (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Default Shortcuts -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
