/* ──────────────────────────────────────────────────────────────────────────
   EVENT BUS
   Why: decouple modules (emit/listen) without direct imports.
   Extended to bridge with AO3's native events (jQuery, Rails UJS)
─────────────────────────────────────────────────────────────────────────── */

export const Bus = (()=> {
  const map = new Map();
  function on(evt, fn){ if(!map.has(evt)) map.set(evt, new Set()); map.get(evt).add(fn); }
  function off(evt, fn){ const set = map.get(evt); if(set) set.delete(fn); }
  function emit(evt, data){ const set = map.get(evt); if(set) for(const fn of set) { try{ fn(data);}catch(e){ console.error('[AO3H] Bus handler', e); } } }
  
  /**
   * Bridge native jQuery/DOM events to our bus
   * @param {string} domEvent - Native event name (e.g. 'loadedCSRF', 'ajax:success')
   * @param {string} busEvent - Our bus event name
   * @param {string|Element} target - Selector or element (default: document)
   */
  function bridge(domEvent, busEvent, target = document) {
    const handler = (e) => {
      emit(busEvent, e.detail || e.originalEvent?.detail || {});
    };
    
    if (typeof target === 'string') {
      // Use jQuery delegation if available
      const getJQuery = () => {
        if (typeof window.jQuery !== 'undefined') return window.jQuery;
        if (typeof window.$j !== 'undefined') return window.$j;
        return null;
      };
      const $ = getJQuery();
      if ($) {
        $(document).on(domEvent, target, handler);
      } else {
        document.addEventListener(domEvent, handler);
      }
    } else {
      target.addEventListener(domEvent, handler);
    }
  }
  
  /**
   * Wait for a single event with timeout
   * @param {string} evt - Event name
   * @param {number} timeout - Max wait in ms
   * @returns {Promise<any>} Resolves with event data or null on timeout
   */
  function once(evt, timeout = 5000) {
    return new Promise((resolve) => {
      let resolved = false;
      const handler = (data) => {
        if (!resolved) {
          resolved = true;
          off(evt, handler);
          resolve(data);
        }
      };
      on(evt, handler);
      
      if (timeout > 0) {
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            off(evt, handler);
            resolve(null);
          }
        }, timeout);
      }
    });
  }
  
  return { on, off, emit, bridge, once };
})();