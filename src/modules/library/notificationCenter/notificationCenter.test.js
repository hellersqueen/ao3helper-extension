import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('notificationCenter smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="main"></div><div id="greeting"><span class="user"></span></div>';
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })));
  });

  it('boots and tears down on the homepage without throwing', async () => {
    history.pushState(null, '', '/');
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./notificationCenter.js');
    await setEnabled('notificationCenter', true);
    expect(document.getElementById('ao3h-nc-badge')).not.toBeNull();
    await setEnabled('notificationCenter', false);
    expect(document.getElementById('ao3h-nc-badge')).toBeNull();
  });

  it('boots on a tracked work page and detects a chapter update without throwing', async () => {
    history.pushState(null, '', '/works/42');
    document.body.innerHTML = `
      <div id="greeting"><span class="user"></span></div>
      <h2 class="title heading">A Test Work</h2>
      <dd class="chapters">2/10</dd>
    `;
    localStorage.setItem('ao3h:notifCenter:knownChapters', JSON.stringify({
      42: { count: 1, total: 10, isComplete: false, title: 'A Test Work', href: '/works/42', ts: Date.now() },
    }));
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./notificationCenter.js');
    await setEnabled('notificationCenter', true);
    const feed = JSON.parse(localStorage.getItem('ao3h:notifCenter:feed') || '[]');
    expect(feed).toHaveLength(1);
    expect(feed[0].delta).toBe(1);
    await setEnabled('notificationCenter', false);
  });
});
