/* ao3-filters.js — generates the reusable Sort & Filter panel.

   USAGE — add a placeholder in the page HTML:
     <div id="ao3-filters-placeholder" data-config="myFiltersConfig"></div>

   Then define the config object on the page BEFORE this script runs (or in a
   DOMContentLoaded callback), e.g.:
     window.myFiltersConfig = { ... };

   CONFIG SHAPE:
   {
     formId:    'work-filters',        // id on the <form> element
     action:    '/tags/Harry.../works',// form action URL
     prefix:    'work_search',         // field-name prefix
     clearUrl:  '/tags/Harry.../works',// href for "Clear Filters"
     hiddenFields: { tag_id: 'Harry Potter - ...' },  // optional hidden inputs

     sortOptions: [
       { value: 'revised_at', label: 'Date Updated', selected: true },
       { value: 'created_at', label: 'Date Posted' },
       ...
     ],

     // Each tag entry: { id, name }   (id used for input value + label[for])
     tags: {
       ratings:       [ { id: 11, name: 'General Audiences' }, ... ],
       warnings:      [ ... ],
       categories:    [ ... ],
       fandoms:       [ ... ],
       characters:    [ ... ],
       relationships: [ ... ],
       freeform:      [ ... ],
     },

     // "More Options" toggles — set to false to hide a section
     more: {
       crossovers:  true,
       completion:  true,
       wordCount:   true,
       dateUpdated: true,
       query:       true,
       language:    true,
     }
   }
*/

(function () {
  'use strict';

  /* ── Language list (shared across all filter forms) ────────── */
  var LANGUAGES = [
    ['', ' '], ['so','af Soomaali'], ['afr','Afrikaans'], ['ain','Aynu itak | アイヌ イタㇰ'],
    ['akk','𒀝𒅗𒁺𒌑'], ['ar','العربية'], ['amh','አማርኛ'], ['egy','𓂋𓏺𓈖 𓆎𓅓𓏏𓊖'],
    ['oji','Anishinaabemowin'], ['arc','ܐܪܡܝܐ | ארמיא'], ['hy','հայերեն'],
    ['ase','American Sign Language'], ['ast','asturianu'],
    ['azj','Azərbaycan dili | آذربایجان دیلی'], ['id','Bahasa Indonesia'],
    ['ms','Bahasa Malaysia'], ['bg','Български'], ['bn','বাংলা'], ['jv','Basa Jawa'],
    ['ba','Башҡорт теле'], ['be','беларуская'], ['bar','Boarisch'], ['bos','Bosanski'],
    ['br','Brezhoneg'], ['bfi','British Sign Language'],
    ['bua','Буряад хэлэн | ᠪᠤᠷᠢᠶᠠᠳ ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ'], ['ca','Català'], ['ceb','Cebuano'],
    ['cs','Čeština'], ['chn','Chinuk Wawa'],
    ['crh','къырымтатар тили | qırımtatar tili'], ['cy','Cymraeg'], ['da','Dansk'],
    ['de','Deutsch'], ['et','eesti keel'], ['el','Ελληνικά'], ['sux','𒅴𒂠'],
    ['en','English'], ['ang','Eald Englisċ'], ['es','Español'], ['eo','Esperanto'],
    ['eu','Euskara'], ['fa','فارسی'], ['fil','Filipino'], ['cha','Finuʼ Chamorro'],
    ['fr','Français'], ['frr','Friisk'], ['fry','Frysk'], ['fur','Furlan'],
    ['ga','Gaeilge'], ['gd','Gàidhlig'], ['gl','Galego'], ['got','𐌲𐌿𐍄𐌹𐍃𐌺𐌰'],
    ['gyn','Creolese'], ['hak','中文-客家话'], ['ko','한국어'],
    ['hau','Hausa | هَرْشَن هَوْسَ'], ['hi','हिन्दी'], ['hr','Hrvatski'],
    ['haw','ʻŌlelo Hawaiʻi'], ['ia','Interlingua'], ['zu','isiZulu'], ['is','Íslenska'],
    ['it','Italiano'], ['he','עברית'], ['kal','Kalaallisut'],
    ['xal','Хальмг Өөрдин келн'], ['kan','ಕನ್ನಡ'], ['kat','ქართული'],
    ['cor','Kernewek'], ['khm','ភាសាខ្មែរ'], ['qkz','Khuzdul'], ['sw','Kiswahili'],
    ['ht','kreyòl ayisyen'], ['ku','Kurdî | کوردی'], ['kir','Кыргызча'],
    ['fcs','Langue des signes québécoise'], ['lv','Latviešu valoda'],
    ['lb','Lëtzebuergesch'], ['lt','Lietuvių kalba'], ['la','Lingua latina'],
    ['hu','Magyar'], ['mk','македонски'], ['ml','മലയാളം'], ['mt','Malti'],
    ['mnc','ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ'], ['qmd','Mando\'a'], ['mr','मराठी'], ['mik','Mikisúkî'],
    ['mon','ᠮᠣᠩᠭᠣᠯ ᠪᠢᠴᠢᠭ᠌ | Монгол Кирилл үсэг'], ['my','မြန်မာဘာသာ'],
    ['myv','Эрзянь кель'], ['nah','Nāhuatl'], ['nan','中文-闽南话 臺語'], ['ppl','Nawat'],
    ['nl','Nederlands'], ['ja','日本語'], ['no','Norsk'], ['ce','Нохчийн мотт'],
    ['ood','O\'odham Ñiok'], ['ota','لسان عثمانى'], ['ps','پښتو'], ['nds','Plattdüütsch'],
    ['pl','Polski'], ['ptBR','Português brasileiro'], ['ptPT','Português europeu'],
    ['fuc','Pulaar'], ['pa','ਪੰਜਾਬੀ'], ['kaz','qazaqşa | қазақша'],
    ['qlq','Uncategorized Constructed Languages'], ['qya','Quenya'], ['ro','Română'],
    ['rom','RRomani Ćhib'], ['ru','Русский'], ['smi','Sámi'], ['sah','саха тыла'],
    ['sco','Scots'], ['sq','Shqip'], ['sjn','Sindarin'], ['si','සිංහල'],
    ['sk','Slovenčina'], ['slv','Slovenščina'], ['sla','Slověnьskъ Językъ'],
    ['gem','Sprēkō Þiudiskō'], ['sr','Српски'], ['fi','suomi'], ['sv','Svenska'],
    ['ta','தமிழ்'], ['tat','татар теле'], ['mri','te reo Māori'], ['tel','తెలుగు'],
    ['tir','ትግርኛ'], ['th','ไทย'], ['tqx','Thermian'], ['bod','བོད་སྐད་'],
    ['vi','Tiếng Việt'], ['cop','ϯⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ'], ['tlh','tlhIngan-Hol'],
    ['tok','toki pona'], ['trf','Trinidadian Creole'], ['tsd','τσακώνικα'],
    ['chr','ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ'], ['tr','Türkçe'], ['uk','Українська'],
    ['ale','Unangam Tunuu'], ['urd','اُردُو'], ['uig','ئۇيغۇر تىلى'],
    ['vol','Volapük'], ['wuu','中文-吴语'], ['yi','יידיש'], ['yua','maayaʼ tʼàan'],
    ['yue','中文-广东话 粵語'], ['zh','中文-普通话 國語'],
  ];

  /* ── Helper: escape HTML ────────────────────────────────────── */
  function h(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Build one expandable tag group (Ratings/Warnings/etc.) ── */
  function buildTagGroup(mode, groupKey, labelText, prefix, tags, inputType) {
    // mode = 'include' | 'exclude'
    // groupKey = 'rating' | 'warning' | 'category' | 'fandom' | 'character' | 'relationship' | 'freeform'
    var fieldKey = {
      rating:       'rating_ids',
      warning:      'archive_warning_ids',
      category:     'category_ids',
      fandom:       'fandom_ids',
      character:    'character_ids',
      relationship: 'relationship_ids',
      freeform:     'freeform_ids',
    }[groupKey];

    var dtId  = 'toggle_' + mode + '_' + groupKey + '_tags';
    var ddId  = mode + '_' + groupKey + '_tags';
    var namePrefix = mode + '_' + prefix + '[' + fieldKey + '][]';

    var items = (tags[groupKey] || []).map(function (tag) {
      var inputId = mode + '_' + prefix + '_' + fieldKey.replace('_ids','_ids') + '_' + tag.id;
      return '<li><label for="' + h(inputId) + '">' +
        '<input type="' + inputType + '" name="' + h(namePrefix) + '" id="' + h(inputId) + '" value="' + h(tag.id) + '" />' +
        '<span class="indicator" aria-hidden="true"></span>' +
        '<span>' + h(tag.name) + '</span>' +
        '</label></li>';
    }).join('\n');

    return (
      '<dt id="' + dtId + '" class="filter-toggle ' + groupKey + ' tags collapsed">' +
        '<button type="button" class="expander" aria-expanded="false" aria-controls="' + ddId + '">' +
          '<span class="landmark">' + h(mode === 'include' ? 'Include ' : 'Exclude ') + '</span>' +
          h(labelText) +
        '</button>' +
      '</dt>' +
      '<dd id="' + ddId + '" class="expandable ' + groupKey + ' tags hidden">' +
        '<ul>' + items + '</ul>' +
      '</dd>'
    );
  }

  /* ── Build the full include or exclude section ─────────────── */
  function buildTagSection(mode, cfg) {
    var tags   = cfg.tags   || {};
    var prefix = cfg.prefix || 'work_search';
    var modeLabel = mode === 'include' ? 'Include' : 'Exclude';
    var helpHref  = mode === 'include'
      ? '/help/work-filters-include-tags.html'
      : '/help/work-filters-exclude-tags.html';

    var groups = [
      ['rating',       'Ratings',         'radio'],
      ['warning',      'Warnings',        'checkbox'],
      ['category',     'Categories',      'checkbox'],
      ['fandom',       'Fandoms',         'checkbox'],
      ['character',    'Characters',      'checkbox'],
      ['relationship', 'Relationships',   'checkbox'],
      ['freeform',     'Additional Tags', 'checkbox'],
    ];

    var groupsHtml = groups.map(function (g) {
      return buildTagGroup(mode, g[0], g[1], prefix, tags, g[2]);
    }).join('\n');

    // "Other tags" autocomplete row
    var otherField = mode === 'include' ? 'other_tag_names' : 'excluded_tag_names';
    var otherLabel = mode === 'include' ? 'Other tags to include' : 'Other tags to exclude';
    var otherId    = prefix + '_' + otherField + '_autocomplete';
    groupsHtml +=
      '<dt class="autocomplete search"><label for="' + otherId + '">' + otherLabel + '</label></dt>' +
      '<dd class="autocomplete search">' +
        '<ul class="autocomplete"><li class="input">' +
          '<input type="text" class="text" autocomplete="off" id="' + otherId + '" />' +
        '</li></ul>' +
        '<input type="text" name="' + prefix + '[' + otherField + ']" style="display:none" />' +
      '</dd>';

    return (
      '<dt class="' + mode + ' heading">' +
        '<h4 class="heading">' + modeLabel + '</h4>' +
        '<a class="help symbol question modal modal-attached" title="Work filters ' + mode + ' tags" href="' + helpHref + '" aria-controls="modal">' +
          '<span class="symbol question"><span>?</span></span>' +
        '</a>' +
      '</dt>' +
      '<dd class="' + mode + ' tags group">' +
        '<dl>' + groupsHtml + '</dl>' +
      '</dd>'
    );
  }

  /* ── Build "More Options" section ───────────────────────────── */
  function buildMoreOptions(cfg) {
    var prefix = cfg.prefix || 'work_search';
    var more   = cfg.more   || {};
    var rows   = '';

    if (more.crossovers !== false) {
      rows +=
        '<dt id="toggle_work_crossover" class="filter-toggle crossover collapsed">' +
          '<button type="button" class="expander" aria-expanded="false" aria-controls="work_crossover">Crossovers</button>' +
        '</dt>' +
        '<dd id="work_crossover" class="expandable hidden"><ul>' +
          '<li><label><input type="radio" name="' + prefix + '[crossover]" value=""> <span>Include Crossovers</span></label></li>' +
          '<li><label><input type="radio" name="' + prefix + '[crossover]" value="T"> <span>Only Crossovers</span></label></li>' +
          '<li><label><input type="radio" name="' + prefix + '[crossover]" value="F"> <span>No Crossovers</span></label></li>' +
        '</ul></dd>';
    }

    if (more.completion !== false) {
      rows +=
        '<dt id="toggle_work_complete" class="filter-toggle status collapsed">' +
          '<button type="button" class="expander" aria-expanded="false" aria-controls="work_complete">Completion Status</button>' +
        '</dt>' +
        '<dd id="work_complete" class="expandable hidden"><ul>' +
          '<li><label><input type="radio" name="' + prefix + '[complete]" value=""> <span>All Works</span></label></li>' +
          '<li><label><input type="radio" name="' + prefix + '[complete]" value="T"> <span>Complete Works Only</span></label></li>' +
          '<li><label><input type="radio" name="' + prefix + '[complete]" value="F"> <span>Works in Progress Only</span></label></li>' +
        '</ul></dd>';
    }

    if (more.wordCount !== false) {
      rows +=
        '<dt id="toggle_work_words" class="filter-toggle words collapsed">' +
          '<button type="button" class="expander" aria-expanded="false" aria-controls="work_words">Word Count</button>' +
        '</dt>' +
        '<dd id="work_words" class="expandable hidden">' +
          '<dl class="range">' +
            '<dt><label for="' + prefix + '_words_from">From</label></dt>' +
            '<dd><input type="text" name="' + prefix + '[words_from]" id="' + prefix + '_words_from" /></dd>' +
            '<dt><label for="' + prefix + '_words_to">To</label></dt>' +
            '<dd><input type="text" name="' + prefix + '[words_to]" id="' + prefix + '_words_to" /></dd>' +
          '</dl>' +
        '</dd>';
    }

    if (more.dateUpdated !== false) {
      rows +=
        '<dt id="toggle_work_dates" class="filter-toggle dates collapsed">' +
          '<button type="button" class="expander" aria-expanded="false" aria-controls="work_dates">Date Updated</button>' +
        '</dt>' +
        '<dd id="work_dates" class="expandable hidden">' +
          '<dl class="range">' +
            '<dt><label for="' + prefix + '_date_from">From</label></dt>' +
            '<dd><input type="text" name="' + prefix + '[date_from]" id="' + prefix + '_date_from" /></dd>' +
            '<dt><label for="' + prefix + '_date_to">To</label></dt>' +
            '<dd><input type="text" name="' + prefix + '[date_to]" id="' + prefix + '_date_to" /></dd>' +
          '</dl>' +
        '</dd>';
    }

    if (more.query !== false) {
      rows +=
        '<dt class="search">' +
          '<label for="' + prefix + '_query">Search within results</label>' +
        '</dt>' +
        '<dd class="search">' +
          '<input type="text" name="' + prefix + '[query]" id="' + prefix + '_query" />' +
        '</dd>';
    }

    if (more.language !== false) {
      var langOptions = LANGUAGES.map(function (pair) {
        return '<option lang="' + h(pair[0]) + '" value="' + h(pair[0]) + '">' + h(pair[1]) + '</option>';
      }).join('');
      rows +=
        '<dt class="language"><label for="' + prefix + '_language_id">Language</label></dt>' +
        '<dd class="language">' +
          '<select name="' + prefix + '[language_id]" id="' + prefix + '_language_id">' +
            langOptions +
          '</select>' +
        '</dd>';
    }

    if (!rows) return '';
    return '<dt class="more heading"><h4 class="heading">More Options</h4></dt>' +
           '<dd class="more group"><dl>' + rows + '</dl></dd>';
  }

  /* ── Build the complete form ─────────────────────────────────── */
  function buildFilters(cfg) {
    var prefix   = cfg.prefix   || 'work_search';
    var formId   = cfg.formId   || 'work-filters';
    var action   = cfg.action   || '#';
    var clearUrl = cfg.clearUrl || '#';

    // Sort dropdown
    var sortId      = prefix + '_sort_column';
    var sortOptions = (cfg.sortOptions || []).map(function (opt) {
      return '<option value="' + h(opt.value) + '"' + (opt.selected ? ' selected="selected"' : '') + '>' + h(opt.label) + '</option>';
    }).join('');
    var sortHtml =
      '<dt class="sort"><label for="' + sortId + '">Sort by</label></dt>' +
      '<dd class="sort">' +
        '<select name="' + prefix + '[sort_column]" id="' + sortId + '">' + sortOptions + '</select>' +
      '</dd>';

    // Hidden inputs
    var hiddenHtml = '';
    if (cfg.hiddenFields) {
      Object.keys(cfg.hiddenFields).forEach(function (k) {
        hiddenHtml += '<input type="hidden" name="' + h(k) + '" value="' + h(cfg.hiddenFields[k]) + '" />';
      });
    }

    var submitRow =
      '<dt class="landmark">Submit</dt>' +
      '<dd class="submit actions"><input type="submit" name="commit" value="Sort and Filter" /></dd>';

    var form =
      '<form class="narrow-hidden filters" id="' + formId + '" action="' + h(action) + '" accept-charset="UTF-8" method="get">' +
        '<h3 class="landmark heading">Filters</h3>' +
        '<fieldset>' +
          '<legend>Filter results:</legend>' +
          '<dl>' +
            submitRow +
            sortHtml +
            buildTagSection('include', cfg) +
            buildTagSection('exclude', cfg) +
            buildMoreOptions(cfg) +
            submitRow +
          '</dl>' +
          '<p class="footnote"><a href="' + h(clearUrl) + '">Clear Filters</a></p>' +
          hiddenHtml +
        '</fieldset>' +
      '</form>';

    return form;
  }

  /* ── Expander toggle (integrated, no dependency on ao3-mock.js) */
  function initExpanders(container) {
    container.querySelectorAll('button.expander').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('aria-controls');
        var dd       = document.getElementById(targetId);
        var dt       = btn.closest('dt');
        var expanded = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', String(!expanded));
        if (dt) dt.classList.toggle('collapsed', expanded);
        if (dd) {
          dd.classList.toggle('hidden', expanded);
        }
      });
    });
  }

  /* ── Auto-init on [data-config] placeholders ─────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var placeholder = document.getElementById('ao3-filters-placeholder');
    if (!placeholder) return;

    var configName = placeholder.getAttribute('data-config') || 'ao3FiltersConfig';
    var cfg        = window[configName];
    if (!cfg) {
      console.warn('ao3-filters.js: config "' + configName + '" not found on window');
      return;
    }

    var wrapper = document.createElement('div');
    wrapper.innerHTML = buildFilters(cfg);
    var form = wrapper.firstChild;
    placeholder.parentNode.replaceChild(form, placeholder);
    initExpanders(form);
  });

  /* ── Public API (for manual use) ───────────────────────────────
     var form = ao3mock.buildFilters(cfg);
     document.querySelector('#my-slot').replaceWith(form);   */
  window.ao3mock = window.ao3mock || {};
  window.ao3mock.LANGUAGES = LANGUAGES;
  window.ao3mock.buildFilters = function (cfg) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = buildFilters(cfg);
    var form = wrapper.firstChild;
    initExpanders(form);
    return form;
  };

})();
