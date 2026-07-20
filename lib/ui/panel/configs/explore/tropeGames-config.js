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
                    <div class="ao3h-setting-description">Counts, weekly challenge, monthly trend, and unexplored tropes</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="enableMoodQuiz" checked>
                            Enable Trope Mood Quiz
                        </label>
                    </div>
                    <div class="ao3h-setting-description">One-question quiz recommending a trope to search for</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="seasonalTheme">
                            Seasonal color theme
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Trope Games panels get a subtle seasonal reskin (Halloween in October, etc.)</div>
                </div>

                </div><!-- /.ao3h-config-section: Options -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Bingo Card</div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Card size</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="bingoSize">
                            <option value="9">3×3 (easy)</option>
                            <option value="25" selected>5×5 (classic)</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Category</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="bingoCategory">
                            <option value="" selected>All categories</option>
                            <option value="Romance">Romance</option>
                            <option value="Comfort">Comfort</option>
                            <option value="Found Family">Found Family</option>
                            <option value="AU">AU</option>
                            <option value="Speculative">Speculative</option>
                            <option value="Plot">Plot</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Slice of Life">Slice of Life</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">New cards prefer tropes from this category, filling any remaining cells from the rest of the list</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Exclude tropes</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-setting-input" data-setting="bingoExclude" placeholder="e.g. Hanahaki Disease, Amnesia">
                    </div>
                    <div class="ao3h-setting-description">Comma-separated, applies to new cards</div>
                </div>
                </div><!-- /.ao3h-config-section: Bingo Card -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Roulette</div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Tropes per spin</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="rouletteCount">
                            <option value="2">2</option>
                            <option value="3" selected>3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Roulette -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
