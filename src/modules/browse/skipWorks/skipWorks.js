/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Skip Works
    Module ID: skipWorks

    - Feature: Hide button
      - Option: Injects a "Hide" button on each work blurb in listing pages

    - Feature: Note prompt
      - Option: Opens a centered picker on hide (quick-tag chips + freetext input)
      - Option: Quick-tag chips are user-configurable and stored per-user
      - Option: Modifier key (Shift/Alt/Ctrl) skips picker and re-uses stored note

    - Feature: Hidden work display (two modes)
      - Option: Grey block — replaces blurb with note + Show / Edit / Unhide buttons
      - Option: Remove completely — blurb is hidden entirely (display:none)
      - Option: Live re-apply when displayMode setting changes in the panel

    - Feature: Blurb actions
      - Option: Show — temporary in-page reveal (not persisted, clears on reload)
      - Option: Unhide — permanent (resets isHidden flag in DB)
      - Option: Edit — re-opens picker to change the note while staying hidden

    - Feature: Persistence (IndexedDB, per-user)
      - Option: Per-user database (ao3h-hiddenWorksDB-[username])
      - Option: Re-applies hidden state on every page load
      - Option: Observer re-applies Hide buttons when list updates (AJAX / pagination)

    - Feature: Migrations
      - Option: Legacy: localStorage (ao3HiddenWorks) → IndexedDB
      - Option: Shared DB (ao3h-hiddenWorksDB) → per-user DB

    - Feature: Export / Import
      - Option: Export hidden works list as JSON file
      - Option: Import hidden works from JSON file

    - Feature: Config panel (skipWorks-config.js)
      - Option: Display mode toggle (grey block / remove)
      - Option: Quick Note Presets manager (add / remove chips)
      - Option: Skipped Works List with Unhide per entry
      - Option: Clear All, Export (JSON), Import (JSON) buttons

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { observe, debounce, css } from '../../../../lib/utils/index.js';
import { detectUser } from '../../../../lib/utils/user-detector.js';
import { UserLocalStorage } from '../../../../lib/storage/user.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { EV_SETTINGS_CHANGED } from '../../../../lib/utils/event-names.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './skipWorks.css?inline';

css(styles, 'ao3h-skipWorks');

const W  = getGlobalWindow();
const NS = 'ao3h';

const MOD   = 'skipWorks';
const LOG   = `[AO3H][${MOD}]`;

// ── Defaults (required for audit tooling) ──────────────────────────
const DEFAULTS = {
  displayMode: 'dim',
};

// Read a persisted setting (falls back to default)
const getSetting = makeCfg(MOD);

// Detect current user for per-user IndexedDB isolation
const CURRENT_USER = detectUser();

const DB_NAME = `ao3h-hiddenWorksDB-${CURRENT_USER}`; // Per-user database
const STORE   = 'works';

/* ----------------------------- IndexedDB ------------------------------- */
let db;
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (event) => {
      const dbx = event.target.result;
      if (!dbx.objectStoreNames.contains(STORE)) {
        const objectStore = dbx.createObjectStore(STORE, { keyPath: 'workId' });
        objectStore.createIndex('reason', 'reason', { unique: false });
        objectStore.createIndex('isHidden', 'isHidden', { unique: false });
      }
    };
    req.onsuccess = (e) => {
      db = e.target.result;
      db.onversionchange = () => { try { db.close(); } catch {} };
      resolve(db);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}
function getAllWorks() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = () => reject(new Error('getAll failed'));
  });
}
function getWork(workId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], 'readonly');
    const req = tx.objectStore(STORE).get(workId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror   = () => reject(new Error('get failed'));
  });
}
function putWork(rec) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE], 'readwrite');
    const req = tx.objectStore(STORE).put(rec);
    req.onsuccess = () => resolve(true);
    req.onerror   = () => reject(new Error('put failed'));
  });
}

/* ----------------------------- TEMP-SHOW ------------------------------- */
// Per-path allowlist of works temporarily revealed (so Hide can instantly re-hide with the saved note).
// Note: sessionStorage is per-browser-tab, not per-user, so we keep it as-is (temporary data)
let tempShow = new Set();
const tempKey = () => `${NS}:m5:tempShow:${location.pathname}`;
function loadTempShow(){
  try{
    const raw = sessionStorage.getItem(tempKey());
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  }catch{ return new Set(); }
}
function saveTempShow(){
  try{ sessionStorage.setItem(tempKey(), JSON.stringify([...tempShow])); }catch{}
}
function clearTempShow(){
  tempShow.clear();
  try{ sessionStorage.removeItem(tempKey()); }catch{}
}

/* ----------------------------- Utilities -------------------------------- */
// jQuery is available on AO3; use the page copy.
function $(sel, root){ return (W.jQuery || W.$)(sel, root); }

function workIdFromBlurb($blurb) {
  // Prefer the first heading link with /works/ID; normalize to path-only without query/hash
  const a = $blurb.find('.header .heading a[href*="/works/"]').first();
  const href = (a.attr('href') || '').replace(/(#.*|\?.*)$/, '');
  // If not found, fallback to any anchor with /works/
  return href || ($blurb.find('a[href*="/works/"]').first().attr('href') || '').replace(/(#.*|\?.*)$/, '');
}

/* --------------------------- Quick-note picker -------------------------- */
const USER_QUICK_TAGS_DEFAULT = [
  'crossover', 'sequel', 'bad summary', 'parent/dad', 'unfinished',
  'growing up together', 'not sterek focused', '1rst pov', 'established', 'always-a-girl', 'remember reading','implied'
];
const QUICK_TAGS_KEY = `m5QuickTagsUser`; // Will be auto-prefixed with username
function getUserQuickTags(){
  try {
    const v = UserLocalStorage.getJSON(QUICK_TAGS_KEY, null);
    if (Array.isArray(v) && v.every(x => typeof x === 'string')) return v;
  } catch {}
  return USER_QUICK_TAGS_DEFAULT;
}

async function pickReasonCenteredMinimal(seed=''){
  let panel = document.getElementById(`${NS}-m5-picker`);
  if (!panel) {
    panel = document.createElement('div');
    panel.id = `${NS}-m5-picker`;
    panel.className = `${NS}-m5-picker`;
    panel.innerHTML = `
      <div class="${NS}-m5p-title">Choose a tag or write a note</div>
      <div class="${NS}-m5p-chips"></div>
      <div class="${NS}-m5p-row">
        <input type="text" class="${NS}-m5p-input" placeholder="Write a note here…" />
        <button type="button" class="${NS}-m5p-add">Add</button>
      </div>
      <div class="${NS}-m5p-hint">Tip: click a tag to save immediately • Press Esc to cancel • Enter = Add</div>
      <div class="${NS}-m5p-actions">
        <button type="button" class="${NS}-m5p-cancel">Cancel</button>
      </div>
    `;
    document.body.appendChild(panel);
  }

  // Populate chips
  const chipsWrap = panel.querySelector(`.${NS}-m5p-chips`);
  chipsWrap.innerHTML = '';
  for (const tag of getUserQuickTags()) {
    const chip = document.createElement('span');
    chip.className = `${NS}-m5p-chip`;
    chip.textContent = tag;
    chip.addEventListener('click', () => finish(tag)); // instant save
    chipsWrap.appendChild(chip);
  }

  const input     = panel.querySelector(`.${NS}-m5p-input`);
  const addBtn    = panel.querySelector(`.${NS}-m5p-add`);
  const cancelBtn = panel.querySelector(`.${NS}-m5p-cancel`);

  input.value = seed || '';

  const onAdd = () => {
    const val = (input.value || '').trim();
    if (!val) return;
    finish(val);
  };
  const onCancel = () => finish(null);
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); finish(null); }
    if (e.key === 'Enter')  { e.preventDefault(); onAdd(); }
  };

  addBtn.onclick = onAdd;
  cancelBtn.onclick = onCancel;

  // show & focus
  panel.classList.add(`${NS}-open`);
  input.focus();
  document.addEventListener('keydown', onKey, true);

  let resolver;
  const p = new Promise(r => resolver = r);
  function finish(result){
    panel.classList.remove(`${NS}-open`);
    document.removeEventListener('keydown', onKey, true);
    resolver(result);
  }
  return p;
}

/* -------------------------- Blurb UI helpers ---------------------------- */
function ensureHideButton($blurb) {
  if ($blurb.find(`.${NS}-m5-hide-btn`).length) return;
  // If hideByTags has wrapped this blurb, find .header inside .ao3h-cut
  const $cut = $blurb.children(`.${NS}-cut`);
  const $scope = $cut.length ? $cut : $blurb;
  const $header = $scope.find('.header').first();
  if (!$header.length) return;

  const btn = document.createElement('button');
  btn.textContent = 'Hide';
  btn.type = 'button';
  btn.className = `${NS}-m5-hide-btn`;
  $header.append(btn);

  // ===== Auto-restore prior note on Hide if one exists, and support temp-show rehide =====
  btn.addEventListener('click', async (e) => {
    const workId = workIdFromBlurb($blurb);
    if (!workId) return;
    try {
      const existing = await getWork(workId);

      // quick toggle: any modifier skips the picker (uses stored note if available)
      const quick = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey;

      const blurbEl = $blurb[0];
      const barPresent = !!$blurb.find(`.${NS}-m5-hidebar`).length;

      const wasHidden = !!(existing && existing.isHidden);
      const wasTempShown = wasHidden && tempShow.has(workId);
      const visibleButShouldBeHidden = wasHidden && !barPresent;

      // Case A: re-hide without picker (temp show or visible-but-should-be-hidden)
      if (wasTempShown || visibleButShouldBeHidden || quick){
        tempShow.delete(workId); saveTempShow();
        const reason = (existing && typeof existing.reason === 'string') ? existing.reason.trim() : '';
        hideWork(blurbEl, reason);
        await putWork({ workId, reason, isHidden: true });
        return;
      }

      // Case B: first-time hide OR editing note via picker
      const seed = (existing && typeof existing.reason === 'string') ? existing.reason : '';
      let reason = await pickReasonCenteredMinimal(seed || '');
      if (reason === null) return; // cancelled
      reason = String(reason).trim();
      if (!reason && !seed) return; // nothing chosen on first-time

      tempShow.delete(workId); saveTempShow();
      hideWork(blurbEl, reason || seed || '');
      await putWork({ workId, reason: (reason || seed || ''), isHidden: true });
    } catch (err) { console.error(LOG, 'hide click failed', err); }
  });
}

function hideWork(blurbEl, reason) {
  const $blurb = $(blurbEl);
  if ($blurb.find(`.${NS}-m5-hidebar`).length) return;

  const displayMode = getSetting('displayMode', 'block');

  if (displayMode === 'remove') {
    // Remove completely: hide the entire blurb
    blurbEl.style.display = 'none';
    blurbEl.dataset.ao3hHidden = '1';
    return;
  }

  // Default: build grey bar
  const bar = document.createElement('div');
  bar.className = `${NS}-m5-hidebar`;
  bar.innerHTML = `
    <div class="left">
      <span class="label">Hidden:</span>
      <span class="reason-text"></span>
    </div>
    <div class="right">
      <button type="button" class="${NS}-m5-btn edit-reason">Edit</button>
      <button type="button" class="${NS}-m5-btn show">Show</button>
      <button type="button" class="${NS}-m5-btn unhide">Unhide</button>
    </div>
  `;
  bar.querySelector('.reason-text').textContent = reason || '';

  // Hide original blurb content (except our bar)
  const children = Array.from(blurbEl.children);
  for (const ch of children) {
    if (ch !== bar) ch.style.display = 'none';
  }
  blurbEl.appendChild(bar);

  // Also hide the Hide button itself while hidden
  $blurb.find(`.${NS}-m5-hide-btn`).hide();
}

function showWork(blurbEl) {
  const $blurb = $(blurbEl);
  // Handle 'remove' mode (blurb was fully hidden)
  if (blurbEl.dataset.ao3hHidden) {
    blurbEl.style.display = '';
    delete blurbEl.dataset.ao3hHidden;
    return;
  }
  // Handle 'block' mode (grey bar)
  const children = Array.from(blurbEl.children);
  for (const ch of children) ch.style.display = '';
  $blurb.find(`.${NS}-m5-hidebar`).remove();
  $blurb.find(`.${NS}-m5-hide-btn`).show();
}

/* ----------------------------- Import/Export ---------------------------- */
async function exportHiddenWorks() {
  try {
    if (!db) await openDB();
    const all = await getAllWorks();
    downloadJSON(all, `ao3-hidden-works-${new Date().toISOString().slice(0,10)}.json`);
    alert('Exported ' + all.length + ' hidden works.');
  } catch (e) {
    console.error(LOG, 'export failed', e);
    alert('Export failed. See console for details.');
  }
}

async function importHiddenWorksFromFile(file) {
  try {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      alert('Import failed: invalid JSON file.');
      return;
    }

    if (!Array.isArray(parsed)) {
      alert('Import failed: JSON must be an array.');
      return;
    }

    if (!db) await openDB();

    let created = 0, updated = 0, skipped = 0;

    for (const rec of parsed) {
      if (!rec || typeof rec !== 'object') { skipped++; continue; }
      const workId = rec.workId || rec.id || rec.href;
      const reason = rec.reason ?? '';
      if (!workId) { skipped++; continue; }

      const toPut = { workId, reason, isHidden: rec.isHidden ?? true };
      const existing = await getWork(workId);
      existing ? updated++ : created++;
      await putWork(toPut);
    }

    alert(`Import complete.\nCreated: ${created}\nUpdated: ${updated}\nSkipped: ${skipped}`);

    if (confirm('Reload now to apply hides on this page?')) location.reload();

  } catch (e) {
    console.error(LOG, 'import failed', e);
    alert('Import failed. See console for details.');
  }
}

function promptImportHiddenWorks() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', () => {
    if (input.files && input.files[0]) importHiddenWorksFromFile(input.files[0]);
  }, { once: true });
  input.click();
}

function onHiddenWorksExport(e){
  try { e?.preventDefault?.(); } catch {}
  exportHiddenWorks();
}
function onHiddenWorksImport(e){
  try { e?.preventDefault?.(); } catch {}
  promptImportHiddenWorks();
}
function triggerHiddenWorksExport(){
  document.dispatchEvent(new CustomEvent(`${NS}:hidden-works-export`));
}
function triggerHiddenWorksImport(){
  document.dispatchEvent(new CustomEvent(`${NS}:hidden-works-import`));
}
function installBridge(){
  W.ao3hExportHiddenWorks = exportHiddenWorks;
  W.ao3hImportHiddenWorks = promptImportHiddenWorks;
  W.ao3hTriggerHiddenWorksExport = triggerHiddenWorksExport;
  W.ao3hTriggerHiddenWorksImport = triggerHiddenWorksImport;
  document.addEventListener(`${NS}:hidden-works-export`, onHiddenWorksExport);
  document.addEventListener(`${NS}:hidden-works-import`, onHiddenWorksImport);
}
function removeBridge(){
  document.removeEventListener(`${NS}:hidden-works-export`, onHiddenWorksExport);
  document.removeEventListener(`${NS}:hidden-works-import`, onHiddenWorksImport);
  if (W.ao3hExportHiddenWorks === exportHiddenWorks) delete W.ao3hExportHiddenWorks;
  if (W.ao3hImportHiddenWorks === promptImportHiddenWorks) delete W.ao3hImportHiddenWorks;
  if (W.ao3hTriggerHiddenWorksExport === triggerHiddenWorksExport) delete W.ao3hTriggerHiddenWorksExport;
  if (W.ao3hTriggerHiddenWorksImport === triggerHiddenWorksImport) delete W.ao3hTriggerHiddenWorksImport;
}

/* ------------------------------- Lifecycle ------------------------------ */
// Migration: old shared DB -> new per-user DB
async function migrateFromSharedDB() {
  try {
    const oldDBName = 'ao3h-hiddenWorksDB';

    // Check if old DB exists
    const databases = await indexedDB.databases?.() || [];
    const hasOldDB = databases.some(d => d.name === oldDBName);
    if (!hasOldDB) return;

    // Open old DB
    const oldDB = await new Promise((resolve, reject) => {
      const req = indexedDB.open(oldDBName, 1);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });

    // Read all works from old DB
    const oldWorks = await new Promise((resolve, reject) => {
      const tx = oldDB.transaction(['works'], 'readonly');
      const req = tx.objectStore('works').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(new Error('getAll failed'));
    });

    oldDB.close();

    if (oldWorks.length === 0) return;

    // Open new per-user DB
    if (!db) await openDB();

    // Transfer works to new DB
    for (const work of oldWorks) {
      const existing = await getWork(work.workId);
      if (!existing) await putWork(work);
    }
  } catch (e) {
    console.warn(LOG, 'Migration from shared DB failed:', e);
  }
}

// Legacy migration: localStorage -> IndexedDB (ignore malformed values gracefully)
async function transferFromLocalStorage() {
  try {
    const raw = localStorage.getItem('ao3HiddenWorks');
    if (!raw) return;
    let legacy = {};
    try {
      legacy = JSON.parse(raw);
    } catch {
      // Handle accidental "[object Object]" or other junk without throwing UI errors
      console.warn(LOG, 'legacy store invalid JSON; skipping migration');
      localStorage.removeItem('ao3HiddenWorks');
      return;
    }
    const keys = Object.keys(legacy || {});
    if (!keys.length) return;
    if (!db) await openDB();
    for (const workId of keys) {
      const reason = legacy[workId];
      const existing = await getWork(workId);
      if (!existing) await putWork({ workId, reason, isHidden: true });
    }
    localStorage.removeItem('ao3HiddenWorks');
  } catch (e) { console.warn(LOG, 'legacy transfer skipped', e); }
}

async function initialPass() {
  const $ = (W.jQuery || W.$);
  $('ol.index li.blurb').each((_, el) => {
    const $b = $(el);
    ensureHideButton($b);
  });

  // Re-apply persisted hidden state (skip re-hiding items currently temp-shown)
  const all = await getAllWorks();
  $('ol.index li.blurb').each((_, el) => {
    const $b = $(el);
    const id = workIdFromBlurb($b);
    const rec = all.find(r => r.workId === id);
    if (rec && rec.isHidden) {
      if (tempShow.has(id)) {
        showWork(el); // keep it shown temporarily
      } else {
        hideWork(el, rec.reason || '');
      }
    }
  });
}
// Delegated events (one-time wire)
let delegatesWired = false;
function wireDelegatesOnce(){
  if (delegatesWired) return;
  const $doc = (W.jQuery || W.$)(document);

  // SHOW = temporary reveal (DB unchanged, mark in tempShow)
  $doc.on('click.skipWorks', `.${NS}-m5-hidebar .show`, async function () {
    const $b = (W.jQuery || W.$)(this).closest('li');
    const blurbEl = $b[0];
    if (!blurbEl) return;
    const id = workIdFromBlurb($b);
    if (!id) return;
    showWork(blurbEl);
    tempShow.add(id); saveTempShow();
  });

  // UNHIDE = permanent (set isHidden=false but keep the note)
  $doc.on('click.skipWorks', `.${NS}-m5-hidebar .unhide`, async function () {
    const $b = (W.jQuery || W.$)(this).closest('li');
    const blurbEl = $b[0];
    if (!blurbEl) return;
    const id = workIdFromBlurb($b);
    if (!id) return;
    if (!confirm('Unhide this work permanently (until you hide it again)?')) return;
    showWork(blurbEl);
    tempShow.delete(id); saveTempShow();
    try {
      const rec = (await getWork(id)) || { workId: id, reason: '' };
      rec.isHidden = false;
      await putWork(rec);
    } catch (e) { console.error(LOG, 'unhide failed', e); }
  });

  // EDIT = update reason and keep hidden
  $doc.on('click.skipWorks', `.${NS}-m5-hidebar .edit-reason`, async function () {
    const $b = (W.jQuery || W.$)(this).closest('li');
    const blurbEl = $b[0];
    if (!blurbEl) return;
    const id = workIdFromBlurb($b);
    const $reason = (W.jQuery || W.$)(this).closest(`.${NS}-m5-hidebar`).find('.reason-text');
    const current = $reason.text();
    const nextPicked = await pickReasonCenteredMinimal(current || '');
    if (nextPicked === null) return; // cancelled
    const next = String(nextPicked).trim();
    if (!next) return;
    $reason.text(next);
    try {
      const rec = (await getWork(id)) || { workId: id };
      rec.reason = next;
      rec.isHidden = true;
      await putWork(rec);
    } catch (e) { console.error(LOG, 'edit failed', e); }
  });

  delegatesWired = true;
}

// Auto-observe list updates (AJAX pagination, filters, etc.)
let listObserver = null;

function observeList(){
  const root = document.querySelector('ol.index');
  if (!root) return;
  // Debounce to 300ms to avoid racing with hideByTags (debounced at 250ms)
  listObserver = observe(root, { childList:true, subtree:true }, debounce(() => {
    const $ = (W.jQuery || W.$);
    $('ol.index li.blurb').each((_, el) => ensureHideButton($(el)));
  }, 300));
}

// Config panel rendering lives in lib/ui/panel/configs/skipWorks-config.js

// ── Live re-apply when displayMode changes in panel ──────────────────────
async function reapplyDisplayMode() {
  const mode = getSetting('displayMode', 'block');
  if (mode === 'remove') {
    // block → remove: convert grey-bar blurbs to fully hidden
    document.querySelectorAll(`.${NS}-m5-hidebar`).forEach(bar => {
      const blurbEl = bar.parentElement;
      if (!blurbEl) return;
      const reason = bar.querySelector('.reason-text')?.textContent || '';
      showWork(blurbEl);
      hideWork(blurbEl, reason);
    });
  } else {
    // remove → block: convert fully-hidden blurbs back to grey bar
    const hidden = Array.from(document.querySelectorAll('[data-ao3h-hidden]'));
    for (const blurbEl of hidden) {
      const workId = workIdFromBlurb($(blurbEl));
      showWork(blurbEl);
      try {
        const rec = workId ? await getWork(workId) : null;
        hideWork(blurbEl, rec?.reason || '');
      } catch {
        hideWork(blurbEl, '');
      }
    }
  }
}

function onSettingsChanged(e) {
  if (e.detail?.moduleId !== MOD) return;
  if ('displayMode' in (e.detail?.settings || {})) {
    reapplyDisplayMode();
  }
}

async function init() {
  // skipWorks runs on all AO3 listing pages (no route guard)
  if (!W.jQuery && !W.$) {
    console.error(LOG, 'jQuery not found on page');
    return () => {};
  }

  if (!db) await openDB();
  tempShow = loadTempShow();

  // Run migrations in order: localStorage -> shared DB -> per-user DB
  await transferFromLocalStorage();
  await migrateFromSharedDB();

  wireDelegatesOnce();
  await initialPass();
  installBridge();
  document.addEventListener(EV_SETTINGS_CHANGED, onSettingsChanged);
  observeList();

  return stop;
}

register(MOD, { title: 'Skip Works', enabledByDefault: true }, init);

// Optional cleanup hook if you wire enable/disable later
function stop(){
  clearTempShow();
  document.removeEventListener(EV_SETTINGS_CHANGED, onSettingsChanged);
  removeBridge();
  if (W.jQuery || W.$) (W.jQuery || W.$)(document).off('.skipWorks');
  delegatesWired = false;
  if (listObserver) { listObserver.disconnect(); listObserver = null; }
  // Remove Hide buttons
  document.querySelectorAll(`.${NS}-m5-hide-btn`).forEach(el => el.remove());
  // Restore all hidden blurbs
  document.querySelectorAll(`.${NS}-m5-hidebar`).forEach(bar => {
    const blurbEl = bar.parentElement;
    if (blurbEl) showWork(blurbEl);
  });
  document.querySelectorAll('[data-ao3h-hidden]').forEach(el => showWork(el));
  if (db) {
    try { db.close(); } catch {}
    db = null;
  }
}
