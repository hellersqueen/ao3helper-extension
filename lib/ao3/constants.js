/* ═══════════════════════════════════════════════════════════════════════════
   AO3 CONSTANTS - Données de référence du site AO3
   Why: les Archive Warnings existaient en 2 listes divergentes (filterWarnings
   vs archiveWarningsDisplay) — les DEUX formes sont légitimes mais servent des
   contextes différents ; les centraliser force à choisir la bonne.

   ⚠️ Avant de faire converger un module vers ces listes, vérifier sur AO3 la
   forme exacte attendue par son contexte (tag affiché vs valeur de formulaire)
   — voir la décision produit A11 du rapport shared.md.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Les 6 Archive Warnings — forme « tag canonique » telle qu'affichée sur les
 * works et blurbs (source : archiveWarningsDisplay).
 */
export const ARCHIVE_WARNINGS = [
  'Graphic Depictions Of Violence',
  'Major Character Death',
  'Rape/Non-Con',
  'Underage',
  'Creator Chose Not To Use Archive Warnings',
  'No Archive Warnings Apply',
];

/**
 * Les 6 Archive Warnings — forme « libellé de formulaire » utilisée dans les
 * filtres/formulaires de recherche (source : filterWarnings, qui compare aux
 * valeurs de work_search[excluded_tag_names]).
 */
export const ARCHIVE_WARNING_FORM_LABELS = [
  'Graphic Depictions of Violence',
  'Major Character Death',
  'Rape/Non-Con',
  'Underage',
  'Choose Not To Use Archive Warnings',
  'No Archive Warnings Apply',
];
