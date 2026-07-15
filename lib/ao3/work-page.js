/* ═══════════════════════════════════════════════════════════════════════════
   WORK PAGE - Métadonnées de la page d'un work (titre, auteur, tags, prose)
   Why: ~20 copies de « lire le titre / l'auteur / les fandoms » avec des jeux
   de sélecteurs différents. Les sélecteurs ici sont l'union ordonnée des
   versions les plus complètes (readingDashboard, seenTracking,
   chapterWordCount).
═══════════════════════════════════════════════════════════════════════════ */

import { parseChapterCount } from './parsers.js';

/**
 * Titre du work affiché
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {string|null}
 */
export function getWorkTitle(doc = document) {
  const el =
    doc.querySelector('#workskin .preface h2.title') ||
    doc.querySelector('#workskin .preface h2.heading') ||
    doc.querySelector('div.preface.group h2.title') ||
    doc.querySelector('h2.title.heading') ||
    doc.querySelector('h2.title') ||
    doc.querySelector('h2.heading');
  return el ? (el.textContent || '').trim() : null;
}

/**
 * Auteur du work affiché
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {{name: string|null, username: string|null}}
 */
export function getWorkAuthor(doc = document) {
  const a =
    doc.querySelector('h3.byline a[rel="author"]') ||
    doc.querySelector('h3.byline a') ||
    doc.querySelector('a[rel="author"]');
  if (!a) return { name: null, username: null };
  return {
    name: a.textContent.trim() || null,
    username: (a.getAttribute('href') || '').match(/\/users\/([^/]+)/)?.[1] || null,
  };
}

/**
 * Fandoms du work affiché
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {string[]}
 */
export function getWorkFandoms(doc = document) {
  return Array.from(doc.querySelectorAll('dd.fandom.tags a, dd.fandom a.tag'))
    .map((el) => (el.textContent || '').trim())
    .filter(Boolean);
}

/**
 * Tags du work affiché (freeforms + relationships)
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {string[]}
 */
export function getWorkTags(doc = document) {
  return Array.from(doc.querySelectorAll(
    'dd.freeform.tags a.tag, dd.freeform.tags li a, dd.additional.tags li a, ' +
    'dd.tags li a, li.relationships a.tag, dd.relationship.tags a'
  ))
    .map((el) => (el.textContent || '').trim())
    .filter(Boolean);
}

/**
 * Métadonnées complètes de la page (base : seenTracking.parseWorkMeta,
 * l'extracteur le plus riche du projet)
 * @param {Document} doc - Document à analyser (défaut: document)
 * @returns {Object} { workId, title, author, chapters, chapterId, chapterHref,
 *                     fandoms, tags, href }
 */
export function getWorkMeta(doc = document) {
  const workId = location.pathname.match(/\/works\/(\d+)/)?.[1] || null;
  const chapters = parseChapterCount(doc.querySelector('dd.chapters'));
  const selOpt = doc.querySelector('select#selected_id option[selected]');
  const chapterId = selOpt?.value || null;
  return {
    workId,
    title:       getWorkTitle(doc),
    author:      getWorkAuthor(doc),
    chapters,
    chapterId,
    chapterHref: chapterId && workId ? `/works/${workId}/chapters/${chapterId}` : null,
    fandoms:     getWorkFandoms(doc),
    tags:        getWorkTags(doc),
    href:        location.pathname,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   PROSE D'UN CHAPITRE
   Connaissance du markup AO3 extraite de chapterWordCount (la version la
   plus correcte : exclut préfaces/notes, 3 stratégies de fallback).
─────────────────────────────────────────────────────────────────────────── */

const EXCLUDE_SCOPES = '.preface, .summary, .notes, .endnotes, .chapter.preface';

/**
 * Retourne les nœuds de prose d'un chapitre (hors notes/préfaces)
 * @param {Element} chapter - Élément .chapter
 * @returns {Element[]}
 */
export function getChapterProseNodes(chapter) {
  let main = Array.from(chapter.querySelectorAll('.userstuff.module'))
    .filter((el) => !el.closest(EXCLUDE_SCOPES));
  if (main.length) return main;

  let all = Array.from(chapter.querySelectorAll('.userstuff'))
    .filter((el) => !el.closest(EXCLUDE_SCOPES));
  if (all.length) return all;

  // Dernier recours : les .userstuff entre ce chapitre et le suivant
  const out = [];
  for (let n = chapter.nextElementSibling; n; n = n.nextElementSibling) {
    if (n.classList?.contains('chapter')) break;
    if (n.matches?.('.userstuff')) out.push(n);
    out.push(...(n.querySelectorAll?.('.userstuff') || []));
  }
  const filtered = out.filter((el) => !el.closest(EXCLUDE_SCOPES));
  return filtered.length ? filtered : out;
}

/**
 * Texte de prose d'un chapitre (ou du work entier si chapter est omis)
 * @param {Element} [chapter] - Élément .chapter ; défaut : tout #workskin
 * @returns {string}
 */
export function getChapterProse(chapter = null) {
  let nodes;
  if (chapter) {
    nodes = getChapterProseNodes(chapter);
  }
  if (!chapter || !nodes.length) {
    const ws = document.getElementById('workskin') || document;
    const all = Array.from(ws.querySelectorAll('.userstuff.module, .userstuff'));
    const main = all.filter((el) => !el.closest(EXCLUDE_SCOPES));
    nodes = main.length ? main : all;
  }
  return nodes.map((n) => n.innerText || '').join('\n');
}
