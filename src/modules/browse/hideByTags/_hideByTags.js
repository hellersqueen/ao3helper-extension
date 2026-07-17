/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Hide By Tags Coordinator

    Module ID: hideByTags
    Display Name: Hide By Tags
    Tab: Browse

    Purpose
        Coordinates tag hiding, text-based NOPE filters, whitelist exceptions,
        session overrides, management interfaces, and dynamic list processing.

    Submodules
        hiddenTags.js          — Stores hidden tags and folds matching works.
        nopeWords.js           — Matches configured words in selected text areas.
        whitelistExceptions.js — Rescues or annotates works with allowed tags.

    Notes
        Per-user storage is shared across all three submodules. Notes events and
        live settings changes trigger reprocessing, while dynamic blurbs are
        handled through a debounced observer.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { onReady, observe, debounce, css } from '../../../../lib/utils/index.js';
import { Storage } from '../../../../lib/storage/index.js';
import { wrapStorageForUser, UserLocalStorage } from '../../../../lib/storage/user.js';
import { Flags } from '../../../../lib/utils/config.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { EV_SETTINGS_CHANGED, EV_OPEN_HIDE_MANAGER } from '../../../../lib/utils/event-names.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import styles from './hideByTags.css?inline';

import { HiddenTags } from './hiddenTags.js';
import { NopeWords } from './nopeWords.js';
import { WhitelistExceptions } from './whitelistExceptions.js';
import { countHiddenBlurbs, renderHiddenCounter } from './hiddenCounter.js';
import { addTempHide, getActiveTempHides } from './tempHides.js';
import { getCustomNoiseWords, isNoiseTag, mergeNoisePatterns, NOISE_PATTERNS } from '../tagsDisplay/noiseTagUtils.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-hideByTags');

const W = getGlobalWindow();

// AO3H.store resolves to wrapStorageForUser(Storage) (src/core/lifecycle.js) —
// reproduced directly via imports rather than going through window.AO3H.store.
const wrappedStorage = wrapStorageForUser(Storage);
const NS          = 'ao3h';
const KeyboardNav = W.AO3H_Common?.KeyboardNavigation || {};
const UserLS      = UserLocalStorage;

let enabled        = false;
let observerActive = false;
let listObserver   = null;
let unwatchEnabled = null;
let active         = false;

// ── Submodule instances (set in init) ─────────────────────────────────────
let hiddenTagsInst = null;
let nopeWordsInst  = null;
let whitelistInst  = null;

const MOD = 'hideByTags';

const DEFAULTS = {
  hideMode:              'hide',
  tagMatchMode:          'exact', // 'exact' | 'contains'
  whitelistEnabled:      true,
  showWhitelistBadge:    true,
  whitelistMode:         'show',
  textFilterEnabled:     true,
  nopeHideMode:          'hide',
  nopeWholeWords:        false,
  nopeTargetSummaries:   true,
  nopeTargetNotes:       true,
  nopeTargetTitles:      false,
  showHiddenCounter:     true,
  dimOpacity:            25,    // % opacity of soft-hidden works
  dimBlur:               false, // additional blur on soft-hidden works
  protectBookmarked:     false, // never hide works saved in Bookmark Vault
  hideNoiseTaggedWorks:  false, // hide works carrying a tagsDisplay "noise" tag
};

function loadSettings () { return loadModuleSettings(MOD); }



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

/* ── Notes integration ─────────────────────────────────────────────────── */
const hiddenByNotes   = new Set();
// (session-only override: set data-wl-override="1" on the blurb directly)

function onNotesHidden(e) {
  const id = e?.detail?.workId;
  if (id) { hiddenByNotes.add(id); processList(); }
}
function onNotesVisible(e) {
  const id = e?.detail?.workId;
  if (id) { hiddenByNotes.delete(id); processList(); }
}

// Augment hiddenTagsInst.isHiddenByNotes to also check the in-memory set.
// Called after instantiation in init().
function patchIsHiddenByNotes () {
  const original = hiddenTagsInst.isHiddenByNotes.bind(hiddenTagsInst);
  hiddenTagsInst.isHiddenByNotes = (blurb) => {
    const id = hiddenTagsInst.getWorkIdFromBlurb(blurb);
    if (id && hiddenByNotes.has(id)) return true;
    return original(blurb);
  };
}

/* ── List processing ───────────────────────────────────────────────────── */

let counterEl = null;

function updateHiddenCounter (s) {
  const count = countHiddenBlurbs(hiddenTagsInst.getWorkBlurbs(), NS);
  counterEl = renderHiddenCounter({
    doc: document, NS, count,
    enabled: s.showHiddenCounter ?? true,
    el: counterEl,
    onRescan: () => run(),
  });
}

/** Prepend (or refresh) a muted reason strip on a dimmed blurb. */
function applyDimStrip (blurb, prefix, tag) {
  blurb.querySelector(`.${NS}-dim-strip`)?.remove();
  const strip = document.createElement('div');
  strip.className = `${NS}-dim-strip`;
  strip.appendChild(document.createTextNode(prefix));
  const strong = document.createElement('strong');
  strong.className = `${NS}-dim-tag`;
  strong.textContent = tag;
  strip.appendChild(strong);
  blurb.prepend(strip);
}

async function processList () {
  if (!active || !enabled || !hiddenTagsInst) return;

  const hiddenList = await hiddenTagsInst.getHidden();
  const hiddenSet  = new Set(hiddenList);
  // Day-scoped hides (Shift+click on the 🚫 icon) join the permanent list
  getActiveTempHides().forEach(tag => hiddenSet.add(tag));

  const s = loadSettings();
  const hideMode    = s.hideMode ?? 'hide';
  const matchMode   = s.tagMatchMode === 'contains' ? 'contains' : 'exact';

  // Soft-hide appearance: configurable opacity + optional blur (CSS-driven)
  const opacity = Math.min(Math.max(parseInt(String(s.dimOpacity ?? 25), 10) || 25, 5), 90);
  document.documentElement.style.setProperty(`--${NS}-hbt-dim-opacity`, String(opacity / 100));
  document.documentElement.classList.toggle(`${NS}-hbt-dim-blur`, !!s.dimBlur);

  // Works saved in Bookmark Vault are never hidden when protection is on
  let vaultIds = null;
  if (s.protectBookmarked) {
    try {
      const data = JSON.parse(localStorage.getItem('ao3h:bookmarkVault:data') || '{}');
      vaultIds = new Set(Object.keys(data && typeof data === 'object' ? data : {}));
    } catch { vaultIds = null; }
  }

  // tagsDisplay "noise tag" integration: works carrying a noise tag get hidden
  const noisePatterns = s.hideNoiseTaggedWorks
    ? mergeNoisePatterns(NOISE_PATTERNS, getCustomNoiseWords())
    : null;
  const wlEnabled   = !!(s.whitelistEnabled ?? true);
  let wlSet = new Set(), showWLBadge = false, wlMode = 'show';
  if (wlEnabled) {
    wlSet       = new Set(await whitelistInst.getWhitelistTags());
    showWLBadge = !!(s.showWhitelistBadge ?? true);
    wlMode      = s.whitelistMode ?? 'show';
  }

  const textFilterEnabled = !!(s.textFilterEnabled ?? true);
  let nopeWords = [], nopeHideMode = 'hide';
  let nopeTargets = { summaries: true, notes: true, titles: false };
  if (textFilterEnabled) {
    nopeWords    = await nopeWordsInst.getNopeWords();
    nopeHideMode = s.nopeHideMode ?? 'hide';
    nopeTargets  = {
      summaries: !!(s.nopeTargetSummaries ?? true),
      notes:     !!(s.nopeTargetNotes ?? true),
      titles:    !!(s.nopeTargetTitles ?? false),
    };
  }
  if (!active || !enabled) return;

  // Build remove callbacks — passed into hiddenTagsInst.wrapWork()
  function buildRemoveCbs (hideType) {
    if (hideType === 'nope') {
      return { nope: async (word) => { await nopeWordsInst.removeNopeWord(word); await processList(); } };
    } else if (hideType === 'wl-folded') {
      return { whitelist: async (tag) => { await whitelistInst.removeWhitelistTag(tag); await processList(); } };
    } else {
      return { blacklist: async (tag) => { await hiddenTagsInst.removeHiddenTag(tag); await processList(); } };
    }
  }

  const blurbs = hiddenTagsInst.getWorkBlurbs();

  blurbs.forEach(blurb => {
    const scopeForTags = blurb.querySelector(`.${NS}-cut`) || blurb;

    // Bookmark Vault protection: never hide a work the user has saved
    if (vaultIds?.size) {
      const workId = hiddenTagsInst.getWorkIdFromBlurb(blurb);
      if (workId && vaultIds.has(String(workId))) {
        hiddenTagsInst.clearWLHighlights(blurb);
        blurb.classList.remove(`${NS}-dimmed`);
        blurb.querySelector(`.${NS}-dim-strip`)?.remove();
        if (blurb.classList.contains(`${NS}-wrapped`)) hiddenTagsInst.unwrapWork(blurb);
        else hiddenTagsInst.forceShow(blurb);
        return;
      }
    }

    // NOPE words check
    if (textFilterEnabled && nopeWords.length > 0) {
      const matchedWord = nopeWordsInst.matchesNope(blurb, nopeWords, nopeTargets, { wholeWords: !!s.nopeWholeWords });
      if (matchedWord) {
        hiddenTagsInst.clearWLHighlights(blurb);
        if (nopeHideMode === 'dim') {
          if (blurb.classList.contains(`${NS}-wrapped`)) hiddenTagsInst.unwrapWork(blurb);
          blurb.classList.add(`${NS}-dimmed`);
          applyDimStrip(blurb, '⛔ Soft-hidden — NOPE word: ', matchedWord);
        } else {
          blurb.querySelector(`.${NS}-dim-strip`)?.remove();
          blurb.classList.remove(`${NS}-dimmed`);
          hiddenTagsInst.wrapWork(blurb, [`⛔ "${matchedWord}"`], buildRemoveCbs, null, 'nope');
        }
        return;
      }
    }

    const reasons = hiddenTagsInst.reasonsFor(scopeForTags, hiddenSet, { matchMode });

    // tagsDisplay integration: a "noise" tag on the work counts as a reason
    if (noisePatterns) {
      const noiseTag = Array.from(scopeForTags.querySelectorAll('a.tag'))
        .map(a => a.textContent.trim())
        .find(text => text && isNoiseTag(text, noisePatterns));
      if (noiseTag) reasons.push(`noise tag: ${noiseTag}`);
    }

    if (reasons.length === 0) {
      hiddenTagsInst.clearWLHighlights(blurb);
      blurb.classList.remove(`${NS}-dimmed`);
      blurb.querySelector(`.${NS}-dim-strip`)?.remove();
      if (blurb.classList.contains(`${NS}-wrapped`)) hiddenTagsInst.unwrapWork(blurb);
      else hiddenTagsInst.forceShow(blurb);
      return;
    }

    // Whitelist check
    if (wlEnabled && wlSet.size > 0) {
      const blurbTags   = Array.from(scopeForTags.querySelectorAll('a.tag'))
        .map(a => hiddenTagsInst.canonicalFromAnchor(a)).filter(Boolean);
      const savedByTags = whitelistInst.savedBy(blurbTags, wlSet);

      if (savedByTags.length > 0) {
        const wlSavedLabel = savedByTags.join(', ');

        if (blurb.dataset.wlOverride === '1') {
          // ── Overridden: single fold row + "Show again" button appended to the fold ──
          blurb.querySelector(`.${NS}-wl-strip`)?.remove();
          blurb.classList.remove(`${NS}-wl-saved`);
          hiddenTagsInst.clearWLHighlights(blurb);

          if (hideMode === 'dim') {
            // Dim mode: work dimmed, strip prepended — already one row
            if (blurb.classList.contains(`${NS}-wrapped`)) hiddenTagsInst.unwrapWork(blurb);
            blurb.classList.add(`${NS}-dimmed`);
            const strip = document.createElement('div');
            strip.className = `${NS}-wl-strip ${NS}-wl-strip--hidden`;
            strip.innerHTML = `🔴 Hidden because: <span class="${NS}-wl-blocked">${reasons.join(', ')}</span> — kept by: <strong>${wlSavedLabel}</strong>`;
            const showBtn = document.createElement('button');
            showBtn.type      = 'button';
            showBtn.className = `${NS}-wl-hide-anyway`;
            showBtn.textContent = '↩ Show again';
            showBtn.title = 'Restore whitelist exception — show this work again';
            showBtn.addEventListener('pointerdown', (e) => {
              e.preventDefault();
              e.stopPropagation();
              delete blurb.dataset.wlOverride;
              strip.remove();
              blurb.classList.remove(`${NS}-dimmed`);
              hiddenTagsInst.forceShow(blurb);
              blurb.classList.add(`${NS}-wl-saved`);
              processList();
            });
            strip.appendChild(showBtn);
            blurb.prepend(strip);
          } else {
            // Hide mode: use wrapWork normally (single fold row), then append
            // "was kept by" info + "Show again" button directly onto the fold.
            // The button uses stopPropagation so it intercepts the click before
            // the fold's toggle handler, without needing to disable the fold.
            blurb.classList.remove(`${NS}-dimmed`);
            hiddenTagsInst.wrapWork(blurb, reasons, buildRemoveCbs);
            const fold = blurb.querySelector(`.${NS}-fold`);
            if (fold) {
              // Remove stale appended elements from a previous processList run
              fold.querySelector(`.${NS}-wl-hide-anyway`)?.remove();
              fold.querySelector(`.${NS}-wl-fold-note`)?.remove();
              // Remove the "Click to show" hint to keep the row concise
              fold.querySelector(`.${NS}-hint`)?.remove();
              const keptSpan = document.createElement('span');
              keptSpan.className = `${NS}-wl-fold-note`;
              keptSpan.innerHTML = ` — kept by: <strong>${wlSavedLabel}</strong>`;
              const showBtn = document.createElement('button');
              showBtn.type      = 'button';
              showBtn.className = `${NS}-wl-hide-anyway`;
              showBtn.textContent = '↩ Show again';
              showBtn.title = 'Restore whitelist exception — show this work again';
              showBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                delete blurb.dataset.wlOverride;
                hiddenTagsInst.unwrapWork(blurb);
                hiddenTagsInst.forceShow(blurb);
                blurb.classList.add(`${NS}-wl-saved`);
                processList();
              });
              fold.append(keptSpan, document.createTextNode(' '), showBtn);
            }
          }
          return;

        } else {
          // ── Normal whitelist rescue: show work with 🟢 banner ──
          if (wlMode === 'fold-note') {
            hiddenTagsInst.clearWLHighlights(blurb);
            blurb.classList.remove(`${NS}-dimmed`);
            hiddenTagsInst.wrapWork(blurb, reasons, buildRemoveCbs, wlSavedLabel);
          } else {
            if (blurb.classList.contains(`${NS}-wrapped`)) hiddenTagsInst.unwrapWork(blurb);
            else hiddenTagsInst.forceShow(blurb);
            blurb.classList.add(`${NS}-wl-saved`);
            if (showWLBadge) {
              let strip = blurb.querySelector(`.${NS}-wl-strip`);
              if (!strip) {
                strip = document.createElement('div');
                strip.className = `${NS}-wl-strip`;
                const header = blurb.querySelector('.header.module') || blurb.firstElementChild;
                blurb.insertBefore(strip, header);
              }
              // Update text span only — never touch the button so hover state is stable
              let textSpan = strip.querySelector(`.${NS}-wl-text`);
              if (!textSpan) {
                textSpan = document.createElement('span');
                textSpan.className = `${NS}-wl-text`;
                strip.insertBefore(textSpan, strip.firstChild);
              }
              textSpan.innerHTML = `🟢 Would be hidden because: <span class="${NS}-wl-blocked">${reasons.join(', ')}</span> — kept by: <strong>${wlSavedLabel}</strong>`;
              // Create button once; only update its label on subsequent runs
              let btn = strip.querySelector(`.${NS}-wl-hide-anyway`);
              if (!btn) {
                btn = document.createElement('button');
                btn.type      = 'button';
                btn.className = `${NS}-wl-hide-anyway`;
                btn.title = 'Hide this work despite the whitelist exception (this session only)';
                btn.addEventListener('pointerdown', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  blurb.dataset.wlOverride   = '1';
                  blurb.dataset.wlInteracted = '1';
                  processList();
                });
                strip.appendChild(btn);
              }
              btn.textContent = blurb.dataset.wlInteracted ? '↩ Hide again' : '↩ Hide anyway';
            } else {
              blurb.querySelector(`.${NS}-wl-strip`)?.remove();
            }
          }
          return;
        }
      }
    }

    hiddenTagsInst.clearWLHighlights(blurb);
    if (hideMode === 'dim') {
      if (blurb.classList.contains(`${NS}-wrapped`)) hiddenTagsInst.unwrapWork(blurb);
      blurb.classList.add(`${NS}-dimmed`);
      applyDimStrip(blurb, '🚫 Soft-hidden — tag: ', reasons.join(', '));
    } else {
      blurb.classList.remove(`${NS}-dimmed`);
      blurb.querySelector(`.${NS}-dim-strip`)?.remove();
      hiddenTagsInst.wrapWork(blurb, reasons, buildRemoveCbs);
    }
  });

  updateHiddenCounter(s);
}

function run () {
  if (!enabled) return;
  hiddenTagsInst.ensureInlineIcons(document, (root) => hiddenTagsInst.getWorkBlurbs(root));
  processList();
}

/* ── Feedback and manager bridges ──────────────────────────────────────── */

let liveRegion = null;

function ensureLiveRegion () {
  if (!liveRegion && KeyboardNav.createLiveRegion) {
    liveRegion = KeyboardNav.createLiveRegion({ politeness: 'polite' });
  }
}

function toast (msg) {
  hiddenTagsInst.toast(msg);
  liveRegion?.announce?.(msg);
}

// Shift+click on a 🚫 icon: hide the tag only until the end of the day
async function tempHideTag (canon) {
  addTempHide(canon);
  await processList();
  toast(`Hidden until end of day: ${canon}`);
}

// ── Always-on manager exposure ────────────────────────────────────────────

function openManager () {
  if (!hiddenTagsInst) return;
  hiddenTagsInst.openManager({ processList, toast });
}

function openNopeManager () {
  if (!nopeWordsInst) return;
  nopeWordsInst.openManager({ processList, toast });
}

function openWhitelistManager () {
  if (!whitelistInst) return;
    whitelistInst.openManager({ processList, toast });
}

function onOpenManager(e) { try { e?.preventDefault?.(); } catch {} openManager(); }
function onOpenNopeManager(e) { try { e?.preventDefault?.(); } catch {} openNopeManager(); }
function onOpenWhitelistManager(e) { try { e?.preventDefault?.(); } catch {} openWhitelistManager(); }

function installManagerBridge () {
  document.addEventListener(EV_OPEN_HIDE_MANAGER, onOpenManager);
  document.addEventListener(`${NS}:open-nope-manager`, onOpenNopeManager);
  document.addEventListener(`${NS}:open-whitelist-manager`, onOpenWhitelistManager);
  W.ao3hOpenHiddenTagsManager = openManager;
  W.ao3hOpenNopeWordsManager = openNopeManager;
  W.ao3hOpenWhitelistManager = openWhitelistManager;
}

function removeManagerBridge () {
  document.removeEventListener(EV_OPEN_HIDE_MANAGER, onOpenManager);
  document.removeEventListener(`${NS}:open-nope-manager`, onOpenNopeManager);
  document.removeEventListener(`${NS}:open-whitelist-manager`, onOpenWhitelistManager);
  if (W.ao3hOpenHiddenTagsManager === openManager) delete W.ao3hOpenHiddenTagsManager;
  if (W.ao3hOpenNopeWordsManager === openNopeManager) delete W.ao3hOpenNopeWordsManager;
  if (W.ao3hOpenWhitelistManager === openWhitelistManager) delete W.ao3hOpenWhitelistManager;
}

function onSettingsChanged (e) {
  if (e?.detail?.moduleId === MOD && enabled) processList();
}



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register('hideByTags', { title: 'Hide By Tags', enabledByDefault: true }, async function init () {
  active = true;
  // Instantiate submodules
  hiddenTagsInst = new HiddenTags({ NS, Storage: wrappedStorage, UserLS, KeyboardNav });
  nopeWordsInst  = new NopeWords({ NS, Storage: wrappedStorage, UserLS, KeyboardNav });
  whitelistInst  = new WhitelistExceptions({ NS, Storage: wrappedStorage, UserLS, KeyboardNav });

  patchIsHiddenByNotes();
  installManagerBridge();
  document.addEventListener(`${NS}:notes-hidden`, onNotesHidden);
  document.addEventListener(`${NS}:notes-visible`, onNotesVisible);
  document.addEventListener(EV_SETTINGS_CHANGED, onSettingsChanged);

  const ENABLE_KEY = 'mod:hideByTags:enabled';
  enabled = !!Flags.get(ENABLE_KEY, true);

  onReady(() => {
    if (!active) return;
    ensureLiveRegion();

    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('AO3 Helper: Manage hidden tags…', openManager);
      GM_registerMenuCommand('AO3 Helper: Manage NOPE words…', openNopeManager);
      GM_registerMenuCommand('AO3 Helper: Manage whitelist…', openWhitelistManager);
      GM_registerMenuCommand('AO3 Helper: Show hidden tags (console)', async () => {
        const list = await hiddenTagsInst.getHidden();
        console.log('[AO3H] Hidden tags (canonical):', list);
        toast(`${list.length} hidden tag(s) — see console`);
      });
      GM_registerMenuCommand('AO3 Helper: Export hidden tags (JSON)', async () => {
        const list = await hiddenTagsInst.getHidden();
        downloadJSON(list, 'ao3h-hidden-tags.json');
      });
      GM_registerMenuCommand('AO3 Helper: Import hidden tags (JSON)…', openManager);
      GM_registerMenuCommand('AO3 Helper: Re-scan page for hidden tags/words', () => { run(); toast('Page re-scanned'); });
    }

    if (enabled) {
      hiddenTagsInst.attachDelegates({ onTagHidden: processList, onTempHide: tempHideTag, toast });
      run();
      if (!observerActive) {
        listObserver = observe(document.body, debounce(run, 250));
        observerActive = true;
      }
    }
  });

  unwatchEnabled = Flags.watch(ENABLE_KEY, (val) => {
    if (!active) return;
    const wasEnabled = enabled;
    enabled = !!val;

    if (enabled && !wasEnabled) {
      hiddenTagsInst.attachDelegates({ onTagHidden: processList, onTempHide: tempHideTag, toast });
      run();
      if (!observerActive) {
        listObserver = observe(document.body, debounce(run, 250));
        observerActive = true;
      }
      return;
    }
    if (!enabled && wasEnabled) {
      hiddenTagsInst.getWorkBlurbs().forEach(b => hiddenTagsInst.unwrapWork(b));
      return;
    }
    if (enabled && wasEnabled) run();
  });

  return cleanup;
});

function cleanup () {
  active = false;
  enabled = false;
  listObserver?.disconnect();
  listObserver = null;
  observerActive = false;
  unwatchEnabled?.();
  unwatchEnabled = null;
  document.removeEventListener(`${NS}:notes-hidden`, onNotesHidden);
  document.removeEventListener(`${NS}:notes-visible`, onNotesVisible);
  document.removeEventListener(EV_SETTINGS_CHANGED, onSettingsChanged);
  removeManagerBridge();

  hiddenTagsInst?.getWorkBlurbs().forEach(blurb => {
    hiddenTagsInst.clearWLHighlights(blurb);
    blurb.querySelector(`.${NS}-dim-strip`)?.remove();
    blurb.classList.remove(`${NS}-dimmed`, `${NS}-wl-saved`, `${NS}-force-show`);
    delete blurb.dataset.wlOverride;
    delete blurb.dataset.wlInteracted;
    if (blurb.classList.contains(`${NS}-wrapped`)) hiddenTagsInst.unwrapWork(blurb);
  });
  hiddenTagsInst?.cleanup();
  document.querySelectorAll(`.${NS}-hide-ico, .${NS}-tag-comma`).forEach(el => el.remove());
  document.querySelectorAll(`.${NS}-tag-txt`).forEach(el => el.replaceWith(...el.childNodes));
  document.querySelectorAll(`.${NS}-tag-wrap`).forEach(el => el.classList.remove(`${NS}-tag-wrap`));
  document.querySelectorAll(`.${NS}-own-commas`).forEach(el => el.classList.remove(`${NS}-own-commas`));
  document.querySelectorAll(`.${NS}-mgr-backdrop, .${NS}-mgr`).forEach(el => el.remove());
  document.documentElement.classList.remove(`${NS}-lock`);
  document.body?.classList.remove(`${NS}-lock`);
  if (document.body) {
    document.body.style.top = '';
    delete document.body.dataset[`${NS}ScrollY`];
  }
  liveRegion?.remove?.();
  liveRegion = null;
  hiddenByNotes.clear();
  counterEl?.remove();
  counterEl = null;
}

console.log('[AO3H][hideByTags] registered');
