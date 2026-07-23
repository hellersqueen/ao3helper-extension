import { getLogger } from './logger.js';
const log = getLogger('status-tracker-base');
/* ═══════════════════════════════════════════════════════════════════════════
   STATUS TRACKER BASE - Abstract Module Architecture
   
   Provides reusable infrastructure for tracking user status on works:
   - Generic crawler for fetching work IDs from AO3 pages
   - Generic badge renderer for visual indicators on blurbs
   - Generic live-sync for real-time updates
   
   Used by: bookmarkStatus, markForLaterStatus, quickMarkForLaterButton
═══════════════════════════════════════════════════════════════════════════ */

;(function statusTrackerBaseInit(){
  'use strict';

  const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
  
  if (!W.AO3H) {
    setTimeout(statusTrackerBaseInit, 100);
    return;
  }
  
  const AO3H = W.AO3H;
  
  if (!AO3H.StatusTrackerBase) {
    AO3H.StatusTrackerBase = {};
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     GENERIC CRAWLER FACTORY
     Fetches work IDs from paginated AO3 pages with resume capability
  ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Creates a generic crawler for any paginated AO3 list
   * @param {Object} config
   * @param {Function} config.buildUrl - (username, page) => url
   * @param {Function} config.parseHTML - (htmlString) => {ids: Set, hasNext: boolean, blurbsSeen: number}
   * @param {string} config.name - Crawler name for logging
   * @returns {Function} async crawlAll(options)
   */
  AO3H.StatusTrackerBase.createCrawler = function(config) {
    const {buildUrl, parseHTML, name = 'GenericCrawler'} = config;
    
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const now = () => Date.now();

    return async function crawlAll({
      username,
      cache,
      onProgress,
      onComplete,
      onError,
      state,
      crawlConfig,
      saveCache,
      STATUS
    }) {
      log.debug(`🔄 Starting crawl from page ${state.nextPage}`);
      
      const crawlStartTs = now();
      let page = state.nextPage;
      let totalAdded = 0;
      let reachedEnd = false;

      while (true) {
        const nowTs = now();
        
        // Backoff check
        if (state.backoff && nowTs < state.backoff) {
          const waitMs = state.backoff - nowTs;
          log.debug(`⏸️  Backoff active, waiting ${Math.ceil(waitMs/1000)}s`);
          await sleep(waitMs + 100);
        }

        // Fetch page
        const url = buildUrl(username, page);
        log.debug(`📥 Fetching page ${page}: ${url}`);
        
        let html;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            if (response.status === 429) {
              // Rate limit - apply backoff
              const backoffDuration = crawlConfig.backoffDuration || 60000;
              state.backoff = now() + backoffDuration;
              if (saveCache) saveCache();
              console.warn(`[${name}] ⚠️ 429 Rate limit, backing off for ${backoffDuration/1000}s`);
              continue;
            }
            throw new Error(`HTTP ${response.status}`);
          }
          html = await response.text();
        } catch (err) {
          console.error(`[${name}] ❌ Fetch error:`, err);
          if (onError) onError(err);
          return {totalAdded, reachedEnd: false, nextPage: page};
        }

        // Parse HTML
        const {ids, hasNext, blurbsSeen} = parseHTML(html);
        
        // Add to cache
        let addedThisPage = 0;
        ids.forEach(id => {
          if (!cache.items.has(id)) {
            cache.items.add(id);
            addedThisPage++;
            totalAdded++;
          }
        });

        log.debug(`✅ Page ${page}: ${addedThisPage} new IDs (${blurbsSeen} blurbs total)`);
        
        // Update cache metadata
        cache.lastCrawlPage = page;
        cache.lastCrawlTs = now();
        cache.status = STATUS.CRAWLING;
        
        if (saveCache) saveCache();
        if (onProgress) onProgress(page, totalAdded, cache.items.size);

        // Check if done
        if (!hasNext) {
          reachedEnd = true;
          log.debug(`🏁 Reached end at page ${page}`);
          break;
        }

        // Check runtime limit
        const elapsed = now() - crawlStartTs;
        const maxRuntime = crawlConfig.maxCrawlRuntime || 30000;
        if (elapsed > maxRuntime) {
          log.debug(`⏱️  Runtime limit reached (${elapsed}ms), pausing`);
          state.nextPage = page + 1;
          if (saveCache) saveCache();
          return {totalAdded, reachedEnd: false, nextPage: page + 1};
        }

        // Move to next page
        page++;
        const delayMs = crawlConfig.pageDelay || 1000;
        await sleep(delayMs);
      }

      // Crawl complete
      state.nextPage = 1;
      cache.status = STATUS.COMPLETE;
      cache.didFullCrawl = true;
      if (saveCache) saveCache();
      if (onComplete) onComplete(totalAdded);

      log.debug(`✨ Crawl complete: ${totalAdded} new IDs added`);
      return {totalAdded, reachedEnd, nextPage: 1};
    };
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     GENERIC BADGE RENDERER
     Displays visual indicators on work blurbs
  ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Creates a generic badge renderer
   * @param {Object} config
   * @param {string} config.badgeClass - CSS class for badge
   * @param {string} config.badgeText - Badge text/emoji
   * @param {string} config.badgeTitle - Tooltip text
   * @param {string} config.name - Renderer name for logging
   * @returns {Function} renderBadges(cache)
   */
  AO3H.StatusTrackerBase.createBadgeRenderer = function(config) {
    const {badgeClass, badgeText, badgeTitle, name = 'GenericRenderer'} = config;

    return function renderBadges(cache) {
      const blurbs = document.querySelectorAll('li.blurb, li.bookmark.blurb');
      let addedCount = 0;

      blurbs.forEach(blurb => {
        // Skip if already has badge
        if (blurb.querySelector(`.${badgeClass}`)) return;

        // Extract work ID
        const link = blurb.querySelector('a[href*="/works/"]');
        const match = link?.getAttribute('href')?.match(/\/works\/(\d+)/);
        if (!match) return;
        
        const workId = match[1];
        
        // Check if in cache
        if (cache.items.has(workId)) {
          // Create badge
          const badge = document.createElement('span');
          badge.className = badgeClass;
          badge.textContent = badgeText;
          badge.title = badgeTitle;
          badge.style.cssText = `
            display: inline-block;
            margin-left: 0.5em;
            padding: 0.2em 0.5em;
            border-radius: 3px;
            background: var(--ao3h-badge-bg, #e74c3c);
            color: var(--ao3h-badge-color, white);
            font-size: 0.85em;
            font-weight: bold;
          `;

          // Insert badge
          const heading = blurb.querySelector('h4.heading, .header h4, h4');
          if (heading) {
            heading.appendChild(badge);
            addedCount++;
          }
        }
      });

      if (addedCount > 0) {
        log.debug(`✅ Rendered ${addedCount} badges`);
      }
    };
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     GENERIC LIVE-SYNC
     Monitors DOM for new blurbs and renders badges dynamically
  ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Creates a generic live-sync observer
   * @param {Object} config
   * @param {Function} config.renderBadges - Badge rendering function
   * @param {Function} config.getCache - Function that returns current cache
   * @param {string} config.name - Name for logging
   * @returns {Object} {start, stop}
   */
  AO3H.StatusTrackerBase.createLiveSync = function(config) {
    const {renderBadges, getCache, name = 'GenericLiveSync'} = config;
    
    let observer = null;
    let intervalId = null;

    function start() {
      log.debug(`🔄 Starting live-sync`);

      // Initial render
      const cache = getCache();
      if (cache) renderBadges(cache);

      // Periodic re-render (every 2 seconds)
      intervalId = setInterval(() => {
        const cache = getCache();
        if (cache) renderBadges(cache);
      }, 2000);

      // Mutation observer for dynamic content
      observer = new MutationObserver((mutations) => {
        let shouldRender = false;
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && (
                node.matches?.('li.blurb, li.bookmark') ||
                node.querySelector?.('li.blurb, li.bookmark')
              )) {
                shouldRender = true;
              }
            });
          }
        });

        if (shouldRender) {
          const cache = getCache();
          if (cache) renderBadges(cache);
        }
      });

      const target = document.querySelector('#main') || document.body;
      observer.observe(target, {
        childList: true,
        subtree: true
      });
    }

    function stop() {
      log.debug(`⏹️  Stopping live-sync`);
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    return {start, stop};
  };

  log.debug('✅ Base infrastructure ready');

})();
