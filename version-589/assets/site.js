(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function() {
        var open = panel.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 0) {
      var index = 0;
      var timer = null;
      var show = function(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === index);
        });
      };
      var start = function() {
        timer = window.setInterval(function() {
          show(index + 1);
        }, 5000);
      };
      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          window.clearInterval(timer);
          show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
          start();
        });
      });
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll('.movie-search')).forEach(function(input) {
      var scope = input.closest('section');
      var root = document;
      if (scope && scope.nextElementSibling) {
        root = scope.nextElementSibling;
      }
      input.addEventListener('input', function() {
        var value = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-search]'));
        cards.forEach(function(card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('is-filter-hidden', value && text.indexOf(value) === -1);
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(function(player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var url = player.getAttribute('data-play');
      var loaded = false;
      var hls = null;
      var load = function() {
        if (!video || !url || loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      };
      var play = function() {
        load();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var action = video.play();
        if (action && action.catch) {
          action.catch(function() {});
        }
      };
      if (cover) {
        cover.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function() {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function() {
          if (cover) {
            cover.classList.add('is-hidden');
          }
        });
      }
      window.addEventListener('pagehide', function() {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  });
})();
