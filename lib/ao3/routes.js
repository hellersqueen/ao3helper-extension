/* ──────────────────────────────────────────────────────────────────────────
   ROUTES
   Why: nice helpers for "where am I?" decisions in modules.
─────────────────────────────────────────────────────────────────────────── */

export const Routes = {
  href: ()=> location.href,
  path: ()=> location.pathname,
  isWork: ()=> /^\/works\/\d+(?:\/chapters\/\d+)?$/.test(location.pathname),
  isWorkShow: ()=> /^\/works\/\d+$/.test(location.pathname),
  isChapter: ()=> /^\/works\/\d+\/chapters\/\d+$/.test(location.pathname),
  isTagWorks: ()=> /^\/tags\/[^/]+\/works/.test(location.pathname),
  isSearch: ()=> /^\/works$/.test(location.pathname) && (new URLSearchParams(location.search).has('work_search[query]') || location.search.includes('tag_id')),
  isBookmarks: ()=> /^\/users\/[^/]+\/bookmarks/.test(location.pathname),
  isListRoute: ()=> {
    // Any page with pagination/work lists
    return Routes.isSearch() ||
           Routes.isTagWorks() ||
           Routes.isBookmarks() ||
           /\/works$/.test(location.pathname) ||
           /\/pseuds\/[^/]+\/works$/.test(location.pathname);
  },
};