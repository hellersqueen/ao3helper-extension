/* ═══════════════════════════════════════════════════════════════════════════
   MODULE: welcomeGuide

   WHAT IT DOES:
   Presents a stunning, gradient-styled welcome modal to first-time users that introduces
   AO3Helper's core features through an attractive visual grid. Displays only once on initial
   installation and provides a quick-start guide highlighting the most important functionality.

   WHY IT'S USEFUL:
   First impressions matter. New users can feel overwhelmed by feature-rich scripts without
   proper onboarding. This welcome guide reduces that friction by elegantly introducing key
   capabilities. It transforms the installation from confusing to confidence-inspiring, increasing
   user engagement and reducing abandonment. The professional design also establishes credibility
   and quality.

   Étape 398 (Phase 30) : réécrit en ES Module — l'ancienne version lisait `window.AO3H` au
   chargement et appelait `AO3H.modules?.register(...)` conditionnellement ; jamais importée
   nulle part dans le graphe Vite malgré l'étape 172 marquée terminée, ce fichier n'était donc
   jamais exécuté (aucun guide d'accueil ne s'affichait aux nouveaux utilisateurs). Importé
   maintenant depuis src/main.js. Le texte mentionnait aussi un raccourci « Ctrl+Shift+H » qui
   n'a jamais existé dans keyboardShortcuts.js — remplacé par une instruction exacte (menu AO3
   Helper → Manager Panel).
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../src/core/lifecycle.js';

const NS = 'ao3h';
const MOD = 'WelcomeGuide';
const SEEN_KEY = `${NS}-welcome-seen`;

register(MOD, {
  title: 'Welcome Guide',
  enabledByDefault: true
}, async function init() {

  if (localStorage.getItem(SEEN_KEY)) return () => {};

  const guide = document.createElement('div');
  guide.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    z-index: 99999;
    max-width: 600px;
    text-align: center;
  `;
  guide.innerHTML = `
    <h1 style="margin:0 0 20px 0; font-size:32px;">👋 Welcome to AO3 Helper!</h1>
    <p style="font-size:16px; line-height:1.6; margin-bottom:25px;">
      Enhance your AO3 experience with powerful tools for reading, bookmarking, and organizing fanfiction.
    </p>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:25px;">
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>📚 Bookmark Manager</strong><br>
        <small>Organize your favorites</small>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>📊 Reading Stats</strong><br>
        <small>Track your progress</small>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>🎨 Custom Themes</strong><br>
        <small>Personalize appearance</small>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:15px; border-radius:8px;">
        <strong>⚡ Quick Actions</strong><br>
        <small>Keyboard shortcuts</small>
      </div>
    </div>
    <button style="background:white; color:#667eea; border:none; padding:12px 30px; border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer;">
      Get Started
    </button>
    <p style="margin-top:15px; font-size:12px; opacity:0.8;">
      Open it anytime from the AO3 Helper menu → Manager Panel
    </p>
  `;

  guide.querySelector('button').addEventListener('click', () => {
    localStorage.setItem(SEEN_KEY, 'true');
    guide.remove();
  });

  document.body.appendChild(guide);

  return () => {
    guide.remove();
  };
});
