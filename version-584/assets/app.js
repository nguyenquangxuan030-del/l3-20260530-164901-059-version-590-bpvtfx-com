(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      if (image.parentElement) {
        image.parentElement.classList.add('image-missing');
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  var nextButton = document.querySelector('[data-hero-next]');
  var prevButton = document.querySelector('[data-hero-prev]');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var video = document.querySelector('[data-player-video]');
  var playButton = document.querySelector('[data-play-button]');
  var playerCover = document.querySelector('[data-player-cover]');
  var statusText = document.querySelector('[data-player-status]');

  function setStatus(text) {
    if (statusText) {
      statusText.textContent = text;
    }
  }

  function initPlayer() {
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');

    if (!source) {
      setStatus('播放源暂不可用');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('点击播放');
      });
      hls.on(window.Hls.Events.ERROR, function () {
        setStatus('正在重新连接播放源');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('点击播放');
    } else {
      video.src = source;
      setStatus('点击播放');
    }

    video.controls = true;
  }

  function startPlayback() {
    if (!video) {
      return;
    }

    if (playerCover) {
      playerCover.classList.add('is-hidden');
    }

    video.controls = true;
    var playback = video.play();

    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        setStatus('点击视频继续播放');
        if (playerCover) {
          playerCover.classList.remove('is-hidden');
        }
      });
    }
  }

  initPlayer();

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  if (playerCover) {
    playerCover.addEventListener('click', function (event) {
      if (event.target !== playButton) {
        startPlayback();
      }
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');
  var searchInput = document.querySelector('[data-search-input]');

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function cardTemplate(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
        '<span class="poster-shell">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-chip">播放</span>' +
        '</span>' +
      '</a>' +
      '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  if (searchResults && window.SEARCH_INDEX) {
    var query = getQuery();

    if (searchInput) {
      searchInput.value = query;
    }

    var normalized = query.toLowerCase();
    var results = window.SEARCH_INDEX.filter(function (item) {
      if (!normalized) {
        return item.score >= 88;
      }

      return item.searchText.indexOf(normalized) !== -1;
    }).sort(function (a, b) {
      return b.score - a.score || b.year - a.year;
    }).slice(0, 80);

    if (searchTitle) {
      searchTitle.textContent = query ? '“' + query + '”的搜索结果' : '精选内容';
    }

    searchResults.innerHTML = results.map(cardTemplate).join('');

    if (!results.length) {
      searchResults.innerHTML = '<div class="side-panel"><h2>没有找到匹配内容</h2><p>可以更换关键词，或返回分类页继续浏览。</p></div>';
    }
  }
}());
