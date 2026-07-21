import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PovPresentation } from './povPresentation.js';
import { PovAnalysis, parsePreferredPovs } from './_povTracker.js';

function buildListing () {
  document.body.innerHTML = `
    <div id="main">
      <ol class="work index group">
        <li id="work_1" class="work blurb group">
          <h4 class="heading"></h4>
          <div class="tags"><li class="tag">POV First Person</li></div>
          <blockquote class="userstuff"></blockquote>
        </li>
        <li id="work_2" class="work blurb group">
          <h4 class="heading"></h4>
          <div class="tags"><li class="tag">POV Third Person</li></div>
          <blockquote class="userstuff"></blockquote>
        </li>
      </ol>
    </div>
  `;
}

function cfgFrom (overrides) {
  const values = {
    showBadgesOnBlurbs: true,
    badgeFirst: true, badgeSecond: false, badgeThird: true,
    badgeMixed: false, badgeMulti: false, badgeUnknown: false,
    enablePovFilters: true,
    autoAnalyze: true,
    autoApplyPreferredFilter: false,
    preferredPovs: '',
    ...overrides,
  };
  return (key) => values[key];
}

describe('PovPresentation — préférence auto-appliquée', () => {
  let presentation;
  let analysis;

  beforeEach(() => {
    localStorage.clear();
    buildListing();
    analysis = new PovAnalysis();
    analysis.init();
  });

  afterEach(() => {
    presentation?.destroy();
    document.body.innerHTML = '';
  });

  it('n’auto-masque rien quand autoApplyPreferredFilter est désactivé', () => {
    presentation = new PovPresentation({ cfg: cfgFrom(), analysis, parsePreferredPovs });
    presentation.init();
    expect(document.getElementById('work_2').style.display).not.toBe('none');
  });

  it('masque automatiquement les œuvres hors des POV préférés', () => {
    presentation = new PovPresentation({
      cfg: cfgFrom({ autoApplyPreferredFilter: true, preferredPovs: 'first' }),
      analysis,
      parsePreferredPovs,
    });
    presentation.init();

    expect(document.getElementById('work_1').style.display).not.toBe('none');
    expect(document.getElementById('work_2').style.display).toBe('none');
  });

  it('affiche le bouton de filtre correspondant déjà actif', () => {
    presentation = new PovPresentation({
      cfg: cfgFrom({ autoApplyPreferredFilter: true, preferredPovs: 'first' }),
      analysis,
      parsePreferredPovs,
    });
    presentation.init();

    const thirdBtn = document.querySelector('#ao3h-pov-filter-bar button[data-pov="third"]');
    expect(thirdBtn.classList.contains('active')).toBe(true);
    const firstBtn = document.querySelector('#ao3h-pov-filter-bar button[data-pov="first"]');
    expect(firstBtn.classList.contains('active')).toBe(false);
  });
});
