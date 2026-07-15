/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Complete Page Download Submodule
    Submodule ID: completePageDownload
    Display Name: Complete Page Download
    Source Module: Download Manager

    - Feature: One-click complete page download
      - Option: Download button on listing pages
      - Option: Format dropdown (HTML, EPUB, MOBI, AZW3, PDF)
      - Option: ZIP archive when JSZip is available (graceful fallback to individual downloads)

    - Feature: Multiple format support
      - Option: HTML format (locally generated)
      - Option: EPUB, MOBI, AZW3, PDF formats (fetched from AO3 download links)
      - Option: Format dropdown selector in UI
      - Option: Config: format setting (default: 'html')

    - Feature: ZIP archive packaging
      - Option: JSZip integration (optional — must be available as window.JSZip)
      - Option: All works + index + metadata bundled in one ZIP file
      - Option: Graceful fallback to individual file downloads when JSZip unavailable

    - Feature: Progress tracking with visual progress bar
      - Option: Progress modal dialog
      - Option: Progress bar display
      - Option: Percentage completion
      - Option: Current work indicator
      - Option: Smooth progress animation

    - Feature: Automatic index.html generation with work links
      - Option: Create _index.html file
      - Option: List all downloaded works (success/failure)
      - Option: Links to individual files

    - Feature: Metadata JSON file
      - Option: _metadata.json included in download
      - Option: Tag name, format, download date timestamp
      - Option: Statistics (total, succeeded, failed)
      - Option: Per-work title, author, filename, success

    - Feature: Safety limit
      - Option: Maximum works cap (config.maxWorks, default: 100)
      - Option: Prevent excessive downloads
      - Option: Warning when limit reached

    - Feature: Configurable delay between requests
      - Option: Config: delayMs (default: 2000)
      - Option: Server-friendly rate limiting

    - Feature: Cancel download option
      - Option: Cancel button during download
      - Option: Stop after current work
      - Option: Partial results still exported on cancel

    - Feature: Styled progress modal
      - Option: Overlay modal dialog
      - Option: Live status messages
      - Option: Progress bar with smooth transitions

    - Feature: Work-by-work download tracking
      - Option: Track individual work status
      - Option: Success/failure per work
      - Option: Download queue management

    - Feature: Failed download reporting
      - Option: Failed works listed in _index.html
      - Option: Failed count in completion message
      - Option: Failed count in _metadata.json

═══════════════════════════════════════════════════════════════════════════ */



import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';

const W = getGlobalWindow();

const DEFAULTS = { maxWorks: 100, delayMs: 2000, format: 'html' };
const FORMATS  = ['html', 'epub', 'mobi', 'azw3', 'pdf'];

export class CompletePageDownload {
  constructor (config = {}) {
    this.logger    = config.logger;
    this.maxWorks  = config.maxWorks  ?? DEFAULTS.maxWorks;
    this.delayMs   = config.delayMs   ?? DEFAULTS.delayMs;
    this.format    = config.format    ?? DEFAULTS.format;
    this._injected        = [];
    this._cancelRequested = false;
    this._isRunning       = false;
    this._active          = true;
    this._controller      = null;
    this._pendingWaits    = new Set();
  }

  // ── Logger ─────────────────────────────────────────────────────────────
  _log (level, ...args) {
    if (this.logger) this.logger[level]?.(...args);
  }

  // ── Route helpers ──────────────────────────────────────────────────────
  isListingPage () {
    const path = W.location.pathname;
    return /^\/(works|bookmarks|series)(\?|$)/.test(path) ||
           /^\/tags\/[^/]+\/(works|bookmarks)/.test(path) ||
           /^\/users\/[^/]+\/(works|bookmarks|pseuds\/[^/]+\/works)/.test(path) ||
           /^\/collections\/[^/]+\/works/.test(path);
  }

  // ── Work metadata helpers ──────────────────────────────────────────────
  _getWorkBlurbs () {
    return Array.from(document.querySelectorAll('li.blurb[id^="work_"]'));
  }

  _getWorkInfo (blurb) {
    const titleLink  = blurb.querySelector('h4.heading > a');
    const authorLink = blurb.querySelector('a[rel="author"]');
    return {
      workId: extractWorkIdFromHref(titleLink?.href),
      title:  titleLink?.textContent.trim()  || 'Untitled',
      author: authorLink?.textContent.trim() || 'Anonymous',
    };
  }

  _getTagName () {
    return document.querySelector('h2.heading')?.textContent.trim()
        || document.title
        || 'AO3 Download';
  }

  // ── Fetch ──────────────────────────────────────────────────────────────
  async _fetchWorkHtml (workId) {
    const controller = new AbortController();
    this._controller = controller;
    try {
      const res = await fetch(`/works/${workId}?view_full_work=true`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (e?.name !== 'AbortError') {
        this._log('error', `[CompletePageDownload] Fetch failed for work ${workId}:`, e);
      }
      return null;
    } finally {
      if (this._controller === controller) this._controller = null;
    }
  }

  async _fetchWorkBinary (workId, format) {
    const controller = new AbortController();
    this._controller = controller;
    try {
      const pageRes = await fetch(`/works/${workId}`, { signal: controller.signal });
      if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
      const pageHtml = await pageRes.text();
      const doc = new DOMParser().parseFromString(pageHtml, 'text/html');
      const links = Array.from(doc.querySelectorAll('.download ul a'));
      const link = links.find(a => {
        try {
          const url = new URL(a.href, W.location.origin);
          return url.pathname.endsWith(`.${format}`);
        } catch { return false; }
      });
      if (!link) throw new Error(`No .${format} download link found`);
      const dlRes = await fetch(link.href, { signal: controller.signal });
      if (!dlRes.ok) throw new Error(`HTTP ${dlRes.status}`);
      return await dlRes.arrayBuffer();
    } catch (e) {
      if (e?.name !== 'AbortError') {
        this._log('error', `[CompletePageDownload] Binary fetch failed for work ${workId} (${format}):`, e);
      }
      return null;
    } finally {
      if (this._controller === controller) this._controller = null;
    }
  }

  /** Pauses for `ms`. cleanup() resolves it immediately instead of leaving the run loop suspended. */
  _wait (ms) {
    return new Promise(resolve => {
      const entry = {
        resolve,
        timer: setTimeout(() => { this._pendingWaits.delete(entry); resolve(); }, ms),
      };
      this._pendingWaits.add(entry);
    });
  }

  // ── HTML generation ────────────────────────────────────────────────────
  _esc (str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  _safeFilename (str, maxLen = 60) {
    return str.replace(/[^a-z0-9]/gi, '_').slice(0, maxLen);
  }

  _buildWorkHtml (title, author, rawHtml) {
    const doc      = (new DOMParser()).parseFromString(rawHtml, 'text/html');
    const summary  = doc.querySelector('.summary .userstuff')?.innerHTML || '';
    const chapters = doc.querySelector('#chapters')?.innerHTML
                  || doc.querySelector('.userstuff')?.innerHTML || '';
    const notes    = doc.querySelector('.notes .userstuff')?.innerHTML || '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${this._esc(title)} — ${this._esc(author)}</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; color: #333; }
  h1   { color: #2c5f8a; }
  .author  { color: #666; margin-bottom: 30px; }
  .summary { background: #f9f9f9; padding: 16px; border-left: 4px solid #2c5f8a; margin: 20px 0; }
  .notes   { background: #fff8dc; padding: 12px; margin: 16px 0; border: 1px solid #ddd; border-radius: 4px; }
  hr { border: none; border-top: 2px solid #ddd; margin: 32px 0; }
</style>
</head>
<body>
<h1>${this._esc(title)}</h1>
<p class="author"><em>by ${this._esc(author)}</em></p>
${summary  ? `<div class="summary"><strong>Summary:</strong><br>${summary}</div>` : ''}
${notes    ? `<div class="notes">${notes}</div>`   : ''}
<hr>
<div id="content">${chapters}</div>
</body>
</html>`;
  }

  _buildIndexHtml (tagName, results) {
    const rows = results.map(r => `
      <tr>
        <td>${r.success ? '✅' : '❌'}</td>
        <td>${r.filename ? `<a href="${this._esc(r.filename)}">${this._esc(r.title)}</a>` : this._esc(r.title)}</td>
        <td>${this._esc(r.author)}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AO3 Download — ${this._esc(tagName)}</title>
<style>
  body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
  h1   { color: #2c5f8a; }
  table { border-collapse: collapse; width: 100%; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
  th { background: #f0f0f0; }
  a  { color: #2c5f8a; }
</style>
</head>
<body>
<h1>Downloaded: ${this._esc(tagName)}</h1>
<p>Downloaded on ${new Date().toLocaleDateString()} — ${results.length} works</p>
<table>
  <thead><tr><th></th><th>Title</th><th>Author</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`;
  }

  _buildMetadataJson (tagName, format, results) {
    const succeeded = results.filter(r => r.success).length;
    const failed    = results.filter(r => !r.success).length;
    return JSON.stringify({
      tag:          tagName,
      format,
      downloadedAt: new Date().toISOString(),
      stats: { total: results.length, succeeded, failed },
      works: results.map(r => ({
        title:    r.title,
        author:   r.author,
        filename: r.filename,
        success:  r.success,
      })),
    }, null, 2);
  }

  // ── Download trigger (Firefox-compatible) ──────────────────────────────
  _triggerDownload (filename, content, type = 'text/html;charset=utf-8') {
    downloadFile(content, filename, type);
  }

  // ── Progress modal ─────────────────────────────────────────────────────
  _buildModal () {
    const overlay = document.createElement('div');
    overlay.className = 'ao3h-cpd-overlay';

    const box = document.createElement('div');
    box.className = 'ao3h-cpd-box';

    const heading = document.createElement('h3');
    heading.className = 'ao3h-cpd-heading';
    heading.textContent = 'Downloading Works…';

    const status = document.createElement('div');
    status.className = 'ao3h-cpd-status';

    const barWrap = document.createElement('div');
    barWrap.className = 'ao3h-cpd-bar-wrap';

    const barFill = document.createElement('div');
    barFill.className = 'ao3h-cpd-bar-fill';
    barWrap.appendChild(barFill);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ao3h-cpd-cancel-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      this._cancelRequested = true;
      cancelBtn.disabled    = true;
      cancelBtn.textContent = 'Cancelling…';
    });

    box.append(heading, status, barWrap, cancelBtn);
    overlay.appendChild(box);

    return { overlay, heading, status, barFill, cancelBtn };
  }

  // ── Main download runner ───────────────────────────────────────────────
  async _run (works, tagName, format) {
    if (this._isRunning) return;
    this._isRunning       = true;
    this._cancelRequested = false;
    const { overlay, heading, status, barFill, cancelBtn } = this._buildModal();
    document.body.appendChild(overlay);

    const total   = Math.min(works.length, this.maxWorks);
    const results = [];
    const isHtml  = format === 'html';
    const JSZip   = W.JSZip;
    const zip     = JSZip ? new JSZip() : null;

    for (let i = 0; i < total; i++) {
      if (this._cancelRequested) {
        status.textContent       = `Cancelled after ${i} works.`;
        barFill.style.background = '#dc3545';
        break;
      }

      const { workId, title, author } = works[i];
      status.textContent  = `(${i + 1}/${total}) Downloading "${title}"…`;
      barFill.style.width = `${(i / total) * 100}%`;

      const ext      = isHtml ? 'html' : format;
      const filename = `${this._safeFilename(title)}.${ext}`;
      let   success  = false;

      if (isHtml) {
        const rawHtml = workId ? await this._fetchWorkHtml(workId) : null;
        if (!this._active) return; // module deactivated while this fetch was in flight
        if (rawHtml) {
          const builtHtml = this._buildWorkHtml(title, author, rawHtml);
          if (zip) {
            zip.file(filename, builtHtml);
          } else {
            this._triggerDownload(filename, builtHtml);
          }
          success = true;
        }
      } else {
        const buffer = workId ? await this._fetchWorkBinary(workId, format) : null;
        if (!this._active) return; // module deactivated while this fetch was in flight
        if (buffer) {
          if (zip) {
            zip.file(filename, buffer);
          } else {
            this._triggerDownload(filename, new Blob([buffer]));
          }
          success = true;
        }
      }

      results.push({ success, title, author, filename: success ? filename : null });
      this._log(success ? 'info' : 'error',
        `[CompletePageDownload] ${success ? 'Downloaded' : 'Failed'}: ${title}`);

      barFill.style.width = `${((i + 1) / total) * 100}%`;

      if (i < total - 1 && !this._cancelRequested) {
        await this._wait(this.delayMs);
        if (!this._active) return;
      }
    }

    if (!this._active) return; // module deactivated right as the loop finished

    // Finalize: index + metadata
    if (results.length > 0) {
      const indexHtml    = this._buildIndexHtml(tagName, results);
      const metadataJson = this._buildMetadataJson(tagName, format, results);

      if (zip) {
        zip.file('_index.html',    indexHtml);
        zip.file('_metadata.json', metadataJson);
        status.textContent = 'Compressing ZIP…';
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        if (!this._active) return; // module deactivated while the ZIP was being generated
        this._triggerDownload(`${this._safeFilename(tagName)}_ao3.zip`, zipBlob, 'application/zip');
      } else {
        this._triggerDownload('_index.html',    indexHtml);
        this._triggerDownload('_metadata.json', metadataJson, 'application/json');
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed    = results.filter(r => !r.success).length;
    heading.textContent   = 'Download Complete';
    status.textContent    = `${succeeded} downloaded • ${failed} failed${zip ? ' — saved as ZIP' : ''}`;
    barFill.style.width   = '100%';
    cancelBtn.disabled    = false;
    cancelBtn.textContent = 'Close';
    cancelBtn.style.background = '#2c5f8a';
    cancelBtn.addEventListener('click', () => { overlay.remove(); this._isRunning = false; }, { once: true });
  }

  // ── UI: Download All button + format selector ──────────────────────────
  _buildDownloadAllButton (count, tagName) {
    const container = document.createElement('div');
    container.className = 'ao3h-cpd-dl-container';

    const formatSelect = document.createElement('select');
    formatSelect.className = 'ao3h-cpd-format-select';
    FORMATS.forEach(fmt => {
      const opt = document.createElement('option');
      opt.value       = fmt;
      opt.textContent = fmt.toUpperCase();
      if (fmt === this.format) opt.selected = true;
      formatSelect.appendChild(opt);
    });

    const btn = document.createElement('button');
    btn.className   = 'ao3h-dl-all-btn';
    btn.textContent = `⬇️ Download All (${count})`;

    btn.addEventListener('click', () => {
      if (this._isRunning) return;
      const format = formatSelect.value;
      const works  = this._getWorkBlurbs()
        .map(b => this._getWorkInfo(b))
        .filter(w => !!w.workId);
      if (!works.length) return;
      if (works.length > this.maxWorks) {
        alert(`Only the first ${this.maxWorks} of ${works.length} works will be downloaded.`);
      }
      this._run(works, tagName, format);
    });

    container.appendChild(formatSelect);
    container.appendChild(btn);
    return container;
  }

  // ── Init ───────────────────────────────────────────────────────────────
  init () {
    if (!this.isListingPage()) {
      this._log('info', '[CompletePageDownload] Not a listing page, skipping');
      return;
    }

    const blurbs  = this._getWorkBlurbs();
    if (!blurbs.length) return;

    const tagName   = this._getTagName();
    const container = this._buildDownloadAllButton(Math.min(blurbs.length, this.maxWorks), tagName);

    const anchor = document.querySelector('#main h2.heading, #main .heading');
    if (anchor) {
      anchor.insertAdjacentElement('afterend', container);
    } else {
      document.querySelector('#main')?.prepend(container);
    }

    this._injected.push(container);
    this._log('info', `[CompletePageDownload] Initialized for ${blurbs.length} works`);
  }

  // ── Cleanup ────────────────────────────────────────────────────────────
  cleanup () {
    this._active = false;
    this._controller?.abort();
    this._controller = null;
    this._pendingWaits.forEach(({ timer, resolve }) => { clearTimeout(timer); resolve(); });
    this._pendingWaits.clear();

    this._injected.forEach(el => el?.remove?.());
    this._injected = [];
    document.querySelector('.ao3h-cpd-overlay')?.remove();
    this._cancelRequested = true;
    this._isRunning       = false;
    this._log('info', '[CompletePageDownload] Cleanup complete');
  }
}
