/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Main Navigation
   
   Configuration panel for the Main Navigation module.
   Previously: mainNavEnhancer
   
   Sections:
   - Navbar Links
   - Quick Links
   - Menu Activation
═══════════════════════════════════════════════════════════════════════════ */

export const moduleId = 'mainNavigation';
export const config = `

                <!-- ─── NAVBAR LINKS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Navbar Links</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="addNavLinks" checked>
                            Add Bookmarks / MFL / History to navbar
                        </label>
                    </div>
                    <div class="ao3h-setting-description">“History” opens AO3’s reading history at /users/[username]/readings — or your personal dashboard page when the Reading Dashboard module is enabled.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="backToSearch" checked>
                            “← Back to search” link on work pages
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Returns to the last listing/search page visited in this tab, filters intact</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="breadcrumbs">
                            Breadcrumb trail under the header
                        </label>
                    </div>
                    <div class="ao3h-setting-description">e.g. Works › Work 123 › Chapter — built from the URL, no extra requests</div>
                </div>

                <!-- ─── QUICK LINKS ─── -->
                </div><!-- /.ao3h-config-section: Navbar Links -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Custom Quick Links</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickLinksEnabled">
                            Enable custom quick links
                        </label>
                    </div>
                    <div class="ao3h-setting-description">URL + label — up to 5 links (a tag, fandom or pairing page works too). Start the label with an emoji to give the link an icon.</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="quickLinksDropdown">
                            Group quick links in a “☆ Quick Links” dropdown menu
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Find a fandom / pairing</label>
                    <div class="ao3h-setting-control ao3h-setting-control--wrap">
                        <select class="ao3h-setting-select ao3h-field--md" id="ao3h-mn-ac-type">
                            <option value="fandom" selected>Fandom</option>
                            <option value="relationship">Pairing</option>
                        </select>
                        <input type="text" class="ao3h-config-input ao3h-field--fill" id="ao3h-mn-ac-term" placeholder="Search AO3 tags…">
                        <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="search-tag">Search</button>
                    </div>
                    <div class="ao3h-setting-description">Pick a result to fill the first empty quick-link slot below — no need to type the URL by hand</div>
                    <ul id="ao3h-mn-ac-results" class="ao3h-mn-autocomplete-results"></ul>
                </div>

                ${[1, 2, 3, 4, 5].map(index => `
                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Link ${index}</label>
                    <div class="ao3h-setting-control ao3h-setting-control--wrap">
                        <input type="text" class="ao3h-config-input ao3h-field--md" data-setting="quickLink${index}Label" placeholder="Label (emoji ok)">
                        <input type="url" class="ao3h-config-input ao3h-field--fill" data-setting="quickLink${index}Url" placeholder="https://archiveofourown.org/...">
                    </div>
                </div>`).join('')}

                <!-- ─── MENU ACTIVATION ─── -->
                </div><!-- /.ao3h-config-section: Custom Quick Links -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Menu Activation</div>

                <div class="ao3h-setting-group">
                    <div class="ao3h-setting-label">Open menu</div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="menuActivation" data-setting="menuActivation" value="hover" checked> On hover</label>
                        </div>
                    </div>
                    <div class="ao3h-setting-item">
                        <div class="ao3h-setting-control">
                            <label><input type="radio" name="menuActivation" data-setting="menuActivation" value="click"> On click only</label>
                        </div>
                    </div>
                </div><!-- /.ao3h-setting-group: Open menu -->

                </div><!-- /.ao3h-config-section: Menu Activation -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

/* ── Fandom / pairing tag search (AO3 autocomplete endpoints) ───────────── */

// AO3 exposes /autocomplete/fandom?term= and /autocomplete/relationship?term=
// returning [{ id, name }]. Same-origin, so a plain fetch works from the panel.
async function searchAO3Tags (type, term) {
  const url = `/autocomplete/${type}?term=${encodeURIComponent(term)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function tagWorksUrl (tagName) {
  // AO3 tag-URL escaping: '/' → *s*, '&' → *a*, '.' → *d*, '?' → *q*, '#' → *h*
  const escaped = tagName
    .replace(/\*/g, '*x*').replace(/\//g, '*s*').replace(/&/g, '*a*')
    .replace(/\./g, '*d*').replace(/\?/g, '*q*').replace(/#/g, '*h*');
  return `/tags/${encodeURIComponent(escaped)}/works`;
}

function fillFirstEmptySlot (container, label, url) {
  for (let index = 1; index <= 5; index += 1) {
    const labelInput = container.querySelector(`[data-setting="quickLink${index}Label"]`);
    const urlInput = container.querySelector(`[data-setting="quickLink${index}Url"]`);
    if (!labelInput || !urlInput) return false;
    if (!labelInput.value && !urlInput.value) {
      labelInput.value = label;
      urlInput.value = url;
      // Notify the tab system so the panel marks the area dirty for saving
      urlInput.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

/**
 * Wires the fandom/pairing autocomplete search of the Quick Links section.
 * @param {HTMLElement} container
 */
export function wireConfigArea (container) {
  const searchBtn = container.querySelector('[data-action="search-tag"]');
  const termInput = /** @type {HTMLInputElement|null} */ (container.querySelector('#ao3h-mn-ac-term'));
  const typeSelect = /** @type {HTMLSelectElement|null} */ (container.querySelector('#ao3h-mn-ac-type'));
  const resultsEl = container.querySelector('#ao3h-mn-ac-results');
  if (!searchBtn || !termInput || !typeSelect || !resultsEl || searchBtn.dataset.wired) return;
  searchBtn.dataset.wired = '1';

  async function runSearch () {
    const term = termInput.value.trim();
    if (!term) return;
    resultsEl.textContent = 'Searching…';
    let tags;
    try {
      tags = await searchAO3Tags(typeSelect.value, term);
    } catch {
      resultsEl.textContent = 'Search failed — are you on an AO3 page?';
      return;
    }
    resultsEl.textContent = '';
    if (!tags.length) { resultsEl.textContent = 'No matching tag found.'; return; }
    tags.slice(0, 8).forEach(tag => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'ao3h-config-action-btn ao3h-inline-btn';
      btn.textContent = `+ ${tag.name}`;
      btn.title = 'Add as quick link';
      btn.addEventListener('click', () => {
        const added = fillFirstEmptySlot(container, tag.name, tagWorksUrl(tag.name));
        btn.textContent = added ? '✓ Added' : 'All 5 slots full';
        btn.disabled = true;
      });
      li.appendChild(btn);
      resultsEl.appendChild(li);
    });
  }

  searchBtn.addEventListener('click', runSearch);
  termInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } });
}
