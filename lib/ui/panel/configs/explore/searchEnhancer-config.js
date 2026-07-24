/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Search Enhancer

   Configuration panel for the Search Enhancer module.
   Tag autocomplete, search history, custom result sorting.

   wireConfigArea() wires the "Export history" button.
═══════════════════════════════════════════════════════════════════════════ */

import { downloadJSON } from '../../../../utils/json-file.js';
import { lsGet } from '../../../../utils/index.js';

export const moduleId = 'searchEnhancer';
export const config = `

                <!-- ─── TAG SUGGESTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Suggestions</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagSuggestions" checked>
                            Show related tag suggestions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Tags co-used with your current search tags</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="historyBasedSuggestions" checked>
                            Include suggestions from reading history
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="suggestionWorkCount" checked>
                            Show work count per suggestion
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"Slow Burn — 45K"</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchTemplates" checked>
                            Quick search templates
                        </label>
                    </div>
                    <div class="ao3h-setting-description">One-click chips: most kudos, recently updated, complete only, longest first</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchInsights" checked>
                            Your search insights
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Most-searched terms, trending searches, and top fandoms — from your own local history only</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="refinementTips" checked>
                            Refinement tips
                        </label>
                    </div>
                    <div class="ao3h-setting-description">A short tip when a search returns zero or a full page of results</div>
                </div>
                </div><!-- /.ao3h-config-section: Tag Suggestions -->

                <!-- ─── AUTOCOMPLETE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Autocomplete & History</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchHistory" checked>
                            Search history (25 searches max)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="historyTypoTolerance" checked>
                            Tolerate typos in history search
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagAutocomplete" checked>
                            Tag autocomplete (canonical AO3 tags)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Merges AO3's own /autocomplete/tag suggestions into the search box's dropdown</div>
                </div>

                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-search-history">Export history (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Autocomplete & History -->

                <!-- ─── SORTING ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Result Sorting</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortByKudosRatio" checked>
                            Sort by kudos ratio
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortBySaveRate" checked>
                            Sort by save rate
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortByKudosPerChapter" checked>
                            Sort by kudos per chapter
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortByRecentActivity" checked>
                            Sort by recently updated
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="sortByBalanced" checked>
                            Sort by balanced (kudos ratio + recency)
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showRatioInline" checked>
                            Show ratio next to stats
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Format: "12% eng." inline</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="groupSeriesInResults">
                            Group series in search results
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">Default fandom sort</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="alpha" checked> Alphabetical</label>
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="popularity"> By size (most works first)</label>
                        <label><input type="radio" name="fandomSort" data-setting="fandomSortMode" value="history"> By reading history</label>
                    </div>
                    <div class="ao3h-setting-description">"By reading history" ranks series by how many of their works you've actually visited (via readingTracker), not just page order</div>
                </div>
                </div><!-- /.ao3h-config-section: Result Sorting -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

/**
 * Wires the "Export history" button.
 * @param {HTMLElement} container
 */
export function wireConfigArea (container) {
  const exportBtn = container.querySelector('[data-action="export-search-history"]');
  if (exportBtn && !exportBtn.dataset.wired) {
    exportBtn.dataset.wired = '1';
    exportBtn.addEventListener('click', () => {
      downloadJSON(lsGet('ao3h:se:history', []), 'ao3h-search-history.json');
    });
  }
}
