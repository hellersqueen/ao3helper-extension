import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlurbDownloadButton } from './individualDownloads.js';

function setListingPage() {
  history.pushState(null, '', '/works');
}

beforeEach(() => {
  setListingPage();
  document.body.innerHTML = `
    <li class="blurb work" id="work_1"><h4 class="heading"><a href="/works/1">Title</a></h4></li>
  `;
});
afterEach(() => {
  document.body.innerHTML = '';
  history.pushState(null, '', '/');
});

describe('BlurbDownloadButton — réglage showQuickDownloadButtons (enabled)', () => {
  it('par défaut (enabled non fourni), injecte l\'icône de téléchargement sur les listings', () => {
    const inst = new BlurbDownloadButton({});
    inst.init();
    expect(document.querySelector('.ao3h-blurb-download-icon')).not.toBeNull();
    inst.cleanup();
  });

  it('enabled: false — n\'injecte aucune icône', () => {
    const inst = new BlurbDownloadButton({ enabled: false });
    inst.init();
    expect(document.querySelector('.ao3h-blurb-download-icon')).toBeNull();
    inst.cleanup();
  });

  it('enabled: false — cleanup() reste sans effet indésirable (pas d\'erreur)', () => {
    const inst = new BlurbDownloadButton({ enabled: false });
    inst.init();
    expect(() => inst.cleanup()).not.toThrow();
  });

  it('enabled: true — se comporte comme le comportement par défaut', () => {
    const inst = new BlurbDownloadButton({ enabled: true });
    inst.init();
    expect(document.querySelector('.ao3h-blurb-download-icon')).not.toBeNull();
    inst.cleanup();
  });

  it('cleanup() retire les icônes injectées', () => {
    const inst = new BlurbDownloadButton({ enabled: true });
    inst.init();
    expect(document.querySelector('.ao3h-blurb-download-icon')).not.toBeNull();
    inst.cleanup();
    expect(document.querySelector('.ao3h-blurb-download-icon')).toBeNull();
  });
});
