import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackToTop } from './backToTop.js';

beforeEach(() => {
  document.body.innerHTML = '';
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
});
afterEach(() => {
  document.body.innerHTML = '';
});

describe('BackToTop', () => {
  it('setup() injecte un bouton, caché tant que la page n\'est pas défilée', () => {
    const bt = new BackToTop();
    bt.setup();
    const btn = document.querySelector('.ao3h-pc-backtotop');
    expect(btn).not.toBeNull();
    expect(btn.classList.contains('ao3h-pc-backtotop--visible')).toBe(false);
    bt.teardown();
  });

  it('devient visible après avoir défilé au-delà du seuil', () => {
    const bt = new BackToTop();
    bt.setup();
    window.scrollY = 500;
    window.dispatchEvent(new Event('scroll'));
    expect(document.querySelector('.ao3h-pc-backtotop').classList.contains('ao3h-pc-backtotop--visible')).toBe(true);
    bt.teardown();
  });

  it('redevient caché en repassant sous le seuil', () => {
    const bt = new BackToTop();
    bt.setup();
    window.scrollY = 500;
    window.dispatchEvent(new Event('scroll'));
    window.scrollY = 0;
    window.dispatchEvent(new Event('scroll'));
    expect(document.querySelector('.ao3h-pc-backtotop').classList.contains('ao3h-pc-backtotop--visible')).toBe(false);
    bt.teardown();
  });

  it('le clic déclenche un scroll fluide vers le haut', () => {
    const bt = new BackToTop();
    bt.setup();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    document.querySelector('.ao3h-pc-backtotop').click();
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    bt.teardown();
  });

  it('teardown() retire le bouton et arrête d\'écouter le scroll', () => {
    const bt = new BackToTop();
    bt.setup();
    bt.teardown();
    expect(document.querySelector('.ao3h-pc-backtotop')).toBeNull();
    // Ne doit plus réagir au scroll après teardown (pas d'exception, pas de recréation)
    expect(() => {
      window.scrollY = 999;
      window.dispatchEvent(new Event('scroll'));
    }).not.toThrow();
    expect(document.querySelector('.ao3h-pc-backtotop')).toBeNull();
  });

  it('a un aria-label et un title pour l\'accessibilité', () => {
    const bt = new BackToTop();
    bt.setup();
    const btn = document.querySelector('.ao3h-pc-backtotop');
    expect(btn.getAttribute('aria-label')).toBe('Back to top');
    expect(btn.title).toBe('Back to top');
    bt.teardown();
  });
});
