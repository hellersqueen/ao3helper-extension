/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Downloader › Work HTML Template

Purpose
    Builds the standalone HTML document used for individual and batch work
    downloads.

Notes
    Centralizes markup shared by individualDownloads.js and batchDownload.js.
    Titles and author names are escaped; summary, notes, and chapter markup are
    preserved as HTML extracted from AO3.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { escapeHtml } from '../../../../lib/utils/dom.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

// This template helper is stateless and requires no setup.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — STANDALONE WORK DOCUMENT
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{ title: string, author: string, summary?: string, notes?: string, chaptersHTML?: string }} work
 * @returns {string} standalone HTML document
 */
export function buildWorkHTML({ title, author, summary = '', notes = '', chaptersHTML = '' }) {
  return `
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
  ${chaptersHTML}
</div>
</body>
</html>
    `;
}



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// This template helper allocates no persistent resources and requires no cleanup.
