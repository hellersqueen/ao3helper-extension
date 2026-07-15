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

      <li class="dropdown ao3h-root" aria-haspopup="true" tabindex="0">
        <span class="ao3h-navlink" aria-hidden="true" aria-expanded="false">AO3 Helper</span>
        <ul class="menu dropdown-menu ao3h-menu" role="menu">

          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:hideByTags:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Hide By Tags"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Hide By Tags</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:filterManager:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Filter Manager"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Filter Manager</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:skipWorks:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Skip Works"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Skip Works</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:ficEngagement:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Fic Engagement"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Fic Engagement</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:workLength:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Work Length"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Work Length</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:tagsDisplay:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Tags Display"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Tags Display</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:ficPeek:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Fic Peek"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Fic Peek</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:similarFics:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Similar Fics"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Similar Fics</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:surpriseMe:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Surprise Me"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Surprise Me</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:tropeGames:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Trope Games"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Trope Games</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:searchEnhancer:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Search Enhancer"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Search Enhancer</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:chapterNavigation:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Chapter Navigation"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Chapter Navigation</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:readingTracker:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Reading Tracker"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Reading Tracker</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:textToSpeech:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Text To Speech"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Text To Speech</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:instantFootnotes:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Instant Footnotes"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Instant Footnotes</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:readingFormatter:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Reading Formatter"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Reading Formatter</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:collapseAuthorNotes:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Collapse Author Notes"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Collapse Author Notes</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:wordSwap:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Word Swap"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Word Swap</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:ficActions:enabled" role="menuitemcheckbox" aria-checked="true" class="ao3h-on"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Fic Actions"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Fic Actions</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:bookmarkVault:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Bookmark Vault"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Bookmark Vault</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:laterShelf:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Later Shelf"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Later Shelf</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:ficAppreciation:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Fic Appreciation"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Fic Appreciation</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:readingDashboard:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Reading Dashboard"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Reading Dashboard</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:activityPanel:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Activity Panel"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Activity Panel</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:readingTimeline:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Reading Timeline"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Reading Timeline</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:notificationCenter:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Notification Center"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Notification Center</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:pageControls:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Page Controls"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Page Controls</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:mainNavigation:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Main Navigation"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Main Navigation</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:keyboardShortcuts:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Keyboard Shortcuts"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Keyboard Shortcuts</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:userRelationships:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for User Relationships"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">User Relationships</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:seriesHelper:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Series Helper"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Series Helper</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:commentKit:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Comment Kit"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Comment Kit</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:visualPreferences:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Visual Preferences"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Visual Preferences</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:themeBuilder:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Theme Builder"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Theme Builder</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:backupAndSync:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Backup And Sync"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Backup And Sync</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>
          <li data-ao3h-grouped-original="1"><a href="#" data-flag="mod:ficDownloader:enabled" role="menuitemcheckbox" aria-checked="false"><button class="ao3h-icon-btn" type="button" aria-label="Settings for Fic Downloader"><span class="ao3h-icon" aria-hidden="true">⋮</span></button><span class="ao3h-label">Fic Downloader</span><span class="ao3h-switch" aria-hidden="true"></span></a></li>

          <li class="ao3h-divider"></li>
          <li class="ao3h-divider" data-ao3h-submenu="1"></li>

          <li class="ao3h-group-container" data-ao3h-submenu="1" data-group-label="Filter &amp; Display">
            <a href="#" aria-haspopup="true" aria-expanded="false"><span class="ao3h-label">Filter &amp; Display</span><span class="ao3h-caret">▾</span></a>
            <ul class="menu dropdown-menu ao3h-submenu" role="menu" data-group-label="Filter &amp; Display">
              <li><a href="#" data-flag="mod:hideByTags:enabled"><span class="ao3h-label">Hide By Tags</span></a></li>
              <li><a href="#" data-flag="mod:filterManager:enabled"><span class="ao3h-label">Filter Manager</span></a></li>
              <li><a href="#" data-flag="mod:skipWorks:enabled"><span class="ao3h-label">Skip Works</span></a></li>
              <li><a href="#" data-flag="mod:ficEngagement:enabled"><span class="ao3h-label">Fic Engagement</span></a></li>
              <li><a href="#" data-flag="mod:workLength:enabled"><span class="ao3h-label">Work Length</span></a></li>
              <li><a href="#" data-flag="mod:tagsDisplay:enabled"><span class="ao3h-label">Tags Display</span></a></li>
            </ul>
          </li>

          <li class="ao3h-divider" data-ao3h-submenu="1"></li>

          <li class="ao3h-group-container" data-ao3h-submenu="1" data-group-label="Explore">
            <a href="#" aria-haspopup="true" aria-expanded="false"><span class="ao3h-label">Explore</span><span class="ao3h-caret">▾</span></a>
            <ul class="menu dropdown-menu ao3h-submenu" role="menu" data-group-label="Explore">
              <li><a href="#" data-flag="mod:ficPeek:enabled"><span class="ao3h-label">Fic Peek</span></a></li>
              <li><a href="#" data-flag="mod:similarFics:enabled"><span class="ao3h-label">Similar Fics</span></a></li>
              <li><a href="#" data-flag="mod:surpriseMe:enabled"><span class="ao3h-label">Surprise Me</span></a></li>
              <li><a href="#" data-flag="mod:tropeGames:enabled"><span class="ao3h-label">Trope Games</span></a></li>
              <li><a href="#" data-flag="mod:searchEnhancer:enabled"><span class="ao3h-label">Search Enhancer</span></a></li>
            </ul>
          </li>

          <li class="ao3h-divider" data-ao3h-submenu="1"></li>

          <li class="ao3h-group-container" data-ao3h-submenu="1" data-group-label="Reading">
            <a href="#" aria-haspopup="true" aria-expanded="false"><span class="ao3h-label">Reading</span><span class="ao3h-caret">▾</span></a>
            <ul class="menu dropdown-menu ao3h-submenu" role="menu" data-group-label="Reading">
              <li><a href="#" data-flag="mod:chapterNavigation:enabled"><span class="ao3h-label">Chapter Navigation</span></a></li>
              <li><a href="#" data-flag="mod:readingTracker:enabled"><span class="ao3h-label">Reading Tracker</span></a></li>
              <li><a href="#" data-flag="mod:textToSpeech:enabled"><span class="ao3h-label">Text To Speech</span></a></li>
              <li><a href="#" data-flag="mod:instantFootnotes:enabled"><span class="ao3h-label">Instant Footnotes</span></a></li>
              <li><a href="#" data-flag="mod:readingFormatter:enabled"><span class="ao3h-label">Reading Formatter</span></a></li>
              <li><a href="#" data-flag="mod:collapseAuthorNotes:enabled"><span class="ao3h-label">Collapse Author Notes</span></a></li>
              <li><a href="#" data-flag="mod:wordSwap:enabled"><span class="ao3h-label">Word Swap</span></a></li>
              <li><a href="#" data-flag="mod:ficActions:enabled"><span class="ao3h-label">Fic Actions</span></a></li>
            </ul>
          </li>

          <li class="ao3h-divider" data-ao3h-submenu="1"></li>

          <li class="ao3h-group-container" data-ao3h-submenu="1" data-group-label="Library">
            <a href="#" aria-haspopup="true" aria-expanded="false"><span class="ao3h-label">Library</span><span class="ao3h-caret">▾</span></a>
            <ul class="menu dropdown-menu ao3h-submenu" role="menu" data-group-label="Library">
              <li><a href="#" data-flag="mod:bookmarkVault:enabled"><span class="ao3h-label">Bookmark Vault</span></a></li>
              <li><a href="#" data-flag="mod:laterShelf:enabled"><span class="ao3h-label">Later Shelf</span></a></li>
              <li><a href="#" data-flag="mod:ficAppreciation:enabled"><span class="ao3h-label">Fic Appreciation</span></a></li>
              <li><a href="#" data-flag="mod:readingDashboard:enabled"><span class="ao3h-label">Reading Dashboard</span></a></li>
              <li><a href="#" data-flag="mod:activityPanel:enabled"><span class="ao3h-label">Activity Panel</span></a></li>
              <li><a href="#" data-flag="mod:readingTimeline:enabled"><span class="ao3h-label">Reading Timeline</span></a></li>
              <li><a href="#" data-flag="mod:notificationCenter:enabled"><span class="ao3h-label">Notification Center</span></a></li>
            </ul>
          </li>

          <li class="ao3h-divider" data-ao3h-submenu="1"></li>

          <li class="ao3h-group-container" data-ao3h-submenu="1" data-group-label="Navigate &amp; Interact">
            <a href="#" aria-haspopup="true" aria-expanded="false"><span class="ao3h-label">Navigate &amp; Interact</span><span class="ao3h-caret">▾</span></a>
            <ul class="menu dropdown-menu ao3h-submenu" role="menu" data-group-label="Navigate &amp; Interact">
              <li><a href="#" data-flag="mod:pageControls:enabled"><span class="ao3h-label">Page Controls</span></a></li>
              <li><a href="#" data-flag="mod:mainNavigation:enabled"><span class="ao3h-label">Main Navigation</span></a></li>
              <li><a href="#" data-flag="mod:keyboardShortcuts:enabled"><span class="ao3h-label">Keyboard Shortcuts</span></a></li>
              <li><a href="#" data-flag="mod:userRelationships:enabled"><span class="ao3h-label">User Relationships</span></a></li>
              <li><a href="#" data-flag="mod:seriesHelper:enabled"><span class="ao3h-label">Series Helper</span></a></li>
              <li><a href="#" data-flag="mod:commentKit:enabled"><span class="ao3h-label">Comment Kit</span></a></li>
            </ul>
          </li>

          <li class="ao3h-divider" data-ao3h-submenu="1"></li>

          <li class="ao3h-group-container" data-ao3h-submenu="1" data-group-label="Appearance &amp; Tools">
            <a href="#" aria-haspopup="true" aria-expanded="false"><span class="ao3h-label">Appearance &amp; Tools</span><span class="ao3h-caret">▾</span></a>
            <ul class="menu dropdown-menu ao3h-submenu" role="menu" data-group-label="Appearance &amp; Tools">
              <li><a href="#" data-flag="mod:visualPreferences:enabled"><span class="ao3h-label">Visual Preferences</span></a></li>
              <li><a href="#" data-flag="mod:themeBuilder:enabled"><span class="ao3h-label">Theme Builder</span></a></li>
              <li><a href="#" data-flag="mod:backupAndSync:enabled"><span class="ao3h-label">Backup And Sync</span></a></li>
              <li><a href="#" data-flag="mod:ficDownloader:enabled"><span class="ao3h-label">Fic Downloader</span></a></li>
            </ul>
          </li>

          <li class="ao3h-divider" data-ao3h-manager-btn="1"></li>
          <li class="ao3h-group-container ao3h-manager-panel-btn" data-ao3h-manager-btn="1">
            <a href="#" aria-haspopup="false" role="button" title="Open the AO3 Helper Manager Panel">
              <span class="ao3h-icon-btn" aria-hidden="true"><span class="ao3h-icon">⋯</span></span>
              <span class="ao3h-label">Manager Panel</span>
            </a>
          </li>

        </ul>
      </li>

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
