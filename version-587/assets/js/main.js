(function() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            menu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var minis = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-mini]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
            minis.forEach(function(mini, i) {
                mini.classList.toggle('active', i === index);
            });
        }

        function play() {
            timer = window.setInterval(function() {
                setSlide(index + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            play();
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                setSlide(i);
                restart();
            });
        });

        minis.forEach(function(mini, i) {
            mini.addEventListener('mouseenter', function() {
                setSlide(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                setSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                setSlide(index + 1);
                restart();
            });
        }

        setSlide(0);
        play();
    }

    var searchInput = document.querySelector('[data-card-search]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var activeFilter = '';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function applyFilter() {
        var query = searchInput ? normalize(searchInput.value) : '';
        var filter = normalize(activeFilter);
        cards.forEach(function(card) {
            var text = cardText(card);
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedFilter = !filter || text.indexOf(filter) !== -1;
            card.classList.toggle('hidden-card', !(matchedQuery && matchedFilter));
        });
    }

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery) {
            searchInput.value = initialQuery;
        }
        searchInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            filterButtons.forEach(function(item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            activeFilter = button.getAttribute('data-filter-value') || '';
            applyFilter();
        });
    });

    window.startMoviePlayer = function(videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(buttonId);
        var loaded = false;
        if (!video || !source) {
            return;
        }

        function start() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play();
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                        video.play();
                    });
                } else {
                    video.src = source;
                    video.play();
                }
            } else {
                video.play();
            }
            if (layer) {
                layer.classList.add('hide');
            }
        }

        if (layer) {
            layer.addEventListener('click', start);
        }

        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function() {
            if (layer) {
                layer.classList.add('hide');
            }
        });
    };
}());
