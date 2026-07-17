/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Blurb Section Order

Purpose
    Reorders the header, tags, summary, and stats sections of a work listing
    blurb (visually, via flexbox order) according to a user-chosen sequence.

Notes
    Each section's landmark heading (h6.landmark) travels together with its
    content so screen-reader landmark order stays coherent with what's shown.
    AO3's native order is header → tags → summary → stats.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { observe } from '../../../../lib/utils/index.js';

export const DEFAULT_ORDER = ['header', 'tags', 'summary', 'stats'];

/** Which section a direct blurb child belongs to, or null (headings resolved via next sibling). */
export function identifySection (el) {
  if (!el || el.nodeType !== 1) return null;
  if (el.matches('.header.module')) return 'header';
  if (el.matches('ul.tags')) return 'tags';
  if (el.matches('blockquote.summary, blockquote.userstuff.summary')) return 'summary';
  if (el.matches('dl.stats')) return 'stats';
  return null;
}

/**
 * Computes a Map of direct-child element → order index for one blurb,
 * given the desired section sequence. A section's landmark heading
 * (h6.landmark immediately before its content) gets the same index as the
 * content that follows it, keeping the pair adjacent after reordering.
 */
export function computeChildOrder (children, order = DEFAULT_ORDER) {
  const indexOf = (section) => {
    const i = order.indexOf(section);
    return i === -1 ? order.length : i;
  };

  const result = new Map();
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const section = identifySection(el);
    if (section) {
      result.set(el, indexOf(section));
      continue;
    }
    if (el.nodeType === 1 && el.matches('h6.landmark')) {
      const next = children[i + 1];
      const nextSection = next ? identifySection(next) : null;
      result.set(el, nextSection ? indexOf(nextSection) : order.length);
      continue;
    }
    result.set(el, order.length); // unrecognized children stay last, in place
  }
  return result;
}

export class BlurbSectionOrder {
  constructor () {
    this._observer = null;
    this._touched  = new Set();
  }

  _applyToBlurb (blurb, order) {
    const children = Array.from(blurb.children);
    const orderMap = computeChildOrder(children, order);
    children.forEach(el => {
      const idx = orderMap.get(el);
      if (idx !== undefined) el.style.order = String(idx);
    });
    blurb.classList.add('ao3h-blurb-reordered');
    this._touched.add(blurb);
  }

  apply (order) {
    this.reset();
    if (!Array.isArray(order) || order.join(',') === DEFAULT_ORDER.join(',')) return;

    const process = () => document.querySelectorAll('li.blurb.work, li.blurb.bookmark')
      .forEach(b => this._applyToBlurb(b, order));
    process();

    const main = document.getElementById('main');
    if (main) {
      this._observer = observe(main, { childList: true, subtree: true }, process);
    }
  }

  reset () {
    this._touched.forEach(blurb => {
      Array.from(blurb.children).forEach(el => { el.style.order = ''; });
      blurb.classList.remove('ao3h-blurb-reordered');
    });
    this._touched.clear();
    if (this._observer) { this._observer.disconnect(); this._observer = null; }
  }
}
