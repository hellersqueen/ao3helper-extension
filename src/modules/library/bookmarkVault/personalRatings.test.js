import { describe, it, expect, beforeEach } from 'vitest';
import { RATINGS_KEY, getRating, setRating, buildStarsEl } from './personalRatings.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

describe('getRating / setRating', () => {
  it('stocke et relit une note de 1 à 5', () => {
    setRating('42', 4);
    expect(getRating('42')).toBe(4);
    expect(JSON.parse(localStorage.getItem(RATINGS_KEY))['42']).toBe(4);
  });

  it('0 ou valeur invalide efface la note', () => {
    setRating('42', 4);
    setRating('42', 0);
    expect(getRating('42')).toBe(0);
    setRating('42', 9);
    expect(getRating('42')).toBe(0);
  });

  it('retourne 0 pour une fic jamais notée ou un stockage corrompu', () => {
    expect(getRating('zzz')).toBe(0);
    localStorage.setItem(RATINGS_KEY, '{oops');
    expect(getRating('42')).toBe(0);
  });
});

describe('buildStarsEl', () => {
  it('affiche 5 étoiles reflétant la note courante', () => {
    setRating('7', 3);
    const el = buildStarsEl('7');
    const stars = el.querySelectorAll('.ao3h-bv-star');
    expect(stars.length).toBe(5);
    expect([...stars].map(s => s.textContent)).toEqual(['★', '★', '★', '☆', '☆']);
  });

  it('cliquer une étoile fixe la note ; recliquer la même l\'efface', () => {
    const el = buildStarsEl('7');
    document.body.appendChild(el);
    const stars = el.querySelectorAll('.ao3h-bv-star');

    stars[3].click(); // 4 étoiles
    expect(getRating('7')).toBe(4);
    expect(stars[3].textContent).toBe('★');

    stars[3].click(); // même étoile → efface
    expect(getRating('7')).toBe(0);
    expect(stars[0].textContent).toBe('☆');
  });
});
