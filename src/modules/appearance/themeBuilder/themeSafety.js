/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Builder › Theme Safety

Pure helpers shared by the builder panels: protection of critical page
zones against destructive custom CSS, WCAG contrast checking, colorblind-
safe palettes, and the quick element-styling rule builder.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   PROTECTED ZONES — custom CSS must not blank out the fic text itself
═══════════════════════════════════════════════════════════════════════════ */

export const PROTECTED_ZONES = ['#workskin', '.userstuff', '#chapters', 'body', 'html', '#main'];

const HIDING_DECL_RE = /(display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\.0+)?\s*(?:!|;|$)|font-size\s*:\s*0|height\s*:\s*0(?:px|em|rem|%)?\s*(?:!|;|$)|width\s*:\s*0(?:px|em|rem|%)?\s*(?:!|;|$)|transform\s*:[^;]*scale\s*\(\s*0)/i;

/**
 * Scans custom CSS for rules that would hide or destroy a protected zone
 * (e.g. `#workskin { display: none }`). Returns human-readable violation
 * messages; empty array = safe.
 */
export function findProtectedViolations (cssText) {
  const violations = [];
  const noComments = String(cssText || '').replace(/\/\*[^]*?\*\//g, '');

  // Innermost blocks with their selector; good enough for @media nesting
  // (the inner rule still matches with its own selector).
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(noComments)) !== null) {
    const selector = m[1].trim().split('\n').pop().trim();
    const body     = m[2];
    if (!HIDING_DECL_RE.test(body)) continue;
    const zone = PROTECTED_ZONES.find(z => {
      // "body" must match as a standalone selector part, not "tbody" or ".bodyclass"
      const re = new RegExp(`(^|[\\s,>+~])${z.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);
      return re.test(` ${selector}`);
    });
    if (zone) {
      violations.push(`Rule "${selector.slice(0, 50)}" would hide the protected zone ${zone} (display:none / visibility / zero size).`);
    }
  }
  return violations;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTRAST — WCAG 2.x relative luminance
═══════════════════════════════════════════════════════════════════════════ */

/** #rgb or #rrggbb → [r,g,b] 0–255, or null. */
export function hexToRgb (hex) {
  const h = String(hex || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) {
    return [...h].map(c => parseInt(c + c, 16));
  }
  if (/^[0-9a-f]{6}$/i.test(h)) {
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  }
  return null;
}

function _channelLum (v) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG contrast ratio between two hex colors (1–21), or null if unparsable. */
export function contrastRatio (hexA, hexB) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  if (!a || !b) return null;
  const lum = (rgb) => 0.2126 * _channelLum(rgb[0]) + 0.7152 * _channelLum(rgb[1]) + 0.0722 * _channelLum(rgb[2]);
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** 'good' (AAA, ≥7) | 'ok' (AA, ≥4.5) | 'low' | null. */
export function contrastVerdict (ratio) {
  if (!Number.isFinite(ratio)) return null;
  if (ratio >= 7) return 'good';
  if (ratio >= 4.5) return 'ok';
  return 'low';
}

/* ═══════════════════════════════════════════════════════════════════════════
   COLORBLIND-SAFE PALETTES — based on the Okabe-Ito palette
═══════════════════════════════════════════════════════════════════════════ */

export const COLORBLIND_PALETTES = [
  {
    id: 'cb-light',
    label: '♿ Colorblind-safe (light)',
    colors: { accentColor: '#d55e00', bgColor: '#ffffff', textColor: '#1a1a1a', linkColor: '#0072b2', headerBg: '#1a1a1a' },
  },
  {
    id: 'cb-dark',
    label: '♿ Colorblind-safe (dark)',
    colors: { accentColor: '#e69f00', bgColor: '#1b1b1b', textColor: '#f0f0f0', linkColor: '#56b4e9', headerBg: '#000000' },
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   ELEMENT STYLER — quick rule from the inspector selection
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Builds the CSS rule for the inspector's quick-style controls.
 * Returns '' when there is no selector or nothing to change.
 */
export function buildElementRule (selector, { textColor = '', bgColor = '', hide = false } = {}) {
  const sel = String(selector || '').trim();
  if (!sel) return '';
  const decls = [];
  if (hide) decls.push('display: none !important;');
  else {
    if (textColor) decls.push(`color: ${textColor} !important;`);
    if (bgColor)   decls.push(`background-color: ${bgColor} !important;`);
  }
  if (!decls.length) return '';
  return `${sel} { ${decls.join(' ')} }`;
}
