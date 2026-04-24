/* flags.fyi — minimal JS */
(function () {
  'use strict';

  // ─── Theme toggle (light ↔ dark) ──────────────────────────────────────────
  // The inline <head> script always sets data-theme to "light" or "dark"
  // (from localStorage or system preference), so every click produces a
  // visible change. Shift+click clears the saved preference.
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function (e) {
      if (e.shiftKey) {
        try { localStorage.removeItem('fyi-theme'); } catch (er) {}
        var sys = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', sys);
        return;
      }
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('fyi-theme', next); } catch (er) {}
    });
  }

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
    // On mobile the drawer sits ~1000px below the current scroll position —
    // if we don't scroll to it the open action looks like nothing happened.
    // Desktop layout keeps everything in view, so no-op there.
    if (window.matchMedia('(max-width: 860px)').matches) {
      requestAnimationFrame(function () {
        deepDive.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function closeDeepDive() {
    if (!deepDive) return;
    deepDive.classList.remove('open');
    document.body.classList.remove('dive-open');
    // Move flag info back into the sidebar, before .sidebar-bottom
    if (sidebarInfo && sidebar) {
      var bottom = sidebar.querySelector('.sidebar-bottom');
      if (bottom) sidebar.insertBefore(sidebarInfo, bottom);
      else sidebar.appendChild(sidebarInfo);
    }
  }

  function toggleDeepDive() {
    if (!deepDive) return;
    if (deepDive.classList.contains('open')) closeDeepDive();
    else openDeepDive();
  }

  if (deepDiveToggle) deepDiveToggle.addEventListener('click', toggleDeepDive);
  if (deepDiveClose) deepDiveClose.addEventListener('click', closeDeepDive);

  // ─── Search ──────────────────────────────────────────────────────────────────
  var searchInput = document.getElementById('flagSearch');
  var searchCount = document.getElementById('searchCount');
  var searchIndex = null;
  var searchIndexPromise = null;
  var isAllPage = window.location.pathname.indexOf('/flag-index/all/') !== -1;
  var isHubPage = !isAllPage && window.location.pathname.indexOf('/flag-index/') !== -1
    && window.location.pathname.replace(/\/$/, '') === '/flag-index';

  function loadSearchIndex(cb) {
    if (searchIndex) { cb(searchIndex); return; }
    if (!searchIndexPromise) {
      searchIndexPromise = fetch('/search-index.json', { credentials: 'omit' })
        .then(function (r) { return r.ok ? r.json() : []; })
        .catch(function () { return []; })
        .then(function (data) { searchIndex = data; return data; });
    }
    searchIndexPromise.then(cb);
  }

  function filterIndex(query) {
    if (!searchIndex || !query) return [];
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return searchIndex.filter(function (entry) {
      for (var i = 0; i < terms.length; i++) {
        if (entry.keywords.indexOf(terms[i]) === -1) return false;
      }
      return true;
    });
  }

  // All-flags page: toggle .search-hidden on flag anchors (both pill grid and block grid)
  function filterAllPage(query) {
    var links = document.querySelectorAll('.flag-grid a, .flag-blocks a');
    if (!query) {
      for (var i = 0; i < links.length; i++) links[i].classList.remove('search-hidden');
      if (searchCount) searchCount.textContent = '';
      updateAllPageUrl('');
      return;
    }
    loadSearchIndex(function () {
      var matches = filterIndex(query);
      var matchIds = {};
      for (var j = 0; j < matches.length; j++) matchIds[matches[j].id] = true;
      var shown = 0;
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href') || '';
        // href is like "/afghanistan/" — extract id
        var id = href.replace(/^\//, '').replace(/\/$/, '');
        if (matchIds[id]) {
          links[i].classList.remove('search-hidden');
          shown++;
        } else {
          links[i].classList.add('search-hidden');
        }
      }
      if (searchCount) searchCount.textContent = shown + ' of ' + links.length + ' flags';
      updateAllPageUrl(query);
    });
  }

  function updateAllPageUrl(query) {
    if (!window.history || !window.history.replaceState) return;
    var url = window.location.pathname;
    if (query) url += '?q=' + encodeURIComponent(query);
    window.history.replaceState(null, '', url);
  }

  // Hub page: show results overlay
  var hubResultsEl = null;
  var hubNormalContent = null;

  function getOrCreateHubResults() {
    if (hubResultsEl) return hubResultsEl;
    var searchBox = searchInput ? searchInput.parentElement : null;
    if (!searchBox) return null;
    hubResultsEl = document.createElement('div');
    hubResultsEl.className = 'search-results';
    searchBox.appendChild(hubResultsEl);
    return hubResultsEl;
  }

  function filterHubPage(query) {
    var resultsEl = getOrCreateHubResults();
    if (!resultsEl) return;
    // Get normal hub content to show/hide
    if (!hubNormalContent) {
      hubNormalContent = document.querySelector('.hub-container');
    }
    if (!query) {
      resultsEl.classList.remove('visible');
      while (resultsEl.firstChild) resultsEl.removeChild(resultsEl.firstChild);
      if (hubNormalContent) hubNormalContent.style.display = '';
      if (searchCount) searchCount.textContent = '';
      return;
    }
    loadSearchIndex(function () {
      var matches = filterIndex(query);
      if (hubNormalContent) hubNormalContent.style.display = 'none';
      while (resultsEl.firstChild) resultsEl.removeChild(resultsEl.firstChild);
      if (matches.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'search-results-empty';
        empty.textContent = 'No flags found';
        resultsEl.appendChild(empty);
        resultsEl.classList.add('visible');
        if (searchCount) searchCount.textContent = '0 results';
        return;
      }
      var grid = document.createElement('div');
      grid.className = 'flag-grid';
      var limited = matches.slice(0, 20);
      for (var i = 0; i < limited.length; i++) {
        var m = limited[i];
        var a = document.createElement('a');
        a.href = '/' + m.id + '/';
        if (m.flag) {
          var img = document.createElement('img');
          img.src = m.flag;
          img.alt = m.name;
          img.className = 'thumb';
          img.loading = 'lazy';
          a.appendChild(img);
        }
        a.appendChild(document.createTextNode(m.name));
        grid.appendChild(a);
      }
      resultsEl.appendChild(grid);
      resultsEl.classList.add('visible');
      var label = matches.length + ' result' + (matches.length !== 1 ? 's' : '');
      if (matches.length > 20) label += ' (showing 20)';
      if (searchCount) searchCount.textContent = label;
    });
  }

  function doSearch(query) {
    if (isAllPage) filterAllPage(query);
    else if (isHubPage) filterHubPage(query);
  }

  if (searchInput) {
    // Lazy-load index on first focus
    searchInput.addEventListener('focus', function () {
      loadSearchIndex(function () {});
    });

    searchInput.addEventListener('input', function () {
      doSearch(searchInput.value.trim());
    });

    // On all-flags page, check for ?q= parameter
    if (isAllPage) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchInput.value = q;
        doSearch(q);
      }
    }
  }

  // ─── Nav search (global, all pages) ──────────────────────────────────────
  var navSearchInput = document.getElementById('navSearch');
  var navSearchResults = document.getElementById('navSearchResults');
  var navSearchActiveIndex = -1;

  function navRenderResults(matches, total) {
    while (navSearchResults.firstChild) navSearchResults.removeChild(navSearchResults.firstChild);
    if (matches.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'nav-search-empty';
      empty.textContent = 'No flags found';
      navSearchResults.appendChild(empty);
      return;
    }
    for (var i = 0; i < matches.length; i++) {
      var m = matches[i];
      var a = document.createElement('a');
      a.href = '/' + m.id + '/';
      a.setAttribute('role', 'option');
      if (m.flag) {
        var img = document.createElement('img');
        img.src = m.flag;
        img.alt = '';
        img.className = 'thumb';
        img.loading = 'lazy';
        a.appendChild(img);
      }
      a.appendChild(document.createTextNode(m.name));
      navSearchResults.appendChild(a);
    }
    if (total > matches.length) {
      var more = document.createElement('div');
      more.className = 'nav-search-more';
      more.textContent = '+' + (total - matches.length) + ' more';
      navSearchResults.appendChild(more);
    }
  }

  function navDoSearch(query) {
    if (!query) {
      navSearchResults.classList.remove('visible');
      navSearchActiveIndex = -1;
      return;
    }
    loadSearchIndex(function () {
      var matches = filterIndex(query);
      var limited = matches.slice(0, 12);
      navRenderResults(limited, matches.length);
      navSearchResults.classList.add('visible');
      navSearchActiveIndex = -1;
    });
  }

  function navSearchSetActive(index) {
    var items = navSearchResults.querySelectorAll('a');
    if (!items.length) return;
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    for (var i = 0; i < items.length; i++) items[i].classList.remove('nav-search-active');
    items[index].classList.add('nav-search-active');
    items[index].scrollIntoView({ block: 'nearest' });
    navSearchActiveIndex = index;
  }

  if (navSearchInput && navSearchResults) {
    navSearchInput.addEventListener('focus', function () {
      loadSearchIndex(function () {});
      if (navSearchInput.value.trim()) navDoSearch(navSearchInput.value.trim());
    });
    navSearchInput.addEventListener('input', function () {
      var val = navSearchInput.value.trim();
      navDoSearch(val);
      navSearchInput.parentElement.classList.toggle('nav-search-has-value', !!val);
    });
    navSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navSearchInput.value = '';
        navSearchInput.parentElement.classList.remove('nav-search-has-value');
        navSearchResults.classList.remove('visible');
        navSearchInput.blur();
        e.preventDefault();
        return;
      }
      var items = navSearchResults.querySelectorAll('a');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navSearchSetActive(navSearchActiveIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navSearchSetActive(navSearchActiveIndex - 1);
      } else if (e.key === 'Enter') {
        if (navSearchActiveIndex >= 0 && items[navSearchActiveIndex]) {
          window.location.href = items[navSearchActiveIndex].href;
        } else if (items[0]) {
          window.location.href = items[0].href;
        }
        e.preventDefault();
      }
    });
    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!navSearchInput.contains(e.target) && !navSearchResults.contains(e.target)) {
        navSearchResults.classList.remove('visible');
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Search-specific shortcuts when input is focused
    if (e.target === searchInput) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        doSearch('');
        searchInput.blur();
        e.preventDefault();
      }
      return; // Don't process other shortcuts while in search
    }
    if (e.target === navSearchInput) return; // handled inside navSearch listener

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // "/" focuses search input (prefer page-level search, fall back to nav search)
    if (e.key === '/') {
      var target = searchInput || navSearchInput;
      if (target) {
        e.preventDefault();
        target.focus();
        return;
      }
    }

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
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          closeDrawer();
        } else {
          closeDeepDive();
        }
        break;
      case 'i':
        window.location.href = '/flag-index/';
        break;
    }
  });

  // Close hub results when clicking outside
  document.addEventListener('click', function (e) {
    if (!hubResultsEl || !isHubPage) return;
    if (searchInput && (searchInput.contains(e.target) || (hubResultsEl && hubResultsEl.contains(e.target)))) return;
    if (searchInput && !searchInput.value.trim()) {
      hubResultsEl.classList.remove('visible');
      if (hubNormalContent) hubNormalContent.style.display = '';
    }
  });

  // ─── Mobile drawer (hamburger menu) ──────────────────────────────────────────
  var burgerBtn = document.getElementById('burgerBtn');
  var mobileDrawer = document.getElementById('mobileDrawer');
  var mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
  var mobileDrawerClose = document.getElementById('mobileDrawerClose');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('open');
    if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('open');
    if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleDrawer() {
    if (!mobileDrawer) return;
    if (mobileDrawer.classList.contains('open')) closeDrawer();
    else openDrawer();
  }

  if (burgerBtn) burgerBtn.addEventListener('click', toggleDrawer);
  if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeDrawer);

  // ─── Swipe gestures for prev/next on flag viewport ───────────────────────────
  var flagViewport = document.getElementById('flagViewport');
  if (flagViewport) {
    var touchStartX = 0;
    var touchStartY = 0;

    flagViewport.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    flagViewport.addEventListener('touchend', function (e) {
      if (e.changedTouches.length === 1) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;

        // Horizontal swipe > 50px with vertical < 30px
        if (Math.abs(dx) > 50 && Math.abs(dy) < 30) {
          var navBtns = document.querySelectorAll('.sidebar-nav-btn');
          var prevLink = navBtns[0];
          var nextLink = navBtns[1];

          if (dx < 0 && nextLink) {
            // Swipe left → next
            window.location.href = nextLink.href;
          } else if (dx > 0 && prevLink) {
            // Swipe right → prev
            window.location.href = prevLink.href;
          }
        }
      }
    }, { passive: true });
  }
})();
