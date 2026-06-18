(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
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
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-input]')).forEach(function (input) {
        var scope = input.closest('[data-search-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-empty-state]');
        if (!cards.length) {
            scope = document;
            cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            empty = scope.querySelector('[data-empty-state]');
        }
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        });
    });
})();
