/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer › Series Grouping

Groups visible works from the same series into labeled listing wrappers and
orders those groups according to the configured series sorting mode.

Notes

- A wrapper is created only when at least two visible works share a series.
- Alphabetical, popularity, and original insertion order are supported.
- Cleanup unwraps every work and removes the generated group containers.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const NS   = 'ao3h';
const MOD  = 'seriesGrouping';
const LOG  = `[AO3H][${MOD}]`;

// Settings are shared across all searchEnhancer children and saved by the
// panel under the parent module id (explore/searchEnhancer-config.js).
const DEFAULTS = {
  groupSeriesInResults: false,
  fandomSortMode:       'alpha', // 'alpha' | 'popularity' | 'history'
};
function readCfg () {
  return loadModuleSettings('searchEnhancer', DEFAULTS);
}

function isListingPage () {
  const p = location.pathname;
  return /^\/works($|\?)/.test(p) || /\/tags\/[^/]+\/works/.test(p);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SERIES GROUPING AND ORDERING
═══════════════════════════════════════════════════════════════════════════ */

const WRAP_CLS = `${NS}-se-series-group`;

function groupSeriesByWork (container, cfg) {
  const blurbs = Array.from(container.querySelectorAll('li.work.blurb'));
  const groups = new Map(); // seriesTitle → [blurb]
  const ungrouped = [];

  blurbs.forEach(blurb => {
    const seriesEl = blurb.querySelector('ul.series li');
    if (seriesEl) {
      const link = seriesEl.querySelector('a[href*="/series/"]');
      const key  = link ? link.href : seriesEl.textContent.trim();
      if (!groups.has(key)) groups.set(key, { label: seriesEl.textContent.trim(), blurbs: [] });
      groups.get(key).blurbs.push(blurb);
    } else {
      ungrouped.push(blurb);
    }
  });

  if (!groups.size) return; // nothing to group

  // Sort groups according to fandomSortMode
  let groupEntries = Array.from(groups.values());
  if (cfg.fandomSortMode === 'alpha') {
    groupEntries.sort((a, b) => a.label.localeCompare(b.label));
  } else if (cfg.fandomSortMode === 'popularity') {
    groupEntries.sort((a, b) => b.blurbs.length - a.blurbs.length);
  }
  // 'history' = insertion order (no sort needed)

  // Remove all blurbs from DOM temporarily
  blurbs.forEach(b => b.remove());

  // Re-inject groups first, then ungrouped
  for (const group of groupEntries) {
    if (group.blurbs.length < 2) {
      group.blurbs.forEach(b => container.appendChild(b));
      continue;
    }
    const wrapper = document.createElement('li');
    wrapper.className = WRAP_CLS;
    const header = document.createElement('div');
    header.textContent = `📚 Series: ${group.blurbs.length} works`;
    wrapper.appendChild(header);
    group.blurbs.forEach(b => wrapper.appendChild(b));
    container.appendChild(wrapper);
  }
  ungrouped.forEach(b => container.appendChild(b));
  console.log(LOG, `Grouped ${groups.size} series`);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Series Grouping', parent: 'searchEnhancer', enabledByDefault: false },
  async function init () {
    const cfg = readCfg();
    console.log(LOG, 'init', cfg);

    if (!isListingPage()) return;

    const container = document.querySelector('ol.work.index, ul.work.index');
    if (!container) return;

    if (cfg.groupSeriesInResults) {
      groupSeriesByWork(container, cfg);
    }

    return function cleanup () {
      document.querySelectorAll(`.${WRAP_CLS}`).forEach(wrapper => {
        const parent = wrapper.parentNode;
        Array.from(wrapper.querySelectorAll('li.work.blurb')).forEach(b => {
          parent.insertBefore(b, wrapper);
        });
        wrapper.remove();
      });
      console.log(LOG, 'cleanup');
    };
  }
);
