/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Word Swap › Rule Templates

Pure builders for ready-made replacement rules: character-name
normalization, deadname replacement, sensitive-word softening, and
spelling/typo rule packs.

═══════════════════════════════════════════════════════════════════════════ */

const _uid = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const _escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const _rule = (over) => ({
  id: _uid(), name: '', find: '', replace: '',
  enabled: true, regex: false, caseSensitive: false, wholeWord: true,
  category: '', ...over,
});

/**
 * One rule that folds every variant of a character name into one spelling.
 * @param {string} variantsCsv - e.g. "Zoë, Zoe H., Zoey"
 * @param {string} canonical   - e.g. "Zoe"
 * @returns rule object, or null when inputs are unusable
 */
export function characterNameRule (variantsCsv, canonical) {
  const variants = String(variantsCsv || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const target = String(canonical || '').trim();
  if (!variants.length || !target) return null;
  return _rule({
    name:     `Name: ${target}`,
    find:     variants.map(_escapeRegex).join('|'),
    replace:  target,
    regex:    true,
    category: 'names',
  });
}

/** Replaces a deadname with the chosen name (case-insensitive, whole word). */
export function deadnameRule (deadname, chosenName) {
  const from = String(deadname || '').trim();
  const to   = String(chosenName || '').trim();
  if (!from || !to) return null;
  return _rule({ name: `Name: ${to}`, find: from, replace: to, category: 'names' });
}

/**
 * Softens a sensitive word in the text itself, instead of hiding the whole
 * work. Empty replacement blanks the word to "▓▓▓".
 */
export function sensitiveWordRule (word, replacement) {
  const from = String(word || '').trim();
  if (!from) return null;
  return _rule({
    name:     `Soften: ${from}`,
    find:     from,
    replace:  String(replacement ?? '').trim() || '▓▓▓',
    category: 'sensitive',
  });
}

/* ── Spelling and typo packs ─────────────────────────────────────────────── */

const UK_US_PAIRS = [
  ['colour', 'color'], ['favourite', 'favorite'], ['honour', 'honor'],
  ['realise', 'realize'], ['recognise', 'recognize'], ['apologise', 'apologize'],
  ['grey', 'gray'], ['theatre', 'theater'], ['centre', 'center'], ['travelling', 'traveling'],
];

const TYPO_PAIRS = [
  ['teh', 'the'], ['adn', 'and'], ['thier', 'their'], ['recieve', 'receive'],
  ['definately', 'definitely'], ['occured', 'occurred'], ['seperate', 'separate'],
  ['alot', 'a lot'], ['wierd', 'weird'], ['untill', 'until'],
];

export const RULE_PACKS = [
  { id: 'uk-to-us', label: 'UK → US spelling',  category: 'spelling', pairs: UK_US_PAIRS },
  { id: 'us-to-uk', label: 'US → UK spelling',  category: 'spelling', pairs: UK_US_PAIRS.map(([uk, us]) => [us, uk]) },
  { id: 'typos',    label: 'Common typo fixes', category: 'typos',    pairs: TYPO_PAIRS },
];

/** Expands a pack id into ready-to-save rules ([] for unknown ids). */
export function packRules (packId) {
  const pack = RULE_PACKS.find(p => p.id === packId);
  if (!pack) return [];
  return pack.pairs.map(([find, replace]) =>
    _rule({ name: `${pack.label}: ${find}`, find, replace, category: pack.category }));
}
