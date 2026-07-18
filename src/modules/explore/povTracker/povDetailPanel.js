/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker › Detail Panel

On a work/chapter page, records a full-text POV analysis for the chapter
currently being read (never fetches other chapters proactively) and renders
a small panel summarizing the best-available verdict for the whole work: the
combined POV, whether chapters read so far agree, and a per-chapter
breakdown once more than one chapter has been analyzed.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { Routes } from '../../../../lib/ao3/routes.js';
import { getWorkMeta, getChapterProse } from '../../../../lib/ao3/work-page.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const PANEL_ID = 'ao3h-pov-detail-panel';

function currentChapterLabel () {
  const opt = document.querySelector('select#selected_id option[selected]');
  return opt?.textContent?.trim() || 'Full work';
}

export class PovDetailPanel {
  /** @param {{ cfg: Function }} opts */
  constructor ({ cfg }) {
    this.cfg = cfg;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — RECORD + RENDER
  ═══════════════════════════════════════════════════════════════════════ */

  init () {
    if (!this.cfg('showDetailPanel') || !this.cfg('analyzeFullText')) return;
    if (!Routes.isWork?.()) return;

    const meta = getWorkMeta();
    if (!meta.workId) return;

    const analysis = W.AO3H_PovTracker?._analysis;
    if (!analysis) return;

    const chapterScope = document.querySelector('#workskin .chapter');
    const text = getChapterProse(chapterScope);
    if (text) {
      analysis.recordChapterAnalysis(meta.workId, meta.chapterId || 'single', currentChapterLabel(), text);
      analysis.flush();
    }

    this._render(meta.workId);
  }

  _render (workId) {
    document.getElementById(PANEL_ID)?.remove();

    const combined = W.AO3H_PovTracker?._analysis?.getCombinedResult(workId);
    if (!combined) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;

    const summary = document.createElement('div');
    summary.className = 'ao3h-pov-panel-summary';
    summary.textContent = `POV: ${combined.pov} (${combined.confidence} confidence)`;
    panel.appendChild(summary);

    if (combined.chapters.length > 1) {
      const distinct = new Set(combined.chapters.map((c) => c.pov));
      const consistency = document.createElement('div');
      consistency.className = 'ao3h-pov-panel-consistency';
      consistency.textContent = distinct.size > 1
        ? '⚠️ POV change detected across chapters read'
        : `Consistent across ${combined.chapters.length} chapters read`;
      panel.appendChild(consistency);

      const list = document.createElement('ul');
      list.className = 'ao3h-pov-panel-chapters';
      combined.chapters.forEach((c) => {
        const li = document.createElement('li');
        li.textContent = `${c.label}: ${c.pov} (${c.confidence})`;
        list.appendChild(li);
      });
      panel.appendChild(list);
    }

    const anchor = document.querySelector('#workskin .preface') || document.getElementById('workskin');
    anchor?.insertAdjacentElement('afterend', panel);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  destroy () {
    document.getElementById(PANEL_ID)?.remove();
  }
}
