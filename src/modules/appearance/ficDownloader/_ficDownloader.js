/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Downloader Coordinator

    Module ID: ficDownloader
    Display Name: Fic Downloader
    Tab: Appearance & Tools

    Purpose
        Coordinates individual and batch downloads, complete-page downloads,
        format and Kindle controls, offline storage, and Later Shelf caching.

    Submodules
        individualDownloads.js   — Adds download actions to work blurbs.
        batchDownload.js         — Manages batch selection and downloads.
        completePageDownload.js  — Downloads all works from the current page.
        downloadEnhancements.js  — Provides format and Kindle controls.
        offlineLibrary.js        — Stores and serves works for offline reading.

    Notes
        Depends on laterShelf for optional automatic caching. Complete-page
        downloads use window.JSZip when available and otherwise fall back to
        individual files. The combined API is exposed as AO3H.ficDownloader.

═══════════════════════════════════════════════════════════════════════════ */



/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import styles from './ficDownloader.css?inline';

import { BlurbDownloadButton } from './individualDownloads.js';
import { BatchDownload } from './batchDownload.js';
import { CompletePageDownload } from './completePageDownload.js';
import { DownloadEnhancements } from './downloadEnhancements.js';
import { OfflineLibrary } from './offlineLibrary.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';
import { getLogger } from '../../../../lib/utils/logger.js';
const log = getLogger('ficDownloader');



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-ficDownloader');

const MOD  = 'ficDownloader';
const LOG  = `[AO3H][${MOD}]`;

// ── Default config ─────────────────────────────────────────────────────────
const DEFAULTS = {
  defaultFormat:            'epub',
  sendToKindleEnabled:      false,
  autoCacheMFL:             false,
  kindleEmail:              '',
  autoKindleSend:           false,
  showQuickDownloadButtons: true,
  calibreEnabled:           false,
  calibreUrl:               'http://localhost:8080',
  calibreLibrary:           '',
};

// globalConfig: true préserve le fallback historique sur window.AO3H_Config,
// mais la priorité passe désormais aux réglages du panneau (ao3h:mod:ficDownloader:settings),
// jamais lus jusqu'ici — bug documenté dans shared.md (I3).
const cfg = makeCfg(MOD, DEFAULTS, { globalConfig: true });



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function initAutoCacheMFL (offlineInst) {
  async function handler (e) {
    const { workId, title, author } = e.detail || {};
    if (!workId || offlineInst.isCached(workId)) return;
    const html = await offlineInst.fetchWorkHtml(workId);
    if (html) offlineInst.saveWork(workId, title || workId, author || '', html);
  }
  document.addEventListener(EV_MARKED_FOR_LATER, handler);
  return () => document.removeEventListener(EV_MARKED_FOR_LATER, handler);
}

export function getBlurbInfo (blurb) {
  const titleLink  = blurb.querySelector('h4.heading > a');
  const authorLink = blurb.querySelector('a[rel="author"]');
  const fandomLink = blurb.querySelector('.fandoms a');
  const ratingEl   = blurb.querySelector('.rating .text');
  return {
    workId: extractWorkIdFromBlurb(blurb),
    title:  titleLink?.textContent.trim()  || 'Untitled',
    author: authorLink?.textContent.trim() || 'Anonymous',
    fandom: fandomLink?.textContent.trim() || '',
    rating: ratingEl?.textContent.trim()   || '',
  };
}

export function buildWorkHTML ({ title, author, summary = '', notes = '', chaptersHTML = '' }) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - ${escapeHtml(author)}</title>
<style>body{font-family:Georgia,'Times New Roman',serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#333}h1{color:#2c5f8a;font-size:2em;margin-bottom:10px}.author{font-size:1.2em;color:#666;margin-bottom:30px}.summary{background:#f9f9f9;padding:20px;border-left:4px solid #2c5f8a;margin:30px 0}.notes{background:#fff8dc;padding:15px;margin:20px 0;border:1px solid #ddd;border-radius:4px}hr{border:0;border-top:2px solid #ddd;margin:40px 0}</style>
</head><body><h1>${escapeHtml(title)}</h1><p class="author"><em>by ${escapeHtml(author)}</em></p>
${summary ? `<div class="summary"><strong>Summary:</strong><br>${summary}</div>` : ''}
${notes ? `<div class="notes">${notes}</div>` : ''}<hr><div id="content">${chaptersHTML}</div></body></html>`;
}



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  {
    displayName:  'Fic Downloader',
    description:  'Download works as HTML files, with batch selection, offline caching, format picker, and optional Kindle support.',
    tab:          'appearance',
    dependencies: ['laterShelf'],
  },
  async function init () {
    AO3H.ficDownloader = { buildWorkHTML, getBlurbInfo };
    const logger    = AO3H.logger || null;
    const instances = [];
    const cleanups  = [];

    // ── Per-blurb ⬇️ icons ────────────────────────────────────────────────
    const blurbInst = new BlurbDownloadButton({ logger, enabled: cfg('showQuickDownloadButtons') });
    blurbInst.init();
    instances.push(blurbInst);

    // ── Batch checkboxes + floating toolbar ───────────────────────────────
    const batchInst = new BatchDownload({ logger });
    batchInst.init();
    instances.push(batchInst);

    // ── Download All page → HTML files + index page ───────────────────────
    const completeInst = new CompletePageDownload({ logger });
    completeInst.init();
    instances.push(completeInst);

    // ── Format selector + Send to Kindle button ───────────────────────────
    const enhInst = new DownloadEnhancements({
      logger,
      kindleEnabled:   cfg('sendToKindleEnabled'),
      autoKindleSend:  cfg('autoKindleSend'),
      calibreEnabled:  cfg('calibreEnabled'),
      // Sans ce câblage, les boutons "⬇ DL" de DownloadEnhancements ignoraient
      // le réglage du panneau (seul BlurbDownloadButton le respectait).
      showListingBtns: cfg('showQuickDownloadButtons'),
    });
    enhInst.init();
    // Seed Kindle email from panel setting if user hasn't overridden it yet
    if (cfg('kindleEmail')) enhInst.setKindleEmail(cfg('kindleEmail'));
    // Seed Calibre server config from panel settings
    if (cfg('calibreUrl')) enhInst.setCalibreConfig(cfg('calibreUrl'), cfg('calibreLibrary'));
    // Seed default format if no format has been saved via the in-page selector
    if (!localStorage.getItem('ao3h:ficDownloader:format')) enhInst.setFormat(cfg('defaultFormat'));
    instances.push(enhInst);

    // ── Offline library (Save / Read Offline buttons) ─────────────────────
    const offlineInst = new OfflineLibrary({ logger });
    offlineInst.init();
    instances.push(offlineInst);

    // ── Auto-cache MFL ────────────────────────────────────────────────────
    if (cfg('autoCacheMFL') && offlineInst) {
      cleanups.push(initAutoCacheMFL(offlineInst));
    }

    // ── Public API ────────────────────────────────────────────────────────
    AO3H.ficDownloader = {
      buildWorkHTML,
      getBlurbInfo,
      getFormat:       () => enhInst?.getFormat?.()          ?? 'epub',
      setFormat:       (fmt) => enhInst?.setFormat?.(fmt),
      getOfflineWorks: () => offlineInst?.getAllWorks?.()     ?? {},
      saveOffline:     (id, t, a, h) => offlineInst?.saveWork?.(id, t, a, h),
      removeOffline:   (id) => offlineInst?.removeWork?.(id),
    };

    log.debug(`${LOG} init complete`);

    return function cleanup () {
      instances.forEach(inst => inst.cleanup?.());
      cleanups.forEach(fn => typeof fn === 'function' && fn());
      delete AO3H.ficDownloader;
      log.debug(`${LOG} cleanup complete`);
    };
  }
);
