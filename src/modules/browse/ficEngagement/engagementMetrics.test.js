import { describe, it, expect, beforeEach } from 'vitest';
import { EngagementMetrics } from './engagementMetrics.js';

function buildBlurb ({ kudos, hits, bookmarks, comments, words }) {
  document.body.innerHTML = `
    <li class="work blurb group" id="work_1">
      <dl class="stats">
        <dd class="kudos">${kudos}</dd>
        <dd class="hits">${hits}</dd>
        <dd class="bookmarks">${bookmarks}</dd>
        <dd class="comments">${comments}</dd>
        <dd class="words">${words}</dd>
      </dl>
    </li>
  `;
  return document.querySelector('li.work.blurb');
}

describe('EngagementMetrics', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('affiche un badge de taux de commentaires quand assez de données existent', () => {
    const blurb = buildBlurb({ kudos: 100, hits: 1000, bookmarks: 20, comments: 15, words: 5000 });
    new EngagementMetrics({}).processBlurb(blurb);
    const badges = [...blurb.querySelectorAll('.ao3h-engagement-badge')].map(b => b.textContent);
    expect(badges.some(t => t.includes('💬'))).toBe(true);
  });

  it('ajoute un badge d’aide expliquant les seuils', () => {
    const blurb = buildBlurb({ kudos: 100, hits: 1000, bookmarks: 20, comments: 15, words: 5000 });
    new EngagementMetrics({}).processBlurb(blurb);
    const help = blurb.querySelector('.ao3h-engagement-help');
    expect(help).not.toBeNull();
    expect(help.title).toContain('Kudos ratio');
  });

  it('masque un blurb à faible engagement quand hideLowEngagement est activé', () => {
    const blurb = buildBlurb({ kudos: 5, hits: 1000, bookmarks: 0, comments: 0, words: 5000 }); // ratio 0.5% → low
    new EngagementMetrics({ hideLowEngagement: true }).processBlurb(blurb);
    expect(blurb.style.display).toBe('none');
    expect(blurb.querySelector('.ao3h-engagement-metrics')).toBeNull();
  });

  it('ne masque pas un blurb à fort engagement même avec hideLowEngagement activé', () => {
    const blurb = buildBlurb({ kudos: 300, hits: 1000, bookmarks: 20, comments: 15, words: 5000 }); // ratio 30% → high
    new EngagementMetrics({ hideLowEngagement: true }).processBlurb(blurb);
    expect(blurb.style.display).not.toBe('none');
  });

  it('cleanup restaure les blurbs masqués par le filtre', () => {
    const blurb = buildBlurb({ kudos: 5, hits: 1000, bookmarks: 0, comments: 0, words: 5000 });
    const metrics = new EngagementMetrics({ hideLowEngagement: true });
    metrics.processBlurb(blurb);
    expect(blurb.style.display).toBe('none');
    metrics.cleanup();
    expect(blurb.style.display).toBe('');
    expect(blurb.classList.contains('ao3h-low-engagement-hidden')).toBe(false);
  });
});
