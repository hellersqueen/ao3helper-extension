/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Individual Downloads Submodule
    Submodule ID: individualDownloads
    Display Name: Individual Downloads
    Source Module: Download Manager

    - Feature: Quick download icons
      - Option: ⬇️ icon on each work blurb
      - Option: Icon positioning beside title
      - Option: Color: #2c5f8a (AO3 blue)
      - Option: Hover effect (darker blue)

    - Feature: One-click download
      - Option: Click icon to download immediately
      - Option: No work page navigation needed
      - Option: Direct download trigger

    - Feature: Work content fetching
      - Option: Fetch work with ?view_full_work=true
      - Option: Parse HTML with DOMParser
      - Option: Extract chapters and metadata

    - Feature: HTML file generation
      - Option: Create standalone HTML file
      - Option: Include work metadata
      - Option: Include summary and notes
      - Option: Include all chapters

    - Feature: Download triggering
      - Option: Create download blob
      - Option: Generate filename with work ID and title
      - Option: Trigger browser download
      - Option: Cleanup blob URL

    - Feature: Icon management
      - Option: Track created icons in Set
      - Option: Prevent duplicate icons
      - Option: Dynamic icon addition for new blurbs

    - Feature: Complete work download
      - Option: Download all chapters in one file
      - Option: Fetch full work view
      - Option: Combine chapters
      
    - Feature: Chapter navigation
      - Option: Handle multi-chapter works
      - Option: Sequential chapter fetching
      - Option: Chapter ordering

═══════════════════════════════════════════════════════════════════════════ */



import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { extractWorkIdFromBlurb, isListingPage as libIsListingPage } from '../../../../lib/ao3/parsers.js';
import { buildWorkHTML } from './workHtmlTemplate.js';
import { onReady } from '../../../../lib/utils/index.js';

const W = getGlobalWindow();

export class BlurbDownloadButton {
  constructor(config = {}) {
    this.storage = config.storage;
    this.logger = config.logger;
    this.buttons = new Set();
    this.observer = null;
    this._active = true;
    this._controllers = new Set();

    if (this.logger) {
      this.logger.info('[BlurbDownloadButton] Component initialized');
    }
  }

  isListingPage() {
    return libIsListingPage(W.location.pathname);
  }

  createDownloadIcon() {
    const icon = document.createElement('a');
    icon.className = 'ao3h-blurb-download-icon';
    icon.title = 'Download this work';
    icon.textContent = '⬇️';
    icon.href = 'javascript:void(0);';
    return icon;
  }

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
        this.logger.error(`[BlurbDownloadButton] Failed to fetch work ${workId}:`, error);
      }
      return null;
    } finally {
      this._controllers.delete(controller);
    }
  }

  async downloadWork(workId, title, author) {
    if (this.logger) {
      this.logger.info(`[BlurbDownloadButton] Downloading work ${workId}`);
    }

    const doc = await this.fetchWorkContent(workId);
    if (!this._active) return; // deactivated while the fetch was in flight
    if (!doc) {
      W.alert('Failed to download work. Please try again.');
      return;
    }

    const summary = doc.querySelector('.summary .userstuff')?.innerHTML || '';
    const chaptersHTML = doc.querySelector('#chapters')?.innerHTML || doc.querySelector('.userstuff')?.innerHTML || '';
    const notes = doc.querySelector('.notes .userstuff')?.innerHTML || '';

    const html = buildWorkHTML({ title, author, summary, notes, chaptersHTML });

    downloadFile(html, `${workId}_${title.replace(/[^a-z0-9]/gi, '_')}.html`, 'text/html;charset=utf-8');
    
    if (this.logger) {
      this.logger.info(`[BlurbDownloadButton] Successfully downloaded: ${title}`);
    }
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

  addDownloadButtonToBlurb(blurb) {
    // Check if button already added
    if (blurb.querySelector('.ao3h-blurb-download-icon')) {
      return;
    }

    const workId = this.getWorkIdFromBlurb(blurb);
    if (!workId) return;

    const title = this.getWorkTitle(blurb);
    const author = this.getWorkAuthor(blurb);
    
    const icon = this.createDownloadIcon();
    icon.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this.downloadWork(workId, title, author);
    });

    const heading = blurb.querySelector('h4.heading');
    if (heading) {
      heading.appendChild(icon);
      this.buttons.add(icon);
    }
  }

  processBlurbs() {
    const blurbs = document.querySelectorAll('li.blurb');
    blurbs.forEach(blurb => this.addDownloadButtonToBlurb(blurb));
    
    if (this.logger && blurbs.length > 0) {
      this.logger.info(`[BlurbDownloadButton] Added download icons to ${blurbs.length} blurbs`);
    }
  }

  observeBlurbs() {
    this.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
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

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  init() {
    if (!this.isListingPage()) {
      if (this.logger) {
        this.logger.info('[BlurbDownloadButton] Not a listing page, skipping');
      }
      return;
    }

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'observer plantait (Cannot read properties of null), constaté
    // sur plusieurs modules similaires en test.
    onReady(() => {
      if (!this._active) return;
      this.processBlurbs();
      this.observeBlurbs();
    });
  }

  cleanup() {
    this._active = false;
    this._controllers.forEach(controller => controller.abort());
    this._controllers.clear();

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.buttons.forEach(btn => btn.remove());
    this.buttons.clear();

    if (this.logger) {
      this.logger.info('[BlurbDownloadButton] Cleanup complete');
    }
  }
}

// Expose to global namespace
