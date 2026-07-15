/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Download Enhancements Submodule
    Submodule ID: downloadEnhancements
    Display Name: Download Enhancements
    Source Module: Download Manager

    - Feature: Format options for downloads
      - Option: EPUB format
      - Option: MOBI format
      - Option: PDF format
      - Option: HTML format

    - Feature: EPUB download buttons in listings
      - Option: Download button on each work blurb
      - Option: Position next to bookmark/MFL buttons
      - Option: Format dropdown selection
      - Option: One-click download without opening work
      - Option: Download status indicators (spinner/checkmark)
      - Option: Works on search results, tag pages, bookmarks, series, author pages
      - Option: Default format setting
      - Option: Show/hide listing buttons toggle
      - Option: Integration with batch downloads for multi-select

    - Feature: Send to Kindle integration
      - Option: Auto-email EPUB to Kindle address
      - Option: One-time Kindle email configuration
      - Option: "Download & Send to Kindle" button
      - Option: Batch Kindle send for multiple works
      - Option: Settings: Kindle email, auto-send option (always/ask/never)

    - Feature: Enhanced cover generator for downloads
      - Option: Generate attractive cover images
      - Option: Auto-cover with work title, author, fandom, rating
      - Option: Cover templates: minimalist, modern, classic, fandom-themed
      - Option: Customization UI: templates, colors, fonts, layout
      - Option: Preview before download

    - Feature: Download queue management
      - Option: Queue display
      - Option: Reorder downloads
      - Option: Pause/resume queue
      - Option: Cancel specific downloads

    - Feature: Calibre integration
      - Option: Send to Calibre library
      - Option: Calibre content server connection
      - Option: Automatic metadata tagging
      - Option: Library organization

    - Feature: Series download automation
      - Option: Download entire series at once
      - Option: Series-to-collection conversion
      - Option: Sequential series numbering
      - Option: Automatic series metadata
      
    - Feature: Error handling
      - Option: Download failure detection
      - Option: Retry failed downloads
      - Option: Error notifications
      - Option: Graceful degradation

═══════════════════════════════════════════════════════════════════════════ */



import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadFile } from '../../../../lib/utils/json-file.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';

const W = getGlobalWindow();

const FORMATS     = ['epub', 'mobi', 'azw3', 'pdf', 'html'];
const FORMAT_KEY  = 'ao3h:ficDownloader:format';
const KINDLE_KEY  = 'ao3h:ficDownloader:kindle';
const CALIBRE_KEY = 'ao3h:ficDownloader:calibre';

const COVER_TEMPLATES = {
  minimalist: { bg: '#ffffff', fg: '#222222', accent: '#2c5f8a', font: 'Georgia, serif' },
  modern:     { bg: '#1a1a2e', fg: '#ffffff', accent: '#e94560', font: 'Arial, sans-serif' },
  classic:    { bg: '#f5e6c8', fg: '#3b2007', accent: '#8b4513', font: 'Georgia, serif' },
  fandom:     { bg: '#2c3e50', fg: '#ecf0f1', accent: '#e74c3c', font: '"Palatino Linotype", serif' },
};

export class DownloadEnhancements {
  constructor (config = {}) {
    this.logger          = config.logger;
    this.kindleEnabled   = config.kindleEnabled   ?? false;
    this.autoKindleSend  = config.autoKindleSend  ?? false;
    this.calibreEnabled  = config.calibreEnabled  ?? false;
    this.showListingBtns = config.showListingBtns ?? true;
    this._injected       = [];
    this._queue          = [];
    this._isQueueRunning = false;
    this._queuePaused    = false;
    this._queuePanel     = null;
    this._observer       = null;
    this._active         = true;
    this._controllers    = new Set();
    this._pendingWaits   = new Set();
    this._toastTimers    = new Set();
    this._toastEls       = new Set();
  }

  /** Pauses for `ms`. cleanup() resolves it immediately instead of leaving a loop suspended. */
  _wait (ms) {
    return new Promise(resolve => {
      const entry = {
        resolve,
        timer: setTimeout(() => { this._pendingWaits.delete(entry); resolve(); }, ms),
      };
      this._pendingWaits.add(entry);
    });
  }

  // ── Logger ─────────────────────────────────────────────────────────────
  _log (level, ...args) {
    if (this.logger) this.logger[level]?.(...args);
  }

  // ── Format storage ─────────────────────────────────────────────────────
  getFormat () {
    try { return localStorage.getItem(FORMAT_KEY) || 'epub'; } catch { return 'epub'; }
  }

  setFormat (fmt) {
    if (FORMATS.includes(fmt)) {
      try { localStorage.setItem(FORMAT_KEY, fmt); } catch {}
    }
  }

  // ── Kindle config ──────────────────────────────────────────────────────
  getKindleConfig () {
    try {
      return JSON.parse(localStorage.getItem(KINDLE_KEY) || 'null') || { enabled: false, email: '' };
    } catch { return { enabled: false, email: '' }; }
  }

  setKindleEmail (email) {
    const cfg   = this.getKindleConfig();
    cfg.enabled = true;
    cfg.email   = email;
    try { localStorage.setItem(KINDLE_KEY, JSON.stringify(cfg)); } catch {}
  }

  // ── Calibre config ─────────────────────────────────────────────────────
  getCalibreConfig () {
    try {
      return JSON.parse(localStorage.getItem(CALIBRE_KEY) || 'null') || { url: 'http://localhost:8080', library: '' };
    } catch { return { url: 'http://localhost:8080', library: '' }; }
  }

  setCalibreConfig (url, library = '') {
    try { localStorage.setItem(CALIBRE_KEY, JSON.stringify({ url, library })); } catch {}
  }

  // ── Route helpers ──────────────────────────────────────────────────────
  isWorkPage () {
    return /^\/works\/\d+/.test(W.location.pathname);
  }

  getWorkId () {
    return extractWorkIdFromHref(W.location.pathname);
  }

  isListingPage () {
    const p = W.location.pathname;
    return /^\/(works|bookmarks)(\?|$)/.test(p) ||
           /^\/tags\/[^/]+\/(works|bookmarks)/.test(p) ||
           /^\/users\/[^/]+\/(works|bookmarks)/.test(p) ||
           /^\/collections\/[^/]+\/works/.test(p);
  }

  isSeriesPage () {
    return /^\/series\/\d+/.test(W.location.pathname);
  }

  // ── Native download link helper ────────────────────────────────────────
  _getDownloadLinkEl () {
    return document.querySelector('.download a[href*="/downloads/"]');
  }

  _swapDownloadFormat (fmt) {
    const link = this._getDownloadLinkEl();
    if (link) link.href = link.href.replace(/\.\w+(\?|$)/, `.${fmt}$1`);
  }

  // ── Work info from blurb ───────────────────────────────────────────────
  _getBlurbInfo (blurb) {
    const titleLink  = blurb.querySelector('h4.heading > a');
    const authorLink = blurb.querySelector('a[rel="author"]');
    const fandomLink = blurb.querySelector('.fandoms a');
    const ratingEl   = blurb.querySelector('.rating .text');
    return {
      workId: extractWorkIdFromHref(titleLink?.href),
      title:  titleLink?.textContent.trim()  || 'Untitled',
      author: authorLink?.textContent.trim() || 'Anonymous',
      fandom: fandomLink?.textContent.trim() || '',
      rating: ratingEl?.textContent.trim()   || '',
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  _esc (str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  _safeFilename (str, maxLen = 60) {
    return str.replace(/[^a-z0-9]/gi, '_').slice(0, maxLen);
  }

  // ── Fetch helpers ──────────────────────────────────────────────────────
  async _fetchWorkHtml (workId, signal) {
    const res = await fetch(`/works/${workId}?view_full_work=true`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  async _fetchWorkBinary (workId, format, signal) {
    const pageRes = await fetch(`/works/${workId}`, { signal });
    if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
    const doc   = new DOMParser().parseFromString(await pageRes.text(), 'text/html');
    const links = Array.from(doc.querySelectorAll('.download ul a'));
    const link  = links.find(a => {
      try { return new URL(a.href, W.location.origin).pathname.endsWith(`.${format}`); }
      catch { return false; }
    });
    if (!link) throw new Error(`No .${format} link found`);
    const dlRes = await fetch(link.href, { signal });
    if (!dlRes.ok) throw new Error(`HTTP ${dlRes.status}`);
    return dlRes.arrayBuffer();
  }

  _buildWorkHtml (title, author, rawHtml) {
    const doc      = new DOMParser().parseFromString(rawHtml, 'text/html');
    const summary  = doc.querySelector('.summary .userstuff')?.innerHTML || '';
    const chapters = doc.querySelector('#chapters')?.innerHTML
                  || doc.querySelector('.userstuff')?.innerHTML || '';
    const notes    = doc.querySelector('.notes .userstuff')?.innerHTML || '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${this._esc(title)} — ${this._esc(author)}</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; color: #333; }
  h1   { color: #2c5f8a; }
  .summary { background: #f9f9f9; padding: 16px; border-left: 4px solid #2c5f8a; margin: 20px 0; }
  .notes   { background: #fff8dc; padding: 12px; margin: 16px 0; border: 1px solid #ddd; border-radius: 4px; }
  hr { border: none; border-top: 2px solid #ddd; margin: 32px 0; }
</style>
</head>
<body>
<h1>${this._esc(title)}</h1>
<p><em>by ${this._esc(author)}</em></p>
${summary  ? `<div class="summary"><strong>Summary:</strong><br>${summary}</div>` : ''}
${notes    ? `<div class="notes">${notes}</div>` : ''}
<hr>
<div id="content">${chapters}</div>
</body>
</html>`;
  }

  _triggerDownload (filename, content, type = 'text/html;charset=utf-8') {
    downloadFile(content, filename, type);
  }

  // ── Error notification ─────────────────────────────────────────────────
  _showNotification (message, type = 'info') {
    if (!this._active) return;
    const note = document.createElement('div');
    note.className = `ao3h-dl-note ao3h-dl-note--${type}`;
    note.textContent = message;
    document.body.appendChild(note);
    this._toastEls.add(note);

    const fadeTimer = setTimeout(() => {
      this._toastTimers.delete(fadeTimer);
      note.style.opacity = '0';
      const removeTimer = setTimeout(() => {
        this._toastTimers.delete(removeTimer);
        this._toastEls.delete(note);
        note.remove();
      }, 500);
      this._toastTimers.add(removeTimer);
    }, 3500);
    this._toastTimers.add(fadeTimer);
  }

  // ── Download single work (with retry) ──────────────────────────────────
  async _downloadSingleWork (workId, title, author, format, retries = 2) {
    const isHtml   = format === 'html';
    const ext      = isHtml ? 'html' : format;
    const filename = `${this._safeFilename(title)}.${ext}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      this._controllers.add(controller);
      try {
        if (isHtml) {
          const rawHtml = await this._fetchWorkHtml(workId, controller.signal);
          if (!this._active) return { success: false, cancelled: true };
          this._triggerDownload(filename, this._buildWorkHtml(title, author, rawHtml));
        } else {
          const buffer = await this._fetchWorkBinary(workId, format, controller.signal);
          if (!this._active) return { success: false, cancelled: true };
          this._triggerDownload(filename, new Blob([buffer]));
        }
        return { success: true, filename };
      } catch (err) {
        if (err?.name === 'AbortError' || !this._active) return { success: false, cancelled: true };
        this._log('error', `[DownloadEnhancements] Attempt ${attempt + 1} failed for "${title}":`, err);
        if (attempt === retries) return { success: false, error: err.message };
        await this._wait(1500);
        if (!this._active) return { success: false, cancelled: true };
      } finally {
        this._controllers.delete(controller);
      }
    }
  }

  // ── UI: Format selector (work page) ───────────────────────────────────
  _buildFormatSelector () {
    const wrap = document.createElement('span');
    wrap.className = 'ao3h-format-selector';

    const label       = document.createElement('label');
    label.className   = 'ao3h-format-label';
    label.textContent = 'Format:';

    const sel = document.createElement('select');
    sel.className = 'ao3h-format-sel';

    const current = this.getFormat();
    FORMATS.forEach(fmt => {
      const opt       = document.createElement('option');
      opt.value       = fmt;
      opt.textContent = fmt.toUpperCase();
      if (fmt === current) opt.selected = true;
      sel.appendChild(opt);
    });

    this._swapDownloadFormat(current);
    sel.addEventListener('change', () => {
      this.setFormat(sel.value);
      this._swapDownloadFormat(sel.value);
    });

    wrap.appendChild(label);
    wrap.appendChild(sel);
    return wrap;
  }

  // ── Kindle: send one work ──────────────────────────────────────────────
  _sendToKindle (email, title, downloadUrl, ask = !this.autoKindleSend) {
    const epubUrl = downloadUrl
      ? downloadUrl.replace(/\.\w+(\?|$)/, `.epub$1`)
      : W.location.href;
    const subject = encodeURIComponent(`AO3: ${title}`);
    const body    = encodeURIComponent(`EPUB: ${epubUrl}\n\nWork page: ${W.location.href}`);
    if (ask && !W.confirm(`Send "${title}" to ${email}?`)) return;
    W.open(`mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`);
  }

  // ── UI: Send to Kindle button (work page) ─────────────────────────────
  _buildKindleButton (title) {
    const btn = document.createElement('a');
    btn.className   = 'ao3h-kindle-btn';
    btn.href        = 'javascript:void(0);';
    btn.textContent = '📤 Send to Kindle';
    const { email } = this.getKindleConfig();
    if (email) btn.title = `Send EPUB to ${email}`;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      let { email: addr } = this.getKindleConfig();
      if (!addr) {
        const input = W.prompt('Enter your Kindle email address (e.g. name@kindle.com):');
        if (!input || !input.includes('@')) return;
        this.setKindleEmail(input);
        addr = input;
        btn.title = `Send EPUB to ${addr}`;
      }
      const dlLink = this._getDownloadLinkEl();
      this._sendToKindle(addr, title, dlLink?.href || '');
    });

    return btn;
  }

  // ── Kindle: batch send ─────────────────────────────────────────────────
  async _batchSendToKindle (workInfos) {
    let { email } = this.getKindleConfig();
    if (!email) {
      const input = W.prompt('Enter your Kindle email address (e.g. name@kindle.com):');
      if (!input || !input.includes('@')) return;
      this.setKindleEmail(input);
      email = input;
    }
    if (!W.confirm(`Send ${workInfos.length} work${workInfos.length !== 1 ? 's' : ''} to ${email}?`)) return;

    for (const { workId, title } of workInfos) {
      if (!this._active) return; // module deactivated mid-batch

      const controller = new AbortController();
      this._controllers.add(controller);
      try {
        const pageRes = await fetch(`/works/${workId}`, { signal: controller.signal });
        if (!this._active) return;
        const doc     = new DOMParser().parseFromString(await pageRes.text(), 'text/html');
        const links   = Array.from(doc.querySelectorAll('.download ul a'));
        const link    = links.find(a => {
          try { return new URL(a.href, W.location.origin).pathname.endsWith('.epub'); }
          catch { return false; }
        });
        this._sendToKindle(email, title, link?.href || `/works/${workId}`, false);
        await this._wait(500);
        if (!this._active) return;
      } catch (err) {
        if (err?.name !== 'AbortError') {
          this._log('error', `[DownloadEnhancements] Kindle batch failed for "${title}":`, err);
        }
      } finally {
        this._controllers.delete(controller);
      }
    }
    this._showNotification(`${workInfos.length} work${workInfos.length !== 1 ? 's' : ''} sent to Kindle`, 'success');
  }

  // ── Calibre: send one work ─────────────────────────────────────────────
  async _sendToCalibre (workId, title, author, format = 'epub') {
    const { url } = this.getCalibreConfig();
    this._showNotification(`Downloading "${title}" for Calibre…`, 'info');
    const result = await this._downloadSingleWork(workId, title, author, format, 0);
    if (!result?.success) {
      this._showNotification(`Calibre: failed to download "${title}"`, 'error');
      return;
    }
    this._showNotification(`File downloaded — add it to Calibre at ${url}`, 'info');
    W.open(url, '_blank', 'noopener,noreferrer');
  }

  // ── Cover generator ────────────────────────────────────────────────────
  _wrapText (ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line    = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = word;
        y   += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }

  _generateCover (title, author, fandom = '', rating = '', templateName = 'minimalist') {
    const tpl    = COVER_TEMPLATES[templateName] || COVER_TEMPLATES.minimalist;
    const canvas = document.createElement('canvas');
    canvas.width  = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = tpl.bg;
    ctx.fillRect(0, 0, 400, 600);

    // Accent strips
    ctx.fillStyle = tpl.accent;
    ctx.fillRect(0, 0, 400, 8);
    ctx.fillRect(0, 592, 400, 8);

    // Rating badge
    if (rating) {
      ctx.fillStyle = tpl.accent;
      ctx.fillRect(20, 20, 80, 28);
      ctx.fillStyle   = '#ffffff';
      ctx.font        = `bold 13px ${tpl.font}`;
      ctx.textAlign   = 'center';
      ctx.fillText(rating.toUpperCase(), 60, 39);
    }

    // Fandom
    if (fandom) {
      ctx.fillStyle = tpl.accent;
      ctx.font      = `italic 14px ${tpl.font}`;
      ctx.textAlign = 'center';
      this._wrapText(ctx, fandom, 200, 120, 340, 20);
    }

    // Title
    ctx.fillStyle = tpl.fg;
    ctx.font      = `bold 28px ${tpl.font}`;
    ctx.textAlign = 'center';
    this._wrapText(ctx, title, 200, 220, 340, 34);

    // Author
    ctx.fillStyle = tpl.accent;
    ctx.font      = `italic 18px ${tpl.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(`by ${author}`, 200, 500);

    // AO3 watermark
    ctx.fillStyle   = tpl.fg;
    ctx.globalAlpha = 0.25;
    ctx.font        = `12px sans-serif`;
    ctx.textAlign   = 'center';
    ctx.fillText('Archive of Our Own', 200, 575);
    ctx.globalAlpha = 1;

    return canvas.toDataURL('image/png');
  }

  _showCoverPreview (title, author, fandom, rating) {
    const overlay = document.createElement('div');
    overlay.className = 'ao3h-cover-overlay';

    const box = document.createElement('div');
    box.className = 'ao3h-cover-box';

    const heading = document.createElement('h3');
    heading.className = 'ao3h-cover-heading';
    heading.textContent = 'Cover Preview';

    // Template selector
    const tplWrap  = document.createElement('div');
    tplWrap.className = 'ao3h-cover-tpl-wrap';
    const tplLabel = document.createElement('span');
    tplLabel.className    = 'ao3h-cover-tpl-label';
    tplLabel.textContent  = 'Template:';
    const tplSel = document.createElement('select');
    tplSel.className = 'ao3h-cover-tpl-sel';
    Object.keys(COVER_TEMPLATES).forEach(t => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = t;
      tplSel.appendChild(opt);
    });
    tplWrap.appendChild(tplLabel);
    tplWrap.appendChild(tplSel);

    const img = document.createElement('img');
    img.className = 'ao3h-cover-img';

    const renderPreview = () => { img.src = this._generateCover(title, author, fandom, rating, tplSel.value); };
    tplSel.addEventListener('change', renderPreview);
    renderPreview();

    const btnRow  = document.createElement('div');
    btnRow.className = 'ao3h-cover-btn-row';

    const dlBtn = document.createElement('button');
    dlBtn.className = 'ao3h-cover-dl-btn';
    dlBtn.textContent = 'Download Cover';
    dlBtn.addEventListener('click', () => {
      const dataUrl  = this._generateCover(title, author, fandom, rating, tplSel.value);
      const a        = document.createElement('a');
      a.href         = dataUrl;
      a.download     = `${this._safeFilename(title)}_cover.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ao3h-cover-close-btn';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => overlay.remove());

    btnRow.appendChild(dlBtn);
    btnRow.appendChild(closeBtn);
    box.appendChild(heading);
    box.appendChild(tplWrap);
    box.appendChild(img);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  // ── Listing: per-blurb download button ────────────────────────────────
  _buildBlurbDownloadBtn (workId, title, author, fandom, rating) {
    const wrap = document.createElement('li');
    wrap.className = 'ao3h-dl-btn-wrap';

    const btn = document.createElement('a');
    btn.href  = 'javascript:void(0);';
    btn.className   = 'ao3h-dl-blurb-btn';
    btn.title = `Download "${title}"`;
    btn.textContent = '⬇ DL';

    btn.addEventListener('mouseenter', () => { if (!btn.dataset.running) btn.style.background = '#1a4567'; });
    btn.addEventListener('mouseleave', () => { if (!btn.dataset.running) btn.style.background = '#2c5f8a'; });

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (btn.dataset.running) return;
      btn.dataset.running = '1';
      btn.textContent     = '⏳';
      btn.style.background = '#888';

      const result = await this._downloadSingleWork(workId, title, author, this.getFormat());
      delete btn.dataset.running;

      if (result?.success) {
        btn.textContent      = '✅';
        btn.style.background = '#28a745';
        this._log('info', `[DownloadEnhancements] Downloaded: ${title}`);
        setTimeout(() => { btn.textContent = '⬇ DL'; btn.style.background = '#2c5f8a'; }, 3000);
      } else {
        btn.textContent      = '❌';
        btn.style.background = '#dc3545';
        this._showNotification(`Failed: ${title}`, 'error');
        setTimeout(() => { btn.textContent = '⬇ DL'; btn.style.background = '#2c5f8a'; }, 3000);
      }
    });

    // Right-click: context menu (queue / cover / Kindle / Calibre)
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this._showBlurbContextMenu(e, workId, title, author, fandom, rating);
    });

    wrap.appendChild(btn);
    return wrap;
  }

  // ── Listing: blurb context menu ────────────────────────────────────────
  _showBlurbContextMenu (e, workId, title, author, fandom, rating) {
    document.querySelectorAll('.ao3h-ctx-menu').forEach(m => m.remove());

    const menu = document.createElement('ul');
    menu.className = 'ao3h-ctx-menu';
    menu.style.top  = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;

    const items = [
      { label: '⬇ Add to Queue',  action: () => this._addToQueue(workId, title, author, this.getFormat()) },
      { label: '🎨 Generate Cover', action: () => this._showCoverPreview(title, author, fandom, rating) },
    ];

    if (this.kindleEnabled) {
      items.push({ label: '📤 Send to Kindle', action: () => {
        let { email } = this.getKindleConfig();
        if (!email) {
          const input = W.prompt('Kindle email (e.g. name@kindle.com):');
          if (!input?.includes('@')) return;
          this.setKindleEmail(input);
          email = input;
        }
        this._sendToKindle(email, title, `/works/${workId}`);
      }});
    }

    if (this.calibreEnabled) {
      items.push({ label: '📚 Send to Calibre', action: () => this._sendToCalibre(workId, title, author) });
    }

    items.forEach(({ label, action }) => {
      const li = document.createElement('li');
      li.className   = 'ao3h-ctx-item';
      li.textContent = label;
      li.addEventListener('click', () => { action(); menu.remove(); });
      menu.appendChild(li);
    });

    document.body.appendChild(menu);
    const dismiss = (ev) => {
      if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', dismiss); }
    };
    setTimeout(() => document.addEventListener('click', dismiss), 0);
  }

  _addBlurbButton (blurb) {
    if (blurb.querySelector('.ao3h-dl-btn-wrap')) return;
    const { workId, title, author, fandom, rating } = this._getBlurbInfo(blurb);
    if (!workId) return;
    const actionsList = blurb.querySelector('ul.actions');
    if (!actionsList) return;
    actionsList.appendChild(this._buildBlurbDownloadBtn(workId, title, author, fandom, rating));
  }

  _processBlurbs () {
    document.querySelectorAll('li.blurb[id^="work_"]').forEach(b => this._addBlurbButton(b));
  }

  _observeBlurbs () {
    this._observer = new MutationObserver(mutations => {
      let changed = false;
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1 &&
              (n.classList?.contains('blurb') || n.querySelector?.('li.blurb'))) {
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
      if (changed) this._processBlurbs();
    });
    this._observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Download queue ─────────────────────────────────────────────────────
  _addToQueue (workId, title, author, format) {
    this._queue.push({ workId, title, author, format, status: 'pending' });
    this._updateQueuePanel();
    this._showNotification(`Added to queue: "${title}"`, 'info');
    if (!this._isQueueRunning) this._processQueue();
  }

  async _processQueue () {
    if (this._isQueueRunning) return;
    this._isQueueRunning = true;

    while (this._queue.some(i => i.status === 'pending')) {
      if (!this._active) return; // module deactivated while the queue was running

      if (this._queuePaused) {
        await this._wait(500);
        if (!this._active) return;
        continue;
      }

      const item = this._queue.find(i => i.status === 'pending');
      if (!item) break;

      item.status = 'downloading';
      this._updateQueuePanel();

      const result = await this._downloadSingleWork(item.workId, item.title, item.author, item.format);
      if (!this._active) return; // module deactivated while this item was downloading
      item.status  = result?.success ? 'done' : 'failed';
      this._updateQueuePanel();

      if (item.status === 'failed') {
        this._showNotification(`Queue: failed "${item.title}"`, 'error');
      }
      if (this._queue.some(i => i.status === 'pending') && !this._queuePaused) {
        await this._wait(2000);
        if (!this._active) return;
      }
    }

    this._isQueueRunning = false;
    this._updateQueuePanel();
  }

  _buildQueuePanel () {
    const panel = document.createElement('div');
    panel.className = 'ao3h-queue-panel';

    const header = document.createElement('div');
    header.className = 'ao3h-queue-header';

    const title   = document.createElement('span');
    title.textContent = 'Download Queue';

    const btnRow  = document.createElement('div');
    btnRow.className = 'ao3h-queue-btn-row';

    const pauseBtn = document.createElement('button');
    pauseBtn.className   = 'ao3h-queue-pause-btn';
    pauseBtn.textContent = '⏸ Pause';
    pauseBtn.addEventListener('click', () => {
      this._queuePaused  = !this._queuePaused;
      pauseBtn.textContent   = this._queuePaused ? '▶ Resume' : '⏸ Pause';
      pauseBtn.style.background = this._queuePaused ? '#5cb85c' : '#f0ad4e';
      if (!this._queuePaused && !this._isQueueRunning) this._processQueue();
    });

    const clearBtn = document.createElement('button');
    clearBtn.className   = 'ao3h-queue-clear-btn';
    clearBtn.textContent = '✕ Clear done';
    clearBtn.title       = 'Remove completed and failed items';
    clearBtn.addEventListener('click', () => {
      this._queue = this._queue.filter(i => i.status === 'pending' || i.status === 'downloading');
      this._updateQueuePanel();
    });

    btnRow.appendChild(pauseBtn);
    btnRow.appendChild(clearBtn);
    header.appendChild(title);
    header.appendChild(btnRow);

    const list = document.createElement('ul');
    list.className = 'ao3h-queue-list';

    panel.appendChild(header);
    panel.appendChild(list);
    return panel;
  }

  _updateQueuePanel () {
    if (!this._queuePanel) return;
    const list = this._queuePanel.querySelector('.ao3h-queue-list');
    if (!list) return;
    list.innerHTML = '';

    const hasItems = this._queue.length > 0;
    this._queuePanel.style.display = hasItems ? 'block' : 'none';
    if (!hasItems) return;

    const ICONS = { pending: '⏳', downloading: '🔄', done: '✅', failed: '❌', cancelled: '🚫' };

    this._queue.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'ao3h-queue-item';

      const icon  = document.createElement('span');
      icon.textContent = ICONS[item.status] || '?';

      const label = document.createElement('span');
      label.className   = 'ao3h-queue-item-label';
      label.textContent = item.title.length > 30 ? item.title.slice(0, 28) + '…' : item.title;
      label.title       = item.title;

      const cancelBtn = document.createElement('button');
      cancelBtn.className   = 'ao3h-queue-cancel-btn';
      cancelBtn.textContent = '✕';
      cancelBtn.title = 'Cancel';
      cancelBtn.addEventListener('click', () => {
        if (this._queue[idx]?.status === 'pending') {
          this._queue[idx].status = 'cancelled';
          this._updateQueuePanel();
        }
      });

      li.appendChild(icon);
      li.appendChild(label);
      if (item.status === 'pending') li.appendChild(cancelBtn);
      list.appendChild(li);
    });
  }

  // ── Series page: download entire series ────────────────────────────────
  _buildSeriesDownloadBtn () {
    const blurbs = Array.from(document.querySelectorAll('li.blurb[id^="work_"]'));
    if (!blurbs.length) return null;

    const seriesTitle = document.querySelector('h2.heading')?.textContent.trim() || 'Series';

    const btn = document.createElement('button');
    btn.className   = 'ao3h-series-dl-btn';
    btn.textContent = `⬇️ Download Series (${blurbs.length} works)`;

    btn.addEventListener('click', () => {
      const format = this.getFormat();
      let idx      = 1;
      for (const blurb of blurbs) {
        const { workId, title, author } = this._getBlurbInfo(blurb);
        if (workId) {
          this._addToQueue(workId, `${String(idx).padStart(2, '0')}_${title}`, author, format);
          idx++;
        }
      }
      this._showNotification(`Added ${idx - 1} works from "${seriesTitle}" to queue`, 'success');
    });

    return btn;
  }

  // ── Init ───────────────────────────────────────────────────────────────
  init () {
    // Queue panel (always available)
    this._queuePanel = this._buildQueuePanel();
    document.body.appendChild(this._queuePanel);
    this._injected.push(this._queuePanel);

    // Work page
    if (this.isWorkPage()) {
      const dlArea = document.querySelector('.download');
      if (!dlArea) {
        this._log('info', '[DownloadEnhancements] No .download area found on work page');
        return;
      }

      const fmtSel = this._buildFormatSelector();
      dlArea.appendChild(fmtSel);
      this._injected.push(fmtSel);

      if (this.kindleEnabled) {
        const titleEl = document.querySelector('.title.heading');
        const title   = titleEl?.textContent.trim() || 'Untitled';
        const kBtn    = this._buildKindleButton(title);
        dlArea.appendChild(kBtn);
        this._injected.push(kBtn);
      }

      if (this.calibreEnabled) {
        const workId = this.getWorkId();
        const title  = document.querySelector('.title.heading')?.textContent.trim() || 'Untitled';
        const author = document.querySelector('a[rel="author"]')?.textContent.trim() || 'Anonymous';
        const cBtn   = document.createElement('a');
        cBtn.className   = 'ao3h-calibre-btn';
        cBtn.href        = 'javascript:void(0);';
        cBtn.textContent = '📚 Send to Calibre';
        cBtn.addEventListener('click', e => { e.preventDefault(); this._sendToCalibre(workId, title, author); });
        dlArea.appendChild(cBtn);
        this._injected.push(cBtn);
      }

      this._log('info', '[DownloadEnhancements] Work page initialized');
      return;
    }

    // Listing pages: per-blurb download buttons
    if (this.isListingPage() && this.showListingBtns) {
      this._processBlurbs();
      this._observeBlurbs();
      this._log('info', '[DownloadEnhancements] Listing page initialized');
      return;
    }

    // Series page: series download button
    if (this.isSeriesPage()) {
      const seriesBtn = this._buildSeriesDownloadBtn();
      if (seriesBtn) {
        const anchor = document.querySelector('#main h2.heading');
        if (anchor) anchor.insertAdjacentElement('afterend', seriesBtn);
        else document.querySelector('#main')?.prepend(seriesBtn);
        this._injected.push(seriesBtn);
      }
      this._log('info', '[DownloadEnhancements] Series page initialized');
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────
  cleanup () {
    this._active = false;
    this._controllers.forEach(controller => controller.abort());
    this._controllers.clear();
    this._pendingWaits.forEach(({ timer, resolve }) => { clearTimeout(timer); resolve(); });
    this._pendingWaits.clear();
    this._toastTimers.forEach(timer => clearTimeout(timer));
    this._toastTimers.clear();
    this._toastEls.forEach(el => el.remove());
    this._toastEls.clear();

    this._injected.forEach(el => el?.remove?.());
    this._injected = [];
    document.querySelectorAll('.ao3h-dl-btn-wrap, .ao3h-ctx-menu, .ao3h-dl-note').forEach(el => el.remove());
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    this._queuePaused    = true;
    this._isQueueRunning = false;
    this._queue          = [];
    this._queuePanel     = null;
    this._log('info', '[DownloadEnhancements] Cleanup complete');
  }
}
