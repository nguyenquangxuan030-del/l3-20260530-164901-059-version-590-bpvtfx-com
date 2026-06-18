(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    var grid = document.querySelector("[data-movie-grid]");
    if (!form || !grid) {
      return;
    }
    var input = form.querySelector("[data-filter-input]");
    var year = form.querySelector("[data-year-filter]");
    var sort = form.querySelector("[data-sort-select]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (input && query) {
      input.value = query;
    }
    function update() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var isVisible = matchKeyword && matchYear;
        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
      sortCards();
    }
    function sortCards() {
      if (!sort) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var value = sort.value;
      if (value === "default") {
        cards.sort(function (a, b) {
          return 0;
        });
      }
      if (value === "rating") {
        cards.sort(function (a, b) {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        });
      }
      if (value === "views") {
        cards.sort(function (a, b) {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        });
      }
      if (value === "year") {
        cards.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }
      if (value === "title") {
        cards.sort(function (a, b) {
          return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      update();
    });
    [input, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
    update();
  }

  window.initPlayer = function (url) {
    var video = document.querySelector("[data-player]");
    var overlay = document.querySelector("[data-play-overlay]");
    if (!video || !url) {
      return;
    }
    var loaded = false;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", attach);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        attach();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });
})();
