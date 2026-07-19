import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function buildPage () {
  // Matches every submodule's page check: bare /users/{name} page.
  history.pushState(null, '', '/users/testuser');
  document.body.innerHTML = `
    <div class="header module"><a href="/users/testuser">testuser</a></div>
    <div id="main"><div class="module"></div></div>
  `;
}

function seedSessions (sessions) {
  localStorage.setItem('ao3h:activityPanel:sessions', JSON.stringify(sessions));
}

function seedReadingHistory (entries) {
  localStorage.setItem('ao3h:rt:history', JSON.stringify(entries));
}

async function boot (subModules, settings = {}) {
  localStorage.setItem('ao3h:mod:activityPanel:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_activityPanel.js');
  await setEnabled('activityPanel', true);
  for (const m of subModules) await setEnabled(m, true);
  return { setEnabled, subModules };
}

async function teardown (setEnabled, subModules) {
  for (const m of subModules) await setEnabled(m, false);
  await setEnabled('activityPanel', false);
}

describe('activityPanel (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.AO3H?.ficAppreciation;
  });

  it('corrige le bug réel : le nuage de tags utilise les tags des sessions quand readingTracker ne les fournit pas', async () => {
    buildPage();
    // Mirrors real readingTracker entries (seenTracking.js): no fandoms/tags/rating field at all.
    seedReadingHistory([{ id: 'w1', title: 'A Fic', author: 'alice', seenAt: Date.now() }]);
    seedSessions([{ workId: 'w1', words: 5000, tags: ['Fluff'], fandoms: ['Star Wars'], startedAt: Date.now() }]);
    const { setEnabled, subModules } = await boot(['readingInsights'], { showTagCloud: true });
    try {
      const cloudItem = document.querySelector('.ao3h-tag-cloud-item');
      expect(cloudItem).not.toBeNull();
      expect(cloudItem.textContent).toBe('Fluff');
    } finally {
      await teardown(setEnabled, subModules);
    }
  });

  it('le sélecteur de période recalcule les cartes de statistiques', async () => {
    buildPage();
    const now = Date.now();
    seedReadingHistory([{ id: 'w1', seenAt: now }, { id: 'w2', seenAt: now }]);
    seedSessions([
      { workId: 'w1', words: 1000, startedAt: now },
      { workId: 'w2', words: 2000, startedAt: now - 40 * 86400000 },
    ]);
    const { setEnabled, subModules } = await boot(['readingInsights']);
    try {
      const select = document.querySelector('.ao3h-insights-period');
      select.value = 'today';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      const worksCard = document.querySelector('.ao3h-insights-card strong');
      expect(worksCard.textContent).toBe('1');
    } finally {
      await teardown(setEnabled, subModules);
    }
  });

  it('détecte les relectures et les compare mois par mois dans les tendances', async () => {
    buildPage();
    const now = Date.now();
    seedSessions([
      { workId: 'w1', title: 'Reread Me', words: 1000, startedAt: now },
      { workId: 'w1', title: 'Reread Me', words: 1000, startedAt: now - 86400000 },
    ]);
    const { setEnabled, subModules } = await boot(['patternAnalysis']);
    try {
      const widget = document.getElementById('ao3h-pattern-widget');
      expect(widget.innerHTML).toContain('Reread Me');
      expect(widget.innerHTML).toContain('reread');
    } finally {
      await teardown(setEnabled, subModules);
    }
  });

  it('détecte un profil de lecture nocturne dans les habitudes', async () => {
    buildPage();
    const night = new Date();
    night.setHours(2, 0, 0, 0);
    seedSessions(Array.from({ length: 5 }, () => ({ startedAt: night.getTime(), hourOfDay: 2 })));
    const { setEnabled, subModules } = await boot(['habitsAnalysis']);
    try {
      const profile = document.querySelector('.ao3h-habits-profile');
      expect(profile.textContent).toContain('night');
    } finally {
      await teardown(setEnabled, subModules);
    }
  });

  it('affiche un camembert et une colonne kudos alimentée par ficAppreciation dans le tableau des fandoms', async () => {
    buildPage();
    window.AO3H = window.AO3H || {};
    window.AO3H.ficAppreciation = { getKudosStats: () => ({ byFandom: [{ key: 'Harry Potter', count: 7 }] }) };
    seedSessions([{ workId: 'w1', words: 30000, fandoms: ['Harry Potter'], startedAt: Date.now() }]);
    const { setEnabled, subModules } = await boot(['fandomBreakdown']);
    try {
      expect(document.querySelector('.ao3h-fb-pie')).not.toBeNull();
      const row = document.querySelector('.ao3h-fb-row');
      expect(row.textContent).toContain('Harry Potter');
      expect(row.textContent).toContain('7'); // kudos column
      expect(row.textContent).toContain('2'); // ~2 hours (30000 words / 250wpm / 60)
    } finally {
      await teardown(setEnabled, subModules);
    }
  });

  it('compare deux fandoms côte à côte quand on coche leurs cases', async () => {
    buildPage();
    seedSessions([
      { workId: 'w1', words: 1000, fandoms: ['Fandom A'], startedAt: Date.now() },
      { workId: 'w2', words: 2000, fandoms: ['Fandom B'], startedAt: Date.now() },
    ]);
    const { setEnabled, subModules } = await boot(['fandomBreakdown']);
    try {
      const checkboxes = document.querySelectorAll('.ao3h-fb-compare-cb');
      checkboxes[0].checked = true;
      checkboxes[0].dispatchEvent(new Event('change', { bubbles: true }));
      checkboxes[1].checked = true;
      checkboxes[1].dispatchEvent(new Event('change', { bubbles: true }));

      const result = document.querySelector('.ao3h-fb-compare-result');
      expect(result.hidden).toBe(false);
      expect(result.textContent).toContain('Fandom A');
      expect(result.textContent).toContain('Fandom B');
    } finally {
      await teardown(setEnabled, subModules);
    }
  });

  it('affiche des liens rapides vers Bookmarks/History/Subscriptions avec le bon nom d’utilisateur', async () => {
    buildPage();
    seedReadingHistory([{ id: 'w1', seenAt: Date.now() }]);
    seedSessions([{ workId: 'w1', words: 1000, startedAt: Date.now() }]);
    const { setEnabled, subModules } = await boot(['readingInsights']);
    try {
      const links = document.querySelector('.ao3h-insights-quicklinks');
      expect(links.innerHTML).toContain('/users/testuser/bookmarks');
      expect(links.innerHTML).toContain('/users/testuser/readings');
      expect(links.innerHTML).toContain('/users/testuser/subscriptions');
    } finally {
      await teardown(setEnabled, subModules);
    }
  });
});
