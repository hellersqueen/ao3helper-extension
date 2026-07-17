/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Word Swap
   
   Configuration panel for the Word Swap module.
   Standalone — no dependencies.
   Replaces words in work text on-the-fly based on user-defined rules.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'wordSwap';
export const config = `

                <div class="ao3h-config-section">
                <!-- ─── Y/N QUICK PRESET ─── -->
                <div class="ao3h-config-section-title">Y/N Quick Preset</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Your name (for reader-insert fics)</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="yourFirstName" placeholder="Your name…">
                    </div>
                    <div class="ao3h-setting-description">Creates a rule: Y/N → your name (case-sensitive, word boundary)</div>
                </div>
                </div><!-- /.ao3h-config-section: Y/N Quick Preset -->

                <div class="ao3h-config-section">
                <!-- ─── RULES ─── -->
                <div class="ao3h-config-section-title">Swap Rules</div>

                <div class="ao3h-setting-description">Each rule is a "find → replace" pair. Toggle or delete individual rules. Rules can be grouped by category / fandom. Rules are applied only inside work text (<code>#workskin .userstuff</code>).</div>

                <div id="ao3h-wordSwap-rules-container" class="ao3h-config-block">
                    <!-- Rendered by JS: rows of [original] → [replacement] + on/off toggle + × button -->
                </div>

                <div class="ao3h-config-row" style="margin-top: 6px;">
                    <input type="text" class="ao3h-config-input" id="ao3h-ws-new-from" placeholder="Find…" style="width: 90px;">
                    <span style="padding: 0 4px; color: #666;"> → </span>
                    <input type="text" class="ao3h-config-input" id="ao3h-ws-new-to" placeholder="Replace with…" style="width: 110px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-rule">+ Add rule</button>
                </div>

                <div class="ao3h-config-row" style="margin-top: 8px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-rules">Import Rules</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-rules">Export Rules (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Swap Rules -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
