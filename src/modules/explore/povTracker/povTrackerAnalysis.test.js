import { describe, it, expect, beforeEach } from 'vitest';
import { PovAnalysis } from './_povTracker.js';

const LONG_FIRST_PERSON = 'I walked to my car and thought about my day. '.repeat(20);
const LONG_THIRD_PERSON = 'She walked to her car and thought about her day. '.repeat(20);
const TOO_SHORT = 'I said hi.';

describe('PovAnalysis — full-text chapter tracking', () => {
  let analysis;

  beforeEach(() => {
    localStorage.clear();
    analysis = new PovAnalysis();
    analysis.init();
  });

  it('recordChapterAnalysis retourne null pour un texte trop court', () => {
    expect(analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', TOO_SHORT)).toBeNull();
    expect(analysis.getChapterAnalyses('42')).toEqual([]);
  });

  it('enregistre une analyse de chapitre et la retrouve via getChapterAnalyses', () => {
    const record = analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', LONG_FIRST_PERSON);
    expect(record.pov).toBe('first');
    expect(analysis.getChapterAnalyses('42')).toHaveLength(1);
    expect(analysis.getChapterAnalyses('42')[0].label).toBe('Chapter 1');
  });

  it('remplace l’entrée existante plutôt que de la dupliquer quand un chapitre est revisité', () => {
    analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', LONG_FIRST_PERSON);
    analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', LONG_THIRD_PERSON);
    const chapters = analysis.getChapterAnalyses('42');
    expect(chapters).toHaveLength(1);
    expect(chapters[0].pov).toBe('third');
  });

  it('getCombinedResult retourne null quand rien n’est connu pour ce work', () => {
    expect(analysis.getCombinedResult('999')).toBeNull();
  });

  it('getCombinedResult retourne le POV du chapitre unique analysé', () => {
    analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', LONG_FIRST_PERSON);
    expect(analysis.getCombinedResult('42')).toEqual({
      pov: 'first', confidence: 'high', chapters: analysis.getChapterAnalyses('42'),
    });
  });

  it('getCombinedResult détecte "multi" quand les chapitres analysés divergent', () => {
    analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', LONG_FIRST_PERSON);
    analysis.recordChapterAnalysis('42', 'ch2', 'Chapter 2', LONG_THIRD_PERSON);
    const combined = analysis.getCombinedResult('42');
    expect(combined.pov).toBe('multi');
    expect(combined.confidence).toBe('high');
    expect(combined.chapters).toHaveLength(2);
  });

  it('getCombinedResult reste cohérent quand tous les chapitres analysés concordent', () => {
    analysis.recordChapterAnalysis('42', 'ch1', 'Chapter 1', LONG_FIRST_PERSON);
    analysis.recordChapterAnalysis('42', 'ch2', 'Chapter 2', LONG_FIRST_PERSON);
    const combined = analysis.getCombinedResult('42');
    expect(combined.pov).toBe('first');
    expect(combined.chapters).toHaveLength(2);
  });

  it('retombe sur le résultat tag/résumé quand aucun chapitre n’a été analysé en texte intégral', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = '<div class="tags"><li class="tag">Third Person POV</li></div>';
    analysis.getOrDetect('7', blurb);
    expect(analysis.getCombinedResult('7')).toEqual({ pov: 'third', confidence: 'high', chapters: [] });
  });
});
