/* ═══════════════════════════════════════════════════════════════════════════
   THEME VALIDATOR - Validate and sanitize custom CSS
═══════════════════════════════════════════════════════════════════════════ */

export class ThemeValidator {
  static validate(css) {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /@import\s+url\(/i,
      /expression\(/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(css)) {
        throw new Error('CSS contains potentially unsafe content');
      }
    }
    
    // Size limit
    if (css.length > 50000) {
      throw new Error('CSS is too large (max 50KB)');
    }
    
    // Warn if not properly scoped
    const requiredPrefix = 'html.ao3h-theme-custom-';
    if (!css.includes(requiredPrefix)) {
      console.warn('[ThemeValidator] CSS should target html.ao3h-theme-custom-* for proper scoping');
    }
    
    return true;
  }
}
