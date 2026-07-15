/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer Module Coordinator
    Module ID: searchEnhancer
    Display Name: Search Enhancer
    Tab: Explore

    Submodules (parent/child registration pattern):
        searchEnhancer/relatedSearches    -- related tag suggestions panel
        searchEnhancer/searchAutocomplete -- history + autocomplete dropdown + quick search icons
        searchEnhancer/resultsSorting     -- kudos/hits ratio sorting + inline display
        searchEnhancer/seriesGrouping     -- groups series works together in listings

    Coordinator role:
        - Exposes W.AO3H_SearchEnhancer shared helpers (lsGet, lsSet, NS)
        - Injects shared CSS once

    Storage keys (owned by submodules):
        ao3h:se:history   -- owned by searchAutocomplete  [{ query, ts }], max 25, LIFO dedup
        ao3h:se:sort      -- owned by resultsSorting      last chosen sort mode per page path
        ao3h:se:sugcache  -- owned by relatedSearches     { [tagKey]: { tags, ts } } 7-day cache

    Pages: /works/search, /tags/{tag}/works and any listing with a search form

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import styles from './searchEnhancer.css?inline';

import './relatedSearches.js';
import './searchAutocomplete.js';
import './resultsSorting.js';
import './seriesGrouping.js';

css(styles, 'ao3h-searchEnhancer');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'searchEnhancer';

// ── Coordinator registration ──────────────────────────────────────────────
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
