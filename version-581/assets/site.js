(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  const bindCardFilter = function () {
    const filterArea = document.querySelector('[data-card-filter]');
    const input = document.querySelector('[data-card-filter-input]');
    const list = document.querySelector('[data-card-list]');

    if (!filterArea || !input || !list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    const apply = function (value) {
      const keyword = value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = card.textContent.toLowerCase();
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    };

    input.addEventListener('input', function () {
      apply(input.value);
    });

    filterArea.querySelectorAll('[data-filter-chip]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-filter-chip') || '';
        apply(input.value);
      });
    });
  };

  bindCardFilter();

  const startPlayer = function (button) {
    const targetId = button.getAttribute('data-play-target');
    const stream = button.getAttribute('data-stream');
    const video = document.getElementById(targetId);

    if (!video || !stream) {
      return;
    }

    const reveal = function () {
      video.controls = true;
      button.classList.add('is-hidden');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      reveal();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsReady = true;
      }
      reveal();
      return;
    }

    video.setAttribute('src', stream);
    reveal();
  };

  document.querySelectorAll('.play-overlay').forEach(function (button) {
    button.addEventListener('click', function () {
      startPlayer(button);
    });
  });

  const searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && Array.isArray(window.MOVIES_INDEX)) {
    const input = searchRoot.querySelector('[data-search-input]');
    const region = searchRoot.querySelector('[data-region-filter]');
    const type = searchRoot.querySelector('[data-type-filter]');
    const genre = searchRoot.querySelector('[data-genre-filter]');
    const results = searchRoot.querySelector('[data-search-results]');
    const status = searchRoot.querySelector('[data-search-status]');
    const params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    const movieCard = function (movie) {
      const tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">'
        + '<a class="poster-link" href="' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">'
        + '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
        + '<span class="type-badge">' + escapeHtml(movie.type) + '</span>'
        + '<span class="play-dot">▶</span>'
        + '</a>'
        + '<div class="card-body">'
        + '<a class="card-title" href="' + movie.file + '">' + escapeHtml(movie.title) + '</a>'
        + '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>'
        + '<p>' + escapeHtml(movie.oneLine) + '</p>'
        + '<div class="tag-row">' + tags + '</div>'
        + '</div>'
        + '</article>';
    };

    const render = function () {
      const q = (input ? input.value : '').trim().toLowerCase();
      const r = region ? region.value : '';
      const t = type ? type.value : '';
      const g = genre ? genre.value : '';

      const matched = window.MOVIES_INDEX.filter(function (movie) {
        if (q && movie.searchText.indexOf(q) === -1) {
          return false;
        }
        if (r && movie.region !== r) {
          return false;
        }
        if (t && movie.type !== t) {
          return false;
        }
        if (g && movie.genre.indexOf(g) === -1) {
          return false;
        }
        return true;
      });

      const visible = matched.slice(0, 180);
      results.innerHTML = visible.map(movieCard).join('');
      status.textContent = matched.length ? '筛选结果：' + matched.length + ' 部影片' : '未找到匹配影片';
    };

    [input, region, type, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
