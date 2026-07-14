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
import { escapeHtml } from '../../../../lib/utils/dom.js';

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
    const path = W.location.pathname;
    return /\/(works|bookmarks|series|tags)/.test(path);
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
    const chapters = doc.querySelector('#chapters')?.innerHTML || doc.querySelector('.userstuff')?.innerHTML || '';
    const notes = doc.querySelector('.notes .userstuff')?.innerHTML || '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - ${escapeHtml(author)}</title>
<style>
  body {
    font-family: Georgia, 'Times New Roman', serif;
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    line-height: 1.8;
    color: #333;
  }
  h1 {
    color: #2c5f8a;
    font-size: 2em;
    margin-bottom: 10px;
  }
  .author {
    font-size: 1.2em;
    color: #666;
    margin-bottom: 30px;
  }
  .summary {
    background: #f9f9f9;
    padding: 20px;
    border-left: 4px solid #2c5f8a;
    margin: 30px 0;
  }
  .notes {
    background: #fff8dc;
    padding: 15px;
    margin: 20px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  hr {
    border: none;
    border-top: 2px solid #ddd;
    margin: 40px 0;
  }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p class="author"><em>by ${escapeHtml(author)}</em></p>

${summary ? `<div class="summary"><strong>Summary:</strong><br>${summary}</div>` : ''}
${notes ? `<div class="notes">${notes}</div>` : ''}

<hr>

<div id="content">
  ${chapters}
</div>
</body>
</html>
    `;

    downloadFile(html, `${workId}_${title.replace(/[^a-z0-9]/gi, '_')}.html`, 'text/html;charset=utf-8');
    
    if (this.logger) {
      this.logger.info(`[BlurbDownloadButton] Successfully downloaded: ${title}`);
    }
  }

  getWorkIdFromBlurb(blurb) {
    const link = blurb.querySelector('h4.heading > a');
    if (!link) return null;
    
    const match = link.href.match(/\/works\/(\d+)/);
    return match ? match[1] : null;
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

    this.processBlurbs();
    this.observeBlurbs();
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
