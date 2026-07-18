import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function buildHomePage () {
  history.pushState(null, '', '/');
  document.body.innerHTML = `<div class="latest news module"></div>`;
}

function buildWorkPage (tags = ['Slow Burn']) {
  history.pushState(null, '', '/works/42');
  document.body.innerHTML = `
    <h2 class="title heading">A Test Work</h2>
    <dd class="freeform tags"><ul>${tags.map(t => `<li><a class="tag">${t}</a></li>`).join('')}</ul></dd>
  `;
}

async function boot (settings = {}, children = []) {
  localStorage.setItem('ao3h:mod:tropeGames:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_tropeGames.js');
  await setEnabled('tropeGames', true);
  for (const child of children) await setEnabled(child, true);
  return { setEnabled };
}

async function teardown (setEnabled, children = []) {
  for (const child of [...children].reverse()) await setEnabled(child, false);
  await setEnabled('tropeGames', false);
}

const ALL_CHILDREN = ['tropeHoroscope', 'tropeBingoPatterns', 'tropeRoulette', 'tropeStatistics', 'tropeAchievements', 'tropeMoodQuiz'];

describe('tropeGames (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('le menu flottant consolidé regroupe les boutons de tous les mini-jeux', async () => {
    buildHomePage();
    const { setEnabled } = await boot({}, ALL_CHILDREN);
    try {
      const fab = document.getElementById('ao3h-tg-menu-fab');
      const menu = document.getElementById('ao3h-tg-menu');
      expect(fab).not.toBeNull();
      expect(menu.hidden).toBe(true);

      fab.click();
      expect(menu.hidden).toBe(false);

      expect(menu.querySelector('.ao3h-tg-bingo-toggle')).not.toBeNull();
      expect(menu.querySelector('.ao3h-tg-roulette-trigger')).not.toBeNull();
      expect(menu.querySelector('.ao3h-tg-stats-trigger')).not.toBeNull();
      expect(menu.querySelector('.ao3h-tg-ach-trigger')).not.toBeNull();
      expect(menu.querySelector('.ao3h-tg-mood-trigger')).not.toBeNull();
      expect(menu.querySelector('.ao3h-tg-horo-trigger')).not.toBeNull();
    } finally {
      await teardown(setEnabled, ALL_CHILDREN);
    }
  });

  it("corrige le bug de réglage : showDailyTrope désactivé dans le panneau bloque bien la bannière (elle lisait auparavant une mauvaise clé de stockage)", async () => {
    buildHomePage();
    const { setEnabled } = await boot({ showDailyTrope: false }, ['tropeHoroscope']);
    try {
      expect(document.querySelector('.ao3h-tg-horoscope-banner')).toBeNull();
    } finally {
      await teardown(setEnabled, ['tropeHoroscope']);
    }
  });

  it('génère une carte de bingo personnalisée (taille, catégorie, exclusion) et affiche le pourcentage de progression', async () => {
    buildWorkPage(['Slow Burn']);
    const { setEnabled } = await boot({
      bingoSize: 9,
      bingoCategory: 'Romance',
      bingoExclude: 'Slow Burn',
    }, ['tropeBingoPatterns']);
    try {
      document.getElementById('ao3h-tg-menu-fab').click();
      document.querySelector('.ao3h-tg-bingo-toggle').click();

      const grid = document.querySelector('.ao3h-tg-bingo-grid');
      expect(grid.classList.contains('ao3h-tg-bingo-grid-3')).toBe(true);
      const cells = [...document.querySelectorAll('.ao3h-tg-bingo-cell')];
      expect(cells).toHaveLength(9);
      expect(cells.some(c => c.title === 'Slow Burn')).toBe(false); // excluded
      expect(document.querySelector('.ao3h-tg-bingo-progress').textContent).toContain('% complete');
    } finally {
      await teardown(setEnabled, ['tropeBingoPatterns']);
    }
  });

  it('signale par un toast un motif de bingo complété en arrière-plan, sans ouvrir la carte', async () => {
    const card = Array(25).fill('Fix-It');
    card[12] = 'FREE';
    card[4] = 'Slow Burn'; // dernière case du motif "Corners" à cocher
    const checked = Array(25).fill(false);
    checked[0] = true; checked[20] = true; checked[24] = true; checked[12] = true;
    localStorage.setItem('ao3h:tg:bingo', JSON.stringify({ card, checked, completed: [], size: 5 }));

    buildWorkPage(['Slow Burn']);
    const { setEnabled } = await boot({}, ['tropeBingoPatterns']);
    try {
      const toast = document.querySelector('.ao3h-toast');
      expect(toast).not.toBeNull();
      expect(toast.textContent).toContain('Corners');
    } finally {
      await teardown(setEnabled, ['tropeBingoPatterns']);
    }
  });

  it('le nombre de tropes tirés à la roulette est configurable', async () => {
    buildHomePage();
    const { setEnabled } = await boot({ rouletteCount: 5 }, ['tropeRoulette']);
    try {
      document.getElementById('ao3h-tg-menu-fab').click();
      document.querySelector('.ao3h-tg-roulette-trigger').click();
      expect(document.querySelectorAll('.ao3h-tg-roulette-tropes li')).toHaveLength(5);
    } finally {
      await teardown(setEnabled, ['tropeRoulette']);
    }
  });

  it('« Surprise Pick » prévient Surprise Me via sessionStorage puis ouvre la recherche', async () => {
    buildHomePage();
    const { setEnabled } = await boot({}, ['tropeRoulette']);
    try {
      document.getElementById('ao3h-tg-menu-fab').click();
      document.querySelector('.ao3h-tg-roulette-trigger').click();
      document.querySelector('.ao3h-tg-roulette-surprise').click();

      expect(sessionStorage.getItem('ao3h:tg:autoSurprise')).toBe('1');
      expect(location.href).toContain('archiveofourown.org/works?work_search');
    } finally {
      await teardown(setEnabled, ['tropeRoulette']);
    }
  });

  it("Surprise Me déclenche automatiquement un tirage quand le drapeau de la roulette est présent", async () => {
    sessionStorage.setItem('ao3h:tg:autoSurprise', '1');
    history.pushState(null, '', '/works?work_search%5Bquery%5D=Slow+Burn');
    document.body.innerHTML = `
      <ol class="work index group">
        <li class="work blurb group" id="work_99">
          <h4 class="heading"><a href="/works/99">Only Candidate</a></h4>
        </li>
      </ol>
    `;
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('../surpriseMe/surpriseMe.js');
    await setEnabled('surpriseMe', true);
    try {
      expect(sessionStorage.getItem('ao3h:tg:autoSurprise')).toBeNull(); // consumé
      expect(location.pathname).toBe('/works/99');
    } finally {
      await setEnabled('surpriseMe', false);
    }
  });

  it('le quiz d’humeur recommande un trope et propose une recherche AO3', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    buildHomePage();
    const { setEnabled } = await boot({}, ['tropeMoodQuiz']);
    try {
      document.getElementById('ao3h-tg-menu-fab').click();
      document.querySelector('.ao3h-tg-mood-trigger').click();
      document.querySelector('.ao3h-tg-mood-opt[data-mood="romantic"]').click();

      const result = document.querySelector('.ao3h-tg-mood-result');
      expect(result).not.toBeNull();
      expect(result.textContent.length).toBeGreaterThan(0);
    } finally {
      await teardown(setEnabled, ['tropeMoodQuiz']);
    }
  });

  it("l'horoscope peut être réaffiché manuellement et signale si la prédiction d'hier s'est réalisée", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    localStorage.setItem(`ao3h:tg:horoscope:${yKey}`, JSON.stringify({ trope: 'Slow Burn', tagline: 'x', dismissed: true, date: yKey }));
    localStorage.setItem('ao3h:tg:stats:seen', JSON.stringify([{ id: '1', date: yKey, tropes: ['Slow Burn'] }]));

    buildHomePage();
    const { setEnabled } = await boot({ showDailyTrope: false }, ['tropeHoroscope']);
    try {
      // Bannière auto masquée (showDailyTrope: false), mais le déclencheur manuel reste dispo
      expect(document.querySelector('.ao3h-tg-horoscope-banner')).toBeNull();

      document.getElementById('ao3h-tg-menu-fab').click();
      document.querySelector('.ao3h-tg-horo-trigger').click();

      const modal = document.querySelector('.ao3h-tg-horoscope-modal');
      expect(modal.style.display).toBe('flex');
      expect(modal.querySelector('.ao3h-tg-horo-retro').textContent).toContain('came true');
    } finally {
      await teardown(setEnabled, ['tropeHoroscope']);
    }
  });

  it('les statistiques affichent le défi hebdomadaire, la tendance mensuelle et les tropes non explorés', async () => {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    localStorage.setItem('ao3h:tg:stats', JSON.stringify({ 'Slow Burn': 3 }));
    localStorage.setItem('ao3h:tg:stats:seen', JSON.stringify([
      { id: '1', date: todayKey, tropes: ['Slow Burn', 'Fix-It'] },
    ]));

    buildHomePage();
    const { setEnabled } = await boot({}, ['tropeStatistics']);
    try {
      document.getElementById('ao3h-tg-menu-fab').click();
      document.querySelector('.ao3h-tg-stats-trigger').click();

      const panel = document.querySelector('.ao3h-tg-stats-panel');
      expect(panel.querySelector('.ao3h-tg-stats-challenge').textContent).toContain('Weekly Challenge');
      expect(panel.querySelector('.ao3h-tg-stats-trend')).not.toBeNull();
      expect(panel.querySelector('.ao3h-tg-stats-rare').textContent).toContain('tropes left to explore');
    } finally {
      await teardown(setEnabled, ['tropeStatistics']);
    }
  });

  it("les succès affichent une médaille et un historique de déblocage chronologique", async () => {
    localStorage.setItem('ao3h:tg:stats', JSON.stringify({ 'Slow Burn': 1 }));
    buildHomePage();
    const { setEnabled } = await boot({}, ['tropeAchievements']);
    try {
      document.getElementById('ao3h-tg-menu-fab').click();
      document.querySelector('.ao3h-tg-ach-trigger').click();

      const panel = document.querySelector('.ao3h-tg-ach-panel');
      expect(panel.querySelector('.ao3h-tg-ach-medal').textContent).toBe('🥉'); // first_trope = bronze

      panel.querySelector('.ao3h-tg-ach-history-toggle').click();
      expect(document.querySelector('.ao3h-tg-ach-history-row')).not.toBeNull();
    } finally {
      await teardown(setEnabled, ['tropeAchievements']);
    }
  });

  it('le thème saisonnier pose un attribut sur <html> quand il est activé', async () => {
    buildHomePage();
    const { setEnabled } = await boot({ seasonalTheme: true });
    try {
      expect(document.documentElement.hasAttribute('data-ao3h-tg-season')).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
    expect(document.documentElement.hasAttribute('data-ao3h-tg-season')).toBe(false);
  });
});
