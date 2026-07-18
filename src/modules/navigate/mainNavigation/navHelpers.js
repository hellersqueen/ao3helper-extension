/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Main Navigation › Nav Helpers

Pure computations backing the back-to-search link and the breadcrumb bar:
which URLs count as a search origin worth returning to, and how an AO3
pathname decomposes into breadcrumb segments.

═══════════════════════════════════════════════════════════════════════════ */

import { isListingPage } from '../../../../lib/ao3/parsers.js';

/** True when `url` (path + query) is a listing/search page worth returning to. */
export function isSearchOrigin (url) {
  if (!url) return false;
  try {
    const parsed = new URL(url, 'https://archiveofourown.org');
    return isListingPage(parsed.pathname);
  } catch { return false; }
}

function decode (segment) {
  try {
    // AO3 tag URLs encode '/' as *s*, '&' as *a*, '.' as *d*
    return decodeURIComponent(segment)
      .replace(/\*s\*/g, '/').replace(/\*a\*/g, '&').replace(/\*d\*/g, '.');
  } catch { return segment; }
}

/**
 * Decompose an AO3 pathname into breadcrumb segments.
 * @returns {Array<{label: string, href: string|null}>} last item has href null
 */
export function buildBreadcrumbs (pathname) {
  if (!pathname || pathname === '/') return [];
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts.length < 2) return [];

  const crumbs = [];
  const push = (label, href) => crumbs.push({ label, href });

  switch (parts[0]) {
    case 'works':
      push('Works', '/works');
      if (/^\d+$/.test(parts[1])) {
        push(`Work ${parts[1]}`, `/works/${parts[1]}`);
        if (parts[2] === 'chapters' && /^\d+$/.test(parts[3] || '')) {
          push('Chapter', null);
        }
      } else if (parts[1] === 'search') {
        push('Search', null);
      }
      break;
    case 'tags':
      push('Tags', '/tags');
      push(decode(parts[1]), `/tags/${parts[1]}`);
      if (parts[2] === 'works') push('Works', null);
      break;
    case 'users':
      push('Users', null);
      push(decode(parts[1]), `/users/${parts[1]}`);
      if (parts[2]) push(parts[2][0].toUpperCase() + parts[2].slice(1), null);
      break;
    case 'series':
      push('Series', null);
      if (/^\d+$/.test(parts[1])) push(`Series ${parts[1]}`, null);
      break;
    case 'collections':
      push('Collections', '/collections');
      push(decode(parts[1]), `/collections/${parts[1]}`);
      if (parts[2] === 'works') push('Works', null);
      break;
    default:
      return [];
  }

  // The current location should not link to itself
  if (crumbs.length) crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], href: null };
  return crumbs;
}
