import { describe, it, expect, beforeEach } from 'vitest';

function buildWorkPage () {
  document.body.innerHTML = `
    <div id="workskin">
      <div id="chapters">
        <div class="userstuff">
          <p>Some text with a reference<sup><a href="#note1">[1]</a></sup>.</p>
        </div>
      </div>
      <div id="notes" class="end notes module">
        <h3 class="heading">Notes</h3>
        <p id="note1">This is the footnote content.</p>
      </div>
    </div>
  `;
}

describe('instantFootnotes smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('ao3h-if-theme-light', 'ao3h-if-theme-dark');
    history.pushState(null, '', '/works/42');
    buildWorkPage();
  });

  it('boots and tears down without throwing, applying no forced theme by default', async () => {
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./instantFootnotes.js');
    await setEnabled('instantFootnotes', true);

    expect(document.documentElement.classList.contains('ao3h-if-theme-light')).toBe(false);
    expect(document.documentElement.classList.contains('ao3h-if-theme-dark')).toBe(false);

    await setEnabled('instantFootnotes', false);
    expect(document.documentElement.style.getPropertyValue('--ao3h-if-max-width')).toBe('');
  });

  it('applique le thème forcé choisi et le retire au nettoyage', async () => {
    localStorage.setItem('ao3h:mod:instantFootnotes:settings', JSON.stringify({ bubbleTheme: 'dark' }));
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./instantFootnotes.js');
    await setEnabled('instantFootnotes', true);

    expect(document.documentElement.classList.contains('ao3h-if-theme-dark')).toBe(true);
    expect(document.documentElement.classList.contains('ao3h-if-theme-light')).toBe(false);

    await setEnabled('instantFootnotes', false);
    expect(document.documentElement.classList.contains('ao3h-if-theme-dark')).toBe(false);
  });

  it('ouvre une bulle au clic sur un lien de note quand trigger=click', async () => {
    localStorage.setItem('ao3h:mod:instantFootnotes:settings', JSON.stringify({ trigger: 'click' }));
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./instantFootnotes.js');
    await setEnabled('instantFootnotes', true);

    const link = document.querySelector('a[href="#note1"]');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const pop = document.querySelector('.ao3h-gloss-pop');
    expect(pop).not.toBeNull();
    expect(pop.textContent).toContain('This is the footnote content.');

    await setEnabled('instantFootnotes', false);
    expect(document.querySelector('.ao3h-gloss-pop')).toBeNull();
  });
});
