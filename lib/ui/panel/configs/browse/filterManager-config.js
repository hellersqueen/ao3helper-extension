/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Filter Manager

   Configuration panel for the Filter Manager module.
   Fusion: filterPresets + worksFilterManager

   Sections:
   - Presets
   - Languages
   - Archive Warning Alerts
   - Tag Bundles
   - Quick Filters
   - History Filters
   - Import / Export
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'filterManager';

export const config = `

                <!-- ─── PRESETS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Presets</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="starredPresetsFirst" checked>
                            Pin favourite presets to top
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Starred presets always appear first in the list</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="presetHoverPreview" checked>
                            Filter preview on hover
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows included / excluded / rating on hover</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="rememberLastPresetByFandom" checked>
                            Remember last preset per fandom
                        </label>
                    </div>
                    <div class="ao3h-setting-description">On a fandom page, the last preset used in that fandom is automatically pre-selected</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showExpandPreset" checked>
                            "Edit as chips" button on presets
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Shows an "Edit as chips" button next to Apply — applies the preset and lets you remove individual filters before launching the search</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="searchHistoryEnabled" checked>
                            Remember recent searches
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Every search you run (not just saved presets) is kept in a "🕐 Recent" list you can restore from</div>
                </div>
                </div><!-- /.ao3h-config-section: Presets -->

                <!-- ─── LANGUAGES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Languages</div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Shown languages</label>
                    <div class="ao3h-setting-control">
                        <div class="ao3h-picker-row">
                            <select class="ao3h-config-input ao3h-picker"
                                    id="ao3h-fm-lang-picker"
                                    data-picker-type="language">
                                <option value="">— Pick a language —</option>
                            </select>
                            <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green"
                                    data-action="add-language">+ Add</button>
                        </div>
                    </div>
                    <div class="ao3h-tag-chips-card ao3h-tag-chips-card--empty">
                        <div class="ao3h-chip-container"
                             data-setting="selectedLanguages"
                             data-empty-text="All languages shown"></div>
                    </div>
                    <div class="ao3h-setting-description">Only works in these languages will appear in results. Leave empty to show all.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showLanguageBadge" id="ao3h-fm-badge">
                            Show language badge on works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Visible only when multiple languages are selected</div>
                </div>

                <div class="ao3h-indent" id="ao3h-fm-badge-opts">
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="clickBadgeToFilter" checked>
                            Click badge to filter by language
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Clicking a language badge on a work adds it to your active filter</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hidePreferredLanguageBadge">
                            Only badge non-preferred languages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Skips the badge for languages you list below, so only unusual ones stand out</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Preferred languages</label>
                    <div class="ao3h-setting-control">
                        <div class="ao3h-picker-row">
                            <select class="ao3h-config-input ao3h-picker"
                                    id="ao3h-fm-preferred-lang-picker"
                                    data-picker-type="language">
                                <option value="">— Pick a language —</option>
                            </select>
                            <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green"
                                    data-action="add-preferred-language">+ Add</button>
                        </div>
                    </div>
                    <div class="ao3h-tag-chips-card ao3h-tag-chips-card--empty">
                        <div class="ao3h-chip-container"
                             data-setting="preferredLanguages"
                             data-empty-text="None set"></div>
                    </div>
                </div>
                </div>
                </div><!-- /.ao3h-config-section: Languages -->

                <!-- ─── ARCHIVE WARNINGS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Archive Warning Alerts</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="warnExcludedWarning" checked>
                            Warn when an archive warning is excluded
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Banner appears if one of the 6 official AO3 warnings is excluded</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="excludeWarningRemoveButton" checked>
                            "Remove exclusion" button in banner
                        </label>
                    </div>
                    <div class="ao3h-setting-description">One-click button in the warning banner to remove the exclusion immediately</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Sensitivity</label>
                    <div class="ao3h-setting-control">
                        <select class="ao3h-setting-select" data-setting="warningBannerMinCount">
                            <option value="1" selected>Any exclusion (default)</option>
                            <option value="2">2 or more warnings excluded</option>
                            <option value="3">3 or more warnings excluded</option>
                        </select>
                    </div>
                    <div class="ao3h-setting-description">The banner itself also has a "Don't show again" button</div>
                </div>
                </div><!-- /.ao3h-config-section: Archive Warning Alerts -->

                <!-- ─── TAG BUNDLES ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Bundles</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagBundlesEnabled" id="ao3h-fm-bundles">
                            Enable tag bundles
                        </label>
                    </div>
                    <div class="ao3h-setting-description">A bundle = group of tags treated as equivalent. E.g. "Slow Burn" groups "Slow Burn", "Slowburn", "Pining"…</div>
                </div>

                <div id="ao3h-fm-bundles-opts" class="ao3h-indent">
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label>
                                <input type="checkbox" data-setting="useBuiltinTropeBundles" checked>
                                Use pre-built trope bundles
                            </label>
                        </div>
                        <div class="ao3h-setting-description">Enemies to Lovers, Slow Burn, Coffee Shop AU, etc.</div>
                    </div>
                    <div class="ao3h-config-row ao3h-config-row--end">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="create-bundle">+ Create bundle</button>
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="manage-bundles">Manage bundles</button>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Tag Bundles -->

                <!-- ─── QUICK FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Quick Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterOneshot" checked>
                            One-shot toggle
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a button to quickly show or hide single-chapter works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterCrossover" checked>
                            Crossover toggle
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a button to quickly show or hide crossover works</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showOneshotBadge">
                            One-shot badge on listings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">A small "1️⃣" badge next to one-shot titles, independent of the filter button</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterLowTags">
                            Hide low-tag works
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Minimum tag count</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-field--sm" data-setting="lowTagThreshold" value="3" min="0">
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterAnonymous">
                            Hide anonymous works
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterSummary">
                            Require a summary
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Minimum summary length</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-field--sm" data-setting="minSummaryLength" value="0" min="0">
                    </div>
                    <div class="ao3h-setting-description">0 = just require a non-empty summary</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterRatio">
                            Minimum kudos ratio
                        </label>
                    </div>
                </div>
                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Min. kudos/hits (%)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-field--sm" data-setting="minKudosRatio" value="2" min="0" step="0.5">
                    </div>
                    <div class="ao3h-setting-description">Only works with a visible hit count are checked</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterDate">
                            "Updated within" dropdown
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickFilterAbandoned">
                            Hide abandoned-looking WIPs
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Incomplete works not updated in over a year</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="manualHideEnabled" checked>
                            "✕" button to hide a single work
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds a small hide button to every work in a listing</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="manualHideShortcut" checked>
                            Keyboard shortcut to hide (X)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Press X while hovering a work to hide it instantly</div>
                </div>
                </div><!-- /.ao3h-config-section: Quick Filters -->

                <!-- ─── HISTORY FILTERS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">History-Based Filters</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideKudosed">
                            Hide already-kudosed works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works you've given kudos to are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideSubscribed">
                            Hide works I'm subscribed to
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works in your subscription list are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideBookmarked">
                            Hide works in my bookmarks
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works you've bookmarked are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideMFL">
                            Hide works in my Later Shelf
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works saved to your Later Shelf are hidden from listings</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideRead">
                            Hide all works I've already read
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Not just fully-read series — any work in your reading history (needs readingTracker)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideReadSeries">
                            Hide fully-read series
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Series where every work has been read are hidden from listings (checked in the background, a page or two after load)</div>
                </div>

                <div class="ao3h-setting-item ao3h-full">
                    <label class="ao3h-setting-label">How to hide history-filtered works</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="historyFilterMode" data-setting="historyFilterMode" value="hide" checked> Hide completely</label>
                        <label><input type="radio" name="historyFilterMode" data-setting="historyFilterMode" value="dim"> Dim instead</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showHiddenCount" checked>
                            Show count of hidden works
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Displays a badge with the number of works filtered out on the current page, with a "peek" link per category</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="rememberFilters" checked>
                            Remember filter states between sessions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Your last active filters are restored when you return to AO3</div>
                </div>
                </div><!-- /.ao3h-config-section: History-Based Filters -->

                <!-- ─── DEFAULTS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Filter Defaults</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">One-shots</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="oneshotDefault" data-setting="oneshotDefault" value="all" checked> Show all</label>
                        <label><input type="radio" name="oneshotDefault" data-setting="oneshotDefault" value="oneshot"> One-shots only</label>
                        <label><input type="radio" name="oneshotDefault" data-setting="oneshotDefault" value="multi"> Multi-chapter only</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Crossovers</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="crossoverDefault" data-setting="crossoverDefault" value="all" checked> Show all</label>
                        <label><input type="radio" name="crossoverDefault" data-setting="crossoverDefault" value="no"> No crossovers</label>
                        <label><input type="radio" name="crossoverDefault" data-setting="crossoverDefault" value="only"> Crossovers only</label>
                    </div>
                </div>

                </div><!-- /.ao3h-config-section: Filter Defaults -->

                <!-- ─── IMPORT / EXPORT ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Import / Export</div>
                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-presets">Import Presets</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-presets">Export Presets (JSON)</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-bundles">Import Bundles</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-bundles">Export Bundles (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Import / Export -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;


// ── Storage helpers (panel ↔ module shared keys) ─────────────────────────
// Étape 316 : UserLocalStorage importé directement (avant : lecture window.AO3H_Common,
// cassée côté Vite depuis le retrait de la pose à l'étape 314 — le panel écrivait alors
// des clés globales `ao3h:*` désynchronisées des clés per-user du module).
// Le bundler legacy (supprimé en Phase 27) remplaçait cet import par un shim window.
import { UserLocalStorage } from '../../../../storage/user.js';
import { downloadJSON } from '../../../../utils/json-file.js';

const _W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

function _fmLsGet(key, fallback) {
  try {
    const UserLS = UserLocalStorage || null;
    const v = UserLS
      ? UserLS.getJSON(key, null)
      : JSON.parse(localStorage.getItem(`ao3h:${key}`) || 'null');
    return v == null ? fallback : v;
  } catch { return fallback; }
}

function _fmLsSet(key, val) {
  try {
    const UserLS = UserLocalStorage || null;
    if (UserLS) UserLS.setJSON(key, val);
    else localStorage.setItem(`ao3h:${key}`, JSON.stringify(val));
  } catch {}
  _W.AO3H?.user?.set?.(key, val);
}

const _fmLoadPresets  = ()  => _fmLsGet('filterManager:presets', []);
const _fmSavePresets  = (p) => _fmLsSet('filterManager:presets', p);
const _fmLoadBundles  = ()  => _fmLsGet('filterManager:bundles', []);
const _fmSaveBundles  = (b) => _fmLsSet('filterManager:bundles', b);

function _fmDownloadJson(data, filename) {
  downloadJSON(data, filename);
}

// Mirrors PresetManagement._mergeById() — same last-write-wins Map merge.
function _fmMergeById(existing, incoming) {
  const map = new Map(existing.map(x => [x.id, x]));
  for (const item of incoming) map.set(item.id, item);
  return [...map.values()];
}

// Common AO3 languages (name → displayed in picker)
const FM_LANGUAGES = [
  'English', 'Deutsch', 'Français', 'Español', 'Italiano', 'Português',
  'Português Brasileiro', '日本語', '中文-普通话 Mandarin', '中文-粵語 Cantonese',
  '한국어', 'Русский', 'العربية', 'Polski', 'Nederlands', 'Svenska',
  'Norsk', 'Suomi', 'Türkçe', 'Česky', 'Magyar', 'Română',
];

// ── Bundle list renderer ──────────────────────────────────────────────────
function _renderBundleList(container) {
  let listEl = container.querySelector('#ao3h-fm-bundle-list');
  if (!listEl) {
    listEl = document.createElement('div');
    listEl.id = 'ao3h-fm-bundle-list';
    listEl.className = 'ao3h-config-block';
    listEl.style.marginTop = '8px';
    const bundleOpts = container.querySelector('#ao3h-fm-bundles-opts');
    bundleOpts?.appendChild(listEl);
  }

  const custom = _fmLoadBundles();
  if (custom.length === 0) {
    listEl.innerHTML = '<div class="ao3h-hbt-empty-msg">No custom bundles yet. Click "+ Create bundle" to add one.</div>';
    return;
  }

  listEl.innerHTML = '';
  for (const bundle of custom) {
    const row = document.createElement('div');
    row.className = 'ao3h-config-row ao3h-fm-bundle-row';
    row.innerHTML =
      `<div class="ao3h-fm-bundle-info">`
      + `<strong class="ao3h-fm-bundle-name">${_fmEsc(bundle.name)}</strong>`
      + `<div class="ao3h-fm-bundle-tags">${_fmEsc(bundle.tags.join(', '))}</div>`
      + `</div>`
      + `<button class="ao3h-inline-btn ao3h-inline-btn--danger ao3h-fm-bundle-delete"`
      + ` data-bundle-id="${_fmEsc(bundle.id)}">✕</button>`;
    row.querySelector('.ao3h-fm-bundle-delete').addEventListener('click', () => {
      const updated = _fmLoadBundles().filter(b => b.id !== bundle.id);
      _fmSaveBundles(updated);
      _renderBundleList(container);
    });
    listEl.appendChild(row);
  }
}

function _fmEsc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Main wiring function ──────────────────────────────────────────────────
function wireConfigArea(container) {
  // Language picker — try AO3 native select first, fall back to list
  const picker = container.querySelector('#ao3h-fm-lang-picker');
  const preferredPicker = container.querySelector('#ao3h-fm-preferred-lang-picker');
  if (picker && picker.options.length <= 1) {
    const nativeSel = document.querySelector('select[name="work_search[language_id]"], #work_search_language_id');
    const sources = nativeSel
      ? [...nativeSel.options].filter(o => o.value).map(o => o.textContent.trim())
      : (window.ao3mock?.LANGUAGES
          ? window.ao3mock.LANGUAGES.map(([, name]) => name)
          : FM_LANGUAGES);
    for (const name of sources) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      picker.appendChild(opt);
      if (preferredPicker) preferredPicker.appendChild(opt.cloneNode(true));
    }
  }

  // Generic "add to chip list" wiring, reused for selectedLanguages and preferredLanguages.
  function _wireChipPicker (pickerEl, addBtnEl, chipsEl) {
    if (!addBtnEl || !chipsEl || addBtnEl.dataset.wired) return;
    addBtnEl.dataset.wired = '1';
    const card = chipsEl.closest('.ao3h-tag-chips-card');
    let selected = [];
    try { selected = JSON.parse(chipsEl.dataset.value || '[]'); } catch {}

    function _syncCardVisibility() {
      if (card) card.classList.toggle('ao3h-tag-chips-card--empty', selected.length === 0);
    }

    function _addChip(name, updateArr) {
      if (updateArr && !selected.includes(name)) selected.push(name);
      const chip = document.createElement('span');
      chip.className = 'ao3h-chip ao3h-chip--neutral ao3h-chip--square'; chip.dataset.value = name;
      chip.innerHTML = `${_fmEsc(name)} <button type="button" title="Remove">×</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        chip.remove();
        selected = selected.filter(n => n !== name);
        chipsEl.dataset.value = JSON.stringify(selected);
        _syncCardVisibility();
      });
      chipsEl.appendChild(chip);
    }

    if (selected.length > 0) {
      chipsEl.innerHTML = '';
      selected.forEach(n => _addChip(n, false));
    }
    _syncCardVisibility();

    addBtnEl.addEventListener('click', () => {
      const name = pickerEl?.value;
      if (!name || selected.includes(name)) return;
      _addChip(name, true);
      chipsEl.dataset.value = JSON.stringify(selected);
      if (pickerEl) pickerEl.selectedIndex = 0;
      _syncCardVisibility();
    });
  }

  _wireChipPicker(
    picker,
    container.querySelector('[data-action="add-language"]'),
    container.querySelector('.ao3h-chip-container[data-setting="selectedLanguages"]')
  );
  _wireChipPicker(
    preferredPicker,
    container.querySelector('[data-action="add-preferred-language"]'),
    container.querySelector('.ao3h-chip-container[data-setting="preferredLanguages"]')
  );

  // Badge sub-options toggle
  const badgeCb   = container.querySelector('#ao3h-fm-badge');
  const badgeOpts = container.querySelector('#ao3h-fm-badge-opts');
  if (badgeCb && badgeOpts && !badgeCb.dataset.wired) {
    badgeCb.dataset.wired = '1';
    badgeOpts.style.display = badgeCb.checked ? '' : 'none';
    badgeCb.addEventListener('change', () => {
      badgeOpts.style.display = badgeCb.checked ? '' : 'none';
    });
  }

  // Bundles section toggle
  const bundlesCb   = container.querySelector('#ao3h-fm-bundles');
  const bundlesOpts = container.querySelector('#ao3h-fm-bundles-opts');
  if (bundlesCb && bundlesOpts && !bundlesCb.dataset.wired) {
    bundlesCb.dataset.wired = '1';
    bundlesOpts.style.display = bundlesCb.checked ? '' : 'none';
    bundlesCb.addEventListener('change', () => {
      bundlesOpts.style.display = bundlesCb.checked ? '' : 'none';
    });
  }

  // Export / Import presets
  const exportPresetsBtn = container.querySelector('[data-action="export-presets"]');
  if (exportPresetsBtn && !exportPresetsBtn.dataset.wired) {
    exportPresetsBtn.dataset.wired = '1';
    exportPresetsBtn.addEventListener('click', () => {
      _fmDownloadJson({ presets: _fmLoadPresets() }, 'ao3h-presets.json');
    });
  }

  const importPresetsBtn = container.querySelector('[data-action="import-presets"]');
  if (importPresetsBtn && !importPresetsBtn.dataset.wired) {
    importPresetsBtn.dataset.wired = '1';
    importPresetsBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.addEventListener('change', () => {
        const file = inp.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            if (typeof reader.result !== 'string') throw new TypeError('Expected a text file');
            const data = JSON.parse(reader.result);
            if (Array.isArray(data.presets)) {
              _fmSavePresets(_fmMergeById(_fmLoadPresets(), data.presets));
              importPresetsBtn.textContent = '✓ Imported';
              setTimeout(() => { importPresetsBtn.textContent = 'Import Presets'; }, 1500);
            }
          } catch (err) { console.error('[AO3H][filterManager-config] Import error', err); }
        };
        reader.readAsText(file);
      });
      inp.click();
    });
  }

  // Export / Import bundles
  const exportBundlesBtn = container.querySelector('[data-action="export-bundles"]');
  if (exportBundlesBtn && !exportBundlesBtn.dataset.wired) {
    exportBundlesBtn.dataset.wired = '1';
    exportBundlesBtn.addEventListener('click', () => {
      _fmDownloadJson({ bundles: _fmLoadBundles() }, 'ao3h-bundles.json');
    });
  }

  const importBundlesBtn = container.querySelector('[data-action="import-bundles"]');
  if (importBundlesBtn && !importBundlesBtn.dataset.wired) {
    importBundlesBtn.dataset.wired = '1';
    importBundlesBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.addEventListener('change', () => {
        const file = inp.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            if (typeof reader.result !== 'string') throw new TypeError('Expected a text file');
            const data = JSON.parse(reader.result);
            if (Array.isArray(data.bundles)) {
              _fmSaveBundles(_fmMergeById(_fmLoadBundles(), data.bundles));
              _renderBundleList(container);
              importBundlesBtn.textContent = '✓ Imported';
              setTimeout(() => { importBundlesBtn.textContent = 'Import Bundles'; }, 1500);
            }
          } catch (err) { console.error('[AO3H][filterManager-config] Import error', err); }
        };
        reader.readAsText(file);
      });
      inp.click();
    });
  }

  // Create bundle
  const createBundleBtn = container.querySelector('[data-action="create-bundle"]');
  if (createBundleBtn && !createBundleBtn.dataset.wired) {
    createBundleBtn.dataset.wired = '1';
    createBundleBtn.addEventListener('click', () => {
      const name = window.prompt('Bundle name (e.g. "Slow Burn"):');
      if (!name?.trim()) return;
      const rawTags = window.prompt(`Tags for "${name.trim()}" (comma-separated):`);
      if (!rawTags?.trim()) return;
      const tags = rawTags.split(',').map(t => t.trim()).filter(Boolean);
      if (tags.length === 0) return;
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      const bundles = _fmLoadBundles();
      bundles.push({ id, name: name.trim(), tags });
      _fmSaveBundles(bundles);
      _renderBundleList(container);
    });
  }

  // Manage bundles — toggle the inline bundle list
  const manageBundlesBtn = container.querySelector('[data-action="manage-bundles"]');
  if (manageBundlesBtn && !manageBundlesBtn.dataset.wired) {
    manageBundlesBtn.dataset.wired = '1';
    manageBundlesBtn.addEventListener('click', () => {
      _renderBundleList(container);
      const listEl = container.querySelector('#ao3h-fm-bundle-list');
      if (listEl) {
        const hidden = listEl.style.display === 'none';
        listEl.style.display = hidden ? '' : 'none';
        manageBundlesBtn.textContent = hidden ? 'Hide bundles' : 'Manage bundles';
      }
    });
  }
}

// ── Listen for config open (real panel on AO3) ────────────────────────────
document.addEventListener('ao3h:configOpen', function(e) {
  if (e.detail?.moduleId !== 'filterManager') return;
  wireConfigArea(e.target);
});

// Étape 316 : l'enregistrement via window.AO3H_PanelConfigs.registerInitializer est
// remplacé par l'export de wireConfigArea — configs/index.js le référence dans son
// registre d'initialiseurs. Le bloc « filterManager_previewSetup » (aucun appelant
// dans le repo) est supprimé. Le bundler legacy (supprimé en Phase 27) réinjectait l'enregistrement.
export { wireConfigArea };
