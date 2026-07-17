/* ao3-header.js — injects the shared AO3 mockup header into every page.
   Pages just need: <div id="ao3-header-placeholder"></div>
   and a <script src="js/ao3-header.js"></script> in the head. */

(function () {
  var HTML = `
<ul id="skiplinks"><li><a href="#main">Main Content</a></li></ul>

<header id="header" class="region">

  <h1 class="heading">
    <a href="home.html"><span>Archive of Our Own</span><sup> beta</sup><img alt="Archive of Our Own" class="logo" src="https://archiveofourown.org/images/ao3_logos/logo_42.png"></a>
  </h1>

  <nav id="greeting" aria-label="User">
    <ul class="user navigation actions">
      <li class="dropdown" aria-haspopup="true">
        <a href="dashboard.html" class="dropdown-toggle" data-toggle="dropdown">Hi, coracutiehale!</a>
        <ul class="menu dropdown-menu">
          <li><a href="dashboard.html">My Dashboard</a></li>
          <li><a href="subscriptions.html">My Subscriptions</a></li>
          <li><a href="bookmarks.html">My Bookmarks</a></li>
          <li><a href="history.html">My History</a></li>
          <li><a href="preferences.html">My Preferences</a></li>
        </ul>
      </li>
      <li class="dropdown" aria-haspopup="true">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Post</a>
        <ul class="menu dropdown-menu">
          <li><a href="draft.html">New Work</a></li>
          <li><a href="#">Import Work</a></li>
        </ul>
      </li>
      <li><a href="#">Log Out</a></li>
    </ul>
    <p class="icon">
      <a href="profile.html"><img alt="" class="icon" src="https://archiveofourown.org/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NjE0NjQ2NCwicHVyIjoiYmxvYl9pZCJ9fQ==--0d1daf655aafc10d691c2172b98ab4e448b44286/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fbGltaXQiOlsxMDAsMTAwXSwibG9hZGVyIjp7Im4iOi0xfX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--fb1da3623781351fb36c743584da71645585f6c4/original.jpg"></a>
    </p>
  </nav>

  <nav aria-label="Site">
    <ul class="primary navigation actions">

      <li class="dropdown" aria-haspopup="true">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Fandoms</a>
        <ul class="menu dropdown-menu">
          <li><a href="#">All Fandoms</a></li>
          <li><a href="#">Anime &amp; Manga</a></li>
          <li><a href="#">Books &amp; Literature</a></li>
          <li><a href="#">Cartoons &amp; Comics &amp; Graphic Novels</a></li>
          <li><a href="#">Celebrities &amp; Real People</a></li>
          <li><a href="#">Movies</a></li>
          <li><a href="#">Music &amp; Bands</a></li>
          <li><a href="#">Other Media</a></li>
          <li><a href="#">Theater</a></li>
          <li><a href="#">TV Shows</a></li>
          <li><a href="#">Video Games</a></li>
          <li><a href="#">Uncategorized Fandoms</a></li>
        </ul>
      </li>
      <li class="dropdown" aria-haspopup="true">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Browse</a>
        <ul class="menu dropdown-menu">
          <li><a href="#">Works</a></li>
          <li><a href="bookmarks.html">Bookmarks</a></li>
          <li><a href="#">Tags</a></li>
          <li><a href="#">Collections</a></li>
        </ul>
      </li>
      <li class="dropdown" aria-haspopup="true">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Search</a>
        <ul class="menu dropdown-menu">
          <li><a href="search-works.html">Works</a></li>
          <li><a href="search-bookmarks.html">Bookmarks</a></li>
          <li><a href="search-tags.html">Tags</a></li>
          <li><a href="search-people.html">People</a></li>
        </ul>
      </li>
      <li class="dropdown" aria-haspopup="true">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">About</a>
        <ul class="menu dropdown-menu">
          <li><a href="#">About Us</a></li>
          <li><a href="#">News</a></li>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Wrangling Guidelines</a></li>
          <li><a href="#">Donate or Volunteer</a></li>
        </ul>
      </li>
      <li class="search">
        <form class="search" id="search" role="search" aria-label="Work" action="search-works.html" method="get">
          <fieldset>
            <p>
              <label class="landmark" for="site_search">Work Search</label>
              <input class="text" id="site_search" type="text" name="work_search[query]" aria-describedby="site_search_tooltip">
              <span class="tip" role="tooltip" id="site_search_tooltip">tip: "uchiha sasuke/uzumaki naruto" angst kudos&gt;10</span>
              <span class="submit actions"><input type="submit" value="Search" class="button"></span>
            </p>
          </fieldset>
        </form>
      </li>
    </ul>
  </nav>

  <div class="clear"></div>
</header>
`;

  document.addEventListener('DOMContentLoaded', function () {
    var placeholder = document.getElementById('ao3-header-placeholder');
    if (placeholder) {
      placeholder.outerHTML = HTML;
    }
  });
})();
