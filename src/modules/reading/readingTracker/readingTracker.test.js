import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function buildWorkPage (workId, { fandoms = ['Harry Potter'], words = 5000, chapter = '2/5' } = {}) {
  history.pushState(null, '', `/works/${workId}`);
  document.body.innerHTML = `
    <div id="main">
      <div id="feedback"><ul class="actions"></ul><div id="kudos"></div></div>
      <div id="workskin">
        <h2 class="title">My Fic</h2>
        <h3 class="byline"><a>ficAuthor</a></h3>
        <dd class="fandom tags">${fandoms.map(f => `<a>${f}</a>`).join('')}</dd>
        <dd class="chapters">${chapter}</dd>
        <select id="selected_id"><option value="99" selected>2. Chapter Two</option></select>
        <dl class="stats"><dd class="words">${words}</dd></dl>
        <div class="userstuff module"><p>Some text.</p><p>More text.</p></div>
      </div>
    </div>
  `;
}

function blurb (id, title = 'Some Fic') {
  return `<li class="work blurb group" id="work_${id}"><h4 class="heading"><a href="/works/${id}">${title}</a></h4><dd class="chapters">1/1</dd></li>`;
}

function buildListingPage (blurbsHtml) {
  history.pushState(null, '', '/works');
  document.body.innerHTML = `<div id="main"><ol class="work index group">${blurbsHtml}</ol></div>`;
}

function buildHomePage () {
  history.pushState(null, '', '/');
  document.body.innerHTML = `<div id="main"></div>`;
}

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:readingTracker:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_readingTracker.js');
  await setEnabled('readingTracker', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('readingTracker', false);
}

describe('readingTracker (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('incrémente le compteur de visites à chaque retour, et conserve l’épinglage entre deux visites', async () => {
    buildWorkPage('42');
    let { setEnabled } = await boot();
    await teardown(setEnabled);

    let history = JSON.parse(localStorage.getItem('ao3h:rt:history'));
    expect(history[0].visitCount).toBe(1);

    // Simulate the user pinning the entry from the history browser.
    history[0].pinned = true;
    localStorage.setItem('ao3h:rt:history', JSON.stringify(history));

    buildWorkPage('42');
    ({ setEnabled } = await boot());
    await teardown(setEnabled);

    history = JSON.parse(localStorage.getItem('ao3h:rt:history'));
    expect(history[0].visitCount).toBe(2);
    expect(history[0].pinned).toBe(true);
  });

  it('n’enregistre jamais un work exclu de l’historique (confidentialité)', async () => {
    localStorage.setItem('ao3h:rt:excludedWorks', JSON.stringify(['42']));
    buildWorkPage('42');
    const { setEnabled } = await boot();
    try {
      expect(JSON.parse(localStorage.getItem('ao3h:rt:history') || '[]')).toHaveLength(0);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('permet de marquer plusieurs œuvres comme vues d’un coup depuis une liste', async () => {
    buildListingPage(blurb('1') + blurb('2'));
    const { setEnabled } = await boot({ bulkMarkSeen: true });
    try {
      const checkboxes = document.querySelectorAll('.ao3h-bulk-cb');
      expect(checkboxes.length).toBe(2);
      checkboxes.forEach(cb => { cb.checked = true; });

      document.querySelector('.ao3h-bulk-mark-bar button').click();

      const history = JSON.parse(localStorage.getItem('ao3h:rt:history'));
      expect(history.map(e => e.id).sort()).toEqual(['1', '2']);
      expect(document.getElementById('work_1').classList.contains('ao3h-seen-mark')).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('applique le mode flou pour les œuvres déjà vues quand seenMode="blur"', async () => {
    localStorage.setItem('ao3h:rt:history', JSON.stringify([{ id: '1', title: 'Some Fic', seenAt: Date.now(), lastReadAt: Date.now() }]));
    buildListingPage(blurb('1'));
    const { setEnabled } = await boot({ seenMode: 'blur' });
    try {
      expect(document.getElementById('work_1').classList.contains('ao3h-seen-blur')).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('permet de cliquer sur la barre de progression pour sauter à une position', async () => {
    buildWorkPage('42');
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { setEnabled } = await boot({ progressStyle: 'bar' });
    try {
      const bar = document.querySelector('.ao3h-progress-badge--bar');
      expect(bar).not.toBeNull();
      vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue(
        /** @type {DOMRect} */ ({ left: 0, width: 100, top: 0, height: 10, right: 100, bottom: 10, x: 0, y: 0, toJSON: () => ({}) })
      );
      bar.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 50 }));
      expect(scrollToSpy).toHaveBeenCalled();
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche "Continue Reading" sur la page d’accueil, seulement pour les œuvres encore en cours', async () => {
    localStorage.setItem('ao3h:rt:history', JSON.stringify([
      { id: '1', title: 'In Progress Fic', chapter: 2, totalChapters: 5, lastReadAt: 200, href: '/works/1' },
      { id: '2', title: 'Finished Fic', chapter: 5, totalChapters: 5, lastReadAt: 300, href: '/works/2' },
    ]));
    buildHomePage();
    const { setEnabled } = await boot({ continueReadingWidget: true });
    try {
      const items = document.querySelectorAll('#ao3h-continue-reading li');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain('In Progress Fic');
    } finally {
      await teardown(setEnabled);
    }
  });
});
