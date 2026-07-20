/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Fanfic Binge Mode

   Configuration panel for the Fanfic Binge Mode module.
   Library tab module.

   Sections:
   - Binge Session
   - Discovery
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'fanficBingeMode';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Binge Session</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="continueReadingModal" checked>
                            &ldquo;Continue Reading?&rdquo; modal
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shown at 95% scroll on the last chapter — suggests next fic, mark as read, bookmark</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Auto-advance delay (seconds)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="autoAdvanceDelay" value="0" min="0" max="60" style="width: 70px;">
                    </div>
                    <div class="ao3h-setting-description">Countdown before auto-advancing to the next work (0 = off). Automatically navigates to /works when it hits zero.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showHomepagePanel" checked>
                            &ldquo;Continue Reading&rdquo; panel on homepage
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Quick access to your most recently read, not-yet-finished works</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Works shown</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="resumeCount" value="5" min="1" max="10" style="width: 60px;">
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Panel style</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="homepagePanelStyle">
                            <option value="list" selected>List</option>
                            <option value="banner">Banner (most recent only)</option>
                            <option value="sidebar">Floating sidebar</option>
                        </select>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Show reminder on</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="reminderScope">
                            <option value="home" selected>Homepage only</option>
                            <option value="home+search">Homepage + search results</option>
                            <option value="everywhere">Everywhere</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">Beyond the homepage, a small "Continue: &lt;title&gt;" pill links to your most recent unfinished work</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Break reminder</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="breakReminderMinutes">
                            <option value="0" selected>Off</option>
                            <option value="30">Every 30 min</option>
                            <option value="45">Every 45 min</option>
                            <option value="60">Every 60 min</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">A gentle nudge while actively reading a work — resets each page load</div>
                </div>

                </div><!-- /.ao3h-config-section: Binge Session -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Discovery</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPostReadingSuggestions" checked>
                            Post-reading suggestions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Next in series · More by this author · More like this</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="queueEnabled">
                            Reading queue
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Build and manage a personal reading queue — add, reorder, remove works, cycle priority (low/medium/high), see read-progress bars</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-description">Keyboard shortcut: <code>Alt+R</code> jumps to your most recent unfinished work (only active while the Keyboard Shortcuts module is also enabled; shown in its "?" shortcut guide, not remappable)</div>
                </div>

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;
