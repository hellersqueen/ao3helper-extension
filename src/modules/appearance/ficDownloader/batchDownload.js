/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Downloader › Batch Downloads

Purpose
    Adds multi-selection controls to work listings and downloads selected works
    sequentially with progress feedback and request throttling.

Notes
    A MutationObserver processes dynamically added blurbs. Active requests,
    delays, timers, controls, and visual selection state are all released when
    the feature is cleaned up.

═══════════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { onReady, observe } from '../../../../lib/utils/index.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const buildWorkHTML = (...args) => W.AO3H.ficDownloader.buildWorkHTML(...args);

export class BatchDownload {
  constructor(config = {}) {
    this.storage = config.storage;
    this.logger = config.logger;
    this.selectedWorks = new Set();
    this.checkboxes = new Map();
    this.toolbar = null;
    this.observer = null;
    this.isDownloading = false;
    this._active = true;
    this._controllers = new Set();
    this._pendingTimeouts = new Set();
    this._pendingWaits = new Set();

    if (this.logger) {
      this.logger.info('[BatchDownload] Component initialized');
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SELECTION INTERFACE
  ═════════════════════════════════════════════════════════════════════════ */

  isListingPage() {
    const path = W.location.pathname;
    return /\/(works|bookmarks|series|tags)/.test(path);
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'ao3h-batch-download-toolbar';
    const title = document.createElement('div');
    title.className = 'ao3h-batch-toolbar-title';
    title.textContent = 'Batch Download';

    const counter = document.createElement('div');
    counter.className = 'ao3h-batch-counter';
    counter.textContent = '0 works selected';

    const progressBar = document.createElement('div');
    progressBar.className = 'ao3h-batch-progress';
    const progressFill = document.createElement('div');
    progressFill.className = 'ao3h-batch-progress-fill';
    progressBar.appendChild(progressFill);

    const progressText = document.createElement('div');
    progressText.className = 'ao3h-batch-progress-text';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ao3h-batch-button-container';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'ao3h-batch-download-btn';
    downloadBtn.textContent = 'Download Selected';

    downloadBtn.addEventListener('click', () => {
      this.downloadSelectedWorks();
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'ao3h-batch-clear-btn';
    clearBtn.textContent = 'Clear';

    clearBtn.addEventListener('click', () => {
      this.clearSelection();
    });

    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(clearBtn);

    toolbar.appendChild(title);
    toolbar.appendChild(counter);
    toolbar.appendChild(progressBar);
    toolbar.appendChild(progressText);
    toolbar.appendChild(buttonContainer);

    return toolbar;
  }

  updateToolbarVisibility() {
    if (!this.toolbar) return;

    if (this.selectedWorks.size > 0) {
      this.toolbar.style.display = 'block';
    } else {
      this.toolbar.style.display = 'none';
    }

    const counter = this.toolbar.querySelector('.ao3h-batch-counter');
    if (counter) {
      counter.textContent = `${this.selectedWorks.size} work${this.selectedWorks.size !== 1 ? 's' : ''} selected`;
    }
  }

  createCheckbox(workId) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'ao3h-batch-checkbox';
    checkbox.dataset.workId = workId;
    checkbox.addEventListener('change', (e) => {
      const target = /** @type {HTMLInputElement} */ (e.target);
      const blurb = target.closest('li.blurb');
      if (target.checked) {
        this.selectedWorks.add(workId);
        if (blurb) blurb.classList.add('ao3h-blurb-selected');
      } else {
        this.selectedWorks.delete(workId);
        if (blurb) blurb.classList.remove('ao3h-blurb-selected');
      }
      this.updateToolbarVisibility();
    });

    return checkbox;
  }

  getWorkIdFromBlurb(blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  getWorkTitle(blurb) {
    const titleLink = blurb.querySelector('h4.heading > a');
    return titleLink?.textContent.trim() || 'Untitled';
  }

  getWorkAuthor(blurb) {
    const authorLink = blurb.querySelector('a[rel="author"]');
    return authorLink?.textContent.trim() || 'Anonymous';
  }

  addCheckboxToBlurb(blurb) {
    // Check if checkbox already added
    if (blurb.querySelector('.ao3h-batch-checkbox')) {
      return;
    }

    const workId = this.getWorkIdFromBlurb(blurb);
    if (!workId) return;

    const checkbox = this.createCheckbox(workId);

    const heading = blurb.querySelector('h4.heading');
    if (heading) {
      heading.insertBefore(checkbox, heading.firstChild);
      this.checkboxes.set(workId, checkbox);
    }
  }

  processBlurbs() {
    const blurbs = document.querySelectorAll('li.blurb');
    blurbs.forEach(blurb => this.addCheckboxToBlurb(blurb));

    if (this.logger && blurbs.length > 0) {
      this.logger.info(`[BatchDownload] Added checkboxes to ${blurbs.length} blurbs`);
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — DOWNLOAD ENGINE
  ═════════════════════════════════════════════════════════════════════════ */

  async fetchWorkContent(workId) {
    const controller = new AbortController();
    this._controllers.add(controller);
    try {
      const response = await fetch(`/works/${workId}?view_full_work=true`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    } catch (error) {
      if (this.logger && error?.name !== 'AbortError') {
        this.logger.error(`[BatchDownload] Failed to fetch work ${workId}:`, error);
      }
      return null;
    } finally {
      this._controllers.delete(controller);
    }
  }

  /** Pauses for `ms`. cleanup() resolves it immediately instead of leaving the batch loop suspended. */
  _wait(ms) {
    return new Promise(resolve => {
      const entry = {
        resolve,
        timer: setTimeout(() => { this._pendingWaits.delete(entry); resolve(undefined); }, ms),
      };
      this._pendingWaits.add(entry);
    });
  }

  async downloadWork(workId, title, author) {
    const doc = await this.fetchWorkContent(workId);
    if (!this._active) return { success: false, workId, title };
    if (!doc) {
      return { success: false, workId, title };
    }

    const summary = doc.querySelector('.summary .userstuff')?.innerHTML || '';
    const chaptersHTML = doc.querySelector('#chapters')?.innerHTML || doc.querySelector('.userstuff')?.innerHTML || '';
    const notes = doc.querySelector('.notes')?.innerHTML || '';

    const html = buildWorkHTML({ title, author, summary, notes, chaptersHTML });

    downloadFile(html, `${title.replace(/[^a-z0-9]/gi, '_')}.html`, 'text/html;charset=utf-8');

    return { success: true, workId, title };
  }

  async downloadSelectedWorks() {
    if (this.isDownloading || this.selectedWorks.size === 0) return;

    this.isDownloading = true;
    const downloadBtn = this.toolbar.querySelector('.ao3h-batch-download-btn');
    const progressBar = this.toolbar.querySelector('.ao3h-batch-progress');
    const progressFill = this.toolbar.querySelector('.ao3h-batch-progress-fill');
    const progressText = this.toolbar.querySelector('.ao3h-batch-progress-text');

    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Downloading...';
    progressBar.style.display = 'block';
    progressText.style.display = 'block';

    const workIds = Array.from(this.selectedWorks);
    const total = workIds.length;
    let completed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const workId of workIds) {
      if (!this._active) return; // module deactivated mid-batch

      const checkbox = this.checkboxes.get(workId);
      const blurb = checkbox?.closest('li.blurb');
      const title = blurb ? this.getWorkTitle(blurb) : 'Unknown';
      const author = blurb ? this.getWorkAuthor(blurb) : 'Unknown';

      progressText.textContent = `Downloading "${title}" (${completed + 1}/${total})...`;

      const result = await this.downloadWork(workId, title, author);
      if (!this._active) return; // module deactivated while this download was in flight

      if (result.success) {
        succeeded++;
        if (this.logger) {
          this.logger.info(`[BatchDownload] Downloaded: ${result.title}`);
        }
      } else {
        failed++;
        if (this.logger) {
          this.logger.error(`[BatchDownload] Failed: ${result.title}`);
        }
      }

      completed++;
      const progress = (completed / total) * 100;
      progressFill.style.width = `${progress}%`;

      // Wait 2 seconds between downloads (except for the last one)
      if (completed < total) {
        await this._wait(2000);
        if (!this._active) return;
      }
    }

    // Show completion message
    progressText.textContent = `Complete! ${succeeded} downloaded, ${failed} failed.`;

    const doneTimer = setTimeout(() => {
      this._pendingTimeouts.delete(doneTimer);
      if (!this._active) return;
      this.clearSelection();
      this.isDownloading = false;
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Download Selected';
      progressBar.style.display = 'none';
      progressText.style.display = 'none';
    }, 3000);
    this._pendingTimeouts.add(doneTimer);
  }

  clearSelection() {
    this.selectedWorks.clear();
    this.checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
      const blurb = checkbox.closest('li.blurb');
      if (blurb) blurb.classList.remove('ao3h-blurb-selected');
    });
    this.updateToolbarVisibility();
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — DYNAMIC CONTENT
  ═════════════════════════════════════════════════════════════════════════ */

  observeBlurbs() {
    this.observer = observe(document.body, { childList: true, subtree: true }, (mutations) => {
      let shouldProcess = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.classList?.contains('blurb') || node.querySelector?.('li.blurb')) {
              shouldProcess = true;
              break;
            }
          }
        }
        if (shouldProcess) break;
      }

      if (shouldProcess) {
        this.processBlurbs();
      }
    });
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  init() {
    if (!this.isListingPage()) {
      if (this.logger) {
        this.logger.info('[BatchDownload] Not a listing page, skipping');
      }
      return;
    }

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'appendChild/l'observer plantaient (Cannot read properties of
    // null), constaté sur plusieurs modules similaires en test.
    onReady(() => {
      if (!this._active) return;
      this.toolbar = this.createToolbar();
      document.body.appendChild(this.toolbar);

      this.processBlurbs();
      this.observeBlurbs();

      if (this.logger) {
        this.logger.info('[BatchDownload] Batch download system initialized');
      }
    });
  }

  cleanup() {
    this._active = false;
    this._controllers.forEach(controller => controller.abort());
    this._controllers.clear();
    this._pendingTimeouts.forEach(timer => clearTimeout(timer));
    this._pendingTimeouts.clear();
    this._pendingWaits.forEach(({ timer, resolve }) => { clearTimeout(timer); resolve(); });
    this._pendingWaits.clear();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }

    this.checkboxes.forEach((checkbox) => {
      const blurb = checkbox.closest('li.blurb');
      if (blurb) blurb.classList.remove('ao3h-blurb-selected');
      checkbox.remove();
    });
    this.checkboxes.clear();
    this.selectedWorks.clear();

    if (this.logger) {
      this.logger.info('[BatchDownload] Cleanup complete');
    }
  }
}
