/* Pure rules shared by tag visibility, reordering, promotion, and highlighting. */

export const TAG_CATEGORIES = ['warnings', 'relationships', 'characters', 'freeforms'];

export function isExcludedCategory(li, excludedCategories) {
  if (!li || typeof li.classList?.contains !== 'function') return false;
  if (!Array.isArray(excludedCategories) || !excludedCategories.length) return false;
  return excludedCategories.some(cat => li.classList.contains(cat));
}

export function sortAlphabetical(items, getKey) {
  return [...items].sort((a, b) => getKey(a).localeCompare(getKey(b), undefined, { sensitivity: 'base' }));
}

export function sortByLength(items, getKey, { longestFirst = false } = {}) {
  return [...items].sort((a, b) => {
    const diff = getKey(a).length - getKey(b).length;
    return longestFirst ? -diff : diff;
  });
}

export function sortByImportance(items, getKey, isImportant) {
  const important = [];
  const rest = [];
  for (const item of items) {
    (isImportant(getKey(item)) ? important : rest).push(item);
  }
  return [...important, ...rest];
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchesPattern(text, pattern) {
  if (typeof text !== 'string' || typeof pattern !== 'string' || !pattern) return false;
  if (!pattern.includes('*')) return text.toLowerCase() === pattern.toLowerCase();
  const regexSource = pattern.split('*').map(escapeRegExp).join('.*');
  return new RegExp(`^${regexSource}$`, 'i').test(text);
}

export function findMatchingRule(text, rules) {
  if (!Array.isArray(rules)) return null;
  for (const rule of rules) {
    if (rule && matchesPattern(text, rule.pattern)) return rule;
  }
  return null;
}
