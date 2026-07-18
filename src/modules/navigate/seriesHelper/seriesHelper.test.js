import { describe, it, expect, beforeEach } from 'vitest';

function buildSeriesPage ({ withUnsubscribe = false } = {}) {
  document.body.innerHTML = `
    <div id="main">
      <h2 class="heading">A Grand Series</h2>
      ${withUnsubscribe ? `
        <form action="/users/tester/subscriptions/99" method="post">
          <input type="submit" value="Unsubscribe">
        </form>` : ''}
      <dl class="series meta group">
        <dt>Words:</dt><dd>30,000</dd>
        <dt>Works:</dt><dd>3</dd>
      </dl>
      <ul class="series work index group">
        <li id="work_11" class="work blurb group">
          <h4 class="heading"><a href="/works/11">The Long Road: Part 1</a></h4>
          <dl class="stats"><dt>Words:</dt><dd class="words">10,000</dd></dl>
        </li>
        <li id="work_12" class="work blurb group">
          <h4 class="heading"><a href="/works/12">The Long Road: Part 2</a></h4>
          <dl class="stats"><dt>Words:</dt><dd class="words">15,000</dd></dl>
        </li>
      </ul>
    </div>
  `;
}

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:seriesHelper:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_seriesHelper.js');
  await setEnabled('seriesHelper', true);
  await setEnabled('seriesPage', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('seriesPage', false);
  await setEnabled('seriesHelper', false);
}

describe('seriesHelper › seriesPage (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('affiche le total de mots, le temps estimé et le nombre de parties indisponibles', async () => {
    history.pushState(null, '', '/series/42');
    buildSeriesPage();
    const { setEnabled } = await boot();
    try {
      const summary = document.getElementById('ao3h-sh-series-summary');
      expect(summary).not.toBeNull();
      expect(summary.textContent).toContain('25,000 words total');
      expect(summary.textContent).toContain('~1 h 40 min');
      // 3 annoncées, 2 listées → 1 indisponible
      expect(summary.textContent).toContain('1 work unavailable');
    } finally {
      await teardown(setEnabled);
    }
    expect(document.getElementById('ao3h-sh-series-summary')).toBeNull();
  });

  it('propose la prochaine œuvre non lue d’après l’historique de readingTracker', async () => {
    history.pushState(null, '', '/series/42');
    buildSeriesPage();
    localStorage.setItem('ao3h:rt:history', JSON.stringify([{ id: '11' }]));
    const { setEnabled } = await boot();
    try {
      const next = document.querySelector('.ao3h-sh-next-unread');
      expect(next).not.toBeNull();
      expect(next.getAttribute('href')).toBe('/works/12');
      expect(next.textContent).toContain('Part 2');
    } finally {
      await teardown(setEnabled);
    }
  });

  it("enregistre l'abonnement et le type de série pendant la visite de la page", async () => {
    history.pushState(null, '', '/series/42');
    buildSeriesPage({ withUnsubscribe: true });
    const { setEnabled } = await boot();
    try {
      expect(JSON.parse(localStorage.getItem('ao3h:sh:sub'))).toEqual({ 42: 1 });
      // Titres "The Long Road: Part 1/2" → suite séquentielle
      expect(JSON.parse(localStorage.getItem('ao3h:sh:type:42'))).toBe('seq');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('masque les séries vides sur les listings de séries quand le réglage est activé', async () => {
    history.pushState(null, '', '/users/tester/series');
    document.body.innerHTML = `
      <ul class="series index group">
        <li id="series_1" class="series blurb group">
          <h4 class="heading"><a href="/series/1">Empty One</a></h4>
          <dl class="stats"><dt>Works:</dt><dd>0</dd></dl>
        </li>
        <li id="series_2" class="series blurb group">
          <h4 class="heading"><a href="/series/2">Full One</a></h4>
          <dl class="stats"><dt>Works:</dt><dd>4</dd></dl>
        </li>
      </ul>
    `;
    const { setEnabled } = await boot({ hideEmptySeries: true });
    try {
      expect(document.getElementById('series_1').classList.contains('ao3h-sh-empty-hidden')).toBe(true);
      expect(document.getElementById('series_2').classList.contains('ao3h-sh-empty-hidden')).toBe(false);
    } finally {
      await teardown(setEnabled);
    }
    expect(document.getElementById('series_1').classList.contains('ao3h-sh-empty-hidden')).toBe(false);
  });
});

describe('seriesHelper › seriesProgress (bannière, intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('signale la fin de série proche dans la bannière de page de work', async () => {
    history.pushState(null, '', '/works/12');
    document.body.innerHTML = `
      <div id="main">
        <h2 class="title heading">The Long Road: Part 2</h2>
        <dl class="work meta group">
          <dd class="series"><span class="position">Part 4 of 5 of <a href="/series/42">A Grand Series</a></span></dd>
        </dl>
      </div>
    `;
    const { setEnabled } = await import('../../../core/lifecycle.js').then(async (m) => {
      await import('./_seriesHelper.js');
      await m.setEnabled('seriesHelper', true);
      await m.setEnabled('seriesProgress', true);
      return m;
    });
    try {
      const nudge = document.querySelector('.ao3h-sh-banner-nudge');
      expect(nudge).not.toBeNull();
      expect(nudge.textContent).toContain('Last part after this one');
    } finally {
      await setEnabled('seriesProgress', false);
      await setEnabled('seriesHelper', false);
    }
  });
});
