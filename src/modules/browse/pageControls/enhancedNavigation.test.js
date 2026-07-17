import { describe, it, expect } from 'vitest';
import { buildEnhancedRow } from './enhancedNavigation.js';

const labels = (row) => [...row.querySelectorAll('.ao3h-en-btn')].map(el => el.textContent);

describe('buildEnhancedRow', () => {
  it('construit la ligne historique First/−10/Prev/Next/+10/Last par défaut', () => {
    const row = buildEnhancedRow(20, 100);
    expect(labels(row)).toEqual(['« First', '−10', '‹ Prev', 'Next ›', '+10', 'Last »']);
    expect(row.querySelector('.ao3h-en-current').textContent).toBe('20 / 100');
  });

  it('respecte un pas personnalisé', () => {
    const row = buildEnhancedRow(20, 100, { step: 25 });
    expect(labels(row)).toContain('−25');
    expect(labels(row)).toContain('+25');
  });

  it('ajoute les boutons de grand saut quand demandé', () => {
    const row = buildEnhancedRow(60, 200, { showBigStep: true, bigStep: 50 });
    expect(labels(row)).toEqual(['« First', '−50', '−10', '‹ Prev', 'Next ›', '+10', '+50', 'Last »']);
  });

  it('désactive les sauts qui sortent de la plage', () => {
    const row = buildEnhancedRow(3, 100, { showBigStep: true, bigStep: 50 });
    const minus50 = [...row.querySelectorAll('.ao3h-en-btn')].find(el => el.textContent === '−50');
    expect(minus50.tagName).toBe('SPAN'); // page -47 → désactivé
    expect(minus50.classList.contains('disabled')).toBe(true);
    const plus50 = [...row.querySelectorAll('.ao3h-en-btn')].find(el => el.textContent === '+50');
    expect(plus50.tagName).toBe('A'); // page 53 → actif
  });

  it('affiche une barre de progression proportionnelle à la position', () => {
    const row = buildEnhancedRow(50, 200);
    const fill = row.querySelector('.ao3h-en-progress-fill');
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('25%');
    expect(row.querySelector('.ao3h-en-progress').title).toBe('Page 50 of 200');
  });

  it('peut désactiver la barre de progression et les petits sauts', () => {
    const row = buildEnhancedRow(5, 10, { progressBar: false, showStep: false });
    expect(row.querySelector('.ao3h-en-progress')).toBeNull();
    expect(labels(row)).toEqual(['« First', '‹ Prev', 'Next ›', 'Last »']);
  });
});
