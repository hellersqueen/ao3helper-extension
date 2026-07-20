/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Surprise Me

   Configuration panel for the Surprise Me module.
   Random work picker respecting active filters.

   wireConfigArea() renders the "Recent draws" history list (read from
   surpriseMe's own draw-history log) and wires its "Clear History" button —
   the module writes the log, the panel just displays/clears it.
═══════════════════════════════════════════════════════════════════════════ */

import { escapeHtml } from '../../../../utils/dom.js';

const HISTORY_KEY = 'ao3h:surpriseMe:history';

function loadHistory () {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function clearHistory () {
  try { localStorage.setItem(HISTORY_KEY, '[]'); } catch { /* storage unavailable */ }
}

export const moduleId = 'surpriseMe';
export const config = `

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Options</div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="showPreviewBeforeOpen">
                            Show preview before opening
                        </label>
                    </div>
                    <div class="ao3h-setting-description">Title + summary + stats shown before opening the work (ignored when drawing more than one work)</div>
                </div>

                <div class="ao3h-setting-item">
                    <div class="ao3h-setting-control">
                        <label>
                            <input type="checkbox" data-setting="completedOnly">
                            Complete works only
                        </label>
                    </div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Number of works to draw</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="resultCount" value="1" min="1" max="10">
                    </div>
                    <div class="ao3h-setting-description">More than 1 shows a shortlist instead of a single preview</div>
                </div>

                <div class="ao3h-setting-item">
                    <label class="ao3h-setting-label">Minimum word count</label>
                    <div class="ao3h-setting-control">
                        <input type="number" class="ao3h-config-input ao3h-config-input--short" data-setting="minWords" value="0" min="0" step="1000">
                    </div>
                    <div class="ao3h-setting-description">Skip works shorter than this (0 = no minimum)</div>
                </div>

                <div class="ao3h-setting-item ao3h-col2">
                    <label class="ao3h-setting-label">Draw from</label>
                    <div class="ao3h-setting-control">
                        <label><input type="radio" name="sm-drawScope" data-setting="drawScope" value="page" checked> This page only</label>
                        <label><input type="radio" name="sm-drawScope" data-setting="drawScope" value="allPages"> This page + its following listing pages</label>
                    </div>
                    <div class="ao3h-setting-description">"Following pages" fetches up to 4 more pages of the same listing before drawing</div>
                </div>

                </div><!-- /.ao3h-config-section -->

                <div class="ao3h-config-section">
                <div class="ao3h-config-section-title">Recent draws</div>
                <div class="ao3h-sm-history" id="ao3h-sm-history" aria-live="polite"></div>
                <div class="ao3h-config-row">
                    <button class="ao3h-config-action-btn ao3h-inline-btn ao3h-inline-btn--danger" data-action="clear-history">Clear History</button>
                </div>
                </div><!-- /.ao3h-config-section: Recent draws -->

                <div class="ao3h-config-footer">
                    <button class="ao3h-config-reset-btn">Reset to Defaults</button>
                    <button class="ao3h-config-save-btn">Save Settings</button>
                </div>
`;

function renderHistory (container) {
  const list = container.querySelector('#ao3h-sm-history');
  if (!list) return;
  const history = loadHistory();
  if (!history.length) {
    list.innerHTML = '<p class="ao3h-sm-history-empty">No draws yet.</p>';
    return;
  }
  list.innerHTML = `<ul class="ao3h-sm-history-list">${history.slice(0, 20).map(entry => `
    <li>
      ${entry.href ? `<a href="${escapeHtml(entry.href)}" target="_blank" rel="noopener">${escapeHtml(entry.title)}</a>` : escapeHtml(entry.title)}
      <span class="ao3h-sm-history-date">${new Date(entry.at).toLocaleDateString()}</span>
    </li>
  `).join('')}</ul>`;
}

export function wireConfigArea (container) {
  renderHistory(container);

  const clearBtn = container.querySelector('[data-action="clear-history"]');
  clearBtn?.addEventListener('click', () => {
    clearHistory();
    renderHistory(container);
  });
}
// Étape 316 : bridge window.AO3H_PanelConfigs retiré du source — le bundler legacy qui le réinjectait a été supprimé en Phase 27.
