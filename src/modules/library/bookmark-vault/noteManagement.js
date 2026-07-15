import { register } from '../../../core/lifecycle.js';
import { observe } from '../../../../lib/utils/index.js';

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

// ── Feature 2: Search within bookmark notes ──────────────────────────────

function injectNotesSearch () {
  if (!/\/users\/[^/]+\/bookmarks/.test(location.pathname)) return;
  const anchor = document.querySelector('#main h2.heading, #main h3.heading');
  if (!anchor || document.getElementById(`${NS}-notes-search`)) return;

  const wrap = document.createElement('div');
  wrap.id    = `${NS}-notes-search`;

  const input = document.createElement('input');
  input.type        = 'text';
  input.placeholder = 'Search bookmark notes…';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = '✕';
  clearBtn.title = 'Clear search';

  function applyFilter () {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
      if (!q) {
        if (blurb.dataset.ao3hNmHidden) {
          blurb.style.display = '';
          delete blurb.dataset.ao3hNmHidden;
        }
        return;
      }
      const noteText = (blurb.querySelector('blockquote.userstuff')?.textContent || '').toLowerCase();
      const hide = !noteText.includes(q);
      blurb.style.display = hide ? 'none' : '';
      if (hide) blurb.dataset.ao3hNmHidden = '1';
      else delete blurb.dataset.ao3hNmHidden;
    });
  }

  input.addEventListener('input', applyFilter);
  clearBtn.addEventListener('click', () => { input.value = ''; applyFilter(); });

  wrap.append(input, clearBtn);
  anchor.insertAdjacentElement('afterend', wrap);
}

register(MOD, {
  title:            'Note Management',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  addWordCounters();
  injectNotesSearch();

  const obs = observe(document.body, { childList: true, subtree: true }, addWordCounters);

  return () => {
    obs.disconnect();
    document.querySelectorAll(`.${NS}-wc-badge`).forEach(el => el.remove());
    document.querySelectorAll('[data-ao3h-wc]').forEach(el => delete el.dataset.ao3hWc);
    document.getElementById(`${NS}-notes-search`)?.remove();
    document.querySelectorAll('[data-ao3h-nm-hidden]').forEach(blurb => {
      blurb.style.display = '';
      delete blurb.dataset.ao3hNmHidden;
    });
  };
});
