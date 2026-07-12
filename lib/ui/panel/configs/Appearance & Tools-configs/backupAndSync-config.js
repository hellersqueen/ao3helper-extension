/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Backup And Sync
   
   Configuration panel for the Backup And Sync module.
   Automatic local backup with optional cross-device browser sync.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'backupAndSync';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Browser Sync</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="syncEnabled">
                            Sync via browser account
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Sync your AO3Helper data across devices using your browser's built-in sync (Chrome / Firefox). ~100 KB limit. Opt-in.</div>
                </div>
                </div><!-- /.ao3h-config-section -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Automatic Behaviours</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableAutoBackup" checked>
                            Enable automatic backups
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Backup interval (minutes)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="backupInterval" value="15" min="1" max="60">
                    </div>
                    <div class="ao3h-setting-description">Default: every 15 minutes</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max backups kept</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="maxBackups" value="10" min="1" max="50">
                    </div>
                    <div class="ao3h-setting-description">Oldest backups deleted automatically when limit is reached</div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="backup-now">☁️ Backup Now</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-backup">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-backup">Export (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Automatic Behaviours -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
