(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function renderSearchResults(panel, value) {
    var index = window.SEARCH_INDEX || [];
    var key = normalize(value);
    if (!key) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }
    var matched = index.filter(function (item) {
      return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre).indexOf(key) !== -1;
    }).slice(0, 12);
    if (!matched.length) {
      panel.innerHTML = '<div class="search-empty">没有匹配的影片</div>';
      panel.classList.add('open');
      return;
    }
    panel.innerHTML = matched.map(function (item) {
      return '<a class="search-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('open');
  }

  function setupGlobalSearch() {
    var panel = qs('#searchPanel');
    var inputs = [qs('#globalSearch'), qs('#mobileSearch')].filter(Boolean);
    if (!panel || !inputs.length) {
      return;
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        renderSearchResults(panel, input.value);
      });
      input.addEventListener('focus', function () {
        renderSearchResults(panel, input.value);
      });
    });
    document.addEventListener('click', function (event) {
      var insidePanel = panel.contains(event.target);
      var insideInput = inputs.some(function (input) {
        return input.contains(event.target);
      });
      if (!insidePanel && !insideInput) {
        panel.classList.remove('open');
      }
    });
  }

  function setupLocalFilters() {
    qsa('[data-filter-root]').forEach(function (root) {
      var list = root.parentElement.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var input = qs('[data-local-search]', root);
      var year = qs('[data-filter-year]', root);
      var region = qs('[data-filter-region]', root);
      var type = qs('[data-filter-type]', root);
      var cards = qsa('[data-movie-card]', list);
      function apply() {
        var q = normalize(input && input.value);
        var y = normalize(year && year.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        cards.forEach(function (card) {
          var hay = normalize(card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.year);
          var ok = (!q || hay.indexOf(q) !== -1) &&
            (!y || normalize(card.dataset.year) === y) &&
            (!r || normalize(card.dataset.region).indexOf(r) !== -1) &&
            (!t || normalize(card.dataset.type).indexOf(t) !== -1);
          card.style.display = ok ? '' : 'none';
        });
      }
      [input, year, region, type].filter(Boolean).forEach(function (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function attachStream(video, url) {
    if (!video || !url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = url;
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      }
      return;
    }
    if (!video.src) {
      video.src = url;
    }
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video[data-m3u8]', shell);
      var button = qs('[data-play-button]', shell);
      if (!video) {
        return;
      }
      function play() {
        attachStream(video, video.dataset.m3u8);
        shell.classList.add('playing');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (!shell.classList.contains('playing')) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupGlobalSearch();
    setupLocalFilters();
    setupHero();
    setupPlayers();
  });
})();
