/* ao3-mock.js — lightweight dropdown toggling + reusable components for the AO3 mockup
   Replicates Bootstrap's dropdown behaviour used by real AO3 */

(function () {
  'use strict';

  /* ── Pagination builder ────────────────────────────────────────
     buildPagination(totalPages, currentPage, baseUrl)
       totalPages  : total number of pages
       currentPage : 1-based current page number
       baseUrl     : string to which the page number is appended (e.g. "/bookmarks?page=")
                     defaults to "#page="
     Returns an <ol class="pagination actions pagy"> element.

     Auto-initialises on any element with [data-pagination]:
       <div data-pagination data-total="11" data-current="1" data-url="/bookmarks?page="></div>
     The placeholder is replaced in-place with the generated <ol>.
  ── */
  function buildPagination(totalPages, currentPage, baseUrl) {
    baseUrl = baseUrl || '#page=';

    var ol = document.createElement('ol');
    ol.className = 'pagination actions pagy';
    ol.setAttribute('role', 'navigation');
    ol.setAttribute('aria-label', 'Pagination');

    function pageUrl(p) { return baseUrl + p; }

    function makeLi(html) {
      var el = document.createElement('li');
      el.innerHTML = html;
      return el;
    }

    // ← Previous
    if (currentPage <= 1) {
      ol.appendChild(makeLi('<span class="disabled">← Previous</span>'));
    } else {
      ol.appendChild(makeLi('<a href="' + pageUrl(currentPage - 1) + '">← Previous</a>'));
    }

    // Page numbers with gap compression
    var pages = [];
    if (totalPages <= 9) {
      for (var p = 1; p <= totalPages; p++) pages.push(p);
    } else {
      var left  = Math.max(1, currentPage - 3);
      var right = Math.min(totalPages, currentPage + 3);
      for (var q = 1; q <= Math.min(2, left - 1); q++) pages.push(q);
      if (left > 3) pages.push('gap');
      for (var r = left; r <= right; r++) pages.push(r);
      if (right < totalPages - 2) pages.push('gap');
      for (var s = Math.max(right + 1, totalPages - 1); s <= totalPages; s++) pages.push(s);
    }

    pages.forEach(function (p) {
      if (p === 'gap') {
        ol.appendChild(makeLi('<span class="gap">…</span>'));
      } else if (p === currentPage) {
        ol.appendChild(makeLi(
          '<a role="link" aria-disabled="true" aria-current="page" class="current">' + p + '</a>'
        ));
      } else {
        ol.appendChild(makeLi('<a href="' + pageUrl(p) + '">' + p + '</a>'));
      }
    });

    // Next →
    if (currentPage >= totalPages) {
      ol.appendChild(makeLi('<span class="disabled">Next →</span>'));
    } else {
      ol.appendChild(makeLi('<a href="' + pageUrl(currentPage + 1) + '">Next →</a>'));
    }

    return ol;
  }

  // Expose globally so other scripts can call ao3mock.buildPagination()
  window.ao3mock = window.ao3mock || {};
  window.ao3mock.buildPagination = buildPagination;

  // Toggle a single dropdown open/closed
  function toggle(li) {
    var isOpen = li.classList.contains('open');
    closeAll();
    if (!isOpen) {
      li.classList.add('open');
    }
  }

  // Close every open dropdown
  function closeAll() {
    document.querySelectorAll('li.dropdown.open, .ao3h-root.open').forEach(function (el) {
      el.classList.remove('open');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {

    // Attach click handler to every dropdown toggle link (standard nav items)
    document.querySelectorAll('li.dropdown > a.dropdown-toggle').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggle(link.parentElement);
      });
    });

    // AO3H root: span.ao3h-navlink opens the menu (not an <a>)
    document.querySelectorAll('.ao3h-root .ao3h-navlink').forEach(function (span) {
      span.addEventListener('click', function (e) {
        e.stopPropagation();
        toggle(span.closest('.ao3h-root'));
      });
    });

    // AO3H group-containers: accordion open/close
    document.querySelectorAll('.ao3h-group-container > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var li = link.parentElement;
        li.classList.toggle('open');
        link.setAttribute('aria-expanded', li.classList.contains('open'));
      });
    });

    // Click anywhere outside → close all
    document.addEventListener('click', function () {
      closeAll();
    });

    // Prevent clicks inside an open menu from closing it
    document.querySelectorAll('li.dropdown .dropdown-menu, .ao3h-root .ao3h-menu').forEach(function (menu) {
      menu.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });

    // Auto-init pagination placeholders
    // Usage: <div data-pagination data-total="11" data-current="1" data-url="/bookmarks?page="></div>
    document.querySelectorAll('[data-pagination]').forEach(function (placeholder) {
      var total   = parseInt(placeholder.dataset.total,   10) || 1;
      var current = parseInt(placeholder.dataset.current, 10) || 1;
      var url     = placeholder.dataset.url || '#page=';
      var ol = buildPagination(total, current, url);
      placeholder.parentNode.replaceChild(ol, placeholder);
    });

  });
})();
