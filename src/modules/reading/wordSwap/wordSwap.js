/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Word Swap

    Module ID: wordSwap
    Display Name: Word Swap
    Tab: Reading

    Purpose

    Replaces user-selected words or phrases inside work prose using reversible,
    configurable transformation rules.

    Features

    - Plain-text or regular-expression replacement rules
    - Case-sensitivity, whole-word, category, and enabled-state options
    - Y/N reader-name preset, live preview, and JSON import or export
    - Dynamic chapter handling with complete text restoration on cleanup

    Notes

    - Transformations are limited to work prose and never alter AO3 interface text.
    - Original text-node values are retained for fully reversible cleanup.
    - User-defined rules persist under `ao3h:ws:rules`.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet, onReady, observe } from '../../../../lib/utils/index.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { characterNameRule, deadnameRule, sensitiveWordRule, RULE_PACKS, packRules } from './ruleTemplates.js';
import styles from './wordSwap.css?inline';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-wordSwap');

const W = getGlobalWindow();
const MOD = 'wordSwap';
const NS = 'ao3h';
const LS_RULES = `${NS}:ws:rules`;

// Rule schema: { id, name, find, replace, enabled, regex,
//               caseSensitive, wholeWord, category }
const DEFAULTS = { yourFirstName: '' };

function loadSettings() { return loadModuleSettings(MOD); }

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RULE STORAGE AND TEXT TRANSFORMATION
═══════════════════════════════════════════════════════════════════════════ */

function loadRules() { return lsGet(LS_RULES) || []; }

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildRegex(rule) {
    try {
        let pattern = rule.regex ? rule.find : escapeRegex(rule.find);
        if (rule.wholeWord) pattern = `\\b${pattern}\\b`;
        return new RegExp(pattern, rule.caseSensitive ? 'g' : 'gi');
    } catch {
        return null; // invalid user-supplied regex — skip silently
    }
}

function getTextNodes(root) {
    if (root.nodeType === Node.TEXT_NODE) return [root];
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
}

// Apply all enabled rules to root; returns snapshot Map (node → original)
// for full reversibility on cleanup.
function applyRules(root, rules, snapshot = new Map()) {
    const enabled = rules.filter(r => r.enabled && r.find);
    if (!enabled.length) return snapshot;

    getTextNodes(root).forEach(node => {
        const original = snapshot.has(node) ? snapshot.get(node) : node.data;
        let current = original;
        enabled.forEach(rule => {
            const re = buildRegex(rule);
            if (re) current = current.replace(re, rule.replace ?? '');
        });
        if (current !== original) {
            if (!snapshot.has(node)) snapshot.set(node, original);
            node.data = current;
        }
    });
    return snapshot;
}

function restoreSnapshot(snapshot) {
    snapshot.forEach((original, node) => { node.data = original; });
}

function previewText(text, rules) {
    const enabled = (rules || loadRules()).filter(r => r.enabled && r.find);
    let result = text;
    enabled.forEach(rule => {
        const re = buildRegex(rule);
        if (re) result = result.replace(re, rule.replace ?? '');
    });
    return result;
}

function withYNRule(rules, name) {
    if (!name || !name.trim()) return rules;
    const n = name.trim();
    return [
        { id: '__yn__', name: `Y/N → ${n}`, find: 'Y/N', replace: n,
          enabled: true, regex: false, caseSensitive: true, wholeWord: true,
          category: 'reader-insert' },
        ...rules.filter(r => r.id !== '__yn__')
    ];
}

let observer = null;
function startObserver(root, rules, allSnaps) {
    observer = observe(document.body, { childList: true, subtree: true }, mutations => {
        mutations.forEach(mut => {
            mut.addedNodes.forEach(added => {
                if ((added.nodeType === Node.ELEMENT_NODE || added.nodeType === Node.TEXT_NODE) && root.contains(added)) {
                    applyRules(added, rules, allSnaps);
                }
            });
        });
    });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RULE MANAGEMENT AND PREVIEW
═══════════════════════════════════════════════════════════════════════════ */

function uid() {
    return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function escHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderRulesPanel(container) {
    if (!container) return;

    function save(rules) { lsSet(LS_RULES, rules.filter(r => r.id !== '__yn__')); }
    function rebuild() { renderList(loadRules()); }

    function renderList(rules) {
        container.innerHTML = '';

        const ul = document.createElement('ul');
        ul.className = 'ao3h-ws-rule-list';

        rules.forEach(rule => {
            const li = document.createElement('li');
            li.className = 'ao3h-ws-rule-item';
            li.dataset.id = rule.id;
            li.innerHTML = `
                <label title="Enable/disable">
                    <input type="checkbox" class="ao3h-ws-toggle" ${rule.enabled ? 'checked' : ''}>
                </label>
                <span class="ao3h-ws-find" title="Find">${escHtml(rule.find)}</span>
                <span class="ao3h-ws-arrow">→</span>
                <span class="ao3h-ws-replace" title="Replace">${escHtml(rule.replace ?? '')}</span>
                ${rule.category ? `<span class="ao3h-ws-cat">${escHtml(rule.category)}</span>` : ''}
                <span class="ao3h-ws-actions">
                    <button class="ao3h-btn-sm ao3h-ws-edit" data-id="${escHtml(rule.id)}">Edit</button>
                    <button class="ao3h-btn-sm ao3h-ws-delete" data-id="${escHtml(rule.id)}">✕</button>
                </span>`;
            ul.appendChild(li);
        });

        container.appendChild(ul);

        const addBtn = document.createElement('button');
        addBtn.className = 'ao3h-btn ao3h-ws-add';
        addBtn.textContent = '+ Add Rule';
        container.appendChild(addBtn);

        // ── Ready-made templates ────────────────────────────────────────
        const tplSel = document.createElement('select');
        tplSel.className = 'ao3h-ws-templates';
        tplSel.innerHTML = `
            <option value="">— Insert a template —</option>
            <option value="character">Normalize a character name…</option>
            <option value="deadname">Replace a deadname…</option>
            <option value="sensitive">Soften a sensitive word…</option>
            ${RULE_PACKS.map(p => `<option value="pack:${p.id}">${escHtml(p.label)} (${p.pairs.length} rules)</option>`).join('')}`;
        container.appendChild(tplSel);

        tplSel.addEventListener('change', () => {
            const choice = tplSel.value;
            tplSel.value = '';
            if (!choice) return;
            const r = loadRules();

            if (choice === 'character') {
                const variants = W.prompt('Variants of the name to normalize (comma-separated):', 'Zoë, Zoey');
                if (!variants) return;
                const canonical = W.prompt('Replace them all with:', '');
                const rule = characterNameRule(variants, canonical);
                if (!rule) return;
                r.push(rule);
            } else if (choice === 'deadname') {
                const from = W.prompt('Name to replace:');
                if (!from) return;
                const to = W.prompt('Replace with:');
                const rule = deadnameRule(from, to);
                if (!rule) return;
                r.push(rule);
            } else if (choice === 'sensitive') {
                const word = W.prompt('Word to soften in the text:');
                if (!word) return;
                const repl = W.prompt('Replace it with (empty = ▓▓▓):', '');
                const rule = sensitiveWordRule(word, repl);
                if (!rule) return;
                r.push(rule);
            } else if (choice.startsWith('pack:')) {
                const rules = packRules(choice.slice(5));
                if (!rules.length) return;
                // Skip pairs the user already has a rule for
                const existing = new Set(r.map(x => x.find.toLowerCase()));
                rules.forEach(rule => { if (!existing.has(rule.find.toLowerCase())) r.push(rule); });
            }

            save(r); rebuild();
        });

        const prevSec = document.createElement('div');
        prevSec.className = 'ao3h-ws-preview-section';
        prevSec.innerHTML = `
            <label class="ao3h-setting-label">Preview</label>
            <textarea class="ao3h-ws-preview-input" rows="2" placeholder="Paste text to preview…"></textarea>
            <div class="ao3h-ws-preview-output"></div>`;
        container.appendChild(prevSec);

        // Wire: toggle enable
        ul.querySelectorAll('.ao3h-ws-toggle').forEach(cb0 => {
            const cb = /** @type {HTMLInputElement} */ (cb0);
            cb.addEventListener('change', () => {
                const id = /** @type {HTMLElement} */ (cb.closest('[data-id]')).dataset.id;
                const r = loadRules();
                const rule = r.find(x => x.id === id);
                if (rule) { rule.enabled = cb.checked; save(r); }
            });
        });

        // Wire: delete
        ul.querySelectorAll('.ao3h-ws-delete').forEach(btn0 => {
            const btn = /** @type {HTMLElement} */ (btn0);
            btn.addEventListener('click', () => {
                const r = loadRules().filter(x => x.id !== btn.dataset.id);
                save(r); rebuild();
            });
        });

        // Wire: edit → open inline form
        ul.querySelectorAll('.ao3h-ws-edit').forEach(btn0 => {
            const btn = /** @type {HTMLElement} */ (btn0);
            btn.addEventListener('click', () => {
                const r = loadRules();
                const rule = r.find(x => x.id === btn.dataset.id);
                if (rule) openRuleForm(rule, updated => {
                    const idx = r.findIndex(x => x.id === updated.id);
                    if (idx !== -1) r[idx] = updated;
                    save(r); rebuild();
                });
            });
        });

        // Wire: add
        addBtn.addEventListener('click', () => {
            openRuleForm(null, newRule => {
                const r = loadRules();
                r.push(newRule); save(r); rebuild();
            });
        });

        // Wire: preview
        const inp = /** @type {HTMLTextAreaElement} */ (prevSec.querySelector('.ao3h-ws-preview-input'));
        const out = prevSec.querySelector('.ao3h-ws-preview-output');
        inp.addEventListener('input', () => {
            out.textContent = previewText(inp.value, loadRules());
        });
    }

    function openRuleForm(existing, onSave) {
        const modal = document.createElement('div');
        modal.className = 'ao3h-ws-rule-form';
        const rule = existing || {
            id: uid(), name: '', find: '', replace: '',
            enabled: true, regex: false, caseSensitive: true,
            wholeWord: true, category: ''
        };
        modal.innerHTML = `
            <div class="ao3h-ws-form-row"><label>Name</label>
                <input class="ao3h-ws-f-name" value="${escHtml(rule.name)}" placeholder="Rule name"></div>
            <div class="ao3h-ws-form-row"><label>Find</label>
                <input class="ao3h-ws-f-find" value="${escHtml(rule.find)}" placeholder="Text to find"></div>
            <div class="ao3h-ws-form-row"><label>Replace</label>
                <input class="ao3h-ws-f-replace" value="${escHtml(rule.replace ?? '')}" placeholder="Replacement"></div>
            <div class="ao3h-ws-form-row"><label>Category</label>
                <input class="ao3h-ws-f-cat" value="${escHtml(rule.category ?? '')}" placeholder="e.g. fandom name"></div>
            <div class="ao3h-ws-form-opts">
                <label><input type="checkbox" class="ao3h-ws-f-cs" ${rule.caseSensitive ? 'checked' : ''}> Case-sensitive</label>
                <label><input type="checkbox" class="ao3h-ws-f-ww" ${rule.wholeWord ? 'checked' : ''}> Whole word</label>
                <label><input type="checkbox" class="ao3h-ws-f-rx" ${rule.regex ? 'checked' : ''}> Regex</label>
            </div>
            <div class="ao3h-ws-form-btns">
                <button class="ao3h-btn ao3h-ws-f-cancel">Cancel</button>
                <button class="ao3h-btn ao3h-ws-f-save">Save Rule</button>
            </div>`;
        container.prepend(modal);

        const cancelBtn = /** @type {HTMLElement} */ (modal.querySelector('.ao3h-ws-f-cancel'));
        const saveBtn   = /** @type {HTMLElement} */ (modal.querySelector('.ao3h-ws-f-save'));
        cancelBtn.onclick = () => modal.remove();
        saveBtn.onclick = () => {
            const nameInput     = /** @type {HTMLInputElement} */ (modal.querySelector('.ao3h-ws-f-name'));
            const findInput     = /** @type {HTMLInputElement} */ (modal.querySelector('.ao3h-ws-f-find'));
            const replaceInput  = /** @type {HTMLInputElement} */ (modal.querySelector('.ao3h-ws-f-replace'));
            const catInput      = /** @type {HTMLInputElement} */ (modal.querySelector('.ao3h-ws-f-cat'));
            const csInput       = /** @type {HTMLInputElement} */ (modal.querySelector('.ao3h-ws-f-cs'));
            const wwInput       = /** @type {HTMLInputElement} */ (modal.querySelector('.ao3h-ws-f-ww'));
            const rxInput       = /** @type {HTMLInputElement} */ (modal.querySelector('.ao3h-ws-f-rx'));
            const updated = {
                ...rule,
                name:          nameInput.value.trim(),
                find:          findInput.value,
                replace:       replaceInput.value,
                category:      catInput.value.trim(),
                caseSensitive: csInput.checked,
                wholeWord:     wwInput.checked,
                regex:         rxInput.checked,
            };
            if (!updated.find) return; // don't save empty find
            modal.remove();
            onSave(updated);
        };
    }

    renderList(loadRules());
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PANEL IMPORT AND EXPORT
═══════════════════════════════════════════════════════════════════════════ */

function wirePanelIO(panelArea, signal, fileReaders, renderedContainers) {
    const rulesContainer = panelArea.querySelector('#ao3h-wordSwap-rules-container, [data-ws-rules]');
    if (!rulesContainer) return false;
    renderedContainers.add(rulesContainer);
    renderRulesPanel(rulesContainer);

    const exportBtn = panelArea.querySelector('[data-action="export-rules"]');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            downloadJSON(loadRules(), 'ao3h-wordswap-rules.json');
        }, { signal });
    }

    const addRuleBtn = panelArea.querySelector('[data-action="add-rule"]');
    if (addRuleBtn) {
        addRuleBtn.addEventListener('click', () => {
            const from = panelArea.querySelector('#ao3h-ws-new-from');
            const to = panelArea.querySelector('#ao3h-ws-new-to');
            if (!from?.value) return;
            const rules = loadRules();
            rules.push({
                id: uid(), name: '', find: from.value, replace: to?.value || '',
                enabled: true, regex: false, caseSensitive: true,
                wholeWord: true, category: ''
            });
            lsSet(LS_RULES, rules);
            from.value = '';
            if (to) to.value = '';
            renderRulesPanel(rulesContainer);
        }, { signal });
    }

    const importBtn = panelArea.querySelector('[data-action="import-rules"]');
    if (importBtn) {
        // Create a hidden file input on first click
        importBtn.addEventListener('click', () => {
            let fileInput = panelArea.querySelector('.ao3h-ws-import-file');
            if (!fileInput) {
                fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.json,application/json';
                fileInput.className = 'ao3h-ws-import-file';
                panelArea.appendChild(fileInput);
                fileInput.addEventListener('change', () => {
                    const file = fileInput.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    fileReaders.add(reader);
                    reader.onload = e => {
                        fileReaders.delete(reader);
                        if (signal.aborted) return;
                        try {
                            const arr = JSON.parse(/** @type {string} */ (e.target.result));
                            if (Array.isArray(arr)) {
                                lsSet(LS_RULES, arr);
                                renderRulesPanel(rulesContainer);
                            }
                        } catch { /* invalid JSON — ignore */ }
                    };
                    reader.readAsText(file);
                    fileInput.value = '';
                }, { signal });
            }
            fileInput.click();
        }, { signal });
    }
    return true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
    title: 'Word Swap',
    enabledByDefault: false
}, async function init() {
    const cfg = Object.assign({}, DEFAULTS, loadSettings());
    let rules = withYNRule(loadRules(), cfg.yourFirstName);

    const panelController = new AbortController();
    const fileReaders = new Set();
    const renderedContainers = new Set();
    const wiredPanels = new WeakSet();
    function tryWirePanel() {
        const panelArea = document.querySelector(`[data-config-module="${MOD}"]`);
        if (!panelArea || wiredPanels.has(panelArea)) return;
        if (wirePanelIO(panelArea, panelController.signal, fileReaders, renderedContainers)) wiredPanels.add(panelArea);
    }

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'observer plantait (Cannot read properties of null), constaté
    // sur plusieurs modules similaires en test.
    let active = true;
    let panelObserver = null;
    const allSnaps = new Map();
    onReady(() => {
        if (!active) return;

        // Target: work text only — never alter AO3 navigation/UI
        const target = document.querySelector('#workskin .userstuff') ||
                       document.querySelector('#workskin');
        if (target) {
            applyRules(target, rules, allSnaps);
            startObserver(target, rules, allSnaps);
        }

        tryWirePanel();
        panelObserver = observe(document.body, { childList: true, subtree: true }, tryWirePanel);
    });

    W.AO3H_WordSwap = {
        loadRules,
        saveRules: (r) => lsSet(LS_RULES, r),
        previewText,
        renderRulesPanel,
        NS,
        LS_RULES
    };

    return function cleanup() {
        active = false;
        if (observer) { observer.disconnect(); observer = null; }
        panelObserver?.disconnect();
        panelController.abort();
        fileReaders.forEach(reader => reader.abort());
        fileReaders.clear();
        renderedContainers.forEach(container => { container.innerHTML = ''; });
        renderedContainers.clear();
        document.querySelectorAll(`[data-config-module="${MOD}"] .ao3h-ws-import-file`)
            .forEach(input => input.remove());
        restoreSnapshot(allSnaps);
        delete W.AO3H_WordSwap;
    };
});
