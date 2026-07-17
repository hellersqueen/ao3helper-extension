/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Search Enhancer Coordinator

    Module ID: searchEnhancer
    Display Name: Search Enhancer
    Tab: Explore

    Purpose

    Coordinates search suggestions, autocomplete, result sorting, and series
    grouping on AO3 search and listing pages.

    Submodules

    - relatedSearches.js: related-tag suggestions
    - searchAutocomplete.js: history, autocomplete, and quick-search controls
    - resultsSorting.js: derived-stat sorting and inline metrics
    - seriesGrouping.js: grouping of related series works

    Notes

    - Shared storage helpers and the namespace are exposed through
      AO3H_SearchEnhancer while the coordinator is active.
    - Each child owns its own persisted storage keys.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import styles from './searchEnhancer.css?inline';

import './relatedSearches.js';
import './searchAutocomplete.js';
import './resultsSorting.js';
import './seriesGrouping.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-searchEnhancer');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'searchEnhancer';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Child modules consume the shared helper API installed during initialization.


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Search Enhancer', enabledByDefault: false },
  async function init () {
    W.AO3H_SearchEnhancer = { lsGet, lsSet, NS };
    return function cleanup () {
      delete W.AO3H_SearchEnhancer;
    };
  }
);
