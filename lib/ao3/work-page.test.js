import { describe, it, expect, afterEach } from 'vitest';
import {
  getWorkTitle, getWorkAuthor, getWorkFandoms, getWorkTags,
  getChapterProseNodes, getChapterProse,
} from './work-page.js';

afterEach(() => { document.body.innerHTML = ''; });

describe('getWorkTitle', () => {
  it('lit le titre depuis h2.title.heading', () => {
    document.body.innerHTML = `<h2 class="title heading">My Fic Title</h2>`;
    expect(getWorkTitle(document)).toBe('My Fic Title');
  });

  it('retourne null sans titre', () => {
    document.body.innerHTML = `<div></div>`;
    expect(getWorkTitle(document)).toBeNull();
  });
});

describe('getWorkAuthor', () => {
  it('lit le nom et le username depuis a[rel=author]', () => {
    document.body.innerHTML = `<h3 class="byline"><a rel="author" href="/users/alice/pseuds/alice">alice</a></h3>`;
    expect(getWorkAuthor(document)).toEqual({ name: 'alice', username: 'alice' });
  });

  it('retourne des null sans lien auteur', () => {
    document.body.innerHTML = `<div></div>`;
    expect(getWorkAuthor(document)).toEqual({ name: null, username: null });
  });
});

describe('getWorkFandoms / getWorkTags', () => {
  it('lit les fandoms et les tags', () => {
    document.body.innerHTML = `
      <dd class="fandom tags"><a class="tag">Harry Potter</a></dd>
      <dd class="freeform tags"><a class="tag">Fluff</a></dd>
      <dd class="relationship tags"><a class="tag">A/B</a></dd>
    `;
    expect(getWorkFandoms(document)).toEqual(['Harry Potter']);
    expect(getWorkTags(document)).toEqual(['Fluff', 'A/B']);
  });
});

describe('getChapterProseNodes — exclusion préfaces/notes (partagé chapterWordCount + readingTime)', () => {
  it('priorise .userstuff.module, en excluant préfaces/notes/endnotes', () => {
    document.body.innerHTML = `
      <div class="chapter" id="c1">
        <div class="preface"><div class="userstuff module">Summary text, should be excluded</div></div>
        <div class="userstuff module">Real chapter prose here.</div>
        <div class="notes"><div class="userstuff module">End notes, should be excluded</div></div>
      </div>
    `;
    const ch = document.getElementById('c1');
    const nodes = getChapterProseNodes(ch);
    expect(nodes.length).toBe(1);
    expect(nodes[0].textContent).toBe('Real chapter prose here.');
  });

  it('retombe sur .userstuff générique si aucun .userstuff.module n\'est trouvé', () => {
    document.body.innerHTML = `
      <div class="chapter" id="c1">
        <div class="userstuff">Plain userstuff prose.</div>
      </div>
    `;
    const ch = document.getElementById('c1');
    const nodes = getChapterProseNodes(ch);
    expect(nodes.length).toBe(1);
    expect(nodes[0].textContent).toBe('Plain userstuff prose.');
  });

  it('dernier recours : cherche entre ce chapitre et le suivant', () => {
    document.body.innerHTML = `
      <div class="chapter" id="c1"></div>
      <div class="userstuff">Sibling prose between chapters.</div>
      <div class="chapter" id="c2">Next chapter marker</div>
    `;
    const ch = document.getElementById('c1');
    const nodes = getChapterProseNodes(ch);
    expect(nodes.map(n => n.textContent)).toEqual(['Sibling prose between chapters.']);
  });

  it('ne dépasse pas le chapitre suivant lors du repli "entre chapitres"', () => {
    document.body.innerHTML = `
      <div class="chapter" id="c1"></div>
      <div class="userstuff">Should be found.</div>
      <div class="chapter" id="c2"><div class="userstuff">Should NOT be found.</div></div>
    `;
    const ch = document.getElementById('c1');
    const nodes = getChapterProseNodes(ch);
    expect(nodes.map(n => n.textContent)).toEqual(['Should be found.']);
  });
});

describe('getChapterProse', () => {
  it('joint le texte des nœuds de prose du chapitre', () => {
    document.body.innerHTML = `
      <div class="chapter" id="c1">
        <div class="userstuff module">First paragraph.</div>
        <div class="userstuff module">Second paragraph.</div>
      </div>
    `;
    const ch = document.getElementById('c1');
    expect(getChapterProse(ch)).toBe('First paragraph.\nSecond paragraph.');
  });

  it('sans argument, retombe sur tout #workskin', () => {
    document.body.innerHTML = `
      <div id="workskin">
        <div class="userstuff module">Whole work prose.</div>
      </div>
    `;
    expect(getChapterProse()).toBe('Whole work prose.');
  });

  it('retombe sur le workskin entier si le chapitre donné n\'a aucune prose', () => {
    document.body.innerHTML = `
      <div id="workskin">
        <div class="chapter" id="empty-chapter"></div>
        <div class="userstuff module">Fallback prose.</div>
      </div>
    `;
    const ch = document.getElementById('empty-chapter');
    // Le repli "entre chapitres" de getChapterProseNodes trouve déjà ce
    // .userstuff (pas de 2e .chapter après) — comportement voulu, testé ici
    // pour verrouiller le cas qui a un impact direct sur chapterWordCount et
    // readingTime (shared.md Z1/Z2).
    expect(getChapterProse(ch)).toBe('Fallback prose.');
  });
});
