/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Similar Fics › Helpers

Pure logic for the recommendation panel: length-range calculation per
`lengthMode`, similarity scoring (with relationship tags weighted above
character/freeform tags), the score threshold per `matchStyle`, plain-language
reason text, and dismissed-work filtering.

═══════════════════════════════════════════════════════════════════════════ */

const WORD_BUCKET_SIZES = [2_000, 5_000, 10_000, 20_000, 50_000, 100_000];

/**
 * Base "similar length" range around a word count (bucket-based step).
 * @param {number} count
 * @returns {{from:number, to:number}}
 */
function baseWordRange (count) {
  if (typeof count !== 'number' || !isFinite(count) || count <= 0) {
    return { from: null, to: null };
  }
  let step = 5000;
  for (const size of WORD_BUCKET_SIZES) {
    if (count <= size) { step = size / 2; break; }
  }
  const half = step / 2;
  let from = Math.max(0, Math.floor((count - half) / 100) * 100);
  let to = Math.floor((count + half) / 100) * 100;
  if (from < 1000) from = 0;
  if (to < from) to = from;
  return { from, to };
}

/**
 * Word-count range to search for, per length preference.
 * @param {number} count - current work's word count
 * @param {string} mode - 'similar' | 'shorter' | 'longer' | 'quick' | 'epic'
 * @returns {{from:number|null, to:number|null}}
 */
export function getWordRangeForMode (count, mode = 'similar') {
  if (mode === 'quick') return { from: 0, to: 10_000 };
  if (mode === 'epic')  return { from: 100_000, to: null };

  if (typeof count !== 'number' || !isFinite(count) || count <= 0) {
    return { from: null, to: null };
  }
  if (mode === 'shorter') return { from: 0, to: Math.max(1000, Math.floor(count * 0.7)) };
  if (mode === 'longer')  return { from: Math.floor(count * 1.4), to: null };
  return baseWordRange(count);
}

/** Score threshold (0-100) below which a result is dropped, per match style. */
export function minScoreForStyle (matchStyle = 'balanced') {
  if (matchStyle === 'close')   return 80;
  if (matchStyle === 'variety') return 50;
  return 70; // 'balanced' — the module's original fixed threshold
}

/**
 * Score a blurb against the current work's info. Relationship-tag matches
 * are weighted above character/freeform ("additional") tag matches.
 * @param {{fandoms:string[], relationships:string[], freeforms:string[], wordCount:number}} blurb
 * @param {{fandomTag?:string|null, relationshipTags?:string[], otherTags?:string[], words?:number|null}} info
 * @returns {{score:number, reasons:string[], relMatchCount:number}}
 */
export function scoreWork (blurb, info) {
  let score = 0;
  const reasons = [];

  if (info.fandomTag && blurb.fandoms.some(f => f.toLowerCase() === info.fandomTag.toLowerCase())) {
    score += 40;
    reasons.push('fandom');
  }

  const blurbRelsLower  = blurb.relationships.map(t => t.toLowerCase());
  const blurbOtherLower = blurb.freeforms.map(t => t.toLowerCase());
  const relTagsLower    = (info.relationshipTags || []).map(t => t.toLowerCase());
  const otherTagsLower  = (info.otherTags || []).map(t => t.toLowerCase());

  const relMatchCount   = relTagsLower.filter(t => blurbRelsLower.includes(t)).length;
  const otherMatchCount = otherTagsLower.filter(t => blurbOtherLower.includes(t)).length;

  // Relationship matches count for more than character/freeform ("other") matches.
  if (relMatchCount > 0) {
    score += Math.min(relMatchCount * 15, 30);
    reasons.push(`${relMatchCount} pairing tag${relMatchCount > 1 ? 's' : ''}`);
  }
  if (otherMatchCount > 0) {
    score += Math.min(otherMatchCount * 8, 24);
    reasons.push(`${otherMatchCount} tag${otherMatchCount > 1 ? 's' : ''}`);
  }

  if (info.words && blurb.wordCount > 0) {
    const ratio = Math.min(info.words, blurb.wordCount) / Math.max(info.words, blurb.wordCount);
    if (ratio >= 0.8)      { score += 20; reasons.push('length'); }
    else if (ratio >= 0.5) { score += 10; }
  }

  return { score, reasons, relMatchCount };
}

/**
 * Whether a scored result should survive the strict ±20% length window that
 * applies only in 'similar' length mode (other modes already searched a
 * deliberately different range, so no extra filtering is needed there).
 * @param {{wordCount:number}} blurb
 * @param {number|null} currentWords
 * @param {string} lengthMode
 */
export function passesLengthFilter (blurb, currentWords, lengthMode) {
  if (lengthMode !== 'similar') return true;
  if (!currentWords || !blurb.wordCount) return true;
  const ratio = Math.min(currentWords, blurb.wordCount) / Math.max(currentWords, blurb.wordCount);
  return ratio >= 0.8;
}

/** Turns terse reason tokens ('fandom', '2 tags', 'length') into a plain-language sentence fragment. */
export function buildReasonText (reasons) {
  const labels = {
    fandom: 'same fandom',
    length: 'similar length',
  };
  return (reasons || [])
    .map(r => {
      if (labels[r]) return labels[r];
      const pairingMatch = r.match(/^(\d+) pairing tags?$/);
      if (pairingMatch) return `shares ${pairingMatch[1] === '1' ? 'a pairing tag' : pairingMatch[1] + ' pairing tags'}`;
      const tagMatch = r.match(/^(\d+) tags?$/);
      if (tagMatch) return `shares ${tagMatch[1] === '1' ? '1 tag' : tagMatch[1] + ' tags'}`;
      return r;
    })
    .join(', ');
}

/**
 * Filters out dismissed ("not interested") works.
 * @template {{workId:string}} T
 * @param {T[]} items
 * @param {Set<string>} dismissedIds
 * @returns {T[]}
 */
export function filterDismissed (items, dismissedIds) {
  if (!dismissedIds || !dismissedIds.size) return items;
  return items.filter(i => !dismissedIds.has(i.workId));
}

/**
 * Adds a work ID to a dismissed-set list, capped to `cap` most-recent entries.
 * @param {string[]} list
 * @param {string} workId
 * @param {number} cap
 * @returns {string[]}
 */
export function addDismissed (list, workId, cap = 200) {
  const rest = (Array.isArray(list) ? list : []).filter(id => id !== workId);
  return [workId, ...rest].slice(0, cap);
}

/** Matches AO3's "Part X of Y" series text. */
export function parseSeriesPartOf (text) {
  const m = /Part\s+(\d+)\s+of\s+(\d+)/i.exec(text || '');
  return m ? { part: +m[1], total: +m[2] } : null;
}
