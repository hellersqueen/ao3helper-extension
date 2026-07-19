import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** @param {string} id @param {{title?: string, words?: number, kudos?: number, hits?: number, bookmarks?: number, chapters?: string, fandom?: string, kind?: string}} [opts] */
function blurb (id, { title = 'Some Fic', words, kudos, hits, bookmarks, chapters = '1/1', fandom = 'Harry Potter', kind = 'work' } = {}) {
  var stats = (words != null || kudos != null || hits != null || bookmarks != null)
    ? `<dl class="stats">
         ${words != null ? `<dd class="words">${words}</dd>` : ''}
         ${kudos != null ? `<dd class="kudos">${kudos}</dd>` : ''}
         ${hits != null ? `<dd class="hits">${hits}</dd>` : ''}
         ${bookmarks != null ? `<dd class="bookmarks">${bookmarks}</dd>` : ''}
       </dl>`
    : '';
  return `<li class="${kind} blurb group" id="work_${id}">
    <h4 class="heading"><a href="/works/${id}">${title}</a></h4>
    <dd class="chapters">${chapters}</dd>
    <h5 class="fandoms heading"><a class="tag">${fandom}</a></h5>
    ${stats}
  </li>`;
}

function buildListingPage (blurbsHtml) {
  history.pushState(null, '', '/works');
  document.body.innerHTML = `
    <div id="header"><ul class="primary navigation"></ul></div>
    <div id="main"><ol class="work index group">${blurbsHtml}</ol></div>`;
}

function buildSeriesPage (blurbsHtml) {
  history.pushState(null, '', '/series/123');
  document.body.innerHTML = `
    <div id="header"><ul class="primary navigation"></ul></div>
    <div id="main"><dl class="series meta"></dl><ol class="index group">${blurbsHtml}</ol></div>`;
}

function buildMFLPage (blurbsHtml, { username = 'someuser' } = {}) {
  history.pushState(null, '', `/users/${username}/readings?show=to-read`);
  document.body.innerHTML = `
    <div id="header"><ul class="primary navigation"></ul></div>
    <div id="main">
      <h2 class="heading">Marked for Later</h2>
      <ol class="bookmark index group">${blurbsHtml.replace(/class="work blurb/g, 'class="bookmark blurb')}</ol>
    </div>`;
}

function seedItems (items) {
  localStorage.setItem('ao3h:laterShelf:items', JSON.stringify(items));
}
function loadItems () {
  return JSON.parse(localStorage.getItem('ao3h:laterShelf:items') || '[]');
}

// Child submodules cascade-boot reactively through a Flags watcher (fire-and-forget),
// so `await setEnabled('laterShelf', true)` resolving does not guarantee they're all
// booted yet — give the cascade a few real ticks to settle.
async function flush () {
  for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0));
}

async function boot (settings = {}, { workReminder = false } = {}) {
  localStorage.setItem('ao3h:mod:laterShelf:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_laterShelf.js');
  await setEnabled('laterShelf', true);
  if (workReminder) await setEnabled('workReminder', true);
  await flush();
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('laterShelf', false);
}

describe('laterShelf (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ajoute une fic au clic sur le bouton, avec un toast "Undo" qui la restaure', async () => {
    buildListingPage(blurb('1'));
    const { setEnabled } = await boot();
    try {
      document.querySelector('.ao3h-ls-btn').click();
      expect(loadItems().map(i => i.wid)).toEqual(['1']);
      expect(document.querySelector('.ao3h-ls-badge')).not.toBeNull();

      const undoBtn = document.querySelector('.ao3h-toast-action');
      expect(undoBtn).not.toBeNull();
      undoBtn.click();
      expect(loadItems()).toEqual([]);
      expect(document.querySelector('.ao3h-ls-btn').classList.contains('ao3h-ls-active')).toBe(false);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('demande une note rapide à l’ajout quand noteOnAdd est activé', async () => {
    buildListingPage(blurb('1'));
    window.prompt = vi.fn().mockReturnValue('read this when sad');
    const { setEnabled } = await boot({ noteOnAdd: true });
    try {
      document.querySelector('.ao3h-ls-btn').click();
      expect(loadItems()[0].note).toBe('read this when sad');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('ajoute toute une série en un clic depuis une page /series/', async () => {
    buildSeriesPage(blurb('1') + blurb('2'));
    const { setEnabled } = await boot();
    try {
      const seriesBtn = document.getElementById('ao3h-ls-series-add');
      expect(seriesBtn).not.toBeNull();
      seriesBtn.click();
      expect(loadItems().map(i => i.wid).sort()).toEqual(['1', '2']);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('permet d’ajouter plusieurs fics sélectionnées d’un coup quand bulkAddEnabled est activé', async () => {
    buildListingPage(blurb('1') + blurb('2'));
    const { setEnabled } = await boot({ bulkAddEnabled: true });
    try {
      const checkboxes = document.querySelectorAll('.ao3h-ls-bulk-add-chk');
      expect(checkboxes.length).toBe(2);
      checkboxes.forEach(cb => { cb.checked = true; });
      const bar = document.getElementById('ao3h-ls-bulk-add-bar');
      const addBtn = Array.from(bar.querySelectorAll('button')).find(b => b.textContent.includes('Add Selected'));
      addBtn.click();
      expect(loadItems().map(i => i.wid).sort()).toEqual(['1', '2']);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche le compteur et le temps de lecture total estimé sur la page MFL', async () => {
    seedItems([
      { wid: '1', title: 'Fic One', addedAt: Date.now() },
      { wid: '2', title: 'Fic Two', addedAt: Date.now() },
    ]);
    buildMFLPage(blurb('1', { words: 5000 }) + blurb('2', { words: 5000 }));
    const { setEnabled } = await boot();
    try {
      expect(document.getElementById('ao3h-ls-count').textContent).toBe('(2 works)');
      expect(document.getElementById('ao3h-ls-time-total').textContent).toContain('40 min');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('permet de changer la priorité et le groupe d’une fic depuis la page MFL', async () => {
    seedItems([{ wid: '1', title: 'Fic One', addedAt: Date.now() }]);
    buildMFLPage(blurb('1'));
    const { setEnabled } = await boot();
    try {
      const prioritySel = document.querySelector('.ao3h-ls-priority-sel');
      prioritySel.value = 'high';
      prioritySel.dispatchEvent(new Event('change', { bubbles: true }));
      expect(loadItems()[0].priority).toBe('high');

      const groupInput = document.querySelector('.ao3h-ls-group-input');
      groupInput.value = 'weekend reading';
      groupInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(loadItems()[0].group).toBe('weekend reading');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('trie par priorité et active le glisser-déposer en mode manuel', async () => {
    seedItems([
      { wid: '1', title: 'Low', addedAt: 100, priority: 'low' },
      { wid: '2', title: 'High', addedAt: 200, priority: 'high' },
    ]);
    buildMFLPage(blurb('1') + blurb('2'));
    const { setEnabled } = await boot();
    try {
      const sortSel = /** @type {HTMLSelectElement} */ (document.getElementById('ao3h-ls-sort-sel'));
      sortSel.value = 'priority';
      sortSel.dispatchEvent(new Event('change', { bubbles: true }));

      const ol = document.querySelector('ol.bookmark.index');
      const order = Array.from(ol.querySelectorAll(':scope > li')).map(li => li.id);
      expect(order).toEqual(['work_2', 'work_1']); // high priority first

      sortSel.value = 'manual';
      sortSel.dispatchEvent(new Event('change', { bubbles: true }));
      Array.from(ol.querySelectorAll(':scope > li')).forEach(li => {
        expect(li.draggable).toBe(true);
      });
    } finally {
      await teardown(setEnabled);
    }
  });

  it('supprime en masse avec une option d’annulation quand rien n’a été soumis à AO3', async () => {
    seedItems([{ wid: '1', title: 'Fic One', addedAt: Date.now() }]);
    buildMFLPage(blurb('1'));
    window.confirm = vi.fn().mockReturnValue(true);
    const { setEnabled } = await boot();
    try {
      document.querySelector('.ao3h-ls-chk').checked = true;
      document.getElementById('ao3h-ls-del').click();
      expect(loadItems()).toEqual([]);

      const undoBtn = document.querySelector('.ao3h-toast-action');
      expect(undoBtn).not.toBeNull();
      undoBtn.click();
      expect(loadItems().map(i => i.wid)).toEqual(['1']);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('retire automatiquement une fic du shelf quand elle est marquée terminée (autoRemoveOnFinish)', async () => {
    seedItems([{ wid: '1', title: 'Fic One', addedAt: Date.now() }]);
    buildListingPage(blurb('1'));
    const { setEnabled } = await boot({ autoRemoveOnFinish: true });
    try {
      document.dispatchEvent(new CustomEvent('ao3h:workFinished', { detail: { workId: '1' } }));
      expect(loadItems()).toEqual([]);
      expect(JSON.parse(localStorage.getItem('ao3h:laterShelf:archive'))[0].wid).toBe('1');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('signale un nouveau chapitre depuis l’ajout au shelf', async () => {
    seedItems([{ wid: '1', title: 'Fic One', addedAt: Date.now(), chaptersAtAdd: 2, completeAtAdd: false }]);
    buildListingPage(blurb('1', { chapters: '3/10' }));
    const { setEnabled } = await boot();
    try {
      const badge = document.querySelector('.ao3h-ls-update-badge');
      expect(badge).not.toBeNull();
      expect(badge.textContent).toContain('New chapter');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche un badge de compteur dans le header, mis à jour à l’ajout, avec aperçu au clic', async () => {
    buildListingPage(blurb('1'));
    const { setEnabled } = await boot();
    try {
      const navBtn = document.querySelector('.ao3h-ls-nav-counter-btn');
      expect(navBtn.textContent).toBe('📌 0');

      document.querySelector('.ao3h-ls-btn').click();
      expect(navBtn.textContent).toBe('📌 1');

      navBtn.click();
      const preview = document.getElementById('ao3h-ls-nav-preview');
      expect(preview.hidden).toBe(false);
      expect(preview.textContent).toContain('Some Fic');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('règle un rappel à l’heure de pointe des habitudes de lecture, et affiche le bouton snooze', async () => {
    localStorage.setItem('ao3h:activityPanel:sessions', JSON.stringify([
      { hourOfDay: 21 }, { hourOfDay: 21 }, { hourOfDay: 9 },
    ]));
    buildMFLPage(blurb('1'));
    window.prompt = vi.fn()
      .mockReturnValueOnce('2026-08-01') // date
      .mockReturnValueOnce('')           // custom message
      .mockReturnValueOnce('');          // recurrence
    const { setEnabled } = await boot({ remindersEnabled: true }, { workReminder: true });
    try {
      document.querySelector('.ao3h-ls-remind-btn').click();
      await Promise.resolve(); // let requestNotifyPermission's promise settle
      await Promise.resolve();

      const reminders = JSON.parse(localStorage.getItem('ao3h:laterShelf:reminders'));
      expect(reminders['1'].status).toBe('pending');
      expect(new Date(reminders['1'].remindAt).getHours()).toBe(21);

      const snoozeBtn = document.querySelector('.ao3h-ls-snooze-btn');
      expect(snoozeBtn).not.toBeNull();
      const before = JSON.parse(localStorage.getItem('ao3h:laterShelf:reminders'))['1'].remindAt;
      snoozeBtn.click();
      const after = JSON.parse(localStorage.getItem('ao3h:laterShelf:reminders'))['1'].remindAt;
      expect(after).toBeGreaterThan(before);

      const history = JSON.parse(localStorage.getItem('ao3h:laterShelf:reminders:history'));
      expect(history.some(h => h.action === 'snoozed')).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
  });
});
