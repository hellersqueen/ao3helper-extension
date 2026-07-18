import { describe, it, expect, beforeEach } from 'vitest';

function buildWorkPage ({ current = 2 } = {}) {
  history.pushState(null, '', `/works/42/chapters/20${current}`);
  const options = [
    { id: '201', num: 1, title: 'First Steps' },
    { id: '202', num: 2, title: 'Second Verse' },
    { id: '203', num: 3, title: 'Grand Finale' },
  ];
  document.title = 'Test Fic Title - AO3';
  document.body.innerHTML = `
    <div class="work">
      <ul class="work navigation actions">
        <li class="chapter prev"><a href="/works/42/chapters/${options[current - 2]?.id}">← Previous</a></li>
        <li class="chapter next"><a href="/works/42/chapters/${options[current]?.id}">Next →</a></li>
        <li class="chapter">
          <ul id="chapter_index">
            <li>
              <select name="selected_id" id="selected_id">
                ${options.map(o => `<option value="${o.id}"${o.num === current ? ' selected' : ''}>${o.num}. ${o.title}</option>`).join('')}
              </select>
            </li>
          </ul>
        </li>
      </ul>
      <dl class="stats"><dt class="chapters">Chapters:</dt><dd class="chapters">${current}/3</dd></dl>
    </div>
    <div id="workskin">
      <div class="preface group"><h2 class="title heading">Test Fic Title</h2></div>
      <div id="chapters">
        <div class="chapter">
          <h3 class="title">Chapter ${current}: ${options[current - 1].title}</h3>
          <div class="userstuff module"><p>Some chapter prose.</p></div>
        </div>
      </div>
    </div>
  `;
}

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:chapterNavigation:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_chapterNavigation.js');
  await setEnabled('chapterNavigation', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('chapterNavigation', false);
}

describe('chapterNavigation › Chapters Panel (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('affiche le bouton flottant et la liste avec l’état lu/actuel/non lu', async () => {
    buildWorkPage({ current: 2 });
    localStorage.setItem('ao3h:rt:progress:42', JSON.stringify({ chapter: 1 }));
    const { setEnabled } = await boot();
    try {
      const fab = document.getElementById('ao3h-chapters-fab');
      expect(fab).not.toBeNull();

      fab.click();
      const rows = document.querySelectorAll('.ao3h-cp-row');
      expect(rows.length).toBe(3);
      expect(rows[0].className).toContain('read');
      expect(rows[1].className).toContain('current');
      expect(rows[2].className).toContain('unread');
      expect(rows[0].querySelector('.ao3h-cp-title').textContent).toContain('First Steps');
    } finally {
      await teardown(setEnabled);
    }
    expect(document.getElementById('ao3h-chapters-fab')).toBeNull();
    expect(document.getElementById('ao3h-chapters-panel')).toBeNull();
  });

  it('le champ de recherche filtre par titre ou numéro', async () => {
    buildWorkPage({ current: 1 });
    const { setEnabled } = await boot();
    try {
      document.getElementById('ao3h-chapters-fab').click();
      const search = document.querySelector('.ao3h-cp-search');
      search.value = 'finale';
      search.dispatchEvent(new Event('input'));
      const rows = document.querySelectorAll('.ao3h-cp-row');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Grand Finale');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('l’étoile favoris et la note personnelle persistent dans localStorage', async () => {
    buildWorkPage({ current: 1 });
    const { setEnabled } = await boot();
    try {
      document.getElementById('ao3h-chapters-fab').click();
      const firstRow = document.querySelector('.ao3h-cp-row');
      firstRow.querySelector('.ao3h-cp-star').click();
      expect(JSON.parse(localStorage.getItem('ao3h:cn:marks:42'))['201'].starred).toBe(true);

      // Re-open (star click re-renders) and add a note on the now-current row
      const row = document.querySelector('.ao3h-cp-row');
      row.querySelector('.ao3h-cp-note-btn').click();
      const editor = row.querySelector('.ao3h-cp-note-editor');
      editor.value = 'Reread this scene';
      editor.dispatchEvent(new Event('blur'));
      expect(JSON.parse(localStorage.getItem('ao3h:cn:marks:42'))['201'].note).toBe('Reread this scene');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche le fil d’Ariane et injecte un lien de préchargement pour le chapitre suivant', async () => {
    buildWorkPage({ current: 2 });
    const { setEnabled } = await boot();
    try {
      const breadcrumb = document.getElementById('ao3h-chapter-breadcrumb');
      expect(breadcrumb).not.toBeNull();
      expect(breadcrumb.textContent).toBe('Test Fic Title > Chapter 2 > Second Verse');

      const prefetch = document.querySelector('link.ao3h-chapter-prefetch');
      expect(prefetch).not.toBeNull();
      expect(prefetch.getAttribute('href')).toBe('/works/42/chapters/203');
    } finally {
      await teardown(setEnabled);
    }
    expect(document.getElementById('ao3h-chapter-breadcrumb')).toBeNull();
    expect(document.querySelector('link.ao3h-chapter-prefetch')).toBeNull();
  });

  it('remplace le titre de l’onglet uniquement quand le réglage est activé, et le restaure à la désactivation', async () => {
    buildWorkPage({ current: 2 });
    const { setEnabled } = await boot({ tabTitleChapter: true });
    try {
      expect(document.title).toBe('Ch. 2/3 · Test Fic Title - AO3');
    } finally {
      await teardown(setEnabled);
    }
    expect(document.title).toBe('Test Fic Title - AO3');
  });
});
