/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Language Badges Submodule
    Submodule ID: languageBadges
    Parent Module: filterManager

    - Feature: Language badge injection
      - Option: Appends a flag + language name badge after each work blurb heading
      - Option: Supports 20 languages with emoji flag mapping
      - Option: Only injects when multiple distinct languages appear on the page
      - Option: Only injects once per blurb (guarded by data-fm-lang attribute)

    - Feature: Click-to-filter
      - Option: Badge acts as a button when clickBadgeToFilter is enabled
      - Option: Click navigates to current URL filtered by work_search[language_id] (ISO 639-1 code)
      - Option: Keyboard accessible (Enter key triggers filter)

    - Feature: Cleanup
      - Option: Removes all injected badges and resets data-fm-lang markers

    Dependencies injected via constructor: NS, cfg

═══════════════════════════════════════════════════════════════════════════ */

const LANG_FLAGS = {
  'English': '🇬🇧', 'Français': '🇫🇷', 'Español': '🇪🇸', 'Deutsch': '🇩🇪',
  'Italiano': '🇮🇹', 'Português': '🇵🇹', '中文': '🇨🇳', '日本語': '🇯🇵',
  '한국어': '🇰🇷', 'Русский': '🇷🇺', 'العربية': '🇸🇦', 'Polski': '🇵🇱',
  'Nederlands': '🇳🇱', 'Svenska': '🇸🇪', 'Norsk': '🇳🇴', 'Suomi': '🇫🇮',
  'Türkçe': '🇹🇷', 'Česky': '🇨🇿', 'Magyar': '🇭🇺', 'Română': '🇷🇴',
};

const LANG_CODES = {
  'English': 'en', 'Français': 'fr', 'Español': 'es', 'Deutsch': 'de',
  'Italiano': 'it', 'Português': 'pt', '中文': 'zh', '日本語': 'ja',
  '한국어': 'ko', 'Русский': 'ru', 'العربية': 'ar', 'Polski': 'pl',
  'Nederlands': 'nl', 'Svenska': 'sv', 'Norsk': 'no', 'Suomi': 'fi',
  'Türkçe': 'tr', 'Česky': 'cs', 'Magyar': 'hu', 'Română': 'ro',
};

export class LanguageBadges {
  constructor ({ NS, cfg }) {
    this.NS  = NS;
    this.cfg = cfg;
  }

  _langFromBlurb (blurb) {
    return blurb.querySelector('dd.language')?.textContent.trim() || null;
  }

  apply (blurbs) {
    const NS       = this.NS;
    const show     = this.cfg('showLanguageBadge');
    const canClick = this.cfg('clickBadgeToFilter');
    const langs = new Set(
      [...blurbs].map(b => this._langFromBlurb(b)).filter(Boolean)
    );
    if (!show || langs.size <= 1) return;

    for (const blurb of blurbs) {
      if (blurb.dataset.fmLang) continue;
      blurb.dataset.fmLang = '1';

      const lang = this._langFromBlurb(blurb);
      if (!lang) continue;

      blurb.querySelector(`.${NS}-lang-badge`)?.remove();

      const badge = document.createElement('span');
      badge.className    = `${NS}-lang-badge`;
      badge.dataset.lang = lang;
      badge.textContent  = `${LANG_FLAGS[lang] || ''} ${lang}`.trim();

      if (canClick) {
        badge.setAttribute('role', 'button');
        badge.setAttribute('tabindex', '0');
        badge.title = `Filter by language: ${lang}`;
        const doFilter = () => {
          const url = new URL(location.href);
          url.searchParams.set('work_search[language_id]', LANG_CODES[lang] || lang);
          location.href = url.toString();
        };
        badge.addEventListener('click', doFilter);
        badge.addEventListener('keydown', e => { if (e.key === 'Enter') doFilter(); });
      }

      blurb.querySelector('h4.heading')?.after(badge);
    }
  }

  cleanup () {
    const NS = this.NS;
    document.querySelectorAll('[data-fm-lang]').forEach(el => {
      delete el.dataset.fmLang;
      el.querySelector(`.${NS}-lang-badge`)?.remove();
    });
  }
}
