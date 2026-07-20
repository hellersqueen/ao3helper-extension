import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StatsDisplayFormat } from './statsDisplayFormat.js';
import { dateAgeBucket } from './_visualPreferences.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="main">
      <dl class="stats">
        <dd class="published">2020-01-01</dd>
      </dl>
    </div>`;
});
afterEach(() => { document.body.innerHTML = ''; document.documentElement.className = ''; });

describe('StatsDisplayFormat — dateAgeColoring', () => {
  it('applique une classe d\'ancienneté sur les dates de statistiques', () => {
    const sdf = new StatsDisplayFormat({ dateAgeBucket });
    sdf.apply({ dateAgeColoring: true });
    const dd = document.querySelector('dd.published');
    expect(dd.classList.contains('ao3h-date-age-older')).toBe(true);
  });

  it('fonctionne conjointement avec relativeDates (lit la date originale, pas le texte relatif)', () => {
    const sdf = new StatsDisplayFormat({ dateAgeBucket });
    sdf.apply({ relativeDates: true, dateAgeColoring: true });
    const dd = document.querySelector('dd.published');
    expect(dd.textContent).not.toBe('2020-01-01'); // reformaté en relatif
    expect(dd.classList.contains('ao3h-date-age-older')).toBe(true); // mais toujours classé correctement
  });

  it('reset retire les classes d\'ancienneté', () => {
    const sdf = new StatsDisplayFormat({ dateAgeBucket });
    sdf.apply({ dateAgeColoring: true });
    sdf.reset();
    expect(document.querySelector('dd.published').className).toBe('published');
  });

  it('rien sans le réglage activé', () => {
    const sdf = new StatsDisplayFormat({ dateAgeBucket });
    sdf.apply({});
    expect(document.querySelector('dd.published').classList.length).toBe(1); // juste "published"
  });
});
