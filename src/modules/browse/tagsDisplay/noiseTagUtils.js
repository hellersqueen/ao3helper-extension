/* Helpers for detecting, configuring, revealing, and excepting noise tags. */

export const NOISE_PATTERNS = [
  'idk', "i don't know", 'i dont know', "i'm sorry", 'im sorry',
  'sorry this is bad', 'my first fic', 'first fic pls be nice',
  'first fanfic pls be nice', 'pls be nice', "don't read this",
  'dont read this', 'this is dumb', 'this is stupid', 'this sucks',
  'i cant write', 'i cannot write', 'probably bad', 'badly written',
  'unbetaed', "unbeta'd", 'no beta we die like men', 'not beta read',
  'idk what im doing', "idk what i'm doing",
];

export const CUSTOM_NOISE_WORDS_KEY = 'ao3h:tagsDisplay:customNoiseWords';
export const AUTHOR_EXCEPTIONS_KEY = 'ao3h:tagsDisplay:noiseAuthorExceptions';
export const REVEAL_CHIP_CLASS = 'ao3h-noise-tag-reveal';
export const REVEALED_CLASS = 'ao3h-noise-tag-revealed';

export function normalizeNoiseText(text) {
  return (text || '').toLowerCase().trim().replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim();
}

export function isNoiseTag(text, patterns = NOISE_PATTERNS) {
  const normalized = normalizeNoiseText(text);
  if (!normalized || normalized.length < 3) return false;
  return patterns.some(pattern => normalized.includes(pattern));
}

export function mergeNoisePatterns(builtIn, custom) {
  const seen = new Set();
  const merged = [];
  for (const raw of [...(builtIn || []), ...(custom || [])]) {
    const cleaned = String(raw || '').trim().toLowerCase();
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    merged.push(cleaned);
  }
  return merged;
}

export function getCustomNoiseWords() {
  try {
    const raw = localStorage.getItem(CUSTOM_NOISE_WORDS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(word => typeof word === 'string') : [];
  } catch { return []; }
}

export function saveCustomNoiseWords(list) {
  const cleaned = mergeNoisePatterns([], list);
  try { localStorage.setItem(CUSTOM_NOISE_WORDS_KEY, JSON.stringify(cleaned)); } catch { /* quota */ }
  return cleaned;
}

export function createRevealChip(doc, {
  className = REVEAL_CHIP_CLASS, label = 'show hidden tag', preview = '',
} = {}) {
  const chip = doc.createElement('button');
  chip.type = 'button';
  chip.className = className;
  chip.textContent = label;
  chip.setAttribute('aria-label', 'Show this tag hidden by the noise filter');
  if (preview) chip.title = preview;
  return chip;
}

export function revealNoiseTag(element, revealedClass = REVEALED_CLASS) {
  if (!element || typeof element.classList?.add !== 'function') return false;
  element.classList.add(revealedClass);
  return true;
}

export function normalizeAuthorName(name) {
  return String(name || '').trim().toLowerCase();
}

export function getAuthorExceptions() {
  try {
    const raw = localStorage.getItem(AUTHOR_EXCEPTIONS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(name => typeof name === 'string') : [];
  } catch { return []; }
}

export function saveAuthorExceptions(list) {
  const cleaned = Array.from(new Set((list || []).map(normalizeAuthorName).filter(Boolean)));
  try { localStorage.setItem(AUTHOR_EXCEPTIONS_KEY, JSON.stringify(cleaned)); } catch { /* quota */ }
  return cleaned;
}

export function isExceptedAuthor(author, exceptions) {
  const normalized = normalizeAuthorName(author);
  return !!normalized && (exceptions || []).includes(normalized);
}

export function extractBlurbAuthor(blurbEl) {
  if (!blurbEl || typeof blurbEl.querySelector !== 'function') return '';
  const author = blurbEl.querySelector('a[rel="author"]');
  return author ? author.textContent.trim() : '';
}
