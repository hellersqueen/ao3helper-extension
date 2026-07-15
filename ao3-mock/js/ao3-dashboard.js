/* ao3-dashboard.js — injects the shared user dashboard sidebar.
   Pages need: <div id="ao3-dashboard-placeholder" data-current="bookmarks"></div>
   Valid data-current values: dashboard, profile, preferences, skins,
   works, drafts, series, bookmarks, collections,
   inbox, stats, history, subscriptions,
   signups, assignments, claims, related_works, gifts               */

(function () {
  var LINKS = {
    dashboard:    '/users/coracutiehale',
    profile:      '/users/coracutiehale/profile',
    preferences:  '/users/coracutiehale/preferences',
    skins:        '/users/coracutiehale/skins',
    works:        '/users/coracutiehale/works',
    drafts:       '/users/coracutiehale/works/drafts',
    series:       '/users/coracutiehale/series',
    bookmarks:    '/users/coracutiehale/bookmarks',
    collections:  '/users/coracutiehale/collections',
    inbox:        '/users/coracutiehale/inbox',
    stats:        '/users/coracutiehale/stats',
    history:      '/users/coracutiehale/readings',
    subscriptions:'/users/coracutiehale/subscriptions',
    signups:      '/users/coracutiehale/signups',
    assignments:  '/users/coracutiehale/assignments',
    claims:       '/users/coracutiehale/claims',
    related_works:'/users/coracutiehale/related_works',
    gifts:        '/users/coracutiehale/gifts',
  };

  var LABELS = {
    dashboard:    'Dashboard',
    profile:      'Profile',
    preferences:  'Preferences',
    skins:        'Skins',
    works:        'Works (0)',
    drafts:       'Drafts (0)',
    series:       'Series (0)',
    bookmarks:    'Bookmarks (217)',
    collections:  'Collections (0)',
    inbox:        'Inbox (6)',
    stats:        'Statistics',
    history:      'History',
    subscriptions:'Subscriptions',
    signups:      'Sign-ups (0)',
    assignments:  'Assignments (0)',
    claims:       'Claims (0)',
    related_works:'Related Works (0)',
    gifts:        'Gifts (0)',
  };

  function item(key, current) {
    var label = LABELS[key];
    if (key === current) {
      return '<li><span class="current">' + label + '</span></li>';
    }
    return '<li><a href="' + LINKS[key] + '">' + label + '</a></li>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var placeholder = document.getElementById('ao3-dashboard-placeholder');
    if (!placeholder) return;
    var current = placeholder.getAttribute('data-current') || '';

    placeholder.outerHTML = `
<div id="dashboard" class="region own" role="navigation region">
  <h4 class="landmark heading">Choices</h4>
  <ul class="navigation actions">
    ${item('dashboard', current)}
    ${item('profile', current)}
    ${item('preferences', current)}
    ${item('skins', current)}
  </ul>

  <h4 class="landmark heading">Pitch</h4>
  <ul class="navigation actions">
    ${item('works', current)}
    ${item('drafts', current)}
    ${item('series', current)}
    ${item('bookmarks', current)}
    ${item('collections', current)}
  </ul>

  <h4 class="landmark heading">Catch</h4>
  <ul class="navigation actions">
    ${item('inbox', current)}
    ${item('stats', current)}
    ${item('history', current)}
    ${item('subscriptions', current)}
  </ul>

  <h4 class="landmark heading">Switch</h4>
  <ul class="navigation actions">
    ${item('signups', current)}
    ${item('assignments', current)}
    ${item('claims', current)}
    ${item('related_works', current)}
    ${item('gifts', current)}
  </ul>
</div>`;
  });
})();
