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

/**
 * Vocabulaire de tropes de référence (noms canoniques), source : tropeGames
 * (la plus large des 3 listes qui existaient dans le projet sans se
 * référencer entre elles — trope-games/TROPE_LIST, search-enhancer/CO_TAGS,
 * filterManager/BUILTIN_BUNDLES). Les trois vocabulaires ont des formes
 * différentes pour des usages différents (liste plate de jeu, table de
 * co-occurrence de suggestions, bundles de variantes orthographiques pour le
 * filtrage) — cette liste n'unifie pas leur format, elle sert de référence
 * commune pour garder les noms de tropes alignés entre eux.
 */
export const TROPE_NAMES = [
  'Slow Burn', 'Enemies to Lovers', 'Hurt/Comfort', 'Fake Dating',
  'Soulmates', 'Found Family', 'Angst with a Happy Ending', 'Coffee Shop AU',
  'Road Trip', 'Mutual Pining', 'Idiots in Love', 'Amnesia',
  'Time Travel', 'Bodyswap', 'Roommates', 'Second Chance Romance',
  'Forbidden Love', 'Secret Identity', 'Stranded Together', 'Undercover',
  'Hanahaki Disease', 'Reincarnation', 'Canon Divergence', 'Fix-It',
  'Chosen Family', 'First Meeting', 'Reunion', "Villain's POV",
  'Mentor/Protégé', 'Sacrifice', 'Whump', 'Comfort without Hurt',
  'Fake Marriage', 'Pining', 'Miscommunication', 'Jealousy',
  'Protective', 'Touch-Starved', 'Childhood Friends', 'Dreams',
  'Letters/Emails', 'Sickfic', 'Pre-Canon', 'Post-Canon', 'AU: Human',
  'AU: Fantasy', 'AU: Modern', 'Epistolary', 'Unrequited Love', 'Loyalty',
];
