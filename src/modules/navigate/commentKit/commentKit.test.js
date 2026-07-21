import { describe, it, expect, beforeEach } from 'vitest';

function buildWorkPage () {
  history.pushState(null, '', '/works/42');
  document.body.innerHTML = `
    <div id="header"><li class="user"><a href="/users/me/">me</a></li></div>
    <div id="main">
      <ul class="work navigation actions"></ul>
      <h3 class="byline heading"><a rel="author" href="/users/ficAuthor/pseuds/ficAuthor">ficAuthor</a></h3>
      <dl class="stats"><dd class="words">1,234</dd></dl>
      <form class="comment new" id="add_comment_1" action="/comments">
        <textarea name="comment[comment_content]" id="comment_content"></textarea>
      </form>
      <div id="comments">
        <ol class="thread">
          <li class="comment" id="comment_1">
            <div class="comment-reply">
              <h4 class="heading byline"><a href="/users/ficAuthor/pseuds/ficAuthor">ficAuthor</a> on <a href="/works/42">Work</a></h4>
              <blockquote class="userstuff">Great chapter, I loved the twist!</blockquote>
              <ul class="actions"><li><a class="reply">Reply</a></li></ul>
            </div>
            <ol class="thread">
              <li class="comment" id="comment_2">
                <div class="comment-reply">
                  <h4 class="heading byline"><a href="/users/me/pseuds/me">me</a> on <a href="/works/42">Work</a></h4>
                  <blockquote class="userstuff">Thanks so much!</blockquote>
                  <ul class="actions"><li><a class="reply">Reply</a></li></ul>
                </div>
                <ol class="thread">
                  <li class="comment" id="comment_3">
                    <div class="comment-reply">
                      <h4 class="heading byline"><a href="/users/ficAuthor/pseuds/ficAuthor">ficAuthor</a> on <a href="/works/42">Work</a></h4>
                      <blockquote class="userstuff">You're welcome!</blockquote>
                      <ul class="actions"></ul>
                    </div>
                  </li>
                </ol>
              </li>
            </ol>
          </li>
          <li class="comment" id="comment_4">
            <div class="comment-reply">
              <h4 class="heading byline"><a href="/users/randomReader/pseuds/randomReader">randomReader</a> on <a href="/works/42">Work</a></h4>
              <blockquote class="userstuff">This has a hidden spoiler word inside.</blockquote>
              <ul class="actions"><li><a class="reply">Reply</a></li></ul>
            </div>
          </li>
        </ol>
      </div>
    </div>
  `;
}

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:commentKit:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_commentKit.js');
  await setEnabled('commentKit', true);
  await setEnabled('commentComposing', true);
  await setEnabled('draftManagement', true);
  await setEnabled('commentNavigation', true);
  await setEnabled('commentHighlighting', true);
  await setEnabled('threadManagement', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  for (const mod of ['threadManagement', 'commentHighlighting', 'commentNavigation', 'draftManagement', 'commentComposing']) {
    await setEnabled(mod, false);
  }
  await setEnabled('commentKit', false);
}

describe('commentKit (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('insère un modèle avec les variables {title}/{author} remplies, et propose Souligné dans la barre d’outils', async () => {
    buildWorkPage();
    const { setEnabled } = await boot({ showQuickTemplates: true });
    try {
      const textarea = /** @type {HTMLTextAreaElement} */ (document.getElementById('comment_content'));
      const toolbarBtns = Array.from(document.querySelectorAll('.ao3h-format-btn')).map(b => b.textContent);
      expect(toolbarBtns).toContain('U');
      expect(toolbarBtns).toContain('S');

      const varTemplateBtn = Array.from(document.querySelectorAll('.ao3h-template-btn'))
        .find(b => b.title.includes('{title}'));
      expect(varTemplateBtn).toBeDefined();
      varTemplateBtn.click();
      expect(textarea.value).not.toContain('{title}');
      expect(textarea.value).not.toContain('{author}');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('sauvegarde des brouillons distincts pour le formulaire principal et un formulaire de réponse', async () => {
    buildWorkPage();
    const { setEnabled } = await boot();
    try {
      const mainTa = /** @type {HTMLTextAreaElement} */ (document.getElementById('comment_content'));
      mainTa.value = 'My top-level draft';
      mainTa.dispatchEvent(new Event('input', { bubbles: true }));

      // Simulate a reply form appearing nested inside comment_1 (as AO3 would inject it)
      const replyForm = document.createElement('form');
      replyForm.className = 'comment new';
      const replyTa = document.createElement('textarea');
      replyTa.name = 'comment[comment_content]';
      replyForm.appendChild(replyTa);
      document.getElementById('comment_1').appendChild(replyForm);
      // Let the module's MutationObserver (fires as a microtask) pick up the new form.
      await new Promise(r => setTimeout(r, 0));

      replyTa.value = 'My reply draft';
      replyTa.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise(r => setTimeout(r, 600)); // past the 500ms debounce

      expect(JSON.parse(localStorage.getItem('ao3h:draft:42')).content).toBe('My top-level draft');
      expect(JSON.parse(localStorage.getItem('ao3h:draft:42:comment_1')).content).toBe('My reply draft');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('recherche dans les commentaires et surligne les correspondances', async () => {
    buildWorkPage();
    const { setEnabled } = await boot({ commentSearchBox: true });
    try {
      const input = /** @type {HTMLInputElement} */ (document.querySelector('.ao3h-comment-search-input'));
      expect(input).not.toBeNull();
      input.value = 'spoiler';
      input.dispatchEvent(new Event('input'));
      expect(document.querySelectorAll('.ao3h-comment-match').length).toBe(1);
      expect(document.querySelector('.ao3h-comment-search-counter').textContent).toBe('1 / 1');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('filtre pour ne garder que les commentaires de l’auteur·ice', async () => {
    buildWorkPage();
    const { setEnabled } = await boot({ authorFilterMode: 'only' });
    try {
      expect(document.getElementById('comment_1').classList.contains('ao3h-filter-hidden')).toBe(false);
      expect(document.getElementById('comment_2').classList.contains('ao3h-filter-hidden')).toBe(true);
      expect(document.getElementById('comment_4').classList.contains('ao3h-filter-hidden')).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('surligne un commentaire correspondant à un mot-clé personnalisé', async () => {
    buildWorkPage();
    const { setEnabled } = await boot({ customHighlights: 'spoiler' });
    try {
      const comment4 = document.getElementById('comment_4');
      expect(comment4.classList.contains('ao3h-custom-highlight-comment')).toBe(true);
      expect(comment4.querySelector('.ao3h-custom-highlight-badge')).not.toBeNull();
    } finally {
      await teardown(setEnabled);
    }
  });

  it('replie automatiquement un fil au-dessus du seuil, sauf préférence manuelle mémorisée', async () => {
    buildWorkPage();
    localStorage.setItem('ao3h:threadCollapse:42', JSON.stringify({ ts: Date.now(), manual: { comment_1: false } }));
    const { setEnabled } = await boot({ autoCollapseThreshold: '2' });
    try {
      // comment_1 has 2 nested replies (comment_2, comment_3) → would auto-collapse,
      // but a manual "expanded" override is stored for it.
      expect(document.getElementById('comment_1').classList.contains('ao3h-thread-collapsed')).toBe(false);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('applique la densité d’affichage choisie à la racine du document', async () => {
    buildWorkPage();
    const { setEnabled } = await boot({ commentDensity: 'compact' });
    try {
      expect(document.documentElement.classList.contains('ao3h-comment-density-compact')).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
    expect(document.documentElement.classList.contains('ao3h-comment-density-compact')).toBe(false);
  });
});
