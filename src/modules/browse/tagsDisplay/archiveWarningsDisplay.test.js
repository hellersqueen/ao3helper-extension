// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { blurbHasSensitiveWarning, SENSITIVE_WARNINGS } from './archiveWarningsDisplay.js';

function makeBlurb(warningHtml) {
  const li = document.createElement('li');
  li.innerHTML = `<ul class="tags commas"><li class="warnings">${warningHtml}</li></ul>`;
  return li;
}

describe('blurbHasSensitiveWarning', () => {
  it('détecte "Major Character Death"', () => {
    const blurb = makeBlurb('<a class="tag">Major Character Death</a>');
    expect(blurbHasSensitiveWarning(blurb)).toBe('Major Character Death');
  });

  it('détecte "Rape/Non-Con"', () => {
    const blurb = makeBlurb('<a class="tag">Rape/Non-Con</a>');
    expect(blurbHasSensitiveWarning(blurb)).toBe('Rape/Non-Con');
  });

  it('ignore "No Archive Warnings Apply"', () => {
    const blurb = makeBlurb('<a class="tag">No Archive Warnings Apply</a>');
    expect(blurbHasSensitiveWarning(blurb)).toBeNull();
  });

  it('ignore "Creator Chose Not To Use Archive Warnings"', () => {
    const blurb = makeBlurb('<a class="tag">Creator Chose Not To Use Archive Warnings</a>');
    expect(blurbHasSensitiveWarning(blurb)).toBeNull();
  });

  it('lit le texte original depuis data-ao3h-original-text si le tag a déjà été converti en icône', () => {
    const blurb = makeBlurb('<a class="tag" data-ao3h-original-text="Underage">⚠️</a>');
    expect(blurbHasSensitiveWarning(blurb)).toBe('Underage');
  });

  it('retourne null si aucun avertissement présent', () => {
    const blurb = document.createElement('li');
    expect(blurbHasSensitiveWarning(blurb)).toBeNull();
  });

  it('retourne null pour un blurb null/undefined', () => {
    expect(blurbHasSensitiveWarning(null)).toBeNull();
    expect(blurbHasSensitiveWarning(undefined)).toBeNull();
  });

  it('accepte une liste personnalisée de mentions sensibles', () => {
    const blurb = makeBlurb('<a class="tag">Underage</a>');
    expect(blurbHasSensitiveWarning(blurb, ['Underage'])).toBe('Underage');
    expect(blurbHasSensitiveWarning(blurb, ['Rape/Non-Con'])).toBeNull();
  });

  it('SENSITIVE_WARNINGS ne contient jamais les mentions neutres', () => {
    expect(SENSITIVE_WARNINGS).not.toContain('No Archive Warnings Apply');
    expect(SENSITIVE_WARNINGS).not.toContain('Creator Chose Not To Use Archive Warnings');
  });
});
