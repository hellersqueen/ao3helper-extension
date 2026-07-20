import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { PovPresentation } from './povPresentation.js';
import { PovAnalysis } from './povAnalysis.js';
import { analyzeChapterText, parsePreferredPovs } from './_povTracker.js';

const W = getGlobalWindow();

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

  beforeEach(() => {
    localStorage.clear();
    buildListing();
    const analysis = new PovAnalysis({ analyzeChapterText });
    analysis.init();
    W.AO3H_PovTracker = { _analysis: analysis };
  });

  afterEach(() => {
    presentation?.destroy();
    delete W.AO3H_PovTracker;
    document.body.innerHTML = '';
  });

  it('n’auto-masque rien quand autoApplyPreferredFilter est désactivé', () => {
    presentation = new PovPresentation({ cfg: cfgFrom(), NS: 'ao3h', parsePreferredPovs });
    presentation.init();
    expect(document.getElementById('work_2').style.display).not.toBe('none');
  });

  it('masque automatiquement les œuvres hors des POV préférés', () => {
    presentation = new PovPresentation({
      cfg: cfgFrom({ autoApplyPreferredFilter: true, preferredPovs: 'first' }),
      NS: 'ao3h',
      parsePreferredPovs,
    });
    presentation.init();

    expect(document.getElementById('work_1').style.display).not.toBe('none');
    expect(document.getElementById('work_2').style.display).toBe('none');
  });

  it('affiche le bouton de filtre correspondant déjà actif', () => {
    presentation = new PovPresentation({
      cfg: cfgFrom({ autoApplyPreferredFilter: true, preferredPovs: 'first' }),
      NS: 'ao3h',
      parsePreferredPovs,
    });
    presentation.init();

    const thirdBtn = document.querySelector('#ao3h-pov-filter-bar button[data-pov="third"]');
    expect(thirdBtn.classList.contains('active')).toBe(true);
    const firstBtn = document.querySelector('#ao3h-pov-filter-bar button[data-pov="first"]');
    expect(firstBtn.classList.contains('active')).toBe(false);
  });
});
