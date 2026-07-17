import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { showToast, clearAllToasts } from './toast.js';

beforeEach(() => {
  document.body.innerHTML = '';
});
afterEach(() => {
  clearAllToasts();
  vi.useRealTimers();
});

describe('showToast', () => {
  it('injecte un toast avec le bon message et la bonne classe de type', () => {
    showToast('Backup créé avec succès', { type: 'success' });
    const el = document.querySelector('.ao3h-toast');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('Backup créé avec succès');
    expect(el.classList.contains('ao3h-toast--success')).toBe(true);
  });

  it('utilise "info" par défaut', () => {
    showToast('Message');
    expect(document.querySelector('.ao3h-toast--info')).not.toBeNull();
  });

  it('dismiss() retire le toast immédiatement', () => {
    const { dismiss } = showToast('X');
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(1);
    dismiss();
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(0);
  });

  it('se retire tout seul après la durée par défaut', () => {
    vi.useFakeTimers();
    showToast('X');
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(1);
    vi.advanceTimersByTime(3000);   // durée par défaut
    vi.advanceTimersByTime(400);    // délai du fade-out
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(0);
  });

  it('respecte une durée personnalisée', () => {
    vi.useFakeTimers();
    showToast('X', { duration: 1000 });
    vi.advanceTimersByTime(999);
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(1);
    vi.advanceTimersByTime(1 + 400);
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(0);
  });

  it('empile plusieurs toasts simultanés', () => {
    showToast('A');
    showToast('B');
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(2);
  });
});

describe('clearAllToasts', () => {
  it('retire tous les toasts actifs et annule leurs timers', () => {
    vi.useFakeTimers();
    showToast('A');
    showToast('B');
    clearAllToasts();
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(0);
    // avancer le temps ne doit rien faire réapparaître / lever d'erreur
    vi.advanceTimersByTime(5000);
    expect(document.querySelectorAll('.ao3h-toast').length).toBe(0);
  });
});
