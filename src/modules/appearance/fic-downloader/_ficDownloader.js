/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Downloader Module Coordinator
    Module ID: ficDownloader
    Display Name: Fic Downloader
    Tab: Appearance & Tools

    Submodules (imported directly as ES modules):
        1. individualDownloads  ./individualDownloads.js  (BlurbDownloadButton)
        2. batchDownload        ./batchDownload.js        (BatchDownload)
        3. completePageDownload ./completePageDownload.js (CompletePageDownload)
        4. offlineLibrary       ./offlineLibrary.js       (OfflineLibrary)
        5. downloadEnhancements ./downloadEnhancements.js (DownloadEnhancements)

    Storage keys:
        ao3h:ficDownloader:format  — preferred download format
        ao3h:ficDownloader:kindle  — { enabled, email, autoSend }
        ao3h:OfflineReading:library — { [workId]: { title, author, html, date } }

    Public API (AO3H.ficDownloader):
        getFormat()      → string
        setFormat(fmt)
        getOfflineWorks()→ object
        saveOffline(workId, title, author, html)
        removeOffline(workId)

    Dependencies: laterShelf (auto-cache MFL works)
    External: JSZip optionnel (window.JSZip) — completePageDownload retombe sur
    des téléchargements individuels s'il est absent.

═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './ficDownloader.css?inline';

import { BlurbDownloadButton } from './individualDownloads.js';
import { BatchDownload } from './batchDownload.js';
import { CompletePageDownload } from './completePageDownload.js';
import { DownloadEnhancements } from './downloadEnhancements.js';
import { OfflineLibrary } from './offlineLibrary.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';

css(styles, 'ao3h-ficDownloader');

const W    = getGlobalWindow();
const MOD  = 'ficDownloader';
const LOG  = `[AO3H][${MOD}]`;

// ── Default config ─────────────────────────────────────────────────────────
const DEFAULTS = {
  defaultFormat:       'epub',
  sendToKindleEnabled: false,
  autoCacheMFL:        false,
  kindleEmail:         '',
  autoKindleSend:      false,
};

function cfg (key) {
  return W.AO3H_Config?.[MOD]?.defaults?.[key] ?? DEFAULTS[key];
}

// ── Auto-cache MFL listener ────────────────────────────────────────────────
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

// ── Module registration ────────────────────────────────────────────────────
register(
  MOD,
  {
    displayName:  'Fic Downloader',
    description:  'Download works as HTML files, with batch selection, offline caching, format picker, and optional Kindle support.',
    tab:          'appearance',
    dependencies: ['laterShelf'],
  },
  async function init () {
    const logger    = AO3H.logger || null;
    const instances = [];
    const cleanups  = [];

    // ── Per-blurb ⬇️ icons ────────────────────────────────────────────────
    const blurbInst = new BlurbDownloadButton({ logger });
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
    const enhInst = new DownloadEnhancements({ logger, kindleEnabled: cfg('sendToKindleEnabled'), autoKindleSend: cfg('autoKindleSend') });
    enhInst.init();
    // Seed Kindle email from panel setting if user hasn't overridden it yet
    if (cfg('kindleEmail')) enhInst.setKindleEmail(cfg('kindleEmail'));
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
      getFormat:       () => enhInst?.getFormat?.()          ?? 'epub',
      setFormat:       (fmt) => enhInst?.setFormat?.(fmt),
      getOfflineWorks: () => offlineInst?.getAllWorks?.()     ?? {},
      saveOffline:     (id, t, a, h) => offlineInst?.saveWork?.(id, t, a, h),
      removeOffline:   (id) => offlineInst?.removeWork?.(id),
    };

    console.info(`${LOG} init complete`);

    return function cleanup () {
      instances.forEach(inst => inst.cleanup?.());
      cleanups.forEach(fn => typeof fn === 'function' && fn());
      delete AO3H.ficDownloader;
      console.info(`${LOG} cleanup complete`);
    };
  }
);
