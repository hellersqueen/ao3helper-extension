/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Tags Display
   
   Configuration panel for the Tags Display module.
   Previously: tagsDisplayManager
   
   Sections:
   - Tag Noise Filtering (autoHideNoiseTags)
   - Compact Mode (compactModeTags)
   - Highlighting (tagsHighlighting)
   - Archive Warnings Style (archiveWarningsDisplay)
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'tagsDisplay';

export const config = `

                <!-- ─── TAG NOISE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Display</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="autoHideNoiseTags">
                            Auto-hide noise tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">~25 recognised filler expressions hidden automatically</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Noise tags style</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="noiseTagStyle" data-setting="noiseTagStyle" value="hide" checked> Hide completely</label>
                        <label><input type="radio" name="noiseTagStyle" data-setting="noiseTagStyle" value="blur"> Blur instead</label>
                    </div>
                    <div class="ao3h-setting-description">Blur keeps the tag in place but unreadable — click the tag to sharpen it</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Your own noise words</label>
                    <div id="ao3h-tagsDisplay-noisewords-container" class="ao3h-config-block"></div>
                    <div class="ao3h-config-row">
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-noisewords">Import (JSON)</button>
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-noisewords">Export (JSON)</button>
                    </div>
                    <div class="ao3h-setting-description">Added on top of the ~25 built-in expressions above. Matches anywhere within a tag's text.</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Never filter these authors' tags</label>
                    <div id="ao3h-tagsDisplay-noiseauthors-container" class="ao3h-config-block"></div>
                    <div class="ao3h-setting-description">Authors you add here keep all their tags visible, even if some match a noise expression</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="tagExternalLinks">
                            External links on tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Adds small 📖 Fanlore / 🌀 TV Tropes search links after each tag</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="compactMode">
                            Compact mode
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Each category below collapses independently — expand on hover, on scroll into view, or all at once with Alt+T</div>
                </div>

                <div class="ao3h-setting-item ao3h-indent">
                    <label class="ao3h-setting-label">Collapse these in compact mode</label>
                    <div class="ao3h-setting-control">
                        <label><input type="checkbox" data-setting="compactCatWarnings" checked> Warnings</label>
                        <label><input type="checkbox" data-setting="compactCatRelationships" checked> Relationships</label>
                        <label><input type="checkbox" data-setting="compactCatCharacters" checked> Characters</label>
                        <label><input type="checkbox" data-setting="compactCatFreeforms" checked> Freeform tags</label>
                        <label><input type="checkbox" data-setting="compactCatSummary" checked> Summary</label>
                    </div>
                    <div class="ao3h-setting-description">Unchecked categories are never collapsed — always shown in full</div>
                </div>

                <div class="ao3h-setting-item ao3h-indent">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="compactModeAutoExpandScroll">
                            Auto-expand when scrolled into view
                        </label>
                    </div>
                    <div class="ao3h-setting-description">No need to hover — a work expands as soon as it's on screen</div>
                </div>

                <!-- ─── HIGHLIGHTING ─── -->
                </div><!-- /.ao3h-config-section: Tag Display -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Favourite Tag Highlighting</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="highlightFavoriteTags" checked>
                            Highlight favourite tags
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Right-click any tag → "Highlight this tag" → choose style</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Default highlight colour</label>
                    <div class="ao3h-setting-control ao3h-color-swatch-group">
                        <label class="ao3h-color-swatch-label" title="Yellow">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="0" checked>
                            <span class="ao3h-color-swatch" style="background:#fef9c3; border:2px solid #facc15;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Green">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="1">
                            <span class="ao3h-color-swatch" style="background:#dcfce7; border:2px solid #4ade80;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Blue">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="2">
                            <span class="ao3h-color-swatch" style="background:#dbeafe; border:2px solid #60a5fa;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Pink">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="3">
                            <span class="ao3h-color-swatch" style="background:#fce7f3; border:2px solid #f472b6;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Purple">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="4">
                            <span class="ao3h-color-swatch" style="background:#f3e8ff; border:2px solid #c084fc;"></span>
                        </label>
                        <label class="ao3h-color-swatch-label" title="Orange">
                            <input type="radio" name="highlightColor" data-setting="highlightColor" value="5">
                            <span class="ao3h-color-swatch" style="background:#fff7ed; border:2px solid #fb923c;"></span>
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Colour used when you quick-highlight a tag (right-click to override per-tag)</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Colour palette</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="highlightPalette" data-setting="highlightPalette" value="default" checked> Default</label>
                        <label><input type="radio" name="highlightPalette" data-setting="highlightPalette" value="pastel"> Pastel</label>
                        <label><input type="radio" name="highlightPalette" data-setting="highlightPalette" value="neon"> Neon</label>
                        <label><input type="radio" name="highlightPalette" data-setting="highlightPalette" value="classic"> Classic</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Highlight style</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="highlightStyle" data-setting="highlightStyle" value="fill" checked> Filled background</label>
                        <label><input type="radio" name="highlightStyle" data-setting="highlightStyle" value="border"> Border only</label>
                        <label><input type="radio" name="highlightStyle" data-setting="highlightStyle" value="bold"> Bold text</label>
                        <label><input type="radio" name="highlightStyle" data-setting="highlightStyle" value="italic"> Italic text</label>
                        <label><input type="radio" name="highlightStyle" data-setting="highlightStyle" value="symbol"> ★ Symbol</label>
                    </div>
                    <div class="ao3h-setting-description">Patterns can use a wildcard: "Alternate Universe -*" matches every AU sub-tag. Earlier rules win over later overlapping ones.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-config-row">
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-highlights">Import (JSON)</button>
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-highlights">Export (JSON)</button>
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="search-highlights">🔍 Search AO3 with these tags</button>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="promoteHighlightedTags">
                            Move highlighted tags first (within their category)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">On listing pages — a highlighted relationship still stays among relationships, just first</div>
                </div>

                <!-- ─── ARCHIVE WARNING STYLE ─── -->
                </div><!-- /.ao3h-config-section: Favourite Tag Highlighting -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Archive Warning Style</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Display as</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="badge" checked> Badge</label>
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="text"> Text</label>
                        <label><input type="radio" name="warningStyle" data-setting="archiveWarningsStyle" value="icon"> Icon (hover for full name)</label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="compactWarnings">
                            Compact archive warnings
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Abbreviate warnings (e.g. &ldquo;MCD&rdquo; instead of full text)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="confirmSensitiveWarnings">
                            Confirm before opening a work with a sensitive warning
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Asks before opening works tagged Violence, Major Character Death, Underage, or Rape/Non-Con</div>
                </div>

                </div><!-- /.ao3h-config-section: Archive Warning Style -->

                <!-- ─── TAG LIMITS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Tag Visibility</div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Max tags visible per work</label>
                    <div class="ao3h-setting-control ao3h-radio-group">
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="0" checked> All</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="5"> 5</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="10"> 10</label>
                        <label><input type="radio" name="maxTagsVisible" data-setting="maxTagsVisible" value="15"> 15</label>
                    </div>
                    <div class="ao3h-setting-description">Tags beyond the limit are hidden with a "+N more" link</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Never show these categories</label>
                    <div class="ao3h-setting-control">
                        <label><input type="checkbox" data-setting="hideTagsWarnings"> Warnings</label>
                        <label><input type="checkbox" data-setting="hideTagsRelationships"> Relationships</label>
                        <label><input type="checkbox" data-setting="hideTagsCharacters"> Characters</label>
                        <label><input type="checkbox" data-setting="hideTagsFreeforms"> Freeform tags</label>
                    </div>
                    <div class="ao3h-setting-description">Hidden entirely, not just truncated — doesn't count toward the "+N more" limit above</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Tag separator</label>
                    <div class="ao3h-setting-control">
                        <input type="text" class="ao3h-config-input" data-setting="tagSeparator" value=", " maxlength="10" style="width:80px;">
                    </div>
                    <div class="ao3h-setting-description">Replaces AO3's default ", " between tags (e.g. " · " or " | ")</div>
                </div>

                </div><!-- /.ao3h-config-section: Tag Visibility -->

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

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;


// ─── CUSTOM NOISE WORDS + AUTHOR EXCEPTIONS ────────────────────────────────
// Noise words: the real owner (key + normalize/dedupe logic) is the shared
// lib/utils/noise-tags.js, safe to import directly (not src/modules/).
// Author exceptions have no lib/ equivalent — _tagsDisplay.js owns that pair,
// but it can't be imported (calls register() at load time), so the same
// trim/lowercase/dedupe algorithm is mirrored locally here.
import { escapeHtml } from '../../../../utils/dom.js';
import { downloadJSON, pickJSONFile } from '../../../../utils/json-file.js';
import { getCustomNoiseWords, saveCustomNoiseWords } from '../../../../utils/noise-tags.js';

const AUTHOR_EXCEPTIONS_KEY   = 'ao3h:tagsDisplay:noiseAuthorExceptions';

function getStoredList(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(w => typeof w === 'string') : [];
  } catch { return []; }
}

function saveStoredList(key, list) {
  const cleaned = Array.from(new Set(list.map(w => String(w || '').trim().toLowerCase()).filter(Boolean)));
  try { localStorage.setItem(key, JSON.stringify(cleaned)); } catch { /* quota */ }
  return cleaned;
}

const getAuthorExceptions  = () => getStoredList(AUTHOR_EXCEPTIONS_KEY);
const saveAuthorExceptions = (list) => saveStoredList(AUTHOR_EXCEPTIONS_KEY, list);

// Shared add/remove chip-list UI for both the noise-word list and the
// author-exceptions list — same interaction, different storage + copy.
function renderEditableWordList(container, { getList, saveList, placeholder, emptyText }) {
  if (!container) return;

  function rebuild() {
    const current = getList();
    container.innerHTML = `
      <div class="ao3h-config-row">
        <input type="text" class="ao3h-config-input ao3h-tagsDisplay-wordlist-input" placeholder="${escapeHtml(placeholder)}" maxlength="60">
        <button class="ao3h-inline-btn ao3h-inline-btn--green ao3h-tagsDisplay-wordlist-add">+ Add</button>
      </div>
      <div class="ao3h-chip-container" data-empty-text="${escapeHtml(emptyText)}">
        ${current.map(w => `<span class="ao3h-chip ao3h-chip--neutral">${escapeHtml(w)}<button title="Remove" data-word="${escapeHtml(w)}">×</button></span>`).join('')}
      </div>`;

    const inputEl = container.querySelector('.ao3h-tagsDisplay-wordlist-input');
    const addBtn  = container.querySelector('.ao3h-tagsDisplay-wordlist-add');

    function addWord() {
      const val = inputEl.value.trim();
      if (!val) return;
      const words = getList();
      if (!words.some(w => w.toLowerCase() === val.toLowerCase())) {
        words.push(val);
        saveList(words);
      }
      inputEl.value = '';
      rebuild();
    }

    addBtn.addEventListener('click', addWord);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addWord(); } });

    container.querySelectorAll('button[data-word]').forEach(btn => {
      btn.addEventListener('click', () => {
        saveList(getList().filter(w => w !== btn.dataset.word));
        rebuild();
      });
    });
  }

  rebuild();
}

function wireNoiseWordsImportExport(configArea) {
  const exportBtn = configArea.querySelector('[data-action="export-noisewords"]');
  const importBtn = configArea.querySelector('[data-action="import-noisewords"]');

  if (exportBtn && !exportBtn.dataset.tdWired) {
    exportBtn.dataset.tdWired = '1';
    exportBtn.addEventListener('click', e => {
      e.stopPropagation();
      downloadJSON(getCustomNoiseWords(), 'ao3h-custom-noise-words.json');
    });
  }

  if (importBtn && !importBtn.dataset.tdWired) {
    importBtn.dataset.tdWired = '1';
    importBtn.addEventListener('click', async e => {
      e.stopPropagation();
      try {
        const incoming = await pickJSONFile();
        if (incoming == null) return;
        if (!Array.isArray(incoming)) throw new Error('Not an array');
        saveCustomNoiseWords([...getCustomNoiseWords(), ...incoming]);
        renderNoiseWords(configArea);
      } catch {
        alert('Import failed: please select a valid JSON export file.');
      }
    });
  }
}

function renderNoiseWords(configArea) {
  const container = configArea
    ? configArea.querySelector('#ao3h-tagsDisplay-noisewords-container')
    : document.getElementById('ao3h-tagsDisplay-noisewords-container');
  renderEditableWordList(container, {
    getList: getCustomNoiseWords,
    saveList: saveCustomNoiseWords,
    placeholder: 'Add your own noise expression…',
    emptyText: 'No custom words yet.',
  });
}

function renderAuthorExceptions(configArea) {
  const container = configArea
    ? configArea.querySelector('#ao3h-tagsDisplay-noiseauthors-container')
    : document.getElementById('ao3h-tagsDisplay-noiseauthors-container');
  renderEditableWordList(container, {
    getList: getAuthorExceptions,
    saveList: saveAuthorExceptions,
    placeholder: 'Add an AO3 username…',
    emptyText: 'No author exceptions yet.',
  });
}

// ─── TAG HIGHLIGHTING — IMPORT / EXPORT / SEARCH ───────────────────────────
// Same self-contained approach: reads/writes tagHighlighting.js's own
// localStorage key (ao3h:tagHighlights) without importing it directly.
const TAG_HIGHLIGHTS_KEY = 'ao3h:tagHighlights';

function getTagHighlights() {
  try {
    const arr = JSON.parse(localStorage.getItem(TAG_HIGHLIGHTS_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function saveTagHighlights(rules) {
  try { localStorage.setItem(TAG_HIGHLIGHTS_KEY, JSON.stringify(rules)); } catch { /* quota */ }
}

function wireHighlightsButtons(configArea) {
  const exportBtn = configArea.querySelector('[data-action="export-highlights"]');
  const importBtn = configArea.querySelector('[data-action="import-highlights"]');
  const searchBtn = configArea.querySelector('[data-action="search-highlights"]');

  if (exportBtn && !exportBtn.dataset.tdWired) {
    exportBtn.dataset.tdWired = '1';
    exportBtn.addEventListener('click', e => {
      e.stopPropagation();
      downloadJSON(getTagHighlights(), 'ao3h-tag-highlights.json');
    });
  }

  if (importBtn && !importBtn.dataset.tdWired) {
    importBtn.dataset.tdWired = '1';
    importBtn.addEventListener('click', e => {
      e.stopPropagation();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const incoming = JSON.parse(await file.text());
          if (!Array.isArray(incoming)) throw new Error('Not an array');
          const existingPatterns = new Set(getTagHighlights().map(r => String(r.pattern || '').toLowerCase()));
          const merged = getTagHighlights();
          let added = 0;
          for (const rule of incoming) {
            if (!rule?.pattern || existingPatterns.has(String(rule.pattern).toLowerCase())) continue;
            merged.push({ pattern: String(rule.pattern), colorIdx: Number(rule.colorIdx) || 0 });
            existingPatterns.add(String(rule.pattern).toLowerCase());
            added++;
          }
          saveTagHighlights(merged);
          alert(`Imported ${added} new rule(s) — ${merged.length} total now saved.`);
        } catch {
          alert('Import failed: please select a valid JSON export file.');
        }
      }, { once: true });
      input.click();
    });
  }

  if (searchBtn && !searchBtn.dataset.tdWired) {
    searchBtn.dataset.tdWired = '1';
    searchBtn.addEventListener('click', e => {
      e.stopPropagation();
      const patterns = getTagHighlights().map(r => r.pattern).filter(Boolean);
      if (!patterns.length) { alert('No highlighted tags yet — right-click a tag on a listing page to add one.'); return; }
      const query = patterns.map(p => encodeURIComponent(p)).join('+');
      window.open(`https://archiveofourown.org/works?work_search[query]=${query}`, '_blank', 'noopener');
    });
  }
}

document.addEventListener('ao3h:configOpen', e => {
  if (e.detail?.moduleId !== 'tagsDisplay') return;
  const configArea = e.detail?.configArea;
  renderNoiseWords(configArea);
  renderAuthorExceptions(configArea);
  if (configArea) {
    wireNoiseWordsImportExport(configArea);
    wireHighlightsButtons(configArea);
  }
});
