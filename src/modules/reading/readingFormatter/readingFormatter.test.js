import { describe, it, expect, beforeEach } from 'vitest';

function buildWorkPage ({ wallText = null } = {}) {
  const wall = wallText ? `<p>${wallText}</p>` : '';
  document.body.innerHTML = `
    <div id="main">
      <h2 class="title heading">A Test Work</h2>
      <h3 class="byline heading"><a rel="author" href="/users/writer">writer</a></h3>
      <dl class="work meta group">
        <dd class="fandom tags"><a class="tag" href="/tags/F1/works">Fandom One</a></dd>
        <dd class="freeform tags"><a class="tag" href="/tags/Fluff/works">Fluff</a></dd>
      </dl>
      <div id="workskin">
        <div class="userstuff">
          <p>He said, “Hello there.” She waved back.</p>
          <p>${'x'.repeat(700)}</p>
          <p>***</p>
          <p>Short paragraph.</p>
          ${wall}
        </div>
      </div>
    </div>
  `;
}

async function boot (settings = {}, children = []) {
  localStorage.setItem('ao3h:mod:readingFormatter:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_readingFormatter.js');
  await setEnabled('readingFormatter', true);
  for (const child of children) await setEnabled(child, true);
  return { setEnabled };
}

async function teardown (setEnabled, children = []) {
  for (const child of [...children].reverse()) await setEnabled(child, false);
  await setEnabled('readingFormatter', false);
}

describe('readingFormatter (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    history.pushState(null, '', '/works/1');
    buildWorkPage();
  });

  it('le style de séparateur de scène personnalisé remplace le symbole fixe', async () => {
    const { setEnabled } = await boot({ unifySceneBreaks: true, sceneBreakStyle: '⁂' }, ['spacingAndStructure']);
    try {
      const brk = document.querySelector('.ao3h-rf-scene-break');
      expect(brk).not.toBeNull();
      expect(brk.textContent).toBe('⁂');
    } finally {
      await teardown(setEnabled, ['spacingAndStructure']);
    }
  });

  it('le mode Breathe marque uniquement les paragraphes longs', async () => {
    const { setEnabled } = await boot({ breatheMode: true }, ['readingViewOptimization']);
    try {
      const marked = document.querySelectorAll('.ao3h-rf-breathe');
      expect(marked.length).toBe(1);
      expect(marked[0].textContent.length).toBeGreaterThanOrEqual(600);
    } finally {
      await teardown(setEnabled, ['readingViewOptimization']);
    }
    expect(document.querySelector('.ao3h-rf-breathe')).toBeNull();
  });

  it('la mise en valeur des dialogues entoure les répliques et se retire proprement', async () => {
    const { setEnabled } = await boot({ highlightDialogue: true }, ['typography']);
    const original = 'He said, “Hello there.” She waved back.';
    try {
      const span = document.querySelector('.ao3h-rf-dialogue');
      expect(span).not.toBeNull();
      expect(span.textContent).toBe('“Hello there.”');
    } finally {
      await teardown(setEnabled, ['typography']);
    }
    const p = document.querySelector('#workskin .userstuff p');
    expect(p.textContent).toBe(original);
    expect(document.querySelector('.ao3h-rf-dialogue')).toBeNull();
  });

  it('les murs de texte sont découpés en plusieurs paragraphes puis restaurés', async () => {
    const wall = 'This is a full sentence of the wall. '.repeat(60).trim();
    buildWorkPage({ wallText: wall });
    const { setEnabled } = await boot({ splitTextWalls: true }, ['contentCleanup']);
    try {
      const parts = document.querySelectorAll('p[data-rf-wall]');
      expect(parts.length).toBeGreaterThan(1);
    } finally {
      await teardown(setEnabled, ['contentCleanup']);
    }
    expect(document.querySelector('p[data-rf-wall]')).toBeNull();
    const restored = [...document.querySelectorAll('#workskin .userstuff p')]
      .find(p => p.textContent === wall);
    expect(restored).toBeTruthy();
  });

  it("répète le titre, l'auteur et les tags en fin d'œuvre", async () => {
    const { setEnabled } = await boot({ endOfWorkInfo: true }, ['readingViewOptimization']);
    try {
      const box = document.getElementById('ao3h-rf-endinfo');
      expect(box).not.toBeNull();
      expect(box.textContent).toContain('A Test Work — writer');
      expect(box.textContent).toContain('Fluff');
      expect(box.querySelector('a[href="/tags/Fluff/works"]')).not.toBeNull();
    } finally {
      await teardown(setEnabled, ['readingViewOptimization']);
    }
  });

  it('la règle de lecture suit la souris et disparaît au nettoyage', async () => {
    const { setEnabled } = await boot({ readingRuler: true }, ['readingViewOptimization']);
    try {
      const ruler = document.querySelector('.ao3h-rf-ruler');
      expect(ruler).not.toBeNull();
      document.dispatchEvent(new MouseEvent('mousemove', { clientY: 300 }));
      expect(ruler.style.top).toBe('286px');
    } finally {
      await teardown(setEnabled, ['readingViewOptimization']);
    }
    expect(document.querySelector('.ao3h-rf-ruler')).toBeNull();
  });

  it('les préférences du panneau Aa sont mémorisées par œuvre quand perWorkPrefs est activé', async () => {
    const { setEnabled } = await boot({ perWorkPrefs: true }, ['readingControls']);
    try {
      const widerBtn = document.querySelector('.ao3h-rf-width-btn[data-width="narrow"]');
      widerBtn.click();
      expect(JSON.parse(localStorage.getItem('ao3h:readingFormatter:width:1'))).toBe('narrow');
      expect(localStorage.getItem('ao3h:readingFormatter:width')).toBeNull(); // global untouched
    } finally {
      await teardown(setEnabled, ['readingControls']);
    }
  });
});
