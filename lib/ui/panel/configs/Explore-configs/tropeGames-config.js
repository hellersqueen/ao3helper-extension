/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Trope Games
   
   Configuration panel for the Trope Games module.
   Three trope features: Horoscope, Bingo, Roulette.
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'tropeGames';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Options</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showDailyTrope" checked>
                            Show daily trope banner on homepage
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Date-based daily trope, accessible from the AO3 Helper menu. Banner shown once per day.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="achievementsEnabled" checked>
                            Enable reading achievements
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Symbolic badges for reading habits (opt-in)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableBingo" checked>
                            Enable Trope Bingo card
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableRoulette" checked>
                            Enable Trope Roulette
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableStats" checked>
                            Enable Trope Statistics
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Charts and counts of your most-read tropes</div>
                </div>

                </div><!-- /.ao3h-config-section: Options -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
