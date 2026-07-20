/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Hide By Tags (#1)
   
   Configuration panel for the Hide By Tags module.
   Reference: notes/parametres.md — "RECOMMENDED FINAL SETTINGS — Hide By Tags"
   
   Sections:
   - Hidden Tags Manager (search, chipbox, groups, add/remove)
   - Whitelist Exceptions (toggle + tag manager)
   - NOPE Words (keyword text filter)
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'hideByTags';

export const config = `

                <div class="ao3h-config-section">

                <!-- ─── HIDDEN TAGS MANAGER ─── -->
                <div class="ao3h-config-section-title">🚫 Hidden Tags</div>

                <div class="ao3h-hbt-enables-row">
                    <label><input type="checkbox" data-setting="enabled" checked> Enable tag hiding</label>
                    <label><input type="checkbox" data-setting="quickAddIcon" checked> 🚫 Quick-add on hover</label>
                    <label><input type="checkbox" data-setting="showHiddenCounter" checked> 🚫 Show "X works hidden" counter above results</label>
                </div>

                <div id="ao3h-hideByTags-behavior" class="ao3h-hbt-behavior-row">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">When a work matches a blacklisted tag</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideByTags-hideMode" data-setting="hideMode" value="hide" checked> Hide completely</label>
                        <label><input type="radio" name="hideByTags-hideMode" data-setting="hideMode" value="dim"> Soft hide (dimmed)</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Tag matching</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideByTags-tagMatchMode" data-setting="tagMatchMode" value="exact" checked> Exact tag</label>
                        <label><input type="radio" name="hideByTags-tagMatchMode" data-setting="tagMatchMode" value="contains"> Tag contains the text</label>
                    </div>
                    <div class="ao3h-setting-description">With "contains", the entry "harry" hides every tag containing that text. Tip: an entry like "tag A + tag B" hides a work only when it carries both tags. Shift+click a 🚫 icon to hide a tag only for today.</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Soft-hide opacity (%)</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input" data-setting="dimOpacity" value="25" min="5" max="90" style="width: 80px;">
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="dimBlur">
                            Also blur soft-hidden works
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="protectBookmarked">
                            Never hide works saved in Bookmark Vault
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Works you bookmarked (tracked by the Bookmark Vault module) always stay visible</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="hideNoiseTaggedWorks">
                            Hide works carrying a "noise" tag
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Uses the noise-tag detection of the Tags Display module (built-in patterns + your custom noise words)</div>
                </div>
                </div>

                <div id="ao3h-hideByTags-section-body" class="ao3h-hbt-two-col">
                <div class="ao3h-hbt-col-form">
                <!-- Add a tag row -->
                <div class="ao3h-config-row">
                    <input type="text" id="ao3h-hideByTags-add-input"
                           class="ao3h-config-input ao3h-hbt-tag-input"
                           placeholder="Add a tag…"
                           autocomplete="off">
                    <select id="ao3h-hideByTags-add-group"
                            class="ao3h-config-input ao3h-hbt-group-select">
                        <option value="">— Group (optional) —</option>
                    </select>
                    <input type="text" id="ao3h-hideByTags-add-group-text"
                           class="ao3h-config-input ao3h-hbt-group-text"
                           placeholder="New group name…"
                           autocomplete="off">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-tag"
                            title="Add this tag to the list">
                        + Add
                    </button>
                </div>

                <!-- Quick add group row -->
                <div class="ao3h-config-row">
                    <input type="text" id="ao3h-hideByTags-new-group"
                           class="ao3h-config-input ao3h-hbt-newgroup-input"
                           placeholder="Create a new group…"
                           autocomplete="off">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="add-group"
                            title="Create an empty group">
                        + Group
                    </button>
                </div>

                <div id="ao3h-hideByTags-groups" class="ao3h-hbt-groups-panel"></div>
                </div><!-- /.ao3h-hbt-col-form -->

                <div class="ao3h-hbt-col-chips">
                <!-- Tag list — populated by renderList() from localStorage -->
                <div id="ao3h-hideByTags-list" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-hbt-col-chips -->

                </div><!-- /.ao3h-hbt-two-col: Hidden Tags -->

                <div id="ao3h-hideByTags-below" class="ao3h-hbt-below-actions">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-all" title="Import from JSON">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-all" title="Export as JSON">Export</button>
                </div>

                <div class="ao3h-config-section">
                <!-- ─── WHITELIST EXCEPTIONS ─── -->
                <div class="ao3h-config-section-title">🟢 Whitelist Exceptions</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="whitelistEnabled" checked>
                            Enable whitelist exceptions
                        </label>
                    </div>
                    <div class="ao3h-setting-description">If a work has a whitelisted tag, it stays visible even if it also matches a blacklisted tag.</div>
                </div>

                <div class="ao3h-indent">
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showWhitelistBadge" checked>
                            Show a 🟢 badge on works kept visible by a whitelist exception
                        </label>
                    </div>
                </div>
                </div>

                <div id="ao3h-hideByTags-whitelist-behavior" class="ao3h-hbt-behavior-row">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">When a work matches both a blacklist and a whitelist tag</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideByTags-whitelistMode" data-setting="whitelistMode" value="show" checked> Show automatically</label>
                        <label><input type="radio" name="hideByTags-whitelistMode" data-setting="whitelistMode" value="fold-note"> Keep folded, add a 🟢 note to the fold banner</label>
                    </div>
                </div>
                </div><!-- /#ao3h-hideByTags-whitelist-behavior -->

                <div id="ao3h-hideByTags-whitelist-body" class="ao3h-hbt-two-col">
                <div class="ao3h-hbt-col-form">
                <!-- Whitelist tag manager -->
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-whitelist-add-input"
                               class="ao3h-config-input ao3h-hbt-tag-input"
                               placeholder="Add a whitelist tag…"
                               autocomplete="off">
                        <select id="ao3h-hideByTags-whitelist-add-group"
                                class="ao3h-config-input ao3h-hbt-group-select">
                            <option value="">— Group (optional) —</option>
                        </select>
                        <input type="text" id="ao3h-hideByTags-whitelist-add-group-text"
                               class="ao3h-config-input ao3h-hbt-group-text"
                               placeholder="New group name…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-whitelist-tag">
                            + Add
                        </button>
                    </div>
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-whitelist-new-group"
                               class="ao3h-config-input ao3h-hbt-newgroup-input"
                               placeholder="Create a new group…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="add-whitelist-group">
                            + Group
                        </button>
                    </div>
                <div id="ao3h-hideByTags-whitelist-groups" class="ao3h-hbt-groups-panel"></div>
                </div><!-- /.ao3h-hbt-col-form -->

                <div class="ao3h-hbt-col-chips">
                <div id="ao3h-hideByTags-whitelist-list" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-hbt-col-chips -->

                </div><!-- /.ao3h-hbt-two-col: Whitelist Exceptions -->

                <div id="ao3h-hideByTags-whitelist-below" class="ao3h-hbt-below-actions">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-whitelist" title="Import from JSON">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-whitelist" title="Export as JSON">Export</button>
                </div>

                <div class="ao3h-config-section">
                <!-- ─── NOPE WORDS ─── -->
                <div class="ao3h-config-section-title">⛔ NOPE Words</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="textFilterEnabled" checked>
                            Enable keyword text filter
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Applies to work summaries and author notes — not tags.</div>
                </div>

                <div id="ao3h-hideByTags-nope-behavior" class="ao3h-hbt-behavior-row">
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">When a work matches a NOPE word</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="hideByTags-nopeHideMode" data-setting="nopeHideMode" value="hide" checked> Hide completely</label>
                        <label><input type="radio" name="hideByTags-nopeHideMode" data-setting="nopeHideMode" value="dim"> Soft hide (25% opacity)</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Scan for NOPE words in</label>
                    <div class="ao3h-setting-control ao3h-setting-control--checkboxes">
                        <label><input type="checkbox" data-setting="nopeTargetSummaries" checked> Summaries</label>
                        <label><input type="checkbox" data-setting="nopeTargetNotes" checked> Author notes</label>
                        <label><input type="checkbox" data-setting="nopeTargetTitles"> Titles</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="nopeWholeWords">
                            Match whole words only
                        </label>
                    </div>
                    <div class="ao3h-setting-description">"art" no longer matches "heart". Advanced patterns work in both modes: * as a wildcard (her*t), or /…/ for a regular expression.</div>
                </div>
                </div><!-- /#ao3h-hideByTags-nope-behavior -->

                <div id="ao3h-hideByTags-nope-body" class="ao3h-hbt-two-col">
                <div class="ao3h-hbt-col-form">
                <!-- NOPE Words manager -->
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-nope-add-input"
                               class="ao3h-config-input ao3h-hbt-tag-input"
                               placeholder="Add a keyword…"
                               autocomplete="off">
                        <select id="ao3h-hideByTags-nope-add-group"
                                class="ao3h-config-input ao3h-hbt-group-select">
                            <option value="">— Group (optional) —</option>
                        </select>
                        <input type="text" id="ao3h-hideByTags-nope-add-group-text"
                               class="ao3h-config-input ao3h-hbt-group-text"
                               placeholder="New group name…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--green" data-action="add-nope-word">
                            + Add
                        </button>
                    </div>
                    <div class="ao3h-config-row">
                        <input type="text" id="ao3h-hideByTags-nope-new-group"
                               class="ao3h-config-input ao3h-hbt-newgroup-input"
                               placeholder="Create a new group…"
                               autocomplete="off">
                        <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--purple" data-action="add-nope-group">
                            + Group
                        </button>
                    </div>
                <div id="ao3h-hideByTags-nope-groups" class="ao3h-hbt-groups-panel"></div>
                </div><!-- /.ao3h-hbt-col-form -->

                <div class="ao3h-hbt-col-chips">
                <div id="ao3h-hideByTags-nope-list" class="ao3h-config-block"></div>
                </div><!-- /.ao3h-hbt-col-chips -->

                </div><!-- /.ao3h-hbt-two-col: NOPE Words -->

                <div id="ao3h-hideByTags-nope-below" class="ao3h-hbt-below-actions">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-nope" title="Import from JSON">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-nope" title="Export as JSON">Export</button>
                </div>

                <!-- ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
                     PLACEHOLDER SETTINGS — not yet wired to module
                     Preserved from auto-generated skeleton. Implement when needed.
                     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Data</div>
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Auto-backup</label>
                    <div class="ao3h-setting-control">
                        <label >
                            <input type="checkbox" data-setting="autoBackup">
                        </label>
                    </div>
                </div>
                </div><!-- /.ao3h-config-section: Data -->

                <!-- Footer: Save + Reset -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;


// ── Storage helpers ───────────────────────────────────────────────────────
// All reads/writes go through these; they gracefully degrade to localStorage
// in the preview (no AO3H runtime available).
// Étape 316 : UserLocalStorage importé directement (avant : lecture window.AO3H_Common,
// cassée côté Vite depuis le retrait de la pose à l'étape 314). Le bundler legacy
// (supprimé en Phase 27) remplaçait cet import par un shim window.
import { UserLocalStorage } from '../../../../storage/user.js';

const W  = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
const getNS = () => W.AO3H?.env?.NS || 'ao3h';

// Use UserLocalStorage when available — same as the module itself uses.
// This guarantees the panel reads/writes the exact same localStorage keys.
const getUserLS = () => UserLocalStorage || null;

function lsGet(key, fallback) {
  try {
    const UserLS = getUserLS();
    const v = UserLS ? UserLS.getJSON(key, null) : JSON.parse(localStorage.getItem(`${getNS()}:${key}`) || 'null');
    return v == null ? fallback : v;
  } catch { return fallback; }
}
function lsSet(key, val) {
  try {
    const UserLS = getUserLS();
    if (UserLS) {
      UserLS.setJSON(key, val);
    } else {
      localStorage.setItem(`${getNS()}:${key}`, JSON.stringify(val));
    }
  } catch {}
  // Also sync to GM storage so the live module filter sees the change immediately.
  W.AO3H?.store?.set?.(key, val);
}

const getHiddenTags    = ()  => lsGet('hideTags', []);
const saveHiddenTags   = (v) => lsSet('hideTags', [...new Set(v.map(s => s.trim().toLowerCase()).filter(Boolean))]);
const getGroupsMap     = ()  => lsGet('hideTagsGroups', {});
const saveGroupsMap    = (m) => lsSet('hideTagsGroups', m);
const getEmptyGroups   = ()  => lsGet('hideTagsEmptyGroups', []);
const saveEmptyGroups  = (v) => lsSet('hideTagsEmptyGroups', [...new Set(v.map(s => s.trim()).filter(Boolean))]);
const getWhitelistTags = ()  => lsGet('hideTagsWhitelist', []);
const saveWhitelistTags= (v) => lsSet('hideTagsWhitelist', [...new Set(v.map(s => s.trim().toLowerCase()).filter(Boolean))]);
const getNopeWords             = ()  => lsGet('hideTagsNope', []);
const saveNopeWords            = (v) => lsSet('hideTagsNope', [...new Set(v.map(s => s.trim().toLowerCase()).filter(Boolean))]);
const getWhitelistGroupsMap    = ()  => lsGet('hideTagsWhitelistGroups', {});
const saveWhitelistGroupsMap   = (m) => lsSet('hideTagsWhitelistGroups', m);
const getWhitelistEmptyGroups  = ()  => lsGet('hideTagsWhitelistEmptyGroups', []);
const saveWhitelistEmptyGroups = (v) => lsSet('hideTagsWhitelistEmptyGroups', [...new Set(v.map(s => s.trim()).filter(Boolean))]);
const getNopeGroupsMap         = ()  => lsGet('hideTagsNopeGroups', {});
const saveNopeGroupsMap        = (m) => lsSet('hideTagsNopeGroups', m);
const getNopeEmptyGroups       = ()  => lsGet('hideTagsNopeEmptyGroups', []);
const saveNopeEmptyGroups      = (v) => lsSet('hideTagsNopeEmptyGroups', [...new Set(v.map(s => s.trim()).filter(Boolean))]);

// ── Track expand state across re-renders ─────────────────────────────────
const expandedGroups          = new Set();
const expandedWhitelistGroups = new Set();
const expandedNopeGroups      = new Set();

// ── Update section title counts ──────────────────────────────────────────
function updateSectionCounts(container) {
  const hiddenEl = container.querySelector('#ao3h-hideByTags-count');
  const wlEl     = container.querySelector('#ao3h-hideByTags-whitelist-count');
  const nopeEl   = container.querySelector('#ao3h-hideByTags-nope-count');
  const hc = getHiddenTags().length;
  const wc = getWhitelistTags().length;
  const nc = getNopeWords().length;
  if (hiddenEl) hiddenEl.textContent = hc > 0 ? `${hc} hidden` : '';
  if (wlEl)     wlEl.textContent     = wc > 0 ? `${wc} exception${wc !== 1 ? 's' : ''}` : '';
  if (nopeEl)   nopeEl.textContent   = nc > 0 ? `${nc} word${nc !== 1 ? 's' : ''}` : '';
}

// ── Core: build the tag list from localStorage ───────────────────────────
function renderList(container) {
  const listEl = container.querySelector('#ao3h-hideByTags-list');
  if (!listEl) return;
  const groupsEl = container.querySelector('#ao3h-hideByTags-groups');

  const searchEl  = container.querySelector('#ao3h-hideByTags-search');
  const searchTerm = (searchEl?.value || '').trim().toLowerCase();

  const tags       = getHiddenTags();
  const groupsMap  = getGroupsMap();
  const emptyGrps  = getEmptyGroups();

  // Keep group select in sync
  {
    const currentVal = (container.querySelector('#ao3h-hideByTags-add-group') || {}).value || '';
    const allGroups = [...new Set([
      ...Object.values(groupsMap).map(g => (g || '').trim()).filter(Boolean),
      ...emptyGrps.map(g => (g || '').trim()).filter(Boolean),
    ])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    buildGroupSelect(container, 'ao3h-hideByTags-add-group', allGroups, currentVal);
  }

  // Filter
  const filteredTags = searchTerm
    ? tags.filter(t => t.includes(searchTerm) || (groupsMap[t] || '').toLowerCase().includes(searchTerm))
    : tags;
  const filteredEmpty = searchTerm
    ? emptyGrps.filter(g => g.toLowerCase().includes(searchTerm))
    : emptyGrps;

  if (filteredTags.length === 0 && filteredEmpty.length === 0) {
    listEl.innerHTML = `
      <div class="ao3h-hbt-empty-msg">
        ${tags.length === 0 && emptyGrps.length === 0
          ? 'No hidden tags yet.<br>Hover over a tag on any work listing and click 🚫 to hide it.'
          : 'No tags match your search.'}
      </div>`;
    if (groupsEl) groupsEl.innerHTML = '';
    return;
  }

  // Bucket by group
  const grouped = new Map();
  for (const t of filteredTags) {
    const g = (groupsMap[t] || '').trim() || '(ungrouped)';
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g).push(t);
  }
  for (const g of filteredEmpty) {
    if (!grouped.has(g)) grouped.set(g, []);
  }

  // Sort entries: ungrouped first, then alpha
  const entries = [...grouped.entries()].sort((a, b) => {
    if (a[0] === '(ungrouped)') return -1;
    if (b[0] === '(ungrouped)') return 1;
    return a[0].localeCompare(b[0], undefined, { sensitivity: 'base' });
  });
  for (const [, arr] of entries) arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const namedCount = entries.filter(([g]) => g !== '(ungrouped)').length;
  let countEl = container.querySelector('#ao3h-hideByTags-count');
  listEl.innerHTML = '';
  if (groupsEl) {
    groupsEl.innerHTML = '';
    if (namedCount > 0) {
      const inner = document.createElement('div');
      inner.className = 'ao3h-hbt-groups-inner';
      groupsEl.appendChild(inner);
    }
  }

  for (const [gname, gtags] of entries) {
    const isUngrouped = gname === '(ungrouped)';
    const isExpanded  = isUngrouped || expandedGroups.has(gname);

    const grpEl = document.createElement('div');
    grpEl.className = isUngrouped ? 'ao3h-hbt-group' : 'ao3h-hbt-group ao3h-hbt-group--named';
    grpEl.setAttribute('aria-expanded', String(isExpanded));

    if (!isUngrouped) {
      const header = document.createElement('div');
      header.className = 'ao3h-hbt-group-header';
      header.innerHTML = `
        <div class="ao3h-hbt-group-header-inner">
          <span class="ao3h-hbt-group-left">
            <span class="ao3h-hbt-chevron">▶</span>
            <span class="ao3h-hbt-group-label">${gname}</span>
          </span>
          <button type="button" class="ao3h-hbt-group-delete ao3h-inline-btn ao3h-inline-btn--danger" title="Delete group">×</button>
        </div>`;

      header.addEventListener('click', e => {
        if (e.target instanceof Element && e.target.closest('.ao3h-hbt-group-delete')) return;
        const open = grpEl.getAttribute('aria-expanded') === 'true';
        grpEl.setAttribute('aria-expanded', String(!open));
        open ? expandedGroups.delete(gname) : expandedGroups.add(gname);
      });

      header.querySelector('.ao3h-hbt-group-delete').addEventListener('click', e => {
        e.stopPropagation();
        // Remove all tags in this group from groupsMap
        const m = getGroupsMap();
        for (const t of gtags) delete m[t];
        saveGroupsMap(m);
        // Remove from emptyGroups too
        saveEmptyGroups(getEmptyGroups().filter(g => g !== gname));
        expandedGroups.delete(gname);
        renderList(container);
      });

      grpEl.appendChild(header);
    }

    const wrap = document.createElement('div');
    wrap.className = 'ao3h-hbt-group-wrap';

    const chipsEl = document.createElement('div');
    chipsEl.className = 'ao3h-tag-chips';
    for (const tag of gtags) chipsEl.appendChild(makeChip(tag, container));
    wrap.appendChild(chipsEl);

    const footer = document.createElement('div');
    footer.className = 'ao3h-hbt-footer';
    if (isUngrouped) {
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.id = 'ao3h-hideByTags-count';
      }
      countEl.className = 'ao3h-hbt-footer-text';
      footer.appendChild(countEl);
    } else {
      const footerText = document.createElement('span');
      footerText.className = 'ao3h-hbt-footer-text';
      footerText.textContent = `${gtags.length} tag${gtags.length !== 1 ? 's' : ''}`;
      footer.appendChild(footerText);
    }
    if (isUngrouped) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'ao3h-hbt-footer-clear';
      clearBtn.title = 'Clear all hidden tags';
      clearBtn.textContent = '🗑️';
      clearBtn.addEventListener('click', e => {
        e.preventDefault();
        if (!confirm('Clear all hidden tags?\nThis cannot be undone.')) return;
        saveHiddenTags([]); saveGroupsMap({}); saveEmptyGroups([]);
        renderList(container);
      });
      footer.appendChild(clearBtn);
    }
    if (isUngrouped) {
      grpEl.appendChild(wrap);
      grpEl.appendChild(footer);
    } else {
      wrap.appendChild(footer);
      grpEl.appendChild(wrap);
    }
    const groupsTarget = groupsEl?.querySelector('.ao3h-hbt-groups-inner') ?? null;
    (!isUngrouped && groupsTarget ? groupsTarget : listEl).appendChild(grpEl);
  }

  if (groupsEl && namedCount > 0) {
    const panelFooter = document.createElement('div');
    panelFooter.className = 'ao3h-hbt-footer';
    const footerText = document.createElement('span');
    footerText.className = 'ao3h-hbt-footer-text';
    footerText.textContent = `${namedCount} group${namedCount !== 1 ? 's' : ''}`;
    panelFooter.appendChild(footerText);
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'ao3h-hbt-footer-clear';
    clearBtn.title = 'Delete all groups';
    clearBtn.textContent = '\uD83D\uDDD1\uFE0F';
    clearBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!confirm('Delete all groups?\nTags will be kept but ungrouped.')) return;
      saveGroupsMap({});
      saveEmptyGroups([]);
      renderList(container);
    });
    panelFooter.appendChild(clearBtn);
    groupsEl.appendChild(panelFooter);
  }
  updateSectionCounts(container);
}

// ── Generic: render any grouped list (whitelist, nope, or hidden tags) ───
function renderGroupedList(container, cfg) {
  const listEl = container.querySelector(`#${cfg.listId}`);
  if (!listEl) return;
  const groupsEl = cfg.groupsId ? container.querySelector('#' + cfg.groupsId) : null;

  const tags      = cfg.getItems();
  const groupsMap = cfg.getGroupsMap();
  const emptyGrps = cfg.getEmptyGroups();

  if (cfg.groupSelectId) {
    const selEl = container.querySelector(`#${cfg.groupSelectId}`);
    const currentVal = selEl ? (selEl.value || '') : '';
    const allGroups = [...new Set([
      ...Object.values(groupsMap).map(g => (g || '').trim()).filter(Boolean),
      ...emptyGrps.map(g => (g || '').trim()).filter(Boolean),
    ])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    buildGroupSelect(container, cfg.groupSelectId, allGroups, currentVal);
  }

  if (tags.length === 0 && emptyGrps.length === 0) {
    listEl.innerHTML = `<div class="ao3h-hbt-empty-msg">${cfg.emptyFreshMsg}</div>`;
    if (groupsEl) groupsEl.innerHTML = '';
    return;
  }

  const grouped = new Map();
  for (const t of tags) {
    const g = (groupsMap[t] || '').trim() || '(ungrouped)';
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g).push(t);
  }
  for (const g of emptyGrps) { if (!grouped.has(g)) grouped.set(g, []); }

  const entries = [...grouped.entries()].sort((a, b) => {
    if (a[0] === '(ungrouped)') return -1;
    if (b[0] === '(ungrouped)') return 1;
    return a[0].localeCompare(b[0], undefined, { sensitivity: 'base' });
  });
  for (const [, arr] of entries) arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const namedCount = entries.filter(([g]) => g !== '(ungrouped)').length;
  let countEl = cfg.countId ? container.querySelector('#' + cfg.countId) : null;
  listEl.innerHTML = '';
  if (groupsEl) {
    groupsEl.innerHTML = '';
    if (namedCount > 0) {
      const inner = document.createElement('div');
      inner.className = 'ao3h-hbt-groups-inner';
      groupsEl.appendChild(inner);
    }
  }
  for (const [gname, gtags] of entries) {
    const isUngrouped = gname === '(ungrouped)';
    const isExpanded  = isUngrouped || cfg.expandedSet.has(gname);
    const grpEl = document.createElement('div');
    grpEl.className = isUngrouped ? 'ao3h-hbt-group' : 'ao3h-hbt-group ao3h-hbt-group--named';
    grpEl.setAttribute('aria-expanded', String(isExpanded));

    if (!isUngrouped) {
      const header = document.createElement('div');
      header.className = 'ao3h-hbt-group-header';
      header.innerHTML = `
        <div class="ao3h-hbt-group-header-inner">
          <span class="ao3h-hbt-group-left">
            <span class="ao3h-hbt-chevron">▶</span>
            <span class="ao3h-hbt-group-label">${gname}</span>
          </span>
          <button type="button" class="ao3h-hbt-group-delete ao3h-inline-btn ao3h-inline-btn--danger" title="Delete group">×</button>
        </div>`;
      header.addEventListener('click', e => {
        if (e.target instanceof Element && e.target.closest('.ao3h-hbt-group-delete')) return;
        const open = grpEl.getAttribute('aria-expanded') === 'true';
        grpEl.setAttribute('aria-expanded', String(!open));
        open ? cfg.expandedSet.delete(gname) : cfg.expandedSet.add(gname);
      });
      header.querySelector('.ao3h-hbt-group-delete').addEventListener('click', e => {
        e.stopPropagation();
        const m = cfg.getGroupsMap();
        for (const t of gtags) delete m[t];
        cfg.saveGroupsMap(m);
        cfg.saveEmptyGroups(cfg.getEmptyGroups().filter(g => g !== gname));
        cfg.expandedSet.delete(gname);
        cfg.rerenderFn(container);
      });
      grpEl.appendChild(header);
    }

    const wrap = document.createElement('div');
    wrap.className = 'ao3h-hbt-group-wrap';
    const chipsEl = document.createElement('div');
    chipsEl.className = 'ao3h-tag-chips';
    for (const tag of gtags) chipsEl.appendChild(cfg.makeChipFn(tag, container));
    wrap.appendChild(chipsEl);
    const footer = document.createElement('div');
    footer.className = 'ao3h-hbt-footer';
    if (isUngrouped && cfg.countId) {
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.id = cfg.countId;
      }
      countEl.className = 'ao3h-hbt-footer-text';
      footer.appendChild(countEl);
    } else {
      const footerText = document.createElement('span');
      footerText.className = 'ao3h-hbt-footer-text';
      footerText.textContent = `${gtags.length} tag${gtags.length !== 1 ? 's' : ''}`;
      footer.appendChild(footerText);
    }
    if (isUngrouped && cfg.clearFn) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'ao3h-hbt-footer-clear';
      clearBtn.title = `Clear all ${cfg.label}s`;
      clearBtn.textContent = '🗑️';
      clearBtn.addEventListener('click', e => {
        e.preventDefault();
        if (!confirm(cfg.clearMsg || `Clear all ${cfg.label}s?\nThis cannot be undone.`)) return;
        cfg.clearFn();
        cfg.rerenderFn(container);
      });
      footer.appendChild(clearBtn);
    }
    if (isUngrouped) {
      grpEl.appendChild(wrap);
      grpEl.appendChild(footer);
    } else {
      wrap.appendChild(footer);
      grpEl.appendChild(wrap);
    }
    const groupsTarget = groupsEl?.querySelector('.ao3h-hbt-groups-inner') ?? null;
    (!isUngrouped && groupsTarget ? groupsTarget : listEl).appendChild(grpEl);
  }

  if (groupsEl && namedCount > 0) {
    const panelFooter = document.createElement('div');
    panelFooter.className = 'ao3h-hbt-footer';
    const footerText = document.createElement('span');
    footerText.className = 'ao3h-hbt-footer-text';
    footerText.textContent = `${namedCount} group${namedCount !== 1 ? 's' : ''}`;
    panelFooter.appendChild(footerText);
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'ao3h-hbt-footer-clear';
    clearBtn.title = 'Delete all groups';
    clearBtn.textContent = '\uD83D\uDDD1\uFE0F';
    clearBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!confirm('Delete all groups?\nTags will be kept but ungrouped.')) return;
      cfg.saveGroupsMap({});
      cfg.saveEmptyGroups([]);
      cfg.rerenderFn(container);
    });
    panelFooter.appendChild(clearBtn);
    groupsEl.appendChild(panelFooter);
  }
}

function renderWhitelistList(container) {
  renderGroupedList(container, {

    listId: 'ao3h-hideByTags-whitelist-list', groupsId: 'ao3h-hideByTags-whitelist-groups', groupSelectId: 'ao3h-hideByTags-whitelist-add-group', countId: 'ao3h-hideByTags-whitelist-count',
    getItems: getWhitelistTags, getGroupsMap: getWhitelistGroupsMap, saveGroupsMap: saveWhitelistGroupsMap,
    getEmptyGroups: getWhitelistEmptyGroups, saveEmptyGroups: saveWhitelistEmptyGroups,
    expandedSet: expandedWhitelistGroups, emptyFreshMsg: 'No whitelist exceptions yet.', label: 'exception',
    clearFn: () => { saveWhitelistTags([]); saveWhitelistGroupsMap({}); saveWhitelistEmptyGroups([]); },
    clearMsg: 'Clear all whitelist exceptions?\nThis cannot be undone.',

    makeChipFn: (tag, c) => makeGroupedChip(tag, c, {
      getItems: getWhitelistTags, saveItems: saveWhitelistTags,
      getGroupsMap: getWhitelistGroupsMap, saveGroupsMap: saveWhitelistGroupsMap,
      getEmptyGroups: getWhitelistEmptyGroups, saveEmptyGroups: saveWhitelistEmptyGroups,
      expandedSet: expandedWhitelistGroups, rerenderFn: renderWhitelistList,
    }),
    rerenderFn: renderWhitelistList,
  });
  updateSectionCounts(container);
}

function renderNopeList(container) {
  renderGroupedList(container, {
    listId: 'ao3h-hideByTags-nope-list', groupsId: 'ao3h-hideByTags-nope-groups', groupSelectId: 'ao3h-hideByTags-nope-add-group', countId: 'ao3h-hideByTags-nope-count',
    getItems: getNopeWords, getGroupsMap: getNopeGroupsMap, saveGroupsMap: saveNopeGroupsMap,
    getEmptyGroups: getNopeEmptyGroups, saveEmptyGroups: saveNopeEmptyGroups,
    expandedSet: expandedNopeGroups, emptyFreshMsg: 'No NOPE words yet.', label: 'word',
    clearFn: () => { saveNopeWords([]); saveNopeGroupsMap({}); saveNopeEmptyGroups([]); },
    clearMsg: 'Clear all NOPE words?\nThis cannot be undone.',

    makeChipFn: (tag, c) => makeGroupedChip(tag, c, {
      getItems: getNopeWords, saveItems: saveNopeWords,
      getGroupsMap: getNopeGroupsMap, saveGroupsMap: saveNopeGroupsMap,
      getEmptyGroups: getNopeEmptyGroups, saveEmptyGroups: saveNopeEmptyGroups,
      expandedSet: expandedNopeGroups, rerenderFn: renderNopeList,
    }),
    rerenderFn: renderNopeList,
  });
  updateSectionCounts(container);
}

// ── Generic chip with group picker (whitelist / NOPE sections) ───────────────
// sectionCfg: { getItems, saveItems, getGroupsMap, saveGroupsMap,
//               getEmptyGroups, saveEmptyGroups, expandedSet, rerenderFn }
function makeGroupedChip(tag, container, sectionCfg) {
  const chip = document.createElement('span');
  chip.className = 'ao3h-tag-chip';
  const txt = document.createElement('span');
  txt.className = 'ao3h-tag-chip-text';
  txt.textContent = tag; txt.title = tag;
  const groupBtn = document.createElement('button');
  groupBtn.type = 'button'; groupBtn.className = 'ao3h-tag-chip-group';
  groupBtn.title = 'Change group'; groupBtn.textContent = '📁';
  groupBtn.addEventListener('click', e => {
    e.stopPropagation();
    openGroupPickerFor(groupBtn, tag, container, sectionCfg);
  });
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button'; removeBtn.className = 'ao3h-tag-chip-remove';
  removeBtn.title = 'Remove'; removeBtn.textContent = '×';
  removeBtn.addEventListener('click', e => {
    e.stopPropagation();
    sectionCfg.saveItems(sectionCfg.getItems().filter(t => t !== tag));
    const m = sectionCfg.getGroupsMap(); delete m[tag]; sectionCfg.saveGroupsMap(m);
    sectionCfg.rerenderFn(container);
  });
  chip.append(txt, groupBtn, removeBtn);
  return chip;
}

// ── Build one tag chip ────────────────────────────────────────────────────
function makeChip(tag, container) {
  const chip = document.createElement('span');
  chip.className = 'ao3h-tag-chip';

  const txt = document.createElement('span');
  txt.className = 'ao3h-tag-chip-text';
  txt.textContent = tag;
  txt.title = tag;

  const groupBtn = document.createElement('button');
  groupBtn.type = 'button';
  groupBtn.className = 'ao3h-tag-chip-group';
  groupBtn.title = 'Change group';
  groupBtn.textContent = '📁';
  groupBtn.addEventListener('click', e => {
    e.stopPropagation();
    openGroupPicker(groupBtn, tag, container);
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'ao3h-tag-chip-remove';
  removeBtn.title = 'Remove';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', e => {
    e.stopPropagation();
    const tags = getHiddenTags().filter(t => t !== tag);
    saveHiddenTags(tags);
    const m = getGroupsMap(); delete m[tag]; saveGroupsMap(m);
    renderList(container);
  });

  chip.append(txt, groupBtn, removeBtn);
  return chip;
}
// ── Generic group picker (whitelist / NOPE) ───────────────────────────────────
function openGroupPickerFor(anchorBtn, currentTag, container, sectionCfg) {
  document.querySelectorAll('.ao3h-hbt-group-picker--floating').forEach(p => p.remove());
  const m            = sectionCfg.getGroupsMap();
  const currentGroup = (m[currentTag] || '').trim();
  const emptyGrps    = sectionCfg.getEmptyGroups();
  const groups = [...new Set([
    ...Object.values(m).map(g => (g || '').trim()).filter(Boolean),
    ...emptyGrps.map(g => (g || '').trim()).filter(Boolean),
  ])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const pop = document.createElement('div');
  pop.className = 'ao3h-hbt-group-picker ao3h-hbt-group-picker--floating';
  pop.innerHTML = `
    <div class="ao3h-hbt-gp-title">Move to group</div>
    <div class="ao3h-hbt-gp-hint">click to move instantly</div>
    <div class="ao3h-hbt-gp-list">
      ${groups.map(g => `<div class="ao3h-hbt-gp-item${g === currentGroup ? ' ao3h-hbt-gp-item--current' : ''}" data-group="${g.replace(/"/g, '&quot;')}">${g}</div>`).join('')}
    </div>
    <div class="ao3h-hbt-gp-actions">
      <button class="ao3h-inline-btn ao3h-inline-btn--danger ao3h-hbt-gp-ungroup">✕ Ungroup</button>
      <div class="ao3h-hbt-gp-input-row">
        <input class="ao3h-hbt-gp-input" type="text" placeholder="Create new group…">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-hbt-gp-add">+</button>
      </div>
    </div>
    <button class="ao3h-inline-btn ao3h-hbt-gp-close">Close</button>`;
  document.body.appendChild(pop);
  const r = anchorBtn.getBoundingClientRect();
  Object.assign(pop.style, { position: 'fixed', zIndex: '1000000', left: `${r.left}px`, top: `${r.bottom + 4}px` });
  requestAnimationFrame(() => {
    const pr = pop.getBoundingClientRect();
    if (pr.right  > window.innerWidth  - 8) pop.style.left = `${window.innerWidth  - pr.width  - 8}px`;
    if (pr.bottom > window.innerHeight - 8) pop.style.top  = `${r.top - pr.height - 4}px`;
  });
  function close() { pop.remove(); document.removeEventListener('click', outsideClose, true); }
  function outsideClose(e) { if (!pop.contains(e.target) && e.target !== anchorBtn) close(); }
  setTimeout(() => document.addEventListener('click', outsideClose, true), 0);
  function moveTag(groupName) {
    const map = sectionCfg.getGroupsMap();
    if (groupName) map[currentTag] = groupName; else delete map[currentTag];
    sectionCfg.saveGroupsMap(map);
    if (groupName) sectionCfg.saveEmptyGroups(sectionCfg.getEmptyGroups().filter(g => g !== groupName));
    close();
    sectionCfg.rerenderFn(container);
  }
  pop.querySelectorAll('.ao3h-hbt-gp-item').forEach(item => item.addEventListener('click', () => moveTag(item.dataset.group)));
  const input  = pop.querySelector('.ao3h-hbt-gp-input');
  const addBtn = pop.querySelector('.ao3h-hbt-gp-add');
  function addNewGroup() { const val = input.value.trim(); if (val) moveTag(val); }
  addBtn.addEventListener('click', addNewGroup);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addNewGroup(); } });
  pop.querySelector('.ao3h-hbt-gp-ungroup').addEventListener('click', () => moveTag(''));
  pop.querySelector('.ao3h-hbt-gp-close').addEventListener('click', close);
  input.focus();
}
// ── Group picker popover ──────────────────────────────────────────────────
function openGroupPicker(anchorBtn, currentTag, container) {
  document.querySelectorAll('.ao3h-hbt-group-picker--floating').forEach(p => p.remove());

  const m            = getGroupsMap();
  const currentGroup = (m[currentTag] || '').trim();
  const emptyGrps    = getEmptyGroups();
  const groups = [...new Set([
    ...Object.values(m).map(g => (g || '').trim()).filter(Boolean),
    ...emptyGrps.map(g => (g || '').trim()).filter(Boolean),
  ])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const pop = document.createElement('div');
  pop.className = 'ao3h-hbt-group-picker ao3h-hbt-group-picker--floating';
  pop.innerHTML = `
    <div class="ao3h-hbt-gp-title">Move to group</div>
    <div class="ao3h-hbt-gp-hint">click to move instantly</div>
    <div class="ao3h-hbt-gp-list">
      ${groups.map(g => `<div class="ao3h-hbt-gp-item${g === currentGroup ? ' ao3h-hbt-gp-item--current' : ''}"
        data-group="${g.replace(/"/g, '&quot;')}">${g}</div>`).join('')}
    </div>
    <div class="ao3h-hbt-gp-actions">
      <button class="ao3h-inline-btn ao3h-inline-btn--danger ao3h-hbt-gp-ungroup">✕ Ungroup</button>
      <div class="ao3h-hbt-gp-input-row">
        <input class="ao3h-hbt-gp-input" type="text" placeholder="Create new group…">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-hbt-gp-add">+</button>
      </div>
    </div>
    <button class="ao3h-inline-btn ao3h-hbt-gp-close">Close</button>`;

  document.body.appendChild(pop);

  const r = anchorBtn.getBoundingClientRect();
  Object.assign(pop.style, { position: 'fixed', zIndex: '1000000',
    left: `${r.left}px`, top: `${r.bottom + 4}px` });
  requestAnimationFrame(() => {
    const pr = pop.getBoundingClientRect();
    if (pr.right  > window.innerWidth  - 8) pop.style.left = `${window.innerWidth  - pr.width  - 8}px`;
    if (pr.bottom > window.innerHeight - 8) pop.style.top  = `${r.top - pr.height - 4}px`;
  });

  function close() { pop.remove(); document.removeEventListener('click', outsideClose, true); }
  function outsideClose(e) { if (!pop.contains(e.target) && e.target !== anchorBtn) close(); }
  setTimeout(() => document.addEventListener('click', outsideClose, true), 0);

  function moveTag(groupName) {
    const map = getGroupsMap();
    if (groupName) map[currentTag] = groupName;
    else delete map[currentTag];
    saveGroupsMap(map);
    // Remove from emptyGroups if this group now has a tag
    if (groupName) saveEmptyGroups(getEmptyGroups().filter(g => g !== groupName));
    close();
    renderList(container);
  }

  pop.querySelectorAll('.ao3h-hbt-gp-item').forEach(item =>
    item.addEventListener('click', () => moveTag(item.dataset.group))
  );

  const input  = pop.querySelector('.ao3h-hbt-gp-input');
  const addBtn = pop.querySelector('.ao3h-hbt-gp-add');
  function addNewGroup() { const val = input.value.trim(); if (val) moveTag(val); }
  addBtn.addEventListener('click', addNewGroup);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addNewGroup(); } });

  pop.querySelector('.ao3h-hbt-gp-ungroup').addEventListener('click', () => moveTag(''));
  pop.querySelector('.ao3h-hbt-gp-close').addEventListener('click', close);
  input.focus();
}

// ── Custom group dropdown (replaces native <select> for full styling) ──────
function buildGroupSelect(container, selectId, groups, currentVal) {
  const hiddenSel = container.querySelector(`#${selectId}`);
  if (!hiddenSel) return;

  // Hide the native select but keep it for value/event read
  hiddenSel.style.display = 'none';

  const wrapperId = `${selectId}-custom`;
  let wrapper = container.querySelector(`#${wrapperId}`);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'ao3h-group-select';
    wrapper.id = wrapperId;
    // Match the flex sizing of the hidden select
    const hs = hiddenSel.style;
    if (hs.flex)     wrapper.style.flex     = hs.flex;
    if (hs.minWidth) wrapper.style.minWidth = hs.minWidth;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ao3h-group-select__trigger ao3h-config-input';

    const panel = document.createElement('div');
    panel.className = 'ao3h-group-select__panel';
    panel.hidden = true;

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.ao3h-group-select__panel').forEach(p => {
        if (p !== panel) p.hidden = true;
      });
      panel.hidden = !panel.hidden;
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
    hiddenSel.insertAdjacentElement('afterend', wrapper);

    if (!wrapper.dataset.outsideWired) {
      wrapper.dataset.outsideWired = '1';
      document.addEventListener('click', () => { panel.hidden = true; });
    }
  }

  const trigger = wrapper.querySelector('.ao3h-group-select__trigger');
  const panel   = wrapper.querySelector('.ao3h-group-select__panel');

  function selectOption(value) {
    hiddenSel.value = value;
    trigger.textContent = value === '__new__' ? '+ New group'
      : value ? value
      : 'Group (optional)';
    trigger.classList.toggle('ao3h-group-select__trigger--active', !!value);
    panel.querySelectorAll('.ao3h-group-select__option').forEach(
      d => d.classList.toggle('ao3h-group-select__option--selected', d.dataset.value === value)
    );
    hiddenSel.dispatchEvent(new Event('change'));
  }

  // Rebuild option list
  panel.innerHTML = '';
  for (const opt of [{ value: '', label: 'Group (optional)' }, ...groups.map(g => ({ value: g, label: g }))]) {
    const div = document.createElement('div');
    div.className = 'ao3h-group-select__option' + (opt.value === currentVal ? ' ao3h-group-select__option--selected' : '');
    div.textContent = opt.label;
    div.dataset.value = opt.value;
    div.addEventListener('click', () => { selectOption(opt.value); panel.hidden = true; });
    panel.appendChild(div);
  }
  const newDiv = document.createElement('div');
  newDiv.className = 'ao3h-group-select__option ao3h-group-select__option--new' +
    (currentVal === '__new__' ? ' ao3h-group-select__option--selected' : '');
  newDiv.textContent = '+ New group';
  newDiv.dataset.value = '__new__';
  newDiv.addEventListener('click', () => { selectOption('__new__'); panel.hidden = true; });
  panel.appendChild(newDiv);

  // Restore trigger label from current value
  trigger.textContent = currentVal === '__new__' ? '+ New group'
    : currentVal ? currentVal
    : 'Group (optional)';
  trigger.classList.toggle('ao3h-group-select__trigger--active', !!currentVal);
}

// ── Defaults written to localStorage on first open ───────────────────────
const SETTINGS_DEFAULTS = {
  _v:                   2,
  enabled:              true,
  quickAddIcon:         true,
  showHiddenCounter:    true,
  hideMode:             'hide',
  tagMatchMode:         'exact',
  whitelistEnabled:     true,
  showWhitelistBadge:   true,
  whitelistMode:        'show',
  textFilterEnabled:    true,
  nopeHideMode:         'hide',
  nopeWholeWords:       false,
  nopeTargetSummaries:  true,
  nopeTargetNotes:      true,
  nopeTargetTitles:     false,
  dimOpacity:           25,
  dimBlur:              false,
  protectBookmarked:    false,
  hideNoiseTaggedWorks: false,
};

function ensureSettingsDefaults () {
  try {
    const key = `${getNS()}:mod:hideByTags:settings`;
    const raw = localStorage.getItem(key);
    const cur = raw ? JSON.parse(raw) : null;
    if (!cur || typeof cur !== 'object') {
      localStorage.setItem(key, JSON.stringify(SETTINGS_DEFAULTS));
      W.AO3H?.store?.set?.('mod:hideByTags:settings', SETTINGS_DEFAULTS);
      return;
    }
    // Migration v1→v2: fix wrong defaults that disabled whitelist and NOPE words
    if (!cur._v || cur._v < 2) {
      if (cur.whitelistEnabled === false) cur.whitelistEnabled = true;
      if (cur.textFilterEnabled === false) cur.textFilterEnabled = true;
      cur._v = 2;
      localStorage.setItem(key, JSON.stringify(cur));
      W.AO3H?.store?.set?.('mod:hideByTags:settings', cur);
    }
  } catch {}
}

// ── Wire the add-tag / add-group / search inputs then render ─────────────
function wireConfigArea(container) {
  ensureSettingsDefaults();
  // Render from real data first (replaces static demo HTML)
  renderList(container);

  // ── Section disable helpers ────────────────────────────────────────────
  const moduleRow    = container.closest('.ao3h-module-row') || container.closest('[data-module]');
  const moduleToggle = moduleRow?.querySelector('input[type="checkbox"].ao3h-module-toggle, .ao3h-module-enable-toggle input');

  const enabledCb      = container.querySelector('[data-setting="enabled"]');
  const wlEnabledCb    = container.querySelector('[data-setting="whitelistEnabled"]');
  const nopeEnabledCb  = container.querySelector('[data-setting="textFilterEnabled"]');

  const sectionBody    = container.querySelector('#ao3h-hideByTags-section-body');
  const hiddenBelow    = container.querySelector('#ao3h-hideByTags-below');
  const wlBody         = container.querySelector('#ao3h-hideByTags-whitelist-body');
  const nopeBody       = container.querySelector('#ao3h-hideByTags-nope-body');
  const wlBehavior     = container.querySelector('#ao3h-hideByTags-whitelist-behavior');
  const nopeBehavior   = container.querySelector('#ao3h-hideByTags-nope-behavior');
  const wlBelow        = container.querySelector('#ao3h-hideByTags-whitelist-below');
  const nopeBelow      = container.querySelector('#ao3h-hideByTags-nope-below');

  function setDisabled(el, disabled) { el?.classList.toggle('ao3h-section-disabled', disabled); }

  function syncAllDisabled() {
    const tagOff  = !enabledCb?.checked;
    const wlOff   = !wlEnabledCb?.checked;
    const nopeOff = !nopeEnabledCb?.checked;

    setDisabled(sectionBody,  tagOff);
    setDisabled(hiddenBelow, tagOff);
    const quickAddLabel = container.querySelector('[data-setting="quickAddIcon"]')?.closest('label');
    setDisabled(quickAddLabel, tagOff);

    const wlBadgeLabel = container.querySelector('[data-setting="showWhitelistBadge"]')?.closest('label');
    setDisabled(wlBadgeLabel, wlOff);
    setDisabled(wlBody,   wlOff);
    setDisabled(wlBehavior, wlOff);
    setDisabled(wlBelow, wlOff);
    setDisabled(nopeBody, nopeOff);
    setDisabled(nopeBehavior, nopeOff);
    setDisabled(nopeBelow, nopeOff);

    // Auto-disable the module if all three are off
    if (moduleToggle) {
      const allOff = tagOff && wlOff && nopeOff;
      if (allOff && moduleToggle.checked) {
        moduleToggle.checked = false;
        moduleToggle.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (!allOff && !moduleToggle.checked) {
        moduleToggle.checked = true;
        moduleToggle.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  for (const cb of [enabledCb, wlEnabledCb, nopeEnabledCb]) {
    if (cb && !cb.dataset.disableWired) {
      cb.dataset.disableWired = '1';
      cb.addEventListener('change', syncAllDisabled);
    }
  }
  syncAllDisabled();

  // Search
  const searchEl = container.querySelector('#ao3h-hideByTags-search');
  if (searchEl && !searchEl.dataset.wired) {
    searchEl.dataset.wired = '1';
    let t; searchEl.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => renderList(container), 150); });
  }

  // Add tag row
  const addInput     = container.querySelector('#ao3h-hideByTags-add-input');
  const addGroup     = container.querySelector('#ao3h-hideByTags-add-group');
  const addGroupText = container.querySelector('#ao3h-hideByTags-add-group-text');
  const addBtn       = container.querySelector('[data-action="add-tag"]');
  function doAddTag() {
    const tag   = (addInput?.value || '').trim().toLowerCase();
    const group = addGroup?.value === '__new__'
      ? (addGroupText?.value || '').trim()
      : (addGroup?.value || '').trim();
    if (!tag) return;
    const tags = getHiddenTags();
    if (!tags.includes(tag)) { tags.push(tag); saveHiddenTags(tags); }
    if (group) {
      const m = getGroupsMap(); m[tag] = group; saveGroupsMap(m);
      saveEmptyGroups(getEmptyGroups().filter(g => g !== group));
    }
    if (addInput) addInput.value = '';
    if (addGroup?.value === '__new__') {
      if (addGroupText) { addGroupText.value = ''; addGroupText.style.display = 'none'; }
      if (addGroup) addGroup.value = '';
    }
    renderList(container);
  }
  if (addGroup && !addGroup.dataset.wired) {
    addGroup.dataset.wired = '1';
    addGroup.addEventListener('change', () => {
      if (!addGroupText) return;
      const isNew = addGroup.value === '__new__';
      addGroupText.style.display = isNew ? 'block' : 'none';
      if (isNew) addGroupText.focus();
    });
  }
  if (addGroupText && !addGroupText.dataset.wired) {
    addGroupText.dataset.wired = '1';
    addGroupText.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddTag(); } });
  }
  if (addInput && !addInput.dataset.wired) {
    addInput.dataset.wired = '1';
    addInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddTag(); } });
  }
  if (addBtn && !addBtn.dataset.wired) {
    addBtn.dataset.wired = '1';
    addBtn.addEventListener('click', e => { e.preventDefault(); doAddTag(); });
  }

  // Whitelist grouped list
  renderWhitelistList(container);

  // NOPE grouped list
  renderNopeList(container);

  // Add whitelist tag
  const wlInput     = container.querySelector('#ao3h-hideByTags-whitelist-add-input');
  const wlGroup     = container.querySelector('#ao3h-hideByTags-whitelist-add-group');
  const wlGroupText = container.querySelector('#ao3h-hideByTags-whitelist-add-group-text');
  const wlBtn       = container.querySelector('[data-action="add-whitelist-tag"]');
  function doAddWhitelist() {
    const tag   = (wlInput?.value || '').trim().toLowerCase();
    const group = wlGroup?.value === '__new__'
      ? (wlGroupText?.value || '').trim()
      : (wlGroup?.value || '').trim();
    if (!tag) return;
    const list = getWhitelistTags();
    if (!list.includes(tag)) { list.push(tag); saveWhitelistTags(list); }
    if (group) {
      const m = getWhitelistGroupsMap(); m[tag] = group; saveWhitelistGroupsMap(m);
      saveWhitelistEmptyGroups(getWhitelistEmptyGroups().filter(g => g !== group));
    }
    if (wlInput) wlInput.value = '';
    if (wlGroup?.value === '__new__') {
      if (wlGroupText) { wlGroupText.value = ''; wlGroupText.style.display = 'none'; }
      if (wlGroup) wlGroup.value = '';
    }
    renderWhitelistList(container);
  }
  if (wlGroup && !wlGroup.dataset.wired) {
    wlGroup.dataset.wired = '1';
    wlGroup.addEventListener('change', () => {
      if (!wlGroupText) return;
      const isNew = wlGroup.value === '__new__';
      wlGroupText.style.display = isNew ? 'block' : 'none';
      if (isNew) wlGroupText.focus();
    });
  }
  if (wlGroupText && !wlGroupText.dataset.wired) {
    wlGroupText.dataset.wired = '1';
    wlGroupText.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddWhitelist(); } });
  }
  if (wlInput && !wlInput.dataset.wired) {
    wlInput.dataset.wired = '1';
    wlInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddWhitelist(); } });
  }
  if (wlBtn && !wlBtn.dataset.wired) {
    wlBtn.dataset.wired = '1';
    wlBtn.addEventListener('click', e => { e.preventDefault(); doAddWhitelist(); });
  }

  // Clear whitelist — handler wired inline at button creation in renderGroupedList()

  // Add whitelist group
  const wlNewGroupInput = container.querySelector('#ao3h-hideByTags-whitelist-new-group');
  const wlNewGroupBtn   = container.querySelector('[data-action="add-whitelist-group"]');
  function doAddWhitelistGroup() {
    const name = (wlNewGroupInput?.value || '').trim();
    if (!name) return;
    const eg = getWhitelistEmptyGroups();
    if (!eg.includes(name)) { eg.push(name); saveWhitelistEmptyGroups(eg); }
    expandedWhitelistGroups.add(name);
    if (wlNewGroupInput) wlNewGroupInput.value = '';
    renderWhitelistList(container);
  }
  if (wlNewGroupInput && !wlNewGroupInput.dataset.wired) {
    wlNewGroupInput.dataset.wired = '1';
    wlNewGroupInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddWhitelistGroup(); } });
  }
  if (wlNewGroupBtn && !wlNewGroupBtn.dataset.wired) {
    wlNewGroupBtn.dataset.wired = '1';
    wlNewGroupBtn.addEventListener('click', e => { e.preventDefault(); doAddWhitelistGroup(); });
  }

  // Add NOPE word
  const nopeInput     = container.querySelector('#ao3h-hideByTags-nope-add-input');
  const nopeGroup     = container.querySelector('#ao3h-hideByTags-nope-add-group');
  const nopeGroupText = container.querySelector('#ao3h-hideByTags-nope-add-group-text');
  const nopeBtn       = container.querySelector('[data-action="add-nope-word"]');
  function doAddNope() {
    const word  = (nopeInput?.value || '').trim().toLowerCase();
    const group = nopeGroup?.value === '__new__'
      ? (nopeGroupText?.value || '').trim()
      : (nopeGroup?.value || '').trim();
    if (!word) return;
    const list = getNopeWords();
    if (!list.includes(word)) { list.push(word); saveNopeWords(list); }
    if (group) {
      const m = getNopeGroupsMap(); m[word] = group; saveNopeGroupsMap(m);
      saveNopeEmptyGroups(getNopeEmptyGroups().filter(g => g !== group));
    }
    if (nopeInput) nopeInput.value = '';
    if (nopeGroup?.value === '__new__') {
      if (nopeGroupText) { nopeGroupText.value = ''; nopeGroupText.style.display = 'none'; }
      if (nopeGroup) nopeGroup.value = '';
    }
    renderNopeList(container);
  }
  if (nopeGroup && !nopeGroup.dataset.wired) {
    nopeGroup.dataset.wired = '1';
    nopeGroup.addEventListener('change', () => {
      if (!nopeGroupText) return;
      const isNew = nopeGroup.value === '__new__';
      nopeGroupText.style.display = isNew ? 'block' : 'none';
      if (isNew) nopeGroupText.focus();
    });
  }
  if (nopeGroupText && !nopeGroupText.dataset.wired) {
    nopeGroupText.dataset.wired = '1';
    nopeGroupText.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddNope(); } });
  }
  if (nopeInput && !nopeInput.dataset.wired) {
    nopeInput.dataset.wired = '1';
    nopeInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddNope(); } });
  }
  if (nopeBtn && !nopeBtn.dataset.wired) {
    nopeBtn.dataset.wired = '1';
    nopeBtn.addEventListener('click', e => { e.preventDefault(); doAddNope(); });
  }

  // Clear NOPE words — handler wired inline at button creation in renderGroupedList()

  // Add NOPE group
  const nopeNewGroupInput = container.querySelector('#ao3h-hideByTags-nope-new-group');
  const nopeNewGroupBtn   = container.querySelector('[data-action="add-nope-group"]');
  function doAddNopeGroup() {
    const name = (nopeNewGroupInput?.value || '').trim();
    if (!name) return;
    const eg = getNopeEmptyGroups();
    if (!eg.includes(name)) { eg.push(name); saveNopeEmptyGroups(eg); }
    expandedNopeGroups.add(name);
    if (nopeNewGroupInput) nopeNewGroupInput.value = '';
    renderNopeList(container);
  }
  if (nopeNewGroupInput && !nopeNewGroupInput.dataset.wired) {
    nopeNewGroupInput.dataset.wired = '1';
    nopeNewGroupInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddNopeGroup(); } });
  }
  if (nopeNewGroupBtn && !nopeNewGroupBtn.dataset.wired) {
    nopeNewGroupBtn.dataset.wired = '1';
    nopeNewGroupBtn.addEventListener('click', e => { e.preventDefault(); doAddNopeGroup(); });
  }

  // ── Export / Import helpers ────────────────────────────────────────────
  function doExportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function doImportJSON(onData) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.addEventListener('change', () => {
      const file = inp.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (typeof reader.result !== 'string') throw new TypeError('Expected a text file');
          onData(JSON.parse(reader.result));
        } catch {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    });
    inp.click();
  }

  // Export All (tags + groups)
  const exportAllBtn = container.querySelector('[data-action="export-all"]');
  if (exportAllBtn && !exportAllBtn.dataset.wired) {
    exportAllBtn.dataset.wired = '1';
    exportAllBtn.addEventListener('click', e => {
      e.preventDefault();
      doExportJSON({ tags: getHiddenTags(), groups: getGroupsMap(), emptyGroups: getEmptyGroups() }, 'ao3h-hidden-tags.json');
    });
  }

  // Import All (tags + groups)
  const importAllBtn = container.querySelector('[data-action="import-all"]');
  if (importAllBtn && !importAllBtn.dataset.wired) {
    importAllBtn.dataset.wired = '1';
    importAllBtn.addEventListener('click', e => {
      e.preventDefault();
      doImportJSON(data => {
        if (data.tags)        saveHiddenTags(data.tags);
        if (data.groups)      saveGroupsMap(data.groups);
        if (data.emptyGroups) saveEmptyGroups(data.emptyGroups);
        renderList(container);
      });
    });
  }

  // Export Whitelist
  const exportWlBtn = container.querySelector('[data-action="export-whitelist"]');
  if (exportWlBtn && !exportWlBtn.dataset.wired) {
    exportWlBtn.dataset.wired = '1';
    exportWlBtn.addEventListener('click', e => { e.preventDefault(); doExportJSON({ tags: getWhitelistTags(), groups: getWhitelistGroupsMap(), emptyGroups: getWhitelistEmptyGroups() }, 'ao3h-whitelist.json'); });
  }

  // Import Whitelist
  const importWlBtn = container.querySelector('[data-action="import-whitelist"]');
  if (importWlBtn && !importWlBtn.dataset.wired) {
    importWlBtn.dataset.wired = '1';
    importWlBtn.addEventListener('click', e => {
      e.preventDefault();
      doImportJSON(data => {
        if (Array.isArray(data)) { saveWhitelistTags(data); }
        else if (data?.tags) { saveWhitelistTags(data.tags); if (data.groups) saveWhitelistGroupsMap(data.groups); if (data.emptyGroups) saveWhitelistEmptyGroups(data.emptyGroups); }
        renderWhitelistList(container);
      });
    });
  }

  // Export NOPE
  const exportNopeBtn = container.querySelector('[data-action="export-nope"]');
  if (exportNopeBtn && !exportNopeBtn.dataset.wired) {
    exportNopeBtn.dataset.wired = '1';
    exportNopeBtn.addEventListener('click', e => { e.preventDefault(); doExportJSON({ tags: getNopeWords(), groups: getNopeGroupsMap(), emptyGroups: getNopeEmptyGroups() }, 'ao3h-nope-words.json'); });
  }

  // Import NOPE
  const importNopeBtn = container.querySelector('[data-action="import-nope"]');
  if (importNopeBtn && !importNopeBtn.dataset.wired) {
    importNopeBtn.dataset.wired = '1';
    importNopeBtn.addEventListener('click', e => {
      e.preventDefault();
      doImportJSON(data => {
        if (Array.isArray(data)) { saveNopeWords(data); }
        else if (data?.tags) { saveNopeWords(data.tags); if (data.groups) saveNopeGroupsMap(data.groups); if (data.emptyGroups) saveNopeEmptyGroups(data.emptyGroups); }
        renderNopeList(container);
      });
    });
  }

  // Add empty group row
  const newGroupInput = container.querySelector('#ao3h-hideByTags-new-group');
  const newGroupBtn   = container.querySelector('[data-action="add-group"]');
  function doAddEmptyGroup() {
    const name = (newGroupInput?.value || '').trim();
    if (!name) return;
    const eg = getEmptyGroups();
    if (!eg.includes(name)) { eg.push(name); saveEmptyGroups(eg); }
    expandedGroups.add(name);
    if (newGroupInput) newGroupInput.value = '';
    renderList(container);
  }
  if (newGroupInput && !newGroupInput.dataset.wired) {
    newGroupInput.dataset.wired = '1';
    newGroupInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAddEmptyGroup(); } });
  }
  if (newGroupBtn && !newGroupBtn.dataset.wired) {
    newGroupBtn.dataset.wired = '1';
    newGroupBtn.addEventListener('click', e => { e.preventDefault(); doAddEmptyGroup(); });
  }
}

// ── Listen for config open (real panel on AO3) ────────────────────────────
document.addEventListener('ao3h:configOpen', e => {
  if (e.detail?.moduleId !== 'hideByTags') return;
  wireConfigArea(e.target);
});

// Étape 316 : l'enregistrement via window.AO3H_PanelConfigs.registerInitializer est
// remplacé par l'export de wireConfigArea — configs/index.js le référence dans son
// registre d'initialiseurs. Le bloc « hideByTags_previewSetup » (aucun appelant
// dans le repo) est supprimé. Le bundler legacy (supprimé en Phase 27) réinjectait l'enregistrement.
export { wireConfigArea };
