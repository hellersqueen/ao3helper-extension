import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:fanficBingeMode:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./fanficBingeMode.js');
  await setEnabled('fanficBingeMode', true);
  return { setEnabled };
}

describe('fanficBingeMode (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("le panneau d'accueil ne montre que les fics pas encore terminées, dans la limite configurée", async () => {
    history.pushState(null, '', '/');
    document.body.innerHTML = '<div id="main"></div>';
    localStorage.setItem('ao3h:rt:history', JSON.stringify([
      { id: '1', title: 'Finished Fic', chapter: 5, totalChapters: 5, href: '/works/1', lastReadAt: Date.now() },
      { id: '2', title: 'WIP One', chapter: 1, totalChapters: 3, chapterHref: '/works/2/chapters/10', lastReadAt: Date.now() },
      { id: '3', title: 'WIP Two', chapter: 2, totalChapters: 6, chapterHref: '/works/3/chapters/20', lastReadAt: Date.now() },
    ]));
    const { setEnabled } = await boot({ resumeCount: 1 });
    try {
      const panel = document.getElementById('ao3h-fbm-homepage-panel');
      expect(panel).not.toBeNull();
      expect(panel.textContent).not.toContain('Finished Fic');
      expect(panel.textContent).toContain('WIP One');
      expect(panel.textContent).not.toContain('WIP Two'); // resumeCount: 1
    } finally {
      await setEnabled('fanficBingeMode', false);
    }
  });

  it('la pastille de reprise compacte apparaît sur une page de listing quand reminderScope l’inclut', async () => {
    history.pushState(null, '', '/works');
    localStorage.setItem('ao3h:rt:history', JSON.stringify([
      { id: '2', title: 'WIP One', chapter: 1, totalChapters: 3, chapterHref: '/works/2/chapters/10', lastReadAt: Date.now() },
    ]));
    const { setEnabled } = await boot({ reminderScope: 'home+search' });
    try {
      const widget = document.getElementById('ao3h-fbm-resume-widget');
      expect(widget).not.toBeNull();
      expect(widget.textContent).toContain('WIP One');
    } finally {
      await setEnabled('fanficBingeMode', false);
    }
  });

  it("la pastille n'apparaît pas sur une page de listing si reminderScope reste sur 'home'", async () => {
    history.pushState(null, '', '/works');
    localStorage.setItem('ao3h:rt:history', JSON.stringify([
      { id: '2', title: 'WIP One', chapter: 1, totalChapters: 3, chapterHref: '/works/2/chapters/10', lastReadAt: Date.now() },
    ]));
    const { setEnabled } = await boot({ reminderScope: 'home' });
    try {
      expect(document.getElementById('ao3h-fbm-resume-widget')).toBeNull();
    } finally {
      await setEnabled('fanficBingeMode', false);
    }
  });

  it('la priorité de la file cycle low → medium → high en cliquant, et affiche la barre de progression connue', async () => {
    history.pushState(null, '', '/');
    localStorage.setItem('ao3h:fbm:queue', JSON.stringify([
      { id: '7', title: 'Queued Fic', href: '/works/7', addedAt: Date.now(), priority: 'low' },
    ]));
    localStorage.setItem('ao3h:rt:progress:7', JSON.stringify({ progress: 42 }));
    const { setEnabled } = await boot({ queueEnabled: true });
    try {
      const bar = document.querySelector('#ao3h-fbm-queue-panel .ao3h-fbm-qp-progress-bar');
      expect(bar.style.width).toBe('42%');

      const priorityBtn = document.querySelector('#ao3h-fbm-queue-panel .ao3h-fbm-qp-priority');
      expect(priorityBtn.title).toContain('low');
      priorityBtn.click();
      expect(document.querySelector('#ao3h-fbm-queue-panel .ao3h-fbm-qp-priority').title).toContain('medium');
    } finally {
      await setEnabled('fanficBingeMode', false);
    }
  });

  it("le compte à rebours d'auto-avance ouvre la fic prioritaire de la file plutôt que /works", async () => {
    vi.useFakeTimers();
    history.pushState(null, '', '/works/1');
    document.body.innerHTML = `
      <h2 class="title heading">Some Work</h2>
      <ul class="work navigation actions"></ul>
    `;
    localStorage.setItem('ao3h:fbm:queue', JSON.stringify([
      { id: '2', title: 'Low prio', href: '/works/2', addedAt: 1, priority: 'low' },
      { id: '3', title: 'High prio', href: '/works/3', addedAt: 2, priority: 'high' },
    ]));
    const { setEnabled } = await boot({ autoAdvanceDelay: 2, continueReadingModal: true });
    try {
      // Force the "you've reached the end" modal open directly via scroll threshold
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true });
      window.scrollY = 1000;
      window.innerHeight = 100;
      window.dispatchEvent(new Event('scroll'));

      await vi.advanceTimersByTimeAsync(2100);
      expect(location.pathname).toBe('/works/3'); // high priority wins
    } finally {
      await setEnabled('fanficBingeMode', false);
    }
  });

  it('le raccourci clavier enregistré ouvre la fic la plus récente non terminée', async () => {
    history.pushState(null, '', '/');
    localStorage.setItem('ao3h:rt:history', JSON.stringify([
      { id: '9', title: 'Resume Me', chapter: 1, totalChapters: 4, chapterHref: '/works/9/chapters/99', lastReadAt: Date.now() },
    ]));
    let registeredHandler = null;
    vi.stubGlobal('AO3H_Keyboard', {
      register: (action, key, fn) => { registeredHandler = fn; return () => { registeredHandler = null; }; },
    });
    const { setEnabled } = await boot();
    try {
      expect(registeredHandler).toBeTypeOf('function');
      registeredHandler();
      expect(location.pathname).toBe('/works/9/chapters/99');
    } finally {
      await setEnabled('fanficBingeMode', false);
    }
  });

  it("le rappel de pause affiche un toast une fois le seuil écoulé, seulement si l'onglet est visible", async () => {
    vi.useFakeTimers();
    history.pushState(null, '', '/works/1');
    document.body.innerHTML = '<h2 class="title heading">Some Work</h2>';
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    const { setEnabled } = await boot({ breakReminderMinutes: 1 });
    try {
      await vi.advanceTimersByTimeAsync(65000);
      expect(document.querySelector('.ao3h-toast')).not.toBeNull();
    } finally {
      await setEnabled('fanficBingeMode', false);
    }
  });
});
