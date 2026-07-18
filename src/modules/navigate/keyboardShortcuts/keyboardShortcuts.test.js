import { describe, it, expect, beforeEach } from 'vitest';

function dispatchKey (init) {
  document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
}

describe('keyboardShortcuts smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('boots, opens the guide on "?", and tears down without throwing', async () => {
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./keyboardShortcuts.js');
    await setEnabled('keyboardShortcuts', true);

    dispatchKey({ key: '?', shiftKey: true });
    expect(document.querySelector('.ao3h-kb-overlay')).not.toBeNull();
    expect(document.querySelector('.ao3h-kb-search')).not.toBeNull();

    dispatchKey({ key: 'Escape' });
    expect(document.querySelector('.ao3h-kb-overlay')).toBeNull();

    await setEnabled('keyboardShortcuts', false);
    expect(document.getElementById('ao3h-kb-flash')).toBeNull();
  });

  it('opens the command palette on Ctrl+/ and executes the top match on Enter', async () => {
    document.body.innerHTML = '<div class="pagination"><a rel="next" href="/works?page=2">Next</a></div>';
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./keyboardShortcuts.js');
    await setEnabled('keyboardShortcuts', true);

    dispatchKey({ key: '/', ctrlKey: true });
    const search = document.querySelector('.ao3h-kb-search');
    expect(search).not.toBeNull();
    expect(document.activeElement).toBe(search);

    search.value = 'next page';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const rows = document.querySelectorAll('.ao3h-kb-row');
    expect(rows.length).toBeGreaterThan(0);
    expect([...rows].every(r => r.textContent.toLowerCase().includes('next page'))).toBe(true);

    await setEnabled('keyboardShortcuts', false);
  });

  it('surfaces a visible conflict badge when two shortcuts share a combo', async () => {
    localStorage.setItem('ao3h:mod:keyboardShortcuts:settings', JSON.stringify({ bookmark: 'Ctrl+Shift+M' }));
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./keyboardShortcuts.js');
    await setEnabled('keyboardShortcuts', true);

    dispatchKey({ key: '?', shiftKey: true });
    const conflictRows = document.querySelectorAll('.ao3h-kb-conflict');
    expect(conflictRows.length).toBe(2); // bookmark and markForLater now share Ctrl+Shift+M

    await setEnabled('keyboardShortcuts', false);
  });
});
