import { register } from '../../../core/lifecycle.js';
import { observe, onReady } from '../../../../lib/utils/index.js';

const MOD = 'noteManagement';
const NS  = 'ao3h';

// ── Feature 1: Live word count on bookmark note textarea ─────────────────

function addWordCounters () {
  document.querySelectorAll('textarea#bookmark_notes, textarea[name="bookmark[notes]"]').forEach(ta => {
    if (ta.dataset.ao3hWc) return;
    ta.dataset.ao3hWc = '1';

    const counter = document.createElement('span');
    counter.className = `${NS}-wc-badge`;

    function update () {
      const words = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
      counter.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    }

    update();
    ta.addEventListener('input', update);
    ta.parentNode.insertBefore(counter, ta.nextSibling);
  });
}

// Note: la recherche dans les notes de bookmarks vivait ici en double avec
// ReadingStatusTracking._injectNoteSearch() (bookmarkStatus/readingStatusTracking.js),
// qui tourne sans bascule dédiée dès que bookmarkVault est actif. Fusionnée
// là-bas (shared.md, décision produit § recherche notes) pour ne plus avoir
// deux barres de recherche superposées quand ce sous-module est aussi activé.

register(MOD, {
  title:            'Note Management',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  // document.body peut ne pas encore exister quand ce module boote — sans ce
  // report, l'observer plantait (Cannot read properties of null), constaté
  // sur plusieurs modules similaires en test.
  let active = true;
  let obs = null;
  onReady(() => {
    if (!active) return;
    addWordCounters();
    obs = observe(document.body, { childList: true, subtree: true }, addWordCounters);
  });

  return () => {
    active = false;
    obs?.disconnect();
    document.querySelectorAll(`.${NS}-wc-badge`).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-wc]').forEach(el => delete el.dataset.ao3hWc);
  };
});
