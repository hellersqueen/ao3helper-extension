import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PovDetailPanel } from './povDetailPanel.js';
import { PovAnalysis } from './_povTracker.js';

const LONG_FIRST_PERSON = 'I walked to my car and thought about my day. '.repeat(20);

function setPath (path) {
  history.pushState(null, '', path);
}

function buildWorkPage ({ chapterOptionText = null } = {}) {
  document.body.innerHTML = `
    <div id="workskin">
      <div class="preface"><h2 class="title">A Test Work</h2></div>
      <div class="chapter"><div class="userstuff">${LONG_FIRST_PERSON}</div></div>
    </div>
  `;
  if (chapterOptionText) {
    const select = document.createElement('select');
    select.id = 'selected_id';
    const opt = document.createElement('option');
    opt.setAttribute('selected', 'selected');
    opt.textContent = chapterOptionText;
    select.appendChild(opt);
    document.getElementById('workskin').appendChild(select);
  }
}

function cfgFrom (overrides) {
  const values = { showDetailPanel: true, analyzeFullText: true, ...overrides };
  return (key) => values[key];
}

describe('PovDetailPanel', () => {
  let analysis;

  beforeEach(() => {
    localStorage.clear();
    analysis = new PovAnalysis();
    analysis.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ne fait rien hors d’une page de work', () => {
    setPath('/tags/some-tag/works');
    buildWorkPage();
    const panel = new PovDetailPanel({ cfg: cfgFrom(), analysis });
    panel.init();
    expect(document.getElementById('ao3h-pov-detail-panel')).toBeNull();
  });

  it('ne fait rien quand showDetailPanel ou analyzeFullText est désactivé', () => {
    setPath('/works/42');
    buildWorkPage();
    const panel = new PovDetailPanel({ cfg: cfgFrom({ analyzeFullText: false }), analysis });
    panel.init();
    expect(document.getElementById('ao3h-pov-detail-panel')).toBeNull();
  });

  it('analyse le chapitre affiché et affiche le verdict', () => {
    setPath('/works/42');
    buildWorkPage({ chapterOptionText: '1. First Chapter' });
    const panel = new PovDetailPanel({ cfg: cfgFrom(), analysis });
    panel.init();

    const summary = document.querySelector('#ao3h-pov-detail-panel .ao3h-pov-panel-summary');
    expect(summary?.textContent).toContain('first');
    expect(analysis.getChapterAnalyses('42')).toHaveLength(1);
    expect(analysis.getChapterAnalyses('42')[0].label).toBe('1. First Chapter');
  });

  it('affiche la liste par chapitre et un avertissement quand le POV change', () => {
    setPath('/works/42');
    analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', LONG_FIRST_PERSON);
    analysis.recordChapterAnalysis(
      '42', 'ch2', 'Chapter 2',
      'She walked to her car and thought about her day. '.repeat(20),
    );
    buildWorkPage({ chapterOptionText: '3. Third Chapter' });

    const panel = new PovDetailPanel({ cfg: cfgFrom(), analysis });
    panel.init();

    const consistency = document.querySelector('#ao3h-pov-detail-panel .ao3h-pov-panel-consistency');
    expect(consistency?.textContent).toContain('change detected');
    expect(document.querySelectorAll('#ao3h-pov-detail-panel .ao3h-pov-panel-chapters li')).toHaveLength(3);
  });

  it('destroy retire le panneau', () => {
    setPath('/works/42');
    buildWorkPage({ chapterOptionText: '1. First Chapter' });
    const panel = new PovDetailPanel({ cfg: cfgFrom(), analysis });
    panel.init();
    expect(document.getElementById('ao3h-pov-detail-panel')).not.toBeNull();
    panel.destroy();
    expect(document.getElementById('ao3h-pov-detail-panel')).toBeNull();
  });
});
