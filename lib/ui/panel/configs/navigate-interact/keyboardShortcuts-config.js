/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Keyboard Shortcuts

   Configuration panel for the Keyboard Shortcuts module.
   Hub for shortcuts — 6 modules delegate their shortcuts here.

   Sections:
   - Global options
   - Default shortcuts reference table (remapping already works: each row is
     a plain text `data-setting` input, saved/read like any other setting —
     no separate "enable remapping" toggle needed)

   wireConfigArea() wires the "Import" / "Export" buttons, which existed in
   the HTML but had no click handler (see keyboardShortcuts.md).
═══════════════════════════════════════════════════════════════════════════ */

import { downloadJSON, pickJSONFile } from '../../../../utils/json-file.js';
import { loadModuleSettings, saveModuleSettings } from '../../../../storage/module-settings.js';

export const moduleId = 'keyboardShortcuts';

// Keep in sync with DEFAULTS in src/modules/navigate/keyboardShortcuts/keyboardShortcuts.js.
const SHORTCUT_KEYS = [
  'prevChapter', 'nextChapter', 'prevPage', 'nextPage', 'firstPage', 'lastPage',
  'jumpBackPages', 'jumpForwardPages', 'guide', 'commandPalette',
  'surpriseMe', 'subscribe', 'bookmark', 'markForLater', 'kudos',
];

export const config = `

                <!-- ─── GLOBAL OPTIONS ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Global Options</div>
                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="allShortcutsDisabled">
                            Disable all shortcuts (emergency toggle)
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Emergency kill switch — disables all keyboard shortcuts immediately.</div>
                </div>
                </div><!-- /.ao3h-config-section: Global Options -->

                <!-- ─── REFERENCE ─── -->
                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Shortcut Bindings</div>
                <div class="ao3h-setting-description" style="margin-bottom: 8px;">Format: Ctrl+Key, Shift+Key, Ctrl+Shift+Key, or a single key. Leave empty to disable. Just type a new combination below — no separate "enable remapping" switch needed.</div>
                <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-top: 4px;">
                    <thead>
                        <tr style="text-align: left; border-bottom: 1px solid var(--ao3h-border, #e5e7eb);">
                            <th style="padding: 3px 6px;">Action</th>
                            <th style="padding: 3px 6px;">Shortcut</th>
                            <th style="padding: 3px 6px;">Context</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 2px 6px;">Previous chapter</td><td style="padding: 2px 6px;"><input type="text" data-setting="prevChapter" value="Ctrl+ArrowLeft" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Next chapter</td><td style="padding: 2px 6px;"><input type="text" data-setting="nextChapter" value="Ctrl+ArrowRight" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Previous page</td><td style="padding: 2px 6px;"><input type="text" data-setting="prevPage" value="Shift+ArrowLeft" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Next page</td><td style="padding: 2px 6px;"><input type="text" data-setting="nextPage" value="Shift+ArrowRight" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">First page</td><td style="padding: 2px 6px;"><input type="text" data-setting="firstPage" value="Ctrl+Home" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Last page</td><td style="padding: 2px 6px;"><input type="text" data-setting="lastPage" value="Ctrl+End" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Jump back 5 pages</td><td style="padding: 2px 6px;"><input type="text" data-setting="jumpBackPages" value="Shift+PageUp" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Jump forward 5 pages</td><td style="padding: 2px 6px;"><input type="text" data-setting="jumpForwardPages" value="Shift+PageDown" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Shortcut guide</td><td style="padding: 2px 6px;"><input type="text" data-setting="guide" value="?" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Everywhere</td></tr>
                        <tr><td style="padding: 2px 6px;">Command palette</td><td style="padding: 2px 6px;"><input type="text" data-setting="commandPalette" value="Ctrl+/" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Everywhere</td></tr>
                        <tr><td style="padding: 2px 6px;">Surprise Me 🎲</td><td style="padding: 2px 6px;"><input type="text" data-setting="surpriseMe" value="Ctrl+Shift+R" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Subscribe</td><td style="padding: 2px 6px;"><input type="text" data-setting="subscribe" value="Ctrl+Shift+S" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                        <tr><td style="padding: 2px 6px;">Bookmark</td><td style="padding: 2px 6px;"><input type="text" data-setting="bookmark" value="Ctrl+Shift+B" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page / listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Mark for later</td><td style="padding: 2px 6px;"><input type="text" data-setting="markForLater" value="Ctrl+Shift+M" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page / listings</td></tr>
                        <tr><td style="padding: 2px 6px;">Leave kudos ❤️</td><td style="padding: 2px 6px;"><input type="text" data-setting="kudos" value="Ctrl+Shift+K" class="ao3h-config-input" style="width:120px;font-size:11px;"></td><td style="padding: 2px 6px;">Fic page</td></tr>
                    </tbody>
                </table>

                <div class="ao3h-config-row" style="margin-top: 10px; flex-wrap: wrap; gap: 6px;">
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="import-shortcuts">Import</button>
                    <button class="ao3h-config-action-btn ao3h-inline-btn" data-action="export-shortcuts">Export (JSON)</button>
                </div>
                </div><!-- /.ao3h-config-section: Default Shortcuts -->
                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

/**
 * Wires the Import/Export buttons for the shortcut bindings table.
 * @param {HTMLElement} container
 */
export function wireConfigArea (container) {
  const exportBtn = container.querySelector('[data-action="export-shortcuts"]');
  if (exportBtn && !exportBtn.dataset.wired) {
    exportBtn.dataset.wired = '1';
    exportBtn.addEventListener('click', () => {
      const saved = loadModuleSettings(moduleId);
      const data = {};
      SHORTCUT_KEYS.forEach((key) => { if (key in saved) data[key] = saved[key]; });
      downloadJSON(data, 'ao3h-keyboard-shortcuts.json');
    });
  }

  const importBtn = container.querySelector('[data-action="import-shortcuts"]');
  if (importBtn && !importBtn.dataset.wired) {
    importBtn.dataset.wired = '1';
    importBtn.addEventListener('click', async () => {
      let data;
      try {
        data = await pickJSONFile();
      } catch {
        alert('Import failed: invalid JSON file.');
        return;
      }
      if (!data || typeof data !== 'object') return;

      const patch = {};
      SHORTCUT_KEYS.forEach((key) => {
        if (typeof data[key] === 'string') patch[key] = data[key];
      });
      if (!Object.keys(patch).length) {
        alert('No recognized shortcut keys found in file.');
        return;
      }

      saveModuleSettings(moduleId, patch);
      Object.entries(patch).forEach(([key, value]) => {
        const input = container.querySelector(`[data-setting="${key}"]`);
        if (input) input.value = value;
      });
      importBtn.textContent = `✓ Imported ${Object.keys(patch).length}`;
      setTimeout(() => { importBtn.textContent = 'Import'; }, 1500);
    });
  }
}
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
