/* ═══════════════════════════════════════════════════════════════════════════
   AO3 SELECTORS - Carnet d'adresses des sélecteurs CSS d'AO3
   Why: certaines listes de sélecteurs étaient recopiées à plusieurs endroits
   de parsers.js (liste des blurbs, lien pagination "next") — centralisées ici
   pour n'avoir qu'une seule version à corriger si AO3 change son markup.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Sélecteurs identifiant un blurb de work dans une page de listing.
 * Union de tous les markups AO3 rencontrés (recherche, tags, bookmarks...).
 * Utilisé par isListRoute() et findAllBlurbs() dans parsers.js.
 */
export const BLURB_SELECTORS = [
  'li[role="article"]',
  '.work.blurb.group',
  '.blurb.work',
  'li.blurb.group',
];

/**
 * Lien "page suivante" dans une pagination AO3.
 * Utilisé par parseReadingsPageHTML() et parseBookmarksPageHTML() dans parsers.js.
 */
export const PAGINATION_NEXT = 'li.next a, .pagination li.next a';

/**
 * Sélecteurs de statistiques (dl.stats) sur un blurb de listing — avec repli
 * sur dd.<nom> seul si dl.stats est absent. Utilisé par getBlurbStats()
 * dans work-stats.js.
 */
export const BLURB_STATS_SELECTORS = {
  kudos:     'dl.stats dd.kudos, dd.kudos',
  hits:      'dl.stats dd.hits, dd.hits',
  bookmarks: 'dl.stats dd.bookmarks, dd.bookmarks',
  comments:  'dl.stats dd.comments, dd.comments',
  words:     'dl.stats dd.words, dd.words',
};

/**
 * Sélecteurs de statistiques sur la page d'un work individuel (dl.stats
 * toujours présent, pas de repli nécessaire). Utilisé par getWorkPageStats()
 * dans work-stats.js.
 */
export const WORK_PAGE_STATS_SELECTORS = {
  kudos:     'dl.stats dd.kudos',
  hits:      'dl.stats dd.hits',
  bookmarks: 'dl.stats dd.bookmarks',
  comments:  'dl.stats dd.comments',
  words:     'dl.stats dd.words',
};
