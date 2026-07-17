/* Pure, module-specific helpers shared by skipWorks' hide and display flows. */

export const DISPLAY_STYLES = {
  block : { content: 'hidden',  bar: 'block',  showButton: true  },
  banner: { content: 'hidden',  bar: 'banner', showButton: true  },
  dim   : { content: 'dimmed',  bar: 'banner', showButton: true  },
  note  : { content: 'visible', bar: 'banner', showButton: false },
};

export function extractWorkMeta (blurbEl) {
  if (!blurbEl || typeof blurbEl.querySelector !== 'function') return { title: '', author: '' };

  const titleLink = blurbEl.querySelector('.header .heading a[href*="/works/"]')
    || blurbEl.querySelector('a[href*="/works/"]');
  const authorLink = blurbEl.querySelector('a[rel="author"]');

  return {
    title: titleLink ? titleLink.textContent.trim() : '',
    author: authorLink ? authorLink.textContent.trim() : '',
  };
}

export function isHideBarRevealTarget (target, namespace) {
  if (!target || typeof target.closest !== 'function') return false;
  if (!target.closest(`.${namespace}-m5-hidebar`)) return false;
  return !target.closest('button');
}

export function resolveDisplayStyle (mode) {
  return DISPLAY_STYLES[mode] || DISPLAY_STYLES.block;
}

export function findHideButtonAnchor (blurbEl, position) {
  if (!blurbEl || typeof blurbEl.querySelector !== 'function') return null;

  const scope = blurbEl.querySelector(':scope > .ao3h-cut') || blurbEl;
  if (position === 'bottom') {
    const stats = scope.querySelector('dl.stats');
    if (stats) return { el: stats, mode: 'after' };
  }

  const header = scope.querySelector('.header');
  return header ? { el: header, mode: 'append' } : null;
}

export function hasStandaloneNote (record) {
  return !!(
    record &&
    record.isHidden === false &&
    record.isStandaloneNote === true &&
    typeof record.reason === 'string' &&
    record.reason.trim()
  );
}
