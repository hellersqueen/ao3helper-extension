/* Shared noise-tag matching and custom-pattern persistence. */

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

export function normalizeNoiseText (text) {
  return (text || '').toLowerCase().trim().replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim();
}

export function isNoiseTag (text, patterns = NOISE_PATTERNS) {
  const normalized = normalizeNoiseText(text);
  return !!normalized && normalized.length >= 3 && patterns.some(pattern => normalized.includes(pattern));
}

export function mergeNoisePatterns (builtIn, custom) {
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

export function getCustomNoiseWords () {
  try {
    const raw = localStorage.getItem(CUSTOM_NOISE_WORDS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(word => typeof word === 'string') : [];
  } catch { return []; }
}

export function saveCustomNoiseWords (list) {
  const cleaned = mergeNoisePatterns([], list);
  try { localStorage.setItem(CUSTOM_NOISE_WORDS_KEY, JSON.stringify(cleaned)); } catch { /* quota */ }
  return cleaned;
}
