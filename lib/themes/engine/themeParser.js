/* ═══════════════════════════════════════════════════════════════════════════
   THEME PARSER - Extract colors and variables from CSS
═══════════════════════════════════════════════════════════════════════════ */

export class ThemeParser {
  static extractColors(css) {
    const colors = {};
    
    const bgMatch = css.match(/--ao3h-bg:\s*([^;]+)/);
    if (bgMatch) colors.bg = bgMatch[1].trim();
    
    const textMatch = css.match(/--ao3h-text:\s*([^;]+)/);
    if (textMatch) colors.text = textMatch[1].trim();
    
    const linkMatch = css.match(/--ao3h-link:\s*([^;]+)/);
    if (linkMatch) colors.link = linkMatch[1].trim();
    
    const visitedMatch = css.match(/--ao3h-visited:\s*([^;]+)/);
    if (visitedMatch) colors.visited = visitedMatch[1].trim();
    
    const accentMatch = css.match(/--ao3h-accent:\s*([^;]+)/);
    if (accentMatch) colors.accent = accentMatch[1].trim();
    
    const borderMatch = css.match(/--ao3h-border:\s*([^;]+)/);
    if (borderMatch) colors.border = borderMatch[1].trim();
    
    return colors;
  }
}
