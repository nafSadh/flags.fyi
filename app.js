/* flags.fyi — minimal JS */
(function () {
  'use strict';

  var deepDive = document.getElementById('deepDive');
  var deepDiveToggle = document.getElementById('deepDiveToggle');
  var deepDiveClose = document.getElementById('deepDiveClose');
  var sidebar = document.getElementById('sidebar');
  var sidebarInfo = document.getElementById('sidebarInfo');
  var flagColumn = document.getElementById('flagColumn');

  function openDeepDive() {
    if (!deepDive) return;
    deepDive.classList.add('open');
    document.body.classList.add('dive-open');
    // Move flag info (title, colors) below the flag
    if (sidebarInfo && flagColumn) {
      flagColumn.appendChild(sidebarInfo);
    }
  }

  function closeDeepDive() {
    if (!deepDive) return;
    deepDive.classList.remove('open');
    document.body.classList.remove('dive-open');
    // Move flag info back into the sidebar
    if (sidebarInfo && sidebar) {
      sidebar.appendChild(sidebarInfo);
    }
  }

  function toggleDeepDive() {
    if (!deepDive) return;
    if (deepDive.classList.contains('open')) closeDeepDive();
    else openDeepDive();
  }

  if (deepDiveToggle) deepDiveToggle.addEventListener('click', toggleDeepDive);
  if (deepDiveClose) deepDiveClose.addEventListener('click', closeDeepDive);

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    var navBtns = document.querySelectorAll('.sidebar-nav-btn');
    var prevLink = navBtns[0];
    var nextLink = navBtns[1];

    switch (e.key) {
      case 'ArrowLeft':
      case 'p':
        if (prevLink) window.location.href = prevLink.href;
        break;
      case 'ArrowRight':
      case 'n':
        if (nextLink) window.location.href = nextLink.href;
        break;
      case 'd':
        toggleDeepDive();
        break;
      case 'Escape':
        closeDeepDive();
        break;
      case 'i':
        window.location.href = '/flag-index/';
        break;
    }
  });
})();
