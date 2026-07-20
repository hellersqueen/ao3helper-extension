import { describe, it, expect } from 'vitest';
import {
  isLongParagraph,
  splitWallText,
  cleanPasteArtifacts,
  isEmptyParagraphText,
  findDialogueSpans,
  LONG_PARAGRAPH_CHARS,
} from './_readingFormatter.js';

describe('isLongParagraph', () => {
  it('détecte les paragraphes au-delà du seuil', () => {
    expect(isLongParagraph('x'.repeat(LONG_PARAGRAPH_CHARS))).toBe(true);
    expect(isLongParagraph('court')).toBe(false);
  });
  it('accepte un seuil personnalisé', () => {
    expect(isLongParagraph('x'.repeat(50), 50)).toBe(true);
  });
});

describe('splitWallText', () => {
  it('découpe un mur de texte aux frontières de phrases', () => {
    const sentence = 'This is one full sentence of the wall. ';
    const wall = sentence.repeat(50); // ~1950 chars
    const chunks = splitWallText(wall);
    expect(chunks.length).toBeGreaterThan(1);
    // Chaque morceau se termine à une frontière de phrase
    chunks.forEach(chunk => expect(chunk.endsWith('.')).toBe(true));
    // Aucun texte perdu
    expect(chunks.join(' ').replace(/\s+/g, ' ').trim())
      .toBe(wall.replace(/\s+/g, ' ').trim());
  });
  it('laisse intact un texte sous le seuil', () => {
    expect(splitWallText('Short text.')).toEqual(['Short text.']);
  });
  it('laisse intact un mur sans ponctuation exploitable', () => {
    const noPunct = 'word '.repeat(400);
    expect(splitWallText(noPunct)).toEqual([noPunct]);
  });
});

describe('cleanPasteArtifacts', () => {
  it('remplace les espaces insécables par des espaces normales', () => {
    expect(cleanPasteArtifacts('a b')).toBe('a b');
    expect(cleanPasteArtifacts('a  b')).toBe('a b');
  });
  it('laisse le texte normal inchangé', () => {
    expect(cleanPasteArtifacts('plain text')).toBe('plain text');
  });
});

describe('isEmptyParagraphText', () => {
  it('reconnaît les paragraphes remplis de vide', () => {
    expect(isEmptyParagraphText('')).toBe(true);
    expect(isEmptyParagraphText('     ')).toBe(true);
  });
  it('refuse un paragraphe avec du contenu', () => {
    expect(isEmptyParagraphText('a')).toBe(false);
  });
});

describe('findDialogueSpans', () => {
  it('trouve les répliques entre guillemets typographiques', () => {
    const text = 'He said, “Hello there.” She nodded.';
    expect(findDialogueSpans(text)).toEqual([{ start: 9, end: 23 }]);
  });
  it('trouve les répliques entre guillemets droits appariés', () => {
    const text = '"Wait," she said.';
    const spans = findDialogueSpans(text);
    expect(spans).toHaveLength(1);
    expect(text.slice(spans[0].start, spans[0].end)).toBe('"Wait,"');
  });
  it('retourne une liste vide sans dialogue', () => {
    expect(findDialogueSpans('No dialogue here.')).toEqual([]);
    expect(findDialogueSpans('')).toEqual([]);
  });
});
