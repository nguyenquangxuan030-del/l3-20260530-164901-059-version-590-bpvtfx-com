(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        var frame = image.closest(".poster-frame, .rank-thumb, .related-thumb, .poster-side-card, .search-result-card, .category-overview-visual");
        if (frame) {
          frame.classList.add("image-fallback");
        }
        image.remove();
      });
    });
  }

  function setupMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var search = panel.querySelector("[data-filter-search]");
      var type = panel.querySelector("[data-filter-type]");
      var region = panel.querySelector("[data-filter-region]");
      var sort = panel.querySelector("[data-filter-sort]");
      var count = panel.querySelector("[data-filter-count]");
      var results = document.querySelector("[data-filter-results]");
      if (!results) {
        return;
      }
      var cards = Array.prototype.slice.call(results.querySelectorAll(".filter-card"));

      function compareCards(a, b, mode) {
        if (mode === "views") {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === "rating") {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        if (mode === "latest") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === "title") {
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        }
        return 0;
      }

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        var visible = 0;
        var sorted = cards.slice();
        var mode = sort ? sort.value : "default";

        if (mode !== "default") {
          sorted.sort(function (a, b) {
            return compareCards(a, b, mode);
          });
          sorted.forEach(function (card) {
            results.appendChild(card);
          });
        }

        cards.forEach(function (card) {
          var matchesQuery = !query || (card.dataset.search || "").indexOf(query) >= 0;
          var matchesType = !typeValue || card.dataset.type === typeValue;
          var matchesRegion = !regionValue || card.dataset.region === regionValue;
          var shouldShow = matchesQuery && matchesType && matchesRegion;
          card.classList.toggle("is-hidden", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [search, type, region, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.defer = true;
    script.dataset.hlsLoader = "true";
    script.addEventListener("load", callback);
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("video[data-hls-src]"));
    if (players.length === 0) {
      return;
    }

    players.forEach(function (video) {
      var source = video.dataset.hlsSrc;
      if (!source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        loadHls(function () {
          if (!window.Hls || !window.Hls.isSupported()) {
            video.src = source;
            return;
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          video.play().catch(function () {});
        }
      });
    });
  }

  function getSearchParams() {
    return new URLSearchParams(window.location.search);
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-page-input]");
    var form = document.querySelector("[data-search-page-form]");
    var summary = document.querySelector("[data-search-summary]");
    var results = document.querySelector("[data-search-results]");
    var data = window.MOVIES_SEARCH_DATA || [];
    if (!input || !form || !summary || !results || !data.length) {
      return;
    }

    function render(query) {
      var normalized = query.trim().toLowerCase();
      results.innerHTML = "";
      if (!normalized) {
        summary.textContent = "请输入关键词开始搜索。";
        return;
      }
      var matches = data.filter(function (movie) {
        return movie.search.indexOf(normalized) >= 0;
      }).slice(0, 120);
      summary.textContent = "找到 " + matches.length + " 条相关结果" + (matches.length === 120 ? "，已显示前 120 条。" : "。");
      if (matches.length === 0) {
        results.innerHTML = "<p>没有找到匹配影片，请尝试更换关键词。</p>";
        return;
      }
      matches.forEach(function (movie) {
        var link = document.createElement("a");
        link.className = "search-result-card";
        link.href = "movies/" + movie.id + ".html";
        link.innerHTML = [
          "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
          "<span>",
          "<h2>" + escapeHtml(movie.title) + "</h2>",
          "<p>" + escapeHtml(movie.year + "年 · " + movie.region + " · " + movie.type) + "</p>",
          "<p>" + escapeHtml(movie.oneLine) + "</p>",
          "</span>"
        ].join("");
        results.appendChild(link);
      });
      setImageFallbacks();
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>\"]/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[character];
      });
    }

    var initialQuery = getSearchParams().get("q") || "";
    input.value = initialQuery;
    render(initialQuery);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState(null, "", url);
      render(query);
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
    setImageFallbacks();
  });
})();
