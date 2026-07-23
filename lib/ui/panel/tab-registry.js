import { getLogger } from '../../utils/logger.js';
const log = getLogger('tab-registry');
/* ════════════════════════════════════════════════════════════════════════════
   TAB REGISTRY — Source de vérité unique pour tabs et modules
   ════════════════════════════════════════════════════════════════════════════

   ┌─────────────────────────────────────────────────────────────────────────┐
   │  C'est LE seul fichier à modifier pour changer l'organisation.          │
   │  Tout le reste se met à jour automatiquement depuis ce fichier.         │
   └─────────────────────────────────────────────────────────────────────────┘

   ── CE QUI SE MET À JOUR AUTOMATIQUEMENT (relance `npm run build`) ─────────

     • menu-grouper.js       → submenus du menu AO3H (noms des tabs, ordre)
     • module-registry.js    → liste des modules enregistrés dans l'app
     • panel-ui.js           → boutons des tabs dans le Manager Panel
     • panel-tab-content.js  → contenu des tabs dans le Manager Panel (modules, HTML)
                                généré depuis TABS/ALL_MODULES au chargement du module
                                (étape 393, Phase 30) — plus de script de génération séparé.

   ════════════════════════════════════════════════════════════════════════════
   GUIDE DE MODIFICATION
   ════════════════════════════════════════════════════════════════════════════

   ── STRUCTURE D'UN TAB ────────────────────────────────────────────────────

     {
       id: 'reading',              // identifiant interne — utilisé comme clé partout
                                   // ⚠️  si tu changes l'id, relance le build
       label: '📖 Reading',       // nom affiché dans le menu et le panel
                                   // ✅  tu peux changer l'emoji ou le texte librement
       match: /(mots|clés)/i,     // regex de fallback si tab-registry charge après menu-grouper
                                   // ajoute les mots importants des noms de modules de ce tab
       modules: [ ... ],           // liste des modules (voir structure ci-dessous)
     }

   ── STRUCTURE D'UN MODULE ─────────────────────────────────────────────────

     { id: 'hideByTags', title: 'Hide By Tags', desc: 'Courte description' }

     • id    → identifiant interne, doit correspondre au nom de fichier du module
               ⚠️  si tu changes l'id, relance le build
     • title → nom affiché dans le panel et le menu
               ✅  tu peux changer librement
     • desc  → sous-titre affiché sous le nom dans le panel
               ✅  tu peux changer librement

   ════════════════════════════════════════════════════════════════════════════
   CAS D'USAGE
   ════════════════════════════════════════════════════════════════════════════

   ── 1. RENOMMER UN TAB ────────────────────────────────────────────────────
      Change uniquement `label`. Recharge la page. Pas de build nécessaire.

        label: '📖 Lecture',   // ← nouveau nom

   ── 2. RENOMMER UN MODULE ─────────────────────────────────────────────────
      Change `title` et/ou `desc`. Recharge la page. Pas de build nécessaire.

        { id: 'hideByTags', title: 'Filtre par Tags', desc: 'Nouveau texte' }

   ── 3. DÉPLACER UN MODULE vers un autre tab ───────────────────────────────
      Coupe l'objet { id, title, desc } d'un array `modules` et colle-le
      dans un autre. Puis lance le build.

   ── 4. CHANGER L'ORDRE des modules dans un tab ───────────────────────────
      Réordonne les lignes dans l'array `modules`. Puis lance le build.

   ── 5. AJOUTER UN NOUVEAU MODULE ─────────────────────────────────────────
      Ajoute une ligne dans le bon tab :

        { id: 'monModule', title: 'Mon Module', desc: 'Description' },

      Puis lance le build. Pense aussi à créer le fichier de config :
        lib/ui/panel/configs/<Catégorie>-configs/monModule-config.js
      et à l'importer dans lib/ui/panel/configs/index.js.

   ── 6. SUPPRIMER UN MODULE ────────────────────────────────────────────────
      Supprime la ligne dans `modules`. Puis lance le build.

   ── 7. AJOUTER UN NOUVEAU TAB ─────────────────────────────────────────────
      Ajoute un bloc complet { id, label, match, modules: [...] } dans TABS.
      Le bouton du tab se génère automatiquement dans le panel.
      Puis lance le build.

   ── 8. FUSIONNER / SUPPRIMER UN TAB ──────────────────────────────────────
      Copie les modules d'un tab dans l'autre, supprime le tab vide.
      Le bouton disparaît automatiquement dans le panel.
      Puis lance le build.

   ════════════════════════════════════════════════════════════════════════════
  Structure actuelle : 6 tabs · 38 modules
   ════════════════════════════════════════════════════════════════════════════ */

export const TABS = [
  // ───────────────────────────────────────────────────────────────────────
  // Filter & Display (7 modules)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'browse',
    label: 'Filter & Display',
    match: /(hide|tags|filter|manager|skip|works|fic|engagement|work|length|display)/i,
    modules: [
      { id: 'hideByTags',       title: 'Hide By Tags',       desc: 'Tag-based work filtering with groups, whitelist & keyword filter' },
      { id: 'filterManager',    title: 'Filter Manager',     desc: 'Manage filter presets and work filters' },
      { id: 'skipWorks',        title: 'Skip Works',         desc: 'Hide works with personal notes' },
      { id: 'pageControls',     title: 'Page Controls',      desc: 'Works per page, jump to page, infinite scroll' },
      { id: 'ficEngagement',    title: 'Fic Engagement',     desc: 'Engagement metrics and hidden gems' },
      { id: 'workLength',       title: 'Work Length',        desc: 'Length badges and reading time estimate' },
      { id: 'tagsDisplay',      title: 'Tags Display',       desc: 'Tag display, highlights, and warnings' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 🔎 Explore (6 modules)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'explore',
    label: 'Explore',
    match: /(fic|peek|similar|surprise|trope|games|search|enhancer|pov|tracker)/i,
    modules: [
      { id: 'ficPeek',          title: 'Fic Peek',           desc: 'Preview work content inline' },
      { id: 'similarFics',      title: 'Similar Fics',       desc: 'Find similar works' },
      { id: 'surpriseMe',       title: 'Surprise Me',        desc: 'Random work suggestions' },
      { id: 'tropeGames',       title: 'Trope Games',        desc: 'Trope horoscope, bingo, and roulette' },
      { id: 'searchEnhancer',   title: 'Search Enhancer',    desc: 'Enhanced search with autocomplete and sorting' },
      { id: 'povTracker',       title: 'POV Tracker',        desc: 'Standalone point-of-view detection and display' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 📖 Reading (7 modules)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'reading',
    label: 'Reading',
    match: /(chapter|navigation|reading|tracker|text|speech|footnotes|formatter|collapse|notes|word|swap|fic|actions)/i,
    modules: [
      { id: 'chapterNavigation',    title: 'Chapter Navigation',    desc: 'Enhanced chapter navigation' },
      { id: 'readingTracker',       title: 'Reading Tracker',       desc: 'Unified reading lifecycle: seen, progress, completion' },
      { id: 'textToSpeech',         title: 'Text To Speech',        desc: 'Text-to-speech for works' },
      { id: 'instantFootnotes',     title: 'Instant Footnotes',     desc: 'Quick footnote access' },
      { id: 'readingFormatter',     title: 'Reading Formatter',     desc: 'Text formatting and layout options' },
      { id: 'collapseAuthorNotes',  title: 'Collapse Author Notes', desc: 'Collapse author notes by default' },
      { id: 'wordSwap',             title: 'Word Swap',             desc: 'Personal word replacement rules' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 📚 Library (8 modules)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'library',
    label: 'Library',
    match: /(bookmark|vault|later|shelf|fic|appreciation|reading|dashboard|activity|panel|timeline|notification|center|fanfic|binge)/i,
    modules: [
      { id: 'bookmarkVault',      title: 'Bookmark Vault',      desc: 'Manage bookmarks with notes and organization' },
      { id: 'laterShelf',         title: 'Later Shelf',         desc: 'Manage marked for later list with reminders' },
      { id: 'ficAppreciation',    title: 'Fic Appreciation',    desc: 'Kudos tracking and personal star ratings' },
      { id: 'readingDashboard',   title: 'Reading Dashboard',   desc: 'Personal reading overview and insights' },
      { id: 'activityPanel',      title: 'Activity Panel',      desc: 'Recent activity summary' },
      { id: 'readingTimeline',    title: 'Reading Timeline',    desc: 'Calendar view of reading history' },
      { id: 'notificationCenter', title: 'Notification Center', desc: 'Track updates on subscribed works' },
      { id: 'fanficBingeMode',    title: 'Fanfic Binge Mode',   desc: 'Standalone binge-reading experience module' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 🧭 Navigate & Interact (6 modules)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'navigate',
    label: 'Navigate & Interact',
    match: /(main|navigation|keyboard|shortcuts|user|relationships|series|helper|comment|kit|fic|actions)/i,
    modules: [
      { id: 'mainNavigation',     title: 'Main Navigation',     desc: 'Quick links and back-to-search button' },
      { id: 'keyboardShortcuts',  title: 'Keyboard Shortcuts',  desc: 'Keyboard shortcuts for navigation and actions' },
      { id: 'userRelationships',  title: 'User Relationships',  desc: 'Favorite authors and user blocking' },
      { id: 'seriesHelper',       title: 'Series Helper',       desc: 'Series progress and navigation' },
      { id: 'commentKit',         title: 'Comment Kit',         desc: 'Draft saving and thread navigation' },
      { id: 'ficActions',         title: 'Fic Actions',         desc: 'Manage work action buttons' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 🎨 Appearance & Tools (4 modules)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'appearance',
    label: 'Appearance & Tools',
    match: /(visual|preferences|theme|builder|backup|sync|fic|downloader)/i,
    modules: [
      { id: 'visualPreferences',  title: 'Visual Preferences',  desc: 'Stats visibility, density, date format' },
      { id: 'themeBuilder',       title: 'Theme Builder',        desc: 'Custom visual themes for AO3' },
      { id: 'backupAndSync',      title: 'Backup & Sync',        desc: 'Automatic backup and optional cloud sync' },
      { id: 'ficDownloader',      title: 'Fic Downloader',       desc: 'Download works in multiple formats' },
    ],
  },

];

// ── Derived helpers (computed once, used by consumers) ───────────────────

/** Flat list of all modules with tab info attached. Used by build scripts. */
export const ALL_MODULES = TABS.flatMap(tab =>
  tab.modules.map(m => ({ ...m, tab: tab.id, tabLabel: tab.label }))
);

/** GROUPS format expected by menu-grouper.js */
export const GROUPS = TABS.map(tab => ({
  label: tab.label,
  include: tab.modules.map(m => m.id),
  match: tab.match,
}));

// ── Export ────────────────────────────────────────────────────────────────

// Étape 315 : pose navigateur AO3H_Common.{TabRegistry,MenuGroups} supprimée —
// les consommateurs Vite importent TABS/ALL_MODULES/GROUPS directement.
// Étape 358 (Phase 28) : bloc module.exports CJS retiré — il ne servait qu'aux
// scripts de build/generate-tab-content.js et generate-panel-configs.js,
// supprimés à l'étape 331 ; c'est lui qui déclenchait l'avertissement de build
// [COMMONJS_VARIABLE_IN_ESM] à chaque `npm run build` depuis la Phase 27.
if (typeof window !== 'undefined') {
  log.debug(`✅ ${TABS.length} tabs · ${ALL_MODULES.length} modules registered`);
}
