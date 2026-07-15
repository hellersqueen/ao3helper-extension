/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Appreciation Coordinator
    Module ID:    ficAppreciation
    Display Name: Fic Appreciation
    Tab:          Library

    Submodules (instantiated by this coordinator, imported directly as ES modules):
        MarkAsFinished      -- completion tracker
        KudosTracker        -- kudos detection & badges
        KudosDisplay        -- kudos badge display layer
        KudosTracking       -- cross-tab sync & manual check
        KudosManager        -- orchestrates kudos submodules
        KudosExtendedFeatures -- kudos analytics & export
        StarRatings         -- 1-5 star personal ratings
        MultiStatusTracker  -- 7-status reading tracker

    Storage keys (read/written through AO3H.store.lsGet/lsSet — the Core's storage
    helper, equivalent to localStorage.getItem/setItem('ao3h:' + key) ; despite
    AO3H.store being a "per-user" wrapper, its lsGet/lsSet pass through to the
    same raw synchronous localStorage as everywhere else — only the async
    get/set/del (GM-value backed) are namespaced per detected AO3 username):
        ficAppreciation:finished  -- { [workId]: { date, note? } }
        ficAppreciation:kudosed   -- { [workId]: { date } }
        ficAppreciation:ratings   -- { [workId]: { stars, note? } }
        ficAppreciation:status    -- { [workId]: { status, date, note? } }

    Public API (AO3H.ficAppreciation):
        isFinished(workId), hasGivenKudos(workId), getRating(workId),
        getStatus(workId), markFinished(workId, note?), recordKudos(workId),
        getKudosStats(), getStatusStats(), exportKudos(format), exportStatuses(format)

═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, observe } from '../../../../lib/utils/index.js';
import { extractWorkIdFromHref, extractWorkIdFromBlurb as parseWorkIdFromBlurb, isWorkPage } from '../../../../lib/ao3/parsers.js';
import styles from './ficAppreciation.css?inline';

import { MarkAsFinished } from './markAsFinished.js';
import { KudosTracker } from './kudosTracker.js';
import { KudosDisplay } from './kudosDisplay.js';
import { KudosTracking } from './kudosTracking.js';
import { KudosManager } from './kudosManager.js';
import { KudosExtendedFeatures } from './kudosExtendedFeatures.js';
import { StarRatings } from './starRatings.js';
import { MultiStatusTracker } from './multiStatusTracker.js';

css(styles, 'ao3h-ficAppreciation');

const W   = getGlobalWindow();
const NS  = 'ao3h';
const MOD = 'ficAppreciation';

// ── Config helpers ────────────────────────────────────────────────────────
const DEFAULTS = {
  completionNotes:        false,
  showRatingOnBlurbs:     true,
  ratingNotes:            false,
  commentAssistOnRevisit: false,
  filterCompletedWorks:   true,
  quickKudosButton:       false,
  hideKudosedFilter:      false,
  showManualCheckButton:  false,
  statusNotes:            true,
  hideStatusFilter:       [],      // array of status keys to hide, e.g. ['finished','dropped']
  tooltipDateFormat:      'long',  // 'long' | 'short' | 'relative'
  kudosIcon:              '',      // custom icon string, e.g. '❤️'; '' = use default 🧡
};

function cfg (key) {
  const CFG = W.AO3H_Config?.[MOD]?.defaults || {};
  // Étape 318 : AO3H importé (avant : lecture window.AO3H)
  if (AO3H.flags?.get) {
    const v = AO3H.flags.get(`mod:${MOD}:${key}`);
    if (v !== undefined && v !== null) return v;
  }
  return key in CFG ? CFG[key] : (key in DEFAULTS ? DEFAULTS[key] : null);
}

// ── Storage helpers ───────────────────────────────────────────────────────
function storeGet (key, def) {
  try { return AO3H.store?.lsGet?.(key, def) ?? def; } catch { return def; }
}
function storeSet (key, val) {
  try { AO3H.store?.lsSet?.(key, val); } catch {}
}

// ── Route helpers ─────────────────────────────────────────────────────────
function isListingPage () {
  return /^\/works$/.test(location.pathname) ||
         /^\/tags\/[^/]+\/works/.test(location.pathname) ||
         /^\/users\/[^/]+\/(bookmarks|works)/.test(location.pathname) ||
         /^\/collections\/[^/]+\/works/.test(location.pathname);
}
function getWorkIdFromPath () {
  return extractWorkIdFromHref(location.pathname);
}
function getWorkIdFromBlurb (blurb) {
  return parseWorkIdFromBlurb(blurb);
}

// ── Module registration ───────────────────────────────────────────────────
register(MOD, {
  title: 'Fic Appreciation',
  enabledByDefault: false,
}, async function init () {

  // Instantiate submodules
  const diOpts = { NS, storeGet, storeSet, cfg };

  const maf  = new MarkAsFinished(diOpts);
  const kt   = new KudosTracker(diOpts);
  const kd   = new KudosDisplay(diOpts);
  const ktr  = new KudosTracking(diOpts);
  const km   = new KudosManager({ ...diOpts, kudosTracker: kt, kudosDisplay: kd, kudosTracking: ktr });
  const kef  = new KudosExtendedFeatures({ storeGet });
  const sr   = new StarRatings(diOpts);
  const mst  = new MultiStatusTracker(diOpts);
  const hiddenBlurbs = new Map();

  function hideBlurb (blurb) {
    if (!hiddenBlurbs.has(blurb)) hiddenBlurbs.set(blurb, blurb.style.display);
    blurb.style.display = 'none';
    blurb.dataset.faHidden = '1';
  }

  function restoreBlurb (blurb) {
    if (!hiddenBlurbs.has(blurb)) return;
    blurb.style.display = hiddenBlurbs.get(blurb);
    hiddenBlurbs.delete(blurb);
    delete blurb.dataset.faHidden;
  }

  function restoreHiddenBlurbs () {
    hiddenBlurbs.forEach((display, blurb) => {
      blurb.style.display = display;
      delete blurb.dataset.faHidden;
    });
    hiddenBlurbs.clear();
  }

  // Expose public API (AO3H importé — étape 318)
  AO3H.ficAppreciation = {
    isFinished:      (id)        => maf.isFinished(id),
    hasGivenKudos:   (id)        => kt.hasGivenKudos(id),
    getRating:       (id)        => sr.getRating(id),
    getStatus:       (id)        => mst.getStatus(id),
    markFinished:    (id, note)  => maf.markFinished(id, note),
    recordKudos:     (id)        => kt.recordKudos(id),
    getKudosStats:   ()          => kef.getStats(),
    getStatusStats:  ()          => mst.getStats(),
    exportKudos:     (fmt)       => kef.exportKudos(fmt),
    exportStatuses:  (fmt)       => mst.exportStatuses(fmt),
  };

  function processBlurbs () {
    const hideStatuses = cfg('hideStatusFilter') || [];
    document.querySelectorAll('li.work.blurb, li.bookmark.blurb, li.blurb').forEach(blurb => {
      const workId = getWorkIdFromBlurb(blurb);
      if (!workId) return;
      // Listing filters
      if (cfg('filterCompletedWorks') && maf.isFinished(workId)) {
        hideBlurb(blurb); return;
      }
      if (cfg('hideKudosedFilter') && kt.hasGivenKudos(workId)) {
        hideBlurb(blurb); return;
      }
      if (hideStatuses.length && mst.shouldHide(workId, hideStatuses)) {
        hideBlurb(blurb); return;
      }
      restoreBlurb(blurb);
      maf.applyFinishedBadge(blurb, workId);
      km.wireBlurb(blurb, workId);
      sr.applyRatingBadge(blurb, workId);
      mst.applyStatusBadge(blurb, workId);
      mst.injectStatusToggle(blurb, workId);
    });
  }

  const workId = getWorkIdFromPath();

  if (isWorkPage() && workId) {
    maf.injectFinishButton(workId);
    km.wireWorkPage(workId);
    sr.injectStarWidgetOnWorkPage(workId);
    mst.injectWorkPageStatusToggle(workId);

    // Cross-tab kudos sync: refresh badge if another tab gives kudos
    km.startTabSync((changedId) => {
      if (changedId === workId) km.wireWorkPage(workId);
    });

    return () => {
      document.getElementById(`${NS}-fa-finish-btn`)?.remove();
      document.getElementById(`${NS}-fa-star-widget`)?.remove();
      document.getElementById(`${NS}-fa-revisit-prompt`)?.remove();
      document.getElementById(`${NS}-fa-kudos-check-btn`)?.remove();
      document.getElementById(`${NS}-fa-work-status`)?.remove();
      km.cleanup();
      delete AO3H.ficAppreciation;
    };

  } else if (isListingPage()) {
    processBlurbs();

    const root     = document.querySelector('#main') || document.body;
    const observer = observe(root, { childList: true, subtree: true }, () => processBlurbs());

    return () => {
      observer.disconnect();
      restoreHiddenBlurbs();
      document.querySelectorAll(
        `.${NS}-fa-badge, .${NS}-fa-blurb-btn, .${NS}-fa-stars, .${NS}-fa-status-select`
      ).forEach(el => el.remove());
      document.querySelectorAll('[data-fa-finished], [data-fa-kudos], [data-fa-rating], [data-mst-badge], [data-mst-toggle]').forEach(el => {
        delete el.dataset.faFinished;
        delete el.dataset.faKudos;
        delete el.dataset.faRating;
        delete el.dataset.mstBadge;
        delete el.dataset.mstToggle;
      });
      km.cleanup();
      delete AO3H.ficAppreciation;
    };
  }

  return () => {
    restoreHiddenBlurbs();
    km.cleanup();
    delete AO3H.ficAppreciation;
  };
});
