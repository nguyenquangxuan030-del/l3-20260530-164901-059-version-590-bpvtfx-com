(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        startHero();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyLocalSearch(input) {
        var target = document.querySelector(input.getAttribute('data-target')) || document;
        var cards = Array.prototype.slice.call(target.querySelectorAll('.searchable-card'));
        var empty = document.querySelector('[data-empty-state]');
        var query = normalize(input.value);
        var hasVisible = false;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search') || card.textContent);
            var visible = !query || haystack.indexOf(query) !== -1;
            card.hidden = !visible;
            if (visible) {
                hasVisible = true;
            }
        });

        if (empty) {
            empty.hidden = hasVisible;
        }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchPageInput = document.getElementById('search-page-input');

    if (searchPageInput && query) {
        searchPageInput.value = query;
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-search]')).forEach(function (input) {
        input.addEventListener('input', function () {
            applyLocalSearch(input);
        });
        if (input.value) {
            applyLocalSearch(input);
        }
    });

    function startVideo(container) {
        var video = container.querySelector('video');
        var source = video ? video.querySelector('source') : null;
        var overlay = container.querySelector('.player-overlay');

        if (!video || !source) {
            return;
        }

        var src = source.getAttribute('src');

        if (!container.classList.contains('is-ready')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                container._hls = hls;
            } else {
                video.src = src;
            }
            container.classList.add('is-ready');
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.js-video-player')).forEach(function (container) {
        var overlay = container.querySelector('.player-overlay');
        var video = container.querySelector('video');

        if (overlay) {
            overlay.addEventListener('click', function () {
                startVideo(container);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo(container);
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player-focus]')).forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('.js-video-player');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                startVideo(player);
            }
        });
    });
})();
